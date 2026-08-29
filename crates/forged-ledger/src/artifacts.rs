//! One-to-one joins between immutable attempt rows and filesystem manifests.

use rusqlite::{OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{column_decode_error, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{AttemptArtifactCompactionRow, AttemptArtifactRow, NewAttemptArtifact};
use forged_types::ErrorCode;

pub(crate) const COLUMNS: &str = "attempt_id, run_id, packet_id, manifest_schema, manifest_path, \
                       manifest_sha256, retention_class, created_at";

pub(crate) fn row(value: &rusqlite::Row<'_>) -> Result<AttemptArtifactRow, rusqlite::Error> {
    let manifest_schema: String = value.get(3)?;
    if manifest_schema != "forged.attempt-artifacts/1" {
        return Err(column_decode_error(
            3,
            "attempt artifact schema",
            &manifest_schema,
        ));
    }
    let retention_class: String = value.get(6)?;
    if !matches!(retention_class.as_str(), "retain" | "compactable-success") {
        return Err(column_decode_error(
            6,
            "attempt artifact retention class",
            &retention_class,
        ));
    }
    Ok(AttemptArtifactRow {
        attempt_id: value.get(0)?,
        run_id: value.get(1)?,
        packet_id: value.get(2)?,
        manifest_schema,
        manifest_path: value.get(4)?,
        manifest_sha256: value.get(5)?,
        retention_class,
        created_at: value.get(7)?,
    })
}

pub(crate) const COMPACTION_COLUMNS: &str =
    "attempt_id, operation_id, tombstone_path, tombstone_sha256, \
                                  state, bytes_removed, created_at, completed_at";

pub(crate) fn compaction_row(
    value: &rusqlite::Row<'_>,
) -> Result<AttemptArtifactCompactionRow, rusqlite::Error> {
    let state: String = value.get(4)?;
    if !matches!(state.as_str(), "in-progress" | "completed") {
        return Err(column_decode_error(4, "artifact compaction state", &state));
    }
    Ok(AttemptArtifactCompactionRow {
        attempt_id: value.get(0)?,
        operation_id: value.get(1)?,
        tombstone_path: value.get(2)?,
        tombstone_sha256: value.get(3)?,
        state,
        bytes_removed: value.get(5)?,
        created_at: value.get(6)?,
        completed_at: value.get(7)?,
    })
}

struct CompactionFacts {
    retention: String,
    attempt_state: String,
    result_json: Option<String>,
    run_state: String,
    run_outcome: Option<String>,
    run_id: String,
}

fn compaction_facts(value: &rusqlite::Row<'_>) -> Result<CompactionFacts, rusqlite::Error> {
    Ok(CompactionFacts {
        retention: value.get(0)?,
        attempt_state: value.get(1)?,
        result_json: value.get(2)?,
        run_state: value.get(3)?,
        run_outcome: value.get(4)?,
        run_id: value.get(5)?,
    })
}

fn valid_relative_path(path: &str) -> bool {
    !path.is_empty()
        && !path.starts_with('/')
        && path
            .split('/')
            .all(|part| !part.is_empty() && part != "." && part != "..")
        && path
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '/' | '.' | '_' | '-'))
}

fn valid_sha256(value: &str) -> bool {
    value.len() == 64
        && value
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
}

