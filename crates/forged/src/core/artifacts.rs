//! Immutable, attempt-addressed provider evidence and read-only attestation.

use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Component, Path};

use forged_ledger::{AttemptArtifactRow, NewAttemptArtifact};
use forged_provider::PacketDirs;
use forged_types::{OperationRequest, OperationResponse, WorkPacket};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::config::now_iso;
use crate::core::{on_ledger, read_only, Ctx, Failure};

pub const MANIFEST_SCHEMA: &str = "forged.attempt-artifacts/1";
const RESULT_SCHEMA: &str = "forged.attempt-result-evidence/1";
const SESSION_SCHEMA: &str = "forged.attempt-session-evidence/1";
const COMPACTION_SCHEMA: &str = "forged.attempt-artifact-compaction/1";

/// Closed retention vocabulary. Compaction is always an explicit operator
/// action; materialization itself never deletes or rewrites evidence.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum RetentionClass {
    Retain,
    CompactableSuccess,
}

impl RetentionClass {
    fn as_str(self) -> &'static str {
        match self {
            Self::Retain => "retain",
            Self::CompactableSuccess => "compactable-success",
        }
    }
}

/// One content-addressed artifact named relative to its operator run root.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ManifestFileV1 {
    pub path: String,
    pub bytes: u64,
    pub sha256: String,
}

/// Closed file inventory. Only codex emits `final_message`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ManifestFilesV1 {
    pub prompt: ManifestFileV1,
    pub output: ManifestFileV1,
    pub result: ManifestFileV1,
    pub session: ManifestFileV1,
    pub final_message: Option<ManifestFileV1>,
}

/// Self-contained evidence identity. It carries no claim token, credential,
/// or unrestricted environment dump.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttemptArtifactManifestV1 {
    pub schema: String,
    pub run_id: String,
    pub packet_id: String,
    pub attempt_id: i64,
    pub provider: String,
    pub model: String,
    pub started_at: String,
    pub materialized_at: String,
    pub retention_class: RetentionClass,
    pub files: ManifestFilesV1,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ResultEvidence<'a> {
    schema: &'static str,
    outcome: &'a str,
    detail: &'a Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionEvidence<'a> {
    schema: &'static str,
    attempt_id: i64,
    provider_claimant: &'a str,
    metadata: &'a Value,
}

/// Inputs already fenced to one claimed attempt.
pub struct MaterializeAttempt<'a> {
    pub run_id: &'a str,
    pub packet: &'a WorkPacket,
    pub attempt_id: i64,
    pub claimant: &'a str,
    pub started_at: &'a str,
    pub outcome: &'a str,
    pub detail: &'a Value,
    pub session: &'a Value,
    pub retention_class: RetentionClass,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CompactionTombstoneV1 {
    schema: String,
    run_id: String,
    packet_id: String,
    attempt_id: i64,
    manifest_path: String,
    manifest_sha256: String,
    removed: Vec<ManifestFileV1>,
}

fn failure(action: &str, path: &Path, error: impl std::fmt::Display) -> Failure {
    Failure::internal(format!("{action} {}: {error}", path.display()))
}

fn digest(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn read(path: &Path) -> Result<Vec<u8>, Failure> {
    std::fs::read(path).map_err(|error| failure("reading artifact", path, error))
}

fn sync_dir(path: &Path) -> Result<(), Failure> {
    File::open(path)
        .and_then(|file| file.sync_all())
        .map_err(|error| failure("syncing artifact directory", path, error))
}

/// Publish without replacing an existing immutable name. The temporary file
/// is fsynced and hard-linked in the same directory; the link is an atomic
/// no-clobber publish.
pub(crate) fn atomic_write_once(path: &Path, bytes: &[u8]) -> Result<(), Failure> {
    let parent = path.parent().ok_or_else(|| {
        Failure::internal(format!("artifact path {} has no parent", path.display()))
    })?;
    std::fs::create_dir_all(parent)
        .map_err(|error| failure("creating artifact directory", parent, error))?;
    if path.exists() {
        return if read(path)? == bytes {
            Ok(())
        } else {
            Err(Failure::internal(format!(
                "immutable artifact {} already contains different bytes",
                path.display()
            )))
        };
    }
    let name = path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| {
            Failure::internal(format!(
                "artifact path {} has no UTF-8 name",
                path.display()
            ))
        })?;
    let temporary = parent.join(format!(".{name}.tmp-{}", uuid::Uuid::now_v7()));
    let mut file = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&temporary)
        .map_err(|error| failure("creating temporary artifact", &temporary, error))?;
    file.write_all(bytes)
        .map_err(|error| failure("writing temporary artifact", &temporary, error))?;
    file.sync_all()
        .map_err(|error| failure("syncing temporary artifact", &temporary, error))?;
    drop(file);
    match std::fs::hard_link(&temporary, path) {
        Ok(()) => {}
        Err(_error) if path.exists() && read(path)? == bytes => {}
        Err(error) => {
            let _ = std::fs::remove_file(&temporary);
            return Err(failure("publishing immutable artifact", path, error));
        }
    }
    std::fs::remove_file(&temporary)
        .map_err(|error| failure("removing temporary artifact", &temporary, error))?;
    sync_dir(parent)
}

