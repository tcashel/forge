//! Migration-019 review-publication source snapshots and per-finding effect state.

use std::fmt::Write as _;

use forged_types::{
    canonical_json_bytes, github_repository_from_pr_url, parse_canonical, ErrorCode, Finding,
    ReviewEpochKind,
};
use rusqlite::{OptionalExtension, TransactionBehavior};
use sha2::{Digest, Sha256};

use crate::attempts::{attempt_row, ATTEMPT_COLUMNS};
use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::ledger::Ledger;
use crate::operations::{operation_row, OPERATION_COLUMNS};
use crate::packets::{packet_row, PACKET_COLUMNS};
use crate::runs::require_run;
use crate::time::now_iso;
use crate::types::{
    NewReviewFindingDelivery, ReviewFindingDeliveryClaim, ReviewFindingDeliveryKey,
    ReviewFindingDeliveryOutcome, ReviewFindingDeliveryRow, ReviewFindingDeliveryState,
    ReviewPublicationSource,
};

const DELIVERY_SCHEMA: &str = "forged.review-finding-delivery/1";
const ERROR_MAX_BYTES: usize = 2_048;
const DELIVERY_COLUMNS: &str = "schema, run_id, repository_slug, pr_number, pr_url, \
    review_epoch_kind, review_epoch, snapshot_sha256, finding_id, finding_sha256, \
    canonical_finding_json, state, attempt_count, last_error, external_outcome, \
    delivered_evidence, delivery_token, delivery_lease_until, delivered_at, \
    created_at, updated_at";

fn truncate_error(value: &str) -> String {
    if value.len() <= ERROR_MAX_BYTES {
        return value.to_owned();
    }
    let mut end = ERROR_MAX_BYTES;
    while !value.is_char_boundary(end) {
        end -= 1;
    }
    value[..end].to_owned()
}

fn sha256(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut out = String::with_capacity(64);
    for byte in digest {
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn epoch_kind(index: usize, raw: &str) -> rusqlite::Result<ReviewEpochKind> {
    match raw {
        "semantic-round" => Ok(ReviewEpochKind::SemanticRound),
        "legacy-seq" => Ok(ReviewEpochKind::LegacySeq),
        other => Err(column_decode_error(index, "review epoch kind", other)),
    }
}

fn delivery_state(index: usize, raw: &str) -> rusqlite::Result<ReviewFindingDeliveryState> {
    match raw {
        "pending" => Ok(ReviewFindingDeliveryState::Pending),
        "uncertain" => Ok(ReviewFindingDeliveryState::Uncertain),
        "retryable" => Ok(ReviewFindingDeliveryState::Retryable),
        "delivered" => Ok(ReviewFindingDeliveryState::Delivered),
        other => Err(column_decode_error(index, "review delivery state", other)),
    }
}

fn delivery_outcome(
    index: usize,
    raw: Option<String>,
) -> rusqlite::Result<Option<ReviewFindingDeliveryOutcome>> {
    match raw.as_deref() {
        None => Ok(None),
        Some("posted") => Ok(Some(ReviewFindingDeliveryOutcome::Posted)),
        Some("already-present") => Ok(Some(ReviewFindingDeliveryOutcome::AlreadyPresent)),
        Some(other) => Err(column_decode_error(index, "review delivery outcome", other)),
    }
}

fn nonnegative_u64(row: &rusqlite::Row<'_>, index: usize, what: &str) -> rusqlite::Result<u64> {
    let raw: i64 = row.get(index)?;
    u64::try_from(raw).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(
            index,
            rusqlite::types::Type::Integer,
            format!("invalid {what} {raw}: {error}").into(),
        )
    })
}

fn delivery_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<ReviewFindingDeliveryRow> {
    Ok(ReviewFindingDeliveryRow {
        schema: row.get(0)?,
        key: ReviewFindingDeliveryKey {
            run_id: row.get(1)?,
            repository_slug: row.get(2)?,
            pr_number: nonnegative_u64(row, 3, "PR number")?,
            review_epoch_kind: epoch_kind(5, &row.get::<_, String>(5)?)?,
            review_epoch: nonnegative_u64(row, 6, "review epoch")?,
            snapshot_sha256: row.get(7)?,
            finding_id: row.get(8)?,
        },
        pr_url: row.get(4)?,
        finding_sha256: row.get(9)?,
        canonical_finding_json: row.get(10)?,
        state: delivery_state(11, &row.get::<_, String>(11)?)?,
        attempt_count: nonnegative_u64(row, 12, "delivery attempt count")?,
        last_error: row.get(13)?,
        external_outcome: delivery_outcome(14, row.get(14)?)?,
        delivered_evidence: row.get(15)?,
        delivery_token: row.get(16)?,
        delivery_lease_until: row.get(17)?,
        delivered_at: row.get(18)?,
        created_at: row.get(19)?,
        updated_at: row.get(20)?,
    })
}

