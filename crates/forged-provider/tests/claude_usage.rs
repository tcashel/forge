//! Golden tests for the claude usage parser (acceptance criteria 6-8).

use forged_provider::{ClaudeDriver, PricingBasis, ProviderDriver, ProviderError};

const BASIC: &str = include_str!("fixtures/claude_result_basic.jsonl");
const MULTI: &str = include_str!("fixtures/claude_result_multi_model.jsonl");
const ERROR: &str = include_str!("fixtures/claude_result_error.jsonl");
const NO_RESULT: &str = include_str!("fixtures/claude_no_result.jsonl");

#[test]
fn basic_result_without_model_usage_yields_one_fallback_row() {
    let capture = ClaudeDriver
        .parse_usage(BASIC, "fallback-model")
        .expect("parses");
    assert_eq!(capture.session_ref.as_deref(), Some("abc123"));
    assert_eq!(capture.rows.len(), 1);
    let row = &capture.rows[0];
    assert_eq!(row.provider, "claude");
    assert_eq!(row.model, "fallback-model");
    assert_eq!(row.input_tokens, 5);
    assert_eq!(row.output_tokens, 6);
    assert_eq!(row.cache_read_tokens, Some(16591));
    assert_eq!(row.cache_write_tokens, Some(9396));
    let cost = row.cost_usd.expect("billed cost present");
    assert!((cost - 0.0675945).abs() < 1e-9, "cost was {cost}");
    assert_eq!(row.pricing_basis, PricingBasis::Billed);
    assert_eq!(row.rate_limit_used_percent, None);
}

#[test]
fn multi_model_result_yields_one_sorted_row_per_key() {
    let capture = ClaudeDriver
        .parse_usage(MULTI, "fallback-model")
        .expect("parses");
    assert_eq!(capture.session_ref.as_deref(), Some("multi-1"));
    let models: Vec<&str> = capture.rows.iter().map(|r| r.model.as_str()).collect();
    assert_eq!(models, vec!["claude-fable-5", "claude-haiku-3-5"]);
    for row in &capture.rows {
        assert_eq!(row.provider, "claude");
        assert_eq!(row.pricing_basis, PricingBasis::Billed);
    }
    let fable = &capture.rows[0];
    assert_eq!(fable.input_tokens, 2);
    assert_eq!(fable.output_tokens, 26);
    assert_eq!(fable.cache_read_tokens, Some(16084));
    assert_eq!(fable.cache_write_tokens, Some(14281));
    assert!((fable.cost_usd.expect("cost") - 0.30302399999999996).abs() < 1e-9);
    let haiku = &capture.rows[1];
    assert_eq!(haiku.input_tokens, 3);
    assert_eq!(haiku.output_tokens, 12);
    assert_eq!(haiku.cache_read_tokens, Some(100));
    assert_eq!(haiku.cache_write_tokens, Some(0));
    assert!((haiku.cost_usd.expect("cost") - 0.003).abs() < 1e-9);
    let sum: f64 = capture.rows.iter().filter_map(|r| r.cost_usd).sum();
    assert!(
        (sum - 0.30602399999999996).abs() < 1e-9,
        "row costs must sum to total_cost_usd, got {sum}"
    );
}

#[test]
fn error_result_with_null_cost_yields_a_costless_row() {
    let capture = ClaudeDriver
        .parse_usage(ERROR, "fallback-model")
        .expect("parses");
    assert_eq!(capture.session_ref.as_deref(), Some("err1"));
    assert_eq!(capture.rows.len(), 1);
    let row = &capture.rows[0];
    assert_eq!(row.cost_usd, None);
    assert_eq!(row.pricing_basis, PricingBasis::None);
    assert_eq!(row.input_tokens, 0);
    assert_eq!(row.output_tokens, 0);
}

#[test]
fn no_result_event_yields_zero_rows_with_the_earlier_session_id() {
    let capture = ClaudeDriver
        .parse_usage(NO_RESULT, "fallback-model")
        .expect("a killed session is not an error");
    assert_eq!(capture.session_ref.as_deref(), Some("abc123"));
    assert!(capture.rows.is_empty());
}

#[test]
fn empty_stdout_yields_zero_rows_and_no_session() {
    let capture = ClaudeDriver.parse_usage("", "m").expect("parses");
    assert_eq!(capture.session_ref, None);
    assert!(capture.rows.is_empty());
}

#[test]
fn non_json_lines_are_skipped_never_an_error() {
    let stdout = format!("garbage line\n[1,2,3]\n42\n{BASIC}");
    let capture = ClaudeDriver
        .parse_usage(&stdout, "fallback-model")
        .expect("parses");
    assert_eq!(capture.rows.len(), 1);
}

