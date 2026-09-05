//! `forged mcp` — the rmcp stdio server. Lead tools take flat arguments while
//! machine and operator tools retain the operation envelope for one release;
//! every tool returns the same operation envelope out and
//! routes through the identical core dispatch the CLI uses, so the two
//! surfaces are two adapters over one core. The CLI-only set is generated in
//! the operation-surface manifest rather than repeated here.
//!
//! rmcp 3.x idioms (operator-adjudicated): `ContentBlock` for tool results,
//! `ServerInfo::default()` then mutate for the server declaration, and the
//! `tool_router` macro for tool registration.

use std::collections::BTreeSet;
use std::sync::Arc;

use rmcp::handler::server::router::tool::ToolRouter;
use rmcp::handler::server::wrapper::Parameters;
use rmcp::model::{
    CacheScope, CallToolResult, ContentBlock, ErrorData, ExtensionCapabilities, JsonObject,
    ListResourcesResult, ListToolsResult, MetaObject, PaginatedRequestParams,
    ReadResourceRequestParams, ReadResourceResponse, ReadResourceResult, Resource,
    ResourceContents, ResultType, ServerCapabilities, ServerInfo,
};
use rmcp::schemars::JsonSchema;
use rmcp::service::{RequestContext, RoleServer};
use rmcp::{tool, tool_handler, tool_router, ServerHandler, ServiceExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use forged_types::OperationRequest;

use crate::cli::McpAudienceArg;
use crate::config::ForgedConfig;
use crate::core::{derive_key, dispatch, err_response, migrate_legacy_state, Ctx, Failure};
use crate::surface::{mcp_audience, McpAudience};

const OVERVIEW_URI: &str = "ui://forged/overview.html";
const OPERATIONS_OVERVIEW_URI: &str = "ui://forged/operations-overview.html";
const WORK_DETAIL_URI: &str = "ui://forged/work-detail.html";
const WORK_MAP_URI: &str = "ui://forged/work-map.html";
const AGENT_SESSIONS_URI: &str = "ui://forged/agent-sessions.html";
const APP_MIME: &str = "text/html;profile=mcp-app";
const OVERVIEW_HTML: &str = include_str!("../assets/overview.html");
const OPERATIONS_OVERVIEW_HTML: &str = include_str!("../assets/operations-overview.html");
const WORK_DETAIL_HTML: &str = include_str!("../assets/work-detail.html");
const WORK_MAP_HTML: &str = include_str!("../assets/work-map.html");
const AGENT_SESSIONS_HTML: &str = include_str!("../assets/agent-sessions.html");
const SERVER_INSTRUCTIONS: &str = "\
The work id is the only handle; every id resolves through `explain`.\n\
Start with `next` for a repository.\n\
Use `explain --id` for one subject.\n\
Responses carry `subject`, `health`, and `next`; action classes are should, can, and repair.\n\
Refusals carry `error.detail.remedy`.\n\
Reads take flat arguments and their keys derive automatically.\n\
Writes require `idempotencyKey` only where the manifest says explicit key.\n\
Lists are bounded with `coverage`; request bodies only when needed.\n\
Lifecycle stages are drafted, critiqued, adjudicated, ready, dispatched, deciding, reviewed, landed, closed.\n\
`reused: true` means the response was replayed.";

fn app_tool_meta(uri: &str) -> MetaObject {
    let mut meta = MetaObject::new();
    meta.insert("ui".to_owned(), serde_json::json!({"resourceUri": uri}));
    // Pre-standard hosts used this flat spelling. Keeping both is harmless
    // and lets the same binary progressively enhance older Apps clients.
    meta.insert("ui/resourceUri".to_owned(), Value::String(uri.to_owned()));
    meta
}

fn overview_tool_meta() -> MetaObject {
    app_tool_meta(OVERVIEW_URI)
}

fn operations_overview_tool_meta() -> MetaObject {
    app_tool_meta(OPERATIONS_OVERVIEW_URI)
}

fn work_detail_tool_meta() -> MetaObject {
    app_tool_meta(WORK_DETAIL_URI)
}

fn work_map_tool_meta() -> MetaObject {
    app_tool_meta(WORK_MAP_URI)
}

fn agent_sessions_tool_meta() -> MetaObject {
    app_tool_meta(AGENT_SESSIONS_URI)
}

fn lead_tool_meta() -> MetaObject {
    let mut meta = MetaObject::new();
    meta.insert("audience".to_owned(), Value::String("lead".to_owned()));
    meta
}

fn app_resource_meta() -> MetaObject {
    let mut meta = MetaObject::new();
    meta.insert(
        "ui".to_owned(),
        serde_json::json!({
            "csp": {
                "baseUriDomains": [],
                "connectDomains": [],
                "frameDomains": [],
                "resourceDomains": [],
            },
            "permissions": {},
            "prefersBorder": true,
        }),
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
    /// The idempotency key; derived (mutating) or defaulted (read-only) when
    /// absent. Explicit-key exceptions are generated in the surface manifest.
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

/// Flat parameters for a lead read. The arbitrary map preserves the existing
/// core validation while removing every operation-envelope field from the
/// public schema.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase")]
pub struct LeadReadArgs {
    #[serde(flatten)]
    pub params: serde_json::Map<String, Value>,
}

/// Flat parameters for a lead write. Only writes advertise the optional
/// caller key; operations that require one explicitly remain outside the lead
/// audience in this release.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase")]
pub struct LeadWriteArgs {
    /// Optional caller operation identity; otherwise the CLI-equivalent key is derived.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    #[serde(flatten)]
    pub params: serde_json::Map<String, Value>,
}

fn flat_run_id(name: &str, params: &serde_json::Map<String, Value>) -> Option<String> {
    let key = match name {
        "run_start" => return None,
        "run_retry" => "id",
        "run_status"
        | "run_stop"
        | "run_submit"
        | "run_accept_risk"
        | "run_adjudicate_settlement"
        | "run_revise_roster"
        | "run_revise_policy"
        | "session_message" => "run",
        "epic_preflight" | "epic_start" | "epic_submit" | "epic_status" | "epic_pause"
        | "epic_resume" | "epic_resolve" | "epic_revise_roster" | "epic_revise_policy" => "epic",
        "session_list" => {
            return params
                .get("run")
                .or_else(|| params.get("id"))
                .and_then(Value::as_str)
                .map(str::to_owned)
        }
        "usage_report" => "run",
        "attention_acknowledge" | "attention_resolve" | "attention_reopen" => "subjectId",
        _ => return None,
    };
    params.get(key).and_then(Value::as_str).map(str::to_owned)
}

fn flat_envelope(
    name: &str,
    idempotency_key: Option<String>,
    params: serde_json::Map<String, Value>,
) -> Result<EnvelopeArgs, Failure> {
    if params.contains_key("schemaVersion") || params.contains_key("params") {
        let flat_fields = params
            .get("params")
            .and_then(Value::as_object)
            .map(|nested| {
                nested
                    .keys()
                    .map(|field| format!("{field:?}"))
                    .collect::<Vec<_>>()
                    .join(", ")
            })
            .filter(|fields| !fields.is_empty())
            .unwrap_or_else(|| "the tool's argument fields".to_owned());
        return Err(Failure::invalid(format!(
            "{name} takes flat arguments; omit legacy envelope fields \"schemaVersion\" and \
             \"params\", and pass {flat_fields} directly at the top level"
        )));
    }

    for key in [
        "run",
        "epic",
        "id",
        "subjectId",
        "subjectKind",
        "bead",
        "repo",
    ] {
        match params.get(key) {
            None => {}
            Some(Value::String(value)) if !value.is_empty() => {}
            Some(_) => {
                return Err(Failure::invalid(format!(
                    "{name} flat selector {key:?} must be a non-empty string"
                )))
            }
        }
    }
    for key in ["profile", "roster", "runId", "baseRef"] {
        match params.get(key) {
            None | Some(Value::Null | Value::String(_)) => {}
            Some(other) => {
                return Err(Failure::invalid(format!(
                    "{name} flat argument {key:?} must be a string when present, got {other}"
                )))
            }
        }
    }

    Ok(EnvelopeArgs {
        schema_version: 1,
        idempotency_key,
        run_id: flat_run_id(name, &params),
        params,
    })
}

impl LeadReadArgs {
    fn into_envelope(self, name: &str) -> Result<EnvelopeArgs, Failure> {
        flat_envelope(name, None, self.params)
    }
}

impl LeadWriteArgs {
    fn into_envelope(self, name: &str) -> Result<EnvelopeArgs, Failure> {
        flat_envelope(name, self.idempotency_key, self.params)
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

/// `overview` parameters. At most one of `run`, `epic`, or `id`; all three
/// absent projects the portfolio, and `after`/`limit` page the event tail of
/// whichever subject was named.
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
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OverviewParams {
    /// Project one slice run, by run id.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub run: Option<String>,
    /// Project one epic and its child runs, by epic run id.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub epic: Option<String>,
    /// Project whichever of the two this id names, without saying which;
    /// an id that resolves to no single subject returns candidates.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub id: Option<String>,
    /// Optional namespace disambiguator for `id`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subject_kind: Option<WorkDetailKind>,
    /// Return only event rows with an eventId greater than this
    /// (default 0).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub after: Option<i64>,
    /// Maximum event rows, 1..=1000 (summary default 30; full default 100).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    /// Projection detail; omission is summary and full restores the v0.7.1 body.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<ProjectionDetailParam>,
    /// Include symptom attention items where this projection carries an attention rail.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub symptoms: bool,
}

/// Closed projection detail accepted by bounded read surfaces.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum ProjectionDetailParam {
    Summary,
    Full,
}

/// A scope key that is PRESENT must name something.
///
/// `#[serde(default)]` alone maps both an absent key and an explicit `null`
/// to `None`, and `into_envelope` then omits it — so `{"run": null}` reaches
/// the core as `{}`. Before the portfolio existed that was harmless, because
/// the core refused a scopeless request outright. It is not harmless now: the
/// same call silently WIDENS from one run to the entire inventory, which is
/// the last thing a caller who wrote a scope key wants.
///
/// serde only calls this when the key is present, so an absent key still
/// defaults to `None` and a null one is refused as `invalid_params` before
/// dispatch — the same typed boundary `after` and `limit` already sit on.
fn present_means_named<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: rmcp::serde::Deserializer<'de>,
{
    use rmcp::serde::Deserialize as _;
    String::deserialize(deserializer).map(Some)
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

/// Exact-only cross-kind selector; run and epic ids also retain unique-prefix
/// resolution after every exact namespace has missed.
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ExplainArgs {
    #[serde(deserialize_with = "named_string")]
    pub id: String,
    /// Optional namespace disambiguator.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subject_kind: Option<WorkDetailKind>,
}

impl ExplainArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let run_id = Some(self.id.clone());
        let params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key: None,
            run_id,
            params,
        }
    }
}

fn default_wait_until() -> WaitUntilParam {
    WaitUntilParam::Stage
}

fn default_wait_timeout() -> i64 {
    240
}

/// Condition that releases `wait`.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum WaitUntilParam {
    Decision,
    Stage,
    Terminal,
}

/// One blocking wait over an exact operator-visible subject.
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WaitArgs {
    #[serde(deserialize_with = "named_string")]
    pub id: String,
    /// Condition that releases the call; defaults to stage.
    #[serde(default = "default_wait_until")]
    pub until: WaitUntilParam,
    /// Seconds before returning changed false; defaults to 240, maximum 3600.
    #[serde(default = "default_wait_timeout")]
    pub timeout: i64,
}

impl WaitArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let run_id = Some(self.id.clone());
        let params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key: None,
            run_id,
            params,
        }
    }
}

