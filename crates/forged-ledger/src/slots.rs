//! Merge slots. forged owns the acquisition clock; staleness policy belongs
//! to forged-beads' reaper, which gets `read_merge_slot` and
//! `force_release_merge_slot`.

use forged_types::ErrorCode;
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{MergeSlotRow, SlotOutcome};

fn read_slot_tx(conn: &Connection, slot: &str) -> Result<Option<MergeSlotRow>, LedgerError> {
    Ok(conn
        .query_row(
            "SELECT slot, holder, acquired_at FROM merge_slots WHERE slot = ?1",
            [slot],
            |row| {
                Ok(MergeSlotRow {
                    slot: row.get(0)?,
                    holder: row.get(1)?,
                    acquired_at: row.get(2)?,
                })
            },
        )
        .optional()?)
}

impl Ledger {
    /// Acquire (or re-acquire) a slot. Contention is a normal outcome, not
    /// an error: a held slot returns `Held` with the current row, and
    /// re-acquiring a slot you already hold returns `Acquired` with the
    /// ORIGINAL `acquired_at` — the clock never resets while held.
    pub fn acquire_merge_slot(
        &self,
        slot: &str,
        holder: &str,
    ) -> Result<SlotOutcome, LedgerError> {
        let slot = slot.to_owned();
        let holder = holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            match read_slot_tx(&tx, &slot)? {
                Some(row) if row.holder == holder => {
                    tx.commit()?;
                    Ok(SlotOutcome::Acquired(row))
                }
                Some(row) => {
                    tx.commit()?;
                    Ok(SlotOutcome::Held(row))
                }
                None => {
                    let acquired_at = now_iso();
                    tx.execute(
                        "INSERT INTO merge_slots (slot, holder, acquired_at) \
                         VALUES (?1, ?2, ?3)",
                        rusqlite::params![slot, holder, acquired_at],
                    )?;
                    tx.commit()?;
                    Ok(SlotOutcome::Acquired(MergeSlotRow {
                        slot,
                        holder,
                        acquired_at,
                    }))
                }
            }
        })
    }

    /// Release a slot you hold. The wrong holder refuses with
    /// `InvalidRequest`; an absent slot is an idempotent `Ok(())`.
    pub fn release_merge_slot(&self, slot: &str, holder: &str) -> Result<(), LedgerError> {
        let slot = slot.to_owned();
        let holder = holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            match read_slot_tx(&tx, &slot)? {
                None => {
                    tx.commit()?;
                    Ok(())
                }
                Some(row) if row.holder != holder => Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("slot {slot:?} is held by {:?}, not {holder:?}", row.holder),
                )),
                Some(_) => {
                    tx.execute("DELETE FROM merge_slots WHERE slot = ?1", [&slot])?;
                    tx.commit()?;
                    Ok(())
                }
            }
        })
    }

    /// The current slot row, if any; `Ok(None)` on a miss.
    pub fn read_merge_slot(&self, slot: &str) -> Result<Option<MergeSlotRow>, LedgerError> {
        let slot = slot.to_owned();
        self.submit(move |conn| read_slot_tx(conn, &slot))
    }

    /// Reaper tooling: delete a slot regardless of holder, appending a
    /// `merge_slot.force_released` event in the same transaction.
    /// Force-releasing an absent slot is an event-free no-op.
    pub fn force_release_merge_slot(&self, slot: &str) -> Result<(), LedgerError> {
        let slot = slot.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            match read_slot_tx(&tx, &slot)? {
                None => {
                    tx.commit()?;
                    Ok(())
                }
                Some(row) => {
                    tx.execute("DELETE FROM merge_slots WHERE slot = ?1", [&slot])?;
                    append_event_tx(
                        &tx,
                        None,
                        "merge_slot.force_released",
                        &json!({
                            "slot": row.slot,
                            "holder": row.holder,
                            "acquiredAt": row.acquired_at,
                        }),
                    )?;
                    tx.commit()?;
                    Ok(())
                }
            }
        })
    }
}
