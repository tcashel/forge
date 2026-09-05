//! One transaction-consistent read of everything an inventory projection
//! needs: run/attempt/desired/operation/admission/artifact/identity joins,
//! optionally included usage evidence, the newest event per run, and the
//! caller's chosen event kinds.
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

use forged_types::{AdmissionDecisionV1, WorkIdentitySubjectKind, WorkIdentityV1};

use crate::admission::{latest_admission_decisions_tx, live_reservations};
use crate::attempts::{list_attempts_missing_artifacts_tx, list_live_attempts_tx};
use crate::desired::list_desired_work_tx;
use crate::error::LedgerError;
use crate::events::{latest_event_per_run_tx, list_events_by_kind_tx};
use crate::ledger::Ledger;
use crate::operations::list_inflight_operations_tx;
use crate::packets::{packet_row, PACKET_COLUMNS};
use crate::runs::list_runs_tx;
use crate::types::{
    AdmissionReservationRow, AttemptRow, DesiredWorkRow, EventRow, OperationRow, PacketRow, RunRow,
    UsageTotals,
};
use crate::usage::{latest_missing_usage_per_run_tx, usage_totals_per_run_tx};
use crate::work_identity::list_work_identities_tx;

/// Whether one inventory snapshot reads usage-table evidence.
///
/// The caller fixes this before the transaction begins. It is closed rather
/// than boolean so a future source cannot accidentally inherit omission or
/// inclusion without making an explicit compatibility decision.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InventoryUsageSelection {
    Include,
    Omit,
}

/// Usage evidence captured by an inventory snapshot.
///
/// Both maps live in one variant so no representable snapshot can carry
/// totals without the causal missing-cost identities (or vice versa).
#[derive(Debug)]
pub enum InventoryUsage {
    Included {
        totals: BTreeMap<String, UsageTotals>,
        latest_missing: BTreeMap<String, (i64, String)>,
    },
    Omitted,
}

fn select_inventory_usage<Totals, Missing>(
    selection: InventoryUsageSelection,
    totals: Totals,
    latest_missing: Missing,
) -> Result<InventoryUsage, LedgerError>
where
    Totals: FnOnce() -> Result<BTreeMap<String, UsageTotals>, LedgerError>,
    Missing: FnOnce() -> Result<BTreeMap<String, (i64, String)>, LedgerError>,
{
    match selection {
        InventoryUsageSelection::Include => Ok(InventoryUsage::Included {
            totals: totals()?,
            latest_missing: latest_missing()?,
        }),
        InventoryUsageSelection::Omit => Ok(InventoryUsage::Omitted),
    }
}

fn inventory_usage_tx(
    conn: &rusqlite::Connection,
    selection: InventoryUsageSelection,
) -> Result<InventoryUsage, LedgerError> {
    select_inventory_usage(
        selection,
        || usage_totals_per_run_tx(conn),
        || latest_missing_usage_per_run_tx(conn),
    )
}

/// Everything [`Ledger::inventory_snapshot`] read, all of it from the same
/// point in the ledger's history.
#[derive(Debug)]
pub struct InventorySnapshot {
    /// Every run row, ordered by `created_at` then rowid ascending.
    pub runs: Vec<RunRow>,
    /// Every `running`/`revoking` attempt, ordered by rowid ascending.
    pub live_attempts: Vec<AttemptRow>,
    /// Packets owning the bounded live-attempt set, for frozen stage budgets.
    pub live_packets: Vec<PacketRow>,
    /// Terminal attempts missing their immutable artifact join.
    pub attempts_missing_artifacts: Vec<AttemptRow>,
    /// Included usage evidence or an explicit statement that usage was not
    /// queried. Omission is never represented as measured zero.
    pub usage: InventoryUsage,
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
    /// Frozen display identity for every durable run/epic, keyed only by its
    /// canonical subject kind and id.
    pub work_identities: BTreeMap<(WorkIdentitySubjectKind, String), WorkIdentityV1>,
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
    /// Every selected source is paid unconditionally: consistency is the
    /// point, and a scan skipped on what an earlier scan happened to return
    /// would reintroduce exactly the torn read this exists to prevent. Usage
    /// selection is fixed before the transaction begins.
    pub fn inventory_snapshot(
        &self,
        kinds: &[&str],
        usage_selection: InventoryUsageSelection,
    ) -> Result<InventorySnapshot, LedgerError> {
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
                live_packets: {
                    let sql = format!(
                        "SELECT DISTINCT {} FROM packets p JOIN attempts a ON a.packet_id = p.packet_id \
                         WHERE a.state IN ('running','revoking') ORDER BY p.packet_id",
                        PACKET_COLUMNS
                            .split(',')
                            .map(|column| format!("p.{}", column.trim()))
                            .collect::<Vec<_>>()
                            .join(", ")
                    );
                    let mut statement = tx.prepare(&sql)?;
                    let rows = statement.query_map([], packet_row)?;
                    rows.collect::<Result<Vec<_>, _>>()?
                },
                attempts_missing_artifacts: list_attempts_missing_artifacts_tx(&tx)?,
                usage: inventory_usage_tx(&tx, usage_selection)?,
                latest_event: latest_event_per_run_tx(&tx)?,
                events_by_kind,
                desired_work: list_desired_work_tx(&tx)?,
                inflight_operations: list_inflight_operations_tx(&tx)?,
                admission_decisions: latest_admission_decisions_tx(&tx)?,
                admission_reservations: live_reservations(&tx)?,
                work_identities: list_work_identities_tx(&tx)?,
            };
            tx.commit()?;
            Ok(snapshot)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::Cell;

    #[test]
    fn include_calls_each_usage_source_once_and_omit_calls_neither() {
        let totals_calls = Cell::new(0usize);
        let missing_calls = Cell::new(0usize);
        let included = select_inventory_usage(
            InventoryUsageSelection::Include,
            || {
                totals_calls.set(totals_calls.get() + 1);
                Ok(BTreeMap::new())
            },
            || {
                missing_calls.set(missing_calls.get() + 1);
                Ok(BTreeMap::new())
            },
        )
        .expect("included usage");
        assert!(matches!(included, InventoryUsage::Included { .. }));
        assert_eq!(totals_calls.get(), 1);
        assert_eq!(missing_calls.get(), 1);

        let omitted = select_inventory_usage(
            InventoryUsageSelection::Omit,
            || panic!("omission called the grouped totals query"),
            || panic!("omission called the missing-cost query"),
        )
        .expect("omitted usage");
        assert!(matches!(omitted, InventoryUsage::Omitted));
    }

    #[test]
    fn omit_is_explicit_and_never_touches_the_usage_table() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");

        // A view backed by an absent table is a deterministic tripwire: any
        // totals or missing-cost read fails during statement preparation.
        ledger
            .submit(|conn| {
                conn.execute_batch(
                    "DROP TABLE usage;
                     CREATE VIEW usage AS SELECT * FROM absent_usage_source;",
                )?;
                Ok(())
            })
            .expect("install usage tripwire");

        let omitted = ledger
            .inventory_snapshot(&[], InventoryUsageSelection::Omit)
            .expect("omitted snapshot must not query usage");
        assert!(matches!(omitted.usage, InventoryUsage::Omitted));

        ledger
            .inventory_snapshot(&[], InventoryUsageSelection::Include)
            .expect_err("included snapshot must cross the usage tripwire");
        ledger.close().expect("close");
    }
}
