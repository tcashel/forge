//! HerdrHost: sessions as herdr panes over the protocol-19 Unix socket,
//! treating panes as terminals. Durable projection calls are display-only
//! metadata plus a projection-scoped custom lifecycle source; native Herdr
//! session authority is deliberately absent from this API.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::fmt::Write as _;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde::Deserialize;
use serde_json::json;
use tokio::time::Instant;

use super::wire::{
    PaneInfoResult, PaneLayoutResult, PaneReadResponse, Pong, ProcessInfo, ProcessInfoResponse,
    TabCreatedResult,
};
use super::{CallError, Connection};
use crate::identity::ProcessIdentity;
use crate::{
    next_host_instance, sentinel, Confirmed, HerdrSessionIdentity, HostError, HostSessionId,
    Liveness, PreparedSession, SessionHost, HERDR_PROTOCOL_VERSION,
};

/// Result of an ownership-gated durable pane cleanup request.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrCloseOutcome {
    /// Herdr accepted the close request.
    Closed,
    /// Herdr returned the exact protocol-19 `pane_not_found` code, proving
    /// the opaque pane id is already absent.
    AlreadyMissing,
}

/// Result of a read-only `pane.process_info` probe for an exact durable pane.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrProcessInfoProbe {
    /// Herdr returned a well-formed process-info result for the pane.
    Info,
    /// Herdr returned the exact protocol-19 `pane_not_found` code.
    PaneNotFound,
}

/// Result of a projection-scoped report/release call.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrProjectionOutcome {
    Applied,
    /// Exact lowercase protocol-19 `pane_not_found`; message text is never
    /// interpreted as absence.
    AlreadyMissing,
}

/// Display-only metadata. `tokens` is a complete fixed-whitelist update;
/// `None` explicitly clears a value owned by this exact metadata source.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrMetadataProjection {
    pub source: String,
    pub title: String,
    pub agent: Option<String>,
    pub applies_to_source: Option<String>,
    pub state: Option<String>,
    pub tokens: BTreeMap<String, Option<String>>,
    pub sequence: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrAgentProjection {
    pub source: String,
    pub agent: String,
    pub state: forged_types::HerdrProjectionLifecycle,
    pub sequence: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrAgentRelease {
    pub source: String,
    pub agent: String,
    pub sequence: u64,
}

#[derive(Debug, Deserialize)]
struct OkResult {
    #[serde(rename = "type")]
    kind: String,
}

fn valid_source(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= forged_types::HERDR_PROJECTION_VALUE_MAX_BYTES
        && !value.starts_with("herdr:")
        && value
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b":._-".contains(&byte))
}

fn valid_agent(value: &str) -> bool {
    matches!(value, "claude" | "codex")
}

fn valid_metadata(report: &HerdrMetadataProjection) -> bool {
    valid_source(&report.source)
        && !report.title.is_empty()
        && report.title.len() <= forged_types::HERDR_PROJECTION_TITLE_MAX_BYTES
        && !report.title.chars().any(char::is_control)
        && report.sequence > 0
        && report.agent.as_deref().is_none_or(valid_agent)
        && report.applies_to_source.as_deref().is_none_or(valid_source)
        && (report.agent.is_some() == report.applies_to_source.is_some())
        && report.applies_to_source.as_deref() != Some(report.source.as_str())
        && report.tokens.len() <= forged_types::HERDR_PROJECTION_TOKEN_MAX
        && report.tokens.iter().all(|(key, value)| {
            !key.is_empty()
                && key.len() <= 32
                && key
                    .bytes()
                    .all(|byte| byte.is_ascii_alphanumeric() || b"_-".contains(&byte))
                && value.as_deref().is_none_or(|value| {
                    value.len() <= forged_types::HERDR_PROJECTION_VALUE_MAX_BYTES
                        && !value.chars().any(char::is_control)
                })
        })
}

/// Exact coordinates returned by one successful `tab.create` response.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrCreatedTab {
    pub workspace_id: String,
    pub tab_id: String,
    pub root_pane_id: String,
}

/// A pane rectangle from one exact `pane.layout` snapshot.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrLayoutPane {
    pub pane_id: String,
    pub width: u16,
    pub height: u16,
}

/// Exact layout facts returned for a durable root-pane query.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrLayoutSnapshot {
    pub workspace_id: String,
    pub tab_id: String,
    pub panes: Vec<HerdrLayoutPane>,
}

/// `pane_not_found` is the only missing result; every other error remains
/// unknown and must not authorize replacement or cleanup.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HerdrLayoutInspection {
    Present(HerdrLayoutSnapshot),
    Missing,
}

/// Immutable durable layout and exact pane allow-list for one prepare call.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrLayoutTarget {
    layout_id: String,
    workspace_id: String,
    tab_id: String,
    root_pane_id: String,
    eligible_pane_ids: BTreeSet<String>,
}

impl HerdrLayoutTarget {
    pub fn new(
        layout_id: impl Into<String>,
        workspace_id: impl Into<String>,
        tab_id: impl Into<String>,
        root_pane_id: impl Into<String>,
        eligible_pane_ids: impl IntoIterator<Item = String>,
    ) -> Result<Self, HostError> {
        let layout_id = layout_id.into();
        let workspace_id = workspace_id.into();
        let tab_id = tab_id.into();
        let root_pane_id = root_pane_id.into();
        if [
            layout_id.as_str(),
            workspace_id.as_str(),
            tab_id.as_str(),
            root_pane_id.as_str(),
        ]
        .into_iter()
        .any(str::is_empty)
        {
            return Err(HostError::spawn_failed(
                "Herdr layout target contains an empty exact id",
            ));
        }
        let mut eligible_pane_ids = eligible_pane_ids.into_iter().collect::<BTreeSet<_>>();
        eligible_pane_ids.insert(root_pane_id.clone());
        Ok(Self {
            layout_id,
            workspace_id,
            tab_id,
            root_pane_id,
            eligible_pane_ids,
        })
    }

    pub fn layout_id(&self) -> &str {
        &self.layout_id
    }
}

