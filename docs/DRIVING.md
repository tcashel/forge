# Driving Forge — the agent's runbook

You are a lead agent with the forged plugin loaded, in a target
repository, and the operator has handed you an outcome. This is how to
drive from operation responses alone. It is written for a reader with
no memory of the last session. Where the target verb from
[ADR-0036](adr/0036-agent-is-the-operator-one-id-one-lifecycle-one-next.md)
is not yet on `main`, the **Today** line gives the closest shipped
substitute.

## The loop

```text
orient   →  decide   →  act        →  wait
next        explain     one verb      wait --id
```

One call per step. Never poll in a loop; never widen a read to "see
everything"; never act on a title, pane, or process — only on an exact
id from a response you just read.

## Orient

```sh
forged            # bare: next for the current repository, text form
forged next --repo "$(git rev-parse --show-toplevel)"
forged next --json | jq …
forged next --text                       # deterministic text, even when piped
forged next --follow                     # terminal only; refreshes every 5s
```

Every lead-audience read renders a fixed text form when stdout is a
terminal and the JSON envelope when piped or asked with `--json`. The
text is the same result, never a second classification; a human
glancing at a terminal and a model reading Bash output see the identical
layout. Ids sit left, the one `should` verb sits right, spend is on
every running and deciding row, nothing exceeds 80 columns.

Sections, in fixed order, capped to one tool result:

1. **decisions** — what is waiting on you or the human, each with its
   `should` verb and pre-bound args, spend so far, and the estimated
   spend so far;
2. **running** — id, stage, seat, minutes in stage, total age, spend;
3. **ready** — the frontier with each item's lifecycle stage
   (`drafted`, `critiqued`, `held`), with the stored evidence for that
   classification and adjudication reported as unknown until ore-080.8;
4. **landed** — recent deliveries with PR numbers;
5. **hidden** — counts of symptoms and parked items not shown.

Use `--symptoms` only when diagnosing hidden operational trouble. Use
`--section <name> --limit <n>` to widen exactly one section; widening
`decisions` also includes its full `next` alternatives. The ordinary read
keeps only `should` plus `canCount` and remains capped at 30 rows.

The same terminal rule applies to `explain`, `run status`, `epic status`,
`usage`, `work history`, and `work show`. `work show` omits specification
bodies in text unless `--full` is explicit. Service and MCP responses remain
JSON-only.

## Decide

```sh
forged explain --id <id>
```

`explain` resolves any id (work item, run, attempt, attention) and
answers what it is, its lifecycle stage, one health verdict with its
inputs, and `next`. Read `next[0]` when its class is `should`. If there
is no `should`, nothing is required of you: the subject is terminal or
idle. `can` actions are optional; `repair` actions fix a state the
ledger cannot leave on its own. When a run's own outcome and an open
decision both name a `should`, the outcome wins and the decision's
action is listed as `can`.

Make routine engineering judgments yourself. Ask the operator only when
a decision changes product scope, external authority, or accepts risk
— and ask with the exact tuple the decision needs (id, revision, the
options, the consequence, the cost).

**Today:** `explain` reads `landed`, `closed`, and `parked` from the
ledger, and a closed item lists `work reopen` only as `repair`. Treat
`status: closed` and `outcome: landed` as terminal regardless of
`next`.

## Act — the planning verbs

| Stage you are at | What you do | Verb that records it |
| --- | --- | --- |
| idea → `drafted` | research read-only, draft the four fields, one slice or an epic with honest stubs | `work create`, `work update --expected-revision`, `work link` |
| `drafted` → `critiqued` | run one independent critic per the risk (one pass, one delegate, or a small cross-family panel); verify every cited path; synthesize | `work note add --kind recommendation --schema forged.spec-recommendations/1` |
| `critiqued` → `adjudicated` | disposition every recommendation and crux; fold accepted ones into the normative fields; remove resolved checkboxes | `work adjudicate --id --expected-revision --dispositions-file …` (**today:** `work update` then `work reopen`, or `work promote` for stubs) |
| `adjudicated` → `dispatched` | confirm the tuple (id, revision, repository, base, profile, roster) with the operator, then one verb | `run dispatch --id --approved-by --basis` (**today:** `run start --work … --repo … --profile … --roster …` then `run submit --run …`) |
| epic `adjudicated` → `dispatched` | `epic preflight`, show the identity tuple, then start and submit | `epic start … --rolling`, `epic submit` |

