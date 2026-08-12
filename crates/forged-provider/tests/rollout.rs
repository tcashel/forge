//! Golden tests for codex rollout recovery (acceptance criterion 10).

use std::path::Path;

use forged_provider::{recover_usage_from_rollout, PricingBasis, ProviderError};

const THREAD_ID: &str = "019fee71-c88f-70f0-bc8c-a5f35827deb4";
const ROLLOUT: &str = include_str!("fixtures/rollout_token_count.jsonl");

/// The canonical relative rollout path for [`THREAD_ID`].
fn rollout_rel(root: &str) -> String {
    format!("{root}/2026/08/10/rollout-2026-08-10T21-31-02-{THREAD_ID}.jsonl")
}

fn seed(codex_home: &Path, rel: &str, content: &str) {
    let path = codex_home.join(rel);
    std::fs::create_dir_all(path.parent().expect("has parent")).expect("mkdir");
    std::fs::write(path, content).expect("write fixture");
}

fn assert_canonical_row(capture: &forged_provider::UsageCapture, model: &str) {
    assert_eq!(capture.session_ref.as_deref(), Some(THREAD_ID));
    assert_eq!(capture.rows.len(), 1);
    let row = &capture.rows[0];
    assert_eq!(row.provider, "codex");
    assert_eq!(row.model, model);
    assert_eq!(row.input_tokens, 22170);
    assert_eq!(row.cache_read_tokens, Some(6912));
    assert_eq!(row.cache_write_tokens, Some(0));
    assert_eq!(row.output_tokens, 5);
    assert_eq!(row.cost_usd, None);
    assert_eq!(row.pricing_basis, PricingBasis::None);
    assert_eq!(row.rate_limit_used_percent, Some(0.0));
}

#[tokio::test]
async fn recovers_from_the_sessions_root() {
    let home = tempfile::tempdir().expect("tempdir");
    seed(home.path(), &rollout_rel("sessions"), ROLLOUT);
    let capture = recover_usage_from_rollout(home.path(), THREAD_ID, "gpt-5.6-sol")
        .await
        .expect("recovers");
    assert_canonical_row(&capture, "gpt-5.6-sol");
}

#[tokio::test]
async fn recovers_from_archived_sessions_when_sessions_is_empty() {
    let home = tempfile::tempdir().expect("tempdir");
    seed(home.path(), &rollout_rel("archived_sessions"), ROLLOUT);
    let capture = recover_usage_from_rollout(home.path(), THREAD_ID, "gpt-5.6-sol")
        .await
        .expect("recovers");
    assert_canonical_row(&capture, "gpt-5.6-sol");
}

#[tokio::test]
async fn absent_rollout_is_rollout_not_found() {
    let home = tempfile::tempdir().expect("tempdir");
    let err = recover_usage_from_rollout(home.path(), THREAD_ID, "m")
        .await
        .expect_err("nothing seeded");
    assert!(
        matches!(err, ProviderError::RolloutNotFound { .. }),
        "{err}"
    );
}

#[tokio::test]
async fn missing_codex_home_is_rollout_not_found() {
    let err = recover_usage_from_rollout(
        Path::new("/nonexistent/forged-provider-test-home"),
        THREAD_ID,
        "m",
    )
    .await
    .expect_err("home does not exist");
    assert!(
        matches!(err, ProviderError::RolloutNotFound { .. }),
        "{err}"
    );
}

#[tokio::test]
async fn identity_invalid_match_is_skipped_and_the_walk_continues() {
    let home = tempfile::tempdir().expect("tempdir");
    // A filename match in sessions/ whose session_meta names a DIFFERENT
    // id: identity fails, the walk continues, and the identity-valid copy
    // under archived_sessions/ is the one recovered.
    let imposter = ROLLOUT
        .replace(THREAD_ID, "ffffffff-0000-0000-0000-000000000000")
        .replace("\"output_tokens\":5", "\"output_tokens\":999");
    let imposter_path = rollout_rel("sessions");
    seed(home.path(), &imposter_path, &imposter);
    seed(home.path(), &rollout_rel("archived_sessions"), ROLLOUT);
    let capture = recover_usage_from_rollout(home.path(), THREAD_ID, "m")
        .await
        .expect("the archived copy is identity-valid");
    assert_canonical_row(&capture, "m");
}