/// A tab-create refusal proves no effect; an ambiguous transport or malformed
/// response cannot prove whether an unidentifiable empty tab was created.
#[derive(Debug, thiserror::Error)]
pub enum HerdrTabCreateError {
    #[error("tab.create refused before creating a usable layout: {0}")]
    Refused(HostError),
    #[error("tab.create outcome is ambiguous: {0}")]
    Ambiguous(HostError),
}

// Phase budgets are WALL-CLOCK deadlines, not iteration counts: each poll
// iteration may itself await a multi-second RPC or a subprocess, so counting
// iterations would let the real wait stretch far beyond the spec'd limit.
const READINESS_BUDGET: Duration = Duration::from_secs(3);
const READINESS_INTERVAL: Duration = Duration::from_millis(50);
const KILL_POLL_INTERVAL: Duration = Duration::from_millis(100);

/// What a `pane.process_info` probe concluded about a pane.
enum PaneProbe {
    Info(ProcessInfo),
    /// The server answered pane-not-found: herdr pane ids are never reused,
    /// so this IS proof the pane is dead.
    Gone,
}

/// What the host retains for one session it spawned.
struct Seat {
    /// The sentinel path: the only exit-code truth for this session. It
    /// deliberately OUTLIVES [`SessionHost::release`] — an id this instance
    /// issued must keep resolving, or a later `alive`/`kill_confirmed` for a
    /// row that never settled answers [`HostError::SessionNotFound`] and
    /// aborts the reconcile pass that was going to reclaim it.
    status_path: PathBuf,
    /// The pane's close has been dispatched: nothing left to attach to.
    released: bool,
}

/// A pane and command reserved by prepare but not sent yet.
struct PreparedSeat {
    token: u64,
    shell_line: String,
    status_path: PathBuf,
    identity: HerdrSessionIdentity,
    layout_id: Option<String>,
    layout_degradation: Option<String>,
}

/// Map Herdr's opaque pane id to a collision-free shell-safe directory name.
/// Real ids contain `:`, and the sentinel path deliberately remains unquoted,
/// so the transport id itself must never become a path component.
///
/// Exported at the crate root because the encoding is part of the durable
/// record contract: a caller that re-derives a recorded herdr sentinel path
/// from its pane id must apply this exact mapping, never the raw id.
pub fn herdr_status_dir_key(pane_id: &str) -> String {
    let mut key = String::with_capacity(5 + pane_id.len() * 2);
    key.push_str("pane-");
    for byte in pane_id.bytes() {
        write!(&mut key, "{byte:02x}").expect("writing to a String cannot fail");
    }
    key
}

/// A [`SessionHost`] backend that runs each session's shell line inside a
/// herdr pane, typed into the pane's existing interactive shell.
///
/// ASSUMPTION: the pane's shell is POSIX-compatible (sh, bash, zsh) — the
/// sentinel relies on `$?`, which is not portable to fish/nushell; those are
/// unsupported in this slice. No shell detection and no nested `/bin/sh -c`
/// wrapper is attempted.
///
/// The pane inherits herdr's environment; the caller's `env` map is passed
/// through `pane.split`'s additive `env` param, never interpolated into the
/// line. Ordinary RPCs use fresh one-shot connections; a separate event
/// subscription supplies closure observations as a best-effort accelerator.
pub struct HerdrHost {
    conn: Arc<Connection>,
    socket_path: PathBuf,
    instance: u64,
    base_status_dir: PathBuf,
    prepared: Mutex<HashMap<HostSessionId, PreparedSeat>>,
    sessions: Mutex<HashMap<HostSessionId, Seat>>,
    /// Label of the workspace seats are placed in, when the caller named one.
    /// `None` reproduces the pre-placement behaviour: an untargeted split,
    /// which herdr resolves against the UI-FOCUSED pane — one that may belong
    /// to the operator or another client.
    workspace_label: Option<String>,
    /// The resolved id for [`Self::workspace_label`], memoized after the
    /// first successful lookup.
    workspace: Mutex<Option<String>>,
    /// Exact durable layout placement. Its ids, never labels, grant targeting
    /// authority. `None` preserves the legacy repository-workspace split.
    layout: Option<HerdrLayoutTarget>,
    termination_grace: Duration,
}

/// A controller connection for durable pane ids recorded by forged. Unlike
/// [`HerdrHost`], it does not own or spawn sessions.
pub struct HerdrControl {
    conn: Arc<Connection>,
    socket_path: PathBuf,
    protocol: u32,
}

/// The ONE absence contract for `pane.process_info`, shared by every probe:
/// a well-formed result is the live info, the exact protocol-19
/// `pane_not_found` code is proof of death (herdr pane ids are never
/// reused), and everything else — transport failure, other RPC errors,
/// malformed results — proves nothing and surfaces as its own error.
async fn probe_pane_process_info(
    conn: &Connection,
    pane_id: &str,
) -> Result<Option<ProcessInfo>, HostError> {
    match conn
        .call("pane.process_info", json!({"pane_id": pane_id}))
        .await
    {
        Ok(value) => {
            let response: ProcessInfoResponse = serde_json::from_value(value).map_err(|_| {
                HostError::unavailable("malformed pane.process_info result from herdr")
            })?;
            Ok(Some(response.process_info))
        }
        Err(CallError::Rpc(error)) if error.is_pane_not_found() => Ok(None),
        Err(other) => Err(other.into_host_error()),
    }
}

/// Plain-text pane output safe to expose through CLI/MCP.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaneSnapshot {
    pub pane_id: String,
    pub workspace_id: String,
    pub tab_id: String,
    pub text: String,
    pub revision: u64,
    pub truncated: bool,
}

async fn connect_pinned(socket_path: &Path) -> Result<Arc<Connection>, HostError> {
    let conn = Connection::dial(socket_path).await?;
    let pong_value = conn
        .call("ping", json!({}))
        .await
        .map_err(CallError::into_host_error)?;
    let pong: Pong = serde_json::from_value(pong_value)
        .map_err(|_| HostError::unavailable("malformed pong from herdr"))?;
    if pong.protocol != HERDR_PROTOCOL_VERSION {
        return Err(HostError::ProtocolMismatch {
            expected: HERDR_PROTOCOL_VERSION,
            got: pong.protocol,
        });
    }
    Ok(conn)
}

