# ADR 0030 — Strategy reset: surfaces commoditized; pause Track B, keep Track A as the operator-scoped cockpit

**Status:** Proposed — pending the operator-scope validation experiment (gate to Accept)
**Deciders:** Tripp
**Date:** 2026-06-02
**Related:** [`0021-two-track-build-path`](./0021-two-track-build-path.md) (revisits), [`0028-spec-dependency-graph-and-orchestration-agent`](./0028-spec-dependency-graph-and-orchestration-agent.md) (supersedes), [`0014-differentiation-before-execution`](./0014-differentiation-before-execution.md), [`0016-multi-critic-synthesis`](./0016-multi-critic-synthesis.md), [`0013-operators-cockpit-positioning`](./0013-operators-cockpit-positioning.md), [`0022-skill-cli-as-agent-contract`](./0022-skill-cli-as-agent-contract.md), [`../COMPETITORS.md`](../COMPETITORS.md), [`../VISION.md`](../VISION.md), [`../BUILD_PATH.md`](../BUILD_PATH.md)

## Context

Between May and June 2026, the substrate Forge planned to build or differentiate on commoditized in public, on a monthly cadence. Two adversarial reviews (2026-06-01 and 2026-06-02, both on Opus) and hands-on use of the alternatives surfaced the following, which the prior strategy did not account for:

- **Three of the five "differentiated surfaces" ([VISION.md](../VISION.md)) shipped as Claude Code Routines** — morning digest → Slack, risk-routed PR triage/auto-review, and an event-driven Monitor (In-Flight) view.
- **Multi-critic synthesis ([ADR-0016](./0016-multi-critic-synthesis.md)) is now a ~30-line Claude Code Workflow** (the "judge panel" pattern). Only the human disagreement-*adjudication* surface (crux extraction + gating lock) is not yet commodity.
- **The conversation-led plan workspace ([ADR-0026](./0026-conversation-led-plan-authoring.md)) is plan-mode + a markdown-maintaining skill + git + a one-line lock gate.** The differentiated "converging dialogue" is a property of the agent, which is already conceded as commodity substrate ([ADR-0004](./0004-bring-your-own-agent.md)).
- **[ADR-0028](./0028-spec-dependency-graph-and-orchestration-agent.md)'s typed dependency graph *is* [beads](https://github.com/gastownhall/beads)** — `bd ready` (ready-frontier), `bd dep cycles` (cycle detection), `bd-a3f8.1.1` (epic→child hierarchy), `bd remember`/`bd prime` (agent memory). The Rust port `beads_rust` (MIT, SQLite + JSONL, MCP) is the Track-B-compatible store ADR-0028 was going to hand-build. ADR-0028 never enumerated beads as an option; building its Option B is re-implementing beads.
- **The [COMPETITORS.md](../COMPETITORS.md) tripwire fired.** Its "what would force a strategic rethink" list named *"Anthropic ships native multi-plan orchestration in Claude Code"* — which happened (Workflow + Routines) — and the docs were not updated to admit it.

The prior internal analysis repeatedly answered each commoditization with "be the cockpit, integrate that substrate, the moat retreats upward to the surfaces." Four such retreats in one session is a receding-moat rationalization, not a boundary — and the surfaces themselves then commoditized.

**What survived scrutiny** was *not* identified by the analysis but by the operator's lived experience: the durable differentiator is **operator scope and zero repo-imposition**. Forge stores state in `~/.forge`, owns its own skills, and overlays *any* repo to plan/spec/run/review **without** editing CLAUDE.md, committing a per-repo DB, or requiring team buy-in. The commodity substrate is the opposite: beads needs a per-repo `.beads/*.db` (commit the dotfile; it fights worktrees — acute given [ADR-0024](./0024-worktrees-disposable-lifecycle.md)) plus CLAUDE.md edits; Routines/Linear are account/repo/team-scoped. Those tools onboard *the org*; Forge serves *the operator*.

## Options

### A — Build Track B (Juicer / Rust + GPUI) as planned ([ADR-0021](./0021-two-track-build-path.md))

**Cons:** A multi-year native build justified by surfaces that just commoditized. You don't write a from-scratch GPUI app to render a triage list, a digest, and a crux-picker over data `gh` + `bd` + the agent already hold. Economics inverted.

### B — Kill Forge entirely; just use skills + beads/Linear

**Cons:** Discards the one thing that actually survived — operator-scoped, worktree-safe, zero-imposition integration — which bare beads (per-repo DB, CLAUDE.md edits, team buy-in) does not give for free.

### C — Pause Track B; keep + sharpen Track A as the operator-scoped non-invasive cockpit; integrate commodity substrate; validate via experiment (chosen)

Track A Forge is already a skill-first system ([ADR-0022](./0022-skill-cli-as-agent-contract.md)) with out-of-repo state. Keep it lean and non-invasive; integrate beads/Workflow/Routines as optional substrate where they help; treat operator scope + zero repo-imposition as the differentiator (not the surfaces). Gate the decision on a 2-week experiment.

