//! Merge-slot discipline plus the stale-holder reaper.
//!
//! bd's merge-slot CAS is sound (second acquire refused) but bare
//! `bd merge-slot release` force-releases ANY holder — the hole is confirmed
//! live in bd 1.2.1 — so `--holder` is mandatory on acquire AND release at
//! the type level; no bare-release call is constructible from this crate's
//! API. (With `--holder` given, bd refuses a mismatch: probe observed
//! `slot held by holder-x, not holder-z`, exit 1.)
//!
//! ENVELOPE EXCEPTION (source-verified in bd 1.2.1): the merge-slot commands
//! ignore `BD_JSON_ENVELOPE` and emit raw JSON objects with no
//! `data`/`schema_version` wrapper — all four merge-slot commands are parsed
//! as raw JSON, never through the envelope parser. (Merge-slot ERRORS can
//! still arrive enveloped: the mismatch refusal above came back as
//! `{"data":{"error":...},"schema_version":1}`; the haystack matching covers
//! both.)
//!
//! Acquire-when-held is NOT an error to escalate and NOT a queue to join
//! (never any bd waiters/wait surface): acquire retries on the module-4
//! backoff up to a caller-supplied budget, then returns
//! [`BdError::SlotBusy`].

use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde_json::Value;

use crate::classify::{self, BdError};
use crate::config::BdConfig;
use crate::envelope;
use crate::guardian::{probe_pid, PidState};
use crate::invoke;

/// A successful merge-slot acquisition.
#[derive(Debug, Clone)]
pub struct AcquiredSlot {
    /// The holder the slot was acquired for.
    pub holder: String,
    /// The wrapper's own clock reading at acquisition (unix epoch seconds) —
    /// bd's slot carries no timestamp field; persisting this is the caller's
    /// job (the ledger owns the acquisition clock).
    pub acquired_at_epoch_s: u64,
    /// The raw parsed JSON bd returned for the acquire.
    pub raw: Value,
}

/// The merge slot's current state as reported by `check`.
#[derive(Debug, Clone)]
pub struct SlotStatus {
    /// Whether a holder currently holds the slot. (A missing slot — check
    /// before create — reports `held: false`; observed raw output
    /// `{"available": false, "error": "not found", "id": "beads-merge-slot"}`.)
    pub held: bool,
    /// The current holder, when one holds the slot.
    pub holder: Option<String>,
    /// The raw parsed JSON bd returned for the check.
    pub raw: Value,
}

/// One holder forged's ledger recorded as having acquired the slot — the
/// caller is the source of truth for what forged acquired.
#[derive(Debug, Clone)]
pub struct RecordedHolder {
    /// The exact holder string used at acquire time.
    pub holder: String,
    /// The pid of the attempt that acquired.
    pub attempt_pid: u32,
    /// Optional `ps -o lstart=` hint captured at acquire time; a mismatch
    /// counts the pid as dead (reuse protection).
    pub pid_start_hint: Option<String>,
}

/// The reaper's typed report.
#[derive(Debug, Clone)]
pub struct ReapReport {
    /// Per-holder outcomes. Fail-closed: an EMPTY report means the reaper
    /// could not act — the `check` failed, the holder's pid could not be
    /// probed conclusively, or a release attempt failed. It never means
    /// "nothing needed doing" (that is [`ReapOutcome::SlotFree`]).
    pub entries: Vec<ReapEntry>,
}

/// One reaper outcome, about the slot's current holder.
#[derive(Debug, Clone)]
pub struct ReapEntry {
    /// The holder this outcome describes (empty for [`ReapOutcome::SlotFree`]
    /// — a free slot has no holder).
    pub holder: String,
    /// What the reaper found or did.
    pub outcome: ReapOutcome,
}

/// What the reaper found or did for a holder.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ReapOutcome {
    /// The slot was free: nothing to do.
    SlotFree,
    /// The current holder is not in the recorded list: REFUSED — the reaper
    /// never auto-reaps a holder forged did not record.
    UnknownHolder,
    /// The recorded holder's attempt process is still alive: left alone.
    HolderAlive,
    /// The recorded holder's attempt process was dead; the slot was released
    /// with that exact `--holder`.
    Released,
}

fn epoch_s() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn validate_holder(holder: &str) -> Result<(), BdError> {
    if holder.is_empty() || holder.contains('\n') {
        return Err(BdError::Beads {
            context: "holder validation".to_string(),
            exit: None,
            stdout: String::new(),
            stderr: format!("holder must be non-empty with no newline, got {holder:?}"),
        });
    }
    Ok(())
}

