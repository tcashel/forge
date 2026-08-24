//! The history schema, its capability probe, and its ordered migrations.
//!
//! Configuration order is load-bearing and mirrors the state ledger's:
//! `busy_timeout` first, `journal_mode=WAL` outside any transaction (retried
//! on `SQLITE_BUSY`), then every pending migration inside ONE
//! `BEGIN IMMEDIATE` transaction that re-reads `user_version` after taking
//! the write lock. A crash mid-migrate rolls back atomically and two
//! processes opening the same fresh archive both end up correct.
//!
//! The FTS5 capability probe runs BEFORE any migration: the schema declares
//! a contentless FTS5 table with `contentless_delete=1`, and discovering
//! mid-ingestion that the linked SQLite cannot delete from a contentless
//! index would be a silent corruption path.

use rusqlite::{Connection, TransactionBehavior};

use crate::error::{internal, is_busy_error, HistoryError};
use crate::time::now_iso;

/// How long a connection waits on a lock before erroring, in milliseconds.
pub(crate) const BUSY_TIMEOUT_MS: i64 = 5000;

/// The archive-block payload encoding version stored on every block.
pub(crate) const CODEC_SCHEMA: i64 = 1;

/// Migration 001: the whole v1 history schema.
const MIGRATION_001: &str = "
CREATE TABLE history_meta (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE hosts (
  host_id    TEXT PRIMARY KEY,
  is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0,1)),
  label      TEXT,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX hosts_single_current ON hosts(is_current) WHERE is_current = 1;

CREATE TABLE source_roots (
  source_root_id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id        TEXT NOT NULL REFERENCES hosts(host_id),
  source_family  TEXT NOT NULL CHECK (source_family IN ('claude_code','codex','pi')),
  root_path      TEXT NOT NULL,
  presence       TEXT NOT NULL DEFAULT 'present'
                 CHECK (presence IN ('present','missing')),
  first_seen_at  TEXT NOT NULL,
  last_seen_at   TEXT NOT NULL,
  missing_at     TEXT,
  UNIQUE (host_id, source_family, root_path)
);

CREATE TABLE source_files (
  source_file_id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_root_id INTEGER NOT NULL REFERENCES source_roots(source_root_id),
  relative_path  TEXT NOT NULL,
  presence       TEXT NOT NULL DEFAULT 'present'
                 CHECK (presence IN ('present','missing')),
  size_bytes     INTEGER CHECK (size_bytes IS NULL OR size_bytes >= 0),
  modified_at    TEXT,
  first_seen_at  TEXT NOT NULL,
  last_seen_at   TEXT NOT NULL,
  missing_at     TEXT,
  UNIQUE (source_root_id, relative_path)
);

CREATE TABLE source_cursors (
  source_file_id INTEGER PRIMARY KEY REFERENCES source_files(source_file_id),
  parser_version INTEGER NOT NULL,
  byte_offset    INTEGER NOT NULL DEFAULT 0 CHECK (byte_offset >= 0),
  record_index   INTEGER NOT NULL DEFAULT 0 CHECK (record_index >= 0),
  updated_at     TEXT NOT NULL
);

CREATE TABLE source_runs (
  source_run_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id          TEXT NOT NULL REFERENCES hosts(host_id),
  source_family    TEXT NOT NULL CHECK (source_family IN ('claude_code','codex','pi')),
  started_at       TEXT NOT NULL,
  finished_at      TEXT,
  outcome          TEXT CHECK (outcome IS NULL OR outcome IN
                   ('completed','failed','interrupted')),
  files_seen       INTEGER NOT NULL DEFAULT 0 CHECK (files_seen >= 0),
  events_published INTEGER NOT NULL DEFAULT 0 CHECK (events_published >= 0),
  note             TEXT
);

CREATE TABLE sessions (
  session_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id           TEXT NOT NULL REFERENCES hosts(host_id),
  source_family     TEXT NOT NULL CHECK (source_family IN ('claude_code','codex','pi')),
  native_session_id TEXT NOT NULL,
  observed_cwd      TEXT,
  repository_path   TEXT,
  title             TEXT,
  started_at        TEXT,
  last_event_at     TEXT,
  visibility        TEXT NOT NULL DEFAULT 'staging'
                    CHECK (visibility IN ('staging','committed')),
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  UNIQUE (host_id, source_family, native_session_id)
);
CREATE INDEX sessions_repository ON sessions(repository_path, session_id)
  WHERE visibility = 'committed';