/// Promote a provider's private streaming target after it is terminal.
fn promote_stream(working: &Path, final_path: &Path) -> Result<(), Failure> {
    if !working.exists() {
        return if final_path.exists() {
            Ok(())
        } else {
            atomic_write_once(final_path, b"")
        };
    }
    let mut file = match OpenOptions::new().read(true).open(working) {
        Ok(file) => file,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound && final_path.exists() => {
            return Ok(())
        }
        Err(error) => return Err(failure("opening provider capture", working, error)),
    };
    file.sync_all()
        .map_err(|error| failure("syncing provider capture", working, error))?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)
        .map_err(|error| failure("reading provider capture", working, error))?;
    drop(file);
    // Recovery may race another reconciler preserving the same dead attempt.
    // Reuse the no-clobber idempotent publisher so both processes converge on
    // the same immutable bytes instead of treating `AlreadyExists` as loss.
    atomic_write_once(final_path, &bytes)?;
    match std::fs::remove_file(working) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => return Err(failure("removing unfinished capture", working, error)),
    }
    sync_dir(
        final_path
            .parent()
            .ok_or_else(|| Failure::internal("capture has no parent"))?,
    )
}

/// Freeze provider-owned streaming targets before usage or result harvest.
/// A missing stream becomes an honest zero-byte capture.
pub(crate) fn finalize_provider_files(dirs: &PacketDirs) -> Result<(), Failure> {
    promote_stream(&dirs.stdout_working(), &dirs.stdout())?;
    if dirs.last_message_working().exists() || dirs.last_message().exists() {
        promote_stream(&dirs.last_message_working(), &dirs.last_message())?;
    }
    Ok(())
}

fn relative(run_root: &Path, path: &Path) -> Result<String, Failure> {
    let relative = path.strip_prefix(run_root).map_err(|_| {
        Failure::internal(format!(
            "artifact {} is outside run root {}",
            path.display(),
            run_root.display()
        ))
    })?;
    let safe = relative.components().all(|component| match component {
        Component::Normal(value) => value.to_str().is_some_and(|value| {
            !value.is_empty()
                && value
                    .chars()
                    .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-'))
        }),
        _ => false,
    });
    if !safe {
        return Err(Failure::invalid(format!(
            "artifact path {} contains characters outside [A-Za-z0-9/._-]",
            relative.display()
        )));
    }
    Ok(relative.to_string_lossy().into_owned())
}

fn entry(run_root: &Path, path: &Path) -> Result<ManifestFileV1, Failure> {
    let bytes = read(path)?;
    Ok(ManifestFileV1 {
        path: relative(run_root, path)?,
        bytes: u64::try_from(bytes.len()).unwrap_or(u64::MAX),
        sha256: digest(&bytes),
    })
}

fn json_bytes(value: &impl Serialize) -> Result<Vec<u8>, Failure> {
    let mut bytes = serde_json::to_vec_pretty(value)
        .map_err(|error| Failure::internal(format!("serializing artifact evidence: {error}")))?;
    bytes.push(b'\n');
    Ok(bytes)
}

fn check_identity(
    manifest: &AttemptArtifactManifestV1,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
) -> Result<(), Failure> {
    if manifest.schema != MANIFEST_SCHEMA
        || manifest.run_id != run_id
        || manifest.packet_id != packet_id
        || manifest.attempt_id != attempt_id
    {
        return Err(Failure::invalid(format!(
            "manifest identity does not match run {run_id:?} packet {packet_id:?} attempt {attempt_id}"
        )));
    }
    Ok(())
}

fn same_materialization(
    left: &AttemptArtifactManifestV1,
    right: &AttemptArtifactManifestV1,
) -> bool {
    left.schema == right.schema
        && left.run_id == right.run_id
        && left.packet_id == right.packet_id
        && left.attempt_id == right.attempt_id
        && left.provider == right.provider
        && left.model == right.model
        && left.started_at == right.started_at
        && left.retention_class == right.retention_class
        && left.files == right.files
}

fn join_candidate(
    run_root: &Path,
    dirs: &PacketDirs,
    manifest: &AttemptArtifactManifestV1,
    bytes: &[u8],
) -> Result<NewAttemptArtifact, Failure> {
    Ok(NewAttemptArtifact {
        attempt_id: manifest.attempt_id,
        run_id: manifest.run_id.clone(),
        packet_id: manifest.packet_id.clone(),
        manifest_schema: manifest.schema.clone(),
        manifest_path: relative(run_root, &dirs.manifest())?,
        manifest_sha256: digest(bytes),
        retention_class: manifest.retention_class.as_str().to_owned(),
    })
}

