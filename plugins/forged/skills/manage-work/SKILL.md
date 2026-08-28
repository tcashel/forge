---
name: manage-work
description: "Automatically route ordinary requests to inspect, plan, critique, adjudicate, explicitly execute, or safely control ledger-native ore work through typed Forged operations. Use whenever the operator discusses work without naming a Forged skill."
---

# Manage work conversationally

Lifecycle position: conversational entrypoint → exactly one bounded read,
planning stage, configuration stage, explicit execution handoff, or existing
work control. Next: the named route in the table below. The lead session owns
conversation, scope, approval, and judgment. Forged owns the ledger-native ore
store, durable execution, controllers, and attempts; execution crosses that
boundary only after explicit submission.

The operator can speak in ordinary language and should not need a skill name,
machine id, pane, or attempt id. Classify the request, preserve its authority
boundary, and use the smallest landed `forged work` or lifecycle operation
that owns the requested result. Operations Overview and Work Detail project
that truth; App resources are optional views, never another source of state.

## Route one intent

Authority is monotonic. Do not let a read become a write, a plan become
execution, or an existing-work control become a new submission.

| Intent | Route | Authority |
| --- | --- | --- |
| Observe or explain the portfolio, queue, repository, or what needs attention | `forged operations overview` (deliberately opening the board view routes via `../board/SKILL.md`) | Read only |
| Explain one durable run or epic | Resolve one exact WorkIdentity, then `forged work detail` | Read only |
| Explore | Discuss or research supplied context | Persist nothing |
| Plan or revise | Read and follow `../plan/SKILL.md` | Ledger-native work-item writes only |
| Configure profiles, rosters, role/model choices, or pricing | Read and follow `../configure/SKILL.md` | Operator authoring config only |
| Critique | Read and follow `../critique/SKILL.md` | One guarded recommendation notes revision only |
| Adjudicate | Read and follow `../adjudicate/SKILL.md` | Its intentional native-field update only |
| Approve plan wording | Continue planning or adjudication | Never execution |
| Execute one ready slice | Apply the execution gate, then follow `../dispatch/SKILL.md` | One approved start and submit |
| Execute one ready epic | Apply the execution gate, then follow `../run-epic/SKILL.md` | One approved start and submit |
| Change an existing priority | Read `forged work show --id`, then refuse | Current `work update` cannot mutate priority |
| Pause or resume an existing epic | One typed epic control and readback | That already-started epic only |
| Cancel an existing slice run | Confirm, then one `run stop` with `cancelled` | That run's terminal transition only |
| Settle a run whose `run stop` refuses for missing durable driver identity | Confirm the evidence gap, then one `run adjudicate-settlement` | That run's terminal transition only |
| Acknowledge, resolve, or reopen attention | One occurrence-fenced attention control and readback | Custody only |
| Inspect provider work | Agent Sessions, only when explicitly requested | Diagnostic only |

When a request mixes intents, complete the least-authorized part first. A
request to “plan and run this” authorizes planning, not execution. A request
to “resume this epic” can authorize only a landed resume of that already-started
epic; it never authorizes `epic start` or `epic submit`.

## Resolve operator and repository scope

Resolve the operator ledger and canonical target repository once:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged work ready
```

Honor an already-set `ANVIL_HOME`. Every work-store read or write goes through
a typed `forged work` verb. Never create a store in the target checkout or a
parallel specification file.

Repository language resolves first. Use only the exact canonical identity
stored in `metadata.repository` and accepted by bounded repository selectors.
An unavailable authoritative repository read fails closed; unknown repository
identity must not widen to unrelated operator work.

## Observe from the headless projections

Start portfolio, queue, repository, and “what needs me?” questions with the
smallest matching read:

```bash
forged operations overview
forged operations overview --repo "$TARGET_REPO"
forged operations overview --group needs-me --limit 50
```

The authoritative response schema is `forged.operations-overview/1`. Preserve
its source health, capture times, coverage and truncation, stable queue groups,
attention items, and known-versus-missing spend. A missing cost is unknown,
never zero. A degraded ledger source may leave some durable unscoped truth
available, but a scoped query that cannot establish membership must fail
closed.

Summarize the stable Needs me, Ready to merge, Running, Stalled or recoverable,
and Planned groups plus admitted, queued, live, review-ready, recent, and
attention counts. Do not infer a state from a process or pane.

The optional Operations view is
`ui://forged/operations-overview.html`. Rendering it is not required to answer.
Do not open several views, refresh by mutation, drill into every row, poll, or
create a watcher.

