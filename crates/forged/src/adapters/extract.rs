//! The forged-result extraction contract. No merged crate exports an
//! extractor — the contract lives in the prompt templates, and this module
//! is its one implementation.

use forged_types::PacketResult;
use serde_json::Value;

/// The closed transport-marker list: a terminal codex `turn.failed` — or a
/// claude `is_error` result — whose error message, ASCII-lowercased,
/// contains one of these four entries is a free transport retry. The
/// constant is the whole list; anything else is semantic.
pub const TRANSPORT_MARKERS: [&str; 4] =
    ["rate limit", "stream disconnected", "timeout", "overloaded"];

/// What harvesting a finished provider run produced.
#[derive(Debug, Clone, PartialEq)]
pub enum Harvest {
    /// A valid, matching result to land.
    Result(Box<PacketResult>),
    /// A transport failure: the note (already `transport: `-prefixed) for
    /// `fail_packet` — a free retry within the budget.
    Transport(String),
    /// A semantic failure: the plain note for `fail_packet`.
    Semantic(String),
}

/// Whether `message`, ASCII-lowercased, carries a transport marker.
pub fn is_transport_message(message: &str) -> bool {
    let lower = message.to_ascii_lowercase();
    TRANSPORT_MARKERS.iter().any(|m| lower.contains(m))
}

/// Normalize the closed implement-gate vocabulary at either ingestion path.
/// Fence the closed gateState vocabulary on a FRESH implement result: the
/// wire contract is EXACTLY "pass" or "fail" (or null for unknown), and the
/// seat template promises that vocabulary verbatim — so case or whitespace
/// variants refuse instead of being silently rewritten, and the stored
/// request payload and the recorded result stay byte-identical.
pub(crate) fn validate_implement_gate_state(result: &PacketResult) -> Result<(), String> {
    let shape_ok = match result.schema.as_str() {
        "forged.result/1" => !matches!(result.outcome, forged_types::Outcome::Plan { .. }),
        "forged.result.implement/1" => matches!(
            result.outcome,
            forged_types::Outcome::Implement { .. } | forged_types::Outcome::SpecAmendment { .. }
        ),
        "forged.result.review/1" => matches!(
            result.outcome,
            forged_types::Outcome::Review { .. } | forged_types::Outcome::SpecAmendment { .. }
        ),
        "forged.result.fix/1" => matches!(
            result.outcome,
            forged_types::Outcome::Fix { .. } | forged_types::Outcome::SpecAmendment { .. }
        ),
        "forged.result.epic-plan/1" => matches!(
            result.outcome,
            forged_types::Outcome::Plan { .. } | forged_types::Outcome::SpecAmendment { .. }
        ),
        _ => false,
    };
    if !shape_ok {
        return Err(format!(
            "forged-result outcome does not match schema {:?}",
            result.schema
        ));
    }
    if let forged_types::Outcome::Implement {
        gate_state: Some(gate_state),
        ..
    } = &result.outcome
    {
        if !matches!(gate_state.as_str(), "pass" | "fail") {
            return Err(format!(
                "implement result gateState must be exactly \"pass\" or \"fail\", got {gate_state:?}"
            ));
        }
    }
    if let forged_types::Outcome::Plan {
        spec,
        traceability,
        cruxes,
    } = &result.outcome
    {
        for (name, value) in [
            ("description", &spec.description),
            ("acceptanceCriteria", &spec.acceptance_criteria),
            ("design", &spec.design),
            ("notes", &spec.notes),
        ] {
            if value.trim().is_empty() {
                return Err(format!("plan result {name} must not be empty"));
            }
        }
        if cruxes.iter().any(|value| {
            value.summary.trim().is_empty()
                || value.evidence.trim().is_empty()
                || value.proposed_change.trim().is_empty()
        }) {
            return Err(
                "plan result cruxes require summary, evidence, and proposedChange".to_owned(),
            );
        }
        if traceability.requirements.is_empty()
            || traceability
                .requirements
                .iter()
                .any(|value| value.trim().is_empty())
        {
            return Err("plan result traceability requires non-empty requirements".to_owned());
        }
        if traceability
            .assumptions
            .iter()
            .any(|value| value.trim().is_empty())
        {
            return Err("plan result assumptions must not contain empty entries".to_owned());
        }
    }
    Ok(())
}

