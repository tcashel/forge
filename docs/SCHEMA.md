# Data Schema — Forge → Juicer

SQLite schema. **Shared across both tracks** — Track A (Forge, TypeScript) writes it; Track B (Juicer, Rust) reads the exact same schema. This is intentional: it's the contract that carries plan content, critic configs, and run history forward from prototype to product.

Tables grouped by the roadmap phase that introduces them. Schema is migration-driven; new tables and columns can be added without disrupting earlier phases. Migration files are plain SQL, runnable from either language.

Conventions:
- All IDs are UUIDs (text in SQLite)
- All timestamps are ISO-8601 UTC (text)
- All JSON columns store structured data, queryable via JSON1
- Soft deletes via `deleted_at`; hard deletes only for ephemeral tables

---

## Phase 1 schema (plan workspace + critic panel + library)

### `plans`

```sql
CREATE TABLE plans (
    id                  TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    repo_path           TEXT,
    repo_branch         TEXT,
    stage               TEXT NOT NULL,              -- drafting | critiquing | locked | archived
                                                    -- (decomposed | running | reviewing | completed added in phase 2)
    intent              TEXT,
    current_version_id  TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    locked_at           TEXT,
    archived_at         TEXT,
    metadata            TEXT                        -- JSON: tags, color, custom fields
);

CREATE INDEX idx_plans_stage ON plans(stage);
CREATE INDEX idx_plans_updated ON plans(updated_at DESC);
```

### `plan_versions`

```sql
CREATE TABLE plan_versions (
    id              TEXT PRIMARY KEY,
    plan_id         TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    document        TEXT NOT NULL,                  -- markdown source
    sections        TEXT NOT NULL,                  -- JSON: structured section map
    open_questions  TEXT,                           -- JSON array
    created_by      TEXT NOT NULL,                  -- "user" | "agent:<adapter>"
    created_at      TEXT NOT NULL,
    notes           TEXT,
    UNIQUE(plan_id, version_number)
);

CREATE INDEX idx_plan_versions_plan ON plan_versions(plan_id, version_number DESC);
```

### `notes`

```sql
CREATE TABLE notes (
    id              TEXT PRIMARY KEY,
    plan_id         TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    body            TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE INDEX idx_notes_plan ON notes(plan_id);
```

### `critic_configs`

```sql
CREATE TABLE critic_configs (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    prompt_template TEXT NOT NULL,
    agent_adapter   TEXT NOT NULL,
    model           TEXT,
    role            TEXT NOT NULL,                  -- plan | code | both
    enabled         BOOLEAN NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);
```

### `critic_panels`

```sql
CREATE TABLE critic_panels (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    critic_ids      TEXT NOT NULL,                  -- JSON array of critic_config IDs
    is_default      BOOLEAN NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);
```

### `critic_runs`

```sql
CREATE TABLE critic_runs (
    id                  TEXT PRIMARY KEY,
    critic_config_id    TEXT NOT NULL REFERENCES critic_configs(id),
    target_kind         TEXT NOT NULL,              -- plan_version | job (job in phase 2+)
    target_id           TEXT NOT NULL,
    session_id          TEXT REFERENCES sessions(id),
    findings            TEXT,                       -- JSON array
    severity_summary    TEXT,                       -- pass | concerns | block
    started_at          TEXT NOT NULL,
    finished_at         TEXT,
    state               TEXT NOT NULL
);

CREATE INDEX idx_critic_runs_target ON critic_runs(target_kind, target_id);
```

### `critic_syntheses`

```sql
CREATE TABLE critic_syntheses (
    id              TEXT PRIMARY KEY,
    target_kind     TEXT NOT NULL,
    target_id       TEXT NOT NULL,
    critic_run_ids  TEXT NOT NULL,                  -- JSON array
    agreements      TEXT,                           -- JSON
    disagreements   TEXT,                           -- JSON with crux
    recommendation  TEXT,                           -- approve | revise | block
    created_at      TEXT NOT NULL
);

CREATE INDEX idx_synth_target ON critic_syntheses(target_kind, target_id);
```

