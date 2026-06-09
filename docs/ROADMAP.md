# Roadmap — Forge

**Mission: make the operator 10000x.** Forge accelerates development by turning a spec into complete, well-written code that lands as close to one-shot as possible — planned, run, reviewed, and shipped without the operator watching. Sessions are jobs, not shows ([ADR-0019](adr/0019-sessions-are-jobs.md)).

Forge (TypeScript, this repo) **is the deliverable**. The Rust/GPUI "Track B" product plan is archived at [`archive/ROADMAP-track-b-juicer.md`](archive/ROADMAP-track-b-juicer.md); it returns only if a product-shaped need revives it. The bare-parts sibling experiment (**anvil**, in the `smithy` repo) runs independently per [ADR-0030](adr/0030-strategy-reset-surfaces-commoditized.md) — Forge development proceeds on its own merits, and engineering lessons flow both ways (see anvil's `LEARNINGS.md`; lesson 6 on idempotent review publishing came home in Phase F0).

Phases are ordered by leverage, not calendar. Estimated effort assumes evenings + weekends; treat as relative ordering, not deadlines.

---

## Operating principles (apply to every phase)

- **Headless or it doesn't count.** No step in the loop may block on interactive auth, tool-permission prompts, or a watching human. If a step can prompt, it is not headless.
- **Operator-scoped, zero repo imposition.** Forge state lives out-of-repo (`~/.forge`, its own DB). It never commits files into a target repo, never edits a target's CLAUDE.md, never requires team buy-in.
- **Two critics + a synthesizer is the settled critique design.** Corroborated / single / conflicting triage is the payoff. Revisit only if synthesis quality visibly dips (COO-79 decision).
- **The Workbench is a keeper.** The operator dashboard is a core surface, not legacy to be retired. Invest in it.
- **No silent failure.** Every terminal state — success, failure, partial — must be visible in `forge status` and the Workbench.
- **Schema changes go through migrations** ([SCHEMA.md](SCHEMA.md)); architectural changes get a new ADR; accepted ADRs are never edited in place.

---

## Phase F0 — Production hardening (now)

**Goal:** Trust. The loop you already have — spec → run → quality gate → draft PR → review → fix — works unattended, never lies, and never drops a finding. This is the prerequisite for everything else: an operator who has to babysit isn't 10000x.

### Deliverables
- **Review pipeline reliability** (top priority — the operator's "personal Devin reviewer" must be dependable):
  - GitHub publishing is at-least-once with visible state: every finding either lands on the PR or surfaces as a loud, actionable failure
  - Idempotent posting — hidden HTML-comment markers with stable finding ids so re-runs update/skip instead of duplicating (anvil lesson 6)
  - Resolve-on-fix is robust across re-reviews and partial fixes
  - Friction cut: fewer steps to invoke, saner defaults, an obvious recovery path when a publish fails
- **Headless robustness:** subprocess death, timeouts, stream truncation, and mid-flight kills all leave the DB and worktrees in a recoverable, visible state; runs are resumable where that's cheap
- **Truthful status:** `forge status` and the Workbench agree with reality — running, stuck, failed, awaiting-human are all distinguishable at a glance
- **Suite health:** tests, typecheck, lint green; flakes eliminated; every bug fixed in this phase gets a regression test
- **Docs match behavior:** README and command help describe what the tool actually does

### Exit criteria
A review run against a real GitHub PR posts every finding, resolves them on fix, and survives a re-run without duplicates — verified live, not just in mocked tests. A full spec → run → review → draft-PR loop completes headless on a real example with zero intervention. Killing a run mid-flight leaves nothing corrupted and nothing invisible.

---

## Phase F1 — One-shot quality

**Goal:** Fewer human touch-ups between spec and merged PR. The metric is rework: commits a human (or a second agent pass) had to add after the run "finished." The Usage dashboard's rework lens is the scoreboard.

### Deliverables
- **Spec self-containment:** the spec is the implementing agent's entire universe (anvil lesson 1). Lock gate enforces zero open questions before dispatch; spec authoring nudges toward goal, constraints, acceptance criteria, file-level pointers, and the test that proves it done
- **Critique sharpness:** the 2-critic + synthesizer flow tuned for corroborated/single/conflicting triage quality; critic prompts iterated against real outcomes, not vibes
- **Quality-gate coverage:** per-repo gate profiles (build, tests, lint, typecheck) that actually catch what review keeps finding
- **Fix-loop discipline:** auto-fix budget stays small (default 1 round); exhaustion escalates loudly to the human instead of grinding
- **Plan workspace polish:** conversation-led spec authoring ([ADR-0026](adr/0026-conversation-led-plan-authoring.md)) continues to mature in the Workbench — reviewable agent edits, visible open-question counter

### Exit criteria
Across two weeks of real use, most runs merge with zero or one human touch-up commit, and you can tell from the rework lens whether a prompt/gate change helped.

---

## Phase F2 — Scale the operator

**Goal:** More concurrent work without more attention. Only worth building once F0's trust and F1's quality hold — concurrency multiplies whatever you have, including unreliability.

### Deliverables
- **Concurrent runs (modest):** 2–4 simultaneous jobs with sane queueing and worktree hygiene ([ADR-0024](adr/0024-worktrees-disposable-lifecycle.md))
- **Catch-up surface (morning digest):** opening the Workbench after time away orients you in under a minute — completions, failures, queue state, suggested next action
- **In-flight status view:** compact list of running jobs (name, agent, phase, elapsed). No streaming output as a primary surface; transcript drill-down stays a debug view
- **Review queue triage:** findings and PRs routed by risk so safe work batch-approves and attention goes where it's needed

### Exit criteria
You run multiple specs in parallel for two weeks, orient each morning from the digest, and never feel obligated to watch a session.

---

## Open decisions (settle in their own ADRs before building)

- **Task model / work graph.** Decomposing an epic into dependent tasks needs a store. Candidates: Forge-native graph ([ADR-0028](adr/0028-spec-dependency-graph-and-orchestration-agent.md), contested by ADR-0030), Linear-backed (Linear holds specs/subtasks, Forge orchestrates), or beads via the anvil experiment. Deliberately undecided — do not build any of the three until an ADR picks one.
- **Tracker sync.** Bidirectional Jira/Linear sync has hurt before. If the task-model decision lands on an external tracker, sync scope gets its own ADR; otherwise none.

## Deliberately not on the roadmap

- Streaming session output as a primary surface, or any mid-run tool-call approval UI
- A required backend service, web SaaS, or team/enterprise mode
- Public launch, pricing, or polish-for-strangers — Forge serves its operator
- Multi-agent backend fan-out beyond what exists (`claude`, `codex`) until F1 holds
- Speculative execution, remote execution, plugin systems

---

## Cross-cutting

- **Decision log:** every architectural choice gets an ADR in [`adr/`](adr/)
- **Schema evolution:** SQLite migrations from day one
- **License hygiene:** no GPL/LGPL/AGPL
- **Competitive watch:** occasional, not monthly — the mission is operator acceleration, not category positioning
- **anvil cross-pollination:** when either project learns something durable (see anvil `LEARNINGS.md`), port it