impl Ledger {
    /// Join an attempt to exactly one immutable manifest.
    ///
    /// Repeating the identical join is idempotent. A manifest that names a
    /// different attempt, packet, or run is refused before any row is
    /// written, as is a second manifest identity for an already-joined
    /// attempt.
    pub fn record_attempt_artifact(
        &self,
        artifact: NewAttemptArtifact,
    ) -> Result<AttemptArtifactRow, LedgerError> {
        self.submit(move |conn| {
            if artifact.manifest_schema != "forged.attempt-artifacts/1" {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("unsupported artifact schema {:?}", artifact.manifest_schema),
                ));
            }
            if !valid_relative_path(&artifact.manifest_path) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "manifest path {:?} is not a safe run-relative path",
                        artifact.manifest_path
                    ),
                ));
            }
            if !valid_sha256(&artifact.manifest_sha256) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "manifest sha256 must be 64 lowercase hex characters",
                ));
            }
            if !matches!(
                artifact.retention_class.as_str(),
                "retain" | "compactable-success"
            ) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "unknown artifact retention class {:?}",
                        artifact.retention_class
                    ),
                ));
            }

            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let owner: Option<(String, String)> = tx
                .query_row(
                    "SELECT p.run_id, a.packet_id FROM attempts a \
                     JOIN packets p ON p.packet_id = a.packet_id \
                     WHERE a.attempt_id = ?1",
                    [artifact.attempt_id],
                    |value| Ok((value.get(0)?, value.get(1)?)),
                )
                .optional()?;
            let Some((run_id, packet_id)) = owner else {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("no attempt {}", artifact.attempt_id),
                ));
            };
            if run_id != artifact.run_id || packet_id != artifact.packet_id {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "manifest claims run {:?} packet {:?}, but attempt {} belongs to run {:?} packet {:?}",
                        artifact.run_id,
                        artifact.packet_id,
                        artifact.attempt_id,
                        run_id,
                        packet_id
                    ),
                ));
            }

            let existing = tx
                .query_row(
                    &format!(
                        "SELECT {COLUMNS} FROM attempt_artifacts WHERE attempt_id = ?1"
                    ),
                    [artifact.attempt_id],
                    row,
                )
                .optional()?;
            if let Some(existing) = existing {
                let identical = existing.run_id == artifact.run_id
                    && existing.packet_id == artifact.packet_id
                    && existing.manifest_schema == artifact.manifest_schema
                    && existing.manifest_path == artifact.manifest_path
                    && existing.manifest_sha256 == artifact.manifest_sha256
                    && existing.retention_class == artifact.retention_class;
                if identical {
                    tx.commit()?;
                    return Ok(existing);
                }
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "attempt {} is already joined to manifest {:?}",
                        artifact.attempt_id, existing.manifest_path
                    ),
                ));
            }

            let created_at = now_iso();
            tx.execute(
                "INSERT INTO attempt_artifacts (attempt_id, run_id, packet_id, \
                 manifest_schema, manifest_path, manifest_sha256, retention_class, created_at) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![
                    artifact.attempt_id,
                    artifact.run_id,
                    artifact.packet_id,
                    artifact.manifest_schema,
                    artifact.manifest_path,
                    artifact.manifest_sha256,
                    artifact.retention_class,
                    created_at,
                ],
            )?;
            let inserted = tx.query_row(
                &format!("SELECT {COLUMNS} FROM attempt_artifacts WHERE attempt_id = ?1"),
                [artifact.attempt_id],
                row,
            )?;
            tx.commit()?;
            Ok(inserted)
        })
    }

    /// The manifest joined to one attempt, or `None` for legacy/unfinalized
    /// attempts.
    pub fn get_attempt_artifact(
        &self,
        attempt_id: i64,
    ) -> Result<Option<AttemptArtifactRow>, LedgerError> {
        self.submit(move |conn| {
            Ok(conn
                .query_row(
                    &format!("SELECT {COLUMNS} FROM attempt_artifacts WHERE attempt_id = ?1"),
                    [attempt_id],
                    row,
                )
                .optional()?)
        })
    }

    /// Every joined manifest for one run, ordered by attempt identity.
    pub fn list_attempt_artifacts(
        &self,
        run_id: &str,
    ) -> Result<Vec<AttemptArtifactRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let mut statement = conn.prepare(&format!(
                "SELECT {COLUMNS} FROM attempt_artifacts WHERE run_id = ?1 ORDER BY attempt_id"
            ))?;
            let values = statement.query_map([run_id], row)?;
            let mut out = Vec::new();
            for value in values {
                out.push(value?);
            }
            Ok(out)
        })
    }

    /// Durably authorize one explicit compaction, failing closed unless the
    /// attempt is a retained successful intermediate in a terminal run.
    pub fn begin_attempt_artifact_compaction(
        &self,
        attempt_id: i64,
        operation_id: &str,
        tombstone_path: &str,
        tombstone_sha256: &str,
    ) -> Result<AttemptArtifactCompactionRow, LedgerError> {
        let operation_id = operation_id.to_owned();
        let tombstone_path = tombstone_path.to_owned();
        let tombstone_sha256 = tombstone_sha256.to_owned();
        self.submit(move |conn| {
            if !valid_relative_path(&tombstone_path) || !valid_sha256(&tombstone_sha256) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "compaction tombstone identity is not safe",
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let existing = tx
                .query_row(
                    &format!("SELECT {COMPACTION_COLUMNS} FROM attempt_artifact_compactions WHERE attempt_id = ?1"),
                    [attempt_id],
                    compaction_row,
                )
                .optional()?;
            if let Some(existing) = existing {
                if existing.tombstone_path != tombstone_path
                    || existing.tombstone_sha256 != tombstone_sha256
                {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!("attempt {attempt_id} has a different compaction intent"),
                    ));
                }
                tx.commit()?;
                return Ok(existing);
            }

            let facts = tx
                .query_row(
                    "SELECT aa.retention_class, a.state, a.result_json, r.state, \
                            r.terminal_outcome, p.run_id \
                     FROM attempt_artifacts aa \
                     JOIN attempts a ON a.attempt_id = aa.attempt_id \
                     JOIN packets p ON p.packet_id = a.packet_id \
                     JOIN runs r ON r.run_id = p.run_id \
                     WHERE aa.attempt_id = ?1",
                    [attempt_id],
                    compaction_facts,
                )
                .optional()?;
            let Some(facts) = facts else {
                return Err(refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} has no artifact manifest")));
            };
            if facts.retention != "compactable-success" {
                return Err(refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} retention is {:?}, not compactable-success", facts.retention)));
            }
            if facts.attempt_state != "completed" {
                return Err(refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} is {}, not completed", facts.attempt_state)));
            }
            let result_json = facts.result_json.ok_or_else(|| refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} has no successful result")))?;
            serde_json::from_str::<forged_types::PacketResult>(&result_json).map_err(|error| {
                refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} result is not a valid success: {error}"))
            })?;
            if facts.run_state != "stopped"
                || !matches!(facts.run_outcome.as_deref(), Some("clean" | "accepted-risk" | "landed"))
            {
                return Err(refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} run is not terminal-success")));
            }
            let live: i64 = tx.query_row(
                "SELECT COUNT(*) FROM attempts a JOIN packets p ON p.packet_id = a.packet_id \
                 WHERE p.run_id = ?1 AND a.state IN ('running','revoking')",
                [&facts.run_id],
                |value| value.get(0),
            )?;
            if live != 0 {
                return Err(refused(ErrorCode::InvalidRequest, format!("run {:?} still has live attempts", facts.run_id)));
            }
            let later_success: i64 = tx.query_row(
                "SELECT COUNT(*) FROM attempts a JOIN packets p ON p.packet_id = a.packet_id \
                 WHERE p.run_id = ?1 AND a.attempt_id > ?2 AND a.state = 'completed' \
                 AND a.result_json IS NOT NULL",
                rusqlite::params![facts.run_id, attempt_id],
                |value| value.get(0),
            )?;
            if later_success == 0 {
                return Err(refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} is the final current success")));
            }

            let created_at = now_iso();
            tx.execute(
                "INSERT INTO attempt_artifact_compactions (attempt_id, operation_id, \
                 tombstone_path, tombstone_sha256, state, created_at) \
                 VALUES (?1, ?2, ?3, ?4, 'in-progress', ?5)",
                rusqlite::params![attempt_id, operation_id, tombstone_path, tombstone_sha256, created_at],
            )?;
            let inserted = tx.query_row(
                &format!("SELECT {COMPACTION_COLUMNS} FROM attempt_artifact_compactions WHERE attempt_id = ?1"),
                [attempt_id],
                compaction_row,
            )?;
            tx.commit()?;
            Ok(inserted)
        })
    }

    /// Settle a durable compaction intent after its tombstone and removals
    /// are fsynced. Repeating the same byte count is idempotent.
    pub fn complete_attempt_artifact_compaction(
        &self,
        attempt_id: i64,
        bytes_removed: i64,
    ) -> Result<AttemptArtifactCompactionRow, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = tx
                .query_row(
                    &format!("SELECT {COMPACTION_COLUMNS} FROM attempt_artifact_compactions WHERE attempt_id = ?1"),
                    [attempt_id],
                    compaction_row,
                )
                .optional()?
                .ok_or_else(|| refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} has no compaction intent")))?;
            if current.state == "completed" {
                if current.bytes_removed == Some(bytes_removed) {
                    tx.commit()?;
                    return Ok(current);
                }
                return Err(refused(ErrorCode::InvalidRequest, format!("attempt {attempt_id} compaction evidence differs")));
            }
            let completed_at = now_iso();
            tx.execute(
                "UPDATE attempt_artifact_compactions SET state = 'completed', \
                 bytes_removed = ?2, completed_at = ?3 WHERE attempt_id = ?1",
                rusqlite::params![attempt_id, bytes_removed, completed_at],
            )?;
            let run_id: String = tx.query_row(
                "SELECT p.run_id FROM attempts a JOIN packets p ON p.packet_id = a.packet_id WHERE a.attempt_id = ?1",
                [attempt_id],
                |value| value.get(0),
            )?;
            append_event_tx(&tx, Some(&run_id), "attempt.artifacts.compacted", &json!({
                "attemptId": attempt_id,
                "operationId": current.operation_id,
                "tombstonePath": current.tombstone_path,
                "tombstoneSha256": current.tombstone_sha256,
                "bytesRemoved": bytes_removed,
            }))?;
            let completed = tx.query_row(
                &format!("SELECT {COMPACTION_COLUMNS} FROM attempt_artifact_compactions WHERE attempt_id = ?1"),
                [attempt_id],
                compaction_row,
            )?;
            tx.commit()?;
            Ok(completed)
        })
    }

    pub fn get_attempt_artifact_compaction(
        &self,
        attempt_id: i64,
    ) -> Result<Option<AttemptArtifactCompactionRow>, LedgerError> {
        self.submit(move |conn| {
            Ok(conn.query_row(
                &format!("SELECT {COMPACTION_COLUMNS} FROM attempt_artifact_compactions WHERE attempt_id = ?1"),
                [attempt_id],
                compaction_row,
            ).optional()?)
        })
    }

    pub fn list_attempt_artifact_compactions(
        &self,
        run_id: &str,
    ) -> Result<Vec<AttemptArtifactCompactionRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let mut statement = conn.prepare(&format!(
                "SELECT c.{0} FROM attempt_artifact_compactions c \
                 JOIN attempts a ON a.attempt_id = c.attempt_id \
                 JOIN packets p ON p.packet_id = a.packet_id \
                 WHERE p.run_id = ?1 ORDER BY c.attempt_id",
                COMPACTION_COLUMNS.replace(", ", ", c.")
            ))?;
            let rows = statement.query_map([run_id], compaction_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }
}

