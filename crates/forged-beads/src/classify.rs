//! The contention classifier and the crate error type [`BdError`].
//!
//! Classification is OPERATION-AWARE (see [`crate::invoke::WriteOp`]): claim
//! operations map bd's claim-CAS refusal copy to [`BdError::LeaseHeld`]
//! immediately (an outcome, not a fault), heartbeats never enter the generic
//! retry/re-read path, and everything else follows the Dolt-contention /
//! retry-once policy implemented by [`write_policy`].
//!
//! Honest note (P0 probe): the three-writer probe produced NO embedded-lock
//! errors — bd's internal serialization-conflict retry absorbed them — so the
//! unknown-error retry-once fallback is the load-bearing path in practice. The
//! live race tests therefore assert CAS outcomes, and the Dolt string path is
//! unit-tested here with canned stderr.

use std::fmt;
use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

use serde_json::Value;

use crate::envelope;
use crate::invoke::WriteOp;

/// The exact Dolt embedded-lock refusal, pinned from bd 1.2.1's own source
/// (cmd/bd/uow_factory.go quotes Dolt's refusal verbatim).
pub(crate) const DOLT_LOCK_REFUSAL: &str = "database is locked by another dolt process";

/// bd's claim-CAS refusal copy for claim operations. Observed live from
/// bd 1.2.1: `issue already claimed by doctor` (stderr AND the failure
/// envelope's `data.failed[].error`).
pub(crate) const CLAIM_REFUSAL_MARKERS: [&str; 2] = ["already claimed", "already assigned"];

/// The crate-local error type for every bd outcome.
///
/// Wire mapping (strings match the shared `ErrorCode` serialization in
/// `crates/forged-types/src/error.rs`; the enum conversion lands in a later
/// slice): [`BdError::Contention`] ⇒ `BEADS_CONTENTION`,
/// [`BdError::LeaseHeld`] ⇒ `BEAD_LEASE_HELD`, everything else ⇒
/// `BEADS_ERROR`.
#[derive(Debug, Clone)]
pub enum BdError {
    /// Dolt embedded-lock contention that survived the full jittered retry
    /// schedule (attempts k = 1..5). Wire mapping: `BEADS_CONTENTION`.
    Contention {
        /// How many attempts were made (the first try counts as attempt 1).
        attempts: u32,
        /// stderr of the final attempt.
        stderr: String,
    },
    /// The bead's lease is held by another actor. An outcome, not a fault —
    /// never retried. Wire mapping: `BEAD_LEASE_HELD`.
    LeaseHeld {
        /// The bead whose lease is held (empty when unknown, e.g. a refused
        /// frontier claim carries no bead id).
        bead: String,
        /// The observed holder, when a re-read or response surfaced one.
        holder: Option<String>,
    },
    /// A heartbeat was refused. Callers treat this as "lease lost" and never
    /// retry it as contention. Observed bd 1.2.1 refusal copy (the failure
    /// envelope's `data.error`): `heartbeat beads-1al: issue already claimed
    /// by doctor`; bd also emits `not claimable` copy on this path. Wire
    /// mapping: `BEADS_ERROR`.
    HeartbeatRefused {
        /// The bead whose heartbeat was refused.
        bead: String,
        /// stderr of the refusing attempt (or the envelope's error string
        /// when stderr was empty).
        stderr: String,
    },
    /// The merge slot was busy past the caller's acquire budget. Wire
    /// mapping: `BEADS_ERROR`.
    SlotBusy {
        /// The holder observed by the final `check` call, when readable.
        holder: Option<String>,
    },
    /// A bd failure no other rule claims (reserved for nonzero-exit outcomes,
    /// plus zero-exit calls whose envelope carried an error). Wire mapping:
    /// `BEADS_ERROR`.
    Beads {
        /// What was being run (e.g. `bd update beads-1al`).
        context: String,
        /// The child's exit code (`None` when killed by a signal).
        exit: Option<i32>,
        /// The child's full stdout.
        stdout: String,
        /// The child's full stderr.
        stderr: String,
    },
    /// A zero-exit call whose stdout was unparseable or whose
    /// `schema_version` was not 1. Wire mapping: `BEADS_ERROR`.
    Envelope {
        /// What was being run.
        context: String,
        /// Both output streams, for diagnosis.
        detail: String,
    },
    /// The child could not be spawned at all. Wire mapping: `BEADS_ERROR`.
    SpawnFailed {
        /// What was being run.
        context: String,
        /// The spawn error.
        detail: String,
    },
    /// A child invocation (or the write flock acquisition) outlived its
    /// timeout; the child is dropped and `kill_on_drop` reaps it. Treated by
    /// the write policy exactly like any other unknown failure (retry once,
    /// then terminal). Wire mapping: `BEADS_ERROR`.
    Timeout {
        /// What was being run.
        context: String,
        /// The elapsed bound in seconds.
        after_s: u64,
    },
}

