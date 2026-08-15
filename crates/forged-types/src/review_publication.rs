//! Closed wire contracts for publishing durable review findings to a slice PR.

use serde::{Deserialize, Serialize};

/// Parse one canonical github.com pull-request URL into its `owner/repository`
/// slug while proving the path number agrees with durable operation evidence.
pub fn github_repository_from_pr_url(url: &str, expected_number: u64) -> Option<String> {
    let rest = url.strip_prefix("https://github.com/")?;
    if rest.contains(['?', '#']) || rest.ends_with('/') {
        return None;
    }
    let parts: Vec<_> = rest.split('/').collect();
    if parts.len() != 4
        || parts[2] != "pull"
        || parts[3] != expected_number.to_string()
        || expected_number == 0
    {
        return None;
    }
    let owner = parts[0];
    let repository = parts[1];
    let valid_owner = !owner.is_empty()
        && owner.len() <= 39
        && owner
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
        && owner
            .as_bytes()
            .first()
            .is_some_and(u8::is_ascii_alphanumeric)
        && owner
            .as_bytes()
            .last()
            .is_some_and(u8::is_ascii_alphanumeric);
    let valid_repository = !repository.is_empty()
        && repository.len() <= 100
        && repository != "."
        && repository != ".."
        && repository
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.'));
    (valid_owner && valid_repository).then(|| format!("{owner}/{repository}"))
}

/// The immutable review epoch selected for publication.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ReviewEpochKind {
    /// Definition-backed review/synthesis seat round.
    SemanticRound,
    /// Legacy review packet sequence.
    LegacySeq,
}

impl ReviewEpochKind {
    /// Stable storage and wire spelling.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::SemanticRound => "semantic-round",
            Self::LegacySeq => "legacy-seq",
        }
    }
}

/// Exact immutable review epoch identity.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ReviewEpochV1 {
    pub kind: ReviewEpochKind,
    pub value: u64,
    pub id: String,
}

/// Durable GitHub pull-request target selected from draft-PR operation evidence.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ReviewPublicationTargetV1 {
    pub repository: String,
    pub number: u64,
    pub url: String,
}

/// Why a successful publication invocation intentionally made no mutation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ReviewPublicationNoop {
    NoPullRequest,
    NoReviewEpoch,
    NoFindings,
}

/// Per-finding outcome of one publication invocation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ReviewPublicationFindingStatus {
    /// This invocation posted the marker-bearing comment.
    Posted,
    /// This invocation observed the exact marker and recorded delivery.
    AlreadyPresent,
    /// Delivery was already durable, so this invocation made no GitHub call.
    Delivered,
    /// A definite pre-effect observation failed and is safe to retry.
    Retryable,
    /// A POST may have taken effect; the next invocation must observe first.
    Uncertain,
}

/// One finding's bounded publication result.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ReviewPublicationFindingV1 {
    pub finding_id: String,
    pub status: ReviewPublicationFindingStatus,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// Closed result returned by CLI and MCP review publication.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ReviewPublicationV1 {
    pub schema: String,
    pub run_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pull_request: Option<ReviewPublicationTargetV1>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_epoch: Option<ReviewEpochV1>,
    pub snapshot_sha256: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub noop: Option<ReviewPublicationNoop>,
    pub total: u64,
    pub posted: u64,
    pub already_present: u64,
    pub delivered: u64,
    pub retryable: u64,
    pub uncertain: u64,
    pub findings: Vec<ReviewPublicationFindingV1>,
}

/// The only review-publication result schema understood by this binary.
pub const REVIEW_PUBLICATION_SCHEMA_V1: &str = "forged.review-publication/1";

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{github_repository_from_pr_url, ReviewPublicationV1};

    #[test]
    fn canonical_pr_url_parser_rejects_path_aliases() {
        assert_eq!(
            github_repository_from_pr_url("https://github.com/acme/widget/pull/42", 42),
            Some("acme/widget".to_owned())
        );
        for url in [
            "https://github.com/../widget/pull/42",
            "https://github.com/acme/../pull/42",
            "https://github.com/acme/widget/pull/042",
            "https://github.com/-acme/widget/pull/42",
        ] {
            assert_eq!(github_repository_from_pr_url(url, 42), None, "{url}");
        }
    }

    #[test]
    fn result_contract_rejects_unknown_fields() {
        let value = json!({
            "schema": "forged.review-publication/1",
            "runId": "run-1",
            "snapshotSha256": "a".repeat(64),
            "total": 0,
            "posted": 0,
            "alreadyPresent": 0,
            "delivered": 0,
            "retryable": 0,
            "uncertain": 0,
            "findings": [],
            "futureField": true,
        });
        serde_json::from_value::<ReviewPublicationV1>(value)
            .expect_err("the v1 result is a closed wire contract");
    }
}
