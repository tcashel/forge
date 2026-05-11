# ADR 0005 — Plan-as-document, not plan-as-chat

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0014-differentiation-before-execution`](./0014-differentiation-before-execution.md), [`0016-multi-critic-synthesis`](./0016-multi-critic-synthesis.md), [`../VISION.md`](../VISION.md)

## Context

Every shipping competitor treats the unit of work as a chat thread. The user types intent; the agent replies; the conversation is the artifact. This is a poor representation of *a plan* — chat is ephemeral, hard to review at a glance, and hard for a human to lock down and ship as the source of truth for execution.

Juicer's central thesis is that the plan, not the conversation, is the artifact. The plan workspace is the first of the five differentiated surfaces, and it needs to *look* and *behave* like a document.

## Options

### A — Plan-as-document

**Pros:**
- A plan is reviewable at a glance.
- Inline edits, sidebar discussion: clear separation between content and conversation about it.
- Locks down naturally — the plan has a final state that becomes the spec for execution.

**Cons:**
- Harder UX to build than chat.
- Drafting agent has to suggest edits to a document, not just generate replies.

### B — Plan-as-chat (status quo)

**Pros:**
- Easier to build; matches every competitor.

**Cons:**
- The plan is buried in transcript scrollback. There's no canonical artifact to lock down.
- Re-reading and revising are clumsy.

## Decision

The plan workspace is a **structured document**. A drafting agent suggests inline edits to the document and engages in sidebar conversation *about* the document. The document, not the conversation, is the artifact that gets locked and shipped to execution.

## Consequences

- The plan workspace is the centerpiece of Juicer in both tracks. Phase A1 builds it in TypeScript; Phase B1 ports it to Rust + GPUI.
- Plan document representation (markdown vs. AST) is deferred to early Phase A1 (see `DECISIONS.md` pending list).
- Editing surface, version history, and lock semantics become first-class engineering concerns, not chat-UI afterthoughts.
- Multi-critic synthesis (see [`0016-multi-critic-synthesis`](./0016-multi-critic-synthesis.md)) operates on the locked plan document, not on a conversation transcript.
