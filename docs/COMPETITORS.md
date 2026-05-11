# Competitive Landscape

Snapshot as of May 2026. Update quarterly.

This document keeps us honest. Every feature in Juicer should be defensible: either nobody else does it, or we do it meaningfully better, or it's table-stakes plumbing we accept the cost of.

This applies to both Track A (Forge, prototype) and Track B (Juicer, product). The competitive position is the same; only the polish target differs.

---

## The premise that divides the field

Every competing product in this space treats the **agent session as a first-class surface**. The user is expected to watch the agent work, approve its tool calls, and intervene when it goes off course.

**Juicer rejects this premise.** Sessions are jobs. The user plans, dispatches, and triages outputs — not transcripts. This is the single most important architectural and product difference between Juicer and everything else listed here.

When reading the strengths and weaknesses below, watch for the pattern: every "strength" of the competitors is some version of *they make watching the session pleasant*. That's the entire ceiling of the supervising model.

---

## Tier 1: Direct competitors (desktop orchestrators)

### Conductor (Melty Labs)
- **URL:** <https://www.conductor.build/>
- **What it is:** Mac desktop app for running Claude Code + Codex in parallel git worktrees with diff-first review
- **Pricing:** Free. BYO agent subscription.
- **Stack:** Native Mac (likely Swift; not source-available)
- **Premise:** Session-as-surface. Each agent gets its own workspace with chat, scratchpad, diff view. User watches and intervenes.
- **Strengths:**
  - Polished, fast, well-loved
  - Workspace scratchpads (shared with agents via `<notes>`)
  - Tight Claude Code integration including direct diff comments
  - Customizable per-repo prompts
  - GitHub comment sync to diff
  - Active changelog
- **Weaknesses:**
  - Two agents only (Claude Code + Codex)
  - No plan workspace; planning happens in chat
  - No multi-critic synthesis
  - No risk-routed review queue; reviews are file-by-file
  - No morning digest
  - Session-watching is the default mode; no way to operate fleet-style
- **Threat level:** **High at the bottom tier.** Free + excellent at supervising parallel agents.
- **How Juicer differs:** Upstream and downstream — plan workspace before execution, risk-routed triage after, headless execution between. Conductor users *supervise*; Juicer users *deploy*.

### Superset
- **URL:** <https://superset.sh/>
- **Repo:** <https://github.com/superset-sh/superset>
- **What it is:** Source-available Mac desktop workspace for orchestrating many CLI agents in parallel worktrees
- **Pricing:** Free tier + Pro $20/seat/mo
- **License:** Elastic License 2.0
- **Stack:** Electron + React + TypeScript
- **Premise:** Session-as-surface, agent-agnostic. Workspace around the sessions includes chat, terminal, diff editor, browser preview.
- **Strengths:**
  - Broadest agent support: Claude Code, Codex, OpenCode, Aider, Cursor Agent, Gemini CLI, Copilot, Superset Chat
  - Strong community momentum
  - In-app chat, diff/file editor, browser preview, MCP tooling
  - Persistent sessions across laptop close
  - "Generational product in the making" testimonials
- **Weaknesses:**
  - Electron — performance ceiling, doesn't feel native
  - Agent-agnostic *workspace*, not workflow — planning, critique, review are user-assembled
  - No structured plan documents
  - No multi-critic synthesis
  - No risk routing
  - Same supervising premise as Conductor, just with more agent options
- **Threat level:** **High at the middle tier.** Owns "the canonical agent-agnostic supervisor."
- **How Juicer differs:** Native (GPUI vs Electron in Track B), opinionated workflow vs. flexible workspace, headless execution vs. session-watching, plan/critique/triage layer above the runner.

### Windsurf 2.0 (Cognition)
- **URL:** <https://docs.windsurf.com/windsurf/agent-command-center>
- **What it is:** Agentic IDE with Agent Command Center (Kanban of local + cloud agents) and bundled Devin
- **Pricing:** Pro $15/mo, Max, Teams; Devin bundled
- **Stack:** VS Code fork + Devin cloud
- **Premise:** IDE-first. The Command Center is a Kanban *on top of* sessions you can still click into.
- **Strengths:**
  - $10B-valued company; enormous marketing/distribution
  - Local + cloud hybrid (close laptop, Devin keeps working)
  - Spaces group sessions, PRs, files, context per task
  - Existing Windsurf users auto-convert
- **Weaknesses:**
  - IDE-centric — center of gravity is still the editor
  - Cloud-locked persistence story (must use Devin)
  - Closed source, single-vendor
  - Generic Kanban; no plan workspace, no critic synthesis, no risk-routed triage
  - Still session-watching when you drill in
- **Threat level:** **High at the top tier.** Brand + funding + distribution.
- **How Juicer differs:** Not an IDE; operator-first; local execution under user's hook config; BYO host/agent; headless by design.

### Intent (Augment Code)
- **URL:** <https://www.augmentcode.com/>
- **What it is:** Spec-driven Mac orchestrator with separate Critique (pre-execution) and Verify (post-execution) phases
- **Pricing:** Augment Code plan structure
- **Stack:** Native Mac (macOS-only currently)
- **Premise:** Spec-first, but execution is still session-shaped — user watches Auggie work, reviews outputs.
- **Strengths:**
  - Closest thesis match (spec-first, critique-first)
  - Living specs
  - Context Engine over 400,000+ files
  - BYOA: Auggie + Claude Code + Codex + OpenCode
  - Enterprise compliance: SOC 2 Type II, ISO/IEC 42001
