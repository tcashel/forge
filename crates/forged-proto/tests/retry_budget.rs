//! The packet's bounded retry budget: every charge lands on its own count.
//!
//! A grant carries the count and the deadline together, and the count is
//! `standing + 1`. Read the standing count in one ledger call and append the
//! grant in the next and two concurrent chargers observe the same `n` and
//! both write `n + 1`: an outage charged once, and a budget that has silently
//! stopped being bounded. `grant_retry` does both inside one transaction.

use std::sync::Arc;

use forged_ledger::Ledger;
use forged_proto::{grant_retry, transport_failures_of};

const RUN: &str = "run-budget";
const T0: &str = "2026-08-12T00:00:00.000000000Z";

/// Every grant the ledger holds for a run, newest last.
fn grants(ledger: &Ledger) -> Vec<forged_ledger::EventRow> {
    ledger
        .list_events(Some(RUN), 0, 4096)
        .expect("events")
        .into_iter()
        .filter(|row| row.kind == "proto.retry")
        .collect()
}

#[test]
fn concurrent_charges_each_land_on_their_own_count() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let packet = format!("{RUN}/implement/1");

    // Twelve chargers, each on its own ledger handle — one connection each,
    // exactly as twelve `run advance` processes would race the same outage.
    const CHARGERS: usize = 12;
    let ledgers: Vec<Arc<Ledger>> = (0..CHARGERS)
        .map(|_| Arc::new(Ledger::open(&path).expect("open")))
        .collect();
    let mut threads = Vec::new();
    for ledger in &ledgers {
        let ledger = Arc::clone(ledger);
        let packet = packet.clone();
        threads.push(std::thread::spawn(move || {
            grant_retry(&ledger, RUN, &packet, T0).expect("charge the budget")
        }));
    }
    let mut counts: Vec<u32> = threads
        .into_iter()
        .map(|handle| handle.join().expect("charger thread"))
        .collect();
    counts.sort_unstable();

    // Exact, not merely monotone: 1..=CHARGERS with no value taken twice.
    // Two chargers reading the same standing count would both return `n + 1`
    // and the budget would be short by one charge for every collision.
    let expected: Vec<u32> = (1..=CHARGERS)
        .map(|n| u32::try_from(n).expect("small"))
        .collect();
    assert_eq!(counts, expected, "every charge must land on its own count");

    let reader = &ledgers[0];
    let rows = grants(reader);
    assert_eq!(rows.len(), CHARGERS, "one grant appended per charge");
    assert_eq!(
        transport_failures_of(&rows, &packet),
        u32::try_from(CHARGERS).expect("small"),
        "the standing count is the number of charges, not fewer"
    );

    // A packet that was never charged reads zero, and charging one packet
    // never charges another.
    let untouched = format!("{RUN}/fix/1");
    assert_eq!(transport_failures_of(&rows, &untouched), 0);
    assert_eq!(
        grant_retry(reader, RUN, &untouched, T0).expect("charge"),
        1,
        "each packet carries its own budget"
    );

    for ledger in ledgers {
        Arc::try_unwrap(ledger)
            .ok()
            .expect("sole owner")
            .close()
            .expect("close");
    }
}

#[test]
fn a_grant_carries_the_backoff_deadline_its_own_count_earns() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let packet = format!("{RUN}/implement/1");

    // 30s, then 60s, then 120s — the count and the deadline are one paired
    // carrier, so the nth grant's deadline is the nth backoff from `since`.
    for (charge, expected) in [(1u32, 30i64), (2, 60), (3, 120)] {
        assert_eq!(
            grant_retry(&ledger, RUN, &packet, T0).expect("charge"),
            charge
        );
        let rows = grants(&ledger);
        let latest: serde_json::Value =
            serde_json::from_str(&rows.last().expect("a grant").payload_json).expect("payload");
        assert_eq!(
            latest["retryAfter"],
            serde_json::json!(forged_proto::backoff_deadline(T0, charge - 1).expect("deadline")),
            "grant {charge} must carry its own backoff"
        );
        assert_eq!(latest["transportFailures"], serde_json::json!(charge));
        assert_eq!(
            forged_proto::transport_backoff_s(charge - 1),
            u64::try_from(expected).expect("small"),
            "the schedule this test pins"
        );
    }
    ledger.close().expect("close");
}
