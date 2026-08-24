//! The index-generation state machine: durable archive, rebuildable index.

mod support;

use forged_history::{History, HistoryFilter, IndexState, SearchOutcome};
use support::{header, open, raw, scratch};

fn ready(outcome: SearchOutcome) -> Vec<forged_history::SearchMatch> {
    match outcome {
        SearchOutcome::Ready(page) => page.rows,
        other => panic!("expected a ready search, got {other:?}"),
    }
}

/// Twelve searchable events, each with its own distinctive term.
fn seed(history: &History) {
    for index in 0..12_u64 {
        history
            .ingest_event(
                header("s-1", "a.jsonl", index, Some("/repos/forge")),
                format!("{{\"n\":{index}}}").as_bytes(),
                format!("lexeme{index} shared corpus wording").as_bytes(),
                [],
            )
            .expect("ingest");
    }
}

#[test]
fn a_rebuild_from_retained_chunks_restores_identical_matches() {
    let s = scratch("rebuild-identical");
    let history = open(&s);
    seed(&history);
    let before = ready(
        history
            .search("corpus", &HistoryFilter::default(), None, 50)
            .expect("search"),
    );
    assert_eq!(before.len(), 12);

    // Every source file is gone. The rebuild must not need one.
    for file in history.sync_state(None).expect("sync state") {
        history
            .mark_source_file_missing(file.source_file_id)
            .expect("mark missing");
    }

    let generation = history.begin_index_rebuild().expect("begin rebuild");
    assert!(
        matches!(
            history.search("corpus", &HistoryFilter::default(), None, 50),
            Ok(SearchOutcome::Rebuilding { .. })
        ),
        "a dropped index must report itself rebuilding, never return fewer hits"
    );

    let progress = history.rebuild_index(4).expect("rebuild");
    assert!(progress.complete);
    assert_eq!(progress.generation, generation);
    assert_eq!(progress.indexed_total, progress.total_chunks);

    let after = ready(
        history
            .search("corpus", &HistoryFilter::default(), None, 50)
            .expect("search"),
    );
    assert_eq!(
        after.iter().map(|m| m.chunk_id).collect::<Vec<_>>(),
        before.iter().map(|m| m.chunk_id).collect::<Vec<_>>(),
        "the rebuilt index returns identical lexical matches"
    );
    assert_eq!(
        after.iter().map(|m| m.text.clone()).collect::<Vec<_>>(),
        before.iter().map(|m| m.text.clone()).collect::<Vec<_>>()
    );
    history.close().expect("close");
}

#[test]
fn a_partial_generation_is_never_advertised_as_complete() {
    let s = scratch("rebuild-partial");
    let history = open(&s);
    seed(&history);
    let generation = history.begin_index_rebuild().expect("begin rebuild");

    // One bounded batch, deliberately far short of the whole corpus.
    let step = history
        .rebuild_step(3)
        .expect("step")
        .expect("a build is in flight");
    assert_eq!(step.indexed_now, 3);
    assert!(!step.complete);
    assert!(step.indexed_total < step.total_chunks);

    let status = history.status().expect("status");
    assert_eq!(status.complete_generation, None);
    assert_eq!(status.building_generation, Some(generation));
    match history
        .search("corpus", &HistoryFilter::default(), None, 50)
        .expect("search")
    {
        SearchOutcome::Rebuilding {
            generation: g,
            indexed_chunks,
            total_chunks,
        } => {
            assert_eq!(g, generation);
            assert_eq!(indexed_chunks, 3);
            assert_eq!(total_chunks, 12);
        }
        other => panic!("a partial generation must not serve queries: {other:?}"),
    }

    let generations = history.index_generations().expect("generations");
    assert!(
        generations.iter().all(|g| g.state != IndexState::Complete),
        "no generation may claim completeness yet: {generations:?}"
    );
    history.close().expect("close");
}