impl HerdrControl {
    /// Connect to protocol 19 without subscribing to session events.
    pub async fn connect(socket_path: impl AsRef<Path>) -> Result<Self, HostError> {
        let socket_path = socket_path.as_ref().to_path_buf();
        Ok(Self {
            conn: connect_pinned(&socket_path).await?,
            socket_path,
            protocol: HERDR_PROTOCOL_VERSION,
        })
    }

    /// Connect using a durable identity, refusing unsupported or malformed
    /// coordinates before opening a socket.
    pub async fn connect_for(identity: &HerdrSessionIdentity) -> Result<Self, HostError> {
        if identity.protocol() != HERDR_PROTOCOL_VERSION {
            return Err(HostError::ProtocolMismatch {
                expected: HERDR_PROTOCOL_VERSION,
                got: identity.protocol(),
            });
        }
        if identity.pane_id().is_empty() || identity.socket_path().as_os_str().is_empty() {
            return Err(HostError::SessionNotFound {
                id: identity.pane_id().to_string(),
            });
        }
        Self::connect(identity.socket_path()).await
    }

    /// Probe the exact durable pane without changing it.
    ///
    /// Socket/protocol mismatch is refused before `pane.process_info`. Only
    /// the exact protocol-19 `pane_not_found` code proves absence; transport
    /// failures, other RPC errors, and malformed results remain unknown.
    pub async fn probe_process_info(
        &self,
        identity: &HerdrSessionIdentity,
    ) -> Result<HerdrProcessInfoProbe, HostError> {
        if identity.protocol() != self.protocol {
            return Err(HostError::ProtocolMismatch {
                expected: self.protocol,
                got: identity.protocol(),
            });
        }
        if identity.socket_path() != self.socket_path || identity.pane_id().is_empty() {
            return Err(HostError::SessionNotFound {
                id: identity.pane_id().to_string(),
            });
        }
        match probe_pane_process_info(&self.conn, identity.pane_id()).await? {
            Some(_) => Ok(HerdrProcessInfoProbe::Info),
            None => Ok(HerdrProcessInfoProbe::PaneNotFound),
        }
    }

    /// Close the exact durable Herdr identity this control was opened for.
    ///
    /// Socket/protocol mismatch is refused before `pane.close`. Only the
    /// exact protocol-19 `pane_not_found` code is idempotent success; every
    /// transport failure and other RPC refusal remains retryable failure.
    pub async fn close_owned(
        &self,
        identity: &HerdrSessionIdentity,
    ) -> Result<HerdrCloseOutcome, HostError> {
        if identity.protocol() != self.protocol {
            return Err(HostError::ProtocolMismatch {
                expected: self.protocol,
                got: identity.protocol(),
            });
        }
        if identity.socket_path() != self.socket_path || identity.pane_id().is_empty() {
            return Err(HostError::SessionNotFound {
                id: identity.pane_id().to_string(),
            });
        }
        match self
            .conn
            .call("pane.close", json!({"pane_id": identity.pane_id()}))
            .await
        {
            Ok(_) => Ok(HerdrCloseOutcome::Closed),
            Err(CallError::Rpc(error)) if error.is_pane_not_found() => {
                Ok(HerdrCloseOutcome::AlreadyMissing)
            }
            Err(other) => Err(other.into_host_error()),
        }
    }

    fn validate_projection_identity(
        &self,
        identity: &HerdrSessionIdentity,
    ) -> Result<(), HostError> {
        if identity.protocol() != self.protocol {
            return Err(HostError::ProtocolMismatch {
                expected: self.protocol,
                got: identity.protocol(),
            });
        }
        if identity.socket_path() != self.socket_path || identity.pane_id().is_empty() {
            return Err(HostError::SessionNotFound {
                id: identity.pane_id().to_owned(),
            });
        }
        Ok(())
    }

    async fn projection_call(
        &self,
        method: &str,
        params: serde_json::Value,
    ) -> Result<HerdrProjectionOutcome, HostError> {
        match self.conn.call(method, params).await {
            Ok(value) => {
                let response: OkResult = serde_json::from_value(value)
                    .map_err(|_| HostError::unavailable("malformed Herdr projection response"))?;
                if response.kind != "ok" {
                    return Err(HostError::unavailable(
                        "unexpected Herdr projection response type",
                    ));
                }
                Ok(HerdrProjectionOutcome::Applied)
            }
            Err(CallError::Rpc(error)) if error.is_pane_not_found() => {
                Ok(HerdrProjectionOutcome::AlreadyMissing)
            }
            Err(other) => Err(other.into_host_error()),
        }
    }

    /// Publish display metadata to one exact durable pane. There is no TTL:
    /// durable monotonic sequences define freshness.
    pub async fn report_metadata(
        &self,
        identity: &HerdrSessionIdentity,
        report: &HerdrMetadataProjection,
    ) -> Result<HerdrProjectionOutcome, HostError> {
        self.validate_projection_identity(identity)?;
        if !valid_metadata(report) {
            return Err(HostError::unavailable(
                "invalid bounded Herdr metadata projection",
            ));
        }
        self.projection_call(
            "pane.report_metadata",
            json!({
                "pane_id": identity.pane_id(),
                "source": report.source,
                "title": report.title,
                "agent": report.agent,
                "applies_to_source": report.applies_to_source,
                "state": report.state,
                "tokens": report.tokens,
                "seq": report.sequence,
            }),
        )
        .await
    }

    /// Report only custom-source provider lifecycle. This request type has no
    /// provider-session id/path fields and rejects all reserved `herdr:*`
    /// sources.
    pub async fn report_agent(
        &self,
        identity: &HerdrSessionIdentity,
        report: &HerdrAgentProjection,
    ) -> Result<HerdrProjectionOutcome, HostError> {
        self.validate_projection_identity(identity)?;
        if !valid_source(&report.source) || !valid_agent(&report.agent) || report.sequence == 0 {
            return Err(HostError::unavailable(
                "invalid custom Herdr agent projection",
            ));
        }
        self.projection_call(
            "pane.report_agent",
            json!({
                "pane_id": identity.pane_id(),
                "source": report.source,
                "agent": report.agent,
                "state": report.state.as_str(),
                "seq": report.sequence,
            }),
        )
        .await
    }