#[cfg(test)]
mod tests {
    use forged_types::{RunId, Stage};

    use super::*;
    use crate::{NewPacket, NewRun, SpecFence};

    fn claim_named(ledger: &Ledger, run_id: &str, work_id: &str) -> i64 {
        ledger
            .create_run(NewRun {
                run_id: RunId::new(run_id).expect("run id"),
                work_id: work_id.to_owned(),
                repo: "/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: format!("forged/{run_id}"),
            })
            .expect("run");
        let packet = ledger
            .open_packet(NewPacket {
                run_id: run_id.to_owned(),
                stage: Stage::Implement,
                seq: 1,
                spec_path: "spec.md".to_owned(),
                spec_sha256: "cafe".to_owned(),
                spec_revision: None,
                body_json: "{}".to_owned(),
            })
            .expect("packet");
        ledger
            .claim_packet(
                &packet,
                "claude:session:1",
                &SpecFence::Sha256("cafe".to_owned()),
            )
            .expect("claim")
            .attempt_id
    }

    fn claimed(ledger: &Ledger) -> i64 {
        claim_named(ledger, "run-artifacts", "bead-artifacts")
    }

    fn manifest(attempt_id: i64) -> NewAttemptArtifact {
        NewAttemptArtifact {
            attempt_id,
            run_id: "run-artifacts".to_owned(),
            packet_id: "run-artifacts/implement/1".to_owned(),
            manifest_schema: "forged.attempt-artifacts/1".to_owned(),
            manifest_path: format!("packets/implement/1/attempts/{attempt_id}/manifest.json"),
            manifest_sha256: "a".repeat(64),
            retention_class: "retain".to_owned(),
        }
    }