### `disagreement_adjudications`

```sql
CREATE TABLE disagreement_adjudications (
    id              TEXT PRIMARY KEY,
    synthesis_id    TEXT NOT NULL REFERENCES critic_syntheses(id) ON DELETE CASCADE,
    disagreement_key TEXT NOT NULL,
    decision        TEXT NOT NULL,                  -- accept_A | accept_B | accept_C | hybrid | dismiss
    decision_text   TEXT,
    decided_at      TEXT NOT NULL,
    UNIQUE(synthesis_id, disagreement_key)
);

CREATE INDEX idx_adjudications_synth ON disagreement_adjudications(synthesis_id);
```

Required for the lock gate: a plan version cannot be locked unless every disagreement in its most recent synthesis has an adjudication row.

### `sessions`

```sql
CREATE TABLE sessions (
    id              TEXT PRIMARY KEY,
    purpose         TEXT NOT NULL,                  -- drafting | critique | synthesis | execution | review | fix | improvement
                                                    -- (decomposition added later)
    related_id      TEXT,                           -- FK varies by purpose
    agent_adapter   TEXT NOT NULL,
    model           TEXT,
    started_at      TEXT NOT NULL,
    finished_at     TEXT,
    state           TEXT NOT NULL,                  -- running | completed | failed | killed
    pid             INTEGER,
    cwd             TEXT,
    command_line    TEXT,
    exit_code       INTEGER,
    error           TEXT,
    metrics         TEXT                            -- JSON: tokens, cost estimate, duration
);

CREATE INDEX idx_sessions_related ON sessions(related_id);
CREATE INDEX idx_sessions_state ON sessions(state);
```

### `session_events`

```sql
CREATE TABLE session_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sequence        INTEGER NOT NULL,
    timestamp       TEXT NOT NULL,
    kind            TEXT NOT NULL,                  -- stdout | stderr | tool_call | tool_result | reasoning | structured | system | hook_denial
    payload         TEXT NOT NULL,
    UNIQUE(session_id, sequence)
);

CREATE INDEX idx_session_events_session ON session_events(session_id, sequence);
```

Session events are written for *all* agent activity and are the source for the `debug_session` view. The phase 2 `in_flight` view does **not** read this table; it reads from `jobs`.

### `plan_search_index`

```sql
CREATE VIRTUAL TABLE plan_search_index USING fts5(
    plan_id UNINDEXED,
    title,
    document,
    intent
);
```

Populated via an `AFTER INSERT ON plan_versions` trigger that joins `plans` to pull in `title` + `intent` (those columns live on `plans`, not `plan_versions`, so the external-content shape originally specified here can't satisfy FTS5's column list). The trigger copies the relevant text into the FTS index at insert time. See [ADR-0023](./adr/0023-sqlite-cutover-track-a.md) for the implementation context.

### `settings`

```sql
CREATE TABLE settings (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL,                  -- JSON-serialized
    updated_at      TEXT NOT NULL
);
```

Known keys, phase 1:
- `theme` — dark | light | system
- `default_critic_panel_id` — UUID
- `default_agent_adapter` — string
- `max_concurrent_critics` — integer (default 6)

---

## Phase 2 additions (jobs + review + triage)

> **Reshape pending — see [ADR-0028](./adr/0028-spec-dependency-graph-and-orchestration-agent.md) (Proposed).** The `tasks` table below models only an *intra-plan* DAG (`dependencies` is a flat JSON array of task IDs within one plan). ADR-0028 introduces a **cross-spec dependency graph** (`work_items` nodes with a materialization lifecycle + external-ref/sync columns, and typed `work_item_edges`: blocks/blocked-by, depends-on, related, epic→child). When A2 lands, `tasks` becomes the decomposition *beneath* a single materialized spec; the graph spanning specs is the new top-level structure. Do not build this section's schema until ADR-0028 is Accepted.

### `tasks`