    /// Release only the exact custom source/agent previously used by this
    /// projection. Reserved native sources cannot pass validation.
    pub async fn release_agent(
        &self,
        identity: &HerdrSessionIdentity,
        release: &HerdrAgentRelease,
    ) -> Result<HerdrProjectionOutcome, HostError> {
        self.validate_projection_identity(identity)?;
        if !valid_source(&release.source) || !valid_agent(&release.agent) || release.sequence == 0 {
            return Err(HostError::unavailable("invalid custom Herdr agent release"));
        }
        self.projection_call(
            "pane.release_agent",
            json!({
                "pane_id": identity.pane_id(),
                "source": release.source,
                "agent": release.agent,
                "seq": release.sequence,
            }),
        )
        .await
    }

    /// Read a bounded recent-unwrapped text snapshot.
    pub async fn read_pane(&self, pane_id: &str, lines: u32) -> Result<PaneSnapshot, HostError> {
        let value = self
            .conn
            .call(
                "pane.read",
                json!({
                    "pane_id": pane_id,
                    "source": "recent_unwrapped",
                    "lines": lines,
                    "format": "text",
                    "strip_ansi": true,
                }),
            )
            .await
            .map_err(CallError::into_host_error)?;
        let response: PaneReadResponse = serde_json::from_value(value)
            .map_err(|_| HostError::unavailable("malformed pane.read result from herdr"))?;
        Ok(PaneSnapshot {
            pane_id: response.read.pane_id,
            workspace_id: response.read.workspace_id,
            tab_id: response.read.tab_id,
            text: response.read.text,
            revision: response.read.revision,
            truncated: response.read.truncated,
        })
    }

    /// Deliver one message plus Enter to an interactive agent pane.
    pub async fn send_message(&self, pane_id: &str, message: &str) -> Result<(), HostError> {
        if message.trim().is_empty() {
            return Err(HostError::spawn_failed("message must not be empty"));
        }
        if message.len() > 16 * 1024 {
            return Err(HostError::spawn_failed("message exceeds 16 KiB"));
        }
        self.conn
            .call(
                "pane.send_input",
                json!({"pane_id": pane_id, "text": message, "keys": ["Enter"]}),
            )
            .await
            .map_err(CallError::into_host_error)?;
        Ok(())
    }
}

impl HerdrHost {
    /// Dial `socket_path`, pin the protocol with `ping` (anything other
    /// than 19 → [`HostError::ProtocolMismatch`], and no further requests
    /// are issued), then subscribe to the pane events. The default is never
    /// applied here — pass [`HerdrHost::default_socket_path`] explicitly.
    pub async fn connect(
        socket_path: impl AsRef<Path>,
        base_status_dir: impl Into<PathBuf>,
    ) -> Result<Self, HostError> {
        let socket_path = socket_path.as_ref().to_path_buf();
        let conn = connect_pinned(&socket_path).await?;
        conn.subscribe(json!({
            "subscriptions": [
                {"type": "pane.created"},
                {"type": "pane.exited"},
                {"type": "pane.closed"},
            ],
        }))
        .await
        .map_err(CallError::into_host_error)?;
        Ok(HerdrHost {
            conn,
            socket_path,
            instance: next_host_instance(),
            base_status_dir: base_status_dir.into(),
            prepared: Mutex::new(HashMap::new()),
            sessions: Mutex::new(HashMap::new()),
            workspace_label: None,
            workspace: Mutex::new(None),
            layout: None,
            termination_grace: Duration::from_secs(forged_types::DEFAULT_TERMINATION_GRACE_S),
        })
    }

    /// Freeze the provider termination phase bound for this host instance.
    pub fn with_termination_grace_s(mut self, grace_s: u64) -> Self {
        self.termination_grace = Duration::from_secs(grace_s);
        self
    }

    /// Place every seat this host spawns inside the workspace named `label`,
    /// creating it on first use.
    ///
    /// The label is the caller's to choose and MUST be one only forged owns:
    /// targeting a workspace the operator works in defeats the purpose, since
    /// the seats then split the panes the operator is using.
    pub fn with_workspace(mut self, label: impl Into<String>) -> Self {
        self.workspace_label = Some(label.into());
        self
    }

    /// Target one exact durable layout for subsequent pane preparation.
    pub fn with_layout(mut self, target: HerdrLayoutTarget) -> Self {
        self.layout = Some(target);
        self
    }

    /// Exact protocol-pinned socket selected for this host.
    pub fn socket_path(&self) -> &Path {
        &self.socket_path
    }

    /// The workspace id seats are placed in, resolved once and memoized.
    ///
    /// Every failure degrades to `None`, which spawns an untargeted pane. A
    /// pane in the wrong workspace is a strictly better outcome than a seat
    /// that cannot start, so placement never propagates an error, and the
    /// degraded case is silent — which is why `workspace.list` is
    /// re-consulted on each new host rather than cached process-wide: a
    /// workspace the operator closed is recreated on the next spawn instead
    /// of stranding placement.
    async fn workspace_id(&self) -> Option<String> {
        let label = self.workspace_label.as_deref()?;
        if let Some(id) = self.workspace.lock().expect("workspace lock").clone() {
            return Some(id);
        }
        let id = self.resolve_workspace(label).await.ok()?;
        *self.workspace.lock().expect("workspace lock") = Some(id.clone());
        Some(id)
    }

