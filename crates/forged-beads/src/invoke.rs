//! The two spines every bd call goes through: `read` and `write`.
//!
//! Both spines — and the `WriteOp` shape they classify against — are
//! CRATE-INTERNAL. They take an arbitrary argv, so exporting them would put a
//! bare `bd merge-slot release` with no holder, an unscoped `bd reclaim`, or
//! bd's documented claim-theft bypass flag back within a caller's reach, and
//! defeat the type-level guarantees the frozen public surface exists to give
//! ("no bare-release call is constructible from this crate's API", "an
//! unscoped or half-scoped reclaim is unconstructible"). Consumers get the
//! frozen typed operations in [`crate::lease`], [`crate::slot`],
//! [`crate::doctor`] and the mirror module, and nothing else; the
//! `raw: serde_json::Value` on every result struct is the escape hatch for
//! fields this API does not model.
//!
//! Every bd child is spawned with `tokio::process::Command`,
//! `kill_on_drop(true)`, `env_clear()` and an explicit allowlist and nothing
//! else: `PATH` (copied from the parent), `HOME` (= `home_override` when set,
//! else the parent's), `BEADS_DIR` (= `beads_dir`), `BD_JSON_ENVELOPE=1`, and
//! `TMPDIR` (copied when present). `BEADS_DB`, `BD_DB`, `BEADS_ACTOR`,
//! `BD_ACTOR`, and every other `BD_*`/`BEADS_*` variable MUST NOT reach a bd
//! child — bd resolves `$BEADS_DB` ahead of `$BEADS_DIR`, so an inherited one
//! would silently redirect an "isolated" call at the operator's live database.
//! Non-bd children (`kill`, `ps`, `gh`) are spawned elsewhere and inherit the
//! process's REAL environment.
//!
//! `write(..)` serializes ALL bd writes behind an inter-process advisory file
//! lock keyed by the canonicalized `beads_dir`; reads bypass the lock.

use std::future::Future;
use std::path::Path;
use std::pin::Pin;
use std::process::Stdio;
use std::time::Duration;

use serde_json::Value;

use crate::classify::{self, AttemptRunner, BdError, RawOutcome};
use crate::config::BdConfig;
use crate::envelope;

/// Operation shape for module-4 classification — the write policy is
/// operation-aware.
#[derive(Debug, Clone)]
pub(crate) enum WriteOp {
    /// A claim operation (`bd update --claim`, `bd ready --claim`): the
    /// claim-CAS refusal copy maps to [`BdError::LeaseHeld`] immediately.
    Claim {
        /// The bead being claimed (`None` for the frontier claim, which
        /// names no bead).
        bead: Option<String>,
        /// The claiming actor.
        actor: String,
    },
    /// `bd heartbeat`: owner-only; any non-contention failure maps to
    /// [`BdError::HeartbeatRefused`], never the generic retry/re-read path.
    Heartbeat {
        /// The bead being heartbeat.
        bead: String,
        /// The heartbeat actor (the lease holder).
        actor: String,
    },
    /// Any other bd write.
    Other {
        /// The bead in play, when one is (enables the terminal re-read).
        bead: Option<String>,
        /// The acting holder, when one is (a re-read observing a DIFFERENT
        /// live assignee maps to [`BdError::LeaseHeld`]).
        actor: Option<String>,
    },
}

impl WriteOp {
    pub(crate) fn bead(&self) -> Option<&str> {
        match self {
            WriteOp::Claim { bead, .. } | WriteOp::Other { bead, .. } => bead.as_deref(),
            WriteOp::Heartbeat { bead, .. } => Some(bead),
        }
    }

    pub(crate) fn actor(&self) -> Option<&str> {
        match self {
            WriteOp::Claim { actor, .. } | WriteOp::Heartbeat { actor, .. } => Some(actor),
            WriteOp::Other { actor, .. } => actor.as_deref(),
        }
    }
}

/// Build the exact environment map for a bd child. A unit test asserts the
/// key set is exactly `{PATH, HOME, BEADS_DIR, BD_JSON_ENVELOPE}` plus
/// `TMPDIR` when the parent has one.
pub(crate) fn bd_env(cfg: &BdConfig) -> Vec<(String, String)> {
    let mut env = Vec::new();
    if let Some(path) = std::env::var_os("PATH") {
        env.push(("PATH".to_string(), path.to_string_lossy().into_owned()));
    }
    let home = cfg
        .home_override
        .as_ref()
        .map(|p| p.to_string_lossy().into_owned())
        .or_else(|| std::env::var_os("HOME").map(|h| h.to_string_lossy().into_owned()));
    if let Some(h) = home {
        env.push(("HOME".to_string(), h));
    }
    env.push((
        "BEADS_DIR".to_string(),
        cfg.beads_dir.to_string_lossy().into_owned(),
    ));
    env.push(("BD_JSON_ENVELOPE".to_string(), "1".to_string()));
    if let Some(t) = std::env::var_os("TMPDIR") {
        env.push(("TMPDIR".to_string(), t.to_string_lossy().into_owned()));
    }
    env
}