fn valid_lower_sha(value: &str) -> bool {
    value.len() == 64
        && value
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
}

fn closed_finding_bytes(value: &serde_json::Value) -> Result<Vec<u8>, String> {
    let object = value
        .as_object()
        .ok_or_else(|| "review finding is not an object".to_owned())?;
    let fields = ["severity", "file", "line", "message"];
    if object.len() != fields.len() || fields.iter().any(|field| !object.contains_key(*field)) {
        return Err("review finding is not the closed exact object".to_owned());
    }
    serde_json::from_value::<Finding>(value.clone())
        .map_err(|error| format!("review finding has an invalid field: {error}"))?;
    canonical_json_bytes(value)
        .map_err(|error| format!("review finding cannot canonicalize: {error}"))
}

fn validate_row(row: ReviewFindingDeliveryRow) -> Result<ReviewFindingDeliveryRow, LedgerError> {
    if row.schema != DELIVERY_SCHEMA {
        return Err(internal(format!(
            "unknown review delivery schema {:?}",
            row.schema
        )));
    }
    if row.key.pr_number == 0
        || github_repository_from_pr_url(&row.pr_url, row.key.pr_number).as_deref()
            != Some(row.key.repository_slug.as_str())
        || !valid_lower_sha(&row.key.snapshot_sha256)
        || !valid_lower_sha(&row.key.finding_id)
        || row.finding_sha256 != row.key.finding_id
    {
        return Err(internal("invalid review delivery identity"));
    }
    let value = parse_canonical(&row.canonical_finding_json)
        .map_err(|error| internal(format!("invalid canonical review finding: {error}")))?;
    let canonical = closed_finding_bytes(&value).map_err(internal)?;
    if canonical.as_slice() != row.canonical_finding_json.as_bytes()
        || sha256(&canonical) != row.finding_sha256
    {
        return Err(internal("review delivery finding digest mismatch"));
    }
    let delivered = row.state == ReviewFindingDeliveryState::Delivered;
    let has_delivery_evidence = row.external_outcome.is_some()
        && row.delivered_evidence.is_some()
        && row.delivered_at.is_some();
    let has_partial_delivery_evidence = row.external_outcome.is_some()
        || row.delivered_evidence.is_some()
        || row.delivered_at.is_some();
    let last_error_allowed = matches!(
        row.state,
        ReviewFindingDeliveryState::Retryable | ReviewFindingDeliveryState::Uncertain
    );
    if (delivered && (!has_delivery_evidence || row.last_error.is_some()))
        || (!delivered && has_partial_delivery_evidence)
        || (row.last_error.is_some() && !last_error_allowed)
        || row
            .last_error
            .as_ref()
            .is_some_and(|error| error.len() > ERROR_MAX_BYTES)
        || (row.delivery_token.is_some() != row.delivery_lease_until.is_some())
        || (delivered && row.delivery_token.is_some())
        || (row.state == ReviewFindingDeliveryState::Pending && row.attempt_count != 0)
        || (row.state == ReviewFindingDeliveryState::Retryable && row.last_error.is_none())
        || (row.state == ReviewFindingDeliveryState::Uncertain && row.attempt_count == 0)
        || (row.external_outcome == Some(ReviewFindingDeliveryOutcome::Posted)
            && row.attempt_count == 0)
        || (delivered
            && row.delivered_evidence.as_deref()
                != Some(format!("<!-- anvil-finding id={} -->", row.key.finding_id).as_str()))
    {
        return Err(internal("impossible review delivery state"));
    }
    Ok(row)
}

