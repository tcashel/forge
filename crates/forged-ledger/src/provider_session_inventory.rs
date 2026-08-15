//! One transaction-consistent read for the provider-session inventory.
//!
//! This is deliberately separate from the Operations inventory: that
//! projection has narrower attempt sets and different event vocabulary.  A
//! single deferred transaction is the only actor job paid by the core
//! projector, so no row can combine revisions observed at different times.

use std::collections::{BTreeMap, BTreeSet};

use forged_types::{
    ProviderSessionActivity, ProviderSessionInventoryFiltersV1, WorkIdentitySubjectKind,
    WorkIdentityV1,
};

use crate::attempts::attempt_row;
use crate::desired::{desired_row, COLUMNS as DESIRED_COLUMNS};
use crate::error::LedgerError;
use crate::events::event_row;
use crate::herdr_projections::{projection_row, COLUMNS as PROJECTION_COLUMNS};
use crate::ledger::Ledger;
use crate::owned_herdr::{owned_row, COLUMNS as OWNED_COLUMNS};
use crate::packets::{packet_row, PACKET_COLUMNS};
use crate::runs::{run_row, RUN_COLUMNS};
use crate::time::now_iso;
use crate::types::{
    AttemptRow, DesiredWorkRow, EventRow, HerdrPaneProjectionRow, OwnedHerdrSessionRow, PacketRow,
    RunRow,
};
use crate::work_identity::{identity_row, IDENTITY_COLUMNS};

