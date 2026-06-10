# Architecture — Track B (Juicer, Rust + GPUI) — ARCHIVED

> Archived 2026-06-09 with the Track B roadmap (see `ROADMAP-track-b-juicer.md`).
> Forge (TypeScript) is the deliverable; this returns only if a product-shaped
> need revives it.

# Track B — Juicer architecture (Rust + GPUI)

Built from Track A's validated shape. The polished, paid product.

## Stack

- **Language:** Rust
- **UI framework:** GPUI (Apache 2.0, from Zed). License-permissive; closed-source builds allowed.
- **Async runtime:** Tokio
- **Database:** sqlx
- **Process management:** `tokio::process`
- **Logging:** `tracing` + `tracing-subscriber`
- **Errors:** `anyhow` + `thiserror`

License audit: all dependencies must be Apache-2.0, MIT, or BSD. No GPL/LGPL/AGPL.

## Component map

```
┌─────────────────────────────────────────────────────────────────┐
│                         GPUI App Shell                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │      View Layer         │
        │  (plan workspace,       │
        │   critic panel,         │
        │   plan library,         │
        │   in flight,            │
        │   review queue,         │
        │   morning digest,       │
        │   fleet view)           │
        └────────────┬────────────┘
                     │ subscribes to
        ┌────────────┴────────────┐
        │      Event Bus          │
        └────────────┬────────────┘
                     │
   ┌─────────────────┼──────────────────┬─────────────────────┐
   │                 │                  │                     │
┌──┴────────┐  ┌─────┴────────┐  ┌──────┴────────┐  ┌─────────┴──────┐
│ Plan      │  │ Critic Pool  │  │ Orchestrator  │  │ Review         │
│ Engine    │  │ + Synthesis  │  │ (headless)    │  │ Pipeline       │
└──┬────────┘  └─────┬────────┘  └──────┬────────┘  └─────────┬──────┘
   │                 │                  │                     │
   └─────────────────┴────────┬─────────┴─────────────────────┘
                              │
                       ┌──────┴───────┐
                       │   Storage    │
                       │   (SQLite)   │
                       │ (Track A     │
                       │  compatible) │
                       └──────────────┘
                              │
                       ┌──────┴────────────────────┐
                       │  Juice Integration        │ ← phase B4
                       │  (read configs, write     │
                       │   session history)        │
                       └───────────────────────────┘
```

## Crate structure (Track B)

Cargo workspace:

```
juicer/
├── Cargo.toml
├── crates/
│   ├── juicer-app/              # B0 — GPUI app shell, main binary
│   ├── juicer-views/            # B1 — view layer, GPUI components
│   ├── juicer-bus/              # B1 — event bus types and dispatch
│   ├── juicer-core/             # B1 — plan engine, domain logic
│   ├── juicer-critic/           # B1 — critic pool, synthesis
│   ├── juicer-agents/           # B1 (drafting/critique), B2+ (full)
│   ├── juicer-storage/          # B1 — SQLite layer, migrations (schema compatible with Track A)
│   ├── juicer-types/            # B1 — shared domain types
│   ├── juicer-test-utils/       # B1 — test fixtures, mock agents
│   ├── juicer-orchestrator/     # B2 — subprocess + worktree
│   ├── juicer-review/           # B2 — review pipeline
│   └── juicer-juice-bridge/     # B4 — Juice integration
└── docs/
```

The crate names mirror Track A's module names (`juicer-core` ↔ `src/plan`, `juicer-critic` ↔ `src/critic`, etc.) — this is deliberate and makes the conceptual port straightforward.

## Subsystems (Track B)

Identical to Track A in responsibility and shape (because shape was validated). Different implementation language and tooling.

### 1. App Shell
GPUI window, top-level layout, command palette, global keyboard, theming, settings, OS notifications.

### 2. View Layer
Discrete view modules, each subscribing to the event bus.

- `plan_workspace` — single-plan editor + drafting-agent collaborator
- `critic_panel` — configuration, invocation, synthesis surface
- `plan_library` — list/search of plans
- `in_flight` — compact job status list (name, agent, phase, elapsed, ETA). **No streaming output by default.**
- `review_queue` — risk-routed PR triage
- `morning_digest` — digest screen
- `session_debug` — optional drill-down to raw session transcript, accessed via keyboard shortcut. Demoted UI: not in primary navigation, not opened automatically.
- `fleet_view` — multi-plan home screen (B3)
- `notes_panel` — scoped notes attached to plans (B3)
- `agent_directory` — agent config UI (B4)
- `juice_integration_panel` — flywheel visibility (B4)

### 3. Event Bus
`tokio::sync::broadcast` for fan-out, `mpsc` for command channels.

Same event categories as Track A. Same invariant: `JobEvent` carries summary state only; raw output goes only to storage.

### 4. Plan Engine
Same responsibilities as Track A.

### 5. Critic Pool + Synthesis
Same responsibilities as Track A.