    #[test]
    fn one_attempt_accepts_one_identical_manifest_join() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let attempt_id = claimed(&ledger);
        let first = ledger
            .record_attempt_artifact(manifest(attempt_id))
            .expect("first join");
        let replay = ledger
            .record_attempt_artifact(manifest(attempt_id))
            .expect("identical replay");
        assert_eq!(first, replay);

        let mut other = manifest(attempt_id);
        other.manifest_sha256 = "b".repeat(64);
        assert!(ledger.record_attempt_artifact(other).is_err());
        assert_eq!(
            ledger
                .list_attempt_artifacts("run-artifacts")
                .expect("list"),
            vec![first]
        );
    }

    #[test]
    fn a_manifest_cannot_claim_another_attempts_packet_or_unsafe_path() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let attempt_id = claimed(&ledger);
        let mut wrong = manifest(attempt_id);
        wrong.packet_id = "run-artifacts/review/1".to_owned();
        assert!(ledger.record_attempt_artifact(wrong).is_err());

        let mut unsafe_path = manifest(attempt_id);
        unsafe_path.manifest_path = "../manifest.json".to_owned();
        assert!(ledger.record_attempt_artifact(unsafe_path).is_err());
        assert!(ledger
            .get_attempt_artifact(attempt_id)
            .expect("query")
            .is_none());
    }

    #[test]
    fn two_runs_may_use_the_same_run_relative_manifest_path() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let first = claim_named(&ledger, "run-artifacts-a", "bead-a");
        let second = claim_named(&ledger, "run-artifacts-b", "bead-b");
        let mut a = manifest(first);
        a.run_id = "run-artifacts-a".to_owned();
        a.packet_id = "run-artifacts-a/implement/1".to_owned();
        let shared = "packets/implement/1/attempts/1/manifest.json".to_owned();
        a.manifest_path = shared.clone();
        ledger.record_attempt_artifact(a).expect("first run join");

        let mut b = manifest(second);
        b.run_id = "run-artifacts-b".to_owned();
        b.packet_id = "run-artifacts-b/implement/1".to_owned();
        b.manifest_path = shared;
        ledger.record_attempt_artifact(b).expect("second run join");
    }
}
