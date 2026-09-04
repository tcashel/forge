//! Deterministic terminal renderers for the small lead-facing read surface.
//!
//! JSON remains the wire contract. These renderers are deliberately lossy:
//! they turn the same bounded result into a scan-friendly, eighty-column view
//! and never read the clock or query another source.

use forged_types::{OperationResponse, RemedyV1};
use serde_json::{Map, Value};

const WIDTH: usize = 80;

/// One deterministic text rendering whose notion of "now" came from the
/// result being rendered, never from wall-clock time.
pub trait Render {
    fn text(&self, now: &str) -> String;
}

struct ResponseRender<'a> {
    operation: &'a str,
    response: &'a OperationResponse,
    full: bool,
}

/// Whether an operation has an intentional terminal form.
pub fn supports(operation: &str) -> bool {
    matches!(
        operation,
        "next"
            | "explain"
            | "run_status"
            | "epic_status"
            | "usage_report"
            | "work_history"
            | "work_show"
    )
}

/// Render a supported response. Failures are renderable for every CLI
/// operation so a forced text command never leaks a JSON refusal.
pub fn response(operation: &str, value: &OperationResponse, full: bool) -> Option<String> {
    if value.error.is_none() && !supports(operation) {
        return None;
    }
    let now = value
        .result
        .as_ref()
        .and_then(|result| {
            result
                .get("capturedAt")
                .or_else(|| result.get("asOf"))
                .or_else(|| result.get("updatedAt"))
        })
        .and_then(Value::as_str)
        .unwrap_or("");
    Some(
        ResponseRender {
            operation,
            response: value,
            full,
        }
        .text(now),
    )
}

impl Render for ResponseRender<'_> {
    fn text(&self, now: &str) -> String {
        if let Some(error) = &self.response.error {
            return refusal(error);
        }
        let Some(result) = self.response.result.as_ref() else {
            return "✓ no result".to_owned();
        };
        match self.operation {
            "next" => render_next(result, now),
            "work_show" => render_summary("WORK", result, now, self.full),
            "run_status" => render_summary("RUN", result, now, false),
            "epic_status" => render_summary("EPIC", result, now, false),
            "usage_report" => render_summary("USAGE", result, now, false),
            "work_history" => render_summary("HISTORY", result, now, false),
            "explain" => render_summary("EXPLAIN", result, now, false),
            _ => render_summary("RESULT", result, now, self.full),
        }
    }
}

fn refusal(error: &forged_types::OpError) -> String {
    let code = serde_json::to_value(error.code)
        .ok()
        .and_then(|value| value.as_str().map(str::to_owned))
        .unwrap_or_else(|| "ERROR".to_owned());
    let mut lines = Vec::new();
    push_line(&mut lines, format!("✗ {code} {}", error.message));
    if let Some(remedy) = error
        .detail
        .as_ref()
        .and_then(|value| serde_json::from_value::<RemedyV1>(value.clone()).ok())
    {
        push_line(
            &mut lines,
            format!(
                "  remedy: forged {}{}",
                remedy.verb,
                format_args(&remedy.args)
            ),
        );
    }
    lines.join("\n")
}

fn format_args(args: &Map<String, Value>) -> String {
    let mut rendered = String::new();
    for (name, value) in args {
        let flag = camel_to_kebab(name);
        match value {
            Value::Bool(true) => rendered.push_str(&format!(" --{flag}")),
            Value::Bool(false) | Value::Null => {}
            Value::String(value) => rendered.push_str(&format!(" --{flag} {value}")),
            value => rendered.push_str(&format!(" --{flag} {value}")),
        }
    }
    rendered
}

fn camel_to_kebab(value: &str) -> String {
    let mut result = String::new();
    for ch in value.chars() {
        if ch.is_ascii_uppercase() {
            result.push('-');
            result.push(ch.to_ascii_lowercase());
        } else {
            result.push(ch);
        }
    }
    result
}

