# ADR 0009 — Workspace crate structure (Track B); mirror module names (Track A)

**Status:** Accepted (clarified by [`0021-two-track-build-path`](./0021-two-track-build-path.md))
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0021-two-track-build-path`](./0021-two-track-build-path.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md)

## Context

Track B is a Rust project; Track A is the existing TypeScript codebase. The two tracks will share architectural shape (same subsystems: plan engine, critic pool, orchestrator, storage, etc.) but use different language idioms. The goal is to make the conceptual port from TypeScript to Rust as straightforward as possible — minimize naming and boundary surprises during the transition.

## Decision

**Track B** uses a Cargo workspace structured as follows (per [`../ARCHITECTURE.md`](../ARCHITECTURE.md)):

- 9 crates introduced in Phase B1 (plan engine, critic pool, agents, storage, orchestrator, view, etc.)
- 2 crates added in Phase B2 (execution, review)
- 1 crate added in Phase B4 (`juicer-juice-bridge`)

**Track A** uses a TypeScript `src/` module structure with **the same names** as Track B's crates.

## Consequences

- Module-to-crate naming parity makes the conceptual port from TypeScript to Rust mechanical at the boundary level.
- The existing Forge TS code may need restructuring in Phase A0 to fit the target module names. This is intentional scope of Phase A0.
- Cross-document references (e.g. "the orchestrator subsystem") resolve to a single concept across tracks.
- If a Track A module turns out to be the wrong shape, the lesson is cheap to apply in Track B before B1 commits to the crate boundary.
