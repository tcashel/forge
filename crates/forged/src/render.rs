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
            "work_show" => render_work_show(result, now, self.full),
            "run_status" => render_run_status(result, now),
            "epic_status" => render_epic_status(result, now),
            "usage_report" => render_usage(result, now),
            "work_history" => render_work_history(result, now),
            "explain" => render_explain(result, now),
            _ => unreachable!("unsupported successful response reached the renderer"),
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
            format!(
                "\n{}  {shown} of {total} shown",
                section.to_ascii_uppercase()
            ),
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
        push_line(
            &mut lines,
            format!("\nSYMPTOMS  {} of {total} shown", rows.len()),
        );
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
    let should = row.get("should").filter(|value| !value.is_null());
    let verb = should
        .and_then(|action| action.get("verb"))
        .and_then(Value::as_str)
        .unwrap_or("");
    push_columns(
        lines,
        format!("  {id}  {state}  {title}"),
        (!verb.is_empty()).then(|| format!("should {verb}")),
    );

    let age = row.get("ageMin").and_then(Value::as_u64).unwrap_or(0);
    let lifecycle = row
        .pointer("/lifecycle/stage")
        .and_then(Value::as_str)
        .unwrap_or("unknown");
    let spend = || {
        row.get("spendUsd")
            .and_then(Value::as_f64)
            .map(|value| format!("${value:.2}"))
            .unwrap_or_else(|| "unknown".to_owned())
    };
    match section {
        "running" => {
            let stage = scalar(row.get("stage").unwrap_or(&Value::Null));
            let seat = scalar(row.get("seat").unwrap_or(&Value::Null));
            push_line(lines, format!("    stage {stage}  seat {seat}"));
            push_line(
                lines,
                format!("    age {age}m  lifecycle {lifecycle}  spend {}", spend()),
            );
        }
        "ready" => {
            push_line(lines, format!("    age {age}m  lifecycle {lifecycle}"));
            let revision = row
                .pointer("/lifecycle/basis/revision")
                .map(scalar)
                .unwrap_or_else(|| "unknown".to_owned());
            push_line(lines, format!("    basis revision {revision}"));
        }
        "landed" => {
            let pr = row.get("pr").map(scalar).unwrap_or_else(|| "—".to_owned());
            let pr = if pr == "—" { pr } else { format!("#{pr}") };
            push_line(
                lines,
                format!("    age {age}m  lifecycle {lifecycle}  pr {pr}"),
            );
        }
        "decisions" => push_line(
            lines,
            format!("    age {age}m  lifecycle {lifecycle}  spend {}", spend()),
        ),
        _ => push_line(lines, format!("    age {age}m  lifecycle {lifecycle}")),
    }

    if let Some(should) = should {
        let args = should
            .get("args")
            .and_then(Value::as_object)
            .map(format_args)
            .unwrap_or_default();
        let can = row.get("canCount").and_then(Value::as_u64).unwrap_or(0);
        push_line(lines, format!("    args:{args}  (+{can} can)"));
    } else if let Some(can) = row
        .get("canCount")
        .and_then(Value::as_u64)
        .filter(|can| *can > 0)
    {
        push_line(lines, format!("    {can} can action(s)"));
    }
}

fn render_header(lines: &mut Vec<String>, label: &str, now: &str) {
    let suffix = if now.is_empty() {
        String::new()
    } else {
        format!("  {now}")
    };
    push_line(lines, format!("{label}{suffix}"));
}

fn push_field(lines: &mut Vec<String>, label: &str, value: Option<&Value>) {
    if let Some(value) = value {
        push_line(lines, format!("{label}: {}", scalar(value)));
    }
}

fn render_actions(lines: &mut Vec<String>, label: &str, value: Option<&Value>) {
    const ACTION_LIMIT: usize = 10;
    let actions = value
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    push_line(lines, format!("{label}: {}", actions.len()));
    for action in actions.iter().take(ACTION_LIMIT) {
        let class = action.get("class").and_then(Value::as_str).unwrap_or("can");
        let verb = action
            .get("verb")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let args = action
            .get("args")
            .and_then(Value::as_object)
            .map(format_args)
            .unwrap_or_default();
        push_line(lines, format!("  {class} {verb}{args}"));
    }
    if actions.len() > ACTION_LIMIT {
        push_line(
            lines,
            format!(
                "  … {} more action(s) not shown",
                actions.len() - ACTION_LIMIT
            ),
        );
    }
}

