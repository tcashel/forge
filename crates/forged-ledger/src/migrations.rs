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
use crate::ledger::Ledger;
use crate::time::now_iso;

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

/// Migration 003: fence explicit roster revisions by operation identity.
const MIGRATION_003: &str = "
ALTER TABLE roster_revisions ADD COLUMN operation_id TEXT;
CREATE UNIQUE INDEX roster_revision_operation
  ON roster_revisions(operation_id) WHERE operation_id IS NOT NULL;
";

/// Migration 004: append-only overlays for execution packages written before
/// policy became part of the hashed package schema.
const MIGRATION_004: &str = "
CREATE TABLE run_package_migrations (
  run_id                 TEXT PRIMARY KEY REFERENCES run_definitions(run_id),
  previous_package_sha256 TEXT NOT NULL,
  package_sha256         TEXT NOT NULL,
  package_json           TEXT NOT NULL,
  created_at             TEXT NOT NULL
);
CREATE TABLE runtime_migrations (
  name         TEXT PRIMARY KEY,
  completed_at TEXT NOT NULL
);
CREATE INDEX events_kind_run ON events(kind, run_id, event_id);
";

/// Migration 005: a natural key for usage.
///
/// Usage is captured when an attempt settles and can be re-derived from the
/// same packet directory afterwards by `usage ingest`. Without a natural key
/// the second read duplicates the first, so idempotency had to be borrowed
/// from the operation fence — which keys per run and therefore refuses the
/// second ingest outright, leaving later rounds uncounted. The key makes
/// re-recording a no-op at the storage layer instead.
///
/// `COALESCE` because SQLite treats NULLs in a unique index as distinct,
/// which would let unattributed rows duplicate freely.
const MIGRATION_005: &str = "
CREATE UNIQUE INDEX usage_natural_key ON usage(
  run_id, COALESCE(packet_id, ''), COALESCE(attempt_id, -1), provider, model
);
";

/// Migration 006: server-side tool calls, billed per call rather than per
/// token. Kept out of the token columns because it is a different unit and
/// a different rate; folding it in would corrupt every token aggregate.
const MIGRATION_006: &str = "
ALTER TABLE usage ADD COLUMN web_search_requests INTEGER;
";

/// Migration 007: the bead revision a packet's spec is pinned to.
///
/// NULL means file-sourced — every packet opened before this column existed,
/// plus the deprecated `--spec <path>` route — and those keep `spec_sha256`
/// as their fence. A non-NULL revision IS the fence: bd's opaque
/// guarded-write token, compared for equality and never ordered.
const MIGRATION_007: &str = "
ALTER TABLE packets ADD COLUMN spec_revision TEXT;
";

/// Migration 008: `stopped`, the attempt-local terminal exit from
/// `revoking`.
///
/// A CHECK constraint cannot be widened in place, so the table is rebuilt by
/// SQLite's documented procedure. No other table references `attempts`, so
/// the drop-and-rename carries no foreign key with it; the partial unique
/// index is recreated with its predicate UNCHANGED — `stopped` is terminal
/// and deliberately not live.
const MIGRATION_008: &str = "
CREATE TABLE attempts_008 (
  attempt_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id         TEXT NOT NULL REFERENCES packets(packet_id),
  claim_token       TEXT NOT NULL UNIQUE,
  claimant          TEXT NOT NULL,
  state             TEXT NOT NULL CHECK (state IN
                    ('running','completed','failed','revoking','reclaimed',
                     'stopped')),
  revoke_reason     TEXT,
  fail_note         TEXT,
  result_json       TEXT,
  started_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  last_heartbeat_at TEXT,
  ended_at          TEXT
);
INSERT INTO attempts_008 (attempt_id, packet_id, claim_token, claimant, state,
                          revoke_reason, fail_note, result_json, started_at,
                          updated_at, last_heartbeat_at, ended_at)
  SELECT attempt_id, packet_id, claim_token, claimant, state,
         revoke_reason, fail_note, result_json, started_at,
         updated_at, last_heartbeat_at, ended_at
  FROM attempts;
DROP TABLE attempts;
ALTER TABLE attempts_008 RENAME TO attempts;
CREATE UNIQUE INDEX one_live_attempt_per_packet
  ON attempts(packet_id) WHERE state IN ('running','revoking');
";

/// Migration 009: `revoke_scope`, the durable record of WHOSE revocation a
/// `revoking` marker is.
///
/// A plain ADD COLUMN, deliberately: the CHECK belongs to the decoder, which
/// fails closed on an unrecognized string exactly as `attempts.state` does,
/// and a second table rebuild would be a second chance to lose rows. Every
/// pre-009 row reads NULL, which routes as `bead` — the attempt-local stop
/// did not exist when those rows were written.
const MIGRATION_009: &str = "
ALTER TABLE attempts ADD COLUMN revoke_scope TEXT;
";

/// Embedded ordered migrations; `user_version` records the last applied index.
const MIGRATIONS: &[&str] = &[
    MIGRATION_001,
    MIGRATION_002,
    MIGRATION_003,
    MIGRATION_004,
    MIGRATION_005,
    MIGRATION_006,
    MIGRATION_007,
    MIGRATION_008,
    MIGRATION_009,
];

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

impl Ledger {
    /// Whether a config-aware runtime migration has completed.
    pub fn runtime_migration_completed(&self, name: &str) -> Result<bool, LedgerError> {
        let name = name.to_owned();
        self.submit(move |conn| {
            conn.query_row(
                "SELECT EXISTS(SELECT 1 FROM runtime_migrations WHERE name = ?1)",
                [name],
                |row| row.get(0),
            )
            .map_err(Into::into)
        })
    }

