//! Presence, provenance, linkage, and tombstones.
//!
//! Everything here is a STATE, never a deletion. A source file that
//! disappears is marked missing; its session, its events, its archived
//! bytes, its search chunks, and its usage evidence all stay exactly where
//! they are and stay searchable. That is the whole point of the archive:
//! it outlives the native logs it read.
//!
//! There is no TTL, no pruning pass, no source-missing delete, and nothing
//! in this crate ever writes to a source file. The only API that names
//! removal is [`History::record_purge_tombstone`], and it records a purge
//! rather than performing one — purge execution belongs to a later,
//! digest-confirmed path.

use rusqlite::{params, TransactionBehavior};

use crate::error::{invalid, HistoryError};
use crate::history::{current_host_id, History};
use crate::time::now_iso;
use crate::types::{
    AttemptLinkConfidence, AttemptLinkKind, AttemptLinkRow, PresenceState, PurgeScope,
    PurgeTombstoneRow, SourceFamily, SourceRootRow, SourceRunOutcome,
};

impl History {
    /// Every source root the archive has observed.
    pub fn source_roots(&self) -> Result<Vec<SourceRootRow>, HistoryError> {
        self.submit(|conn| {
            let mut stmt = conn.prepare(
                "SELECT source_root_id, host_id, source_family, root_path, presence,
                        first_seen_at, last_seen_at, missing_at
                   FROM source_roots ORDER BY source_root_id",
            )?;
            let rows = stmt
                .query_map([], |row| {
                    let family: String = row.get(2)?;
                    let presence: String = row.get(4)?;
                    Ok(SourceRootRow {
                        source_root_id: row.get(0)?,
                        host_id: row.get(1)?,
                        source_family: SourceFamily::from_column(2, &family)?,
                        root_path: row.get(3)?,
                        presence: PresenceState::from_column(4, &presence)?,
                        first_seen_at: row.get(5)?,
                        last_seen_at: row.get(6)?,
                        missing_at: row.get(7)?,
                    })
                })?
                .collect::<Result<Vec<SourceRootRow>, _>>()?;
            Ok(rows)
        })
    }

    /// Record that a source file is gone.
    ///
    /// Marks the file and every session observation of it missing. NOTHING
    /// about the archived content changes: the disappearance of a native log
    /// is precisely the case the archive exists to survive.
    pub fn mark_source_file_missing(&self, source_file_id: i64) -> Result<bool, HistoryError> {
        self.set_file_presence(source_file_id, PresenceState::Missing)
    }

    /// Record that a previously missing source file is back.
    pub fn mark_source_file_present(&self, source_file_id: i64) -> Result<bool, HistoryError> {
        self.set_file_presence(source_file_id, PresenceState::Present)
    }

