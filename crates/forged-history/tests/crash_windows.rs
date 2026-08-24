//! Deterministic crash points between staging and publication.
//!
//! Dropping an `EventIngest` without publishing leaves exactly what a
//! process death mid-ingest leaves: durable staging rows that no publication
//! ever made visible. Every test here crashes at a named point, reopens the
//! archive as a new process would, and proves the same four things — readers
//! see nothing, the cursor did not move, replay converges, and cleanup
//! reclaims the staging and nothing else.

mod support;

use forged_history::{
    History, HistoryFilter, IngestOutcome, SearchOutcome, UsageFact, ARCHIVE_BLOCK_TARGET_BYTES,
    STAGING_BATCH_PARTS,
};
use support::{count, header, open, raw, scratch, Scratch};

fn synthetic(len: usize) -> Vec<u8> {
    (0..=255_u8).cycle().take(len).collect()
}

/// Publish one committed event so every test has content that must survive.
fn publish_baseline(history: &History) -> IngestOutcome {
    history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"text\":\"committed baseline\"}"[..],
            &b"committed baseline durable"[..],
            [UsageFact {
                provider: "anthropic".to_owned(),
                model: "claude-opus-5".to_owned(),
                input_tokens: Some(7),
                output_tokens: Some(11),
                ..UsageFact::default()
            }],
        )
        .expect("baseline ingest")
}

/// Assert the committed world is exactly the baseline and nothing more.
fn assert_only_the_baseline_is_visible(history: &History, baseline: &IngestOutcome) {
    let events = history
        .list_events(&HistoryFilter::default(), None, 50)
        .expect("events");
    assert_eq!(
        events.rows.len(),
        1,
        "a crashed ingest must never become a committed event"
    );
    assert_eq!(events.rows[0].revision_id, baseline.revision_id());

    let sessions = history
        .list_sessions(&HistoryFilter::default(), None, 50)
        .expect("sessions");
    assert_eq!(
        sessions.rows.len(),
        1,
        "a crashed ingest's session must not surface"
    );

    match history
        .search("crashed", &HistoryFilter::default(), None, 10)
        .expect("search")
    {
        SearchOutcome::Ready(page) => assert!(
            page.rows.is_empty(),
            "staged text must never match: {:?}",
            page.rows
        ),
        other => panic!("expected a ready search, got {other:?}"),
    }
    match history
        .search("durable", &HistoryFilter::default(), None, 10)
        .expect("search")
    {
        SearchOutcome::Ready(page) => assert_eq!(
            page.rows.len(),
            1,
            "committed text stays searchable across the crash"
        ),
        other => panic!("expected a ready search, got {other:?}"),
    }

    let usage = history
        .usage_totals(&HistoryFilter::default())
        .expect("usage");
    assert_eq!(
        (usage.records, usage.input_tokens, usage.output_tokens),
        (1, 7, 11),
        "staged usage must never be aggregated"
    );

    let cursors = history.sync_state(None).expect("sync state");
    let a = cursors
        .iter()
        .find(|c| c.relative_path == "a.jsonl")
        .expect("baseline cursor");
    assert_eq!(
        (a.byte_offset, a.record_index),
        (100, 1),
        "the cursor advances only on publication"
    );
    assert!(
        cursors.iter().all(
            |c| c.relative_path != "crashed.jsonl" || (c.byte_offset, c.record_index) == (0, 0)
        ),
        "a crashed file's cursor must never advance: {cursors:?}"
    );
}

/// Reopen the archive the way a restarted process would.
fn reopen(history: History, s: &Scratch) -> History {
    history.close().expect("close");
    History::open(&s.db()).expect("reopen")
}

#[test]
fn staging_survives_a_crash_durably_and_invisibly() {
    let s = scratch("crash-invisible");
    let history = open(&s);
    let baseline = publish_baseline(&history);

    // Stage more parts than one transaction may carry, so at least two
    // staging transactions have durably committed before the crash.
    let parts = STAGING_BATCH_PARTS + 1;
    let mut ingest = history
        .begin_event(header("crashed", "crashed.jsonl", 0, Some("/repos/forge")))
        .expect("begin");
    ingest
        .stage_record_part(&synthetic(ARCHIVE_BLOCK_TARGET_BYTES * parts)[..])
        .expect("stage bytes");
    ingest
        .stage_text(&b"crashed text that must never be searchable"[..])
        .expect("stage text");
    ingest
        .stage_usage(UsageFact {
            provider: "anthropic".to_owned(),
            model: "claude-opus-5".to_owned(),
            input_tokens: Some(999),
            output_tokens: Some(999),
            ..UsageFact::default()
        })
        .expect("stage usage");
    let staged_revision = ingest.revision_id();
    drop(ingest); // the crash

    let history = reopen(history, &s);
    let conn = raw(&s.db());
    assert_eq!(
        count(
            &conn,
            &format!(
                "SELECT COUNT(*) FROM event_parts \
                 WHERE revision_id = {staged_revision} AND visibility = 'staging'"
            )
        ),
        parts as i64,
        "every staging transaction that committed is still durably there"
    );
    assert!(
        history.status().expect("status").staged_rows > 0,
        "the archive reports the staging it is holding"
    );
    assert_eq!(
        history
            .revision_visibility(staged_revision)
            .expect("visibility"),
        Some(forged_history::Visibility::Staging)
    );
    assert_only_the_baseline_is_visible(&history, &baseline);
    history.close().expect("close");
}

