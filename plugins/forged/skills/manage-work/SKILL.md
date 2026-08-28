---
name: manage-work
description: "Automatically route ordinary requests to inspect, plan, critique, adjudicate, explicitly execute, or safely control Forge work through ledger-native ore work items and typed Forged operations. Use whenever the operator discusses work without naming a Forged skill."
---

# Manage work conversationally

Position: ordinary operator request -> the least-authorized lifecycle action.
Next: the exact read, `forged work` verb, sibling skill, or existing-work
control selected below.

Boundary: the lead agent owns conversation, planning, critique, adjudication,
and operator judgment while reading or authoring the ledger. Forged owns
provider attempts, controllers, gates, and execution evidence only after an
explicit start/submit handoff. Apps are optional views, never state or
authority.

## Route one intent

Authority is monotonic. Do not let a read become a write, a plan become
execution, or an existing-work control become a new submission.

| Intent | Route | Authority |
| --- | --- | --- |
| Observe or explain the portfolio, queue, repository, or attention | `forged operations overview`; deliberate board opening uses `../board/SKILL.md` | Read only |
| Explain one durable run or epic | Resolve one exact WorkIdentity, then `forged work detail` | Read only |
| Explore | Discuss or research supplied context | Persist nothing |
| Plan or revise | Read and follow `../plan/SKILL.md` | Ledger work-item writes only |
| Configure profiles, rosters, role/model choices, or pricing | Read and follow `../configure/SKILL.md` | Operator authoring config only |
| Critique | Read and follow `../critique/SKILL.md` | One guarded recommendation notes update |
| Adjudicate | Read and follow `../adjudicate/SKILL.md` | One guarded native-field update, plus reopen only for a completed blocked stub |
| Approve plan wording | Continue planning or adjudication | Never execution |
| Execute one ready slice | Apply the execution gate, then follow `../dispatch/SKILL.md` | One approved start and submit |
| Execute one ready epic | Apply the execution gate, then follow `../run-epic/SKILL.md` | One approved start and submit |
| Express intended priority for an existing item | Guarded notes update and readback | Records intent only; scheduling priority is unchanged |
| Pause or resume an existing epic | One typed epic control and readback | That already-started epic only |
| Cancel an existing slice run | Confirm, then one `run stop` with `cancelled` | That run's terminal transition only |
| Settle a run whose `run stop` refuses for missing durable driver identity | Confirm the evidence gap, then one `run adjudicate-settlement` | That run's terminal transition only |
| Acknowledge, resolve, or reopen attention | One occurrence-fenced attention control and readback | Custody only |
| Inspect provider work | Agent Sessions, only when explicitly requested | Diagnostic only |

When a request mixes intents, complete the least-authorized part first. “Plan
and run this” authorizes planning, not execution. “Resume this epic” can
authorize only the landed resume operation for that already-started epic; it
never authorizes `epic start` or `epic submit`.

## Resolve operator and repository scope

Resolve the operator home and canonical target repository once:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged work ready
```

`forged work` addresses the operator ledger. Every authored item stores the
exact canonical checkout in `metadata.repository`. Never create a
repository-local work store, route creation through a repository database, or
create a parallel specification file.

Repository language resolves first. An unavailable authoritative repository
read fails closed; unknown identity must not widen to unrelated operator work.

## Observe from headless projections

Start portfolio, queue, repository, and “what needs me?” questions with the
smallest matching read:

```bash
forged operations overview
forged operations overview --repo "$TARGET_REPO"
forged operations overview --group needs-me --limit 50
```

The authoritative response schema is `forged.operations-overview/1`. Preserve
source health, capture times, coverage and truncation, stable queue groups,
attention, and known-versus-missing spend. Missing cost is unknown, never zero.
A degraded plan projection may leave durable unscoped truth available, but a
scoped query unable to establish membership fails closed.

Summarize Needs me, Ready to merge, Running, Stalled or recoverable, and
Planned plus admitted, queued, live, review-ready, recent, and attention counts.
Do not infer state from a process or pane.

The optional Operations view is `ui://forged/operations-overview.html`.
Rendering it is not required. Do not refresh by mutation, poll, or drill into
every row.

For one durable subject, use only an exact `detailTarget.subjectKind` and
`detailTarget.subjectId` returned by Operations:

