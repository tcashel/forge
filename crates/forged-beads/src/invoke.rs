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
//! else the parent's), `BEADS_DIR` (= `beads_dir`), `BD_JSON_ENVELOPE=1`,
//! `TMPDIR` (copied when present), and bd 1.2.1's four documented remote-server
//! authentication settings: `BEADS_DOLT_PASSWORD`, `BEADS_DOLT_SERVER_TLS`,
//! `BEADS_DOLT_SERVER_USER`, and `BEADS_CREDENTIALS_FILE`. `BEADS_DB`, `BD_DB`,
//! `BEADS_ACTOR`, `BD_ACTOR`, server host/port/socket/mode overrides, and every
//! other `BD_*`/`BEADS_*` variable MUST NOT reach a bd child — bd resolves
//! `$BEADS_DB` ahead of `$BEADS_DIR`, so an inherited one would silently
//! redirect an "isolated" call at the operator's live database. Host, port,
//! mode, and database remain properties of the explicit `BEADS_DIR` metadata;
//! only credentials and TLS cross the sanitized boundary. No caller logs this
//! environment map or its values.
//! Non-bd children (`kill`, `ps`, `gh`) are spawned elsewhere and inherit the
//! process's REAL environment.
//!
//! `write(..)` serializes ALL bd writes behind an inter-process advisory file
//! lock keyed by the canonicalized `beads_dir`; reads bypass the lock.

use std::ffi::OsString;
use std::future::Future;
use std::path::Path;
use std::pin::Pin;
use std::process::Stdio;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
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

/// The complete set of inherited bd remote-server settings.
///
/// These are the four authentication/TLS variables named by pinned bd 1.2.1's
/// `bd dolt --help`. Routing variables are intentionally absent: the explicit
/// [`BdConfig::beads_dir`] metadata owns host, port, mode, and database.
const REMOTE_AUTH_ENV: [&str; 4] = [
    "BEADS_DOLT_PASSWORD",
    "BEADS_DOLT_SERVER_TLS",
    "BEADS_DOLT_SERVER_USER",
    "BEADS_CREDENTIALS_FILE",
];

/// Build the exact environment map for a bd child from an environment reader.
/// Keeping the reader injectable makes the allowlist test deterministic and
/// avoids mutating the process environment in a parallel test suite.
fn bd_env_from<F>(cfg: &BdConfig, inherited: F) -> Vec<(String, String)>
where
    F: Fn(&str) -> Option<OsString>,
{
    let mut env = Vec::new();
    if let Some(path) = inherited("PATH") {
        env.push(("PATH".to_string(), path.to_string_lossy().into_owned()));
    }
    let home = cfg
        .home_override
        .as_ref()
        .map(|p| p.to_string_lossy().into_owned())
        .or_else(|| inherited("HOME").map(|h| h.to_string_lossy().into_owned()));
    if let Some(h) = home {
        env.push(("HOME".to_string(), h));
    }
    env.push((
        "BEADS_DIR".to_string(),
        cfg.beads_dir.to_string_lossy().into_owned(),
    ));
    env.push(("BD_JSON_ENVELOPE".to_string(), "1".to_string()));
    if let Some(t) = inherited("TMPDIR") {
        env.push(("TMPDIR".to_string(), t.to_string_lossy().into_owned()));
    }
    for key in REMOTE_AUTH_ENV {
        if let Some(value) = inherited(key) {
            env.push((key.to_string(), value.to_string_lossy().into_owned()));
        }
    }
    env
}

