# ADR 0012 — macOS-only through the foreseeable future

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0002-rust-gpui-for-juicer`](./0002-rust-gpui-for-juicer.md), [`../ROADMAP.md`](../ROADMAP.md)

## Context

Cross-platform support multiplies engineering surface (build, QA, support, distribution) without proportionally multiplying the addressable target audience. Juicer's target user — staff/principal engineers running agent fleets — is heavily macOS-skewed. GPUI on Linux/Windows is also less mature than on macOS.

## Decision

Juicer ships **macOS-only** through Track B Phase 5. Windows and Linux support is **reassessed only on user demand**, not delivered preemptively.

## Consequences

- Smaller market, but higher quality on the platform we support.
- Mac-specific affordances (system fonts, native menus, Spotlight integration, native window chrome) are usable freely without portability concerns.
- Build/CI runs on macOS only.
- Distribution and signing model assumes Apple's developer infrastructure.
- If a future operator-cockpit-shaped product gets serious cross-platform demand, the work is scoped at that point, not now.
