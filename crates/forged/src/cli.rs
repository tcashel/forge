//! The clap surface: flags in, one `OperationRequest` out. No logic lives
//! here — every command routes through the same `core/` function the MCP
//! tools call.

use clap::{Args, Parser, Subcommand};
use forged_types::OperationRequest;
use serde_json::{json, Map, Value};

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
    /// Durable epic/wave scheduling over Beads readiness.
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
    /// Provider-session observation and intervention.
    Session {
        /// The session subcommand.
        #[command(subcommand)]
        command: SessionCmd,
    },
    /// Resume a ledger run or claim the next ready bead (explicit
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
    /// Work inventory.
    Work {
        /// The work subcommand.
        #[command(subcommand)]
        command: WorkCmd,
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

/// `run` subcommands.
#[derive(Debug, Subcommand)]
pub enum RunCmd {
    /// Create a run for a bead.
    Start(RunStartArgs),
    /// One project → advance → honor iteration.
    Advance(RunScoped),
    /// Loop advance until the run stops.
    Drive(RunScoped),
    /// Hand the run to a detached durable controller.
    Submit(RunScoped),
    /// Project the run's current state (read-only).
    Status(RunScoped),
    /// Append an explicit roster revision at a durable boundary.
    ReviseRoster(RunReviseRosterArgs),
}

/// `epic` subcommands.
#[derive(Debug, Subcommand)]
pub enum EpicCmd {
    /// Freeze an epic inventory and execution defaults.
    Start(EpicStartArgs),
    /// Perform one durable scheduler action.
    Advance(EpicScoped),
    /// Drive until the final draft PR or explicit input is required.
    Drive(EpicScoped),
    /// Hand the epic to a detached durable controller.
    Submit(EpicScoped),
    /// Project waves, children, blockers, and the final PR (read-only).
    Status(EpicScoped),
    /// Pause scheduling after the current durable boundary.
    Pause(EpicReasonArgs),
    /// Resume a paused epic.
    Resume(EpicReasonArgs),
    /// Resolve a held child after its spec/input was adjudicated.
    Resolve(EpicResolveArgs),
    /// Append a roster revision for current and future child runs.
    ReviseRoster(EpicReviseRosterArgs),
}

/// `epic start` flags.
#[derive(Debug, Args)]
pub struct EpicStartArgs {
    /// Beads epic id whose inventory/readiness is authoritative.
    #[arg(long)]
    pub epic: String,
    /// Absolute target checkout path.
    #[arg(long)]
    pub repo: String,
    /// Locked epic-map path.
    #[arg(long)]
    pub spec: String,
    /// Default-branch target; defaults from origin/HEAD.
    #[arg(long)]
    pub base_ref: Option<String>,
    /// Assurance profile inherited by child slices.
    #[arg(long)]
    pub profile: Option<String>,
    /// Model roster inherited by child slices.
    #[arg(long)]
    pub roster: Option<String>,
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

/// Explicit input-required resolution flags.
#[derive(Debug, Args)]
pub struct EpicResolveArgs {
    /// Durable epic id.
    #[arg(long)]
    pub epic: String,
    /// Held child whose spec/input is now resolved.
    #[arg(long)]
    pub child: String,
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
    /// The bead the run implements (also mints the run id).
    #[arg(long)]
    pub bead: String,
    /// Absolute path of the target checkout.
    #[arg(long)]
    pub repo: String,
    /// DEPRECATED: path of a spec file. Omit it — the bead's own fields are
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

/// `session` subcommands.
#[derive(Debug, Subcommand)]
pub enum SessionCmd {
    /// List durable provider-session metadata for a run.
    List(RunScoped),
    /// Read recent output from a Herdr-backed attempt.
    Read(SessionReadArgs),
    /// Queue an intervention, delivering live only when capability permits.
    Message(SessionMessageArgs),
    /// Revoke and confirmed-stop one attempt.
    Stop(SessionStopArgs),
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

/// `work` subcommands.
#[derive(Debug, Subcommand)]
pub enum WorkCmd {
    /// List every slice run and started epic, with no id (read-only).
    List(KeyOnly),
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

/// The core name a parsed command routes to, WITHOUT consuming it — what a
/// failure before request mapping (an unloadable config, an unopenable
/// ledger, an unreadable `--result` file) needs in order to name the
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
            RunCmd::ReviseRoster(_) => "run_revise_roster",
        },
        Command::Epic { command } => match command {
            EpicCmd::Start(_) => "epic_start",
            EpicCmd::Advance(_) => "epic_advance",
            EpicCmd::Drive(_) => "epic_drive",
            EpicCmd::Submit(_) => "epic_submit",
            EpicCmd::Status(_) => "epic_status",
            EpicCmd::Pause(_) => "epic_pause",
            EpicCmd::Resume(_) => "epic_resume",
            EpicCmd::Resolve(_) => "epic_resolve",
            EpicCmd::ReviseRoster(_) => "epic_revise_roster",
        },
        Command::Packet { command } => match command {
            PacketCmd::Show(_) => "packet_show",
            PacketCmd::Claim(_) => "packet_claim",
            PacketCmd::Complete(_) => "packet_complete",
            PacketCmd::Fail(_) => "packet_fail",
            PacketCmd::Heartbeat(_) => "packet_heartbeat",
        },
        Command::Session { command } => match command {
            SessionCmd::List(_) => "session_list",
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
        Command::Work { command } => match command {
            WorkCmd::List(_) => "work_list",
        },
        Command::Worktree { command } => match command {
            WorktreeCmd::Retire(_) => "worktree_retire",
        },
        Command::Mcp => "mcp",
    }
}

/// Map a parsed command onto its core name and request. The only error is
/// an unreadable `--result` file.
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
                    json!({
                        "bead": a.bead,
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
            RunCmd::ReviseRoster(a) => (
                "run_revise_roster",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run, "roster": a.roster, "reason": a.reason}),
                ),
            ),
        },
        Command::Epic { command } => match command {
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
                    json!({"epic": a.epic}),
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
        Command::Session { command } => match command {
            SessionCmd::List(a) => (
                "session_list",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
                ),
            ),
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
                json!({"run": a.run, "after": a.after, "limit": a.limit}),
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
        Command::Work { command } => match command {
            WorkCmd::List(a) => ("work_list", request(a.idempotency_key, None, json!({}))),
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