/// Spawn one bd child and collect its outcome under `timeout_s`. On elapse
/// the child future is dropped (`kill_on_drop` reaps it) and
/// [`BdError::Timeout`] is returned.
///
/// This is the crate's ONLY bd spawn point, so it is where the
/// explicit-resolution rule is enforced: a `bd_path` that is not absolute is
/// refused BEFORE spawning. `Command::new` searches `PATH` for any relative
/// program name, and `BdConfig`'s fields are public — a caller writing
/// `bd_path: PathBuf::from("bd")` would otherwise silently get whatever bd
/// the machine happens to have installed, which is the one thing this crate
/// promises never to do.
pub(crate) async fn run_bd(
    cfg: &BdConfig,
    args: &[&str],
    timeout_s: u64,
    context: &str,
) -> Result<RawOutcome, BdError> {
    if !cfg.bd_path.is_absolute() {
        return Err(BdError::SpawnFailed {
            context: context.to_string(),
            detail: format!(
                "bd_path {:?} is not absolute: bd is resolved from explicit config only, never \
                 from PATH or any other machine state",
                cfg.bd_path
            ),
        });
    }
    let mut cmd = tokio::process::Command::new(&cfg.bd_path);
    cmd.args(args)
        .env_clear()
        .envs(bd_env(cfg))
        .current_dir(&cfg.work_dir)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    match tokio::time::timeout(Duration::from_secs(timeout_s), cmd.output()).await {
        Err(_) => Err(BdError::Timeout {
            context: context.to_string(),
            after_s: timeout_s,
        }),
        Ok(Err(e)) => Err(BdError::SpawnFailed {
            context: context.to_string(),
            detail: e.to_string(),
        }),
        Ok(Ok(out)) => Ok(RawOutcome {
            exit: out.status.code(),
            stdout: String::from_utf8_lossy(&out.stdout).into_owned(),
            stderr: String::from_utf8_lossy(&out.stderr).into_owned(),
        }),
    }
}

/// FNV-1a-64 over the given bytes (implemented inline — sha2 is not
/// available to this crate).
pub(crate) fn fnv1a64(bytes: &[u8]) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for &b in bytes {
        h ^= u64::from(b);
        h = h.wrapping_mul(0x0000_0100_0000_01b3);
    }
    h
}

/// Derive the lock file name for a canonicalized beads dir:
/// `beads-<name>-<hash>.lock` where `<name>` is the canonical path with every
/// byte outside `[A-Za-z0-9._-]` replaced by `_`, and `<hash>` is the
/// 16-hex-digit FNV-1a-64 of the canonical path bytes.
pub(crate) fn lock_file_name(canonical: &Path) -> String {
    let s = canonical.to_string_lossy();
    let name: String = s
        .bytes()
        .map(|b| {
            if b.is_ascii_alphanumeric() || b == b'.' || b == b'_' || b == b'-' {
                b as char
            } else {
                '_'
            }
        })
        .collect();
    format!("beads-{name}-{:016x}.lock", fnv1a64(s.as_bytes()))
}

/// Acquire the inter-process write lock for `cfg.beads_dir`. Creates
/// `beads_dir` (and parents) first when absent — `std::fs::canonicalize`
/// errors on a nonexistent path, and every fresh scratch dir hits this before
/// bd's first run. The flock is taken inside `spawn_blocking` and bounded by
/// `write_timeout_s`. Dropping the returned file releases the lock.
pub(crate) async fn acquire_write_lock(cfg: &BdConfig) -> Result<std::fs::File, BdError> {
    if !cfg.beads_dir.exists() {
        std::fs::create_dir_all(&cfg.beads_dir).map_err(|e| BdError::Beads {
            context: "lock key".to_string(),
            exit: None,
            stdout: String::new(),
            stderr: format!("creating beads_dir {}: {e}", cfg.beads_dir.display()),
        })?;
    }
    let canonical = std::fs::canonicalize(&cfg.beads_dir).map_err(|e| BdError::Beads {
        context: "lock key".to_string(),
        exit: None,
        stdout: String::new(),
        stderr: format!("canonicalizing {}: {e}", cfg.beads_dir.display()),
    })?;
    let locks_dir = cfg.anvil_home.join("locks");
    std::fs::create_dir_all(&locks_dir).map_err(|e| BdError::Beads {
        context: "lock file".to_string(),
        exit: None,
        stdout: String::new(),
        stderr: format!("creating {}: {e}", locks_dir.display()),
    })?;
    let lock_path = locks_dir.join(lock_file_name(&canonical));
    let timeout_s = cfg.write_timeout_s;
    let task = tokio::task::spawn_blocking(move || -> std::io::Result<std::fs::File> {
        let f = std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(false)
            .open(&lock_path)?;
        fs2::FileExt::lock_exclusive(&f)?;
        Ok(f)
    });
    match tokio::time::timeout(Duration::from_secs(timeout_s), task).await {
        Err(_) => Err(BdError::Timeout {
            context: "beads write lock".to_string(),
            after_s: timeout_s,
        }),
        Ok(Err(join_err)) => Err(BdError::Beads {
            context: "lock task".to_string(),
            exit: None,
            stdout: String::new(),
            stderr: join_err.to_string(),
        }),
        Ok(Ok(Err(io))) => Err(BdError::Beads {
            context: "lock file".to_string(),
            exit: None,
            stdout: String::new(),
            stderr: io.to_string(),
        }),
        Ok(Ok(Ok(f))) => Ok(f),
    }
}

