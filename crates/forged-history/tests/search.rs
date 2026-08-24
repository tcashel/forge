//! BM25 lookup: whole-corpus by default, keyset-paged, and decompressing
//! only what it returns.

mod support;

use forged_history::{
    History, HistoryFilter, SearchCursor, SearchOutcome, SEARCH_CHUNK_TARGET_BYTES,
};
use support::{count, header, open, raw, scratch};

fn ready(outcome: SearchOutcome) -> Vec<forged_history::SearchMatch> {
    match outcome {
        SearchOutcome::Ready(page) => page.rows,
        other => panic!("expected a ready search, got {other:?}"),
    }
}

#[test]
fn text_spanning_many_utf8_safe_chunks_is_fully_indexed() {
    let s = scratch("search-chunks");
    let history = open(&s);
    // Multibyte filler so chunk boundaries land inside scalar values, plus a
    // rare term far past the first chunk.
    let mut text = "château données 🜂 ".repeat(2_000);
    text.push_str(" quokkasignal ");
    text.push_str(&"château données 🜂 ".repeat(2_000));
    assert!(text.len() > SEARCH_CHUNK_TARGET_BYTES * 4);

    let outcome = history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"text\":\"long\"}"[..],
            text.as_bytes(),
            [],
        )
        .expect("ingest");
    let revision_id = outcome.revision_id();

    let matches = ready(
        history
            .search("quokkasignal", &HistoryFilter::default(), None, 10)
            .expect("search"),
    );
    assert_eq!(matches.len(), 1, "the rare term matches exactly one chunk");
    assert!(matches[0].text.contains("quokkasignal"));
    assert_eq!(matches[0].revision_id, revision_id);
    history.close().expect("close");

    let conn = raw(&s.db());
    let chunks = count(
        &conn,
        &format!("SELECT COUNT(*) FROM search_chunks WHERE revision_id = {revision_id}"),
    );
    assert!(chunks > 4, "the text spans {chunks} chunks");
    assert_eq!(
        count(&conn, "SELECT COUNT(*) FROM search_fts"),
        chunks,
        "every retained chunk is indexed exactly once"
    );

    // The complete text is retained, chunk for chunk, as compressed blocks.
    let stored: i64 = count(
        &conn,
        &format!(
            "SELECT COALESCE(SUM(byte_length),0) FROM search_chunks \
             WHERE revision_id = {revision_id}"
        ),
    );
    assert_eq!(
        stored,
        text.len() as i64,
        "chunking retains the text whole, never truncated"
    );
}

#[test]
fn an_absent_repository_predicate_searches_every_repository() {
    let s = scratch("search-corpus");
    let history = open(&s);
    for (session, repo) in [("s-1", "/repos/alpha"), ("s-2", "/repos/beta")] {
        history
            .ingest_event(
                header(session, "a.jsonl", 0, Some(repo)),
                format!("{{\"repo\":\"{repo}\"}}").as_bytes(),
                b"shared vocabulary term".as_slice(),
                [],
            )
            .expect("ingest");
    }

    let all = ready(
        history
            .search("vocabulary", &HistoryFilter::default(), None, 10)
            .expect("search"),
    );
    assert_eq!(
        all.len(),
        2,
        "no repository predicate means every repository"
    );

    let narrowed = ready(
        history
            .search(
                "vocabulary",
                &HistoryFilter {
                    repository_path: Some("/repos/beta".to_owned()),
                    ..HistoryFilter::default()
                },
                None,
                10,
            )
            .expect("search"),
    );
    assert_eq!(narrowed.len(), 1);
    assert_eq!(narrowed[0].repository_path.as_deref(), Some("/repos/beta"));
    history.close().expect("close");
}

#[test]
fn only_the_chunks_a_page_returns_are_decompressed() {
    let s = scratch("search-lazy");
    let history = open(&s);
    history
        .ingest_event(
            header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"n\":1}"[..],
            &b"needle in the archive"[..],
            [],
        )
        .expect("needle");
    history
        .ingest_event(
            header("s-1", "a.jsonl", 1, Some("/repos/forge")),
            &b"{\"n\":2}"[..],
            &b"haystack of unrelated words"[..],
            [],
        )
        .expect("haystack");
    history.close().expect("close");

    // Corrupt the block behind the chunk the query must NOT return. Any
    // implementation that decompressed the whole index would fail here.
    let conn = raw(&s.db());
    conn.execute(
        "UPDATE archive_blocks SET bytes = X'00'
          WHERE block_id IN (SELECT block_id FROM search_chunks
                              WHERE chunk_id = (SELECT MAX(chunk_id) FROM search_chunks))",
        [],
    )
    .expect("corrupt the unrelated chunk");
    drop(conn);

    let history = History::open(&s.db()).expect("reopen");
    let matches = ready(
        history
            .search("needle", &HistoryFilter::default(), None, 10)
            .expect("search"),
    );
    assert_eq!(matches.len(), 1);
    assert_eq!(matches[0].text, "needle in the archive");

    // Reaching the corrupt chunk refuses rather than returning bad content.
    let poisoned = history.search("haystack", &HistoryFilter::default(), None, 10);
    assert!(
        poisoned.is_err(),
        "a corrupt block must refuse, not return content"
    );
    history.close().expect("close");
}

#[test]
fn the_keyset_cursor_pages_tied_ranks_without_gaps_or_repeats() {
    let s = scratch("search-cursor");
    let history = open(&s);
    // Identical text across seven events forces identical BM25 ranks, so
    // only the chunk-id tiebreak can page them correctly.
    for index in 0..7_u64 {
        history
            .ingest_event(
                header("s-1", "a.jsonl", index, Some("/repos/forge")),
                format!("{{\"n\":{index}}}").as_bytes(),
                b"tie breaker lexeme".as_slice(),
                [],
            )
            .expect("ingest");
    }

    let whole = ready(
        history
            .search("lexeme", &HistoryFilter::default(), None, 50)
            .expect("search"),
    );
    assert_eq!(whole.len(), 7);
    let ranks: Vec<f64> = whole.iter().map(|m| m.rank).collect();
    assert!(
        ranks.windows(2).all(|w| w[0] == w[1]),
        "the fixture must actually tie: {ranks:?}"
    );

    let mut paged: Vec<i64> = Vec::new();
    let mut cursor: Option<SearchCursor> = None;
    loop {
        let page = match history
            .search("lexeme", &HistoryFilter::default(), cursor, 2)
            .expect("search")
        {
            SearchOutcome::Ready(page) => page,
            other => panic!("expected a ready search, got {other:?}"),
        };
        paged.extend(page.rows.iter().map(|m| m.chunk_id));
        match page.next {
            Some(next) => cursor = Some(next),
            None => break,
        }
    }
    let expected: Vec<i64> = whole.iter().map(|m| m.chunk_id).collect();
    assert_eq!(
        paged, expected,
        "keyset paging must visit every match exactly once, in order"
    );
    history.close().expect("close");
}

#[test]
fn a_blank_query_is_refused_rather_than_matching_everything() {
    let s = scratch("search-blank");
    let history = open(&s);
    assert!(history
        .search("   ", &HistoryFilter::default(), None, 10)
        .is_err());
    assert!(history
        .search("term", &HistoryFilter::default(), None, 0)
        .is_err());
    history.close().expect("close");
}