/// Materialize all content, then publish `manifest.json` last.
pub fn materialize(
    run_root: &Path,
    packet_dir: &Path,
    input: &MaterializeAttempt<'_>,
) -> Result<(AttemptArtifactManifestV1, NewAttemptArtifact), Failure> {
    let dirs = PacketDirs::new(packet_dir, input.attempt_id);
    std::fs::create_dir_all(dirs.path())
        .map_err(|error| failure("creating attempt directory", dirs.path(), error))?;

    if dirs.manifest().exists() {
        let bytes = read(&dirs.manifest())?;
        let manifest: AttemptArtifactManifestV1 = serde_json::from_slice(&bytes)
            .map_err(|error| Failure::internal(format!("parsing immutable manifest: {error}")))?;
        check_identity(
            &manifest,
            input.run_id,
            &input.packet.packet_id,
            input.attempt_id,
        )?;
        let join = join_candidate(run_root, &dirs, &manifest, &bytes)?;
        return Ok((manifest, join));
    }

    finalize_provider_files(&dirs)?;
    atomic_write_once(
        &dirs.result(),
        &json_bytes(&ResultEvidence {
            schema: RESULT_SCHEMA,
            outcome: input.outcome,
            detail: input.detail,
        })?,
    )?;
    atomic_write_once(
        &dirs.session(),
        &json_bytes(&SessionEvidence {
            schema: SESSION_SCHEMA,
            attempt_id: input.attempt_id,
            provider_claimant: input.claimant,
            metadata: input.session,
        })?,
    )?;

    let manifest = AttemptArtifactManifestV1 {
        schema: MANIFEST_SCHEMA.to_owned(),
        run_id: input.run_id.to_owned(),
        packet_id: input.packet.packet_id.clone(),
        attempt_id: input.attempt_id,
        provider: input.packet.provider_hints.provider.clone(),
        model: input.packet.provider_hints.model.clone(),
        started_at: input.started_at.to_owned(),
        materialized_at: now_iso(),
        retention_class: input.retention_class,
        files: ManifestFilesV1 {
            prompt: entry(run_root, &dirs.prompt())?,
            output: entry(run_root, &dirs.stdout())?,
            result: entry(run_root, &dirs.result())?,
            session: entry(run_root, &dirs.session())?,
            final_message: dirs
                .last_message()
                .exists()
                .then(|| entry(run_root, &dirs.last_message()))
                .transpose()?,
        },
    };
    let bytes = json_bytes(&manifest)?;
    match atomic_write_once(&dirs.manifest(), &bytes) {
        Ok(()) => {
            let join = join_candidate(run_root, &dirs, &manifest, &bytes)?;
            Ok((manifest, join))
        }
        Err(error) if dirs.manifest().exists() => {
            // Two reconcilers may finish the same dead attempt concurrently.
            // The winner's timestamp is authoritative; every stable field and
            // content digest must still match before the loser converges.
            let existing_bytes = read(&dirs.manifest())?;
            let existing: AttemptArtifactManifestV1 = serde_json::from_slice(&existing_bytes)
                .map_err(|parse| Failure::internal(format!("parsing raced manifest: {parse}")))?;
            check_identity(
                &existing,
                input.run_id,
                &input.packet.packet_id,
                input.attempt_id,
            )?;
            if !same_materialization(&existing, &manifest) {
                return Err(error);
            }
            let join = join_candidate(run_root, &dirs, &existing, &existing_bytes)?;
            Ok((existing, join))
        }
        Err(error) => Err(error),
    }
}

/// Materialize and durably join an attempt after the manifest is fsynced.
pub async fn materialize_and_join(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
    outcome: &str,
    detail: &Value,
    session: &Value,
) -> Result<AttemptArtifactManifestV1, Failure> {
    let attempt = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
    if attempt.packet_id != packet.packet_id {
        return Err(Failure::invalid(format!(
            "attempt {attempt_id} belongs to {:?}, not {:?}",
            attempt.packet_id, packet.packet_id
        )));
    }
    let (run_id, stage, seq) = super::split_packet_key(&packet.packet_id)?;
    let run_root = ctx.config.run_dir(&run_id);
    let packet_dir = ctx.config.packet_dir_key(&run_id, &stage, seq);
    let input = MaterializeAttempt {
        run_id: &run_id,
        packet,
        attempt_id,
        claimant: &attempt.claimant,
        started_at: &attempt.started_at,
        outcome,
        detail,
        session,
        retention_class: if outcome == "result" {
            RetentionClass::CompactableSuccess
        } else {
            RetentionClass::Retain
        },
    };
    let (manifest, join) = materialize(&run_root, &packet_dir, &input)?;
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.record_attempt_artifact(join)
    })
    .await?;
    Ok(manifest)
}

fn verify_file(run_root: &Path, file: &ManifestFileV1, issues: &mut Vec<String>) {
    let relative = Path::new(&file.path);
    if relative.is_absolute()
        || relative
            .components()
            .any(|part| !matches!(part, Component::Normal(_)))
    {
        issues.push(format!("unsafe artifact-relative path {:?}", file.path));
        return;
    }
    match std::fs::read(run_root.join(relative)) {
        Err(error) => issues.push(format!("missing artifact {}: {error}", file.path)),
        Ok(bytes) => {
            if u64::try_from(bytes.len()).unwrap_or(u64::MAX) != file.bytes {
                issues.push(format!("byte-size mismatch for {}", file.path));
            }
            if digest(&bytes) != file.sha256 {
                issues.push(format!("sha256 mismatch for {}", file.path));
            }
        }
    }
}

