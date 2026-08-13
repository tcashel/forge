//! Golden tests for the codex stdout usage parser (acceptance criterion 9
//! and the turn.failed half of criterion 10).

use forged_provider::{CodexDriver, PricingBasis, ProviderDriver, ProviderError};

const TURN_COMPLETED: &str = include_str!("fixtures/codex_turn_completed.jsonl");
const NO_CACHE_WRITE: &str = include_str!("fixtures/codex_no_cache_write.jsonl");
const TURN_FAILED: &str = include_str!("fixtures/codex_turn_failed.jsonl");

#[test]
fn turn_completed_yields_one_subscription_priced_row() {
    let capture = CodexDriver
        .parse_usage(TURN_COMPLETED, "gpt-5.6-sol")
        .expect("parses");
    assert_eq!(
        capture.session_ref.as_deref(),
        Some("019fee60-9ea6-72f0-a546-1976ad9aef17")
    );
    assert_eq!(capture.rows.len(), 1);
    let row = &capture.rows[0];
    assert_eq!(row.provider, "codex");
    assert_eq!(row.model, "gpt-5.6-sol");
    // 22170 total prompt tokens, 11008 of them cache reads: the row
    // stores the 11162 that were billed at the uncached rate.
    assert_eq!(row.input_tokens, 11162);
    assert_eq!(row.cache_read_tokens, Some(11008));
    assert_eq!(row.cache_write_tokens, Some(0));
    assert_eq!(row.output_tokens, 5);
    assert_eq!(row.cost_usd, None);
    assert_eq!(row.pricing_basis, PricingBasis::None);
    assert_eq!(row.rate_limit_used_percent, None);
}

#[test]
fn absent_cache_write_field_maps_to_none() {
    let capture = CodexDriver
        .parse_usage(NO_CACHE_WRITE, "gpt-5.6-sol")
        .expect("parses");
    assert_eq!(capture.rows.len(), 1);
    let row = &capture.rows[0];
    assert_eq!(row.cache_write_tokens, None);
    assert_eq!(row.input_tokens, 10095);
    assert_eq!(row.cache_read_tokens, Some(4480));
    assert_eq!(row.output_tokens, 6);
}

#[test]
fn the_three_input_buckets_partition_the_prompt() {
    // Codex reports cached_input_tokens as a SUBSET of input_tokens;
    // claude reports its buckets disjoint. UsageRow stores one convention
    // — disjoint — so that a cross-provider sum and every cost derived
    // from it mean the same thing on both sides.
    let capture = CodexDriver
        .parse_usage(TURN_COMPLETED, "m")
        .expect("parses");
    let row = &capture.rows[0];
    assert_eq!(
        row.input_tokens + row.cache_read_tokens.unwrap_or(0) + row.cache_write_tokens.unwrap_or(0),
        22170,
        "the buckets add back up to the reported prompt total"
    );
}

#[test]
fn cache_subsets_exceeding_the_input_total_are_malformed() {
    // Clamping would understate the uncached tokens, which are the most
    // expensive of the three buckets.
    let stdout = concat!(
        "{\"type\":\"thread.started\",\"thread_id\":\"bad-t\"}\n",
        "{\"type\":\"turn.completed\",\"usage\":{\"input_tokens\":10,",
        "\"cached_input_tokens\":8,\"cache_write_input_tokens\":5,\"output_tokens\":1}}\n",
    );
    let error = CodexDriver
        .parse_usage(stdout, "m")
        .expect_err("subsets cannot exceed their total");
    assert!(
        matches!(error, ProviderError::Malformed { .. }),
        "got {error:?}"
    );
}

#[test]
fn turn_failed_yields_zero_rows_with_the_thread_id() {
    let capture = CodexDriver
        .parse_usage(TURN_FAILED, "gpt-5.6-sol")
        .expect("a failed turn is not a parse error");
    assert_eq!(
        capture.session_ref.as_deref(),
        Some("019fee71-c88f-70f0-bc8c-a5f35827deb4")
    );
    assert!(capture.rows.is_empty());
}

#[test]
fn empty_stdout_yields_zero_rows() {
    let capture = CodexDriver.parse_usage("", "m").expect("parses");
    assert_eq!(capture.session_ref, None);
    assert!(capture.rows.is_empty());
}

#[test]
fn duplicate_turn_completed_events_keep_the_last() {
    let stdout = concat!(
        "{\"type\":\"thread.started\",\"thread_id\":\"dup-t\"}\n",
        "{\"type\":\"turn.completed\",\"usage\":{\"input_tokens\":1,\"cached_input_tokens\":1,\"output_tokens\":1}}\n",
        "{\"type\":\"turn.completed\",\"usage\":{\"input_tokens\":9,\"cached_input_tokens\":8,\"output_tokens\":7}}\n",
    );
    let capture = CodexDriver
        .parse_usage(stdout, "m")
        .expect("duplicates are never Malformed");
    assert_eq!(capture.rows.len(), 1);
    assert_eq!(capture.rows[0].input_tokens, 1);
    assert_eq!(capture.rows[0].cache_read_tokens, Some(8));
    assert_eq!(capture.rows[0].output_tokens, 7);
}

#[test]
fn turn_completed_without_usage_omits_the_row() {
    let stdout =
        "{\"type\":\"thread.started\",\"thread_id\":\"bare-t\"}\n{\"type\":\"turn.completed\"}\n";
    let capture = CodexDriver
        .parse_usage(stdout, "m")
        .expect("absence is data");
    assert_eq!(capture.session_ref.as_deref(), Some("bare-t"));
    assert!(capture.rows.is_empty());
}

#[test]
fn wrong_typed_token_field_is_malformed() {
    let stdout = "{\"type\":\"turn.completed\",\"usage\":{\"input_tokens\":-1,\"cached_input_tokens\":1,\"output_tokens\":1}}\n";
    let err = CodexDriver
        .parse_usage(stdout, "m")
        .expect_err("a negative token count is malformed");
    assert!(matches!(err, ProviderError::Malformed { .. }), "{err}");
}

#[test]
fn non_json_lines_are_skipped_never_an_error() {
    let stdout = format!("not json\n{TURN_COMPLETED}");
    let capture = CodexDriver.parse_usage(&stdout, "m").expect("parses");
    assert_eq!(capture.rows.len(), 1);
}
