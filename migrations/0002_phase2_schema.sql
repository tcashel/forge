-- Phase 2 schema — jobs + review + triage.
-- See docs/SCHEMA.md "Phase 2 additions". Track B applies the same file.

CREATE TABLE tasks (
    id                  TEXT PRIMARY KEY,
    plan_id             TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    plan_version_id     TEXT NOT NULL REFERENCES plan_versions(id),
    sequence            INTEGER NOT NULL,
    title               TEXT NOT NULL,
    spec                TEXT NOT NULL,
    plan_section_refs   TEXT,
    estimated_diff_size INTEGER,
    dependencies        TEXT,
    state               TEXT NOT NULL,
    agent_preference    TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    started_at          TEXT,
    completed_at        TEXT
);

CREATE INDEX idx_tasks_plan ON tasks(plan_id, sequence);
CREATE INDEX idx_tasks_state ON tasks(state);

CREATE TABLE jobs (
    id                  TEXT PRIMARY KEY,
    task_id             TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    run_number          INTEGER NOT NULL,
    run_kind            TEXT NOT NULL,
    session_id          TEXT REFERENCES sessions(id),
    worktree_path       TEXT,
    branch_name         TEXT,
    state               TEXT NOT NULL,
    blocker_summary     TEXT,
    eta_seconds         INTEGER,
    started_at          TEXT,
    finished_at         TEXT,
    exit_code           INTEGER,
    summary             TEXT,
    UNIQUE(task_id, run_number)
);

CREATE INDEX idx_jobs_task ON jobs(task_id, run_number DESC);
CREATE INDEX idx_jobs_state ON jobs(state);

CREATE TABLE blobs (
    id              TEXT PRIMARY KEY,
    content         BLOB NOT NULL,
    size            INTEGER NOT NULL,
    content_type    TEXT,
    created_at      TEXT NOT NULL
);

CREATE TABLE artifacts (
    id              TEXT PRIMARY KEY,
    job_id          TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL,
    path            TEXT,
    content         TEXT,
    content_blob_id TEXT REFERENCES blobs(id),
    metadata        TEXT,
    created_at      TEXT NOT NULL
);

CREATE INDEX idx_artifacts_job ON artifacts(job_id);

CREATE TABLE review_queue_items (
    id              TEXT PRIMARY KEY,
    job_id          TEXT NOT NULL REFERENCES jobs(id),
    plan_id         TEXT NOT NULL REFERENCES plans(id),
    risk_class      TEXT NOT NULL,
    risk_signals    TEXT,
    fix_iterations  INTEGER NOT NULL DEFAULT 0,
    landed_at       TEXT NOT NULL,
    triaged_at      TEXT,
    decision        TEXT,
    decided_by      TEXT,
    decision_notes  TEXT
);

CREATE INDEX idx_review_queue_decision ON review_queue_items(decision, landed_at);
CREATE INDEX idx_review_queue_risk ON review_queue_items(risk_class, landed_at);
