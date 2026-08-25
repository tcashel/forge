//! Durable provider-neutral native-session archive.
//!
//! `forged-history` owns a database separate from `forged-ledger::state.db`.
//! It is synchronous by construction: one blocking writer actor owns one
//! SQLite connection, compression happens before bounded staging
//! transactions, and committed visibility derives from an event-revision
//! parent fence. Exact native bytes remain immutable Zstandard blocks while
//! contentless FTS is an explicitly rebuildable projection.

mod actor;
mod error;
mod ingest;
mod path;
mod query;
mod read;
mod rebuild;
mod schema;
mod time;
mod types;

pub use actor::History;
pub use error::HistoryError;
pub use ingest::{
    IngestBuilder, ARCHIVE_BLOCK_TARGET_BYTES, ARCHIVE_STAGE_BATCH, FINAL_PUBLICATION_MAX_ROWS,
    SEARCH_CHUNK_TARGET_BYTES, SEARCH_STAGE_BATCH, USAGE_STAGE_BATCH,
};
pub use path::default_history_path;
pub use rebuild::REBUILD_STAGE_BATCH;
pub use time::canonical_timestamp;
pub use types::{
    EventRole, EventRow, HistoryFilter, HistoryStatus, IndexState, IngestOutcome, MetadataQuery,
    NamedValue, PreparedEvent, RebuildProgress, RevisionRow, SearchCursor, SearchMatch, SearchPage,
    SearchQuery, SessionRow, SourceFamily, SourceFileState, SourceObservation, SourceStatus,
    TombstoneOutcome, TombstoneScope, UsageFact, UsageRow,
};