    /// Find the workspace labelled `label`, else create it unfocused.
    ///
    /// `focus: false` is load-bearing: creating a workspace must never move
    /// the operator's focus, and a run that starts while they are working
    /// elsewhere has to stay invisible until they go looking for it.
    async fn resolve_workspace(&self, label: &str) -> Result<String, HostError> {
        let listed = self
            .conn
            .call("workspace.list", json!({}))
            .await
            .map_err(CallError::into_host_error)?;
        let existing = listed
            .get("workspaces")
            .and_then(serde_json::Value::as_array)
            .into_iter()
            .flatten()
            .find(|workspace| {
                workspace.get("label").and_then(serde_json::Value::as_str) == Some(label)
            })
            .and_then(|workspace| workspace.get("workspace_id"))
            .and_then(serde_json::Value::as_str)
            .map(str::to_owned);
        if let Some(id) = existing {
            return Ok(id);
        }
        let created = self
            .conn
            .call("workspace.create", json!({"label": label, "focus": false}))
            .await
            .map_err(CallError::into_host_error)?;
        created
            .get("workspace")
            .and_then(|workspace| workspace.get("workspace_id"))
            .and_then(serde_json::Value::as_str)
            .map(str::to_owned)
            .filter(|id| !id.is_empty())
            .ok_or_else(|| HostError::unavailable("malformed workspace.create result from herdr"))
    }

    /// Resolve or create the existing repository workspace without hiding a
    /// protocol failure. Layout setup uses this strict form; ordinary
    /// placement retains its historical best-effort behavior.
    pub async fn ensure_workspace(&self, label: &str) -> Result<String, HostError> {
        if label.trim().is_empty() {
            return Err(HostError::spawn_failed("workspace label must not be empty"));
        }
        if let Some(id) = self.workspace.lock().expect("workspace lock").clone() {
            return Ok(id);
        }
        let id = self.resolve_workspace(label).await?;
        *self.workspace.lock().expect("workspace lock") = Some(id.clone());
        Ok(id)
    }

    /// Create one unfocused tab and return its exact root anchor. Only an RPC
    /// refusal is known pre-effect; connection loss or malformed success is
    /// ambiguous and must never be recovered by matching the label.
    pub async fn create_layout_tab(
        &self,
        workspace_id: &str,
        label: &str,
        cwd: &Path,
        env: &HashMap<String, String>,
    ) -> Result<HerdrCreatedTab, HerdrTabCreateError> {
        let cwd = cwd.to_str().ok_or_else(|| {
            HerdrTabCreateError::Refused(HostError::spawn_failed("cwd is not valid UTF-8"))
        })?;
        let value = match self
            .conn
            .call(
                "tab.create",
                json!({
                    "workspace_id": workspace_id,
                    "label": label,
                    "cwd": cwd,
                    "env": env,
                    "focus": false,
                }),
            )
            .await
        {
            Ok(value) => value,
            Err(CallError::Rpc(error)) => {
                return Err(HerdrTabCreateError::Refused(HostError::spawn_failed(
                    format!("tab.create refused: {}", error.message),
                )))
            }
            Err(other) => return Err(HerdrTabCreateError::Ambiguous(other.into_host_error())),
        };
        let response: TabCreatedResult = serde_json::from_value(value).map_err(|_| {
            HerdrTabCreateError::Ambiguous(HostError::unavailable(
                "malformed tab.create result from herdr",
            ))
        })?;
        Ok(HerdrCreatedTab {
            workspace_id: response.tab.workspace_id,
            tab_id: response.tab.tab_id,
            root_pane_id: response.root_pane.pane_id,
        })
    }

    /// Inspect the exact tab containing `root_pane_id`.
    pub async fn inspect_layout(
        &self,
        root_pane_id: &str,
    ) -> Result<HerdrLayoutInspection, HostError> {
        let value = match self
            .conn
            .call("pane.layout", json!({"pane_id": root_pane_id}))
            .await
        {
            Ok(value) => value,
            Err(CallError::Rpc(error)) if error.is_pane_not_found() => {
                return Ok(HerdrLayoutInspection::Missing)
            }
            Err(other) => return Err(other.into_host_error()),
        };
        let response: PaneLayoutResult = serde_json::from_value(value)
            .map_err(|_| HostError::unavailable("malformed pane.layout result from herdr"))?;
        Ok(HerdrLayoutInspection::Present(HerdrLayoutSnapshot {
            workspace_id: response.layout.workspace_id,
            tab_id: response.layout.tab_id,
            panes: response
                .layout
                .panes
                .into_iter()
                .map(|pane| HerdrLayoutPane {
                    pane_id: pane.pane_id,
                    width: pane.rect.width,
                    height: pane.rect.height,
                })
                .collect(),
        }))
    }

    /// `$HOME/.config/herdr/herdr.sock`.
    pub fn default_socket_path() -> PathBuf {
        std::env::home_dir()
            .unwrap_or_default()
            .join(".config/herdr/herdr.sock")
    }

    fn session_status_path(&self, id: &HostSessionId) -> Result<PathBuf, HostError> {
        self.sessions
            .lock()
            .expect("sessions lock")
            .get(id)
            .map(|seat| seat.status_path.clone())
            .ok_or_else(|| HostError::session_not_found(id))
    }

    /// Probe a pane. Pane-not-found is proof of pane death; any other error
    /// response (transport failure, RPC timeout, connection loss) is
    /// [`HostError::Unavailable`] and proves nothing.
    async fn probe_pane(&self, pane_id: &str) -> Result<PaneProbe, HostError> {
        match probe_pane_process_info(&self.conn, pane_id).await? {
            Some(info) => Ok(PaneProbe::Info(info)),
            None => Ok(PaneProbe::Gone),
        }
    }

    /// Best-effort `pane.close`, ignoring the result entirely — used only
    /// for rollback after a partially failed spawn, where the pane is not
    /// yet a session and no caller depends on its fate.
    async fn best_effort_close(&self, pane_id: &str) {
        let _ = self
            .conn
            .call("pane.close", json!({"pane_id": pane_id}))
            .await;
    }