/// Composable exact scopes for `work_list`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkListArgs {
    /// Exact repository identity from work `metadata.repository`.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub repo: Option<String>,
    /// Exact work status.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub status: Option<String>,
    /// Exact custody holder.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub assignee: Option<String>,
    /// Maximum rows across all groups, 1..=200 (default 30).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    /// Projection detail; omission is summary.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<ProjectionDetailParam>,
}

impl WorkListArgs {
    /// Project onto the shared envelope, omitting an absent repository so it
    /// remains byte-compatible with the operator-wide request.
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key: None,
            run_id: None,
            params,
        }
    }
}

/// The only opt-in detail level accepted by `work_ready`.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum WorkReadyDetailParam {
    Full,
}

/// Projection detail and collection bound accepted by `work_ready`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkReadyArgs {
    /// Exact repository identity from work `metadata.repository`.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub repo: Option<String>,
    /// Opaque continuation cursor returned by the preceding page.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    /// Complete snapshots when full; omission returns summary rows.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<WorkReadyDetailParam>,
    /// Maximum ready items, 1..=500 (default 100).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    /// Return the complete frontier or refuse when it exceeds 500 items.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub all: bool,
}

impl WorkReadyArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key: None,
            run_id: None,
            params,
        }
    }
}

/// Closed annotation kind advertised by the MCP schema.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum WorkNoteKindParam {
    Comment,
    Critique,
    Recommendation,
    Adjudication,
    Decision,
    Retro,
}

/// Flat parameters for one immutable annotation.
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkNoteAddArgs {
    /// Optional caller operation identity; otherwise a canonical payload-derived key is used.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub idempotency_key: Option<String>,
    /// Existing work item id.
    pub id: String,
    /// Closed annotation kind.
    pub kind: WorkNoteKindParam,
    /// Raw JSON text; the ledger stores its canonical rendering.
    pub body_json: String,
    /// Payload schema wire name; typed kinds default to their v1 contract, others to `<kind>/0`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<String>,
    /// Writing identity; omission stores `operator`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actor: Option<String>,
}

impl WorkNoteAddArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let idempotency_key = self.idempotency_key.clone();
        let mut params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        params.remove("idempotencyKey");
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key,
            run_id: None,
            params,
        }
    }
}

/// Exact annotation selector and collection bound.
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkNoteListArgs {
    /// Existing work item id.
    pub id: String,
    /// Optional exact annotation kind.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kind: Option<WorkNoteKindParam>,
    /// Maximum notes, 1..=500 (default 100).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
}

impl WorkNoteListArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key: None,
            run_id: None,
            params,
        }
    }
}

/// Closed attempt activity exposed in MCP discovery. These values are
/// intentionally distinct from Herdr's `working`/`unknown` lifecycle.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "kebab-case")]
pub enum SessionInventoryActivityParam {
    Running,
    Revoking,
    Completed,
    Failed,
    Reclaimed,
    Stopped,
}

/// Typed MCP envelope for the bounded provider-session inventory.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SessionInventoryArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// Optional read-only operation identity.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// Retained for envelope compatibility; inventory is operator-wide.
    #[serde(default)]
    pub run_id: Option<String>,
    /// Canonical filters and keyset pagination.
    #[serde(default)]
    pub params: SessionInventoryParams,
}

#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SessionInventoryParams {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub run: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub epic: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repository: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub provider: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub activity: Option<SessionInventoryActivityParam>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub include_historical: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl SessionInventoryArgs {
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

/// Closed work-history bucket exposed in MCP discovery.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum WorkHistoryBucketParam {
    Hour,
    Day,
    Week,
}

/// Closed work-history grouping dimension exposed in MCP discovery.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum WorkHistoryGroupParam {
    None,
    Repository,
    Epic,
    Stage,
    Provider,
}

/// Typed MCP envelope for the bounded history projection.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// Optional read-only operation identity.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// Retained for envelope compatibility; history is operator-wide.
    #[serde(default)]
    pub run_id: Option<String>,
    /// Bounded history query.
    #[serde(default)]
    pub params: WorkHistoryParams,
}

/// Closed, bounded history parameters. Display titles are deliberately
/// absent: every filter is a canonical id.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryParams {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub from: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub to: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bucket: Option<WorkHistoryBucketParam>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub group_by: Option<WorkHistoryGroupParam>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repo: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub epic: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subject: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl WorkHistoryArgs {
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

/// Typed envelope for the bounded Operations App.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OperationsOverviewArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// The idempotency key; defaulted to `op:operations_overview:read`.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// Operations projection parameters.
    #[serde(default)]
    pub params: OperationsOverviewParams,
}

/// Filters accepted by `operations_overview`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OperationsOverviewParams {
    /// Exact durable repository identity.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub repo: Option<String>,
    /// Queue group code: needs-me, ready-to-merge, running,
    /// stalled-or-recoverable, or planned.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub group: Option<String>,
    /// Source code: durable or live-plan.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub source: Option<String>,
    /// Maximum rows across all groups, 1..=200 (default 30).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    /// Projection detail; omission is summary.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<ProjectionDetailParam>,
    /// Include symptom items in the top-level attention projection.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub symptoms: bool,
}

impl OperationsOverviewArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self.params) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: self.schema_version,
            idempotency_key: self.idempotency_key,
            run_id: None,
            params,
        }
    }
}

