//! Environment doctor: six probes, no process exits, no panics on absent
//! tools (the bin slice decides policy).
//!
//! The scratch-HOME treatment applies to bd children ONLY: the `gh` child
//! inherits the REAL environment and the real `HOME` (under a scratch `HOME`,
//! `gh auth status` cannot see `~/.config/gh/hosts.yml` and would report
//! not-ok on a fully authenticated machine), and the default herdr socket
//! path resolves against the operator's real home.

use std::future::Future;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::time::Duration;

use serde_json::Value;

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::envelope;
use crate::invoke;
use crate::lease;

/// Per-probe timeout: probes report `ok: false` with detail
/// "timed out after 10s" rather than hanging.
const PROBE_TIMEOUT_S: u64 = 10;

/// Configuration for a doctor run.
#[derive(Debug, Clone)]
pub struct DoctorConfig {
    /// The bd wrapper config the live probes run against.
    pub bd: BdConfig,
    /// Parent under which the lease-liveness probe creates — and afterwards
    /// removes — its scratch `HOME` and `BEADS_DIR`.
    pub scratch_root: PathBuf,
    /// Explicit herdr socket path; when `None`, `$HERDR_SOCK` from the real
    /// environment, else `<real HOME>/.config/herdr/herdr.sock`.
    pub herdr_sock: Option<PathBuf>,
}

/// One probe's outcome.
#[derive(Debug, Clone)]
pub struct ProbeResult {
    /// The probe's stable name.
    pub name: &'static str,
    /// Whether the probe passed.
    pub ok: bool,
    /// Human-readable detail either way.
    pub detail: String,
}