```bash
forged work detail --subject-kind "$SUBJECT_KIND" \
  --subject-id "$SUBJECT_ID" --limit 100
```

The response is `forged.work-detail/1`; its optional view is
`ui://forged/work-detail.html`. Use it for blockers, next action, attempts,
workers, gates, reviews, effect custody, usage, attention, and bounded events.
Report incomplete coverage or truncation. Plan-only rows have no detail target
until durable execution exists.

Resolve human titles only inside one bounded Operations result. Match the
`forged.work-identity/1` subject, stored work-item id, repository, project,
epic, and display context, then pass only canonical subject kind and id to a
detail read or control. Zero matches is not found; multiple matches require one
concise disambiguation and no mutation. Titles, branches, panes, processes, and
visible Apps are never mutation selectors.

Agent Sessions is an explicitly requested diagnostic drill-down:

```bash
forged session list --run "$RUN_ID"
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

Never substitute `session stop`, a signal, or a pane action for lifecycle
control.

## Distinguish discussion from durable work

Observation and exploration are read-only. Do not create a work item because a
conversation merely sounds useful. Create or revise durable work only when the
operator clearly asks to capture, plan, or change it; then follow the plan
skill and its native-field/open-question gates.

External context supplied by the operator or another host tool may inform
research. This skill neither retrieves nor synchronizes an external tracker
and never stores its credentials.

## Require exact execution approval

Approval of plan wording, critique resolution, implementation direction, prior
work, or portfolio control is not execution approval.

Before asking, resolve the base branch and use `forged definition validate`
with the intended profile and roster. Present one bounded tuple:

- slice or epic;
- work-item id, title, and observed revision;
- canonical `metadata.repository`;
- base branch;
- resolved profile and roster;
- exact start-then-submit action.

A short “yes” is valid only when it immediately and unambiguously answers that
tuple. A later reply, general approval, different subject, or changed normative
field requires a new tuple.

After approval and before start, append exactly one fenced JSON record to the
existing `notes` bytes:

```forged-execution-approval
{
  "schema": "forged-execution-approval/1",
  "subjectKind": "<slice|epic>",
  "workItemId": "<exact ore id>",
  "observedRevision": "<revision shown in the tuple>",
  "repository": "<canonical absolute root>",
  "baseRef": "<base>",
  "profile": "<resolved profile>",
  "roster": "<resolved roster>",
  "action": "<run-start-submit|epic-start-submit>",
  "approvedAt": "<ISO-8601 UTC>",
  "actor": "<operator identity>",
  "basis": "<short non-secret approval basis>"
}
```

Current main has no separate ledger commentary verb, so preserve all existing
notes and perform one guarded update. Fail closed before the update unless the
combined approval notes file is readable, nonempty, and loaded successfully:

```bash
: "${DRAFT_DIR:?set DRAFT_DIR to the approval scratch directory}"
APPROVED_NOTES_PATH="$DRAFT_DIR/notes-with-approval.md"
if [[ ! -r "$APPROVED_NOTES_PATH" || ! -s "$APPROVED_NOTES_PATH" ]]; then
  printf 'missing or empty combined approval notes: %s\n' \
    "$APPROVED_NOTES_PATH" >&2
  exit 1
fi
APPROVED_NOTES="$(<"$APPROVED_NOTES_PATH")" || exit 1
if [[ -z "$APPROVED_NOTES" ]]; then
  printf 'combined approval notes must be nonempty\n' >&2
  exit 1
fi
forged work update \
  --id "$WORK_ID" \
  --expected-revision "$OBSERVED_REVISION" \
  --notes="$APPROVED_NOTES"
