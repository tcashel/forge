//! Embedded ordered migrations, tracked via `PRAGMA user_version`.
//!
//! `configure_connection` sets `busy_timeout` before any other pragma, issues
//! `journal_mode=WAL` outside the migration transaction (retrying on
//! `SQLITE_BUSY` until the busy timeout elapses), then applies pending
//! migrations inside a single `BEGIN IMMEDIATE` transaction that re-reads
//! `user_version` after taking the write lock — a crash mid-migrate rolls
//! back atomically, and concurrent opens of the same fresh DB are safe.

use rusqlite::{Connection, TransactionBehavior};

use crate::error::{internal, LedgerError};

/// How long a connection waits on a lock before erroring, in milliseconds.
pub(crate) const BUSY_TIMEOUT_MS: i64 = 5000;

/// Migration 001: the full v0 schema.
const MIGRATION_001: &str = "
CREATE TABLE runs (
  run_id      TEXT PRIMARY KEY,
  bead_id     TEXT NOT NULL,
  repo        TEXT NOT NULL,
  base_ref    TEXT NOT NULL,
  branch      TEXT NOT NULL,
  protocol    TEXT NOT NULL DEFAULT 'slice/v1',
  state       TEXT NOT NULL DEFAULT 'active'
              CHECK (state IN ('active','stopped')),
  stop_reason TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE packets (
  packet_id   TEXT PRIMARY KEY,
  run_id      TEXT NOT NULL REFERENCES runs(run_id),
  stage       TEXT NOT NULL CHECK (stage IN
              ('implement','reviewclaude','reviewcodex','fix')),
  seq         INTEGER NOT NULL,
  spec_path   TEXT NOT NULL,
  spec_sha256 TEXT NOT NULL,
  body_json   TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  UNIQUE (run_id, stage, seq)
);

CREATE TABLE attempts (
  attempt_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id         TEXT NOT NULL REFERENCES packets(packet_id),
  claim_token       TEXT NOT NULL UNIQUE,
  claimant          TEXT NOT NULL,
  state             TEXT NOT NULL CHECK (state IN
                    ('running','completed','failed','revoking','reclaimed')),
  revoke_reason     TEXT,
  fail_note         TEXT,
  result_json       TEXT,
  started_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  last_heartbeat_at TEXT,
  ended_at          TEXT
);
CREATE UNIQUE INDEX one_live_attempt_per_packet
  ON attempts(packet_id) WHERE state IN ('running','revoking');

CREATE TABLE operations (
  operation_id    TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_sha256  TEXT NOT NULL,
  effect_class    TEXT NOT NULL CHECK (effect_class IN
                  ('safe-retry','observe-only','human-ambiguous')),
  run_id          TEXT,
  claim_token     TEXT,
  state           TEXT NOT NULL CHECK (state IN ('in_progress','terminal')),
  response_json   TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  UNIQUE (name, idempotency_key)
);

CREATE TABLE merge_slots (
  slot        TEXT PRIMARY KEY,
  holder      TEXT NOT NULL,
  acquired_at TEXT NOT NULL
);

CREATE TABLE events (
  event_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           TEXT NOT NULL,
  run_id       TEXT,
  kind         TEXT NOT NULL,
  payload_json TEXT NOT NULL
);

CREATE TABLE usage (
  usage_id                INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id                  TEXT NOT NULL,
  packet_id               TEXT,
  attempt_id              INTEGER,
  provider                TEXT NOT NULL,
  model                   TEXT NOT NULL,
  input_tokens            INTEGER NOT NULL,
  output_tokens           INTEGER NOT NULL,
  cache_read_tokens       INTEGER,
  cache_write_tokens      INTEGER,
  cost_usd                REAL,
  pricing_basis           TEXT,
  rate_limit_used_percent REAL,
  ts                      TEXT NOT NULL
);
";

/// Migration 002: immutable run definitions and append-only roster history.
const MIGRATION_002: &str = "
CREATE TABLE run_definitions (
  run_id                    TEXT PRIMARY KEY REFERENCES runs(run_id),
  protocol_ref_json         TEXT NOT NULL,
  profile_ref_json          TEXT NOT NULL,
  roster_ref_json           TEXT NOT NULL,
  package_sha256            TEXT NOT NULL,
  profile_sha256            TEXT NOT NULL,
  roster_sha256             TEXT NOT NULL,
  package_json              TEXT NOT NULL,
  compatibility_roster_json TEXT NOT NULL,
  created_at                TEXT NOT NULL
);

CREATE TABLE roster_revisions (
  run_id        TEXT NOT NULL REFERENCES runs(run_id),
  revision      INTEGER NOT NULL CHECK (revision > 0),
  roster_ref_json TEXT NOT NULL,
  roster_sha256 TEXT NOT NULL,
  roster_json   TEXT NOT NULL,
  reason        TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  PRIMARY KEY (run_id, revision)
);
";

/// Embedded ordered migrations; `user_version` records the last applied index.
const MIGRATIONS: &[&str] = &[MIGRATION_001, MIGRATION_002];

/// Configure pragmas and apply pending migrations on a fresh connection.
pub(crate) fn configure_connection(conn: &mut Connection) -> Result<(), LedgerError> {
    // busy_timeout first, before any other pragma.
    conn.execute_batch(&format!("PRAGMA busy_timeout={BUSY_TIMEOUT_MS};"))?;

    // journal_mode=WAL outside the migration transaction, retrying on
    // SQLITE_BUSY until the busy timeout elapses. The pragma returns the
    // resulting mode as a row, so it must be read with query_row.
    set_wal(conn)?;

    conn.execute_batch("PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;")?;

    apply_migrations(conn)
}

/// Issue `PRAGMA journal_mode=WAL`, retrying on busy until the busy timeout
/// window has elapsed.
fn set_wal(conn: &Connection) -> Result<(), LedgerError> {
    let deadline = std::time::Duration::from_millis(BUSY_TIMEOUT_MS as u64);
    let started = std::time::Instant::now();
    loop {
        let attempt: Result<String, rusqlite::Error> =
            conn.query_row("PRAGMA journal_mode=WAL", [], |row| row.get(0));
        match attempt {
            Ok(mode) => {
                if mode.eq_ignore_ascii_case("wal") {
                    return Ok(());
                }
                return Err(internal(format!("journal_mode is {mode:?}, not wal")));
            }
            Err(err) if is_busy(&err) && started.elapsed() < deadline => continue,
            Err(err) => return Err(err.into()),
        }
    }
}

fn is_busy(err: &rusqlite::Error) -> bool {
    matches!(
        err,
        rusqlite::Error::SqliteFailure(e, _)
            if e.code == rusqlite::ErrorCode::DatabaseBusy
                || e.code == rusqlite::ErrorCode::DatabaseLocked
    )
}

/// Apply every migration whose index exceeds `user_version`, atomically.
fn apply_migrations(conn: &mut Connection) -> Result<(), LedgerError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;

    // Re-read AFTER taking the write lock: the loser of a concurrent open
    // observes the winner's user_version and applies nothing.
    let applied: i64 = tx.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    let embedded = MIGRATIONS.len() as i64;
    if applied > embedded {
        return Err(internal(format!(
            "state.db was written by a newer forged (user_version {applied}, embedded {embedded})"
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

#[cfg(test)]
mod tests {
    use super::MIGRATION_001;
    use crate::Ledger;

    #[test]
    fn open_creates_schema_and_configures_pragmas() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = Ledger::open(&path).expect("open");
        assert!(path.exists(), "state.db is created");

        let pragmas = ledger.pragmas().expect("pragmas");
        assert_eq!(pragmas.journal_mode, "wal");
        assert_eq!(pragmas.synchronous, 2);
        assert!(pragmas.foreign_keys);
        assert_eq!(pragmas.busy_timeout_ms, 5000);
        assert_eq!(pragmas.user_version, 2);
        ledger.close().expect("close");

        // Table names via a separate connection: sqlite_master is data, and
        // journal_mode is the only pragma persisted in the file itself.
        let conn = rusqlite::Connection::open(&path).expect("open raw");
        for table in [
            "runs",
            "packets",
            "attempts",
            "operations",
            "merge_slots",
            "events",
            "usage",
            "run_definitions",
            "roster_revisions",
        ] {
            let found: String = conn
                .query_row(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
                    [table],
                    |row| row.get(0),
                )
                .unwrap_or_else(|_| panic!("table {table} missing"));
            assert_eq!(found, table);
        }
        let index: String = conn
            .query_row(
                "SELECT name FROM sqlite_master WHERE type='index' AND name = ?",
                ["one_live_attempt_per_packet"],
                |row| row.get(0),
            )
            .expect("partial index missing");
        assert_eq!(index, "one_live_attempt_per_packet");
    }

    #[test]
    fn reopening_a_migrated_db_is_a_no_op() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        Ledger::open(&path)
            .expect("first open")
            .close()
            .expect("close");
        let ledger = Ledger::open(&path).expect("second open");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 2);
        ledger.close().expect("close");
    }

    #[test]
    fn v0_database_migrates_additively_without_losing_runs() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            conn.execute_batch(MIGRATION_001).expect("v0 schema");
            conn.execute(
                "INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, created_at, updated_at) \
                 VALUES ('old-run', 'old-bead', '/repo', 'main', 'forged/old', 't', 't')",
                [],
            )
            .expect("old run");
            conn.execute_batch("PRAGMA user_version=1;")
                .expect("mark v0");
        }
        let ledger = Ledger::open(&path).expect("migrate");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 2);
        assert_eq!(
            ledger.get_run("old-run").expect("old run").bead_id,
            "old-bead"
        );
        assert!(ledger
            .get_run_definition("old-run")
            .expect("legacy definition query")
            .is_none());
    }

    #[test]
    fn a_newer_db_refuses_with_internal() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("open raw");
            conn.execute_batch("PRAGMA user_version=99;").expect("bump");
        }
        let err = Ledger::open(&path).expect_err("must refuse");
        assert_eq!(err.code(), forged_types::ErrorCode::Internal);
        assert!(
            err.to_string().contains("newer forged"),
            "unexpected message: {err}"
        );
    }
}
