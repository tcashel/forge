//! The clap surface: flags in, one `OperationRequest` out. No logic lives
//! here — every command routes through the same `core/` function the MCP
//! tools call.

use clap::{Args, Parser, Subcommand, ValueEnum};
use forged_types::OperationRequest;
use serde_json::{json, Map, Value};
use std::io::Read as _;
use std::path::{Path, PathBuf};

/// forged: the CLI and MCP binary over the forged core.
#[derive(Debug, Parser)]
#[command(name = "forged", version, about)]
pub struct Cli {
    /// The command to run.
    #[command(subcommand)]
    pub command: Command,
}

/// Every forged command.
#[derive(Debug, Subcommand)]
pub enum Command {
    /// Run the environment probes (read-only).
    Doctor(KeyOnly),
    /// Create <anvil_home>/runs, the default config, and the ledger schema.
    Init(KeyOnly),
    /// Execution-definition operations.
    Definition {
        #[command(subcommand)]
        command: DefinitionCmd,
    },
    /// Run lifecycle.
    Run {
        /// The run subcommand.
        #[command(subcommand)]
        command: RunCmd,
    },
    /// Durable epic/wave scheduling over work readiness.
    Epic {
        /// The epic subcommand.
        #[command(subcommand)]
        command: EpicCmd,
    },
    /// Packet lifecycle.
    Packet {
        /// The packet subcommand.
        #[command(subcommand)]
        command: PacketCmd,
    },
    /// Durable review-result delivery.
    Review {
        /// Review delivery subcommand.
        #[command(subcommand)]
        command: ReviewCmd,
    },
    /// Immutable attempt-artifact operations.
    Artifact {
        #[command(subcommand)]
        command: ArtifactCmd,
    },
    /// Provider-session observation and intervention.
    Session {
        /// The session subcommand.
        #[command(subcommand)]
        command: SessionCmd,
    },
    /// Resume a ledger run or claim the next ready work (explicit
    /// idempotency key required).
    ClaimNext(ClaimNextArgs),
    /// Gate execution.
    Gate {
        /// The gate subcommand.
        #[command(subcommand)]
        command: GateCmd,
    },
    /// One reconcile pass over a run.
    Reconcile(RunScoped),
    /// Usage report (read-only) or ingestion.
    Usage(UsageArgs),
    /// List ledger events, paged (read-only).
    Events(EventsArgs),
    /// Reconnect projection for one slice or epic (read-only).
    Overview(OverviewArgs),
    /// Bounded operator-facing operations projection.
    Operations {
        /// Operations subcommand.
        #[command(subcommand)]
        command: OperationsCmd,
    },
    /// Reconcile operator-authorized desired work.
    Supervise(SuperviseArgs),
    /// Install and operate the operator-scoped supervisor service.
    Service {
        /// Service lifecycle command.
        #[command(subcommand)]
        command: ServiceCmd,
    },
    /// Work inventory.
    Work {
        /// The work subcommand.
        #[command(subcommand)]
        command: WorkCmd,
    },
    /// Typed operator-attention custody controls.
    Attention {
        /// The attention subcommand.
        #[command(subcommand)]
        command: AttentionCmd,
    },
    /// Worktree lifecycle.
    Worktree {
        /// The worktree subcommand.
        #[command(subcommand)]
        command: WorktreeCmd,
    },
    /// Serve MCP over stdio (prints no envelope).
    Mcp,
}

/// A command with no flags beyond the key override.
#[derive(Debug, Args)]
pub struct KeyOnly {
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// Desired-work supervisor flags.
#[derive(Debug, Args)]
pub struct SuperviseArgs {
    /// Perform exactly one bounded reconciliation tick and return.
    #[arg(long)]
    pub once: bool,
    /// Override the report operation identity.
    #[arg(long)]
    pub idempotency_key: Option<String>,
    /// Immutable installed-service generation. Set only by the LaunchAgent.
    #[arg(long, hide = true)]
    pub service_generation: Option<String>,
}

/// Supervisor service lifecycle. Mutations are intentionally CLI-only.
#[derive(Debug, Subcommand)]
pub enum ServiceCmd {
    /// Install this exact executable, or reconcile/upgrade an installation.
    Install(KeyOnly),
    /// Start the installed supervisor.
    Start(KeyOnly),
    /// Stop the supervisor, optionally waiting for controllers to drain.
    Stop(ServiceStopArgs),
    /// Gracefully restart the installed supervisor.
    Restart(KeyOnly),
    /// Inspect manifest, launchd, process, binary, and tick identity.
    Status(KeyOnly),
    /// Remove the drained LaunchAgent while retaining immutable binaries.
    Uninstall(KeyOnly),
}

impl ServiceCmd {
    pub(crate) fn operation_name(&self) -> &'static str {
        match self {
            Self::Install(_) => "service_install",
            Self::Start(_) => "service_start",
            Self::Stop(_) => "service_stop",
            Self::Restart(_) => "service_restart",
            Self::Status(_) => "service_status",
            Self::Uninstall(_) => "service_uninstall",
        }
    }

    pub(crate) fn idempotency_key(&self) -> Option<&str> {
        let key = match self {
            Self::Install(args)
            | Self::Start(args)
            | Self::Restart(args)
            | Self::Status(args)
            | Self::Uninstall(args) => args.idempotency_key.as_deref(),
            Self::Stop(args) => args.idempotency_key.as_deref(),
        };
        key.filter(|value| !value.is_empty())
    }
}

/// `service stop` flags.
#[derive(Debug, Args)]
pub struct ServiceStopArgs {
    /// After stopping scheduling, wait for all live controllers to finish.
    #[arg(long)]
    pub drain: bool,
    /// Maximum drain wait. A timeout reports every remaining controller.
    #[arg(long, default_value_t = 300)]
    pub timeout_seconds: u64,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `run` subcommands.
#[derive(Debug, Subcommand)]
pub enum RunCmd {
    /// Create a run for a work item.
    Start(RunStartArgs),
    /// One project → advance → honor iteration.
    Advance(RunScoped),
    /// Loop advance until the run stops.
    Drive(RunScoped),
    /// Hand the run to a detached durable controller.
    Submit(RunScoped),
    /// Project the run's current state (read-only).
    Status(RunScoped),
    /// Stop and settle the complete run.
    Stop(RunStopArgs),
    /// Explicitly settle a run whose controller record cannot be fenced.
    AdjudicateSettlement(RunAdjudicateSettlementArgs),
    /// Append an explicit roster revision at a durable boundary.
    ReviseRoster(RunReviseRosterArgs),
    /// Accept the final deduplicated findings after a terminal review failure.
    AcceptRisk(RunAcceptRiskArgs),
}

/// Whole-run terminal outcomes owned by `run stop`.
///
/// `accepted-risk` deliberately lives on the review acceptance operation,
/// which owns its evidence contract rather than accepting a bare reason.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum RunStopOutcome {
    /// Clean and ready for delivery.
    Clean,
    /// Blocked on unresolved work.
    Blocked,
    /// Waiting for an operator answer.
    InputRequired,
    /// Cancelled without declaring the Work complete.
    Cancelled,
    /// Replaced by a named successor run.
    Superseded,
    /// Landed, with PR and exact merge SHA evidence.
    Landed,
}

impl RunStopOutcome {
    fn as_str(self) -> &'static str {
        match self {
            Self::Clean => "clean",
            Self::Blocked => "blocked",
            Self::InputRequired => "input-required",
            Self::Cancelled => "cancelled",
            Self::Superseded => "superseded",
            Self::Landed => "landed",
        }
    }
}

/// `run stop` flags.
#[derive(Debug, Args)]
pub struct RunStopArgs {
    /// Run id.
    #[arg(long)]
    pub run: String,
    /// Whole-run outcome.
    #[arg(long, value_enum)]
    pub outcome: RunStopOutcome,
    /// Human-readable terminal reason.
    #[arg(long)]
    pub reason: String,
    /// Pull request number; required only for `landed`.
    #[arg(long)]
    pub pr: Option<u64>,
    /// Exact merge commit SHA; required only for `landed`.
    #[arg(long)]
    pub sha: Option<String>,
    /// Successor run id; required only for `superseded`.
    #[arg(long)]
    pub superseded_by: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `run adjudicate-settlement` outcomes: the abandoned-run terminal set.
/// Clean, blocked, and input-required describe live protocol states, which
/// an evidence-gap adjudication has no business asserting.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum RunAdjudicateOutcome {
    /// Landed, with PR and exact merge SHA evidence.
    Landed,
    /// Replaced by a named successor run.
    Superseded,
    /// Cancelled without declaring the Work complete.
    Cancelled,
}

impl RunAdjudicateOutcome {
    fn as_str(self) -> &'static str {
        match self {
            Self::Landed => "landed",
            Self::Superseded => "superseded",
            Self::Cancelled => "cancelled",
        }
    }
}