The lifecycle is a total order at every boundary, including stub
promotions. **Today** you must remember this; after ADR-0036 `run
dispatch` refuses below `adjudicated` and records an override if you
insist.

## Act — the decision verbs

Every decision on `next` names its verbs. The full table is in
[`LIFECYCLE.md`](LIFECYCLE.md#decisions). The ones you will use most:

```sh
forged run retry --id <run> --because spec-amended|world-changed|rebase
forged run accept-risk --run <run> --accepted-by <actor> --rationale "…"
forged run remediate --run <run> --grant 1          # ADR-0036
forged decide --id <attention> --answer "…"          # ADR-0036, seat questions
forged epic resolve --epic <epic> --child <child> --note "…"
forged run stop --run <run> --outcome landed --pr <n> --sha <full-sha>
```

`retry` mints a successor run on the same work item from its current
revision with a fresh package; it never un-settles the source.
`supersede` is for when the spec must be replaced by a new item.
`adjudicate-settlement` is the destructive door for a run the normal
fence cannot settle; it refuses everything the fence can.

## Act — the repair verbs

Refusals carry `error.detail.remedy`. Run the remedy, not a guess.

| Refusal | Meaning | Remedy |
| --- | --- | --- |
| `OPERATION_IN_PROGRESS` | an operation lease is held | `forged reconcile --run <id>` |
| `IDEMPOTENCY_CONFLICT` | same key, different payload | resubmit keyless, or with a fresh explicit key where the manifest requires one |
| `BEADS_CONTENTION` | the ore pass holds the epic's desired row | back off; observe `epic status`; retry the control verb only |
| `ADJUDICATION_REQUIRED` | no durable driver identity to fence | `run adjudicate-settlement` after confirming the evidence gap |
| `SPEC_DRIFT` | the packet's pinned body no longer matches | re-read `work show`; the next packet re-pins |
| `INVALID_REQUEST` with field names | admission preflight refused | fix the named fields (priority, repository) and dispatch again |

### Seats, gates, and deadlines

A seat runs the repository's **seat checks** (`seat_commands` in the operator
config) before each commit and never the full gate: the controller runs the
gate commands after every seat returns and again after each fix round, one
machine gate at a time per daemon (`admission.gate_active`). A relaunched
attempt reads one field note naming the prior attempt and the commits its
worktree already carries, so it continues instead of re-verifying. A stage
deadline kill is its own failure class (`deadline:` note, counted against
`deadline_retry_budget`, never transport). Past that budget the run stops
with `deadlineExhausted` naming the stage, the kill count, and the
worktree's commits ahead and uncommitted paths; `next` offers `run retry`
on a clean tree and `session message` while the seat's work is still
uncommitted. The seat's `gateState` result field is the seat-check outcome
and projects as `seatChecks`; the gate verdict lives in the gate stage.

## Wait

```sh
forged wait --id <id> --until decision|stage|terminal --timeout 240
```

Blocks on the event cursor; returns `explain` for the id when something
changed, or `changed: false` at the timeout. One call replaces a
polling loop.

## Cost discipline

- The roster is a budget dial. Read the current usage window before
  dispatching; move implementation and remediation seats to the
  provider with headroom; keep one cross-family reviewer.
- `next` shows spend so far and the cost of each option from
  `work history`. A retry costs roughly the last attempt again; a
  remediation grant costs one fix round plus one review.
- Delegate mechanical work to cheaper seats or subagents; spend the
  lead's context on specs, adjudication, diff review, and cross-stream
  decisions.
- Never add review rounds in search of unanimity; the profile's budget
  is the bound, and `accept-risk` is the typed exit.

## Never

- Never infer state from a shell, pane, or process; only durable
  responses classify work.
- Never dispatch below `adjudicated` without recording why.
- Never mutate a work item between dispatch and submit.
- Never merge the default branch; never mark a PR ready that the
  protocol did not.
- Never create files, hooks, or stores in the target repository.
- Never install software or run package managers.
- Never store authority only in conversation: every approval, override,
  and decision is a ledger note before it is acted on.
- Never treat missing cost as zero; never treat a settled gate
  operation as a passed gate (`gateState` is the fact).

## Finishing an epic

A run that reaches a draft PR with an approving verdict lands by
policy; an epic child merges into the integration branch by the ore
pass; the epic ends at one draft PR to the default branch. The human
merges it, and you record the landing with `run stop --outcome landed
--pr --sha`. Close the epic with a `retro` note: what worked, what
cost, ranked — the next planning session reads it from the ledger, not
from a memory file.
