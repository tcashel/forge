//! The contention classifier and the crate error type [`BdError`].
//!
//! Classification is OPERATION-AWARE (see the crate-internal `WriteOp`): claim
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

/// bd 1.2.1's exact refusal when `--claim` is attempted on a blocked issue.
///
/// A guarded plain assignment intentionally bypasses this claimable-status
/// rule. Forged retains the exact copy so a binary that unexpectedly applies
/// the rule to that guarded assignment can be parked deterministically rather
/// than spending the rest of a settlement retry budget on the same answer.
pub const BLOCKED_CLAIM_REFUSAL: &str = "issue not claimable: status blocked";

/// The status-parameterized prefix of bd 1.2.1's claimable-status refusal:
/// "issue not claimable: status <status>". Classification matches the
/// PREFIX so a refusal naming any non-claimable status parks instead of
/// burning the retry budget on an unchangeable answer.
pub const CLAIM_REFUSAL_PREFIX: &str = "issue not claimable: status ";

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
    /// bd ANSWERED and the answer was unusable: a schema-1 envelope with no
    /// `data` key or a payload carrying none of what was asked for, or an
    /// envelope under a `schema_version` this build does not read. An
    /// outcome, never a transport failure — every retry re-reads the same
    /// envelope, and a schema this build cannot read means bd was UPGRADED,
    /// which retrying cannot resolve. Wire mapping: `BEADS_ERROR`.
    Envelope {
        /// What was being run.
        context: String,
        /// Both output streams, for diagnosis.
        detail: String,
    },
    /// NO envelope: stdout would not parse at all. bd never answered, so this
    /// rides the bounded transport budget exactly like a spawn failure or a
    /// timeout. Split out of [`BdError::Envelope`] because that variant
    /// carries genuine ANSWERS and must stay terminal — a wrong
    /// `schema_version` is one of them, not this. Wire mapping:
    /// `BEADS_ERROR`.
    Unparseable {
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

impl BdError {
    /// Whether this error carries bd 1.2.1's exact blocked-status claim
    /// refusal on any preserved output stream.
    pub fn is_blocked_claim_refusal(&self) -> bool {
        self.haystack().contains(BLOCKED_CLAIM_REFUSAL)
    }

    /// The claimable-status refusal this error carries, when it carries
    /// one: the "issue not claimable: status <status>" fragment for ANY
    /// status, extracted for durable park evidence.
    pub fn claim_refusal(&self) -> Option<String> {
        let haystack = self.haystack();
        let start = haystack.find(CLAIM_REFUSAL_PREFIX)?;
        let fragment = &haystack[start..];
        let end = fragment
            .find(['\n', '"'])
            .unwrap_or(fragment.len());
        Some(fragment[..end].trim_end().to_owned())
    }

    /// Whether bd never ANSWERED — the only class a caller may charge to a
    /// bounded transport-retry budget.
    ///
    /// The split is not severity, it is whether the store spoke. A call that
    /// produced its schema-1 envelope reported an OUTCOME — a bead that does
    /// not exist, a lease held by someone else, a refused write — and every
    /// retry re-reads the same answer until the budget is gone. A call that
    /// produced no envelope at all (spawn failure, timeout, a child killed
    /// before it could write, unparseable stdout) says nothing about the
    /// store and is the one thing worth trying again.
    ///
    /// AN ANSWER IS CLASSIFIED ON WHAT IT SAYS, never on the fact that it
    /// parsed. The Dolt embedded lock is the documented case and it is
    /// checked against every variant including the well-formed ones: bd
    /// answered, but with a lock that clears on its own. READS need that
    /// check here and nowhere else — `invoke::read` runs no classifier and no
    /// retries, so a `bd show` refused by the lock a live run or an epic wave
    /// holds arrives as a finished error and would otherwise take the run
    /// down instead of riding the budget.
    ///
    /// The converse holds too: an envelope that parses under a
    /// `schema_version` this build does not read is an ANSWER — bd was
    /// upgraded — and stays terminal. THAT ANSWER OUTRANKS THE CAUSE TEXT,
    /// which is why it is tested first. A cause is worth retrying only when a
    /// later attempt could read a different outcome, and no attempt against
    /// an upgraded bd can: the lock clearing would only yield the same
    /// unreadable dialect, so a lock marker inside an unsupported envelope
    /// would otherwise burn the whole bounded budget on a condition the
    /// budget cannot resolve. A DECLARED version is the test — stdout with no
    /// envelope at all declares nothing and keeps riding the budget.
    pub fn is_transport(&self) -> bool {
        if self.unretryable_answer() {
            return false;
        }
        if self.haystack().contains(DOLT_LOCK_REFUSAL) {
            return true;
        }
        match self {
            BdError::Contention { .. }
            | BdError::SpawnFailed { .. }
            | BdError::Timeout { .. }
            | BdError::Unparseable { .. } => true,
            // A nonzero exit is a REFUSAL when bd still emitted its
            // envelope — bd 1.2.1 answers an unknown id with exit 1 and
            // `{"data":{"error":"no issues found matching the provided
            // IDs"},"schema_version":1}` — and a transport failure when it
            // did not.
            BdError::Beads { stdout, .. } => !envelope::parse_lenient(stdout).parsed,
            BdError::Envelope { .. }
            | BdError::LeaseHeld { .. }
            | BdError::HeartbeatRefused { .. }
            | BdError::SlotBusy { .. } => false,
        }
    }

    /// Whether this error carries an answer NO RETRY CAN CHANGE — the one
    /// class that outranks the cause-text check.
    ///
    /// [`BdError::Envelope`] is that variant by construction: bd answered in
    /// a dialect or a shape this build cannot use, and the variant exists to
    /// stay terminal. `Beads` carries the stdout to re-read the declared
    /// `schema_version` from. Either way a retry earned by a cause marker
    /// could only re-read the same unusable answer.
    fn unretryable_answer(&self) -> bool {
        match self {
            BdError::Beads { stdout, .. } => envelope::parse_lenient(stdout).unsupported_schema(),
            BdError::Envelope { .. } => true,
            _ => false,
        }
    }

    /// Every text stream this error still carries, joined exactly as
    /// [`classify_attempt`] builds its own haystack: raw stdout, the
    /// envelope's error string, and stderr. Case-sensitive substring
    /// matching, evaluated regardless of exit status.
    fn haystack(&self) -> String {
        match self {
            BdError::Beads { stdout, stderr, .. } => {
                let env_err = envelope::parse_lenient(stdout).error.unwrap_or_default();
                format!("{stdout}\n{env_err}\n{stderr}")
            }
            BdError::Envelope { detail, .. }
            | BdError::Unparseable { detail, .. }
            | BdError::SpawnFailed { detail, .. } => detail.clone(),
            BdError::Contention { stderr, .. } | BdError::HeartbeatRefused { stderr, .. } => {
                stderr.clone()
            }
            BdError::LeaseHeld { .. } | BdError::SlotBusy { .. } | BdError::Timeout { .. } => {
                String::new()
            }
        }
    }
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
            BdError::Unparseable { context, detail } => {
                write!(f, "{context} returned no parseable envelope: {detail}")
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
    /// bd answered and the answer is unusable: a schema-1 envelope carrying
    /// no `data` key, or an envelope under a `schema_version` this build does
    /// not read. Terminal either way, because bd answered.
    EnvelopeBad {
        /// Both streams for diagnosis.
        detail: String,
    },
    /// Zero exit and unparseable stdout: terminal for the write policy, but
    /// bd never answered, so the error it mints rides the transport budget.
    Unparseable {
        /// Both streams for diagnosis.
        detail: String,
    },
    /// Any other failure: retry once, then re-read/terminal.
    Unknown,
}

/// Classify one attempt. All text matching runs against the combined haystack
/// of raw stdout, the envelope's error string, and stderr — case-sensitive
/// substring, evaluated regardless of exit status, operation-aware.
///
/// An envelope declaring a `schema_version` this build does not read is
/// settled BEFORE any of that matching, because it is the one answer no
/// retry can change. Everything after it describes a condition a later
/// attempt could plausibly find cleared.
pub(crate) fn classify_attempt(op: &WriteOp, out: &RawOutcome, raw_mode: bool) -> Class {
    let lenient = envelope::parse_lenient(&out.stdout);
    let env_err = lenient.error.clone().unwrap_or_default();
    let haystack = format!("{}\n{}\n{}", out.stdout, env_err, out.stderr);

    if !raw_mode && lenient.unsupported_schema() {
        // FIRST, ahead of every cause-text check below and of the
        // operation-specific arms: bd DECLARED a dialect this build does not
        // read, and no retry can read a different one. A lock marker inside
        // such an envelope would otherwise take the contention schedule and
        // spend the whole bounded budget on an upgrade that outlives it.
        return Class::EnvelopeBad {
            detail: format!("unsupported schema_version; {}", both_streams(out)),
        };
    }
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
            // The `data` key must be PRESENT, exactly as on the generic path
            // below: a heartbeat's success is what the guardian takes as proof
            // the lease is still held (it appends a beat-file line on it), so
            // an envelope carrying no data at all is EnvelopeBad, not a beat.
            // (`"data": null` is a present key and stays a success.)
            return match lenient.data {
                Some(d) => Class::Success(d),
                None => Class::EnvelopeBad {
                    detail: format!("envelope missing data key; {}", both_streams(out)),
                },
            };
        }
        if out.exit == Some(0) && !lenient.parsed {
            return Class::Unparseable {
                detail: both_streams(out),
            };
        }
        if out.exit == Some(0) && !lenient.schema_ok {
            // Parsed, but declaring no version at all — the check above took
            // every declared-and-unreadable one.
            return Class::EnvelopeBad {
                detail: format!("unsupported schema_version; {}", both_streams(out)),
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
                Err(e) => Class::Unparseable {
                    detail: format!("unparseable raw JSON ({e}); {}", both_streams(out)),
                },
            };
        }
        if !lenient.parsed {
            return Class::Unparseable {
                detail: both_streams(out),
            };
        }
        if !lenient.schema_ok {
            // Parsed, but declaring no version at all — the declared-and-
            // unreadable case is settled at the top of this function.
            // Terminal either way: bd handed back a payload this build has no
            // envelope contract for.
            return Class::EnvelopeBad {
                detail: format!("unsupported schema_version; {}", both_streams(out)),
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
            Err(BdError::Timeout {
                context: c,
                after_s,
            }) => {
                if generic_retried {
                    // A Timeout is treated exactly like any other unknown
                    // failure, terminal step included: the best-effort
                    // re-read runs before it is surfaced, so a write that
                    // timed out because someone else holds the bead reports
                    // LeaseHeld rather than a bare stopwatch reading.
                    return Err(timeout_terminal(op, runner, c, after_s).await);
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
            Class::Unparseable { detail } => {
                return Err(BdError::Unparseable {
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
                if let Some(held) = lease_held_from_reread(op, runner).await {
                    return Err(held);
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

/// The generic path's terminal state re-read: when a bead id is in play, ask
/// bd who holds it. A live DIFFERENT assignee is [`BdError::LeaseHeld`];
/// anything else — no bead, a failed or unparseable re-read, an empty field,
/// or our own actor — is `None`, and the caller keeps its original error.
/// Strictly best-effort and non-recursive: the re-read's own failure is never
/// surfaced or re-classified.
///
/// Heartbeats are excluded outright: `bd heartbeat` NEVER enters the re-read
/// path and never yields `LeaseHeld`. Without this guard a heartbeat whose
/// child timed out twice would reach here through [`timeout_terminal`] and
/// come back `LeaseHeld` — the one classification the heartbeat contract
/// forbids, and one callers act on differently from a lost lease.
pub(crate) async fn lease_held_from_reread(
    op: &WriteOp,
    runner: &mut dyn AttemptRunner,
) -> Option<BdError> {
    if matches!(op, WriteOp::Heartbeat { .. }) {
        return None;
    }
    let bead = op.bead()?;
    let observed = runner.reread_assignee(bead).await?;
    let differs = op.actor().is_none_or(|a| a != observed);
    if !observed.is_empty() && differs {
        return Some(BdError::LeaseHeld {
            bead: bead.to_string(),
            holder: Some(observed),
        });
    }
    None
}

/// Terminal classification for a [`BdError::Timeout`] that survived its one
/// retry — including a timeout acquiring the write flock, which never reaches
/// [`write_policy`]. The generic path's best-effort re-read runs first; when
/// it settles nothing, the `Timeout` stands.
pub(crate) async fn timeout_terminal(
    op: &WriteOp,
    runner: &mut dyn AttemptRunner,
    context: String,
    after_s: u64,
) -> BdError {
    match lease_held_from_reread(op, runner).await {
        Some(held) => held,
        None => BdError::Timeout { context, after_s },
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
    async fn a_heartbeat_envelope_with_no_data_key_is_not_a_beat() {
        let op = WriteOp::Heartbeat {
            bead: "beads-1al".to_string(),
            actor: "me".to_string(),
        };
        // Zero exit, schema-valid, error-free — and no `data` key at all. The
        // guardian treats a successful heartbeat as proof the lease is still
        // held and appends a beat-file line on it, so this envelope must not
        // pass as one.
        let no_data = Ok(RawOutcome {
            exit: Some(0),
            stdout: r#"{"schema_version": 1}"#.to_string(),
            stderr: String::new(),
        });
        let mut runner = Canned::new(vec![no_data]);
        let err = write_policy(&op, &mut runner, false, "bd heartbeat")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::Envelope { .. }), "got {err:?}");
        assert_eq!(runner.runs, 1);

        // `data: null` is a PRESENT key (the empty-list shape) and stays a beat.
        let null_data = Ok(RawOutcome {
            exit: Some(0),
            stdout: r#"{"data": null, "schema_version": 1}"#.to_string(),
            stderr: String::new(),
        });
        let mut runner = Canned::new(vec![null_data]);
        write_policy(&op, &mut runner, false, "bd heartbeat")
            .await
            .expect("a present data key, even null, is a beat");
    }

    #[tokio::test]
    async fn the_write_policy_splits_unparseable_from_unsupported() {
        // The two are opposite answers to "did bd speak?". Unparseable
        // stdout says no and rides the transport budget; an envelope under a
        // schema this build cannot read says YES — from a bd that has been
        // upgraded — and retrying it forever never resolves the upgrade.
        let zero_exit = |stdout: &str| {
            Ok(RawOutcome {
                exit: Some(0),
                stdout: stdout.to_string(),
                stderr: String::new(),
            })
        };

        let mut runner = Canned::new(vec![zero_exit("<html>502</html>")]);
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::Unparseable { .. }), "got {err:?}");
        assert!(err.is_transport(), "no envelope means bd never answered");

        let mut runner = Canned::new(vec![zero_exit(
            r#"{"data": {"id": "beads-1al"}, "schema_version": 2}"#,
        )]);
        let err = write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::Envelope { .. }), "got {err:?}");
        assert!(
            !err.is_transport(),
            "a bd upgrade is an answer, not an outage: {err}"
        );
        assert_eq!(runner.runs, 1, "an answer is never retried");

        // The same split on the heartbeat path, which classifies separately.
        let op = WriteOp::Heartbeat {
            bead: "beads-1al".to_string(),
            actor: "me".to_string(),
        };
        let mut runner = Canned::new(vec![zero_exit(r#"{"data": {}, "schema_version": 2}"#)]);
        let err = write_policy(&op, &mut runner, false, "bd heartbeat")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::Envelope { .. }), "got {err:?}");
        assert!(!err.is_transport());
    }

    #[tokio::test]
    async fn a_nonzero_exit_carrying_an_unsupported_envelope_still_answered() {
        // `is_transport`'s own arm for `Beads`: bd spoke, in a dialect this
        // build does not read. It is still an answer, and folding "wrong
        // schema" into "no envelope" made every one of these retryable.
        let upgraded = BdError::Beads {
            context: "bd show beads-1al".to_string(),
            exit: Some(1),
            stdout: r#"{"data":{"error":"no issues found"},"schema_version":2}"#.to_string(),
            stderr: String::new(),
        };
        assert!(!upgraded.is_transport(), "{upgraded}");

        let silent = BdError::Beads {
            context: "bd show beads-1al".to_string(),
            exit: Some(1),
            stdout: String::new(),
            stderr: "killed".to_string(),
        };
        assert!(silent.is_transport(), "no envelope at all: {silent}");
    }

    #[tokio::test]
    async fn a_terminally_timed_out_heartbeat_never_becomes_lease_held() {
        let t = || {
            Err(BdError::Timeout {
                context: "bd heartbeat".to_string(),
                after_s: 60,
            })
        };
        let op = WriteOp::Heartbeat {
            bead: "beads-1al".to_string(),
            actor: "me".to_string(),
        };
        let mut runner = Canned::new(vec![t(), t()]);
        // Even with another holder there to be found, the heartbeat contract
        // forbids LeaseHeld — callers act on "lease lost" differently from
        // "bd did not answer".
        runner.reread = Some("someone-else".to_string());
        let err = write_policy(&op, &mut runner, false, "bd heartbeat")
            .await
            .unwrap_err();
        assert!(
            matches!(err, BdError::Timeout { after_s: 60, .. }),
            "got {err:?}"
        );
        assert_eq!(runner.rereads, 0, "heartbeats never re-read");
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
        assert!(
            matches!(err, BdError::Timeout { after_s: 60, .. }),
            "got {err:?}"
        );
        assert_eq!(runner.runs, 2);
        assert_eq!(
            runner.rereads, 1,
            "a terminal timeout gets the same best-effort re-read as any other unknown failure"
        );

        let mut runner = Canned::new(vec![t(), success()]);
        write_policy(&other_op(), &mut runner, false, "bd update")
            .await
            .expect("timeout then success");
        assert_eq!(runner.runs, 2);
    }

    #[tokio::test]
    async fn a_terminal_timeout_whose_reread_shows_another_holder_is_lease_held() {
        let t = || {
            Err(BdError::Timeout {
                context: "bd update".to_string(),
                after_s: 60,
            })
        };
        let mut runner = Canned::new(vec![t(), t()]);
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
    async fn timeout_terminal_keeps_the_timeout_when_the_reread_settles_nothing() {
        // The flock-acquisition path: no attempt ever ran, so this helper is
        // the whole terminal classification.
        let mut runner = Canned::new(vec![]);
        let err =
            timeout_terminal(&other_op(), &mut runner, "beads write lock".to_string(), 60).await;
        match err {
            BdError::Timeout { context, after_s } => {
                assert_eq!(context, "beads write lock");
                assert_eq!(after_s, 60);
            }
            other => panic!("expected Timeout, got {other:?}"),
        }
        assert_eq!(runner.rereads, 1);
        assert_eq!(runner.runs, 0, "the lock timeout runs no bd attempt");

        let mut runner = Canned::new(vec![]);
        runner.reread = Some("someone-else".to_string());
        let err =
            timeout_terminal(&other_op(), &mut runner, "beads write lock".to_string(), 60).await;
        assert!(matches!(err, BdError::LeaseHeld { .. }), "got {err:?}");
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

    #[test]
    fn a_refusal_bd_answered_is_not_transport_but_an_unanswered_call_is() {
        // Probe-verified bd 1.2.1 shape for an unknown id: exit 1, and the
        // envelope still arrives. bd answered; retrying re-reads the same
        // answer, so this must never ride a transport budget.
        let not_found = BdError::Beads {
            context: "bd show does-not-exist".to_string(),
            exit: Some(1),
            stdout: "{\"data\":{\"error\":\"no issues found matching the provided IDs\"},\
                     \"schema_version\":1}\n"
                .to_string(),
            stderr: "Error fetching does-not-exist: no issue found".to_string(),
        };
        assert!(!not_found.is_transport(), "a refusal is an outcome");

        // The same exit code with no envelope behind it: bd never spoke.
        let unreachable = BdError::Beads {
            context: "bd show bead-1".to_string(),
            exit: Some(1),
            stdout: String::new(),
            stderr: "bd: connection refused".to_string(),
        };
        assert!(
            unreachable.is_transport(),
            "an unanswered call is retryable"
        );

        assert!(BdError::Timeout {
            context: "bd show bead-1".to_string(),
            after_s: 30,
        }
        .is_transport());
        assert!(BdError::SpawnFailed {
            context: "bd show bead-1".to_string(),
            detail: "no such file".to_string(),
        }
        .is_transport());
        assert!(BdError::Contention {
            attempts: 5,
            stderr: DOLT_LOCK_REFUSAL.to_string(),
        }
        .is_transport());
        // `show_issue`'s own not-found shape: a well-formed envelope that
        // carried no issue.
        assert!(!BdError::Envelope {
            context: "bd show bead-1".to_string(),
            detail: "response contained no issue".to_string(),
        }
        .is_transport());

        // Stdout that carried no envelope at all: bd never answered.
        assert!(BdError::Unparseable {
            context: "bd show bead-1".to_string(),
            detail: "stdout: <html>502</html>; stderr: ".to_string(),
        }
        .is_transport());
    }

    /// The Dolt embedded lock reaching a READ.
    ///
    /// `invoke::read` runs no classifier and no retries, so the lock — shared
    /// with every live run and every epic wave — arrives at the caller as a
    /// finished error. Classified as an answer it takes the reading run down
    /// on a condition that clears on its own.
    #[test]
    fn the_dolt_lock_is_transport_on_every_shape_a_read_can_surface_it() {
        // Exit 0 with the refusal in the envelope's own error string:
        // `invoke::read` mints `Beads` for exactly this, and the envelope
        // parses, so the generic arm alone would call it an answer.
        let enveloped = BdError::Beads {
            context: "bd show beads-1al".to_string(),
            exit: Some(0),
            stdout: format!(
                "{{\"data\":{{\"error\":\"{DOLT_LOCK_REFUSAL}\"}},\"schema_version\":1}}"
            ),
            stderr: String::new(),
        };
        assert!(
            enveloped.is_transport(),
            "an embedded lock clears on its own"
        );

        // The same lock on stderr behind a nonzero exit whose envelope still
        // arrived.
        let on_stderr = BdError::Beads {
            context: "bd show beads-1al".to_string(),
            exit: Some(1),
            stdout: "{\"data\":{},\"schema_version\":1}".to_string(),
            stderr: DOLT_LOCK_REFUSAL.to_string(),
        };
        assert!(on_stderr.is_transport());

        // A refusal that is NOT the lock stays an answer.
        let refusal = BdError::Beads {
            context: "bd show beads-1al".to_string(),
            exit: Some(1),
            stdout: "{\"data\":{\"error\":\"no issues found\"},\"schema_version\":1}".to_string(),
            stderr: String::new(),
        };
        assert!(!refusal.is_transport());
    }

    /// The lock marker inside an envelope this build cannot read.
    ///
    /// Both markers are present and they disagree: the lock says "try again",
    /// the declared version says "this build never reads bd again". The
    /// version wins, because the retry the lock earns can only re-read the
    /// same unreadable dialect — and taking the lock's answer spends the
    /// whole bounded budget on a condition the budget cannot clear.
    #[test]
    fn an_upgraded_bd_stays_terminal_even_holding_the_dolt_lock() {
        let upgraded_and_locked = BdError::Beads {
            context: "bd show beads-1al".to_string(),
            exit: Some(0),
            stdout: format!(
                "{{\"data\":{{\"error\":\"{DOLT_LOCK_REFUSAL}\"}},\"schema_version\":2}}"
            ),
            stderr: String::new(),
        };
        assert!(
            !upgraded_and_locked.is_transport(),
            "no retry re-reads an upgrade: {upgraded_and_locked}"
        );

        // `invoke::read` mints this shape for the same stdout, and it carries
        // the marker in its detail.
        let as_read = BdError::Envelope {
            context: "bd show beads-1al".to_string(),
            detail: format!("unsupported schema_version; stdout: {DOLT_LOCK_REFUSAL}"),
        };
        assert!(!as_read.is_transport(), "{as_read}");

        // And the split holds: stdout carrying no envelope at all declares no
        // version, so the lock still rides the budget.
        let no_envelope = BdError::Beads {
            context: "bd show beads-1al".to_string(),
            exit: Some(1),
            stdout: String::new(),
            stderr: DOLT_LOCK_REFUSAL.to_string(),
        };
        assert!(no_envelope.is_transport(), "{no_envelope}");
    }

    /// The same disagreement on the WRITE path, where the retry actually
    /// costs attempts: `classify_attempt` must not hand an upgraded bd to the
    /// contention schedule.
    #[tokio::test]
    async fn an_upgraded_bd_holding_the_lock_is_never_retried_on_the_write_path() {
        let locked_and_upgraded = || RawOutcome {
            exit: Some(1),
            stdout: format!(
                "{{\"data\":{{\"error\":\"{DOLT_LOCK_REFUSAL}\"}},\"schema_version\":2}}"
            ),
            stderr: String::new(),
        };
        let op = WriteOp::Claim {
            bead: Some("beads-1al".to_string()),
            actor: "me".to_string(),
        };
        assert!(matches!(
            classify_attempt(&op, &locked_and_upgraded(), false),
            Class::EnvelopeBad { .. }
        ));

        // The heartbeat path classifies separately and must agree.
        let heartbeat = WriteOp::Heartbeat {
            bead: "beads-1al".to_string(),
            actor: "me".to_string(),
        };
        assert!(matches!(
            classify_attempt(&heartbeat, &locked_and_upgraded(), false),
            Class::EnvelopeBad { .. }
        ));

        // End to end: one attempt, terminal, and not charged as transport.
        let mut runner = Canned::new(vec![Ok(locked_and_upgraded())]);
        let err = write_policy(&op, &mut runner, false, "bd update")
            .await
            .unwrap_err();
        assert!(matches!(err, BdError::Envelope { .. }), "got {err:?}");
        assert!(!err.is_transport(), "{err}");
        assert_eq!(runner.runs, 1, "an upgrade is never retried");

        // A schema-1 envelope carrying the same lock keeps the contention
        // schedule it has always had.
        let locked = RawOutcome {
            exit: Some(1),
            stdout: format!(
                "{{\"data\":{{\"error\":\"{DOLT_LOCK_REFUSAL}\"}},\"schema_version\":1}}"
            ),
            stderr: String::new(),
        };
        assert!(matches!(
            classify_attempt(&op, &locked, false),
            Class::Contention
        ));
    }
}