fn render_explain(result: &Value, now: &str) -> String {
    let mut lines = Vec::new();
    render_header(&mut lines, "EXPLAIN", now);
    if let Some(resolution) = result.get("resolution") {
        push_field(&mut lines, "query", resolution.get("query"));
        push_field(&mut lines, "reason", resolution.get("reason"));
        let candidates = resolution
            .get("candidates")
            .and_then(Value::as_array)
            .map_or(0, Vec::len);
        push_line(&mut lines, format!("candidates: {candidates}"));
        return lines.join("\n");
    }
    push_field(&mut lines, "kind", result.get("kind"));
    push_field(&mut lines, "id", result.get("id"));
    push_field(&mut lines, "title", result.pointer("/what/title"));
    push_field(&mut lines, "status", result.pointer("/what/status"));
    push_field(&mut lines, "verdict", result.pointer("/how/verdict"));
    if let Some(runs) = result.pointer("/what/runs") {
        let shown = runs
            .get("items")
            .and_then(Value::as_array)
            .map_or(0, Vec::len);
        let total = runs
            .get("total")
            .and_then(Value::as_u64)
            .unwrap_or(shown as u64);
        let truncated = runs
            .get("truncated")
            .and_then(Value::as_bool)
            .unwrap_or(shown < total as usize);
        push_line(
            &mut lines,
            format!(
                "runs: {shown} of {total} shown{}",
                if truncated { " (truncated)" } else { "" }
            ),
        );
    }
    render_actions(&mut lines, "next", result.get("next"));
    lines.join("\n")
}

fn render_run_status(result: &Value, now: &str) -> String {
    let mut lines = Vec::new();
    render_header(&mut lines, "RUN", now);
    let run = result.get("run").unwrap_or(&Value::Null);
    for (label, pointer) in [
        ("id", "/runId"),
        ("state", "/state"),
        ("outcome", "/outcome"),
        ("stage", "/currentStage"),
        ("health", "/claimHealth/status"),
        ("controller", "/controller/state"),
        ("pr", "/delivery/pr"),
    ] {
        push_field(&mut lines, label, run.pointer(pointer));
    }
    let attempts = run
        .get("liveAttempts")
        .and_then(Value::as_array)
        .map_or(0, Vec::len);
    let packets = run
        .get("packets")
        .and_then(Value::as_array)
        .map_or(0, Vec::len);
    push_line(
        &mut lines,
        format!("packets: {packets}  live attempts: {attempts}"),
    );
    if let Some(next) = run.get("nextAction") {
        let next = serde_json::to_string(next).unwrap_or_else(|_| "null".to_owned());
        push_line(&mut lines, format!("driver next: {next}"));
    }
    render_actions(&mut lines, "next actions", run.get("nextActions"));
    lines.join("\n")
}

fn render_epic_status(result: &Value, now: &str) -> String {
    const CHILD_LIMIT: usize = 10;
    let mut lines = Vec::new();
    render_header(&mut lines, "EPIC", now);
    for (label, pointer) in [
        ("id", "/epicId"),
        ("title", "/title"),
        ("health", "/executionHealth"),
        ("desired", "/desired/state"),
        ("draft PR", "/draftPr"),
        ("final PR", "/finalPr"),
    ] {
        push_field(&mut lines, label, result.pointer(pointer));
    }
    if let Some(counts) = result.get("counts").and_then(Value::as_object) {
        let counts = counts
            .iter()
            .map(|(name, value)| format!("{name} {}", scalar(value)))
            .collect::<Vec<_>>()
            .join("  ");
        push_line(&mut lines, format!("counts: {counts}"));
    }
    if let Some(input) = result.get("inputRequired").filter(|value| !value.is_null()) {
        let input = serde_json::to_string(input).unwrap_or_else(|_| "{…}".to_owned());
        push_line(&mut lines, format!("INPUT REQUIRED: {input}"));
    }
    let children = result
        .get("children")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    push_line(&mut lines, format!("children: {}", children.len()));
    for child in children.iter().take(CHILD_LIMIT) {
        let id = child.get("id").and_then(Value::as_str).unwrap_or("unknown");
        let phase = child
            .get("phase")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let health = child
            .get("executionHealth")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        push_line(&mut lines, format!("  {id}  {phase}  {health}"));
    }
    if children.len() > CHILD_LIMIT {
        push_line(
            &mut lines,
            format!(
                "  … {} more child(ren) not shown",
                children.len() - CHILD_LIMIT
            ),
        );
    }
    lines.join("\n")
}