/// Scope and bounded expansion accepted by `next`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NextArgs {
    /// Exact canonical repository root. Mutually exclusive with `id`.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub repo: Option<String>,
    /// Exact epic id. Mutually exclusive with `repo`.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub id: Option<String>,
    /// Include bounded symptom rows; omission retains only their hidden count.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub symptoms: bool,
    /// Widen one section; decisions also includes full next-action arrays.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub section: Option<NextSectionParam>,
    /// Widened section limit, 1..=500. Requires `section`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
}

#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum NextSectionParam {
    Decisions,
    Running,
    Ready,
    Landed,
}

impl NextArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key: None,
            run_id: None,
            params,
        }
    }
}

/// Closed custody-state scope exposed by `attention_list`.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "kebab-case")]
pub enum AttentionListStateParam {
    /// Open plus acknowledged (the default).
    Active,
    /// Open only, excluding acknowledged.
    Open,
    /// Every occurrence, including resolved.
    All,
}

/// Closed attention classification exposed by `attention_list`.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "kebab-case")]
pub enum AttentionListClassParam {
    Decision,
    Symptom,
}

/// Filters accepted by `attention_list`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionListArgs {
    /// Exact durable repository identity.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub repo: Option<String>,
    /// Custody-state scope: active (open plus acknowledged, the default),
    /// open, or all.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub state: Option<AttentionListStateParam>,
    /// Exact attention condition.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub condition: Option<String>,
    /// Class filter: decision or symptom.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub classification: Option<AttentionListClassParam>,
    /// Maximum items across all groups, 1..=500 (default 100).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
}

impl AttentionListArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: 1,
            idempotency_key: None,
            run_id: None,
            params,
        }
    }
}

/// Closed Work Map scope exposed in MCP discovery.
#[derive(Debug, Default, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "kebab-case")]
pub enum WorkMapScopeParam {
    /// All operator-scoped work.
    #[default]
    Operator,
    /// Work for one exact canonical repository path.
    Repository,
    /// Work for one exact epic id.
    Epic,
}

/// Closed Operations group exposed by Work Map.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "kebab-case")]
pub enum WorkMapGroupParam {
    NeedsMe,
    ReadyToMerge,
    Running,
    StalledOrRecoverable,
    Planned,
}

/// Closed Work Map authority source.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "kebab-case")]
pub enum WorkMapSourceParam {
    Durable,
    LivePlan,
}

/// Closed canonical Work Map reference kind.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum WorkMapRefKindParam {
    Plan,
    Run,
    Epic,
}

/// Complete canonical focus coordinate for Work Map.
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapFocusParam {
    /// Contract discriminator; must be `forged.work-ref/1`.
    #[serde(deserialize_with = "named_string")]
    pub schema: String,
    /// Exact node kind.
    pub kind: WorkMapRefKindParam,
    /// Exact canonical node id.
    #[serde(deserialize_with = "named_string")]
    pub id: String,
}

/// Typed MCP envelope for the bounded Work Map App.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// Optional read-only operation identity.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// Closed, bounded map query.
    #[serde(default)]
    pub params: WorkMapParams,
}

/// Closed parameters accepted by `work_map`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapParams {
    /// Operator, repository, or epic scope.
    #[serde(default)]
    pub scope: WorkMapScopeParam,
    /// Exact canonical repository path for repository scope.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub repository: Option<String>,
    /// Exact epic id for epic scope.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub epic_id: Option<String>,
    /// Optional canonical Operations queue group.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub group: Option<WorkMapGroupParam>,
    /// Optional authority source.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source: Option<WorkMapSourceParam>,
    /// Inclusive RFC3339 UTC history lower bound.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub from: Option<String>,
    /// Exclusive RFC3339 UTC history upper bound.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub to: Option<String>,
    /// Maximum graph nodes, 1..=500 (default 250).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_nodes: Option<u64>,
    /// Optional complete canonical node focus.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub focus: Option<WorkMapFocusParam>,
}

impl WorkMapArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        let params = match serde_json::to_value(&self.params) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: self.schema_version,
            idempotency_key: self.idempotency_key,
            run_id: None,
            params,
        }
    }
}

/// Closed durable subject kind accepted by `work_detail`.
#[derive(Debug, Serialize, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "lowercase")]
pub enum WorkDetailKind {
    /// One authoritative work item.
    Work,
    /// One slice run.
    Run,
    /// One epic.
    Epic,
    /// One provider attempt.
    Attempt,
    /// One operator-attention item.
    Attention,
}

/// Typed envelope for the Work Detail App.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkDetailArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// The idempotency key; defaulted to `op:work_detail:read`.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// Addressed detail target and event page.
    pub params: WorkDetailParams,
}

/// Addressed target for `work_detail`: EXACTLY one form — the legacy exact
/// `subjectKind`/`subjectId` pair, or `id` with an optional `subjectKind`
/// disambiguator. Sending both ids, or a half legacy pair, is refused.
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkDetailParams {
    /// Exact legacy subject kind, or an optional `id` disambiguator.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subject_kind: Option<WorkDetailKind>,
    /// Canonical run or epic id; travels only with `subjectKind`.
    #[serde(
        default,
        deserialize_with = "named_string_opt",
        skip_serializing_if = "Option::is_none"
    )]
    pub subject_id: Option<String>,
    /// Any operator-visible id resolved by the shared resolver. An exact id
    /// beats any prefix; unresolved ids return `resolution` candidates.
    #[serde(
        default,
        deserialize_with = "named_string_opt",
        skip_serializing_if = "Option::is_none"
    )]
    pub id: Option<String>,
    /// Return event rows after this event id (default 0).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub after: Option<i64>,
    /// Maximum event rows, 1..=1000 (default 100).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    /// Projection detail; omission is summary and full restores the v0.7.1 body.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<ProjectionDetailParam>,
    /// Include symptom attention items where this projection carries an attention rail.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub symptoms: bool,
}

fn named_string<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: rmcp::serde::Deserializer<'de>,
{
    use rmcp::serde::Deserialize as _;
    let value = String::deserialize(deserializer)?;
    if value.trim().is_empty() {
        return Err(rmcp::serde::de::Error::custom("must name a subject"));
    }
    Ok(value)
}

/// [`named_string`] over an OPTIONAL field: serde only calls this when the
/// key is present, so an absent key still defaults to `None` while a
/// present-but-unnamed value stays a deserialize-time refusal.
fn named_string_opt<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: rmcp::serde::Deserializer<'de>,
{
    named_string(deserializer).map(Some)
}

impl WorkDetailArgs {
    fn into_envelope(self) -> EnvelopeArgs {
        // The subject id or the bare id, whichever addressing form is
        // present; the core refuses a call carrying neither or both.
        let run_id = self
            .params
            .subject_id
            .clone()
            .or_else(|| self.params.id.clone());
        let params = match serde_json::to_value(&self.params) {
            Ok(Value::Object(map)) => map,
            _ => serde_json::Map::new(),
        };
        EnvelopeArgs {
            schema_version: self.schema_version,
            idempotency_key: self.idempotency_key,
            run_id,
            params,
        }
    }
}

/// The lazy ledger gate: durable state is created only by operator intent,
/// never by a host handshaking this server. "Uninitialized" is decided
/// fresh on every call — latched in neither direction — by a
/// `config.db_path` existence precheck AND, authoritatively, by the
/// no-create open itself: a ledger deleted after the precheck fails that
/// call instead of being silently re-created blank (the precheck alone
/// would race with deletion). A successful open (with legacy-state
/// migration completed before any dispatch observes the ledger) latches
/// once for the mount's lifetime. The LEDGER latches; the CONFIG does not:
/// every call re-fingerprints the config file so this long-lived surface
/// serves the same file-derived truth a fresh CLI process would.
struct McpState {
    /// The mount's identity anchors; never reloaded.
    config: ForgedConfig,
    /// The last-good resolved config snapshot. Like "uninitialized", config
    /// content is decided fresh on every call — latched in neither
    /// direction — so a mid-session edit to rosters, profiles, pricing, or
    /// admission is served without a remount. Identity anchors never
    /// reload (see [`ForgedConfig::reload`]).
    live: std::sync::Mutex<Arc<ForgedConfig>>,
    ledger: tokio::sync::OnceCell<forged_ledger::Ledger>,
    #[cfg(test)]
    opens: std::sync::atomic::AtomicUsize,
}

