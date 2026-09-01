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

/// Migration 007: the work revision a packet's spec is pinned to.
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

/// Migration 010: explicit whole-run settlement and delivery evidence.
///
/// Existing stopped rows intentionally keep a NULL outcome: they predate the
/// vocabulary and inventing a classification during migration would turn an
/// old process exit into a false delivery claim.
const MIGRATION_010: &str = "
ALTER TABLE runs ADD COLUMN terminal_outcome TEXT CHECK (terminal_outcome IN
  ('clean','blocked','input-required','cancelled','accepted-risk','superseded','landed'));
ALTER TABLE runs ADD COLUMN delivery_pr INTEGER;
ALTER TABLE runs ADD COLUMN delivery_sha TEXT;
ALTER TABLE runs ADD COLUMN superseded_by TEXT;
";

/// Migration 011: operator-authorized desired work and its reconciliation
/// fence. A row exists only after a successful submit; the supervisor never
/// infers authorization from a runnable Work or an existing run row.
const MIGRATION_011: &str = "
CREATE TABLE desired_work (
  subject_kind          TEXT NOT NULL CHECK (subject_kind IN ('run','epic')),
  subject_id            TEXT NOT NULL,
  desired_state         TEXT NOT NULL CHECK (desired_state IN
                        ('running','paused','stopped')),
  control_revision      INTEGER NOT NULL CHECK (control_revision > 0),
  controller_generation INTEGER NOT NULL DEFAULT 0 CHECK (controller_generation >= 0),
  predecessor_generation INTEGER CHECK (predecessor_generation >= 0),
  restart_budget        INTEGER NOT NULL CHECK (restart_budget > 0),
  restart_used          INTEGER NOT NULL DEFAULT 0 CHECK
                        (restart_used >= 0 AND restart_used <= restart_budget),
  next_wake_at          TEXT,
  last_progress_at      TEXT,
  last_outcome          TEXT CHECK (last_outcome IN
                        ('authorized','adopted','restarting','restarted',
                         'backoff','attention','exhausted','paused','stopped',
                         'terminal')),
  last_error            TEXT,
  exhausted_at          TEXT,
  reconcile_token       TEXT,
  reconcile_lease_until TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL,
  PRIMARY KEY (subject_kind, subject_id)
);
CREATE INDEX desired_work_wake
  ON desired_work(desired_state, next_wake_at)
  WHERE desired_state = 'running' AND exhausted_at IS NULL;
";

/// Migration 012: one immutable artifact manifest identity per attempt.
///
/// The redundant run and packet identities are deliberate: the writer
/// checks them against the attempt join before insert, while readers can
/// project artifacts without parsing filesystem JSON. Paths remain relative
/// to the operator run root so relocating an Anvil home preserves identity.
const MIGRATION_012: &str = "
CREATE TABLE attempt_artifacts (
  attempt_id       INTEGER PRIMARY KEY REFERENCES attempts(attempt_id),
  run_id           TEXT NOT NULL REFERENCES runs(run_id),
  packet_id        TEXT NOT NULL REFERENCES packets(packet_id),
  manifest_schema  TEXT NOT NULL CHECK (manifest_schema = 'forged.attempt-artifacts/1'),
  manifest_path    TEXT NOT NULL,
  manifest_sha256  TEXT NOT NULL CHECK (length(manifest_sha256) = 64),
  retention_class  TEXT NOT NULL CHECK (retention_class IN
                    ('retain','compactable-success')),
  created_at       TEXT NOT NULL,
  UNIQUE (run_id, manifest_path)
);
CREATE INDEX attempt_artifacts_run_packet
  ON attempt_artifacts(run_id, packet_id, attempt_id);

CREATE TABLE attempt_artifact_compactions (
  attempt_id       INTEGER PRIMARY KEY REFERENCES attempt_artifacts(attempt_id),
  operation_id     TEXT NOT NULL UNIQUE,
  tombstone_path   TEXT NOT NULL,
  tombstone_sha256 TEXT NOT NULL CHECK (length(tombstone_sha256) = 64),
  state            TEXT NOT NULL CHECK (state IN ('in-progress','completed')),
  bytes_removed    INTEGER,
  created_at       TEXT NOT NULL,
  completed_at     TEXT
);
";

/// Migration 013: deterministic admission evidence and capacity ownership.
///
/// A recovery deadline is deliberately not an expiry. `reserved`, `active`,
/// and `orphaned` rows all consume capacity until an observer either adopts a
/// matching effect or confirms absence and writes `released`.
const MIGRATION_013: &str = "
CREATE TABLE admission_batches (
  batch_id         TEXT PRIMARY KEY,
  schema           TEXT NOT NULL CHECK (schema = 'forged.admission-inputs/1'),
  policy_revision  TEXT NOT NULL,
  ledger_revision  TEXT NOT NULL,
  inputs_sha256    TEXT NOT NULL CHECK (length(inputs_sha256) = 64),
  inputs_json      TEXT NOT NULL,
  as_of            TEXT NOT NULL,
  created_at       TEXT NOT NULL
);

CREATE TABLE admission_decisions (
  decision_id          TEXT PRIMARY KEY,
  batch_id             TEXT NOT NULL REFERENCES admission_batches(batch_id),
  subject_kind         TEXT NOT NULL CHECK (subject_kind IN ('run','epic','packet')),
  subject_id           TEXT NOT NULL,
  control_revision     INTEGER NOT NULL CHECK (control_revision >= 0),
  outcome              TEXT NOT NULL CHECK (outcome IN ('admitted','deferred','ineligible')),
  reason               TEXT NOT NULL CHECK (reason IN
                         ('capacity-available','total-capacity','provider-capacity',
                          'repository-write-capacity','token-ceiling','known-cost-ceiling',
                          'missing-cost','rate-limit-ceiling','stale-rate-limit',
                          'bead-unavailable','bead-malformed','bead-not-runnable',
                          'repository-mismatch','unauthorized','desired-not-running',
                          'terminal','input-required','exhausted','superseded',
                          'reservation-recovery')),
  next_eligible_wake_at TEXT,
  decision_json         TEXT NOT NULL,
  created_at            TEXT NOT NULL,
  UNIQUE (batch_id, subject_kind, subject_id)
);
CREATE INDEX admission_decisions_subject
  ON admission_decisions(subject_kind, subject_id, created_at, decision_id);

CREATE TABLE admission_reservations (
  reservation_id   TEXT PRIMARY KEY,
  decision_id      TEXT NOT NULL UNIQUE REFERENCES admission_decisions(decision_id),
  work_key         TEXT NOT NULL,
  subject_kind     TEXT NOT NULL CHECK (subject_kind IN ('run','epic','packet')),
  subject_id       TEXT NOT NULL,
  control_revision INTEGER NOT NULL CHECK (control_revision >= 0),
  repository       TEXT NOT NULL,
  provider         TEXT NOT NULL,
  model            TEXT NOT NULL,
  resource_class   TEXT NOT NULL CHECK (resource_class IN ('read','repository-write')),
  state            TEXT NOT NULL CHECK (state IN ('reserved','active','orphaned','released')),
  owner_kind       TEXT CHECK (owner_kind IN ('controller','attempt')),
  owner_id         TEXT,
  recovery_deadline TEXT NOT NULL,
  last_error       TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  released_at      TEXT
);
CREATE UNIQUE INDEX one_live_admission_per_work
  ON admission_reservations(work_key) WHERE state != 'released';
CREATE INDEX admission_reservations_capacity
  ON admission_reservations(state, provider, repository, resource_class);
";

