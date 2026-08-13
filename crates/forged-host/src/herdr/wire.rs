//! Serde types for the protocol-19 subset forged-host speaks: `ping`,
//! `events.subscribe`, `pane.split`, `pane.send_input`, `pane.process_info`,
//! `pane.close`, and the `pane_created` / `pane_exited` / `pane_closed`
//! events. Unknown response/event fields are tolerated (ignored), never
//! round-tripped.

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
    /// Whether this error says THE PANE is not found. herdr pane ids are
    /// never reused, so an id that no longer resolves can only mean that
    /// pane is gone — pane-not-found IS proof of pane death. Any other
    /// error proves nothing, so the match is deliberately tight: the
    /// documented `PANE_NOT_FOUND` code compared exactly (normalized), plus
    /// a few pane-specific message phrases. A bare "not found" (workspace
    /// not found, method not found, ...) must NEVER read as pane death.
    pub(crate) fn is_pane_not_found(&self) -> bool {
        let normalize = |s: &str| s.to_ascii_lowercase().replace(['_', '-'], " ");
        let code = match &self.code {
            Value::String(s) => normalize(s),
            other => normalize(&other.to_string()),
        };
        if code == "pane not found" {
            return true;
        }
        let message = normalize(&self.message);
        ["pane not found", "no such pane", "unknown pane"]
            .iter()
            .any(|phrase| message.contains(phrase))
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
