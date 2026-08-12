# Vision — Forge

> The operator's cockpit for staff engineers running agent fleets.
> Plan. Run. Review. Ship. Don't watch.

> ℹ️ **Status (2026-06).** Forge (TypeScript, this repo) **is the deliverable** — see [ROADMAP.md](ROADMAP.md), which is authoritative on plan and priorities. The Rust + GPUI rebuild ("Juicer", Track B) is archived at [`archive/ROADMAP-track-b-juicer.md`](archive/ROADMAP-track-b-juicer.md). The moat is **operator-scoped, zero-repo-imposition integration** plus the surfaces below; the task model / work graph is deliberately undecided (ROADMAP "Open decisions"). The job-not-show thesis in this document stands.

---

## A note on naming

The repo you're reading this in is named **forge**. **Juicer** was the name reserved for a planned Rust + GPUI rebuild; that plan is archived (see the status note above), and Forge itself now carries the product role. Where this document says "Juicer", read it as the operator's-cockpit product concept — the thing Forge is. Mentions of the Rust rebuild, the two-track gate, and Track B pricing/launch milestones describe the archived plan, kept here as context.

---

## The thesis in one sentence

Conductor and Superset are tools for *watching* coding agents. Juicer is a tool for *deploying* them.

---

## Sessions are jobs, not shows

Every existing tool in this category — Conductor, Superset, Windsurf, Cursor, Claude Code's own UI — treats the agent session as the unit of work and the primary thing on screen. You watch tool calls scroll. You approve `lint`. You confirm a file write. You intervene mid-stream when the agent goes sideways. The whole UX assumes your job is to *supervise* the agent.

Juicer rejects this premise.

In Juicer, **the session is implementation detail.** It's a job. Jobs have a status (queued, running, done, failed) and an output (a diff, a PR). The streaming output of the agent is not a primary surface. You don't see tool calls. You don't approve `lint`. You don't get interrupted with "the agent wants to run X." You have hooks (Claude Code hooks, opencode permissions, your own scripts) that enforce policy at the agent level. The orchestrator does not second-guess the agent in real time.

This is more demanding of the user than the supervising tools — it asks you to trust your agents enough to run them headless. That's the right ask for the target audience. Staff and principal engineers running fleets have already configured their agents, already set up their hooks, already moved past the "what is the agent doing right now?" hand-holding phase. They want a boss's view, not a manager's view.

The four verbs of Juicer's product are:

- **Plan** — iterate with a drafting agent on a structured document; run multi-critic adversarial review; lock when zero open questions remain
- **Run** — dispatch into worktrees with your chosen agents; they execute headless under your hook configuration
- **Review** — auto-reviewed and auto-fixed PRs land in a risk-triaged queue; batch-approve the safe, focus on the interesting
- **Ship** — merge

Notice what's not in the verb list: *watch*. *supervise*. *approve*. *intervene*.

---

## The market we're entering

The "parallel coding agent orchestrator" category exists. It is crowded. It is no longer novel.

As of May 2026:

- **Conductor** (Melty Labs) — free Mac app, Claude Code + Codex, worktree-per-task, diff-first review. Session viewer with orchestration grafted on. <https://www.conductor.build/>
- **Superset** — source-available Mac desktop, $20/seat/mo, 8+ agent CLIs supported, built-in terminal/diff/browser. Workspace around sessions. <https://superset.sh/>
- **Windsurf 2.0** (Cognition, $10B-valued) — Agent Command Center Kanban inside the Windsurf IDE, with Devin bundled for cloud handoff. <https://docs.windsurf.com/windsurf/agent-command-center>
- **Intent** (Augment Code) — spec-driven Mac app, separate Critique and Verify phases, living specs, enterprise compliance.
- A long tail of 40+ open-source orchestrators (vibe-kanban, crystal, mux, jean, dorothy, gastown, constellagent, claude-squad, code-conductor, etc.). See <https://github.com/andyrewlee/awesome-agent-orchestrators>.

**Every one of these treats the session as a first-class surface.** The user is expected to watch, approve, intervene. They are fancier terminals.

**Juicer is not a fancier terminal.** Juicer is an environment where the agent's session is a means to an end, not the thing itself.

---

## Why this positioning matters

The session-as-surface premise is what limits the existing products. Once you decide the user's job is to watch the agent, you build a UI optimized for watching:

- Streaming output panes as primary surfaces
- Per-session terminal scrollback
- Tool-call permission interrupts
- "Pause/resume/intervene" controls
- One-agent-at-a-time mental model (because one human can only watch one stream)

Once you build that, you can't scale it to ten parallel agents. The human is the bottleneck *because the UI made them the bottleneck.* "Look at this Kanban with 10 sessions" doesn't solve it; the user still feels obligated to look at each one.

The job-not-show premise is what makes fleet-scale operation actually possible. If the user is not supervising, the human bottleneck disappears, and the product's job becomes:

- **Direction quality** — making sure the right work is being done (plan workspace, critique)
- **Outcome triage** — efficiently handling what comes back (review queue, morning digest)
- **Cognitive load management** — routing attention to what actually needs it