fn render_usage(result: &Value, now: &str) -> String {
    const ROW_LIMIT: usize = 10;
    let mut lines = Vec::new();
    render_header(&mut lines, "USAGE", now);
    for (label, pointer) in [
        ("input tokens", "/totals/inputTokens"),
        ("output tokens", "/totals/outputTokens"),
        ("cache read tokens", "/totals/cacheReadTokens"),
        ("cache write tokens", "/totals/cacheWriteTokens"),
        ("known spend USD", "/totals/costUsdKnown"),
        ("rows missing cost", "/totals/rowsMissingCost"),
        ("pricing source", "/pricing/source"),
        ("rates as of", "/pricing/ratesAsOf"),
    ] {
        push_field(&mut lines, label, result.pointer(pointer));
    }
    let rows = result
        .get("rows")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    push_line(&mut lines, format!("rows: {}", rows.len()));
    for row in rows.iter().take(ROW_LIMIT) {
        let run = row
            .get("runId")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let provider = row
            .get("provider")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let model = row
            .get("model")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let cost = row
            .get("costUsd")
            .and_then(Value::as_f64)
            .map(|value| format!("${value:.2}"))
            .unwrap_or_else(|| "unknown".to_owned());
        push_line(&mut lines, format!("  {run}  {provider}/{model}  {cost}"));
    }
    if rows.len() > ROW_LIMIT {
        push_line(
            &mut lines,
            format!("  … {} more usage row(s) not shown", rows.len() - ROW_LIMIT),
        );
    }
    lines.join("\n")
}

fn render_work_history(result: &Value, now: &str) -> String {
    const SERIES_LIMIT: usize = 10;
    let mut lines = Vec::new();
    render_header(&mut lines, "HISTORY", now);
    push_field(&mut lines, "from", result.pointer("/window/from"));
    push_field(&mut lines, "to", result.pointer("/window/to"));
    push_field(&mut lines, "bucket", result.pointer("/window/bucket"));
    push_field(&mut lines, "group by", result.get("groupBy"));
    for (label, pointer) in [
        ("runs started", "/metrics/runsStarted"),
        ("runs settled", "/metrics/runsSettled"),
        ("attempts started", "/metrics/attemptsStarted"),
        ("known spend USD", "/metrics/costUsdKnown"),
        ("rows missing cost", "/metrics/rowsMissingCost"),
    ] {
        push_field(&mut lines, label, result.pointer(pointer));
    }
    let shown = result
        .pointer("/coverage/shown")
        .and_then(Value::as_u64)
        .unwrap_or(0);
    let total = result
        .pointer("/coverage/total")
        .and_then(Value::as_u64)
        .unwrap_or(shown);
    let truncated = result
        .pointer("/coverage/truncated")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    push_line(
        &mut lines,
        format!(
            "subjects: {shown} of {total} shown{}",
            if truncated {
                " (truncated; next cursor available)"
            } else {
                ""
            }
        ),
    );
    if let Some(facts) = result
        .pointer("/coverage/degradationFacts")
        .and_then(Value::as_array)
    {
        for fact in facts {
            push_line(&mut lines, format!("degraded: {}", scalar(fact)));
        }
    }
    let series = result
        .get("series")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    push_line(&mut lines, format!("series: {}", series.len()));
    for item in series.iter().take(SERIES_LIMIT) {
        let key = item.get("key").and_then(Value::as_str).unwrap_or("unknown");
        let label = item.get("label").and_then(Value::as_str).unwrap_or("");
        push_line(&mut lines, format!("  {key}  {label}"));
    }
    if series.len() > SERIES_LIMIT {
        push_line(
            &mut lines,
            format!("  … {} more series not shown", series.len() - SERIES_LIMIT),
        );
    }
    lines.join("\n")
}

