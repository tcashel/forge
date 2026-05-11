# ADR 0011 — Forge retirement timeline (revised by 0021)

**Status:** Accepted (revised by [`0021-two-track-build-path`](./0021-two-track-build-path.md))
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0021-two-track-build-path`](./0021-two-track-build-path.md), [`../BUILD_PATH.md`](../BUILD_PATH.md)

## Context

Forge (this repo) is the Track A prototype and the founder's daily driver. Track B (Juicer in Rust + GPUI) is the eventual product. When Track B starts shipping, the question becomes: when does Forge stop being a daily-driver tool?

Two failure modes to avoid:
- Retiring Forge too early — losing the working substrate before Track B reaches parity.
- Retiring Forge too late — paying a dual-tool tax indefinitely and creating pressure to keep extending the TS code instead of porting.

## Decision

When the surface-based gate fires (see [`../BUILD_PATH.md`](../BUILD_PATH.md)) and Track B begins, Forge becomes the **validation reference**. It is retired from daily use as Track B catches up to feature parity.

**By Track B Phase 2, Forge is fully retired.**

## Consequences

- No dual-tool tax in the long run.
- Smooth handoff is possible because the schemas are compatible (see [`../SCHEMA.md`](../SCHEMA.md)).
- During the transition (Track B Phase 0 → Phase 2), both tools may be in use simultaneously; this is acceptable and time-bounded.
- Once Phase B2 ships, Forge stops getting maintenance updates beyond critical-bug responses.
- The anti-pattern flagged in [`0021-two-track-build-path`](./0021-two-track-build-path.md) — "if friends love the TS prototype, there's pressure to extend it instead of porting" — is the active risk this timeline guards against.