#[test]
fn every_crash_point_leaves_the_committed_world_untouched() {
    let s = scratch("crash-points");
    let mut history = open(&s);
    let baseline = publish_baseline(&history);
    let before = history.status().expect("status");

    // Each point is after at least one durably committed staging
    // transaction, and none of them is a publication.
    for point in 0..5 {
        let mut ingest = history
            .begin_event(header("crashed", "crashed.jsonl", 1, Some("/repos/forge")))
            .expect("begin");
        if point >= 1 {
            ingest
                .stage_record_part(&synthetic(ARCHIVE_BLOCK_TARGET_BYTES + 1)[..])
                .expect("first byte segment");
        }
        if point >= 2 {
            ingest
                .stage_record_part(&synthetic(ARCHIVE_BLOCK_TARGET_BYTES + 1)[..])
                .expect("second byte segment");
        }
        if point >= 3 {
            ingest
                .stage_text(&"crashed lexeme ".repeat(4_096).into_bytes()[..])
                .expect("text");
        }
        if point >= 4 {
            ingest
                .stage_usage(UsageFact {
                    provider: "anthropic".to_owned(),
                    model: "claude-opus-5".to_owned(),
                    input_tokens: Some(999),
                    ..UsageFact::default()
                })
                .expect("usage");
        }
        drop(ingest); // the crash

        // Every clone shares one sender, so closing IS the process boundary:
        // the reopened handle replaces the old one outright.
        history = reopen(history, &s);
        assert_only_the_baseline_is_visible(&history, &baseline);

        let reclaimed = history.cleanup_staging().expect("cleanup");
        assert_eq!(
            history.status().expect("status").staged_rows,
            0,
            "cleanup reclaims every never-committed row at point {point}"
        );
        if point >= 1 {
            assert!(
                reclaimed.total() > 0,
                "point {point} staged rows that cleanup must have reclaimed"
            );
        }
        // ...and nothing else. The committed baseline is bit-identical.
        let after = history.status().expect("status");
        assert_eq!(
            (
                after.sessions,
                after.events,
                after.revisions,
                after.blocks,
                after.search_chunks,
                after.compressed_bytes
            ),
            (
                before.sessions,
                before.events,
                before.revisions,
                before.blocks,
                before.search_chunks,
                before.compressed_bytes
            ),
            "cleanup must reclaim only staging, at point {point}"
        );
        assert_eq!(
            history
                .read_event_bytes(baseline.revision_id())
                .expect("baseline bytes"),
            b"{\"text\":\"committed baseline\"}".to_vec()
        );
    }
    history.close().expect("close");
}

#[test]
fn replay_after_a_crash_converges_on_one_published_event() {
    let s = scratch("crash-replay");
    let mut history = open(&s);
    publish_baseline(&history);

    let record = synthetic(ARCHIVE_BLOCK_TARGET_BYTES + 512);
    // Crash twice at the same logical event before ever publishing it.
    for _ in 0..2 {
        let mut ingest = history
            .begin_event(header("crashed", "crashed.jsonl", 1, Some("/repos/forge")))
            .expect("begin");
        ingest.stage_record_part(&record[..]).expect("stage");
        drop(ingest);
        history = reopen(history, &s);
    }
    let staged_before_retry = history.status().expect("status").staged_rows;
    assert!(
        staged_before_retry > 0,
        "two crashes must have left staging behind"
    );

    // The full retry re-stages the same logical event, discarding its own
    // stale staging first: retrying converges rather than accumulating.
    let outcome = history
        .ingest_event(
            header("crashed", "crashed.jsonl", 1, Some("/repos/forge")),
            &record[..],
            &b"finally published"[..],
            [],
        )
        .expect("retry");
    assert!(matches!(outcome, IngestOutcome::Created { .. }));

    let status = history.status().expect("status");
    assert_eq!(status.events, 2, "one baseline plus one retried event");
    assert_eq!(
        status.staged_rows, 0,
        "the retry left no stale staging behind"
    );
    assert_eq!(
        history
            .read_event_bytes(outcome.revision_id())
            .expect("read"),
        record
    );

    let cursors = history.sync_state(None).expect("sync state");
    let crashed = cursors
        .iter()
        .find(|c| c.relative_path == "crashed.jsonl")
        .expect("cursor");
    assert_eq!(
        (crashed.byte_offset, crashed.record_index),
        (200, 2),
        "the cursor advances exactly once, at publication"
    );
    history.close().expect("close");
}

#[test]
fn cleanup_never_reclaims_a_block_a_committed_event_shares() {
    let s = scratch("crash-shared-block");
    let history = open(&s);
    let record: &[u8] = b"{\"text\":\"shared between a committed and a crashed event\"}";
    let committed = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            record,
            std::io::empty(),
            [],
        )
        .expect("committed");

    // The crashed event stages the SAME bytes: the content-addressed block
    // it resolves to is already committed and referenced.
    let mut ingest = history
        .begin_event(header("crashed", "crashed.jsonl", 0, Some("/repos/forge")))
        .expect("begin");
    ingest.stage_record_part(record).expect("stage");
    drop(ingest);

    let history = reopen(history, &s);
    history.cleanup_staging().expect("cleanup");

    let conn = raw(&s.db());
    assert_eq!(
        count(&conn, "SELECT COUNT(*) FROM archive_blocks"),
        1,
        "the shared block survives: it was never never-committed"
    );
    assert_eq!(
        count(&conn, "SELECT refcount FROM archive_blocks"),
        1,
        "and holds exactly the committed event's one reference"
    );
    assert_eq!(
        history
            .read_event_bytes(committed.revision_id())
            .expect("bytes"),
        record.to_vec()
    );
    history.close().expect("close");
}