```sql
CREATE TABLE tasks (
    id                  TEXT PRIMARY KEY,
    plan_id             TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    plan_version_id     TEXT NOT NULL REFERENCES plan_versions(id),
    sequence            INTEGER NOT NULL,
    title               TEXT NOT NULL,
    spec                TEXT NOT NULL,
    plan_section_refs   TEXT,                       -- JSON array
    estimated_diff_size INTEGER,
    dependencies        TEXT,                       -- JSON array of task IDs
    state               TEXT NOT NULL,              -- queued | ready | running | completed | failed | cancelled | kicked_back
    agent_preference    TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    started_at          TEXT,
    completed_at        TEXT
);

CREATE INDEX idx_tasks_plan ON tasks(plan_id, sequence);
CREATE INDEX idx_tasks_state ON tasks(state);
```

### `jobs`

The headless execution record. Renamed from `task_runs` to reinforce the "sessions are jobs" premise.

```sql
CREATE TABLE jobs (
    id                  TEXT PRIMARY KEY,
    task_id             TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    run_number          INTEGER NOT NULL,           -- 1 = initial, 2+ = fix iterations
    run_kind            TEXT NOT NULL,              -- initial | fix | speculative | dry_run
    session_id          TEXT REFERENCES sessions(id),
    worktree_path       TEXT,
    branch_name         TEXT,
    state               TEXT NOT NULL,              -- pending | running | succeeded | failed | timeout | cancelled | hook_denied
    blocker_summary     TEXT,                       -- short human-readable reason when blocked/failed
    eta_seconds         INTEGER,                    -- estimated remaining time, when computable
    started_at          TEXT,
    finished_at         TEXT,
    exit_code           INTEGER,
    summary             TEXT,                       -- outcome description
    UNIQUE(task_id, run_number)
);

CREATE INDEX idx_jobs_task ON jobs(task_id, run_number DESC);
CREATE INDEX idx_jobs_state ON jobs(state);
```

The `in_flight` view queries this table almost exclusively. `blocker_summary` and `eta_seconds` are computed by the job runner and updated as jobs progress — they're what the UI surfaces, not raw stdout.

### `artifacts`

```sql
CREATE TABLE artifacts (
    id              TEXT PRIMARY KEY,
    job_id          TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL,                  -- diff | pr_description | generated_file | log | trace
    path            TEXT,
    content         TEXT,
    content_blob_id TEXT,
    metadata        TEXT,
    created_at      TEXT NOT NULL
);

CREATE INDEX idx_artifacts_job ON artifacts(job_id);
```

### `blobs`

```sql
CREATE TABLE blobs (
    id              TEXT PRIMARY KEY,               -- sha256 of content
    content         BLOB NOT NULL,
    size            INTEGER NOT NULL,
    content_type    TEXT,
    created_at      TEXT NOT NULL
);
```

### `review_queue_items`

```sql
CREATE TABLE review_queue_items (
    id              TEXT PRIMARY KEY,
    job_id          TEXT NOT NULL REFERENCES jobs(id),
    plan_id         TEXT NOT NULL REFERENCES plans(id),
    risk_class      TEXT NOT NULL,                  -- safe | needs_eyes | broken
    risk_signals    TEXT,                           -- JSON: diff_size, critic_flags, test_status, scope_match
    fix_iterations  INTEGER NOT NULL DEFAULT 0,
    landed_at       TEXT NOT NULL,
    triaged_at      TEXT,
    decision        TEXT,                           -- approved | rejected | kicked_back | null
    decided_by      TEXT,
    decision_notes  TEXT
);

CREATE INDEX idx_review_queue_decision ON review_queue_items(decision, landed_at);
CREATE INDEX idx_review_queue_risk ON review_queue_items(risk_class, landed_at);
```

### Phase 2 settings additions
- `max_concurrent_jobs` — integer (default 4)
- `auto_fix_iterations` — integer (default 2)
- `notification_thresholds` — JSON object
- `worktree_root` — path
- `morning_triage_threshold_minutes` — integer
- `default_job_timeout_minutes` — integer (default 30)

---

## Phase 3 additions (multi-agent + fleet)

### `agent_configs`