/// Verify a joined manifest without modifying any bytes or ledger row.
pub fn verify_joined(run_root: &Path, row: &AttemptArtifactRow) -> Value {
    let path = run_root.join(&row.manifest_path);
    let bytes = match std::fs::read(&path) {
        Ok(bytes) => bytes,
        Err(error) => {
            return json!({"attemptId": row.attempt_id, "verified": false, "legacy": false,
                "manifestPath": row.manifest_path, "issues": [format!("missing manifest: {error}")]});
        }
    };
    let mut issues = Vec::new();
    if digest(&bytes) != row.manifest_sha256 {
        issues.push("manifest sha256 does not match ledger".to_owned());
    }
    let manifest = match serde_json::from_slice::<AttemptArtifactManifestV1>(&bytes) {
        Ok(manifest) => Some(manifest),
        Err(error) => {
            issues.push(format!("manifest schema is invalid: {error}"));
            None
        }
    };
    if let Some(manifest) = &manifest {
        if manifest.schema != row.manifest_schema
            || manifest.run_id != row.run_id
            || manifest.packet_id != row.packet_id
            || manifest.attempt_id != row.attempt_id
            || manifest.retention_class.as_str() != row.retention_class
        {
            issues.push("manifest identity does not match ledger join".to_owned());
        }
        for file in [
            &manifest.files.prompt,
            &manifest.files.output,
            &manifest.files.result,
            &manifest.files.session,
        ] {
            verify_file(run_root, file, &mut issues);
        }
        if let Some(file) = &manifest.files.final_message {
            verify_file(run_root, file, &mut issues);
        }
    }
    json!({"attemptId": row.attempt_id, "verified": issues.is_empty(), "legacy": false,
        "manifestPath": row.manifest_path, "manifestSha256": row.manifest_sha256,
        "retentionClass": row.retention_class, "issues": issues, "manifest": manifest})
}

/// Lightweight Work Detail projection. It deliberately trusts only the
/// ledger join and performs no filesystem reads; operators opt into hashing
/// raw evidence through `artifact verify`.
pub fn joined_projection_with_compaction(
    row: &AttemptArtifactRow,
    compaction: Option<&forged_ledger::AttemptArtifactCompactionRow>,
) -> Value {
    json!({
        "attemptId": row.attempt_id,
        "legacy": false,
        "manifestSchema": row.manifest_schema,
        "manifestPath": row.manifest_path,
        "manifestSha256": row.manifest_sha256,
        "retentionClass": row.retention_class,
        "joinedAt": row.created_at,
        "compaction": compaction.map(|value| json!({
            "state": value.state,
            "tombstonePath": value.tombstone_path,
            "tombstoneSha256": value.tombstone_sha256,
            "bytesRemoved": value.bytes_removed,
            "completedAt": value.completed_at,
        })),
    })
}

fn verify_compacted(
    run_root: &Path,
    row: &AttemptArtifactRow,
    compaction: &forged_ledger::AttemptArtifactCompactionRow,
) -> Value {
    let mut issues = Vec::new();
    if compaction.state != "completed" {
        issues.push("artifact compaction is incomplete".to_owned());
    }
    let manifest = load_manifest(run_root, row)
        .map_err(|error| issues.push(error.to_string()))
        .ok();
    let tombstone_bytes = read(&run_root.join(&compaction.tombstone_path))
        .map_err(|error| issues.push(error.to_string()))
        .ok();
    let tombstone = tombstone_bytes.as_deref().and_then(|bytes| {
        if digest(bytes) != compaction.tombstone_sha256 {
            issues.push("compaction tombstone sha256 does not match ledger".to_owned());
            return None;
        }
        serde_json::from_slice::<CompactionTombstoneV1>(bytes)
            .map_err(|error| issues.push(format!("invalid compaction tombstone: {error}")))
            .ok()
    });
    if let Some((manifest, _)) = &manifest {
        verify_file(run_root, &manifest.files.result, &mut issues);
        verify_file(run_root, &manifest.files.session, &mut issues);
        if let Some(tombstone) = &tombstone {
            let expected = self::tombstone(row, manifest);
            if tombstone.removed != expected.removed {
                issues.push("compaction tombstone removal set does not match manifest".to_owned());
            }
        }
    }
    if let Some(tombstone) = &tombstone {
        if tombstone.schema != COMPACTION_SCHEMA
            || tombstone.run_id != row.run_id
            || tombstone.packet_id != row.packet_id
            || tombstone.attempt_id != row.attempt_id
            || tombstone.manifest_path != row.manifest_path
            || tombstone.manifest_sha256 != row.manifest_sha256
        {
            issues.push("compaction tombstone identity does not match ledger".to_owned());
        }
        for removed in &tombstone.removed {
            if run_root.join(&removed.path).exists() {
                issues.push(format!("compacted artifact still exists: {}", removed.path));
            }
        }
    }
    json!({
        "attemptId": row.attempt_id,
        "verified": issues.is_empty(),
        "legacy": false,
        "compacted": true,
        "manifestPath": row.manifest_path,
        "manifestSha256": row.manifest_sha256,
        "tombstonePath": compaction.tombstone_path,
        "tombstoneSha256": compaction.tombstone_sha256,
        "bytesRemoved": compaction.bytes_removed,
        "issues": issues,
    })
}

pub fn legacy_projection(packet_dir: &Path, attempt_id: i64) -> Value {
    let mut files = ["prompt.md", "out.jsonl", "last.txt"]
        .into_iter()
        .map(|name| packet_dir.join(name))
        .filter(|path| path.is_file())
        .map(|path| path.to_string_lossy().into_owned())
        .collect::<Vec<_>>();
    files.sort();
    json!({"attemptId": attempt_id, "verified": false, "legacy": true,
        "directory": packet_dir, "files": files,
        "issues": ["attempt has no joined immutable manifest"]})
}

