//! Independent history schema and ordered atomic migration.

use std::time::Duration;

use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};

use crate::error::{internal, HistoryError};
use crate::path::SecureConnection;
use crate::time::now_timestamp;

pub(crate) const BUSY_TIMEOUT_MS: u64 = 5_000;
pub(crate) const HISTORY_APPLICATION_ID: i64 = 0x4849_5354; // "HIST"
pub(crate) const SCHEMA_VERSION: i64 = 1;

const MIGRATION_001: &str = r#"
CREATE TABLE history_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE history_hosts (
  host_id    TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE history_source_roots (
  source_root_id INTEGER PRIMARY KEY,
  host_id        TEXT NOT NULL REFERENCES history_hosts(host_id),
  source_family  TEXT NOT NULL CHECK (source_family IN ('claude_code','codex','pi')),
  root_path      TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  UNIQUE(host_id, source_family, root_path)
);

CREATE TABLE history_source_files (
  source_file_id INTEGER PRIMARY KEY,
  source_root_id INTEGER NOT NULL REFERENCES history_source_roots(source_root_id),
  file_path      TEXT NOT NULL,
  state          TEXT NOT NULL CHECK (state IN ('present','missing')),
  first_seen_at  TEXT NOT NULL,
  last_seen_at   TEXT NOT NULL,
  UNIQUE(source_root_id, file_path)
);
CREATE INDEX history_source_files_state
  ON history_source_files(state, source_file_id);

CREATE TABLE history_source_cursors (
  source_file_id INTEGER PRIMARY KEY REFERENCES history_source_files(source_file_id),
  cursor_value   TEXT NOT NULL,
  revision_id    INTEGER,
  updated_at     TEXT NOT NULL
);

CREATE TABLE history_sync_runs (
  sync_run_id   INTEGER PRIMARY KEY,
  source_root_id INTEGER NOT NULL REFERENCES history_source_roots(source_root_id),
  state         TEXT NOT NULL CHECK (state IN ('running','completed','failed')),
  parser_version TEXT NOT NULL,
  started_at    TEXT NOT NULL,
  completed_at  TEXT
);

CREATE TABLE history_sessions (
  session_id        INTEGER PRIMARY KEY,
  host_id           TEXT NOT NULL REFERENCES history_hosts(host_id),
  source_family     TEXT NOT NULL CHECK (source_family IN ('claude_code','codex','pi')),
  native_session_id TEXT NOT NULL,
  observed_cwd      TEXT,
  repository_path   TEXT,
  started_at        TEXT,
  ended_at          TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  UNIQUE(host_id, source_family, native_session_id)
);
CREATE INDEX history_sessions_repository
  ON history_sessions(repository_path, session_id);
CREATE INDEX history_sessions_started
  ON history_sessions(started_at, session_id);

CREATE TABLE history_observations (
  observation_id INTEGER PRIMARY KEY,
  session_id     INTEGER NOT NULL REFERENCES history_sessions(session_id),
  source_file_id INTEGER NOT NULL REFERENCES history_source_files(source_file_id),
  first_seen_at  TEXT NOT NULL,
  last_seen_at   TEXT NOT NULL,
  UNIQUE(session_id, source_file_id)
);

CREATE TABLE history_events (
  event_id            INTEGER PRIMARY KEY,
  session_id          INTEGER NOT NULL REFERENCES history_sessions(session_id),
  event_key           TEXT NOT NULL,
  native_event_key    TEXT,
  current_revision_id INTEGER,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  UNIQUE(session_id, event_key)
);
CREATE INDEX history_events_session ON history_events(session_id, event_id);

CREATE TABLE history_event_revisions (
  revision_id       INTEGER PRIMARY KEY,
  staging_token     TEXT NOT NULL UNIQUE,
  event_id          INTEGER REFERENCES history_events(event_id),
  revision_no       INTEGER,
  fingerprint       TEXT,
  raw_sha256        TEXT,
  raw_length        INTEGER,
  parser_version    TEXT NOT NULL,
  occurred_at       TEXT NOT NULL,
  role              TEXT CHECK (role IN ('system','developer','user','assistant','tool')),
  model             TEXT,
  visibility        TEXT NOT NULL CHECK (visibility IN ('staging','committed')),
  created_at        TEXT NOT NULL,
  committed_at      TEXT,
  CHECK ((visibility = 'staging' AND event_id IS NULL AND revision_no IS NULL
          AND fingerprint IS NULL AND committed_at IS NULL)
      OR (visibility = 'committed' AND event_id IS NOT NULL AND revision_no > 0
          AND fingerprint IS NOT NULL AND committed_at IS NOT NULL)),
  UNIQUE(event_id, revision_no),
  UNIQUE(event_id, fingerprint)
);
CREATE INDEX history_revisions_visibility
  ON history_event_revisions(visibility, revision_id);
CREATE INDEX history_revisions_time
  ON history_event_revisions(occurred_at, revision_id);

CREATE TABLE history_revision_metadata (
  revision_id INTEGER NOT NULL REFERENCES history_event_revisions(revision_id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  value       TEXT NOT NULL,
  PRIMARY KEY(revision_id, name)
) WITHOUT ROWID;

CREATE TABLE history_event_lineage (
  revision_id INTEGER NOT NULL REFERENCES history_event_revisions(revision_id) ON DELETE CASCADE,
  sequence    INTEGER NOT NULL CHECK (sequence >= 0),
  name        TEXT NOT NULL,
  value       TEXT NOT NULL,
  PRIMARY KEY(revision_id, sequence)
) WITHOUT ROWID;

CREATE TABLE history_archive_blocks (
  block_id            INTEGER PRIMARY KEY,
  codec               TEXT NOT NULL CHECK (codec = 'zstd'),
  codec_schema        INTEGER NOT NULL CHECK (codec_schema = 1),
  uncompressed_length INTEGER NOT NULL CHECK (uncompressed_length >= 0),
  sha256              TEXT NOT NULL,
  compressed_bytes    BLOB NOT NULL,
  reference_count     INTEGER NOT NULL DEFAULT 0 CHECK (reference_count >= 0),
  UNIQUE(sha256, uncompressed_length)
);

CREATE TABLE history_event_parts (
  revision_id         INTEGER NOT NULL REFERENCES history_event_revisions(revision_id) ON DELETE CASCADE,
  sequence            INTEGER NOT NULL CHECK (sequence >= 0),
  byte_offset         INTEGER NOT NULL CHECK (byte_offset >= 0),
  uncompressed_length INTEGER NOT NULL CHECK (uncompressed_length >= 0),
  block_id            INTEGER NOT NULL REFERENCES history_archive_blocks(block_id),
  PRIMARY KEY(revision_id, sequence),
  UNIQUE(revision_id, byte_offset)
) WITHOUT ROWID;
CREATE INDEX history_event_parts_block ON history_event_parts(block_id);

CREATE TRIGGER history_event_part_reference_insert
AFTER INSERT ON history_event_parts BEGIN
  UPDATE history_archive_blocks
     SET reference_count = reference_count + 1
   WHERE block_id = NEW.block_id;
END;

CREATE TRIGGER history_event_part_reference_delete
AFTER DELETE ON history_event_parts BEGIN
  UPDATE history_archive_blocks
     SET reference_count = reference_count - 1
   WHERE block_id = OLD.block_id;
  DELETE FROM history_archive_blocks
   WHERE block_id = OLD.block_id AND reference_count = 0;
END;

CREATE TABLE history_search_chunks (
  chunk_id            INTEGER PRIMARY KEY,
  revision_id         INTEGER NOT NULL REFERENCES history_event_revisions(revision_id) ON DELETE CASCADE,
  sequence            INTEGER NOT NULL CHECK (sequence >= 0),
  uncompressed_length INTEGER NOT NULL CHECK (uncompressed_length >= 0),
  sha256              TEXT NOT NULL,
  compressed_bytes    BLOB NOT NULL,
  UNIQUE(revision_id, sequence)
);
CREATE INDEX history_search_chunks_revision
  ON history_search_chunks(revision_id, chunk_id);

CREATE TABLE history_search_fences (
  revision_id INTEGER PRIMARY KEY
              REFERENCES history_event_revisions(revision_id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE history_search_fts USING fts5(
  text,
  content='',
  contentless_delete=1,
  tokenize='unicode61'
);

CREATE TABLE history_index_generations (
  generation_id TEXT PRIMARY KEY,
  state         TEXT NOT NULL CHECK (state IN ('building','ready')),
  indexed_count INTEGER NOT NULL DEFAULT 0 CHECK (indexed_count >= 0),
  started_at    TEXT NOT NULL,
  completed_at  TEXT
);
CREATE UNIQUE INDEX history_one_ready_generation
  ON history_index_generations(state) WHERE state = 'ready';

CREATE TABLE history_fts_membership (
  generation_id TEXT NOT NULL REFERENCES history_index_generations(generation_id) ON DELETE CASCADE,
  chunk_id      INTEGER NOT NULL REFERENCES history_search_chunks(chunk_id) ON DELETE CASCADE,
  PRIMARY KEY(generation_id, chunk_id)
) WITHOUT ROWID;
CREATE INDEX history_fts_membership_chunk
  ON history_fts_membership(chunk_id, generation_id);

CREATE TABLE history_usage_evidence (
  usage_id           INTEGER PRIMARY KEY,
  revision_id        INTEGER NOT NULL REFERENCES history_event_revisions(revision_id) ON DELETE CASCADE,
  sequence           INTEGER NOT NULL CHECK (sequence >= 0),
  provider           TEXT NOT NULL,
  model              TEXT NOT NULL,
  input_tokens       INTEGER NOT NULL CHECK (input_tokens >= 0),
  output_tokens      INTEGER NOT NULL CHECK (output_tokens >= 0),
  cache_read_tokens  INTEGER CHECK (cache_read_tokens >= 0),
  cache_write_tokens INTEGER CHECK (cache_write_tokens >= 0),
  cost_usd           REAL,
  observed_at        TEXT NOT NULL,
  UNIQUE(revision_id, sequence)
);
CREATE INDEX history_usage_model_time
  ON history_usage_evidence(model, observed_at, usage_id);

CREATE TABLE history_attempt_links (
  revision_id INTEGER NOT NULL REFERENCES history_event_revisions(revision_id) ON DELETE CASCADE,
  run_id      TEXT NOT NULL,
  attempt_id  INTEGER,
  PRIMARY KEY(revision_id, run_id, attempt_id)
) WITHOUT ROWID;

CREATE TABLE history_purge_tombstones (
  tombstone_id INTEGER PRIMARY KEY,
  scope        TEXT NOT NULL CHECK (scope IN ('source_file','session','revision')),
  scope_key    TEXT NOT NULL,
  sha256       TEXT NOT NULL,
  reason       TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  UNIQUE(scope, scope_key)
);
"#;

pub(crate) fn configure_connection(
    mut secure: SecureConnection,
) -> Result<Connection, HistoryError> {
    secure
        .connection
        .busy_timeout(Duration::from_millis(BUSY_TIMEOUT_MS))?;
    refuse_foreign_database(&secure.connection)?;
    prove_fts_capabilities(&secure.connection)?;

    let journal_mode: String =
        secure
            .connection
            .query_row("PRAGMA journal_mode=WAL", [], |row| row.get(0))?;
    if !journal_mode.eq_ignore_ascii_case("wal") {
        return Err(internal(format!(
            "history database did not enter WAL mode: {journal_mode:?}"
        )));
    }
    secure.connection.execute_batch(
        "PRAGMA foreign_keys=ON;
         PRAGMA synchronous=FULL;",
    )?;
    migrate(&mut secure.connection)?;
    secure.verify_identity()?;
    validate_database_file_configuration(&secure.connection)?;
    Ok(secure.into_connection())
}

fn refuse_foreign_database(connection: &Connection) -> Result<(), HistoryError> {
    let application_id: i64 =
        connection.query_row("PRAGMA application_id", [], |row| row.get(0))?;
    if application_id == HISTORY_APPLICATION_ID {
        return Ok(());
    }
    let object_count: i64 = connection.query_row(
        "SELECT count(*) FROM sqlite_schema
          WHERE name NOT LIKE 'sqlite_%'",
        [],
        |row| row.get(0),
    )?;
    let user_version: i64 = connection.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    if application_id != 0 || user_version != 0 || object_count != 0 {
        return Err(internal(format!(
            "refusing non-history SQLite database (application_id={application_id}, user_version={user_version}, objects={object_count})"
        )));
    }
    Ok(())
}

fn prove_fts_capabilities(connection: &Connection) -> Result<(), HistoryError> {
    connection
        .execute_batch(
            "CREATE VIRTUAL TABLE temp.history_fts_capability USING fts5(
               text, content='', contentless_delete=1
             );
             INSERT INTO temp.history_fts_capability(rowid, text) VALUES (1, 'probe');
             DELETE FROM temp.history_fts_capability WHERE rowid = 1;
             DROP TABLE temp.history_fts_capability;",
        )
        .map_err(|error| {
            internal(format!(
                "bundled SQLite lacks required FTS5 contentless-delete support: {error}"
            ))
        })
}

fn migrate(connection: &mut Connection) -> Result<(), HistoryError> {
    let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let version: i64 = transaction.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    match version {
        0 => {
            transaction.execute_batch(MIGRATION_001)?;
            let host_id = uuid::Uuid::now_v7().to_string();
            let generation = uuid::Uuid::now_v7().to_string();
            let now = now_timestamp();
            transaction.execute(
                "INSERT INTO history_hosts(host_id, created_at) VALUES (?1, ?2)",
                params![host_id, now],
            )?;
            transaction.execute(
                "INSERT INTO history_meta(key, value) VALUES
                   ('host_id', ?1),
                   ('corpus_epoch', '0'),
                   ('active_generation', ?2)",
                params![host_id, generation],
            )?;
            transaction.execute(
                "INSERT INTO history_index_generations(
                   generation_id, state, indexed_count, started_at, completed_at
                 ) VALUES (?1, 'ready', 0, ?2, ?2)",
                params![generation, now],
            )?;
            transaction.pragma_update(None, "application_id", HISTORY_APPLICATION_ID)?;
            transaction.pragma_update(None, "user_version", SCHEMA_VERSION)?;
        }
        SCHEMA_VERSION => {}
        other => {
            return Err(internal(format!(
                "unknown history schema version {other}; supported version is {SCHEMA_VERSION}"
            )))
        }
    }
    transaction.commit()?;
    Ok(())
}

fn validate_database_file_configuration(connection: &Connection) -> Result<(), HistoryError> {
    let foreign_keys: i64 = connection.query_row("PRAGMA foreign_keys", [], |row| row.get(0))?;
    let busy_timeout: i64 = connection.query_row("PRAGMA busy_timeout", [], |row| row.get(0))?;
    let application_id: i64 =
        connection.query_row("PRAGMA application_id", [], |row| row.get(0))?;
    if foreign_keys != 1
        || busy_timeout != i64::try_from(BUSY_TIMEOUT_MS).unwrap_or(i64::MAX)
        || application_id != HISTORY_APPLICATION_ID
    {
        return Err(internal("history SQLite connection configuration drifted"));
    }
    Ok(())
}

pub(crate) fn active_generation(
    connection: &Connection,
) -> Result<Option<(String, String)>, HistoryError> {
    connection
        .query_row(
            "SELECT g.generation_id, g.state
               FROM history_meta m
               JOIN history_index_generations g ON g.generation_id = m.value
              WHERE m.key = 'active_generation'",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::path::{secure_open, OpenMode};

    #[test]
    fn schema_has_every_history_object_and_fts_capability() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let secure = secure_open(&path, OpenMode::Create).unwrap().unwrap();
        let connection = configure_connection(secure).unwrap();
        let mut names = connection
            .prepare(
                "SELECT name FROM sqlite_schema
                  WHERE name LIKE 'history_%' AND type IN ('table','index','trigger')
                  ORDER BY name",
            )
            .unwrap()
            .query_map([], |row| row.get::<_, String>(0))
            .unwrap()
            .collect::<rusqlite::Result<Vec<_>>>()
            .unwrap();
        names.dedup();
        for required in [
            "history_archive_blocks",
            "history_attempt_links",
            "history_event_lineage",
            "history_event_parts",
            "history_event_revisions",
            "history_events",
            "history_fts_membership",
            "history_hosts",
            "history_index_generations",
            "history_meta",
            "history_observations",
            "history_purge_tombstones",
            "history_revision_metadata",
            "history_search_chunks",
            "history_search_fences",
            "history_search_fts",
            "history_sessions",
            "history_source_cursors",
            "history_source_files",
            "history_source_roots",
            "history_sync_runs",
            "history_usage_evidence",
        ] {
            assert!(names.iter().any(|name| name == required), "{required}");
        }
        prove_fts_capabilities(&connection).unwrap();
    }

    #[test]
    fn a_separate_state_database_gets_no_history_objects() {
        let scratch = crate::test_scratch();
        let state = scratch.path().join("state.db");
        let connection = Connection::open(&state).unwrap();
        connection
            .execute("CREATE TABLE runs(run_id TEXT PRIMARY KEY)", [])
            .unwrap();
        let count: i64 = connection
            .query_row(
                "SELECT count(*) FROM sqlite_schema WHERE name LIKE 'history_%'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }
}
