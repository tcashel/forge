# ADR 0036 — The agent is the operator: one id, one lifecycle, one next

**Status:** Proposed
**Deciders:** Tripp
**Date:** 2026-09-02
**Related:** [`0032-forged-provider-neutral-rust-orchestrator`](./0032-forged-provider-neutral-rust-orchestrator.md), [`0033-execution-package-ownership-boundary`](./0033-execution-package-ownership-boundary.md), [`0034-ledger-native-work-store`](./0034-ledger-native-work-store.md), [`0035-operational-policy-revisions-at-durable-stage-boundaries`](./0035-operational-policy-revisions-at-durable-stage-boundaries.md)

## Context

v0.7.0 finished the Ore Loop: one scheduler, a retry primitive, policy
revisions, submit-time preflight, typed decision verbs, a kind-blind
`explain`, structured remedies on refusals, and a generated operation
manifest. The substrate below the agent is now right. The layer the
agent actually touches is not, and the evidence is the system's own
dogfood on its own repository:

- The customer of every surface is a fresh-context language model.
  Tripp set the bar on 2026-08-29: "make the interface as
  agent-ergonomic, agent-intuitive, and agent-accretive as you can
  possibly manage — your future self will thank you, since YOU will be
  the one using it." The acceptance test is that a cold agent can
  drive an epic end-to-end from operation responses alone.
- `forged operations overview` answers with 853 KB; `work detail` with
  94 KB; `overview --run` with 105 KB (measured 2026-09-02 on the
  operator store). None fits one tool result. The attention rail
  carries 62 items of which 47 are `blocked` symptoms on
  dependency-blocked planning stubs, each advertising `work reopen` —
  an executable action that would be wrong to take.
- `nextActions` are honesty-tested (the verb runs) but not
  relevance-tested. A landed, closed work item advertises
  `work reopen`; a landed run advertises `work supersede`; `explain`
  reports a closed epic as `not-started`. The surface answers "what can
  I do" when the driver asks "what should I do".
- The planning lifecycle (plan → critique → adjudicate → ready →
  dispatch → review → land) exists only as prose in eight skills.
  Every skill re-derives lifecycle position from text heuristics
  ("checkbox-free critique prose is not evidence of adjudication"); the
  kernel cannot enforce the order; the execution-approval note is
  schema-validated on write and never consulted by `run start`. The
  critique-before-dispatch rule was violated twice in one epic and cost
  two killed runs.
- The skills are bash choreography: the same 20-line ready-frontier
  pagination loop appears verbatim in four SKILL.md files. The lead
  sessions that built ore-062, ore-063, and ore-070 bypassed the
  skills and wrote Python scripts against the CLI; the typed
  recommendation-note surface built in ore-063 holds zero notes for
  any ore-070 child. A surface that its own author's agent routes
  around is not ergonomic.
- The protocol does not finish. Every forged-lane run in the last
  three epics stopped `reviewBudgetExhausted`; the lead pushed the
  last fixes by hand and recorded the landing through
  `run adjudicate-settlement`. Seven of nine ore-070 slices were
  driven in the "direct lane" (a codex process in a scratch worktree,
  the lead doing gates and PRs) because that lane is parallel and has
  no last-mile gap. The system's own driver preferred not to use it.
- Seats are mute. A seat can report progress only by finishing, and
  can ask a question only by settling `specAmendment`, which costs a
  whole retry. A missing result block kills and restarts the attempt.
- The lead-facing vocabulary is wide: a queue entry carries seven
  state-bearing fields (`kind`, `execution.state`, `executionHealth`,
  `claimHealth`, `desired`, `admission`, `blocker`); frozen `bead*`
  wire keys sit beside `work` verbs; 53 of 65 MCP tools take a raw
  operation envelope; `work detail` demands a subject kind that
  `explain` derives; slice dispatch is a two-verb dance whose approval
  step is unfenced ceremony.

None of these is a crash-safety defect. All of them are legibility
defects, and legibility is what decides whether the agent — the
operator of record from here on — can run the factory unattended.

## Decision

Forge adopts three organizing rules for every surface a lead agent,
seat agent, or narrating model touches. They are additive on the
ledger, subtractive on the surface, and they settle the design questions
the skills currently answer in prose.

### One id

The work-item id is the sole handle. Executions are `<id>` and
`<id>-rN`; attempts are `<id>/<seat>/<n>`. Every read takes `--id` and
resolves the kind itself; a subject kind is an optional disambiguator on
exact collision, never a required argument. Every projection carries the
same `subject` block (`id`, `kind`, `title`, `repository`, `revision`).
Frozen `bead*` wire keys remain byte-stable but are shadowed by
`workId`/`work` twins, marked deprecated in the generated manifest, and
scheduled for removal at 1.0.

### One lifecycle