    /// Everything after a successful `pane.split` that is safe before
    /// durable registration: shell-readiness wait and status-dir creation.
    /// No command is sent here.
    async fn finish_prepare(&self, pane_id: &str) -> Result<PathBuf, HostError> {
        // Wait for the pane's shell before typing into it, within a
        // wall-clock deadline; sleep only the remaining budget.
        let deadline = Instant::now() + READINESS_BUDGET;
        loop {
            match self.probe_pane(pane_id).await? {
                PaneProbe::Gone => {
                    return Err(HostError::spawn_failed(
                        "pane disappeared before its shell started",
                    ))
                }
                PaneProbe::Info(info) if info.shell_pid.is_some() => break,
                PaneProbe::Info(_) => {}
            }
            let now = Instant::now();
            if now >= deadline {
                return Err(HostError::spawn_failed(
                    "pane shell never became ready within the 3 s budget",
                ));
            }
            tokio::time::sleep(READINESS_INTERVAL.min(deadline - now)).await;
        }

        // Reserve <base>/<encoded-pane-id>/ exclusively. Pane ids are opaque
        // transport identifiers (and contain shell-unsafe `:`), so encode
        // their bytes rather than weakening sentinel-path validation. Herdr
        // never reuses pane ids, so an existing dir is always an error.
        let session_dir = self.base_status_dir.join(herdr_status_dir_key(pane_id));
        let status_path = session_dir.join("status");
        sentinel::validate_status_path(&status_path)?;
        std::fs::create_dir_all(&self.base_status_dir)
            .map_err(|e| HostError::spawn_failed(format!("creating base status dir: {e}")))?;
        std::fs::create_dir(&session_dir)
            .map_err(|e| HostError::spawn_failed(format!("reserving session status dir: {e}")))?;

        Ok(status_path)
    }

    async fn legacy_split(
        &self,
        cwd: &str,
        env: &HashMap<String, String>,
    ) -> Result<PaneInfoResult, HostError> {
        let mut split = json!({"direction": "right", "cwd": cwd, "env": env, "focus": false});
        if let Some(workspace) = self.workspace_id().await {
            split["workspace_id"] = json!(workspace);
        }
        let value = self
            .conn
            .call("pane.split", split)
            .await
            .map_err(|error| match error {
                CallError::Rpc(error) => {
                    HostError::spawn_failed(format!("pane.split refused: {}", error.message))
                }
                other => other.into_host_error(),
            })?;
        serde_json::from_value(value)
            .map_err(|_| HostError::unavailable("malformed pane.split result from herdr"))
    }

    fn select_layout_target<'a>(
        target: &HerdrLayoutTarget,
        snapshot: &'a HerdrLayoutSnapshot,
    ) -> Result<(&'a str, &'static str), HostError> {
        if snapshot.workspace_id != target.workspace_id || snapshot.tab_id != target.tab_id {
            return Err(HostError::spawn_failed(
                "pane.layout did not match the durable workspace/tab",
            ));
        }
        if !snapshot
            .panes
            .iter()
            .any(|pane| pane.pane_id == target.root_pane_id)
        {
            return Err(HostError::spawn_failed(
                "durable layout root anchor is absent from pane.layout",
            ));
        }
        let mut best: Option<(&HerdrLayoutPane, u64)> = None;
        for pane in snapshot
            .panes
            .iter()
            .filter(|pane| target.eligible_pane_ids.contains(&pane.pane_id))
        {
            let area = u64::from(pane.width) * u64::from(pane.height);
            if best.is_none_or(|(current, current_area)| {
                area > current_area || (area == current_area && pane.pane_id < current.pane_id)
            }) {
                best = Some((pane, area));
            }
        }
        let (pane, _) = best.ok_or_else(|| {
            HostError::spawn_failed("pane.layout contains no exact eligible owned pane")
        })?;
        let direction = if pane.width >= pane.height {
            "right"
        } else {
            "down"
        };
        Ok((&pane.pane_id, direction))
    }

    async fn layout_split(
        &self,
        target: &HerdrLayoutTarget,
        cwd: &str,
        env: &HashMap<String, String>,
    ) -> Result<PaneInfoResult, HostError> {
        // The selected target may disappear between layout inspection and
        // split. Refresh exactly once under the caller's durable mutation
        // lease; no other failure is retried.
        for attempt in 0..2 {
            let snapshot = match self.inspect_layout(&target.root_pane_id).await? {
                HerdrLayoutInspection::Present(snapshot) => snapshot,
                HerdrLayoutInspection::Missing => {
                    return Err(HostError::spawn_failed(
                        "durable layout root anchor is missing",
                    ))
                }
            };
            let (pane_id, direction) = Self::select_layout_target(target, &snapshot)?;
            let value = self
                .conn
                .call(
                    "pane.split",
                    json!({
                        "workspace_id": target.workspace_id,
                        "target_pane_id": pane_id,
                        "direction": direction,
                        "ratio": 0.5,
                        "cwd": cwd,
                        "env": env,
                        "focus": false,
                    }),
                )
                .await;
            match value {
                Ok(value) => {
                    let response: PaneInfoResult = serde_json::from_value(value).map_err(|_| {
                        HostError::unavailable("malformed pane.split result from herdr")
                    })?;
                    if response.pane.pane_id.is_empty()
                        || response.pane.workspace_id != target.workspace_id
                        || response.pane.tab_id != target.tab_id
                    {
                        // A syntactically valid response gives us exact
                        // authority to remove the empty pane, but never to
                        // register it under a layout whose coordinates do not
                        // match. The caller then takes the normal placement
                        // fallback without sending a command to this pane.
                        if !response.pane.pane_id.is_empty() {
                            self.best_effort_close(&response.pane.pane_id).await;
                        }
                        return Err(HostError::spawn_failed(
                            "targeted pane.split returned a pane outside the durable layout",
                        ));
                    }
                    return Ok(response);
                }
                Err(CallError::Rpc(error)) if error.is_pane_not_found() && attempt == 0 => {}
                Err(CallError::Rpc(error)) => {
                    return Err(HostError::spawn_failed(format!(
                        "targeted pane.split refused: {}",
                        error.message
                    )))
                }
                Err(other) => return Err(other.into_host_error()),
            }
        }
        unreachable!("bounded layout split loop returns on its final attempt")
    }

    /// Poll until every captured foreground identity reads dead, within a
    /// wall-clock `budget`. `Ok(true)` when all are verified dead;
    /// `Ok(false)` when the deadline passes first; `Err` when an identity
    /// probe could not run at all (which proves nothing about death).
    async fn all_targets_dead(
        &self,
        targets: &[ProcessIdentity],
        budget: Duration,
    ) -> Result<bool, HostError> {
        let deadline = Instant::now() + budget;
        loop {
            let mut any_alive = false;
            for target in targets {
                if target.is_same_process().await? {
                    any_alive = true;
                    break;
                }
            }
            if !any_alive {
                return Ok(true);
            }
            let now = Instant::now();
            if now >= deadline {
                return Ok(false);
            }
            tokio::time::sleep(KILL_POLL_INTERVAL.min(deadline - now)).await;
        }
    }
}

