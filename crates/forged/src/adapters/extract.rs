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
    Ok(result)
}

/// Harvest a claude run: the final `type=result` record of the stream-json
/// capture holds the result text. A stream with no final result record is a
/// transport failure; an `is_error` result whose message carries a
/// transport marker is transport; every other shape falls through to
/// extraction.
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
    if result.get("is_error").and_then(Value::as_bool) == Some(true) && is_transport_message(text) {
        return Harvest::Transport(format!("transport: claude error result: {text}"));
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

fn finish(text: &str, expected_schema: &str, packet_id: &str) -> Harvest {
    match extract_forged_result(text, expected_schema, packet_id) {
        Ok(result) => Harvest::Result(Box::new(result)),
        Err(note) => Harvest::Semantic(note),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SCHEMA: &str = "forged.result.implement/1";
    const PKT: &str = "run-1/implement/1";

    fn block(json: &str) -> String {
        format!("```forged-result\n{json}\n```\n")
    }

    fn implement_json(packet: &str, schema: &str, commits: u32) -> String {
        format!(
            "{{\"schema\": \"{schema}\", \"packetId\": \"{packet}\", \"outcome\": \
             {{\"implement\": {{\"implemented\": true, \"commitsAhead\": {commits}, \
             \"summary\": \"s\", \"gateState\": \"pass\", \"note\": null}}}}}}"
        )
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
            Harvest::Semantic(note) if note == "no forged-result block"
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
}
