# ADR 0016 — Multi-critic synthesis with explicit disagreement adjudication

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`0005-plan-as-document`](./0005-plan-as-document.md), [`0008-critics-are-agents`](./0008-critics-are-agents.md), [`0014-differentiation-before-execution`](./0014-differentiation-before-execution.md)

## Context

Intent (Augment) has single-pass critique. Research literature on multi-agent adversarial review shows it consistently outperforms single-agent review on complex reasoning tasks. No shipping product in the agent-orchestration space has multi-critic with human-in-the-loop disagreement adjudication.

This is a place where the literature and the market are misaligned: the technique works, but nobody has productized it. That's the kind of gap a differentiated Phase 1 product is built on.

## Decision

**Multi-critic synthesis with disagreement adjudication** is a Phase 1 differentiating capability — validated in Track A, polished in Track B.

The flow:
1. The locked plan document (see [`0005-plan-as-document`](./0005-plan-as-document.md)) is sent to N critics.
2. Each critic is an agent (see [`0008-critics-are-agents`](./0008-critics-are-agents.md)) configured with a `(prompt_template, model_config)`.
3. Synthesis combines critic outputs, surfacing **agreement** and **disagreement** distinctly.
4. Where critics disagree, the human adjudicates — explicitly, in UI.

## Consequences

- The **synthesis UI is the hardest design problem in Phase 1**. It must be legible at a glance and support fast adjudication.
- A new table is required in the schema (see [`../SCHEMA.md`](../SCHEMA.md)) to record critic configs and per-critic outputs alongside the plan version they reviewed.
- The critic panel config UI must support diverse critics (different models, different prompts) without becoming a power-user-only surface.
- Disagreement adjudication UX (inline vs. modal vs. separate workspace) is deferred to Phase A1 (see `DECISIONS.md` pending list).
- Synthesis approach (agent-based vs. rule-based) is deferred to Phase A1 (see `DECISIONS.md` pending list).
- If the technique fails to deliver value in Track A, it's the most likely Phase 1 surface to be cut — making early validation critical.