/// One write-locked, SINGLE-ATTEMPT bd invocation: no retries, no
/// classification. The mirror-record path and the slot loops build on this.
pub(crate) async fn run_locked_once(
    cfg: &BdConfig,
    args: &[&str],
    context: &str,
) -> Result<RawOutcome, BdError> {
    let _lock = acquire_write_lock(cfg).await?;
    run_bd(cfg, args, cfg.write_timeout_s, context).await
}

fn context_of(args: &[&str]) -> String {
    let head: Vec<&str> = args.iter().take(2).copied().collect();
    format!("bd {}", head.join(" "))
}

/// Run a bd READ directly: no lock, no retries, and no classification beyond
/// envelope parsing. A nonzero exit yields [`BdError::Beads`] with both
/// streams attached; a zero exit yields the envelope `data`.
pub(crate) async fn read(cfg: &BdConfig, args: &[&str]) -> Result<Value, BdError> {
    let context = context_of(args);
    let out = run_bd(cfg, args, cfg.read_timeout_s, &context).await?;
    if out.exit != Some(0) {
        return Err(BdError::Beads {
            context,
            exit: out.exit,
            stdout: out.stdout,
            stderr: out.stderr,
        });
    }
    let lenient = envelope::parse_lenient(&out.stdout);
    if !lenient.parsed || !lenient.schema_ok {
        return Err(BdError::Envelope {
            context,
            detail: format!("stdout: {}; stderr: {}", out.stdout, out.stderr),
        });
    }
    if lenient.error.is_some() {
        return Err(BdError::Beads {
            context,
            exit: out.exit,
            stdout: out.stdout,
            stderr: out.stderr,
        });
    }
    lenient.data.ok_or_else(|| BdError::Envelope {
        context,
        detail: format!("envelope missing data key; stdout: {}", out.stdout),
    })
}

/// Run a bd WRITE behind the inter-process write lock, with the module-4
/// retry/classification policy applied around every attempt. Returns the
/// envelope `data` on success.
///
/// EVERY `Timeout` gets that policy, flock acquisition included: the lock is
/// taken before any child runs, so a timeout there would otherwise escape the
/// policy entirely. It is retried once and then classified terminally like
/// any other unknown failure (best-effort re-read first, so a write blocked
/// by another holder surfaces as `LeaseHeld`).
pub(crate) async fn write(cfg: &BdConfig, op: WriteOp, args: &[&str]) -> Result<Value, BdError> {
    let context = context_of(args);
    let mut runner = LiveRunner {
        cfg,
        args,
        context: context.clone(),
    };
    let _lock = match acquire_write_lock(cfg).await {
        Ok(lock) => lock,
        Err(BdError::Timeout {
            context: lock_ctx, ..
        }) => match acquire_write_lock(cfg).await {
            Ok(lock) => lock,
            Err(BdError::Timeout { after_s, .. }) => {
                return Err(classify::timeout_terminal(&op, &mut runner, lock_ctx, after_s).await);
            }
            Err(other) => return Err(other),
        },
        Err(other) => return Err(other),
    };
    classify::write_policy(&op, &mut runner, false, &context).await
}

/// The production [`AttemptRunner`]: each attempt is one bd child; the
/// re-read is a lock-free [`read`] of `bd show <id> --json` taking the first
/// array element's `assignee` string field (field name probe-pinned: bd 1.2.1
/// `show` returns `"assignee": "doctor"` on a claimed issue).
struct LiveRunner<'a> {
    cfg: &'a BdConfig,
    args: &'a [&'a str],
    context: String,
}