Those are exactly the three things Juicer is built around. They follow logically from the job-not-show premise.

---

## The three differentiators

1. **Plan quality as the upstream foundation.** Bad plans amplify into ten broken PRs. Juicer treats the plan workspace as the product's center of gravity. Document-shaped, structured sections, multi-critic adversarial review, lock gates with zero open questions.

2. **Outcome triage as the downstream surface.** When agents finish, you don't review them in order of completion or watch the show — you triage in order of risk. Safe PRs batch-approve. Interesting ones get your attention. Broken ones kick back to the agent. Morning digest tells you what happened while you slept.

3. **The Juice flywheel.** Juicer's runs feed Juice's mining. Juice's outputs (per-repo skills, optimized configs, coaching) make Juicer's agents better. Better agents need less supervision, which validates the job-not-show premise further. No competitor has this loop.

---

## How we build it

Forge is built in this repo, in TypeScript, phase by phase — see [ROADMAP.md](ROADMAP.md) (F0 production hardening → F1 one-shot quality → F2 scale the operator). The earlier two-track plan — validate surfaces in TS, then rebuild polished in Rust + GPUI — is archived at [`archive/ROADMAP-track-b-juicer.md`](archive/ROADMAP-track-b-juicer.md), with the reasoning preserved in `BUILD_PATH.md` (historical record). Forge serves its operator; polish is invested where it pays the operator back, starting with the Workbench, which is a keeper.

---

## What Juicer is

Juicer — the cockpit Forge implements — is a macOS tool for staff and principal engineers who already run agent fleets and have hit the cognitive ceiling.

The user flow:

- **Plan:** write intent → agent drafts → iterate inline → multi-critic synthesis → adjudicate disagreements → lock.
- **Run:** decompose into tasks → tasks dispatch into worktrees → agents execute headless under your hook policy. The In Flight view shows status and ETA. No streaming, no terminal, no interrupts.
- **Review:** auto-review and auto-fix happen automatically (budgeted). Final PRs land in the triage queue, classified by risk.
- **Ship:** keyboard-driven approve / kick-back. Merge.
- **Resume:** close laptop, open in the morning, get a digest of what happened.

Juicer is *not* the execution layer. The execution layer is commodity. Juicer includes the minimum execution surface required (worktree manager, subprocess supervisor, status panel) but those are not the product. The product is the **plan workspace, the critic panel, the In Flight view, the triage queue, and the morning digest.**

---

## Who Juicer is for

**The primary user is a staff or principal engineer who:**

- Already runs 5+ concurrent coding agents weekly
- Trusts their agents enough to run them headless under hook-enforced policies
- Has felt the moment where another execution slot adds zero throughput because supervision is the ceiling
- Cares more about code quality and direction-setting than personal LOC
- Values native, keyboard-driven, dense tools (the Zed/Linear/Superhuman aesthetic)

**The primary user is *not*:**

