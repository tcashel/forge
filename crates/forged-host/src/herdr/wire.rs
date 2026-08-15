//! Serde types for the protocol-19 subset forged-host speaks: `ping`,
//! `events.subscribe`, `tab.create`, `pane.layout`, `pane.split`,
//! `pane.send_input`, `pane.process_info`, `pane.close`, and the
//! `pane_created` / `pane_exited` / `pane_closed` events. Unknown
//! response/event fields are tolerated (ignored), never round-tripped.

use serde::Deserialize;
use serde_json::Value;

/// An error object from a herdr response: `{"code", "message"}`.
#[derive(Debug, Clone, Deserialize)]
pub(crate) struct WireError {
    #[serde(default)]
    pub(crate) code: Value,
    #[serde(default)]
    pub(crate) message: String,
}

impl WireError {
    /// Whether this is the exact protocol-19 `pane_not_found` code.
    ///
    /// Herdr pane ids are never reused, so this one documented code proves
    /// the pane is gone. Messages are diagnostics only: accepting a phrase
    /// such as "pane not found" under another or absent code would turn an
    /// ambiguous refusal into destructive cleanup authority.
    pub(crate) fn is_pane_not_found(&self) -> bool {
        matches!(&self.code, Value::String(code) if code == "pane_not_found")
    }
}

/// `ping` result: `{"type":"pong", "version", "protocol", "capabilities"}`.
#[derive(Debug, Deserialize)]
pub(crate) struct Pong {
    pub(crate) protocol: u32,
}

/// `pane.split` result: `{"type":"pane_info", "pane": {...}}`.
#[derive(Debug, Deserialize)]
pub(crate) struct PaneInfoResult {
    pub(crate) pane: PaneInfo,
}

#[derive(Debug, Deserialize)]
pub(crate) struct PaneInfo {
    pub(crate) pane_id: String,
    pub(crate) workspace_id: String,
    pub(crate) tab_id: String,
}

/// `tab.create` result with the exact tab and otherwise-idle root pane.
#[derive(Debug, Deserialize)]
pub(crate) struct TabCreatedResult {
    pub(crate) tab: TabInfo,
    pub(crate) root_pane: RootPaneInfo,
}

#[derive(Debug, Deserialize)]
pub(crate) struct RootPaneInfo {
    pub(crate) pane_id: String,
}

#[derive(Debug, Deserialize)]
pub(crate) struct TabInfo {
    pub(crate) tab_id: String,
    pub(crate) workspace_id: String,
}

/// `pane.layout` result wrapper.
#[derive(Debug, Deserialize)]
pub(crate) struct PaneLayoutResult {
    pub(crate) layout: PaneLayoutSnapshot,
}

#[derive(Debug, Deserialize)]
pub(crate) struct PaneLayoutSnapshot {
    pub(crate) workspace_id: String,
    pub(crate) tab_id: String,
    pub(crate) panes: Vec<PaneLayoutPane>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct PaneLayoutPane {
    pub(crate) pane_id: String,
    pub(crate) rect: PaneLayoutRect,
}

#[derive(Debug, Deserialize)]
pub(crate) struct PaneLayoutRect {
    pub(crate) width: u16,
    pub(crate) height: u16,
}

/// `pane.read` result wrapper.
#[derive(Debug, Deserialize)]
pub(crate) struct PaneReadResponse {
    pub(crate) read: PaneReadResult,
}

/// Stable text snapshot returned by Herdr.
#[derive(Debug, Deserialize)]
pub(crate) struct PaneReadResult {
    pub(crate) pane_id: String,
    pub(crate) workspace_id: String,
    pub(crate) tab_id: String,
    pub(crate) text: String,
    pub(crate) revision: u64,
    pub(crate) truncated: bool,
}

/// `pane.process_info` result wrapper.
#[derive(Debug, Deserialize)]
pub(crate) struct ProcessInfoResponse {
    pub(crate) process_info: ProcessInfo,
}

/// Stable process details nested under `process_info`.
#[derive(Debug, Deserialize)]
pub(crate) struct ProcessInfo {
    #[serde(default)]
    pub(crate) shell_pid: Option<u32>,
    #[serde(default)]
    pub(crate) foreground_process_group_id: Option<i32>,
    #[serde(default)]
    pub(crate) foreground_processes: Vec<ForegroundProcess>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct ForegroundProcess {
    pub(crate) pid: u32,
}

/// Pane events use two wire shapes: `pane_created` carries a full `pane`,
/// while `pane_exited` and `pane_closed` carry `pane_id` directly. No exit
/// code exists on the wire — which is exactly why the sentinel file is the
/// truth path.
#[derive(Debug, Clone, Deserialize)]
pub(crate) struct PaneEventData {
    #[serde(default)]
    pane_id: Option<String>,
    #[serde(default)]
    pane: Option<PaneEventPane>,
}

impl PaneEventData {
    pub(crate) fn pane_id(self) -> Option<String> {
        self.pane_id.or_else(|| self.pane.map(|pane| pane.pane_id))
    }
}

#[derive(Debug, Clone, Deserialize)]
struct PaneEventPane {
    pane_id: String,
}

/// The delivered (snake_case) pane event kinds forged-host subscribes to.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum PaneEventKind {
    Created,
    Exited,
    Closed,
}

impl PaneEventKind {
    pub(crate) fn parse(kind: &str) -> Option<Self> {
        match kind {
            "pane_created" => Some(PaneEventKind::Created),
            "pane_exited" => Some(PaneEventKind::Exited),
            "pane_closed" => Some(PaneEventKind::Closed),
            _ => None,
        }
    }
}

/// A demuxed pane event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct PaneEvent {
    pub(crate) kind: PaneEventKind,
    pub(crate) pane_id: String,
}
