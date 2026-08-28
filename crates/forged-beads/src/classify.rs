//! The read-path contention classifier and the crate error type [`BdError`].
//!
//! The write spine died with the ledger-native work store (ADR-0034); what
//! remains classifies READ outcomes for the importer: a Dolt embedded-lock
//! refusal is a transient outage that rides the transport budget, a
//! well-formed envelope error is an answer, and a payload is judged on its
//! text before its shape.

use std::fmt;

use crate::envelope;

/// The exact Dolt embedded-lock refusal, pinned from bd 1.2.1's own source
/// (cmd/bd/uow_factory.go quotes Dolt's refusal verbatim).
pub(crate) const DOLT_LOCK_REFUSAL: &str = "database is locked by another dolt process";

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
        let end = fragment.find(['\n', '"']).unwrap_or(fragment.len());
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