impl fmt::Display for BdError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BdError::Contention { attempts, stderr } => {
                write!(f, "bd contention after {attempts} attempts: {stderr}")
            }
            BdError::LeaseHeld { bead, holder } => match holder {
                Some(h) => write!(f, "lease on {bead} held by {h}"),
                None => write!(f, "lease on {bead} held by another actor"),
            },
            BdError::HeartbeatRefused { bead, stderr } => {
                write!(f, "heartbeat refused for {bead}: {stderr}")
            }
            BdError::SlotBusy { holder } => match holder {
                Some(h) => write!(f, "merge slot busy (held by {h})"),
                None => write!(f, "merge slot busy"),
            },
            BdError::Beads {
                context,
                exit,
                stdout,
                stderr,
            } => write!(
                f,
                "{context} failed (exit {exit:?}); stdout: {stdout}; stderr: {stderr}"
            ),
            BdError::Envelope { context, detail } => {
                write!(f, "{context} returned a bad envelope: {detail}")
            }
            BdError::SpawnFailed { context, detail } => {
                write!(f, "{context} could not spawn: {detail}")
            }
            BdError::Timeout { context, after_s } => {
                write!(f, "{context} timed out after {after_s}s")
            }
        }
    }
}

impl std::error::Error for BdError {}

/// One finished bd attempt: exit status plus both output streams.
pub(crate) struct RawOutcome {
    /// Exit code (`None` when the child was killed by a signal).
    pub exit: Option<i32>,
    /// Full stdout.
    pub stdout: String,
    /// Full stderr.
    pub stderr: String,
}

/// What one attempt means for the write policy.
pub(crate) enum Class {
    /// The call succeeded; carries the envelope `data` (or, in raw mode, the
    /// whole parsed stdout object).
    Success(Value),
    /// Dolt embedded-lock contention: retry on the jittered schedule.
    Contention,
    /// Claim-CAS refusal: `LeaseHeld` immediately, no retry.
    ClaimHeld,
    /// Heartbeat refusal: `HeartbeatRefused` immediately, no retry.
    HeartbeatRefusal {
        /// The refusal text (stderr, or the envelope error when stderr empty).
        detail: String,
    },
    /// Zero exit but unparseable stdout or wrong `schema_version`: terminal.
    EnvelopeBad {
        /// Both streams for diagnosis.
        detail: String,
    },
    /// Any other failure: retry once, then re-read/terminal.
    Unknown,
}

