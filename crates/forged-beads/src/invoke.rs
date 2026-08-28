//! Sanitized, timeout-bounded bd reads for the one-shot legacy-store import.
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

use std::ffi::OsString;
use std::process::Stdio;
use std::time::Duration;

use serde_json::Value;

use crate::classify::{BdError, RawOutcome};
use crate::config::BdConfig;
use crate::envelope;

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
/// absolute-resolution rule is enforced: a `bd_path` that is not absolute is
/// refused BEFORE spawning. The caller may resolve an operator-selected PATH
/// command once while loading config, but this lower-level wrapper never
/// performs a second ambient lookup.
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
                "bd_path {:?} is not absolute: resolve the selected bd executable before \
                 constructing BdConfig; the invocation wrapper never searches PATH",
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
/// Unparseable output and unsupported envelope versions remain distinct error
/// variants so callers retain the exact failure evidence.
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
    // A declared version this build cannot read is an unusable answer.
    if lenient.unsupported_schema() {
        return Err(BdError::Envelope {
            context,
            detail: format!(
                "unsupported schema_version; stdout: {}; stderr: {}",
                out.stdout, out.stderr
            ),
        });
    }
    // Preserve a payload-carried bd error before rejecting an undeclared
    // envelope shape so the full child output reaches the caller.
    if lenient.error.is_some() {
        return Err(BdError::Beads {
            context,
            exit: out.exit,
            stdout: out.stdout.clone(),
            stderr: out.stderr.clone(),
        });
    }
    // Forged sets `BD_JSON_ENVELOPE=1` on every call, so an undeclared answer
    // violates the pinned envelope contract.
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
}
