//! `forged mcp` — the rmcp stdio server. Seventeen tools, each taking the
//! same operation envelope in and returning the same envelope out; every
//! tool routes through the identical core dispatch the CLI uses, so the two
//! surfaces are two adapters over one core.
//!
//! rmcp 3.x idioms (operator-adjudicated): `ContentBlock` for tool results,
//! `ServerInfo::default()` then mutate for the server declaration, and the
//! `tool_router` macro for tool registration.

use std::sync::Arc;

use rmcp::handler::server::router::tool::ToolRouter;
use rmcp::handler::server::wrapper::Parameters;
use rmcp::model::{CallToolResult, ContentBlock, ServerCapabilities, ServerInfo};
use rmcp::schemars::JsonSchema;
use rmcp::{tool, tool_handler, tool_router, ServerHandler, ServiceExt};
use serde::Deserialize;
use serde_json::Value;

use forged_types::OperationRequest;

use crate::core::{dispatch, Ctx};

/// The operation envelope as a tool input — one envelope type on every
/// surface. `schemaVersion` defaults to 1 and `idempotencyKey` to absent,
/// exactly as the CLI defaults them.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase")]
pub struct EnvelopeArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// The idempotency key; derived (mutating) or defaulted (read-only)
    /// when absent, exactly two tools require it explicitly.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// The run the operation addresses, when any.
    #[serde(default)]
    pub run_id: Option<String>,
    /// Command parameters.
    #[serde(default)]
    pub params: serde_json::Map<String, Value>,
}

fn default_schema_version() -> u32 {
    1
}

impl EnvelopeArgs {
    fn into_request(self) -> OperationRequest {
        OperationRequest {
            schema_version: self.schema_version,
            idempotency_key: self.idempotency_key.unwrap_or_default(),
            run_id: self.run_id,
            params: self.params,
        }
    }
}

/// The forged MCP server: a thin adapter over the shared core.
#[derive(Clone)]
pub struct ForgedServer {
    ctx: Arc<Ctx>,
    tool_router: ToolRouter<Self>,
}

impl ForgedServer {
    /// Build the server over the shared context.
    pub fn new(ctx: Arc<Ctx>) -> Self {
        Self {
            ctx,
            tool_router: Self::tool_router(),
        }
    }

    async fn call(&self, name: &str, args: EnvelopeArgs) -> CallToolResult {
        let resp = dispatch(&self.ctx, name, args.into_request()).await;
        let text = serde_json::to_string(&resp)
            .unwrap_or_else(|e| format!("{{\"ok\":false,\"error\":\"unserializable: {e}\"}}"));
        CallToolResult::success(vec![ContentBlock::text(text)])
    }
}

#[tool_router(router = tool_router)]
impl ForgedServer {
    /// Environment probes: bd, ledger, gh, providers, herdr.
    #[tool(name = "doctor", description = "Run the forged environment probes.")]
    pub async fn doctor(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("doctor", args.0).await
    }

    /// Resolve and validate a profile/roster selection.
    #[tool(
        name = "definition_validate",
        description = "Resolve and validate an execution definition."
    )]
    pub async fn definition_validate(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("definition_validate", args.0).await
    }

    /// Start a run for a bead.
    #[tool(name = "run_start", description = "Create a run for a bead.")]
    pub async fn run_start(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_start", args.0).await
    }

    /// One project → advance → honor iteration.
    #[tool(name = "run_advance", description = "Advance a run by one action.")]
    pub async fn run_advance(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_advance", args.0).await
    }

    /// Read-only run projection.
    #[tool(name = "run_status", description = "Project a run's current state.")]
    pub async fn run_status(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_status", args.0).await
    }

    /// Append an explicit roster revision.
    #[tool(
        name = "run_revise_roster",
        description = "Append a validated roster revision for a run."
    )]
    pub async fn run_revise_roster(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_revise_roster", args.0).await
    }

    /// Claim one packet.
    #[tool(name = "packet_claim", description = "Claim a packet for execution.")]
    pub async fn packet_claim(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("packet_claim", args.0).await
    }

    /// Land a packet result.
    #[tool(name = "packet_complete", description = "Land a packet result.")]
    pub async fn packet_complete(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("packet_complete", args.0).await
    }

    /// Report a packet failure.
    #[tool(name = "packet_fail", description = "Report a packet failure.")]
    pub async fn packet_fail(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("packet_fail", args.0).await
    }

    /// Durable provider-session metadata for a run.
    #[tool(
        name = "session_list",
        description = "List provider sessions for a run."
    )]
    pub async fn session_list(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("session_list", args.0).await
    }

    /// Read recent output from a Herdr-backed session.
    #[tool(name = "session_read", description = "Read a Herdr session pane.")]
    pub async fn session_read(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("session_read", args.0).await
    }

    /// Queue or capability-gated live-deliver an intervention.
    #[tool(
        name = "session_message",
        description = "Queue an intervention for a run or live session."
    )]
    pub async fn session_message(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("session_message", args.0).await
    }

    /// Revoke and confirmed-stop one provider attempt.
    #[tool(
        name = "session_stop",
        description = "Revoke and stop a provider attempt."
    )]
    pub async fn session_stop(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("session_stop", args.0).await
    }

    /// The stateless resume verb.
    #[tool(
        name = "claim_next",
        description = "Resume a ledger run or claim the next ready bead."
    )]
    pub async fn claim_next(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("claim_next", args.0).await
    }

    /// One reconcile pass over a run.
    #[tool(name = "reconcile", description = "Reconcile a run's live attempts.")]
    pub async fn reconcile(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("reconcile", args.0).await
    }

    /// The read-only usage summary.
    #[tool(name = "usage_report", description = "Summarize recorded usage.")]
    pub async fn usage_report(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("usage_report", args.0).await
    }

    /// Paged event listing (the `_tail` name is historical).
    #[tool(name = "events_tail", description = "List ledger events, paged.")]
    pub async fn events_tail(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("events_tail", args.0).await
    }
}

#[tool_handler(router = self.tool_router)]
impl ServerHandler for ForgedServer {
    fn get_info(&self) -> ServerInfo {
        // ServerInfo::default() then mutate — the adjudicated idiom.
        let mut info = ServerInfo::default();
        info.capabilities = ServerCapabilities::builder().enable_tools().build();
        info.server_info.name = "forged".into();
        info.server_info.version = env!("CARGO_PKG_VERSION").into();
        info.instructions = Some(
            "forged operation tools: every tool takes one operation envelope \
             (schemaVersion, idempotencyKey, runId, params) and returns one \
             operation response envelope as JSON text."
                .into(),
        );
        info
    }
}

/// Serve MCP over stdio until the client disconnects. The one command that
/// prints no envelope: it serves the protocol instead.
pub async fn serve(ctx: Arc<Ctx>) -> Result<(), String> {
    let server = ForgedServer::new(ctx);
    let service = server
        .serve(rmcp::transport::stdio())
        .await
        .map_err(|e| format!("mcp serve failed: {e}"))?;
    service
        .waiting()
        .await
        .map_err(|e| format!("mcp session failed: {e}"))?;
    Ok(())
}