/// Classify one attempt. All text matching runs against the combined haystack
/// of raw stdout, the envelope's error string, and stderr — case-sensitive
/// substring, evaluated regardless of exit status, operation-aware.
pub(crate) fn classify_attempt(op: &WriteOp, out: &RawOutcome, raw_mode: bool) -> Class {
    let lenient = envelope::parse_lenient(&out.stdout);
    let env_err = lenient.error.clone().unwrap_or_default();
    let haystack = format!("{}\n{}\n{}", out.stdout, env_err, out.stderr);

    if haystack.contains(DOLT_LOCK_REFUSAL) {
        return Class::Contention;
    }
    if matches!(op, WriteOp::Claim { .. })
        && CLAIM_REFUSAL_MARKERS.iter().any(|m| haystack.contains(m))
    {
        // Matched against stdout AND stderr regardless of exit status: bd's
        // own regression notes (tests/regression/DISCOVERY.md, BUG-10) record
        // a refused claim printing `already claimed` while exiting 0.
        return Class::ClaimHeld;
    }
    if matches!(op, WriteOp::Heartbeat { .. }) {
        // After the Dolt-contention check, ANY other failed heartbeat outcome
        // here is a refusal — heartbeats never enter the generic retry or
        // re-read paths and never yield LeaseHeld.
        if out.exit == Some(0) && lenient.parsed && lenient.schema_ok && lenient.error.is_none() {
            return Class::Success(lenient.data.unwrap_or(Value::Null));
        }
        if out.exit == Some(0) && (!lenient.parsed || !lenient.schema_ok) {
            return Class::EnvelopeBad {
                detail: both_streams(out),
            };
        }
        let detail = if out.stderr.trim().is_empty() {
            env_err
        } else {
            out.stderr.clone()
        };
        return Class::HeartbeatRefusal { detail };
    }
    if out.exit == Some(0) {
        if raw_mode {
            // Merge-slot envelope exception: raw JSON, no data/schema wrapper.
            return match serde_json::from_str::<Value>(&out.stdout) {
                Ok(v) => Class::Success(v),
                Err(e) => Class::EnvelopeBad {
                    detail: format!("unparseable raw JSON ({e}); {}", both_streams(out)),
                },
            };
        }
        if !lenient.parsed || !lenient.schema_ok {
            return Class::EnvelopeBad {
                detail: both_streams(out),
            };
        }
        if lenient.error.is_some() {
            // A failing call can exit 0 with an error envelope; classify it
            // like any other unknown failure.
            return Class::Unknown;
        }
        return match lenient.data {
            Some(d) => Class::Success(d),
            None => Class::EnvelopeBad {
                detail: format!("envelope missing data key; {}", both_streams(out)),
            },
        };
    }
    Class::Unknown
}

fn both_streams(out: &RawOutcome) -> String {
    format!("stdout: {}; stderr: {}", out.stdout, out.stderr)
}

/// Runs write attempts for [`write_policy`]. Production wires this to a real
/// bd child; unit tests substitute canned outputs.
pub(crate) trait AttemptRunner: Send {
    /// Run one attempt (1-based counter). Spawn failures and timeouts are
    /// returned as their `BdError` variants.
    fn run<'a>(
        &'a mut self,
        attempt: u32,
    ) -> Pin<Box<dyn Future<Output = Result<RawOutcome, BdError>> + Send + 'a>>;

    /// Best-effort re-read of the bead's live assignee. `None` on ANY failure
    /// — the policy never surfaces or re-classifies the re-read's own error.
    fn reread_assignee<'a>(
        &'a mut self,
        bead: &'a str,
    ) -> Pin<Box<dyn Future<Output = Option<String>> + Send + 'a>>;
}

