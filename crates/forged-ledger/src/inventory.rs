//! One transaction-consistent read of everything an inventory projection
//! needs: run/attempt/desired/operation/admission/artifact joins, usage
//! totals, the newest event per run, and the caller's chosen event kinds.
//!
//! Why a snapshot and not a handful of calls: the projection cross-reads
//! sources that a concurrent append moves independently. Fetched as separate
//! jobs, a lifecycle event landing between two of them yields a row whose
//! derived `state` disagrees with the newest event that same row reports —
//! paused according to the kind scan, resumed according to the latest-event
//! map. Inside one deferred transaction (WAL: a read snapshot taken at the
//! first statement and held to commit) no writer can interleave, so every
//! part of the answer describes ONE ledger.

use std::collections::BTreeMap;

use crate::admission::{latest_admission_decisions_tx, live_reservations};
use crate::attempts::{list_attempts_missing_artifacts_tx, list_live_attempts_tx};
use crate::desired::list_desired_work_tx;
use crate::error::LedgerError;
use crate::events::{latest_event_per_run_tx, list_events_by_kind_tx};
use crate::ledger::Ledger;
use crate::operations::list_inflight_operations_tx;
use crate::runs::list_runs_tx;
use crate::types::{
    AdmissionReservationRow, AttemptRow, DesiredWorkRow, EventRow, OperationRow, RunRow,
    UsageTotals,
};
use crate::usage::{latest_missing_usage_per_run_tx, usage_totals_per_run_tx};
use forged_types::AdmissionDecisionV1;

/// Everything [`Ledger::inventory_snapshot`] read, all of it from the same
/// point in the ledger's history.
#[derive(Debug)]
pub struct InventorySnapshot {
    /// Every run row, ordered by `created_at` then rowid ascending.
    pub runs: Vec<RunRow>,
    /// Every `running`/`revoking` attempt, ordered by rowid ascending.
    pub live_attempts: Vec<AttemptRow>,
    /// Terminal attempts missing their immutable artifact join.
    pub attempts_missing_artifacts: Vec<AttemptRow>,
    /// Usage totals keyed by run id; a run with no usage rows is ABSENT,
    /// which callers read as zero spend.
    pub usage_totals: BTreeMap<String, UsageTotals>,
    /// Newest unpriced usage row per run, for occurrence identity.
    pub latest_missing_usage: BTreeMap<String, (i64, String)>,
    /// The newest event per run id, by `event_id` — the append position,
    /// never the `ts` string.
    pub latest_event: BTreeMap<String, EventRow>,
    /// The requested kinds' rows, keyed by kind, each ordered by append
    /// position. A kind with no rows maps to an empty vec, so a caller
    /// never distinguishes "not asked for" from "none stored".
    pub events_by_kind: BTreeMap<String, Vec<EventRow>>,
    /// Durable desired-work truth used by controller attention.
    pub desired_work: Vec<DesiredWorkRow>,
    /// Human-ambiguous effects which still retain external-effect custody.
    pub inflight_operations: Vec<OperationRow>,
    /// Latest scheduler decision per subject.
    pub admission_decisions: Vec<AdmissionDecisionV1>,
    /// Every capacity-bearing reservation.
    pub admission_reservations: Vec<AdmissionReservationRow>,
}

impl InventorySnapshot {
    /// The rows stored under `kind`, or an empty slice when the snapshot was
    /// not asked for that kind.
    pub fn events(&self, kind: &str) -> &[EventRow] {
        self.events_by_kind.get(kind).map_or(&[], Vec::as_slice)
    }
}

impl Ledger {
    /// Read every inventory source in ONE deferred transaction.
    ///
    /// `kinds` is the caller's event vocabulary — the ledger stores kind
    /// strings and ascribes no meaning to them, so which kinds a projection
    /// folds stays policy in the calling crate. Duplicates are read once.
    ///
    /// The whole snapshot is paid unconditionally: consistency is the point,
    /// and a scan skipped on what an earlier scan happened to return would
    /// reintroduce exactly the torn read this exists to prevent.
    pub fn inventory_snapshot(&self, kinds: &[&str]) -> Result<InventorySnapshot, LedgerError> {
        let kinds: Vec<String> = kinds.iter().map(|kind| (*kind).to_owned()).collect();
        self.submit(move |conn| {
            let tx = conn.transaction()?;
            let mut events_by_kind: BTreeMap<String, Vec<EventRow>> = BTreeMap::new();
            for kind in &kinds {
                if events_by_kind.contains_key(kind) {
                    continue;
                }
                events_by_kind.insert(kind.clone(), list_events_by_kind_tx(&tx, kind)?);
            }
            let snapshot = InventorySnapshot {
                runs: list_runs_tx(&tx)?,
                live_attempts: list_live_attempts_tx(&tx, None)?,
                attempts_missing_artifacts: list_attempts_missing_artifacts_tx(&tx)?,
                usage_totals: usage_totals_per_run_tx(&tx)?,
                latest_missing_usage: latest_missing_usage_per_run_tx(&tx)?,
                latest_event: latest_event_per_run_tx(&tx)?,
                events_by_kind,
                desired_work: list_desired_work_tx(&tx)?,
                inflight_operations: list_inflight_operations_tx(&tx)?,
                admission_decisions: latest_admission_decisions_tx(&tx)?,
                admission_reservations: live_reservations(&tx)?,
            };
            tx.commit()?;
            Ok(snapshot)
        })
    }
}