forged work show --id "$WORK_ID"
```

Verify only the intended notes append and revision changed; title, description,
design, acceptance criteria, repository, edges, kind, and readiness must not.
The post-update revision is the handoff snapshot. Any conflict or later
normative drift requires fresh approval.

Before promising unattended continuation, run only `forged doctor` and
`forged service status`. Do not install, start, restart, or repair service here.

For a slice, follow `../dispatch/SKILL.md` and invoke exactly one start and one
submit. For an epic, follow `../run-epic/SKILL.md`, verify frozen inventory, and
invoke exactly one start and submit. Perform no work-item or repository mutation
between them. Return durable ids and reconnect commands, then stop without
polling, watching, or resubmitting.

## Bind every existing-work control

Before mutation, read fresh bounded Operations, exact Work Detail, and
`forged work show --id` or `forged.attention-item/1` when applicable. Bind one
tuple containing:

- subject kind and canonical id;
- display title and canonical repository;
- current lifecycle, work-item revision, or attention occurrence;
- exact requested operation and material parameters;
- durable effect and postcondition.

Stale identity, repository mismatch, unsupported lifecycle, moved revision,
incomplete target, or absent operation fails closed.

A direct unambiguous imperative with exact target and all non-destructive
parameters authorizes that operation. Ask one bounded confirmation only for
ambiguity. Destructive cancellation, accepted-risk decisions, human-owned
attention resolution, and operations marked destructive require a fresh tuple
that states the durable effect.

Derive one operation identity from the tuple and invoke once. Re-read Work
Detail or Operations and the work item when relevant. Durable readback decides
success. An ambiguous response, stale precondition, or failed postcondition is
visible input-required evidence; do not retry, resubmit, or choose another
action.

## Record intended priority for an existing item

Current main does **not** expose priority mutation for an existing work item.
Do not reference a nonexistent flag or imply that scheduling changed. Validate
the intended numeric priority from 0 through 4 (lower numbers win), append a
dated `Intended priority: <n>; pending ore-063 typed priority operation` line to
the existing notes, then make one revision-CAS update. Fail closed unless the
combined notes file is readable, nonempty, and loaded successfully:

```bash
: "${DRAFT_DIR:?set DRAFT_DIR to the priority-intent scratch directory}"
UPDATED_NOTES_PATH="$DRAFT_DIR/notes-with-priority-intent.md"
if [[ ! -r "$UPDATED_NOTES_PATH" || ! -s "$UPDATED_NOTES_PATH" ]]; then
  printf 'missing or empty combined priority notes: %s\n' \
    "$UPDATED_NOTES_PATH" >&2
  exit 1
fi
UPDATED_NOTES="$(<"$UPDATED_NOTES_PATH")" || exit 1
if [[ -z "$UPDATED_NOTES" ]]; then
  printf 'combined priority notes must be nonempty\n' >&2
  exit 1
fi
forged work update \
  --id "$WORK_ID" \
  --expected-revision "$OBSERVED_REVISION" \
  --notes="$UPDATED_NOTES"
forged work show --id "$WORK_ID"
```

Verify the note and new revision; the top-level `priority` value is unchanged.
Explain that this records intent only: it does not affect admission,
never preempts active work, and needs ore-063's typed priority operation before
it changes scheduling.

## Pause or resume an epic

Pause only an already-started eligible epic:

```bash
forged epic pause --epic "$EPIC_ID" --reason "$REASON" \
  --idempotency-key "$OPERATION_KEY"
forged work detail --subject-kind epic --subject-id "$EPIC_ID"
```

Resume only a currently paused, already-started eligible epic:

```bash
forged epic resume --epic "$EPIC_ID" --reason "$REASON" \
  --idempotency-key "$OPERATION_KEY"
forged work detail --subject-kind epic --subject-id "$EPIC_ID"
```

Pause takes effect at its landed durable boundary. Resume is not input
resolution and does not authorize `epic submit`. An ineligible epic must follow
its exact domain and attention action. There is no inferred slice pause or
generic epic stop.

## Cancel a slice run

After fresh destructive confirmation naming exact run, current state, reason,
`cancelled` outcome, and terminal effect:

```bash
forged run stop --run "$RUN_ID" --outcome cancelled --reason "$REASON" \
  --idempotency-key "$OPERATION_KEY"
forged work detail --subject-kind run --subject-id "$RUN_ID"
```

Never infer another outcome from “stop.” Cancellation does not declare the
source work item complete. Do not substitute attempt-level stop or several
child mutations. If `run stop` returns `ADJUDICATION_REQUIRED` because durable
driver identity is missing, route only that exact refusal to settlement
adjudication below.

## Adjudicate settlement of an unfenceable run

Only after the exact `ADJUDICATION_REQUIRED` refusal and fresh destructive
confirmation:

```bash
forged run adjudicate-settlement --run "$RUN_ID" --outcome "$OUTCOME" \
  --actor "$OPERATOR_ACTOR" --rationale "$RATIONALE" \
  --evidence-gap "$EVIDENCE_GAP"