#[cfg(test)]
pub(crate) fn test_scratch() -> tempfile::TempDir {
    use std::os::unix::fs::PermissionsExt as _;

    let scratch = tempfile::tempdir().expect("history scratch directory");
    std::fs::set_permissions(scratch.path(), std::fs::Permissions::from_mode(0o700))
        .expect("private history scratch permissions");
    scratch
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    use std::io::Cursor;

    fn prepared(
        family: SourceFamily,
        session: &str,
        key: &str,
        timestamp: &str,
        repository: &str,
        role: EventRole,
        model: &str,
    ) -> PreparedEvent {
        let mut event = PreparedEvent::new(family, session, "parser/v1", timestamp);
        event.native_event_key = Some(key.to_owned());
        event.repository_path = Some(repository.into());
        event.role = Some(role);
        event.model = Some(model.to_owned());
        event
    }

    #[test]
    fn every_typed_filter_has_positive_and_negative_coverage() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut local = history
            .begin_event(prepared(
                SourceFamily::Codex,
                "local",
                "event-local",
                "2026-08-25T01:00:00+01:00",
                "/repo/a",
                EventRole::Assistant,
                "gpt-local",
            ))
            .unwrap();
        local.push_raw_part(Cursor::new(b"local raw")).unwrap();
        local.push_text_fragment("filterword local").unwrap();
        local
            .push_usage(UsageFact {
                provider: "openai".to_owned(),
                model: "gpt-local".to_owned(),
                input_tokens: 11,
                output_tokens: 7,
                cache_read_tokens: Some(3),
                cache_write_tokens: None,
                cost_usd: Some(0.25),
                observed_at: "2026-08-25T00:00:01Z".to_owned(),
            })
            .unwrap();
        local.finish().unwrap();

        let host_id = history.status().unwrap().host_id;
        let session_id = history
            .sessions(MetadataQuery::default())
            .unwrap()
            .first()
            .unwrap()
            .session_id;
        let positives = [
            HistoryFilter {
                host_id: Some(host_id.clone()),
                ..Default::default()
            },
            HistoryFilter {
                repository_path: Some("/repo/a".into()),
                ..Default::default()
            },
            HistoryFilter {
                source_family: Some(SourceFamily::Codex),
                ..Default::default()
            },
            HistoryFilter {
                role: Some(EventRole::Assistant),
                ..Default::default()
            },
            HistoryFilter {
                model: Some("gpt-local".to_owned()),
                ..Default::default()
            },
            HistoryFilter {
                session_id: Some(session_id),
                ..Default::default()
            },
            HistoryFilter {
                from: Some("2026-08-24T23:59:59Z".to_owned()),
                to: Some("2026-08-25T00:00:01Z".to_owned()),
                ..Default::default()
            },
        ];
        for filter in positives {
            assert_eq!(
                history
                    .events(MetadataQuery {
                        filter: filter.clone(),
                        after_id: None,
                        limit: 10,
                    })
                    .unwrap()
                    .len(),
                1,
                "positive {filter:?}"
            );
            assert_eq!(
                history
                    .search(SearchQuery {
                        expression: "filterword".to_owned(),
                        filter: filter.clone(),
                        after: None,
                        limit: 10,
                    })
                    .unwrap()
                    .matches
                    .len(),
                1
            );
            assert_eq!(
                history
                    .usage(MetadataQuery {
                        filter,
                        after_id: None,
                        limit: 10,
                    })
                    .unwrap()
                    .len(),
                1
            );
        }
        let negatives = [
            HistoryFilter {
                host_id: Some("foreign-host".to_owned()),
                ..Default::default()
            },
            HistoryFilter {
                repository_path: Some("/repo/b".into()),
                ..Default::default()
            },
            HistoryFilter {
                source_family: Some(SourceFamily::ClaudeCode),
                ..Default::default()
            },
            HistoryFilter {
                role: Some(EventRole::User),
                ..Default::default()
            },
            HistoryFilter {
                model: Some("foreign-model".to_owned()),
                ..Default::default()
            },
            HistoryFilter {
                session_id: Some(session_id + 999),
                ..Default::default()
            },
            HistoryFilter {
                from: Some("2026-08-25T00:00:01Z".to_owned()),
                ..Default::default()
            },
        ];
        for filter in negatives {
            assert!(history
                .events(MetadataQuery {
                    filter: filter.clone(),
                    after_id: None,
                    limit: 10,
                })
                .unwrap()
                .is_empty());
            assert!(history
                .search(SearchQuery {
                    expression: "filterword".to_owned(),
                    filter: filter.clone(),
                    after: None,
                    limit: 10,
                })
                .unwrap()
                .matches
                .is_empty());
            assert!(history
                .usage(MetadataQuery {
                    filter,
                    after_id: None,
                    limit: 10,
                })
                .unwrap()
                .is_empty());
        }
        assert_eq!(
            history.usage(MetadataQuery::default()).unwrap()[0].input_tokens,
            11
        );
    }

    #[test]
    fn invalid_match_is_a_typed_invalid_request() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let result = history.search(SearchQuery {
            expression: "\"unterminated".to_owned(),
            filter: HistoryFilter::default(),
            after: None,
            limit: 10,
        });
        assert!(
            matches!(result, Err(HistoryError::Invalid { .. })),
            "{result:?}"
        );
    }

    #[test]
    fn bm25_whole_corpus_paging_is_epoch_fenced_and_decompresses_only_results() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        for (index, repository) in ["/repo/a", "/repo/b", "/repo/c"].iter().enumerate() {
            let mut event = history
                .begin_event(prepared(
                    SourceFamily::Codex,
                    &format!("session-{index}"),
                    &format!("event-{index}"),
                    "2026-08-25T00:00:00Z",
                    repository,
                    EventRole::Assistant,
                    "gpt",
                ))
                .unwrap();
            event
                .push_raw_part(Cursor::new(format!("raw-{index}")))
                .unwrap();
            event
                .push_text_fragment(&format!(
                    "rankword repository {index} {}",
                    "padding ".repeat(SEARCH_CHUNK_TARGET_BYTES / 16)
                ))
                .unwrap();
            event.finish().unwrap();
        }

        let mut cursor = None;
        let mut first_cursor = None;
        let mut ids = std::collections::BTreeSet::new();
        loop {
            let page = history
                .search(SearchQuery {
                    expression: "rankword".to_owned(),
                    filter: HistoryFilter::default(),
                    after: cursor,
                    limit: 1,
                })
                .unwrap();
            assert_eq!(page.decompressed_chunks, page.matches.len());
            for found in &page.matches {
                assert!(ids.insert(found.chunk_id), "duplicate chunk page");
            }
            if first_cursor.is_none() {
                first_cursor = page.next.clone();
            }
            let Some(next) = page.next else {
                break;
            };
            cursor = Some(next);
        }
        assert_eq!(ids.len(), 3);

        let stale = first_cursor.unwrap();
        let mut fourth = history
            .begin_event(prepared(
                SourceFamily::Pi,
                "session-four",
                "event-four",
                "2026-08-25T00:00:01Z",
                "/repo/d",
                EventRole::User,
                "pi-model",
            ))
            .unwrap();
        fourth.push_raw_part(Cursor::new(b"raw-four")).unwrap();
        fourth
            .push_text_fragment(&"rankword fourth ".repeat(
                (SEARCH_CHUNK_TARGET_BYTES * SEARCH_STAGE_BATCH / "rankword fourth ".len()) + 1,
            ))
            .unwrap();
        assert!(matches!(
            history.search(SearchQuery {
                expression: "rankword".to_owned(),
                filter: HistoryFilter::default(),
                after: Some(stale.clone()),
                limit: 1,
            }),
            Err(HistoryError::Rebuilding)
        ));
        fourth.finish().unwrap();
        assert!(matches!(
            history.search(SearchQuery {
                expression: "rankword".to_owned(),
                filter: HistoryFilter::default(),
                after: Some(stale.clone()),
                limit: 1,
            }),
            Err(HistoryError::StaleCursor)
        ));

        history.reset_search_index().unwrap();
        while !history
            .rebuild_search_step(REBUILD_STAGE_BATCH)
            .unwrap()
            .complete
        {}
        assert!(matches!(
            history.search(SearchQuery {
                expression: "rankword".to_owned(),
                filter: HistoryFilter::default(),
                after: Some(stale),
                limit: 1,
            }),
            Err(HistoryError::StaleCursor)
        ));
    }
}