/// `artifact verify` — missing and mismatched evidence is reported as data,
/// never repaired or silently accepted.
pub async fn artifact_verify(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("artifact_verify", req, || async {
        let attempt_id = req
            .params
            .get("attempt")
            .and_then(Value::as_i64)
            .filter(|value| *value > 0)
            .ok_or_else(|| Failure::invalid("missing required positive param \"attempt\""))?;
        let attempt = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
        let (run_id, stage, seq) = super::split_packet_key(&attempt.packet_id)?;
        let run_root = ctx.config.run_dir(&run_id);
        let joined = on_ledger(&ctx.ledger, move |ledger| {
            ledger.get_attempt_artifact(attempt_id)
        })
        .await?;
        let compaction = on_ledger(&ctx.ledger, move |ledger| {
            ledger.get_attempt_artifact_compaction(attempt_id)
        })
        .await?;
        Ok(match joined {
            Some(row) => match compaction {
                Some(compaction) => verify_compacted(&run_root, &row, &compaction),
                None => verify_joined(&run_root, &row),
            },
            None => legacy_projection(&ctx.config.packet_dir_key(&run_id, &stage, seq), attempt_id),
        })
    })
    .await
}

/// Read the exact current attempt output named by its manifest.
pub fn manifest_output(
    run_root: &Path,
    row: &AttemptArtifactRow,
) -> Result<(String, String, String), Failure> {
    let bytes = read(&run_root.join(&row.manifest_path))?;
    if digest(&bytes) != row.manifest_sha256 {
        return Err(Failure::invalid(format!(
            "manifest digest mismatch for attempt {}",
            row.attempt_id
        )));
    }
    let manifest: AttemptArtifactManifestV1 = serde_json::from_slice(&bytes)
        .map_err(|error| Failure::invalid(format!("invalid attempt manifest: {error}")))?;
    check_identity(&manifest, &row.run_id, &row.packet_id, row.attempt_id)?;
    let output = read(&run_root.join(&manifest.files.output.path))?;
    if digest(&output) != manifest.files.output.sha256 {
        return Err(Failure::invalid(format!(
            "output digest mismatch for attempt {}",
            row.attempt_id
        )));
    }
    let output = String::from_utf8(output)
        .map_err(|error| Failure::invalid(format!("attempt output is not UTF-8: {error}")))?;
    Ok((manifest.provider, manifest.model, output))
}

fn load_manifest(
    run_root: &Path,
    row: &AttemptArtifactRow,
) -> Result<(AttemptArtifactManifestV1, Vec<u8>), Failure> {
    let bytes = read(&run_root.join(&row.manifest_path))?;
    if digest(&bytes) != row.manifest_sha256 {
        return Err(Failure::invalid(format!(
            "manifest digest mismatch for attempt {}",
            row.attempt_id
        )));
    }
    let manifest: AttemptArtifactManifestV1 = serde_json::from_slice(&bytes)
        .map_err(|error| Failure::invalid(format!("invalid attempt manifest: {error}")))?;
    check_identity(&manifest, &row.run_id, &row.packet_id, row.attempt_id)?;
    Ok((manifest, bytes))
}

fn tombstone(
    row: &AttemptArtifactRow,
    manifest: &AttemptArtifactManifestV1,
) -> CompactionTombstoneV1 {
    let mut removed = vec![manifest.files.prompt.clone(), manifest.files.output.clone()];
    if let Some(final_message) = &manifest.files.final_message {
        removed.push(final_message.clone());
    }
    CompactionTombstoneV1 {
        schema: COMPACTION_SCHEMA.to_owned(),
        run_id: row.run_id.clone(),
        packet_id: row.packet_id.clone(),
        attempt_id: row.attempt_id,
        manifest_path: row.manifest_path.clone(),
        manifest_sha256: row.manifest_sha256.clone(),
        removed,
    }
}