fn render_next(result: &Value, now: &str) -> String {
    let mut lines = Vec::new();
    let scope =
        if let Some(repository) = result.pointer("/scope/repository").and_then(Value::as_str) {
            format!("repo {repository}")
        } else if let Some(epic) = result.pointer("/scope/epic").and_then(Value::as_str) {
            format!("epic {epic}")
        } else {
            "portfolio".to_owned()
        };
    push_line(&mut lines, format!("NEXT  {scope}  {now}"));
    for section in ["decisions", "running", "ready", "landed"] {
        let rows = result
            .pointer(&format!("/sections/{section}"))
            .and_then(Value::as_array)
            .map(Vec::as_slice)
            .unwrap_or(&[]);
        let shown = result
            .pointer(&format!("/coverage/sections/{section}/shown"))
            .and_then(Value::as_u64)
            .unwrap_or(rows.len() as u64);
        let total = result
            .pointer(&format!("/coverage/sections/{section}/total"))
            .and_then(Value::as_u64)
            .unwrap_or(rows.len() as u64);
        push_line(
            &mut lines,
            format!("\n{}  {shown}/{total}", section.to_ascii_uppercase()),
        );
        if rows.is_empty() {
            lines.push("  —".to_owned());
        }
        for row in rows {
            render_next_row(&mut lines, section, row);
        }
    }
    if let Some(rows) = result
        .pointer("/sections/symptoms")
        .and_then(Value::as_array)
    {
        let total = result
            .pointer("/coverage/sections/symptoms/total")
            .and_then(Value::as_u64)
            .unwrap_or(rows.len() as u64);
        push_line(&mut lines, format!("\nSYMPTOMS  {}/{total}", rows.len()));
        for row in rows {
            render_next_row(&mut lines, "symptoms", row);
        }
    }
    let symptoms = result
        .pointer("/hidden/symptoms")
        .and_then(Value::as_u64)
        .unwrap_or(0);
    let parked = result
        .pointer("/hidden/parked")
        .and_then(Value::as_u64)
        .unwrap_or(0);
    push_line(
        &mut lines,
        format!("\nHIDDEN  symptoms {symptoms}  parked {parked}"),
    );
    lines.join("\n")
}

fn render_next_row(lines: &mut Vec<String>, section: &str, row: &Value) {
    let id = row.get("id").and_then(Value::as_str).unwrap_or("unknown");
    let title = row.get("title").and_then(Value::as_str).unwrap_or("");
    let state = scalar(row.get("state").unwrap_or(&Value::Null));
    push_line(lines, format!("  {id}  {state}  {title}"));
    let mut detail = format!(
        "    age {}m  lifecycle {}",
        row.get("ageMin").and_then(Value::as_u64).unwrap_or(0),
        row.get("lifecycle")
            .and_then(Value::as_str)
            .unwrap_or("unknown")
    );
    if matches!(section, "decisions" | "running") {
        detail.push_str("  spend ");
        detail.push_str(
            &row.get("spendUsd")
                .and_then(Value::as_f64)
                .map(|value| format!("${value:.2}"))
                .unwrap_or_else(|| "unknown".to_owned()),
        );
    }
    push_line(lines, detail);
    if let Some(should) = row.get("should").filter(|value| !value.is_null()) {
        let verb = should.get("verb").and_then(Value::as_str).unwrap_or("");
        let args = should
            .get("args")
            .and_then(Value::as_object)
            .map(format_args)
            .unwrap_or_default();
        let can = row.get("canCount").and_then(Value::as_u64).unwrap_or(0);
        push_line(
            lines,
            format!("    should: forged {verb}{args}  (+{can} can)"),
        );
    }
}

fn render_summary(label: &str, result: &Value, now: &str, full: bool) -> String {
    let mut lines = Vec::new();
    let suffix = if now.is_empty() {
        String::new()
    } else {
        format!("  {now}")
    };
    push_line(&mut lines, format!("{label}{suffix}"));
    flatten_summary(result, "", full, &mut lines, 0);
    lines.join("\n")
}

fn flatten_summary(value: &Value, prefix: &str, full: bool, lines: &mut Vec<String>, depth: usize) {
    if depth > 3 || lines.len() >= 80 {
        return;
    }
    match value {
        Value::Object(object) => {
            for (key, value) in object {
                if !full && is_body_field(key) {
                    continue;
                }
                let path = if prefix.is_empty() {
                    key.clone()
                } else {
                    format!("{prefix}.{key}")
                };
                flatten_summary(value, &path, full, lines, depth + 1);
            }
        }
        Value::Array(values) => {
            push_line(lines, format!("{prefix}: {} item(s)", values.len()));
        }
        _ => push_line(lines, format!("{prefix}: {}", scalar(value))),
    }
}