#[async_trait::async_trait]
impl SessionHost for HerdrHost {
    async fn prepare(
        &self,
        cwd: &Path,
        shell_line: &str,
        env: &HashMap<String, String>,
    ) -> Result<PreparedSession, HostError> {
        // Validate everything caller-controlled before reserving a pane.
        sentinel::validate_shell_line(shell_line)?;
        let cwd = cwd
            .to_str()
            .ok_or_else(|| HostError::spawn_failed("cwd is not valid UTF-8"))?;

        // Placement is decided HERE and never revised. herdr pane ids are
        // workspace-qualified and a pane moved between workspaces receives a
        // NEW id; the id returned below becomes this session's
        // `HostSessionId`, which the reclaim saga is fenced on. Relocating a
        // pane afterwards would therefore invalidate a live session identity
        // and break confirmed-death verification.
        let (pane, layout_id, layout_degradation) = if let Some(target) = self.layout.as_ref() {
            match self.layout_split(target, cwd, env).await {
                Ok(pane) => (pane, Some(target.layout_id.clone()), None),
                Err(error) => (
                    self.legacy_split(cwd, env).await?,
                    None,
                    Some(error.to_string()),
                ),
            }
        } else {
            (self.legacy_split(cwd, env).await?, None, None)
        };
        let pane_id = pane.pane.pane_id;
        // Feed the replay gate the pane_id we now own.
        self.conn.register_own_pane(&pane_id);

        match self.finish_prepare(&pane_id).await {
            Ok(status_path) => {
                let id = HostSessionId(pane_id.clone());
                let identity = HerdrSessionIdentity::from_durable(
                    pane_id,
                    self.socket_path.clone(),
                    HERDR_PROTOCOL_VERSION,
                );
                let mut prepared = PreparedSession::new(
                    id.clone(),
                    status_path.clone(),
                    Some(identity.clone()),
                    self.instance,
                );
                prepared.set_herdr_layout_outcome(layout_id.clone(), layout_degradation.clone());
                self.prepared.lock().expect("prepared lock").insert(
                    id,
                    PreparedSeat {
                        token: prepared.token(),
                        shell_line: shell_line.to_string(),
                        status_path,
                        identity,
                        layout_id,
                        layout_degradation,
                    },
                );
                Ok(prepared)
            }
            Err(original) => {
                self.best_effort_close(&pane_id).await;
                Err(original)
            }
        }
    }

    async fn start(&self, prepared: PreparedSession) -> Result<HostSessionId, HostError> {
        if !prepared.issued_by(self.instance) {
            return Err(HostError::session_not_found(prepared.id()));
        }
        let id = prepared.id().clone();
        let pending = {
            let mut seats = self.prepared.lock().expect("prepared lock");
            let matches = seats.get(&id).is_some_and(|seat| {
                seat.token == prepared.token()
                    && seat.status_path == prepared.sentinel_path()
                    && prepared.herdr_identity() == Some(&seat.identity)
                    && prepared.herdr_layout_id() == seat.layout_id.as_deref()
                    && prepared.herdr_layout_degradation() == seat.layout_degradation.as_deref()
            });
            if !matches {
                return Err(HostError::session_not_found(&id));
            }
            seats
                .remove(&id)
                .expect("matching prepared pane disappeared under lock")
        };

        // Typed exactly once, never retried: send_input is not idempotent
        // and a duplicate would run the line twice. The caller has already
        // committed the durable identity before reaching this effect.
        let full_line = sentinel::append_sentinel(&pending.shell_line, &pending.status_path);
        let sent = self
            .conn
            .call(
                "pane.send_input",
                json!({"pane_id": id.as_str(), "text": full_line, "keys": ["Enter"]}),
            )
            .await
            .map_err(|error| match error {
                CallError::Rpc(error) => {
                    HostError::spawn_failed(format!("pane.send_input refused: {}", error.message))
                }
                other => other.into_host_error(),
            });
        if let Err(original) = sent {
            // A lost response is ambiguous, so never retry the command. A
            // best-effort close limits the residual; durable cleanup remains
            // authoritative when the caller registered this identity.
            self.best_effort_close(id.as_str()).await;
            return Err(original);
        }

        self.sessions.lock().expect("sessions lock").insert(
            id.clone(),
            Seat {
                status_path: pending.status_path,
                released: false,
            },
        );
        Ok(id)
    }

    async fn rollback_prepared(&self, prepared: PreparedSession) {
        if !prepared.issued_by(self.instance) {
            return;
        }
        let id = prepared.id().clone();
        let removed = {
            let mut seats = self.prepared.lock().expect("prepared lock");
            let matches = seats.get(&id).is_some_and(|seat| {
                seat.token == prepared.token()
                    && seat.status_path == prepared.sentinel_path()
                    && prepared.herdr_identity() == Some(&seat.identity)
                    && prepared.herdr_layout_id() == seat.layout_id.as_deref()
                    && prepared.herdr_layout_degradation() == seat.layout_degradation.as_deref()
            });
            if matches {
                seats.remove(&id)
            } else {
                None
            }
        };
        if removed.is_some() {
            self.best_effort_close(id.as_str()).await;
        }
    }