CREATE TABLE session_observations (
  observation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id     INTEGER NOT NULL REFERENCES sessions(session_id),
  source_file_id INTEGER NOT NULL REFERENCES source_files(source_file_id),
  observed_path  TEXT NOT NULL,
  presence       TEXT NOT NULL DEFAULT 'present'
                 CHECK (presence IN ('present','missing')),
  first_seen_at  TEXT NOT NULL,
  last_seen_at   TEXT NOT NULL,
  missing_at     TEXT,
  UNIQUE (session_id, source_file_id)
);

-- An event row exists ONLY because a publication created it: staging never
-- reaches this table, so `head_revision` is always a real committed
-- revision and no visibility column is needed to say so.
CREATE TABLE events (
  event_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id     INTEGER NOT NULL REFERENCES sessions(session_id),
  event_key      TEXT NOT NULL,
  event_key_kind TEXT NOT NULL CHECK (event_key_kind IN ('native','derived')),
  head_revision  INTEGER NOT NULL CHECK (head_revision > 0),
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  UNIQUE (session_id, event_key)
);

CREATE TABLE event_revisions (
  revision_id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id            INTEGER REFERENCES events(event_id),
  session_id          INTEGER NOT NULL REFERENCES sessions(session_id),
  staging_token       TEXT,
  revision            INTEGER CHECK (revision IS NULL OR revision > 0),
  visibility          TEXT NOT NULL DEFAULT 'staging'
                      CHECK (visibility IN ('staging','committed')),
  content_sha256      TEXT,
  byte_length         INTEGER NOT NULL DEFAULT 0 CHECK (byte_length >= 0),
  parser_version      INTEGER NOT NULL,
  lineage_kind        TEXT NOT NULL CHECK (lineage_kind IN
                      ('main','sidechain','summary','unknown')),
  parent_event_key    TEXT,
  role                TEXT CHECK (role IS NULL OR role IN
                      ('user','assistant','system','tool','other')),
  model               TEXT,
  event_kind          TEXT NOT NULL,
  occurred_at         TEXT,
  source_file_id      INTEGER NOT NULL REFERENCES source_files(source_file_id),
  source_byte_offset  INTEGER NOT NULL CHECK (source_byte_offset >= 0),
  source_record_index INTEGER NOT NULL CHECK (source_record_index >= 0),
  created_at          TEXT NOT NULL,
  ingested_at         TEXT,
  -- A committed revision is fully resolved by construction: publication is
  -- the only writer that may fill these, and it fills all of them at once.
  CHECK (visibility = 'staging' OR (event_id IS NOT NULL
         AND revision IS NOT NULL AND content_sha256 IS NOT NULL
         AND ingested_at IS NOT NULL))
);
CREATE UNIQUE INDEX event_revisions_ordinal
  ON event_revisions(event_id, revision) WHERE visibility = 'committed';
CREATE UNIQUE INDEX event_revisions_content
  ON event_revisions(event_id, content_sha256) WHERE visibility = 'committed';
CREATE INDEX event_revisions_staging
  ON event_revisions(staging_token) WHERE visibility = 'staging';
CREATE INDEX event_revisions_session
  ON event_revisions(session_id, revision_id) WHERE visibility = 'committed';
CREATE INDEX event_revisions_occurred
  ON event_revisions(occurred_at, revision_id) WHERE visibility = 'committed';

CREATE TABLE archive_blocks (
  block_id         INTEGER PRIMARY KEY AUTOINCREMENT,
  codec            TEXT NOT NULL CHECK (codec IN ('zstd')),
  codec_schema     INTEGER NOT NULL CHECK (codec_schema >= 1),
  content_sha256   TEXT NOT NULL UNIQUE,
  uncompressed_len INTEGER NOT NULL CHECK (uncompressed_len >= 0),
  compressed_len   INTEGER NOT NULL CHECK (compressed_len >= 0),
  refcount         INTEGER NOT NULL DEFAULT 0 CHECK (refcount >= 0),
  visibility       TEXT NOT NULL DEFAULT 'staging'
                   CHECK (visibility IN ('staging','committed')),
  created_at       TEXT NOT NULL,
  bytes            BLOB NOT NULL
);
CREATE INDEX archive_blocks_reclaimable
  ON archive_blocks(block_id) WHERE visibility = 'staging' AND refcount = 0;