**Pros:** Keeps what survived, deletes the unjustified multi-year Rust build, and matches Track A's existing scope (founder daily driver + share with friends, [ADR-0013](./0013-operators-cockpit-positioning.md)). **Cons:** Smaller ambition than a paid native product; the operator-scope value may itself be achievable with config (`BEADS_DIR`, user-scoped skills) — which the experiment must test.

## Decision

**Adopt Option C.** Pause Track B (Juicer / Rust + GPUI). Keep and sharpen **Track A Forge** as an operator-scoped, non-invasive, skill-first cockpit. Integrate beads (likely `beads_rust`), Claude Code Workflow, and Routines as **optional commodity substrate** rather than building equivalents. **Relocate the claimed moat** from "the five surfaces" (commoditizing) to **"operator-scoped, zero-repo-imposition integration over commodity substrate."**

This is **Proposed pending a 2-week validation experiment** (see *Implications*); the experiment's outcome is the gate to flip this ADR to Accepted (or to Option B if the value turns out to be config-achievable).

**Rationale:** The surfaces commoditized; the agent/orchestration/graph/memory were already commodity. The only durable, structurally-defensible gap is being the operator's private, repo-non-invasive integration layer — a position the team/repo/account-scoped substrate cannot occupy. That does not justify a multi-year native rewrite; it justifies keeping the already-built Track A lean.

**Risks to monitor:** (1) operator-scope value proves config-achievable (`BEADS_DIR` + user-scoped `~/.claude` skills) → then it's a skill pack, not a product. (2) the surviving residue (crux-adjudication) is too small to matter. (3) the cockpit itself keeps commoditizing as Claude Code/beads add surfaces.

## Consequences

- **[ADR-0021](./0021-two-track-build-path.md) (two-track build) is revisited:** Track B is paused; the gate that moves from Track A → Track B does not fire until/unless the experiment proves a product-shaped need beyond a skill pack. Track A is no longer a "prototype to be replaced" but the deliverable.
- **[ADR-0028](./0028-spec-dependency-graph-and-orchestration-agent.md) is superseded:** do not build `work_items`/`work_item_edges`. Adopt an external agent-native graph (beads) if a graph is needed at all; Forge owns the spec/critique/review layers above it. The orchestration "let it cook" loop, if pursued, prototypes as a Workflow against `bd ready`, not as a hand-built scheduler.
- **[ADR-0014](./0014-differentiation-before-execution.md) / [ADR-0016](./0016-multi-critic-synthesis.md):** the "differentiate on the surfaces / multi-critic is the upstream moat" premise expired; the moat relocates per this ADR.
- **[ADR-0013](./0013-operators-cockpit-positioning.md) is reinforced:** "operator's cockpit" is the right positioning; the delivery vehicle changes from "native Rust product" to "non-invasive skill-first overlay."
- **[COMPETITORS.md](../COMPETITORS.md):** the "Anthropic ships native orchestration" tripwire is logged as **fired** (2026-06).
- **[ROADMAP.md](../ROADMAP.md) / [BUILD_PATH.md](../BUILD_PATH.md):** Track B phases (B0–B5) are paused; the two-track gate is suspended pending the experiment.

## Implications for current work — the validation experiment

A ~2-week experiment is the gate. **Hypothesis to falsify:** "Forge (Track A) must exist; bare skills + beads can't capture its value, *and* its operator-scoping isn't just config."

- Stand up `beads_rust` + adapt the existing `skills/forge-{planner,critic,synthesizer,reviewer}` prompts into a skill pack + one Routine (dispatch/review/digest). Terminal + Slack, no GUI.
- Daily-drive it: lock ≥3 real specs through the plan skill + lock gate; run the critic-panel Workflow + an adjudicate skill on each; burn one small epic ready→dispatch→review→merge without watching.
- **Instrument the *right* questions** (not just adjudication friction): (a) could you get **operator-scoped, worktree-safe, zero-repo-imposition** plan→spec→run→review out of bare parts, or did assembling it **reassemble Forge**? (b) digest orients in <60s? (c) crux-adjudication friction 1–5?
- **Decision rule:** if assembling the non-invasive operator workflow keeps landing back at Forge → Track A is the product (flip this ADR to Accepted, scope stays lean). If `BEADS_DIR` + user-scoped skills + a Routine get there in an afternoon → Option B (ship the skill pack, retire Forge-as-product). If only crux-adjudication hurts → build *just* that TUI over `forge dash`, nothing more.

## Non-goals locked by this ADR

- **No Track B / Rust / GPUI work** until the experiment proves a product-shaped need. No "read Zed source for calibration."
- **No building the dependency graph** (`work_items`/`work_item_edges`) — adopt beads or nothing.
- **No tracker sync layer** (Jira↔beads bidirectional). Lived experience showed it's painful; prefer one local-first tracker.
- **Do not re-expand the moat to "the surfaces"** — that premise expired; the moat is operator-scope + zero-imposition, or it's a skill pack.
