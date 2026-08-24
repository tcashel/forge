//! Typed keyset read primitives: stable paging, honest predicates, and a
//! streaming byte read that never demands a buffer proportional to a record.

mod support;

use std::io::Write;

use forged_history::{
    EventCursor, EventRole, HistoryFilter, SessionCursor, SourceFamily, UsageFact,
    ARCHIVE_BLOCK_TARGET_BYTES, HISTORY_SCHEMA_VERSION, MAX_PAGE_ROWS,
};
use support::{header, header_derived, header_with, open, scratch};

#[test]
fn sessions_page_by_keyset_without_gaps_or_repeats() {
    let s = scratch("reads-session-paging");
    let history = open(&s);
    for index in 0..7_u64 {
        history
            .ingest_event(
                header(
                    &format!("s-{index}"),
                    "a.jsonl",
                    index,
                    Some("/repos/forge"),
                ),
                format!("{{\"n\":{index}}}").as_bytes(),
                std::io::empty(),
                [],
            )
            .expect("ingest");
    }

    let whole = history
        .list_sessions(&HistoryFilter::default(), None, 50)
        .expect("sessions");
    assert_eq!(whole.rows.len(), 7);
    assert!(whole.next.is_none(), "a short page carries no cursor");

    let mut paged = Vec::new();
    let mut cursor: Option<SessionCursor> = None;
    loop {
        let page = history
            .list_sessions(&HistoryFilter::default(), cursor, 3)
            .expect("page");
        paged.extend(page.rows.iter().map(|r| r.session_id));
        match page.next {
            Some(next) => cursor = Some(next),
            None => break,
        }
    }
    assert_eq!(
        paged,
        whole.rows.iter().map(|r| r.session_id).collect::<Vec<_>>()
    );
    assert!(history
        .list_sessions(&HistoryFilter::default(), None, 0)
        .is_err());
    history.close().expect("close");
}

#[test]
fn events_page_by_keyset_and_honour_every_predicate() {
    let s = scratch("reads-event-predicates");
    let history = open(&s);
    history
        .ingest_event(
            header_with(
                "s-1",
                "a.jsonl",
                0,
                Some("/repos/alpha"),
                EventRole::User,
                "claude-opus-5",
            ),
            &b"{\"n\":0}"[..],
            std::io::empty(),
            [],
        )
        .expect("ingest");
    history
        .ingest_event(
            header_with(
                "s-2",
                "b.jsonl",
                1,
                Some("/repos/beta"),
                EventRole::Assistant,
                "gpt-5.6",
            ),
            &b"{\"n\":1}"[..],
            std::io::empty(),
            [],
        )
        .expect("ingest");

    let all = history
        .list_events(&HistoryFilter::default(), None, 50)
        .expect("events");
    assert_eq!(all.rows.len(), 2, "no predicate means the whole corpus");

    let by_role = history
        .list_events(
            &HistoryFilter {
                role: Some(EventRole::Assistant),
                ..HistoryFilter::default()
            },
            None,
            50,
        )
        .expect("events");
    assert_eq!(by_role.rows.len(), 1);
    assert_eq!(by_role.rows[0].model.as_deref(), Some("gpt-5.6"));

    for (filter, expected) in [
        (
            HistoryFilter {
                repository_path: Some("/repos/alpha".to_owned()),
                ..HistoryFilter::default()
            },
            1,
        ),
        (
            HistoryFilter {
                source_family: Some(SourceFamily::Codex),
                ..HistoryFilter::default()
            },
            0,
        ),
        (
            HistoryFilter {
                model: Some("claude-opus-5".to_owned()),
                ..HistoryFilter::default()
            },
            1,
        ),
        (
            HistoryFilter {
                since: Some("2026-08-24T00:00:01.000000000Z".to_owned()),
                ..HistoryFilter::default()
            },
            1,
        ),
        (
            HistoryFilter {
                until: Some("2026-08-24T00:00:01.000000000Z".to_owned()),
                ..HistoryFilter::default()
            },
            1,
        ),
    ] {
        assert_eq!(
            history
                .list_events(&filter, None, 50)
                .expect("events")
                .rows
                .len(),
            expected,
            "{filter:?}"
        );
    }

    let first = history
        .list_events(&HistoryFilter::default(), None, 1)
        .expect("page");
    let cursor = first.next.expect("a full page carries a cursor");
    let second = history
        .list_events(&HistoryFilter::default(), Some(cursor), 1)
        .expect("page");
    assert_eq!(second.rows[0].revision_id, all.rows[1].revision_id);
    assert!(history
        .list_events(
            &HistoryFilter::default(),
            Some(EventCursor {
                after_revision_id: i64::MAX
            }),
            1
        )
        .expect("page")
        .rows
        .is_empty());
    history.close().expect("close");
}