pub const PROVIDER_SESSION_INVENTORY_EVENT_KINDS: [&str; 3] = [
    "forged.session.started",
    "forged.intervention.queued",
    "forged.intervention.delivered",
];

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProviderSessionInventoryAfter {
    pub active: bool,
    pub updated_at: String,
    pub run_id: String,
    pub packet_id: String,
    pub attempt_id: i64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProviderSessionInventoryQuery {
    pub filters: ProviderSessionInventoryFiltersV1,
    /// The bounded database window, including the caller's look-ahead row.
    pub limit: usize,
    pub after: Option<ProviderSessionInventoryAfter>,
}

#[derive(Debug)]
pub struct ProviderSessionInventorySnapshot {
    pub as_of: String,
    /// Total rows matching the normalized filters before the cursor.
    pub total_matched: u64,
    pub attempts: Vec<AttemptRow>,
    pub packets: Vec<PacketRow>,
    pub runs: Vec<RunRow>,
    pub desired_work: Vec<DesiredWorkRow>,
    pub work_identities: BTreeMap<(WorkIdentitySubjectKind, String), WorkIdentityV1>,
    pub owned_herdr_sessions: Vec<OwnedHerdrSessionRow>,
    pub herdr_projections: Vec<HerdrPaneProjectionRow>,
    pub events_by_kind: BTreeMap<String, Vec<EventRow>>,
}

impl ProviderSessionInventorySnapshot {
    pub fn events(&self, kind: &str) -> &[EventRow] {
        self.events_by_kind.get(kind).map_or(&[], Vec::as_slice)
    }
}

const ATTEMPT_FROM_WHERE: &str = "FROM attempts a
    JOIN packets p ON p.packet_id = a.packet_id
    LEFT JOIN work_identities wi ON wi.subject_kind = 'run' AND wi.subject_id = p.run_id
    LEFT JOIN owned_herdr_sessions oh
      ON oh.owner_kind = 'attempt' AND oh.attempt_id = a.attempt_id
    LEFT JOIN herdr_pane_projections hp
      ON hp.target_kind = 'attempt' AND hp.attempt_id = a.attempt_id
    WHERE (?1 IS NULL OR p.run_id = ?1)
      AND (?2 IS NULL OR wi.epic_id = ?2)
      AND (?3 IS NULL OR wi.repository_path = ?3)
      AND (?4 IS NULL OR json_extract(p.body_json, '$.providerHints.provider') = ?4)
      AND (?5 IS NULL OR json_extract(p.body_json, '$.providerHints.model') = ?5)
      AND (?6 IS NULL OR a.state = ?6)
      AND (
        ?7 = 1
        OR a.state IN ('running', 'revoking')
        OR oh.cleanup_state != 'released'
        OR (hp.desired_release = 1 AND NOT (
          hp.lifecycle_state IN ('applied', 'missing')
          AND hp.lifecycle_applied_revision IS hp.desired_revision
        ))
      )";

fn query_params(query: &ProviderSessionInventoryQuery) -> [Option<&str>; 6] {
    [
        query.filters.run_id.as_deref(),
        query.filters.epic_id.as_deref(),
        query.filters.repository.as_deref(),
        query.filters.provider.as_deref(),
        query.filters.model.as_deref(),
        query.filters.activity.map(ProviderSessionActivity::as_str),
    ]
}

fn total_matched_tx(
    conn: &rusqlite::Connection,
    query: &ProviderSessionInventoryQuery,
) -> Result<u64, LedgerError> {
    let sql = format!("SELECT COUNT(*) {ATTEMPT_FROM_WHERE}");
    let params = query_params(query);
    let raw: i64 = conn.query_row(
        &sql,
        rusqlite::params![
            params[0],
            params[1],
            params[2],
            params[3],
            params[4],
            params[5],
            i64::from(query.filters.include_historical),
        ],
        |row| row.get(0),
    )?;
    Ok(u64::try_from(raw).unwrap_or(u64::MAX))
}

fn attempts_tx(
    conn: &rusqlite::Connection,
    query: &ProviderSessionInventoryQuery,
) -> Result<Vec<AttemptRow>, LedgerError> {
    let columns = "a.attempt_id, a.packet_id, a.claim_token, a.claimant, a.state,
        a.revoke_reason, a.revoke_scope, a.fail_note, a.result_json, a.started_at,
        a.updated_at, a.last_heartbeat_at, a.ended_at";
    let sql = format!(
        "SELECT {columns} {ATTEMPT_FROM_WHERE}
         AND (
           ?8 = 0
           OR CASE WHEN a.state IN ('running', 'revoking') THEN 1 ELSE 0 END < ?9
           OR (
             CASE WHEN a.state IN ('running', 'revoking') THEN 1 ELSE 0 END = ?9
             AND (
               a.updated_at < ?10
               OR (a.updated_at = ?10 AND (
                 p.run_id > ?11
                 OR (p.run_id = ?11 AND (
                   a.packet_id > ?12
                   OR (a.packet_id = ?12 AND a.attempt_id > ?13)
                 ))
               ))
             )
           )
         )
         ORDER BY CASE WHEN a.state IN ('running', 'revoking') THEN 1 ELSE 0 END DESC,
                  a.updated_at DESC, p.run_id, a.packet_id, a.attempt_id
         LIMIT ?14"
    );
    let params = query_params(query);
    let after = query.after.as_ref();
    let mut statement = conn.prepare(&sql)?;
    let rows = statement
        .query_map(
            rusqlite::params![
                params[0],
                params[1],
                params[2],
                params[3],
                params[4],
                params[5],
                i64::from(query.filters.include_historical),
                i64::from(after.is_some()),
                i64::from(after.is_some_and(|value| value.active)),
                after.map(|value| value.updated_at.as_str()),
                after.map(|value| value.run_id.as_str()),
                after.map(|value| value.packet_id.as_str()),
                after.map(|value| value.attempt_id),
                i64::try_from(query.limit).unwrap_or(i64::MAX),
            ],
            attempt_row,
        )?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

fn packets_tx(
    conn: &rusqlite::Connection,
    packet_scope: &str,
) -> Result<Vec<PacketRow>, LedgerError> {
    let sql = format!(
        "SELECT {PACKET_COLUMNS} FROM packets
         WHERE packet_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))
         ORDER BY rowid"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement
        .query_map([packet_scope], packet_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

fn runs_tx(conn: &rusqlite::Connection, run_scope: &str) -> Result<Vec<RunRow>, LedgerError> {
    let sql = format!(
        "SELECT {RUN_COLUMNS} FROM runs
         WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))
         ORDER BY created_at, rowid"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement
        .query_map([run_scope], run_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

fn identities_tx(
    conn: &rusqlite::Connection,
    run_scope: &str,
) -> Result<BTreeMap<(WorkIdentitySubjectKind, String), WorkIdentityV1>, LedgerError> {
    let sql = format!(
        "SELECT {IDENTITY_COLUMNS} FROM work_identities
         WHERE subject_kind = 'run'
           AND subject_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))
         ORDER BY subject_id"
    );
    let mut statement = conn.prepare(&sql)?;
    let mut identities = BTreeMap::new();
    for row in statement.query_map([run_scope], identity_row)? {
        let identity = row?;
        identities.insert(
            (identity.subject.kind, identity.subject.id.clone()),
            identity,
        );
    }
    Ok(identities)
}

fn desired_tx(
    conn: &rusqlite::Connection,
    run_scope: &str,
) -> Result<Vec<DesiredWorkRow>, LedgerError> {
    let sql = format!(
        "SELECT {DESIRED_COLUMNS} FROM desired_work
         WHERE (subject_kind = 'run'
                AND subject_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)))
            OR (subject_kind = 'epic' AND subject_id IN (
                SELECT epic_id FROM work_identities
                WHERE subject_kind = 'run'
                  AND subject_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))
                  AND epic_id IS NOT NULL
            ))
         ORDER BY subject_kind, subject_id"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement
        .query_map([run_scope], desired_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

fn owned_tx(
    conn: &rusqlite::Connection,
    attempt_scope: &str,
) -> Result<Vec<OwnedHerdrSessionRow>, LedgerError> {
    let sql = format!(
        "SELECT {OWNED_COLUMNS} FROM owned_herdr_sessions
         WHERE owner_kind = 'attempt'
           AND attempt_id IN (SELECT CAST(value AS INTEGER) FROM json_each(?1))
         ORDER BY ownership_id"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement
        .query_map([attempt_scope], owned_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

fn projections_tx(
    conn: &rusqlite::Connection,
    attempt_scope: &str,
) -> Result<Vec<HerdrPaneProjectionRow>, LedgerError> {
    let sql = format!(
        "SELECT {PROJECTION_COLUMNS} FROM herdr_pane_projections
         WHERE target_kind = 'attempt'
           AND attempt_id IN (SELECT CAST(value AS INTEGER) FROM json_each(?1))
         ORDER BY projection_id"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement
        .query_map([attempt_scope], projection_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

fn events_tx(
    conn: &rusqlite::Connection,
    run_scope: &str,
    kind: &str,
) -> Result<Vec<EventRow>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT event_id, ts, run_id, kind, payload_json FROM events
         WHERE kind = ?1
           AND run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?2))
         ORDER BY event_id",
    )?;
    let rows = statement
        .query_map(rusqlite::params![kind, run_scope], event_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

impl Ledger {
    /// Read every provider-session inventory dependency in one deferred
    /// transaction and one ledger-actor job.
    pub fn provider_session_inventory_snapshot(
        &self,
        query: ProviderSessionInventoryQuery,
    ) -> Result<ProviderSessionInventorySnapshot, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction()?;
            let total_matched = total_matched_tx(&tx, &query)?;
            let attempts = attempts_tx(&tx, &query)?;
            let attempt_scope = serde_json::to_string(
                &attempts
                    .iter()
                    .map(|attempt| attempt.attempt_id)
                    .collect::<Vec<_>>(),
            )?;
            let packet_scope = serde_json::to_string(
                &attempts
                    .iter()
                    .map(|attempt| attempt.packet_id.as_str())
                    .collect::<Vec<_>>(),
            )?;
            let packets = packets_tx(&tx, &packet_scope)?;
            let run_scope = serde_json::to_string(
                &packets
                    .iter()
                    .map(|packet| packet.run_id.as_str())
                    .collect::<BTreeSet<_>>(),
            )?;
            let mut events_by_kind = BTreeMap::new();
            for kind in PROVIDER_SESSION_INVENTORY_EVENT_KINDS {
                events_by_kind.insert(kind.to_owned(), events_tx(&tx, &run_scope, kind)?);
            }
            let snapshot = ProviderSessionInventorySnapshot {
                as_of: now_iso(),
                total_matched,
                attempts,
                packets,
                runs: runs_tx(&tx, &run_scope)?,
                desired_work: desired_tx(&tx, &run_scope)?,
                work_identities: identities_tx(&tx, &run_scope)?,
                owned_herdr_sessions: owned_tx(&tx, &attempt_scope)?,
                herdr_projections: projections_tx(&tx, &attempt_scope)?,
                events_by_kind,
            };
            tx.commit()?;
            Ok(snapshot)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_snapshot_has_all_sources_and_one_as_of() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let snapshot = ledger
            .provider_session_inventory_snapshot(ProviderSessionInventoryQuery {
                filters: ProviderSessionInventoryFiltersV1::default(),
                limit: 101,
                after: None,
            })
            .expect("snapshot");
        assert_eq!(snapshot.as_of.len(), 30);
        assert_eq!(snapshot.total_matched, 0);
        assert!(snapshot.attempts.is_empty());
        assert!(snapshot.packets.is_empty());
        assert!(snapshot.runs.is_empty());
        assert_eq!(
            snapshot.events_by_kind.len(),
            PROVIDER_SESSION_INVENTORY_EVENT_KINDS.len()
        );
    }
}