/// Explicitly compact one strictly eligible successful intermediate. This
/// is never called by drive, reconcile, overview, or materialization.
pub async fn artifact_compact(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let attempt_id = match req
        .params
        .get("attempt")
        .and_then(Value::as_i64)
        .filter(|value| *value > 0)
    {
        Some(value) => value,
        None => {
            return super::err_response(
                &super::derive_key("artifact_compact", None, None, None),
                &Failure::invalid("missing required positive param \"attempt\""),
            )
        }
    };
    let attempt = match on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await {
        Ok(value) => value,
        Err(error) => {
            return super::err_response(
                &super::derive_key("artifact_compact", None, Some("attempt"), Some(attempt_id)),
                &error,
            )
        }
    };
    let (run_id, _, _) = match super::split_packet_key(&attempt.packet_id) {
        Ok(value) => value,
        Err(error) => return super::err_response(&req.idempotency_key, &error),
    };
    req.run_id = Some(run_id.clone());
    super::default_key(
        req,
        super::derive_key(
            "artifact_compact",
            Some(&run_id),
            Some("attempt"),
            Some(attempt_id),
        ),
    );
    let run_root = ctx.config.run_dir(&run_id);
    super::fenced(
        ctx,
        "artifact_compact",
        forged_ledger::EffectClass::SafeRetry,
        req,
        None,
        move |operation_id| async move {
            let row = on_ledger(&ctx.ledger, move |ledger| {
                ledger.get_attempt_artifact(attempt_id)?.ok_or_else(|| {
                    forged_ledger::LedgerError::Refused {
                        code: forged_types::ErrorCode::InvalidRequest,
                        message: format!("attempt {attempt_id} has no artifact manifest"),
                    }
                })
            })
            .await?;
            let existing = on_ledger(&ctx.ledger, move |ledger| {
                ledger.get_attempt_artifact_compaction(attempt_id)
            })
            .await?;
            if let Some(existing) = &existing {
                if existing.state == "completed" {
                    return Ok(json!({
                        "attemptId": attempt_id,
                        "state": existing.state,
                        "bytesRemoved": existing.bytes_removed,
                        "tombstonePath": existing.tombstone_path,
                        "tombstoneSha256": existing.tombstone_sha256,
                    }));
                }
            }
            let (manifest, _) = load_manifest(&run_root, &row)?;
            let tombstone = tombstone(&row, &manifest);
            let tombstone_bytes = json_bytes(&tombstone)?;
            let tombstone_path = format!("compactions/{attempt_id}/tombstone.json");
            let tombstone_sha = digest(&tombstone_bytes);
            if existing.is_none() {
                // Prove the entire source set before committing an intent;
                // otherwise a first refusal followed by a retry could
                // mistake pre-existing loss for its own partial deletion.
                let mut source_files = vec![
                    &manifest.files.prompt,
                    &manifest.files.output,
                    &manifest.files.result,
                    &manifest.files.session,
                ];
                if let Some(final_message) = &manifest.files.final_message {
                    source_files.push(final_message);
                }
                for file in source_files {
                    let bytes = read(&run_root.join(&file.path))?;
                    if digest(&bytes) != file.sha256
                        || u64::try_from(bytes.len()).unwrap_or(u64::MAX) != file.bytes
                    {
                        return Err(Failure::invalid(format!(
                            "refusing to compact changed artifact {}",
                            file.path
                        )));
                    }
                }
            }
            let operation = operation_id.clone();
            let path_for_join = tombstone_path.clone();
            let sha_for_join = tombstone_sha.clone();
            let intent = on_ledger(&ctx.ledger, move |ledger| {
                ledger.begin_attempt_artifact_compaction(
                    attempt_id,
                    &operation,
                    &path_for_join,
                    &sha_for_join,
                )
            })
            .await?;
            atomic_write_once(&run_root.join(&tombstone_path), &tombstone_bytes)?;
            for file in &tombstone.removed {
                let path = run_root.join(&file.path);
                if path.exists() {
                    let bytes = read(&path)?;
                    if digest(&bytes) != file.sha256
                        || u64::try_from(bytes.len()).unwrap_or(u64::MAX) != file.bytes
                    {
                        return Err(Failure::invalid(format!(
                            "refusing to compact changed artifact {}",
                            file.path
                        )));
                    }
                    std::fs::remove_file(&path)
                        .map_err(|error| failure("removing compacted artifact", &path, error))?;
                    if let Some(parent) = path.parent() {
                        sync_dir(parent)?;
                    }
                }
            }
            let bytes_removed = tombstone
                .removed
                .iter()
                .try_fold(0i64, |sum, file| {
                    i64::try_from(file.bytes)
                        .ok()
                        .and_then(|bytes| sum.checked_add(bytes))
                })
                .ok_or_else(|| Failure::internal("compaction byte count overflow"))?;
            let completed = on_ledger(&ctx.ledger, move |ledger| {
                ledger.complete_attempt_artifact_compaction(attempt_id, bytes_removed)
            })
            .await?;
            Ok(json!({
                "attemptId": attempt_id,
                "state": completed.state,
                "bytesRemoved": completed.bytes_removed,
                "tombstonePath": intent.tombstone_path,
                "tombstoneSha256": intent.tombstone_sha256,
            }))
        },
    )
    .await
}

#[cfg(test)]
mod tests {
    use std::collections::{BTreeMap, HashMap};

    use forged_ledger::{Ledger, NewPacket, NewRun, RunOutcome, SpecFence};
    use forged_types::{Deliverable, ProviderHints, Sandbox, SpecRef, Stage, StageContract};

    use super::*;