fn is_body_field(key: &str) -> bool {
    matches!(
        key,
        "description" | "acceptanceCriteria" | "design" | "notes" | "body"
    )
}

fn scalar(value: &Value) -> String {
    match value {
        Value::Null => "—".to_owned(),
        Value::Bool(value) => value.to_string(),
        Value::Number(value) => value.to_string(),
        Value::String(value) => value.clone(),
        Value::Array(values) => format!("{} item(s)", values.len()),
        Value::Object(_) => "{…}".to_owned(),
    }
}

fn push_line(lines: &mut Vec<String>, line: String) {
    let mut chars = line.chars();
    let prefix = chars.by_ref().take(WIDTH).collect::<String>();
    if chars.next().is_some() {
        let mut shortened = prefix
            .chars()
            .take(WIDTH.saturating_sub(1))
            .collect::<String>();
        shortened.push('…');
        lines.push(shortened);
    } else {
        lines.push(prefix);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_types::OperationResponse;
    use serde_json::json;

    fn ok(result: Value) -> OperationResponse {
        OperationResponse {
            ok: true,
            operation_id: "test".to_owned(),
            reused: false,
            result: Some(result),
            error: None,
        }
    }

    #[test]
    fn next_is_fixed_order_bounded_and_uses_result_time() {
        let rendered = response(
            "next",
            &ok(json!({
                "capturedAt": "2026-09-03T12:00:00Z",
                "scope": {"portfolio": true},
                "sections": {
                    "decisions": [{
                        "id": "ore-080", "title": "Choose the release",
                        "state": "awaiting_operator", "ageMin": 12,
                        "spendUsd": 1.25, "lifecycle": "reviewed",
                        "should": {"verb": "epic resolve", "args": {"id": "ore-080"}},
                        "canCount": 1
                    }],
                    "running": [], "ready": [], "landed": []
                },
                "hidden": {"symptoms": 47, "parked": 2},
                "coverage": {"sections": {
                    "decisions": {"shown": 1, "total": 1},
                    "running": {"shown": 0, "total": 0},
                    "ready": {"shown": 0, "total": 0},
                    "landed": {"shown": 0, "total": 0}
                }}
            })),
            false,
        )
        .expect("text renderer");
        assert_eq!(
            rendered,
            include_str!("../tests/fixtures/text/next.txt").trim_end()
        );
        assert!(rendered.lines().all(|line| line.chars().count() <= WIDTH));
    }

    #[test]
    fn work_bodies_require_full() {
        let value = ok(json!({"id": "ore-1", "title": "Small", "description": "secret"}));
        let summary = response("work_show", &value, false).expect("summary");
        let full = response("work_show", &value, true).expect("full");
        assert!(!summary.contains("secret"));
        assert!(full.contains("secret"));
    }

    #[test]
    fn every_lead_read_has_a_checked_in_golden() {
        let value = ok(json!({
            "capturedAt": "2026-09-03T12:00:00Z",
            "id": "ore-1",
            "state": "running"
        }));
        for (operation, fixture) in [
            (
                "explain",
                include_str!("../tests/fixtures/text/explain.txt"),
            ),
            (
                "run_status",
                include_str!("../tests/fixtures/text/run-status.txt"),
            ),
            (
                "epic_status",
                include_str!("../tests/fixtures/text/epic-status.txt"),
            ),
            (
                "usage_report",
                include_str!("../tests/fixtures/text/usage.txt"),
            ),
            (
                "work_history",
                include_str!("../tests/fixtures/text/work-history.txt"),
            ),
            (
                "work_show",
                include_str!("../tests/fixtures/text/work-show.txt"),
            ),
        ] {
            let rendered = response(operation, &value, false).expect("text renderer");
            assert_eq!(rendered, fixture.trim_end(), "{operation}");
            assert!(rendered.lines().all(|line| line.chars().count() <= WIDTH));
        }
    }
}
