# ADR 0020 — Hook-policy enforcement at the agent level, not the orchestrator

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`0006-subprocess-agents`](./0006-subprocess-agents.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md)

## Context

Competing products mediate tool-call permissions at the orchestrator layer: the agent asks to run `rm`, the orchestrator surfaces a prompt to the human, the human approves or denies. This is the supervision premise made concrete in the permissions model. It is also incompatible with [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md) — an orchestrator-level approval prompt is, by definition, the operator being asked to watch.

Modern agent CLIs already have their own permission/hook systems: Claude Code has hooks, opencode has permissions, custom agents can run wrapper scripts. The infrastructure for safe headless execution already exists *at the agent layer*. Re-implementing it in the orchestrator duplicates work and re-introduces the supervision premise.

## Options

### A — Hook policy at the agent level (selected)

**Pros:**
- Consistent with [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md) — no orchestrator-level prompts means no involuntary watching.
- Reuses agents' existing permission infrastructure rather than building a parallel one.
- One source of truth for what each agent can do; debuggable by reading the agent's hook config.

**Cons:**
- Users must invest in hook setup before they can run agents safely. Onboarding tax.
- Cross-agent uniformity is harder; each agent has its own hook idiom.

### B — Orchestrator-level approval layer

**Rejected.** Re-introduces the supervision premise; defeats the thesis.

### C — Provide both modes

**Rejected.** Dilutes the thesis; users default to the approval mode out of habit.

## Decision

**Neither Forge nor Juicer mediates tool permissions at runtime.** Users configure Claude Code hooks, opencode permissions, or custom hook scripts. The orchestrator launches the agent subprocess and gets out of the way.

## Consequences

- Users must invest in hook setup. **Acceptable target-audience tax** — staff/principal engineers can and will configure hooks.
- Track B Phase 5 onboarding docs include a **recommended hook config baseline** so the setup cost is bounded.
- A **hook-config validation tool** may be useful later (Phase B3+, see `DECISIONS.md` pending list).
- No "permissions" or "approval" surface in either Track A or Track B.
- If a hook config is misconfigured and an agent does something destructive, the failure mode is on the user — the same as for any other agent-runtime misconfiguration.

## Non-goals locked by this ADR

- **No orchestrator-level tool-call approval UI**, ever.
- **No "safe mode" toggle** that re-introduces approval prompts.
- **No prompts mid-run** for any reason that the agent's own hook layer could handle.
