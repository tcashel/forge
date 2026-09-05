//! The append-only event stream. There are no UPDATE or DELETE code paths
//! for `events` — append-only, with `event_id` monotonic.

use std::collections::BTreeMap;

use rusqlite::{Connection, TransactionBehavior};

use crate::attempts::{get_attempt_tx, run_of_packet};
use crate::error::{refused, LedgerError};
use crate::ledger::Ledger;
use crate::runs::latest_policy_revision_tx;
use crate::time::now_iso;
use crate::types::{AttemptState, EventRow, PolicyRevisionRow};

/// Complete and cursor-eligible counts for one subject in a multi-subject
/// event page.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SubjectEventCount {
    pub total: u64,
    pub eligible: u64,
}

/// One globally ordered event page across an exact set of subject ids.
#[derive(Debug, Clone)]
pub struct SubjectEventPage {
    pub rows: Vec<EventRow>,
    pub counts: BTreeMap<String, SubjectEventCount>,
}

/// Insert one event row inside the caller's transaction. The payload is a
/// [`serde_json::Value`], so it is well-formed by construction; the ledger
/// serializes it and performs no parsing or validation of its own.
pub(crate) fn append_event_tx(
    conn: &Connection,
    run_id: Option<&str>,
    kind: &str,
    payload: &serde_json::Value,
) -> Result<(), LedgerError> {
    let payload_json = serde_json::to_string(payload)?;
    conn.execute(
        "INSERT INTO events (ts, run_id, kind, payload_json) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![now_iso(), run_id, kind, payload_json],
    )?;
    Ok(())
}

pub(crate) fn event_row(row: &rusqlite::Row<'_>) -> Result<EventRow, rusqlite::Error> {
    Ok(EventRow {
        event_id: row.get(0)?,
        ts: row.get(1)?,
        run_id: row.get(2)?,
        kind: row.get(3)?,
        payload_json: row.get(4)?,
    })
}

const LATEST_EVENT_PER_RUN_SQL: &str =
    "SELECT event_id, ts, run_id, kind, payload_json FROM events \
     WHERE event_id IN \
       (SELECT MAX(event_id) FROM events WHERE run_id IS NOT NULL GROUP BY run_id) \
     ORDER BY event_id ASC";

/// The newest event per run inside the caller's transaction — see
/// [`Ledger::latest_event_per_run`] for the contract.
pub(crate) fn latest_event_per_run_tx(
    conn: &Connection,
) -> Result<BTreeMap<String, EventRow>, LedgerError> {
    let mut statement = conn.prepare(LATEST_EVENT_PER_RUN_SQL)?;
    let rows = statement.query_map([], event_row)?;
    let mut latest = BTreeMap::new();
    for row in rows {
        let row = row?;
        if let Some(run_id) = row.run_id.clone() {
            latest.insert(run_id, row);
        }
    }
    Ok(latest)
}