#[test]
fn an_interrupted_rebuild_stays_interrupted_across_a_reopen() {
    let s = scratch("rebuild-interrupted");
    let history = open(&s);
    seed(&history);
    let generation = history.begin_index_rebuild().expect("begin rebuild");
    history.rebuild_step(2).expect("step").expect("in flight");
    history.close().expect("close");

    let history = History::open(&s.db()).expect("reopen");
    assert_eq!(
        history.status().expect("status").building_generation,
        Some(generation),
        "reopening never promotes a partial generation"
    );
    assert!(matches!(
        history.search("corpus", &HistoryFilter::default(), None, 50),
        Ok(SearchOutcome::Rebuilding { .. })
    ));

    // Resuming picks up exactly where it stopped and finishes the corpus.
    assert_eq!(
        history.begin_index_rebuild().expect("resume"),
        generation,
        "a second begin resumes rather than restarting"
    );
    let progress = history.rebuild_index(5).expect("rebuild");
    assert!(progress.complete);
    assert_eq!(progress.indexed_total, 12);
    assert_eq!(
        ready(
            history
                .search("corpus", &HistoryFilter::default(), None, 50)
                .expect("search")
        )
        .len(),
        12
    );
    history.close().expect("close");
}

#[test]
fn a_failed_rebuild_leaves_the_archive_intact_and_diagnosable() {
    let s = scratch("rebuild-failed");
    let history = open(&s);
    seed(&history);
    let events = history
        .list_events(&HistoryFilter::default(), None, 50)
        .expect("events");
    history.begin_index_rebuild().expect("begin rebuild");
    assert!(history
        .fail_index_rebuild("scratch disk filled")
        .expect("fail"));

    match history
        .search("corpus", &HistoryFilter::default(), None, 50)
        .expect("search")
    {
        SearchOutcome::Unavailable { reason } => assert!(!reason.is_empty()),
        other => panic!("a failed rebuild must not serve queries: {other:?}"),
    }
    let generations = history.index_generations().expect("generations");
    let failed = generations
        .iter()
        .find(|g| g.state == IndexState::Failed)
        .expect("the failed generation is retained");
    assert_eq!(failed.note.as_deref(), Some("scratch disk filled"));

    // The archive itself is untouched: every record still reads back exactly.
    for row in &events.rows {
        assert!(!history
            .read_event_bytes(row.revision_id)
            .expect("bytes")
            .is_empty());
    }
    let status = history.status().expect("status");
    assert_eq!(status.revisions, 12);
    assert_eq!(status.search_chunks, 12);

    // And a fresh rebuild recovers from the retained chunks.
    history.begin_index_rebuild().expect("second begin");
    assert!(history.rebuild_index(4).expect("rebuild").complete);
    assert_eq!(
        ready(
            history
                .search("corpus", &HistoryFilter::default(), None, 50)
                .expect("search")
        )
        .len(),
        12
    );
    history.close().expect("close");
}

#[test]
fn rebuilding_replaces_only_the_index_generation_and_the_virtual_table() {
    let s = scratch("rebuild-scope");
    let history = open(&s);
    seed(&history);
    let before = history.status().expect("status");
    history.begin_index_rebuild().expect("begin");
    history.rebuild_index(4).expect("rebuild");
    let after = history.status().expect("status");
    history.close().expect("close");

    assert_eq!(
        (
            before.sessions,
            before.events,
            before.revisions,
            before.blocks,
            before.compressed_bytes,
            before.search_chunks
        ),
        (
            after.sessions,
            after.events,
            after.revisions,
            after.blocks,
            after.compressed_bytes,
            after.search_chunks
        ),
        "a rebuild must not touch archived content"
    );
    assert_ne!(
        before.complete_generation, after.complete_generation,
        "the standing generation is replaced, not mutated"
    );

    let conn = raw(&s.db());
    let superseded: i64 = support::count(
        &conn,
        "SELECT COUNT(*) FROM index_generations WHERE state = 'superseded'",
    );
    assert_eq!(superseded, 1, "the prior generation is retained as history");
}
