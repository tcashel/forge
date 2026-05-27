# ADR 0023 — SQLite cutover for Track A (Forge)

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-26
**Related:** [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`0021-two-track-build-path`](./0021-two-track-build-path.md), [`../SCHEMA.md`](../SCHEMA.md)

## Context

Forge's observability story was broken in a way the operator hit immediately. Standing at a "ready" spec, there was no way to answer "what already ran against this?" Critique attempts had folders on disk and were versioned, but every `forge launch` overwrote `~/.forge/runs/{taskId}/meta.json` — prior review verdicts, fix-loop outcomes, and quality results were destroyed by the next attempt. "Ready" itself was a heuristic (`specVersion > 1`) with no explicit status. No event log existed despite [`SCHEMA.md`](../SCHEMA.md) prescribing the full SQLite contract: `plans`, `plan_versions`, `sessions`, `session_events`, `critic_runs`, `critic_syntheses`, `jobs`, `artifacts`, `review_queue_items`.

Meanwhile that schema is the **contract Track B reads** ([ADR-0021](./0021-two-track-build-path.md)) — anything Track A persists in JSON files is drift that the Rust rewrite has to back-fill. The Linear ticket [`COO-84`](https://linear.app/coolstuffman/issue/COO-84) was filed to close the gap.

## Options

### A — Ship a narrow event-log JSON file
Keep the existing JSON store. Add a single `~/.forge/events.jsonl` append-only file. Backfill into SQLite later when Track B needs it.

**Pros:**
- Smallest change. No new dependency.
- No risk of schema drift if the SQLite schema evolves.

**Cons:**
- Doubles the "what's the source of truth" question (per-subsystem JSON _and_ events log).
- Track B handoff still requires writing the JSON → SQLite bridge later, on a deadline.
- FTS5 search ([COO-80](https://linear.app/coolstuffman/issue/COO-80)) and structured sections ([COO-78](https://linear.app/coolstuffman/issue/COO-78)) both depend on SQLite landing eventually anyway.

### B — Implement SCHEMA.md Phase 1+2 in SQLite verbatim (chosen)
Stand up `~/.forge/forge.db` with `bun:sqlite`, land the documented schema, dual-write from JSON during the cutover, then drop JSON in a follow-up.

**Pros:**
- Single source of truth converges with Track B's contract on day one.
- Unlocks COO-79/COO-80/COO-78 immediately (they all need the same tables).
- The headline acceptance signal — `jobs.run_number` per launch — drops out of the schema for free.

**Cons:**
- Three deviations from SCHEMA.md required (storage location, synthetic tasks row, FTS5 shape). Documented below.
- Bigger PR, more surface area to verify.

## Decision

Implement [`SCHEMA.md`](../SCHEMA.md) Phase 1 + Phase 2 in `bun:sqlite` under `~/.forge/forge.db`. Dual-write from existing JSON paths during the cutover; new observability surfaces (`forge history`, `forge run ls/show`, Workbench HistoryTab + RunsTab) read SQLite as the source of truth.

Three deliberate deviations from SCHEMA.md, captured here so the Track B port doesn't have to re-derive them:

1. **Storage location: `~/.forge/forge.db`, not `~/Library/Application Support/Forge/`.**
   Track A's existing markdown specs, agent logs, and per-repo config already live in `~/.forge/`. Moving the SQLite database under macOS Application Support while leaving everything else behind would orphan the existing data for no operator benefit. Track B can adopt the documented Application Support path on its own; Track A keeps the established parent directory.

2. **Synthetic 1:1 `tasks` row per plan.**
   SCHEMA.md models `plans → tasks → jobs` (a plan decomposes into multiple sub-tasks, each of which can be launched as one or more jobs). Track A doesn't decompose plans yet — every plan corresponds to exactly one runnable unit. Rather than adding `jobs.plan_id` and deviating from the schema, we insert one synthetic `tasks` row per plan with `sequence=1`, and `jobs.task_id` points at it. When real decomposition lands (Phase 2 in `ROADMAP.md`), this just becomes "promote your single auto-task into N real tasks" — no schema migration. The synthetic row pattern is local to Track A; Track B's port can either keep it or skip it once decomposition is implemented.

3. **`plan_search_index` is self-contained FTS5, not external-content over `plan_versions`.**
   SCHEMA.md specified `CREATE VIRTUAL TABLE plan_search_index USING fts5(... content='plan_versions', content_rowid='rowid')` to avoid duplicating document text. But `plan_versions` has no `title` or `intent` columns — those live on `plans` — so the external-content linkage can't satisfy the FTS5 column list. The implementation drops `content=` and `content_rowid=` and populates the index via an `AFTER INSERT ON plan_versions` trigger that joins `plans` to pull in the plan-level fields. Indexing cost goes up by ~one extra TEXT copy per insert; the simplicity wins. SCHEMA.md will be amended.

**Rationale:** Track A and Track B sharing the same DB schema is the single biggest leverage point in the two-track plan. Every deviation here is documented at the row level so the Rust port can replay the same migrations and inherit the same query shapes; the three deviations above are the minimum needed to make the schema fit Track A's filesystem layout and current feature surface.

**Risks to monitor:**
- If the synthetic `tasks` row pattern leaks into UI ("why are there 'tasks' I never created?"), we may need to hide it at the query layer. Today it's only a backend join target.
- Dual-write means two write paths can disagree if one fails. Phase 3 of COO-84 writes DB-warns-not-fatal, JSON-authoritative; Phase 5 inverts that. Watch for orphaned JSON state during the gap.

## Consequences

- The Linear tickets that depend on shared schema infrastructure (COO-79 multi-critic synthesis, COO-80 plan library FTS5 search, COO-78 plan workspace structured sections) can build directly on the tables COO-84 landed.
- `forge migrate from-json` is the one-shot bridge for legacy `~/.forge/` JSON state — including the pre-rename `tasks` map key that Phase 3.5 dropped. Re-running it is a no-op.
- A handful of code-level conventions become locked-in:
  - Live row IDs are prefix-free (`pv-{plan}-v{n}`, `t-{plan}`, `j-{plan}-r{n}`, `s-{critique}-{slot}`, `cr-{critique}-{a|b}`, `cs-{critique}`, `cc-{agent}-{model}`).
  - Backfill IDs use the `bf-` prefix to make their provenance unambiguous.
  - Synthetic task lookup is always by `(plan_id, sequence=1)`, never by ID — so backfilled (`bf-t-*`) and live (`t-*`) plans work identically through the same join.
- The retirement timeline in [ADR-0011](./0011-forge-retirement-timeline.md) gets a longer runway: Track A's data is now portable to Track B in one read.

## Implications for current work

- COO-84 Phase 5 (drop JSON mirror writes, move `agent.log` to `~/.forge/logs/{job_id}.log`, mirror specs to `~/.forge/specs/{plan_id}/v{N}.md`) is the cutover follow-up. Until it lands, JSON is still the read source for live state and the DB shadows it.
- Whoever ports Track B reads SCHEMA.md _plus_ this ADR. The deviations above don't need re-deriving.

## Non-goals locked by this ADR

- The Track B Rust port does **not** have to keep `~/.forge/` as its database parent. It can ship under the documented macOS Application Support path. The deviation here is a Track A pragma, not a product decision.
- This ADR does not bless a generic "JSON deprecation" policy for the rest of Forge — only the observability-related JSON files (`index.json`, `runs/*/meta.json`, `critiques/*/critique-meta.json`) move to SQLite under COO-84. Markdown spec bodies and `agent.log` files stay on disk (the DB references them).
