//! `forged mcp` — the rmcp stdio server. Thirty tools, each taking the same
//! operation envelope in and returning the same envelope out; every
//! tool routes through the identical core dispatch the CLI uses, so the two
//! surfaces are two adapters over one core.
//!
//! rmcp 3.x idioms (operator-adjudicated): `ContentBlock` for tool results,
//! `ServerInfo::default()` then mutate for the server declaration, and the
//! `tool_router` macro for tool registration.

use std::sync::Arc;

use rmcp::handler::server::router::tool::ToolRouter;
use rmcp::handler::server::wrapper::Parameters;
use rmcp::model::{
    CallToolResult, ContentBlock, ErrorData, ExtensionCapabilities, JsonObject,
    ListResourcesResult, MetaObject, PaginatedRequestParams, ReadResourceRequestParams,
    ReadResourceResponse, ReadResourceResult, Resource, ResourceContents, ServerCapabilities,
    ServerInfo,
};
use rmcp::schemars::JsonSchema;
use rmcp::service::{RequestContext, RoleServer};
use rmcp::{tool, tool_handler, tool_router, ServerHandler, ServiceExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use forged_types::OperationRequest;

use crate::core::{dispatch, Ctx};

const OVERVIEW_URI: &str = "ui://forged/overview.html";
const APP_MIME: &str = "text/html;profile=mcp-app";
const OVERVIEW_HTML: &str = include_str!("../assets/overview.html");

fn overview_tool_meta() -> MetaObject {
    let mut meta = MetaObject::new();
    meta.insert(
        "ui".to_owned(),
        serde_json::json!({"resourceUri": OVERVIEW_URI}),
    );
    // Pre-standard hosts used this flat spelling. Keeping both is harmless
    // and lets the same binary progressively enhance older Apps clients.
    meta.insert(
        "ui/resourceUri".to_owned(),
        Value::String(OVERVIEW_URI.to_owned()),
    );
    meta
}

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

/// The `overview` envelope: the shared envelope shape with a TYPED
/// `params`, so the one tool a host renders advertises the scopes it
/// accepts instead of a free-form map. [`EnvelopeArgs`] itself is
/// unchanged — every other tool still takes it.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase")]
pub struct OverviewArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// The idempotency key; defaulted to `op:overview:read` when absent.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// The run the operation addresses, when any.
    #[serde(default)]
    pub run_id: Option<String>,
    /// Projection parameters.
    #[serde(default)]
    pub params: OverviewParams,
}

/// `overview` parameters. Exactly one of `run`, `epic`, or `id` is required;
/// `after` and `limit` page the event tail.
///
/// Typing these MOVED one boundary, deliberately. A wrong-TYPED `after` or
/// `limit` (`"5"`, `1.5`, a negative `limit`) is refused as `invalid_params`
/// before dispatch and reaches the host as an `isError` result carrying a
/// deserialization message, NOT an operation envelope; the free-form map used
/// to drop it silently and answer with a default page. That is the intended
/// surface — a host is told its call was malformed instead of being handed a
/// projection of something it did not ask for, and the CLI's own parser has
/// always refused a non-integer `--after` the same way. A value of the right
/// type but the wrong RANGE (`after: -1`, `limit: 0`, `limit: 1001`) still
/// reaches the core and comes back as an ordinary `InvalidRequest` envelope,
/// so domain questions keep their domain answers.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
pub struct OverviewParams {
    /// Project one slice run, by run id.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub run: Option<String>,
    /// Project one epic and its child runs, by epic run id.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub epic: Option<String>,
    /// Project whichever of the two this id names, without saying which;
    /// an id that resolves to no single subject returns candidates.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    /// Return only event rows with an eventId greater than this
    /// (default 0).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub after: Option<i64>,
    /// Maximum event rows in the polling page, 1..=1000 (default 100).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
}

