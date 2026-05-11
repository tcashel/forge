# ADR NNNN — Descriptive title

**Status:** Proposed | Decided — <short phrase> | Accepted | Accepted (clarified by [`NNNN-title`](./NNNN-title.md)) | Superseded by [`NNNN-title`](./NNNN-title.md)
**Deciders:** Tripp
**Date:** YYYY-MM-DD
**Related:** [`NNNN-title`](./NNNN-title.md), [`../VISION.md`](../VISION.md)  ← delete line if none

## Context

Why this decision came up. The forces at play, the constraints, what we already know. Keep this section honest about what isn't yet known.

## Options

Use this heading when two or more options were genuinely weighed. Skip the section if the decision had no real alternatives worth recording.

### A — Option name

**Pros:**
- …

**Cons:**
- …

### B — Option name

**Pros:**
- …

**Cons:**
- …

## Decision

What was chosen, stated plainly in one or two sentences.

**Rationale:** Optional call-out explaining why this option over the others. Use when the choice wasn't self-evident from the options table.

**Risks to monitor:** Optional call-out listing the failure modes that would force a revisit.

## Consequences

What follows from this decision — operational, architectural, organizational. Both good and bad.

## Implications for current work

Optional section. Use when this ADR directly constrains an in-flight phase or piece of work.

## Non-goals locked by this ADR

Optional section. Use for boundary-setting ADRs where the explicit "what this is not" matters as much as the "what this is."

---

## How to create a new ADR

1. Copy this file to `NNNN-kebab-title.md` with the next free number.
2. Fill in the heading and front-matter; remove unused optional sections.
3. Add a row to the index in [`README.md`](./README.md).
4. Open as `Proposed` while in discussion; flip to `Accepted` (or `Decided — X`) when the call is final.
5. **Never edit accepted ADRs in place.** If the decision needs to change, write a new ADR and set the old one's status to `Superseded by NNNN-...`.