- **Weaknesses:**
  - Built for enterprise procurement; individual operator UX secondary
  - Single critique pass, not multi-critic synthesis with disagreement adjudication
  - Auggie-centric; other agents second-class
  - No cognitive-load-management surface (digest, triage, attention routing)
  - No coaching companion
- **Threat level:** **Medium-high.** Closest in thesis, but going after a different buyer.
- **How Juicer differs:** Multi-critic synthesis with explicit disagreement adjudication, individual-operator focus, Juice flywheel, headless run experience, morning digest as marquee surface.

---

## Tier 2: Adjacent products

### Claude Code Agent Teams (Anthropic)
- Multi-agent within a single Claude Code session
- tmux/iTerm2 split panes or in-process; inbox-based message passing
- **Threat:** Anthropic owns the agent itself. If they build a great orchestrator natively, bottom drops out.
- **Differentiation:** Multi-provider, headless, plan+triage layer.

### Cursor (Background Agents + Composer)
- IDE-centric, mostly synchronous
- Background agents for parallel work
- **Threat:** Largest mindshare in AI coding.
- **Differentiation:** Not an IDE; operator-first; headless.

### Cloud agents (Devin, Codex Web, Jules, Claude Code Web, Copilot Coding Agent)
- Fully cloud-hosted; describe task, walk away
- **Threat:** "Just use cloud agents" is a competitive offering with no orchestrator needed.
- **Differentiation:** Juicer is for users who want local control, BYO host, deep plan iteration, and human-in-the-loop *adjudication* — not human-in-the-loop *supervision*. Cloud agents abdicate too much; Juicer hands off the right things only.

### Graphite (and stacked PR tools)
- AI review on stacked PRs
- **Threat:** Owns the PR review surface in GitHub workflows.
- **Differentiation:** Juicer's queue is for agent-generated PRs with critic context; Graphite is for human-authored stacked PRs.

### Linear / Jira
- Project management with agent integrations
- **Threat:** Owns work-tracking surface.
- **Differentiation:** Juicer integrates with these (export locked plan to Linear issue with sub-issues). Not a replacement.

---

## Tier 3: The long tail

40+ open-source orchestrators tracked at <https://github.com/andyrewlee/awesome-agent-orchestrators>:

agentsmesh, antfarm, ClawTeam, CompanyHelm, fusion, gastown, gnap, CodexMonitor, constellagent, crystal, dorothy, jean, lalph, mux, openkanban, parallel-code, tutti, vibe-kanban, vibe-tree, vibecraft, agent-kanban, agent-of-empires, ai-maestro, aizen, amux, Aperant, bernstein, claude-squad, code-conductor, …

Mostly GitHub-stage prototypes. Collective threat low individually, higher in aggregate — they crowd discoverability. Almost all assume session-as-surface. None implement multi-critic synthesis with adjudication, risk-routed triage, or a paired coaching product.

---

## Where the field is converging

Common patterns across serious competitors:
- Worktree-per-task isolation
- Multi-agent CLI support
- Diff-first review
- Kanban or grid views of in-flight sessions
- BYO agent subscriptions
- macOS-first
- **Session-as-primary-surface**

If Juicer ships only the common patterns, it has no reason to exist.

## Where the field is NOT converging (our opportunities)

Things no shipping competitor has:

- **Headless execution as the default mode.** No session-watching premise. The In Flight view shows status, not output.
- **Plans as durable, versioned, structured documents** with their own lifecycle
- **Multi-critic adversarial review with explicit disagreement surfacing**
- **Risk-routed PR triage** with batch operations
- **Morning digest** with attention routing
- **Outcome learning loops**
- **A paired coaching product** (Juice) improving agents using fleet operation data

These six are the differentiators. The two-track roadmap delivers them through Track A (validation) and Track B (polish).

---

## The contrast in one table

| Dimension | Conductor / Superset / Windsurf | Juicer |
|---|---|---|
| **Primary surface** | Sessions | Plans + PRs |
| **User's job** | Supervise agents | Direct + adjudicate work |
| **Agent output display** | Streaming, prominent | Hidden; debug-only drill-down |
| **Tool-call permission** | Interactive prompts | Agent's hook config |
| **Mental model** | Manager of N session windows | Operator of a fleet |
| **Scales to** | ~5 agents (human supervision ceiling) | 10+ (no supervision) |
| **Differentiates on** | Polish, agent breadth | Planning depth, triage, flywheel |

---

## Competitive vigilance

Watch quarterly:
- Conductor changelog: <https://www.conductor.build/changelog>
- Superset releases: <https://github.com/superset-sh/superset/releases>
- Windsurf release notes
- Augment Code Intent rollout
- Anthropic Claude Code roadmap (especially Agent Teams adjacent)
- New entries to <https://github.com/andyrewlee/awesome-agent-orchestrators>

## What would force a strategic rethink

- Conductor adds a plan workspace with multi-critic synthesis AND removes the session-watching premise
- Anthropic ships native multi-plan orchestration in Claude Code
- Windsurf adds a real cognitive-load-management surface
- Intent improves individual-operator UX and exits enterprise-only positioning
- A well-funded competitor announces a Juice-equivalent coaching layer
- Any well-funded competitor adopts the explicit job-not-show framing

If any happen, revisit positioning immediately.
