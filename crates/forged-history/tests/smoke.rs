mod support;

use forged_history::{HistoryFilter, IngestOutcome, SearchOutcome};
use support::{header, open, scratch};

#[test]
fn one_event_round_trips_through_the_archive() {
    let s = scratch("smoke");
    let history = open(&s);
    let record = br#"{"type":"assistant","text":"forged archives the record"}"#;
    let outcome = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &record[..],
            &b"forged archives the record"[..],
            [],
        )
        .expect("ingest");
    assert!(matches!(outcome, IngestOutcome::Created { .. }));

    let events = history
        .list_events(&HistoryFilter::default(), None, 10)
        .expect("events");
    assert_eq!(events.rows.len(), 1);
    assert_eq!(
        history
            .read_event_bytes(events.rows[0].revision_id)
            .expect("bytes"),
        record.to_vec()
    );

    let found = history
        .search("archives", &HistoryFilter::default(), None, 10)
        .expect("search");
    match found {
        SearchOutcome::Ready(page) => {
            assert_eq!(page.rows.len(), 1);
            assert_eq!(page.rows[0].text, "forged archives the record");
        }
        other => panic!("expected a ready search, got {other:?}"),
    }
    history.close().expect("close");
}