CREATE TABLE event_parts (
  revision_id INTEGER NOT NULL REFERENCES event_revisions(revision_id),
  seq         INTEGER NOT NULL CHECK (seq >= 0),
  block_id    INTEGER NOT NULL REFERENCES archive_blocks(block_id),
  byte_offset INTEGER NOT NULL CHECK (byte_offset >= 0),
  byte_length INTEGER NOT NULL CHECK (byte_length >= 0),
  visibility  TEXT NOT NULL DEFAULT 'staging'
              CHECK (visibility IN ('staging','committed')),
  PRIMARY KEY (revision_id, seq)
);
CREATE INDEX event_parts_block ON event_parts(block_id);

CREATE TABLE search_chunks (
  chunk_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  revision_id INTEGER NOT NULL REFERENCES event_revisions(revision_id),
  session_id  INTEGER NOT NULL REFERENCES sessions(session_id),
  seq         INTEGER NOT NULL CHECK (seq >= 0),
  block_id    INTEGER NOT NULL REFERENCES archive_blocks(block_id),
  char_length INTEGER NOT NULL CHECK (char_length >= 0),
  byte_length INTEGER NOT NULL CHECK (byte_length >= 0),
  visibility  TEXT NOT NULL DEFAULT 'staging'
              CHECK (visibility IN ('staging','committed')),
  UNIQUE (revision_id, seq)
);
CREATE INDEX search_chunks_committed
  ON search_chunks(chunk_id) WHERE visibility = 'committed';

CREATE VIRTUAL TABLE search_fts USING fts5(text, content='', contentless_delete=1);

CREATE TABLE index_generations (
  generation            INTEGER PRIMARY KEY AUTOINCREMENT,
  kind                  TEXT NOT NULL CHECK (kind IN ('fts5')),
  state                 TEXT NOT NULL CHECK (state IN
                        ('building','complete','failed','superseded')),
  resume_after_chunk_id INTEGER NOT NULL DEFAULT 0
                        CHECK (resume_after_chunk_id >= 0),
  indexed_chunks        INTEGER NOT NULL DEFAULT 0 CHECK (indexed_chunks >= 0),
  started_at            TEXT NOT NULL,
  completed_at          TEXT,
  note                  TEXT,
  -- A generation cannot claim completeness without the moment it completed.
  CHECK (state <> 'complete' OR completed_at IS NOT NULL)
);
CREATE UNIQUE INDEX index_generations_single_complete
  ON index_generations(kind) WHERE state = 'complete';
CREATE UNIQUE INDEX index_generations_single_building
  ON index_generations(kind) WHERE state = 'building';

CREATE TABLE usage_facts (
  usage_id           INTEGER PRIMARY KEY AUTOINCREMENT,
  revision_id        INTEGER NOT NULL REFERENCES event_revisions(revision_id),
  session_id         INTEGER NOT NULL REFERENCES sessions(session_id),
  seq                INTEGER NOT NULL CHECK (seq >= 0),
  provider           TEXT NOT NULL,
  model              TEXT NOT NULL,
  input_tokens       INTEGER CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens      INTEGER CHECK (output_tokens IS NULL OR output_tokens >= 0),
  cache_read_tokens  INTEGER CHECK (cache_read_tokens IS NULL OR cache_read_tokens >= 0),
  cache_write_tokens INTEGER CHECK (cache_write_tokens IS NULL OR cache_write_tokens >= 0),
  reasoning_tokens   INTEGER CHECK (reasoning_tokens IS NULL OR reasoning_tokens >= 0),
  visibility         TEXT NOT NULL DEFAULT 'staging'
                     CHECK (visibility IN ('staging','committed')),
  UNIQUE (revision_id, seq)
);
CREATE INDEX usage_facts_session
  ON usage_facts(session_id) WHERE visibility = 'committed';
";