async fn probe<F>(name: &'static str, body: F) -> ProbeResult
where
    F: Future<Output = Result<String, String>>,
{
    match tokio::time::timeout(Duration::from_secs(PROBE_TIMEOUT_S), body).await {
        Err(_) => ProbeResult {
            name,
            ok: false,
            detail: "timed out after 10s".to_string(),
        },
        Ok(Ok(detail)) => ProbeResult {
            name,
            ok: true,
            detail,
        },
        Ok(Err(detail)) => ProbeResult {
            name,
            ok: false,
            detail,
        },
    }
}

/// Run the six probes, emitted in exactly this order: `bd-version`,
/// `bd-lease-liveness`, `beads-dir-resolves`, `gh-auth`, `herdr-ping`,
/// `anvil-home-writable`. Never panics: a missing bd binary yields
/// `ok: false` probes and the run still returns six results.
pub async fn run_doctor(cfg: DoctorConfig) -> Vec<ProbeResult> {
    let mut results = Vec::with_capacity(6);
    results.push(probe("bd-version", bd_version(&cfg)).await);
    results.push(lease_liveness(&cfg).await);
    results.push(probe("beads-dir-resolves", beads_dir_resolves(&cfg)).await);
    results.push(probe("gh-auth", gh_auth()).await);
    results.push(probe("herdr-ping", herdr_ping(&cfg)).await);
    results.push(probe("anvil-home-writable", anvil_home_writable(&cfg)).await);
    results
}

/// `<bd_path> version --json` (works with no DB), requiring a semver
/// `>= 1.2.0` and `< 2.0.0`.
///
/// Observed envelope (bd 1.2.1 under `BD_JSON_ENVELOPE=1`):
/// `{"data": {"build": "dev", "commit": "634cbbc4...", "version": "1.2.1"},
/// "schema_version": 1}`. (Without the envelope var the same fields arrive
/// at top level; both shapes are read.)
async fn bd_version(cfg: &DoctorConfig) -> Result<String, String> {
    let out = invoke::run_bd(
        &cfg.bd,
        &["version", "--json"],
        PROBE_TIMEOUT_S,
        "bd version",
    )
    .await
    .map_err(|e| e.to_string())?;
    if out.exit != Some(0) {
        return Err(format!("bd version exited {:?}: {}", out.exit, out.stderr));
    }
    let parsed: Value = serde_json::from_str(&out.stdout)
        .map_err(|e| format!("unparseable version output ({e}): {}", out.stdout))?;
    let version = parsed
        .get("data")
        .and_then(|d| envelope::first_obj(d))
        .and_then(|o| o.get("version"))
        .or_else(|| parsed.get("version"))
        .and_then(Value::as_str)
        .ok_or_else(|| format!("no version field in {}", out.stdout))?;
    let mut parts = version.split('.');
    let major: u64 = parts
        .next()
        .and_then(|p| p.parse().ok())
        .ok_or_else(|| format!("unparseable semver {version}"))?;
    let minor: u64 = parts.next().and_then(|p| p.parse().ok()).unwrap_or(0);
    if major == 1 && minor >= 2 {
        Ok(format!("bd {version}"))
    } else {
        Err(format!("bd {version} outside the required >=1.2.0, <2.0.0"))
    }
}

/// On a scratch `BEADS_DIR` under a scratch `HOME` (both fresh dirs created
/// under `scratch_root`): initialize the scratch store (see
/// [`bootstrap_probe_store`] for the guarded, narrowly sanctioned `bd init`),
/// create a probe bead, claim / heartbeat as actor `doctor`, then a heartbeat
/// as actor `doctor-other` which MUST be refused. All four behaviors green ⇒
/// ok. The scratch dirs are removed afterwards (even on failure or timeout),
/// leaving `scratch_root` empty.
async fn lease_liveness(cfg: &DoctorConfig) -> ProbeResult {
    let base = cfg
        .scratch_root
        .join(format!("lease-liveness-{}", std::process::id()));
    let result = probe("bd-lease-liveness", lease_liveness_body(cfg, &base)).await;
    // Cleanup runs outside the probe timeout so a timed-out probe still
    // leaves scratch_root empty.
    let _ = std::fs::remove_dir_all(&base);
    result
}

async fn lease_liveness_body(cfg: &DoctorConfig, base: &Path) -> Result<String, String> {
    let home = base.join("home");
    let beads = base.join("beads");
    let anvil = base.join("anvil");
    for dir in [&home, &beads, &anvil] {
        std::fs::create_dir_all(dir).map_err(|e| format!("creating {}: {e}", dir.display()))?;
    }
    let scratch = BdConfig {
        bd_path: cfg.bd.bd_path.clone(),
        beads_dir: beads.clone(),
        home_override: Some(home),
        anvil_home: anvil,
        work_dir: beads.clone(),
        read_timeout_s: PROBE_TIMEOUT_S,
        write_timeout_s: PROBE_TIMEOUT_S,
    };
    // The hazard the pre-store calls carry: a bd call against an
    // UNINITIALIZED $BEADS_DIR falls back to CWD-ancestor workspace discovery,
    // so a stray `.beads` above the cwd (the operator's machine-global
    // `~/.beads` sits above every path under a home-dir checkout) would
    // silently receive the probe's writes. Every pre-store call therefore runs
    // from an ancestor-clean cwd under the system temp dir, and the store is
    // verified to have landed in the scratch dir before anything else runs.
    let clean_cwd = std::env::temp_dir().join(format!("forged-doctor-init-{}", std::process::id()));
    std::fs::create_dir_all(&clean_cwd)
        .map_err(|e| format!("creating ancestor-clean cwd {}: {e}", clean_cwd.display()))?;
    let clean_cfg = BdConfig {
        work_dir: clean_cwd.clone(),
        ..scratch.clone()
    };
    let bootstrap = bootstrap_probe_store(cfg, &clean_cfg).await;
    let _ = std::fs::remove_dir_all(&clean_cwd);
    let data = bootstrap?;
    let id = envelope::first_obj(&data)
        .and_then(|o| o.get("id"))
        .and_then(Value::as_str)
        .ok_or_else(|| format!("create returned no id: {data}"))?;
    lease::claim_specific(&scratch, id, "doctor")
        .await
        .map_err(|e| format!("scratch claim failed: {e}"))?;
    lease::heartbeat(&scratch, id, "doctor")
        .await
        .map_err(|e| format!("owner heartbeat failed: {e}"))?;
    match lease::heartbeat(&scratch, id, "doctor-other").await {
        Err(BdError::HeartbeatRefused { .. }) => {
            Ok("create/claim/heartbeat ok; wrong-actor heartbeat refused".to_string())
        }
        Ok(()) => Err("wrong-actor heartbeat was unexpectedly accepted".to_string()),
        Err(e) => Err(format!(
            "wrong-actor heartbeat failed with {e} (expected a refusal)"
        )),
    }
}

/// Bring the probe's scratch store into existence, then create the probe
/// bead in it. Both calls are single-shot (a diagnostic probe retries
/// nothing) and run from the ancestor-clean cwd `clean_cfg` pins. Returns the
/// create's envelope `data`.
///
/// `bd init` is forbidden throughout this crate — with ONE narrowly
/// adjudicated exception, this probe (spec amendment 2026-08-12). The pinned
/// bd 1.2.1 (build `634cbbc4`) does NOT auto-initialize on first create:
/// `bd create` against an empty `$BEADS_DIR` exits 1 with
/// `no beads database found` and initializes nothing, so without an init the
/// create → claim → heartbeat → wrong-actor-refusal behavior this probe
/// exists to check could never be exercised at all.
///
/// The exception is conditional on two MANDATORY guards, and a guard failure
/// REFUSES — it never falls back to initializing something else:
///   1. the target must be the EMPTY directory this probe just created under
///      `cfg.scratch_root` — checked as both, a path inside `scratch_root`
///      and a directory with nothing in it yet; and
///   2. it must not be the operator's configured `beads_dir` (nor, for the
///      same reason, the configured `anvil_home`).
///
/// bd may additionally refuse a given temp path as an "unsafe location"; that
/// refusal is the probe's `ok: false` detail, not a cue to try another
/// bootstrap strategy. `bd init` stays absent from every other source file
/// (source-grep enforced in `tests/audit_doctor.rs`).
async fn bootstrap_probe_store(cfg: &DoctorConfig, clean_cfg: &BdConfig) -> Result<Value, String> {
    let target = &clean_cfg.beads_dir;
    if !target.starts_with(&cfg.scratch_root) {
        return Err(format!(
            "refusing to initialize {}: outside the probe's scratch root {}",
            target.display(),
            cfg.scratch_root.display()
        ));
    }
    if same_dir(target, &cfg.bd.anvil_home) || same_dir(target, &cfg.bd.beads_dir) {
        return Err(format!(
            "refusing to initialize {}: it is the operator's own store or anvil home, not scratch",
            target.display()
        ));
    }
    let mut entries = std::fs::read_dir(target).map_err(|e| {
        format!(
            "refusing to initialize {}: unreadable ({e})",
            target.display()
        )
    })?;
    if entries.next().is_some() {
        return Err(format!(
            "refusing to initialize {}: not the empty directory this probe just created",
            target.display()
        ));
    }
    // Inert init: a bare one writes CLAUDE.md, AGENTS.md, .claude/ and
    // .agents/ into its cwd.
    let init_args = [
        "init",
        "--prefix",
        "probe",
        "--non-interactive",
        "--quiet",
        "--skip-agents",
        "--skip-hooks",
    ];
    let init = invoke::run_locked_once(clean_cfg, &init_args, "bd init")
        .await
        .map_err(|e| format!("scratch init failed: {e}"))?;
    if init.exit != Some(0) {
        return Err(format!(
            "bd refused to initialize the scratch store (exit {:?}); stdout: {}; stderr: {}",
            init.exit,
            init.stdout.trim(),
            init.stderr.trim()
        ));
    }
    // Containment: the store bd just initialized must be the SCRATCH one, not
    // an ancestor's that CWD discovery found.
    if !target.join("config.yaml").exists() {
        return Err(format!(
            "the scratch store did not land in {} — CWD-ancestor discovery must never win over \
             BEADS_DIR; refusing to continue",
            target.display()
        ));
    }
    let out = invoke::run_locked_once(
        clean_cfg,
        &["create", "doctor probe", "--json"],
        "bd create",
    )
    .await
    .map_err(|e| format!("scratch create failed: {e}"))?;
    if out.exit != Some(0) {
        return Err(format!(
            "creating the probe bead failed (exit {:?}); stdout: {}; stderr: {}",
            out.exit,
            out.stdout.trim(),
            out.stderr.trim()
        ));
    }
    envelope::parse_lenient(&out.stdout)
        .data
        .ok_or_else(|| format!("create returned no envelope data: {}", out.stdout))
}

/// Whether two paths name the same directory, comparing canonicalized forms
/// when both resolve (`/tmp` vs `/private/tmp` on macOS) and the given forms
/// otherwise.
fn same_dir(a: &Path, b: &Path) -> bool {
    let canon = |p: &Path| std::fs::canonicalize(p).unwrap_or_else(|_| p.to_path_buf());
    canon(a) == canon(b)
}

/// Prove the operator's LIVE store and backend identity still resolve.
///
/// A non-empty `bd list` proves useful data is visible, `bd where` proves
/// CWD discovery did not redirect the configured workspace, and `bd dolt
/// show` names the actual embedded/server database operators are sharing.
/// Read-only; takes no lock; writes nothing.
async fn beads_dir_resolves(cfg: &DoctorConfig) -> Result<String, String> {
    let data = invoke::read(&cfg.bd, &["list", "--json"])
        .await
        .map_err(|e| e.to_string())?;
    let issue_count = match envelope::as_list(&data) {
        Some(items) if !items.is_empty() => items.len(),
        _ => {
            return Err(format!(
                "bd resolved an empty store at {} — not the operator's live database?",
                cfg.bd.beads_dir.display()
            ))
        }
    };
    let where_data = invoke::read(&cfg.bd, &["where", "--json"])
        .await
        .map_err(|e| format!("bd where: {e}"))?;
    let where_obj = envelope::first_obj(&where_data)
        .ok_or_else(|| format!("bd where returned no identity: {where_data}"))?;
    let resolved = where_obj
        .get("path")
        .and_then(Value::as_str)
        .map(PathBuf::from)
        .ok_or_else(|| format!("bd where returned no workspace path: {where_data}"))?;
    if !same_dir(&resolved, &cfg.bd.beads_dir) {
        return Err(format!(
            "configured BEADS_DIR {} resolved to {}; refusing shadow/CWD database drift",
            cfg.bd.beads_dir.display(),
            resolved.display()
        ));
    }
    let backend_data = invoke::read(&cfg.bd, &["dolt", "show", "--json"])
        .await
        .map_err(|e| format!("bd dolt show: {e}"))?;
    let backend = envelope::first_obj(&backend_data)
        .ok_or_else(|| format!("bd dolt show returned no backend identity: {backend_data}"))?;
    let backend_name = backend
        .get("backend")
        .and_then(Value::as_str)
        .unwrap_or("unknown");
    let database = backend
        .get("database")
        .and_then(Value::as_str)
        .unwrap_or("unknown");
    let mode = match backend.get("embedded").and_then(Value::as_bool) {
        Some(true) => "embedded",
        Some(false) => "server",
        None => "unknown",
    };
    let data_dir = backend
        .get("data_dir")
        .and_then(Value::as_str)
        .unwrap_or("unknown");
    Ok(format!(
        "{issue_count} issues; workspace={}; backend={backend_name}; mode={mode}; database={database}; data={data_dir}",
        resolved.display()
    ))
}

/// `gh auth status` exits 0. gh from PATH is fine — it is table-stakes
/// tooling, unlike bd. This child inherits the REAL environment and the real
/// `HOME` — never `home_override` — so the probe reports the operator's
/// actual auth state.
async fn gh_auth() -> Result<String, String> {
    let status = tokio::process::Command::new("gh")
        .args(["auth", "status"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .kill_on_drop(true)
        .status()
        .await;
    match status {
        Ok(s) if s.success() => Ok("gh auth status ok".to_string()),
        Ok(s) => Err(format!("gh auth status exited {:?}", s.code())),
        Err(e) => Err(format!("gh not runnable: {e}")),
    }
}

/// Connect-only reachability of the herdr unix socket. herdr is an EXTERNAL,
/// OPTIONAL daemon: its absence is a normal `ok: false` probe result — not an
/// error, not a blocker. Protocol pinning (==19 refuse-on-mismatch) is the
/// host crate's contract, not doctor's.
async fn herdr_ping(cfg: &DoctorConfig) -> Result<String, String> {
    let path = cfg
        .herdr_sock
        .clone()
        .or_else(|| std::env::var_os("HERDR_SOCK").map(PathBuf::from))
        .or_else(|| {
            std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".config/herdr/herdr.sock"))
        })
        .ok_or_else(|| "no herdr socket path resolvable (no HERDR_SOCK and no HOME)".to_string())?;
    match tokio::net::UnixStream::connect(&path).await {
        Ok(_) => Ok(format!("herdr reachable at {}", path.display())),
        Err(e) => Err(format!("{}: {e}", path.display())),
    }
}

/// Create and remove a probe file under `anvil_home`.
async fn anvil_home_writable(cfg: &DoctorConfig) -> Result<String, String> {
    let dir = &cfg.bd.anvil_home;
    std::fs::create_dir_all(dir).map_err(|e| format!("creating {}: {e}", dir.display()))?;
    let probe_file = dir.join(format!("doctor-probe-{}", std::process::id()));
    std::fs::write(&probe_file, b"doctor probe")
        .map_err(|e| format!("writing {}: {e}", probe_file.display()))?;
    std::fs::remove_file(&probe_file)
        .map_err(|e| format!("removing {}: {e}", probe_file.display()))?;
    Ok(format!("{} writable", dir.display()))
}