#[test]
fn duplicate_result_events_keep_the_last() {
    let first = r#"{"type":"result","session_id":"dup-1","total_cost_usd":0.1,"usage":{"input_tokens":1,"output_tokens":1,"cache_read_input_tokens":1,"cache_creation_input_tokens":1}}"#;
    let second = r#"{"type":"result","session_id":"dup-1","total_cost_usd":0.2,"usage":{"input_tokens":10,"output_tokens":20,"cache_read_input_tokens":30,"cache_creation_input_tokens":40}}"#;
    let capture = ClaudeDriver
        .parse_usage(&format!("{first}\n{second}\n"), "m")
        .expect("duplicates are never Malformed");
    assert_eq!(capture.rows.len(), 1);
    let row = &capture.rows[0];
    assert_eq!(row.input_tokens, 10);
    assert_eq!(row.output_tokens, 20);
    assert_eq!(row.cache_read_tokens, Some(30));
    assert_eq!(row.cache_write_tokens, Some(40));
}

#[test]
fn result_without_usage_omits_the_row() {
    let stdout = r#"{"type":"result","session_id":"bare-1"}"#;
    let capture = ClaudeDriver
        .parse_usage(stdout, "m")
        .expect("absence is data");
    assert_eq!(capture.session_ref.as_deref(), Some("bare-1"));
    assert!(capture.rows.is_empty());
}

#[test]
fn wrong_typed_token_field_is_malformed() {
    let stdout = r#"{"type":"result","session_id":"bad-1","usage":{"input_tokens":"5","output_tokens":6,"cache_read_input_tokens":7}}"#;
    let err = ClaudeDriver
        .parse_usage(stdout, "m")
        .expect_err("a string token count is malformed");
    assert!(matches!(err, ProviderError::Malformed { .. }), "{err}");
}

#[test]
fn missing_required_token_field_is_malformed() {
    let stdout =
        r#"{"type":"result","session_id":"bad-2","usage":{"input_tokens":5,"output_tokens":6}}"#;
    let err = ClaudeDriver
        .parse_usage(stdout, "m")
        .expect_err("a missing cache-read field is malformed");
    assert!(matches!(err, ProviderError::Malformed { .. }), "{err}");
}

#[test]
fn absent_cache_write_field_maps_to_none() {
    let stdout = r#"{"type":"result","session_id":"nc-1","total_cost_usd":0.5,"usage":{"input_tokens":5,"output_tokens":6,"cache_read_input_tokens":7}}"#;
    let capture = ClaudeDriver.parse_usage(stdout, "m").expect("parses");
    assert_eq!(capture.rows[0].cache_write_tokens, None);
    assert_eq!(capture.rows[0].pricing_basis, PricingBasis::Billed);
}

#[test]
fn model_usage_key_without_cost_degrades_that_row_only() {
    let stdout = r#"{"type":"result","session_id":"mm-2","total_cost_usd":0.4,"modelUsage":{"model-b":{"inputTokens":1,"outputTokens":2,"cacheReadInputTokens":3},"model-a":{"inputTokens":4,"outputTokens":5,"cacheReadInputTokens":6,"costUSD":0.4}}}"#;
    let capture = ClaudeDriver.parse_usage(stdout, "m").expect("parses");
    let models: Vec<&str> = capture.rows.iter().map(|r| r.model.as_str()).collect();
    assert_eq!(models, vec!["model-a", "model-b"], "rows sort by model");
    assert_eq!(capture.rows[0].pricing_basis, PricingBasis::Billed);
    assert_eq!(capture.rows[0].cost_usd, Some(0.4));
    assert_eq!(capture.rows[1].pricing_basis, PricingBasis::None);
    assert_eq!(capture.rows[1].cost_usd, None);
    assert_eq!(capture.rows[1].cache_write_tokens, None);
}

#[test]
fn empty_model_usage_falls_back_to_the_single_row_branch() {
    let stdout = r#"{"type":"result","session_id":"mm-3","total_cost_usd":0.7,"modelUsage":{},"usage":{"input_tokens":1,"output_tokens":2,"cache_read_input_tokens":3}}"#;
    let capture = ClaudeDriver
        .parse_usage(stdout, "fallback")
        .expect("parses");
    assert_eq!(capture.rows.len(), 1);
    assert_eq!(capture.rows[0].model, "fallback");
    assert_eq!(capture.rows[0].cost_usd, Some(0.7));
}

#[test]
fn server_tool_use_supplies_the_single_row_web_search_count() {
    // Web search is billed per call, not per token, so the count rides
    // beside the token buckets rather than inside them.
    let stdout = concat!(
        r#"{"type":"result","subtype":"success","session_id":"s","total_cost_usd":0.5,"#,
        r#""usage":{"input_tokens":5,"cache_read_input_tokens":1,"output_tokens":2,"#,
        r#""server_tool_use":{"web_search_requests":7,"web_fetch_requests":3}}}"#,
        "\n",
    );
    let capture = ClaudeDriver.parse_usage(stdout, "opus").expect("parses");
    assert_eq!(capture.rows[0].web_search_requests, Some(7));
}

#[test]
fn a_capture_that_never_counted_searches_reports_none_not_zero() {
    let capture = ClaudeDriver.parse_usage(BASIC, "opus").expect("parses");
    assert_eq!(
        capture.rows[0].web_search_requests, None,
        "absence is data: the capture did not say zero, it said nothing"
    );
}