fn render_work_show(result: &Value, now: &str, full: bool) -> String {
    const DEPENDENCY_LIMIT: usize = 10;
    let mut lines = Vec::new();
    render_header(&mut lines, "WORK", now);
    let work = result.get("work").unwrap_or(&Value::Null);
    for (label, pointer) in [
        ("id", "/workId"),
        ("kind", "/kind"),
        ("status", "/status"),
        ("title", "/spec/title"),
        ("priority", "/priority"),
        ("assignee", "/assignee"),
        ("revision", "/revision"),
        ("repository", "/metadata/repository"),
    ] {
        push_field(&mut lines, label, work.pointer(pointer));
    }
    if full {
        for (label, pointer) in [
            ("description", "/spec/description"),
            ("acceptance criteria", "/spec/acceptanceCriteria"),
            ("design", "/spec/design"),
            ("notes", "/spec/notes"),
        ] {
            push_field(&mut lines, label, work.pointer(pointer));
        }
    }
    push_field(&mut lines, "notes count", result.get("notesCount"));
    push_field(&mut lines, "lifecycle", result.pointer("/lifecycle/stage"));
    let dependencies = result
        .get("dependencies")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    push_line(&mut lines, format!("dependencies: {}", dependencies.len()));
    for dependency in dependencies.iter().take(DEPENDENCY_LIMIT) {
        let id = dependency
            .get("id")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let kind = dependency
            .get("kind")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let status = dependency
            .get("status")
            .map(scalar)
            .unwrap_or_else(|| "—".to_owned());
        push_line(&mut lines, format!("  {kind} {id}  {status}"));
    }
    if dependencies.len() > DEPENDENCY_LIMIT {
        push_line(
            &mut lines,
            format!(
                "  … {} more dependency row(s) not shown",
                dependencies.len() - DEPENDENCY_LIMIT
            ),
        );
    }
    render_actions(&mut lines, "next actions", result.get("nextActions"));
    lines.join("\n")
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

fn push_columns(lines: &mut Vec<String>, left: String, right: Option<String>) {
    let Some(right) = right else {
        push_line(lines, left);
        return;
    };
    let right_width = right.chars().count();
    if right_width + 3 >= WIDTH {
        push_line(lines, left);
        push_line(lines, format!("    {right}"));
        return;
    }
    let left_limit = WIDTH - right_width - 2;
    let left_was_truncated = left.chars().count() > left_limit;
    let mut left = left.chars().take(left_limit).collect::<String>();
    if left_was_truncated {
        let mut chars = left.chars().collect::<Vec<_>>();
        if let Some(last) = chars.last_mut() {
            *last = '…';
        }
        left = chars.into_iter().collect();
    }
    let padding = WIDTH - left.chars().count() - right_width;
    lines.push(format!("{left}{}{right}", " ".repeat(padding)));
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
                        "spendUsd": 1.25, "lifecycle": {"stage": "reviewed", "since": "2026-09-03T10:00:00Z", "basis": {"revision": 1}},
                        "should": {"verb": "epic resolve", "args": {"id": "ore-080"}},
                        "canCount": 1
                    }],
                    "running": [{
                        "id": "run-1", "title": "Build the bounded surface",
                        "state": "implementation", "stage": "implementation",
                        "seat": "codex:worker-1", "ageMin": 7,
                        "spendUsd": 0.5, "lifecycle": {"stage": "dispatched", "since": "2026-09-03T10:00:00Z", "basis": {"revision": 1, "runId": "run-1"}},
                        "should": null, "canCount": 0
                    }],
                    "ready": [{
                        "id": "ore-081", "title": "Follow-up slice", "state": "open",
                        "ageMin": 3, "lifecycle": {"stage": "critiqued", "since": "2026-09-03T10:00:00Z", "basis": {"revision": 1, "noteIds": ["note-1"]}},
                        "should": null, "canCount": 0
                    }],
                    "landed": [{
                        "id": "run-2", "title": "Finished slice", "state": "landed",
                        "ageMin": 60, "lifecycle": {"stage": "landed", "since": "2026-09-03T10:00:00Z", "basis": {"revision": 1, "runId": "run-2"}}, "pr": 258,
                        "should": null, "canCount": 0
                    }]
                },
                "hidden": {"symptoms": 47, "parked": 2},
                "coverage": {"sections": {
                    "decisions": {"shown": 1, "total": 1},
                    "running": {"shown": 1, "total": 2},
                    "ready": {"shown": 1, "total": 1},
                    "landed": {"shown": 1, "total": 3}
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
        let value = ok(json!({
            "work": {
                "workId": "ore-1",
                "kind": "task",
                "status": "open",
                "spec": {
                    "title": "Small",
                    "description": "secret",
                    "acceptanceCriteria": "private acceptance",
                    "design": "private design",
                    "notes": "private notes"
                },
                "priority": 1,
                "assignee": null,
                "revision": 2,
                "metadata": {"repository": "/repo"}
            },
            "dependencies": [],
            "notesCount": 0,
            "nextActions": []
        }));
        let summary = response("work_show", &value, false).expect("summary");
        let full = response("work_show", &value, true).expect("full");
        assert!(!summary.contains("secret"));
        assert!(full.contains("secret"));
    }

    #[test]
    fn every_lead_read_has_a_real_schema_golden() {
        let explain = ok(json!({
            "schema": "forged.explain/1",
            "kind": "work-item",
            "id": "ore-1",
            "what": {
                "kind": "task",
                "title": "Ship the driver surface",
                "status": "open",
                "runs": {
                    "items": [{"id": "run-1", "state": "stopped", "outcome": "blocked"}],
                    "total": 2,
                    "limit": 1,
                    "truncated": true
                }
            },
            "how": {"verdict": "blocked"},
            "next": [{
                "verb": "work update",
                "args": {"id": "ore-1", "expectedRevision": 3},
                "reason": "resolve the blocker",
                "class": "should"
            }]
        }));
        let run = ok(json!({
            "run": {
                "runId": "run-1",
                "state": "active",
                "outcome": null,
                "currentStage": "implementation",
                "claimHealth": {"status": "in_progress"},
                "controller": {"state": "running"},
                "delivery": {"pr": null, "sha": null},
                "packets": [{"packetId": "run-1/implementation/0"}],
                "liveAttempts": [{"attemptId": 7, "claimant": "codex:worker"}],
                "nextAction": {"awaitPacket": {"packetId": "run-1/implementation/0"}},
                "nextActions": [{
                    "verb": "run status", "args": {"run": "run-1"},
                    "reason": "inspect", "class": "can"
                }]
            }
        }));
        let epic = ok(json!({
            "schema": "forged.epic.status/1",
            "epicId": "ore-epic",
            "title": "Bounded epic",
            "executionHealth": "running",
            "desired": {"state": "running"},
            "counts": {"active": 1, "landed": 2},
            "inputRequired": {"code": "operator-choice", "detail": "choose a child"},
            "draftPr": 260,
            "finalPr": null,
            "children": (0..12).map(|index| json!({
                "id": format!("child-{index:02}"),
                "phase": "implementation",
                "executionHealth": "running"
            })).collect::<Vec<_>>()
        }));
        let usage = ok(json!({
            "rows": (0..12).map(|index| json!({
                "runId": format!("run-{index:02}"),
                "provider": "codex", "model": "gpt-5", "costUsd": 0.25
            })).collect::<Vec<_>>(),
            "totals": {
                "inputTokens": 1200, "outputTokens": 300,
                "cacheReadTokens": 100, "cacheWriteTokens": 20,
                "costUsdKnown": 3.0, "rowsMissingCost": 1
            },
            "pricing": {"source": "operator", "ratesAsOf": "2026-09-01"}
        }));
        let history = ok(json!({
            "schema": "forged.work-history/1",
            "asOf": "2026-09-03T12:00:00Z",
            "window": {"from": "2026-09-01T00:00:00Z", "to": "2026-09-03T00:00:00Z", "bucket": "day", "bucketCount": 2},
            "groupBy": "repository",
            "filters": {"repository": null, "epicId": null, "subjectId": null},
            "coverage": {
                "shown": 1, "total": 3, "truncated": true,
                "degradationFacts": ["1 usage row retains unknown cost"]
            },
            "metrics": {
                "runsStarted": 3, "runsSettled": 2, "attemptsStarted": 4,
                "costUsdKnown": 1.5, "rowsMissingCost": 1
            },
            "series": [{"key": "repository:/repo", "label": "/repo"}],
            "subjects": [{"identity": {"subject": {"id": "run-1"}}}],
            "nextCursor": "cursor"
        }));
        let work = ok(json!({
            "work": {
                "workId": "ore-1", "kind": "task", "status": "open",
                "spec": {"title": "Driver surface", "description": "body"},
                "priority": 1, "assignee": null, "revision": 3,
                "metadata": {"repository": "/repo"}
            },
            "dependencies": [{"id": "ore-0", "kind": "blocks", "status": "closed"}],
            "notesCount": 2,
            "nextActions": [{
                "verb": "run start", "args": {"work": "ore-1"},
                "reason": "execute", "class": "should"
            }]
        }));
        for (operation, value, fixture) in [
            (
                "explain",
                &explain,
                include_str!("../tests/fixtures/text/explain.txt"),
            ),
            (
                "run_status",
                &run,
                include_str!("../tests/fixtures/text/run-status.txt"),
            ),
            (
                "epic_status",
                &epic,
                include_str!("../tests/fixtures/text/epic-status.txt"),
            ),
            (
                "usage_report",
                &usage,
                include_str!("../tests/fixtures/text/usage.txt"),
            ),
            (
                "work_history",
                &history,
                include_str!("../tests/fixtures/text/work-history.txt"),
            ),
            (
                "work_show",
                &work,
                include_str!("../tests/fixtures/text/work-show.txt"),
            ),
        ] {
            let rendered = response(operation, value, false).expect("text renderer");
            assert_eq!(rendered, fixture.trim_end(), "{operation}");
            assert!(rendered.lines().all(|line| line.chars().count() <= WIDTH));
        }
        assert!(response("explain", &explain, false)
            .unwrap()
            .contains("should work update"));
    }
}