impl McpState {
    fn new(config: ForgedConfig) -> Self {
        Self {
            live: std::sync::Mutex::new(Arc::new(config.clone())),
            config,
            ledger: tokio::sync::OnceCell::new(),
            #[cfg(test)]
            opens: std::sync::atomic::AtomicUsize::new(0),
        }
    }

    /// The per-call config snapshot: unchanged file, cached parse; changed
    /// file, one reload; malformed file, that call's refusal — the operator
    /// can fix the file and the next call recovers.
    fn fresh_config(&self) -> Result<Arc<ForgedConfig>, Failure> {
        let current = self.live.lock().expect("config lock").clone();
        match current.refreshed() {
            Ok(None) => Ok(current),
            Ok(Some(fresh)) => {
                let fresh = Arc::new(fresh);
                *self.live.lock().expect("config lock") = Arc::clone(&fresh);
                Ok(fresh)
            }
            Err(message) => Err(Failure::invalid(message)),
        }
    }

    /// The gate at the two dispatch seams. An uninitialized scope refuses —
    /// creating nothing — until the operator runs `forged init`; a failed
    /// open or migration is that call's failure and the next call retries.
    /// The existence check is only the fast common-case refusal; the
    /// authority is [`McpState::open`]'s no-create open.
    async fn ctx(&self) -> Result<Arc<Ctx>, Failure> {
        let config = self.fresh_config()?;
        // Only PROVEN absence earns the setup guidance; an inspection error
        // (permissions, an unreadable parent) is its own failure — routing
        // it to "run forged init" would send the operator to re-initialize
        // over state that exists.
        match std::fs::metadata(&config.db_path) {
            Ok(_) => {}
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                return Err(self.uninitialized());
            }
            Err(error) => {
                return Err(Failure::internal(format!(
                    "cannot inspect operator state at {}: {error}",
                    config.db_path.display()
                )));
            }
        }
        let ledger = self
            .ledger
            .get_or_try_init(|| self.open(&config))
            .await?
            .clone();
        Ok(Arc::new(Ctx {
            config: (*config).clone(),
            ledger,
        }))
    }

    /// The uninitialized-scope refusal: the session mount's answer wherever
    /// it would otherwise have to create durable state.
    fn uninitialized(&self) -> Failure {
        Failure::invalid(format!(
            "operator state does not exist at {}; a session mount creates \
             nothing — initialize it deliberately with `forged init` or \
             /forged:setup",
            self.config.db_path.display()
        ))
    }

    async fn open(&self, config: &Arc<ForgedConfig>) -> Result<forged_ledger::Ledger, Failure> {
        #[cfg(test)]
        self.opens.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        let db_path = config.db_path.clone();
        let opened = tokio::task::spawn_blocking(move || {
            crate::failpoint::hit("mcp.ledger.open.before");
            forged_ledger::Ledger::open_existing(&db_path)
        })
        .await
        .map_err(|e| Failure::internal(format!("blocking task join failure: {e}")))?
        .map_err(|e| Failure::internal(format!("cannot open ledger: {e}")))?;
        // The precheck passed but the ledger vanished before the open: the
        // no-create open is the authority, so the race refuses exactly as
        // the check would have — creating nothing.
        let Some(ledger) = opened else {
            return Err(self.uninitialized());
        };
        let ctx = Arc::new(Ctx {
            config: (**config).clone(),
            ledger,
        });
        if let Err(failure) = migrate_legacy_state(&ctx).await {
            // A half-initialized mount must not leak the writer thread: the
            // retrying call reopens from scratch.
            let _ = ctx.ledger.clone().close();
            return Err(failure);
        }
        Ok(ctx.ledger.clone())
    }
}

/// The forged MCP server: a thin adapter over the shared core.
#[derive(Clone)]
pub struct ForgedServer {
    state: Arc<McpState>,
    audience: McpAudienceArg,
    tool_router: ToolRouter<Self>,
}

impl ForgedServer {
    /// Build the server over the once-read config; the ledger stays shut
    /// until a tool call needs it.
    fn new(state: Arc<McpState>, audience: McpAudienceArg) -> Self {
        Self {
            state,
            audience,
            tool_router: Self::tool_router(),
        }
    }

    fn lists_tool(&self, name: &str) -> bool {
        match self.audience {
            McpAudienceArg::All => true,
            McpAudienceArg::Lead => mcp_audience(name) == Some(McpAudience::Lead),
            McpAudienceArg::Machine => mcp_audience(name) == Some(McpAudience::Machine),
            McpAudienceArg::Operator => mcp_audience(name) == Some(McpAudience::Operator),
        }
    }

    async fn respond(&self, name: &str, args: EnvelopeArgs) -> forged_types::OperationResponse {
        let req = args.into_request();
        match self.state.ctx().await {
            Ok(ctx) => dispatch(&ctx, name, req).await,
            // An explicitly supplied idempotency key is echoed even on the
            // gate's refusal — operationId is a pinned wire-shape contract,
            // and only a keyless request falls back to the derived form.
            Err(failure) => {
                let key = if crate::core::key_absent(&req) {
                    derive_key(name, req.run_id.as_deref(), None, None)
                } else {
                    req.idempotency_key.clone()
                };
                err_response(&key, &failure)
            }
        }
    }

    async fn call(&self, name: &str, args: EnvelopeArgs) -> CallToolResult {
        let resp = self.respond(name, args).await;
        Self::tool_result(resp, false)
    }

    async fn call_structured(&self, name: &str, args: EnvelopeArgs) -> CallToolResult {
        let resp = self.respond(name, args).await;
        Self::tool_result(resp, true)
    }

    async fn call_lead_read(&self, name: &str, args: LeadReadArgs) -> CallToolResult {
        match args.into_envelope(name) {
            Ok(args) => self.call(name, args).await,
            Err(failure) => {
                Self::tool_result(err_response(&crate::core::read_key(name), &failure), false)
            }
        }
    }

    async fn call_lead_write(&self, name: &str, args: LeadWriteArgs) -> CallToolResult {
        let refusal_key = args
            .idempotency_key
            .clone()
            .filter(|key| !key.is_empty())
            .unwrap_or_else(|| {
                derive_key(name, flat_run_id(name, &args.params).as_deref(), None, None)
            });
        match args.into_envelope(name) {
            Ok(args) => self.call(name, args).await,
            Err(failure) => Self::tool_result(err_response(&refusal_key, &failure), false),
        }
    }

    fn tool_result(
        resp: forged_types::OperationResponse,
        include_structured: bool,
    ) -> CallToolResult {
        let is_error = !resp.ok;
        let structured =
            include_structured.then(|| serde_json::to_value(&resp).unwrap_or(Value::Null));
        let text = serde_json::to_string(&resp)
            .unwrap_or_else(|e| format!("{{\"ok\":false,\"error\":\"unserializable: {e}\"}}"));
        let mut result = if is_error {
            CallToolResult::error(vec![ContentBlock::text(text)])
        } else {
            CallToolResult::success(vec![ContentBlock::text(text)])
        };
        result.structured_content = structured;
        result
    }
}

/// Return the registered tool names without constructing a server transport.
pub(crate) fn tool_names() -> BTreeSet<String> {
    ForgedServer::tool_router()
        .list_all()
        .into_iter()
        .map(|tool| tool.name.into_owned())
        .collect()
}

#[tool_router(router = tool_router)]
impl ForgedServer {
    /// Environment probes: bd, ledger, gh, providers, herdr.
    #[tool(name = "doctor", description = "Run the forged environment probes.")]
    pub async fn doctor(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("doctor", args.0).await
    }