    /// Mark a config-aware runtime migration complete, idempotently.
    pub fn mark_runtime_migration_completed(&self, name: &str) -> Result<bool, LedgerError> {
        let name = name.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let inserted = tx.execute(
                "INSERT OR IGNORE INTO runtime_migrations (name, completed_at) VALUES (?1, ?2)",
                rusqlite::params![name, now_iso()],
            )?;
            tx.commit()?;
            Ok(inserted == 1)
        })
    }
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
        assert_eq!(pragmas.user_version, 9);
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
            "run_package_migrations",
            "roster_revisions",
            "runtime_migrations",
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
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 9);
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
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 9);
        assert_eq!(
            ledger.get_run("old-run").expect("old run").bead_id,
            "old-bead"
        );
        assert!(ledger
            .get_run_definition("old-run")
            .expect("legacy definition query")
            .is_none());
    }

    /// Migration 008 rebuilds `attempts` to widen a CHECK constraint. A
    /// rebuild is the one migration shape that can lose rows, drop an index,
    /// or reset an AUTOINCREMENT sequence, so a populated pre-008 database
    /// is the only honest test of it.
    #[test]
    fn the_attempts_rebuild_keeps_rows_index_and_sequence() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            conn.execute_batch(MIGRATION_001).expect("v0 schema");
            conn.execute_batch(
                "INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, created_at, \
                    updated_at) \
                 VALUES ('old-run', 'old-bead', '/repo', 'main', 'forged/old', 't', 't');
                 INSERT INTO packets (packet_id, run_id, stage, seq, spec_path, spec_sha256, \
                    body_json, created_at) \
                 VALUES ('old-run/implement/1', 'old-run', 'implement', 1, 's.md', 'cafe', \
                    '{}', 't');
                 INSERT INTO attempts (packet_id, claim_token, claimant, state, revoke_reason, \
                    started_at, updated_at, ended_at) \
                 VALUES ('old-run/implement/1', 'tok-1', 'claude:old:1', 'reclaimed', 'stalled', \
                    't', 't', 't');
                 INSERT INTO attempts (packet_id, claim_token, claimant, state, started_at, \
                    updated_at) \
                 VALUES ('old-run/implement/1', 'tok-2', 'claude:old:2', 'running', 't', 't');
                 PRAGMA user_version=1;",
            )
            .expect("seed a pre-008 database");
        }

        let ledger = Ledger::open(&path).expect("migrate");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 9);
        let first = ledger.get_attempt(1).expect("attempt 1 survived");
        assert_eq!(first.claim_token, "tok-1");
        assert_eq!(first.state, crate::AttemptState::Reclaimed);
        assert_eq!(first.revoke_reason.as_deref(), Some("stalled"));
        let live = ledger.list_live_attempts(Some("old-run")).expect("live");
        assert_eq!(live.len(), 1);
        assert_eq!(live[0].claim_token, "tok-2");
        ledger.close().expect("close");

        let conn = rusqlite::Connection::open(&path).expect("open raw");
        // The partial unique index is recreated with its predicate intact:
        // `stopped` is terminal and deliberately NOT live.
        let predicate: String = conn
            .query_row(
                "SELECT sql FROM sqlite_master WHERE type='index' AND name = ?",
                ["one_live_attempt_per_packet"],
                |row| row.get(0),
            )
            .expect("partial index survived the rebuild");
        assert!(
            predicate.contains("'running','revoking'") && !predicate.contains("stopped"),
            "unexpected index predicate: {predicate}"
        );
        // AUTOINCREMENT never hands back an id the rebuild copied over.
        let next: i64 = conn
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name = 'attempts'",
                [],
                |row| row.get(0),
            )
            .expect("sequence survived the rename");
        assert_eq!(next, 2);
        // The widened CHECK admits `stopped` and nothing beyond the six.
        conn.execute(
            "UPDATE attempts SET state = 'stopped' WHERE attempt_id = 2",
            [],
        )
        .expect("stopped is a legal state after 008");
        conn.execute(
            "UPDATE attempts SET state = 'zombie' WHERE attempt_id = 2",
            [],
        )
        .expect_err("the CHECK still fails closed");
    }

    /// Migration 009 adds `revoke_scope` to rows that already exist. Every
    /// one of them reads `None`, which routes as the reclaim saga — the only
    /// revocation there was when they were written.
    #[test]
    fn a_pre_009_revoking_row_carries_no_scope() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            conn.execute_batch(MIGRATION_001).expect("v0 schema");
            conn.execute_batch(
                "INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, created_at, \
                    updated_at) \
                 VALUES ('old-run', 'old-bead', '/repo', 'main', 'forged/old', 't', 't');
                 INSERT INTO packets (packet_id, run_id, stage, seq, spec_path, spec_sha256, \
                    body_json, created_at) \
                 VALUES ('old-run/implement/1', 'old-run', 'implement', 1, 's.md', 'cafe', \
                    '{}', 't');
                 INSERT INTO attempts (packet_id, claim_token, claimant, state, revoke_reason, \
                    started_at, updated_at) \
                 VALUES ('old-run/implement/1', 'tok-1', 'claude:old:1', 'revoking', 'vanished', \
                    't', 't');
                 PRAGMA user_version=1;",
            )
            .expect("seed a pre-009 database");
        }

        let ledger = Ledger::open(&path).expect("migrate");
        let row = ledger.get_attempt(1).expect("the revoking row survived");
        assert_eq!(row.state, crate::AttemptState::Revoking);
        assert_eq!(row.revoke_scope, None);
        // And a scope written now round-trips, so the column is real.
        ledger.mark_reclaimed(1).expect("finish the saga");
        ledger.close().expect("close");
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
