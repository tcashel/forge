# The one lifecycle

Every work item moves through one lifecycle, from an idea to a landed
change. This document is the normative statement of that lifecycle: the
stages, the evidence that proves each stage, the verb that records the
move, and what the driver surface says at each point. It is decided in
[ADR-0036](adr/0036-agent-is-the-operator-one-id-one-lifecycle-one-next.md).
The lifecycle is projected by the kernel from the ledger facts below;
skills no longer need to reconstruct it from prose.

## Why the lifecycle lives in the ledger

Until ADR-0036 the lifecycle lived in eight `SKILL.md` files as
"Position:" and "Next:" lines plus heuristics for inferring position
from note text. Three consequences followed, all observed on Forge's
own epics: the kernel could not enforce the order (dispatch before
critique happened twice and cost two killed runs); every skill carried
a copy of the inference; and agents bypassed the skills with scripts
because the choreography was heavier than the judgment it wrapped. A
lifecycle the kernel can see is a lifecycle it can enforce, project,
and explain — and one the skills no longer need to describe.

## Stages

Stages are **derived**, never set directly. Each is proven by typed
evidence bound to the spec revision it applies to. A newer spec revision
without matching evidence drops the item back to `drafted`.

| Stage | Meaning | Evidence (bound to current revision) | Moved by |
| --- | --- | --- | --- |
| `drafted` | A complete spec exists; nobody independent has read it. | revision N exists; no `recommendation` note at N | `work create`, `work update` |
| `critiqued` | An independent critic has produced findings. | a `recommendation` note (`forged.spec-recommendations/1`) captured at N | `/forged:critique` → `work note add --kind recommendation` |
| `adjudicated` | Every recommendation, crux, and question has a disposition; the spec reflects the accepted ones. | the newest `adjudication` note has `resultingRevision: N`, names its recommendation note, covers every recommendation and crux in that note, and `notes` has no unchecked `- [ ]` | `/forged:adjudicate` → `work adjudicate` |
| `ready` | Adjudicated, `open`, unassigned, unleased, every `blocks` target closed. | the frontier query | dependency closure |
| `dispatched` | A nonterminal run exists for this item. | run row in a nonterminal state | `run dispatch` (**ADR-0036**) / `run start` + `run submit` |
| `deciding` | A run is parked on a decision only the lead or human can make. | an open decision-class attention item on the current run | the protocol (spec amendment, seat question, lead adjudication, merge conflict, gate failure, restart budget, input required) |
| `reviewed` | The protocol reached a draft PR and a terminal verdict; awaiting landing. | `run.protocol-terminal` with `delivery.pr` | the protocol |
| `landed` | The change is merged where the run's base says it should be. | `delivery {pr, sha}` recorded | `run stop --outcome landed`, the ore pass (epic children), `run adjudicate-settlement` |
| `closed` | Done, superseded, or abandoned with a recorded reason. | status `closed` + close reason | `work close`, `work supersede`, landing |

Held states, orthogonal to the sequence:

| State | Meaning | Evidence | In / out |
| --- | --- | --- | --- |
| `blocked` | A planning stub with assumptions, or an unresolved `- [ ]` question. Never on the frontier. | status `blocked`, or an unchecked checkbox in `notes` | `work create --status blocked` / `work promote`, `work adjudicate` |
| `parked` | Deliberately shelved; hidden from frontier, rails, and `next`; keeps its spec and history. | status `deferred` + a `decision` note with reason | `work park` / `work reopen --reason` |

An epic's stage derives from its children and its own run: `drafted`
until its wave-one children are `adjudicated`; `dispatched` while the
ore pass owns its desired row; `deciding` when any child or the epic
itself holds a decision; `reviewed` at the final draft PR; `landed`
when the human merges it (recorded by `run stop --outcome landed` on
the epic).

### The seat contract

