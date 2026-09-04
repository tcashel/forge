//! Immutable, attempt-addressed provider evidence and read-only attestation.

use std::ffi::{OsStr, OsString};
use std::fs::File;
use std::io::{Read, Write};
use std::os::fd::OwnedFd;
use std::path::{Component, Path};

use forged_ledger::{AttemptArtifactRow, NewAttemptArtifact};
use forged_provider::{PacketDirs, ProviderStreamRequestV1};
use forged_types::{OperationRequest, OperationResponse, WorkPacket};
use nix::errno::Errno;
use nix::fcntl::{open, openat, AtFlags, OFlag};
use nix::sys::stat::{fstat, mkdirat, Mode, SFlag};
use nix::unistd::{fsync, linkat, unlinkat, UnlinkatFlags};
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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ResultEvidenceV1 {
    schema: String,
    outcome: String,
    detail: Value,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct SessionEvidenceV1 {
    schema: String,
    attempt_id: i64,
    provider_claimant: String,
    metadata: Value,
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

#[cfg(test)]
fn read(path: &Path) -> Result<Vec<u8>, Failure> {
    std::fs::read(path).map_err(|error| failure("reading artifact", path, error))
}

fn safe_relative(path: &str) -> Result<&Path, Failure> {
    let relative = Path::new(path);
    let safe = !path.is_empty()
        && !relative.is_absolute()
        && relative.components().all(|component| match component {
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
            "artifact path {path:?} is not a safe run-relative path"
        )));
    }
    Ok(relative)
}

fn nix_failure(action: &str, path: &Path, error: Errno) -> Failure {
    Failure::invalid(format!(
        "{action} {} without following symlinks: {error}",
        path.display()
    ))
}

fn open_root(run_root: &Path) -> Result<OwnedFd, Failure> {
    open(
        run_root,
        OFlag::O_RDONLY | OFlag::O_DIRECTORY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::empty(),
    )
    .map_err(|error| nix_failure("opening run root", run_root, error))
}

/// Hold the parent directory descriptor for a safe relative leaf. Each parent
/// is opened with `O_NOFOLLOW`; later reads/unlinks stay anchored even if a
/// pathname is concurrently replaced with a symlink.
fn anchored_parent(
    run_root: &Path,
    relative: &str,
    create_parents: bool,
) -> Result<(OwnedFd, OsString), Failure> {
    let relative = safe_relative(relative)?;
    let mut components = relative
        .components()
        .map(|component| match component {
            Component::Normal(value) => value.to_owned(),
            _ => unreachable!("safe_relative admitted only normal components"),
        })
        .collect::<Vec<_>>();
    let leaf = components
        .pop()
        .ok_or_else(|| Failure::invalid("artifact path has no leaf"))?;
    let mut directory = open_root(run_root)?;
    let mut display = run_root.to_path_buf();
    for component in components {
        display.push(&component);
        let flags = OFlag::O_RDONLY | OFlag::O_DIRECTORY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC;
        directory = match openat(&directory, Path::new(&component), flags, Mode::empty()) {
            Ok(next) => next,
            Err(Errno::ENOENT) if create_parents => {
                match mkdirat(
                    &directory,
                    Path::new(&component),
                    Mode::from_bits_truncate(0o700),
                ) {
                    Ok(()) | Err(Errno::EEXIST) => {}
                    Err(error) => {
                        return Err(nix_failure("creating artifact directory", &display, error))
                    }
                }
                openat(&directory, Path::new(&component), flags, Mode::empty())
                    .map_err(|error| nix_failure("opening artifact directory", &display, error))?
            }
            Err(error) => return Err(nix_failure("opening artifact directory", &display, error)),
        };
    }
    Ok((directory, leaf))
}

fn read_regular_fd(fd: OwnedFd, display: &Path) -> Result<Vec<u8>, Failure> {
    let stat = fstat(&fd).map_err(|error| nix_failure("inspecting artifact", display, error))?;
    if SFlag::from_bits_truncate(stat.st_mode) & SFlag::S_IFMT != SFlag::S_IFREG {
        return Err(Failure::invalid(format!(
            "artifact {} is not a regular file",
            display.display()
        )));
    }
    let mut file = File::from(fd);
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)
        .map_err(|error| failure("reading artifact", display, error))?;
    Ok(bytes)
}

fn read_run_file(run_root: &Path, relative: &str) -> Result<Vec<u8>, Failure> {
    let (parent, leaf) = anchored_parent(run_root, relative, false)?;
    let display = run_root.join(safe_relative(relative)?);
    let fd = openat(
        &parent,
        Path::new(&leaf),
        OFlag::O_RDONLY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::empty(),
    )
    .map_err(|error| nix_failure("opening artifact", &display, error))?;
    read_regular_fd(fd, &display)
}

fn read_optional_run_file(run_root: &Path, relative: &str) -> Result<Option<Vec<u8>>, Failure> {
    let (parent, leaf) = anchored_parent(run_root, relative, false)?;
    let display = run_root.join(safe_relative(relative)?);
    match openat(
        &parent,
        Path::new(&leaf),
        OFlag::O_RDONLY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::empty(),
    ) {
        Ok(fd) => read_regular_fd(fd, &display).map(Some),
        Err(Errno::ENOENT) => Ok(None),
        Err(error) => Err(nix_failure("opening artifact", &display, error)),
    }
}

fn read_leaf(parent: &OwnedFd, leaf: &OsStr, display: &Path) -> Result<Vec<u8>, Failure> {
    let fd = openat(
        parent,
        Path::new(leaf),
        OFlag::O_RDONLY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::empty(),
    )
    .map_err(|error| nix_failure("opening artifact", display, error))?;
    read_regular_fd(fd, display)
}

fn run_file_exists(run_root: &Path, relative: &str) -> Result<bool, Failure> {
    read_optional_run_file(run_root, relative).map(|bytes| bytes.is_some())
}