#[test]
fn a_large_record_streams_out_without_a_proportional_buffer() {
    /// A sink that counts bytes and keeps none of them.
    struct Counting(i64);
    impl Write for Counting {
        fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
            self.0 += buf.len() as i64;
            Ok(buf.len())
        }
        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }

    let s = scratch("reads-stream");
    let history = open(&s);
    let record: Vec<u8> = (0..=255_u8)
        .cycle()
        .take(ARCHIVE_BLOCK_TARGET_BYTES * 3 + 7)
        .collect();
    let outcome = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &record[..],
            std::io::empty(),
            [],
        )
        .expect("ingest");

    let mut sink = Counting(0);
    let written = history
        .read_event_to(outcome.revision_id(), &mut sink)
        .expect("stream");
    assert_eq!(written, record.len() as i64);
    assert_eq!(sink.0, record.len() as i64);

    // Reading a revision that no publication made visible is a refusal.
    assert!(history.read_event_to(9_999, &mut sink).is_err());
    history.close().expect("close");
}

#[test]
fn usage_aggregation_narrows_by_model_and_repository() {
    let s = scratch("reads-usage");
    let history = open(&s);
    for (session, repo, model, tokens) in [
        ("s-1", "/repos/alpha", "claude-opus-5", 10),
        ("s-2", "/repos/beta", "gpt-5.6", 30),
    ] {
        history
            .ingest_event(
                header(session, "a.jsonl", 0, Some(repo)),
                format!("{{\"m\":\"{model}\"}}").as_bytes(),
                std::io::empty(),
                [UsageFact {
                    provider: "p".to_owned(),
                    model: model.to_owned(),
                    input_tokens: Some(tokens),
                    output_tokens: Some(tokens * 2),
                    ..UsageFact::default()
                }],
            )
            .expect("ingest");
    }

    let all = history
        .usage_totals(&HistoryFilter::default())
        .expect("usage");
    assert_eq!(
        (all.records, all.input_tokens, all.output_tokens),
        (2, 40, 80)
    );

    let narrowed = history
        .usage_totals(&HistoryFilter {
            repository_path: Some("/repos/beta".to_owned()),
            ..HistoryFilter::default()
        })
        .expect("usage");
    assert_eq!((narrowed.records, narrowed.input_tokens), (1, 30));

    let by_model = history
        .usage_totals(&HistoryFilter {
            model: Some("claude-opus-5".to_owned()),
            ..HistoryFilter::default()
        })
        .expect("usage");
    assert_eq!((by_model.records, by_model.input_tokens), (1, 10));
    history.close().expect("close");
}

#[test]
fn a_derived_identity_replays_but_differing_content_is_a_new_event() {
    let s = scratch("reads-derived");
    let history = open(&s);
    let first = history
        .ingest_event(
            header_derived("s-1", "a.jsonl", 0),
            &b"{\"text\":\"same\"}"[..],
            std::io::empty(),
            [],
        )
        .expect("first");
    let replay = history
        .ingest_event(
            header_derived("s-1", "a.jsonl", 0),
            &b"{\"text\":\"same\"}"[..],
            std::io::empty(),
            [],
        )
        .expect("replay");
    assert_eq!(replay.event_id(), first.event_id());
    assert_eq!(
        history.status().expect("status").events,
        1,
        "identical content at the same position is the same event"
    );

    let different = history
        .ingest_event(
            header_derived("s-1", "a.jsonl", 0),
            &b"{\"text\":\"changed\"}"[..],
            std::io::empty(),
            [],
        )
        .expect("different");
    assert_ne!(
        different.event_id(),
        first.event_id(),
        "with no native id, content IS part of identity"
    );
    assert_eq!(
        history
            .read_event_bytes(first.revision_id())
            .expect("prior bytes"),
        b"{\"text\":\"same\"}".to_vec(),
        "and the earlier record is still exactly where it was"
    );
    history.close().expect("close");
}

#[test]
fn status_reports_the_schema_and_the_standing_index() {
    let s = scratch("reads-status");
    let history = open(&s);
    history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"n\":0}"[..],
            &b"indexed wording"[..],
            [],
        )
        .expect("ingest");

    let status = history.status().expect("status");
    assert_eq!(status.schema_version, HISTORY_SCHEMA_VERSION);
    assert_eq!(status.host_id, history.host_id().expect("host id"));
    assert_eq!(
        (status.sessions, status.events, status.revisions),
        (1, 1, 1)
    );
    assert!(status.compressed_bytes > 0 && status.uncompressed_bytes > 0);
    assert_eq!(status.staged_rows, 0);
    assert!(status.complete_generation.is_some());
    assert_eq!(status.building_generation, None);

    // Page sizes are capped rather than refused.
    let page = history
        .list_events(&HistoryFilter::default(), None, MAX_PAGE_ROWS * 10)
        .expect("events");
    assert_eq!(page.rows.len(), 1);
    history.close().expect("close");
}