    /// Resolve and validate a profile/roster selection.
    #[tool(
        name = "definition_validate",
        description = "Resolve and validate an execution definition."
    )]
    pub async fn definition_validate(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("definition_validate", args.0).await
    }

    /// Start a run for a work item.
    #[tool(name = "run_start", description = "Create a run for a work item.")]
    pub async fn run_start(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("run_start", args.0).await
    }

    /// Re-execute a terminal run on the same Work's current revision.
    #[tool(
        name = "run_retry",
        description = "Mint and submit a fresh successor for a terminal non-landed run. Uses current Work revision and live execution config; the successor receives a fresh restart budget."
    )]
    pub async fn run_retry(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("run_retry", args.0).await
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
    pub async fn run_submit(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("run_submit", args.0).await
    }

    /// Read-only run projection.
    #[tool(
        name = "run_status",
        description = "Project a run's current state and honesty-tested nextActions."
    )]
    pub async fn run_status(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("run_status", args.0).await
    }

    /// Stop and settle a complete run.
    #[tool(
        name = "run_stop",
        description = "Stop every live attempt and settle the run as clean, blocked, input-required, cancelled, superseded, or landed. Landed requires PR and exact SHA evidence."
    )]
    pub async fn run_stop(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("run_stop", args.0).await
    }

    /// Explicitly destructive settlement or review-budget lead finish.
    #[tool(
        name = "run_adjudicate_settlement",
        description = "Explicitly destructive: settle an abandoned run whose controller lacks durable driver identity, or finish a review-budget-exhausted run as landed with lead-supplied PR and SHA evidence. Records actor, rationale, and the machine evidence gap as a durable adjudication event; refuses uncontained machine effects."
    )]
    pub async fn run_adjudicate_settlement(
        &self,
        args: Parameters<LeadWriteArgs>,
    ) -> CallToolResult {
        self.call_lead_write("run_adjudicate_settlement", args.0)
            .await
    }

    /// Append an explicit roster revision.
    #[tool(
        name = "run_revise_roster",
        description = "Append a validated roster revision for a run."
    )]
    pub async fn run_revise_roster(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("run_revise_roster", args.0).await
    }

    #[tool(
        name = "run_revise_policy",
        description = "Append a config-sourced operational-policy revision for a run."
    )]
    pub async fn run_revise_policy(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("run_revise_policy", args.0).await
    }

    /// Accept the final deduplicated findings after a terminal review failure.
    #[tool(
        name = "run_accept_risk",
        description = "Record an operator's auditable accepted-risk decision after a terminal non-approve review outcome."
    )]
    pub async fn run_accept_risk(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("run_accept_risk", args.0).await
    }

    /// Read-only rehearsal of `epic_start`.
    #[tool(
        name = "epic_preflight",
        description = "Rehearse epic_start read-only: every start check plus the identity tuple it would freeze, with nothing created. Required: epic, repo; optional baseRef, profile, roster, rolling."
    )]
    pub async fn epic_preflight(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("epic_preflight", args.0).await
    }

    /// Freeze an epic inventory and child execution defaults.
    #[tool(name = "epic_start", description = "Start a durable work epic run.")]
    pub async fn epic_start(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_start", args.0).await
    }

    /// Authorize an epic for the supervisor's ore pass.
    #[tool(
        name = "epic_submit",
        description = "Submit an epic for supervisor-owned frontier reconciliation."
    )]
    pub async fn epic_submit(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_submit", args.0).await
    }

    /// Project an epic frontier, child runs, blockers, and PR state.
    #[tool(name = "epic_status", description = "Project durable epic state.")]
    pub async fn epic_status(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("epic_status", args.0).await
    }

    /// Pause an epic at its current durable boundary.
    #[tool(name = "epic_pause", description = "Pause epic scheduling.")]
    pub async fn epic_pause(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_pause", args.0).await
    }

    /// Resume a paused epic.
    #[tool(name = "epic_resume", description = "Resume epic scheduling.")]
    pub async fn epic_resume(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_resume", args.0).await
    }

    /// Resolve a child-specific input-required stop.
    #[tool(name = "epic_resolve", description = "Resolve held epic child input.")]
    pub async fn epic_resolve(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_resolve", args.0).await
    }

    #[tool(
        name = "epic_revise_roster",
        description = "Append one durable roster revision for current and future epic children."
    )]
    pub async fn epic_revise_roster(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_revise_roster", args.0).await
    }

    #[tool(
        name = "epic_revise_policy",
        description = "Append config-sourced policy revisions for unmerged epic children."
    )]
    pub async fn epic_revise_policy(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_revise_policy", args.0).await
    }

    /// Unified reconnect projection, rendered by the optional MCP App.
    #[tool(
        name = "overview",
        description = "Project one slice or epic as a bounded summary; params.detail=\"full\" \
                       restores diagnostic workers, evidence, and event payloads. \
                       Run status and mapped attention items carry nextActions. \
                       At most one of params.run, params.epic, or params.id is accepted, and \
                       omitting all three projects the portfolio: 30 newest summary rows by \
                       default, with coverage and an attention rail. params.id resolves every \
                       operator-visible id and accepts optional params.subjectKind; it \
                       answers with candidates when it cannot; use work_list to enumerate \
                       every id.",
        meta = overview_tool_meta()
    )]
    pub async fn overview(&self, args: Parameters<OverviewArgs>) -> CallToolResult {
        self.call_structured("overview", args.0.into_envelope())
            .await
    }

    /// Kind-blind reconnect explanation for any durable id.
    #[tool(
        name = "explain",
        description = "Explain one work item, run, epic, attempt, or attention id without a kind guess, or disambiguate with subjectKind: bounded identity and lifecycle position, one centralized health verdict with its observed inputs, and existing honesty-tested nextActions. Exact precedence is work item, run or epic, attempt, then attention; only run and epic ids accept a unique prefix."
    )]
    pub async fn explain(&self, args: Parameters<ExplainArgs>) -> CallToolResult {
        self.call_structured("explain", args.0.into_envelope())
            .await
    }

    /// Block until one subject reaches the requested condition.
    #[tool(
        name = "wait",
        description = "Block on one work item, run, or epic until a decision opens, its packet stage changes, or it becomes terminal. until defaults to stage. timeout defaults to 240 seconds and must be between 1 and the maximum 3600 seconds. Returns the current explain projection with changed true when released, or changed false at timeout.",
        annotations(read_only_hint = true, destructive_hint = false, idempotent_hint = true, open_world_hint = false),
        meta = lead_tool_meta()
    )]
    pub async fn wait(&self, args: Parameters<WaitArgs>) -> CallToolResult {
        self.call_structured("wait", args.0.into_envelope()).await
    }

    /// Bounded decision-first lead driver surface.
    #[tool(
        name = "next",
        description = "Orient the lead with one bounded read-only projection: open decisions first, then currently running work, the ready planning frontier, and work landed in the last 24 hours. Defaults to 30 rows and hides symptoms unless symptoms is true. Scope with exact repo or epic id; section plus limit widens only that section. Returns forged.next/1 JSON and no App resource.",
        annotations(read_only_hint = true, destructive_hint = false, idempotent_hint = true, open_world_hint = false),
        meta = lead_tool_meta()
    )]
    pub async fn next(&self, args: Parameters<NextArgs>) -> CallToolResult {
        self.call_structured("next", args.0.into_envelope()).await
    }

    /// Bounded operator queue and live-plan projection.
    #[tool(
        name = "operations_overview",
        description = "Project 30 bounded summary rows by default across planned, queued, active, blocked, and mergeable work. coverage states truncation; params.detail=\"full\" restores diagnostic fields and params.symptoms includes symptom attention items beside decisions. Optional params.repo, params.group, params.source, and params.limit filters never widen on invalid input. Attention items carry honesty-tested nextActions when their recommendation code has a mapped domain verb.",
        meta = operations_overview_tool_meta()
    )]
    pub async fn operations_overview(
        &self,
        args: Parameters<OperationsOverviewArgs>,
    ) -> CallToolResult {
        self.call_structured("operations_overview", args.0.into_envelope())
            .await
    }

    /// Read one stored packet and its attempts.
    #[tool(
        name = "packet_show",
        description = "Show one stored packet and its attempts read-only."
    )]
    pub async fn packet_show(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("packet_show", args.0).await
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

    /// Publish the latest exact durable review snapshot to its slice PR.
    #[tool(
        name = "review_publish",
        description = "Publish an exact durable review snapshot to its recorded slice pull request. params.run is required."
    )]
    pub async fn review_publish(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("review_publish", args.0).await
    }

    /// Verify one immutable attempt manifest without repairing it.
    #[tool(
        name = "artifact_verify",
        description = "Verify one attempt manifest and its content digests read-only."
    )]
    pub async fn artifact_verify(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("artifact_verify", args.0).await
    }

    /// Explicitly compact a proven redundant terminal success.
    #[tool(
        name = "artifact_compact",
        description = "Explicitly compact one eligible successful intermediate attempt."
    )]
    pub async fn artifact_compact(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("artifact_compact", args.0).await
    }

    /// Durable provider-session metadata for any resolved id.
    #[tool(
        name = "session_list",
        description = "List newest provider sessions by run or any id; an epic id includes every child run. subjectKind optionally disambiguates id."
    )]
    pub async fn session_list(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("session_list", args.0).await
    }

    /// Transaction-consistent provider-session inventory across durable work.
    #[tool(
        name = "session_inventory",
        description = "Inventory durable provider attempts across runs and repositories. Read-only; pane ids and confirmed provider-session ids remain distinct.",
        meta = agent_sessions_tool_meta()
    )]
    pub async fn session_inventory(
        &self,
        args: Parameters<SessionInventoryArgs>,
    ) -> CallToolResult {
        self.call_structured("session_inventory", args.0.into_envelope())
            .await
    }

    /// Read recent output from a Herdr-backed session.
    #[tool(name = "session_read", description = "Read a Herdr session pane.")]
    pub async fn session_read(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("session_read", args.0).await
    }

    /// Queue one direct lead instruction for an attempt or run boundary.
    #[tool(
        name = "session_message",
        description = "Queue one direct lead instruction for an attempt or run boundary."
    )]
    pub async fn session_message(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("session_message", args.0).await
    }

    /// Pull one bounded page of messages for the environment-fenced seat.
    #[tool(
        name = "seat_inbox",
        description = "Pull one stored page for the running provider attempt. Identical \
                       attempt/since/bodies/limit values replay that page verbatim; pass \
                       nextSince as since to discover later mail."
    )]
    pub async fn seat_inbox(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("seat_inbox", args.0).await
    }

    /// Acknowledge one message addressed to the environment-fenced seat.
    #[tool(
        name = "seat_ack",
        description = "Acknowledge one message addressed to the running provider attempt."
    )]
    pub async fn seat_ack(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("seat_ack", args.0).await
    }

    /// Record the environment-fenced seat's latest progress snapshot.
    #[tool(
        name = "seat_progress",
        description = "Record a progress snapshot for the running provider attempt."
    )]
    pub async fn seat_progress(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("seat_progress", args.0).await
    }

    /// Send one environment-fenced note directly to the lead.
    #[tool(
        name = "seat_note",
        description = "Send a bounded note from the running provider attempt to the lead."
    )]
    pub async fn seat_note(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("seat_note", args.0).await
    }

    /// Revoke and confirmed-stop one provider attempt.
    #[tool(
        name = "session_stop",
        description = "Revoke and stop ONE provider attempt: confirmed death, terminal \
                       `stopped`, the work item's lease left where it is. Returns attemptId, \
                       runId, state and the reconcile report."
    )]
    pub async fn session_stop(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("session_stop", args.0).await
    }

    /// The stateless resume verb.
    #[tool(
        name = "claim_next",
        description = "Resume a ledger run or claim the next ready work item."
    )]
    pub async fn claim_next(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("claim_next", args.0).await
    }

    /// Run the configured gates in a run's worktree.
    #[tool(
        name = "gate_run",
        description = "Run the configured gates in a run's worktree."
    )]
    pub async fn gate_run(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("gate_run", args.0).await
    }

    /// One reconcile pass over a run.
    #[tool(name = "reconcile", description = "Reconcile a run's live attempts.")]
    pub async fn reconcile(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("reconcile", args.0).await
    }

    /// The read-only usage summary.
    #[tool(name = "usage_report", description = "Summarize recorded usage.")]
    pub async fn usage_report(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("usage_report", args.0).await
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
    #[tool(
        name = "events_tail",
        description = "List ledger events, paged. Use params.id for any operator-visible id and optional params.subjectKind to disambiguate; params.run remains compatible."
    )]
    pub async fn events_tail(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("events_tail", args.0).await
    }

    /// Abandon a started-but-doomed epic.
    #[tool(
        name = "epic_abandon",
        description = "Typed terminal exit for a started epic whose start was structurally \
                       wrong. Arguments: epic, reason. Refuses until epic_pause has durably \
                       paused the current epoch. A fresh epic_start then opens \
                       a clean epoch; started children settle through their own runs."
    )]
    pub async fn epic_abandon(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("epic_abandon", args.0).await
    }

    /// Typed work authoring: create.
    #[tool(
        name = "work_create",
        description = "Create a work item with its revision-1 spec. Arguments: id, title \
                       (required); description, acceptanceCriteria, design, notes, kind \
                       (task|epic), status (open|blocked), priority, metadata (string map)."
    )]
    pub async fn work_create(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_create", args.0).await
    }

    /// Typed work authoring: guarded spec and/or priority update.
    #[tool(
        name = "work_update",
        description = "CAS-fenced update over priority and/or title/description/\
                       acceptanceCriteria/design/notes. Arguments: id, expectedRevision (the \
                       revision you read), optional priority and actor; omitted spec fields \
                       keep their bytes. Priority is coordination state: a priority-only \
                       write leaves revision unchanged; any supplied spec field mints exactly \
                       one revision, including when combined with priority. A moved revision \
                       refuses with BEADS_CONTENTION. Use work_update for open-item changes, \
                       work_promote for blocked/deferred stub promotion, and work_reopen for \
                       closed items."
    )]
    pub async fn work_update(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_update", args.0).await
    }

    /// Stub-only compatibility alias for atomic promotion.
    #[tool(
        name = "work_promote",
        description = "Compatibility alias for one release: atomically promote one blocked or \
                       deferred stub. Arguments: id, \
                       expectedRevision (the revision you read), optional description, \
                       acceptanceCriteria, design, notes, and actor. One fenced operation \
                       mints revision N+1 with cause planning-apply, sets status open, and \
                       appends its coordination event. Concurrent revision drift refuses \
                       with BEADS_CONTENTION. Open items use work_update; closed items use \
                       work_reopen."
    )]
    pub async fn work_promote(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_promote", args.0).await
    }

    /// Atomically bind adjudication dispositions to the resulting revision.
    #[tool(
        name = "work_adjudicate",
        description = "Atomically adjudicate one work specification. Arguments: id, \
                       expectedRevision, bodyJson (a forged.adjudication/1 payload), and \
                       optional title, description, acceptanceCriteria, design, or notes. \
                       A changed spec mints one revision; an unchanged spec does not. The \
                       revision, adjudication note, and accepted status transition commit \
                       together."
    )]
    pub async fn work_adjudicate(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_adjudicate", args.0).await
    }

    /// Park one idle item outside the active planning rails.
    #[tool(
        name = "work_park",
        description = "Park one idle work item. Arguments: id, reason, optional actor. Records \
                       a typed park decision, sets status deferred, and clears any lease \
                       without minting a revision. A nonterminal run or custody refuses with \
                       run stop as the remedy."
    )]
    pub async fn work_park(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_park", args.0).await
    }

    /// Append one immutable work annotation.
    #[tool(
        name = "work_note_add",
        description = "Append evidence about a work specification without changing its \
                       revision or coordination state. Arguments: id, kind (comment | critique | \
                       recommendation | adjudication | decision | retro), bodyJson (raw JSON \
                       string); typed kinds require their v1 payload and schema, while other \
                       omitted schemas default to <kind>/0. actor defaults to operator. Duplicate \
                       keys and non-integer numbers are refused. The legacy approval kind remains \
                       CLI-compatible but is deprecated and intentionally absent from this lead \
                       surface. Closed work items are accepted."
    )]
    pub async fn work_note_add(&self, args: Parameters<WorkNoteAddArgs>) -> CallToolResult {
        self.call("work_note_add", args.0.into_envelope()).await
    }

    /// List immutable work annotations.
    #[tool(
        name = "work_note_list",
        description = "List one work item's append-only evidence ordered by writtenAt then \
                       noteId. Arguments: id; optional kind exact-filter and limit 1..=500 \
                       (default 100). Returns canonical bodyJson bytes with totals.shown/total."
    )]
    pub async fn work_note_list(&self, args: Parameters<WorkNoteListArgs>) -> CallToolResult {
        self.call("work_note_list", args.0.into_envelope()).await
    }

    /// Typed work authoring: dependency edge.
    #[tool(
        name = "work_link",
        description = "Add one dependency edge. Arguments: fromId, toId, kind (blocks | \
                       parent-child | related | discovered-from | supersedes; default \
                       blocks). Only blocks edges gate readiness."
    )]
    pub async fn work_link(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_link", args.0).await
    }

    /// Typed work verb: close with a recorded reason.
    #[tool(
        name = "work_close",
        description = "Close a work item. Arguments: id, reason (required), actor. Idempotent \
                       on an already-closed item; work_reopen is the deliberate exit."
    )]
    pub async fn work_close(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_close", args.0).await
    }

    /// Typed repair verb: reopen.
    #[tool(
        name = "work_reopen",
        description = "Set a work item's status to open. Arguments: id, actor, and reason. \
                       reason is required for a deferred item and records a typed park/resume \
                       decision without minting a revision."
    )]
    pub async fn work_reopen(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_reopen", args.0).await
    }

    /// Typed repair verb: release custody.
    #[tool(
        name = "work_release",
        description = "Clear a work item's custody under the actor CAS. Arguments: id, actor \
                       (must equal the current holder; a foreign holder refuses with \
                       BEAD_LEASE_HELD; unheld is an idempotent no-op)."
    )]
    pub async fn work_release(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_release", args.0).await
    }

    /// Typed repair verb: supersede (redispatch).
    #[tool(
        name = "work_supersede",
        description = "Atomically link successorId -> id with a supersedes edge and close \
                       the superseded item. Arguments: id, successorId (create it first with \
                       work_create), actor."
    )]
    pub async fn work_supersede(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_supersede", args.0).await
    }

    /// Typed repair verb: revert spec content.
    #[tool(
        name = "work_revert",
        description = "Mint revision N+1 as an exact copy of an earlier revision's spec \
                       bytes. Arguments: id, expectedRevision (CAS), toRevision, actor. \
                       Append-only history means nothing is ever lost."
    )]
    pub async fn work_revert(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("work_revert", args.0).await
    }

    /// Read one work item with its dependencies.
    #[tool(
        name = "work_show",
        description = "One work item's current snapshot plus hydrated dependencies — the \
                       read-only bd show replacement — and honesty-tested nextActions. Argument: \
                       id. Returns notesCount and noteCounts by kind but never note bodies; retrieve those with \
                       work_note_list."
    )]
    pub async fn work_show(&self, args: Parameters<LeadReadArgs>) -> CallToolResult {
        self.call_lead_read("work_show", args.0).await
    }

    /// Read the ready frontier.
    #[tool(
        name = "work_ready",
        description = "The bounded ready frontier: open, unassigned, unleased items whose \
                       blocks targets are all closed, priority-ordered. Returns summary rows \
                       by default. Optional repo filters exact work metadata.repository. \
                       detail=\"full\" restores complete snapshots; limit is \
                       1..=500 and defaults to 100. Pass the returned nextCursor as \
                       cursor to continue the same priority/work-id order, or pass \
                       all to return the whole frontier when it is at most 500 items."
    )]
    pub async fn work_ready(&self, args: Parameters<WorkReadyArgs>) -> CallToolResult {
        self.call("work_ready", args.0.into_envelope()).await
    }

    /// The discovery surface — the one tool that needs no id.
    #[tool(
        name = "work_list",
        description = "List 30 summary rows by default across forged slice runs and started epics. \
                       coverage states the full matching total; detail=\"full\" restores \
                       diagnostic row fields. Takes no id: this is how a \
                       caller with no prior knowledge discovers the ids the other tools require. \
                       Attention items include mapped nextActions. \
                       Optional repo, status, assignee, and limit are \
                       exact, composable work-store filters."
    )]
    pub async fn work_list(&self, args: Parameters<WorkListArgs>) -> CallToolResult {
        self.call("work_list", args.0.into_envelope()).await
    }

    /// Bounded historical lifecycle, rework, and spend trend.
    #[tool(
        name = "work_history",
        description = "Project bounded durable cross-run history and spend. Accepts an optional \
                       half-open UTC window, hour/day/week bucket, one closed grouping dimension, \
                       exact canonical repo/epic/subject filters, and bounded cursor pagination."
    )]
    pub async fn work_history(&self, args: Parameters<WorkHistoryArgs>) -> CallToolResult {
        self.call("work_history", args.0.into_envelope()).await
    }

    /// Bounded authority-preserving work graph for navigation.
    #[tool(
        name = "work_map",
        description = "Project a bounded graph of current work plans and distinct durable run/epic executions. Accepts operator, exact repository, or exact epic scope; canonical queue/source filters; an optional half-open history window; maxNodes up to 500; and a complete forged.work-ref/1 focus.",
        meta = work_map_tool_meta()
    )]
    pub async fn work_map(&self, args: Parameters<WorkMapArgs>) -> CallToolResult {
        self.call_structured("work_map", args.0.into_envelope())
            .await
    }

    /// Durable subject projection for the Work Detail App.
    #[tool(
        name = "work_detail",
        description = "Project one durable run or epic as a bounded summary, including mapped attention nextActions; params.detail=\"full\" restores attempts, artifacts, findings, and the event tail. Address it with the legacy exact params.subjectKind + params.subjectId pair, or params.id with optional params.subjectKind resolved across work, run, epic, attempt, and attention namespaces. params.after and params.limit page the full-detail event tail.",
        meta = work_detail_tool_meta()
    )]
    pub async fn work_detail(&self, args: Parameters<WorkDetailArgs>) -> CallToolResult {
        self.call_structured("work_detail", args.0.into_envelope())
            .await
    }

    /// The authoritative bounded attention listing.
    #[tool(
        name = "attention_list",
        description = "List attention items grouped by condition, decision groups before symptom \
                       groups, items oldest first, truncation always stated, with nextActions \
                       only for honesty-tested recommendation mappings. Optional exact \
                       repo and condition filters, closed state (active, open, all) and \
                       classification (decision, symptom), and limit up to 500."
    )]
    pub async fn attention_list(&self, args: Parameters<AttentionListArgs>) -> CallToolResult {
        self.call("attention_list", args.0.into_envelope()).await
    }

    /// Record custody of an exact active attention occurrence.
    #[tool(
        name = "attention_acknowledge",
        description = "Acknowledge an exact attention occurrence without hiding it or changing domain state. Required: subjectId, attentionId, occurrenceId, actor."
    )]
    pub async fn attention_acknowledge(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("attention_acknowledge", args.0).await
    }

    /// Resolve one explicitly adjudicable attention occurrence.
    #[tool(
        name = "attention_resolve",
        description = "Resolve an exact adjudicable attention occurrence; source-backed domain conditions refuse. Required: subjectId, attentionId, occurrenceId, actor, disposition."
    )]
    pub async fn attention_resolve(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("attention_resolve", args.0).await
    }

    /// Reopen one exact resolved attention occurrence.
    #[tool(
        name = "attention_reopen",
        description = "Reopen the exact current attention occurrence without changing domain state. Required: subjectId, attentionId, occurrenceId, actor."
    )]
    pub async fn attention_reopen(&self, args: Parameters<LeadWriteArgs>) -> CallToolResult {
        self.call_lead_write("attention_reopen", args.0).await
    }

    /// Retire a run's worktree through the explicit repair verb.
    #[tool(
        name = "worktree_retire",
        description = "Retire a run's worktree. Requires an explicit idempotencyKey."
    )]
    pub async fn worktree_retire(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("worktree_retire", args.0).await
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
        info.instructions = Some(SERVER_INSTRUCTIONS.into());
        info
    }

    async fn list_tools(
        &self,
        _request: Option<PaginatedRequestParams>,
        context: RequestContext<RoleServer>,
    ) -> Result<ListToolsResult, ErrorData> {
        let supports_cache_hints = context
            .protocol_version()
            .is_some_and(|version| version >= rmcp::model::ProtocolVersion::V_2026_07_28);
        Ok(ListToolsResult {
            result_type: Some(ResultType::COMPLETE),
            tools: self
                .tool_router
                .list_all()
                .into_iter()
                .filter(|tool| self.lists_tool(tool.name.as_ref()))
                .collect(),
            meta: None,
            next_cursor: None,
            ttl_ms: supports_cache_hints.then_some(0),
            cache_scope: supports_cache_hints.then_some(CacheScope::Public),
        })
    }

    async fn list_resources(
        &self,
        _request: Option<PaginatedRequestParams>,
        _context: RequestContext<RoleServer>,
    ) -> Result<ListResourcesResult, ErrorData> {
        Ok(ListResourcesResult::with_all_items(vec![
            Resource::new(OVERVIEW_URI, "forged-overview")
                .with_title("Forged Control Plane")
                .with_description("Compatibility view of Forged slice and epic execution.")
                .with_mime_type(APP_MIME),
            Resource::new(OPERATIONS_OVERVIEW_URI, "forged-operations-overview")
                .with_title("Forged Operations")
                .with_description("Bounded planned, queued, active, blocked, and mergeable work.")
                .with_mime_type(APP_MIME),
            Resource::new(WORK_DETAIL_URI, "forged-work-detail")
                .with_title("Forged Work Detail")
                .with_description("Exact read-only projection of one Forged run or epic.")
                .with_mime_type(APP_MIME),
            Resource::new(WORK_MAP_URI, "forged-work-map")
                .with_title("Forged Work Map")
                .with_description("Bounded plan, queue, execution, dependency, and history graph.")
                .with_mime_type(APP_MIME),
            Resource::new(AGENT_SESSIONS_URI, "forged-agent-sessions")
                .with_title("Forged Agent Sessions")
                .with_description(
                    "Bounded read-only diagnostics for provider attempts across durable work.",
                )
                .with_mime_type(APP_MIME),
        ]))
    }

    async fn read_resource(
        &self,
        request: ReadResourceRequestParams,
        _context: RequestContext<RoleServer>,
    ) -> Result<ReadResourceResponse, ErrorData> {
        let html = match request.uri.as_str() {
            OVERVIEW_URI => OVERVIEW_HTML,
            OPERATIONS_OVERVIEW_URI => OPERATIONS_OVERVIEW_HTML,
            WORK_DETAIL_URI => WORK_DETAIL_HTML,
            WORK_MAP_URI => WORK_MAP_HTML,
            AGENT_SESSIONS_URI => AGENT_SESSIONS_HTML,
            _ => {
                return Err(ErrorData::resource_not_found(
                    format!("unknown forged resource {:?}", request.uri),
                    None,
                ))
            }
        };
        Ok(
            ReadResourceResult::new(vec![ResourceContents::text(html, request.uri)
                .with_mime_type(APP_MIME)
                .with_meta(app_resource_meta())])
            .into(),
        )
    }
}