/// `run adjudicate-settlement` flags.
#[derive(Debug, Args)]
pub struct RunAdjudicateSettlementArgs {
    /// Run whose latest controller record lacks durable driver identity.
    #[arg(long)]
    pub run: String,
    /// Adjudicated terminal outcome.
    #[arg(long, value_enum)]
    pub outcome: RunAdjudicateOutcome,
    /// Pull request number; required only for `landed`.
    #[arg(long)]
    pub pr: Option<u64>,
    /// Exact merge commit SHA; required only for `landed`.
    #[arg(long)]
    pub sha: Option<String>,
    /// Successor run id; required only for `superseded`.
    #[arg(long)]
    pub superseded_by: Option<String>,
    /// Human identity asserting this explicitly destructive settlement.
    #[arg(long)]
    pub actor: String,
    /// Why this run may settle without verified controller death.
    #[arg(long)]
    pub rationale: String,
    /// Exactly which durable evidence is missing — the gap being adjudicated.
    #[arg(long)]
    pub evidence_gap: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `epic` subcommands.
#[derive(Debug, Subcommand)]
pub enum EpicCmd {
    /// Rehearse `epic start` read-only: every start check plus the identity
    /// tuple it would freeze, with nothing created.
    Preflight(EpicPreflightArgs),
    /// Freeze an epic inventory and execution defaults.
    Start(EpicStartArgs),
    /// Perform one durable scheduler action.
    Advance(EpicScoped),
    /// Drive until the final draft PR or explicit input is required.
    Drive(EpicScoped),
    /// Hand the epic to a detached durable controller.
    Submit(EpicSubmitArgs),
    /// Project waves, children, blockers, and the final PR (read-only).
    Status(EpicScoped),
    /// Pause scheduling after the current durable boundary.
    Pause(EpicReasonArgs),
    /// Resume a paused epic.
    Resume(EpicReasonArgs),
    /// Resolve a held child after its spec/input was adjudicated.
    Resolve(EpicResolveArgs),
    /// Abandon a started-but-doomed epic; a fresh start opens a clean epoch.
    Abandon(EpicAbandonArgs),
    /// Append a roster revision for current and future child runs.
    ReviseRoster(EpicReviseRosterArgs),
}

/// `epic preflight` flags — the same geometry `epic start` takes.
#[derive(Debug, Args)]
pub struct EpicPreflightArgs {
    /// Work epic id whose inventory/readiness is authoritative.
    #[arg(long)]
    pub epic: String,
    /// Absolute target checkout path.
    #[arg(long)]
    pub repo: String,
    /// Bare default-branch name existing on origin (e.g. "main"); an
    /// `origin/` prefix is stripped. Defaults from origin/HEAD.
    #[arg(long)]
    pub base_ref: Option<String>,
    /// Assurance profile inherited by child slices.
    #[arg(long)]
    pub profile: Option<String>,
    /// Model roster inherited by child slices.
    #[arg(long)]
    pub roster: Option<String>,
    /// Rehearse with provider-authored rolling planning authorized.
    #[arg(long)]
    pub rolling: bool,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `epic start` flags.
#[derive(Debug, Args)]
pub struct EpicStartArgs {
    /// Work epic id whose inventory/readiness is authoritative.
    #[arg(long)]
    pub epic: String,
    /// Absolute target checkout path.
    #[arg(long)]
    pub repo: String,
    /// Deprecated locked epic-map path. The epic Work is authoritative.
    #[arg(long)]
    pub spec: Option<String>,
    /// Bare default-branch name existing on origin (e.g. "main"); an
    /// `origin/` prefix is stripped. Defaults from origin/HEAD.
    #[arg(long)]
    pub base_ref: Option<String>,
    /// Assurance profile inherited by child slices.
    #[arg(long)]
    pub profile: Option<String>,
    /// Model roster inherited by child slices.
    #[arg(long)]
    pub roster: Option<String>,
    /// Explicitly authorize provider-authored planning of incomplete blocked stubs.
    #[arg(long)]
    pub rolling: bool,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// A command scoped to one durable epic id.
#[derive(Debug, Args)]
pub struct EpicScoped {
    /// Durable epic id.
    #[arg(long)]
    pub epic: String,
    /// Override the derived/read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `epic submit` flags.
#[derive(Debug, Args)]
pub struct EpicSubmitArgs {
    /// Durable epic id.
    #[arg(long)]
    pub epic: String,
    /// Block briefly until initial setup resolves and include the advisory
    /// `setup` readback in the response.
    #[arg(long)]
    pub wait_setup: bool,
    /// Override the derived/read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// Pause/resume flags.
#[derive(Debug, Args)]
pub struct EpicReasonArgs {
    /// Durable epic id.
    #[arg(long)]
    pub epic: String,
    /// Human-readable audit reason.
    #[arg(long)]
    pub reason: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `epic abandon` arguments.
#[derive(Debug, Args)]
pub struct EpicAbandonArgs {
    /// The epic work id.
    #[arg(long)]
    pub epic: String,
    /// Why this epoch ends (recorded in the boundary event).
    #[arg(long)]
    pub reason: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// Explicit input-required resolution flags.
#[derive(Debug, Args)]
pub struct EpicResolveArgs {
    /// Durable epic id.
    #[arg(long)]
    pub epic: String,
    /// Held child whose spec/input is now resolved. Omit to resolve an
    /// epic-level input requirement that names no child.
    #[arg(long)]
    pub child: Option<String>,
    /// Resolution note recorded in the epic stream.
    #[arg(long)]
    pub note: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `epic revise-roster` flags.
#[derive(Debug, Args)]
pub struct EpicReviseRosterArgs {
    /// Durable epic id.
    #[arg(long)]
    pub epic: String,
    /// Named roster from authoring config, resolved once for this revision.
    #[arg(long)]
    pub roster: String,
    /// Human-readable reason recorded with the revision.
    #[arg(long)]
    pub reason: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `run revise-roster` flags.
#[derive(Debug, Args)]
pub struct RunReviseRosterArgs {
    /// Run id.
    #[arg(long)]
    pub run: String,
    /// Named roster from the once-read config.
    #[arg(long)]
    pub roster: String,
    /// Human-readable reason recorded with the revision.
    #[arg(long)]
    pub reason: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `run accept-risk` flags.
#[derive(Debug, Args)]
pub struct RunAcceptRiskArgs {
    /// Run stopped with a terminal non-approve review outcome.
    #[arg(long)]
    pub run: String,
    /// Operator or lead-agent identity making the decision.
    #[arg(long)]
    pub accepted_by: String,
    /// Why the final findings are acceptable in this risk context.
    #[arg(long)]
    pub rationale: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `definition` subcommands.
#[derive(Debug, Subcommand)]
pub enum DefinitionCmd {
    /// Resolve and validate a profile/roster selection (read-only).
    Validate(DefinitionValidateArgs),
}

/// `definition validate` flags.
#[derive(Debug, Args)]
pub struct DefinitionValidateArgs {
    /// Named assurance profile; defaults from config.
    #[arg(long)]
    pub profile: Option<String>,
    /// Named model roster; defaults from config.
    #[arg(long)]
    pub roster: Option<String>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `run start` flags.
#[derive(Debug, Args)]
pub struct RunStartArgs {
    /// The work item the run implements (also mints the run id).
    #[arg(long)]
    pub work: String,
    /// Absolute path of the target checkout.
    #[arg(long)]
    pub repo: String,
    /// DEPRECATED: path of a spec file. Omit it — the work's own fields are
    /// the spec. Honored for one release so in-flight runs keep working.
    #[arg(long)]
    pub spec: Option<String>,
    /// Base ref; defaults to the repo's default branch.
    #[arg(long)]
    pub base_ref: Option<String>,
    /// Named assurance profile; defaults from config.
    #[arg(long)]
    pub profile: Option<String>,
    /// Named model roster; defaults from config.
    #[arg(long)]
    pub roster: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// A `--run`-scoped command.
#[derive(Debug, Args)]
pub struct RunScoped {
    /// The run id.
    #[arg(long)]
    pub run: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `review` subcommands.
#[derive(Debug, Subcommand)]
pub enum ReviewCmd {
    /// Publish the latest exact durable review snapshot to its slice PR.
    Publish(RunScoped),
}

/// `packet` subcommands.
#[derive(Debug, Subcommand)]
pub enum PacketCmd {
    /// Show a stored packet and its attempts (read-only).
    Show(PacketScoped),
    /// Claim a packet for execution.
    Claim(PacketScoped),
    /// Land a packet result.
    Complete(PacketCompleteArgs),
    /// Report a packet failure.
    Fail(PacketFailArgs),
    /// Renew a live attempt (unfenced; always safe to re-send).
    Heartbeat(PacketTokenArgs),
}

/// A `--packet`-scoped command.
#[derive(Debug, Args)]
pub struct PacketScoped {
    /// The packet id (`<run>/<stage>/<seq>`).
    #[arg(long)]
    pub packet: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `packet complete` flags.
#[derive(Debug, Args)]
pub struct PacketCompleteArgs {
    /// The packet id.
    #[arg(long)]
    pub packet: String,
    /// The attempt row id.
    #[arg(long)]
    pub attempt: i64,
    /// The attempt's fencing token.
    #[arg(long)]
    pub claim_token: String,
    /// Path of the PacketResult JSON file.
    #[arg(long)]
    pub result: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `packet fail` flags.
#[derive(Debug, Args)]
pub struct PacketFailArgs {
    /// The packet id.
    #[arg(long)]
    pub packet: String,
    /// The attempt row id.
    #[arg(long)]
    pub attempt: i64,
    /// The attempt's fencing token.
    #[arg(long)]
    pub claim_token: String,
    /// The failure note; a `transport:` prefix is a free retry.
    #[arg(long)]
    pub note: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `packet heartbeat` flags.
#[derive(Debug, Args)]
pub struct PacketTokenArgs {
    /// The packet id.
    #[arg(long)]
    pub packet: String,
    /// The attempt row id.
    #[arg(long)]
    pub attempt: i64,
    /// The attempt's fencing token.
    #[arg(long)]
    pub claim_token: String,
}

/// `artifact` subcommands.
#[derive(Debug, Subcommand)]
pub enum ArtifactCmd {
    /// Verify one manifest and every named digest without changing them.
    Verify(AttemptScoped),
    /// Explicitly compact an eligible successful intermediate attempt.
    Compact(AttemptScoped),
}

/// An attempt-scoped read-only command.
#[derive(Debug, Args)]
pub struct AttemptScoped {
    /// Positive ledger attempt identity.
    #[arg(long)]
    pub attempt: i64,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `session` subcommands.
#[derive(Debug, Subcommand)]
pub enum SessionCmd {
    /// List durable provider-session metadata for a run.
    List(RunScoped),
    /// Inventory durable provider attempts across runs and repositories.
    Inventory(SessionInventoryArgs),
    /// Read recent output from a Herdr-backed attempt.
    Read(SessionReadArgs),
    /// Queue an intervention, delivering live only when capability permits.
    Message(SessionMessageArgs),
    /// Revoke and confirmed-stop one attempt.
    Stop(SessionStopArgs),
}

/// Exact attempt activity accepted by `session inventory`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum SessionInventoryActivityArg {
    Running,
    Revoking,
    Completed,
    Failed,
    Reclaimed,
    Stopped,
}

impl SessionInventoryActivityArg {
    fn as_str(self) -> &'static str {
        match self {
            Self::Running => "running",
            Self::Revoking => "revoking",
            Self::Completed => "completed",
            Self::Failed => "failed",
            Self::Reclaimed => "reclaimed",
            Self::Stopped => "stopped",
        }
    }
}

/// `session inventory` flags. Every selector is a canonical durable key.
#[derive(Debug, Args)]
pub struct SessionInventoryArgs {
    /// Exact run id.
    #[arg(long)]
    pub run: Option<String>,
    /// Exact epic id.
    #[arg(long)]
    pub epic: Option<String>,
    /// Exact canonical repository path.
    #[arg(long)]
    pub repository: Option<String>,
    /// Exact frozen packet provider.
    #[arg(long)]
    pub provider: Option<String>,
    /// Exact frozen packet model.
    #[arg(long)]
    pub model: Option<String>,
    /// Exact attempt activity (not Herdr lifecycle).
    #[arg(long, value_enum)]
    pub activity: Option<SessionInventoryActivityArg>,
    /// Include every terminal attempt, not only unresolved owned Herdr rows.
    #[arg(long)]
    pub include_historical: bool,
    /// Page size (default 100, maximum 500).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Opaque continuation cursor from the preceding page.
    #[arg(long)]
    pub cursor: Option<String>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `session read` flags.
#[derive(Debug, Args)]
pub struct SessionReadArgs {
    /// Attempt id whose durable Herdr pane should be read.
    #[arg(long)]
    pub attempt: i64,
    /// Recent unwrapped terminal lines to return.
    #[arg(long, default_value_t = 120)]
    pub lines: u32,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `session message` flags.
#[derive(Debug, Args)]
pub struct SessionMessageArgs {
    /// Run receiving the intervention.
    #[arg(long)]
    pub run: String,
    /// Live attempt to target when interactive delivery is supported.
    #[arg(long)]
    pub attempt: Option<i64>,
    /// Message delivered live or at the next durable provider boundary.
    #[arg(long)]
    pub message: String,
    /// Human or agent identity requesting the intervention.
    #[arg(long, default_value = "operator")]
    pub requested_by: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `session stop` flags.
///
/// ATTEMPT-LOCAL: this settles one attempt at `stopped` and leaves the
/// work's work lease with `run_holder`, where a successor on the same packet
/// claims under it immediately. Releasing the work's lease is a different
/// operation with a different fence.
#[derive(Debug, Args)]
pub struct SessionStopArgs {
    /// Attempt id to revoke and stop.
    #[arg(long)]
    pub attempt: i64,
    /// Reason written to the durable revocation marker.
    #[arg(long)]
    pub reason: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `claim-next` flags.
#[derive(Debug, Args)]
pub struct ClaimNextArgs {
    /// The claimant for a fresh frontier claim.
    #[arg(long)]
    pub holder: String,
    /// REQUIRED: claim-next cannot derive a meaningful key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `gate` subcommands.
#[derive(Debug, Subcommand)]
pub enum GateCmd {
    /// Run the configured gate commands in the run's worktree.
    Run(GateRunArgs),
}

/// `gate run` flags.
#[derive(Debug, Args)]
pub struct GateRunArgs {
    /// The run id.
    #[arg(long)]
    pub run: String,
    /// The stage label for the idempotency key.
    #[arg(long)]
    pub stage: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `usage` flags (bare = the read-only summary report).
#[derive(Debug, Args)]
pub struct UsageArgs {
    /// The usage subcommand; absent = report.
    #[command(subcommand)]
    pub command: Option<UsageCmd>,
    /// Scope to one run.
    #[arg(long)]
    pub run: Option<String>,
    /// Cover every run.
    #[arg(long)]
    pub all: bool,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `usage` subcommands.
#[derive(Debug, Subcommand)]
pub enum UsageCmd {
    /// Ingest captured provider usage into the ledger.
    Ingest {
        /// Scope to one run.
        #[arg(long)]
        run: Option<String>,
        /// Cover every run.
        #[arg(long)]
        all: bool,
        /// Override the derived idempotency key.
        #[arg(long)]
        idempotency_key: Option<String>,
    },
}

/// `events` flags.
#[derive(Debug, Args)]
pub struct EventsArgs {
    /// Scope to one run.
    #[arg(long)]
    pub run: Option<String>,
    /// Return rows with event_id greater than this.
    #[arg(long)]
    pub after: Option<i64>,
    /// Maximum rows to return.
    #[arg(long)]
    pub limit: Option<u64>,
    /// Return bounded payload summaries instead of embedded artifacts/logs.
    #[arg(long)]
    pub summary: bool,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `overview` flags. At most one scope; none projects the portfolio.
#[derive(Debug, Args)]
#[group(required = false, multiple = false, args = ["run", "epic", "id"])]
pub struct OverviewArgs {
    /// Project one slice run.
    #[arg(long)]
    pub run: Option<String>,
    /// Project one epic and its child runs.
    #[arg(long)]
    pub epic: Option<String>,
    /// Project whichever of the two this id names, or list the candidates.
    #[arg(long)]
    pub id: Option<String>,
    /// Return event rows with event_id greater than this.
    #[arg(long)]
    pub after: Option<i64>,
    /// Maximum event rows in the polling page (default 100).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `operations` subcommands.
#[derive(Debug, Subcommand)]
pub enum OperationsCmd {
    /// Show planned, queued, active, blocked, and mergeable work.
    Overview(OperationsOverviewArgs),
}

/// `operations overview` flags.
#[derive(Debug, Args)]
pub struct OperationsOverviewArgs {
    /// Exact durable repository identity.
    #[arg(long)]
    pub repo: Option<String>,
    /// One queue group code, such as `needs-me` or `running`.
    #[arg(long)]
    pub group: Option<String>,
    /// One source: `durable` or `live-plan`.
    #[arg(long)]
    pub source: Option<String>,
    /// Maximum rows across all groups (default 200, maximum 500).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work` subcommands.
#[derive(Debug, Subcommand)]
pub enum WorkCmd {
    /// List slice runs and started epics with composable work-store filters.
    List(WorkListArgs),
    /// Project bounded cross-run lifecycle, rework, and spend history.
    History(WorkHistoryArgs),
    /// Project one run or epic for the Work Detail App.
    Detail(WorkDetailArgs),
    /// Project the bounded plan, queue, execution, and history graph.
    Map(WorkMapArgs),
    /// One-shot atomic import of the operator's bd store into the ledger.
    ImportBeads(KeyOnly),
    /// One work item with its dependencies (read-only).
    Show(WorkIdArgs),
    /// The ready frontier (read-only).
    Ready(WorkReadyArgs),
    /// Append-only evidence about a work specification.
    Note {
        #[command(subcommand)]
        command: WorkNoteCmd,
    },
    /// Create a work item with its revision-1 spec.
    Create(WorkCreateArgs),
    /// Guarded spec update (revision CAS).
    Update(WorkUpdateArgs),
    /// Add one typed dependency edge.
    Link(WorkLinkArgs),
    /// Close a work item with a recorded reason.
    Close(WorkCloseArgs),
    /// Reopen: status open from any state, custody untouched.
    Reopen(WorkActorArgs),
    /// Release custody under the actor CAS.
    Release(WorkActorArgs),
    /// Supersede: link a successor and close the superseded item.
    Supersede(WorkSupersedeArgs),
    /// Revert spec content to an earlier revision's bytes.
    Revert(WorkRevertArgs),
}

/// `work note` subcommands.
#[derive(Debug, Subcommand)]
pub enum WorkNoteCmd {
    /// Append one immutable annotation.
    Add(WorkNoteAddArgs),
    /// List bounded annotations in append order.
    List(WorkNoteListArgs),
}

/// `work note add` arguments.
#[derive(Debug, Args)]
pub struct WorkNoteAddArgs {
    /// The existing work item id.
    #[arg(long)]
    pub id: String,
    /// comment | critique | recommendation | approval.
    #[arg(long)]
    pub kind: String,
    /// Payload schema wire name (default <kind>/0).
    #[arg(long)]
    pub schema: Option<String>,
    /// Acting identity (default operator).
    #[arg(long)]
    pub actor: Option<String>,
    /// Read the JSON body from a UTF-8 file; `-` reads stdin.
    #[arg(long)]
    pub body_file: PathBuf,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work note list` arguments.
#[derive(Debug, Args)]
pub struct WorkNoteListArgs {
    /// The existing work item id.
    #[arg(long)]
    pub id: String,
    /// Optional exact kind filter.
    #[arg(long)]
    pub kind: Option<String>,
    /// Maximum notes, 1..=500 (default 100).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// One work item id.
#[derive(Debug, Args)]
pub struct WorkIdArgs {
    /// The work item id.
    #[arg(long)]
    pub id: String,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work ready` flags.
#[derive(Debug, Args)]
pub struct WorkReadyArgs {
    /// Exact repository identity from work metadata.repository.
    #[arg(long)]
    pub repo: Option<String>,
    /// Return complete work-item snapshots instead of summary rows.
    #[arg(long)]
    pub full: bool,
    /// Maximum ready items, 1..=500 (default 100).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work create` arguments.
#[derive(Debug, Args)]
pub struct WorkCreateArgs {
    /// The stable work item id to mint.
    #[arg(long)]
    pub id: String,
    /// Human-readable title.
    #[arg(long)]
    pub title: String,
    /// Context and exact outcome.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "description_file")]
    pub description: Option<String>,
    /// Read context and outcome verbatim from one UTF-8 file.
    #[arg(long)]
    pub description_file: Option<PathBuf>,
    /// Observable completion contract.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "acceptance_file")]
    pub acceptance: Option<String>,
    /// Read completion criteria verbatim from one UTF-8 file.
    #[arg(long)]
    pub acceptance_file: Option<PathBuf>,
    /// Implementation constraints.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "design_file")]
    pub design: Option<String>,
    /// Read implementation constraints verbatim from one UTF-8 file.
    #[arg(long)]
    pub design_file: Option<PathBuf>,
    /// Agent instructions and non-goals.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "notes_file")]
    pub notes: Option<String>,
    /// Read agent instructions verbatim from one UTF-8 file.
    #[arg(long)]
    pub notes_file: Option<PathBuf>,
    /// task or epic (default task).
    #[arg(long)]
    pub kind: Option<String>,
    /// open or blocked (default open).
    #[arg(long)]
    pub status: Option<String>,
    /// Scheduling priority.
    #[arg(long)]
    pub priority: Option<i64>,
    /// Repository identity for scoped views.
    #[arg(long)]
    pub repository: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work update` arguments.
#[derive(Debug, Args)]
pub struct WorkUpdateArgs {
    /// The work item id.
    #[arg(long)]
    pub id: String,
    /// The revision you read — the CAS guard.
    #[arg(long)]
    pub expected_revision: i64,
    /// New title.
    #[arg(long)]
    pub title: Option<String>,
    /// New description.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "description_file")]
    pub description: Option<String>,
    /// Read the new description verbatim from one UTF-8 file.
    #[arg(long)]
    pub description_file: Option<PathBuf>,
    /// New acceptance criteria.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "acceptance_file")]
    pub acceptance: Option<String>,
    /// Read new acceptance criteria verbatim from one UTF-8 file.
    #[arg(long)]
    pub acceptance_file: Option<PathBuf>,
    /// New design notes.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "design_file")]
    pub design: Option<String>,
    /// Read new design notes verbatim from one UTF-8 file.
    #[arg(long)]
    pub design_file: Option<PathBuf>,
    /// New agent instructions.
    #[arg(long, allow_hyphen_values = true, conflicts_with = "notes_file")]
    pub notes: Option<String>,
    /// Read new agent instructions verbatim from one UTF-8 file.
    #[arg(long)]
    pub notes_file: Option<PathBuf>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work link` arguments.
#[derive(Debug, Args)]
pub struct WorkLinkArgs {
    /// The dependent item.
    #[arg(long)]
    pub from: String,
    /// The dependency target.
    #[arg(long)]
    pub to: String,
    /// blocks | parent-child | related | discovered-from | supersedes.
    #[arg(long)]
    pub kind: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work close` arguments.
#[derive(Debug, Args)]
pub struct WorkCloseArgs {
    /// The work item id.
    #[arg(long)]
    pub id: String,
    /// Why it closed (recorded in evidence).
    #[arg(long)]
    pub reason: String,
    /// Acting identity (default operator).
    #[arg(long)]
    pub actor: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// id + actor verbs (`work reopen`, `work release`).
#[derive(Debug, Args)]
pub struct WorkActorArgs {
    /// The work item id.
    #[arg(long)]
    pub id: String,
    /// Acting identity (default operator).
    #[arg(long)]
    pub actor: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work supersede` arguments.
#[derive(Debug, Args)]
pub struct WorkSupersedeArgs {
    /// The superseded item.
    #[arg(long)]
    pub id: String,
    /// The replacement (create it first with `work create`).
    #[arg(long)]
    pub successor: String,
    /// Acting identity (default operator).
    #[arg(long)]
    pub actor: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work revert` arguments.
#[derive(Debug, Args)]
pub struct WorkRevertArgs {
    /// The work item id.
    #[arg(long)]
    pub id: String,
    /// The revision you read — the CAS guard.
    #[arg(long)]
    pub expected_revision: i64,
    /// The revision whose bytes to restore.
    #[arg(long)]
    pub to_revision: i64,
    /// Acting identity (default operator).
    #[arg(long)]
    pub actor: Option<String>,
    /// Override the derived idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// Closed scope accepted by `work map`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum WorkMapScopeArg {
    Operator,
    Repository,
    Epic,
}

impl WorkMapScopeArg {
    fn as_str(self) -> &'static str {
        match self {
            Self::Operator => "operator",
            Self::Repository => "repository",
            Self::Epic => "epic",
        }
    }
}

/// Closed Operations queue group accepted by `work map`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum WorkMapGroupArg {
    NeedsMe,
    ReadyToMerge,
    Running,
    StalledOrRecoverable,
    Planned,
}

impl WorkMapGroupArg {
    fn as_str(self) -> &'static str {
        match self {
            Self::NeedsMe => "needs-me",
            Self::ReadyToMerge => "ready-to-merge",
            Self::Running => "running",
            Self::StalledOrRecoverable => "stalled-or-recoverable",
            Self::Planned => "planned",
        }
    }
}

/// Closed authority source accepted by `work map`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum WorkMapSourceArg {
    Durable,
    LivePlan,
}

impl WorkMapSourceArg {
    fn as_str(self) -> &'static str {
        match self {
            Self::Durable => "durable",
            Self::LivePlan => "live-plan",
        }
    }
}

/// Closed Work Map reference kind.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum WorkMapRefKindArg {
    Plan,
    Run,
    Epic,
}

impl WorkMapRefKindArg {
    fn as_str(self) -> &'static str {
        match self {
            Self::Plan => "plan",
            Self::Run => "run",
            Self::Epic => "epic",
        }
    }
}

/// `work map` flags.
#[derive(Debug, Args)]
pub struct WorkMapArgs {
    /// Graph scope (default operator).
    #[arg(long, value_enum, default_value = "operator")]
    pub scope: WorkMapScopeArg,
    /// Exact canonical repository path for repository scope.
    #[arg(long)]
    pub repository: Option<String>,
    /// Exact epic id for epic scope.
    #[arg(long)]
    pub epic_id: Option<String>,
    /// One canonical Operations queue group.
    #[arg(long, value_enum)]
    pub group: Option<WorkMapGroupArg>,
    /// One authority source.
    #[arg(long, value_enum)]
    pub source: Option<WorkMapSourceArg>,
    /// Inclusive RFC3339 UTC history lower bound.
    #[arg(long)]
    pub from: Option<String>,
    /// Exclusive RFC3339 UTC history upper bound.
    #[arg(long)]
    pub to: Option<String>,
    /// Maximum graph nodes (default 250, maximum 500).
    #[arg(long)]
    pub max_nodes: Option<u64>,
    /// Exact focus reference kind.
    #[arg(long, value_enum, requires = "focus_id")]
    pub focus_kind: Option<WorkMapRefKindArg>,
    /// Exact focus reference id.
    #[arg(long, requires = "focus_kind")]
    pub focus_id: Option<String>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work list` flags.
#[derive(Debug, Args)]
pub struct WorkListArgs {
    /// Exact repository identity from work metadata.repository.
    #[arg(long)]
    pub repo: Option<String>,
    /// Exact status: open, in_progress, blocked, deferred, or closed.
    #[arg(long)]
    pub status: Option<String>,
    /// Exact custody holder.
    #[arg(long)]
    pub assignee: Option<String>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// Closed time bucket accepted by `work history`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum WorkHistoryBucketArg {
    Hour,
    Day,
    Week,
}

impl WorkHistoryBucketArg {
    fn as_str(self) -> &'static str {
        match self {
            Self::Hour => "hour",
            Self::Day => "day",
            Self::Week => "week",
        }
    }
}

/// Closed grouping dimension accepted by `work history`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum WorkHistoryGroupArg {
    None,
    Repository,
    Epic,
    Stage,
    Provider,
}

impl WorkHistoryGroupArg {
    fn as_str(self) -> &'static str {
        match self {
            Self::None => "none",
            Self::Repository => "repository",
            Self::Epic => "epic",
            Self::Stage => "stage",
            Self::Provider => "provider",
        }
    }
}

/// Exact durable work kind.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum WorkDetailKind {
    /// One slice run.
    Run,
    /// One epic.
    Epic,
}

impl WorkDetailKind {
    fn as_str(self) -> &'static str {
        match self {
            Self::Run => "run",
            Self::Epic => "epic",
        }
    }
}

/// `work history` flags. Omitted bounds default to the 30 days ending at
/// the operation's single `asOf`.
#[derive(Debug, Args)]
pub struct WorkHistoryArgs {
    /// Inclusive RFC3339 UTC lower bound.
    #[arg(long)]
    pub from: Option<String>,
    /// Exclusive RFC3339 UTC upper bound.
    #[arg(long)]
    pub to: Option<String>,
    /// Fixed trend bucket.
    #[arg(long, value_enum)]
    pub bucket: Option<WorkHistoryBucketArg>,
    /// One grouping dimension.
    #[arg(long, value_enum)]
    pub group_by: Option<WorkHistoryGroupArg>,
    /// Exact canonical repository path.
    #[arg(long)]
    pub repo: Option<String>,
    /// Exact canonical epic id.
    #[arg(long)]
    pub epic: Option<String>,
    /// Exact canonical run or epic subject id.
    #[arg(long)]
    pub subject: Option<String>,
    /// Subject page size (default 50, maximum 200).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Opaque continuation cursor from the preceding page.
    #[arg(long)]
    pub cursor: Option<String>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `work detail` flags. Exactly one addressing form: the exact
/// `--subject-kind`/`--subject-id` pair, or a bare `--id`. The core owns
/// that refusal — a clap conflict rule here would emit a usage error and
/// diverge from the MCP envelope.
#[derive(Debug, Args)]
pub struct WorkDetailArgs {
    /// Exact durable subject kind; travels only with --subject-id.
    #[arg(long, value_enum)]
    pub subject_kind: Option<WorkDetailKind>,
    /// Canonical run or epic id; travels only with --subject-kind.
    #[arg(long)]
    pub subject_id: Option<String>,
    /// Bare run or epic id, resolved against the durable inventory.
    #[arg(long)]
    pub id: Option<String>,
    /// Return event rows after this event id.
    #[arg(long)]
    pub after: Option<i64>,
    /// Maximum event rows (default 100, maximum 1000).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `attention` subcommands. `list` is the one read; the controls alter
/// custody only, and domain state is never changed by any of them.
#[derive(Debug, Subcommand)]
pub enum AttentionCmd {
    /// List attention items grouped by condition, decisions first.
    List(AttentionListArgs),
    /// Record who has custody while leaving the item active.
    Acknowledge(AttentionTargetArgs),
    /// Resolve an explicitly adjudicable occurrence.
    Resolve(AttentionResolveArgs),
    /// Reopen the exact current occurrence.
    Reopen(AttentionTargetArgs),
}

/// Closed custody-state scope for `attention list`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum AttentionListState {
    /// Open plus acknowledged (the default).
    Active,
    /// Open only, excluding acknowledged.
    Open,
    /// Every occurrence, including resolved.
    All,
}

impl AttentionListState {
    fn as_str(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Open => "open",
            Self::All => "all",
        }
    }
}

/// Closed attention classification for `attention list`.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum AttentionListClassification {
    Decision,
    Symptom,
}

impl AttentionListClassification {
    fn as_str(self) -> &'static str {
        match self {
            Self::Decision => "decision",
            Self::Symptom => "symptom",
        }
    }
}

/// `attention list` flags.
#[derive(Debug, Args)]
pub struct AttentionListArgs {
    /// Exact durable repository identity.
    #[arg(long)]
    pub repo: Option<String>,
    /// Custody-state scope (default active: open plus acknowledged).
    #[arg(long, value_enum)]
    pub state: Option<AttentionListState>,
    /// Exact condition filter.
    #[arg(long)]
    pub condition: Option<String>,
    /// Class filter: decision or symptom.
    #[arg(long, value_enum)]
    pub classification: Option<AttentionListClassification>,
    /// Maximum items across all groups, 1..=500 (default 100).
    #[arg(long)]
    pub limit: Option<u64>,
    /// Override the read-only idempotency key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// Exact occurrence address shared by attention controls.
#[derive(Debug, Args)]
pub struct AttentionTargetArgs {
    /// Canonical run or epic id.
    #[arg(long)]
    pub subject: String,
    /// Stable subject-condition identity from the projection.
    #[arg(long)]
    pub attention_id: String,
    /// Current causal occurrence identity from the projection.
    #[arg(long)]
    pub occurrence_id: String,
    /// Human or lead-agent identity taking the action.
    #[arg(long)]
    pub actor: String,
    /// Override the deterministic occurrence-scoped key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// Closed attention-resolution dispositions.
#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum AttentionDisposition {
    Fixed,
    AcceptedRisk,
    AcceptedUnknown,
    Superseded,
    EvidenceAbsent,
    Automatic,
}

impl AttentionDisposition {
    fn as_str(self) -> &'static str {
        match self {
            Self::Fixed => "fixed",
            Self::AcceptedRisk => "accepted-risk",
            Self::AcceptedUnknown => "accepted-unknown",
            Self::Superseded => "superseded",
            Self::EvidenceAbsent => "evidence-absent",
            Self::Automatic => "automatic",
        }
    }
}

/// `attention resolve` flags.
#[derive(Debug, Args)]
pub struct AttentionResolveArgs {
    /// Canonical run or epic id.
    #[arg(long)]
    pub subject: String,
    /// Stable subject-condition identity from the projection.
    #[arg(long)]
    pub attention_id: String,
    /// Current causal occurrence identity from the projection.
    #[arg(long)]
    pub occurrence_id: String,
    /// Human or lead-agent identity taking the action.
    #[arg(long)]
    pub actor: String,
    /// Auditable disposition for this occurrence.
    #[arg(long, value_enum)]
    pub disposition: AttentionDisposition,
    /// Bounded explanation of the disposition.
    #[arg(long, default_value = "")]
    pub note: String,
    /// Override the deterministic occurrence-scoped key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

/// `worktree` subcommands.
#[derive(Debug, Subcommand)]
pub enum WorktreeCmd {
    /// Retire a run's worktree.
    Retire(WorktreeRetireArgs),
}

/// `worktree retire` flags.
#[derive(Debug, Args)]
pub struct WorktreeRetireArgs {
    /// The run id.
    #[arg(long)]
    pub run: String,
    /// Override cleanliness refusals (only with --run-state-terminal).
    #[arg(long)]
    pub force: bool,
    /// Attest the run is terminal in the ledger.
    #[arg(long)]
    pub run_state_terminal: bool,
    /// REQUIRED: worktree retire cannot derive a meaningful key.
    #[arg(long)]
    pub idempotency_key: Option<String>,
}

fn request(key: Option<String>, run_id: Option<String>, params: Value) -> OperationRequest {
    let params = match params {
        Value::Object(map) => map,
        _ => Map::new(),
    };
    OperationRequest {
        schema_version: 1,
        idempotency_key: key.unwrap_or_default(),
        run_id,
        params,
    }
}

fn spec_field_input(
    inline: Option<String>,
    file: Option<&Path>,
    inline_flag: &str,
    file_flag: &str,
) -> Result<Option<String>, String> {
    match (inline, file) {
        (Some(_), Some(_)) => Err(format!("{inline_flag} cannot be used with {file_flag}")),
        (Some(value), None) => Ok(Some(value)),
        (None, Some(path)) => std::fs::read_to_string(path)
            .map(Some)
            .map_err(|error| format!("reading {file_flag} {} as UTF-8: {error}", path.display())),
        (None, None) => Ok(None),
    }
}

fn read_utf8_file_or_stdin(path: &Path, flag: &str) -> Result<String, String> {
    if path == Path::new("-") {
        let mut body = String::new();
        std::io::stdin()
            .read_to_string(&mut body)
            .map_err(|error| format!("reading {flag} - as UTF-8: {error}"))?;
        Ok(body)
    } else {
        std::fs::read_to_string(path)
            .map_err(|error| format!("reading {flag} {} as UTF-8: {error}", path.display()))
    }
}

/// The core name a parsed command routes to, WITHOUT consuming it — what a
/// failure before request mapping (an unloadable config, an unopenable
/// ledger, an unreadable CLI input file) needs in order to name the
/// envelope it still owes stdout.
pub fn command_name(command: &Command) -> &'static str {
    match command {
        Command::Doctor(_) => "doctor",
        Command::Init(_) => "init",
        Command::Definition { command } => match command {
            DefinitionCmd::Validate(_) => "definition_validate",
        },
        Command::Run { command } => match command {
            RunCmd::Start(_) => "run_start",
            RunCmd::Advance(_) => "run_advance",
            RunCmd::Drive(_) => "run_drive",
            RunCmd::Submit(_) => "run_submit",
            RunCmd::Status(_) => "run_status",
            RunCmd::Stop(_) => "run_stop",
            RunCmd::AdjudicateSettlement(_) => "run_adjudicate_settlement",
            RunCmd::ReviseRoster(_) => "run_revise_roster",
            RunCmd::AcceptRisk(_) => "run_accept_risk",
        },
        Command::Epic { command } => match command {
            EpicCmd::Preflight(_) => "epic_preflight",
            EpicCmd::Start(_) => "epic_start",
            EpicCmd::Advance(_) => "epic_advance",
            EpicCmd::Drive(_) => "epic_drive",
            EpicCmd::Submit(_) => "epic_submit",
            EpicCmd::Status(_) => "epic_status",
            EpicCmd::Pause(_) => "epic_pause",
            EpicCmd::Resume(_) => "epic_resume",
            EpicCmd::Resolve(_) => "epic_resolve",
            EpicCmd::Abandon(_) => "epic_abandon",
            EpicCmd::ReviseRoster(_) => "epic_revise_roster",
        },
        Command::Packet { command } => match command {
            PacketCmd::Show(_) => "packet_show",
            PacketCmd::Claim(_) => "packet_claim",
            PacketCmd::Complete(_) => "packet_complete",
            PacketCmd::Fail(_) => "packet_fail",
            PacketCmd::Heartbeat(_) => "packet_heartbeat",
        },
        Command::Review { command } => match command {
            ReviewCmd::Publish(_) => "review_publish",
        },
        Command::Artifact { command } => match command {
            ArtifactCmd::Verify(_) => "artifact_verify",
            ArtifactCmd::Compact(_) => "artifact_compact",
        },
        Command::Session { command } => match command {
            SessionCmd::List(_) => "session_list",
            SessionCmd::Inventory(_) => "session_inventory",
            SessionCmd::Read(_) => "session_read",
            SessionCmd::Message(_) => "session_message",
            SessionCmd::Stop(_) => "session_stop",
        },
        Command::ClaimNext(_) => "claim_next",
        Command::Gate { command } => match command {
            GateCmd::Run(_) => "gate_run",
        },
        Command::Reconcile(_) => "reconcile",
        Command::Usage(a) => match a.command {
            Some(UsageCmd::Ingest { .. }) => "usage_ingest",
            None => "usage_report",
        },
        Command::Events(_) => "events_tail",
        Command::Overview(_) => "overview",
        Command::Operations { command } => match command {
            OperationsCmd::Overview(_) => "operations_overview",
        },
        Command::Supervise(_) => "supervise",
        Command::Service { command } => command.operation_name(),
        Command::Work { command } => match command {
            WorkCmd::List(_) => "work_list",
            WorkCmd::History(_) => "work_history",
            WorkCmd::Detail(_) => "work_detail",
            WorkCmd::Map(_) => "work_map",
            WorkCmd::ImportBeads(_) => "work_import_beads",
            WorkCmd::Show(_) => "work_show",
            WorkCmd::Ready(_) => "work_ready",
            WorkCmd::Note { command } => match command {
                WorkNoteCmd::Add(_) => "work_note_add",
                WorkNoteCmd::List(_) => "work_note_list",
            },
            WorkCmd::Create(_) => "work_create",
            WorkCmd::Update(_) => "work_update",
            WorkCmd::Link(_) => "work_link",
            WorkCmd::Close(_) => "work_close",
            WorkCmd::Reopen(_) => "work_reopen",
            WorkCmd::Release(_) => "work_release",
            WorkCmd::Supersede(_) => "work_supersede",
            WorkCmd::Revert(_) => "work_revert",
        },
        Command::Attention { command } => match command {
            AttentionCmd::List(_) => "attention_list",
            AttentionCmd::Acknowledge(_) => "attention_acknowledge",
            AttentionCmd::Resolve(_) => "attention_resolve",
            AttentionCmd::Reopen(_) => "attention_reopen",
        },
        Command::Worktree { command } => match command {
            WorktreeCmd::Retire(_) => "worktree_retire",
        },
        Command::Mcp => "mcp",
    }
}

/// Map a parsed command onto its core name and request. File-backed inputs
/// are read here so the shared core receives the same field bytes as inline
/// input without learning about caller-local paths.
pub fn to_request(command: Command) -> Result<(&'static str, OperationRequest), String> {
    Ok(match command {
        Command::Doctor(a) => ("doctor", request(a.idempotency_key, None, json!({}))),
        Command::Init(a) => ("init", request(a.idempotency_key, None, json!({}))),
        Command::Definition { command } => match command {
            DefinitionCmd::Validate(a) => (
                "definition_validate",
                request(
                    a.idempotency_key,
                    None,
                    json!({"profile": a.profile, "roster": a.roster}),
                ),
            ),
        },
        Command::Run { command } => match command {
            RunCmd::Start(a) => (
                "run_start",
                request(
                    a.idempotency_key,
                    None,
                    // Operation envelopes are persisted and replayed. The
                    // CLI flag is `--work`, but this key is a frozen contract.
                    json!({
                        "bead": a.work,
                        "repo": a.repo,
                        "spec": a.spec,
                        "baseRef": a.base_ref,
                        "profile": a.profile,
                        "roster": a.roster,
                    }),
                ),
            ),
            RunCmd::Advance(a) => (
                "run_advance",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
                ),
            ),
            RunCmd::Drive(a) => (
                "run_drive",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
                ),
            ),
            RunCmd::Submit(a) => (
                "run_submit",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
                ),
            ),
            RunCmd::Status(a) => (
                "run_status",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
                ),
            ),
            RunCmd::Stop(a) => (
                "run_stop",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({
                        "run": a.run,
                        "outcome": a.outcome.as_str(),
                        "reason": a.reason,
                        "pr": a.pr,
                        "sha": a.sha,
                        "supersededBy": a.superseded_by,
                    }),
                ),
            ),
            RunCmd::AdjudicateSettlement(a) => (
                "run_adjudicate_settlement",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({
                        "run": a.run,
                        "outcome": a.outcome.as_str(),
                        "pr": a.pr,
                        "sha": a.sha,
                        "supersededBy": a.superseded_by,
                        "actor": a.actor,
                        "rationale": a.rationale,
                        "evidenceGap": a.evidence_gap,
                    }),
                ),
            ),
            RunCmd::ReviseRoster(a) => (
                "run_revise_roster",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run, "roster": a.roster, "reason": a.reason}),
                ),
            ),
            RunCmd::AcceptRisk(a) => (
                "run_accept_risk",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({
                        "run": a.run,
                        "acceptedBy": a.accepted_by,
                        "rationale": a.rationale,
                    }),
                ),
            ),
        },
        Command::Epic { command } => match command {
            EpicCmd::Preflight(a) => (
                "epic_preflight",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({
                        "epic": a.epic,
                        "repo": a.repo,
                        "baseRef": a.base_ref,
                        "profile": a.profile,
                        "roster": a.roster,
                        "rolling": a.rolling,
                    }),
                ),
            ),
            EpicCmd::Start(a) => (
                "epic_start",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({
                        "epic": a.epic,
                        "repo": a.repo,
                        "spec": a.spec,
                        "baseRef": a.base_ref,
                        "profile": a.profile,
                        "roster": a.roster,
                        "rolling": a.rolling,
                    }),
                ),
            ),
            EpicCmd::Advance(a) => (
                "epic_advance",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({"epic": a.epic}),
                ),
            ),
            EpicCmd::Drive(a) => (
                "epic_drive",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({"epic": a.epic}),
                ),
            ),
            EpicCmd::Submit(a) => (
                "epic_submit",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    // The flag is omitted when unset so the fenced request
                    // params stay byte-identical to every prior submit.
                    if a.wait_setup {
                        json!({"epic": a.epic, "waitSetup": true})
                    } else {
                        json!({"epic": a.epic})
                    },
                ),
            ),
            EpicCmd::Status(a) => (
                "epic_status",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({"epic": a.epic}),
                ),
            ),
            EpicCmd::Pause(a) => (
                "epic_pause",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({"epic": a.epic, "reason": a.reason}),
                ),
            ),
            EpicCmd::Resume(a) => (
                "epic_resume",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({"epic": a.epic, "reason": a.reason}),
                ),
            ),
            EpicCmd::Abandon(a) => (
                "epic_abandon",
                request(
                    a.idempotency_key,
                    None,
                    json!({"epic": a.epic, "reason": a.reason}),
                ),
            ),
            EpicCmd::Resolve(a) => (
                "epic_resolve",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({"epic": a.epic, "child": a.child, "note": a.note}),
                ),
            ),
            EpicCmd::ReviseRoster(a) => (
                "epic_revise_roster",
                request(
                    a.idempotency_key,
                    Some(a.epic.clone()),
                    json!({"epic": a.epic, "roster": a.roster, "reason": a.reason}),
                ),
            ),
        },
        Command::Packet { command } => match command {
            PacketCmd::Show(a) => (
                "packet_show",
                request(a.idempotency_key, None, json!({"packet": a.packet})),
            ),
            PacketCmd::Claim(a) => (
                "packet_claim",
                request(a.idempotency_key, None, json!({"packet": a.packet})),
            ),
            PacketCmd::Complete(a) => {
                let text = std::fs::read_to_string(&a.result)
                    .map_err(|e| format!("cannot read --result {}: {e}", a.result))?;
                let result: Value = serde_json::from_str(&text)
                    .map_err(|e| format!("--result {} is not JSON: {e}", a.result))?;
                (
                    "packet_complete",
                    request(
                        a.idempotency_key,
                        None,
                        json!({
                            "packet": a.packet,
                            "attempt": a.attempt,
                            "claimToken": a.claim_token,
                            "result": result,
                        }),
                    ),
                )
            }
            PacketCmd::Fail(a) => (
                "packet_fail",
                request(
                    a.idempotency_key,
                    None,
                    json!({
                        "packet": a.packet,
                        "attempt": a.attempt,
                        "claimToken": a.claim_token,
                        "note": a.note,
                    }),
                ),
            ),
            PacketCmd::Heartbeat(a) => (
                "packet_heartbeat",
                request(
                    None,
                    None,
                    json!({
                        "packet": a.packet,
                        "attempt": a.attempt,
                        "claimToken": a.claim_token,
                    }),
                ),
            ),
        },
        Command::Review { command } => match command {
            ReviewCmd::Publish(a) => (
                "review_publish",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
                ),
            ),
        },
        Command::Artifact { command } => match command {
            ArtifactCmd::Verify(a) => (
                "artifact_verify",
                request(a.idempotency_key, None, json!({"attempt": a.attempt})),
            ),
            ArtifactCmd::Compact(a) => (
                "artifact_compact",
                request(a.idempotency_key, None, json!({"attempt": a.attempt})),
            ),
        },
        Command::Session { command } => match command {
            SessionCmd::List(a) => (
                "session_list",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
                ),
            ),
            SessionCmd::Inventory(a) => {
                let mut params = Map::new();
                for (name, value) in [
                    ("run", a.run),
                    ("epic", a.epic),
                    ("repository", a.repository),
                    ("provider", a.provider),
                    ("model", a.model),
                    ("cursor", a.cursor),
                ] {
                    if let Some(value) = value {
                        params.insert(name.to_owned(), json!(value));
                    }
                }
                if let Some(activity) = a.activity {
                    params.insert("activity".to_owned(), json!(activity.as_str()));
                }
                if a.include_historical {
                    params.insert("includeHistorical".to_owned(), json!(true));
                }
                if let Some(limit) = a.limit {
                    params.insert("limit".to_owned(), json!(limit));
                }
                (
                    "session_inventory",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            SessionCmd::Read(a) => (
                "session_read",
                request(
                    a.idempotency_key,
                    None,
                    json!({"attempt": a.attempt, "lines": a.lines}),
                ),
            ),
            SessionCmd::Message(a) => (
                "session_message",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({
                        "run": a.run,
                        "attempt": a.attempt,
                        "message": a.message,
                        "requestedBy": a.requested_by,
                    }),
                ),
            ),
            SessionCmd::Stop(a) => (
                "session_stop",
                request(
                    a.idempotency_key,
                    None,
                    json!({"attempt": a.attempt, "reason": a.reason}),
                ),
            ),
        },
        Command::ClaimNext(a) => (
            "claim_next",
            request(a.idempotency_key, None, json!({"holder": a.holder})),
        ),
        Command::Gate { command } => match command {
            GateCmd::Run(a) => (
                "gate_run",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run, "stage": a.stage}),
                ),
            ),
        },
        Command::Reconcile(a) => (
            "reconcile",
            request(
                a.idempotency_key,
                Some(a.run.clone()),
                json!({"run": a.run}),
            ),
        ),
        Command::Usage(a) => match a.command {
            Some(UsageCmd::Ingest {
                run,
                all,
                idempotency_key,
            }) => (
                "usage_ingest",
                request(
                    idempotency_key,
                    run.clone(),
                    json!({"run": run, "all": all}),
                ),
            ),
            None => (
                "usage_report",
                request(
                    a.idempotency_key,
                    a.run.clone(),
                    json!({"run": a.run, "all": a.all}),
                ),
            ),
        },
        Command::Events(a) => (
            "events_tail",
            request(
                a.idempotency_key,
                a.run.clone(),
                json!({
                    "run": a.run,
                    "after": a.after,
                    "limit": a.limit,
                    "summary": a.summary,
                }),
            ),
        ),
        Command::Overview(a) => {
            let scope = a
                .run
                .clone()
                .or_else(|| a.epic.clone())
                .or_else(|| a.id.clone());
            // An unpassed flag is OMITTED, never sent as null — the same
            // shape `OverviewArgs::into_envelope` sends from the MCP
            // surface, so the core sees exactly one request for "no scope".
            // The core reads a scope key that is PRESENT and names nothing
            // as a caller's bug; only omitting all three asks for the
            // portfolio, and a null would otherwise smuggle a bare
            // `--run ""` past that guard.
            let mut params = Map::new();
            for (key, value) in [("run", &a.run), ("epic", &a.epic), ("id", &a.id)] {
                if let Some(value) = value {
                    params.insert(key.to_owned(), json!(value));
                }
            }
            if let Some(after) = a.after {
                params.insert("after".to_owned(), json!(after));
            }
            if let Some(limit) = a.limit {
                params.insert("limit".to_owned(), json!(limit));
            }
            (
                "overview",
                request(a.idempotency_key, scope, Value::Object(params)),
            )
        }
        Command::Operations { command } => match command {
            OperationsCmd::Overview(a) => {
                let mut params = Map::new();
                for (key, value) in [("repo", a.repo), ("group", a.group), ("source", a.source)] {
                    if let Some(value) = value {
                        params.insert(key.to_owned(), json!(value));
                    }
                }
                if let Some(limit) = a.limit {
                    params.insert("limit".to_owned(), json!(limit));
                }
                (
                    "operations_overview",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
        },
        Command::Supervise(a) => (
            "supervise",
            request(
                a.idempotency_key,
                None,
                json!({
                    "once": a.once,
                    "serviceGeneration": a.service_generation,
                }),
            ),
        ),
        Command::Service { .. } => {
            unreachable!("service commands are handled before ledger initialization")
        }
        Command::Work { command } => match command {
            WorkCmd::List(a) => {
                let mut params = Map::new();
                for (name, value) in [
                    ("repo", a.repo),
                    ("status", a.status),
                    ("assignee", a.assignee),
                ] {
                    if let Some(value) = value {
                        params.insert(name.to_owned(), json!(value));
                    }
                }
                (
                    "work_list",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::History(a) => {
                let mut params = Map::new();
                for (name, value) in [
                    ("from", a.from),
                    ("to", a.to),
                    ("repo", a.repo),
                    ("epic", a.epic),
                    ("subject", a.subject),
                    ("cursor", a.cursor),
                ] {
                    if let Some(value) = value {
                        params.insert(name.to_owned(), json!(value));
                    }
                }
                if let Some(bucket) = a.bucket {
                    params.insert("bucket".to_owned(), json!(bucket.as_str()));
                }
                if let Some(group_by) = a.group_by {
                    params.insert("groupBy".to_owned(), json!(group_by.as_str()));
                }
                if let Some(limit) = a.limit {
                    params.insert("limit".to_owned(), json!(limit));
                }
                (
                    "work_history",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Detail(a) => {
                let mut params = Map::new();
                if let Some(kind) = a.subject_kind {
                    params.insert("subjectKind".to_owned(), json!(kind.as_str()));
                }
                for (name, value) in [("subjectId", a.subject_id), ("id", a.id)] {
                    if let Some(value) = value {
                        params.insert(name.to_owned(), json!(value));
                    }
                }
                if let Some(after) = a.after {
                    params.insert("after".to_owned(), json!(after));
                }
                if let Some(limit) = a.limit {
                    params.insert("limit".to_owned(), json!(limit));
                }
                // The subject id or the bare id, whichever form is present.
                let run_id = params
                    .get("subjectId")
                    .or_else(|| params.get("id"))
                    .and_then(Value::as_str)
                    .map(str::to_owned);
                (
                    "work_detail",
                    request(a.idempotency_key, run_id, Value::Object(params)),
                )
            }
            WorkCmd::Map(a) => {
                let mut params = Map::new();
                params.insert("scope".to_owned(), json!(a.scope.as_str()));
                for (name, value) in [
                    ("repository", a.repository),
                    ("epicId", a.epic_id),
                    ("from", a.from),
                    ("to", a.to),
                ] {
                    if let Some(value) = value {
                        params.insert(name.to_owned(), json!(value));
                    }
                }
                if let Some(group) = a.group {
                    params.insert("group".to_owned(), json!(group.as_str()));
                }
                if let Some(source) = a.source {
                    params.insert("source".to_owned(), json!(source.as_str()));
                }
                if let Some(max_nodes) = a.max_nodes {
                    params.insert("maxNodes".to_owned(), json!(max_nodes));
                }
                if let (Some(kind), Some(id)) = (a.focus_kind, a.focus_id) {
                    params.insert(
                        "focus".to_owned(),
                        json!({
                            "schema": "forged.work-ref/1",
                            "kind": kind.as_str(),
                            "id": id,
                        }),
                    );
                }
                (
                    "work_map",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::ImportBeads(a) => (
                "work_import_beads",
                request(a.idempotency_key, None, json!({})),
            ),
            WorkCmd::Show(a) => (
                "work_show",
                request(a.idempotency_key, None, json!({"id": a.id})),
            ),
            WorkCmd::Ready(a) => {
                let mut params = Map::new();
                if let Some(repo) = a.repo {
                    params.insert("repo".to_owned(), json!(repo));
                }
                if a.full {
                    params.insert("detail".to_owned(), json!("full"));
                }
                if let Some(limit) = a.limit {
                    params.insert("limit".to_owned(), json!(limit));
                }
                (
                    "work_ready",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Note { command } => match command {
                WorkNoteCmd::Add(a) => {
                    let mut params = Map::new();
                    params.insert("id".to_owned(), json!(a.id));
                    params.insert("kind".to_owned(), json!(a.kind));
                    params.insert(
                        "bodyJson".to_owned(),
                        json!(read_utf8_file_or_stdin(&a.body_file, "--body-file")?),
                    );
                    if let Some(schema) = a.schema {
                        params.insert("schema".to_owned(), json!(schema));
                    }
                    if let Some(actor) = a.actor {
                        params.insert("actor".to_owned(), json!(actor));
                    }
                    (
                        "work_note_add",
                        request(a.idempotency_key, None, Value::Object(params)),
                    )
                }
                WorkNoteCmd::List(a) => {
                    let mut params = Map::new();
                    params.insert("id".to_owned(), json!(a.id));
                    if let Some(kind) = a.kind {
                        params.insert("kind".to_owned(), json!(kind));
                    }
                    if let Some(limit) = a.limit {
                        params.insert("limit".to_owned(), json!(limit));
                    }
                    (
                        "work_note_list",
                        request(a.idempotency_key, None, Value::Object(params)),
                    )
                }
            },
            WorkCmd::Create(a) => {
                let description = spec_field_input(
                    a.description,
                    a.description_file.as_deref(),
                    "--description",
                    "--description-file",
                )?;
                let acceptance = spec_field_input(
                    a.acceptance,
                    a.acceptance_file.as_deref(),
                    "--acceptance",
                    "--acceptance-file",
                )?;
                let design = spec_field_input(
                    a.design,
                    a.design_file.as_deref(),
                    "--design",
                    "--design-file",
                )?;
                let notes =
                    spec_field_input(a.notes, a.notes_file.as_deref(), "--notes", "--notes-file")?;
                let mut params = Map::new();
                params.insert("id".to_owned(), json!(a.id));
                params.insert("title".to_owned(), json!(a.title));
                for (name, value) in [
                    ("description", description),
                    ("acceptanceCriteria", acceptance),
                    ("design", design),
                    ("notes", notes),
                    ("kind", a.kind),
                    ("status", a.status),
                ] {
                    if let Some(value) = value {
                        params.insert(name.to_owned(), json!(value));
                    }
                }
                if let Some(priority) = a.priority {
                    params.insert("priority".to_owned(), json!(priority));
                }
                if let Some(repository) = a.repository {
                    params.insert("metadata".to_owned(), json!({"repository": repository}));
                }
                (
                    "work_create",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Update(a) => {
                let description = spec_field_input(
                    a.description,
                    a.description_file.as_deref(),
                    "--description",
                    "--description-file",
                )?;
                let acceptance = spec_field_input(
                    a.acceptance,
                    a.acceptance_file.as_deref(),
                    "--acceptance",
                    "--acceptance-file",
                )?;
                let design = spec_field_input(
                    a.design,
                    a.design_file.as_deref(),
                    "--design",
                    "--design-file",
                )?;
                let notes =
                    spec_field_input(a.notes, a.notes_file.as_deref(), "--notes", "--notes-file")?;
                let mut params = Map::new();
                params.insert("id".to_owned(), json!(a.id));
                params.insert("expectedRevision".to_owned(), json!(a.expected_revision));
                for (name, value) in [
                    ("title", a.title),
                    ("description", description),
                    ("acceptanceCriteria", acceptance),
                    ("design", design),
                    ("notes", notes),
                ] {
                    if let Some(value) = value {
                        params.insert(name.to_owned(), json!(value));
                    }
                }
                (
                    "work_update",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Link(a) => {
                let mut params = Map::new();
                params.insert("fromId".to_owned(), json!(a.from));
                params.insert("toId".to_owned(), json!(a.to));
                if let Some(kind) = a.kind {
                    params.insert("kind".to_owned(), json!(kind));
                }
                (
                    "work_link",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Close(a) => {
                let mut params = Map::new();
                params.insert("id".to_owned(), json!(a.id));
                params.insert("reason".to_owned(), json!(a.reason));
                if let Some(actor) = a.actor {
                    params.insert("actor".to_owned(), json!(actor));
                }
                (
                    "work_close",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Reopen(a) => {
                let mut params = Map::new();
                params.insert("id".to_owned(), json!(a.id));
                if let Some(actor) = a.actor {
                    params.insert("actor".to_owned(), json!(actor));
                }
                (
                    "work_reopen",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Release(a) => {
                let mut params = Map::new();
                params.insert("id".to_owned(), json!(a.id));
                if let Some(actor) = a.actor {
                    params.insert("actor".to_owned(), json!(actor));
                }
                (
                    "work_release",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Supersede(a) => {
                let mut params = Map::new();
                params.insert("id".to_owned(), json!(a.id));
                params.insert("successorId".to_owned(), json!(a.successor));
                if let Some(actor) = a.actor {
                    params.insert("actor".to_owned(), json!(actor));
                }
                (
                    "work_supersede",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            WorkCmd::Revert(a) => {
                let mut params = Map::new();
                params.insert("id".to_owned(), json!(a.id));
                params.insert("expectedRevision".to_owned(), json!(a.expected_revision));
                params.insert("toRevision".to_owned(), json!(a.to_revision));
                if let Some(actor) = a.actor {
                    params.insert("actor".to_owned(), json!(actor));
                }
                (
                    "work_revert",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
        },
        Command::Attention { command } => match command {
            AttentionCmd::List(a) => {
                let mut params = Map::new();
                for (key, value) in [("repo", a.repo), ("condition", a.condition)] {
                    if let Some(value) = value {
                        params.insert(key.to_owned(), json!(value));
                    }
                }
                if let Some(state) = a.state {
                    params.insert("state".to_owned(), json!(state.as_str()));
                }
                if let Some(classification) = a.classification {
                    params.insert("classification".to_owned(), json!(classification.as_str()));
                }
                if let Some(limit) = a.limit {
                    params.insert("limit".to_owned(), json!(limit));
                }
                (
                    "attention_list",
                    request(a.idempotency_key, None, Value::Object(params)),
                )
            }
            AttentionCmd::Acknowledge(a) => (
                "attention_acknowledge",
                request(
                    a.idempotency_key,
                    Some(a.subject),
                    json!({
                        "attentionId": a.attention_id,
                        "occurrenceId": a.occurrence_id,
                        "actor": a.actor,
                    }),
                ),
            ),
            AttentionCmd::Resolve(a) => (
                "attention_resolve",
                request(
                    a.idempotency_key,
                    Some(a.subject),
                    json!({
                        "attentionId": a.attention_id,
                        "occurrenceId": a.occurrence_id,
                        "actor": a.actor,
                        "disposition": a.disposition.as_str(),
                        "note": a.note,
                    }),
                ),
            ),
            AttentionCmd::Reopen(a) => (
                "attention_reopen",
                request(
                    a.idempotency_key,
                    Some(a.subject),
                    json!({
                        "attentionId": a.attention_id,
                        "occurrenceId": a.occurrence_id,
                        "actor": a.actor,
                    }),
                ),
            ),
        },
        Command::Worktree { command } => match command {
            WorktreeCmd::Retire(a) => (
                "worktree_retire",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({
                        "run": a.run,
                        "force": a.force,
                        "runStateTerminal": a.run_state_terminal,
                    }),
                ),
            ),
        },
        Command::Mcp => unreachable!("mcp is handled before request mapping"),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const BULLET: &str = "- bullet";
    const LONG_TEXT_FIELDS: [(&str, &str); 4] = [
        ("--description", "description"),
        ("--acceptance", "acceptanceCriteria"),
        ("--design", "design"),
        ("--notes", "notes"),
    ];

    fn assert_long_text_forms(base: &[&str]) {
        for (flag, param) in LONG_TEXT_FIELDS {
            let mut spaced = base
                .iter()
                .map(|value| (*value).to_owned())
                .collect::<Vec<_>>();
            spaced.extend([flag.to_owned(), BULLET.to_owned()]);
            let parsed = Cli::try_parse_from(spaced).expect("space-separated bullet value");
            let (_, request) = to_request(parsed.command).expect("request");
            assert_eq!(request.params[param], BULLET, "{flag} spaced");

            let mut attached = base
                .iter()
                .map(|value| (*value).to_owned())
                .collect::<Vec<_>>();
            attached.push(format!("{flag}={BULLET}"));
            let parsed = Cli::try_parse_from(attached).expect("attached bullet value");
            let (_, request) = to_request(parsed.command).expect("request");
            assert_eq!(request.params[param], BULLET, "{flag} attached");
        }
    }

    #[test]
    fn work_create_long_text_fields_accept_bullet_led_values_in_both_forms() {
        assert_long_text_forms(&["forged", "work", "create", "--id", "x", "--title", "t"]);
    }

    #[test]
    fn work_update_long_text_fields_accept_bullet_led_values_in_both_forms() {
        assert_long_text_forms(&[
            "forged",
            "work",
            "update",
            "--id",
            "x",
            "--expected-revision",
            "1",
        ]);
    }

    #[test]
    fn other_work_values_keep_their_hyphen_parsing() {
        assert!(Cli::try_parse_from([
            "forged", "work", "create", "--id", "x", "--title", "- title"
        ])
        .is_err());
        assert!(Cli::try_parse_from([
            "forged",
            "work",
            "update",
            "--id",
            "x",
            "--expected-revision",
            "1",
            "--title",
            "- title",
        ])
        .is_err());
    }
}
