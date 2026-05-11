# ADR 0014 — Differentiation before execution

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`0005-plan-as-document`](./0005-plan-as-document.md), [`0016-multi-critic-synthesis`](./0016-multi-critic-synthesis.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`../ROADMAP.md`](../ROADMAP.md), [`../COMPETITORS.md`](../COMPETITORS.md)

## Context

Competitive research (see [`../COMPETITORS.md`](../COMPETITORS.md)) showed a crowded execution-orchestrator market: Conductor, Superset, Windsurf, Intent, plus 40+ open-source projects. Shipping an execution-spine first would deliver a commodity product into a crowded market and would not validate Juicer's actual differentiation thesis (plan workspace + multi-critic synthesis + headless execution model).

Two phasing paths existed:

- **Execution first, differentiation later.** Build the parallel-agents-with-worktrees flow before the plan workspace. Match the market quickly, layer differentiation on top.
- **Differentiation first, execution later.** Build the plan workspace and multi-critic synthesis surface first. Add minimal execution second.

The first path optimizes for ship-speed against the market. The second optimizes for validating that the differentiated surfaces actually deliver value before investing in a commodity layer.

## Decision

**Phase 1 (in both tracks) ships only:**

- Plan workspace
- Multi-critic synthesis
- Plan library

**Phase 2 adds:**

- Minimal execution
- Risk-routed review queue
- Morning digest

## Consequences

- Phase 1 exit criterion is "**draft and lock a real spec**" — not "execute an agent."
- Earlier validation of the differentiation thesis. If multi-critic synthesis doesn't deliver value, the failure surfaces before significant execution investment.
- Shipping order in [`../ROADMAP.md`](../ROADMAP.md) reflects this phasing for both Track A (A1 = plan + critique; A2 = execution + review + digest) and Track B (B1 = plan + critique; B2 = execution + review).
- Demos and friend-shares during Phase 1 cannot rely on flashy parallel-execution screen captures. The plan workspace and the synthesis surface have to carry the demo on their own merits.
- If Phase 1 fails to validate, sunk cost on execution-spine work is zero.
