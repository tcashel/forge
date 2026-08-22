//! `forged mcp` — the rmcp stdio server. Forty-four tools, each taking the same
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

use crate::config::ForgedConfig;
use crate::core::{derive_key, dispatch, err_response, migrate_legacy_state, Ctx, Failure};

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
    /// Return only event rows with an eventId greater than this
    /// (default 0).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub after: Option<i64>,
    /// Maximum event rows in the polling page, 1..=1000 (default 100).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
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

/// The `work_list` envelope: the shared envelope shape with the one typed
/// repository selector this discovery operation accepts.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkListArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// The idempotency key; defaulted to `op:work_list:read` when absent.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// Work discovery has no run id; retained for envelope compatibility.
    #[serde(default)]
    pub run_id: Option<String>,
    /// Discovery parameters.
    #[serde(default)]
    pub params: WorkListParams,
}

/// Optional repository scope for `work_list`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkListParams {
    /// Exact repository identity from Bead `metadata.repository`.
    #[serde(
        default,
        deserialize_with = "present_means_named",
        skip_serializing_if = "Option::is_none"
    )]
    pub repo: Option<String>,
}

impl WorkListArgs {
    /// Project onto the shared envelope, omitting an absent repository so it
    /// remains byte-compatible with the operator-wide request.
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
    /// Maximum rows across all groups, 1..=500 (default 200).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
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

/// Typed envelope for the authoritative attention listing.
#[derive(Debug, Deserialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionListArgs {
    /// Envelope schema version; always 1.
    #[serde(default = "default_schema_version")]
    pub schema_version: u32,
    /// The idempotency key; defaulted to `op:attention_list:read`.
    #[serde(default)]
    pub idempotency_key: Option<String>,
    /// Attention listing parameters.
    #[serde(default)]
    pub params: AttentionListParams,
}

/// Filters accepted by `attention_list`.
#[derive(Debug, Default, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionListParams {
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
    /// One slice run.
    Run,
    /// One epic.
    Epic,
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

/// Addressed target for `work_detail`: EXACTLY one form — the exact
/// `subjectKind`/`subjectId` pair, or a bare `id` resolved against the
/// durable inventory. Sending both forms, or half the pair, is refused.
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[schemars(crate = "rmcp::schemars", inline)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkDetailParams {
    /// Exact durable subject kind; travels only with `subjectId`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subject_kind: Option<WorkDetailKind>,
    /// Canonical run or epic id; travels only with `subjectKind`.
    #[serde(
        default,
        deserialize_with = "named_string_opt",
        skip_serializing_if = "Option::is_none"
    )]
    pub subject_id: Option<String>,
    /// Bare run or epic id, resolved kind-blind: an exact id beats any
    /// prefix, a unique prefix resolves, anything else answers with
    /// `resolution` candidates instead of the detail body.
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
/// never by a host handshaking this server. "Uninitialized" is a fresh
/// `config.db_path` existence check on every call — latched in neither
/// direction — and a successful open (with legacy-state migration completed
/// before any dispatch observes the ledger) latches once for the mount's
/// lifetime.
struct McpState {
    config: ForgedConfig,
    ctx: tokio::sync::OnceCell<Arc<Ctx>>,
    #[cfg(test)]
    opens: std::sync::atomic::AtomicUsize,
}

impl McpState {
    fn new(config: ForgedConfig) -> Self {
        Self {
            config,
            ctx: tokio::sync::OnceCell::new(),
            #[cfg(test)]
            opens: std::sync::atomic::AtomicUsize::new(0),
        }
    }

    /// The gate at the two dispatch seams. An uninitialized scope refuses —
    /// creating nothing — until the operator runs `forged init`; a failed
    /// open or migration is that call's failure and the next call retries.
    async fn ctx(&self) -> Result<Arc<Ctx>, Failure> {
        if !self.config.db_path.exists() {
            return Err(Failure::invalid(format!(
                "operator state does not exist at {}; a session mount creates \
                 nothing — initialize it deliberately with `forged init` or \
                 /forged:setup",
                self.config.db_path.display()
            )));
        }
        self.ctx.get_or_try_init(|| self.open()).await.cloned()
    }