Inside a stage, the seat owns its edits, its commits, and the seat checks
named by the packet contract (`seatCommands`); the controller owns the gate
(`gateCommands`), which it runs after the seat returns and again after each
fix round, serialized per daemon. An attempt that outlives its stage budget
is killed as a `deadline:` failure and relaunched at once within
`deadlineRetryBudget`, with a field note about the work already committed;
exhaustion is the `deadlineExhausted` terminal, distinct from provider
unavailability.

## Decisions

`deciding` is one stage with typed sub-kinds. Each sub-kind is an
attention item of classification `decision`, owner `lead-agent` or
`human`, carrying its verbs. The table is the single place the verbs
are enumerated; `next` renders it.

| Decision | Raised by | `should` | `can` |
| --- | --- | --- | --- |
| spec amendment | a seat returned `specAmendment` | `work update` (amend) then `run retry --because spec-amended` | `run stop --outcome cancelled` |
| seat question (**ADR-0036**) | `packet ask` | `decide --answer` (resumes the packet) | `run stop --outcome cancelled` |
| lead adjudication (**ADR-0036**) | review budget exhausted with residual findings | `run remediate --grant 1` when findings are mechanical; `run accept-risk` when residual is acceptable | `work update` + `run retry`; `run stop --outcome cancelled` |
| gate failure | gate failed after remediation | `run remediate --grant 1` | `run accept-risk --gate` (environmental), `run revise-policy` (wrong command) |
| merge conflict (**ADR-0036**) | the ore pass could not merge a landed child | `run retry --because rebase` | `work update` (re-cut) |
| restart budget exhausted | controller deaths | `run retry --because world-changed` | `run stop --outcome cancelled` |
| input required (epic) | no ready children, stale assumption, missing authority | `epic resolve --child` after adjudicating the child | `epic abandon` |
| merge approval | final draft PR exists | human merges on GitHub, then `run stop --outcome landed --pr --sha` | `run stop --outcome cancelled` |

Every resolution is a typed `decision` note on the work item (`forged.
decision/1`: `{kind, choice, rationale, actor, at, costUsdAtDecision}`).
That is what makes the lifecycle accretive: the next agent reads why,
not only what.

## Enforcement

- `run dispatch` (**ADR-0036**) refuses an item below `adjudicated`
  with `remedy.verb` naming the missing stage (`work note add --kind
  recommendation` or `work adjudicate`). `--override "<reason>"` is
  accepted and recorded as a `decision` of kind `lifecycle-override`.
  Today `run start` checks readiness only.
- `work adjudicate` compares `expectedRevision` with the current revision in
  the same transaction. If any spec field changes it mints N+1 and requires
  the adjudication body's `resultingRevision` to be N+1; if no field changes,
  it keeps N and requires `resultingRevision: N`. The revision pointer,
  adjudication note, and status transition commit together. A later `work
  update`, `work revert`, or spec-changing `work promote` therefore resets
  the derived stage to `drafted`; the older adjudication remains immutable.
- `work promote` remains the stub-only promotion alias for one release.
  There is no
  "approval" note kind after ADR-0036: `run dispatch --approved-by
  <actor> --basis "<text>"` records approval as part of the fenced
  dispatch, so approval cannot drift from the revision it approved.
- Coordination churn (claims, heartbeats, leases, retries, settlements)
  never changes stage evidence and never mints a revision.
- A `critiqued` item with an empty recommendation list still requires
  an `adjudication` note (which may be empty of dispositions); the
  stage exists so that "nobody looked" and "somebody looked and found
  nothing" are different facts.

## Trivial work

A `trivial` complexity class (see
[`plans/ore-081-factory-loop.md`](plans/ore-081-factory-loop.md)) may
carry a policy `critique: optional`. Dispatching a `drafted` trivial
item then records an automatic `lifecycle-override` decision rather
than refusing. The order is a default, not a wall; the record is what
is non-negotiable.

## What the skills say at each stage

After ADR-0036 each skill's "Position/Next" pair is a query, not prose:
`explain --id` and `next` state the stage and the `should` verb. The
skills keep only the judgment the lead owns — what to research, how to
cut, how to weigh a crux — and the three to six verbs that record it.
