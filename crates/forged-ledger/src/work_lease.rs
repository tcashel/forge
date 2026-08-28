//! Work leases: claim, heartbeat, and the scoped reclaim, in-ledger.
//!
//! Custody (`work_items.assignee`) is the holder of record — what the bd era
//! called the lease holder — and the `work_leases` row adds the expiry
//! clock; the two always move together in one transaction. Anti-steal is
//! preserved: ANY existing custody by another holder refuses a claim, even
//! an expired one — the scoped reclaim is the only door. A same-holder
//! re-claim renews.
//!
//! The TTL is a parameter (default [`WORK_LEASE_TTL_S`]), so lease expiry is
//! exercised by fast tests instead of a five-minute wall-clock wait.

use forged_types::ErrorCode;
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::{now_iso, now_plus_secs_iso};
use crate::work::WorkKind;
use crate::work::{
    clear_lease_tx, ready_tx, snapshot_tx, WorkItemSnapshot, WorkStatus,
    WORK_BLOCKED_CLAIM_REFUSAL, WORK_CLAIM_REFUSAL_PREFIX,
};

/// The default lease TTL — the bd-era 5 minutes, preserved verbatim.
pub const WORK_LEASE_TTL_S: u64 = 300;

/// The frozen timing equation: the reclaim grace window (counted from lease
/// EXPIRY) for a stage budget. Reclaim fires at TTL + older_than, so
/// `older_than = stage_budget - TTL`, saturating at 0.
pub fn work_reclaim_older_than(stage_budget_s: u64) -> u64 {
    stage_budget_s.saturating_sub(WORK_LEASE_TTL_S)
}

/// A held lease row.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkLeaseRow {
    /// The leased item.
    pub work_id: String,
    /// The holder (always equals the item's assignee).
    pub holder: String,
    /// Acquisition stamp.
    pub acquired_at: String,
    /// Expiry stamp; renewal pushes it forward.
    pub expires_at: String,
}

/// The outcome of a scoped reclaim. Reclaiming nothing (an unexpired lease,
/// a different holder, or no custody at all) is the refusal SHAPE, not an
/// error: `previous_owner` is `None` and the store is untouched.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkReclaimOutcome {
    /// The reclaimed lease's previous owner — present only when the reclaim
    /// actually fired.
    pub previous_owner: Option<String>,
}

fn lease_row_tx(conn: &Connection, work_id: &str) -> Result<Option<WorkLeaseRow>, LedgerError> {
    Ok(conn
        .query_row(
            "SELECT work_id, holder, acquired_at, expires_at FROM work_leases \
             WHERE work_id = ?1",
            [work_id],
            |row| {
                Ok(WorkLeaseRow {
                    work_id: row.get(0)?,
                    holder: row.get(1)?,
                    acquired_at: row.get(2)?,
                    expires_at: row.get(3)?,
                })
            },
        )
        .optional()?)
}

fn require_item_tx(conn: &Connection, work_id: &str) -> Result<WorkItemSnapshot, LedgerError> {
    snapshot_tx(conn, work_id)?.ok_or_else(|| {
        refused(
            ErrorCode::InvalidRequest,
            format!("work item {work_id:?} does not exist"),
        )
    })
}

/// Claim `work_id` for `holder` inside an open transaction: custody set,
/// status → `in_progress`, lease row upserted with `now + ttl_s`.
fn claim_tx(
    conn: &Connection,
    item: &WorkItemSnapshot,
    holder: &str,
    ttl_s: u64,
) -> Result<(), LedgerError> {
    let now = now_iso();
    let expires = now_plus_secs_iso(ttl_s);
    conn.execute(
        "UPDATE work_items SET status = 'in_progress', assignee = ?2, updated_at = ?3 \
         WHERE work_id = ?1",
        rusqlite::params![item.work_id, holder, now],
    )?;
    conn.execute(
        "INSERT INTO work_leases (work_id, holder, acquired_at, expires_at) \
         VALUES (?1, ?2, ?3, ?4) \
         ON CONFLICT(work_id) DO UPDATE SET holder = ?2, expires_at = ?4",
        rusqlite::params![item.work_id, holder, now, expires],
    )?;
    Ok(())
}

