//! What the archive stores, and what it refuses to change about it.

mod support;

use forged_history::{
    History, HistoryFilter, IngestOutcome, UsageFact, ARCHIVE_BLOCK_TARGET_BYTES,
};
use support::{count, header, open, raw, scratch};

/// Deterministic non-UTF-8, non-JSON bytes: the archive stores BYTES.
fn synthetic_record(len: usize) -> Vec<u8> {
    (0..=255_u8).cycle().take(len).collect()
}

#[test]
fn exact_bytes_round_trip_through_segmented_zstandard_blocks() {
    let s = scratch("archive-roundtrip");
    let history = open(&s);
    // Deliberately larger than the block target: one event, several parts.
    let record = synthetic_record(ARCHIVE_BLOCK_TARGET_BYTES * 2 + 4_096);
    let outcome = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &record[..],
            std::io::empty(),
            [],
        )
        .expect("ingest");
    let revision_id = outcome.revision_id();

    assert_eq!(
        history.read_event_bytes(revision_id).expect("read back"),
        record,
        "the archive returns exactly the bytes it was given"
    );
    history.close().expect("close");

    let conn = raw(&s.db());
    let parts = count(
        &conn,
        &format!("SELECT COUNT(*) FROM event_parts WHERE revision_id = {revision_id}"),
    );
    assert_eq!(parts, 3, "the record spans three ordered parts");
    let codecs: i64 = count(
        &conn,
        "SELECT COUNT(*) FROM archive_blocks WHERE codec <> 'zstd'",
    );
    assert_eq!(codecs, 0, "every block is Zstandard");

    // Each part's frame decodes standalone, with no reference to its
    // neighbours: that is what makes the archive independently readable.
    let mut stmt = conn
        .prepare(
            "SELECT b.bytes, b.uncompressed_len FROM event_parts p
               JOIN archive_blocks b ON b.block_id = p.block_id
              WHERE p.revision_id = ?1 ORDER BY p.seq DESC",
        )
        .expect("prepare");
    let mut rows = stmt.query([revision_id]).expect("query");
    while let Some(row) = rows.next().expect("row") {
        let bytes: Vec<u8> = row.get(0).expect("bytes");
        let len: i64 = row.get(1).expect("len");
        let decoded = zstd::bulk::decompress(&bytes, len as usize).expect("standalone decode");
        assert_eq!(decoded.len(), len as usize);
    }
}

#[test]
fn an_event_may_arrive_as_several_segments() {
    let s = scratch("archive-segments");
    let history = open(&s);
    let mut ingest = history
        .begin_event(header("s-1", "a.jsonl", 0, Some("/repos/forge")))
        .expect("begin");
    // Three separate readers, one logical record.
    ingest.stage_record_part(&b"{\"a\":1,"[..]).expect("part 1");
    ingest.stage_record_part(&b"\"b\":2,"[..]).expect("part 2");
    ingest.stage_record_part(&b"\"c\":3}"[..]).expect("part 3");
    ingest
        .stage_text_parts(["alpha beta ", "gamma delta"])
        .expect("text parts");
    let outcome = ingest.publish().expect("publish");

    assert_eq!(
        history
            .read_event_bytes(outcome.revision_id())
            .expect("read"),
        b"{\"a\":1,\"b\":2,\"c\":3}".to_vec(),
        "segments concatenate in order"
    );
    history.close().expect("close");
}

#[test]
fn the_archive_neither_reserializes_json_nor_carries_a_messagepack_codec() {
    let s = scratch("archive-verbatim");
    let history = open(&s);
    // Not valid JSON, with duplicate keys, odd spacing, and a raw byte a
    // JSON round-trip would normalize or reject outright.
    let record: &[u8] = b"{ \"k\" : 1 , \"k\" : 2 , trailing \x00\xff";
    let outcome = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            record,
            std::io::empty(),
            [],
        )
        .expect("ingest");
    assert_eq!(
        history
            .read_event_bytes(outcome.revision_id())
            .expect("read"),
        record.to_vec(),
        "the record is stored verbatim, never parsed and re-emitted"
    );
    history.close().expect("close");

    let manifest = include_str!("../Cargo.toml").to_ascii_lowercase();
    for forbidden in ["rmp", "messagepack", "msgpack", "serde_json"] {
        assert!(
            !manifest.contains(forbidden),
            "the archive must not depend on {forbidden}"
        );
    }
}

