# ADR 0004 — Bring your own agent, no inference reselling

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0006-subprocess-agents`](./0006-subprocess-agents.md), [`0015-no-free-tier`](./0015-no-free-tier.md)

## Context

A class of agent-orchestration products bundle inference: they sell tokens, hide model choice, and capture margin on usage. The opposite model — users supply their own agent CLIs and pay their providers directly — keeps Juicer's revenue tied to the software value, not to token throughput, and keeps users in control of which models they use and how much they spend.

## Decision

Juicer never resells inference. Users bring their own agent CLIs (Claude Code, Codex, opencode, custom) and their own credentials. Juicer drives those agents as subprocesses and charges for the orchestration software itself (see [`0015-no-free-tier`](./0015-no-free-tier.md)).

## Consequences

- Revenue is the value of the orchestration UX, not arbitrage on model usage.
- Setup friction is higher than zero-config products. Acceptable for the target audience (staff/principal engineers).
- No inference cost on Juicer's side; pricing is independent of how heavily users run their fleets.
- The subprocess-adapter model (see [`0006-subprocess-agents`](./0006-subprocess-agents.md)) is the integration surface for new agents.
- Anti-competitive moat: even if a competitor with bundled inference appears, BYO will remain the right choice for sophisticated users who want to control their model spend.