    fn packet(root: &Path, run_id: &str, seq: i64) -> WorkPacket {
        WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: format!("{run_id}/implement/{seq}"),
            run_id: run_id.to_owned(),
            bead_id: "bead-a".to_owned(),
            stage: Stage::Implement,
            execution: None,
            lane_seq: None,
            spec: SpecRef {
                path: root.join("spec.md").to_string_lossy().into_owned(),
                sha256: "a".repeat(64),
                revision: None,
            },
            worktree: root.join("worktree"),
            branch: "forged/a".to_owned(),
            base_ref: "main".to_owned(),
            contract: StageContract {
                instructions: "test".to_owned(),
                gate_commands: Vec::new(),
                deliverable: Deliverable::CommitsInWorktree,
                budget_s: 1,
            },
            result_schema: "forged.result.implement/1".to_owned(),
            provider_hints: ProviderHints {
                provider: "claude".to_owned(),
                model: "test-model".to_owned(),
                effort: None,
                sandbox: Sandbox::WorkspaceWrite,
            },
            field_notes: Vec::new(),
        }
    }

    fn one(
        run_root: &Path,
        packet_dir: &Path,
        packet: &WorkPacket,
        id: i64,
        output: &str,
    ) -> (AttemptArtifactManifestV1, NewAttemptArtifact) {
        let dirs = PacketDirs::new(packet_dir, id);
        std::fs::create_dir_all(dirs.path()).unwrap();
        atomic_write_once(&dirs.prompt(), format!("prompt {id}").as_bytes()).unwrap();
        std::fs::write(dirs.stdout_working(), output).unwrap();
        materialize(
            run_root,
            packet_dir,
            &MaterializeAttempt {
                run_id: &packet.run_id,
                packet,
                attempt_id: id,
                claimant: "claude:session:1",
                started_at: "2026-08-14T00:00:00Z",
                outcome: "revoked",
                detail: &json!({"note":"done"}),
                session: &json!({"host":"process"}),
                retention_class: RetentionClass::Retain,
            },
        )
        .unwrap()
    }

    #[test]
    fn two_attempts_remain_distinct_and_readable() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("runs/run-safe_1");
        let packet_dir = run_root.join("packets/implement/1");
        let packet = packet(root.path(), "run-safe_1", 1);
        let (first, _) = one(&run_root, &packet_dir, &packet, 1, "first");
        let first_prompt = read(&run_root.join(&first.files.prompt.path)).unwrap();
        let (_, _) = one(&run_root, &packet_dir, &packet, 2, "second");
        assert_eq!(
            read(&run_root.join(&first.files.prompt.path)).unwrap(),
            first_prompt
        );
        assert_eq!(
            read(&run_root.join(&first.files.output.path)).unwrap(),
            b"first"
        );
        assert_eq!(
            read(&PacketDirs::new(&packet_dir, 2).stdout()).unwrap(),
            b"second"
        );
    }

    #[test]
    fn interruption_and_legacy_are_reported_without_mutation() {
        let root = tempfile::tempdir().unwrap();
        let packet_dir = root.path().join("runs/run-safe/packets/implement/1");
        let dirs = PacketDirs::new(&packet_dir, 3);
        std::fs::create_dir_all(dirs.path()).unwrap();
        atomic_write_once(&dirs.prompt(), b"prompt").unwrap();
        std::fs::write(dirs.stdout_working(), "partial").unwrap();
        let report = legacy_projection(&packet_dir, 3);
        assert_eq!(report["verified"], false);
        assert!(!dirs.manifest().exists());
        assert!(dirs.stdout_working().exists());
    }

    #[test]
    fn digest_mismatch_is_reported_without_repair() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("runs/run-safe");
        let packet_dir = run_root.join("packets/implement/1");
        let packet = packet(root.path(), "run-safe", 1);
        let (_, join) = one(&run_root, &packet_dir, &packet, 4, "raw");
        let row = AttemptArtifactRow {
            attempt_id: join.attempt_id,
            run_id: join.run_id,
            packet_id: join.packet_id,
            manifest_schema: join.manifest_schema,
            manifest_path: join.manifest_path,
            manifest_sha256: join.manifest_sha256,
            retention_class: join.retention_class,
            created_at: "now".to_owned(),
        };
        let output = PacketDirs::new(&packet_dir, 4).stdout();
        std::fs::write(&output, "tampered").unwrap();
        let before = read(&output).unwrap();
        assert_eq!(verify_joined(&run_root, &row)["verified"], false);
        assert_eq!(read(&output).unwrap(), before);
    }

    #[test]
    fn unsafe_path_component_prevents_manifest_publication() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("runs");
        let packet_dir = run_root.join("run bad/packets/implement/1");
        let packet = packet(root.path(), "run-safe", 1);
        let dirs = PacketDirs::new(&packet_dir, 5);
        std::fs::create_dir_all(dirs.path()).unwrap();
        atomic_write_once(&dirs.prompt(), b"prompt").unwrap();
        std::fs::write(dirs.stdout_working(), "raw").unwrap();
        let result = materialize(
            &run_root,
            &packet_dir,
            &MaterializeAttempt {
                run_id: &packet.run_id,
                packet: &packet,
                attempt_id: 5,
                claimant: "claude:s:1",
                started_at: "now",
                outcome: "revoked",
                detail: &json!({}),
                session: &json!({}),
                retention_class: RetentionClass::Retain,
            },
        );
        assert!(result.is_err());
        assert!(!dirs.manifest().exists());
    }

    #[test]
    fn ordinary_projection_does_not_touch_artifact_files() {
        let row = AttemptArtifactRow {
            attempt_id: 9,
            run_id: "run-gone".to_owned(),
            packet_id: "run-gone/implement/1".to_owned(),
            manifest_schema: MANIFEST_SCHEMA.to_owned(),
            manifest_path: "packets/implement/1/attempts/9/manifest.json".to_owned(),
            manifest_sha256: "a".repeat(64),
            retention_class: "retain".to_owned(),
            created_at: "now".to_owned(),
        };
        // No run root or manifest exists. Projection still succeeds because
        // it is bounded ledger metadata, not implicit verification.
        let compaction = forged_ledger::AttemptArtifactCompactionRow {
            attempt_id: 9,
            operation_id: "op".to_owned(),
            tombstone_path: "compactions/9/tombstone.json".to_owned(),
            tombstone_sha256: "b".repeat(64),
            state: "completed".to_owned(),
            bytes_removed: Some(42),
            created_at: "then".to_owned(),
            completed_at: Some("now".to_owned()),
        };
        let value = joined_projection_with_compaction(&row, Some(&compaction));
        assert_eq!(value["attemptId"], 9);
        assert_eq!(value["manifestSha256"], "a".repeat(64));
        assert_eq!(value["compaction"]["state"], "completed");
    }

    fn config(root: &Path) -> crate::config::ForgedConfig {
        crate::config::ForgedConfig {
            anvil_home: root.to_path_buf(),
            runs_root: root.join("runs"),
            db_path: root.join("state.db"),
            config_path: root.join("config.json"),
            config_file_read: false,
            roster: HashMap::new(),
            profiles: BTreeMap::new(),
            rosters: BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            bd_path: root.join("bd"),
            beads_dir: root.join("beads"),
            codex_home: root.join("codex"),
            host_policy: crate::config::HostPolicy::Off,
            herdr_sock: None,
            pricing: crate::pricing::default_rate_card(),
        }
    }

    async fn successful_attempt(ctx: &Ctx, run_id: &str, seq: i64) -> i64 {
        let packet = packet(&ctx.config.anvil_home, run_id, seq);
        let packet_id = ctx
            .ledger
            .open_packet(NewPacket {
                run_id: run_id.to_owned(),
                stage: Stage::Implement,
                seq,
                spec_path: packet.spec.path.clone(),
                spec_sha256: packet.spec.sha256.clone(),
                spec_revision: None,
                body_json: packet.stored_body().unwrap(),
            })
            .unwrap();
        let claimed = ctx
            .ledger
            .claim_packet(
                &packet_id,
                &format!("claude:session:{seq}"),
                &SpecFence::Sha256(packet.spec.sha256.clone()),
            )
            .unwrap();
        let packet_dir = ctx.config.packet_dir_key(run_id, "implement", seq);
        let dirs = PacketDirs::new(&packet_dir, claimed.attempt_id);
        std::fs::create_dir_all(dirs.path()).unwrap();
        atomic_write_once(&dirs.prompt(), format!("prompt {seq}").as_bytes()).unwrap();
        std::fs::write(dirs.stdout_working(), format!("output {seq}")).unwrap();
        let result = forged_types::PacketResult {
            schema: "forged.result.implement/1".to_owned(),
            packet_id: packet_id.clone(),
            outcome: forged_types::Outcome::Implement {
                implemented: true,
                commits_ahead: 1,
                summary: "done".to_owned(),
                gate_state: Some("pass".to_owned()),
                note: None,
            },
        };
        materialize_and_join(
            ctx,
            &packet,
            claimed.attempt_id,
            "result",
            &serde_json::to_value(&result).unwrap(),
            &json!({"host":"test"}),
        )
        .await
        .unwrap();
        ctx.ledger
            .complete_packet(&packet_id, &claimed.claim_token, &result)
            .unwrap();
        claimed.attempt_id
    }

    #[tokio::test]
    async fn explicit_compaction_removes_only_an_intermediate_success() {
        let root = tempfile::tempdir().unwrap();
        let ledger = Ledger::open(&root.path().join("state.db")).unwrap();
        ledger
            .create_run(NewRun {
                run_id: forged_types::RunId::new("run-compact").unwrap(),
                bead_id: "bead-compact".to_owned(),
                repo: "/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: "forged/compact".to_owned(),
            })
            .unwrap();
        let ctx = Ctx {
            config: config(root.path()),
            ledger,
        };
        let first = successful_attempt(&ctx, "run-compact", 1).await;
        let final_attempt = successful_attempt(&ctx, "run-compact", 2).await;
        ctx.ledger
            .settle_run(
                "run-compact",
                RunOutcome::Clean,
                "test completed".to_owned(),
                None,
                None,
                None,
            )
            .unwrap();

        let mut request = OperationRequest {
            schema_version: 1,
            idempotency_key: "compact:first".to_owned(),
            run_id: None,
            params: json!({"attempt": first}).as_object().unwrap().clone(),
        };
        let response = artifact_compact(&ctx, &mut request).await;
        assert!(response.ok, "{response:?}");
        assert_eq!(response.result.as_ref().unwrap()["state"], "completed");
        let first_dirs = PacketDirs::new(
            ctx.config.packet_dir_key("run-compact", "implement", 1),
            first,
        );
        assert!(!first_dirs.prompt().exists());
        assert!(!first_dirs.stdout().exists());
        assert!(first_dirs.manifest().exists());
        assert!(first_dirs.result().exists());

        let verify_request = OperationRequest {
            schema_version: 1,
            idempotency_key: String::new(),
            run_id: None,
            params: json!({"attempt": first}).as_object().unwrap().clone(),
        };
        let verified = artifact_verify(&ctx, &verify_request).await;
        assert!(verified.ok, "{verified:?}");
        assert_eq!(verified.result.as_ref().unwrap()["verified"], true);
        assert_eq!(verified.result.as_ref().unwrap()["compacted"], true);

        let mut replay = OperationRequest {
            schema_version: 1,
            idempotency_key: "compact:first:replay".to_owned(),
            run_id: None,
            params: json!({"attempt": first}).as_object().unwrap().clone(),
        };
        let replayed = artifact_compact(&ctx, &mut replay).await;
        assert!(
            replayed.ok,
            "completed compaction is idempotent: {replayed:?}"
        );

        let mut final_request = OperationRequest {
            schema_version: 1,
            idempotency_key: "compact:final".to_owned(),
            run_id: None,
            params: json!({"attempt": final_attempt})
                .as_object()
                .unwrap()
                .clone(),
        };
        let refusal = artifact_compact(&ctx, &mut final_request).await;
        assert!(!refusal.ok, "final current success must fail closed");
        let final_dirs = PacketDirs::new(
            ctx.config.packet_dir_key("run-compact", "implement", 2),
            final_attempt,
        );
        assert!(final_dirs.prompt().exists());
        assert!(final_dirs.stdout().exists());
    }
}