/// Serve MCP over stdio until the client disconnects. The one command that
/// prints no envelope: it serves the protocol instead. Initialize,
/// tools/list, and resources never touch the ledger; the two dispatch seams
/// open it lazily through the gate.
pub async fn serve(config: ForgedConfig, audience: McpAudienceArg) -> Result<(), String> {
    let state = Arc::new(McpState::new(config));
    let server = ForgedServer::new(Arc::clone(&state), audience);
    let result = async {
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
    .await;
    // Close deliberately on the way out; a never-opened gate has nothing to
    // close.
    if let Some(ledger) = state.ledger.get() {
        let _ = ledger.clone().close();
    }
    result
}

#[cfg(test)]
mod tests {
    use std::sync::atomic::Ordering;

    use super::*;

    #[test]
    fn server_orientation_is_the_ten_pinned_lines() {
        let lines = SERVER_INSTRUCTIONS.lines().collect::<Vec<_>>();
        assert_eq!(lines.len(), 10, "server orientation must stay ten lines");
        for (line, anchor) in [
            (0, "only handle"),
            (1, "Start with `next`"),
            (2, "`explain --id`"),
            (3, "should, can, and repair"),
            (4, "error.detail.remedy"),
            (5, "flat arguments"),
            (6, "explicit key"),
            (7, "bounded with `coverage`"),
            (8, "drafted, critiqued, adjudicated, ready, dispatched, deciding, reviewed, landed, closed"),
            (9, "`reused: true`"),
        ] {
            assert!(
                lines[line].contains(anchor),
                "orientation line {} must contain {anchor:?}: {}",
                line + 1,
                lines[line]
            );
        }
    }

    fn scratch_state(root: &std::path::Path) -> McpState {
        // Each caller supplies its tempdir as ANVIL_HOME. scratch_config also
        // carries no FORGED_CONFIG override, so MCP refreshes cannot escape
        // into a populated ambient operator scope.
        McpState::new(crate::config::scratch_config(root))
    }

    #[tokio::test]
    async fn concurrent_first_calls_share_exactly_one_open() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let state = scratch_state(dir.path());
        std::fs::write(&state.config.db_path, b"").expect("touch state.db");
        let (a, b) = tokio::join!(state.ctx(), state.ctx());
        let (a, b) = (a.expect("first call opens"), b.expect("second call joins"));
        // Contexts are per-call config snapshots; the LEDGER is the latch.
        assert_eq!(state.opens.load(Ordering::SeqCst), 1);
        assert_eq!(a.config.db_path, b.config.db_path);
        a.ledger.clone().close().expect("close");
    }

    #[tokio::test]
    async fn a_failed_migration_closes_the_ledger_and_does_not_latch() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let mut config = crate::config::scratch_config(dir.path());
        // An invalid execution policy fails migrate_legacy_state AFTER the
        // open succeeded — the arm that must close the ledger it opened.
        config.stage_budget_s.clear();
        let state = McpState::new(config);
        std::fs::write(&state.config.db_path, b"").expect("touch state.db");
        for expected_opens in [1usize, 2] {
            let failed = match state.ctx().await {
                Ok(_) => panic!("an invalid execution policy cannot mount"),
                Err(failure) => failure,
            };
            assert_eq!(failed.code, forged_types::ErrorCode::InvalidRequest);
            assert!(
                failed.message.contains("execution policy"),
                "{}",
                failed.message
            );
            // Nothing latched and the writer was closed: every retry opens
            // from scratch instead of replaying a stored failure or
            // stacking a leaked writer thread per call.
            assert!(state.ledger.get().is_none());
            assert_eq!(state.opens.load(Ordering::SeqCst), expected_opens);
        }
    }

    #[tokio::test]
    async fn an_uninspectable_ledger_path_is_not_treated_as_absence() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let mut config = crate::config::scratch_config(dir.path());
        // The PARENT is a file, so metadata on db_path errors with
        // NotADirectory — an inspection failure, not proven absence.
        let parent = dir.path().join("blocked");
        std::fs::write(&parent, b"not a directory").expect("blocking file");
        config.db_path = parent.join("state.db");
        let state = McpState::new(config);
        let failed = match state.ctx().await {
            Ok(_) => panic!("an uninspectable path cannot mount"),
            Err(failure) => failure,
        };
        assert_eq!(failed.code, forged_types::ErrorCode::Internal);
        assert!(
            failed.message.contains("cannot inspect operator state"),
            "{}",
            failed.message
        );
    }

    #[tokio::test]
    async fn a_failed_open_is_that_calls_failure_and_does_not_latch() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let state = scratch_state(dir.path());
        // db_path EXISTS but cannot open: a directory is not a database.
        std::fs::create_dir_all(&state.config.db_path).expect("db path dir");
        let failed = match state.ctx().await {
            Ok(_) => panic!("a directory cannot open"),
            Err(failure) => failure,
        };
        assert_eq!(failed.code, forged_types::ErrorCode::Internal);
        // The operator initializes properly; the very next call reopens
        // from scratch instead of replaying the stored failure.
        std::fs::remove_dir_all(&state.config.db_path).expect("clear db dir");
        std::fs::write(&state.config.db_path, b"").expect("touch state.db");
        let ctx = state.ctx().await.expect("the retrying call opens");
        assert_eq!(state.opens.load(Ordering::SeqCst), 2);
        ctx.ledger.clone().close().expect("close");
    }

    #[tokio::test]
    async fn a_config_edit_is_visible_without_a_remount() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let state = scratch_state(dir.path());
        std::fs::write(&state.config.db_path, b"").expect("touch state.db");
        let first = state.ctx().await.expect("mount");
        assert_eq!(first.config.default_profile, "standard");
        // The operator edits the file mid-session; the next call serves it
        // with no remount and no second ledger open, and the identity
        // anchors stay put.
        std::fs::write(
            &state.config.config_path,
            b"default_profile: high\ntransport_retry_budget: 9\n",
        )
        .expect("write config");
        let second = state.ctx().await.expect("post-edit call");
        assert_eq!(second.config.default_profile, "high");
        assert_eq!(second.config.transport_retry_budget, 9);
        assert_eq!(second.config.db_path, first.config.db_path);
        assert_eq!(state.opens.load(Ordering::SeqCst), 1);
        first.ledger.clone().close().expect("close");
    }

    #[tokio::test]
    async fn a_malformed_config_edit_refuses_that_call_and_recovers() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let state = scratch_state(dir.path());
        std::fs::write(&state.config.db_path, b"").expect("touch state.db");
        let first = state.ctx().await.expect("mount");
        std::fs::write(&state.config.config_path, b"default_profile: [broken")
            .expect("write bad config");
        let failed = match state.ctx().await {
            Ok(_) => panic!("a malformed config cannot serve"),
            Err(failure) => failure,
        };
        assert_eq!(failed.code, forged_types::ErrorCode::InvalidRequest);
        assert!(
            failed.message.contains("does not parse"),
            "{}",
            failed.message
        );
        // The operator fixes the file; the next call recovers in place.
        std::fs::write(&state.config.config_path, b"default_profile: high\n").expect("fix config");
        let recovered = state.ctx().await.expect("post-fix call");
        assert_eq!(recovered.config.default_profile, "high");
        first.ledger.clone().close().expect("close");
    }
}
