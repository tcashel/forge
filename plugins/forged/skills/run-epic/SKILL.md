---
name: run-epic
description: "Submit a locked ledger-native ore epic to Forged for durable wave execution, mechanically integrate clean child slices, and stop at one draft PR to the default branch or an explicit input-required state. Use when the operator explicitly invokes /forged:run-epic."
---

# /forged:run-epic

Position: locked reviewed epic -> execution handoff. Next: durable detached
execution under Forged's controller, then human adjudication of one draft PR.

Boundary: the lead session verifies the ledger plan, makes judgment calls, and
performs the explicit start/submit handoff. After submit, Forged owns provider
attempts, wave scheduling, integration custody, controllers, and evidence. The
lead remains responsible for operator conversation and final judgment.

## Preflight — one read-only command

`forged epic preflight` rehearses every check `epic start` will enforce and
returns the identity tuple a start would freeze, creating nothing:

```bash
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged epic preflight --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --profile "${PROFILE:-standard}" --roster "${ROSTER:-default}" --rolling
```

The report's `checks` cover the repository checkout, base ref (a **bare** branch
name existing on origin, never `origin/main`), epic work-item shape, child spec
completeness versus honest planning stubs, definition and rolling package
compiles, provider binaries, and `gh` authentication. Fix every `ok: false`
check before starting; each failure names its cause.

Show the operator the returned `identities` tuple for approval before the
mutating start: normalized `baseRef`, `integrationBranch`, `assuranceStage`, and
each child's `runId`, branch, and `worktreePath`.

For judgment calls preflight cannot make—real dependency edges and no
unresolved epic-level question or critique CRUX—use bounded
`forged work show --id "$EPIC_ID"` reads. Use preflight's frozen child inventory
instead of recursive expansions that exceed host output budgets.

## Freeze a proportional profile

Use standard assurance for ordinary code slices: deterministic gates, one
independent review, and a bounded remediation loop. Escalate only the children
or seams whose security, data, concurrency, or compatibility risk warrants
more. The profile's loop budget is the stopping rule.

## Typed handoff

The ordered handoff contains no spec-file argument:

```bash
forged epic start --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --profile "${PROFILE:-standard}" --roster "${ROSTER:-default}" --rolling
forged epic submit --epic "$EPIC_ID"
```

The start output must match the approved preflight identities. Submit the exact
epic id and return immediately; do not build a second watcher loop around the
durable controller.

## Execution and terminal boundary

Forged may auto-merge only mechanically clean, accepted child slices into the
epic integration branch. It must reconcile later-wave stubs with merged reality
before dispatch. It must not merge the default branch.

The terminal result is exactly one draft integration-to-default PR with
evidence for human adjudication, or an explicit input-required stop naming the
failed gate, exhausted budget, stale assumption, conflict, or missing authority.

Report the epic id, frozen children and waves, profile, integration/default
branches, and controller identity, then include these read-only reconnect
commands:

```bash
forged overview --epic "$EPIC_ID"
forged epic status --epic "$EPIC_ID"
forged events --run "$EPIC_ID" --limit 200
```

Use a child run id returned by epic status to inspect an active provider
session, then use the attempt id returned by session inventory:

```bash
forged session list --run "$CHILD_RUN_ID"
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

## Recovery

- `restart-budget-exhausted`: read the recorded failure, fix that cause, then
  resubmit the same epic id. Resubmission mints the next controller revision;
  resubmitting without fixing the cause repeats it.
- Contention from `epic advance` means a live detached controller already owns
  the epic. Observe with `epic status`; do not drive it concurrently.

When `inputRequired.childId` names a child, first adjudicate that child's native
work-item fields through the lead session. Then clear only that recorded hold
and submit the next detached controller generation:

```bash
forged epic resolve --epic "$EPIC_ID" --child "$CHILD_ID" \
  --note "$RESOLUTION_NOTE"
forged epic submit --epic "$EPIC_ID"
```

For an epic-level input requirement, fix the underlying condition first, then
resolve the hold without `--child`:

```bash
forged epic resolve --epic "$EPIC_ID" --note "$RESOLUTION_NOTE"
forged epic submit --epic "$EPIC_ID"
```

## Never

- Do not synchronize an external tracker, auto-route, install software, or
  change protocol.
- Do not create an implicit default-branch approval.
- Do not replace the durable controller with a polling or watcher loop.