/// Migration 014: durable ownership and convergent cleanup for new
/// Forged-created Herdr panes. Identity columns are immutable after the
/// prepare/register seam commits; lifecycle and cleanup columns remain the
/// state machine's only update surface.
const MIGRATION_014: &str = "
CREATE TABLE owned_herdr_sessions (
  ownership_id          TEXT PRIMARY KEY CHECK (length(ownership_id) > 0),
  schema                TEXT NOT NULL CHECK (schema = 'forged.owned-herdr-session/1'),
  owner_kind            TEXT NOT NULL CHECK (owner_kind IN ('controller','attempt')),
  subject_kind          TEXT NOT NULL CHECK (subject_kind IN ('run','epic')),
  subject_id            TEXT NOT NULL CHECK (length(subject_id) > 0),
  run_id                TEXT,
  packet_id             TEXT,
  attempt_id            INTEGER,
  claim_token           TEXT,
  controller_generation INTEGER,
  pane_id               TEXT NOT NULL CHECK (length(pane_id) > 0),
  socket_path           TEXT NOT NULL CHECK (length(socket_path) > 0),
  protocol              INTEGER NOT NULL CHECK (protocol = 19),
  sentinel_path         TEXT NOT NULL CHECK (length(sentinel_path) > 0),
  lifecycle_state       TEXT NOT NULL CHECK (lifecycle_state IN
                         ('registered','command-started','owner-terminal','owner-dead')),
  cleanup_state         TEXT NOT NULL CHECK (cleanup_state IN
                         ('not-requested','pending','leased','retry-wait','attention','released')),
  cleanup_reason        TEXT CHECK (cleanup_reason IN
                         ('command-not-started','attempt-settled','controller-terminal',
                          'controller-dead','orphaned-submit')),
  cleanup_release       TEXT CHECK (cleanup_release IN ('closed','pane-not-found')),
  cleanup_token         TEXT,
  cleanup_lease_until   TEXT,
  cleanup_retry_budget  INTEGER NOT NULL CHECK (cleanup_retry_budget > 0),
  cleanup_retry_used    INTEGER NOT NULL DEFAULT 0 CHECK
                        (cleanup_retry_used >= 0 AND cleanup_retry_used <= cleanup_retry_budget),
  next_cleanup_at       TEXT,
  last_cleanup_error    TEXT,
  registered_at         TEXT NOT NULL,
  command_started_at    TEXT,
  cleanup_requested_at  TEXT,
  last_cleanup_attempt_at TEXT,
  released_at           TEXT,
  updated_at            TEXT NOT NULL,
  UNIQUE (socket_path, protocol, pane_id),
  UNIQUE (sentinel_path),
  CHECK (
    (owner_kind = 'controller' AND run_id IS NULL AND packet_id IS NULL
      AND attempt_id IS NULL AND claim_token IS NULL
      AND controller_generation IS NOT NULL AND controller_generation > 0)
    OR
    (owner_kind = 'attempt' AND run_id IS NOT NULL AND packet_id IS NOT NULL
      AND attempt_id IS NOT NULL AND attempt_id > 0 AND claim_token IS NOT NULL
      AND (controller_generation IS NULL OR controller_generation > 0)
      AND (controller_generation IS NOT NULL
           OR (subject_kind = 'run' AND subject_id = run_id)))
  ),
  CHECK (
    (lifecycle_state = 'registered' AND command_started_at IS NULL)
    OR (lifecycle_state = 'command-started' AND command_started_at IS NOT NULL)
    OR lifecycle_state IN ('owner-terminal','owner-dead')
  ),
  CHECK (
    (cleanup_state = 'not-requested' AND cleanup_reason IS NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'pending' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NOT NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'leased' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NOT NULL
      AND cleanup_lease_until IS NOT NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'retry-wait' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NOT NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'attention' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NOT NULL AND last_cleanup_error IS NOT NULL
      AND cleanup_retry_used = cleanup_retry_budget AND released_at IS NULL)
    OR
    (cleanup_state = 'released' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NOT NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NOT NULL)
  )
);
CREATE UNIQUE INDEX owned_herdr_cleanup_token
  ON owned_herdr_sessions(cleanup_token) WHERE cleanup_token IS NOT NULL;
CREATE INDEX owned_herdr_cleanup_wake
  ON owned_herdr_sessions(cleanup_state, next_cleanup_at, cleanup_lease_until)
  WHERE cleanup_state IN ('pending','leased','retry-wait');
CREATE UNIQUE INDEX owned_herdr_attempt_owner
  ON owned_herdr_sessions(attempt_id, claim_token)
  WHERE owner_kind = 'attempt';
CREATE UNIQUE INDEX owned_herdr_controller_owner
  ON owned_herdr_sessions(subject_kind, subject_id, controller_generation)
  WHERE owner_kind = 'controller';

CREATE TRIGGER owned_herdr_identity_immutable
BEFORE UPDATE OF ownership_id, schema, owner_kind, subject_kind, subject_id,
                 run_id, packet_id, attempt_id, claim_token,
                 controller_generation, pane_id, socket_path, protocol,
                 sentinel_path, registered_at
ON owned_herdr_sessions
BEGIN
  SELECT RAISE(ABORT, 'owned Herdr session identity is immutable');
END;
";

/// Migration 015: immutable human-readable identity captured from durable
/// launch evidence. Planned work is deliberately absent: `live-plan` is a
/// projection-only source and the table's closed source vocabulary rejects
/// it. Existing rows are populated by Rust immediately after this DDL inside
/// the same migration transaction so path/title derivation uses the shared
/// pure helpers rather than a second SQL implementation.
const MIGRATION_015: &str = "
CREATE TABLE work_identities (
  schema            TEXT NOT NULL CHECK (schema = 'forged.work-identity/1'),
  subject_kind      TEXT NOT NULL CHECK (subject_kind IN ('run','epic')),
  subject_id        TEXT NOT NULL CHECK (length(trim(subject_id)) > 0),
  bead_id           TEXT NOT NULL CHECK (length(trim(bead_id)) > 0),
  bead_title        TEXT CHECK (bead_title IS NULL OR length(trim(bead_title)) > 0),
  bead_revision     TEXT CHECK (bead_revision IS NULL OR length(trim(bead_revision)) > 0),
  repository_path  TEXT,
  repository_label TEXT,
  project_id        TEXT,
  project_title     TEXT,
  epic_id           TEXT,
  epic_title        TEXT,
  display_title     TEXT NOT NULL CHECK (length(trim(display_title)) > 0),
  captured_at       TEXT NOT NULL CHECK (length(trim(captured_at)) > 0),
  source            TEXT NOT NULL CHECK (source IN ('durable','legacy-fallback')),
  PRIMARY KEY (subject_kind, subject_id),
  CHECK (
    (repository_path IS NULL AND repository_label IS NULL)
    OR
    (repository_path IS NOT NULL AND length(trim(repository_path)) > 0
      AND repository_label IS NOT NULL AND length(trim(repository_label)) > 0)
  ),
  CHECK (
    (project_id IS NULL AND project_title IS NULL)
    OR
    (project_id IS NOT NULL AND length(trim(project_id)) > 0
      AND (project_title IS NULL OR length(trim(project_title)) > 0))
  ),
  CHECK (
    (epic_id IS NULL AND epic_title IS NULL)
    OR
    (epic_id IS NOT NULL AND length(trim(epic_id)) > 0
      AND (epic_title IS NULL OR length(trim(epic_title)) > 0))
  )
);
CREATE INDEX work_identities_bead ON work_identities(bead_id, subject_kind, subject_id);

CREATE TRIGGER work_identity_immutable
BEFORE UPDATE ON work_identities
BEGIN
  SELECT RAISE(ABORT, 'work identity is immutable');
END;
";

/// Migration 016: run-major access for the complete latest-event projection.
///
/// The existing kind-major index remains the right access path for lifecycle
/// scans. This partial index gives the independent newest-event-per-subject
/// query one ordered group per non-null run id, so SQLite does not build a
/// temporary grouping B-tree over the append-only event history.
const MIGRATION_016: &str = "
CREATE INDEX events_run_event ON events(run_id, event_id)
  WHERE run_id IS NOT NULL;
";