impl OverviewArgs {
    /// Project onto the shared envelope. Absent params are OMITTED rather
    /// than sent as null, so the core sees exactly what the CLI sends.
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self.params) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: self.schema_version,
            idempotency_key: self.idempotency_key,
            run_id: self.run_id,
            params,
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

    async fn call_structured(&self, name: &str, args: EnvelopeArgs) -> CallToolResult {
        let resp = dispatch(&self.ctx, name, args.into_request()).await;
        let structured = serde_json::to_value(&resp).unwrap_or(Value::Null);
        let text = serde_json::to_string(&resp)
            .unwrap_or_else(|e| format!("{{\"ok\":false,\"error\":\"unserializable: {e}\"}}"));
        let mut result = CallToolResult::success(vec![ContentBlock::text(text)]);
        result.structured_content = Some(structured);
        result
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

    /// Hand a run to a detached durable controller.
    #[tool(
        name = "run_submit",
        description = "Submit a run for detached driving."
    )]
    pub async fn run_submit(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_submit", args.0).await
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

    /// Freeze an epic inventory and child execution defaults.
    #[tool(name = "epic_start", description = "Start a durable Beads epic run.")]
    pub async fn epic_start(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_start", args.0).await
    }

    /// Perform one epic scheduler action.
    #[tool(name = "epic_advance", description = "Advance an epic by one action.")]
    pub async fn epic_advance(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_advance", args.0).await
    }

    /// Drive an epic to a durable stop.
    #[tool(
        name = "epic_drive",
        description = "Drive an epic to input or final PR."
    )]
    pub async fn epic_drive(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_drive", args.0).await
    }

    /// Hand an epic to a detached durable controller.
    #[tool(
        name = "epic_submit",
        description = "Submit an epic for detached driving."
    )]
    pub async fn epic_submit(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_submit", args.0).await
    }

    /// Project epic waves, child runs, blockers, and PR state.
    #[tool(name = "epic_status", description = "Project durable epic state.")]
    pub async fn epic_status(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_status", args.0).await
    }

    /// Pause an epic at its current durable boundary.
    #[tool(name = "epic_pause", description = "Pause epic scheduling.")]
    pub async fn epic_pause(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_pause", args.0).await
    }

    /// Resume a paused epic.
    #[tool(name = "epic_resume", description = "Resume epic scheduling.")]
    pub async fn epic_resume(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_resume", args.0).await
    }

    /// Resolve a child-specific input-required stop.
    #[tool(name = "epic_resolve", description = "Resolve held epic child input.")]
    pub async fn epic_resolve(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_resolve", args.0).await
    }

    #[tool(
        name = "epic_revise_roster",
        description = "Append one durable roster revision for current and future epic children."
    )]
    pub async fn epic_revise_roster(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("epic_revise_roster", args.0).await
    }

    /// Unified reconnect projection, rendered by the optional MCP App.
    #[tool(
        name = "overview",
        description = "Project one slice or epic with workers, evidence, usage, and events. \
                       Exactly one of params.run, params.epic, or params.id is required; \
                       params.id resolves either kind and answers with candidates when it \
                       cannot; use work_list to enumerate every id.",
        meta = overview_tool_meta()
    )]
    pub async fn overview(&self, args: Parameters<OverviewArgs>) -> CallToolResult {
        self.call_structured("overview", args.0.into_envelope())
            .await
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
        description = "Revoke and stop ONE provider attempt: confirmed death, terminal \
                       `stopped`, the bead's bd lease left where it is. Returns attemptId, \
                       runId, state and the reconcile report."
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

    /// Backfill usage for runs that settled before capture recorded it.
    #[tool(
        name = "usage_ingest",
        description = "Re-derive usage from packet captures; idempotent."
    )]
    pub async fn usage_ingest(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("usage_ingest", args.0).await
    }

    /// Paged event listing (the `_tail` name is historical).
    #[tool(name = "events_tail", description = "List ledger events, paged.")]
    pub async fn events_tail(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("events_tail", args.0).await
    }

    /// The discovery surface — the one tool that needs no id.
    #[tool(
        name = "work_list",
        description = "List all forged work — every slice run and every started epic, live and \
                       historical, each labelled slice or epic. Takes no id: this is how a \
                       caller with no prior knowledge discovers the ids the other tools require."
    )]
    pub async fn work_list(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("work_list", args.0).await
    }
}

#[tool_handler(router = self.tool_router)]
impl ServerHandler for ForgedServer {
    fn get_info(&self) -> ServerInfo {
        // ServerInfo::default() then mutate — the adjudicated idiom.
        let mut info = ServerInfo::default();
        let mut ui = JsonObject::new();
        ui.insert("mimeTypes".to_owned(), serde_json::json!([APP_MIME]));
        let mut extensions = ExtensionCapabilities::new();
        extensions.insert("io.modelcontextprotocol/ui".to_owned(), ui);
        info.capabilities = ServerCapabilities::builder()
            .enable_tools()
            .enable_resources()
            .enable_extensions_with(extensions)
            .build();
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

    async fn list_resources(
        &self,
        _request: Option<PaginatedRequestParams>,
        _context: RequestContext<RoleServer>,
    ) -> Result<ListResourcesResult, ErrorData> {
        Ok(ListResourcesResult::with_all_items(vec![Resource::new(
            OVERVIEW_URI,
            "forged-overview",
        )
        .with_title("Forged Control Plane")
        .with_description("View-only projection of Forged slice and epic execution.")
        .with_mime_type(APP_MIME)]))
    }

    async fn read_resource(
        &self,
        request: ReadResourceRequestParams,
        _context: RequestContext<RoleServer>,
    ) -> Result<ReadResourceResponse, ErrorData> {
        if request.uri != OVERVIEW_URI {
            return Err(ErrorData::resource_not_found(
                format!("unknown forged resource {:?}", request.uri),
                None,
            ));
        }
        Ok(ReadResourceResult::new(vec![
            ResourceContents::text(OVERVIEW_HTML, OVERVIEW_URI).with_mime_type(APP_MIME)
        ])
        .into())
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