/// Validate the result against the packet's immutable protocol and semantic
/// purpose. Schema text alone is not authority for the runtime-only planning
/// outcome.
pub(crate) fn validate_result_for_packet(
    result: &PacketResult,
    protocol: Option<&forged_types::ProtocolRef>,
    purpose: Option<forged_types::SeatPurpose>,
) -> Result<(), String> {
    validate_implement_gate_state(result)?;
    let planning = protocol.is_some_and(|value| value.name == "epic-plan" && value.version == 1);
    let assurance =
        protocol.is_some_and(|value| value.name == "epic-assurance" && value.version == 1);
    let review_seat = matches!(
        purpose,
        Some(forged_types::SeatPurpose::Review | forged_types::SeatPurpose::Synthesis)
    );
    if matches!(result.outcome, forged_types::Outcome::Plan { .. })
        && !(planning
            && matches!(
                purpose,
                Some(forged_types::SeatPurpose::Implement | forged_types::SeatPurpose::Fix)
            ))
    {
        return Err(
            "plan outcomes require a frozen epic-plan/v1 author or revision packet".to_owned(),
        );
    }
    if planning
        && review_seat
        && matches!(
            &result.outcome,
            forged_types::Outcome::Review {
                verdict: forged_types::Verdict::RequestChanges,
                findings,
                ..
            } if findings.is_empty() || findings.iter().any(|finding| finding.message.trim().is_empty())
        )
    {
        return Err("epic-plan requestChanges requires at least one actionable finding".to_owned());
    }
    if planning
        && review_seat
        && matches!(
            &result.outcome,
            forged_types::Outcome::Review {
                verdict: forged_types::Verdict::Block,
                ..
            }
        )
    {
        return Err(
            "epic-plan scope or authority blockers must return typed specAmendment evidence"
                .to_owned(),
        );
    }
    if assurance && review_seat {
        match &result.outcome {
            forged_types::Outcome::Review {
                verdict: forged_types::Verdict::Approve,
                findings,
                ..
            } if findings.iter().any(|finding| {
                matches!(
                    finding.severity,
                    forged_types::Severity::Blocker | forged_types::Severity::High
                )
            }) =>
            {
                return Err(
                    "epic-assurance approve cannot carry blocker or high findings".to_owned(),
                );
            }
            forged_types::Outcome::Review {
                verdict: forged_types::Verdict::RequestChanges,
                findings,
                ..
            } if findings.is_empty()
                || findings
                    .iter()
                    .any(|finding| finding.message.trim().is_empty()) =>
            {
                return Err(
                    "epic-assurance requestChanges requires at least one actionable finding"
                        .to_owned(),
                );
            }
            forged_types::Outcome::Review {
                verdict: forged_types::Verdict::Block,
                ..
            } => {
                return Err(
                    "epic-assurance scope or authority blockers must return typed specAmendment evidence"
                        .to_owned(),
                );
            }
            _ => {}
        }
    }
    if assurance {
        if let forged_types::Outcome::SpecAmendment { amendment } = &result.outcome {
            if amendment.summary.trim().is_empty()
                || amendment.evidence.trim().is_empty()
                || amendment.proposed_change.trim().is_empty()
            {
                return Err(
                    "epic-assurance specAmendment requires summary, evidence, and proposedChange"
                        .to_owned(),
                );
            }
        }
    }
    Ok(())
}

/// Extract the packet result from a provider's final message text.
///
/// Recognizes only a three-backtick opening fence whose info string is
/// exactly `forged-result` and a later line that is exactly the closing
/// fence. Every complete candidate is parsed and the LAST one whose body is
/// exactly one valid `PacketResult` JSON wins — a malformed earlier
/// candidate does not poison a valid later one. No parsing candidate fails
/// semantically; after selection, a schema or packetId mismatch fails
/// semantically — never a fallback to an earlier candidate.
pub fn extract_forged_result(
    text: &str,
    expected_schema: &str,
    packet_id: &str,
) -> Result<PacketResult, String> {
    let mut candidates: Vec<String> = Vec::new();
    let mut body: Option<Vec<&str>> = None;
    for line in text.lines() {
        match &mut body {
            None => {
                if line.trim_end() == "```forged-result" {
                    body = Some(Vec::new());
                }
            }
            Some(lines) => {
                if line.trim_end() == "```" {
                    candidates.push(lines.join("\n"));
                    body = None;
                } else {
                    lines.push(line);
                }
            }
        }
    }
    // An unclosed trailing fence is not a complete candidate.
    if candidates.is_empty() {
        return Err("no forged-result block".to_owned());
    }
    let selected = candidates
        .iter()
        .rev()
        .find_map(|c| serde_json::from_str::<PacketResult>(c).ok());
    let Some(result) = selected else {
        return Err("malformed forged-result block".to_owned());
    };
    if result.schema != expected_schema {
        return Err("forged-result schema mismatch".to_owned());
    }
    if result.packet_id != packet_id {
        return Err("forged-result packetId mismatch".to_owned());
    }
    validate_implement_gate_state(&result)?;
    Ok(result)
}

