//! Operator-scoped installation and observation of the long-running supervisor.
//!
//! Runtime state is deliberately machine-local.  Execution truth remains in
//! the ledger; this module only records which immutable executable launchd is
//! running and the health of that scheduler process.

use std::collections::BTreeMap;
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::os::unix::fs::{symlink, OpenOptionsExt, PermissionsExt};
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::OnceLock;
use std::time::{Duration, Instant};

use async_trait::async_trait;
use fs2::FileExt;
use nix::errno::Errno;
use nix::sys::signal::kill;
use nix::unistd::Pid;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
#[cfg(target_os = "macos")]
use tokio::process::Command;
use uuid::Uuid;

use crate::cli::ServiceCmd;
use crate::config::{now_iso, ForgedConfig};
use crate::core::{derive_key, err_response, ok_response, Failure};
use forged_types::{ErrorCode, OperationResponse};

pub(crate) const CONTROLLER_RUNTIME_ABI: &str = "forged.controller-runtime/1";
const MANIFEST_SCHEMA: &str = "forged.runtime-manifest/1";
const TRANSITION_SCHEMA: &str = "forged.runtime-transition/1";
const SUPERVISOR_STATUS_SCHEMA: &str = "forged.supervisor-status/1";
const RUNTIME_STATUS_SCHEMA: &str = "forged.runtime-status/1";
const RUNTIME_OPERATION_SCHEMA: &str = "forged.runtime-operation/1";
const READY_TIMEOUT: Duration = Duration::from_secs(15);
const STATUS_STALE_AFTER: Duration = Duration::from_secs(20);

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct BinaryIdentity {
    pub path: String,
    pub version: String,
    pub sha256: String,
    pub runtime_abi: String,
}

pub(crate) fn binary_identity(path: &Path) -> Result<BinaryIdentity, Failure> {
    let mut file = File::open(path)
        .map_err(|error| Failure::internal(format!("opening forged executable: {error}")))?;
    let metadata = file
        .metadata()
        .map_err(|error| Failure::internal(format!("stat forged executable: {error}")))?;
    if !metadata.is_file() {
        return Err(Failure::invalid(format!(
            "forged executable is not a regular file: {}",
            path.display()
        )));
    }
    let mut digest = Sha256::new();
    let mut buf = [0u8; 64 * 1024];
    loop {
        let read = file
            .read(&mut buf)
            .map_err(|error| Failure::internal(format!("hashing forged executable: {error}")))?;
        if read == 0 {
            break;
        }
        digest.update(&buf[..read]);
    }
    Ok(BinaryIdentity {
        path: path.to_string_lossy().into_owned(),
        version: env!("CARGO_PKG_VERSION").to_owned(),
        sha256: hex_digest(digest.finalize()),
        runtime_abi: CONTROLLER_RUNTIME_ABI.to_owned(),
    })
}

