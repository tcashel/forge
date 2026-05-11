# ADR 0003 — Local-first, no required backend

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`../ARCHITECTURE.md`](../ARCHITECTURE.md), [`../SCHEMA.md`](../SCHEMA.md)

## Context

Competing products (Conductor, Superset, Windsurf, Intent) vary in how much state lives on the user's machine vs. in a vendor-operated cloud. A required backend would create an ops burden, a privacy concern for proprietary code, and a single point of failure for a daily-driver tool — and it's not necessary for the surfaces Juicer is shipping.

## Decision

SQLite is the source of truth. Juicer runs entirely on the user's machine with no required network connection. Cloud sync is a possible future feature, not a Phase 1 requirement.

## Consequences

- No central infrastructure to operate, monitor, or pay for.
- No data leaves the user's machine unless they explicitly configure it to.
- Multi-machine workflow (e.g. desktop + laptop) is deferred; users own their backups.
- The SQLite schema (see [`../SCHEMA.md`](../SCHEMA.md)) is the central contract — for the two-track build path, it's also the contract between Track A and Track B.
- Sales positioning gains a privacy / IP-protection angle.