/// The module-4 write policy: Dolt contention retries with full jitter
/// (attempts k = 1..5), claim/heartbeat refusals mapped immediately, one
/// generic retry for anything unknown, then a best-effort re-read to
/// distinguish `LeaseHeld` from `Beads`.
pub(crate) async fn write_policy(
    op: &WriteOp,
    runner: &mut dyn AttemptRunner,
    raw_mode: bool,
    context: &str,
) -> Result<Value, BdError> {
    let mut attempt: u32 = 0;
    let mut contention_attempts: u32 = 0;
    let mut generic_retried = false;
    loop {
        attempt += 1;
        let out = match runner.run(attempt).await {
            Ok(o) => o,
            Err(BdError::Timeout { context: c, after_s }) => {
                if generic_retried {
                    return Err(BdError::Timeout {
                        context: c,
                        after_s,
                    });
                }
                generic_retried = true;
                continue;
            }
            Err(e) => return Err(e),
        };
        match classify_attempt(op, &out, raw_mode) {
            Class::Success(v) => return Ok(v),
            Class::Contention => {
                contention_attempts += 1;
                if contention_attempts >= 5 {
                    return Err(BdError::Contention {
                        attempts: contention_attempts,
                        stderr: out.stderr,
                    });
                }
                tokio::time::sleep(Duration::from_millis(jitter_ms(contention_attempts))).await;
            }
            Class::ClaimHeld => {
                return Err(BdError::LeaseHeld {
                    bead: op.bead().unwrap_or_default().to_string(),
                    holder: None,
                });
            }
            Class::HeartbeatRefusal { detail } => {
                return Err(BdError::HeartbeatRefused {
                    bead: op.bead().unwrap_or_default().to_string(),
                    stderr: detail,
                });
            }
            Class::EnvelopeBad { detail } => {
                return Err(BdError::Envelope {
                    context: context.to_string(),
                    detail,
                });
            }
            Class::Unknown => {
                if !generic_retried {
                    generic_retried = true;
                    continue;
                }
                // Terminal: re-read state when a bead id is in play. Strictly
                // best-effort and non-recursive; on any re-read problem, fall
                // through to Beads with the ORIGINAL stderr.
                if let Some(bead) = op.bead() {
                    if let Some(observed) = runner.reread_assignee(bead).await {
                        let differs = op.actor().is_none_or(|a| a != observed);
                        if !observed.is_empty() && differs {
                            return Err(BdError::LeaseHeld {
                                bead: bead.to_string(),
                                holder: Some(observed),
                            });
                        }
                    }
                }
                return Err(BdError::Beads {
                    context: context.to_string(),
                    exit: out.exit,
                    stdout: out.stdout,
                    stderr: out.stderr,
                });
            }
        }
    }
}

/// Upper bound in milliseconds for the k-th contention retry sleep:
/// `min(1000 ms, 50 ms x 2^(k-1))`.
pub(crate) fn jitter_cap_ms(attempt: u32) -> u64 {
    let exp = attempt.saturating_sub(1).min(10);
    (50u64 << exp).min(1000)
}

/// Process-global draw counter: every failed attempt draws once, so the seed
/// varies across draws even for the same k.
static JITTER_DRAWS: AtomicU64 = AtomicU64::new(0);