/// Harvest a claude run: the final `type=result` record of the stream-json
/// capture holds the result text. A stream with no final result record is a
/// transport failure; an `is_error` result whose message carries a transport
/// marker is transport and every other `is_error` result is semantic; only a
/// non-error result falls through to extraction.
pub fn harvest_claude(out_jsonl: &str, expected_schema: &str, packet_id: &str) -> Harvest {
    let mut last_result: Option<Value> = None;
    for line in out_jsonl.lines() {
        if let Ok(v) = serde_json::from_str::<Value>(line) {
            if v.get("type").and_then(Value::as_str) == Some("result") {
                last_result = Some(v);
            }
        }
    }
    let Some(result) = last_result else {
        return Harvest::Transport(
            "transport: claude stream ended with no final result record".to_owned(),
        );
    };
    let text = result
        .get("result")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if result.get("is_error").and_then(Value::as_bool) == Some(true) {
        // The marker source for an `is_error` result is `error.message`;
        // some shapes carry the same sentence in the top-level `result`
        // text instead, so both are consulted against the closed list —
        // mirroring the codex rule. Whichever one matched is the note.
        let error_message = result
            .get("error")
            .and_then(|e| e.get("message"))
            .and_then(Value::as_str)
            .unwrap_or_default();
        for candidate in [error_message, text] {
            if is_transport_message(candidate) {
                return Harvest::Transport(format!("transport: claude error result: {candidate}"));
            }
        }
        // No marker: an `is_error` result is a SEMANTIC failure, full stop.
        // It never falls through to extraction — a policy or configuration
        // refusal can still carry a valid-looking forged-result block in its
        // text, and landing that would turn the provider's own error into a
        // success. Mirrors the codex `turn.failed` rule exactly.
        let detail = if error_message.is_empty() {
            text
        } else {
            error_message
        };
        return Harvest::Semantic(format!("claude error result: {detail}"));
    }
    finish(text, expected_schema, packet_id)
}

/// Harvest a codex run: the terminal event of the stream decides the class;
/// a completed turn's result text is the `-o` last-message file.
pub fn harvest_codex(
    out_jsonl: &str,
    last_message: Option<&str>,
    expected_schema: &str,
    packet_id: &str,
) -> Harvest {
    let mut terminal: Option<Value> = None;
    for line in out_jsonl.lines() {
        if let Ok(v) = serde_json::from_str::<Value>(line) {
            match v.get("type").and_then(Value::as_str) {
                Some("turn.completed") | Some("turn.failed") => terminal = Some(v),
                _ => {}
            }
        }
    }
    let Some(event) = terminal else {
        return Harvest::Transport(
            "transport: codex stream ended with no terminal event".to_owned(),
        );
    };
    if event.get("type").and_then(Value::as_str) == Some("turn.failed") {
        let message = event
            .get("error")
            .and_then(|e| e.get("message"))
            .and_then(Value::as_str)
            .unwrap_or_default();
        if is_transport_message(message) {
            return Harvest::Transport(format!("transport: codex turn failed: {message}"));
        }
        return Harvest::Semantic(format!("codex turn failed: {message}"));
    }
    // A completed turn with no last-message file is a missing result block.
    let Some(text) = last_message else {
        return Harvest::Semantic("no forged-result block".to_owned());
    };
    finish(text, expected_schema, packet_id)
}