    async fn open(&self) -> Result<Arc<Ctx>, Failure> {
        #[cfg(test)]
        self.opens.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        let db_path = self.config.db_path.clone();
        let ledger = tokio::task::spawn_blocking(move || forged_ledger::Ledger::open(&db_path))
            .await
            .map_err(|e| Failure::internal(format!("blocking task join failure: {e}")))?
            .map_err(|e| Failure::internal(format!("cannot open ledger: {e}")))?;
        let ctx = Arc::new(Ctx {
            config: self.config.clone(),
            ledger,
        });
        if let Err(failure) = migrate_legacy_state(&ctx).await {
            // A half-initialized mount must not leak the writer thread: the
            // retrying call reopens from scratch.
            let _ = ctx.ledger.clone().close();
            return Err(failure);
        }
        Ok(ctx)
    }
}

/// The forged MCP server: a thin adapter over the shared core.
#[derive(Clone)]
pub struct ForgedServer {
    state: Arc<McpState>,
    tool_router: ToolRouter<Self>,
}

impl ForgedServer {
    /// Build the server over the once-read config; the ledger stays shut
    /// until a tool call needs it.
    fn new(state: Arc<McpState>) -> Self {
        Self {
            state,
            tool_router: Self::tool_router(),
        }
    }

    async fn respond(&self, name: &str, args: EnvelopeArgs) -> forged_types::OperationResponse {
        let req = args.into_request();
        match self.state.ctx().await {
            Ok(ctx) => dispatch(&ctx, name, req).await,
            Err(failure) => err_response(
                &derive_key(name, req.run_id.as_deref(), None, None),
                &failure,
            ),
        }
    }

    async fn call(&self, name: &str, args: EnvelopeArgs) -> CallToolResult {
        let resp = self.respond(name, args).await;
        let text = serde_json::to_string(&resp)
            .unwrap_or_else(|e| format!("{{\"ok\":false,\"error\":\"unserializable: {e}\"}}"));
        CallToolResult::success(vec![ContentBlock::text(text)])
    }