fn hex_digest(bytes: impl AsRef<[u8]>) -> String {
    bytes
        .as_ref()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

pub(crate) fn current_binary_identity() -> Result<BinaryIdentity, Failure> {
    static IDENTITY: OnceLock<Result<BinaryIdentity, String>> = OnceLock::new();
    IDENTITY
        .get_or_init(|| {
            let path = std::env::current_exe()
                .map_err(|error| format!("resolving forged executable: {error}"))?;
            binary_identity(&path).map_err(|failure| failure.message)
        })
        .clone()
        .map_err(Failure::internal)
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimeManifest {
    schema: String,
    generation: String,
    label: String,
    domain: String,
    binary: BinaryIdentity,
    anvil_home: String,
    config_path: String,
    beads_dir: String,
    plist_path: String,
    installed_at: String,
}

impl RuntimeManifest {
    fn validate(&self) -> Result<(), Failure> {
        if self.schema != MANIFEST_SCHEMA {
            return Err(Failure::internal(format!(
                "unknown runtime manifest schema {:?}",
                self.schema
            )));
        }
        validate_generation(&self.generation)?;
        validate_runtime_abi(&self.binary.runtime_abi)?;
        validate_sha256(&self.binary.sha256)?;
        for (name, value) in [
            ("binary.path", self.binary.path.as_str()),
            ("anvilHome", self.anvil_home.as_str()),
            ("configPath", self.config_path.as_str()),
            ("beadsDir", self.beads_dir.as_str()),
            ("plistPath", self.plist_path.as_str()),
        ] {
            if !Path::new(value).is_absolute() {
                return Err(Failure::internal(format!(
                    "runtime manifest {name} is not absolute: {value:?}"
                )));
            }
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum TransitionKind {
    Install,
    Upgrade,
    Uninstall,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum TransitionPhase {
    Staged,
    PriorStopped,
    Switched,
    Started,
    RolledBack,
    Complete,
}

impl TransitionPhase {
    fn terminal(self) -> bool {
        matches!(self, Self::RolledBack | Self::Complete)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimeTransition {
    schema: String,
    id: String,
    kind: TransitionKind,
    phase: TransitionPhase,
    previous: Option<RuntimeManifest>,
    previous_loaded: bool,
    candidate: Option<RuntimeManifest>,
    started_at: String,
    updated_at: String,
    error: Option<String>,
}

const OPERATION_RECEIPT_SCHEMA: &str = "forged.runtime-operation-receipt/1";

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum OperationReceiptState {
    InProgress,
    Complete,
}

const CONTROLLER_ADMISSION_SCHEMA: &str = "forged.controller-admission/1";

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum ControllerAdmissionState {
    Preparing,
    Spawned,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ControllerAdmissionRecord {
    schema: String,
    id: String,
    generation: u32,
    runtime_abi: String,
    binary_sha256: String,
    state: ControllerAdmissionState,
    pid: Option<i32>,
    process_started_at: Option<String>,
    created_at: String,
    updated_at: String,
}

impl ControllerAdmissionRecord {
    fn validate(&self) -> Result<(), Failure> {
        if self.schema != CONTROLLER_ADMISSION_SCHEMA || self.id.is_empty() || self.generation == 0
        {
            return Err(Failure::internal("invalid controller admission identity"));
        }
        validate_runtime_abi(&self.runtime_abi)?;
        validate_sha256(&self.binary_sha256)?;
        if self.state == ControllerAdmissionState::Spawned
            && (self.pid.is_none() || self.process_started_at.is_none())
        {
            return Err(Failure::internal(
                "spawned controller admission lacks process identity",
            ));
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OperationReceipt {
    schema: String,
    key: String,
    operation: String,
    fingerprint: String,
    state: OperationReceiptState,
    response: Option<OperationResponse>,
    started_at: String,
    updated_at: String,
}

impl OperationReceipt {
    fn validate(&self) -> Result<(), Failure> {
        if self.schema != OPERATION_RECEIPT_SCHEMA
            || self.key.is_empty()
            || self.operation.is_empty()
        {
            return Err(Failure::internal(
                "invalid service operation receipt identity",
            ));
        }
        validate_sha256(&self.fingerprint)?;
        if (self.state == OperationReceiptState::Complete) != self.response.is_some() {
            return Err(Failure::internal(
                "service operation receipt state/response mismatch",
            ));
        }
        Ok(())
    }
}

impl RuntimeTransition {
    fn validate(&self) -> Result<(), Failure> {
        if self.schema != TRANSITION_SCHEMA {
            return Err(Failure::internal(format!(
                "unknown runtime transition schema {:?}",
                self.schema
            )));
        }
        validate_generation(&self.id)?;
        if let Some(manifest) = &self.previous {
            manifest.validate()?;
        }
        if let Some(manifest) = &self.candidate {
            manifest.validate()?;
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum SupervisorProcessState {
    Starting,
    Running,
    Degraded,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct SupervisorStatus {
    schema: String,
    generation: String,
    session: String,
    binary: BinaryIdentity,
    pid: i32,
    process_started_at: String,
    state: SupervisorProcessState,
    started_at: String,
    updated_at: String,
    stopped_at: Option<String>,
    stop_reason: Option<String>,
    ticks: u64,
    last_tick_at: Option<String>,
    last_successful_tick_at: Option<String>,
    next_wake_at: Option<String>,
    last_tick_id: Option<String>,
    last_error: Option<String>,
}

impl SupervisorStatus {
    fn validate(&self) -> Result<(), Failure> {
        if self.schema != SUPERVISOR_STATUS_SCHEMA {
            return Err(Failure::internal(format!(
                "unknown supervisor status schema {:?}",
                self.schema
            )));
        }
        validate_generation(&self.generation)?;
        validate_generation(&self.session)?;
        validate_sha256(&self.binary.sha256)?;
        validate_runtime_abi(&self.binary.runtime_abi)?;
        Ok(())
    }
}

#[derive(Debug, Clone)]
struct RuntimePaths {
    root: PathBuf,
    bin: PathBuf,
    manifest: PathBuf,
    current: PathBuf,
    transitions: PathBuf,
    operations: PathBuf,
    generations: PathBuf,
    logs: PathBuf,
    lock: PathBuf,
    plist: PathBuf,
    label: String,
    domain: String,
}

impl RuntimePaths {
    fn from_config(config: &ForgedConfig) -> Result<Self, Failure> {
        let home = std::env::var_os("HOME")
            .map(PathBuf::from)
            .ok_or_else(|| Failure::invalid("HOME is required for a macOS LaunchAgent"))?;
        Self::new(&config.anvil_home, &home, effective_uid()?)
    }

    fn new(anvil_home: &Path, home: &Path, uid: u32) -> Result<Self, Failure> {
        if !anvil_home.is_absolute() || !home.is_absolute() {
            return Err(Failure::invalid(
                "ANVIL_HOME and HOME must be absolute for service installation",
            ));
        }
        let canonical = canonicalize_anchor(anvil_home)?;
        let canonical_home = canonicalize_anchor(home)?;
        reject_symlink_chain(&canonical)?;
        reject_symlink_chain(&canonical_home)?;
        let digest = Sha256::digest(canonical.to_string_lossy().as_bytes());
        let suffix = hex_digest(digest);
        let label = format!("dev.forged.supervisor.{}", &suffix[..12]);
        let root = canonical.join("runtime");
        Ok(Self {
            bin: root.join("bin"),
            manifest: root.join("manifest.json"),
            current: root.join("current"),
            transitions: root.join("transitions"),
            operations: root.join("operations"),
            generations: root.join("generations"),
            logs: root.join("logs"),
            lock: root.join("service.lock"),
            plist: canonical_home
                .join("Library/LaunchAgents")
                .join(format!("{label}.plist")),
            label,
            domain: format!("gui/{uid}"),
            root,
        })
    }

    fn target(&self) -> String {
        format!("{}/{}", self.domain, self.label)
    }

    fn binary_path(&self, sha256: &str) -> PathBuf {
        self.bin.join(sha256).join("forged")
    }

    fn transition_path(&self, id: &str) -> PathBuf {
        self.transitions.join(format!("{id}.json"))
    }

    fn operation_path(&self, key: &str) -> PathBuf {
        let digest = hex_digest(Sha256::digest(key.as_bytes()));
        self.operations.join(format!("{digest}.json"))
    }

    fn status_dir(&self, generation: &str, session: &str) -> PathBuf {
        self.generations
            .join(generation)
            .join("sessions")
            .join(session)
    }

    fn ensure_layout(&self) -> Result<(), Failure> {
        for dir in [
            &self.root,
            &self.bin,
            &self.transitions,
            &self.operations,
            &self.generations,
            &self.logs,
        ] {
            ensure_private_dir(dir)?;
        }
        let plist_parent = self
            .plist
            .parent()
            .ok_or_else(|| Failure::internal("LaunchAgent plist has no parent"))?;
        ensure_private_dir(plist_parent)?;
        Ok(())
    }
}

fn effective_uid() -> Result<u32, Failure> {
    if let Ok(value) = std::env::var("UID") {
        if let Ok(uid) = value.parse::<u32>() {
            return Ok(uid);
        }
    }
    let output = std::process::Command::new("/usr/bin/id")
        .arg("-u")
        .stdin(Stdio::null())
        .output()
        .map_err(|error| Failure::internal(format!("resolving effective uid: {error}")))?;
    if !output.status.success() {
        return Err(Failure::internal("/usr/bin/id -u failed"));
    }
    String::from_utf8_lossy(&output.stdout)
        .trim()
        .parse::<u32>()
        .map_err(|error| Failure::internal(format!("parsing effective uid: {error}")))
}

fn validate_generation(value: &str) -> Result<(), Failure> {
    let parsed = Uuid::parse_str(value)
        .map_err(|_| Failure::internal(format!("invalid runtime generation {value:?}")))?;
    if parsed.to_string() != value {
        return Err(Failure::internal(format!(
            "non-canonical runtime generation {value:?}"
        )));
    }
    Ok(())
}

fn validate_sha256(value: &str) -> Result<(), Failure> {
    if value.len() != 64
        || !value
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
    {
        return Err(Failure::internal(format!(
            "invalid lowercase SHA-256 {value:?}"
        )));
    }
    Ok(())
}

fn validate_runtime_abi(value: &str) -> Result<(), Failure> {
    let Some(version) = value.strip_prefix("forged.controller-runtime/") else {
        return Err(Failure::internal(format!(
            "invalid controller runtime ABI {value:?}"
        )));
    };
    let parsed = version
        .parse::<u32>()
        .map_err(|_| Failure::internal(format!("invalid controller runtime ABI {value:?}")))?;
    if parsed.to_string() != version {
        return Err(Failure::internal(format!(
            "non-canonical controller runtime ABI {value:?}"
        )));
    }
    Ok(())
}

fn canonicalize_anchor(path: &Path) -> Result<PathBuf, Failure> {
    if !path.is_absolute() {
        return Err(Failure::invalid(format!(
            "runtime path must be absolute: {}",
            path.display()
        )));
    }
    let mut existing = path;
    while !existing.exists() {
        existing = existing.parent().ok_or_else(|| {
            Failure::invalid(format!(
                "runtime path has no existing anchor: {}",
                path.display()
            ))
        })?;
    }
    let canonical = fs::canonicalize(existing)
        .map_err(|error| Failure::invalid(format!("resolving {}: {error}", existing.display())))?;
    let suffix = path.strip_prefix(existing).map_err(|error| {
        Failure::internal(format!("resolving suffix for {}: {error}", path.display()))
    })?;
    if suffix.as_os_str().is_empty() {
        Ok(canonical)
    } else {
        Ok(canonical.join(suffix))
    }
}

fn reject_symlink_ancestors(path: &Path) -> Result<(), Failure> {
    let parent = path.parent().ok_or_else(|| {
        Failure::invalid(format!("runtime path has no parent: {}", path.display()))
    })?;
    reject_symlink_chain(parent)
}

fn reject_symlink_chain(path: &Path) -> Result<(), Failure> {
    if !path.is_absolute() {
        return Err(Failure::invalid(format!(
            "runtime path must be absolute: {}",
            path.display()
        )));
    }
    let mut current = PathBuf::new();
    for component in path.components() {
        current.push(component.as_os_str());
        match fs::symlink_metadata(&current) {
            Ok(metadata) if metadata.file_type().is_symlink() => {
                return Err(Failure::internal(format!(
                    "refusing symlink in runtime path chain: {}",
                    current.display()
                )))
            }
            Ok(_) => {}
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => break,
            Err(error) => {
                return Err(Failure::internal(format!(
                    "inspecting {}: {error}",
                    current.display()
                )))
            }
        }
    }
    Ok(())
}

fn ensure_private_dir(path: &Path) -> Result<(), Failure> {
    reject_symlink_chain(path)?;
    fs::create_dir_all(path)
        .map_err(|error| Failure::internal(format!("creating {}: {error}", path.display())))?;
    reject_symlink_chain(path)?;
    fs::set_permissions(path, fs::Permissions::from_mode(0o700)).map_err(|error| {
        Failure::internal(format!(
            "setting permissions on {}: {error}",
            path.display()
        ))
    })
}

fn sync_parent(path: &Path) -> Result<(), Failure> {
    let parent = path
        .parent()
        .ok_or_else(|| Failure::internal(format!("{} has no parent", path.display())))?;
    reject_symlink_chain(parent)?;
    File::open(parent)
        .and_then(|file| file.sync_all())
        .map_err(|error| Failure::internal(format!("syncing {}: {error}", parent.display())))
}

fn atomic_write(path: &Path, bytes: &[u8], mode: u32) -> Result<(), Failure> {
    reject_symlink_chain(path)?;
    let parent = path
        .parent()
        .ok_or_else(|| Failure::internal(format!("{} has no parent", path.display())))?;
    reject_symlink_chain(parent)?;
    let tmp = parent.join(format!(
        ".{}.{}.tmp",
        path.file_name().unwrap_or_default().to_string_lossy(),
        Uuid::now_v7()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(mode)
        .open(&tmp)
        .map_err(|error| Failure::internal(format!("creating {}: {error}", tmp.display())))?;
    let result = (|| {
        file.write_all(bytes)?;
        file.sync_all()?;
        fs::set_permissions(&tmp, fs::Permissions::from_mode(mode))?;
        fs::rename(&tmp, path)?;
        Ok::<(), std::io::Error>(())
    })();
    if let Err(error) = result {
        let _ = fs::remove_file(&tmp);
        return Err(Failure::internal(format!(
            "atomically writing {}: {error}",
            path.display()
        )));
    }
    sync_parent(path)
}

fn atomic_json<T: Serialize>(path: &Path, value: &T) -> Result<(), Failure> {
    let bytes = serde_json::to_vec_pretty(value)
        .map_err(|error| Failure::internal(format!("serializing {}: {error}", path.display())))?;
    atomic_write(path, &bytes, 0o600)
}

fn read_json<T: for<'de> Deserialize<'de>>(path: &Path) -> Result<Option<T>, Failure> {
    reject_symlink_chain(path)?;
    match fs::read(path) {
        Ok(bytes) => serde_json::from_slice(&bytes)
            .map(Some)
            .map_err(|error| Failure::internal(format!("parsing {}: {error}", path.display()))),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(Failure::internal(format!(
            "reading {}: {error}",
            path.display()
        ))),
    }
}

fn read_manifest(paths: &RuntimePaths) -> Result<Option<RuntimeManifest>, Failure> {
    let manifest: Option<RuntimeManifest> = read_json(&paths.manifest)?;
    if let Some(value) = &manifest {
        value.validate()?;
        if value.label != paths.label
            || value.domain != paths.domain
            || Path::new(&value.plist_path) != paths.plist
            || Path::new(&value.binary.path) != paths.binary_path(&value.binary.sha256)
            || Path::new(&value.anvil_home) != paths.root.parent().expect("runtime root parent")
        {
            return Err(Failure::internal(
                "runtime manifest authority paths do not match this HOME/ANVIL_HOME and content digest",
            ));
        }
    }
    Ok(manifest)
}

fn write_transition(paths: &RuntimePaths, value: &RuntimeTransition) -> Result<(), Failure> {
    value.validate()?;
    for manifest in value.previous.iter().chain(value.candidate.iter()) {
        validate_manifest_paths(paths, manifest)?;
    }
    atomic_json(&paths.transition_path(&value.id), value)
}

fn validate_manifest_paths(
    paths: &RuntimePaths,
    manifest: &RuntimeManifest,
) -> Result<(), Failure> {
    manifest.validate()?;
    if manifest.label != paths.label
        || manifest.domain != paths.domain
        || Path::new(&manifest.plist_path) != paths.plist
        || Path::new(&manifest.binary.path) != paths.binary_path(&manifest.binary.sha256)
        || Path::new(&manifest.anvil_home)
            != paths.root.parent().expect("runtime root always has parent")
    {
        return Err(Failure::internal(
            "runtime manifest authority paths do not match runtime paths",
        ));
    }
    Ok(())
}

fn read_operation_receipt(
    paths: &RuntimePaths,
    key: &str,
) -> Result<Option<OperationReceipt>, Failure> {
    let receipt: Option<OperationReceipt> = read_json(&paths.operation_path(key))?;
    if let Some(value) = &receipt {
        value.validate()?;
        if value.key != key {
            return Err(Failure::internal(
                "service operation receipt hash/key mismatch",
            ));
        }
    }
    Ok(receipt)
}

fn write_operation_receipt(
    paths: &RuntimePaths,
    receipt: &OperationReceipt,
) -> Result<(), Failure> {
    receipt.validate()?;
    atomic_json(&paths.operation_path(&receipt.key), receipt)
}

fn unresolved_transitions(paths: &RuntimePaths) -> Result<Vec<RuntimeTransition>, Failure> {
    if !paths.transitions.exists() {
        return Ok(Vec::new());
    }
    let mut values = Vec::new();
    for entry in fs::read_dir(&paths.transitions).map_err(|error| {
        Failure::internal(format!("reading {}: {error}", paths.transitions.display()))
    })? {
        let entry =
            entry.map_err(|error| Failure::internal(format!("reading transition: {error}")))?;
        if entry.path().extension().and_then(|value| value.to_str()) != Some("json") {
            continue;
        }
        let Some(value): Option<RuntimeTransition> = read_json(&entry.path())? else {
            continue;
        };
        value.validate()?;
        for manifest in value.previous.iter().chain(value.candidate.iter()) {
            validate_manifest_paths(paths, manifest)?;
        }
        if !value.phase.terminal() {
            values.push(value);
        }
    }
    values.sort_by(|left, right| left.started_at.cmp(&right.started_at));
    Ok(values)
}

fn copy_content_addressed(
    paths: &RuntimePaths,
    source: &Path,
    identity: &BinaryIdentity,
) -> Result<PathBuf, Failure> {
    let target = paths.binary_path(&identity.sha256);
    if target.exists() {
        reject_symlink_chain(&target)?;
        let observed = binary_identity(&target)?;
        if observed.sha256 != identity.sha256 {
            return Err(Failure::internal(format!(
                "content-addressed binary {} has digest {}, expected {}",
                target.display(),
                observed.sha256,
                identity.sha256
            )));
        }
        return Ok(target);
    }
    let parent = target
        .parent()
        .ok_or_else(|| Failure::internal("binary target has no parent"))?;
    ensure_private_dir(parent)?;
    let tmp = parent.join(format!(".forged.{}.tmp", Uuid::now_v7()));
    let mut input = File::open(source)
        .map_err(|error| Failure::internal(format!("opening {}: {error}", source.display())))?;
    let mut output = OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o700)
        .open(&tmp)
        .map_err(|error| Failure::internal(format!("creating {}: {error}", tmp.display())))?;
    let copy_result = std::io::copy(&mut input, &mut output)
        .and_then(|_| output.sync_all())
        .and_then(|_| fs::set_permissions(&tmp, fs::Permissions::from_mode(0o700)));
    if let Err(error) = copy_result {
        let _ = fs::remove_file(&tmp);
        return Err(Failure::internal(format!(
            "staging {}: {error}",
            target.display()
        )));
    }
    let observed = binary_identity(&tmp)?;
    if observed.sha256 != identity.sha256 {
        let _ = fs::remove_file(&tmp);
        return Err(Failure::internal(format!(
            "staged binary digest {} does not match {}",
            observed.sha256, identity.sha256
        )));
    }
    publish_content_addressed(&tmp, &target, identity)?;
    sync_parent(&target)?;
    Ok(target)
}

fn publish_content_addressed(
    staged: &Path,
    target: &Path,
    identity: &BinaryIdentity,
) -> Result<(), Failure> {
    match fs::hard_link(staged, target) {
        Ok(()) => {
            fs::remove_file(staged).map_err(|error| {
                Failure::internal(format!(
                    "removing staged binary {}: {error}",
                    staged.display()
                ))
            })?;
        }
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
            let _ = fs::remove_file(staged);
            reject_symlink_chain(target)?;
            let winner = binary_identity(target)?;
            if winner.sha256 != identity.sha256 {
                return Err(Failure::internal(format!(
                    "content-addressed publish race produced digest {}, expected {} at {}",
                    winner.sha256,
                    identity.sha256,
                    target.display(),
                )));
            }
        }
        Err(error) => {
            let _ = fs::remove_file(staged);
            return Err(Failure::internal(format!(
                "publishing {} without replacement: {error}",
                target.display()
            )));
        }
    }
    Ok(())
}

fn switch_current(paths: &RuntimePaths, target: &Path) -> Result<(), Failure> {
    reject_symlink_chain(&paths.root)?;
    reject_symlink_chain(target)?;
    match fs::symlink_metadata(&paths.current) {
        Ok(metadata) if !metadata.file_type().is_symlink() => {
            return Err(Failure::internal(format!(
                "refusing to replace non-symlink {}",
                paths.current.display()
            )))
        }
        Ok(_) | Err(_) => {}
    }
    let tmp = paths.root.join(format!(".current.{}.tmp", Uuid::now_v7()));
    symlink(target, &tmp).map_err(|error| {
        Failure::internal(format!("creating current runtime projection: {error}"))
    })?;
    if let Err(error) = fs::rename(&tmp, &paths.current) {
        let _ = fs::remove_file(&tmp);
        return Err(Failure::internal(format!(
            "switching current runtime projection: {error}"
        )));
    }
    sync_parent(&paths.current)
}

fn remove_if_present(path: &Path) -> Result<(), Failure> {
    reject_symlink_chain(path)?;
    match fs::remove_file(path) {
        Ok(()) => sync_parent(path),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(Failure::internal(format!(
            "removing {}: {error}",
            path.display()
        ))),
    }
}

fn remove_current_projection(paths: &RuntimePaths) -> Result<(), Failure> {
    reject_symlink_ancestors(&paths.current)?;
    match fs::symlink_metadata(&paths.current) {
        Ok(metadata) if metadata.file_type().is_symlink() => {
            fs::remove_file(&paths.current).map_err(|error| {
                Failure::internal(format!("removing {}: {error}", paths.current.display()))
            })?;
            sync_parent(&paths.current)
        }
        Ok(_) => Err(Failure::internal(format!(
            "refusing to remove non-symlink current projection {}",
            paths.current.display()
        ))),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(Failure::internal(format!(
            "inspecting {}: {error}",
            paths.current.display()
        ))),
    }
}

fn xml_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

fn launchd_environment(manifest: &RuntimeManifest) -> BTreeMap<String, String> {
    let mut env = BTreeMap::from([
        ("ANVIL_HOME".to_owned(), manifest.anvil_home.clone()),
        ("FORGED_CONFIG".to_owned(), manifest.config_path.clone()),
        ("BEADS_DIR".to_owned(), manifest.beads_dir.clone()),
        (
            "PATH".to_owned(),
            [
                "/opt/homebrew/bin",
                "/usr/local/bin",
                "/usr/bin",
                "/bin",
                "/usr/sbin",
                "/sbin",
            ]
            .into_iter()
            .filter(|entry| Path::new(entry).is_dir())
            .collect::<Vec<_>>()
            .join(":"),
        ),
    ]);
    for key in [
        "BEADS_CREDENTIALS_FILE",
        "BEADS_DOLT_SERVER_TLS",
        "BEADS_DOLT_SERVER_USER",
    ] {
        if let Ok(value) = std::env::var(key) {
            env.insert(key.to_owned(), value);
        }
    }
    env
}

fn render_plist(paths: &RuntimePaths, manifest: &RuntimeManifest) -> String {
    let env = launchd_environment(manifest)
        .into_iter()
        .map(|(key, value)| {
            format!(
                "    <key>{}</key><string>{}</string>\n",
                xml_escape(&key),
                xml_escape(&value)
            )
        })
        .collect::<String>();
    format!(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \
\"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n\
<plist version=\"1.0\"><dict>\n\
  <key>Label</key><string>{label}</string>\n\
  <key>ProgramArguments</key><array>\n\
    <string>{binary}</string><string>supervise</string>\n\
    <string>--service-generation</string><string>{generation}</string>\n\
  </array>\n\
  <key>EnvironmentVariables</key><dict>\n{env}  </dict>\n\
  <key>RunAtLoad</key><true/>\n\
  <key>KeepAlive</key><true/>\n\
  <key>ThrottleInterval</key><integer>10</integer>\n\
  <key>ProcessType</key><string>Background</string>\n\
  <key>StandardOutPath</key><string>{stdout}</string>\n\
  <key>StandardErrorPath</key><string>{stderr}</string>\n\
</dict></plist>\n",
        label = xml_escape(&manifest.label),
        binary = xml_escape(&manifest.binary.path),
        generation = xml_escape(&manifest.generation),
        stdout = xml_escape(&paths.logs.join("supervisor.stdout.log").to_string_lossy()),
        stderr = xml_escape(&paths.logs.join("supervisor.stderr.log").to_string_lossy()),
    )
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct LaunchdObservation {
    loaded: bool,
    running: bool,
    pid: Option<i32>,
    last_exit_status: Option<i32>,
    program: Option<String>,
    arguments: Vec<String>,
    detail: String,
}

impl LaunchdObservation {
    fn absent(detail: impl Into<String>) -> Self {
        Self {
            loaded: false,
            running: false,
            pid: None,
            last_exit_status: None,
            program: None,
            arguments: Vec::new(),
            detail: detail.into(),
        }
    }

    fn authority_matches(&self, manifest: &RuntimeManifest) -> bool {
        self.program.as_deref() == Some(manifest.binary.path.as_str())
            && self.arguments
                == [
                    manifest.binary.path.clone(),
                    "supervise".to_owned(),
                    "--service-generation".to_owned(),
                    manifest.generation.clone(),
                ]
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum RuntimeServiceState {
    NotInstalled,
    Unsupported,
    Transitioning,
    Mismatched,
    Stopped,
    Degraded,
    Stale,
    Running,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimeStatus {
    schema: String,
    state: RuntimeServiceState,
    platform: String,
    supported: bool,
    label: String,
    domain: String,
    manifest: Option<RuntimeManifest>,
    launchd: Option<LaunchdObservation>,
    supervisor: Option<SupervisorStatus>,
    binary_verified: Option<bool>,
    current_verified: Option<bool>,
    program_verified: Option<bool>,
    process_identity_verified: Option<bool>,
    transitions: usize,
    degraded_reason: Option<String>,
}

impl RuntimeStatus {
    fn validate(&self) -> Result<(), Failure> {
        if self.schema != RUNTIME_STATUS_SCHEMA {
            return Err(Failure::internal(format!(
                "unknown runtime status schema {:?}",
                self.schema
            )));
        }
        if self.state == RuntimeServiceState::Running
            && (!self.supported
                || self.launchd.as_ref().is_none_or(|value| !value.running)
                || self.supervisor.is_none()
                || self.process_identity_verified != Some(true))
        {
            return Err(Failure::internal(
                "running runtime status lacks an exact launchd process identity",
            ));
        }
        Ok(())
    }
}

fn runtime_status_value(status: RuntimeStatus) -> Result<Value, Failure> {
    status.validate()?;
    serde_json::to_value(status)
        .map_err(|error| Failure::internal(format!("serializing runtime status: {error}")))
}

#[async_trait]
trait ServiceHost: Send + Sync {
    async fn inspect(&self, paths: &RuntimePaths) -> Result<LaunchdObservation, Failure>;
    async fn bootstrap(&self, paths: &RuntimePaths) -> Result<(), Failure>;
    async fn bootout(&self, paths: &RuntimePaths) -> Result<(), Failure>;
    async fn kickstart(&self, paths: &RuntimePaths) -> Result<(), Failure>;
    async fn await_ready(
        &self,
        paths: &RuntimePaths,
        manifest: &RuntimeManifest,
    ) -> Result<(), Failure>;
}

struct LaunchdHost;

fn launchd_field<'a>(text: &'a str, name: &str) -> Option<&'a str> {
    text.lines().find_map(|line| {
        let trimmed = line.trim();
        trimmed
            .strip_prefix(name)
            .and_then(|rest| rest.trim().strip_prefix('='))
            .map(str::trim)
    })
}

fn launchd_arguments(text: &str) -> Vec<String> {
    let mut inside = false;
    let mut values = Vec::new();
    for line in text.lines() {
        let trimmed = line.trim();
        if !inside {
            inside = trimmed == "arguments = {";
            continue;
        }
        if trimmed == "}" {
            break;
        }
        let value = trimmed
            .split_once('=')
            .filter(|(index, _)| index.trim().bytes().all(|byte| byte.is_ascii_digit()))
            .map_or(trimmed, |(_, value)| value.trim());
        if !value.is_empty() {
            values.push(value.to_owned());
        }
    }
    values
}

fn parse_launchd_print(
    paths: &RuntimePaths,
    success: bool,
    stdout: &str,
    stderr: &str,
) -> Result<LaunchdObservation, Failure> {
    if !success {
        let quoted_label = format!("\"{}\"", paths.label);
        let exact_not_found = stderr.lines().any(|line| {
            let line = line.trim();
            line.starts_with("Could not find service ")
                && line.contains(&quoted_label)
                && line.contains(" in domain ")
        });
        if exact_not_found {
            return Ok(LaunchdObservation::absent("job is not loaded"));
        }
        return Err(Failure::refused(
            ErrorCode::HostUnavailable,
            format!(
                "launchctl print {} failed without exact not-found evidence: {}",
                paths.target(),
                stderr.trim()
            ),
        ));
    }
    let pid = launchd_field(stdout, "pid").and_then(|value| value.parse::<i32>().ok());
    let state = launchd_field(stdout, "state").unwrap_or("unknown");
    let last_exit_status =
        launchd_field(stdout, "last exit code").and_then(|value| value.parse().ok());
    Ok(LaunchdObservation {
        loaded: true,
        running: state == "running" && pid.is_some(),
        pid,
        last_exit_status,
        program: launchd_field(stdout, "program").map(str::to_owned),
        arguments: launchd_arguments(stdout),
        detail: format!("state={state}"),
    })
}

#[cfg(target_os = "macos")]
impl LaunchdHost {
    async fn command(args: &[&str]) -> Result<std::process::Output, Failure> {
        Command::new("/bin/launchctl")
            .args(args)
            .stdin(Stdio::null())
            .output()
            .await
            .map_err(|error| Failure::internal(format!("launchctl {:?}: {error}", args)))
    }

    async fn require_success(args: &[&str]) -> Result<(), Failure> {
        let output = Self::command(args).await?;
        if output.status.success() {
            return Ok(());
        }
        Err(Failure::refused(
            ErrorCode::HostUnavailable,
            format!(
                "launchctl {:?} failed: {}",
                args,
                String::from_utf8_lossy(&output.stderr).trim()
            ),
        ))
    }
}

#[cfg(target_os = "macos")]
#[async_trait]
impl ServiceHost for LaunchdHost {
    async fn inspect(&self, paths: &RuntimePaths) -> Result<LaunchdObservation, Failure> {
        let target = paths.target();
        let output = Self::command(&["print", &target]).await?;
        parse_launchd_print(
            paths,
            output.status.success(),
            &String::from_utf8_lossy(&output.stdout),
            &String::from_utf8_lossy(&output.stderr),
        )
    }

    async fn bootstrap(&self, paths: &RuntimePaths) -> Result<(), Failure> {
        Self::require_success(&["bootstrap", &paths.domain, &paths.plist.to_string_lossy()]).await
    }

    async fn bootout(&self, paths: &RuntimePaths) -> Result<(), Failure> {
        let before = self.inspect(paths).await?;
        if !before.loaded {
            return Ok(());
        }
        let process_identity = match before.pid {
            Some(pid) => crate::adapters::ports::lstart_of(pid)
                .await
                .map(|started| (pid, started)),
            None => None,
        };
        let target = paths.target();
        let output = Self::command(&["bootout", &target]).await?;
        let started = Instant::now();
        loop {
            let absent = !self.inspect(paths).await?.loaded;
            let process_gone = match process_identity.as_ref() {
                Some((pid, expected)) => {
                    crate::adapters::ports::lstart_of(*pid).await.as_deref()
                        != Some(expected.as_str())
                }
                None => true,
            };
            if absent && process_gone {
                return Ok(());
            }
            if started.elapsed() >= READY_TIMEOUT {
                return Err(Failure::refused(
                    ErrorCode::HostUnavailable,
                    format!(
                        "launchctl bootout {target} did not confirm job and process death: {}",
                        String::from_utf8_lossy(&output.stderr).trim()
                    ),
                ));
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    }

    async fn kickstart(&self, paths: &RuntimePaths) -> Result<(), Failure> {
        let target = paths.target();
        Self::require_success(&["kickstart", "-k", &target]).await
    }

    async fn await_ready(
        &self,
        paths: &RuntimePaths,
        manifest: &RuntimeManifest,
    ) -> Result<(), Failure> {
        let started = Instant::now();
        loop {
            let observation = self.inspect(paths).await?;
            if observation.running && observation.authority_matches(manifest) {
                if let Some(status) = matching_status(paths, manifest, observation.pid).await? {
                    if matches!(
                        status.state,
                        SupervisorProcessState::Running | SupervisorProcessState::Degraded
                    ) {
                        return Ok(());
                    }
                }
            }
            if started.elapsed() >= READY_TIMEOUT {
                return Err(Failure::refused(
                    ErrorCode::HostUnavailable,
                    format!(
                        "supervisor {} did not publish matching generation status within {}s",
                        paths.label,
                        READY_TIMEOUT.as_secs()
                    ),
                ));
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    }
}

#[cfg(not(target_os = "macos"))]
#[async_trait]
impl ServiceHost for LaunchdHost {
    async fn inspect(&self, _paths: &RuntimePaths) -> Result<LaunchdObservation, Failure> {
        Err(unsupported_service_failure())
    }

    async fn bootstrap(&self, _paths: &RuntimePaths) -> Result<(), Failure> {
        Err(unsupported_service_failure())
    }

    async fn bootout(&self, _paths: &RuntimePaths) -> Result<(), Failure> {
        Err(unsupported_service_failure())
    }

    async fn kickstart(&self, _paths: &RuntimePaths) -> Result<(), Failure> {
        Err(unsupported_service_failure())
    }

    async fn await_ready(
        &self,
        _paths: &RuntimePaths,
        _manifest: &RuntimeManifest,
    ) -> Result<(), Failure> {
        Err(unsupported_service_failure())
    }
}

#[cfg(not(target_os = "macos"))]
fn unsupported_service_failure() -> Failure {
    Failure::refused(
        ErrorCode::HostUnavailable,
        format!(
            "supervisor service lifecycle is supported only on macOS, not {}",
            std::env::consts::OS
        ),
    )
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ControllerBlocker {
    id: String,
    state: String,
    recorded_abi: Option<String>,
    reason: String,
}

fn pid_alive(pid: i32) -> Option<bool> {
    match kill(Pid::from_raw(pid), None) {
        Ok(()) | Err(Errno::EPERM) => Some(true),
        Err(Errno::ESRCH) => Some(false),
        Err(_) => None,
    }
}

async fn controller_blockers(
    runs_root: &Path,
    candidate_abi: Option<&str>,
) -> Result<Vec<ControllerBlocker>, Failure> {
    if !runs_root.exists() {
        return Ok(Vec::new());
    }
    let mut blockers = Vec::new();
    for entry in fs::read_dir(runs_root)
        .map_err(|error| Failure::internal(format!("reading controller inventory: {error}")))?
    {
        let entry =
            entry.map_err(|error| Failure::internal(format!("controller entry: {error}")))?;
        let fallback_id = entry.file_name().to_string_lossy().into_owned();
        let controller_dir = entry.path().join("controller");
        let admission_path = controller_dir.join("runtime-admission.json");
        match read_json::<ControllerAdmissionRecord>(&admission_path) {
            Ok(Some(admission)) => {
                let validation = admission.validate();
                blockers.push(ControllerBlocker {
                    id: admission.id,
                    state: "admitting".to_owned(),
                    recorded_abi: Some(admission.runtime_abi),
                    reason: validation.map_or_else(
                        |error| format!("invalid controller admission: {error}"),
                        |()| {
                            "controller spawn admission has not published terminal identity"
                                .to_owned()
                        },
                    ),
                });
                continue;
            }
            Ok(None) => {}
            Err(error) => {
                blockers.push(ControllerBlocker {
                    id: fallback_id.clone(),
                    state: "unknown".to_owned(),
                    recorded_abi: None,
                    reason: format!("controller admission cannot be verified: {error}"),
                });
                continue;
            }
        }
        let path = controller_dir.join("controller.json");
        let Some(record): Option<Value> = read_json(&path)? else {
            continue;
        };
        let id = record
            .get("id")
            .and_then(Value::as_str)
            .unwrap_or(&fallback_id)
            .to_owned();
        let recorded_abi = record
            .pointer("/binary/runtimeAbi")
            .and_then(Value::as_str)
            .map(str::to_owned);
        let status_path = record
            .get("statusPath")
            .and_then(Value::as_str)
            .map(PathBuf::from);
        let generation = record.get("generation").and_then(Value::as_u64);
        let session = record.get("sessionId").and_then(Value::as_str);
        let expected_status = match (generation, session) {
            (Some(generation), Some(session)) => Some(
                controller_dir
                    .join("status")
                    .join(generation.to_string())
                    .join(session)
                    .join("status"),
            ),
            (Some(generation), None)
                if record
                    .get("recoveredAfterSpawnCrash")
                    .and_then(Value::as_bool)
                    == Some(true) =>
            {
                Some(controller_dir.join(format!("controller-{generation}.drive-exit")))
            }
            _ => None,
        };
        let sentinel_problem = match (status_path.as_ref(), expected_status.as_ref()) {
            (Some(observed), Some(expected)) if observed != expected => Some(format!(
                "controller status path {} does not match generation authority {}",
                observed.display(),
                expected.display()
            )),
            (Some(observed), Some(_)) => match fs::symlink_metadata(observed) {
                Ok(_) => match reject_symlink_chain(observed) {
                    Err(error) => Some(format!("unsafe controller sentinel: {error}")),
                    Ok(()) => match forged_host::read_exit_status(observed) {
                        Ok(Some(_)) => continue,
                        Ok(None) => {
                            Some("controller sentinel exists but is empty or malformed".to_owned())
                        }
                        Err(error) => {
                            Some(format!("controller sentinel cannot be verified: {error}"))
                        }
                    },
                },
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => None,
                Err(error) => Some(format!("controller sentinel cannot be inspected: {error}")),
            },
            (None, _) => Some("controller record has no status path".to_owned()),
            (_, None) => Some("controller record has no valid generation/session".to_owned()),
        };
        if let Some(reason) = sentinel_problem {
            blockers.push(ControllerBlocker {
                id,
                state: "unknown".to_owned(),
                recorded_abi,
                reason,
            });
            continue;
        }
        let pid = record
            .pointer("/driver/pid")
            .and_then(Value::as_i64)
            .and_then(|value| i32::try_from(value).ok());
        let expected = record
            .pointer("/driver/lstart")
            .and_then(Value::as_str)
            .map(str::to_owned);
        let (state, reason) = match pid {
            Some(pid) => match pid_alive(pid) {
                Some(false) => continue,
                Some(true) => {
                    let current = crate::adapters::ports::lstart_of(pid).await;
                    if expected.is_some() && current == expected {
                        ("live", "verified live controller".to_owned())
                    } else {
                        (
                            "unknown",
                            "PID is present but process-start identity is missing or mismatched"
                                .to_owned(),
                        )
                    }
                }
                None => (
                    "unknown",
                    "controller liveness could not be verified".to_owned(),
                ),
            },
            None => ("unknown", "controller record has no PID".to_owned()),
        };
        if candidate_abi.is_some_and(|abi| recorded_abi.as_deref() == Some(abi)) {
            continue;
        }
        blockers.push(ControllerBlocker {
            id,
            state: state.to_owned(),
            recorded_abi,
            reason,
        });
    }
    blockers.sort_by(|left, right| left.id.cmp(&right.id));
    Ok(blockers)
}

fn blockers_failure(blockers: &[ControllerBlocker]) -> Failure {
    let detail = serde_json::to_string(blockers).unwrap_or_else(|_| "[]".to_owned());
    Failure::refused(
        ErrorCode::HostUnavailable,
        format!(
            "service drain required before changing runtime; blockers={detail}; run `forged service stop --drain --timeout-seconds 300`"
        ),
    )
}

struct RuntimeLock(File);

impl RuntimeLock {
    fn acquire(paths: &RuntimePaths) -> Result<Self, Failure> {
        reject_symlink_chain(&paths.lock)?;
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .mode(0o600)
            .custom_flags(nix::libc::O_NOFOLLOW)
            .open(&paths.lock)
            .map_err(|error| Failure::internal(format!("opening runtime lock: {error}")))?;
        if !file
            .metadata()
            .map_err(|error| Failure::internal(format!("stat runtime lock: {error}")))?
            .is_file()
        {
            return Err(Failure::internal("runtime lock is not a regular file"));
        }
        file.try_lock_exclusive().map_err(|error| Failure {
            code: ErrorCode::OperationInProgress,
            message: format!(
                "another runtime/controller operation holds the runtime lock: {error}"
            ),
            recoverable: true,
        })?;
        Ok(Self(file))
    }
}

impl Drop for RuntimeLock {
    fn drop(&mut self) {
        let _ = FileExt::unlock(&self.0);
    }
}

pub(crate) struct ControllerAdmission {
    _lock: RuntimeLock,
    controller_dir: PathBuf,
    binary: BinaryIdentity,
    path: PathBuf,
    record: ControllerAdmissionRecord,
    leave_on_drop: bool,
}

fn controller_runtime_dir(config: &ForgedConfig, id: &str) -> Result<PathBuf, Failure> {
    let mut components = Path::new(id).components();
    if id.is_empty()
        || !matches!(components.next(), Some(std::path::Component::Normal(_)))
        || components.next().is_some()
    {
        return Err(Failure::invalid(
            "controller id must be one safe path component",
        ));
    }
    let runs_root = canonicalize_anchor(&config.runs_root)?;
    ensure_private_dir(&runs_root)?;
    let controller_dir = runs_root.join(id).join("controller");
    ensure_private_dir(&controller_dir)?;
    Ok(controller_dir)
}

impl ControllerAdmission {
    pub(crate) fn acquire(
        config: &ForgedConfig,
        id: &str,
        generation: u32,
    ) -> Result<Self, Failure> {
        let paths = RuntimePaths::from_config(config)?;
        Self::acquire_at(config, id, generation, &paths)
    }

    fn acquire_at(
        config: &ForgedConfig,
        id: &str,
        generation: u32,
        paths: &RuntimePaths,
    ) -> Result<Self, Failure> {
        if id.is_empty() || generation == 0 {
            return Err(Failure::invalid("controller admission identity is invalid"));
        }
        ensure_private_dir(&paths.root)?;
        let lock = RuntimeLock::acquire(paths)?;
        let transitions = unresolved_transitions(paths)?;
        if !transitions.is_empty() {
            return Err(Failure {
                code: ErrorCode::OperationInProgress,
                message: "controller spawn is fenced until the unresolved service transition is recovered"
                    .to_owned(),
                recoverable: true,
            });
        }
        let current = current_binary_identity()?;
        let binary = if let Some(manifest) = read_manifest(paths)? {
            if manifest.binary.runtime_abi != current.runtime_abi
                || manifest.binary.sha256 != current.sha256
            {
                return Err(Failure::refused(
                    ErrorCode::HostUnavailable,
                    format!(
                        "controller binary {}/{} is stale; installed authority requires {}/{}",
                        current.runtime_abi,
                        current.sha256,
                        manifest.binary.runtime_abi,
                        manifest.binary.sha256
                    ),
                ));
            }
            let installed = binary_identity(Path::new(&manifest.binary.path)).map_err(|error| {
                Failure::refused(
                    ErrorCode::HostUnavailable,
                    format!("installed controller binary cannot be verified: {error}"),
                )
            })?;
            if installed.sha256 != manifest.binary.sha256 {
                return Err(Failure::refused(
                    ErrorCode::HostUnavailable,
                    "installed controller binary digest does not match its manifest",
                ));
            }
            manifest.binary
        } else {
            current
        };
        let controller_dir = controller_runtime_dir(config, id)?;
        let path = controller_dir.join("runtime-admission.json");
        if path.exists() {
            return Err(Failure {
                code: ErrorCode::OperationInProgress,
                message: format!("controller {id} already has an unresolved runtime admission"),
                recoverable: true,
            });
        }
        let now = now_iso();
        let record = ControllerAdmissionRecord {
            schema: CONTROLLER_ADMISSION_SCHEMA.to_owned(),
            id: id.to_owned(),
            generation,
            runtime_abi: binary.runtime_abi.clone(),
            binary_sha256: binary.sha256.clone(),
            state: ControllerAdmissionState::Preparing,
            pid: None,
            process_started_at: None,
            created_at: now.clone(),
            updated_at: now,
        };
        record.validate()?;
        atomic_json(&path, &record)?;
        Ok(Self {
            _lock: lock,
            controller_dir,
            binary,
            path,
            record,
            leave_on_drop: false,
        })
    }

    pub(crate) fn controller_dir(&self) -> &Path {
        &self.controller_dir
    }

    pub(crate) fn binary(&self) -> &BinaryIdentity {
        &self.binary
    }

    pub(crate) fn mark_spawned(
        &mut self,
        pid: i32,
        process_started_at: String,
    ) -> Result<(), Failure> {
        self.leave_on_drop = true;
        self.record.state = ControllerAdmissionState::Spawned;
        self.record.pid = Some(pid);
        self.record.process_started_at = Some(process_started_at);
        self.record.updated_at = now_iso();
        self.record.validate()?;
        atomic_json(&self.path, &self.record)?;
        Ok(())
    }

    pub(crate) fn preserve_spawn_attempt(&mut self) {
        self.leave_on_drop = true;
    }

    pub(crate) fn cancelled_after_confirmed_death(mut self) -> Result<(), Failure> {
        remove_if_present(&self.path)?;
        self.leave_on_drop = false;
        Ok(())
    }

    pub(crate) fn complete(mut self) -> Result<(), Failure> {
        remove_if_present(&self.path)?;
        self.leave_on_drop = false;
        Ok(())
    }
}

impl Drop for ControllerAdmission {
    fn drop(&mut self) {
        if !self.leave_on_drop {
            let _ = remove_if_present(&self.path);
        }
    }
}

pub(crate) fn write_controller_record(path: &Path, value: &Value) -> Result<(), Failure> {
    atomic_json(path, value)
}

pub(crate) fn complete_recovered_controller_admission(
    config: &ForgedConfig,
    id: &str,
    generation: u32,
) -> Result<(), Failure> {
    let paths = RuntimePaths::from_config(config)?;
    complete_recovered_controller_admission_at(config, id, generation, &paths)
}

fn complete_recovered_controller_admission_at(
    config: &ForgedConfig,
    id: &str,
    generation: u32,
    paths: &RuntimePaths,
) -> Result<(), Failure> {
    ensure_private_dir(&paths.root)?;
    let _lock = RuntimeLock::acquire(paths)?;
    let controller_dir = controller_runtime_dir(config, id)?;
    let admission_path = controller_dir.join("runtime-admission.json");
    let Some(admission): Option<ControllerAdmissionRecord> = read_json(&admission_path)? else {
        return Ok(());
    };
    admission.validate()?;
    if admission.id != id || admission.generation != generation {
        return Err(Failure::refused(
            ErrorCode::HostUnavailable,
            "controller recovery does not match the unresolved runtime admission",
        ));
    }
    if admission.state != ControllerAdmissionState::Spawned {
        return Err(Failure::refused(
            ErrorCode::HostUnavailable,
            "controller admission cannot complete before spawned process identity is durable",
        ));
    }
    let Some(record): Option<Value> = read_json(&controller_dir.join("controller.json"))? else {
        return Err(Failure::refused(
            ErrorCode::HostUnavailable,
            "controller admission cannot complete before controller identity is durable",
        ));
    };
    // Controller record v2 adds the exact host-selected sentinel and durable
    // Herdr ownership identity without changing the fenced driver identity
    // this runtime admission validates. Keep v1 recovery for already-running
    // controllers while accepting the closed current schema.
    let record_matches = matches!(
        record.get("schemaVersion").and_then(Value::as_u64),
        Some(1 | 2)
    ) && record.get("id").and_then(Value::as_str) == Some(id)
        && record.get("generation").and_then(Value::as_u64) == Some(u64::from(generation))
        && record.pointer("/driver/pid").and_then(Value::as_i64) == admission.pid.map(i64::from)
        && record.pointer("/driver/lstart").and_then(Value::as_str)
            == admission.process_started_at.as_deref();
    if !record_matches {
        return Err(Failure::refused(
            ErrorCode::HostUnavailable,
            "durable controller identity does not match the unresolved admission",
        ));
    }
    remove_if_present(&admission_path)
}

fn new_manifest(
    paths: &RuntimePaths,
    config: &ForgedConfig,
    mut binary: BinaryIdentity,
) -> Result<RuntimeManifest, Failure> {
    let generation = Uuid::now_v7().to_string();
    let target = paths.binary_path(&binary.sha256);
    binary.path = target.to_string_lossy().into_owned();
    let manifest = RuntimeManifest {
        schema: MANIFEST_SCHEMA.to_owned(),
        generation,
        label: paths.label.clone(),
        domain: paths.domain.clone(),
        binary,
        anvil_home: paths
            .root
            .parent()
            .expect("runtime root always has an ANVIL_HOME parent")
            .to_string_lossy()
            .into_owned(),
        config_path: config.config_path.to_string_lossy().into_owned(),
        beads_dir: config.beads_dir.to_string_lossy().into_owned(),
        plist_path: paths.plist.to_string_lossy().into_owned(),
        installed_at: now_iso(),
    };
    manifest.validate()?;
    Ok(manifest)
}

fn manifest_matches_config(
    manifest: &RuntimeManifest,
    config: &ForgedConfig,
) -> Result<bool, Failure> {
    Ok(
        Path::new(&manifest.anvil_home) == canonicalize_anchor(&config.anvil_home)?
            && Path::new(&manifest.config_path) == canonicalize_anchor(&config.config_path)?
            && Path::new(&manifest.beads_dir) == canonicalize_anchor(&config.beads_dir)?,
    )
}

async fn fence_service<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
) -> Result<LaunchdObservation, Failure> {
    let before = host.inspect(paths).await?;
    if before.loaded {
        host.bootout(paths).await?;
    }
    let after = host.inspect(paths).await?;
    if after.loaded || after.running || after.pid.is_some() {
        return Err(Failure::refused(
            ErrorCode::HostUnavailable,
            format!(
                "supervisor {} was not exactly fenced before runtime authority changed",
                paths.label
            ),
        ));
    }
    Ok(before)
}

async fn restore_previous<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    previous: Option<&RuntimeManifest>,
    previous_loaded: bool,
) -> Result<(), Failure> {
    fence_service(host, paths).await?;
    if let Some(previous) = previous {
        let binary = Path::new(&previous.binary.path);
        switch_current(paths, binary)?;
        atomic_json(&paths.manifest, previous)?;
        atomic_write(
            &paths.plist,
            render_plist(paths, previous).as_bytes(),
            0o600,
        )?;
        if previous_loaded {
            host.bootstrap(paths).await?;
            host.await_ready(paths, previous).await?;
        }
    } else {
        remove_if_present(&paths.plist)?;
        remove_if_present(&paths.manifest)?;
        remove_current_projection(paths)?;
    }
    Ok(())
}

async fn recover_incomplete<H: ServiceHost>(host: &H, paths: &RuntimePaths) -> Result<(), Failure> {
    for mut transition in unresolved_transitions(paths)? {
        let candidate_is_current = match (&transition.candidate, read_manifest(paths)?) {
            (Some(candidate), Some(current)) => candidate.generation == current.generation,
            _ => false,
        };
        if candidate_is_current {
            let candidate = transition
                .candidate
                .as_ref()
                .expect("candidate checked above");
            if host.await_ready(paths, candidate).await.is_ok() {
                transition.phase = TransitionPhase::Complete;
                transition.updated_at = now_iso();
                transition.error = None;
                write_transition(paths, &transition)?;
                continue;
            }
        }
        restore_previous(
            host,
            paths,
            transition.previous.as_ref(),
            transition.previous_loaded,
        )
        .await?;
        transition.phase = TransitionPhase::RolledBack;
        transition.updated_at = now_iso();
        transition.error =
            Some("recovered incomplete transition by restoring prior state".to_owned());
        write_transition(paths, &transition)?;
    }
    Ok(())
}

#[derive(Debug, Default)]
struct LifecycleFaults {
    fail_at: Option<&'static str>,
}

impl LifecycleFaults {
    fn check(&self, seam: &'static str) -> Result<(), Failure> {
        if self.fail_at == Some(seam) {
            return Err(Failure::internal(format!(
                "injected service lifecycle failure at {seam}"
            )));
        }
        Ok(())
    }
}

async fn rollback_transition<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    mut transition: RuntimeTransition,
    original: Failure,
) -> Failure {
    let original_code = original.code;
    let original_recoverable = original.recoverable;
    let original_message = original.to_string();
    match restore_previous(
        host,
        paths,
        transition.previous.as_ref(),
        transition.previous_loaded,
    )
    .await
    {
        Ok(()) => {
            transition.phase = TransitionPhase::RolledBack;
            transition.updated_at = now_iso();
            transition.error = Some(original_message.clone());
            match write_transition(paths, &transition) {
                Ok(()) => Failure {
                    code: original_code,
                    message: format!(
                        "service transition failed and prior authority was restored: {original_message}"
                    ),
                    recoverable: original_recoverable,
                },
                Err(record_error) => Failure::refused(
                    ErrorCode::HostUnavailable,
                    format!(
                        "prior authority was restored after {original_message}, but rollback could not be recorded: {record_error}"
                    ),
                ),
            }
        }
        Err(restore_error) => {
            let combined = format!(
                "service transition failed: {original_message}; rollback remains unresolved because candidate fencing/restoration failed: {restore_error}"
            );
            transition.updated_at = now_iso();
            transition.error = Some(combined.clone());
            let _ = write_transition(paths, &transition);
            Failure::refused(ErrorCode::HostUnavailable, combined)
        }
    }
}

async fn install<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    config: &ForgedConfig,
    faults: &LifecycleFaults,
) -> Result<Value, Failure> {
    let source_identity = current_binary_identity()?;
    let source = PathBuf::from(&source_identity.path);
    let target = copy_content_addressed(paths, &source, &source_identity)?;
    let previous = read_manifest(paths)?;

    let same_install = match previous.as_ref() {
        Some(value) => {
            value.binary.sha256 == source_identity.sha256 && manifest_matches_config(value, config)?
        }
        None => false,
    };
    if same_install {
        let previous = previous.expect("same digest implies manifest");
        switch_current(paths, &target)?;
        atomic_write(
            &paths.plist,
            render_plist(paths, &previous).as_bytes(),
            0o600,
        )?;
        let observation = host.inspect(paths).await?;
        if !observation.loaded {
            host.bootstrap(paths).await?;
        } else if !observation.authority_matches(&previous) {
            fence_service(host, paths).await?;
            host.bootstrap(paths).await?;
        } else if !observation.running {
            host.kickstart(paths).await?;
        }
        host.await_ready(paths, &previous).await?;
        return Ok(json!({
            "schema": RUNTIME_OPERATION_SCHEMA,
            "action": "reconciled",
            "manifest": previous,
        }));
    }

    let blockers = controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI)).await?;
    if !blockers.is_empty() {
        return Err(blockers_failure(&blockers));
    }

    let previous_observation = host.inspect(paths).await?;
    let candidate = new_manifest(paths, config, source_identity)?;
    let id = Uuid::now_v7().to_string();
    let mut transition = RuntimeTransition {
        schema: TRANSITION_SCHEMA.to_owned(),
        id,
        kind: if previous.is_some() {
            TransitionKind::Upgrade
        } else {
            TransitionKind::Install
        },
        phase: TransitionPhase::Staged,
        previous: previous.clone(),
        previous_loaded: previous_observation.loaded,
        candidate: Some(candidate.clone()),
        started_at: now_iso(),
        updated_at: now_iso(),
        error: None,
    };
    write_transition(paths, &transition)?;

    if previous_observation.loaded {
        if let Err(error) = fence_service(host, paths).await {
            return Err(rollback_transition(host, paths, transition, error).await);
        }
    }
    transition.phase = TransitionPhase::PriorStopped;
    transition.updated_at = now_iso();
    let prior_stopped = faults
        .check("prior-stopped-transition")
        .and_then(|()| write_transition(paths, &transition));
    if let Err(error) = prior_stopped {
        return Err(rollback_transition(host, paths, transition, error).await);
    }

    let blockers = match controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI)).await
    {
        Ok(blockers) => blockers,
        Err(error) => return Err(rollback_transition(host, paths, transition, error).await),
    };
    if !blockers.is_empty() {
        return Err(
            rollback_transition(host, paths, transition, blockers_failure(&blockers)).await,
        );
    }

    let switch_result = (|| {
        faults.check("current-switch")?;
        switch_current(paths, Path::new(&candidate.binary.path))?;
        faults.check("plist-write")?;
        atomic_write(
            &paths.plist,
            render_plist(paths, &candidate).as_bytes(),
            0o600,
        )?;
        faults.check("manifest-write")?;
        atomic_json(&paths.manifest, &candidate)?;
        transition.phase = TransitionPhase::Switched;
        transition.updated_at = now_iso();
        faults.check("switched-transition")?;
        write_transition(paths, &transition)
    })();
    if let Err(error) = switch_result {
        return Err(rollback_transition(host, paths, transition, error).await);
    }

    let started = async {
        host.bootstrap(paths).await?;
        host.await_ready(paths, &candidate).await
    }
    .await;
    if let Err(error) = started {
        return Err(rollback_transition(host, paths, transition, error).await);
    }
    transition.phase = TransitionPhase::Started;
    transition.updated_at = now_iso();
    if let Err(error) = faults
        .check("started-transition")
        .and_then(|()| write_transition(paths, &transition))
    {
        return Err(rollback_transition(host, paths, transition, error).await);
    }
    transition.phase = TransitionPhase::Complete;
    transition.updated_at = now_iso();
    if let Err(error) = faults
        .check("complete-transition")
        .and_then(|()| write_transition(paths, &transition))
    {
        return Err(rollback_transition(host, paths, transition, error).await);
    }
    Ok(json!({
        "schema": RUNTIME_OPERATION_SCHEMA,
        "action": if previous.is_some() { "upgraded" } else { "installed" },
        "manifest": candidate,
    }))
}

async fn start<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    config: &ForgedConfig,
) -> Result<Value, Failure> {
    let manifest = read_manifest(paths)?
        .ok_or_else(|| Failure::invalid("supervisor service is not installed"))?;
    if !manifest_matches_config(&manifest, config)? {
        return Err(Failure::invalid(
            "installed supervisor configuration differs from this process; run `forged service install` to publish a new generation",
        ));
    }
    let blockers =
        controller_blockers(&config.runs_root, Some(&manifest.binary.runtime_abi)).await?;
    if !blockers.is_empty() {
        return Err(blockers_failure(&blockers));
    }
    let observation = host.inspect(paths).await?;
    if !observation.loaded {
        host.bootstrap(paths).await?;
    } else if !observation.authority_matches(&manifest) {
        fence_service(host, paths).await?;
        host.bootstrap(paths).await?;
    } else if !observation.running {
        host.kickstart(paths).await?;
    }
    host.await_ready(paths, &manifest).await?;
    Ok(json!({"schema": RUNTIME_OPERATION_SCHEMA, "action": "started"}))
}

async fn stop<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    config: &ForgedConfig,
    drain: bool,
    timeout_seconds: u64,
) -> Result<Value, Failure> {
    let observation = fence_service(host, paths).await?;
    let blockers = if drain {
        let started = Instant::now();
        loop {
            let blockers = controller_blockers(&config.runs_root, None).await?;
            if blockers.is_empty() || started.elapsed() >= Duration::from_secs(timeout_seconds) {
                break blockers;
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    } else {
        Vec::new()
    };
    if !blockers.is_empty() {
        return Err(blockers_failure(&blockers));
    }
    Ok(json!({
        "schema": RUNTIME_OPERATION_SCHEMA,
        "action": if observation.loaded { "stopped" } else { "already-stopped" },
        "drained": drain,
    }))
}

async fn uninstall<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    config: &ForgedConfig,
) -> Result<Value, Failure> {
    let previous = read_manifest(paths)?;
    let observation = host.inspect(paths).await?;
    if previous.is_none() && !paths.plist.exists() && !observation.loaded {
        return Ok(json!({
            "schema": RUNTIME_OPERATION_SCHEMA,
            "action": "already-uninstalled"
        }));
    }
    if previous.is_none() && observation.loaded {
        return Err(Failure::refused(
            ErrorCode::HostUnavailable,
            "launchd job is loaded without a runtime manifest; refusing an uninstall that cannot restore it safely",
        ));
    }
    let id = Uuid::now_v7().to_string();
    let mut transition = RuntimeTransition {
        schema: TRANSITION_SCHEMA.to_owned(),
        id,
        kind: TransitionKind::Uninstall,
        phase: TransitionPhase::Staged,
        previous: previous.clone(),
        previous_loaded: observation.loaded,
        candidate: None,
        started_at: now_iso(),
        updated_at: now_iso(),
        error: None,
    };
    write_transition(paths, &transition)?;
    if observation.loaded {
        if let Err(error) = fence_service(host, paths).await {
            return Err(rollback_transition(host, paths, transition, error).await);
        }
    }
    transition.phase = TransitionPhase::PriorStopped;
    transition.updated_at = now_iso();
    if let Err(error) = write_transition(paths, &transition) {
        return Err(rollback_transition(host, paths, transition, error).await);
    }
    let blockers = match controller_blockers(&config.runs_root, None).await {
        Ok(blockers) => blockers,
        Err(error) => return Err(rollback_transition(host, paths, transition, error).await),
    };
    if !blockers.is_empty() {
        return Err(
            rollback_transition(host, paths, transition, blockers_failure(&blockers)).await,
        );
    }
    let remove_result = (|| {
        remove_if_present(&paths.plist)?;
        remove_if_present(&paths.manifest)?;
        remove_current_projection(paths)
    })();
    if let Err(error) = remove_result {
        return Err(rollback_transition(host, paths, transition, error).await);
    }
    transition.phase = TransitionPhase::Complete;
    transition.updated_at = now_iso();
    if let Err(error) = write_transition(paths, &transition) {
        return Err(rollback_transition(host, paths, transition, error).await);
    }
    Ok(json!({
        "schema": RUNTIME_OPERATION_SCHEMA,
        "action": "uninstalled",
        "retainedBinaries": true,
    }))
}

async fn matching_status(
    paths: &RuntimePaths,
    manifest: &RuntimeManifest,
    launchd_pid: Option<i32>,
) -> Result<Option<SupervisorStatus>, Failure> {
    let sessions = paths
        .generations
        .join(&manifest.generation)
        .join("sessions");
    if !sessions.exists() {
        return Ok(None);
    }
    let mut candidates = Vec::new();
    for entry in fs::read_dir(&sessions)
        .map_err(|error| Failure::internal(format!("reading {}: {error}", sessions.display())))?
    {
        let entry = entry.map_err(|error| Failure::internal(format!("status entry: {error}")))?;
        let path = entry.path().join("status.json");
        let Some(status): Option<SupervisorStatus> = read_json(&path)? else {
            continue;
        };
        status.validate()?;
        if status.generation == manifest.generation
            && status.binary.sha256 == manifest.binary.sha256
            && launchd_pid.is_none_or(|pid| pid == status.pid)
        {
            candidates.push(status);
        }
    }
    candidates.sort_by(|left, right| left.updated_at.cmp(&right.updated_at));
    let Some(candidate) = candidates.pop() else {
        return Ok(None);
    };
    let current_lstart = crate::adapters::ports::lstart_of(candidate.pid).await;
    if matches!(candidate.state, SupervisorProcessState::Stopped)
        || current_lstart.as_deref() == Some(candidate.process_started_at.as_str())
    {
        Ok(Some(candidate))
    } else {
        Ok(None)
    }
}

fn status_is_stale(status: &SupervisorStatus) -> bool {
    let Ok(updated): Result<jiff::Timestamp, _> = status.updated_at.parse() else {
        return true;
    };
    let now = jiff::Timestamp::now();
    let nanos = now.as_nanosecond().saturating_sub(updated.as_nanosecond());
    nanos > i128::try_from(STATUS_STALE_AFTER.as_nanos()).unwrap_or(i128::MAX)
}

async fn status_with_host<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
) -> Result<Value, Failure> {
    let transitions = unresolved_transitions(paths)?;
    let Some(manifest) = read_manifest(paths)? else {
        return runtime_status_value(RuntimeStatus {
            schema: RUNTIME_STATUS_SCHEMA.to_owned(),
            state: if transitions.is_empty() {
                RuntimeServiceState::NotInstalled
            } else {
                RuntimeServiceState::Transitioning
            },
            platform: std::env::consts::OS.to_owned(),
            supported: cfg!(target_os = "macos"),
            label: paths.label.clone(),
            domain: paths.domain.clone(),
            manifest: None,
            launchd: None,
            supervisor: None,
            binary_verified: None,
            current_verified: None,
            program_verified: None,
            process_identity_verified: None,
            transitions: transitions.len(),
            degraded_reason: None,
        });
    };
    let observed_binary = binary_identity(Path::new(&manifest.binary.path));
    let binary_ok = observed_binary
        .as_ref()
        .is_ok_and(|value| value.sha256 == manifest.binary.sha256);
    let current_ok = fs::read_link(&paths.current)
        .is_ok_and(|target| target == Path::new(&manifest.binary.path));
    let observation = host.inspect(paths).await?;
    let supervisor = matching_status(paths, &manifest, observation.pid).await?;
    let plist = fs::read_to_string(&paths.plist).ok();
    let plist_program_ok = plist
        .as_deref()
        .is_some_and(|text| text.contains(&xml_escape(&manifest.binary.path)));
    let loaded_authority_ok = !observation.loaded || observation.authority_matches(&manifest);
    let program_ok = plist_program_ok && loaded_authority_ok;
    let process_identity_ok = supervisor.is_some();
    let (state, degraded_reason) = if !transitions.is_empty() {
        (
            RuntimeServiceState::Transitioning,
            Some("an incomplete service transition exists".to_owned()),
        )
    } else if !binary_ok {
        (
            RuntimeServiceState::Mismatched,
            Some("installed binary digest does not match manifest".to_owned()),
        )
    } else if !current_ok {
        (
            RuntimeServiceState::Mismatched,
            Some("current projection does not name the manifest binary".to_owned()),
        )
    } else if !program_ok {
        (
            RuntimeServiceState::Mismatched,
            Some("LaunchAgent plist does not name the manifest binary".to_owned()),
        )
    } else if !observation.loaded {
        (RuntimeServiceState::Stopped, None)
    } else if !observation.running {
        (
            RuntimeServiceState::Degraded,
            Some("launchd job is loaded but not running".to_owned()),
        )
    } else if supervisor.as_ref().is_none_or(status_is_stale) {
        (
            RuntimeServiceState::Stale,
            Some("no fresh status matches launchd PID, process start, and generation".to_owned()),
        )
    } else if supervisor
        .as_ref()
        .is_some_and(|value| value.state == SupervisorProcessState::Degraded)
    {
        (
            RuntimeServiceState::Degraded,
            supervisor
                .as_ref()
                .and_then(|value| value.last_error.clone()),
        )
    } else {
        (RuntimeServiceState::Running, None)
    };
    runtime_status_value(RuntimeStatus {
        schema: RUNTIME_STATUS_SCHEMA.to_owned(),
        state,
        platform: std::env::consts::OS.to_owned(),
        supported: cfg!(target_os = "macos"),
        label: paths.label.clone(),
        domain: paths.domain.clone(),
        manifest: Some(manifest),
        launchd: Some(observation),
        supervisor,
        binary_verified: Some(binary_ok),
        current_verified: Some(current_ok),
        program_verified: Some(program_ok),
        process_identity_verified: Some(process_identity_ok),
        transitions: transitions.len(),
        degraded_reason,
    })
}

pub(crate) async fn service_status(config: &ForgedConfig) -> Result<Value, Failure> {
    let paths = RuntimePaths::from_config(config)?;
    if !cfg!(target_os = "macos") {
        let manifest = read_manifest(&paths)?;
        return runtime_status_value(RuntimeStatus {
            schema: RUNTIME_STATUS_SCHEMA.to_owned(),
            state: RuntimeServiceState::Unsupported,
            platform: std::env::consts::OS.to_owned(),
            supported: false,
            label: paths.label.clone(),
            domain: paths.domain.clone(),
            manifest,
            launchd: None,
            supervisor: None,
            binary_verified: None,
            current_verified: None,
            program_verified: None,
            process_identity_verified: None,
            transitions: unresolved_transitions(&paths)?.len(),
            degraded_reason: Some("launchd service lifecycle is unavailable".to_owned()),
        });
    }
    status_with_host(&LaunchdHost, &paths).await
}

pub(crate) async fn doctor_probe(config: &ForgedConfig) -> (bool, String) {
    match service_status(config).await {
        Ok(value) => match value.get("state").and_then(Value::as_str) {
            Some("not-installed") => (
                true,
                "optional supervisor service is not installed".to_owned(),
            ),
            Some("unsupported") => (
                true,
                format!(
                    "optional supervisor service is unsupported on {}",
                    std::env::consts::OS
                ),
            ),
            Some("running") => {
                let label = value
                    .get("label")
                    .and_then(Value::as_str)
                    .unwrap_or("unknown");
                (
                    true,
                    format!("{label} running with verified binary and fresh tick"),
                )
            }
            Some(state) => (
                false,
                format!(
                    "supervisor service {state}: {}",
                    value
                        .get("degradedReason")
                        .and_then(Value::as_str)
                        .unwrap_or("run `forged service status`")
                ),
            ),
            None => (false, "runtime status returned no state".to_owned()),
        },
        Err(error) => (false, error.to_string()),
    }
}

fn service_request_fingerprint(command: &ServiceCmd) -> Result<String, Failure> {
    let payload = match command {
        ServiceCmd::Install(_) => json!({
            "operation": command.operation_name(),
            "binarySha256": current_binary_identity()?.sha256,
        }),
        ServiceCmd::Stop(args) => json!({
            "operation": command.operation_name(),
            "drain": args.drain,
            "timeoutSeconds": args.timeout_seconds,
        }),
        _ => json!({"operation": command.operation_name()}),
    };
    let bytes = serde_json::to_vec(&payload)
        .map_err(|error| Failure::internal(format!("serializing service request: {error}")))?;
    Ok(hex_digest(Sha256::digest(bytes)))
}

async fn execute_mutation<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    config: &ForgedConfig,
    command: ServiceCmd,
) -> Result<Value, Failure> {
    match command {
        ServiceCmd::Install(_) => install(host, paths, config, &LifecycleFaults::default()).await,
        ServiceCmd::Start(_) => start(host, paths, config).await,
        ServiceCmd::Stop(args) => stop(host, paths, config, args.drain, args.timeout_seconds).await,
        ServiceCmd::Restart(_) => match stop(host, paths, config, false, 0).await {
            Ok(_) => start(host, paths, config)
                .await
                .map(|_| json!({"schema": RUNTIME_OPERATION_SCHEMA, "action": "restarted"})),
            Err(error) => Err(error),
        },
        ServiceCmd::Uninstall(_) => uninstall(host, paths, config).await,
        ServiceCmd::Status(_) => {
            unreachable!("status is read-only and never takes the runtime lock")
        }
    }
}

async fn mutate_service<H: ServiceHost>(
    host: &H,
    paths: &RuntimePaths,
    config: &ForgedConfig,
    name: &str,
    key: &str,
    command: ServiceCmd,
) -> OperationResponse {
    if let Err(error) = paths.ensure_layout() {
        return err_response(key, &error);
    }
    let _lock = match RuntimeLock::acquire(paths) {
        Ok(lock) => lock,
        Err(error) => return err_response(key, &error),
    };
    let fingerprint = match service_request_fingerprint(&command) {
        Ok(fingerprint) => fingerprint,
        Err(error) => return err_response(key, &error),
    };
    match read_operation_receipt(paths, key) {
        Ok(Some(receipt)) => {
            if receipt.operation != name || receipt.fingerprint != fingerprint {
                return err_response(
                    key,
                    &Failure::refused(
                        ErrorCode::IdempotencyConflict,
                        "service idempotency key was already used for a different request",
                    ),
                );
            }
            if let Some(mut response) = receipt.response {
                response.reused = true;
                return response;
            }
            return err_response(
                key,
                &Failure {
                    code: ErrorCode::OperationInProgress,
                    message: "service operation has an unresolved in-progress receipt; use status and a new key to recover".to_owned(),
                    recoverable: true,
                },
            );
        }
        Ok(None) => {}
        Err(error) => return err_response(key, &error),
    }
    let now = now_iso();
    let mut receipt = OperationReceipt {
        schema: OPERATION_RECEIPT_SCHEMA.to_owned(),
        key: key.to_owned(),
        operation: name.to_owned(),
        fingerprint,
        state: OperationReceiptState::InProgress,
        response: None,
        started_at: now.clone(),
        updated_at: now,
    };
    if let Err(error) = write_operation_receipt(paths, &receipt) {
        return err_response(key, &error);
    }
    let result = match recover_incomplete(host, paths).await {
        Ok(()) => execute_mutation(host, paths, config, command).await,
        Err(error) => Err(error),
    };
    let response = match result {
        Ok(value) => ok_response(key, false, value),
        Err(error) => err_response(key, &error),
    };
    receipt.state = OperationReceiptState::Complete;
    receipt.response = Some(response.clone());
    receipt.updated_at = now_iso();
    if let Err(error) = write_operation_receipt(paths, &receipt) {
        return err_response(
            key,
            &Failure::refused(
                ErrorCode::HostUnavailable,
                format!(
                    "service action settled but its idempotency receipt did not: {error}; same-key replay is fenced"
                ),
            ),
        );
    }
    response
}

pub(crate) async fn dispatch_service(
    config: &ForgedConfig,
    command: ServiceCmd,
) -> OperationResponse {
    let name = command.operation_name();
    let is_status = matches!(command, ServiceCmd::Status(_));
    let key = command
        .idempotency_key()
        .map(str::to_owned)
        .unwrap_or_else(|| {
            if is_status {
                derive_key(name, None, None, None)
            } else {
                format!("op:{name}:{}", Uuid::now_v7())
            }
        });
    if !cfg!(target_os = "macos") && !is_status {
        return err_response(
            &key,
            &Failure::refused(
                ErrorCode::HostUnavailable,
                format!(
                    "supervisor service installation is supported only on macOS, not {}",
                    std::env::consts::OS
                ),
            ),
        );
    }
    let paths = match RuntimePaths::from_config(config) {
        Ok(paths) => paths,
        Err(error) => return err_response(&key, &error),
    };
    if is_status {
        return match service_status(config).await {
            Ok(value) => ok_response(&key, false, value),
            Err(error) => err_response(&key, &error),
        };
    }
    mutate_service(&LaunchdHost, &paths, config, name, &key, command).await
}

pub(crate) struct SupervisorObserver {
    path: PathBuf,
    status: SupervisorStatus,
}

impl SupervisorObserver {
    pub(crate) async fn start(config: &ForgedConfig, generation: &str) -> Result<Self, Failure> {
        validate_generation(generation)?;
        let paths = RuntimePaths::from_config(config)?;
        let manifest = read_manifest(&paths)?.ok_or_else(|| {
            Failure::invalid("service generation supplied without an installation")
        })?;
        if !manifest_matches_config(&manifest, config)? {
            return Err(Failure::refused(
                ErrorCode::HostUnavailable,
                "service environment does not match its immutable runtime manifest",
            ));
        }
        if manifest.generation != generation {
            return Err(Failure::refused(
                ErrorCode::HostUnavailable,
                format!(
                    "service generation {generation} is stale; current is {}",
                    manifest.generation
                ),
            ));
        }
        let binary = current_binary_identity()?;
        if binary.sha256 != manifest.binary.sha256 {
            return Err(Failure::refused(
                ErrorCode::HostUnavailable,
                "running supervisor binary does not match the runtime manifest",
            ));
        }
        let session = Uuid::now_v7().to_string();
        let dir = paths.status_dir(generation, &session);
        ensure_private_dir(&dir)?;
        let pid = i32::try_from(std::process::id())
            .map_err(|_| Failure::internal("supervisor PID does not fit i32"))?;
        let process_started_at = crate::adapters::ports::lstart_of(pid)
            .await
            .ok_or_else(|| Failure::internal("cannot verify supervisor process-start identity"))?;
        let now = now_iso();
        let status = SupervisorStatus {
            schema: SUPERVISOR_STATUS_SCHEMA.to_owned(),
            generation: generation.to_owned(),
            session,
            binary,
            pid,
            process_started_at,
            state: SupervisorProcessState::Starting,
            started_at: now.clone(),
            updated_at: now,
            stopped_at: None,
            stop_reason: None,
            ticks: 0,
            last_tick_at: None,
            last_successful_tick_at: None,
            next_wake_at: None,
            last_tick_id: None,
            last_error: None,
        };
        let observer = Self {
            path: dir.join("status.json"),
            status,
        };
        observer.write()?;
        Ok(observer)
    }

    fn write(&self) -> Result<(), Failure> {
        self.status.validate()?;
        atomic_json(&self.path, &self.status)
    }

    pub(crate) fn tick_succeeded(&mut self, report: &Value) -> Result<(), Failure> {
        let now = now_iso();
        self.status.state = SupervisorProcessState::Running;
        self.status.updated_at = now.clone();
        self.status.last_tick_at = Some(now.clone());
        self.status.last_successful_tick_at = Some(now);
        self.status.next_wake_at = report
            .get("nextWakeAt")
            .and_then(Value::as_str)
            .map(str::to_owned);
        self.status.last_tick_id = report
            .get("tickId")
            .and_then(Value::as_str)
            .map(str::to_owned);
        self.status.last_error = None;
        self.status.ticks = self.status.ticks.saturating_add(1);
        self.write()
    }

    pub(crate) fn degraded(&mut self, error: &str) -> Result<(), Failure> {
        self.status.state = SupervisorProcessState::Degraded;
        self.status.updated_at = now_iso();
        self.status.last_tick_at = Some(self.status.updated_at.clone());
        self.status.last_error = Some(error.to_owned());
        self.write()
    }

    pub(crate) fn stopped(&mut self, reason: &str) -> Result<(), Failure> {
        let now = now_iso();
        self.status.state = SupervisorProcessState::Stopped;
        self.status.updated_at = now.clone();
        self.status.stopped_at = Some(now);
        self.status.stop_reason = Some(reason.to_owned());
        self.write()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::{BTreeMap, HashMap};
    use std::sync::{Arc, Mutex};

    use crate::cli::{KeyOnly, ServiceStopArgs};
    use crate::config::HostPolicy;

    #[derive(Debug)]
    struct FakeState {
        observation: LaunchdObservation,
        actions: Vec<String>,
        ready_failures: usize,
        fail_bootout: bool,
    }

    impl Default for FakeState {
        fn default() -> Self {
            Self {
                observation: LaunchdObservation::absent("fake job is not loaded"),
                actions: Vec::new(),
                ready_failures: 0,
                fail_bootout: false,
            }
        }
    }

    #[derive(Clone, Default)]
    struct FakeHost(Arc<Mutex<FakeState>>);

    impl FakeHost {
        fn set_loaded(&self, manifest: &RuntimeManifest) {
            self.0.lock().expect("fake lock").observation = LaunchdObservation {
                loaded: true,
                running: true,
                pid: Some(42_424),
                last_exit_status: None,
                program: Some(manifest.binary.path.clone()),
                arguments: vec![
                    manifest.binary.path.clone(),
                    "supervise".to_owned(),
                    "--service-generation".to_owned(),
                    manifest.generation.clone(),
                ],
                detail: "state=running".to_owned(),
            };
        }

        fn set_stale_loaded(&self) {
            self.0.lock().expect("fake lock").observation = LaunchdObservation {
                loaded: true,
                running: true,
                pid: Some(42_424),
                last_exit_status: None,
                program: Some("/tmp/stale-forged".to_owned()),
                arguments: vec!["/tmp/stale-forged".to_owned(), "supervise".to_owned()],
                detail: "state=running".to_owned(),
            };
        }

        fn set_ready_failures(&self, failures: usize) {
            self.0.lock().expect("fake lock").ready_failures = failures;
        }

        fn set_fail_bootout(&self, fail: bool) {
            self.0.lock().expect("fake lock").fail_bootout = fail;
        }

        fn actions(&self) -> Vec<String> {
            self.0.lock().expect("fake lock").actions.clone()
        }
    }

    #[async_trait]
    impl ServiceHost for FakeHost {
        async fn inspect(&self, _paths: &RuntimePaths) -> Result<LaunchdObservation, Failure> {
            Ok(self.0.lock().expect("fake lock").observation.clone())
        }

        async fn bootstrap(&self, paths: &RuntimePaths) -> Result<(), Failure> {
            let manifest = read_manifest(paths)?
                .ok_or_else(|| Failure::internal("fake bootstrap has no manifest"))?;
            self.0
                .lock()
                .expect("fake lock")
                .actions
                .push("bootstrap".to_owned());
            self.set_loaded(&manifest);
            Ok(())
        }

        async fn bootout(&self, _paths: &RuntimePaths) -> Result<(), Failure> {
            let mut state = self.0.lock().expect("fake lock");
            state.actions.push("bootout".to_owned());
            if state.fail_bootout {
                return Err(Failure::refused(
                    ErrorCode::HostUnavailable,
                    "injected bootout failure",
                ));
            }
            state.observation = LaunchdObservation::absent("fake job is not loaded");
            Ok(())
        }

        async fn kickstart(&self, _paths: &RuntimePaths) -> Result<(), Failure> {
            let mut state = self.0.lock().expect("fake lock");
            state.actions.push("kickstart".to_owned());
            state.observation.loaded = true;
            state.observation.running = true;
            Ok(())
        }

        async fn await_ready(
            &self,
            _paths: &RuntimePaths,
            manifest: &RuntimeManifest,
        ) -> Result<(), Failure> {
            let mut state = self.0.lock().expect("fake lock");
            state.actions.push("await-ready".to_owned());
            if state.ready_failures > 0 {
                state.ready_failures -= 1;
                return Err(Failure::refused(
                    ErrorCode::HostUnavailable,
                    "injected readiness failure",
                ));
            }
            if !state.observation.running || !state.observation.authority_matches(manifest) {
                return Err(Failure::refused(
                    ErrorCode::HostUnavailable,
                    "fake authority is not ready",
                ));
            }
            Ok(())
        }
    }

    fn test_config(root: &Path) -> ForgedConfig {
        let anvil = root.join("anvil");
        ForgedConfig {
            anvil_home: anvil.clone(),
            runs_root: anvil.join("runs"),
            db_path: anvil.join("state.db"),
            config_path: anvil.join("config.yaml"),
            config_file_read: false,
            roster: HashMap::new(),
            profiles: BTreeMap::new(),
            rosters: BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            bd_path: anvil.join("tools/bd"),
            beads_dir: anvil.join("beads"),
            codex_home: root.join("home/.codex"),
            host_policy: HostPolicy::Preferred,
            herdr_sock: None,
            pricing: crate::pricing::default_rate_card(),
            admission: crate::config::AdmissionPolicy::default(),
        }
    }

    fn setup() -> (tempfile::TempDir, ForgedConfig, RuntimePaths) {
        let root = tempfile::tempdir().expect("tempdir");
        let canonical_root = fs::canonicalize(root.path()).expect("canonical tempdir");
        let config = test_config(&canonical_root);
        let home = canonical_root.join("home");
        fs::create_dir_all(&config.anvil_home).expect("anvil home");
        fs::create_dir_all(&config.runs_root).expect("runs root");
        fs::create_dir_all(&config.beads_dir).expect("beads dir");
        fs::create_dir_all(&home).expect("home");
        let paths = RuntimePaths::new(&config.anvil_home, &home, 501).expect("runtime paths");
        (root, config, paths)
    }

    fn seed_old_install(
        root: &Path,
        config: &ForgedConfig,
        paths: &RuntimePaths,
    ) -> RuntimeManifest {
        paths.ensure_layout().expect("layout");
        let source = root.join("old-forged");
        fs::write(&source, b"old forged executable").expect("old executable");
        fs::set_permissions(&source, fs::Permissions::from_mode(0o700)).expect("old mode");
        let mut identity = binary_identity(&source).expect("old identity");
        identity.runtime_abi = "forged.controller-runtime/0".to_owned();
        let target = copy_content_addressed(paths, &source, &identity).expect("publish old");
        let manifest = new_manifest(paths, config, identity).expect("old manifest");
        assert_eq!(Path::new(&manifest.binary.path), target);
        switch_current(paths, &target).expect("old current");
        atomic_json(&paths.manifest, &manifest).expect("old manifest write");
        atomic_write(
            &paths.plist,
            render_plist(paths, &manifest).as_bytes(),
            0o600,
        )
        .expect("old plist");
        manifest
    }

    fn keyed(value: &str) -> KeyOnly {
        KeyOnly {
            idempotency_key: Some(value.to_owned()),
        }
    }

    #[tokio::test]
    async fn fake_lifecycle_rolls_back_replays_keys_and_removes_current_safely() {
        let (root, config, paths) = setup();
        let old = seed_old_install(root.path(), &config, &paths);
        let host = FakeHost::default();
        host.set_loaded(&old);
        host.set_ready_failures(1);

        let failed = mutate_service(
            &host,
            &paths,
            &config,
            "service_install",
            "install-fail",
            ServiceCmd::Install(keyed("install-fail")),
        )
        .await;
        assert!(!failed.ok, "candidate readiness failure is reported");
        assert_eq!(
            read_manifest(&paths)
                .expect("manifest")
                .expect("old manifest"),
            old
        );
        assert_eq!(
            fs::read_link(&paths.current).expect("old current"),
            PathBuf::from(&old.binary.path)
        );
        assert!(host
            .inspect(&paths)
            .await
            .expect("fake inspect")
            .authority_matches(&old));

        let installed = mutate_service(
            &host,
            &paths,
            &config,
            "service_install",
            "install-ok",
            ServiceCmd::Install(keyed("install-ok")),
        )
        .await;
        assert!(installed.ok, "upgrade succeeds: {installed:?}");
        let current = read_manifest(&paths)
            .expect("manifest")
            .expect("installed manifest");
        assert_eq!(current.binary.runtime_abi, CONTROLLER_RUNTIME_ABI);
        assert_ne!(current.generation, old.generation);

        let action_count = host.actions().len();
        let replay = mutate_service(
            &host,
            &paths,
            &config,
            "service_install",
            "install-ok",
            ServiceCmd::Install(keyed("install-ok")),
        )
        .await;
        assert!(replay.ok && replay.reused);
        assert_eq!(
            host.actions().len(),
            action_count,
            "same-key replay is inert"
        );

        let conflict = mutate_service(
            &host,
            &paths,
            &config,
            "service_start",
            "install-ok",
            ServiceCmd::Start(keyed("install-ok")),
        )
        .await;
        assert_eq!(
            conflict.error.expect("conflict").code,
            ErrorCode::IdempotencyConflict
        );

        let distinct = mutate_service(
            &host,
            &paths,
            &config,
            "service_install",
            "install-reconcile",
            ServiceCmd::Install(keyed("install-reconcile")),
        )
        .await;
        assert!(distinct.ok && !distinct.reused);
        assert!(
            host.actions().len() > action_count,
            "different key executes"
        );

        let stopped = mutate_service(
            &host,
            &paths,
            &config,
            "service_stop",
            "stop-1",
            ServiceCmd::Stop(ServiceStopArgs {
                drain: true,
                timeout_seconds: 0,
                idempotency_key: Some("stop-1".to_owned()),
            }),
        )
        .await;
        assert!(stopped.ok, "stop succeeds: {stopped:?}");
        let started = mutate_service(
            &host,
            &paths,
            &config,
            "service_start",
            "start-1",
            ServiceCmd::Start(keyed("start-1")),
        )
        .await;
        assert!(started.ok, "start succeeds: {started:?}");

        let removed = mutate_service(
            &host,
            &paths,
            &config,
            "service_uninstall",
            "uninstall-1",
            ServiceCmd::Uninstall(keyed("uninstall-1")),
        )
        .await;
        assert!(removed.ok, "uninstall succeeds: {removed:?}");
        assert!(!paths.current.exists());
        assert!(!paths.manifest.exists());
        assert!(!paths.plist.exists());
        assert!(paths.binary_path(&current.binary.sha256).exists());

        let removed_again = mutate_service(
            &host,
            &paths,
            &config,
            "service_uninstall",
            "uninstall-2",
            ServiceCmd::Uninstall(keyed("uninstall-2")),
        )
        .await;
        assert!(removed_again.ok);
        assert_eq!(
            removed_again.result.expect("result")["action"],
            json!("already-uninstalled")
        );
    }

    #[tokio::test]
    async fn every_post_stop_install_seam_restores_prior_authority() {
        let (root, config, paths) = setup();
        let old = seed_old_install(root.path(), &config, &paths);
        let host = FakeHost::default();
        host.set_loaded(&old);
        for seam in [
            "prior-stopped-transition",
            "current-switch",
            "plist-write",
            "manifest-write",
            "switched-transition",
            "started-transition",
            "complete-transition",
        ] {
            let error = install(
                &host,
                &paths,
                &config,
                &LifecycleFaults {
                    fail_at: Some(seam),
                },
            )
            .await
            .expect_err("injected seam fails");
            assert!(error.to_string().contains("prior authority was restored"));
            assert_eq!(
                read_manifest(&paths)
                    .expect("manifest")
                    .expect("old manifest"),
                old,
                "manifest restored after {seam}"
            );
            assert_eq!(
                fs::read_link(&paths.current).expect("current"),
                PathBuf::from(&old.binary.path),
                "current restored after {seam}"
            );
            assert!(
                host.inspect(&paths)
                    .await
                    .expect("inspect")
                    .authority_matches(&old),
                "launchd authority restored after {seam}"
            );
        }
    }

    #[tokio::test]
    async fn failed_candidate_bootout_keeps_transition_unresolved_and_authority_intact() {
        let (_root, config, paths) = setup();
        paths.ensure_layout().expect("layout");
        let host = FakeHost::default();
        host.set_ready_failures(1);
        host.set_fail_bootout(true);
        let error = install(&host, &paths, &config, &LifecycleFaults::default())
            .await
            .expect_err("rollback fence fails");
        assert!(error.to_string().contains("rollback remains unresolved"));
        let candidate = read_manifest(&paths)
            .expect("manifest")
            .expect("candidate authority retained");
        assert!(host
            .inspect(&paths)
            .await
            .expect("inspect")
            .authority_matches(&candidate));
        assert!(paths
            .current
            .symlink_metadata()
            .expect("current")
            .file_type()
            .is_symlink());
        let unresolved = unresolved_transitions(&paths).expect("transitions");
        assert_eq!(unresolved.len(), 1);
        assert_ne!(unresolved[0].phase, TransitionPhase::RolledBack);
    }

    #[tokio::test]
    async fn malformed_empty_stale_and_unsafe_controller_sentinels_block() {
        let (_root, config, _paths) = setup();
        let controller = config.runs_root.join("run-1/controller");
        let status = controller.join("status/1/proc-1/status");
        fs::create_dir_all(status.parent().expect("status parent")).expect("status dirs");
        let pid = i32::try_from(std::process::id()).expect("pid");
        let lstart = "test-process-start".to_owned();
        let record_path = controller.join("controller.json");
        let write_record = |status_path: &Path, abi: &str| {
            atomic_json(
                &record_path,
                &json!({
                    "schemaVersion": 1,
                    "id": "run-1",
                    "generation": 1,
                    "sessionId": "proc-1",
                    "driver": {"pid": pid, "lstart": lstart},
                    "binary": {"runtimeAbi": abi},
                    "statusPath": status_path,
                }),
            )
            .expect("controller record");
        };

        fs::write(&status, b"").expect("empty sentinel");
        write_record(&status, "forged.controller-runtime/0");
        assert_eq!(
            controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI))
                .await
                .expect("blockers")
                .len(),
            1
        );
        fs::write(&status, b"not-an-exit-code\n").expect("corrupt sentinel");
        assert_eq!(
            controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI))
                .await
                .expect("blockers")
                .len(),
            1
        );

        let stale = controller.join("status/0/old/status");
        fs::create_dir_all(stale.parent().expect("stale parent")).expect("stale dirs");
        fs::write(&stale, b"0\n").expect("stale sentinel");
        write_record(&stale, "forged.controller-runtime/0");
        assert_eq!(
            controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI))
                .await
                .expect("blockers")
                .len(),
            1
        );

        fs::remove_file(&status).expect("remove corrupt sentinel");
        fs::create_dir(&status).expect("sentinel directory");
        write_record(&status, "forged.controller-runtime/0");
        assert_eq!(
            controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI))
                .await
                .expect("blockers")
                .len(),
            1
        );
        fs::remove_dir(&status).expect("remove sentinel directory");
        fs::write(&status, b"0\n").expect("valid sentinel");
        assert!(
            controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI))
                .await
                .expect("blockers")
                .is_empty()
        );
    }

    #[tokio::test]
    async fn old_abi_manifest_upgrades_only_after_incompatible_controller_clears() {
        let (root, config, paths) = setup();
        let old = seed_old_install(root.path(), &config, &paths);
        let host = FakeHost::default();
        host.set_loaded(&old);
        let controller = config.runs_root.join("run-old/controller");
        fs::create_dir_all(&controller).expect("controller dir");
        let status = controller.join("status/1/proc-old/status");
        let write_record = |abi: &str| {
            atomic_json(
                &controller.join("controller.json"),
                &json!({
                    "schemaVersion": 1,
                    "id": "run-old",
                    "generation": 1,
                    "sessionId": "proc-old",
                    "driver": {"pid": std::process::id(), "lstart": "unverifiable"},
                    "binary": {"runtimeAbi": abi},
                    "statusPath": status,
                }),
            )
            .expect("controller record");
        };
        write_record("forged.controller-runtime/0");
        let blocked = install(&host, &paths, &config, &LifecycleFaults::default())
            .await
            .expect_err("incompatible controller blocks ABI upgrade");
        assert!(blocked.to_string().contains("drain required"));
        assert!(host
            .inspect(&paths)
            .await
            .expect("inspect")
            .authority_matches(&old));

        write_record(CONTROLLER_RUNTIME_ABI);
        let upgraded = install(&host, &paths, &config, &LifecycleFaults::default())
            .await
            .expect("compatible live controller permits upgrade");
        assert_eq!(upgraded["action"], json!("upgraded"));
        assert_eq!(
            read_manifest(&paths)
                .expect("manifest")
                .expect("current")
                .binary
                .runtime_abi,
            CONTROLLER_RUNTIME_ABI
        );
    }

    #[tokio::test]
    async fn controller_admission_serializes_lifecycle_and_rejects_stale_binary() {
        let (root, config, paths) = setup();
        let mut manifest = seed_old_install(root.path(), &config, &paths);
        let stale = match ControllerAdmission::acquire_at(&config, "run-admit", 1, &paths) {
            Ok(_) => panic!("old binary ABI must refuse against newer/different authority"),
            Err(error) => error,
        };
        assert_eq!(stale.code, ErrorCode::HostUnavailable);

        manifest.binary.runtime_abi = CONTROLLER_RUNTIME_ABI.to_owned();
        atomic_json(&paths.manifest, &manifest).expect("same-ABI stale manifest");
        let stale_sha = match ControllerAdmission::acquire_at(&config, "run-admit", 1, &paths) {
            Ok(_) => panic!("same-ABI stale binary must refuse after an upgrade"),
            Err(error) => error,
        };
        assert_eq!(stale_sha.code, ErrorCode::HostUnavailable);

        let current = current_binary_identity().expect("current identity");
        let target = copy_content_addressed(&paths, Path::new(&current.path), &current)
            .expect("publish current binary");
        manifest = new_manifest(&paths, &config, current).expect("current manifest");
        atomic_json(&paths.manifest, &manifest).expect("compatible manifest");
        switch_current(&paths, &target).expect("current binary projection");

        let transition = RuntimeTransition {
            schema: TRANSITION_SCHEMA.to_owned(),
            id: Uuid::now_v7().to_string(),
            kind: TransitionKind::Upgrade,
            phase: TransitionPhase::Switched,
            previous: None,
            previous_loaded: false,
            candidate: Some(manifest.clone()),
            started_at: now_iso(),
            updated_at: now_iso(),
            error: None,
        };
        write_transition(&paths, &transition).expect("unresolved transition");
        let unresolved = match ControllerAdmission::acquire_at(&config, "run-admit", 1, &paths) {
            Ok(_) => panic!("unresolved lifecycle transition must fence controller admission"),
            Err(error) => error,
        };
        assert_eq!(unresolved.code, ErrorCode::OperationInProgress);
        let mut terminal = transition;
        terminal.phase = TransitionPhase::Complete;
        terminal.updated_at = now_iso();
        write_transition(&paths, &terminal).expect("terminal transition");

        let mut admission = ControllerAdmission::acquire_at(&config, "run-admit", 1, &paths)
            .expect("compatible admission");
        assert_eq!(admission.binary().path, target.to_string_lossy());
        let lifecycle = match RuntimeLock::acquire(&paths) {
            Ok(_) => panic!("spawn admission must hold the lifecycle lock"),
            Err(error) => error,
        };
        assert_eq!(lifecycle.code, ErrorCode::OperationInProgress);
        admission
            .mark_spawned(12_345, "test-start".to_owned())
            .expect("spawn identity");
        drop(admission);

        let _lifecycle = RuntimeLock::acquire(&paths).expect("lifecycle lock after spawn exits");
        let blockers = controller_blockers(&config.runs_root, Some(CONTROLLER_RUNTIME_ABI))
            .await
            .expect("admission blocker");
        assert_eq!(blockers.len(), 1);
        assert_eq!(blockers[0].state, "admitting");
        drop(_lifecycle);
        remove_if_present(
            &canonicalize_anchor(
                &config
                    .run_dir("run-admit")
                    .join("controller/runtime-admission.json"),
            )
            .expect("admission path"),
        )
        .expect("remove test admission");

        let mut ambiguous = ControllerAdmission::acquire_at(&config, "run-ambiguous", 1, &paths)
            .expect("ambiguous spawn admission");
        ambiguous.preserve_spawn_attempt();
        drop(ambiguous);
        let ambiguous_path = config
            .run_dir("run-ambiguous")
            .join("controller/runtime-admission.json");
        assert!(
            ambiguous_path.exists(),
            "an ambiguous spawn result must leave its lifecycle fence"
        );
        remove_if_present(&ambiguous_path).expect("remove ambiguous fixture");

        let lifecycle = RuntimeLock::acquire(&paths).expect("lifecycle first");
        let blocked = match ControllerAdmission::acquire_at(&config, "run-admit", 2, &paths) {
            Ok(_) => panic!("spawn must wait while lifecycle is exclusive"),
            Err(error) => error,
        };
        assert_eq!(blocked.code, ErrorCode::OperationInProgress);
        drop(lifecycle);
        let compatible = ControllerAdmission::acquire_at(&config, "run-admit", 2, &paths)
            .expect("compatible spawn");
        compatible
            .complete()
            .expect("complete compatible admission");

        let outside = root.path().join("controller-outside");
        fs::create_dir_all(&outside).expect("outside controller dir");
        symlink(&outside, config.run_dir("run-symlink")).expect("run symlink fixture");
        assert!(
            ControllerAdmission::acquire_at(&config, "run-symlink", 1, &paths).is_err(),
            "controller admission must not follow a symlinked run directory"
        );
    }

    #[test]
    fn launchd_print_is_fail_closed_and_parses_exact_loaded_authority() {
        let (_root, _config, paths) = setup();
        let not_found = format!(
            "Could not find service \"{}\" in domain for user gui: 501",
            paths.label
        );
        assert!(
            !parse_launchd_print(&paths, false, "", &not_found)
                .expect("exact absence")
                .loaded
        );
        assert!(parse_launchd_print(&paths, false, "", "Not privileged").is_err());
        assert!(parse_launchd_print(&paths, false, "", "Bad request.").is_err());

        let output = "state = running\nprogram = /immutable/forged\narguments = {\n0 = /immutable/forged\n1 = supervise\n2 = --service-generation\n3 = 00000000-0000-0000-0000-000000000000\n}\npid = 123\nlast exit code = 0\n";
        let observed = parse_launchd_print(&paths, true, output, "").expect("loaded parse");
        assert!(observed.loaded && observed.running);
        assert_eq!(observed.pid, Some(123));
        assert_eq!(observed.program.as_deref(), Some("/immutable/forged"));
        assert_eq!(observed.arguments.len(), 4);
    }

    #[tokio::test]
    async fn status_rejects_stale_loaded_program_even_when_plist_is_current() {
        let (root, config, paths) = setup();
        let manifest = seed_old_install(root.path(), &config, &paths);
        let host = FakeHost::default();
        host.set_stale_loaded();
        let status = status_with_host(&host, &paths).await.expect("status");
        assert_eq!(status["state"], json!("mismatched"));
        assert_eq!(status["programVerified"], json!(false));
        assert_eq!(status["launchd"]["pid"], json!(42_424));
        assert_eq!(status["manifest"]["generation"], json!(manifest.generation));
    }

    #[test]
    fn content_publish_never_replaces_a_winner() {
        let root = tempfile::tempdir().expect("tempdir");
        let canonical = fs::canonicalize(root.path()).expect("canonical tempdir");
        let staged = canonical.join("staged");
        let target = canonical.join("target");
        fs::write(&staged, b"same").expect("staged");
        fs::write(&target, b"same").expect("winner");
        let identity = binary_identity(&staged).expect("identity");
        publish_content_addressed(&staged, &target, &identity).expect("adopt winner");
        assert_eq!(fs::read(&target).expect("target"), b"same");
        assert!(!staged.exists());

        fs::write(&staged, b"candidate").expect("second staged");
        let candidate = binary_identity(&staged).expect("candidate identity");
        let error = publish_content_addressed(&staged, &target, &candidate)
            .expect_err("mismatched winner refuses");
        assert!(error.to_string().contains("publish race"));
        assert_eq!(fs::read(&target).expect("winner unchanged"), b"same");
    }

    #[test]
    fn descendant_symlink_escape_refuses_but_canonical_temp_anchor_works() {
        let root = tempfile::tempdir().expect("tempdir");
        let anvil = root.path().join("anvil");
        let home = root.path().join("home");
        let outside = root.path().join("outside");
        fs::create_dir_all(&anvil).expect("anvil");
        fs::create_dir_all(&home).expect("home");
        fs::create_dir_all(&outside).expect("outside");
        symlink(&outside, anvil.join("runtime")).expect("runtime attack symlink");
        let paths = RuntimePaths::new(&anvil, &home, 501).expect("canonical anchors");
        assert!(paths.ensure_layout().is_err());
    }

    #[test]
    fn persisted_schemas_and_runtime_abi_are_closed() {
        let (root, config, paths) = setup();
        let manifest = seed_old_install(root.path(), &config, &paths);
        assert_eq!(manifest.binary.runtime_abi, "forged.controller-runtime/0");
        assert!(
            manifest.validate().is_ok(),
            "old versioned ABI remains readable"
        );
        assert!(validate_runtime_abi("other-runtime/1").is_err());
        assert!(validate_runtime_abi("forged.controller-runtime/01").is_err());

        let mut manifest_json = serde_json::to_value(&manifest).expect("manifest JSON");
        manifest_json["unexpected"] = json!(true);
        assert!(serde_json::from_value::<RuntimeManifest>(manifest_json).is_err());

        let mut outside = manifest.clone();
        outside.binary.path = root
            .path()
            .join("outside-forged")
            .to_string_lossy()
            .into_owned();
        atomic_json(&paths.manifest, &outside).expect("tampered manifest fixture");
        assert!(read_manifest(&paths).is_err(), "outside-bin path refuses");
        outside = manifest.clone();
        outside.anvil_home = root
            .path()
            .join("other-anvil")
            .to_string_lossy()
            .into_owned();
        atomic_json(&paths.manifest, &outside).expect("tampered anvil fixture");
        assert!(
            read_manifest(&paths).is_err(),
            "ANVIL_HOME mismatch refuses"
        );
        atomic_json(&paths.manifest, &manifest).expect("restore manifest");

        let status = RuntimeStatus {
            schema: RUNTIME_STATUS_SCHEMA.to_owned(),
            state: RuntimeServiceState::Stopped,
            platform: "test".to_owned(),
            supported: true,
            label: paths.label.clone(),
            domain: paths.domain.clone(),
            manifest: Some(manifest),
            launchd: Some(LaunchdObservation::absent("stopped")),
            supervisor: None,
            binary_verified: Some(true),
            current_verified: Some(true),
            program_verified: Some(true),
            process_identity_verified: None,
            transitions: 0,
            degraded_reason: None,
        };
        let mut status_json = serde_json::to_value(status).expect("status JSON");
        status_json["unexpected"] = json!(true);
        assert!(serde_json::from_value::<RuntimeStatus>(status_json).is_err());
    }
}