/// Migration 017: one durable, exact Herdr tab/root layout per active work
/// subject and frozen endpoint. Creation, mutation, replacement, and cleanup
/// are separate CAS leases; labels are stored presentation and never keys.
const MIGRATION_017: &str = "
CREATE TABLE herdr_layouts (
  layout_id             TEXT PRIMARY KEY CHECK (length(trim(layout_id)) > 0),
  schema                TEXT NOT NULL CHECK (schema = 'forged.herdr-layout/1'),
  revision              INTEGER NOT NULL CHECK (revision > 0),
  subject_kind          TEXT NOT NULL CHECK (subject_kind IN ('run','epic')),
  subject_id            TEXT NOT NULL CHECK (length(trim(subject_id)) > 0),
  socket_path           TEXT NOT NULL CHECK (length(socket_path) > 0),
  protocol              INTEGER NOT NULL CHECK (protocol = 19),
  workspace_id          TEXT NOT NULL CHECK (length(workspace_id) > 0),
  tab_id                TEXT,
  root_pane_id          TEXT,
  display_label         TEXT NOT NULL CHECK
                        (length(trim(display_label)) > 0 AND length(CAST(display_label AS BLOB)) <= 160),
  lifecycle_state       TEXT NOT NULL CHECK (lifecycle_state IN
                        ('creating','registered','degraded','replaced')),
  degradation_reason    TEXT CHECK (degradation_reason IN
                        ('creation-ambiguous','registration-failed','verification-missing',
                         'verification-mismatch','placement-failed')),
  last_error            TEXT,
  creation_token        TEXT,
  creation_lease_until  TEXT,
  mutation_token        TEXT,
  mutation_lease_until  TEXT,
  cleanup_state         TEXT NOT NULL CHECK (cleanup_state IN
                        ('not-requested','pending','leased','retry-wait','attention','released')),
  cleanup_reason        TEXT CHECK (cleanup_reason IN
                        ('subject-terminal','layout-replaced','layout-degraded')),
  cleanup_release       TEXT CHECK (cleanup_release IN ('closed','pane-not-found')),
  cleanup_token         TEXT,
  cleanup_lease_until   TEXT,
  cleanup_retry_budget  INTEGER NOT NULL CHECK (cleanup_retry_budget > 0),
  cleanup_retry_used    INTEGER NOT NULL DEFAULT 0 CHECK
                        (cleanup_retry_used >= 0 AND cleanup_retry_used <= cleanup_retry_budget),
  next_cleanup_at       TEXT,
  last_cleanup_error    TEXT,
  predecessor_layout_id TEXT REFERENCES herdr_layouts(layout_id),
  created_at            TEXT NOT NULL,
  registered_at         TEXT,
  replaced_at           TEXT,
  cleanup_requested_at  TEXT,
  last_cleanup_attempt_at TEXT,
  released_at           TEXT,
  updated_at            TEXT NOT NULL,
  UNIQUE (subject_kind, subject_id, socket_path, protocol, revision),
  CHECK ((tab_id IS NULL) = (root_pane_id IS NULL)),
  CHECK (
    (lifecycle_state = 'creating' AND tab_id IS NULL AND root_pane_id IS NULL
      AND creation_token IS NOT NULL AND creation_lease_until IS NOT NULL
      AND registered_at IS NULL AND degradation_reason IS NULL)
    OR
    (lifecycle_state = 'registered' AND tab_id IS NOT NULL AND root_pane_id IS NOT NULL
      AND creation_token IS NULL AND creation_lease_until IS NULL
      AND registered_at IS NOT NULL
      AND (degradation_reason IS NULL OR degradation_reason = 'placement-failed'))
    OR
    (lifecycle_state = 'degraded' AND creation_token IS NULL
      AND creation_lease_until IS NULL AND degradation_reason IS NOT NULL)
    OR
    (lifecycle_state = 'replaced' AND tab_id IS NOT NULL AND root_pane_id IS NOT NULL
      AND creation_token IS NULL AND creation_lease_until IS NULL
      AND degradation_reason IS NOT NULL AND replaced_at IS NOT NULL)
  ),
  CHECK (
    (mutation_token IS NULL AND mutation_lease_until IS NULL)
    OR
    (mutation_token IS NOT NULL AND mutation_lease_until IS NOT NULL
      AND lifecycle_state = 'registered' AND cleanup_state = 'not-requested')
  ),
  CHECK (
    (cleanup_state = 'not-requested' AND cleanup_reason IS NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'pending' AND cleanup_reason IS NOT NULL
      AND root_pane_id IS NOT NULL AND cleanup_release IS NULL
      AND cleanup_token IS NULL AND cleanup_lease_until IS NULL
      AND next_cleanup_at IS NOT NULL AND cleanup_requested_at IS NOT NULL
      AND released_at IS NULL)
    OR
    (cleanup_state = 'leased' AND cleanup_reason IS NOT NULL
      AND root_pane_id IS NOT NULL AND cleanup_release IS NULL
      AND cleanup_token IS NOT NULL AND cleanup_lease_until IS NOT NULL
      AND next_cleanup_at IS NULL AND cleanup_requested_at IS NOT NULL
      AND released_at IS NULL)
    OR
    (cleanup_state = 'retry-wait' AND cleanup_reason IS NOT NULL
      AND root_pane_id IS NOT NULL AND cleanup_release IS NULL
      AND cleanup_token IS NULL AND cleanup_lease_until IS NULL
      AND next_cleanup_at IS NOT NULL AND cleanup_requested_at IS NOT NULL
      AND released_at IS NULL)
    OR
    (cleanup_state = 'attention' AND cleanup_release IS NULL
      AND cleanup_token IS NULL AND cleanup_lease_until IS NULL
      AND next_cleanup_at IS NULL AND last_cleanup_error IS NOT NULL
      AND released_at IS NULL)
    OR
    (cleanup_state = 'released' AND cleanup_reason IS NOT NULL
      AND root_pane_id IS NOT NULL AND cleanup_release IS NOT NULL
      AND cleanup_token IS NULL AND cleanup_lease_until IS NULL
      AND next_cleanup_at IS NULL AND cleanup_requested_at IS NOT NULL
      AND released_at IS NOT NULL)
  )
);
CREATE UNIQUE INDEX one_active_herdr_layout
  ON herdr_layouts(subject_kind, subject_id, socket_path, protocol)
  WHERE lifecycle_state IN ('creating','registered');
CREATE UNIQUE INDEX herdr_layout_exact_tab
  ON herdr_layouts(socket_path, protocol, tab_id) WHERE tab_id IS NOT NULL;
CREATE UNIQUE INDEX herdr_layout_exact_root
  ON herdr_layouts(socket_path, protocol, root_pane_id) WHERE root_pane_id IS NOT NULL;
CREATE UNIQUE INDEX herdr_layout_creation_token
  ON herdr_layouts(creation_token) WHERE creation_token IS NOT NULL;
CREATE UNIQUE INDEX herdr_layout_mutation_token
  ON herdr_layouts(mutation_token) WHERE mutation_token IS NOT NULL;
CREATE UNIQUE INDEX herdr_layout_cleanup_token
  ON herdr_layouts(cleanup_token) WHERE cleanup_token IS NOT NULL;
CREATE INDEX herdr_layout_cleanup_wake
  ON herdr_layouts(cleanup_state, next_cleanup_at, cleanup_lease_until)
  WHERE cleanup_state IN ('pending','leased','retry-wait');

CREATE TRIGGER herdr_layout_identity_immutable
BEFORE UPDATE OF layout_id, schema, revision, subject_kind, subject_id,
                 socket_path, protocol, workspace_id, display_label,
                 predecessor_layout_id, created_at
ON herdr_layouts
BEGIN
  SELECT RAISE(ABORT, 'Herdr layout identity is immutable');
END;

CREATE TRIGGER herdr_layout_locator_once
BEFORE UPDATE OF tab_id, root_pane_id ON herdr_layouts
WHEN OLD.lifecycle_state != 'creating' OR NEW.lifecycle_state NOT IN ('registered','degraded')
BEGIN
  SELECT RAISE(ABORT, 'Herdr layout locator may only register once');
END;

ALTER TABLE owned_herdr_sessions
  ADD COLUMN layout_id TEXT REFERENCES herdr_layouts(layout_id);
CREATE INDEX owned_herdr_layout
  ON owned_herdr_sessions(layout_id, cleanup_state) WHERE layout_id IS NOT NULL;
CREATE TRIGGER owned_herdr_layout_immutable
BEFORE UPDATE OF layout_id ON owned_herdr_sessions
BEGIN
  SELECT RAISE(ABORT, 'owned Herdr layout join is immutable');
END;
";

