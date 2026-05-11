# ADR 0013 — Position as "operator's cockpit," not "next-gen IDE"

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0018-non-ide-positioning`](./0018-non-ide-positioning.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`../VISION.md`](../VISION.md)

## Context

The market frames coding-agent tools as IDE-shaped (Cursor, Zed, Windsurf, etc.). The natural marketing temptation is to fit Juicer into that frame. But Juicer isn't an IDE — editing happens in the agents' chosen IDE/terminal; Juicer doesn't render source files. Marketing it as an IDE invites the wrong comparisons and the wrong feature requests.

The right frame is *operator's cockpit*: a control surface for a person running a fleet of agents.

## Decision

Position Juicer publicly as **"the operator's cockpit for staff engineers running agent fleets."** All marketing anchors on **operator / fleet / cockpit**. Comparisons are to ops/control-plane tools, not to IDEs.

## Consequences

- Hero copy, screenshots, demo flows all emphasize *fleet status*, *plan / run / review / ship*, *risk-routed review* — not editing.
- Comparisons in marketing are to mission-control tools, not to Cursor or Zed.
- Sets the foundation for [`0018-non-ide-positioning`](./0018-non-ide-positioning.md), which forbids IDE features (LSP, IntelliSense, syntax tooling) in the codebase itself.
- Sets the foundation for [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), which encodes the cockpit metaphor structurally (status, not stream).
- "Operator" framing implies sophistication; it's compatible with the paid pricing model (see [`0015-no-free-tier`](./0015-no-free-tier.md)).