impl AttemptRunner for LiveRunner<'_> {
    fn run<'s>(
        &'s mut self,
        _attempt: u32,
    ) -> Pin<Box<dyn Future<Output = Result<RawOutcome, BdError>> + Send + 's>> {
        Box::pin(async move {
            run_bd(self.cfg, self.args, self.cfg.write_timeout_s, &self.context).await
        })
    }

    fn reread_assignee<'s>(
        &'s mut self,
        bead: &'s str,
    ) -> Pin<Box<dyn Future<Output = Option<String>> + Send + 's>> {
        Box::pin(async move {
            let data = read(self.cfg, &["show", bead, "--json"]).await.ok()?;
            let obj = envelope::first_obj(&data)?;
            let assignee = obj.get("assignee")?.as_str()?;
            if assignee.is_empty() {
                None
            } else {
                Some(assignee.to_string())
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn cfg() -> BdConfig {
        BdConfig {
            bd_path: PathBuf::from("/opt/bd/bd"),
            beads_dir: PathBuf::from("/tmp/store"),
            home_override: Some(PathBuf::from("/tmp/scratch-home")),
            anvil_home: PathBuf::from("/tmp/anvil"),
            work_dir: PathBuf::from("/tmp/store"),
            read_timeout_s: 30,
            write_timeout_s: 60,
        }
    }

    #[test]
    fn bd_env_has_exactly_the_allowlisted_keys() {
        let env = bd_env(&cfg());
        let mut expected = Vec::new();
        if std::env::var_os("PATH").is_some() {
            expected.push("PATH");
        }
        expected.extend(["HOME", "BEADS_DIR", "BD_JSON_ENVELOPE"]);
        if std::env::var_os("TMPDIR").is_some() {
            expected.push("TMPDIR");
        }
        let mut keys: Vec<&str> = env.iter().map(|(k, _)| k.as_str()).collect();
        keys.sort_unstable();
        expected.sort_unstable();
        assert_eq!(keys, expected, "bd child env must be exactly the allowlist");
        // No BD_*/BEADS_* leakage beyond the two deliberate exports.
        for (k, _) in &env {
            if k.starts_with("BD_") || k.starts_with("BEADS_") {
                assert!(
                    k == "BD_JSON_ENVELOPE" || k == "BEADS_DIR",
                    "unexpected bd-family key {k}"
                );
            }
        }
    }

    #[test]
    fn bd_env_values_are_the_configured_ones() {
        let env = bd_env(&cfg());
        let get = |k: &str| {
            env.iter()
                .find(|(key, _)| key == k)
                .map(|(_, v)| v.as_str())
        };
        assert_eq!(get("BEADS_DIR"), Some("/tmp/store"));
        assert_eq!(get("HOME"), Some("/tmp/scratch-home"));
        assert_eq!(get("BD_JSON_ENVELOPE"), Some("1"));
    }

    #[tokio::test]
    async fn a_relative_bd_path_is_refused_before_spawning() {
        // The source-hygiene grep for a literal PATH-resolved bd cannot see
        // this case: the lookup would come from the CONFIG at runtime, not
        // from any literal in this crate's source.
        for relative in ["bd", "./bd", "bin/bd", "../tools/bd"] {
            let mut cfg = cfg();
            cfg.bd_path = PathBuf::from(relative);
            match run_bd(&cfg, &["version", "--json"], 5, "bd version").await {
                Err(BdError::SpawnFailed { detail, .. }) => assert!(
                    detail.contains("not absolute"),
                    "{relative}: unexpected detail {detail}"
                ),
                other => panic!("{relative} must be refused, got {:?}", other.map(|_| ())),
            }
            // The refusal is on the spawn path, so both spines inherit it —
            // and nothing is written to disk on the way there.
            assert!(
                matches!(
                    read(&cfg, &["list", "--json"]).await,
                    Err(BdError::SpawnFailed { .. })
                ),
                "read must refuse {relative} too"
            );
        }
    }

    #[test]
    fn fnv1a64_known_vectors() {
        // Standard FNV-1a-64 test vectors.
        assert_eq!(fnv1a64(b""), 0xcbf2_9ce4_8422_2325);
        assert_eq!(fnv1a64(b"a"), 0xaf63_dc4c_8601_ec8c);
    }

    #[test]
    fn lock_file_name_is_deterministic_and_distinct() {
        let a = lock_file_name(Path::new("/tmp/store-a"));
        let a2 = lock_file_name(Path::new("/tmp/store-a"));
        let b = lock_file_name(Path::new("/tmp/store-b"));
        assert_eq!(a, a2, "deterministic");
        assert_ne!(a, b, "distinct canonical paths get distinct lock files");
        assert_eq!(
            a,
            format!("beads-_tmp_store-a-{:016x}.lock", fnv1a64(b"/tmp/store-a"))
        );
        // Every byte outside [A-Za-z0-9._-] is replaced by '_'.
        let odd = lock_file_name(Path::new("/tmp/we ird/sto:re"));
        let name_part = odd.strip_prefix("beads-").unwrap();
        assert!(
            name_part
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-')),
            "sanitized name has only allowed bytes: {odd}"
        );
    }
}
