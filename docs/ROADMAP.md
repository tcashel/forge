# Roadmap — Forge → Juicer

Phased delivery across two tracks. Track A (Forge, TypeScript) validates surfaces. Track B (Juicer, Rust + GPUI) builds the polished product. See `BUILD_PATH.md` for the rationale and gate.

Estimated timing assumes evenings + weekends. Treat as relative ordering, not deadlines.

---

# Track A — Forge (TypeScript)

Goal: validate the five differentiated surfaces. Daily driver for the founder. Shared with trusted friends for workflow feedback. Not for public launch.

Existing Forge codebase (CLI + web dashboard) is the starting point. Track A extends and reshapes it.

## Phase A0 — Competitive immersion + Forge restructure

**Duration:** ~2-3 weeks
**Goal:** Use the competitors. Decide what to clone, what to skip, what to differentiate on. Restructure the existing Forge codebase into the new module shape.

### Deliverables
- Install and run **Conductor**, **Superset**, **Intent**, **Windsurf 2.0** on real workflows for 3+ sessions each
- One-page note per competitor: what works, what frustrates, where session-as-surface fails
- **Forge restructure:** reorganize existing TS code into the module structure described in `ARCHITECTURE.md` (Track A section). Plan engine, critic pool, orchestrator, storage, agents — clean module seams even if some modules are thin
- Plan document representation: lock in markdown + structured frontmatter (or alternative if A0 evaluation reveals issues)
- Workflow audit: what does Forge do today that's useful for Juicer? What gets thrown away?

### Decisions made by end of phase
- Forge's existing UI: keep, rewrite, replace?
- Whether to keep the web dashboard or move to a desktop wrapper (Tauri/Electron) for friend-sharing
- Plan document representation finalized
- Module boundaries finalized

### Exit criteria
You can articulate, in one sentence, why a Conductor or Superset user would switch to Juicer. Hint: the answer involves *not having to watch the agent*.

---

## Phase A1 — Plan workspace + critic panel

**Duration:** ~2-3 months
**Goal:** Ship the upstream differentiator inside Forge. Plan workspace, multi-critic synthesis, lock gate, library. No new execution layer.

### Deliverables
- **Plan workspace (single plan, conversation-led)** — see [ADR-0026](adr/0026-conversation-led-plan-authoring.md)
  - Idea→spec happens in a persistent agent conversation (native session, [ADR-0025](adr/0025-unified-agent-interface-agent-owned-context.md)); the structured spec document is the live artifact the conversation maintains, not a form you fill in
  - Structured sections kept always-current by the agent: goals, constraints, non-goals, approach, risks, open questions, acceptance criteria
  - Agent spec edits surface as reviewable accept/reject diffs in a live document pane — no silent rewrites; direct human editing remains available but secondary
  - Open questions surfaced explicitly with visible counter
  - The plan workspace is the one deliberately-watched surface; everything downstream stays headless ([ADR-0019](adr/0019-sessions-are-jobs.md))
- **Multi-critic synthesis**
  - Critic panel configuration UI (prompt + model per critic)
  - Parallel critic invocation against locked-draft plan
  - Synthesis view: agreements, disagreements with crux, recommendation
  - Human adjudication UI per disagreement
  - Lock gate: cannot lock with open questions or unresolved disagreements
- **Plan persistence**
  - SQLite source of truth (schema designed for Track B portability — see SCHEMA.md)
  - Plan versions on every save
  - Plan library: list, open, search by title/content
- **Plan export**
  - Markdown export with full structure
  - Copy locked plan to clipboard as briefing for external tools
- **Minimum agent integration**
  - One agent adapter (Claude Code) for drafting and critique
- **External ticket source (added 2026-05-26)**
  - Provider abstraction over the existing Jira surface plus a Linear provider
  - `forge spec from-ticket <key-or-url>` imports a ticket into a draft spec
  - Drives the dogfooding loop: operators (including the founder) pull real Linear/Jira work into Forge plans without leaving the tool