/// Run-root-anchored counterpart to `atomic_write_once`. Parent traversal,
/// temporary creation, publish, and cleanup all stay relative to held
/// directory descriptors and cannot be redirected by symlink replacement.
fn atomic_write_once_run(run_root: &Path, relative: &str, bytes: &[u8]) -> Result<(), Failure> {
    let (parent, leaf) = anchored_parent(run_root, relative, true)?;
    let display = run_root.join(safe_relative(relative)?);
    match openat(
        &parent,
        Path::new(&leaf),
        OFlag::O_RDONLY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::empty(),
    ) {
        Ok(fd) => {
            return if read_regular_fd(fd, &display)? == bytes {
                fsync(&parent)
                    .map_err(|error| nix_failure("syncing artifact directory", &display, error))
            } else {
                Err(Failure::internal(format!(
                    "immutable artifact {} already contains different bytes",
                    display.display()
                )))
            };
        }
        Err(Errno::ENOENT) => {}
        Err(error) => return Err(nix_failure("opening immutable artifact", &display, error)),
    }

    let leaf_text = leaf
        .to_str()
        .ok_or_else(|| Failure::invalid(format!("artifact leaf {:?} is not UTF-8", leaf)))?;
    let temporary = OsString::from(format!(".{leaf_text}.tmp-{}", uuid::Uuid::now_v7()));
    let temporary_path = display.with_file_name(&temporary);
    let fd = openat(
        &parent,
        Path::new(&temporary),
        OFlag::O_CREAT | OFlag::O_EXCL | OFlag::O_WRONLY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::from_bits_truncate(0o600),
    )
    .map_err(|error| nix_failure("creating temporary artifact", &temporary_path, error))?;
    let mut file = File::from(fd);
    let write_result = file
        .write_all(bytes)
        .map_err(|error| failure("writing temporary artifact", &temporary_path, error))
        .and_then(|()| {
            file.sync_all()
                .map_err(|error| failure("syncing temporary artifact", &temporary_path, error))
        });
    drop(file);
    let publish_result = write_result.and_then(|()| {
        match linkat(
            &parent,
            Path::new(&temporary),
            &parent,
            Path::new(&leaf),
            AtFlags::empty(),
        ) {
            Ok(()) => Ok(()),
            Err(Errno::EEXIST) => {
                let existing = read_leaf(&parent, &leaf, &display)?;
                if existing == bytes {
                    Ok(())
                } else {
                    Err(Failure::internal(format!(
                        "immutable artifact {} already contains different bytes",
                        display.display()
                    )))
                }
            }
            Err(error) => Err(nix_failure(
                "publishing immutable artifact",
                &display,
                error,
            )),
        }
    });
    let cleanup_result = unlinkat(&parent, Path::new(&temporary), UnlinkatFlags::NoRemoveDir)
        .map_err(|error| nix_failure("removing temporary artifact", &temporary_path, error));
    let sync_result =
        fsync(&parent).map_err(|error| nix_failure("syncing artifact directory", &display, error));
    publish_result.and(cleanup_result).and(sync_result)
}

fn remove_run_file(run_root: &Path, relative: &str) -> Result<bool, Failure> {
    let (parent, leaf) = anchored_parent(run_root, relative, false)?;
    let display = run_root.join(safe_relative(relative)?);
    let fd = match openat(
        &parent,
        Path::new(&leaf),
        OFlag::O_RDONLY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::empty(),
    ) {
        Ok(fd) => fd,
        Err(Errno::ENOENT) => return Ok(false),
        Err(error) => return Err(nix_failure("opening artifact for removal", &display, error)),
    };
    let stat = fstat(&fd).map_err(|error| nix_failure("inspecting artifact", &display, error))?;
    if SFlag::from_bits_truncate(stat.st_mode) & SFlag::S_IFMT != SFlag::S_IFREG {
        return Err(Failure::invalid(format!(
            "artifact {} is not a regular file",
            display.display()
        )));
    }
    match unlinkat(&parent, Path::new(&leaf), UnlinkatFlags::NoRemoveDir) {
        Ok(()) => {}
        // A racing reconciler removed it between our open and this unlink:
        // the artifact is gone, which is the goal — convergence, not error.
        Err(Errno::ENOENT) => return Ok(false),
        Err(error) => return Err(nix_failure("removing artifact", &display, error)),
    }
    fsync(&parent).map_err(|error| nix_failure("syncing artifact directory", &display, error))?;
    Ok(true)
}

fn remove_manifest_file(run_root: &Path, file: &ManifestFileV1) -> Result<bool, Failure> {
    let (parent, leaf) = anchored_parent(run_root, &file.path, false)?;
    let display = run_root.join(safe_relative(&file.path)?);
    let bytes = match openat(
        &parent,
        Path::new(&leaf),
        OFlag::O_RDONLY | OFlag::O_NOFOLLOW | OFlag::O_CLOEXEC,
        Mode::empty(),
    ) {
        Ok(fd) => read_regular_fd(fd, &display)?,
        Err(Errno::ENOENT) => return Ok(false),
        Err(error) => return Err(nix_failure("opening compactable artifact", &display, error)),
    };
    if digest(&bytes) != file.sha256 || u64::try_from(bytes.len()).unwrap_or(u64::MAX) != file.bytes
    {
        return Err(Failure::invalid(format!(
            "refusing to compact changed artifact {}",
            file.path
        )));
    }
    match unlinkat(&parent, Path::new(&leaf), UnlinkatFlags::NoRemoveDir) {
        Ok(()) => {}
        Err(Errno::ENOENT) => return Ok(false),
        Err(error) => return Err(nix_failure("removing compacted artifact", &display, error)),
    }
    fsync(&parent).map_err(|error| nix_failure("syncing artifact directory", &display, error))?;
    Ok(true)
}