### 6. Orchestrator
- `AgentAdapter` trait with `spawn`, `poll_status`, `terminate`, `capture_artifact`. No `stream_to_ui` method.
- Worktree Manager: git worktree CRUD under managed directory
- Subprocess Supervisor: Tokio-based, owns N concurrent agent processes
- Phase detector
- Task Scheduler

**Design principle:** the orchestrator is the only subsystem that touches subprocess stdio. The View Layer never subscribes to raw subprocess output. This enforces the job-not-show thesis at the architectural level.

### 7. Review Pipeline
Same responsibilities as Track A.

### 8. Storage
SQLite via `sqlx`. **Same schema as Track A** — migration system in Rust applies the same migration files (translated to sqlx-compatible if needed). Track B can open a Forge database and operate on it without conversion.

### 9. Juice Integration (B4)
Bidirectional sync between Juicer and Juice via shared filesystem and SQLite contracts.

---

## Track A → Track B port table

What changes, what doesn't:

| Concern | Track A (TS) | Track B (Rust) | Carries over? |
|---|---|---|---|
| Plan document format | Markdown + frontmatter on disk | Same | ✅ Identical |
| Database schema | SQLite, defined in `SCHEMA.md` | Same SQLite, same schema | ✅ Identical |
| Plan library content | Stored in SQLite + filesystem | Reads Track A's data | ✅ Identical |
| Critic prompts | Stored as DB rows | Same | ✅ Identical |
| Agent adapter pattern | TS interface | Rust trait | ✅ Conceptually identical |
| Subprocess supervision | Node `child_process` | `tokio::process` | ⚠️ Re-implemented |
| Event bus | Node EventEmitter / typed wrapper | `tokio::sync::broadcast` | ⚠️ Re-implemented |
| UI components | Web / Tauri WebView | GPUI | ❌ Rebuilt |
| UI workflow shape | Validated in Track A | Same shape in Track B | ✅ This is the whole point |
| Module structure | `src/plan/`, etc. | `crates/juicer-core/`, etc. | ✅ Mirror naming |

---

## Concurrency model

### Track A
- Node event loop + async/await
- Subprocess agents managed via `child_process`
- Critics run in parallel with a concurrency limit (e.g., 6)

### Track B
- Tokio async runtime
- GPUI owns the main thread / UI executor; long-running work on Tokio
- Subprocess agents managed via `tokio::process`
- Critics run as parallel agent invocations under a semaphore
- Database access through a connection pool; writes serialized through a single writer task
- Event bus broadcast: many subscribers; late subscribers see only future events

### Caps (configurable, identical across tracks)
- Max concurrent critics: default 6
- Max concurrent execution agents: default 4
- Auto-fix loop budget: default 2 iterations
- Per-agent timeout: default 30 min

---

## Security and privacy (both tracks)

- All data local to user's machine
- API keys / agent auth: handled by agents themselves; no credentials stored
- **Hook-policy enforcement happens at the agent level.** Users configure Claude Code hooks, opencode permissions, or custom scripts. The orchestrator trusts the agent's hook configuration. If you don't trust your agent's hooks, fix that upstream — neither Forge nor Juicer is the place to layer additional approval prompts.
- Subprocess spawning: explicit allowlist of agent binaries + argument templates
- Worktrees scoped to user-owned directories
- Telemetry: opt-in only, anonymized, never includes plan content or code

---

## Open architectural questions

### Track A (resolve early)
- **UI shell:** web dashboard vs. Tauri wrapper. Decide in A0.
- **Plan document representation:** markdown + frontmatter recommended; finalize early A1.
- **Forge's existing UI:** keep, rewrite, or replace? Likely replace, but evaluate in A0.
- **Phase detector heuristics:** how does the orchestrator infer task phase? Initially pattern-match on tool calls; may evolve to structured agent reporting in A2.
- **ETA model:** rolling average per (agent, task-size-bucket)? Refine empirically through A2.

### Track B
- **GPUI version pinning.** Pin to specific commit; manual upgrades.
- **Disagreement adjudication UX:** inline vs. modal vs. separate workspace. Decided by Track A validation; refined in B1.
- **Multi-window vs. single-window:** multi-window for fleet view later; single window through B2.
- **Juice integration contract:** filesystem vs. SQLite read-across vs. IPC. Decide closer to B4.

---

## What this architecture optimizes for

- **Phase-level differentiation velocity.** Most differentiated subsystems ship first in both tracks.
- **Subsystem replaceability.** Any subsystem can be replaced without rewriting others.
- **Track A → Track B portability.** Schema and conceptual structure carry forward; only the surface implementation rebuilds.
- **Testability.** Pure subsystems testable headlessly with mock adapters.
- **The headless thesis at the structural level.** Streaming output can't accidentally leak into primary UI surfaces in either track.
- **Local-first commitment.** No subsystem assumes a network.

## What this architecture explicitly does not optimize for

- **Multi-tenancy.** Single-user app.
- **Horizontal scale.** One operator, one machine.
- **Real-time collaboration.** Post-Track B problem.
- **Live session viewing.** That is what we are not building.