/// Build the exact environment map for a bd child. A unit test asserts that
/// only the fixed runtime keys and the four remote auth/TLS keys can survive.
pub(crate) fn bd_env(cfg: &BdConfig) -> Vec<(String, String)> {
    bd_env_from(cfg, |key| std::env::var_os(key))
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

/// The blocking half of [`acquire_write_lock`]: open the lock file and park in
/// `flock` until the lock is ours. The instant the syscall returns — before
/// the lock is used for anything at all — the caller's cancellation flag is
/// consulted: a set flag means the caller already gave up (its timeout
/// elapsed), so the lock is handed straight back and `Ok(None)` reports that
/// nothing was done. Returning the file to a caller that is no longer waiting
/// would leave an exclusive lock held on nobody's behalf, blocking the next
/// live write.
fn wait_for_lock(
    lock_path: &Path,
    cancelled: &AtomicBool,
) -> std::io::Result<Option<std::fs::File>> {
    let f = std::fs::OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(false)
        .open(lock_path)?;
    fs2::FileExt::lock_exclusive(&f)?;
    if cancelled.load(Ordering::SeqCst) {
        let _ = fs2::FileExt::unlock(&f);
        return Ok(None);
    }
    Ok(Some(f))
}

/// Acquire the inter-process write lock for `cfg.beads_dir`. Creates
/// `beads_dir` (and parents) first when absent — `std::fs::canonicalize`
/// errors on a nonexistent path, and every fresh scratch dir hits this before
/// bd's first run. The flock is taken inside `spawn_blocking` and bounded by
/// `write_timeout_s`. Dropping the returned file releases the lock.
///
/// TIMEOUT SEMANTICS, and the honest half of them: a `spawn_blocking` task
/// parked inside the `flock` syscall CANNOT be cancelled mid-call, so on
/// timeout the worker thread stays parked until the CURRENT lock holder
/// releases — bounded by that holder's lifetime, not by `write_timeout_s`.
/// What it can never do is ACT after the timeout. The waiter shares a
/// cancellation flag with this function; the timeout arm sets it, and the
/// waiter checks it the instant `lock_exclusive` returns, before doing
/// anything else: if it is set the waiter unlocks immediately and exits with
/// no side effects. So a waiter the caller has given up on can never win the
/// lock and sit on it — the failure mode where a later, live write blocks on
/// an exclusive lock nobody is using.
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
    let cancelled = Arc::new(AtomicBool::new(false));
    let waiter_cancelled = Arc::clone(&cancelled);
    let task = tokio::task::spawn_blocking(move || wait_for_lock(&lock_path, &waiter_cancelled));
    match tokio::time::timeout(Duration::from_secs(timeout_s), task).await {
        Err(_) => {
            cancelled.store(true, Ordering::SeqCst);
            Err(BdError::Timeout {
                context: "beads write lock".to_string(),
                after_s: timeout_s,
            })
        }
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
        Ok(Ok(Ok(Some(f)))) => Ok(f),
        // The waiter gave the lock straight back because it saw the cancel
        // flag — which only this function's timeout arm sets, so the caller
        // has already been told `Timeout`. Reachable only if the flag and the
        // join land in the same instant; classified the same way either way.
        Ok(Ok(Ok(None))) => Err(BdError::Timeout {
            context: "beads write lock".to_string(),
            after_s: timeout_s,
        }),
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
    read_envelope(context, &out)
}

/// Interpret one zero-exit read's stdout. Split out of [`read`] so the
/// classification — which is the whole contract — is exercisable without a
/// bd child.
///
/// UNPARSEABLE IS NOT THE SAME AS UNSUPPORTED. Only stdout that will not
/// parse at all means bd never answered, and that alone is the read failure
/// worth retrying. A payload that parses under a `schema_version` this build
/// does not read is bd ANSWERING, from a bd that has been upgraded past this
/// build: every retry re-reads the identical envelope, so it is terminal.
/// An error INSIDE a well-formed envelope is classified on what it says —
/// `BdError::is_transport` reads the text — not on the fact that it parsed.
fn read_envelope(context: String, out: &RawOutcome) -> Result<Value, BdError> {
    let lenient = envelope::parse_lenient(&out.stdout);
    if !lenient.parsed {
        return Err(BdError::Unparseable {
            context,
            detail: format!("stdout: {}; stderr: {}", out.stdout, out.stderr),
        });
    }
    // Order matters, and these three are not interchangeable.
    //
    // A DECLARED version this build cannot read outranks every cause-text
    // check: retrying re-reads the identical envelope, so a Dolt-lock marker
    // inside one would take the contention schedule and burn the whole
    // bounded budget on an upgrade that outlives it.
    if lenient.unsupported_schema() {
        return Err(BdError::Envelope {
            context,
            detail: format!(
                "unsupported schema_version; stdout: {}; stderr: {}",
                out.stdout, out.stderr
            ),
        });
    }
    // An error is classified on what it SAYS, before the shape is judged —
    // `!schema_ok` is also true of bare JSON declaring no version at all,
    // and making that terminal first would strand a genuine outage the write
    // spine reads as ordinary contention.
    if lenient.error.is_some() {
        return Err(BdError::Beads {
            context,
            exit: out.exit,
            stdout: out.stdout.clone(),
            stderr: out.stderr.clone(),
        });
    }
    // Left over: a payload that parsed, carries no error, and declared no
    // version forged recognizes. forged sets `BD_JSON_ENVELOPE=1` on every
    // call, so an undeclared answer means the envelope contract is not being
    // honoured — terminal, because no retry makes a bd start declaring.
    if !lenient.schema_ok {
        return Err(BdError::Envelope {
            context,
            detail: format!(
                "envelope declares no readable schema_version; stdout: {}; stderr: {}",
                out.stdout, out.stderr
            ),
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

    fn zero_exit(stdout: &str) -> RawOutcome {
        RawOutcome {
            exit: Some(0),
            stdout: stdout.to_owned(),
            stderr: String::new(),
        }
    }

    fn read_err(stdout: &str) -> BdError {
        read_envelope("bd show beads-1al".to_owned(), &zero_exit(stdout))
            .expect_err("this stdout must not read as an answer")
    }

    #[test]
    fn stdout_that_does_not_parse_is_the_one_retryable_read() {
        // bd never answered — a killed child, a proxy's HTML, a truncated
        // write. This and nothing else rides the bounded transport budget.
        for stdout in ["", "<html>502 Bad Gateway</html>", "{\"data\": "] {
            let err = read_err(stdout);
            assert!(
                matches!(err, BdError::Unparseable { .. }),
                "{stdout:?} must be Unparseable, got {err:?}"
            );
            assert!(err.is_transport(), "{stdout:?} must ride the budget");
        }
    }

    #[test]
    fn an_unsupported_schema_version_is_an_answer_and_stays_terminal() {
        // bd ANSWERED, from a bd upgraded past this build. Retrying re-reads
        // the identical envelope forever — precisely the wrong response to an
        // upgrade, and the failure the bd contract test exists to make loud.
        // The second shape declares no version at all: forged sets
        // `BD_JSON_ENVELOPE=1` on every call, so that is the contract not
        // being honoured, which no retry repairs either.
        for stdout in [
            r#"{"data": {"id": "beads-1al"}, "schema_version": 2}"#,
            r#"{"data": {"id": "beads-1al"}}"#,
        ] {
            let err = read_err(stdout);
            assert!(
                matches!(err, BdError::Envelope { .. }),
                "{stdout:?} must be Envelope, got {err:?}"
            );
            assert!(
                !err.is_transport(),
                "{stdout:?} must never ride the budget: {err}"
            );
        }
    }

    #[test]
    fn an_outage_in_an_undeclared_payload_is_still_read_for_what_it_says() {
        // The shape check must not preempt the cause check. A payload that
        // declared no version but carries a Dolt lock is the same outage the
        // write spine rides its budget for; judging it on its shape first
        // would stand it down as terminal on the read path alone.
        let outage = read_err(&format!(
            r#"{{"data":{{"error":"{}"}}}}"#,
            crate::classify::DOLT_LOCK_REFUSAL
        ));
        assert!(
            matches!(outage, BdError::Beads { .. }),
            "classified on its text, not its shape: {outage:?}"
        );
        assert!(
            outage.is_transport(),
            "an outage rides the budget wherever it is declared: {outage}"
        );
    }

    #[test]
    fn an_error_inside_a_well_formed_envelope_is_read_for_what_it_says() {
        // Parsing is not the classifier. The same envelope shape carries a
        // terminal refusal and a transient outage, and only the text tells
        // them apart.
        let refusal = read_err(r#"{"data":{"error":"no issues found"},"schema_version":1}"#);
        assert!(matches!(refusal, BdError::Beads { .. }));
        assert!(!refusal.is_transport(), "a refusal is an answer: {refusal}");

        let outage = read_err(&format!(
            r#"{{"data":{{"error":"{}"}},"schema_version":1}}"#,
            crate::classify::DOLT_LOCK_REFUSAL
        ));
        assert!(matches!(outage, BdError::Beads { .. }));
        assert!(
            outage.is_transport(),
            "a lock that clears on its own must ride the budget: {outage}"
        );
    }

    #[test]
    fn a_schema_one_envelope_carrying_data_reads_as_the_answer() {
        let data = read_envelope(
            "bd show beads-1al".to_owned(),
            &zero_exit(r#"{"data": {"id": "beads-1al"}, "schema_version": 1}"#),
        )
        .expect("a well-formed answer");
        assert_eq!(data, serde_json::json!({"id": "beads-1al"}));

        // A schema-1 envelope with no `data` key answered nothing usable —
        // terminal, and NOT the unparseable class.
        let missing = read_err(r#"{"schema_version": 1}"#);
        assert!(matches!(missing, BdError::Envelope { .. }));
        assert!(!missing.is_transport());
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
        for key in REMOTE_AUTH_ENV {
            if std::env::var_os(key).is_some() {
                expected.push(key);
            }
        }
        let mut keys: Vec<&str> = env.iter().map(|(k, _)| k.as_str()).collect();
        keys.sort_unstable();
        expected.sort_unstable();
        assert_eq!(keys, expected, "bd child env must be exactly the allowlist");
        // No BD_*/BEADS_* leakage beyond the deliberate fixed exports.
        for (k, _) in &env {
            if k.starts_with("BD_") || k.starts_with("BEADS_") {
                assert!(
                    k == "BD_JSON_ENVELOPE"
                        || k == "BEADS_DIR"
                        || REMOTE_AUTH_ENV.contains(&k.as_str()),
                    "unexpected bd-family key {k}"
                );
            }
        }
    }

    #[test]
    fn bd_env_preserves_only_remote_auth_not_routing_or_actor_overrides() {
        use std::collections::BTreeMap;

        let inherited: BTreeMap<&str, OsString> = [
            ("PATH", "/usr/bin".into()),
            ("HOME", "/home/operator".into()),
            ("TMPDIR", "/tmp".into()),
            ("BEADS_DOLT_PASSWORD", "test-password".into()),
            ("BEADS_DOLT_SERVER_TLS", "true".into()),
            ("BEADS_DOLT_SERVER_USER", "team-user".into()),
            ("BEADS_CREDENTIALS_FILE", "/secrets/beads.ini".into()),
            ("BEADS_DB", "/wrong/store".into()),
            ("BD_DB", "/also/wrong".into()),
            ("BEADS_ACTOR", "wrong-actor".into()),
            ("BD_ACTOR", "other-actor".into()),
            ("BEADS_DOLT_SERVER_MODE", "1".into()),
            ("BEADS_DOLT_SERVER_HOST", "wrong.example".into()),
            ("BEADS_DOLT_SERVER_PORT", "13306".into()),
            ("BEADS_DOLT_SERVER_SOCKET", "/wrong/server.sock".into()),
            ("BEADS_DOLT_SHARED_SERVER", "1".into()),
            ("BEADS_DOLT_PORT", "13307".into()),
        ]
        .into_iter()
        .collect();
        let env = bd_env_from(&cfg(), |key| inherited.get(key).cloned());
        let keys: Vec<&str> = env.iter().map(|(key, _)| key.as_str()).collect();

        for key in REMOTE_AUTH_ENV {
            assert!(
                keys.contains(&key),
                "documented auth/TLS key {key} was stripped"
            );
        }
        for key in [
            "BEADS_DB",
            "BD_DB",
            "BEADS_ACTOR",
            "BD_ACTOR",
            "BEADS_DOLT_SERVER_MODE",
            "BEADS_DOLT_SERVER_HOST",
            "BEADS_DOLT_SERVER_PORT",
            "BEADS_DOLT_SERVER_SOCKET",
            "BEADS_DOLT_SHARED_SERVER",
            "BEADS_DOLT_PORT",
        ] {
            assert!(
                !keys.contains(&key),
                "routing/identity override {key} must not escape environment sanitization"
            );
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
    fn a_cancelled_lock_waiter_gives_the_lock_straight_back() {
        let dir = std::env::temp_dir().join(format!("forged-lock-cancel-{}", std::process::id()));
        std::fs::create_dir_all(&dir).expect("scratch lock dir");
        let lock_path = dir.join("cancel.lock");
        let open = || {
            std::fs::OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(false)
                .open(&lock_path)
                .expect("opening the lock file")
        };

        // A live waiter keeps the lock, and the lock is genuinely exclusive.
        let live = AtomicBool::new(false);
        let held = wait_for_lock(&lock_path, &live)
            .expect("locking")
            .expect("a live waiter must return the lock it took");
        assert!(
            fs2::FileExt::try_lock_exclusive(&open()).is_err(),
            "the returned lock must actually be held"
        );
        drop(held);

        // A waiter whose caller has already timed out must act on nothing:
        // no file handed back, and the lock free for the next attempt — the
        // failure this guards is an abandoned waiter winning the flock and
        // sitting on it while a live write blocks behind it.
        let cancelled = AtomicBool::new(true);
        assert!(
            wait_for_lock(&lock_path, &cancelled)
                .expect("locking")
                .is_none(),
            "a cancelled waiter must not return the lock"
        );
        fs2::FileExt::try_lock_exclusive(&open())
            .expect("a cancelled waiter must leave the lock free");
        let _ = std::fs::remove_dir_all(&dir);
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