/// Migration 018: durable best-effort display and custom-lifecycle
/// projections for exact post-migration Herdr ownership.  The table has no
/// native session source/path column by design: confirmed provider ids are
/// display metadata only.
const MIGRATION_018: &str = "
CREATE TABLE herdr_pane_projections (
  projection_id          TEXT PRIMARY KEY CHECK (length(trim(projection_id)) > 0),
  schema                 TEXT NOT NULL CHECK (schema = 'forged.herdr-pane-projection/1'),
  target_kind            TEXT NOT NULL CHECK (target_kind IN ('anchor','controller','attempt')),
  subject_kind           TEXT NOT NULL CHECK (subject_kind IN ('run','epic')),
  subject_id             TEXT NOT NULL CHECK (length(trim(subject_id)) > 0),
  ownership_id           TEXT REFERENCES owned_herdr_sessions(ownership_id),
  layout_id              TEXT REFERENCES herdr_layouts(layout_id),
  pane_id                TEXT NOT NULL CHECK (length(pane_id) > 0),
  socket_path            TEXT NOT NULL CHECK (length(socket_path) > 0),
  protocol               INTEGER NOT NULL CHECK (protocol = 19),
  controller_generation  INTEGER,
  run_id                 TEXT,
  packet_id              TEXT,
  attempt_id             INTEGER,
  claim_token            TEXT,
  stage                  TEXT CHECK (stage IN ('implement','reviewclaude','reviewcodex','fix')),
  provider               TEXT CHECK (provider IN ('claude','codex')),
  model                  TEXT,
  layout_revision        INTEGER,
  metadata_source        TEXT NOT NULL CHECK
                         (length(metadata_source) <= 80 AND metadata_source NOT LIKE 'herdr:%'),
  lifecycle_source       TEXT CHECK
                         (lifecycle_source IS NULL OR
                          (length(lifecycle_source) <= 80 AND lifecycle_source NOT LIKE 'herdr:%')),
  lifecycle_agent        TEXT CHECK (lifecycle_agent IN ('claude','codex')),
  session_candidate      TEXT CHECK
                         (session_candidate IS NULL OR
                          (length(CAST(session_candidate AS BLOB)) BETWEEN 1 AND 256
                           AND session_candidate NOT GLOB '*' || char(10) || '*'
                           AND session_candidate NOT GLOB '*' || char(13) || '*')),
  session_confirmed      TEXT CHECK
                         (session_confirmed IS NULL OR
                          (length(CAST(session_confirmed AS BLOB)) BETWEEN 1 AND 80
                           AND session_confirmed NOT GLOB '*' || char(10) || '*'
                           AND session_confirmed NOT GLOB '*' || char(13) || '*')),
  session_evidence_source TEXT CHECK
                         (session_evidence_source IN ('claude-output','codex-thread-started')),
  session_evidence_at    TEXT,
  session_evidence_error TEXT,
  desired_revision       INTEGER NOT NULL CHECK (desired_revision > 0),
  desired_lifecycle      TEXT CHECK (desired_lifecycle IN ('working','unknown')),
  desired_release        INTEGER NOT NULL DEFAULT 0 CHECK (desired_release IN (0,1)),

  metadata_next_seq      INTEGER NOT NULL DEFAULT 0 CHECK (metadata_next_seq >= 0),
  metadata_applied_seq   INTEGER CHECK (metadata_applied_seq > 0),
  metadata_applied_revision INTEGER CHECK (metadata_applied_revision > 0),
  metadata_state         TEXT NOT NULL CHECK (metadata_state IN
                         ('pending','leased','retry-wait','attention','applied','missing')),
  metadata_token         TEXT,
  metadata_lease_until   TEXT,
  metadata_retry_budget  INTEGER NOT NULL CHECK (metadata_retry_budget > 0),
  metadata_retry_used    INTEGER NOT NULL DEFAULT 0 CHECK
                         (metadata_retry_used BETWEEN 0 AND metadata_retry_budget),
  metadata_next_wake_at  TEXT,
  metadata_last_error    TEXT,
  metadata_last_attempt_at TEXT,
  metadata_applied_at    TEXT,

  lifecycle_next_seq     INTEGER NOT NULL DEFAULT 0 CHECK (lifecycle_next_seq >= 0),
  lifecycle_applied_seq  INTEGER CHECK (lifecycle_applied_seq > 0),
  lifecycle_applied_revision INTEGER CHECK (lifecycle_applied_revision > 0),
  lifecycle_state        TEXT CHECK (lifecycle_state IN
                         ('not-requested','pending','leased','retry-wait','attention','applied','missing')),
  lifecycle_token        TEXT,
  lifecycle_lease_until  TEXT,
  lifecycle_retry_budget INTEGER NOT NULL CHECK (lifecycle_retry_budget > 0),
  lifecycle_retry_used   INTEGER NOT NULL DEFAULT 0 CHECK
                         (lifecycle_retry_used BETWEEN 0 AND lifecycle_retry_budget),
  lifecycle_next_wake_at TEXT,
  lifecycle_last_error   TEXT,
  lifecycle_last_attempt_at TEXT,
  lifecycle_applied_at   TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,

  FOREIGN KEY (subject_kind, subject_id)
    REFERENCES work_identities(subject_kind, subject_id),
  UNIQUE (socket_path, protocol, pane_id, metadata_source),
  CHECK (
    (target_kind = 'anchor' AND layout_id IS NOT NULL AND ownership_id IS NULL
      AND layout_revision IS NOT NULL AND layout_revision > 0
      AND controller_generation IS NULL AND run_id IS NULL AND packet_id IS NULL
      AND attempt_id IS NULL AND claim_token IS NULL AND stage IS NULL
      AND provider IS NULL AND model IS NULL AND lifecycle_source IS NULL
      AND lifecycle_agent IS NULL AND desired_lifecycle IS NULL
      AND desired_release = 0 AND lifecycle_state = 'not-requested'
      AND session_candidate IS NULL AND session_confirmed IS NULL
      AND session_evidence_source IS NULL AND session_evidence_at IS NULL
      AND session_evidence_error IS NULL)
    OR
    (target_kind = 'controller' AND ownership_id IS NOT NULL AND layout_id IS NULL
      AND controller_generation IS NOT NULL AND controller_generation > 0
      AND run_id IS NULL AND packet_id IS NULL AND attempt_id IS NULL
      AND claim_token IS NULL AND stage IS NULL AND provider IS NULL AND model IS NULL
      AND layout_revision IS NULL AND lifecycle_source IS NULL
      AND lifecycle_agent IS NULL AND desired_lifecycle IS NULL
      AND desired_release = 0 AND lifecycle_state = 'not-requested'
      AND session_candidate IS NULL AND session_confirmed IS NULL
      AND session_evidence_source IS NULL AND session_evidence_at IS NULL
      AND session_evidence_error IS NULL)
    OR
    (target_kind = 'attempt' AND ownership_id IS NOT NULL AND layout_id IS NULL
      AND run_id IS NOT NULL AND packet_id IS NOT NULL AND attempt_id IS NOT NULL
      AND attempt_id > 0 AND claim_token IS NOT NULL AND stage IS NOT NULL
      AND provider IS NOT NULL AND model IS NOT NULL AND layout_revision IS NULL
      AND lifecycle_source IS NOT NULL AND lifecycle_agent = provider
      AND lifecycle_state IS NOT NULL)
  ),
  CHECK ((session_confirmed IS NULL AND session_evidence_source IS NULL
          AND session_evidence_at IS NULL)
         OR (session_confirmed IS NOT NULL AND session_evidence_source IS NOT NULL
             AND session_evidence_at IS NOT NULL)),
  CHECK ((metadata_state = 'leased') =
         (metadata_token IS NOT NULL AND metadata_lease_until IS NOT NULL)),
  CHECK ((lifecycle_state = 'leased') =
         (lifecycle_token IS NOT NULL AND lifecycle_lease_until IS NOT NULL))
);
CREATE UNIQUE INDEX herdr_projection_owned_target
  ON herdr_pane_projections(ownership_id) WHERE ownership_id IS NOT NULL;
CREATE UNIQUE INDEX herdr_projection_layout_target
  ON herdr_pane_projections(layout_id) WHERE layout_id IS NOT NULL;
CREATE UNIQUE INDEX herdr_projection_metadata_token
  ON herdr_pane_projections(metadata_token) WHERE metadata_token IS NOT NULL;
CREATE UNIQUE INDEX herdr_projection_lifecycle_token
  ON herdr_pane_projections(lifecycle_token) WHERE lifecycle_token IS NOT NULL;
CREATE INDEX herdr_projection_metadata_wake
  ON herdr_pane_projections(metadata_state, metadata_next_wake_at, metadata_lease_until)
  WHERE metadata_state IN ('pending','leased','retry-wait');
CREATE INDEX herdr_projection_lifecycle_wake
  ON herdr_pane_projections(lifecycle_state, lifecycle_next_wake_at, lifecycle_lease_until)
  WHERE lifecycle_state IN ('pending','leased','retry-wait');

CREATE TRIGGER herdr_projection_identity_immutable
BEFORE UPDATE OF projection_id, schema, target_kind, subject_kind, subject_id,
                 ownership_id, layout_id, pane_id, socket_path, protocol,
                 controller_generation, run_id, packet_id, attempt_id,
                 claim_token, stage, provider, model, layout_revision,
                 metadata_source, lifecycle_source, lifecycle_agent, created_at
ON herdr_pane_projections
BEGIN
  SELECT RAISE(ABORT, 'Herdr projection identity is immutable');
END;
";

/// Migration 019: exact-snapshot, per-finding review-publication truth.
///
/// The snapshot digest is part of the primary identity: a later same-round
/// result is new work rather than an update to an older delivery row.
const MIGRATION_019: &str = "
CREATE TABLE review_finding_deliveries (
  schema                 TEXT NOT NULL
                         CHECK (schema = 'forged.review-finding-delivery/1'),
  run_id                 TEXT NOT NULL REFERENCES runs(run_id),
  repository_slug        TEXT NOT NULL CHECK (length(trim(repository_slug)) > 0),
  pr_number              INTEGER NOT NULL CHECK (pr_number > 0),
  pr_url                 TEXT NOT NULL CHECK (length(trim(pr_url)) > 0),
  review_epoch_kind      TEXT NOT NULL
                         CHECK (review_epoch_kind IN ('semantic-round','legacy-seq')),
  review_epoch           INTEGER NOT NULL CHECK (review_epoch >= 0),
  snapshot_sha256        TEXT NOT NULL
                         CHECK (length(snapshot_sha256) = 64
                                AND snapshot_sha256 NOT GLOB '*[^0-9a-f]*'),
  finding_id             TEXT NOT NULL
                         CHECK (length(finding_id) = 64
                                AND finding_id NOT GLOB '*[^0-9a-f]*'),
  finding_sha256         TEXT NOT NULL
                         CHECK (length(finding_sha256) = 64
                                AND finding_sha256 NOT GLOB '*[^0-9a-f]*'),
  canonical_finding_json TEXT NOT NULL,
  state                  TEXT NOT NULL
                         CHECK (state IN ('pending','uncertain','retryable','delivered')),
  attempt_count          INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error             TEXT CHECK (last_error IS NULL OR length(CAST(last_error AS BLOB)) <= 2048),
  external_outcome       TEXT CHECK (external_outcome IN ('posted','already-present')),
  delivered_evidence     TEXT,
  delivery_token         TEXT,
  delivery_lease_until   TEXT,
  delivered_at           TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  PRIMARY KEY (
    run_id, repository_slug, pr_number, review_epoch_kind, review_epoch,
    snapshot_sha256, finding_id
  ),
  CHECK (finding_sha256 = finding_id),
  CHECK ((delivery_token IS NULL) = (delivery_lease_until IS NULL)),
  CHECK (
    (state = 'delivered' AND external_outcome IS NOT NULL
      AND delivered_evidence IS NOT NULL AND delivered_at IS NOT NULL
      AND last_error IS NULL AND delivery_token IS NULL)
    OR
    (state != 'delivered' AND external_outcome IS NULL
      AND delivered_evidence IS NULL AND delivered_at IS NULL)
  ),
  CHECK ((state IN ('retryable','uncertain')) OR last_error IS NULL)
);
CREATE UNIQUE INDEX review_finding_delivery_token
  ON review_finding_deliveries(delivery_token) WHERE delivery_token IS NOT NULL;
CREATE INDEX review_finding_delivery_state
  ON review_finding_deliveries(run_id, snapshot_sha256, state, delivery_lease_until);
";

