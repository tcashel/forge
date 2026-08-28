//! The reconcile saga's ports: traits whose signatures mirror the merged
//! wave-2 functions one-for-one, so the wave-4 adapter is a thin
//! pass-through. This crate never spawns a provider, shells out, or
//! constructs a filesystem path — everything external crosses these seams.
//!
//! The session parameter of [`ReconcilePorts::liveness`] and
//! [`ReconcilePorts::kill_confirmed`] is the attempt's `claimant` column,
//! passed through verbatim: `claimant` is simultaneously the work lease holder
//! and the session reference, and this crate never parses, splits, or
//! normalizes it. The wave-4 adapter owns resolving it back to a host
//! session id.

use crate::error::PortError;

/// Liveness of a session, mirroring `forged_host::Liveness`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionLiveness {
    /// The session's command line is running (or not yet started).
    Running,
    /// The session exited with this code, read from the sentinel truth path.
    Exited(i32),
    /// The session is gone with no exit code — never an invented success.
    Vanished,
}

/// Outcome of a verified kill, mirroring `forged_host::Confirmed`. Both
/// variants require VERIFIED death; signal-send success alone never
/// confirms.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KillOutcome {
    /// We killed it and verified death.
    Killed,
    /// It was already dead (verified) before we acted.
    AlreadyDead,
}

/// Outcome of a scoped work-lease reclaim, mirroring
/// `forged_ledger::reclaim_work_lease`. `previous_owner: None` is the
/// refusal shape (nothing reclaimed), not an error.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LeaseReclaim {
    /// Whether bd confirmed the reclaim was scoped (expect `true`).
    pub scoped: bool,
    /// The reclaimed entry's previous owner — present only on non-empty
    /// reclaimed entries.
    pub previous_owner: Option<String>,
}

/// What settles a crashed `Resolve`: worktree presence plus the work lease
/// holder.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResolveState {
    /// Whether the run's worktree exists.
    pub worktree_present: bool,
    /// The current work lease holder for the run's bead, when any.
    pub lease_holder: Option<String>,
}

/// PR metadata as the adapter reports it — a proto-local mirror of
/// `forged_git::PrMeta`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PrSnapshot {
    /// The PR number.
    pub number: u64,
    /// Whether the PR is a draft.
    pub is_draft: bool,
    /// The base branch name.
    pub base_ref_name: String,
    /// The head branch name.
    pub head_ref_name: String,
    /// The PR's html url.
    pub url: String,
}

/// Everything the reconcile saga needs from the outside world. Each method
/// mirrors a merged wave-2 signature so the wave-4 adapter is a
/// pass-through; this crate's tests drive in-process recording fakes.
#[async_trait::async_trait]
pub trait ReconcilePorts: Send + Sync {
    /// Liveness of `session` — a mirror of `host.alive`, which consults the
    /// sentinel status file first. `session` is the attempt's `claimant`,
    /// verbatim.
    async fn liveness(&self, session: &str) -> Result<SessionLiveness, PortError>;

    /// Kill `session` and confirm death. Success only on VERIFIED death,
    /// never on signal-send. `session` is the attempt's `claimant`, verbatim.
    async fn kill_confirmed(
        &self,
        session: &str,
        termination_grace_s: u64,
    ) -> Result<KillOutcome, PortError>;

    /// Scoped work-lease reclaim, mirroring `reclaim_work_lease(work,
    /// previous_holder, older_than_s)`. `holder` is the attempt's
    /// `claimant`, verbatim.
    async fn reclaim_lease(
        &self,
        bead: &str,
        holder: &str,
        older_than_s: u64,
    ) -> Result<LeaseReclaim, PortError>;

    /// Recompute `commits_ahead` from the run's worktree — harvest-and-verify
    /// ground truth, never a claim.
    async fn commits_ahead(&self, run_id: &str) -> Result<u32, PortError>;

    /// Re-run the gate commands against the run's worktree —
    /// harvest-and-verify ground truth, never a claim.
    async fn rerun_gates(
        &self,
        run_id: &str,
        commands: &[String],
    ) -> Result<Vec<forged_types::GateRow>, PortError>;

    /// Take custody of refused bytes. `name` is a bare file name, never a
    /// path; the adapter writes it under `<run_dir>/quarantine/<attempt_id>/`.
    async fn quarantine(
        &self,
        run_id: &str,
        attempt_id: i64,
        name: &str,
        body: &[u8],
    ) -> Result<(), PortError>;

    /// Settles `Resolve` after a crash: worktree presence + work lease holder.
    async fn resolve_state(&self, run_id: &str) -> Result<ResolveState, PortError>;

    /// Settles `DraftPr` after a crash: mirrors
    /// `GhClient::pr_list_head(repo, head, base)`.
    async fn pr_for_head(
        &self,
        repo: &str,
        head: &str,
        base: &str,
    ) -> Result<Option<PrSnapshot>, PortError>;

    /// Settles `Push` after a crash: the remote sha for `branch`, `None`
    /// when the ref is absent.
    async fn remote_sha(&self, run_id: &str, branch: &str) -> Result<Option<String>, PortError>;
}