/// Migration 002: orchestrator linkage and purge tombstones.
///
/// Split from 001 so the archive's content schema and its orchestrator-facing
/// projection can version independently: the linkage vocabulary follows
/// forged's identity model, the archive's does not.
const MIGRATION_002: &str = "
CREATE TABLE attempt_links (
  session_id INTEGER NOT NULL REFERENCES sessions(session_id),
  link_kind  TEXT NOT NULL CHECK (link_kind IN ('run','packet','attempt','bead')),
  link_value TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('declared','inferred')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (session_id, link_kind, link_value)
);
CREATE INDEX attempt_links_value ON attempt_links(link_kind, link_value);

CREATE TABLE purge_tombstones (
  tombstone_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  scope         TEXT NOT NULL CHECK (scope IN ('session','event','block','chunk')),
  scope_key     TEXT NOT NULL,
  digest_sha256 TEXT NOT NULL,
  reason        TEXT NOT NULL,
  purged_at     TEXT NOT NULL,
  UNIQUE (scope, scope_key)
);
";

/// Every embedded migration, in application order. The index of the last
/// applied migration is the archive's `user_version`.
const MIGRATIONS: &[&str] = &[MIGRATION_001, MIGRATION_002];

/// The schema version a current build writes.
pub(crate) const SCHEMA_VERSION: i64 = MIGRATIONS.len() as i64;

/// Configure pragmas, prove the required SQLite capabilities, apply pending
/// migrations, and bootstrap the archive's singleton facts.
pub(crate) fn configure_connection(conn: &mut Connection) -> Result<(), HistoryError> {
    conn.execute_batch(&format!("PRAGMA busy_timeout={BUSY_TIMEOUT_MS};"))?;
    set_wal(conn)?;
    conn.execute_batch("PRAGMA synchronous=FULL;")?;
    conn.pragma_update(None, "foreign_keys", true)?;
    assert_capabilities(conn)?;
    apply_migrations(conn)?;
    bootstrap(conn)
}

/// Prove FTS5 and the exact contentless-delete form the schema declares.
///
/// The probe builds and exercises a `temp` table: it never writes to the
/// archive, so a build without the capability leaves no half-made schema.
pub(crate) fn assert_capabilities(conn: &Connection) -> Result<(), HistoryError> {
    conn.execute_batch(
        "CREATE VIRTUAL TABLE temp.history_capability_probe USING fts5(t);
         DROP TABLE temp.history_capability_probe;",
    )
    .map_err(|_| HistoryError::MissingCapability {
        capability: "fts5".to_owned(),
    })?;
    // Contentless FTS5 with row deletion is not optional: staging cleanup
    // and index rebuilds both remove rows by rowid, and an index that can
    // only grow would advertise reclaimed content as still searchable.
    conn.execute_batch(
        "CREATE VIRTUAL TABLE temp.history_capability_probe
           USING fts5(t, content='', contentless_delete=1);
         INSERT INTO temp.history_capability_probe(rowid, t) VALUES (1, 'probe');
         DELETE FROM temp.history_capability_probe WHERE rowid = 1;
         DROP TABLE temp.history_capability_probe;",
    )
    .map_err(|_| HistoryError::MissingCapability {
        capability: "fts5:contentless_delete".to_owned(),
    })
}

/// Issue `PRAGMA journal_mode=WAL`, retrying on busy until the busy-timeout
/// window has elapsed.
fn set_wal(conn: &Connection) -> Result<(), HistoryError> {
    let deadline = std::time::Duration::from_millis(BUSY_TIMEOUT_MS as u64);
    let started = std::time::Instant::now();
    loop {
        let attempt: Result<String, rusqlite::Error> =
            conn.query_row("PRAGMA journal_mode=WAL", [], |row| row.get(0));
        match attempt {
            Ok(mode) if mode.eq_ignore_ascii_case("wal") => return Ok(()),
            Ok(mode) => return Err(internal(format!("journal_mode is {mode:?}, not wal"))),
            Err(err) if is_busy_error(&err) && started.elapsed() < deadline => continue,
            Err(err) => return Err(err.into()),
        }
    }
}

