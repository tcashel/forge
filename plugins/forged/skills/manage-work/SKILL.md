---
name: manage-work
description: "Automatically route ordinary requests to inspect, plan, critique, adjudicate, explicitly execute, or safely control Forge work through ledger-native ore work items and typed Forged operations. Use whenever the operator discusses work without naming a Forged skill."
---

# Manage work conversationally

Position: `forged explain --id "$SUBJECT_ID"` states one exact subject's lifecycle and health.
Next: `forged next --repo "$TARGET_REPO"` states the bounded repository action.

Boundary: the lead owns conversation, research, planning, critique,
adjudication, and operator judgment. Forged owns attempts, controllers, gates,
and evidence after explicit dispatch. Apps are optional views, never authority.

## Route one fixture case

`intent-fixtures.json` and `portfolio-control-fixtures.json` are the routing
contract. Match exactly one case, preserve its confirmation class and effect
budget, and fail closed when identity or scope is ambiguous. Each case has one
route line below.

### Intent routes

- `observe` → `observe`
- `explore` → `explore`
- `plan` → `plan`
- `revise` → `revise`
- `critique` → `critique`
- `adjudicate` → `adjudicate`
- `configure` → `configure`
- `plan-approval` → `plan-approval`
- `execute-slice` → `execute-slice`
- `execute-epic` → `execute-epic`
- `ambiguous-approval` → `ambiguous-approval`
- `stale-approval` → `stale-approval`
- `status` → `status`
- `control` → `control`
- `external-context` → `external-context`

Delegate `plan` and `revise` to `../plan/SKILL.md`, `configure` to
`../configure/SKILL.md`, `critique` to `../critique/SKILL.md`, `adjudicate` to
`../adjudicate/SKILL.md`, `execute-slice` to `../dispatch/SKILL.md`, and
`execute-epic` to `../run-epic/SKILL.md`. Exploration persists nothing. Plan
wording approval never implies execution. Mixed requests complete the
least-authorized intent first.

### Portfolio and control routes

- `status-unscoped` → `operations-overview`
- `status-repository` → `operations-overview`
- `needs-me` → `operations-overview`
- `app-unavailable` → `operations-overview`
- `detail-exact` → `work-detail`
- `title-unique` → `operations-then-detail`
- `title-zero` → `refuse`
- `title-ambiguous` → `refuse`
- `blocker-explanation` → `work-detail`
- `spend-known` → `work-detail`
- `spend-unknown` → `work-detail`
- `plan-only-detail` → `refuse`
- `priority-change` → `work-notes-priority-intent`
- `epic-pause` → `epic-pause`
- `epic-resume` → `epic-resume`
- `input-required-resume` → `work-detail`
- `slice-cancel` → `run-stop-cancelled`
- `slice-pause-unsupported` → `refuse`
- `epic-stop-unsupported` → `refuse`
- `stale-precondition` → `refuse`
- `duplicate-response` → `refuse`
- `attention-acknowledge-lead` → `attention-acknowledge`
- `attention-resolve-lead` → `attention-resolve`
- `attention-resolve-human` → `attention-resolve`
- `attention-source-backed` → `refuse`
- `attention-stale-occurrence` → `refuse`
- `attention-reopen` → `attention-reopen`
- `review-risk-acceptance` → `run-accept-risk`
- `merge-approval` → `refuse`
- `session-diagnostic` → `session-diagnostic`
- `session-stop-substitution` → `refuse`
- `adjudicate-unfenceable` → `run-adjudicate-settlement`
- `adjudicate-fenceable-refused` → `refuse`

Use the fixture's postcondition as the readback assertion. Missing cost stays
unknown, priority intent does not change scheduling, acknowledgement is custody
only, and input resolution follows its domain operation. Never substitute a
session or process action for lifecycle control. Default-branch merge is human
owned.

## Orient, decide, act, wait

Resolve repository language before unscoped portfolio language. The canonical
absolute checkout becomes `metadata.repository`; unavailable repository truth
fails closed rather than widening scope.

```bash
forged next --repo "$TARGET_REPO"
forged explain --id "$SUBJECT_ID"
```

`next` is bounded and returns no specification bodies unless requested.
`explain` carries subject, lifecycle, health, evidence, and at most one `should`
action with pre-bound args. Titles are selectors only after one bounded result
contains exactly one canonical match. Zero matches refuse; multiple matches ask
one concise disambiguation question.

Invoke the fixture route once with the exact id, occurrence, revision, and
parameters from the fresh projection. A direct unambiguous imperative
authorizes one non-destructive existing-work control. Cancellation, accepted
risk, human-owned resolution, settlement adjudication, and any destructive
route require a fresh tuple naming the durable effect. Re-read the exact id;
stale inputs, unsupported state, ambiguous results, or failed postconditions
become visible input-required evidence and are never retried automatically.

## Execution boundary

Before requesting execution approval, validate the intended profile and roster
and show id, title, revision, repository, base, profile, roster, actor, and
effect. A short answer is valid only when it immediately and unambiguously
approves that tuple. Approval of planning or adjudication does not dispatch.

```bash
forged definition validate --profile "$PROFILE" --roster "$ROSTER"
forged run dispatch --id "$WORK_ID" --approved-by "$APPROVED_BY" \
  --basis "$BASIS" --repo "$TARGET_REPO" --base-ref "$BASE_REF" \
  --profile "$PROFILE" --roster "$ROSTER"
forged wait --id "$RUN_ID" --until decision --timeout 240
```

The fenced `run dispatch` operation records approval and immutable handoff
together. Epic execution uses `../run-epic/SKILL.md`. No repository or work-item
mutation occurs between approval and handoff. Return durable ids, then stop;
waiting is one `wait` call, never a polling loop.

Check unattended capability without changing it:

```bash
forged doctor
forged service status
```

Do not install, start, restart, or repair the service here.

## Judgment and refusals

Use standard assurance on routine isolated work and escalate only the seats
needed by security, destructive-data, concurrency, or compatibility risk. The
profile's budget ends review; do not seek unanimity. The lead makes routine
engineering calls and asks only about product scope, external authority, or
risk acceptance.

Every refusal must preserve `forged.remedy/1` and name the exact recovery verb.
Run that remedy after its preconditions hold; do not invent choreography,
access a legacy store, synchronize an external tracker, or edit `state.db`.