/// Create the closed attempt directory exclusively through a held run-root
/// capability. No ambient `create_dir_all` is allowed on packet paths.
pub(crate) fn prepare_attempt(run_root: &Path, dirs: &PacketDirs) -> Result<(), Failure> {
    let prompt = relative(run_root, &dirs.prompt())?;
    let _ = anchored_parent(run_root, &prompt, true)?;
    Ok(())
}

pub(crate) fn materialize_prompt(
    run_root: &Path,
    dirs: &PacketDirs,
    bytes: &[u8],
) -> Result<(), Failure> {
    let prompt = relative(run_root, &dirs.prompt())?;
    atomic_write_once_run(run_root, &prompt, bytes)
}

/// Publish the exact hidden-runner request through the same held run-root
/// capability as immutable attempt evidence. The private control file is not
/// part of the manifest inventory and carries no transcript or credential.
pub(crate) fn materialize_provider_stream_request(
    run_root: &Path,
    dirs: &PacketDirs,
    request: &ProviderStreamRequestV1,
) -> Result<(), Failure> {
    let relative = relative(run_root, &dirs.provider_stream_request())?;
    let bytes = request.to_bytes().map_err(Failure::from)?;
    atomic_write_once_run(run_root, &relative, &bytes)
}

/// Promote a provider's private streaming target after it is terminal. Every
/// read, publication, and unlink stays relative to a held run-root directory.
fn promote_stream(run_root: &Path, working: &Path, final_path: &Path) -> Result<(), Failure> {
    let working = relative(run_root, working)?;
    let final_path = relative(run_root, final_path)?;
    let Some(bytes) = read_optional_run_file(run_root, &working)? else {
        return if run_file_exists(run_root, &final_path)? {
            Ok(())
        } else {
            atomic_write_once_run(run_root, &final_path, b"")
        };
    };
    atomic_write_once_run(run_root, &final_path, &bytes)?;
    remove_run_file(run_root, &working)?;
    Ok(())
}

/// Freeze provider-owned streaming targets before usage or result harvest.
/// A missing stream becomes an honest zero-byte capture.
pub(crate) fn finalize_provider_files(run_root: &Path, dirs: &PacketDirs) -> Result<(), Failure> {
    promote_stream(run_root, &dirs.stdout_working(), &dirs.stdout())?;
    let last_working = relative(run_root, &dirs.last_message_working())?;
    let last_final = relative(run_root, &dirs.last_message())?;
    if run_file_exists(run_root, &last_working)? || run_file_exists(run_root, &last_final)? {
        promote_stream(run_root, &dirs.last_message_working(), &dirs.last_message())?;
    }
    Ok(())
}

pub(crate) fn prompt_exists(run_root: &Path, dirs: &PacketDirs) -> Result<bool, Failure> {
    run_file_exists(run_root, &relative(run_root, &dirs.prompt())?)
}

pub(crate) fn read_output_text(run_root: &Path, dirs: &PacketDirs) -> Result<String, Failure> {
    let output = read_run_file(run_root, &relative(run_root, &dirs.stdout())?)?;
    String::from_utf8(output)
        .map_err(|error| Failure::invalid(format!("provider output is not UTF-8: {error}")))
}

pub(crate) fn read_final_message_text(
    run_root: &Path,
    dirs: &PacketDirs,
) -> Result<Option<String>, Failure> {
    let path = relative(run_root, &dirs.last_message())?;
    read_optional_run_file(run_root, &path)?
        .map(|bytes| {
            String::from_utf8(bytes).map_err(|error| {
                Failure::invalid(format!("provider final message is not UTF-8: {error}"))
            })
        })
        .transpose()
}

fn relative(run_root: &Path, path: &Path) -> Result<String, Failure> {
    let relative = path.strip_prefix(run_root).map_err(|_| {
        Failure::internal(format!(
            "artifact {} is outside run root {}",
            path.display(),
            run_root.display()
        ))
    })?;
    let encoded = relative.to_string_lossy().into_owned();
    safe_relative(&encoded)?;
    Ok(encoded)
}