fn get_delivery_tx(
    conn: &rusqlite::Connection,
    key: &ReviewFindingDeliveryKey,
) -> Result<ReviewFindingDeliveryRow, LedgerError> {
    let sql = format!(
        "SELECT {DELIVERY_COLUMNS} FROM review_finding_deliveries WHERE \
         run_id = ?1 AND repository_slug = ?2 AND pr_number = ?3 \
         AND review_epoch_kind = ?4 AND review_epoch = ?5 AND snapshot_sha256 = ?6 \
         AND finding_id = ?7"
    );
    let row = conn
        .query_row(
            &sql,
            rusqlite::params![
                key.run_id,
                key.repository_slug,
                i64::try_from(key.pr_number).map_err(|_| internal("PR number exceeds SQLite"))?,
                key.review_epoch_kind.as_str(),
                i64::try_from(key.review_epoch)
                    .map_err(|_| internal("review epoch exceeds SQLite"))?,
                key.snapshot_sha256,
                key.finding_id,
            ],
            delivery_row,
        )
        .optional()?
        .ok_or_else(|| refused(ErrorCode::InvalidRequest, "review delivery row is absent"))?;
    validate_row(row)
}

impl Ledger {
    /// Capture every raw input needed to select one immutable publication snapshot.
    pub fn review_publication_source(
        &self,
        run_id: &str,
        draft_pr_key: &str,
    ) -> Result<ReviewPublicationSource, LedgerError> {
        let run_id = run_id.to_owned();
        let draft_pr_key = draft_pr_key.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Deferred)?;
            require_run(&tx, &run_id)?;
            let definition_backed: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM run_definitions WHERE run_id = ?1)",
                [&run_id],
                |row| row.get(0),
            )?;

            let packet_sql = format!(
                "SELECT {PACKET_COLUMNS} FROM packets WHERE run_id = ?1 ORDER BY created_at, rowid"
            );
            let packets = tx
                .prepare(&packet_sql)?
                .query_map([&run_id], packet_row)?
                .collect::<Result<Vec<_>, _>>()?;

            let attempt_sql = format!(
                "SELECT {} FROM attempts a JOIN packets p ON p.packet_id = a.packet_id \
                 WHERE p.run_id = ?1 AND a.state = 'completed' ORDER BY a.attempt_id",
                ATTEMPT_COLUMNS
                    .split(", ")
                    .map(|column| format!("a.{column}"))
                    .collect::<Vec<_>>()
                    .join(", ")
            );
            let completed_attempts = tx
                .prepare(&attempt_sql)?
                .query_map([&run_id], attempt_row)?
                .collect::<Result<Vec<_>, _>>()?;

            let operation_sql = format!(
                "SELECT {OPERATION_COLUMNS} FROM operations WHERE name = 'draftpr' \
                 AND idempotency_key = ?1 AND run_id = ?2"
            );
            let draft_pr_operation = tx
                .query_row(
                    &operation_sql,
                    rusqlite::params![draft_pr_key, run_id],
                    operation_row,
                )
                .optional()?;
            tx.commit()?;
            Ok(ReviewPublicationSource {
                definition_backed,
                packets,
                completed_attempts,
                draft_pr_operation,
            })
        })
    }

    /// Insert exact pending intents and return their fully validated standing rows.
    pub fn prepare_review_finding_deliveries(
        &self,
        deliveries: Vec<NewReviewFindingDelivery>,
    ) -> Result<Vec<ReviewFindingDeliveryRow>, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            let mut out = Vec::with_capacity(deliveries.len());
            for delivery in deliveries {
                if delivery.finding_sha256 != delivery.key.finding_id
                    || github_repository_from_pr_url(&delivery.pr_url, delivery.key.pr_number)
                        .as_deref()
                        != Some(delivery.key.repository_slug.as_str())
                    || !valid_lower_sha(&delivery.key.finding_id)
                    || !valid_lower_sha(&delivery.key.snapshot_sha256)
                {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "review delivery carries an invalid digest",
                    ));
                }
                let parsed =
                    parse_canonical(&delivery.canonical_finding_json).map_err(|error| {
                        refused(
                            ErrorCode::InvalidRequest,
                            format!("review finding is not canonical JSON: {error}"),
                        )
                    })?;
                let canonical = closed_finding_bytes(&parsed)
                    .map_err(|error| refused(ErrorCode::InvalidRequest, error))?;
                if canonical.as_slice() != delivery.canonical_finding_json.as_bytes()
                    || sha256(&canonical) != delivery.finding_sha256
                {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "review finding digest does not match its canonical JSON",
                    ));
                }
                tx.execute(
                    "INSERT OR IGNORE INTO review_finding_deliveries (
                       schema, run_id, repository_slug, pr_number, pr_url,
                       review_epoch_kind, review_epoch, snapshot_sha256, finding_id,
                       finding_sha256, canonical_finding_json, state, created_at, updated_at
                     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11,
                               'pending', ?12, ?12)",
                    rusqlite::params![
                        DELIVERY_SCHEMA,
                        delivery.key.run_id,
                        delivery.key.repository_slug,
                        i64::try_from(delivery.key.pr_number).map_err(|_| refused(
                            ErrorCode::InvalidRequest,
                            "PR number is too large"
                        ))?,
                        delivery.pr_url,
                        delivery.key.review_epoch_kind.as_str(),
                        i64::try_from(delivery.key.review_epoch).map_err(|_| refused(
                            ErrorCode::InvalidRequest,
                            "review epoch is too large"
                        ))?,
                        delivery.key.snapshot_sha256,
                        delivery.key.finding_id,
                        delivery.finding_sha256,
                        delivery.canonical_finding_json,
                        now,
                    ],
                )?;
                let standing = get_delivery_tx(&tx, &delivery.key)?;
                if standing.pr_url != delivery.pr_url
                    || standing.canonical_finding_json != delivery.canonical_finding_json
                    || standing.finding_sha256 != delivery.finding_sha256
                {
                    return Err(refused(
                        ErrorCode::IdempotencyConflict,
                        "review delivery key conflicts with immutable stored content",
                    ));
                }
                out.push(standing);
            }
            out.sort_by(|left, right| left.key.finding_id.cmp(&right.key.finding_id));
            tx.commit()?;
            Ok(out)
        })
    }

    /// Claim one undelivered row under a bounded lease.
    pub fn claim_review_finding_delivery(
        &self,
        key: ReviewFindingDeliveryKey,
        now: String,
        lease_until: String,
    ) -> Result<ReviewFindingDeliveryClaim, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let standing = get_delivery_tx(&tx, &key)?;
            if standing.state == ReviewFindingDeliveryState::Delivered {
                tx.commit()?;
                return Ok(ReviewFindingDeliveryClaim::Delivered(standing));
            }
            if standing
                .delivery_lease_until
                .as_deref()
                .is_some_and(|deadline| deadline > now.as_str())
            {
                tx.commit()?;
                return Ok(ReviewFindingDeliveryClaim::Busy(standing));
            }
            let token = uuid::Uuid::now_v7().to_string();
            let changed = tx.execute(
                "UPDATE review_finding_deliveries SET delivery_token = ?1,
                   delivery_lease_until = ?2, updated_at = ?3
                 WHERE run_id = ?4 AND repository_slug = ?5 AND pr_number = ?6
                   AND review_epoch_kind = ?7 AND review_epoch = ?8
                   AND snapshot_sha256 = ?9 AND finding_id = ?10
                   AND state != 'delivered'
                   AND (delivery_token IS NULL OR delivery_lease_until <= ?3)",
                rusqlite::params![
                    token,
                    lease_until,
                    now,
                    key.run_id,
                    key.repository_slug,
                    i64::try_from(key.pr_number)
                        .map_err(|_| internal("PR number exceeds SQLite"))?,
                    key.review_epoch_kind.as_str(),
                    i64::try_from(key.review_epoch)
                        .map_err(|_| internal("review epoch exceeds SQLite"))?,
                    key.snapshot_sha256,
                    key.finding_id,
                ],
            )?;
            if changed != 1 {
                let row = get_delivery_tx(&tx, &key)?;
                tx.commit()?;
                return Ok(ReviewFindingDeliveryClaim::Busy(row));
            }
            let row = get_delivery_tx(&tx, &key)?;
            tx.commit()?;
            Ok(ReviewFindingDeliveryClaim::Claimed(row))
        })
    }

    /// Record a definite pre-POST failure and release the claim.
    pub fn retry_review_finding_delivery(
        &self,
        key: ReviewFindingDeliveryKey,
        token: String,
        error: String,
    ) -> Result<ReviewFindingDeliveryRow, LedgerError> {
        self.finish_review_delivery_failure(
            key,
            token,
            ReviewFindingDeliveryState::Retryable,
            error,
        )
    }

    /// Commit the uncertain marker and increment the POST-attempt count before POST.
    pub fn mark_review_finding_delivery_uncertain(
        &self,
        key: ReviewFindingDeliveryKey,
        token: String,
    ) -> Result<ReviewFindingDeliveryRow, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            let changed = tx.execute(
                "UPDATE review_finding_deliveries SET state = 'uncertain',
                   attempt_count = attempt_count + 1, last_error = NULL, updated_at = ?1
                 WHERE run_id = ?2 AND repository_slug = ?3 AND pr_number = ?4
                   AND review_epoch_kind = ?5 AND review_epoch = ?6
                   AND snapshot_sha256 = ?7 AND finding_id = ?8
                   AND delivery_token = ?9 AND state != 'delivered'",
                rusqlite::params![
                    now,
                    key.run_id,
                    key.repository_slug,
                    i64::try_from(key.pr_number)
                        .map_err(|_| internal("PR number exceeds SQLite"))?,
                    key.review_epoch_kind.as_str(),
                    i64::try_from(key.review_epoch)
                        .map_err(|_| internal("review epoch exceeds SQLite"))?,
                    key.snapshot_sha256,
                    key.finding_id,
                    token,
                ],
            )?;
            if changed != 1 {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "review delivery claim was lost before POST",
                ));
            }
            let row = get_delivery_tx(&tx, &key)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Preserve an ambiguous POST failure and release the claim for observation-first retry.
    pub fn uncertain_review_finding_delivery(
        &self,
        key: ReviewFindingDeliveryKey,
        token: String,
        error: String,
    ) -> Result<ReviewFindingDeliveryRow, LedgerError> {
        self.finish_review_delivery_failure(
            key,
            token,
            ReviewFindingDeliveryState::Uncertain,
            error,
        )
    }

    fn finish_review_delivery_failure(
        &self,
        key: ReviewFindingDeliveryKey,
        token: String,
        state: ReviewFindingDeliveryState,
        error: String,
    ) -> Result<ReviewFindingDeliveryRow, LedgerError> {
        debug_assert!(matches!(
            state,
            ReviewFindingDeliveryState::Retryable | ReviewFindingDeliveryState::Uncertain
        ));
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let changed = tx.execute(
                "UPDATE review_finding_deliveries SET state = ?1, last_error = ?2,
                   delivery_token = NULL, delivery_lease_until = NULL, updated_at = ?3
                 WHERE run_id = ?4 AND repository_slug = ?5 AND pr_number = ?6
                   AND review_epoch_kind = ?7 AND review_epoch = ?8
                   AND snapshot_sha256 = ?9 AND finding_id = ?10
                   AND delivery_token = ?11 AND state != 'delivered'",
                rusqlite::params![
                    state.as_str(),
                    truncate_error(&error),
                    now_iso(),
                    key.run_id,
                    key.repository_slug,
                    i64::try_from(key.pr_number)
                        .map_err(|_| internal("PR number exceeds SQLite"))?,
                    key.review_epoch_kind.as_str(),
                    i64::try_from(key.review_epoch)
                        .map_err(|_| internal("review epoch exceeds SQLite"))?,
                    key.snapshot_sha256,
                    key.finding_id,
                    token,
                ],
            )?;
            if changed != 1 {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "review delivery claim was lost while recording failure",
                ));
            }
            let row = get_delivery_tx(&tx, &key)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Record exact marker evidence and make the row permanently no-effect on replay.
    pub fn deliver_review_finding(
        &self,
        key: ReviewFindingDeliveryKey,
        token: String,
        outcome: ReviewFindingDeliveryOutcome,
        evidence: String,
    ) -> Result<ReviewFindingDeliveryRow, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            let changed = tx.execute(
                "UPDATE review_finding_deliveries SET state = 'delivered', last_error = NULL,
                   external_outcome = ?1, delivered_evidence = ?2, delivered_at = ?3,
                   delivery_token = NULL, delivery_lease_until = NULL, updated_at = ?3
                 WHERE run_id = ?4 AND repository_slug = ?5 AND pr_number = ?6
                   AND review_epoch_kind = ?7 AND review_epoch = ?8
                   AND snapshot_sha256 = ?9 AND finding_id = ?10
                   AND delivery_token = ?11 AND state != 'delivered'",
                rusqlite::params![
                    outcome.as_str(),
                    evidence,
                    now,
                    key.run_id,
                    key.repository_slug,
                    i64::try_from(key.pr_number)
                        .map_err(|_| internal("PR number exceeds SQLite"))?,
                    key.review_epoch_kind.as_str(),
                    i64::try_from(key.review_epoch)
                        .map_err(|_| internal("review epoch exceeds SQLite"))?,
                    key.snapshot_sha256,
                    key.finding_id,
                    token,
                ],
            )?;
            if changed != 1 {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "review delivery claim was lost while recording delivery",
                ));
            }
            let row = get_delivery_tx(&tx, &key)?;
            tx.commit()?;
            Ok(row)
        })
    }
}