impl Ledger {
    /// Claim a specific work item for `holder`.
    ///
    /// Refusals preserve the bd-era contract: custody by another holder is
    /// `BeadLeaseHeld` naming the observed holder (regardless of lease
    /// expiry — reclaim is the only door); a blocked item refuses on
    /// mechanism with the stable [`WORK_BLOCKED_CLAIM_REFUSAL`] message; a
    /// closed item refuses. A same-holder re-claim renews the lease.
    pub fn claim_specific_work(
        &self,
        work_id: &str,
        holder: &str,
        ttl_s: u64,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let holder = holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let item = require_item_tx(&tx, &work_id)?;
            if let Some(current) = &item.assignee {
                if current != &holder {
                    return Err(refused(
                        ErrorCode::BeadLeaseHeld,
                        format!("work item {work_id:?} lease is held by {current:?}"),
                    ));
                }
            }
            match item.status {
                WorkStatus::Blocked => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        WORK_BLOCKED_CLAIM_REFUSAL.to_string(),
                    ));
                }
                WorkStatus::Deferred => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!("{WORK_CLAIM_REFUSAL_PREFIX}deferred"),
                    ));
                }
                WorkStatus::Closed => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!("{WORK_CLAIM_REFUSAL_PREFIX}closed"),
                    ));
                }
                WorkStatus::Open | WorkStatus::InProgress => {}
            }
            claim_tx(&tx, &item, &holder, ttl_s)?;
            let snapshot = require_item_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Claim the next ready item from the frontier for `holder`; `Ok(None)`
    /// when the frontier is empty. Selection order is the ready order
    /// (priority ascending nulls-last, then id).
    pub fn claim_ready_work(
        &self,
        holder: &str,
        ttl_s: u64,
    ) -> Result<Option<WorkItemSnapshot>, LedgerError> {
        let holder = holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            // Only schedulable work is claimable: an epic (no run can
            // execute it) and an imported no-diff type (chore / decision /
            // milestone — the slice validator refuses them AFTER a claim)
            // must never be claimed under the frontier holder, or the lease
            // strands with nothing to resume or settle.
            let Some(item) = ready_tx(&tx)?.into_iter().find(|item| {
                item.kind == WorkKind::Task
                    && !matches!(
                        item.metadata.get("imported:issue-type").map(String::as_str),
                        Some("chore") | Some("decision") | Some("milestone")
                    )
            }) else {
                tx.commit()?;
                return Ok(None);
            };
            claim_tx(&tx, &item, &holder, ttl_s)?;
            let snapshot = require_item_tx(&tx, &item.work_id)?;
            tx.commit()?;
            Ok(Some(snapshot))
        })
    }

    /// Heartbeat a held lease, pushing expiry to `now + ttl_s`. Owner-only:
    /// a missing lease or a different holder refuses with `BeadLeaseHeld` —
    /// callers treat that as "lease lost", never as retryable contention.
    pub fn heartbeat_work_lease(
        &self,
        work_id: &str,
        holder: &str,
        ttl_s: u64,
    ) -> Result<(), LedgerError> {
        let work_id = work_id.to_owned();
        let holder = holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let lease = lease_row_tx(&tx, &work_id)?;
            match lease {
                Some(row) if row.holder == holder => {
                    tx.execute(
                        "UPDATE work_leases SET expires_at = ?2 WHERE work_id = ?1",
                        rusqlite::params![work_id, now_plus_secs_iso(ttl_s)],
                    )?;
                    tx.commit()?;
                    Ok(())
                }
                Some(row) => Err(refused(
                    ErrorCode::BeadLeaseHeld,
                    format!(
                        "heartbeat refused: work item {work_id:?} lease is held by {:?}",
                        row.holder
                    ),
                )),
                None => Err(refused(
                    ErrorCode::BeadLeaseHeld,
                    format!("heartbeat refused: work item {work_id:?} has no lease"),
                )),
            }
        })
    }

    /// The current holder of record — the item's non-empty assignee, exactly
    /// as the bd-era read reported it. An unheld item is `Ok(None)`; an
    /// absent item refuses.
    pub fn work_lease_holder(&self, work_id: &str) -> Result<Option<String>, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| {
            let item = require_item_tx(conn, &work_id)?;
            Ok(item.assignee)
        })
    }

    /// The full lease row, if any (expiry inspection for supervision).
    pub fn work_lease(&self, work_id: &str) -> Result<Option<WorkLeaseRow>, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| lease_row_tx(conn, &work_id))
    }

    /// Scoped reclaim: fires only when custody is held by exactly
    /// `previous_holder` AND the lease expired at least `older_than_s`
    /// seconds ago (an item with custody but no lease row — importer
    /// residue — counts as long-expired). On fire: custody and lease clear,
    /// `in_progress` returns to `open`, and a `work.lease.reclaimed` event
    /// is appended in the same transaction. Anything else is the no-op
    /// refusal shape: `previous_owner: None`, store untouched.
    pub fn reclaim_work_lease(
        &self,
        work_id: &str,
        previous_holder: &str,
        older_than_s: u64,
    ) -> Result<WorkReclaimOutcome, LedgerError> {
        let work_id = work_id.to_owned();
        let previous_holder = previous_holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let item = require_item_tx(&tx, &work_id)?;
            if item.assignee.as_deref() != Some(previous_holder.as_str()) {
                tx.commit()?;
                return Ok(WorkReclaimOutcome {
                    previous_owner: None,
                });
            }
            let reclaim_at = now_plus_secs_iso(0);
            let expired_enough = match lease_row_tx(&tx, &work_id)? {
                // Lexicographic compare is exact: both stamps are fixed-width
                // RFC-3339 from the same clock helpers.
                Some(row) => {
                    crate::time::plus_secs_iso(&row.expires_at, older_than_s)? <= reclaim_at
                }
                None => true,
            };
            if !expired_enough {
                tx.commit()?;
                return Ok(WorkReclaimOutcome {
                    previous_owner: None,
                });
            }
            let status = match item.status {
                WorkStatus::InProgress => WorkStatus::Open,
                other => other,
            };
            tx.execute(
                "UPDATE work_items SET status = ?2, assignee = NULL, updated_at = ?3 \
                 WHERE work_id = ?1",
                rusqlite::params![work_id, status.as_str(), now_iso()],
            )?;
            clear_lease_tx(&tx, &work_id)?;
            append_event_tx(
                &tx,
                None,
                "work.lease.reclaimed",
                &json!({
                    "workId": work_id,
                    "previousOwner": previous_holder,
                    "olderThanS": older_than_s,
                }),
            )?;
            tx.commit()?;
            Ok(WorkReclaimOutcome {
                previous_owner: Some(previous_holder),
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::*;
    use crate::work::{NewWorkItem, WorkKind, WorkRevisionCause, WorkSpecFields};

    fn ledger() -> (tempfile::TempDir, Ledger) {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        (dir, ledger)
    }

    #[test]
    fn the_frontier_claim_skips_epics_for_the_first_ready_task() {
        let (_dir, l) = ledger();
        l.create_work_item(NewWorkItem {
            work_id: "epic-frontier".to_string(),
            kind: WorkKind::Epic,
            status: WorkStatus::Open,
            priority: Some(0),
            metadata: BTreeMap::new(),
            spec: WorkSpecFields {
                title: "an open unassigned epic".to_string(),
                description: String::new(),
                acceptance_criteria: String::new(),
                design: String::new(),
                notes: String::new(),
            },
            cause: WorkRevisionCause::Authored,
        })
        .unwrap();
        assert_eq!(
            l.claim_ready_work("forged:frontier:0", 300).unwrap(),
            None,
            "an epic alone in the frontier is never claimed"
        );
        // An imported no-diff type maps to WorkKind::Task with its real
        // type in metadata — the frontier must skip it too, or the slice
        // validator refuses AFTER the claim and the lease strands.
        l.create_work_item(NewWorkItem {
            work_id: "chore-frontier".to_string(),
            kind: WorkKind::Task,
            status: WorkStatus::Open,
            priority: Some(1),
            metadata: BTreeMap::from([("imported:issue-type".to_string(), "chore".to_string())]),
            spec: WorkSpecFields {
                title: "an imported chore".to_string(),
                description: String::new(),
                acceptance_criteria: String::new(),
                design: String::new(),
                notes: String::new(),
            },
            cause: WorkRevisionCause::Import,
        })
        .unwrap();
        seed(&l, "task-frontier", WorkStatus::Open, Some(5));
        let claimed = l
            .claim_ready_work("forged:frontier:0", 300)
            .unwrap()
            .expect("the task claims");
        assert_eq!(
            claimed.work_id, "task-frontier",
            "the higher-priority imported chore is skipped"
        );
    }

    fn seed(l: &Ledger, id: &str, status: WorkStatus, priority: Option<i64>) {
        l.create_work_item(NewWorkItem {
            work_id: id.to_string(),
            kind: WorkKind::Task,
            status,
            priority,
            metadata: BTreeMap::new(),
            spec: WorkSpecFields {
                title: id.to_string(),
                description: String::new(),
                acceptance_criteria: String::new(),
                design: String::new(),
                notes: String::new(),
            },
            cause: WorkRevisionCause::Authored,
        })
        .unwrap();
    }

    #[test]
    fn claim_sets_custody_status_and_lease_and_same_holder_renews() {
        let (_dir, l) = ledger();
        seed(&l, "beads-cl", WorkStatus::Open, None);
        let claimed = l.claim_specific_work("beads-cl", "me", 300).unwrap();
        assert_eq!(claimed.status, WorkStatus::InProgress);
        assert_eq!(claimed.assignee.as_deref(), Some("me"));
        let lease = l.work_lease("beads-cl").unwrap().unwrap();
        assert_eq!(lease.holder, "me");
        assert!(lease.expires_at > lease.acquired_at);

        // Same-holder re-claim renews rather than refusing.
        let renewed = l.claim_specific_work("beads-cl", "me", 300).unwrap();
        assert_eq!(renewed.assignee.as_deref(), Some("me"));
        assert_eq!(
            l.work_lease_holder("beads-cl").unwrap().as_deref(),
            Some("me")
        );
    }

    #[test]
    fn anti_steal_holds_even_for_expired_leases() {
        let (_dir, l) = ledger();
        seed(&l, "beads-steal", WorkStatus::Open, None);
        l.claim_specific_work("beads-steal", "first", 0).unwrap();
        // The lease is already expired (ttl 0), but custody still refuses a
        // different holder: reclaim is the only door.
        let err = l
            .claim_specific_work("beads-steal", "second", 300)
            .unwrap_err();
        assert_eq!(err.code(), ErrorCode::BeadLeaseHeld);
        assert!(err.to_string().contains("\"first\""), "{err}");
    }

    #[test]
    fn blocked_and_closed_items_refuse_claims_on_mechanism() {
        let (_dir, l) = ledger();
        seed(&l, "beads-blk", WorkStatus::Blocked, None);
        let err = l.claim_specific_work("beads-blk", "me", 300).unwrap_err();
        assert!(
            err.to_string().contains(WORK_BLOCKED_CLAIM_REFUSAL),
            "{err}"
        );

        seed(&l, "beads-cls", WorkStatus::Open, None);
        l.close_work_item("beads-cls", "op", "test").unwrap();
        let err = l.claim_specific_work("beads-cls", "me", 300).unwrap_err();
        assert!(err.to_string().contains(WORK_CLAIM_REFUSAL_PREFIX), "{err}");
    }

    #[test]
    fn frontier_claim_walks_ready_order_and_empties_to_none() {
        let (_dir, l) = ledger();
        seed(&l, "beads-f2", WorkStatus::Open, Some(1));
        seed(&l, "beads-f1", WorkStatus::Open, Some(0));
        let first = l.claim_ready_work("me", 300).unwrap().unwrap();
        assert_eq!(first.work_id, "beads-f1");
        let second = l.claim_ready_work("me", 300).unwrap().unwrap();
        assert_eq!(second.work_id, "beads-f2");
        assert_eq!(l.claim_ready_work("me", 300).unwrap(), None);
    }

    #[test]
    fn heartbeat_is_owner_only_and_extends_expiry() {
        let (_dir, l) = ledger();
        seed(&l, "beads-hb", WorkStatus::Open, None);
        l.claim_specific_work("beads-hb", "me", 1).unwrap();
        let before = l.work_lease("beads-hb").unwrap().unwrap().expires_at;
        l.heartbeat_work_lease("beads-hb", "me", 600).unwrap();
        let after = l.work_lease("beads-hb").unwrap().unwrap().expires_at;
        assert!(after > before, "{before} vs {after}");

        let err = l
            .heartbeat_work_lease("beads-hb", "impostor", 600)
            .unwrap_err();
        assert_eq!(err.code(), ErrorCode::BeadLeaseHeld);
        let err = l.heartbeat_work_lease("beads-hb", "me", 600).map(|_| ());
        assert!(err.is_ok());
        seed(&l, "beads-nolease", WorkStatus::Open, None);
        let err = l
            .heartbeat_work_lease("beads-nolease", "me", 600)
            .unwrap_err();
        assert!(err.to_string().contains("has no lease"), "{err}");
    }

    #[test]
    fn scoped_reclaim_fires_only_on_expiry_and_holder_match() {
        let (_dir, l) = ledger();
        seed(&l, "beads-rc", WorkStatus::Open, None);
        l.claim_specific_work("beads-rc", "dead", 300).unwrap();

        // Unexpired: the no-op refusal shape, custody intact.
        let out = l.reclaim_work_lease("beads-rc", "dead", 0).unwrap();
        assert_eq!(out.previous_owner, None);
        assert_eq!(
            l.work_lease_holder("beads-rc").unwrap().as_deref(),
            Some("dead")
        );

        // Wrong previous holder never reclaims, expired or not.
        let out = l.reclaim_work_lease("beads-rc", "wrong", 0).unwrap();
        assert_eq!(out.previous_owner, None);

        // Expired (ttl 0) + matching holder: fires, custody clears, the item
        // returns to the frontier, and evidence is appended.
        l.claim_specific_work("beads-rc", "dead", 0).unwrap();
        let out = l.reclaim_work_lease("beads-rc", "dead", 0).unwrap();
        assert_eq!(out.previous_owner.as_deref(), Some("dead"));
        let item = l.work_item("beads-rc").unwrap().unwrap();
        assert_eq!(item.status, WorkStatus::Open);
        assert_eq!(item.assignee, None);
        assert_eq!(l.work_lease("beads-rc").unwrap(), None);
        let kinds: Vec<String> = l
            .list_events(None, 0, 100)
            .unwrap()
            .into_iter()
            .map(|e| e.kind)
            .collect();
        assert!(
            kinds.contains(&"work.lease.reclaimed".to_string()),
            "{kinds:?}"
        );

        // Custody with no lease row at all (importer residue) counts as
        // long-expired.
        l.assign_unassigned_work_item("beads-rc", "ghost", WorkStatus::Open)
            .unwrap();
        let out = l.reclaim_work_lease("beads-rc", "ghost", 0).unwrap();
        assert_eq!(out.previous_owner.as_deref(), Some("ghost"));
    }

    #[test]
    fn the_timing_equation_is_preserved() {
        assert_eq!(work_reclaim_older_than(600), 300);
        assert_eq!(work_reclaim_older_than(300), 0);
        assert_eq!(work_reclaim_older_than(0), 0);
        assert_eq!(WORK_LEASE_TTL_S, 300);
    }
}