forged work detail --subject-kind run --subject-id "$RUN_ID"
```

Never pass `--idempotency-key`: this operation derives one key per run, which
is its crash-recovery handle. Allowed outcomes are `landed` (also requires
`--pr` and exact `--sha`), `superseded` (requires `--superseded-by`), and
`cancelled`. It refuses runs the normal fence can settle and any recorded
machine effect without a confirmed-dead controller. Never infer the outcome;
derive it from durable evidence such as the work item's close reason.

## Accept review risk only as a human decision

Present exact deduplicated findings and consequence, then require a fresh
operator identity and rationale:

```bash
forged run accept-risk --run "$RUN_ID" \
  --accepted-by "$OPERATOR_ACTOR" --rationale "$RATIONALE" \
  --idempotency-key "$OPERATION_KEY"
forged work detail --subject-kind run --subject-id "$RUN_ID"
```

This is not generic attention acknowledgement and never supplies merge
approval. The plugin never merges the default branch.

## Control attention custody

Use only current closed fields: `attentionId`, `occurrenceId`, `subjectKind`,
`subjectId`, repository, condition, severity, owner, state, evidence references,
and `recommendedAction`. Acknowledgement is custody, not resolution.

```bash
forged attention acknowledge --subject "$SUBJECT_ID" \
  --attention-id "$ATTENTION_ID" --occurrence-id "$OCCURRENCE_ID" \
  --actor "$CONTROL_ACTOR" --idempotency-key "$OPERATION_KEY"
```

Resolve only explicitly adjudicable custody conditions: `quarantined`,
`missing-cost`, `retry-exhausted`, `reviewer-disagreement`, and
`missing-evidence`. Missing cost accepts only `accepted-unknown` while pricing
is absent. Missing evidence accepts only `evidence-absent`, with a mandatory
note, and only when every source is a manifest-less attempt. A clean or
accepted-risk run with a missing/wrong-base delivery PR is repairable: record
the exact-base PR instead of adjudicating absence.

```bash
forged attention resolve --subject "$SUBJECT_ID" \
  --attention-id "$ATTENTION_ID" --occurrence-id "$OCCURRENCE_ID" \
  --actor "$CONTROL_ACTOR" --disposition "$DISPOSITION" --note "$NOTE" \
  --idempotency-key "$OPERATION_KEY"
```

Lead-owned routine items may be acknowledged or acted on within granted
authority. Human-owned input, blocker, quarantine, ambiguous-effect, restart,
review-risk, missing-evidence, and merge decisions require the user's exact
decision. Observe the domain result before resolving custody.

Reopen only the exact resolved occurrence named by prior durable evidence:

```bash
forged attention reopen --subject "$SUBJECT_ID" \
  --attention-id "$ATTENTION_ID" --occurrence-id "$OCCURRENCE_ID" \
  --actor "$CONTROL_ACTOR" --idempotency-key "$OPERATION_KEY"
```

After control, re-read Operations and exact Work Detail. Preserve
`forged.attention-transition/1` and
`forged.attention-transition-result/1` evidence. Incomplete control coverage,
stale occurrences, unsupported conditions, and duplicate responses never
justify a second invocation.

## Validation and mutation budgets

`intent-fixtures.json` keeps the base intent boundary.
`portfolio-control-fixtures.json` closes portfolio selection, human reference
resolution, confirmation, operation identity, readback, unsupported controls,
attention ownership, the priority-intent gap, and per-case mutation budgets.

Both are validation evidence, not runtime routing logic. Status and explanation
cases have zero mutations. Each supported control permits at most one named
effect and zero start, submit, session-stop, service, direct provider,
repository, or GitHub effects.

## Never

- Never treat status or lifecycle language as initial execution authority.
- Never claim work merely to observe or record intended priority.
- Never use title, branch, pane, process, or visible App as a mutation selector.
- Never store execution or control authority only in conversation state.
- Never create a repository-local work store or sidecar specification.
- Never retrieve or synchronize an external tracker.
- Never emulate a missing lifecycle operation with UI state, sessions, signals,
  or child-by-child mutation.
- Never install or mutate service, invoke a provider for testing, or merge the
  default branch.
- Never add review rounds in search of unanimity.
