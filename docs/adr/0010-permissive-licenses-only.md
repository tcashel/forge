# ADR 0010 — Permissive licenses only in the dependency tree

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0015-no-free-tier`](./0015-no-free-tier.md)

## Context

Juicer (Track B) is a paid, closed-source product. Bringing a GPL/LGPL/AGPL dependency into the tree creates copyleft obligations that conflict with that distribution model. Catching license issues at release time is much more expensive than catching them at the point of dependency selection.

## Decision

All dependencies in both Track A and Track B must be under **permissive licenses**: Apache-2.0, MIT, BSD (2-clause or 3-clause), or equivalent. **No GPL, LGPL, or AGPL** anywhere in the dependency tree.

## Consequences

- License audit is part of every new dependency addition.
- A lightweight license check (e.g. `cargo deny` on Track B; a manual or scripted check on Track A) is part of CI when CI is added.
- Juicer's own license is deferred to Track B Phase 5; this ADR does not constrain that choice.
- GPUI is Apache-2.0 (see [`0002-rust-gpui-for-juicer`](./0002-rust-gpui-for-juicer.md)) — compatible.
- When a tempting dependency has the wrong license, the answer is "find an alternative or write the function," not "make an exception."
