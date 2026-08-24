//! Presence is a state, not a deletion.

mod support;

use forged_history::{
    AttemptLinkConfidence, AttemptLinkKind, History, HistoryFilter, PresenceState, PurgeScope,
    SearchOutcome, SourceFamily, SourceRunOutcome, UsageFact,
};
use support::{count, header, open, raw, scratch};

fn seed(history: &History) {
    history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"text\":\"durable record\"}"[..],
            &b"durable searchable record"[..],
            [UsageFact {
                provider: "anthropic".to_owned(),
                model: "claude-opus-5".to_owned(),
                input_tokens: Some(5),
                output_tokens: Some(9),
                ..UsageFact::default()
            }],
        )
        .expect("ingest");
}

#[test]
fn a_missing_source_file_leaves_every_archived_row_intact_and_searchable() {
    let s = scratch("observe-missing-file");
    let history = open(&s);
    seed(&history);
    let before = history.status().expect("status");

    let file = history.sync_state(None).expect("sync state").remove(0);
    assert_eq!(file.presence, PresenceState::Present);
    assert!(history
        .mark_source_file_missing(file.source_file_id)
        .expect("mark missing"));

    let after_state = history.sync_state(None).expect("sync state").remove(0);
    assert_eq!(after_state.presence, PresenceState::Missing);
    assert_eq!(
        (after_state.byte_offset, after_state.record_index),
        (file.byte_offset, file.record_index),
        "marking a file missing does not rewind what was already archived"
    );

    // Everything the archive holds is exactly as it was.
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
        )
    );
    let events = history
        .list_events(&HistoryFilter::default(), None, 10)
        .expect("events");
    assert_eq!(events.rows.len(), 1);
    assert_eq!(
        history
            .read_event_bytes(events.rows[0].revision_id)
            .expect("bytes"),
        b"{\"text\":\"durable record\"}".to_vec()
    );
    match history
        .search("searchable", &HistoryFilter::default(), None, 10)
        .expect("search")
    {
        SearchOutcome::Ready(page) => assert_eq!(page.rows.len(), 1),
        other => panic!("content stays searchable, got {other:?}"),
    }
    let usage = history
        .usage_totals(&HistoryFilter::default())
        .expect("usage");
    assert_eq!((usage.records, usage.input_tokens), (1, 5));
    history.close().expect("close");

    // The observation itself carries the missing state, for later diagnosis.
    let conn = raw(&s.db());
    assert_eq!(
        count(
            &conn,
            "SELECT COUNT(*) FROM session_observations WHERE presence = 'missing'"
        ),
        1
    );
}

#[test]
fn a_missing_root_marks_its_files_without_touching_content() {
    let s = scratch("observe-missing-root");
    let history = open(&s);
    seed(&history);
    history
        .ingest_event(
            header("s-2", "b.jsonl", 0, Some("/repos/forge")),
            &b"{\"text\":\"second file\"}"[..],
            &b"second file wording"[..],
            [],
        )
        .expect("second");

    let root = history.source_roots().expect("roots").remove(0);
    assert_eq!(
        history
            .mark_source_root_missing(root.source_root_id)
            .expect("mark root missing"),
        2,
        "both files beneath the root are marked"
    );
    assert_eq!(
        history.source_roots().expect("roots")[0].presence,
        PresenceState::Missing
    );
    assert!(history
        .sync_state(Some(SourceFamily::ClaudeCode))
        .expect("sync")
        .iter()
        .all(|f| f.presence == PresenceState::Missing));

    let status = history.status().expect("status");
    assert_eq!((status.events, status.revisions), (2, 2));
    match history
        .search("wording", &HistoryFilter::default(), None, 10)
        .expect("search")
    {
        SearchOutcome::Ready(page) => assert_eq!(page.rows.len(), 1),
        other => panic!("content stays searchable, got {other:?}"),
    }

    // A file that comes back is present again; nothing was ever lost.
    let file = history.sync_state(None).expect("sync").remove(0);
    assert!(history
        .mark_source_file_present(file.source_file_id)
        .expect("mark present"));
    assert_eq!(
        history.sync_state(None).expect("sync")[0].presence,
        PresenceState::Present
    );
    history.close().expect("close");
}

