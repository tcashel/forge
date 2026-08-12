# Architecture — Forge

Technical architecture for Forge (TypeScript) — the deliverable per [`ROADMAP.md`](ROADMAP.md). The Rust + GPUI "Track B" architecture is archived at [`archive/ARCHITECTURE-track-b-juicer.md`](archive/ARCHITECTURE-track-b-juicer.md) and returns only if a product-shaped need revives it.

See `BUILD_PATH.md` for the history of the two-track model and `ROADMAP.md` for what ships when.

---

## Guiding principles

1. **Local-first.** SQLite is the source of truth. No required network.
2. **Subprocess agents, headless.** Spawn, monitor status, capture artifact. No streaming UI by default.
3. **Hook-policy enforcement is the agent's job, not the orchestrator's.** No tool-call permission prompts at runtime.
4. **Event-driven UI.** A central event bus drives reactive surfaces.
5. **Plans are documents, not chats.** Document-shaped iteration with an agent collaborator.
6. **Sessions are jobs.** Status, ETA, artifact. The transcript is a debug detail, not a primary surface.
7. **Schema evolves through migrations.** SQLite is the durable contract; the plan library carries forward.

The job-not-show thesis is enforced architecturally: the orchestrator captures subprocess output to storage, but the primary UI subscribes only to lifecycle events (status, phase, ETA). Streaming output is never piped to a primary surface.

---

# Forge architecture (TypeScript)

The current repo. Extends the existing Forge codebase into a clean module structure aligned with the surfaces we're validating.

## Stack

- **Language:** TypeScript
- **Runtime:** Node.js (orchestration backend), browser (current web UI) or Tauri (option for friend-shareable desktop wrapper, decided in Phase A0)
- **Database:** SQLite via better-sqlite3 or similar
- **Process management:** Node's `child_process` with a supervisor wrapper
- **Async:** Native Promises / async iterators
- **Build:** existing Forge build setup, extended

## Decision pending (Phase A0): UI shell

The existing Forge has a web dashboard. For friend-sharing during Phase A3, the options are:

1. **Keep the web dashboard.** Simplest. Run Forge locally, browse to localhost. Friends pull the repo and run it.
2. **Wrap in Tauri.** Ships as a native binary. Slight ceiling improvement, easier friend distribution.
3. **Wrap in Electron.** Mature, well-trodden. Higher size cost, looks less native.

Recommendation: defer the decision to Phase A0 evaluation. The web dashboard might be enough through A1; A2's morning digest experience may want native window behavior, at which point Tauri is the natural choice. Don't over-invest in the shell — the shell is the *least* portable thing to Track B.

## Module map

```
forge/
├── src/
│   ├── plan/                    # plan engine, document model, lifecycle
│   ├── critic/                  # critic pool, synthesis, adjudication
│   ├── orchestrator/            # subprocess + worktree + phase detection
│   ├── review/                  # auto-review pipeline, risk classification
│   ├── agents/                  # agent adapters (Claude Code, etc.)
│   ├── storage/                 # SQLite layer, migrations
│   ├── bus/                     # event bus
│   ├── types/                   # shared domain types
│   └── ui/                      # UI surfaces (web or Tauri shell)
│       ├── plan-workspace/
│       ├── critic-panel/
│       ├── plan-library/
│       ├── in-flight/           # phase A2+
│       ├── review-queue/        # phase A2+
│       ├── morning-digest/      # phase A2+
│       └── session-debug/       # phase A2+, demoted UI
├── migrations/                  # SQLite migration files
├── docs/
└── package.json
```

The module names historically mirrored the archived Track B crate names; the mapping survives in the archived doc.

## Subsystems

### Plan Engine
Owns plan documents, lifecycle, agent collaboration on plans.

Responsibilities: plan CRUD, document structure validation, drafting agent invocation, lock gate logic (zero open questions, all disagreements adjudicated), plan version history, plan export.

> Per [ADR-0028](./adr/0028-spec-dependency-graph-and-orchestration-agent.md) (Proposed), **decomposition and epic orchestration move out of the Plan Engine** into a dedicated **Orchestration Agent** role (the "product/scrum-master") that owns epic ingestion, the cross-spec dependency graph, lazy spec materialization, and sequencing. The Plan Engine keeps single-spec CRUD, validation, and lock-gate logic; it does not own the graph.

### Critic Pool + Synthesis
Runs adversarial review on plans (A1) and on completed task diffs (A2+).

Sub-components: critic configs (`(prompt_template, model_config, role)` rows in DB), critic panels (named groupings), critic invocation (parallel agent runs under a concurrency cap), synthesis (separate agent invocation consuming N critic outputs), adjudication state.

### Orchestrator (A2+, headless by design)
Owns subprocess agents, worktrees, and job lifecycle.

- Agent Adapters: interface with `spawn`, `pollStatus`, `terminate`, `captureArtifact`. No `streamToUi` method — output goes only to storage.
- Worktree Manager: git worktree CRUD
- Subprocess Supervisor: Node-based; emits `JobEvent` on phase transitions and completion
- Phase Detector: heuristic mapping of agent activity to high-level phases
- Task Scheduler: pulls ready tasks respecting plan dependency DAG

### Event Bus
Node EventEmitter (or a small typed wrapper) for fan-out between subsystems.

Event categories: `PlanEvent`, `CriticEvent`, `SynthesisEvent`, `JobEvent` (A2+), `AgentEvent`, `ReviewEvent` (A2+), `SystemEvent`.

Key invariant: `JobEvent` carries summary state (phase, elapsed, ETA). Raw subprocess output goes to `session_events` storage and is not broadcast to UI by default.

### Review Pipeline (A2+)
Auto-review → auto-fix loop and resulting PR triage state.

### Storage
SQLite with WAL mode. Migrations from day one. See `SCHEMA.md`.

---
