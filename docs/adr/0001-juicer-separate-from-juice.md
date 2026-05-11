# ADR 0001 — Juicer is a separate product from Juice

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10

## Context

Juice (the Mac-native Swift app that mines coding-agent conversation history) and the eventual orchestrator product have overlapping concerns: both operate on agent sessions, both want to live in the same workflow, both would benefit from sharing data about what agents did and why. The natural temptation was to fold the orchestrator into Juice as a feature.

But Juice is already a shipping product with its own scope, audience, and roadmap. Bundling a fleet-supervision surface into it would expand Juice's scope, slow its independent shipping, and entangle two products with different lifecycles. See Juice's own [ADR 0009](https://github.com/tcashel/juice) for the reciprocal boundary statement.

## Decision

Build the orchestrator as a separate product, **Juicer**. Juice and Juicer are siblings: independent codebases, independent release cadences, sharing data only via filesystem and SQLite contracts.

## Consequences

- Two codebases, each focused. Juice ships first.
- The orchestrator is named **Juicer** (Juice + the operator's cockpit).
- Integration is contract-based: Juicer reads Juice's outputs (CLAUDE.md, AGENTS.md, skills) and writes session history back to a shared location for Juice's mining pipeline. The integration is the structural moat (see [`0017-juice-flywheel-moat`](./0017-juice-flywheel-moat.md)).
- Either product can change stack without the other rewriting (Juice is Swift; Juicer is TypeScript-prototype then Rust-product).
