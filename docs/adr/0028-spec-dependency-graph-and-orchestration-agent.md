# ADR 0028 — Cross-spec dependency graph, lazy spec materialization, and a dedicated orchestration agent

**Status:** Superseded by [`0030-strategy-reset-surfaces-commoditized`](./0030-strategy-reset-surfaces-commoditized.md) — adopt beads instead of building the graph (2026-06-02)
**Deciders:** Tripp
**Date:** 2026-06-01
**Related:** [`0003-local-first-no-backend`](./0003-local-first-no-backend.md), [`0005-plan-as-document`](./0005-plan-as-document.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`0023-sqlite-cutover-track-a`](./0023-sqlite-cutover-track-a.md), [`0025-unified-agent-interface-agent-owned-context`](./0025-unified-agent-interface-agent-owned-context.md), [`0026-conversation-led-plan-authoring`](./0026-conversation-led-plan-authoring.md), [`../ROADMAP.md`](../ROADMAP.md), [`../SCHEMA.md`](../SCHEMA.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md)

## Context

Phase A1 (plan workspace, COO-78) shipped: an operator drafts a single spec in a conversation-led workspace ([ADR-0026](./0026-conversation-led-plan-authoring.md)). The roadmap's Phase A2 opens with *"locked plan decomposed by an agent into N tasks with dependencies."* As we scoped that, the goal grew past "decompose one plan":

> Support **task decomposition** so an agent can break specs into smaller work, and **link specs to each other**, so we can build complex work and eventually **burn through a full epic with agents and no humans in the loop** — hand Forge an epic, and let it cook: pull tickets in, materialize Forge specs, decompose them, run the critique/improve loop, launch when they look good, auto review/fix, open a PR, and keep going as merges land.

That target exposes four design forces the current scaffolding does not handle:

1. **The current task model is intra-plan only.** [SCHEMA.md](../SCHEMA.md) `tasks` (Phase 2 draft) ties tasks to a single `plan_id`/`plan_version_id` with `dependencies` as a flat JSON array of *task* IDs. There is no concept of one **spec depending on / blocking / relating to another spec**, no typed edges, and no epic→child hierarchy. Epic-level work needs a graph whose nodes are *specs*, not just tasks inside one plan.

2. **Materializing 50 specs up front is wrong.** A 50-ticket epic should not become 50 fully-authored, critiqued specs on day one — most would be stale or wrong by the time we reach them, and the critique/improve cost would be wasted. We want **just-in-time materialization**: lightweight graph nodes early, promoted to full Forge specs only as we approach implementing them.

3. **Linear/Jira sync is not cleanly separable from the schema.** Forge is local-first ([ADR-0003](./0003-local-first-no-backend.md)); Forge owns the spec data. But the desired epic-ingestion (import a Linear epic/ticket list → Forge specs) and the reverse (specs created in Forge → pushed to Linear) define how the graph is shaped — stable external IDs, which edge types map to which Linear/Jira relations, sync metadata. Designing the graph *without* that mapping in mind would force a painful reshape later (see [`task-model-via-linear`] discussion; precedent [ADR-0024](./0024-worktrees-disposable-lifecycle.md) made `git` ground truth and the DB an annotation layer).

4. **Epic orchestration is a distinct job that must not be smeared across the existing agents.** Deciding *what to pull in, what to materialize next, in what order, and what's ready to launch* is product/scrum-master work. If we fold it into the planning agent (idea→spec conversation), the critics (pressure-test), the implementer (execution), or the reviewer (auto-review), each of those roles blurs and the orchestration decisions get made inconsistently and inaccurately. [ARCHITECTURE.md](../ARCHITECTURE.md) currently parks "decomposition orchestration (A2+)" inside the **Plan Engine**, alongside single-plan CRUD and lock-gate logic — which conflates two very different responsibilities.

This ADR settles the **shape of the A2 task model** before any of it is built, so the schema, the agent roles, and the sync story are decided up front rather than discovered mid-implementation.

## Options

### A — Extend the intra-plan `tasks` DAG only (status quo schema)

Keep decomposition inside a single plan: a locked plan fans out into `tasks` with a `dependencies` array. Cross-spec relationships, if needed, are bolted on later.