/// Migration 020: the durable mirror of pending whole-run work settlement.
///
/// The budget bounds MUTATING retries only; the read-only convergence probe
/// runs regardless of `used`, throttled by `probe_wake_at` and reset to the
/// floor whenever the live work differs from the `last_observed_*` snapshot.
/// The claim columns are the same cross-process singleton fence
/// `desired_work` carries, so two concurrent tick executors cannot
/// double-comment or double-charge. `event_id` is the episode watermark:
/// stamped transactionally with every charge and every pass-minted pending
/// re-record, so only a pending event NEWER than it — one minted by a fresh
/// `run stop` settlement episode — may reset the budget.
const MIGRATION_020: &str = "
CREATE TABLE bead_settlement_retry (
  run_id                 TEXT PRIMARY KEY REFERENCES runs(run_id),
  budget                 INTEGER NOT NULL CHECK (budget > 0),
  used                   INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0 AND used <= budget),
  next_wake_at           TEXT,
  last_error             TEXT,
  claim_token            TEXT,
  claim_lease_until      TEXT,
  event_id               INTEGER,
  probe_wake_at          TEXT,
  probe_interval_s       INTEGER,
  last_observed_status   TEXT,
  last_observed_assignee TEXT,
  last_observed_revision TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);
";

/// Migration 021: admit the confirmed orphaned-submit cleanup reason while
/// preserving every identity, cleanup-state, and layout constraint introduced
/// by migrations 014 and 017.
const MIGRATION_021: &str = "
PRAGMA defer_foreign_keys=ON;
CREATE TABLE owned_herdr_sessions_v21 (
  ownership_id          TEXT PRIMARY KEY CHECK (length(ownership_id) > 0),
  schema                TEXT NOT NULL CHECK (schema = 'forged.owned-herdr-session/1'),
  owner_kind            TEXT NOT NULL CHECK (owner_kind IN ('controller','attempt')),
  subject_kind          TEXT NOT NULL CHECK (subject_kind IN ('run','epic')),
  subject_id            TEXT NOT NULL CHECK (length(subject_id) > 0),
  run_id                TEXT,
  packet_id             TEXT,
  attempt_id             INTEGER,
  claim_token           TEXT,
  controller_generation INTEGER,
  pane_id               TEXT NOT NULL CHECK (length(pane_id) > 0),
  socket_path           TEXT NOT NULL CHECK (length(socket_path) > 0),
  protocol              INTEGER NOT NULL CHECK (protocol = 19),
  sentinel_path         TEXT NOT NULL CHECK (length(sentinel_path) > 0),
  lifecycle_state       TEXT NOT NULL CHECK (lifecycle_state IN
                         ('registered','command-started','owner-terminal','owner-dead')),
  cleanup_state         TEXT NOT NULL CHECK (cleanup_state IN
                         ('not-requested','pending','leased','retry-wait','attention','released')),
  cleanup_reason        TEXT CHECK (cleanup_reason IN
                         ('command-not-started','attempt-settled','controller-terminal',
                          'controller-dead','orphaned-submit')),
  cleanup_release       TEXT CHECK (cleanup_release IN ('closed','pane-not-found')),
  cleanup_token         TEXT,
  cleanup_lease_until   TEXT,
  cleanup_retry_budget  INTEGER NOT NULL CHECK (cleanup_retry_budget > 0),
  cleanup_retry_used    INTEGER NOT NULL DEFAULT 0 CHECK
                        (cleanup_retry_used >= 0 AND cleanup_retry_used <= cleanup_retry_budget),
  next_cleanup_at       TEXT,
  last_cleanup_error    TEXT,
  registered_at         TEXT NOT NULL,
  command_started_at    TEXT,
  cleanup_requested_at  TEXT,
  last_cleanup_attempt_at TEXT,
  released_at           TEXT,
  updated_at            TEXT NOT NULL,
  layout_id             TEXT REFERENCES herdr_layouts(layout_id),
  UNIQUE (socket_path, protocol, pane_id),
  UNIQUE (sentinel_path),
  CHECK (
    (owner_kind = 'controller' AND run_id IS NULL AND packet_id IS NULL
      AND attempt_id IS NULL AND claim_token IS NULL
      AND controller_generation IS NOT NULL AND controller_generation > 0)
    OR
    (owner_kind = 'attempt' AND run_id IS NOT NULL AND packet_id IS NOT NULL
      AND attempt_id IS NOT NULL AND attempt_id > 0 AND claim_token IS NOT NULL
      AND (controller_generation IS NULL OR controller_generation > 0)
      AND (controller_generation IS NOT NULL
           OR (subject_kind = 'run' AND subject_id = run_id)))
  ),
  CHECK (
    (lifecycle_state = 'registered' AND command_started_at IS NULL)
    OR (lifecycle_state = 'command-started' AND command_started_at IS NOT NULL)
    OR lifecycle_state IN ('owner-terminal','owner-dead')
  ),
  CHECK (
    (cleanup_state = 'not-requested' AND cleanup_reason IS NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'pending' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NOT NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'leased' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NOT NULL
      AND cleanup_lease_until IS NOT NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'retry-wait' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NOT NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NULL)
    OR
    (cleanup_state = 'attention' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NOT NULL AND last_cleanup_error IS NOT NULL
      AND cleanup_retry_used = cleanup_retry_budget AND released_at IS NULL)
    OR
    (cleanup_state = 'released' AND cleanup_reason IS NOT NULL
      AND cleanup_release IS NOT NULL AND cleanup_token IS NULL
      AND cleanup_lease_until IS NULL AND next_cleanup_at IS NULL
      AND cleanup_requested_at IS NOT NULL AND released_at IS NOT NULL)
  )
);
INSERT INTO owned_herdr_sessions_v21 (
  ownership_id, schema, owner_kind, subject_kind, subject_id, run_id,
  packet_id, attempt_id, claim_token, controller_generation, pane_id,
  socket_path, protocol, sentinel_path, lifecycle_state, cleanup_state,
  cleanup_reason, cleanup_release, cleanup_token, cleanup_lease_until,
  cleanup_retry_budget, cleanup_retry_used, next_cleanup_at,
  last_cleanup_error, registered_at, command_started_at,
  cleanup_requested_at, last_cleanup_attempt_at, released_at, updated_at,
  layout_id
)
SELECT
  ownership_id, schema, owner_kind, subject_kind, subject_id, run_id,
  packet_id, attempt_id, claim_token, controller_generation, pane_id,
  socket_path, protocol, sentinel_path, lifecycle_state, cleanup_state,
  cleanup_reason, cleanup_release, cleanup_token, cleanup_lease_until,
  cleanup_retry_budget, cleanup_retry_used, next_cleanup_at,
  last_cleanup_error, registered_at, command_started_at,
  cleanup_requested_at, last_cleanup_attempt_at, released_at, updated_at,
  layout_id
FROM owned_herdr_sessions;
DROP TABLE owned_herdr_sessions;
ALTER TABLE owned_herdr_sessions_v21 RENAME TO owned_herdr_sessions;
CREATE UNIQUE INDEX owned_herdr_cleanup_token
  ON owned_herdr_sessions(cleanup_token) WHERE cleanup_token IS NOT NULL;
CREATE INDEX owned_herdr_cleanup_wake
  ON owned_herdr_sessions(cleanup_state, next_cleanup_at, cleanup_lease_until)
  WHERE cleanup_state IN ('pending','leased','retry-wait');
CREATE UNIQUE INDEX owned_herdr_attempt_owner
  ON owned_herdr_sessions(attempt_id, claim_token)
  WHERE owner_kind = 'attempt';
CREATE UNIQUE INDEX owned_herdr_controller_owner
  ON owned_herdr_sessions(subject_kind, subject_id, controller_generation)
  WHERE owner_kind = 'controller';
CREATE INDEX owned_herdr_layout
  ON owned_herdr_sessions(layout_id, cleanup_state) WHERE layout_id IS NOT NULL;
CREATE TRIGGER owned_herdr_identity_immutable
BEFORE UPDATE OF ownership_id, schema, owner_kind, subject_kind, subject_id,
                 run_id, packet_id, attempt_id, claim_token,
                 controller_generation, pane_id, socket_path, protocol,
                 sentinel_path, registered_at
ON owned_herdr_sessions
BEGIN
  SELECT RAISE(ABORT, 'owned Herdr session identity is immutable');
END;
CREATE TRIGGER owned_herdr_layout_immutable
BEFORE UPDATE OF layout_id ON owned_herdr_sessions
BEGIN
  SELECT RAISE(ABORT, 'owned Herdr layout join is immutable');
END;
";