The planning and execution lifecycle becomes a typed, derived
`lifecycle` field on every work item, computed from evidence the ledger
already stores or gains here: `drafted`, `critiqued`, `adjudicated`,
`ready`, `dispatched`, `deciding`, `reviewed`, `landed`, `closed`, with
`blocked` and `parked` as held states. Stage moves are typed records
bound to the spec revision (`recommendation`, `adjudication`,
`decision`), never prose in `notes`. A spec revision without a fresh
adjudication drops the item back to `drafted`, which makes "a moved
revision needs fresh approval" structural. The kernel enforces the
order: dispatch refuses an un-adjudicated item with the remedy that
names the missing stage; an explicit override is itself a recorded
decision. [`LIFECYCLE.md`](../LIFECYCLE.md) is the normative statement.

### One next

Every projection and every refusal carries `next`: an ordered list of
`{verb, args, reason, class}` where `class` is `should`, `can`, or
`repair`, with at most one `should`. Terminal subjects advertise no
`should`. A single bounded driver surface, `forged next`, renders the
decisions waiting on the caller, the running work with its stage and
age, the ready frontier with each item's lifecycle stage, and recent
landings — capped to fit one tool result, symptoms hidden unless asked.
A `wait` verb blocks on the event cursor until a subject changes or a
timeout elapses, so a driver makes one call per state change instead of
a polling loop. [`DRIVING.md`](../DRIVING.md) is the runbook.

### Consequential corollaries

- **Finish is a decision, not a stop.** Review-budget exhaustion settles
  into a `lead-adjudication` decision carrying the residual findings
  and its verbs (accept risk, grant one more round, amend and retry,
  cancel). A profile-level finish policy lands clean-enough results
  without a human keystroke. Gate failures that are environmental are
  acceptable through the same typed door.
- **Seats speak.** `packet update` publishes attempt-fenced progress;
  `packet ask` raises a typed question that parks the packet, not the
  run, and resumes with the answer as a field note. A missing result
  block is reprompted once in-session before the attempt is killed.
- **Parallel where isolated.** Admission grants N implementation slots
  per repository (default above one) behind one merge lock; worktrees
  isolate attempts and the DAG serializes true dependencies. Merge
  conflicts become a typed decision.
- **Fewer words, fewer tools, less envelope.** The manifest gains an
  `audience` column; `forged mcp` serves the lead audience by default
  (about a third of today's tool list) and typed, envelope-free read
  tools. Lead-facing projections fold the internal state fields into
  `health` and `lifecycle`; the surviving noun set is enumerated in
  [`SYSTEM.md`](../SYSTEM.md). `run dispatch` is one fenced verb (mint,
  authorize, approval record), and `run start`/`run submit` move to the
  machine audience.
- **Accretion is on the record.** Decisions, overrides, retries-with-
  reason, risk acceptances, and epic retros are typed notes on the
  work item. A complexity class on the item and a roster policy keyed
  by class give telemetry its denominator; `next` shows the cost of
  each verb from that telemetry.
- **Skills are thin.** A skill states position, the three to six verbs,
  and the judgment the lead owns. Loops, pagination, validation, and
  approval choreography move into the CLI, which refuses loudly instead
  of asking the agent to page.

## Consequences

- ADR-0033's ownership table is unchanged. The plugin still owns
  conversation and judgment; Forged still owns execution truth. What
  moves is *mechanism*: the lifecycle order and the approval fence stop
  living in prose and live in the ledger.
- The Ore Loop's one-question test still governs: this decision adds
  one derived field, two note kinds, three verbs (`next`, `wait`,
  `dispatch`), and a seat channel; it deletes the approval choreography,
  four copies of the frontier loop, the subject-kind requirement,
  raw envelopes on reads, most of the lead's tool list, seven state
  fields from lead-facing projections, `reviewBudgetExhausted` as a
  terminal, and the reason the direct lane exists.
- Docs become a tower rather than a chronology: `SYSTEM.md` (the map),
  `LIFECYCLE.md` (the one lifecycle), `DRIVING.md` (the runbook), the
  generated reference, and ADRs. `NEXT.md` keeps the operational guide
  and roadmap.
- Delivery is sequenced in [`docs/plans/ore-080-driver-surface.md`](../plans/ore-080-driver-surface.md)
  (legibility, lifecycle, finish, seats) and
  [`docs/plans/ore-081-factory-loop.md`](../plans/ore-081-factory-loop.md)
  (class, roster policy, telemetry, narrative). Both go through the
  lifecycle they describe: plan, critique, adjudicate, then dispatch.
- Acceptance for the whole decision is behavioral: a fresh-context
  agent given only `forged next` and the responses it leads to drives
  one epic from `drafted` children to one draft PR, with the operator
  touching only decisions, and the forged lane is chosen over the
  direct lane on Forge's own repository for the following epic.

## Non-goals locked by this ADR

- No change to the effect fence, the reclaim saga, packet claim tokens,
  operation identity, canonical JSON, or the no-await-in-transaction
  rule. Every invariant in `CLAUDE.md` stands.
- No workflow DSL. Protocols remain the closed set (`slice`,
  `epic-plan`, `epic-assurance`); a finish policy is a profile field,
  not a script.
- No external tracker synchronization and no repository imposition.
  Lifecycle records are ledger notes, never files in the target repo.
- No new state store. `next`, `lifecycle`, and `health` are projections
  over facts the ledger already holds plus the typed notes named here.