    async fn alive(&self, id: &HostSessionId) -> Result<Liveness, HostError> {
        let status_path = self.session_status_path(id)?;
        // Status file first: the only exit-code truth.
        if let Some(code) = sentinel::read_status(&status_path)? {
            return Ok(Liveness::Exited(code));
        }
        let pane_id = id.as_str();
        // pane_closed events and pane-not-found responses are dead
        // observations; a drained foreground is NOT (the line may not have
        // started yet; callers own timeouts).
        let dead_observed = self.conn.pane_closed_observed(pane_id)
            || match self.probe_pane(pane_id).await? {
                PaneProbe::Gone => true,
                PaneProbe::Info(_) => false,
            };
        if !dead_observed {
            return Ok(Liveness::Running);
        }
        // Re-read ONCE after the dead observation before concluding.
        match sentinel::read_status(&status_path)? {
            Some(code) => Ok(Liveness::Exited(code)),
            None => Ok(Liveness::Vanished),
        }
    }

    async fn kill_confirmed(&self, id: &HostSessionId) -> Result<Confirmed, HostError> {
        let status_path = self.session_status_path(id)?;
        let pane_id = id.as_str().to_string();
        let grace = self.termination_grace;

        // Entry reads, once each, before acting: sentinel then pane probe.
        let sentinel_present = sentinel::read_status(&status_path)?.is_some();
        let entry_probe = self.probe_pane(&pane_id).await?;
        if sentinel_present {
            // The line already finished: verified prior death. If the pane
            // still exists, close it FOR REAL — only pane-not-found is
            // tolerated; a transport failure, RPC timeout, or any other
            // error response propagates rather than hiding behind
            // AlreadyDead with the pane possibly left open.
            if let PaneProbe::Info(_) = entry_probe {
                match self
                    .conn
                    .call("pane.close", json!({"pane_id": &pane_id}))
                    .await
                {
                    Ok(_) => {}
                    Err(CallError::Rpc(e)) if e.is_pane_not_found() => {}
                    Err(other) => return Err(other.into_host_error()),
                }
            }
            return Ok(Confirmed::AlreadyDead);
        }
        let info = match entry_probe {
            // Verified missing BEFORE pane.close was attempted.
            PaneProbe::Gone => return Ok(Confirmed::AlreadyDead),
            PaneProbe::Info(info) => info,
        };

        // Capture the foreground pids with their lstart identities before
        // closing. A pid `ps` cannot resolve at capture is already dead.
        let mut targets = Vec::new();
        for process in &info.foreground_processes {
            if let Some(identity) = ProcessIdentity::capture(process.pid).await {
                targets.push(identity);
            }
        }
        let pgid = info.foreground_process_group_id;

        // pane.close plays the SIGTERM role. A pane-not-found error is
        // tolerated rather than propagated: it feeds the verification.
        let close_reported_gone = match self
            .conn
            .call("pane.close", json!({"pane_id": &pane_id}))
            .await
        {
            Ok(_) => false,
            Err(CallError::Rpc(e)) if e.is_pane_not_found() => true,
            Err(other) => return Err(other.into_host_error()),
        };

        if targets.is_empty() {
            // The pane was live on entry with nothing forged-started
            // running (empty foreground, no sentinel). Closing a live pane
            // is a kill — but a bare close acknowledgement is NEVER
            // confirmation on its own: verify pane absence.
            if close_reported_gone {
                return Ok(Confirmed::Killed);
            }
            let deadline = Instant::now() + grace;
            loop {
                if self.conn.pane_closed_observed(&pane_id) {
                    return Ok(Confirmed::Killed);
                }
                if let PaneProbe::Gone = self.probe_pane(&pane_id).await? {
                    return Ok(Confirmed::Killed);
                }
                let now = Instant::now();
                if now >= deadline {
                    return Err(HostError::KillVerifyTimeout);
                }
                tokio::time::sleep(KILL_POLL_INTERVAL.min(deadline - now)).await;
            }
        }

        // Verify every captured pid dead; escalate to SIGKILL on the
        // foreground process group if survivors remain.
        if self.all_targets_dead(&targets, grace).await? {
            return Ok(Confirmed::Killed);
        }
        if let Some(pgid) = pgid {
            let _ = killpg(Pid::from_raw(pgid), Signal::SIGKILL);
        }
        if self.all_targets_dead(&targets, grace).await? {
            return Ok(Confirmed::Killed);
        }
        Err(HostError::KillVerifyTimeout)
    }

    /// Dispatch the pane's close and mark the seat released. Deliberately
    /// NOT `kill_confirmed`'s close: no probe, no verification, no re-check
    /// budget, and no wait for herdr's answer — a settled attempt must never
    /// block on the terminal it is giving back, so the request is fired and
    /// its response is never read.
    ///
    /// The seat itself SURVIVES. Releasing gives up the terminal, never the
    /// session identity: dropping the map entry would make
    /// `session_status_path` — and so `alive` and `kill_confirmed` —
    /// answer [`HostError::SessionNotFound`] for an id this instance
    /// issued. The saga does not ask about liveness first: step 2 of
    /// `forged_proto::reconcile`'s revoking path calls `kill_confirmed`
    /// directly, because the fence is confirmed death and never a liveness
    /// reading. `ForgedPorts` turns the host's error into
    /// `PortError::Unavailable` and reconcile propagates it with `?`, so a
    /// row this process released but left `revoking` — a refused settle,
    /// still owing a confirmable kill — would abort the very pass that was
    /// going to reclaim its packet.
    ///
    /// An id absent from the map is NOT this host's pane: herdr closes
    /// whatever pane carries the id it is handed, so the dispatch is fenced
    /// by ownership here rather than by the caller's good behaviour.
    async fn release(&self, id: &HostSessionId) {
        let owned = {
            let mut sessions = self.sessions.lock().expect("sessions lock");
            match sessions.get_mut(id) {
                Some(seat) => {
                    seat.released = true;
                    true
                }
                None => false,
            }
        };
        if !owned {
            return;
        }
        self.conn
            .dispatch("pane.close", json!({"pane_id": id.as_str()}))
            .await;
    }

    fn attach_hint(&self, id: &HostSessionId) -> Option<String> {
        let sessions = self.sessions.lock().expect("sessions lock");
        // A released seat still resolves for liveness, but its pane is
        // closing: there is no terminal left for a UI to attach to.
        match sessions.get(id) {
            Some(seat) if !seat.released => Some(format!("herdr:pane:{}", id.as_str())),
            _ => None,
        }
    }
}