/// A raw-JSON merge-slot WRITE under the module-4 policy (Dolt contention
/// retries, one generic retry, no bead re-read — slot ops name no bead).
async fn slot_write(bd: &BdConfig, args: &[&str], context: &str) -> Result<Value, BdError> {
    struct SlotRunner<'a> {
        bd: &'a BdConfig,
        args: &'a [&'a str],
        context: &'a str,
    }
    impl classify::AttemptRunner for SlotRunner<'_> {
        fn run<'s>(
            &'s mut self,
            _attempt: u32,
        ) -> std::pin::Pin<
            Box<
                dyn std::future::Future<Output = Result<classify::RawOutcome, BdError>> + Send + 's,
            >,
        > {
            Box::pin(async move { invoke::run_locked_once(self.bd, self.args, self.context).await })
        }
        fn reread_assignee<'s>(
            &'s mut self,
            _bead: &'s str,
        ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Option<String>> + Send + 's>>
        {
            Box::pin(async move { None })
        }
    }
    let op = invoke::WriteOp::Other {
        bead: None,
        actor: None,
    };
    let mut runner = SlotRunner { bd, args, context };
    classify::write_policy(&op, &mut runner, true, context).await
}

/// Create the merge slot: `bd merge-slot create --json`.
///
/// Observed raw output (bd 1.2.1): `{"id": "beads-merge-slot", "status":
/// "open"}`, exit 0 — and the command is idempotent (a second create returns
/// the same shape, exit 0).
pub async fn slot_create(bd: &BdConfig) -> Result<(), BdError> {
    slot_write(
        bd,
        &["merge-slot", "create", "--json"],
        "bd merge-slot create",
    )
    .await
    .map(|_| ())
}

/// Release the merge slot with an explicit holder:
/// `bd merge-slot release --holder <h> --json`. Observed raw output:
/// `{"id": "beads-merge-slot", "released": true}`, exit 0.
pub async fn slot_release(bd: &BdConfig, holder: &str) -> Result<(), BdError> {
    validate_holder(holder)?;
    let args = ["merge-slot", "release", "--holder", holder, "--json"];
    slot_write(bd, &args, "bd merge-slot release")
        .await
        .map(|_| ())
}

/// Check the merge slot: `bd merge-slot check --json` (a READ: no lock).
///
/// Observed raw outputs (bd 1.2.1): free slot `{"available": true, "holder":
/// null, "id": "beads-merge-slot", "waiters": null}`; held slot
/// `{"available": false, "holder": "holder-x", "id": "beads-merge-slot",
/// "waiters": null}`; missing slot `{"available": false, "error": "not
/// found", "id": "beads-merge-slot"}` — all exit 0.
pub async fn slot_check(bd: &BdConfig) -> Result<SlotStatus, BdError> {
    let context = "bd merge-slot check";
    let args = ["merge-slot", "check", "--json"];
    let out = invoke::run_bd(bd, &args, bd.read_timeout_s, context).await?;
    if out.exit != Some(0) {
        return Err(BdError::Beads {
            context: context.to_string(),
            exit: out.exit,
            stdout: out.stdout,
            stderr: out.stderr,
        });
    }
    let raw: Value = serde_json::from_str(&out.stdout).map_err(|e| BdError::Envelope {
        context: context.to_string(),
        detail: format!("unparseable raw JSON ({e}); stdout: {}", out.stdout),
    })?;
    let holder = raw
        .get("holder")
        .and_then(Value::as_str)
        .filter(|h| !h.is_empty())
        .map(str::to_string);
    Ok(SlotStatus {
        held: holder.is_some(),
        holder,
        raw,
    })
}