```sql
CREATE TABLE agent_configs (
    id              TEXT PRIMARY KEY,
    adapter         TEXT NOT NULL,
    scope           TEXT NOT NULL,                  -- global | repo
    repo_path       TEXT,
    binary_path     TEXT,
    extra_args      TEXT,                           -- JSON array
    env_overrides   TEXT,                           -- JSON object
    enabled         BOOLEAN NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE UNIQUE INDEX idx_agent_configs_scope ON agent_configs(adapter, scope, repo_path);
```

### `remote_hosts` *(deferred to phase 5)*

```sql
CREATE TABLE remote_hosts (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    ssh_target      TEXT NOT NULL,
    workspace_root  TEXT NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT 1,
    capacity        INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL
);
```

---

## Phase 4 additions (Juice flywheel + outcome learning)

### `outcome_records`

```sql
CREATE TABLE outcome_records (
    id                  TEXT PRIMARY KEY,
    plan_id             TEXT NOT NULL REFERENCES plans(id),
    shipped             BOOLEAN,
    shipped_at          TEXT,
    reverted            BOOLEAN NOT NULL DEFAULT 0,
    reverted_at         TEXT,
    bug_reports_30d     INTEGER,
    user_satisfaction   INTEGER,                    -- 1-5 self-rated, optional
    notes               TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
);
```

### `juice_sync_state`

```sql
CREATE TABLE juice_sync_state (
    repo_path           TEXT PRIMARY KEY,
    last_config_read    TEXT,
    last_history_write  TEXT,
    juice_install_path  TEXT,
    config_files_hash   TEXT,
    notes               TEXT
);
```

---

## Migration strategy

- Migrations live in `migrations/` (Track A) and `crates/juicer-storage/migrations/` (Track B), maintained as identical SQL files
- Applied at app startup, idempotent
- Schema version tracked in `_migration_history` table
- Forward-only; no downgrades

---

## Storage location

**Track A (Forge):** lives under `~/.forge/` rather than macOS Application Support so the database sits alongside the existing markdown specs, agent logs, and per-repo config that predate the SQLite cutover. See [ADR-0023](./adr/0023-sqlite-cutover-track-a.md) for the rationale; this is a deliberate Track A deviation, not a product decision.
```
~/.forge/
├── forge.db
├── forge.db-wal
├── forge.db-shm
├── specs/                     # markdown spec bodies (kept on disk for `git diff`)
├── runs/                      # agent.log + meta.json (deprecating in COO-84 Phase 5)
├── critiques/                 # per-attempt critic + synth output
└── logs/                      # Phase 5: agent.log relocates to logs/<job_id>.log
```

**Track B (Juicer):**
```
~/Library/Application Support/Juicer/
├── juicer.db
├── juicer.db-wal
├── juicer.db-shm
├── worktrees/                 # phase B2+
│   └── <repo-id>/
│       └── <task-id>/
├── blobs/
└── logs/
    └── juicer.log
```

Juicer can also be pointed at a Forge database via a `--db` flag or migration tool, allowing the founder's plan library and run history to carry forward across the Track A → Track B transition.

Juice's data lives at its own path; phase 4 integration reads/writes via the documented contract.

---

## Open schema questions

- **Plan section references in tasks.** UUID-based or section-name-based? Lean section-name with rename-tracking.
- **Multi-repo plans.** Currently `plans.repo_path` is single. May need a join table `plan_repos` later.
- **PR metadata.** Phase 2 stores in `artifacts`; may need a separate `pull_requests` table once PR lifecycle (state changes, GitHub comment sync) gets fleshed out. GitHub comment sync for review findings is now handled statelessly via an embedded marker rather than a local table — see [`adr/0027-publish-pr-review-findings-to-github.md`](adr/0027-publish-pr-review-findings-to-github.md).
- **Session event size.** Large outputs may need blob storage. Punt until we see real volume.
- **Synthesis JSON schema.** Define a stable shape before phase 1 ships so adjudication and critique replay can build on it reliably.
- **Job blocker_summary structure.** Free text initially? Eventually a structured `(kind, message)` for routing in the UI? Start free text, evolve.