/// Harvest a Pi JSON-mode run. A settled stream and its last finalized
/// assistant message are authoritative; streaming deltas and catalogue cost
/// never become result evidence.
pub fn harvest_pi(out_jsonl: &str, expected_schema: &str, packet_id: &str) -> Harvest {
    let mut settled = false;
    let mut last_assistant: Option<Value> = None;
    for line in out_jsonl.lines() {
        let Ok(event) = serde_json::from_str::<Value>(line) else {
            continue;
        };
        match event.get("type").and_then(Value::as_str) {
            Some("agent_settled") => settled = true,
            Some("message_end")
                if event.pointer("/message/role").and_then(Value::as_str) == Some("assistant") =>
            {
                last_assistant = event.get("message").cloned();
            }
            _ => {}
        }
    }
    if !settled {
        return Harvest::Transport("transport: pi stream ended without agent_settled".to_owned());
    }
    let Some(message) = last_assistant else {
        return Harvest::Semantic("pi settled without a final assistant message".to_owned());
    };
    let stop_reason = message
        .get("stopReason")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if matches!(stop_reason, "error" | "aborted") {
        let detail = message
            .get("errorMessage")
            .and_then(Value::as_str)
            .unwrap_or(stop_reason);
        if is_transport_message(detail) || stop_reason == "aborted" {
            return Harvest::Transport(format!("transport: pi {stop_reason}: {detail}"));
        }
        return Harvest::Semantic(format!("pi error: {detail}"));
    }
    let text = message
        .get("content")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter(|part| part.get("type").and_then(Value::as_str) == Some("text"))
        .filter_map(|part| part.get("text").and_then(Value::as_str))
        .collect::<Vec<_>>()
        .join("\n");
    finish(&text, expected_schema, packet_id)
}

