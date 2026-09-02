---
name: run-epic
description: "Submit a locked ledger-native ore epic to Forged for durable frontier execution, mechanically integrate clean child slices, and stop at one draft PR to the default branch or an explicit input-required state. Use when the operator explicitly invokes /forged:run-epic."
---

# /forged:run-epic

Position: locked reviewed epic -> execution handoff. Next: durable execution
under Forged's supervisor ore pass, then human adjudication of one draft PR.

Boundary: the lead session verifies the ledger plan, makes judgment calls, and
performs the explicit start/submit handoff. After submit, Forged owns frontier
scheduling, provider attempts, integration custody, child-run controllers, and
evidence. The lead remains responsible for operator conversation and final
judgment.

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

For judgment calls preflight cannot make, read the epic and every child in the
frozen inventory with exact-id bounded reads:

```bash
forged work show --id "$EPIC_ID"
for CHILD_ID in <every exact id from preflight's frozen child inventory>; do
  forged work show --id "$CHILD_ID"
done
```

Validate the epic and each frozen child's complete `notes`: no unchecked
question and no unresolved critique CRUX may remain. Validate every child's
reported `parent-child` and `blocks` dependency edges against the frozen
inventory, intended frontier, and ordering; a missing, extra, or contradictory
edge fails closed before approval or execution. Use the frozen child inventory
instead of recursive expansions that exceed host output budgets.

For the epic and every frozen child, critique output in `notes` must explicitly
disposition every finding, recommendation, CRUX, and open question. Each
accepted item must be folded into the normative fields; each rejected item must
retain its reason. Checkbox-free critique prose is not evidence of
adjudication. If any critique output lacks those dispositions, the epic is not
dispatchable: return the affected record to `/forged:adjudicate` before any
epic start. Keep the unchecked-checkbox gate in addition to this disposition
check.

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
epic id and return immediately. Submit authorizes the epic's desired row; the
supervisor ore pass reconciles it and child runs use the ordinary detached run
controllers. Do not build a second watcher loop around either lifecycle.

## Execution and terminal boundary

Forged may auto-merge only mechanically clean, accepted child slices into the
epic integration branch. It must reconcile newly ready planning stubs with
merged reality before dispatch. It must not merge the default branch.

The terminal result is exactly one draft integration-to-default PR with
evidence for human adjudication, or an explicit input-required stop naming the
failed gate, exhausted budget, stale assumption, conflict, or missing authority.

Report the epic id, frozen children, profile, integration/default branches, and
desired/pass status, then include these read-only reconnect commands:

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

- A child `restart-budget-exhausted` condition belongs to that child run: read
  its recorded failure and use the exact run-scoped recovery verb. Resubmitting
  the epic does not reset a child run's controller budget.
- `BEADS_CONTENTION` from start, revise, or resume means the supervisor ore pass
  currently owns the epic's desired row. Back off and observe with `epic
  status`; retry only the refused control verb after that bounded pass releases
  its claim.

When `inputRequired.childId` names a child, first adjudicate that child's native
work-item fields through the lead session. Then clear only that recorded hold;
the resolution wakes the existing desired epic:

```bash
forged epic resolve --epic "$EPIC_ID" --child "$CHILD_ID" \
  --note "$RESOLUTION_NOTE"
```

For an epic-level input requirement, fix the underlying condition first, then
resolve the hold without `--child`:

```bash
forged epic resolve --epic "$EPIC_ID" --note "$RESOLUTION_NOTE"
```

## Never

- Do not synchronize an external tracker, auto-route, install software, or
  change protocol.
- Do not create an implicit default-branch approval.
- Do not replace the supervisor pass with a polling or watcher loop.