/// Draw a full-jitter sleep uniformly from the closed interval
/// `[0, jitter_cap_ms(attempt)]`, via a small inline xorshift64 PRNG seeded
/// from `(pid as u64) << 32 ^ attempt counter` — the `rand` crate is not in
/// the workspace pins.
pub(crate) fn jitter_ms(attempt: u32) -> u64 {
    let cap = jitter_cap_ms(attempt);
    let counter = JITTER_DRAWS
        .fetch_add(1, Ordering::Relaxed)
        .wrapping_add(u64::from(attempt));
    let seed = (u64::from(std::process::id()) << 32) ^ counter;
    let mut x = seed | 1; // xorshift state must be nonzero
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    x % (cap + 1)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::invoke::WriteOp;
    use serde_json::json;

    struct Canned {
        outs: Vec<Result<RawOutcome, BdError>>,
        runs: u32,
        reread: Option<String>,
        rereads: u32,
    }

    impl Canned {
        fn new(outs: Vec<Result<RawOutcome, BdError>>) -> Self {
            Self {
                outs,
                runs: 0,
                reread: None,
                rereads: 0,
            }
        }
    }

    impl AttemptRunner for Canned {
        fn run<'a>(
            &'a mut self,
            _attempt: u32,
        ) -> Pin<Box<dyn Future<Output = Result<RawOutcome, BdError>> + Send + 'a>> {
            self.runs += 1;
            let out = if self.outs.is_empty() {
                panic!("policy ran more attempts than canned outputs");
            } else {
                self.outs.remove(0)
            };
            Box::pin(async move { out })
        }

        fn reread_assignee<'a>(
            &'a mut self,
            _bead: &'a str,
        ) -> Pin<Box<dyn Future<Output = Option<String>> + Send + 'a>> {
            self.rereads += 1;
            let r = self.reread.clone();
            Box::pin(async move { r })
        }
    }

    fn fail(stderr: &str) -> Result<RawOutcome, BdError> {
        Ok(RawOutcome {
            exit: Some(1),
            stdout: String::new(),
            stderr: stderr.to_string(),
        })
    }

    fn success() -> Result<RawOutcome, BdError> {
        Ok(RawOutcome {
            exit: Some(0),
            stdout: r#"{"data": {"id": "beads-1al"}, "schema_version": 1}"#.to_string(),
            stderr: String::new(),
        })
    }

    fn other_op() -> WriteOp {
        WriteOp::Other {
            bead: Some("beads-1al".to_string()),
            actor: Some("me".to_string()),
        }
    }

    #[tokio::test]
    async fn dolt_string_retries_with_jitter_then_contention() {
        let mut runner = Canned::new((0..5).map(|_| fail(DOLT_LOCK_REFUSAL)).collect());
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        match err {
            BdError::Contention { attempts, stderr } => {
                assert_eq!(attempts, 5);
                assert!(stderr.contains(DOLT_LOCK_REFUSAL));
            }
            other => panic!("expected Contention, got {other:?}"),
        }
        assert_eq!(runner.runs, 5, "attempts k = 1..5, then stop");
        assert_eq!(runner.rereads, 0);
    }

    #[tokio::test]
    async fn contention_can_resolve_mid_schedule() {
        let mut runner = Canned::new(vec![fail(DOLT_LOCK_REFUSAL), success()]);
        let v = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap();
        assert_eq!(v, json!({"id": "beads-1al"}));
        assert_eq!(runner.runs, 2);
    }

    #[tokio::test]
    async fn already_claimed_is_lease_held_with_no_retry() {
        let op = WriteOp::Claim {
            bead: Some("beads-1al".to_string()),
            actor: "me".to_string(),
        };
        let mut runner = Canned::new(vec![fail("Error: issue already claimed by doctor")]);
        let err = write_policy(&op, &mut runner, false, "bd update")
            .await
            .unwrap_err();
        match err {
            BdError::LeaseHeld { bead, .. } => assert_eq!(bead, "beads-1al"),
            other => panic!("expected LeaseHeld, got {other:?}"),
        }
        assert_eq!(runner.runs, 1, "a claim refusal is an outcome, not a fault");
    }

    #[tokio::test]
    async fn claim_refusal_matches_stdout_even_on_zero_exit() {
        // BUG-10: bd update --claim on an already-claimed issue has been
        // observed printing the refusal while exiting 0.
        let op = WriteOp::Claim {
            bead: Some("beads-1al".to_string()),
            actor: "me".to_string(),
        };
        let out = Ok(RawOutcome {
            exit: Some(0),
            stdout:
                r#"{"data":{"error":"1 of 1 issues failed to update","failed":[{"id":"beads-1al","error":"updating issue: issue already claimed by doctor"}]},"schema_version":1}"#
                    .to_string(),
            stderr: String::new(),
        });
        let mut runner = Canned::new(vec![out]);
        let err = write_policy(&op, &mut runner, false, "bd update")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::LeaseHeld { .. }), "got {err:?}");
        assert_eq!(runner.runs, 1);
    }

    #[tokio::test]
    async fn unknown_error_retries_exactly_once_then_beads_with_stderr() {
        let mut runner = Canned::new(vec![fail("boom"), fail("boom")]);
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        match err {
            BdError::Beads { stderr, exit, .. } => {
                assert_eq!(stderr, "boom");
                assert_eq!(exit, Some(1));
            }
            other => panic!("expected Beads, got {other:?}"),
        }
        assert_eq!(runner.runs, 2, "exactly one retry");
        assert_eq!(runner.rereads, 1, "terminal unknown failures re-read state");
    }

    #[tokio::test]
    async fn live_other_assignee_on_reread_is_lease_held() {
        let mut runner = Canned::new(vec![fail("boom"), fail("boom")]);
        runner.reread = Some("someone-else".to_string());
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        match err {
            BdError::LeaseHeld { bead, holder } => {
                assert_eq!(bead, "beads-1al");
                assert_eq!(holder.as_deref(), Some("someone-else"));
            }
            other => panic!("expected LeaseHeld, got {other:?}"),
        }
    }

    #[tokio::test]
    async fn reread_matching_own_actor_falls_through_to_beads() {
        let mut runner = Canned::new(vec![fail("boom"), fail("boom")]);
        runner.reread = Some("me".to_string());
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::Beads { .. }), "got {err:?}");
    }

    #[tokio::test]
    async fn heartbeat_refusal_is_never_lease_held_and_never_retried() {
        let op = WriteOp::Heartbeat {
            bead: "beads-1al".to_string(),
            actor: "me".to_string(),
        };
        // Observed refusal envelope: data.error carries the copy; exit 1.
        let out = Ok(RawOutcome {
            exit: Some(1),
            stdout: r#"{"data":{"error":"heartbeat beads-1al: issue already claimed by doctor"},"schema_version":1}"#
                .to_string(),
            stderr: String::new(),
        });
        let mut runner = Canned::new(vec![out]);
        let err = write_policy(&op, &mut runner, false, "bd heartbeat")
            .await
            .unwrap_err();
        match err {
            BdError::HeartbeatRefused { bead, stderr } => {
                assert_eq!(bead, "beads-1al");
                assert!(stderr.contains("already claimed"));
            }
            other => panic!("expected HeartbeatRefused, got {other:?}"),
        }
        assert_eq!(runner.runs, 1);
        assert_eq!(runner.rereads, 0, "heartbeats never re-read");
    }

    #[tokio::test]
    async fn heartbeat_dolt_contention_still_retries() {
        let op = WriteOp::Heartbeat {
            bead: "beads-1al".to_string(),
            actor: "me".to_string(),
        };
        let hb_ok = Ok(RawOutcome {
            exit: Some(0),
            stdout: r#"{"data": {"id": "beads-1al", "owner": "me", "status": "heartbeat"}, "schema_version": 1}"#
                .to_string(),
            stderr: String::new(),
        });
        let mut runner = Canned::new(vec![fail(DOLT_LOCK_REFUSAL), hb_ok]);
        write_policy(&op, &mut runner, false, "bd heartbeat")
            .await
            .expect("contention then success");
        assert_eq!(runner.runs, 2);
    }

    #[tokio::test]
    async fn timeout_retries_once_then_stays_timeout() {
        let t = || {
            Err(BdError::Timeout {
                context: "bd update".to_string(),
                after_s: 60,
            })
        };
        let mut runner = Canned::new(vec![t(), t()]);
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::Timeout { after_s: 60, .. }), "got {err:?}");
        assert_eq!(runner.runs, 2);

        let mut runner = Canned::new(vec![t(), success()]);
        write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .expect("timeout then success");
        assert_eq!(runner.runs, 2);
    }

    #[tokio::test]
    async fn spawn_failure_is_terminal_immediately() {
        let mut runner = Canned::new(vec![Err(BdError::SpawnFailed {
            context: "bd update".to_string(),
            detail: "no such file".to_string(),
        })]);
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::SpawnFailed { .. }), "got {err:?}");
        assert_eq!(runner.runs, 1);
    }

    #[test]
    fn jitter_stays_in_the_closed_interval_for_each_k() {
        for k in 1..=8u32 {
            let cap = jitter_cap_ms(k);
            assert_eq!(cap, (50u64 << (k - 1).min(10)).min(1000));
            for _ in 0..200 {
                let v = jitter_ms(k);
                assert!(v <= cap, "draw {v} above cap {cap} for k={k}");
            }
        }
        // Spot-check the spec'd bounds: k=1 -> 50ms, k=5 -> 800ms, k=6+ -> 1000ms.
        assert_eq!(jitter_cap_ms(1), 50);
        assert_eq!(jitter_cap_ms(2), 100);
        assert_eq!(jitter_cap_ms(5), 800);
        assert_eq!(jitter_cap_ms(6), 1000);
        assert_eq!(jitter_cap_ms(60), 1000);
    }
}