**Pros:**
- Smallest change; the `tasks` table already drafts this.
- Enough for "decompose one locked plan into parallelizable tasks."

**Cons:**
- Cannot express spec↔spec relationships or epic→child hierarchy — the actual goal.
- No place for lazy (unmaterialized) nodes; a task presupposes a plan.
- No external-ID / sync affordance; Linear mapping would be a later reshape.
- Forces orchestration logic into the Plan Engine.

### B — A typed dependency graph over specs, with lazy materialization, sync-aware schema, and a dedicated orchestration agent (chosen)

Introduce a graph whose **nodes are work items** (an imported ticket, a planned-but-unwritten child, or a full Forge spec) and whose **edges are typed relations** (`blocks`/`blocked-by`, `depends-on`/sequencing, `related`, `parent`/epic→child). Nodes carry a **materialization lifecycle** so they can exist before a spec does and be promoted just-in-time. The schema reserves **stable external IDs + sync metadata** and aligns edge types with Linear/Jira relations from day one, even though sync ships later. A new **orchestration agent role** owns epic ingestion, graph construction, materialization timing, and sequencing — keeping planner/critic/implementer/reviewer narrow.

**Pros:**
- Directly models the epic-burning goal: specs reference each other; agents chain work across them.
- Lazy materialization avoids authoring 50 specs up front and matches how the work actually arrives.
- Sync-aware schema means the later Linear/Jira integration is a mapping, not a migration.
- Clear separation of concerns keeps each agent accurate; the orchestration agent is the thing you "hand an epic to."
- Stays local-first: SQLite is ground truth; Linear is an optional window.

**Cons:**
- Larger schema and a new agent role to design, build, and prompt well.
- The materialization lifecycle adds states the UI and orchestrator must reason about.
- Sync-aware columns carry cost before sync exists (small, mostly nullable).

### C — Make Linear/Jira the task store

Use Linear as the dependency-graph substrate; Forge reads/writes it directly.

**Pros:**
- Free graph model, relations, and multi-machine/team sync.

**Cons:**
- Violates local-first ([ADR-0003](./0003-local-first-no-backend.md)) and schema portability ([ADR-0023](./0023-sqlite-cutover-track-a.md) — Track B Rust would need a Linear adapter, not just SQLite reads).
- Vendor coupling; impedance mismatch (lock gate, multi-critic synthesis, fix history are not Linear concepts).
- Offline / no-Linear users can't use the core product. Rejected — see [`task-model-via-linear`].

## Decision

Adopt **Option B**. Four coupled decisions:

**D1 — The unit of decomposition is a cross-spec dependency graph, not just an intra-plan task list.** Nodes are *work items*; edges are *typed* (`blocks`/`blocked-by`, `depends-on`, `related`, `parent`/epic→child). The intra-plan `tasks` DAG (SCHEMA Phase 2) remains valid *below* a single spec, but the graph spanning specs is the new top-level structure. This supersedes the "flat `dependencies` JSON array is the whole story" assumption.

**D2 — Specs are materialized lazily.** A graph node has a lifecycle: `stub` (a known-but-unwritten item, e.g. an imported epic child) → `drafting` (a Forge spec exists, conversation-led per [ADR-0026](./0026-conversation-led-plan-authoring.md)) → `locked` → `in-flight` (jobs running) → `merged`/`archived`. The orchestrator promotes `stub` → `drafting` **just before** we approach implementation, not at epic ingestion. We never author the whole epic up front.

**D3 — Forge owns the data; Linear/Jira is an optional, additive sync layer — but the schema is designed sync-aware now.** SQLite is ground truth ([ADR-0003](./0003-local-first-no-backend.md), [ADR-0023](./0023-sqlite-cutover-track-a.md)). The graph schema reserves, from day one: a stable per-node **external ref** (`provider`, `external_id`, `external_url`), **sync metadata** (last-synced, dirty flags, direction), and **edge types chosen to map cleanly onto Linear/Jira relations**. The sync *implementation* (import an epic → graph of stubs; push Forge-created specs → Linear) is deferred and gets its **own ADR** covering direction, conflict policy, and persist timing. We do **not** defer sync-*aware schema design*.