#[test]
fn source_runs_record_provenance_including_interruption() {
    let s = scratch("observe-runs");
    let history = open(&s);
    let interrupted = history
        .begin_source_run(SourceFamily::Codex)
        .expect("begin run");
    let finished = history
        .begin_source_run(SourceFamily::ClaudeCode)
        .expect("begin run");
    assert!(history
        .finish_source_run(finished, SourceRunOutcome::Completed, 3, 12, None)
        .expect("finish"));
    assert!(
        !history
            .finish_source_run(finished, SourceRunOutcome::Failed, 0, 0, Some("late"))
            .expect("second finish"),
        "a finished run is not reopened by a second verdict"
    );

    let runs = history.source_runs().expect("runs");
    assert_eq!(runs.len(), 2);
    let open_run = runs
        .iter()
        .find(|r| r.source_run_id == interrupted)
        .expect("interrupted run");
    assert!(
        open_run.finished_at.is_none() && open_run.outcome.is_none(),
        "a pass a crash interrupted stays visibly unfinished"
    );
    let done = runs
        .iter()
        .find(|r| r.source_run_id == finished)
        .expect("finished run");
    assert_eq!(done.outcome, Some(SourceRunOutcome::Completed));
    assert_eq!((done.files_seen, done.events_published), (3, 12));
    history.close().expect("close");
}

#[test]
fn session_links_are_idempotent_and_readable() {
    let s = scratch("observe-links");
    let history = open(&s);
    seed(&history);
    let session = history
        .list_sessions(&HistoryFilter::default(), None, 10)
        .expect("sessions")
        .rows
        .remove(0);

    assert!(history
        .link_session(
            session.session_id,
            AttemptLinkKind::Run,
            "run-1",
            AttemptLinkConfidence::Inferred
        )
        .expect("link"));
    assert!(
        !history
            .link_session(
                session.session_id,
                AttemptLinkKind::Run,
                "run-1",
                AttemptLinkConfidence::Declared
            )
            .expect("relink"),
        "relinking the same identity is an update, not a second row"
    );
    let links = history.session_links(session.session_id).expect("links");
    assert_eq!(links.len(), 1);
    assert_eq!(links[0].confidence, AttemptLinkConfidence::Declared);
    assert!(history
        .link_session(
            session.session_id,
            AttemptLinkKind::Run,
            "",
            AttemptLinkConfidence::Declared
        )
        .is_err());
    history.close().expect("close");
}

#[test]
fn a_purge_tombstone_records_evidence_without_removing_content() {
    let s = scratch("observe-tombstone");
    let history = open(&s);
    seed(&history);
    let before = history.status().expect("status");

    let id = history
        .record_purge_tombstone(
            PurgeScope::Event,
            "evt-1",
            &"ab".repeat(32),
            "operator-confirmed purge",
        )
        .expect("tombstone");
    assert_eq!(
        history
            .record_purge_tombstone(
                PurgeScope::Event,
                "evt-1",
                &"ab".repeat(32),
                "operator-confirmed purge"
            )
            .expect("idempotent"),
        id
    );

    let stones = history.purge_tombstones().expect("tombstones");
    assert_eq!(stones.len(), 1);
    assert_eq!(stones[0].scope, PurgeScope::Event);

    // Recording a purge is EVIDENCE. Nothing was removed.
    let after = history.status().expect("status");
    assert_eq!(
        (
            after.events,
            after.revisions,
            after.blocks,
            after.search_chunks
        ),
        (
            before.events,
            before.revisions,
            before.blocks,
            before.search_chunks
        ),
        "this crate records purges; it does not execute them"
    );
    assert!(history
        .record_purge_tombstone(PurgeScope::Event, "", "digest", "reason")
        .is_err());
    history.close().expect("close");
}