fn entry(run_root: &Path, path: &Path) -> Result<ManifestFileV1, Failure> {
    let relative = relative(run_root, path)?;
    let bytes = read_run_file(run_root, &relative)?;
    Ok(ManifestFileV1 {
        path: relative,
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

fn valid_sha256(value: &str) -> bool {
    value.len() == 64
        && value
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
}

fn expected_manifest_path(packet_id: &str, attempt_id: i64) -> Result<String, Failure> {
    let (_, stage, seq) = super::split_packet_key(packet_id)?;
    let expected = format!("packets/{stage}/{seq}/attempts/{attempt_id}/manifest.json");
    safe_relative(&expected)?;
    Ok(expected)
}

/// A manifest may name only the five closed file slots immediately beside
/// itself in `attempts/<attempt-id>`. This is checked before any embedded path
/// is read or removed.
fn validate_manifest_layout(
    manifest_path: &str,
    attempt_id: i64,
    manifest: &AttemptArtifactManifestV1,
) -> Result<(), Failure> {
    let manifest_relative = safe_relative(manifest_path)?;
    let expected_manifest = expected_manifest_path(&manifest.packet_id, attempt_id)?;
    if manifest_path != expected_manifest {
        return Err(Failure::invalid(format!(
            "attempt {attempt_id} manifest path {manifest_path:?} does not match {expected_manifest:?}"
        )));
    }
    let attempt_dir = manifest_relative
        .parent()
        .ok_or_else(|| Failure::invalid("attempt manifest has no parent directory"))?;
    let expected = |name: &str| attempt_dir.join(name);
    let slots = [
        (&manifest.files.prompt, expected("prompt.md")),
        (&manifest.files.output, expected("out.jsonl")),
        (&manifest.files.result, expected("result.json")),
        (&manifest.files.session, expected("session.json")),
    ];
    for (file, expected) in slots {
        safe_relative(&file.path)?;
        if Path::new(&file.path) != expected {
            return Err(Failure::invalid(format!(
                "manifest file path {:?} is outside its closed attempt slot {}",
                file.path,
                expected.display()
            )));
        }
        if !valid_sha256(&file.sha256) {
            return Err(Failure::invalid(format!(
                "manifest file {:?} has an invalid sha256",
                file.path
            )));
        }
    }
    if let Some(file) = &manifest.files.final_message {
        let expected = expected("last.txt");
        safe_relative(&file.path)?;
        if Path::new(&file.path) != expected || !valid_sha256(&file.sha256) {
            return Err(Failure::invalid(format!(
                "manifest final-message path {:?} is outside its closed attempt slot",
                file.path
            )));
        }
    }
    Ok(())
}

fn expected_retention(outcome: &str) -> RetentionClass {
    if outcome == "result" {
        RetentionClass::CompactableSuccess
    } else {
        RetentionClass::Retain
    }
}

fn validate_manifest_evidence(
    run_root: &Path,
    manifest: &AttemptArtifactManifestV1,
    expected: Option<&MaterializeAttempt<'_>>,
) -> Result<(ResultEvidenceV1, SessionEvidenceV1), Failure> {
    let result = parse_result(&read_run_file(run_root, &manifest.files.result.path)?)?;
    let session = parse_session(
        &read_run_file(run_root, &manifest.files.session.path)?,
        manifest.attempt_id,
    )?;
    if manifest.retention_class != expected_retention(&result.outcome) {
        return Err(Failure::invalid(format!(
            "attempt {} retention does not match immutable result outcome",
            manifest.attempt_id
        )));
    }
    if let Some(expected) = expected {
        if manifest.provider != expected.packet.provider_hints.provider
            || manifest.model != expected.packet.provider_hints.model
            || manifest.started_at != expected.started_at
            || session.provider_claimant != expected.claimant
        {
            return Err(Failure::invalid(format!(
                "attempt {} manifest provenance does not match the claimed attempt",
                manifest.attempt_id
            )));
        }
    }
    Ok((result, session))
}

fn verify_manifest_inventory(
    run_root: &Path,
    manifest: &AttemptArtifactManifestV1,
) -> Result<(), Failure> {
    let mut files = vec![
        &manifest.files.prompt,
        &manifest.files.output,
        &manifest.files.result,
        &manifest.files.session,
    ];
    if let Some(final_message) = &manifest.files.final_message {
        files.push(final_message);
    }
    for file in files {
        let bytes = read_run_file(run_root, &file.path)?;
        if u64::try_from(bytes.len()).unwrap_or(u64::MAX) != file.bytes
            || digest(&bytes) != file.sha256
        {
            return Err(Failure::invalid(format!(
                "manifest content does not match artifact {}",
                file.path
            )));
        }
    }
    Ok(())
}

fn parse_result(bytes: &[u8]) -> Result<ResultEvidenceV1, Failure> {
    let evidence: ResultEvidenceV1 = serde_json::from_slice(bytes)
        .map_err(|error| Failure::invalid(format!("invalid result evidence: {error}")))?;
    if evidence.schema != RESULT_SCHEMA || evidence.outcome.is_empty() {
        return Err(Failure::invalid(
            "result evidence has an invalid schema or outcome",
        ));
    }
    Ok(evidence)
}

fn parse_session(bytes: &[u8], attempt_id: i64) -> Result<SessionEvidenceV1, Failure> {
    let evidence: SessionEvidenceV1 = serde_json::from_slice(bytes)
        .map_err(|error| Failure::invalid(format!("invalid session evidence: {error}")))?;
    if evidence.schema != SESSION_SCHEMA || evidence.attempt_id != attempt_id {
        return Err(Failure::invalid(format!(
            "session evidence identity does not match attempt {attempt_id}"
        )));
    }
    Ok(evidence)
}

fn publish_or_adopt_result(
    run_root: &Path,
    relative: &str,
    candidate: ResultEvidenceV1,
) -> Result<ResultEvidenceV1, Failure> {
    let candidate_bytes = json_bytes(&candidate)?;
    match atomic_write_once_run(run_root, relative, &candidate_bytes) {
        Ok(()) => Ok(candidate),
        Err(error) => read_run_file(run_root, relative)
            .and_then(|bytes| parse_result(&bytes))
            .map_err(|_| error),
    }
}

fn publish_or_adopt_session(
    run_root: &Path,
    relative: &str,
    candidate: SessionEvidenceV1,
) -> Result<SessionEvidenceV1, Failure> {
    let candidate_bytes = json_bytes(&candidate)?;
    match atomic_write_once_run(run_root, relative, &candidate_bytes) {
        Ok(()) => Ok(candidate),
        Err(error) => read_run_file(run_root, relative)
            .and_then(|bytes| parse_session(&bytes, candidate.attempt_id))
            .map_err(|_| error),
    }
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
    let manifest_path = relative(run_root, &dirs.manifest())?;
    validate_manifest_layout(&manifest_path, manifest.attempt_id, manifest)?;
    Ok(NewAttemptArtifact {
        attempt_id: manifest.attempt_id,
        run_id: manifest.run_id.clone(),
        packet_id: manifest.packet_id.clone(),
        manifest_schema: manifest.schema.clone(),
        manifest_path,
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
    prepare_attempt(run_root, &dirs)?;
    let manifest_path = relative(run_root, &dirs.manifest())?;

    if let Some(bytes) = read_optional_run_file(run_root, &manifest_path)? {
        let manifest: AttemptArtifactManifestV1 = serde_json::from_slice(&bytes)
            .map_err(|error| Failure::internal(format!("parsing immutable manifest: {error}")))?;
        check_identity(
            &manifest,
            input.run_id,
            &input.packet.packet_id,
            input.attempt_id,
        )?;
        validate_manifest_layout(&manifest_path, input.attempt_id, &manifest)?;
        verify_manifest_inventory(run_root, &manifest)?;
        validate_manifest_evidence(run_root, &manifest, Some(input))?;
        let join = join_candidate(run_root, &dirs, &manifest, &bytes)?;
        return Ok((manifest, join));
    }

    finalize_provider_files(run_root, &dirs)?;
    let result_path = relative(run_root, &dirs.result())?;
    let result = publish_or_adopt_result(
        run_root,
        &result_path,
        ResultEvidenceV1 {
            schema: RESULT_SCHEMA.to_owned(),
            outcome: input.outcome.to_owned(),
            detail: input.detail.clone(),
        },
    )?;
    let session_path = relative(run_root, &dirs.session())?;
    publish_or_adopt_session(
        run_root,
        &session_path,
        SessionEvidenceV1 {
            schema: SESSION_SCHEMA.to_owned(),
            attempt_id: input.attempt_id,
            provider_claimant: input.claimant.to_owned(),
            metadata: input.session.clone(),
        },
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
        // The immutable result evidence wins a crash/recovery race. Deriving
        // retention from the adopted outcome makes manifest replay
        // deterministic even when recovery arrived with a revoked outcome.
        retention_class: expected_retention(&result.outcome),
        files: ManifestFilesV1 {
            prompt: entry(run_root, &dirs.prompt())?,
            output: entry(run_root, &dirs.stdout())?,
            result: entry(run_root, &dirs.result())?,
            session: entry(run_root, &dirs.session())?,
            final_message: {
                let path = relative(run_root, &dirs.last_message())?;
                read_optional_run_file(run_root, &path)?.map(|bytes| ManifestFileV1 {
                    path,
                    bytes: u64::try_from(bytes.len()).unwrap_or(u64::MAX),
                    sha256: digest(&bytes),
                })
            },
        },
    };
    validate_manifest_layout(
        &relative(run_root, &dirs.manifest())?,
        input.attempt_id,
        &manifest,
    )?;
    let bytes = json_bytes(&manifest)?;
    match atomic_write_once_run(run_root, &manifest_path, &bytes) {
        Ok(()) => {
            let join = join_candidate(run_root, &dirs, &manifest, &bytes)?;
            Ok((manifest, join))
        }
        Err(error) => {
            // Two reconcilers may finish the same dead attempt concurrently.
            // The winner's timestamp is authoritative; every stable field and
            // content digest must still match before the loser converges.
            let existing_bytes = match read_run_file(run_root, &manifest_path) {
                Ok(bytes) => bytes,
                Err(_) => return Err(error),
            };
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
            validate_manifest_layout(&manifest_path, input.attempt_id, &existing)?;
            verify_manifest_inventory(run_root, &existing)?;
            validate_manifest_evidence(run_root, &existing, Some(input))?;
            let join = join_candidate(run_root, &dirs, &existing, &existing_bytes)?;
            Ok((existing, join))
        }
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
    };
    let (manifest, join) = materialize(&run_root, &packet_dir, &input)?;
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.record_attempt_artifact(join)
    })
    .await?;
    Ok(manifest)
}

fn verify_file(run_root: &Path, file: &ManifestFileV1, issues: &mut Vec<String>) {
    match read_run_file(run_root, &file.path) {
        Err(error) => issues.push(format!(
            "invalid or missing artifact {}: {error}",
            file.path
        )),
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
    let (manifest, _) = match load_manifest(run_root, row) {
        Ok(value) => value,
        Err(error) => {
            return json!({"attemptId": row.attempt_id, "verified": false, "legacy": false,
                "manifestPath": row.manifest_path, "issues": [error.to_string()]});
        }
    };
    let mut issues = Vec::new();
    if let Err(error) = validate_manifest_evidence(run_root, &manifest, None) {
        issues.push(error.to_string());
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
    let tombstone_bytes = read_run_file(run_root, &compaction.tombstone_path)
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
        if let Err(error) = validate_manifest_evidence(run_root, manifest, None) {
            issues.push(error.to_string());
        }
        verify_file(run_root, &manifest.files.result, &mut issues);
        verify_file(run_root, &manifest.files.session, &mut issues);
        let expected = self::tombstone(row, manifest);
        let expected_bytes_removed = expected.removed.iter().try_fold(0i64, |sum, file| {
            i64::try_from(file.bytes)
                .ok()
                .and_then(|bytes| sum.checked_add(bytes))
        });
        if compaction.bytes_removed != expected_bytes_removed {
            issues.push("compaction byte count does not match manifest".to_owned());
        }
        if let Some(tombstone) = &tombstone {
            if tombstone.removed != expected.removed {
                issues.push("compaction tombstone removal set does not match manifest".to_owned());
            }
        }
        for removed in &expected.removed {
            match run_file_exists(run_root, &removed.path) {
                Ok(true) => {
                    issues.push(format!("compacted artifact still exists: {}", removed.path));
                }
                Ok(false) => {}
                Err(error) => issues.push(error.to_string()),
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
    let (manifest, _) = load_manifest(run_root, row)?;
    let output = read_run_file(run_root, &manifest.files.output.path)?;
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
    let bytes = read_run_file(run_root, &row.manifest_path)?;
    if digest(&bytes) != row.manifest_sha256 {
        return Err(Failure::invalid(format!(
            "manifest digest mismatch for attempt {}",
            row.attempt_id
        )));
    }
    let manifest: AttemptArtifactManifestV1 = serde_json::from_slice(&bytes)
        .map_err(|error| Failure::invalid(format!("invalid attempt manifest: {error}")))?;
    check_identity(&manifest, &row.run_id, &row.packet_id, row.attempt_id)?;
    validate_manifest_layout(&row.manifest_path, row.attempt_id, &manifest)?;
    if row.manifest_schema != MANIFEST_SCHEMA
        || row.manifest_schema != manifest.schema
        || row.retention_class != manifest.retention_class.as_str()
    {
        return Err(Failure::invalid(format!(
            "attempt {} manifest metadata does not match ledger join",
            row.attempt_id
        )));
    }
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
            validate_manifest_evidence(&run_root, &manifest, None)?;
            let tombstone = tombstone(&row, &manifest);
            let tombstone_bytes = json_bytes(&tombstone)?;
            let tombstone_path = format!("compactions/{attempt_id}/tombstone.json");
            let tombstone_sha = digest(&tombstone_bytes);
            for file in [&manifest.files.result, &manifest.files.session] {
                let bytes = read_run_file(&run_root, &file.path)?;
                if digest(&bytes) != file.sha256
                    || u64::try_from(bytes.len()).unwrap_or(u64::MAX) != file.bytes
                {
                    return Err(Failure::invalid(format!(
                        "refusing to compact changed artifact {}",
                        file.path
                    )));
                }
            }
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
                    let bytes = read_run_file(&run_root, &file.path)?;
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
            atomic_write_once_run(&run_root, &tombstone_path, &tombstone_bytes)?;
            for file in &tombstone.removed {
                remove_manifest_file(&run_root, file)?;
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
    #[cfg(unix)]
    use std::os::unix::fs::symlink;

    use forged_ledger::{Ledger, NewPacket, NewRun, RunOutcome, SpecFence};
    use forged_types::{Deliverable, ProviderHints, Sandbox, SpecRef, Stage, StageContract};

    use super::*;

    fn packet(root: &Path, run_id: &str, seq: i64) -> WorkPacket {
        WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: format!("{run_id}/implement/{seq}"),
            run_id: run_id.to_owned(),
            work_id: "bead-a".to_owned(),
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
                seat_commands: Vec::new(),
            },
            result_schema: "forged.result.implement/1".to_owned(),
            provider_hints: ProviderHints {
                provider: "claude".to_owned(),
                model: "test-model".to_owned(),
                effort: None,
                sandbox: Sandbox::WorkspaceWrite,
                env: Default::default(),
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
        materialize_prompt(run_root, &dirs, format!("prompt {id}").as_bytes()).unwrap();
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
            },
        )
        .unwrap()
    }

    fn row(join: NewAttemptArtifact) -> AttemptArtifactRow {
        AttemptArtifactRow {
            attempt_id: join.attempt_id,
            run_id: join.run_id,
            packet_id: join.packet_id,
            manifest_schema: join.manifest_schema,
            manifest_path: join.manifest_path,
            manifest_sha256: join.manifest_sha256,
            retention_class: join.retention_class,
            created_at: "now".to_owned(),
        }
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
        std::fs::write(dirs.prompt(), b"prompt").unwrap();
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
        let row = row(join);
        let output = PacketDirs::new(&packet_dir, 4).stdout();
        std::fs::write(&output, "tampered").unwrap();
        let before = read(&output).unwrap();
        assert_eq!(verify_joined(&run_root, &row)["verified"], false);
        assert_eq!(read(&output).unwrap(), before);
    }

    #[test]
    fn recovery_adopts_result_and_session_published_before_the_manifest() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("runs/run-replay");
        std::fs::create_dir_all(&run_root).unwrap();
        let packet_dir = run_root.join("packets/implement/1");
        let packet = packet(root.path(), "run-replay", 1);
        let dirs = PacketDirs::new(&packet_dir, 7);
        prepare_attempt(&run_root, &dirs).unwrap();
        materialize_prompt(&run_root, &dirs, b"original prompt").unwrap();
        std::fs::write(dirs.stdout_working(), b"original output").unwrap();
        finalize_provider_files(&run_root, &dirs).unwrap();

        let original_result = ResultEvidenceV1 {
            schema: RESULT_SCHEMA.to_owned(),
            outcome: "result".to_owned(),
            detail: json!({"answer":"landed before crash"}),
        };
        let original_session = SessionEvidenceV1 {
            schema: SESSION_SCHEMA.to_owned(),
            attempt_id: 7,
            provider_claimant: "claude:session:1".to_owned(),
            metadata: json!({"host":"process", "session":"original"}),
        };
        atomic_write_once_run(
            &run_root,
            &relative(&run_root, &dirs.result()).unwrap(),
            &json_bytes(&original_result).unwrap(),
        )
        .unwrap();
        atomic_write_once_run(
            &run_root,
            &relative(&run_root, &dirs.session()).unwrap(),
            &json_bytes(&original_session).unwrap(),
        )
        .unwrap();
        assert!(
            !dirs.manifest().exists(),
            "the simulated crash precedes manifest publish"
        );

        let (manifest, _) = materialize(
            &run_root,
            &packet_dir,
            &MaterializeAttempt {
                run_id: &packet.run_id,
                packet: &packet,
                attempt_id: 7,
                claimant: "claude:session:1",
                started_at: "2026-08-14T00:00:00Z",
                outcome: "revoked",
                detail: &json!({"reason":"reconciler arrived after crash"}),
                session: &json!({"recovered":true}),
            },
        )
        .unwrap();
        assert_eq!(manifest.retention_class, RetentionClass::CompactableSuccess);
        assert_eq!(
            parse_result(&read_run_file(&run_root, &manifest.files.result.path).unwrap()).unwrap(),
            original_result
        );
        assert_eq!(
            parse_session(
                &read_run_file(&run_root, &manifest.files.session.path).unwrap(),
                7,
            )
            .unwrap(),
            original_session
        );

        // Replaying the same recovery converges on the manifest instead of
        // conflicting with the already-published original result/session.
        materialize(
            &run_root,
            &packet_dir,
            &MaterializeAttempt {
                run_id: &packet.run_id,
                packet: &packet,
                attempt_id: 7,
                claimant: "claude:session:1",
                started_at: "2026-08-14T00:00:00Z",
                outcome: "revoked",
                detail: &json!({"reason":"replay"}),
                session: &json!({"recovered":true}),
            },
        )
        .unwrap();
    }

    #[test]
    fn existing_manifest_rejects_absolute_parent_and_wrong_slot_paths() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("runs/run-hostile");
        let packet_dir = run_root.join("packets/implement/1");
        let packet = packet(root.path(), "run-hostile", 1);
        let (valid, join) = one(&run_root, &packet_dir, &packet, 8, "captured");
        let dirs = PacketDirs::new(&packet_dir, 8);
        let victim = root.path().join("victim");
        std::fs::write(&victim, b"outside must remain untouched").unwrap();
        let input = MaterializeAttempt {
            run_id: &packet.run_id,
            packet: &packet,
            attempt_id: 8,
            claimant: "claude:session:1",
            started_at: "2026-08-14T00:00:00Z",
            outcome: "revoked",
            detail: &json!({}),
            session: &json!({}),
        };

        for hostile in [
            victim.to_string_lossy().into_owned(),
            "../victim".to_owned(),
        ] {
            let mut manifest = valid.clone();
            manifest.files.output.path = hostile;
            std::fs::write(dirs.manifest(), json_bytes(&manifest).unwrap()).unwrap();
            assert!(materialize(&run_root, &packet_dir, &input).is_err());
            assert_eq!(
                std::fs::read(&victim).unwrap(),
                b"outside must remain untouched"
            );
        }

        let mut hostile_row = row(join);
        hostile_row.manifest_path = victim.to_string_lossy().into_owned();
        assert_eq!(verify_joined(&run_root, &hostile_row)["verified"], false);
        hostile_row.manifest_path = "../manifest.json".to_owned();
        assert_eq!(verify_joined(&run_root, &hostile_row)["verified"], false);
    }

    #[cfg(unix)]
    #[test]
    fn symlinked_artifact_and_attempt_parent_are_never_followed() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("runs/run-links");
        let packet_dir = run_root.join("packets/implement/1");
        let packet = packet(root.path(), "run-links", 1);
        let (_, join) = one(&run_root, &packet_dir, &packet, 9, "captured");
        let row = row(join);
        let dirs = PacketDirs::new(&packet_dir, 9);
        let victim = root.path().join("outside-output");
        std::fs::write(&victim, b"captured").unwrap();
        std::fs::remove_file(dirs.stdout()).unwrap();
        symlink(&victim, dirs.stdout()).unwrap();

        assert_eq!(verify_joined(&run_root, &row)["verified"], false);
        assert!(manifest_output(&run_root, &row).is_err());
        assert_eq!(std::fs::read(&victim).unwrap(), b"captured");

        std::fs::remove_file(dirs.stdout()).unwrap();
        let moved = root.path().join("moved-attempt");
        std::fs::rename(dirs.path(), &moved).unwrap();
        symlink(&moved, dirs.path()).unwrap();
        assert_eq!(verify_joined(&run_root, &row)["verified"], false);
        assert!(moved.join("manifest.json").exists());
    }

    #[cfg(unix)]
    #[test]
    fn held_parent_fd_cannot_be_redirected_by_path_replacement() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("run");
        let inside = run_root.join("inside");
        let outside = root.path().join("outside");
        std::fs::create_dir_all(&inside).unwrap();
        std::fs::create_dir_all(&outside).unwrap();
        std::fs::write(inside.join("file"), b"inside").unwrap();
        std::fs::write(outside.join("file"), b"outside").unwrap();
        let (held, leaf) = anchored_parent(&run_root, "inside/file", false).unwrap();
        let renamed = run_root.join("renamed");
        std::fs::rename(&inside, &renamed).unwrap();
        symlink(&outside, &inside).unwrap();

        unlinkat(&held, Path::new(&leaf), UnlinkatFlags::NoRemoveDir).unwrap();
        assert!(!renamed.join("file").exists());
        assert_eq!(std::fs::read(outside.join("file")).unwrap(), b"outside");
    }

    #[test]
    fn unsafe_path_component_prevents_manifest_publication() {
        let root = tempfile::tempdir().unwrap();
        let run_root = root.path().join("runs");
        let packet_dir = run_root.join("run bad/packets/implement/1");
        let packet = packet(root.path(), "run-safe", 1);
        let dirs = PacketDirs::new(&packet_dir, 5);
        std::fs::create_dir_all(dirs.path()).unwrap();
        std::fs::write(dirs.prompt(), b"prompt").unwrap();
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
            config_path_override: None,
            config_file_read: false,
            config_sha256: None,
            roster: HashMap::new(),
            profiles: BTreeMap::new(),
            rosters: BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            seat_commands: Vec::new(),
            deadline_retry_budget: 1,
            seat_env: Default::default(),
            transport_patterns: Vec::new(),
            provider_transport_patterns: Default::default(),
            bd_path: root.join("bd"),
            beads_dir: root.join("beads"),
            codex_home: root.join("codex"),
            host_policy: crate::config::HostPolicy::Off,
            herdr_sock: None,
            pricing: crate::pricing::default_rate_card(),
            admission: crate::config::AdmissionPolicy::default(),
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
                policy_revision: None,
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
        materialize_prompt(
            &ctx.config.run_dir(run_id),
            &dirs,
            format!("prompt {seq}").as_bytes(),
        )
        .unwrap();
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

    async fn compactable_context(root: &Path, run_id: &str) -> (Ctx, i64, i64) {
        let ledger = Ledger::open(&root.join("state.db")).unwrap();
        ledger
            .create_run(NewRun {
                run_id: forged_types::RunId::new(run_id).unwrap(),
                work_id: format!("bead-{run_id}"),
                repo: "/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: format!("forged/{run_id}"),
            })
            .unwrap();
        let ctx = Ctx {
            config: config(root),
            ledger,
        };
        let first = successful_attempt(&ctx, run_id, 1).await;
        let final_attempt = successful_attempt(&ctx, run_id, 2).await;
        ctx.ledger
            .settle_run(
                run_id,
                RunOutcome::Clean,
                "test completed".to_owned(),
                None,
                None,
                None,
            )
            .unwrap();
        (ctx, first, final_attempt)
    }

    #[tokio::test]
    async fn explicit_compaction_removes_only_an_intermediate_success() {
        let root = tempfile::tempdir().unwrap();
        let (ctx, first, final_attempt) = compactable_context(root.path(), "run-compact").await;

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

        let row = ctx.ledger.get_attempt_artifact(first).unwrap().unwrap();
        let compaction = ctx
            .ledger
            .get_attempt_artifact_compaction(first)
            .unwrap()
            .unwrap();
        let mut wrong_bytes = compaction.clone();
        wrong_bytes.bytes_removed = wrong_bytes.bytes_removed.map(|bytes| bytes + 1);
        assert_eq!(
            verify_compacted(&ctx.config.run_dir("run-compact"), &row, &wrong_bytes)["verified"],
            false
        );
        let mut wrong_retention = row.clone();
        wrong_retention.retention_class = "retain".to_owned();
        assert_eq!(
            verify_compacted(
                &ctx.config.run_dir("run-compact"),
                &wrong_retention,
                &compaction,
            )["verified"],
            false
        );

        #[cfg(unix)]
        {
            let victim = root.path().join("compacted-victim");
            std::fs::write(&victim, b"outside").unwrap();
            symlink(&victim, first_dirs.prompt()).unwrap();
            let linked = artifact_verify(&ctx, &verify_request).await;
            assert_eq!(linked.result.as_ref().unwrap()["verified"], false);
            assert_eq!(std::fs::read(&victim).unwrap(), b"outside");
        }

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

    #[cfg(unix)]
    #[tokio::test]
    async fn compaction_refuses_symlinked_sources_before_intent() {
        let root = tempfile::tempdir().unwrap();
        let (ctx, first, _) = compactable_context(root.path(), "run-source-link").await;
        let dirs = PacketDirs::new(
            ctx.config.packet_dir_key("run-source-link", "implement", 1),
            first,
        );
        let original_prompt = std::fs::read(dirs.prompt()).unwrap();
        let victim = root.path().join("source-victim");
        std::fs::write(&victim, &original_prompt).unwrap();
        std::fs::remove_file(dirs.prompt()).unwrap();
        symlink(&victim, dirs.prompt()).unwrap();

        let mut request = OperationRequest {
            schema_version: 1,
            idempotency_key: "compact:source-link".to_owned(),
            run_id: None,
            params: json!({"attempt": first}).as_object().unwrap().clone(),
        };
        let refused = artifact_compact(&ctx, &mut request).await;
        assert!(
            !refused.ok,
            "symlinked source must fail closed: {refused:?}"
        );
        assert!(ctx
            .ledger
            .get_attempt_artifact_compaction(first)
            .unwrap()
            .is_none());
        assert_eq!(std::fs::read(&victim).unwrap(), original_prompt);
        assert!(std::fs::symlink_metadata(dirs.prompt())
            .unwrap()
            .file_type()
            .is_symlink());
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn compaction_tombstone_cannot_escape_through_a_symlinked_parent() {
        let root = tempfile::tempdir().unwrap();
        let (ctx, first, _) = compactable_context(root.path(), "run-tombstone-link").await;
        let outside = root.path().join("outside-compactions");
        std::fs::create_dir_all(&outside).unwrap();
        symlink(
            &outside,
            ctx.config.run_dir("run-tombstone-link").join("compactions"),
        )
        .unwrap();

        let mut request = OperationRequest {
            schema_version: 1,
            idempotency_key: "compact:tombstone-link".to_owned(),
            run_id: None,
            params: json!({"attempt": first}).as_object().unwrap().clone(),
        };
        let refused = artifact_compact(&ctx, &mut request).await;
        assert!(
            !refused.ok,
            "symlinked tombstone parent must fail: {refused:?}"
        );
        assert!(!outside
            .join(first.to_string())
            .join("tombstone.json")
            .exists());
        let intent = ctx
            .ledger
            .get_attempt_artifact_compaction(first)
            .unwrap()
            .expect("source validation completed before durable intent");
        assert_eq!(intent.state, "in-progress");
    }

    #[tokio::test]
    async fn compaction_resumes_after_intent_and_partial_removal() {
        let root = tempfile::tempdir().unwrap();
        let (ctx, first, _) = compactable_context(root.path(), "run-compact-resume").await;
        let row = ctx.ledger.get_attempt_artifact(first).unwrap().unwrap();
        let run_root = ctx.config.run_dir("run-compact-resume");
        let (manifest, _) = load_manifest(&run_root, &row).unwrap();
        let evidence = tombstone(&row, &manifest);
        let bytes = json_bytes(&evidence).unwrap();
        let path = format!("compactions/{first}/tombstone.json");
        ctx.ledger
            .begin_attempt_artifact_compaction(first, "op:interrupted", &path, &digest(&bytes))
            .unwrap();
        std::fs::remove_file(run_root.join(&manifest.files.prompt.path)).unwrap();

        let mut request = OperationRequest {
            schema_version: 1,
            idempotency_key: "compact:resume".to_owned(),
            run_id: None,
            params: json!({"attempt": first}).as_object().unwrap().clone(),
        };
        let resumed = artifact_compact(&ctx, &mut request).await;
        assert!(resumed.ok, "partial compaction should resume: {resumed:?}");
        let verify = OperationRequest {
            schema_version: 1,
            idempotency_key: String::new(),
            run_id: None,
            params: json!({"attempt": first}).as_object().unwrap().clone(),
        };
        let verified = artifact_verify(&ctx, &verify).await;
        assert_eq!(verified.result.as_ref().unwrap()["verified"], true);
    }
}