#[tokio::test]
async fn first_identity_valid_match_in_walk_order_wins() {
    let home = tempfile::tempdir().expect("tempdir");
    let later = ROLLOUT.replace("\"output_tokens\":5", "\"output_tokens\":777");
    seed(
        home.path(),
        &format!("sessions/2026/08/09/rollout-2026-08-09T09-00-00-{THREAD_ID}.jsonl"),
        ROLLOUT,
    );
    seed(
        home.path(),
        &format!("sessions/2026/08/10/rollout-2026-08-10T21-31-02-{THREAD_ID}.jsonl"),
        &later,
    );
    let capture = recover_usage_from_rollout(home.path(), THREAD_ID, "m")
        .await
        .expect("recovers");
    // 2026/08/09 sorts before 2026/08/10, so the earlier file wins and the
    // later one is never read.
    assert_canonical_row(&capture, "m");
}

#[tokio::test]
async fn session_meta_with_only_the_id_key_passes_the_identity_check() {
    let home = tempfile::tempdir().expect("tempdir");
    let mut lines: Vec<String> = ROLLOUT.lines().map(str::to_owned).collect();
    let mut meta: serde_json::Value = serde_json::from_str(&lines[0]).expect("session_meta parses");
    meta["payload"]
        .as_object_mut()
        .expect("payload object")
        .remove("session_id");
    lines[0] = serde_json::to_string(&meta).expect("re-serializes");
    seed(home.path(), &rollout_rel("sessions"), &lines.join("\n"));
    let capture = recover_usage_from_rollout(home.path(), THREAD_ID, "m")
        .await
        .expect("pre-0.146 rollouts carry only payload.id");
    assert_canonical_row(&capture, "m");
}

#[tokio::test]
async fn identity_valid_file_without_usable_usage_yields_zero_rows() {
    let home = tempfile::tempdir().expect("tempdir");
    let lines: Vec<&str> = ROLLOUT.lines().collect();
    let null_info = "{\"timestamp\":\"2026-08-11T01:31:07.000Z\",\"type\":\"event_msg\",\
                     \"payload\":{\"type\":\"token_count\",\"info\":null,\
                     \"rate_limits\":{\"limit_id\":\"codex\",\
                     \"primary\":{\"used_percent\":12.5,\"window_minutes\":10080},\
                     \"plan_type\":\"pro\"}}}";
    let truncated = format!("{}\n{}\n{null_info}\n", lines[0], lines[1]);
    seed(home.path(), &rollout_rel("sessions"), &truncated);
    let capture = recover_usage_from_rollout(home.path(), THREAD_ID, "m")
        .await
        .expect("absent usage is data, not an error");
    assert_eq!(capture.session_ref.as_deref(), Some(THREAD_ID));
    assert!(capture.rows.is_empty());
}

#[tokio::test]
async fn null_info_final_line_does_not_shadow_earlier_usage() {
    // Real rollouts often end with a token_count whose info is null and
    // that carries only rate_limits: the usage comes from the last
    // NON-null info, the rate limit from the last line carrying one.
    let home = tempfile::tempdir().expect("tempdir");
    let null_info_tail = "{\"timestamp\":\"2026-08-11T01:31:07.000Z\",\"type\":\"event_msg\",\
                          \"payload\":{\"type\":\"token_count\",\"info\":null,\
                          \"rate_limits\":{\"limit_id\":\"codex\",\
                          \"primary\":{\"used_percent\":33.0,\"window_minutes\":10080},\
                          \"plan_type\":\"pro\"}}}";
    seed(
        home.path(),
        &rollout_rel("sessions"),
        &format!("{ROLLOUT}{null_info_tail}\n"),
    );
    let capture = recover_usage_from_rollout(home.path(), THREAD_ID, "m")
        .await
        .expect("recovers");
    assert_eq!(capture.rows.len(), 1);
    assert_eq!(capture.rows[0].input_tokens, 22170);
    assert_eq!(capture.rows[0].rate_limit_used_percent, Some(33.0));
}

#[tokio::test]
async fn traversal_shaped_thread_id_is_rejected_before_searching() {
    let err = recover_usage_from_rollout(Path::new("/nonexistent"), "../escape", "m")
        .await
        .expect_err("a traversal thread id must be refused");
    assert!(
        matches!(err, ProviderError::UnsafeShellLine { .. }),
        "{err}"
    );
}