- An engineer who wants to watch agents work (Cursor's market)
- A junior engineer learning to code with AI
- A solo founder vibing on a side project (Lovable/Bolt's market)
- A team lead seeking dashboards and reports (Jellyfish's market)
- An enterprise security team buying compliance (Intent/Augment's market)

We are explicit about who we are not for. The job-not-show positioning rules out the larger market deliberately. Cursor users supervise; Juicer users delegate.

---

## How Juicer differs (per competitor)

**vs. Conductor:** Conductor is a polished, free, parallel-execution UI with session as primary surface. It does not have a plan workspace, multi-critic synthesis, a risk-routed triage queue, or a morning digest. Conductor exists to *watch* multiple agents; Juicer exists to *deploy* them without watching.

**vs. Superset:** Superset is an agent-agnostic Electron workspace where sessions are the central object — chat panel, terminal, diff viewer all session-attached. Juicer is native, opinionated, and treats sessions as headless jobs. Superset is a workspace; Juicer is an environment.

**vs. Windsurf 2.0:** Windsurf is an IDE that added a Kanban. Center of gravity is still the editor; sessions are still surfaces you click into. Juicer's center of gravity is the plan and the triage queue.

**vs. Intent:** Intent is the closest thesis match (spec-driven, critique-first), but it's optimized for enterprise procurement, single-pass critique, and Auggie-centric BYOA. Juicer is for individual staff engineers, with multi-model critic panels, multi-critic synthesis with disagreement adjudication, and the Juice flywheel.

**vs. the long tail:** Mostly Kanbans over worktrees. None of them remove the supervision premise.

**vs. doing nothing (tmux + Linear + manual review):** The status quo's failure mode is exactly what Juicer solves — context switches, plan rot, review burnout. The bar is "meaningfully better than your current ad-hoc setup," not "feature-parity with Conductor."

---

## The five surfaces that matter

These are what Forge must execute on better than anyone.

### 1. The plan workspace
Document-shaped, not chat-shaped. Structured sections accrete as the plan matures. Inline agent suggestions with accept/reject. Open questions surfaced explicitly. Versioned, searchable, exportable, forkable.

### 2. Multi-critic synthesis with disagreement adjudication
A configurable panel of critics — different prompts, different models — runs in parallel. Synthesis identifies agreements, disagreements, and the **crux of each disagreement**. The human adjudicates disagreements; the lock gate enforces zero unresolved disagreements.

### 3. The In Flight view
Status, not show. Each running task displays: name, agent, elapsed, ETA, phase. No terminal output by default. A drill-down exists for debugging when something goes wrong, but it is deliberately not the primary view. Tasks that finish disappear from In Flight and land in the review queue.

### 4. Risk-routed PR review queue
PRs land triaged into safe / needs-eyes / broken. Triage signals visible: diff size, critic findings, test status, scope match, fix iterations. Batch-approve the safe. Keyboard-driven everything.

### 5. The morning digest
Auto-presented when the app opens after time away. Summarizes completions, blockers, queue state. Suggests next action in priority order. Restores cursor position from where you left off.

---

## What Juicer is *not*

- **Not a session viewer.** Sessions are jobs. The In Flight view shows status, not output.
- **Not a parallel execution UI.** Conductor and Superset have this. We build the minimum execution surface required.
- **Not an IDE.** Editing happens in whatever the agents use.
- **Not a chat product.** Plan iteration is document-shaped.
- **Not a model gateway.** Users bring their own agents.
- **Not an interactive permission system.** Hook configuration enforces policy; Juicer does not prompt mid-run.
- **Not an enterprise compliance product.** We are not pursuing SOC 2 or ISO 42001.
- **Not a launched product.** No pricing, no marketing, no polish-for-strangers — Forge serves its operator.
- **Not cross-platform.** macOS only through the foreseeable future.

---

## The magical demo moment

Open the laptop in the morning. Juicer is open from yesterday. The morning digest presents:

> **While you were away (8h 14m):**
> - 4 plans completed execution. 3 PRs ready for review. 1 needs your input on a critic disagreement.
> - 12 PRs landed in the review queue. **8 are auto-approved-safe** (small diffs, tests pass, critics approved, in scope). 3 need eyes. 1 was kicked back after fix loop exhausted.
> - 2 plans are blocked: "auth migration v2" waiting on your answer to an open question. "telemetry refactor" hit a missing dependency.
> - You were drafting "search index rebuild" — cursor at line 47.
>
> **Suggested:** Triage the 3 PRs needing eyes (est. 12 min), then unblock "auth migration v2" (5 min), then resume drafting.

Sixty seconds from open to oriented. Zero sessions watched. Maximum agency.

---

## Pricing

There is no pricing plan. Forge is not launched, marketed, or priced — it serves its operator ([ROADMAP.md](ROADMAP.md), "Deliberately not on the roadmap"). The Track B pricing thesis (no free tier, $30-50/mo personal, Juice bundle) lives with the rest of the archived plan in [`archive/ROADMAP-track-b-juicer.md`](archive/ROADMAP-track-b-juicer.md).

---

## Success looks like

The phase exit criteria in [ROADMAP.md](ROADMAP.md) are the scoreboard: F0 — a review run posts every finding, resolves on fix, survives re-runs without duplicates, and the full loop completes headless with zero intervention; F1 — most runs merge with zero or one human touch-up commit; F2 — multiple specs run in parallel for weeks while the operator orients from the digest and never feels obligated to watch a session.

The archived plan's revenue/launch milestones (Track B months 6/12/18-24) are preserved in [`archive/ROADMAP-track-b-juicer.md`](archive/ROADMAP-track-b-juicer.md).

---

## Why now

- Frontier models produce real auto-critique signal, not noise
- Local CLI agents are production-grade across 5+ providers
- The hook ecosystems (Claude Code hooks, opencode permissions, custom scripts) have matured enough to enforce policy without the orchestrator's involvement
- The category has been validated by Windsurf 2.0
- Conductor and Superset prove people install desktop orchestrators
- **But the field hasn't figured out that supervision is the bottleneck, not execution** — that thesis is still open

The window for "yet another parallel orchestrator" is closed. The window for "the operator's cockpit that doesn't watch the show" is open.

---

## Companion product: Juice

Juice is the Swift macOS app that mines coding agent conversation history (Claude Code, Codex, Cursor, Windsurf, Aider, opencode) and produces per-repo optimizations: skills, CLAUDE.md, AGENTS.md, settings, coaching. Juice ships first as a standalone product.

Forge and Juice are siblings. Juice optimizes individual agents. Forge orchestrates fleets of them without watching them. The integration — Forge reads Juice's outputs; Forge's runs feed Juice's mining — is the structural moat. Better agents need less supervision, which makes the job-not-show premise more sustainable. The flywheel reinforces itself.

---

## Naming

**Forge** — this repo, the deliverable. Anvil where the shape is hammered out, and the tool that ships.
**Juicer** — the name reserved for the archived Rust rebuild; in this document, shorthand for the operator's-cockpit concept. The thing that wields the juice. Playfulness is deliberate: the category trends humorless and over-serious; this project goes the other way.
