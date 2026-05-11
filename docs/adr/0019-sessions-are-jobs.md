# ADR 0019 — Sessions are jobs, not shows

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`0013-operators-cockpit-positioning`](./0013-operators-cockpit-positioning.md), [`0014-differentiation-before-execution`](./0014-differentiation-before-execution.md), [`0018-non-ide-positioning`](./0018-non-ide-positioning.md), [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md), [`../VISION.md`](../VISION.md)

## Context

Every shipping competitor treats agent sessions as **primary surfaces**. The user is expected to watch tool calls, approve permissions mid-stream, intervene when an agent goes off course, and review the output as it appears. This pattern caps fleet scale at the human's *supervision ceiling* — practically, two or three concurrent agents before the operator loses coherence across them.

Juicer's target audience runs five or more agents in parallel. Matching the competitor pattern would compete on the wrong axis (smoother supervision UI) and accept the supervision ceiling as a structural cap on the product's value.

The way out is to demote the session — to treat it not as a *show* the operator watches, but as a *job* the operator dispatched, like a build or a deploy.

## Options

### A — Sessions are jobs (selected)

**Pros:**
- Breaks the supervision ceiling — operator capacity scales with the number of jobs, not the number of streams they can watch.
- Aligns structurally with the cockpit metaphor (see [`0013-operators-cockpit-positioning`](./0013-operators-cockpit-positioning.md)).
- The In Flight view becomes legible at a glance even with 20 concurrent tasks.

**Cons:**
- Demanding of the user. Requires trust in agent hook configs (see [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md)).
- Harder to demo with flashy real-time output.

### B — Match competitor pattern with a session viewer

**Rejected.** This is the bottleneck Juicer exists to remove.

### C — Hide the session by default but provide easy expand

**Rejected.** Makes the demoted surface too discoverable; users revert to old habits and the structural advantage evaporates.

### D — Show summarized streaming in real time

**Rejected.** Even summarized streaming invites watching. A phase indicator updated on transition is enough.

## Decision

**In Juicer, sessions are jobs.** Concretely:

- The In Flight view shows **status** (name, agent, phase, elapsed, ETA), **not output**.
- Streaming subprocess output is captured to storage for debug drill-down but is **not a primary UI surface**.
- The orchestrator does **not** prompt for tool-call permissions; hook-policy enforcement is the agent's job (see [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md)).
- The user's verbs are **plan / run / review / ship** — not **watch**.

**Rationale:** Structural enforcement of the operator-cockpit thesis. If the codebase exposes streaming output as a primary surface, the thesis dies by drift.

**Risks to monitor:** If operators repeatedly need to drop into raw session debug to diagnose failures, that signals either a phase-detection problem or a critic-coverage gap, not a need to surface streams.

## Consequences

- The In Flight view name and design encode the thesis.
- `task_runs.phase` and `task_runs.eta_seconds` columns in `../SCHEMA.md`.
- Orchestrator API does **not** expose streaming output to the View Layer by default; `JobEvent` carries summary state only.
- A separate `session_debug` view exists, accessed by keyboard shortcut on a specific job, **never opened automatically**.
- Tool-call permission UI is explicitly **not built**.
- More demanding of the user — they must trust their agents headless. The target audience is the right one for this ask.
- Architectural enforcement: the headless property is **structural, not stylistic**. Applies to both Track A and Track B.

## Non-goals locked by this ADR

- **No streaming-output primary surface** in either track.
- **No orchestrator-level tool-call permission prompts**, ever.
- **No "expand session" affordance** that surfaces raw stream by default. The escape hatch exists but is deliberately a low-discoverability keyboard shortcut.
