-- Phase 1 schema — plan workspace + critic panel + library.
-- Tracks docs/SCHEMA.md verbatim. Track B (Juicer, Rust) applies the
-- identical file, so changes here MUST stay portable SQLite SQL.

CREATE TABLE plans (
    id                  TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    repo_path           TEXT,
    repo_branch         TEXT,
    stage               TEXT NOT NULL,
    intent              TEXT,
    current_version_id  TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    locked_at           TEXT,
    archived_at         TEXT,
    metadata            TEXT
);

CREATE INDEX idx_plans_stage ON plans(stage);
CREATE INDEX idx_plans_updated ON plans(updated_at DESC);

CREATE TABLE plan_versions (
    id              TEXT PRIMARY KEY,
    plan_id         TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    document        TEXT NOT NULL,
    sections        TEXT NOT NULL,
    open_questions  TEXT,
    created_by      TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    notes           TEXT,
    UNIQUE(plan_id, version_number)
);

CREATE INDEX idx_plan_versions_plan ON plan_versions(plan_id, version_number DESC);

CREATE TABLE notes (
    id              TEXT PRIMARY KEY,
    plan_id         TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    body            TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE INDEX idx_notes_plan ON notes(plan_id);

CREATE TABLE critic_configs (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    prompt_template TEXT NOT NULL,
    agent_adapter   TEXT NOT NULL,
    model           TEXT,
    role            TEXT NOT NULL,
    enabled         INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE critic_panels (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    critic_ids      TEXT NOT NULL,
    is_default      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE sessions (
    id              TEXT PRIMARY KEY,
    purpose         TEXT NOT NULL,
    related_id      TEXT,
    agent_adapter   TEXT NOT NULL,
    model           TEXT,
    started_at      TEXT NOT NULL,
    finished_at     TEXT,
    state           TEXT NOT NULL,
    pid             INTEGER,
    cwd             TEXT,
    command_line    TEXT,
    exit_code       INTEGER,
    error           TEXT,
    metrics         TEXT
);

CREATE INDEX idx_sessions_related ON sessions(related_id);
CREATE INDEX idx_sessions_state ON sessions(state);

CREATE TABLE critic_runs (
    id                  TEXT PRIMARY KEY,
    critic_config_id    TEXT NOT NULL REFERENCES critic_configs(id),
    target_kind         TEXT NOT NULL,
    target_id           TEXT NOT NULL,
    session_id          TEXT REFERENCES sessions(id),
    findings            TEXT,
    severity_summary    TEXT,
    started_at          TEXT NOT NULL,
    finished_at         TEXT,
    state               TEXT NOT NULL
);

CREATE INDEX idx_critic_runs_target ON critic_runs(target_kind, target_id);

CREATE TABLE critic_syntheses (
    id              TEXT PRIMARY KEY,
    target_kind     TEXT NOT NULL,
    target_id       TEXT NOT NULL,
    critic_run_ids  TEXT NOT NULL,
    agreements      TEXT,
    disagreements   TEXT,
    recommendation  TEXT,
    created_at      TEXT NOT NULL
);

CREATE INDEX idx_synth_target ON critic_syntheses(target_kind, target_id);

CREATE TABLE disagreement_adjudications (
    id              TEXT PRIMARY KEY,
    synthesis_id    TEXT NOT NULL REFERENCES critic_syntheses(id) ON DELETE CASCADE,
    disagreement_key TEXT NOT NULL,
    decision        TEXT NOT NULL,
    decision_text   TEXT,
    decided_at      TEXT NOT NULL,
    UNIQUE(synthesis_id, disagreement_key)
);

CREATE INDEX idx_adjudications_synth ON disagreement_adjudications(synthesis_id);

CREATE TABLE session_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sequence        INTEGER NOT NULL,
    timestamp       TEXT NOT NULL,
    kind            TEXT NOT NULL,
    payload         TEXT NOT NULL,
    UNIQUE(session_id, sequence)
);

CREATE INDEX idx_session_events_session ON session_events(session_id, sequence);

-- FTS5 search index over plan_versions joined with plans (for title/intent).
-- SCHEMA.md prescribes `content='plan_versions' content_rowid='rowid'` but
-- that fails at SELECT time because plan_versions has no `title`/`intent`
-- columns (they live on plans). Using a self-contained FTS5 table that
-- denormalizes those fields via triggers at write time. The plan_versions
-- AFTER INSERT trigger joins to plans for title + intent at the moment a
-- version lands. Update triggers on plans.title / plans.intent are
-- deliberately deferred — first pass keeps search "good as of the version
-- that was written"; we'll add a rebuild trigger when search becomes
-- user-facing. SCHEMA.md amendment tracked in the new ADR.
CREATE VIRTUAL TABLE plan_search_index USING fts5(
    plan_id UNINDEXED,
    title,
    document,
    intent
);

CREATE TRIGGER plan_versions_ai_fts AFTER INSERT ON plan_versions BEGIN
  INSERT INTO plan_search_index(rowid, plan_id, title, document, intent)
  SELECT NEW.rowid, NEW.plan_id, p.title, NEW.document, p.intent
  FROM plans p WHERE p.id = NEW.plan_id;
END;

CREATE TRIGGER plan_versions_ad_fts AFTER DELETE ON plan_versions BEGIN
  DELETE FROM plan_search_index WHERE rowid = OLD.rowid;
END;

CREATE TABLE settings (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);