    async fn call_structured(&self, name: &str, args: EnvelopeArgs) -> CallToolResult {
        let resp = self.respond(name, args).await;
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

    /// Stop and settle a complete run.
    #[tool(
        name = "run_stop",
        description = "Stop every live attempt and settle the run as clean, blocked, input-required, cancelled, superseded, or landed. Landed requires PR and exact SHA evidence."
    )]
    pub async fn run_stop(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_stop", args.0).await
    }

    /// Append an explicit roster revision.
    #[tool(
        name = "run_revise_roster",
        description = "Append a validated roster revision for a run."
    )]
    pub async fn run_revise_roster(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_revise_roster", args.0).await
    }

    /// Accept the final deduplicated findings after review exhaustion.
    #[tool(
        name = "run_accept_risk",
        description = "Record an operator's auditable accepted-risk decision after review-budget exhaustion."
    )]
    pub async fn run_accept_risk(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("run_accept_risk", args.0).await
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
                       At most one of params.run, params.epic, or params.id is accepted, and \
                       omitting all three projects the portfolio: every run and epic, newest \
                       first, with an attention rail. params.id resolves either kind and \
                       answers with candidates when it cannot; use work_list to enumerate \
                       every id.",
        meta = overview_tool_meta()
    )]
    pub async fn overview(&self, args: Parameters<OverviewArgs>) -> CallToolResult {
        self.call_structured("overview", args.0.into_envelope())
            .await
    }

    /// Bounded operator queue and live-plan projection.
    #[tool(
        name = "operations_overview",
        description = "Project bounded planned, queued, active, blocked, and mergeable work. Optional params.repo, params.group, params.source, and params.limit filters never widen on invalid input.",
        meta = operations_overview_tool_meta()
    )]
    pub async fn operations_overview(
        &self,
        args: Parameters<OperationsOverviewArgs>,
    ) -> CallToolResult {
        self.call_structured("operations_overview", args.0.into_envelope())
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

    /// Durable provider-session metadata for a run.
    #[tool(
        name = "session_list",
        description = "List provider sessions for a run."
    )]
    pub async fn session_list(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("session_list", args.0).await
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
                       caller with no prior knowledge discovers the ids the other tools require. \
                       Optional params.repo selects the exact Bead metadata.repository identity."
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
        description = "Project a bounded graph of current Beads plans and distinct durable run/epic executions. Accepts operator, exact repository, or exact epic scope; canonical queue/source filters; an optional half-open history window; maxNodes up to 500; and a complete forged.work-ref/1 focus.",
        meta = work_map_tool_meta()
    )]
    pub async fn work_map(&self, args: Parameters<WorkMapArgs>) -> CallToolResult {
        self.call_structured("work_map", args.0.into_envelope())
            .await
    }

    /// Durable subject projection for the Work Detail App.
    #[tool(
        name = "work_detail",
        description = "Project one durable run or epic. Address it with EXACTLY one form: the exact params.subjectKind + params.subjectId pair, or a bare params.id resolved against the durable inventory (an exact id beats any prefix, a unique prefix resolves, anything else answers with resolution candidates). params.after and params.limit page its event tail.",
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
                       groups, items oldest first, truncation always stated. Optional exact \
                       params.repo and params.condition filters, closed params.state \
                       (active, open, all) and params.classification (decision, symptom), \
                       and params.limit up to 500."
    )]
    pub async fn attention_list(&self, args: Parameters<AttentionListArgs>) -> CallToolResult {
        self.call("attention_list", args.0.into_envelope()).await
    }

    /// Record custody of an exact active attention occurrence.
    #[tool(
        name = "attention_acknowledge",
        description = "Acknowledge an exact attention occurrence without hiding it or changing domain state."
    )]
    pub async fn attention_acknowledge(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("attention_acknowledge", args.0).await
    }

    /// Resolve one explicitly adjudicable attention occurrence.
    #[tool(
        name = "attention_resolve",
        description = "Resolve an exact adjudicable attention occurrence; source-backed domain conditions refuse."
    )]
    pub async fn attention_resolve(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("attention_resolve", args.0).await
    }

    /// Reopen one exact resolved attention occurrence.
    #[tool(
        name = "attention_reopen",
        description = "Reopen the exact current attention occurrence without changing domain state."
    )]
    pub async fn attention_reopen(&self, args: Parameters<EnvelopeArgs>) -> CallToolResult {
        self.call("attention_reopen", args.0).await
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
pub async fn serve(config: ForgedConfig) -> Result<(), String> {
    let state = Arc::new(McpState::new(config));
    let server = ForgedServer::new(Arc::clone(&state));
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
    if let Some(ctx) = state.ctx.get() {
        let _ = ctx.ledger.clone().close();
    }
    result
}

#[cfg(test)]
mod tests {
    use std::sync::atomic::Ordering;

    use super::*;

    fn scratch_state(root: &std::path::Path) -> McpState {
        McpState::new(crate::config::scratch_config(root))
    }

    #[tokio::test]
    async fn concurrent_first_calls_share_exactly_one_open() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let state = scratch_state(dir.path());
        std::fs::write(&state.config.db_path, b"").expect("touch state.db");
        let (a, b) = tokio::join!(state.ctx(), state.ctx());
        let (a, b) = (a.expect("first call opens"), b.expect("second call joins"));
        assert!(Arc::ptr_eq(&a, &b), "both calls must observe one context");
        assert_eq!(state.opens.load(Ordering::SeqCst), 1);
        a.ledger.clone().close().expect("close");
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
}