#[test]
fn an_exact_replay_changes_no_counts() {
    let s = scratch("archive-replay");
    let history = open(&s);
    let record = br#"{"type":"assistant","text":"replayed exactly"}"#;
    let first = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &record[..],
            &b"replayed exactly across chunks"[..],
            [UsageFact {
                provider: "anthropic".to_owned(),
                model: "claude-opus-5".to_owned(),
                input_tokens: Some(10),
                output_tokens: Some(20),
                ..UsageFact::default()
            }],
        )
        .expect("first ingest");
    let before = snapshot(&history, &s.db());

    let second = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &record[..],
            &b"replayed exactly across chunks"[..],
            [UsageFact {
                provider: "anthropic".to_owned(),
                model: "claude-opus-5".to_owned(),
                input_tokens: Some(10),
                output_tokens: Some(20),
                ..UsageFact::default()
            }],
        )
        .expect("replay");

    assert!(
        matches!(second, IngestOutcome::Replayed { .. }),
        "an identical prepared event is a no-op: {second:?}"
    );
    assert_eq!(second.revision_id(), first.revision_id());
    assert_eq!(
        snapshot(&history, &s.db()),
        before,
        "replay must change no session, event, block, chunk, usage, or FTS count"
    );
    history.close().expect("close");
}

#[test]
fn conflicting_content_appends_a_revision_and_keeps_the_prior_bytes() {
    let s = scratch("archive-revision");
    let history = open(&s);
    let first = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"text\":\"original\"}"[..],
            &b"original wording"[..],
            [],
        )
        .expect("first");
    let second = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"text\":\"rewritten\"}"[..],
            &b"rewritten wording"[..],
            [],
        )
        .expect("second");

    let (event_id, revision) = match second {
        IngestOutcome::Revised {
            event_id, revision, ..
        } => (event_id, revision),
        other => panic!("conflicting content must append a revision, got {other:?}"),
    };
    assert_eq!(event_id, first.event_id(), "one event, two revisions");
    assert_eq!(revision, 2);

    // The prior revision's archive bytes are exactly where they were.
    assert_eq!(
        history
            .read_event_bytes(first.revision_id())
            .expect("prior"),
        b"{\"text\":\"original\"}".to_vec(),
        "an appended revision must never replace prior archive bytes"
    );
    assert_eq!(
        history
            .read_event_bytes(second.revision_id())
            .expect("current"),
        b"{\"text\":\"rewritten\"}".to_vec()
    );

    // Both revisions are inspectable, and only the newest is head.
    let rows = history
        .list_events(&HistoryFilter::default(), None, 10)
        .expect("events");
    assert_eq!(rows.rows.len(), 2);
    assert!(!rows.rows[0].is_head && rows.rows[1].is_head);
    assert_ne!(rows.rows[0].content_sha256, rows.rows[1].content_sha256);
    history.close().expect("close");
}

#[test]
fn identical_bytes_across_events_share_one_content_addressed_block() {
    let s = scratch("archive-dedup");
    let history = open(&s);
    let record: &[u8] = b"{\"text\":\"identical across sessions\"}";
    history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/one")),
            record,
            std::io::empty(),
            [],
        )
        .expect("first");
    history
        .ingest_event(
            header("s-2", "b.jsonl", 0, Some("/repos/two")),
            record,
            std::io::empty(),
            [],
        )
        .expect("second");
    history.close().expect("close");

    let conn = raw(&s.db());
    assert_eq!(
        count(&conn, "SELECT COUNT(*) FROM archive_blocks"),
        1,
        "identical bytes are stored once"
    );
    assert_eq!(
        count(&conn, "SELECT refcount FROM archive_blocks"),
        2,
        "and referenced twice"
    );
    assert_eq!(count(&conn, "SELECT COUNT(*) FROM event_parts"), 2);
}

/// The counts an exact replay must leave untouched.
fn snapshot(history: &History, db: &std::path::Path) -> Vec<(String, i64)> {
    let status = history.status().expect("status");
    let conn = raw(db);
    vec![
        ("sessions".to_owned(), status.sessions),
        ("events".to_owned(), status.events),
        ("revisions".to_owned(), status.revisions),
        ("blocks".to_owned(), status.blocks),
        ("chunks".to_owned(), status.search_chunks),
        ("staged".to_owned(), status.staged_rows),
        (
            "usage".to_owned(),
            count(&conn, "SELECT COUNT(*) FROM usage_facts"),
        ),
        (
            "fts".to_owned(),
            count(&conn, "SELECT COUNT(*) FROM search_fts"),
        ),
        (
            "refcounts".to_owned(),
            count(
                &conn,
                "SELECT COALESCE(SUM(refcount),0) FROM archive_blocks",
            ),
        ),
    ]
}