/// Migration 022: the ledger-native work store (Ingot). Work items carry
/// identity and mutable coordination state; the rendered-body inputs live in
/// `work_revisions`, which is append-only by trigger so spec history is
/// unlosable and a pinned revision always dereferences to its exact bytes.
/// Coordination churn (status, custody, leases) never mints a revision —
/// that separation is what makes the spec drift fence's revision signal
/// trustworthy. Dependency kinds mirror the closed, operator-adjudicated
/// bd 1.2.1 subset; only `blocks` affects readiness. The lease row and the
/// `assignee` column always move together: assignee is the holder of record
/// (what bd called the lease holder), the lease row adds the expiry clock.
const MIGRATION_022: &str = "
CREATE TABLE work_items (
  work_id          TEXT PRIMARY KEY CHECK (length(trim(work_id)) > 0),
  kind             TEXT NOT NULL CHECK (kind IN ('task','epic')),
  status           TEXT NOT NULL CHECK (status IN
                    ('open','in_progress','blocked','deferred','closed')),
  priority         INTEGER,
  assignee         TEXT CHECK (assignee IS NULL OR length(trim(assignee)) > 0),
  metadata_json    TEXT NOT NULL DEFAULT '{}',
  current_revision INTEGER NOT NULL CHECK (current_revision > 0),
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE TABLE work_revisions (
  work_id             TEXT NOT NULL REFERENCES work_items(work_id),
  revision            INTEGER NOT NULL CHECK (revision > 0),
  title               TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description         TEXT NOT NULL DEFAULT '',
  acceptance_criteria TEXT NOT NULL DEFAULT '',
  design              TEXT NOT NULL DEFAULT '',
  notes               TEXT NOT NULL DEFAULT '',
  cause               TEXT NOT NULL CHECK (cause IN
                       ('authored','planning-apply','revert','import')),
  written_at          TEXT NOT NULL,
  PRIMARY KEY (work_id, revision)
);
CREATE TRIGGER work_revisions_append_only_update
BEFORE UPDATE ON work_revisions
BEGIN
  SELECT RAISE(ABORT, 'work revisions are append-only');
END;
CREATE TRIGGER work_revisions_append_only_delete
BEFORE DELETE ON work_revisions
BEGIN
  SELECT RAISE(ABORT, 'work revisions are append-only');
END;
CREATE TABLE work_deps (
  from_id TEXT NOT NULL REFERENCES work_items(work_id),
  to_id   TEXT NOT NULL REFERENCES work_items(work_id),
  kind    TEXT NOT NULL CHECK (kind IN
           ('blocks','parent-child','related','discovered-from','supersedes')),
  PRIMARY KEY (from_id, to_id, kind),
  CHECK (from_id <> to_id)
);
CREATE INDEX work_deps_to ON work_deps(to_id, kind);
CREATE TABLE work_leases (
  work_id     TEXT PRIMARY KEY REFERENCES work_items(work_id),
  holder      TEXT NOT NULL CHECK (length(trim(holder)) > 0),
  acquired_at TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);
";

/// Migration 023: append-only annotations about a work specification. Notes
/// are deliberately outside `work_revisions`: writing evidence never moves
/// the spec revision, coordination state, or any execution drift fence.
const MIGRATION_023: &str = "
CREATE TABLE work_notes (
  note_id    TEXT PRIMARY KEY,
  work_id    TEXT NOT NULL REFERENCES work_items(work_id),
  kind       TEXT NOT NULL CHECK (kind IN
             ('comment','critique','recommendation','approval')),
  schema     TEXT NOT NULL,
  actor      TEXT NOT NULL,
  body_json  TEXT NOT NULL,
  written_at TEXT NOT NULL
);
CREATE INDEX work_notes_work_kind_written_at
  ON work_notes(work_id, kind, written_at);
CREATE TRIGGER work_notes_append_only_update
BEFORE UPDATE ON work_notes
BEGIN
  SELECT RAISE(ABORT, 'work notes are append-only');
END;
CREATE TRIGGER work_notes_append_only_delete
BEFORE DELETE ON work_notes
BEGIN
  SELECT RAISE(ABORT, 'work notes are append-only');
END;
";

/// Migration 024: indexes for existing ready-frontier and operation-state reads.
/// The partial index covers the ready query's invariant status and custody predicates.
const MIGRATION_024: &str = "
CREATE INDEX work_items_ready
  ON work_items(priority, work_id)
  WHERE status = 'open' AND assignee IS NULL;
CREATE INDEX operations_state_run ON operations(state, run_id);
";

/// Migration 025: materialize the system partition key from canonical work
/// metadata without duplicating write authority. SQLite can add a VIRTUAL
/// generated column in place, and indexes it in the bundled runtime.
const MIGRATION_025: &str = "
ALTER TABLE work_items ADD COLUMN repository TEXT GENERATED ALWAYS AS
  (json_extract(metadata_json, '$.repository')) VIRTUAL;
CREATE INDEX work_items_repository_status ON work_items(repository, status);
";

/// Migration 026: append-only execution-policy revisions and the policy
/// revision that froze each packet's stage contract.
const MIGRATION_026: &str = "
CREATE TABLE policy_revisions (
  run_id        TEXT NOT NULL REFERENCES runs(run_id),
  revision      INTEGER NOT NULL CHECK (revision > 0),
  policy_json   TEXT NOT NULL,
  policy_sha256 TEXT NOT NULL,
  reason        TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  created_at    TEXT NOT NULL,
  operation_id  TEXT,
  PRIMARY KEY (run_id, revision)
);
CREATE UNIQUE INDEX policy_revision_operation
  ON policy_revisions(operation_id) WHERE operation_id IS NOT NULL;
ALTER TABLE packets ADD COLUMN policy_revision INTEGER;
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
    MIGRATION_010,
    MIGRATION_011,
    MIGRATION_012,
    MIGRATION_013,
    MIGRATION_014,
    MIGRATION_015,
    MIGRATION_016,
    MIGRATION_017,
    MIGRATION_018,
    MIGRATION_019,
    MIGRATION_020,
    MIGRATION_021,
    MIGRATION_022,
    MIGRATION_023,
    MIGRATION_024,
    MIGRATION_025,
    MIGRATION_026,
];