    fn set_file_presence(
        &self,
        source_file_id: i64,
        presence: PresenceState,
    ) -> Result<bool, HistoryError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            let missing_at = match presence {
                PresenceState::Missing => Some(now.clone()),
                PresenceState::Present => None,
            };
            let changed = tx.execute(
                "UPDATE source_files
                    SET presence = ?2, last_seen_at = ?3, missing_at = ?4
                  WHERE source_file_id = ?1",
                params![source_file_id, presence, now, missing_at],
            )?;
            tx.execute(
                "UPDATE session_observations
                    SET presence = ?2, last_seen_at = ?3, missing_at = ?4
                  WHERE source_file_id = ?1",
                params![source_file_id, presence, now, missing_at],
            )?;
            tx.commit()?;
            Ok(changed == 1)
        })
    }

    /// Record that a whole source root is gone, and every file beneath it.
    ///
    /// Returns how many files were marked. Archived content is untouched.
    pub fn mark_source_root_missing(&self, source_root_id: i64) -> Result<i64, HistoryError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            tx.execute(
                "UPDATE source_roots
                    SET presence = 'missing', last_seen_at = ?2, missing_at = ?2
                  WHERE source_root_id = ?1",
                params![source_root_id, now],
            )?;
            let files = tx.execute(
                "UPDATE source_files
                    SET presence = 'missing', last_seen_at = ?2, missing_at = ?2
                  WHERE source_root_id = ?1",
                params![source_root_id, now],
            )?;
            tx.execute(
                "UPDATE session_observations
                    SET presence = 'missing', last_seen_at = ?2, missing_at = ?2
                  WHERE source_file_id IN
                        (SELECT source_file_id FROM source_files WHERE source_root_id = ?1)",
                params![source_root_id, now],
            )?;
            tx.commit()?;
            Ok(files as i64)
        })
    }

    /// Open a provenance record for one ingestion pass over a source family.
    pub fn begin_source_run(&self, family: SourceFamily) -> Result<i64, HistoryError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let host_id = current_host_id(&tx)?;
            tx.execute(
                "INSERT INTO source_runs (host_id, source_family, started_at)
                 VALUES (?1, ?2, ?3)",
                params![host_id, family, now_iso()],
            )?;
            let id = tx.last_insert_rowid();
            tx.commit()?;
            Ok(id)
        })
    }

    /// Close a provenance record with its outcome.
    ///
    /// An interrupted pass is a real outcome, not an absence: a run left
    /// open across a crash is exactly what a later reconcile needs to see.
    pub fn finish_source_run(
        &self,
        source_run_id: i64,
        outcome: SourceRunOutcome,
        files_seen: i64,
        events_published: i64,
        note: Option<&str>,
    ) -> Result<bool, HistoryError> {
        if files_seen < 0 || events_published < 0 {
            return Err(invalid("source run counters are non-negative"));
        }
        let note = note.map(ToOwned::to_owned);
        self.submit(move |conn| {
            let changed = conn.execute(
                "UPDATE source_runs
                    SET finished_at = ?2, outcome = ?3, files_seen = ?4,
                        events_published = ?5, note = ?6
                  WHERE source_run_id = ?1 AND finished_at IS NULL",
                params![
                    source_run_id,
                    now_iso(),
                    outcome,
                    files_seen,
                    events_published,
                    note
                ],
            )?;
            Ok(changed == 1)
        })
    }

    /// Link a session to an orchestrator identity, idempotently.
    ///
    /// `true` means the link is NEW. Re-linking the same identity updates its
    /// confidence in place and answers `false` — a caller replaying its own
    /// work must be able to tell the two apart.
    pub fn link_session(
        &self,
        session_id: i64,
        link_kind: AttemptLinkKind,
        link_value: &str,
        confidence: AttemptLinkConfidence,
    ) -> Result<bool, HistoryError> {
        if link_value.is_empty() {
            return Err(invalid("an attempt link carries a non-empty value"));
        }
        let link_value = link_value.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            // An upsert reports one changed row either way, so novelty is
            // decided by reading before writing, inside the same transaction.
            let existed: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM attempt_links
                                WHERE session_id = ?1 AND link_kind = ?2 AND link_value = ?3)",
                params![session_id, link_kind, link_value],
                |row| row.get(0),
            )?;
            tx.execute(
                "INSERT INTO attempt_links
                   (session_id, link_kind, link_value, confidence, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)
                 ON CONFLICT(session_id, link_kind, link_value)
                   DO UPDATE SET confidence = ?4",
                params![session_id, link_kind, link_value, confidence, now_iso()],
            )?;
            tx.commit()?;
            Ok(!existed)
        })
    }

    /// Every orchestrator identity a session is linked to.
    pub fn session_links(&self, session_id: i64) -> Result<Vec<AttemptLinkRow>, HistoryError> {
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT session_id, link_kind, link_value, confidence, created_at
                   FROM attempt_links WHERE session_id = ?1
                  ORDER BY link_kind, link_value",
            )?;
            let rows = stmt
                .query_map([session_id], |row| {
                    let kind: String = row.get(1)?;
                    let confidence: String = row.get(3)?;
                    Ok(AttemptLinkRow {
                        session_id: row.get(0)?,
                        link_kind: AttemptLinkKind::from_column(1, &kind)?,
                        link_value: row.get(2)?,
                        confidence: AttemptLinkConfidence::from_column(3, &confidence)?,
                        created_at: row.get(4)?,
                    })
                })?
                .collect::<Result<Vec<AttemptLinkRow>, _>>()?;
            Ok(rows)
        })
    }

    /// Record that a digest-confirmed purge removed content.
    ///
    /// This writes EVIDENCE ONLY. It removes no block, no chunk, no FTS row,
    /// and no event: purge execution is a later, separately authorized path,
    /// and a tombstone written here is what that path must later prove
    /// against.
    pub fn record_purge_tombstone(
        &self,
        scope: PurgeScope,
        scope_key: &str,
        digest_sha256: &str,
        reason: &str,
    ) -> Result<i64, HistoryError> {
        if scope_key.is_empty() || digest_sha256.is_empty() || reason.is_empty() {
            return Err(invalid(
                "a purge tombstone carries a scope key, a digest, and a reason",
            ));
        }
        let (scope_key, digest, reason) = (
            scope_key.to_owned(),
            digest_sha256.to_owned(),
            reason.to_owned(),
        );
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            tx.execute(
                "INSERT INTO purge_tombstones
                   (scope, scope_key, digest_sha256, reason, purged_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)
                 ON CONFLICT(scope, scope_key) DO NOTHING",
                params![scope, scope_key, digest, reason, now_iso()],
            )?;
            let id: i64 = tx.query_row(
                "SELECT tombstone_id FROM purge_tombstones WHERE scope = ?1 AND scope_key = ?2",
                params![scope, scope_key],
                |row| row.get(0),
            )?;
            tx.commit()?;
            Ok(id)
        })
    }

    /// Every purge tombstone the archive holds.
    pub fn purge_tombstones(&self) -> Result<Vec<PurgeTombstoneRow>, HistoryError> {
        self.submit(|conn| {
            let mut stmt = conn.prepare(
                "SELECT tombstone_id, scope, scope_key, digest_sha256, reason, purged_at
                   FROM purge_tombstones ORDER BY tombstone_id",
            )?;
            let rows = stmt
                .query_map([], |row| {
                    let scope: String = row.get(1)?;
                    Ok(PurgeTombstoneRow {
                        tombstone_id: row.get(0)?,
                        scope: PurgeScope::from_column(1, &scope)?,
                        scope_key: row.get(2)?,
                        digest_sha256: row.get(3)?,
                        reason: row.get(4)?,
                        purged_at: row.get(5)?,
                    })
                })?
                .collect::<Result<Vec<PurgeTombstoneRow>, _>>()?;
            Ok(rows)
        })
    }
}
