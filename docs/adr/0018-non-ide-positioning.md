# ADR 0018 — Avoid IDE positioning

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`0013-operators-cockpit-positioning`](./0013-operators-cockpit-positioning.md), [`../VISION.md`](../VISION.md)

## Context

[`0013-operators-cockpit-positioning`](./0013-operators-cockpit-positioning.md) chose the cockpit framing for marketing. This ADR extends the same logic to the codebase: positioning is enforced by what we build (and what we don't build), not only by what we say.

The drift mode being guarded against: under user pressure to "just add an editor view" or "show inline diagnostics," it would be easy to drift into IDE territory. Editing surface (LSP, IntelliSense, linting, debugging) is commodity work owned by Cursor / Zed / VS Code — re-implementing it badly is the most predictable scope expansion trap.

## Decision

Juicer is **an operator's environment, not an IDE.** Editing happens in agents' chosen IDE or terminal. Juicer does not embed an editor surface.

## Consequences

- Marketing never says "code editor" or "next-gen IDE."
- We do **not** build:
  - LSP integration
  - IntelliSense / autocomplete
  - Linting / diagnostics UI
  - Debugger surfaces
  - Source-file editing of any kind
- The View Layer surfaces *job state* (status, phase, ETA, critic outputs, diffs as review artifacts) — not *editing state*.
- When users say "I wish I could just edit this file here," the answer is "open it in your editor; Juicer is the operator's cockpit." This is also a positive product fact: Juicer doesn't fight with their editor.

## Non-goals locked by this ADR

- **No code-editor features in this codebase, ever.** IDE-shaped products belong elsewhere.
- **No syntax-aware tooling** (formatting, navigation, refactoring beyond what's needed to render diffs in the review queue).
- This non-goal is the operational counterpart to [`0013-operators-cockpit-positioning`](./0013-operators-cockpit-positioning.md)'s marketing stance.
