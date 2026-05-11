# ADR 0017 — Juice flywheel as structural moat

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`0001-juicer-separate-from-juice`](./0001-juicer-separate-from-juice.md), [`0015-no-free-tier`](./0015-no-free-tier.md), [`../ROADMAP.md`](../ROADMAP.md)

## Context

The orchestrator market is crowded and feature-parity competition is unwinnable as a primary strategy. The structural advantage Juicer has — that no competitor can easily replicate — is the data contract with **Juice** (the companion product mining agent session history into per-repo optimizations).

Juice generates CLAUDE.md, AGENTS.md, skills, settings, and coaching from agent history. Juicer feeds session history back to Juice and reads Juice's outputs to improve plan drafting and critic configs. The integration creates a feedback loop: more usage → better optimizations → better plans and critics → better outcomes → more usage.

Treating Juice integration as a Phase 5 polish item would surrender the moat. It needs to be a deliberate Phase 4 deliverable.

## Decision

**Track B Phase 4 explicitly delivers deep Juice integration.**

## Consequences

- **Phase B4 is structurally important**, not optional polish.
- A new crate is introduced: **`juicer-juice-bridge`** (see [`../ARCHITECTURE.md`](../ARCHITECTURE.md)).
- Joint marketing story becomes available: Juicer + Juice as a paired workflow product, with bundle pricing (see [`0015-no-free-tier`](./0015-no-free-tier.md)).
- Schema design across both products has to anticipate cross-product reads/writes. The contract is filesystem + SQLite (per [`0001-juicer-separate-from-juice`](./0001-juicer-separate-from-juice.md)) — no shared service, no shared process.
- The integration contract itself is a deferred decision (see `DECISIONS.md` pending list — Phase B4).
- If Juice's roadmap slips, Juicer's Phase B4 slips with it. This coupling is deliberate.
