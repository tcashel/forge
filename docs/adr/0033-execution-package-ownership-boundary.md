# ADR 0033 — Execution packages separate planning, orchestration, and provider cognition

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-08-12
**Related:** [`0032-forged-provider-neutral-rust-orchestrator`](./0032-forged-provider-neutral-rust-orchestrator.md), [`0026-conversation-led-plan-authoring`](./0026-conversation-led-plan-authoring.md)

## Context

The Anvil experiment proved that a lead-agent conversation can turn an idea
into reviewable long-horizon work, and that multi-agent review is valuable for
some cuts. It also proved that treating a fixed five-seat panel as the unit of
all work is too expensive: deterministic routing and routine slices repeatedly
paid for cognition they did not need. More importantly, Anvil's TypeScript
workflows bind that execution path to one provider harness. A provider outage
therefore prevents another harness from continuing an otherwise durable job.

ADR-0032 chose the Rust `forged` daemon as the durable provider-neutral
orchestrator. It did not yet define the handoff from a user's lead-agent
session, the exact ownership of workflow semantics, or how a run keeps its
provider assignments stable while operator config evolves.

## Decision

A user works through one lead-agent session. Smithy's planning skills help that
agent maintain and lock the plan; after the user accepts the direction, Smithy
hands a versioned execution package to `forged`. The package contains semantic
roles and seats, an assurance profile, an ordered provider/model roster, and
the resolved execution policy: gates, stage and retry budgets, and process-host
selection.
`forged` validates, canonicalizes, hashes, and stores the resolved package
before execution begins. Provider adapters perform cognition but do not own
workflow state.

Ownership is exclusive at each boundary:

- **Beads** owns work items, dependencies, readiness, and leases.
- **forged** owns execution-package semantics, protocol stages and joins,
  attempts, artifacts, provider assignment, roster revisions, and outcomes.
- **Herdr** owns panes, processes, and process/message transport. It is a
  supervision surface, not the execution ledger.
- **Git and GitHub** own code, commits, branches, review publication, and PR
  truth.
- **Smithy** owns lead-agent planning skills and becomes a thin typed client of
  `forged` after plan lock.
- **Provider adapters** execute cognitive contracts. Provider-specific model,
  effort, sandbox, and invocation details do not enter protocol topology.

Profiles are named policy (`lean`, `standard`, `high`) rather than hard-coded
panels. Rosters are operator-authored YAML and may be changed cheaply when a
provider or model becomes unavailable. A run never silently follows such a
change: its resolved package and roster revision are immutable ledger facts.
Any later reassignment is an explicit append-only revision at a durable stage
boundary. An epic freezes the package used to create children. Its roster
revision atomically updates every current unmerged child and becomes the
template for future children; no child re-resolves an authoring-config name.

## Consequences

- The default does not imply that every commit or bead receives the largest
  review panel. A profile selects the topology appropriate to the work, and
  later policy may escalate it on named evidence such as a gate failure or
  conflicting reviews.
- Claude, Codex, or another harness can drive the same `forged` API. Losing one
  provider requires a roster edit for future runs or an explicit revision at a
  safe boundary, not a workflow rewrite.
- Host agents and the view-only MCP App are monitoring/control adapters over
  the same ledger. Neither becomes canonical run state.
- `slice/v1` retains legacy storage-lane compatibility, while semantic seats,
  profiles, escalation edges, and candidate selection are frozen in the
  execution package and projected independently of provider family.
- Smithy Anvil 0.3 removed its dispatch/epic/critique Workflow scripts and
  scheduled watch after detached handoff, epic control, Herdr supervision, and
  the unified overview were represented through typed `forged` contracts.

## Non-goals locked by this ADR

- `forged` does not write plans or perform cognitive work itself.
- Herdr does not decide readiness, topology, or run outcomes.
- YAML is an authoring format, not durable runtime truth and not an executable
  workflow language.
- In-flight provider changes do not mutate a live attempt or cross a
  non-durable boundary.