fn finish(text: &str, expected_schema: &str, packet_id: &str) -> Harvest {
    match extract_forged_result(text, expected_schema, packet_id) {
        Ok(result) => Harvest::Result(Box::new(result)),
        Err(note) => Harvest::Semantic(note),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_types::{
        Finding, NativeBeadSpecV1, Outcome, PlanTraceabilityV1, ProtocolRef, Severity,
        SpecAmendment, Verdict,
    };
    use serde_json::json;

    const SCHEMA: &str = "forged.result.implement/1";
    const PKT: &str = "run-1/implement/1";

    fn block(json: &str) -> String {
        format!("```forged-result\n{json}\n```\n")
    }

    fn implement_json(packet: &str, schema: &str, commits: u32) -> String {
        implement_json_with_gate_state(packet, schema, commits, json!("pass"))
    }

    fn implement_json_with_gate_state(
        packet: &str,
        schema: &str,
        commits: u32,
        gate_state: Value,
    ) -> String {
        json!({
            "schema": schema,
            "packetId": packet,
            "outcome": {"implement": {
                "implemented": true,
                "commitsAhead": commits,
                "summary": "s",
                "gateState": gate_state,
                "note": null,
            }},
        })
        .to_string()
    }

    fn packet_result(outcome: Outcome) -> PacketResult {
        let schema = match &outcome {
            Outcome::Review { .. } | Outcome::SpecAmendment { .. } => "forged.result.review/1",
            _ => "forged.result.epic-plan/1",
        };
        PacketResult {
            schema: schema.to_owned(),
            packet_id: PKT.to_owned(),
            outcome,
        }
    }

    fn planning_protocol() -> ProtocolRef {
        ProtocolRef {
            name: "epic-plan".to_owned(),
            version: 1,
        }
    }

    fn assurance_protocol() -> ProtocolRef {
        ProtocolRef {
            name: "epic-assurance".to_owned(),
            version: 1,
        }
    }

    fn plan_outcome() -> Outcome {
        Outcome::Plan {
            spec: NativeBeadSpecV1 {
                description: "complete description".to_owned(),
                acceptance_criteria: "observable acceptance".to_owned(),
                design: "bounded design".to_owned(),
                notes: "no scope expansion".to_owned(),
            },
            traceability: PlanTraceabilityV1 {
                assumptions: vec!["the frozen inventory is authoritative".to_owned()],
                requirements: vec!["carry the root outcome forward".to_owned()],
            },
            cruxes: Vec::new(),
        }
    }

    #[test]
    fn extracts_a_single_valid_block() {
        let text = format!("prose\n{}", block(&implement_json(PKT, SCHEMA, 2)));
        let result = extract_forged_result(&text, SCHEMA, PKT).expect("extracts");
        assert_eq!(result.packet_id, PKT);
    }

    #[test]
    fn last_valid_block_wins_and_earlier_malformed_does_not_poison() {
        let text = format!(
            "{}\ncorrection follows\n{}",
            block("{not json"),
            block(&implement_json(PKT, SCHEMA, 3))
        );
        let result = extract_forged_result(&text, SCHEMA, PKT).expect("extracts");
        match result.outcome {
            forged_types::Outcome::Implement { commits_ahead, .. } => assert_eq!(commits_ahead, 3),
            other => panic!("wrong outcome: {other:?}"),
        }
    }

    #[test]
    fn last_of_two_valid_blocks_wins() {
        let text = format!(
            "{}{}",
            block(&implement_json(PKT, SCHEMA, 1)),
            block(&implement_json(PKT, SCHEMA, 9))
        );
        let result = extract_forged_result(&text, SCHEMA, PKT).expect("extracts");
        match result.outcome {
            forged_types::Outcome::Implement { commits_ahead, .. } => assert_eq!(commits_ahead, 9),
            other => panic!("wrong outcome: {other:?}"),
        }
    }

    #[test]
    fn no_block_and_malformed_block_have_the_pinned_notes() {
        assert_eq!(
            extract_forged_result("no fences here", SCHEMA, PKT).unwrap_err(),
            "no forged-result block"
        );
        assert_eq!(
            extract_forged_result(&block("{broken"), SCHEMA, PKT).unwrap_err(),
            "malformed forged-result block"
        );
        // An unclosed fence is not a complete candidate.
        assert_eq!(
            extract_forged_result("```forged-result\n{}", SCHEMA, PKT).unwrap_err(),
            "no forged-result block"
        );
    }

    #[test]
    fn mismatches_fail_semantically_after_selection_never_falling_back() {
        // The LAST valid candidate has a wrong packet id; the earlier valid
        // one matches — selection still takes the last, then fails.
        let text = format!(
            "{}{}",
            block(&implement_json(PKT, SCHEMA, 1)),
            block(&implement_json("other/implement/1", SCHEMA, 1))
        );
        assert_eq!(
            extract_forged_result(&text, SCHEMA, PKT).unwrap_err(),
            "forged-result packetId mismatch"
        );
        let wrong_schema = block(&implement_json(PKT, "forged.result.review/1", 1));
        assert_eq!(
            extract_forged_result(&wrong_schema, SCHEMA, PKT).unwrap_err(),
            "forged-result schema mismatch"
        );
    }

    #[test]
    fn info_string_must_be_exact() {
        let text = "```forged-result extra\n{}\n```\n";
        assert_eq!(
            extract_forged_result(text, SCHEMA, PKT).unwrap_err(),
            "no forged-result block"
        );
    }

    #[test]
    fn transport_markers_are_the_whole_closed_list() {
        for marker in TRANSPORT_MARKERS {
            assert!(is_transport_message(&format!("boom: {marker} hit")));
            assert!(is_transport_message(&marker.to_ascii_uppercase()));
        }
        assert!(!is_transport_message("policy refusal"));
        assert!(!is_transport_message("configuration error"));
    }

    #[test]
    fn claude_stream_with_no_result_record_is_transport() {
        let harvest = harvest_claude("{\"type\":\"system\"}\n", SCHEMA, PKT);
        assert!(matches!(harvest, Harvest::Transport(note) if note.starts_with("transport:")));
    }

    #[test]
    fn claude_error_result_with_marker_is_transport_without_is_semantic() {
        let line = "{\"type\":\"result\",\"is_error\":true,\"result\":\"Rate limit reached\"}";
        assert!(matches!(
            harvest_claude(line, SCHEMA, PKT),
            Harvest::Transport(_)
        ));
        let refusal = "{\"type\":\"result\",\"is_error\":true,\"result\":\"policy refusal\"}";
        assert!(matches!(
            harvest_claude(refusal, SCHEMA, PKT),
            Harvest::Semantic(note) if note == "claude error result: policy refusal"
        ));
    }

    #[test]
    fn an_is_error_result_carrying_a_valid_block_is_still_a_semantic_failure() {
        // The provider said it failed. A valid-looking forged-result block in
        // the same payload does not overrule that: without a transport
        // marker, every is_error result is semantic, and landing the block
        // would turn a refusal into a success.
        let line = format!(
            "{{\"type\":\"result\",\"is_error\":true,\"result\":{},\
             \"error\":{{\"message\":\"policy refusal\"}}}}",
            serde_json::Value::String(block(&implement_json(PKT, SCHEMA, 3)))
        );
        assert!(
            matches!(
                harvest_claude(&line, SCHEMA, PKT),
                Harvest::Semantic(ref note) if note == "claude error result: policy refusal"
            ),
            "got {:?}",
            harvest_claude(&line, SCHEMA, PKT)
        );
    }

    #[test]
    fn claude_error_message_is_a_marker_source_like_codex() {
        // The specified marker source for an is_error result is
        // `error.message`; a timeout carried only there must not become a
        // semantic missing-block failure that consumes the semantic round.
        let line = "{\"type\":\"result\",\"is_error\":true,\"result\":\"see error\",\
                    \"error\":{\"message\":\"Request timeout after 600s\"}}";
        assert!(matches!(
            harvest_claude(line, SCHEMA, PKT),
            Harvest::Transport(note) if note == "transport: claude error result: Request timeout after 600s"
        ));
        // The closed list still decides: a refusal in error.message is
        // semantic.
        let refusal = "{\"type\":\"result\",\"is_error\":true,\"result\":\"\",\
                       \"error\":{\"message\":\"policy refusal\"}}";
        assert!(matches!(
            harvest_claude(refusal, SCHEMA, PKT),
            Harvest::Semantic(note) if note == "claude error result: policy refusal"
        ));
    }

    #[test]
    fn claude_completed_stream_missing_block_is_semantic() {
        let line = "{\"type\":\"result\",\"is_error\":false,\"result\":\"done, no block\"}";
        assert!(matches!(
            harvest_claude(line, SCHEMA, PKT),
            Harvest::Semantic(note) if note == "no forged-result block"
        ));
    }

    #[test]
    fn codex_turn_failed_classification_is_the_closed_list() {
        let failed = "{\"type\":\"turn.failed\",\"error\":{\"message\":\"stream disconnected\"}}";
        assert!(matches!(
            harvest_codex(failed, None, SCHEMA, PKT),
            Harvest::Transport(note) if note == "transport: codex turn failed: stream disconnected"
        ));
        let policy = "{\"type\":\"turn.failed\",\"error\":{\"message\":\"policy refusal\"}}";
        assert!(matches!(
            harvest_codex(policy, None, SCHEMA, PKT),
            Harvest::Semantic(_)
        ));
    }

    #[test]
    fn codex_completed_turn_reads_the_last_message_file() {
        let stream = "{\"type\":\"turn.completed\",\"usage\":{}}";
        let last = block(&implement_json(PKT, SCHEMA, 4));
        assert!(matches!(
            harvest_codex(stream, Some(&last), SCHEMA, PKT),
            Harvest::Result(_)
        ));
        assert!(matches!(
            harvest_codex(stream, None, SCHEMA, PKT),
            Harvest::Semantic(note) if note == "no forged-result block"
        ));
    }

    #[test]
    fn pi_requires_settlement_and_reads_the_last_final_assistant() {
        let result = block(&implement_json(PKT, SCHEMA, 6));
        let stream = [
            json!({"type":"message_end","message":{"role":"assistant","content":[{"type":"text","text":"draft"}],"stopReason":"toolUse"}}),
            json!({"type":"message_end","message":{"role":"assistant","content":[{"type":"text","text":result}],"stopReason":"stop"}}),
            json!({"type":"agent_settled"}),
        ]
        .into_iter()
        .map(|value| value.to_string())
        .collect::<Vec<_>>()
        .join("\n");
        assert!(matches!(
            harvest_pi(&stream, SCHEMA, PKT),
            Harvest::Result(_)
        ));
        assert!(matches!(
            harvest_pi(
                &stream.replace("{\"type\":\"agent_settled\"}", ""),
                SCHEMA,
                PKT
            ),
            Harvest::Transport(_)
        ));
    }

    #[test]
    fn pi_terminal_errors_use_the_closed_transport_markers() {
        for (message, transport) in [("rate limit", true), ("policy refusal", false)] {
            let stream = format!(
                "{}\n{}",
                json!({"type":"message_end","message":{"role":"assistant","content":[],"stopReason":"error","errorMessage":message}}),
                json!({"type":"agent_settled"})
            );
            let harvested = harvest_pi(&stream, SCHEMA, PKT);
            assert_eq!(matches!(harvested, Harvest::Transport(_)), transport);
        }
    }

    #[test]
    fn implement_gate_state_is_exact_and_closed_at_both_harvesters() {
        let stream = "{\"type\":\"turn.completed\",\"usage\":{}}";
        let prose = block(&implement_json_with_gate_state(
            PKT,
            SCHEMA,
            1,
            json!("all five gates pass: build, test, clippy, fmt, docs"),
        ));
        let claude_prose = json!({
            "type": "result",
            "is_error": false,
            "result": prose,
        })
        .to_string();
        let note = "implement result gateState must be exactly \"pass\" or \"fail\", got \
                    \"all five gates pass: build, test, clippy, fmt, docs\"";
        assert!(matches!(
            harvest_claude(&claude_prose, SCHEMA, PKT),
            Harvest::Semantic(actual) if actual == note
        ));
        assert!(matches!(
            harvest_codex(stream, Some(&prose), SCHEMA, PKT),
            Harvest::Semantic(actual) if actual == note
        ));

        for variant in [json!(" Pass "), json!("FAIL\t"), json!("Pass")] {
            let result = block(&implement_json_with_gate_state(PKT, SCHEMA, 1, variant));
            let claude = json!({
                "type": "result",
                "is_error": false,
                "result": result,
            })
            .to_string();
            for harvested in [
                harvest_claude(&claude, SCHEMA, PKT),
                harvest_codex(stream, Some(&result), SCHEMA, PKT),
            ] {
                assert!(
                    matches!(harvested, Harvest::Semantic(ref note)
                        if note.contains("must be exactly")),
                    "a case or whitespace variant refuses, never rewrites: {harvested:?}"
                );
            }
        }

        for (gate_state, expected) in [
            (json!("pass"), Some("pass")),
            (json!("fail"), Some("fail")),
            (Value::Null, None),
        ] {
            let result = block(&implement_json_with_gate_state(PKT, SCHEMA, 1, gate_state));
            let claude = json!({
                "type": "result",
                "is_error": false,
                "result": result,
            })
            .to_string();
            for harvested in [
                harvest_claude(&claude, SCHEMA, PKT),
                harvest_codex(stream, Some(&result), SCHEMA, PKT),
            ] {
                let Harvest::Result(result) = harvested else {
                    panic!("normalized gateState was not harvested: {harvested:?}");
                };
                let forged_types::Outcome::Implement { gate_state, .. } = &result.outcome else {
                    panic!("wrong outcome: {:?}", result.outcome);
                };
                assert_eq!(gate_state.as_deref(), expected);
            }
        }
    }

    #[test]
    fn plan_outcome_requires_frozen_epic_plan_authority_and_purpose() {
        let result = packet_result(plan_outcome());
        let protocol = planning_protocol();
        assert!(validate_result_for_packet(
            &result,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Implement)
        )
        .is_ok());
        for (authority, purpose) in [
            (None, Some(forged_types::SeatPurpose::Implement)),
            (Some(&protocol), Some(forged_types::SeatPurpose::Review)),
        ] {
            assert!(validate_result_for_packet(&result, authority, purpose)
                .expect_err("ordinary or critic packet must reject plan")
                .contains("frozen epic-plan/v1"));
        }
    }

    #[test]
    fn planning_critique_requires_actionable_findings_or_typed_amendment() {
        let protocol = planning_protocol();
        let empty = packet_result(Outcome::Review {
            verdict: Verdict::RequestChanges,
            summary: "needs revision".to_owned(),
            findings: Vec::new(),
            available: true,
        });
        assert!(validate_result_for_packet(
            &empty,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Review)
        )
        .expect_err("empty requestChanges must fail")
        .contains("actionable finding"));

        let actionable = packet_result(Outcome::Review {
            verdict: Verdict::RequestChanges,
            summary: "needs revision".to_owned(),
            findings: vec![Finding {
                severity: Severity::High,
                file: None,
                line: None,
                message: "Requirement R1 has no acceptance observation; add the exact readback"
                    .to_owned(),
            }],
            available: true,
        });
        assert!(validate_result_for_packet(
            &actionable,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Synthesis)
        )
        .is_ok());

        let block = packet_result(Outcome::Review {
            verdict: Verdict::Block,
            summary: "root authority conflicts".to_owned(),
            findings: vec![Finding {
                severity: Severity::Blocker,
                file: None,
                line: None,
                message: "The frozen root excludes the requested mutation".to_owned(),
            }],
            available: true,
        });
        assert!(validate_result_for_packet(
            &block,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Review)
        )
        .expect_err("generic Block must fail")
        .contains("typed specAmendment"));

        let amendment = packet_result(Outcome::SpecAmendment {
            amendment: SpecAmendment {
                summary: "root authority conflicts".to_owned(),
                evidence: "the frozen root excludes dependency mutation".to_owned(),
                proposed_change: "authorize dependency mutation or remove the requirement"
                    .to_owned(),
            },
        });
        assert!(validate_result_for_packet(
            &amendment,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Review)
        )
        .is_ok());
    }

    #[test]
    fn assurance_approve_rejects_blocker_and_high_findings() {
        let protocol = assurance_protocol();
        for severity in [Severity::Blocker, Severity::High] {
            let result = packet_result(Outcome::Review {
                verdict: Verdict::Approve,
                summary: "looks good".to_owned(),
                findings: vec![Finding {
                    severity,
                    file: Some("src/lib.rs".to_owned()),
                    line: Some(42),
                    message: "unresolved defect".to_owned(),
                }],
                available: true,
            });
            assert!(validate_result_for_packet(
                &result,
                Some(&protocol),
                Some(forged_types::SeatPurpose::Review)
            )
            .expect_err("approve must not conceal severe findings")
            .contains("cannot carry blocker or high"));
        }

        let low = packet_result(Outcome::Review {
            verdict: Verdict::Approve,
            summary: "safe to land".to_owned(),
            findings: vec![Finding {
                severity: Severity::Low,
                file: None,
                line: None,
                message: "non-blocking cleanup".to_owned(),
            }],
            available: true,
        });
        assert!(validate_result_for_packet(
            &low,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Synthesis)
        )
        .is_ok());
    }

    #[test]
    fn assurance_request_changes_requires_actionable_findings() {
        let protocol = assurance_protocol();
        for findings in [
            Vec::new(),
            vec![Finding {
                severity: Severity::High,
                file: None,
                line: None,
                message: "  ".to_owned(),
            }],
        ] {
            let result = packet_result(Outcome::Review {
                verdict: Verdict::RequestChanges,
                summary: "needs work".to_owned(),
                findings,
                available: true,
            });
            assert!(validate_result_for_packet(
                &result,
                Some(&protocol),
                Some(forged_types::SeatPurpose::Review)
            )
            .expect_err("empty findings are not actionable")
            .contains("actionable finding"));
        }

        let actionable = packet_result(Outcome::Review {
            verdict: Verdict::RequestChanges,
            summary: "gate evidence exposes a failure".to_owned(),
            findings: vec![Finding {
                severity: Severity::High,
                file: Some("gate:cargo test --workspace".to_owned()),
                line: None,
                message: "command exited 101; fix the failing assertion".to_owned(),
            }],
            available: true,
        });
        assert!(validate_result_for_packet(
            &actionable,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Synthesis)
        )
        .is_ok());
    }

    #[test]
    fn assurance_block_requires_a_complete_typed_spec_amendment() {
        let protocol = assurance_protocol();
        let block = packet_result(Outcome::Review {
            verdict: Verdict::Block,
            summary: "root authority conflicts".to_owned(),
            findings: Vec::new(),
            available: true,
        });
        assert!(validate_result_for_packet(
            &block,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Review)
        )
        .expect_err("block is not a typed input stop")
        .contains("typed specAmendment"));

        let incomplete = packet_result(Outcome::SpecAmendment {
            amendment: SpecAmendment {
                summary: "root authority conflicts".to_owned(),
                evidence: " ".to_owned(),
                proposed_change: "authorize the mutation".to_owned(),
            },
        });
        assert!(validate_result_for_packet(
            &incomplete,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Synthesis)
        )
        .expect_err("an empty amendment field must fail")
        .contains("summary, evidence, and proposedChange"));

        let complete = packet_result(Outcome::SpecAmendment {
            amendment: SpecAmendment {
                summary: "root authority conflicts".to_owned(),
                evidence: "the frozen root excludes dependency mutation".to_owned(),
                proposed_change: "authorize dependency mutation or drop the criterion".to_owned(),
            },
        });
        assert!(validate_result_for_packet(
            &complete,
            Some(&protocol),
            Some(forged_types::SeatPurpose::Review)
        )
        .is_ok());
    }
}