For one durable subject, take only an exact `detailTarget.subjectKind` and
`detailTarget.subjectId` returned by Operations:

```bash
forged work detail --subject-kind "$SUBJECT_KIND" \
  --subject-id "$SUBJECT_ID" --limit 100
```

The response is `forged.work-detail/1` and its optional view is
`ui://forged/work-detail.html`. Use it for the exact blocker, next action,
attempt and worker summary, gates, review evidence, effect custody, usage,
attention, and bounded event history. Report incomplete coverage or truncation;
do not infer missing evidence from a later page. Plan-only rows have no detail
target until durable execution exists.

Resolve human titles only inside one bounded Operations result. Match the
`forged.work-identity/1` subject, ore/work id, repository, project, epic, and
display context, but pass only its canonical subject kind and id to Work Detail
or a control. Zero matches is not found. Multiple matches require one concise
disambiguation and no mutation. Titles, branch names, panes, process contents,
and the currently visible App are never mutation selectors.

Agent Sessions is an explicitly requested diagnostic drill-down:

```bash
forged session list --run "$RUN_ID"
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

Never substitute `session stop`, a process signal, or a pane action for work
pause, resume, cancellation, attention resolution, or controller lifecycle.

## Distinguish discussion from durable work

Observation and exploration are read-only. Do not create an ore because a
conversation sounds useful. Create or revise durable work only when the
operator clearly asks to capture, plan, or change it; then delegate to the plan
skill and let its native-field and open-question gates decide readiness.

External context already supplied by the operator or another host tool can
inform research. This skill neither retrieves nor synchronizes an external
tracker and never stores its credentials.

## Require exact execution approval

Approval of a plan, critique resolution, implementation direction, prior work,
or a portfolio control is not execution approval.

Before asking, resolve the base branch and use `forged definition validate`
with the intended profile and roster to obtain their exact references. Present
one bounded confirmation tuple:

- slice or epic;
- ore id, title, and observed revision;
- canonical `metadata.repository`;
- base branch;
- resolved profile and roster;
- the exact start-then-submit action being authorized.

A short reply such as “yes” or “do it” is valid only when it immediately and
unambiguously answers that one tuple. A later reply, general approval, different
subject, or changed normative field requires a new tuple.

After approval and before start, append exactly one JSON record to the work
item's `notes`, fenced as `forged-execution-approval`. The ledger has no
comment verb, so this is one deliberate revision-CAS work update:

```forged-execution-approval
{
  "schema": "forged-execution-approval/1",
  "subjectKind": "<slice|epic>",
  "workId": "<exact ore id>",
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

Prepare the complete fenced block in a scratch file outside the repository.
Read the ore, append the block to its existing notes, and perform exactly one
guarded update:

```bash
CURRENT_JSON="$(forged work show --id "$ORE_ID")"
OBSERVED_REVISION="$(
  printf '%s' "$CURRENT_JSON" | jq -er '.result.work.revision'
)"
CURRENT_NOTES="$(
  printf '%s' "$CURRENT_JSON" | jq -er '.result.work.spec.notes'
)"
UPDATED_NOTES="$(printf '%s\n\n%s\n' "$CURRENT_NOTES" "$APPROVAL_BLOCK")"
forged work update --id "$ORE_ID" \
  --expected-revision "$OBSERVED_REVISION" --notes="$UPDATED_NOTES"
POST_APPROVAL_JSON="$(forged work show --id "$ORE_ID")"
```

Before updating, require `$OBSERVED_REVISION` to equal the revision in the
operator-approved tuple; any drift invalidates that approval. Verify that the
approval block is exact, the revision advanced once, and title,
description, design, acceptance, repository, links, kind, status, priority,
custody, and ready-frontier membership are unchanged. Retain the post-update
revision as the handoff snapshot. Normative drift requires fresh approval.

Before promising unattended continuation, run only the installed CLI's
read-only `forged doctor` and `forged service status`. Do not install, start,
restart, or repair the service here.

For a slice, follow `../dispatch/SKILL.md` and invoke exactly one typed start
and one submit using the returned run id. For an epic, follow
`../run-epic/SKILL.md`, verify the frozen inventory, and invoke exactly one
typed start and submit. Perform no work-item or repository mutation between
them.
Return the sibling skill's durable identifiers and reconnect commands, then
stop without polling, watching, or resubmitting.

## Bind every existing-work control

Before a mutation, read a fresh bounded Operations result, exact Work Detail,
and the authoritative ore via `forged work show --id` or
`forged.attention-item/1` when applicable. Bind one control tuple containing:

- subject kind and canonical id;
- display title and canonical repository;
- current lifecycle, work-item revision, or attention occurrence;
- exact requested operation and material parameters;
- durable effect and postcondition.

Stale identity, repository mismatch, unsupported lifecycle, changed revision,
incomplete target, or absent operation fails closed.

A direct unambiguous imperative that already supplies an exact target and all
non-destructive parameters authorizes that one operation; do not add a ritual
confirmation. Ask one bounded confirmation only for ambiguity. Destructive
slice cancellation, accepted-risk decisions, human-owned attention resolution,
and any operation the landed schema marks destructive require a fresh tuple
that states the durable effect. Confirmation for one subject or action never
carries to another.

Derive one operation identity from the exact control tuple and invoke the
operation once. Then re-read Work Detail or Operations and the ore when
relevant. The durable readback, not tool prose or App state, decides success.
An ambiguous response, stale precondition, or failed postcondition is visible
input-required evidence; do not retry, resubmit, or choose another action.

## Existing priority changes are unsupported

`forged work create` accepts `--priority`, but current
`forged work update` is revision-CAS over the five spec fields only. There is
no typed ledger verb for mutating an existing ore's priority. Read the exact
item with `forged work show --id "$ORE_ID"`, report its current priority, and
refuse the requested write without substituting a legacy store, direct database
edit, close/reopen dance, or another lifecycle effect.

Priority is chosen when the work item is created. Lower numbers win later
admission decisions, but priority never preempts active work. If changing
existing priority becomes necessary, require a landed typed work operation
before documenting or attempting it.

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
resolution and does not authorize `epic submit`. An input-required or otherwise
ineligible epic must first follow its exact domain and attention action. There
is no inferred slice pause or generic epic stop.

## Cancel a slice run

After a fresh destructive confirmation naming the exact run, current state,
reason, `cancelled` outcome, and terminal effect, invoke:

```bash
forged run stop --run "$RUN_ID" --outcome cancelled --reason "$REASON" \
  --idempotency-key "$OPERATION_KEY"
forged work detail --subject-kind run --subject-id "$RUN_ID"
```

Never infer `clean`, `blocked`, `input-required`, `superseded`, or `landed`
from the word “stop.” Cancellation does not declare the ore complete. Do not
use attempt-level stop or several child mutations as a substitute. When
`run stop` refuses with the typed code `ADJUDICATION_REQUIRED` — the run's
controller record carries no durable driver identity — do not retry it or
emulate settlement with child mutations: route exactly that refusal, and
only that code, through the adjudication below.

## Adjudicate settlement of an unfenceable run

`run stop` fails closed with `ADJUDICATION_REQUIRED` when a run's latest
controller record lacks durable driver identity (a missing pid or a missing
start identity), because no controller death can be verified. Only for that
exact refusal, `run adjudicate-settlement` records an explicit operator
adjudication of the evidence gap and settles the run. It is explicitly
destructive: after a fresh confirmation naming the exact run, the observed
refusal, the asserted terminal outcome, and the evidence gap being
adjudicated, invoke:

```bash
forged run adjudicate-settlement --run "$RUN_ID" --outcome "$OUTCOME" \
  --actor "$OPERATOR_ACTOR" --rationale "$RATIONALE" \
  --evidence-gap "$EVIDENCE_GAP"
forged work detail --subject-kind run --subject-id "$RUN_ID"
```

Never pass `--idempotency-key` here: the operation derives ONE key per run,
and that derived identity is the crash-recovery handle — an interrupted
adjudication resumes only under it, so a custom key would strand the
interrupted row behind a permanent conflict.

The outcome set is `landed` (additionally requires `--pr` and the exact
`--sha`), `superseded` (requires `--superseded-by`), and `cancelled`. The
operation refuses a run whose record the normal fence can settle — `run
stop` stays the only path there — and refuses while any recorded machine
effect lacks a confirmed-dead controller. Never use it to bypass a live
fence, and never infer the outcome: it must come from durable evidence such
as the work item's recorded close reason.

## Accept review risk only as a human decision

Reviewer disagreement and review-budget exhaustion remain human-owned. Present
the exact deduplicated findings and consequence, then require a fresh operator
decision, identity, and rationale:

```bash
forged run accept-risk --run "$RUN_ID" \
  --accepted-by "$OPERATOR_ACTOR" --rationale "$RATIONALE" \
  --idempotency-key "$OPERATION_KEY"
forged work detail --subject-kind run --subject-id "$RUN_ID"
```

This is not a generic attention acknowledgement and never supplies merge
approval. The plugin never merges the default branch.

## Control attention custody

Use only the current item's closed fields: `attentionId`, `occurrenceId`,
`subjectKind`, `subjectId`, repository, condition, severity, owner, state,
evidence references, and `recommendedAction`. Acknowledgement is custody, not
resolution. A stable attention id does not make an old occurrence current.

Acknowledgement leaves the item active:

```bash
forged attention acknowledge --subject "$SUBJECT_ID" \
  --attention-id "$ATTENTION_ID" --occurrence-id "$OCCURRENCE_ID" \
  --actor "$CONTROL_ACTOR" --idempotency-key "$OPERATION_KEY"
```

Resolve only explicitly adjudicable custody conditions: `quarantined`,
`missing-cost`, `retry-exhausted`, `reviewer-disagreement`, and
`missing-evidence`. Missing cost accepts only `accepted-unknown` while
pricing remains absent. Missing evidence accepts only `evidence-absent` —
the explicit record, with a mandatory nonblank note, that the evidence was
never captured and cannot be reconstructed — and only when every source in
the occurrence is a manifest-less attempt. A clean or accepted-risk run
whose delivery PR is missing or wrong-based raises the same condition but is
repairable: record the exact-base PR instead of adjudicating absence. Every
other condition clears only through the named domain transition:

```bash
forged attention resolve --subject "$SUBJECT_ID" \
  --attention-id "$ATTENTION_ID" --occurrence-id "$OCCURRENCE_ID" \
  --actor "$CONTROL_ACTOR" --disposition "$DISPOSITION" --note "$NOTE" \
  --idempotency-key "$OPERATION_KEY"
```

Lead-agent-owned routine items may be acknowledged or acted on within already
granted authority. Every item whose owner is human—including input, blocker,
quarantine, ambiguous-effect, restart, review-risk, missing-evidence, and merge
decisions—requires the user's exact decision. Observe the relevant domain result before resolving
custody. Merge approval remains a human/GitHub boundary outside this skill.

Reopen only the exact resolved occurrence named by prior durable transition
evidence; a reopened item is active again and needs a new decision:

```bash
forged attention reopen --subject "$SUBJECT_ID" \
  --attention-id "$ATTENTION_ID" --occurrence-id "$OCCURRENCE_ID" \
  --actor "$CONTROL_ACTOR" --idempotency-key "$OPERATION_KEY"
```

After any attention control, re-read Operations and exact Work Detail. Preserve
`forged.attention-transition/1` and
`forged.attention-transition-result/1` evidence. If control coverage is
incomplete, never infer that an absent item resolved. A stale occurrence,
unsupported condition, or duplicate/ambiguous response is reported without a
second invocation.

## Validation and mutation budgets

`intent-fixtures.json` keeps the base intent boundary.
`portfolio-control-fixtures.json` closes portfolio selection, human reference
resolution, confirmation, operation identity, readback, unsupported controls,
attention ownership, and per-case mutation budgets.

Both files are validation evidence, not runtime routing logic or a second
workflow engine. Static validation is not native Claude or Codex behavior
proof. Status and explanation cases have zero mutations. Each supported
control permits at most one named effect and zero start, submit, session-stop,
service, direct provider, repository, or GitHub effects.

## Never

- Never treat status or lifecycle language as authorization for initial
  execution.
- Never claim work merely to observe or reprioritize it.
- Never use a title, branch, pane, process, or visible App as a mutation
  selector.
- Never store execution or control authority only in conversation state.
- Never create repository-local work-store state or a sidecar specification.
- Never retrieve or synchronize an external tracker.
- Never emulate a missing lifecycle operation with comments, UI state,
  sessions, signals, or child-by-child mutation.
- Never install or mutate the service, invoke a provider for testing, or merge
  the default branch.
- Never add review rounds in search of unanimity.