/// Acquire the merge slot for `holder`, retrying with the module-4 backoff
/// while it is busy, up to the caller-supplied `budget` of cumulative sleep.
/// When the budget would be exceeded, returns [`BdError::SlotBusy`] with the
/// holder from a final `check` call.
///
/// Observed raw outputs (bd 1.2.1): success `{"acquired": true, "holder":
/// "holder-x", "id": "beads-merge-slot"}`, exit 0; held `{"acquired": false,
/// "holder": "holder-x", "id": "beads-merge-slot"}`, exit 1 — exactly that
/// outcome is slot-busy, never `Contention`, `LeaseHeld`, or `Beads`.
pub async fn slot_acquire(
    bd: &BdConfig,
    holder: &str,
    budget: Duration,
) -> Result<AcquiredSlot, BdError> {
    validate_holder(holder)?;
    let context = "bd merge-slot acquire";
    let args = ["merge-slot", "acquire", "--holder", holder, "--json"];
    let budget_ms = u64::try_from(budget.as_millis()).unwrap_or(u64::MAX);
    let mut slept_ms: u64 = 0;
    let mut busy_attempts: u32 = 0;
    let mut contention_attempts: u32 = 0;
    let mut generic_retried = false;
    loop {
        let out = match invoke::run_locked_once(bd, &args, context).await {
            Ok(o) => o,
            Err(BdError::Timeout {
                context: c,
                after_s,
            }) => {
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
        if let Ok(raw) = serde_json::from_str::<Value>(&out.stdout) {
            match raw.get("acquired").and_then(Value::as_bool) {
                Some(true) => {
                    return Ok(AcquiredSlot {
                        holder: holder.to_string(),
                        acquired_at_epoch_s: epoch_s(),
                        raw,
                    });
                }
                Some(false) => {
                    busy_attempts += 1;
                    // Floor each accounted sleep at 1 ms so a run of 0-draws
                    // cannot spin past the budget forever.
                    let drawn = classify::jitter_ms(busy_attempts).max(1);
                    if slept_ms + drawn > budget_ms {
                        let holder_now = match slot_check(bd).await {
                            Ok(s) => s.holder,
                            Err(_) => None,
                        };
                        return Err(BdError::SlotBusy { holder: holder_now });
                    }
                    tokio::time::sleep(Duration::from_millis(drawn)).await;
                    slept_ms += drawn;
                    continue;
                }
                None => {}
            }
        }
        // Not an acquire-shaped output: classify like any other write.
        let env_err = envelope::parse_lenient(&out.stdout)
            .error
            .unwrap_or_default();
        let haystack = format!("{}\n{env_err}\n{}", out.stdout, out.stderr);
        if haystack.contains(classify::DOLT_LOCK_REFUSAL) {
            contention_attempts += 1;
            if contention_attempts >= 5 {
                return Err(BdError::Contention {
                    attempts: contention_attempts,
                    stderr: out.stderr,
                });
            }
            tokio::time::sleep(Duration::from_millis(classify::jitter_ms(
                contention_attempts,
            )))
            .await;
            continue;
        }
        if out.exit == Some(0) {
            return Err(BdError::Envelope {
                context: context.to_string(),
                detail: format!("stdout: {}; stderr: {}", out.stdout, out.stderr),
            });
        }
        if !generic_retried {
            generic_retried = true;
            continue;
        }
        return Err(BdError::Beads {
            context: context.to_string(),
            exit: out.exit,
            stdout: out.stdout,
            stderr: out.stderr,
        });
    }
}

/// Reap a stale merge-slot holder, fail-closed: `check` the current holder;
/// a free slot is nothing to do; a holder NOT in `recorded` is REFUSED
/// ([`ReapOutcome::UnknownHolder`] — never auto-reap a holder forged did not
/// record); a recorded holder is released with that exact `--holder` only
/// after its attempt process is confirmed dead (pid probe as in the
/// guardian; start-hint mismatch counts as dead). A live recorded holder is
/// left alone.
///
/// The pid probe is tri-state and the reaper honours all three: it releases
/// ONLY on [`PidState::Dead`] (a confirmed-absent pid or a start-hint
/// mismatch). A probe that could not be completed — spawn failure, timeout,
/// a permission refusal, an unreadable `ps` — is [`PidState::Unknown`] and
/// the reaper REFUSES to act on it, reporting the empty "could not act"
/// report rather than releasing a holder that may well be alive.
pub async fn reap_stale_holders(bd: &BdConfig, recorded: &[RecordedHolder]) -> ReapReport {
    let status = match slot_check(bd).await {
        Ok(s) => s,
        // Fail-closed: an unreadable slot is not acted on.
        Err(_) => return ReapReport { entries: vec![] },
    };
    let Some(current) = status.holder else {
        return ReapReport {
            entries: vec![ReapEntry {
                holder: String::new(),
                outcome: ReapOutcome::SlotFree,
            }],
        };
    };
    let Some(rec) = recorded.iter().find(|r| r.holder == current) else {
        return ReapReport {
            entries: vec![ReapEntry {
                holder: current,
                outcome: ReapOutcome::UnknownHolder,
            }],
        };
    };
    match probe_pid(rec.attempt_pid, rec.pid_start_hint.as_deref()).await {
        PidState::Alive => {
            return ReapReport {
                entries: vec![ReapEntry {
                    holder: current,
                    outcome: ReapOutcome::HolderAlive,
                }],
            };
        }
        // Fail-closed: an inconclusive probe is NOT a death certificate. The
        // slot stays held and the empty report says the reaper could not act.
        PidState::Unknown => return ReapReport { entries: vec![] },
        PidState::Dead => {}
    }
    match slot_release(bd, &current).await {
        Ok(()) => ReapReport {
            entries: vec![ReapEntry {
                holder: current,
                outcome: ReapOutcome::Released,
            }],
        },
        // Fail-closed: a failed release is reported as an empty report, not
        // a claimed success.
        Err(_) => ReapReport { entries: vec![] },
    }
}