/// Configure pragmas and apply pending migrations on a fresh connection.
pub(crate) fn configure_connection(conn: &mut Connection) -> Result<(), LedgerError> {
    // busy_timeout first, before any other pragma.
    conn.execute_batch(&format!("PRAGMA busy_timeout={BUSY_TIMEOUT_MS};"))?;

    // journal_mode=WAL outside the migration transaction, retrying on
    // SQLITE_BUSY until the busy timeout elapses. The pragma returns the
    // resulting mode as a row, so it must be read with query_row.
    set_wal(conn)?;

    conn.execute_batch("PRAGMA synchronous=FULL;")?;

    // Migration 021 rebuilds owned_herdr_sessions to widen its closed cleanup
    // vocabulary. Versions 18-20 may already have projection rows that
    // reference that parent. SQLite's table-rebuild procedure requires
    // foreign-key enforcement to be disabled outside the migration
    // transaction, then restored and checked immediately afterward. Earlier
    // versions have no referencing projection table; fresh databases receive
    // the widened migration-014 definition and skip the rebuild entirely.
    let applied: i64 = conn.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    let suspend_foreign_keys = (18..21).contains(&applied);
    conn.pragma_update(None, "foreign_keys", !suspend_foreign_keys)?;
    let migrated = apply_migrations(conn);
    conn.pragma_update(None, "foreign_keys", true)?;
    migrated?;
    if suspend_foreign_keys {
        let violations: i64 =
            conn.query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |row| {
                row.get(0)
            })?;
        if violations != 0 {
            return Err(internal(format!(
                "migration left {violations} foreign-key violation(s)"
            )));
        }
    }
    Ok(())
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
            // Databases that had not yet applied migration 014 receive the
            // widened table definition directly, so rebuilding it at 021
            // would only add risk without changing their schema.
            if !(index == 21 && applied < 14) {
                tx.execute_batch(ddl)?;
            }
            if index == 15 {
                crate::work_identity::backfill_work_identities_tx(&tx)?;
            }
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
    #[test]
    fn work_revisions_are_append_only_by_trigger() {
        let dir = tempfile::tempdir().expect("tempdir");
        let mut conn = rusqlite::Connection::open(dir.path().join("state.db")).expect("open");
        super::configure_connection(&mut conn).expect("migrate");
        conn.execute_batch(
            "INSERT INTO work_items (work_id, kind, status, priority, assignee, \
               metadata_json, current_revision, created_at, updated_at) \
             VALUES ('w1','task','open',NULL,NULL,'{}',1,'t','t'); \
             INSERT INTO work_revisions (work_id, revision, title, cause, written_at) \
             VALUES ('w1',1,'title','authored','t');",
        )
        .expect("seed");
        let update = conn.execute(
            "UPDATE work_revisions SET title = 'x' WHERE work_id = 'w1'",
            [],
        );
        assert!(
            update.unwrap_err().to_string().contains("append-only"),
            "UPDATE must abort"
        );
        let delete = conn.execute("DELETE FROM work_revisions WHERE work_id = 'w1'", []);
        assert!(
            delete.unwrap_err().to_string().contains("append-only"),
            "DELETE must abort"
        );
    }

    #[test]
    fn work_notes_are_append_only_by_trigger() {
        let dir = tempfile::tempdir().expect("tempdir");
        let mut conn = rusqlite::Connection::open(dir.path().join("state.db")).expect("open");
        super::configure_connection(&mut conn).expect("migrate");
        conn.execute_batch(
            "INSERT INTO work_items (work_id, kind, status, priority, assignee, \
               metadata_json, current_revision, created_at, updated_at) \
             VALUES ('w1','task','open',NULL,NULL,'{}',1,'t','t'); \
             INSERT INTO work_revisions (work_id, revision, title, cause, written_at) \
             VALUES ('w1',1,'title','authored','t'); \
             INSERT INTO work_notes \
               (note_id, work_id, kind, schema, actor, body_json, written_at) \
             VALUES ('n1','w1','comment','comment/0','operator','{}','t');",
        )
        .expect("seed");
        let update = conn.execute(
            "UPDATE work_notes SET body_json = '{\"changed\":true}' WHERE note_id = 'n1'",
            [],
        );
        assert!(
            update.unwrap_err().to_string().contains("append-only"),
            "UPDATE must abort"
        );
        let delete = conn.execute("DELETE FROM work_notes WHERE note_id = 'n1'", []);
        assert!(
            delete.unwrap_err().to_string().contains("append-only"),
            "DELETE must abort"
        );
        let missing = conn.execute(
            "INSERT INTO work_notes \
             (note_id, work_id, kind, schema, actor, body_json, written_at) \
             VALUES ('n-missing','missing','comment','comment/0','operator','{}','t')",
            [],
        );
        assert!(
            missing
                .unwrap_err()
                .to_string()
                .contains("FOREIGN KEY constraint failed"),
            "the work_id foreign key must back the handler refusal"
        );
    }

    use super::{MIGRATIONS, MIGRATION_001};
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
        assert_eq!(pragmas.user_version, 26);
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
            "policy_revisions",
            "runtime_migrations",
            "desired_work",
            "attempt_artifacts",
            "attempt_artifact_compactions",
            "admission_batches",
            "admission_decisions",
            "admission_reservations",
            "owned_herdr_sessions",
            "work_identities",
            "herdr_layouts",
            "herdr_pane_projections",
            "review_finding_deliveries",
            "bead_settlement_retry",
            "work_items",
            "work_revisions",
            "work_deps",
            "work_leases",
            "work_notes",
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
        let policy_index: String = conn
            .query_row(
                "SELECT name FROM sqlite_master WHERE type='index' AND name = ?",
                ["policy_revision_operation"],
                |row| row.get(0),
            )
            .expect("policy operation index missing");
        assert_eq!(policy_index, "policy_revision_operation");
        let packet_policy_revision: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('packets') \
                 WHERE name = 'policy_revision'",
                [],
                |row| row.get(0),
            )
            .expect("packet policy revision column");
        assert_eq!(packet_policy_revision, 1);
        let event_index: String = conn
            .query_row(
                "SELECT sql FROM sqlite_master WHERE type='index' AND name = ?",
                ["events_run_event"],
                |row| row.get(0),
            )
            .expect("run-major event index missing");
        assert_eq!(
            event_index,
            "CREATE INDEX events_run_event ON events(run_id, event_id)\n  WHERE run_id IS NOT NULL"
        );
        let layout_join: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('owned_herdr_sessions') \
                 WHERE name = 'layout_id'",
                [],
                |row| row.get(0),
            )
            .expect("layout join column");
        assert_eq!(layout_join, 1);
        let active_layout_index: String = conn
            .query_row(
                "SELECT name FROM sqlite_master WHERE type='index' AND name = ?1",
                ["one_active_herdr_layout"],
                |row| row.get(0),
            )
            .expect("active layout index");
        assert_eq!(active_layout_index, "one_active_herdr_layout");
        for index in [
            "work_items_ready",
            "operations_state_run",
            "work_items_repository_status",
        ] {
            let found: String = conn
                .query_row(
                    "SELECT name FROM sqlite_master WHERE type='index' AND name = ?1",
                    [index],
                    |row| row.get(0),
                )
                .unwrap_or_else(|_| panic!("index {index} missing"));
            assert_eq!(found, index);
        }
    }

    #[test]
    fn migration_024_upgrades_a_v23_store() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state-v23.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            for migration in MIGRATIONS.iter().take(23) {
                conn.execute_batch(migration).expect("seed migration");
            }
            conn.execute_batch("PRAGMA user_version=23;")
                .expect("mark schema version");
        }

        let ledger = Ledger::open(&path).expect("upgrade v23 database");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
        ledger.close().expect("close");

        let conn = rusqlite::Connection::open(&path).expect("raw migrated database");
        for index in ["work_items_ready", "operations_state_run"] {
            let found: String = conn
                .query_row(
                    "SELECT name FROM sqlite_master WHERE type='index' AND name = ?1",
                    [index],
                    |row| row.get(0),
                )
                .unwrap_or_else(|_| panic!("migration 024 index {index} missing"));
            assert_eq!(found, index);
        }
    }

    #[test]
    fn migration_025_exposes_repository_for_v24_rows_without_backfill() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state-v24.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            for migration in MIGRATIONS.iter().take(24) {
                conn.execute_batch(migration).expect("seed migration");
            }
            conn.execute(
                "INSERT INTO work_items
                 (work_id, kind, status, priority, assignee, metadata_json,
                  current_revision, created_at, updated_at)
                 VALUES (?1, 'task', 'open', 1, NULL, ?2, 1, 't', 't')",
                rusqlite::params![
                    "pre-migration",
                    r#"{"repository":"/repo/before-v25","source":"import"}"#
                ],
            )
            .expect("seed v24 work item");
            conn.execute(
                "INSERT INTO work_revisions
                 (work_id, revision, title, description, acceptance_criteria,
                  design, notes, cause, written_at)
                 VALUES (?1, 1, 'Pre-migration', '', '', '', '', 'import', 't')",
                ["pre-migration"],
            )
            .expect("seed v24 work revision");
            conn.execute_batch("PRAGMA user_version=24;")
                .expect("mark schema version");
        }

        let ledger = Ledger::open(&path).expect("upgrade v24 database");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
        ledger.close().expect("close");

        let conn = rusqlite::Connection::open(path).expect("raw migrated database");
        let repository: String = conn
            .query_row(
                "SELECT repository FROM work_items WHERE work_id = ?1",
                ["pre-migration"],
                |row| row.get(0),
            )
            .expect("generated repository");
        assert_eq!(repository, "/repo/before-v25");
        let source: String = conn
            .query_row(
                "SELECT json_extract(metadata_json, '$.source') FROM work_items
                 WHERE work_id = ?1",
                ["pre-migration"],
                |row| row.get(0),
            )
            .expect("metadata pass-through");
        assert_eq!(source, "import");
    }

    #[test]
    fn migration_013_admission_custody_opens_without_backfill() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state-v13.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            for migration in MIGRATIONS.iter().take(13) {
                conn.execute_batch(migration).expect("seed migration");
            }
            conn.execute_batch(
                "INSERT INTO admission_batches (
                   batch_id, schema, policy_revision, ledger_revision, inputs_sha256,
                   inputs_json, as_of, created_at
                 ) VALUES (
                   'batch-v13', 'forged.admission-inputs/1', 'policy-v1', 'ledger-v1',
                   '0000000000000000000000000000000000000000000000000000000000000000',
                   '{}', 'created', 'created'
                 );
                 INSERT INTO admission_decisions (
                   decision_id, batch_id, subject_kind, subject_id, control_revision,
                   outcome, reason, decision_json, created_at
                 ) VALUES
                   ('decision-ownerless', 'batch-v13', 'run', 'run-ownerless', 1,
                    'admitted', 'capacity-available', '{}', 'created'),
                   ('decision-owned', 'batch-v13', 'run', 'run-owned', 1,
                    'admitted', 'capacity-available', '{}', 'created');
                 INSERT INTO admission_reservations (
                   reservation_id, decision_id, work_key, subject_kind, subject_id,
                   control_revision, repository, provider, model, resource_class, state,
                   owner_kind, owner_id, recovery_deadline, last_error, created_at, updated_at
                 ) VALUES
                   ('reservation-ownerless', 'decision-ownerless', 'run:run-ownerless:1',
                    'run', 'run-ownerless', 1, 'example/repo', 'codex', 'gpt-test',
                    'repository-write', 'reserved', NULL, NULL, 'deadline-ownerless',
                    'ownerless-detail', 'created-ownerless', 'updated-ownerless'),
                   ('reservation-owned', 'decision-owned', 'run:run-owned:1',
                    'run', 'run-owned', 1, 'example/repo', 'codex', 'gpt-test',
                    'repository-write', 'active', 'controller', 'run:run-owned:1',
                    'deadline-owned', 'owned-detail', 'created-owned', 'updated-owned');
                 PRAGMA user_version=13;",
            )
            .expect("seed migration-013 admission custody");
        }

        let ledger = Ledger::open(&path).expect("open migration-013 database");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
        ledger.close().expect("close");

        let conn = rusqlite::Connection::open(&path).expect("open upgraded database");
        let rows = crate::admission::live_reservations(&conn).expect("decode reservations");
        assert_eq!(rows.len(), 2);
        let ownerless = rows
            .iter()
            .find(|row| row.reservation_id == "reservation-ownerless")
            .expect("ownerless row");
        assert_eq!(ownerless.state.as_str(), "reserved");
        assert_eq!(
            (
                ownerless.owner_kind.as_deref(),
                ownerless.owner_id.as_deref()
            ),
            (None, None)
        );
        assert_eq!(ownerless.last_error.as_deref(), Some("ownerless-detail"));
        assert_eq!(ownerless.updated_at, "updated-ownerless");
        assert!(ownerless.released_at.is_none());
        let owned = rows
            .iter()
            .find(|row| row.reservation_id == "reservation-owned")
            .expect("owned row");
        assert_eq!(owned.state.as_str(), "active");
        assert_eq!(owned.owner_kind.as_deref(), Some("controller"));
        assert_eq!(owned.owner_id.as_deref(), Some("run:run-owned:1"));
        assert_eq!(owned.last_error.as_deref(), Some("owned-detail"));
        assert_eq!(owned.updated_at, "updated-owned");
        assert!(owned.released_at.is_none());
    }

    #[test]
    fn representative_v10_v12_v15_v16_v17_v18_v19_v20_upgrades_preserve_rows_and_reach_v21() {
        for version in [10usize, 12, 15, 16, 17, 18, 19, 20] {
            let dir = tempfile::tempdir().expect("tempdir");
            let path = dir.path().join(format!("state-v{version}.db"));
            {
                let conn = rusqlite::Connection::open(&path).expect("raw database");
                for migration in MIGRATIONS.iter().take(version) {
                    conn.execute_batch(migration).expect("seed migration");
                }
                conn.execute_batch(
                    "INSERT INTO events (ts, run_id, kind, payload_json) VALUES
                       ('earlier-ts', 'legacy-subject', 'legacy.progress', '{\"n\":1}'),
                       ('later-ts', NULL, 'global.note', '{\"n\":2}');
                     INSERT INTO usage (
                       run_id, provider, model, input_tokens, output_tokens, cost_usd, ts
                     ) VALUES (
                       'legacy-subject', 'codex', 'legacy-model', 7, 11, 0.25, 'usage-ts'
                     );",
                )
                .expect("seed representative rows");
                conn.execute_batch(&format!("PRAGMA user_version={version};"))
                    .expect("mark schema version");
            }

            let ledger = Ledger::open(&path)
                .unwrap_or_else(|error| panic!("upgrade from v{version} failed: {error}"));
            assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
            assert_eq!(
                ledger
                    .list_events_by_kind("legacy.progress")
                    .expect("events")
                    .len(),
                1,
                "v{version} event row was lost"
            );
            let totals = ledger.usage_totals("legacy-subject").expect("usage");
            assert_eq!(totals.input_tokens, 7, "v{version} usage row was lost");
            assert_eq!(totals.output_tokens, 11, "v{version} usage row was lost");
            ledger.close().expect("close");

            let conn = rusqlite::Connection::open(&path).expect("raw migrated database");
            let index: String = conn
                .query_row(
                    "SELECT sql FROM sqlite_master WHERE type='index' AND name = ?",
                    ["events_run_event"],
                    |row| row.get(0),
                )
                .expect("migration 016 index");
            assert!(index.contains("WHERE run_id IS NOT NULL"));
        }
    }

    #[test]
    fn migration_021_preserves_owned_projection_foreign_keys_and_admits_orphan_reason() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state-v20-owned.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            // A REAL v20 operator database carries the narrow four-value
            // cleanup_reason CHECK; the in-place edit to MIGRATION_014 only
            // shapes fresh databases. Recover the legacy DDL from the edited
            // text so this fixture proves the 021 REBUILD widens it.
            let legacy_014 =
                MIGRATIONS[13].replace("'controller-dead','orphaned-submit'", "'controller-dead'");
            assert_ne!(
                legacy_014, MIGRATIONS[13],
                "the in-place migration 014 edit under test is present"
            );
            for (index, migration) in MIGRATIONS.iter().take(20).enumerate() {
                if index == 13 {
                    conn.execute_batch(&legacy_014)
                        .expect("seed legacy migration 014");
                } else {
                    conn.execute_batch(migration).expect("seed migration");
                }
            }
            conn.execute_batch(
                "INSERT INTO work_identities (
                   schema, subject_kind, subject_id, bead_id, display_title,
                   captured_at, source
                 ) VALUES (
                   'forged.work-identity/1', 'run', 'migration-owned-run',
                   'migration-owned-bead', 'Migration owned run', 't', 'durable'
                 );
                 INSERT INTO owned_herdr_sessions (
                   ownership_id, schema, owner_kind, subject_kind, subject_id,
                   controller_generation, pane_id, socket_path, protocol,
                   sentinel_path, lifecycle_state, cleanup_state,
                   cleanup_retry_budget, cleanup_retry_used, registered_at,
                   command_started_at, updated_at
                 ) VALUES (
                   'migration-owned', 'forged.owned-herdr-session/1',
                   'controller', 'run', 'migration-owned-run', 1,
                   'migration-pane', '/tmp/migration-herdr.sock', 19,
                   '/tmp/migration-owned/status', 'command-started',
                   'not-requested', 8, 0, 't', 't', 't'
                 );
                 INSERT INTO herdr_pane_projections (
                   projection_id, schema, target_kind, subject_kind, subject_id,
                   ownership_id, pane_id, socket_path, protocol,
                   controller_generation, metadata_source, desired_revision,
                   desired_release, metadata_next_seq, metadata_state,
                   metadata_retry_budget, metadata_retry_used,
                   lifecycle_next_seq, lifecycle_state, lifecycle_retry_budget,
                   lifecycle_retry_used, created_at, updated_at
                 ) VALUES (
                   'migration-projection', 'forged.herdr-pane-projection/1',
                   'controller', 'run', 'migration-owned-run', 'migration-owned',
                   'migration-pane', '/tmp/migration-herdr.sock', 19, 1,
                   'forged:projection:metadata:migration', 1, 0, 0, 'pending',
                   8, 0, 0, 'not-requested', 8, 0, 't', 't'
                 );
                 PRAGMA user_version=20;",
            )
            .expect("seed v20 owned projection");
            conn.execute(
                "UPDATE owned_herdr_sessions SET lifecycle_state = 'owner-dead',
                   cleanup_state = 'pending', cleanup_reason = 'orphaned-submit',
                   next_cleanup_at = 't', cleanup_requested_at = 't'
                 WHERE ownership_id = 'migration-owned'",
                [],
            )
            .expect_err("the narrow legacy CHECK rejects the new reason before migration");
        }

        let ledger = Ledger::open(&path).expect("upgrade owned v20 database");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
        assert!(ledger
            .get_owned_herdr_session("migration-owned")
            .expect("owned row")
            .is_some());
        ledger.close().expect("close");

        let conn = rusqlite::Connection::open(&path).expect("raw migrated database");
        conn.pragma_update(None, "foreign_keys", true)
            .expect("enable foreign keys");
        let projection_owner: String = conn
            .query_row(
                "SELECT ownership_id FROM herdr_pane_projections \
                 WHERE projection_id = 'migration-projection'",
                [],
                |row| row.get(0),
            )
            .expect("projection survived");
        assert_eq!(projection_owner, "migration-owned");
        let foreign_key_errors: i64 = conn
            .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |row| {
                row.get(0)
            })
            .expect("foreign key check");
        assert_eq!(foreign_key_errors, 0);
        conn.execute(
            "UPDATE owned_herdr_sessions SET lifecycle_state = 'owner-dead',
               cleanup_state = 'pending', cleanup_reason = 'orphaned-submit',
               next_cleanup_at = 't', cleanup_requested_at = 't'
             WHERE ownership_id = 'migration-owned'",
            [],
        )
        .expect("new cleanup reason is admitted");
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
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
        ledger.close().expect("close");
    }

    #[test]
    fn migration_014_closes_protocol_and_freezes_only_identity() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        Ledger::open(&path)
            .expect("migrate")
            .close()
            .expect("close");
        let conn = rusqlite::Connection::open(&path).expect("raw");
        let insert = |id: &str, protocol: i64| {
            conn.execute(
                "INSERT INTO owned_herdr_sessions (
                   ownership_id, schema, owner_kind, subject_kind, subject_id,
                   controller_generation, pane_id, socket_path, protocol, sentinel_path,
                   lifecycle_state, cleanup_state, cleanup_retry_budget,
                   cleanup_retry_used, registered_at, updated_at
                 ) VALUES (?1, 'forged.owned-herdr-session/1', 'controller', 'run', 'run-1',
                           1, ?2, '/tmp/herdr.sock', ?3, ?4,
                           'registered', 'not-requested', 8, 0, 't', 't')",
                rusqlite::params![id, format!("pane-{id}"), protocol, format!("/tmp/{id}")],
            )
        };
        insert("bad-protocol", 18).expect_err("unknown protocol is closed");
        insert("owned-1", 19).expect("valid identity");
        conn.execute(
            "UPDATE owned_herdr_sessions SET pane_id = 'foreign-pane' \
             WHERE ownership_id = 'owned-1'",
            [],
        )
        .expect_err("identity trigger rejects rewrites");
        conn.execute(
            "UPDATE owned_herdr_sessions SET lifecycle_state = 'owner-dead' \
             WHERE ownership_id = 'owned-1'",
            [],
        )
        .expect("lifecycle remains mutable without invented command-start evidence");
    }

    #[test]
    fn v0_database_migrates_additively_without_losing_runs() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        {
            let conn = rusqlite::Connection::open(&path).expect("raw database");
            conn.execute_batch(MIGRATION_001).expect("v0 schema");
            conn.execute(
                "INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, state, stop_reason, \
                 created_at, updated_at) VALUES \
                 ('old-run', 'old-bead', '/repo', 'main', 'forged/old', 'stopped', \
                  'legacy stop', 't', 't')",
                [],
            )
            .expect("old run");
            conn.execute_batch("PRAGMA user_version=1;")
                .expect("mark v0");
        }
        let ledger = Ledger::open(&path).expect("migrate");
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
        let old = ledger.get_run("old-run").expect("old run");
        assert_eq!(old.work_id, "old-bead");
        assert_eq!(old.stop_reason.as_deref(), Some("legacy stop"));
        assert_eq!(old.terminal_outcome, None, "migration invents no outcome");
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
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 26);
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
