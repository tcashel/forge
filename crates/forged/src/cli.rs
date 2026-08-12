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
    /// Run lifecycle.
    Run {
        /// The run subcommand.
        #[command(subcommand)]
        command: RunCmd,
    },
    /// Packet lifecycle.
    Packet {
        /// The packet subcommand.
        #[command(subcommand)]
        command: PacketCmd,
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
    /// Project the run's current state (read-only).
    Status(RunScoped),
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
    /// Path of the spec the run builds.
    #[arg(long)]
    pub spec: String,
    /// Base ref; defaults to the repo's default branch.
    #[arg(long)]
    pub base_ref: Option<String>,
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
        Command::Run { command } => match command {
            RunCmd::Start(_) => "run_start",
            RunCmd::Advance(_) => "run_advance",
            RunCmd::Drive(_) => "run_drive",
            RunCmd::Status(_) => "run_status",
        },
        Command::Packet { command } => match command {
            PacketCmd::Show(_) => "packet_show",
            PacketCmd::Claim(_) => "packet_claim",
            PacketCmd::Complete(_) => "packet_complete",
            PacketCmd::Fail(_) => "packet_fail",
            PacketCmd::Heartbeat(_) => "packet_heartbeat",
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
            RunCmd::Status(a) => (
                "run_status",
                request(
                    a.idempotency_key,
                    Some(a.run.clone()),
                    json!({"run": a.run}),
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
