# ADR 0026 — Plan authoring is conversation-led; the document is the maintained artifact

**Status:** Proposed
**Deciders:** Tripp
**Date:** 2026-05-31
**Related:** [`0005-plan-as-document`](./0005-plan-as-document.md), [`0025-unified-agent-interface-agent-owned-context`](./0025-unified-agent-interface-agent-owned-context.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`0022-skill-cli-as-agent-contract`](./0022-skill-cli-as-agent-contract.md), [`0008-critics-are-agents`](./0008-critics-are-agents.md), [`../ROADMAP.md`](../ROADMAP.md)

## Context

[ADR-0005](./0005-plan-as-document.md) decided the plan is a **document, not a chat log** — a structured, legible, auditable artifact rather than a scroll of conversation. That decision stands.

What ADR-0005 did *not* settle is **how the document gets authored**. The Phase A1 plan-workspace ticket (COO-78) was scoped *before* [ADR-0025](./0025-unified-agent-interface-agent-owned-context.md) and implicitly assumed a **document-led** surface: a structured-section editor you fill in, with the planning agent relegated to a sidebar helper. The audit of the merged code (post-#55) confirms the current Workbench spec view is read-only markdown and the planner chat only *reads* the spec for context — it never writes it, and there is no plan-edit CLI verb.

Two things changed that make document-led the wrong default:

1. **ADR-0025 made the agent own the conversation.** Plan-chat now resumes a native agent session with real continuity, and the conversation is a first-class, auto-saved, archivable entity that *promotes* into a spec (at which point its transcript is snapshotted). The conversation is no longer a disposable sidebar — it is where the thinking happens.
2. **Idea→spec is genuinely a conversation, not form-filling.** Turning a rough idea into a complete spec is human-paced, exploratory, back-and-forth work. Forcing it through a structured form fights the grain; doing it through an agent conversation that *converges* on the spec matches how the work actually happens — and is the differentiated upstream surface (an iterative converging dialogue, versus a one-shot "draft a doc from this prompt").

The constraint that must survive: the **legibility** that justified ADR-0005. A chat scroll cannot answer "what are my open questions / what's the acceptance criteria" at a glance. If conversation-led means losing the structured artifact, it recreates the exact plan-as-chat problem ADR-0005 killed.

## Options

### A — Document-led (the pre-0025 COO-78 framing)

Structured-section editor is the primary surface; the planning agent is a sidebar helper that suggests text.

**Pros:**
- Maximally legible — the artifact is always front-and-center.
- Simple mental model: you edit a document.

**Cons:**
- Fights how idea→spec actually happens (exploratory, conversational).
- Wastes the native-session planning agent ADR-0025 just built — relegates it to autocomplete.
- Undifferentiated: a structured editor is a commodity; the converging conversation is not.

### B — Conversation-led; document is the maintained artifact (chosen)

The agent conversation is the primary surface. The agent maintains the structured spec document as the conversation converges — writing goals/constraints/non-goals/risks/open-questions/acceptance-criteria through a `forge` CLI verb ([ADR-0022](./0022-skill-cli-as-agent-contract.md)). A document pane reflects the current spec live; the agent's edits surface as **reviewable accept/reject diffs**, never silent rewrites. Direct human editing of the document remains available but secondary.

**Pros:**
- Matches how the work happens; uses the ADR-0025 planning agent as intended.
- Keeps ADR-0005 legibility — the structured document is always current and glanceable.
- Differentiated upstream surface (converging dialogue + the multi-critic loop are the two halves of the moat).
- Natural home for the ADR-0025 conversation lifecycle: a saved conversation that promotes to a spec.

**Cons:**
- More moving parts than a plain editor (live document sync, diff-review UX).
- Legibility depends on the document pane never lagging the conversation.

### C — Chat-only (no structured document)

Idea→spec lives entirely in the chat; no maintained document artifact.

**Pros:**
- Simplest to build.

**Cons:**
- **Reintroduces the exact problem ADR-0005 rejected** — no glanceable structure, no auditable artifact, open questions buried in scroll. Rejected outright.

## Decision

**Plan authoring is conversation-led, and the structured markdown spec document remains the artifact ([ADR-0005](./0005-plan-as-document.md) holds).** The plan workspace is, primarily, the agent conversation; the agent maintains the structured document as the conversation converges, writing section edits through a `forge` CLI verb ([ADR-0022](./0022-skill-cli-as-agent-contract.md)). A live document pane reflects the spec; the agent's edits appear as accept/reject diffs, not silent rewrites; direct human editing stays available but secondary.

The **plan workspace is the one deliberately-watched surface.** Idea→spec is human-in-the-loop on purpose; everything downstream (execution, review) stays headless per [ADR-0019](./0019-sessions-are-jobs.md). This is the explicit exception to "don't watch," not a contradiction of it.

**Rationale:** Option B is the only one that both uses the native-session planning agent ADR-0025 built *and* preserves ADR-0005 legibility. It also makes the conversation lifecycle (auto-save / archive / snapshot-at-promotion) land somewhere concrete, and it is the differentiated upstream surface versus a commodity editor or a one-shot doc draft.

**Risks to monitor:**
- **Legibility regression** — if the document pane lags the conversation, the artifact stops being trustworthy at a glance. The document, not the transcript, is the spec.
- **Silent-rewrite distrust** — if the agent can rewrite the spec body invisibly, trust in the artifact collapses. Mitigated by the accept/reject diff being non-optional.
- **Watched-surface creep** — planning is watched *by design*; execution must not inherit that. If "watching" leaks downstream, the job-not-show thesis erodes.

## Consequences

- The spec **document** stays the source of truth for the plan; the **conversation transcript** is the native agent JSONL (per ADR-0025), snapshotted into Forge storage at spec promotion. Two different artifacts with two different owners — not the same thing.
- COO-78 is reframed from "document-shaped editor" to "conversation-led workspace with a live document pane." See *Implications* below.
- A `forge` plan-edit verb is required so the agent writes structured-section edits through the CLI contract (ADR-0022) rather than streaming structured output. `plan_versions` must be written on *agent* edits, not only by the improve loop (today `recordPlanVersionAdded()` is improve-only).
- The ADR-0025 conversation lifecycle (auto-save conversations, archive = delete pointer, full transcript copy at spec promotion) is realized in this surface.
- Pairs with the multi-critic synthesis surface (COO-79 / [ADR-0016](./0016-multi-critic-synthesis.md)): the conversation produces the spec, the critics pressure-test it, the lock gate ships it.

## Implications for current work

This ADR rewrites the intent of **COO-78** (Phase A1 plan workspace):

- Primary surface is the agent conversation, not a form.
- The agent maintains structured sections (goals, constraints, non-goals, approach, risks, open questions, acceptance criteria) in the spec document as the conversation converges; an open-questions counter is driven by what the agent has left unresolved.
- Agent spec edits surface as accept/reject diffs in a live document pane; direct human editing remains, secondary.
- Markdown + frontmatter remains the on-disk shape (ADR-0005); edits go through a `forge` CLI verb (ADR-0022); the Workbench re-renders via SSE off the storage layer; `plan_versions` saved on every persisted edit (per SCHEMA.md, already shipped by COO-84).
- Wire the ADR-0025 conversation lifecycle here: the workspace is where a saved conversation promotes to a spec and the transcript snapshot fires.

It does **not** change the execution, review, or ship phases (A2), which stay headless.

## Non-goals locked by this ADR

- **The chat does not become the artifact.** ADR-0005 stands — the spec is a structured document; the conversation is the authoring modality, not the deliverable.
- **Execution does not become watched.** Only the plan workspace is the watched surface; jobs stay headless (ADR-0019).
- **Direct document editing is not removed** — it remains available, just no longer the primary path.
- **No streaming of structured output from the agent** — edits go through the CLI verb, not a structured-output channel (ADR-0022).