/// All rows of one kind inside the caller's transaction — see
/// [`Ledger::list_events_by_kind`] for the contract.
pub(crate) fn list_events_by_kind_tx(
    conn: &Connection,
    kind: &str,
) -> Result<Vec<EventRow>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT event_id, ts, run_id, kind, payload_json FROM events \
         WHERE kind = ?1 ORDER BY event_id ASC",
    )?;
    let rows = statement.query_map([kind], event_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn run_events_by_kind_tx(
    conn: &Connection,
    run_id: &str,
    kind: &str,
) -> Result<Vec<EventRow>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT event_id, ts, run_id, kind, payload_json FROM events \
         WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id ASC",
    )?;
    let rows = statement.query_map(rusqlite::params![run_id, kind], event_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

impl Ledger {
    /// Append one event. The payload arrives as a `serde_json::Value` and is
    /// stored serialized, without validation — the same dumb-durable-store
    /// boundary `open_packet` draws around `body_json`.
    pub fn append_event(
        &self,
        run_id: Option<&str>,
        kind: &str,
        payload_json: serde_json::Value,
    ) -> Result<(), LedgerError> {
        let run_id = run_id.map(str::to_owned);
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            append_event_tx(&tx, run_id.as_deref(), &kind, &payload_json)?;
            tx.commit()?;
            Ok(())
        })
    }

    /// The newest event of one kind for one run, or `None`. The reader's
    /// seam for per-subject marker events (a controller's terminal failure)
    /// without paging the run's whole stream.
    pub fn latest_event_of_kind(
        &self,
        run_id: &str,
        kind: &str,
    ) -> Result<Option<EventRow>, LedgerError> {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id DESC LIMIT 1",
            )?;
            let mut rows = stmt.query_map(rusqlite::params![run_id, kind], event_row)?;
            Ok(rows.next().transpose()?)
        })
    }

    /// Append an event only when the same run/kind/payload tuple is absent.
    /// This is the crash-safe seam for deterministic protocol transitions
    /// whose operation wrapper may be retried after the event landed.
    pub fn append_event_once(
        &self,
        run_id: &str,
        kind: &str,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let payload_json = serde_json::to_string(&payload)?;
            let exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2 AND payload_json = ?3)",
                rusqlite::params![run_id, kind, payload_json],
                |row| row.get(0),
            )?;
            if !exists {
                append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
            }
            tx.commit()?;
            Ok(!exists)
        })
    }

    /// Atomically prove one provider seat still owns a running attempt and
    /// append each absent coordination event. This is the storage fence for
    /// every `seat` verb: a revoked or stale seat can never win the race
    /// between a read-side identity check and its event writes.
    pub fn append_seat_events_once(
        &self,
        attempt_id: i64,
        claim_token: &str,
        run_id: &str,
        events: Vec<(String, serde_json::Value)>,
    ) -> Result<usize, LedgerError> {
        let claim_token = claim_token.to_owned();
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let attempt = get_attempt_tx(&tx, attempt_id)?;
            let attempt_run = run_of_packet(&tx, &attempt.packet_id)?;
            if attempt.state != AttemptState::Running
                || attempt.claim_token != claim_token
                || attempt_run != run_id
            {
                return Err(refused(
                    forged_types::ErrorCode::SeatFence,
                    format!("attempt {attempt_id} is not owned by this running seat"),
                ));
            }
            let mut appended = 0;
            for (kind, payload) in events {
                let payload_json = serde_json::to_string(&payload)?;
                let exists: bool = tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2 AND payload_json = ?3)",
                    rusqlite::params![run_id, kind, payload_json],
                    |row| row.get(0),
                )?;
                if !exists {
                    append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
                    appended += 1;
                }
            }
            tx.commit()?;
            Ok(appended)
        })
    }

    /// Append one event only when that run has no event of the same kind.
    ///
    /// Unlike [`Ledger::append_event_once`], payload differences do not make
    /// a second insert eligible. Upgrade boundaries use this form so two
    /// concurrent binaries with different authoring config cannot record two
    /// competing snapshots.
    pub fn append_event_kind_once(
        &self,
        run_id: &str,
        kind: &str,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2)",
                rusqlite::params![run_id, kind],
                |row| row.get(0),
            )?;
            if !exists {
                append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
            }
            tx.commit()?;
            Ok(!exists)
        })
    }

    /// Append one event whose payload is DERIVED, inside the same
    /// transaction, from the run's existing events of that kind.
    ///
    /// The read and the append are one atomic step, which is the whole
    /// point. A counter carried in the stream — a packet's transport-failure
    /// budget — read in one call and appended in the next lets two concurrent
    /// advances observe the same `n` and both write `n + 1`: one outage is
    /// charged once instead of twice and the bounded budget silently stops
    /// being bounded.
    ///
    /// The dumb-durable-store boundary holds: the ledger hands `derive` the
    /// rows it already stores and stores back whatever value it returns when
    /// the paired boolean is true, parsing neither. A false boolean replays
    /// an already-derived value without appending a duplicate physical row.
    pub fn append_event_derived<F>(
        &self,
        run_id: &str,
        kind: &str,
        derive: F,
    ) -> Result<serde_json::Value, LedgerError>
    where
        F: FnOnce(&[EventRow]) -> Result<(serde_json::Value, bool), LedgerError> + Send + 'static,
    {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let standing = run_events_by_kind_tx(&tx, &run_id, &kind)?;
            let (payload, append) = derive(&standing)?;
            if append {
                append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
            }
            tx.commit()?;
            Ok(payload)
        })
    }

    /// Append one derived event while observing the run's latest execution
    /// policy revision under the same write transaction.
    ///
    /// This is the retry-policy counterpart to [`Ledger::append_event_derived`]:
    /// a policy revision cannot land between the revision snapshot used for a
    /// cutoff decision and the event append. The ledger still interprets
    /// neither input; it supplies stored rows to `derive` and persists the
    /// returned payload only when the paired boolean is true.
    pub fn append_event_derived_with_policy_revision<F>(
        &self,
        run_id: &str,
        kind: &str,
        derive: F,
    ) -> Result<serde_json::Value, LedgerError>
    where
        F: FnOnce(
                &[EventRow],
                Option<&PolicyRevisionRow>,
            ) -> Result<(serde_json::Value, bool), LedgerError>
            + Send
            + 'static,
    {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let policy_revision = latest_policy_revision_tx(&tx, &run_id)?;
            let standing = run_events_by_kind_tx(&tx, &run_id, &kind)?;
            let (payload, append) = derive(&standing, policy_revision.as_ref())?;
            if append {
                append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
            }
            tx.commit()?;
            Ok(payload)
        })
    }

    /// Rows with `event_id > after_event_id` (exclusive), ordered by
    /// `event_id` ascending, at most `limit` rows; `limit == 0` returns an
    /// empty vec. `run_id: None` returns all rows including NULL-run rows;
    /// `Some(r)` returns only rows with `run_id = r`.
    pub fn list_events(
        &self,
        run_id: Option<&str>,
        after_event_id: i64,
        limit: u32,
    ) -> Result<Vec<EventRow>, LedgerError> {
        let run_id = run_id.map(str::to_owned);
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE event_id > ?1 AND (?2 IS NULL OR run_id = ?2)
                 ORDER BY event_id ASC LIMIT ?3",
            )?;
            let rows = stmt.query_map(
                rusqlite::params![after_event_id, run_id, i64::from(limit)],
                |row| {
                    Ok(EventRow {
                        event_id: row.get(0)?,
                        ts: row.get(1)?,
                        run_id: row.get(2)?,
                        kind: row.get(3)?,
                        payload_json: row.get(4)?,
                    })
                },
            )?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Count rows in the same subject/after window served by [`Self::list_events`].
    pub fn count_events(
        &self,
        run_id: Option<&str>,
        after_event_id: i64,
    ) -> Result<u64, LedgerError> {
        let run_id = run_id.map(str::to_owned);
        self.submit(move |conn| {
            let count = conn.query_row(
                "SELECT COUNT(*) FROM events
                 WHERE event_id > ?1 AND (?2 IS NULL OR run_id = ?2)",
                rusqlite::params![after_event_id, run_id],
                |row| row.get::<_, i64>(0),
            )?;
            u64::try_from(count).map_err(|_| LedgerError::Internal {
                message: "event count was negative".to_owned(),
            })
        })
    }

    /// Count and read one bounded event page on the ledger actor as one
    /// snapshot. A concurrent append cannot land between the coverage count
    /// and the rows whose coverage it describes.
    pub fn list_events_with_count(
        &self,
        run_id: Option<&str>,
        after_event_id: i64,
        limit: u32,
    ) -> Result<(Vec<EventRow>, u64), LedgerError> {
        let run_id = run_id.map(str::to_owned);
        self.submit(move |conn| {
            let count = conn.query_row(
                "SELECT COUNT(*) FROM events
                 WHERE event_id > ?1 AND (?2 IS NULL OR run_id = ?2)",
                rusqlite::params![after_event_id, run_id],
                |row| row.get::<_, i64>(0),
            )?;
            let total = u64::try_from(count).map_err(|_| LedgerError::Internal {
                message: "event count was negative".to_owned(),
            })?;
            let mut statement = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE event_id > ?1 AND (?2 IS NULL OR run_id = ?2)
                 ORDER BY event_id ASC LIMIT ?3",
            )?;
            let rows = statement.query_map(
                rusqlite::params![after_event_id, run_id, i64::from(limit)],
                event_row,
            )?;
            Ok((rows.collect::<Result<Vec<_>, _>>()?, total))
        })
    }

    /// Bounded rows for one subject and exact event kind, oldest first.
    pub fn list_subject_events_by_kind(
        &self,
        run_id: &str,
        kind: &str,
        limit: u32,
    ) -> Result<Vec<EventRow>, LedgerError> {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let mut statement = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id ASC LIMIT ?3",
            )?;
            let rows = statement
                .query_map(rusqlite::params![run_id, kind, i64::from(limit)], event_row)?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// Newest-first page for one subject and exact event kind, together with
    /// the complete kind count from the same ledger-actor snapshot. `before`
    /// is an exclusive event-id cursor toward older rows.
    pub fn list_subject_events_by_kind_desc_with_count(
        &self,
        run_id: &str,
        kind: &str,
        before: Option<i64>,
        limit: u32,
    ) -> Result<(Vec<EventRow>, u64), LedgerError> {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let count = conn.query_row(
                "SELECT COUNT(*) FROM events WHERE run_id = ?1 AND kind = ?2",
                rusqlite::params![run_id, kind],
                |row| row.get::<_, i64>(0),
            )?;
            let total = u64::try_from(count).map_err(|_| LedgerError::Internal {
                message: "event count was negative".to_owned(),
            })?;
            let mut statement = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE run_id = ?1 AND kind = ?2
                   AND (?3 IS NULL OR event_id < ?3)
                 ORDER BY event_id DESC LIMIT ?4",
            )?;
            let rows = statement.query_map(
                rusqlite::params![run_id, kind, before, i64::from(limit)],
                event_row,
            )?;
            Ok((rows.collect::<Result<Vec<_>, _>>()?, total))
        })
    }

    /// One globally bounded newest-first page for an exact set of subjects,
    /// plus each subject's complete count. The event-id cursor is global, so
    /// callers can page an epic's child streams without a composite token or
    /// applying the requested limit once per child.
    pub fn list_subjects_events_by_kind_desc_with_counts(
        &self,
        run_ids: Vec<String>,
        kind: &str,
        before: Option<i64>,
        limit: u32,
    ) -> Result<SubjectEventPage, LedgerError> {
        if run_ids.is_empty() {
            return Ok(SubjectEventPage {
                rows: Vec::new(),
                counts: BTreeMap::new(),
            });
        }
        let run_scope = serde_json::to_string(&run_ids)?;
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let mut count_statement = conn.prepare(
                "SELECT run_id, COUNT(*),
                        SUM(CASE WHEN (?3 IS NULL OR event_id < ?3) THEN 1 ELSE 0 END)
                 FROM events
                 WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))
                   AND kind = ?2
                 GROUP BY run_id",
            )?;
            let count_rows =
                count_statement.query_map(rusqlite::params![run_scope, kind, before], |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, i64>(1)?,
                        row.get::<_, i64>(2)?,
                    ))
                })?;
            let mut counts = BTreeMap::new();
            for row in count_rows {
                let (run_id, total, eligible) = row?;
                let total = u64::try_from(total).map_err(|_| LedgerError::Internal {
                    message: "event count was negative".to_owned(),
                })?;
                let eligible = u64::try_from(eligible).map_err(|_| LedgerError::Internal {
                    message: "event count was negative".to_owned(),
                })?;
                counts.insert(run_id, SubjectEventCount { total, eligible });
            }
            drop(count_statement);

            let mut statement = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))
                   AND kind = ?2
                   AND (?3 IS NULL OR event_id < ?3)
                 ORDER BY event_id DESC LIMIT ?4",
            )?;
            let rows = statement.query_map(
                rusqlite::params![run_scope, kind, before, i64::from(limit)],
                event_row,
            )?;
            Ok(SubjectEventPage {
                rows: rows.collect::<Result<Vec<_>, _>>()?,
                counts,
            })
        })
    }

    /// Bounded rows for one subject whose event kind begins with `prefix`.
    pub fn list_subject_events_by_kind_prefix(
        &self,
        run_id: &str,
        prefix: &str,
        limit: u32,
    ) -> Result<Vec<EventRow>, LedgerError> {
        let run_id = run_id.to_owned();
        let escaped = prefix
            .replace('\\', "\\\\")
            .replace('%', "\\%")
            .replace('_', "\\_");
        let pattern = format!("{escaped}%");
        self.submit(move |conn| {
            let mut statement = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE run_id = ?1 AND kind LIKE ?2 ESCAPE '\\'
                 ORDER BY event_id ASC LIMIT ?3",
            )?;
            let rows = statement.query_map(
                rusqlite::params![run_id, pattern, i64::from(limit)],
                event_row,
            )?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// The newest event per run, keyed by `run_id`; rows with a NULL
    /// `run_id` are excluded — they belong to no unit of work.
    ///
    /// Newest is the greatest `event_id`, the append position, never the
    /// `ts` string: two events written in the same second must not resolve
    /// by luck. One aggregate answers every run, so a caller projecting the
    /// whole inventory never queries per run.
    pub fn latest_event_per_run(&self) -> Result<BTreeMap<String, EventRow>, LedgerError> {
        self.submit(move |conn| latest_event_per_run_tx(conn))
    }

    /// All rows of one event kind, ordered by append position.
    ///
    /// Upgrade projectors use this indexed seam instead of rescanning the
    /// complete event history on every process start.
    pub fn list_events_by_kind(&self, kind: &str) -> Result<Vec<EventRow>, LedgerError> {
        let kind = kind.to_owned();
        self.submit(move |conn| list_events_by_kind_tx(conn, &kind))
    }
}

#[cfg(test)]
mod tests {
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::sync::mpsc;
    use std::time::{Duration, Instant};

    use super::*;

    static POLICY_WRITER_BLOCKED: AtomicBool = AtomicBool::new(false);

    fn observe_blocked_policy_writer(_attempts: i32) -> bool {
        POLICY_WRITER_BLOCKED.store(true, Ordering::SeqCst);
        true
    }

    #[test]
    fn policy_revision_cannot_land_between_derived_snapshot_and_retry_append() {
        const RUN: &str = "run-policy-retry-race";
        const RETRY_KIND: &str = "proto.retry";

        POLICY_WRITER_BLOCKED.store(false, Ordering::SeqCst);
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let bootstrap = Ledger::open(&path).expect("open bootstrap ledger");
        bootstrap
            .create_run(crate::NewRun {
                run_id: forged_types::RunId::new(RUN).expect("run id"),
                work_id: RUN.to_owned(),
                repo: dir.path().to_string_lossy().into_owned(),
                base_ref: "main".to_owned(),
                branch: format!("forged/{RUN}"),
            })
            .expect("create run");
        bootstrap.close().expect("close bootstrap ledger");

        let connection = Connection::open(&path).expect("open policy fixture");
        connection
            .execute(
                "INSERT INTO policy_revisions \
                 (run_id, revision, policy_json, policy_sha256, reason, created_at) \
                 VALUES (?1, 1, '{}', 'rev1', 'initial', \
                         '2026-09-02T00:00:00.000000000Z')",
                [RUN],
            )
            .expect("insert revision 1");
        drop(connection);

        let retry_ledger = Ledger::open(&path).expect("open retry ledger");
        let observer = Ledger::open(&path).expect("open observer ledger");
        let (snapshot_tx, snapshot_rx) = mpsc::sync_channel(0);
        let (release_tx, release_rx) = mpsc::sync_channel(0);
        let retry = std::thread::spawn(move || {
            let payload = retry_ledger
                .append_event_derived_with_policy_revision(
                    RUN,
                    RETRY_KIND,
                    move |_standing, revision| {
                        let revision = revision.expect("revision snapshot");
                        assert_eq!(revision.revision, 1);
                        snapshot_tx.send(()).expect("announce snapshot");
                        release_rx.recv().expect("release retry append");
                        Ok((
                            serde_json::json!({
                                "schemaVersion": 1,
                                "packetId": "run-policy-retry-race/implement/1",
                                "policyRevision": revision.revision,
                                "transportFailures": 1,
                                "retryAfter": "2026-09-02T00:00:30.000000000Z",
                            }),
                            true,
                        ))
                    },
                )
                .expect("append retry");
            retry_ledger.close().expect("close retry ledger");
            payload
        });
        snapshot_rx
            .recv_timeout(Duration::from_secs(2))
            .expect("retry transaction reached revision snapshot");

        let revision_path = path.clone();
        let revision = std::thread::spawn(move || {
            let mut connection = Connection::open(revision_path).expect("open revision writer");
            connection
                .busy_handler(Some(observe_blocked_policy_writer))
                .expect("install busy observer");
            let tx = connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .expect("begin policy revision");
            let created_at = now_iso();
            tx.execute(
                "INSERT INTO policy_revisions \
                 (run_id, revision, policy_json, policy_sha256, reason, created_at) \
                 VALUES (?1, 2, '{}', 'rev2', 'concurrent revision', ?2)",
                rusqlite::params![RUN, created_at],
            )
            .expect("insert revision 2");
            tx.commit().expect("commit revision 2");
        });

        let wait_started = Instant::now();
        while !POLICY_WRITER_BLOCKED.load(Ordering::SeqCst)
            && wait_started.elapsed() < Duration::from_secs(2)
        {
            std::thread::yield_now();
        }
        let was_blocked = POLICY_WRITER_BLOCKED.load(Ordering::SeqCst);
        release_tx.send(()).expect("release retry transaction");
        let payload = retry.join().expect("retry writer");
        revision.join().expect("revision writer");
        assert!(
            was_blocked,
            "the competing revision must reach the retry transaction's write lock"
        );
        assert_eq!(payload["policyRevision"], serde_json::json!(1));
        let latest_revision = observer
            .latest_policy_revision(RUN)
            .expect("latest policy")
            .expect("revision 2");
        assert_eq!(latest_revision.revision, 2);
        let rows = observer
            .list_events(Some(RUN), 0, 16)
            .expect("retry events");
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].kind, RETRY_KIND);
        assert!(
            rows[0].ts < latest_revision.created_at,
            "the retry must commit before the competing policy cutoff"
        );
        observer.close().expect("close observer ledger");
    }

    #[test]
    fn latest_event_plan_uses_the_partial_run_major_index_without_temp_grouping() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        Ledger::open(&path)
            .expect("migrate")
            .close()
            .expect("close");
        let conn = Connection::open(path).expect("raw connection");
        let mut statement = conn
            .prepare(&format!("EXPLAIN QUERY PLAN {LATEST_EVENT_PER_RUN_SQL}"))
            .expect("prepare plan");
        let details = statement
            .query_map([], |row| row.get::<_, String>(3))
            .expect("query plan")
            .collect::<Result<Vec<_>, _>>()
            .expect("plan rows");

        assert!(
            details
                .iter()
                .any(|detail| detail.contains("events_run_event")),
            "run-major index is absent from plan: {details:?}"
        );
        assert!(
            details
                .iter()
                .all(|detail| !detail.contains("TEMP B-TREE FOR GROUP BY")),
            "latest-event grouping still materializes a temporary B-tree: {details:?}"
        );
    }

    #[test]
    fn subject_kind_reads_are_exact_scoped_and_bounded() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("migrate");
        for (run, kind, ordinal) in [
            ("subject-a", "proto.gate", 1),
            ("subject-a", "proto.review", 2),
            ("subject-a", "proto.gate", 3),
            ("subject-a", "forged.intervention.requested", 4),
            ("subject-b", "proto.gate", 5),
        ] {
            ledger
                .append_event(Some(run), kind, serde_json::json!({"ordinal": ordinal}))
                .expect("append fixture event");
        }

        assert_eq!(ledger.count_events(Some("subject-a"), 0).expect("count"), 4);
        let (page, total) = ledger
            .list_events_with_count(Some("subject-a"), 0, 2)
            .expect("atomic event page");
        assert_eq!(page.len(), 2);
        assert_eq!(total, 4);
        let gates = ledger
            .list_subject_events_by_kind("subject-a", "proto.gate", 1)
            .expect("bounded gates");
        assert_eq!(gates.len(), 1);
        assert_eq!(gates[0].run_id.as_deref(), Some("subject-a"));
        assert_eq!(gates[0].kind, "proto.gate");
        assert!(gates[0].payload_json.contains("\"ordinal\":1"));
        let (newest, total) = ledger
            .list_subject_events_by_kind_desc_with_count("subject-a", "proto.gate", None, 1)
            .expect("newest gate page");
        assert_eq!(total, 2);
        assert!(newest[0].payload_json.contains("\"ordinal\":3"));
        let (older, total) = ledger
            .list_subject_events_by_kind_desc_with_count(
                "subject-a",
                "proto.gate",
                Some(newest[0].event_id),
                1,
            )
            .expect("older gate page");
        assert_eq!(total, 2);
        assert!(older[0].payload_json.contains("\"ordinal\":1"));

        let scoped = ledger
            .list_subjects_events_by_kind_desc_with_counts(
                vec!["subject-a".to_owned(), "subject-b".to_owned()],
                "proto.gate",
                None,
                2,
            )
            .expect("globally bounded subject page");
        assert_eq!(scoped.rows.len(), 2);
        assert!(scoped.rows[0].payload_json.contains("\"ordinal\":5"));
        assert!(scoped.rows[1].payload_json.contains("\"ordinal\":3"));
        assert_eq!(
            scoped.counts.get("subject-a"),
            Some(&SubjectEventCount {
                total: 2,
                eligible: 2,
            })
        );
        assert_eq!(
            scoped.counts.get("subject-b"),
            Some(&SubjectEventCount {
                total: 1,
                eligible: 1,
            })
        );
        let scoped_older = ledger
            .list_subjects_events_by_kind_desc_with_counts(
                vec!["subject-a".to_owned(), "subject-b".to_owned()],
                "proto.gate",
                Some(scoped.rows[1].event_id),
                2,
            )
            .expect("global subject cursor");
        assert_eq!(scoped_older.rows.len(), 1);
        assert!(scoped_older.rows[0].payload_json.contains("\"ordinal\":1"));

        let interventions = ledger
            .list_subject_events_by_kind_prefix("subject-a", "forged.intervention.", 8)
            .expect("bounded intervention prefix");
        assert_eq!(interventions.len(), 1);
        assert_eq!(interventions[0].kind, "forged.intervention.requested");
        ledger.close().expect("close");
    }

    #[test]
    fn append_event_once_admits_a_payload_that_differs_only_by_epoch() {
        // The epic scheduler's cross-epoch contract: a projection that reads
        // only the current epoch needs its OWN event, so an epoch-tagged
        // payload must insert even when every other field repeats a dead
        // epoch's byte-identical one.
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("migrate");
        let kind = "forged.epic.integration.ready";
        let ready = |epoch: u64| {
            serde_json::json!({
                "branch": "forged/epic-x",
                "baseRef": "main",
                "cutSha": "a".repeat(40),
                "epoch": epoch,
            })
        };
        assert!(ledger
            .append_event_once("epic-x", kind, ready(0))
            .expect("first epoch inserts"));
        assert!(!ledger
            .append_event_once("epic-x", kind, ready(0))
            .expect("a same-epoch retry is idempotent"));
        assert!(ledger
            .append_event_once("epic-x", kind, ready(1))
            .expect("a fresh epoch inserts its own event"));
        assert_eq!(
            ledger
                .list_events(Some("epic-x"), 0, 16)
                .expect("events")
                .len(),
            2
        );
        ledger.close().expect("close");
    }
}
