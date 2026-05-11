# ADR 0008 — Critics are agents

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0006-subprocess-agents`](./0006-subprocess-agents.md), [`0016-multi-critic-synthesis`](./0016-multi-critic-synthesis.md)

## Context

The multi-critic synthesis surface (see [`0016-multi-critic-synthesis`](./0016-multi-critic-synthesis.md)) is a Phase 1 differentiator. The question was whether critics should be a *separate* abstraction in the codebase — with their own runtime, their own prompt machinery, their own event flow — or whether they should reuse the agent infrastructure.

## Decision

A critic is **`(prompt_template, model_config)`** invoked through the standard agent adapter trait. There is no critic-specific runtime. Adding a critic is a configuration row, not new code.

## Consequences

- One mechanism, two use cases: the same subprocess agent infrastructure (see [`0006-subprocess-agents`](./0006-subprocess-agents.md)) runs both planning/execution agents and critics.
- Adding or tuning a critic is a config edit, deployable without a release.
- Event flow is uniform: a critic's lifecycle, output capture, and error handling work the same way as an execution agent.
- The critic-panel UI configures these rows; users can author their own critics.
- Synthesis (the multi-critic combination logic) sits *above* this layer — it consumes critic outputs but doesn't care that they came from agents.