/// Apply every migration whose index exceeds `user_version`, atomically.
fn apply_migrations(conn: &mut Connection) -> Result<(), HistoryError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    // Re-read AFTER taking the write lock: the loser of a concurrent open
    // observes the winner's user_version and applies nothing.
    let applied: i64 = tx.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    let embedded = SCHEMA_VERSION;
    if applied > embedded {
        return Err(internal(format!(
            "history.db was written by a newer forged (user_version {applied}, embedded {embedded})"
        )));
    }
    for (idx, ddl) in MIGRATIONS.iter().enumerate() {
        let index = idx as i64 + 1;
        if index > applied {
            tx.execute_batch(ddl)?;
        }
    }
    if applied < embedded {
        tx.execute_batch(&format!("PRAGMA user_version={embedded};"))?;
    }
    tx.commit()?;
    Ok(())
}

/// Establish the singleton facts every archive needs, idempotently.
///
/// The current `host_id` is generated ONCE and never re-derived: session
/// identity is `(host_id, source_family, native_session_id)`, so a host id
/// that changed between opens would fork every session in the archive.
fn bootstrap(conn: &mut Connection) -> Result<(), HistoryError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let now = now_iso();
    let existing: Option<String> = tx
        .query_row(
            "SELECT value FROM history_meta WHERE key = 'host_id'",
            [],
            |row| row.get(0),
        )
        .ok();
    if existing.is_none() {
        let host_id = uuid::Uuid::now_v7().to_string();
        tx.execute(
            "INSERT INTO hosts (host_id, is_current, label, created_at)
             VALUES (?1, 1, NULL, ?2)",
            rusqlite::params![host_id, now],
        )?;
        tx.execute(
            "INSERT INTO history_meta (key, value, updated_at)
             VALUES ('host_id', ?1, ?2)",
            rusqlite::params![host_id, now],
        )?;
    }
    // The live-maintained generation stands complete from the first open:
    // ingestion writes straight into it, so search is usable before any
    // rebuild has ever run.
    let generations: i64 = tx.query_row("SELECT COUNT(*) FROM index_generations", [], |row| {
        row.get(0)
    })?;
    if generations == 0 {
        tx.execute(
            "INSERT INTO index_generations
               (kind, state, resume_after_chunk_id, indexed_chunks,
                started_at, completed_at, note)
             VALUES ('fts5', 'complete', 0, 0, ?1, ?1,
                     'live-maintained generation established at first open')",
            rusqlite::params![now],
        )?;
    }
    tx.commit()?;
    Ok(())
}

/// Every table the v1 schema owns, for the enumeration test and for the
/// `state.db` separation proof.
pub(crate) const HISTORY_TABLES: &[&str] = &[
    "history_meta",
    "hosts",
    "source_roots",
    "source_files",
    "source_cursors",
    "source_runs",
    "sessions",
    "session_observations",
    "events",
    "event_revisions",
    "archive_blocks",
    "event_parts",
    "search_chunks",
    "search_fts",
    "index_generations",
    "usage_facts",
    "attempt_links",
    "purge_tombstones",
];

/// Every named index the v1 schema owns.
pub(crate) const HISTORY_INDEXES: &[&str] = &[
    "hosts_single_current",
    "sessions_repository",
    "event_revisions_ordinal",
    "event_revisions_content",
    "event_revisions_staging",
    "event_revisions_session",
    "event_revisions_occurred",
    "archive_blocks_reclaimable",
    "event_parts_block",
    "search_chunks_committed",
    "index_generations_single_complete",
    "index_generations_single_building",
    "usage_facts_session",
    "attempt_links_value",
];

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rebuild::SEARCH_FTS_DDL;

    #[test]
    fn the_schema_and_the_rebuild_declare_the_same_index() {
        // A migration is frozen text and a rebuild recreates the table from
        // live code. If those two drift, a rebuilt index silently stops being
        // the index the schema promised.
        assert!(
            MIGRATION_001.contains(SEARCH_FTS_DDL),
            "migration 001 must declare exactly {SEARCH_FTS_DDL}"
        );
    }

    #[test]
    fn the_schema_version_counts_the_embedded_migrations() {
        assert_eq!(SCHEMA_VERSION, MIGRATIONS.len() as i64);
        assert_eq!(SCHEMA_VERSION, 2);
    }

    #[test]
    fn the_busy_timeout_matches_the_contract() {
        assert_eq!(BUSY_TIMEOUT_MS, 5000);
    }
}
