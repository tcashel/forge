//! What the history schema IS, and what it deliberately is not.

mod support;

use forged_history::{History, HISTORY_INDEXES, HISTORY_SCHEMA_VERSION, HISTORY_TABLES};
use support::{count, open, raw, scratch};

#[test]
fn the_schema_declares_exactly_the_history_objects_it_names() {
    let s = scratch("schema-enumerate");
    let history = open(&s);
    history.close().expect("close");

    let conn = raw(&s.db());
    let mut stmt = conn
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .expect("prepare");
    let mut tables: Vec<String> = stmt
        .query_map([], |row| row.get(0))
        .expect("query")
        .collect::<Result<_, _>>()
        .expect("rows");
    // FTS5 builds shadow tables beneath the virtual table; they are its
    // implementation, not schema objects the archive declares.
    tables.retain(|t| !t.starts_with("search_fts_"));
    tables.sort();

    let mut declared: Vec<String> = HISTORY_TABLES.iter().map(|t| (*t).to_owned()).collect();
    declared.sort();
    assert_eq!(
        tables, declared,
        "the declared table list and the built schema must not drift"
    );

    let mut stmt = conn
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL")
        .expect("prepare");
    let mut indexes: Vec<String> = stmt
        .query_map([], |row| row.get(0))
        .expect("query")
        .collect::<Result<_, _>>()
        .expect("rows");
    indexes.sort();
    let mut declared: Vec<String> = HISTORY_INDEXES.iter().map(|i| (*i).to_owned()).collect();
    declared.sort();
    assert_eq!(indexes, declared, "declared indexes must match the schema");
}

#[test]
fn the_bundled_sqlite_supports_contentless_fts5_with_deletes() {
    let s = scratch("schema-fts5");
    let history = open(&s);
    history.close().expect("close");
    let conn = raw(&s.db());

    let fts5: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM pragma_compile_options
                            WHERE compile_options = 'ENABLE_FTS5')",
            [],
            |row| row.get(0),
        )
        .expect("compile options");
    assert!(fts5, "the bundled SQLite must ship FTS5");

    let ddl: String = conn
        .query_row(
            "SELECT sql FROM sqlite_master WHERE name = 'search_fts'",
            [],
            |row| row.get(0),
        )
        .expect("fts ddl");
    assert!(
        ddl.contains("content=''") && ddl.contains("contentless_delete=1"),
        "the search index must be contentless AND deletable: {ddl}"
    );

    // Exercise the capability rather than trusting the declaration.
    conn.execute_batch(
        "INSERT INTO search_fts(rowid, text) VALUES (9001, 'probe term');
         DELETE FROM search_fts WHERE rowid = 9001;",
    )
    .expect("contentless delete must work under the bundled SQLite");
    assert_eq!(
        count(&conn, "SELECT COUNT(*) FROM search_fts"),
        0,
        "the probe row must be gone"
    );
}

#[test]
fn no_history_object_reaches_a_separately_opened_state_db() {
    let s = scratch("schema-isolation");
    // A state.db fixture built the way the ledger builds one, beside the
    // archive and never through it.
    let state_db = s.join("anvil/state.db");
    std::fs::create_dir_all(state_db.parent().expect("parent")).expect("state dir");
    let state = raw(&state_db);
    state
        .execute_batch("CREATE TABLE runs (run_id TEXT PRIMARY KEY); PRAGMA user_version=21;")
        .expect("state schema");
    drop(state);

    let history = open(&s);
    history
        .ingest_event(
            support::header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"k\":1}"[..],
            &b"searchable"[..],
            [],
        )
        .expect("ingest");
    history.close().expect("close");

    let state = raw(&state_db);
    let mut stmt = state
        .prepare("SELECT name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'")
        .expect("prepare");
    let names: Vec<String> = stmt
        .query_map([], |row| row.get(0))
        .expect("query")
        .collect::<Result<_, _>>()
        .expect("rows");
    assert_eq!(
        names,
        vec!["runs".to_owned()],
        "opening and writing the archive must leave state.db untouched"
    );
    let version: i64 = state
        .query_row("PRAGMA user_version", [], |row| row.get(0))
        .expect("user_version");
    assert_eq!(version, 21, "the ledger's own schema version is not ours");
}

#[test]
fn migrations_replay_without_reapplying_and_refuse_a_newer_archive() {
    let s = scratch("schema-migrate");
    let history = open(&s);
    let first = history.pragmas().expect("pragmas");
    assert_eq!(first.user_version, HISTORY_SCHEMA_VERSION);
    assert_eq!(first.journal_mode, "wal");
    assert!(first.foreign_keys);
    assert_eq!(first.busy_timeout_ms, 5000);
    let host = history.host_id().expect("host id");
    history.close().expect("close");

    // Reopening replays the migration ladder and applies nothing.
    let history = open(&s);
    assert_eq!(
        history.pragmas().expect("pragmas").user_version,
        HISTORY_SCHEMA_VERSION
    );
    assert_eq!(
        history.host_id().expect("host id"),
        host,
        "the host id is generated once and never regenerated"
    );
    history.close().expect("close");

    // An archive written by a newer build is refused, not downgraded.
    let conn = raw(&s.db());
    conn.execute_batch(&format!(
        "PRAGMA user_version={};",
        HISTORY_SCHEMA_VERSION + 1
    ))
    .expect("bump version");
    drop(conn);
    let refused = History::open(&s.db());
    assert!(
        refused.is_err(),
        "a newer archive must refuse to open, never be silently downgraded"
    );
}

#[test]
fn an_unknown_stored_vocabulary_fails_closed_on_read() {
    let s = scratch("schema-vocabulary");
    let history = open(&s);
    history
        .ingest_event(
            support::header("s-1", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"k\":1}"[..],
            &b"searchable"[..],
            [],
        )
        .expect("ingest");
    history.close().expect("close");

    // CHECK constraints keep the closed set closed through the crate; write
    // past them to prove the DECODER also refuses rather than defaulting.
    let conn = raw(&s.db());
    conn.execute_batch(
        "PRAGMA ignore_check_constraints=ON;
         UPDATE sessions SET source_family = 'matrix';",
    )
    .expect("plant an unknown family");
    drop(conn);

    let history = History::open(&s.db()).expect("reopen");
    let read = history.list_sessions(&forged_history::HistoryFilter::default(), None, 10);
    let err = read.expect_err("an unknown stored family must refuse");
    assert!(
        format!("{err}").contains("matrix"),
        "the refusal must name the offending value: {err}"
    );
    history.close().expect("close");
}

#[test]
fn the_archive_crate_is_independent_of_the_state_ledger() {
    // The isolation is architectural: an archive compaction must never be
    // able to block a settlement, so the two stores share no crate, no
    // connection, and no writer thread.
    let manifest = include_str!("../Cargo.toml");
    assert!(
        !manifest.contains("forged-ledger"),
        "forged-history must not depend on forged-ledger:\n{manifest}"
    );
    assert!(
        !manifest.contains("tokio") && !manifest.contains("async"),
        "the archive is synchronous by construction:\n{manifest}"
    );
}