### Deliberately out of scope
- New execution layer (Forge's existing execution is fine for now)
- Worktree management changes
- In Flight view
- Auto-review and auto-fix
- Review queue
- Fleet view
- Morning digest
- Any agent beyond Claude Code for drafting/critique
- Concurrent plans

### Exit criteria
You draft a real spec in the plan workspace, run multi-critic synthesis on it, adjudicate disagreements, lock it, and use it as the brief for execution. The plan workspace alone justifies opening Forge daily. Workflow shape feels right after 2 weeks of daily use.

---

## Phase A2 — Run, review, ship (the headless flow)

**Duration:** ~2-3 months
**Goal:** Close the loop end-to-end inside Forge. Locked plan → headless execution → auto-review → triage queue → merge. No session watching anywhere in the flow.

### Deliverables
- **Decomposition** — see [ADR-0028](adr/0028-spec-dependency-graph-and-orchestration-agent.md)
  - Cross-spec **dependency graph** (typed edges: blocks/blocked-by, depends-on, related, epic→child), not just an intra-plan task list
  - **Lazy spec materialization:** graph nodes start as lightweight stubs and are promoted to full specs just-in-time as work approaches — never author a whole epic up front
  - A dedicated **orchestration agent** ("product/scrum-master") owns epic ingestion, graph maintenance, materialization timing, and sequencing — distinct from planner/critic/implementer/reviewer
  - Within a materialized, locked spec: decomposed by an agent into N tasks with dependencies
  - Manual edit/reorder before dispatch
  - Forge owns the data (SQLite ground truth); Linear/Jira sync is an optional additive layer, schema designed sync-aware now, sync contract deferred to a follow-up ADR
- **Headless execution**
  - Worktree-per-task management
    - Worktree lifecycle: inventory, safe-to-delete status, remove, bulk "clean merged", "test locally" (checkout branch into main), and lazy rehydration on fix (see [ADR-0024](adr/0024-worktrees-disposable-lifecycle.md))
  - Claude Code subprocess orchestration
  - Hook-policy assumption: Forge does not prompt for tool permissions; agent's hook config governs
  - Subprocess supervisor: spawn, monitor, capture artifact, handle exit
  - No streaming UI for agent output during normal operation
- **In Flight view** — *the third differentiated surface*
  - Compact list of running jobs
  - Per job: name, agent, current phase, elapsed, ETA
  - No terminal output. No tool calls. No interrupt prompts.
  - Kill / restart controls (top-level, not mid-stream)
  - Drill-down to raw session transcript exists but is deliberately demoted to a "debug" view
- **Auto-review pipeline**
  - On task completion, configured critic(s) run against the diff
  - Findings aggregated, risk classified
  - Optional auto-fix pass (budget 1-2 iterations)
  - Loop exhaustion → human escalation in review queue
- **Risk-routed review queue** — *the second differentiated surface*
  - PRs land triaged into safe / needs-eyes / broken
  - Triage signals visible
  - Keyboard-driven approve / kick-back / request-eyes
  - Batch approval for safe items
  - Context panel: plan section, critic notes, fix history
- **Morning digest** — *the marquee surface*
  - Auto-presented when app opens after configurable idle threshold
  - Summarizes completions, blockers, queue state
  - Suggests next action with time estimates
- **Concurrent execution (modest)**
  - 2-4 tasks simultaneously, single plan at a time

### Deliberately out of scope
- Streaming output as a primary UI surface (this is the whole point)
- Mid-run intervention beyond kill/restart
- Tool-call approval prompts
- Multiple plans concurrently
- Fleet view
- Multi-agent backends (still Claude Code only)
- Remote execution
- Speculative execution

### Exit criteria
End-to-end loop works headless: draft plan → critique → lock → decompose → execute → auto-review → triage → merge. You ship multiple real features without ever looking at agent output. Forge's old web dashboard retired in favor of the new surfaces. Morning digest is the screen you open first every day.

---

## Phase A3 — Friend feedback + gate evaluation (optional)

**Duration:** ~2-4 weeks
**Goal:** Get workflow feedback from a small number of trusted friends. Evaluate the gate. Decide: continue extending in TS (rare) or move to Track B (typical).

### Deliverables
- **Polish the surfaces enough to share with friends.** Not public-launch polish — just enough that the workflow feels right and bugs aren't catastrophic. Brief onboarding doc.
- **Selective invites.** Hand-pick 3-5 people who run agents seriously.
- **Structured feedback capture.** Simple shared doc or issue tracker, tagged "shape" vs. "polish."
- **Gate evaluation.** Per `BUILD_PATH.md`, check whether all five surfaces have been used daily without major shape changes for ~2 weeks (founder use; friend feedback is additional signal).

### Exit criteria
**Surface-based gate is met.** Spec is settled. Move to Track B.

Edge case: if friend feedback reveals a major shape question (e.g., "the synthesis surface is wrong"), iterate in TS rather than carrying the wrong shape into Rust. But this is the exception.

---

# Track B — Juicer (Rust + GPUI)

Goal: ship the polished, paid product. Build from Track A's validated spec. The marketing artifact.

Track B starts only when the surface-based gate fires. See `BUILD_PATH.md`.

## Phase B0 — GPUI calibration + workspace skeleton

**Duration:** ~2-3 weeks
**Goal:** Verify GPUI. Set up the workspace. Read Zed source for calibration.

### Deliverables
- **GPUI throwaway:** one screen, two adjacent panels — left panel shows a fake job list, right panel shows a fake document with inline edits
- Read 3-5 Zed source modules (terminal, diff view, command palette) for calibration
- Cargo workspace skeleton with crate structure committed (see ARCHITECTURE.md Track B section)
- Database compatibility check: confirm Rust can read Forge's SQLite

### Exit criteria
GPUI go/no-go. Workspace builds. Can read Forge plans from disk.

---

## Phase B1 — Plan workspace + critic panel (Rust)

**Duration:** ~2-3 months
**Goal:** Port the validated plan workspace and critic panel surfaces to Rust + GPUI. Same shape, native polish.

The work here is mostly translation, since shape is settled. The remaining design space is the polish layer.

### Deliverables
- Plan workspace in GPUI (document-shaped, structured sections, inline drafting agent)
- Critic panel and multi-critic synthesis surface in GPUI
- Lock gate and adjudication UI in GPUI
- Plan library in GPUI
- SQLite layer in Rust (`sqlx`), reading the same schema Forge writes
- Plan export

### Exit criteria
You draft and lock a plan in Juicer. Feels meaningfully more polished than the Forge equivalent. Plan library reads existing Forge plans.

---

## Phase B2 — Run, review, ship (Rust)

**Duration:** ~2-3 months
**Goal:** Port the headless execution flow, In Flight view, triage queue, and morning digest to Rust.

### Deliverables
- Worktree management in Rust
- Subprocess supervisor (Tokio)
- In Flight view in GPUI
- Auto-review pipeline
- Risk-routed review queue in GPUI
- Morning digest in GPUI
- Concurrent execution

### Exit criteria
Full plan-to-ship loop works in Juicer. Forge can be retired (or kept as a fallback briefly).

---

## Phase B3 — The environment

**Duration:** ~3 months
**Goal:** Multi-plan concurrency. Fleet view. Multi-agent backends.

### Deliverables
- Multiple plans in flight simultaneously
- Fleet view — home screen showing all in-flight plans grouped by lifecycle stage
- Per-plan status, drill-down to plan workspace
- Notes attached to plans
- Plan library v2 — full FTS search, fork-from-existing, tag/filter
- Enhanced morning digest for multi-plan environment
- **Multi-agent backends** — adapters for Codex, Gemini CLI, opencode
- First read of Juice-generated configs

### Exit criteria
Comfortably run 5+ plans in parallel for at least two weeks.

---

## Phase B4 — Juice flywheel + advanced capabilities + first external users

**Duration:** ~4-6 months
**Goal:** Lock in the structural moat. Bring in trusted external users beyond the friend circle.

### Deliverables
- Deep Juice integration (read configs, write session history, joint dashboard)
- Speculative execution
- Plan-to-execution traceability
- Critique replay
- Outcome learning v1
- Dry-run mode
- **First external users (5-10 invited, beyond the original Track A friend circle)**

### Exit criteria
At least 5 invited users running Juicer daily. At least 2 give unsolicited testimonials about the headless flow. Juice flywheel measurable.

---

## Phase B5 — The product

**Duration:** ~6+ months
**Goal:** Commercial product. Revenue. Recognized category position.

### Deliverables
- Pricing and packaging (Personal $30-50/mo, Juice+Juicer bundle)
- Onboarding flows and first-run experience
- Landing page, documentation site, demo screencasts
- Public Discord or community
- Code signing, notarization, update mechanism
- Opt-in privacy-preserving telemetry
- Crash reporting, license management
- Remote execution over SSH
- Plugin / extension system v1
- Possible Conductor or Superset integration partnership

### Exit criteria
$20-50k MRR. Distinct category recognition. Roadmap driven by user signal.

---

# Cross-cutting concerns (work continuously across both tracks)

- **Competitive watch:** Monthly review of Conductor/Superset/Windsurf/Intent shipping
- **Performance budget:** Track B aims for 16ms latency on all interactive operations
- **Schema evolution:** SQLite migrations from day one; schema designed for Track A→Track B portability
- **License hygiene:** No GPL/LGPL/AGPL anywhere in either track
- **Documentation:** Architecture docs evolve with code
- **Decision log:** Every architectural choice recorded as an ADR in `adr/`

---

# What this roadmap deliberately defers

- **Public launch** — Track B Phase 5. No public version until Rust.
- **Fleet view** — Track B Phase 3. Single-plan first.
- **Multi-agent backends** — Track B Phase 3. Don't fan out execution adapters before the core product is good.
- **Remote execution** — Track B Phase 5.
- **Plugin system** — Track B Phase 5.
- **Speculative execution** — Track B Phase 4.

# What this roadmap deliberately prioritizes

- **Plan workspace** — Track A Phase 1. Most differentiated surface.
- **Multi-critic synthesis** — Track A Phase 1. Strongest upstream moat.
- **Headless execution** — Track A Phase 2. The whole job-not-show thesis lives here.
- **Risk-routed review queue** — Track A Phase 2. Second-strongest differentiated surface.
- **Morning digest** — Track A Phase 2. Marquee demo moment.
- **Juice integration** — Track B Phase 4. Structural moat.

---

# Things deliberately not on the roadmap

- A web version (Track B is desktop)
- A required backend service
- Selling agent inference
- Linear/Jira replacement
- Mobile app
- Windows/Linux ports (reassess after Track B launches)
- Team mode (different product)
- Enterprise compliance
- Free tier on the orchestrator
- Streaming session output as a primary surface
- Mid-run tool-call approval UI
- Public launch of Forge (it stays a prototype)