**D4 — A dedicated orchestration agent role ("the product/scrum-master").** A distinct agent owns epic ingestion, graph construction and maintenance, materialization timing, sequencing, and "what's ready to launch next." It is separate from — and must not be folded into — the **planner** (idea→spec conversation), the **critics** (pressure-test), the **implementer** (execution), and the **reviewer** (auto-review/fix). This is the agent you hand an epic to. In the far-future autonomous loop it drives: ingest → materialize JIT → decompose → critique/improve loop → launch when the gate passes → auto review/fix → PR → advance the graph as merges land. Decomposition orchestration therefore moves **out of the Plan Engine** into this role; the Plan Engine keeps single-spec CRUD, document validation, and lock-gate logic.

**Rationale:** Only Option B models the actual goal (specs referencing specs, agents burning an epic) while honoring local-first and keeping the schema portable to Track B. Lazy materialization is what makes a 50-ticket epic tractable and cheap. Designing the schema sync-aware now is the cheap insurance that avoids a reshape when Linear/Jira lands. The dedicated orchestration agent is the separation-of-concerns call that keeps every other agent's job — and therefore its output — narrow and accurate.

**Risks to monitor:**
- **Schema over-design for sync that never ships** — keep the sync-aware columns minimal and nullable; if the sync ADR stalls, they cost almost nothing.
- **Orchestration agent overreach** — if it starts editing specs or judging diffs, it has absorbed the planner/reviewer roles. Its contract is graph + sequencing decisions, not content.
- **Autonomy outrunning trust** — the end-state "let it cook" loop must stay gated (lock gate before launch, auto-review before merge). Autonomy is earned incrementally, not switched on.
- **Lazy materialization drift** — a `stub` whose upstream context changed before promotion must be (re)grounded at materialization, not promoted blindly.

## Consequences

- **SCHEMA.md** gains a graph layer (working names): `work_items` (nodes: kind/lifecycle, optional `plan_id` once materialized, external-ref + sync columns) and `work_item_edges` (typed `from`/`to`/`edge_type`). The existing `tasks` table is reframed as intra-spec decomposition beneath a materialized node. These tables are authored when A2 implementation starts; this ADR fixes their *shape*, not their final DDL.
- **ARCHITECTURE.md** gains an orchestration-agent role; "decomposition orchestration (A2+)" moves from the Plan Engine subsystem to it. Mirrors to a Track B crate later (the module-name mirroring convention holds).
- A **follow-up ADR** is required for the Linear/Jira sync contract (direction, conflict resolution, persist timing, field mapping) before sync is built. This ADR is its prerequisite.
- The **lock gate** ([ARCHITECTURE.md](../ARCHITECTURE.md) Plan Engine) becomes the node-level `drafting → locked` transition and the precondition for `in-flight`. A node must be `locked` before its jobs launch; epic ingestion and stub creation do **not** require locking.
- The roadmap's A2 "Decomposition" deliverable is expanded to: graph model + lazy materialization + orchestration agent (not just "N tasks with dependencies").
- COO-82 (ticket source — Linear/Jira as spec inputs) is **entangled** with this: its import direction *is* the Linear→Forge half of the graph-ingestion story. It should inform / wait on this ADR rather than ship a standalone importer against a schema about to change.

## Implications for current work

- **Do not build the A2 `tasks`/decomposition schema until this ADR is Accepted.** The graph shape changes the DDL.
- **COO-80 / COO-81** (plan library, export) are unaffected and remain deferrable / independently shippable.
- The first A2 build step is: (1) accept this ADR, (2) write the sync-contract ADR, (3) implement the `work_items` + `work_item_edges` schema and the orchestration-agent skill, then (4) wire decomposition + lazy materialization.

## Non-goals locked by this ADR

- **Linear/Jira is not the store.** SQLite is ground truth; external trackers are an optional window (Option C rejected).
- **No eager epic materialization** — we never author all of an epic's specs up front.
- **The orchestration agent is not a content agent** — it does not draft specs, run critiques, write code, or judge diffs. It manages the graph and sequencing only.
- **No autonomous merging without gates** — the "let it cook" loop always passes the lock gate before launch and auto-review before any PR/merge step; this ADR does not authorize ungated autonomy.
- **The sync contract is not decided here** — direction, conflict policy, and persist timing are deferred to a dedicated follow-up ADR.
