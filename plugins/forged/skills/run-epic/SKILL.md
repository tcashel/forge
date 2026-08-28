---
name: run-epic
description: "Submit a locked ledger-native ore epic to Forged for durable wave execution, mechanically integrate clean child slices, and stop at one draft PR to the default branch or an explicit input-required state. Use when the operator explicitly invokes /forged:run-epic."
---

# /forged:run-epic

Lifecycle position: adjudicated epic → immutable wave execution. Next: observe
the detached epic, then adjudicate its one draft integration PR or named
input-required stop. Preflight and approval run in the lead session. After
`epic submit`, Forged owns the frozen inventory, child runs, controllers,
ledger attempts, gates, and mechanical integration; the lead agent owns
operator conversation and final judgment.

## Preflight — one read-only command

`forged epic preflight` rehearses every check `epic start` will enforce and
returns the identity tuple a start would freeze, creating nothing:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged epic preflight --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --profile "${PROFILE:-standard}" --roster "${ROSTER:-default}" --rolling
```

The report's `checks` cover the repository checkout, bare base ref existing on
origin, epic work-item shape, child completeness versus honest planning stubs,
definition and rolling-package compilation, provider binaries, and GitHub
authentication. Fix every `ok: false` check before starting.

Show the operator the returned `identities` tuple for approval:
`baseRef`, `integrationBranch`, `assuranceStage`, and every child's
`runId`, branch, and worktree path.

For judgment calls the checklist cannot make, read the epic and only the exact
child ids returned by preflight:

```bash
forged work show --id "$EPIC_ID"
forged work show --id "$CHILD_ID"
```

Verify real dependencies only and no unresolved epic-level question or critique
CRUX. Do not recursively hydrate an unbounded graph.

## Freeze a proportional profile

Use standard assurance for ordinary code slices: deterministic gates, one
independent review, and a bounded remediation loop. Escalate only children or
seams whose security, data, concurrency, or compatibility risk warrants more.
The profile's loop budget is the stopping rule.

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
before dispatch. It must never merge the default branch.

The terminal result is exactly one draft integration-to-default PR with
evidence for human adjudication, or an explicit input-required stop naming the
failed gate, exhausted budget, stale assumption, conflict, or missing
authority.

Report the epic id, frozen children and waves, profile, integration/default
branches, and controller identity, then include:

```bash
forged overview --epic "$EPIC_ID"
forged epic status --epic "$EPIC_ID"
forged events --run "$EPIC_ID" --limit 200
```

Use the child run id returned by epic status to inspect active provider work:

```bash
forged session list --run "$CHILD_RUN_ID"
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

## Recovery

- For `restart-budget-exhausted`, read the recorded failure, fix that cause,
  then resubmit the same epic id. Resubmitting without fixing the cause repeats
  it.
- For a contention refusal from `epic advance`, a live detached controller
  already owns the epic. Observe it; do not drive it in the lead session.

When `inputRequired.childId` names a child, first update and adjudicate that
child through `forged work show/update` and `/forged:adjudicate`. Then clear
only the recorded hold and submit the next controller generation:

```bash
forged epic resolve --epic "$EPIC_ID" --child "$CHILD_ID" \
  --note "$RESOLUTION_NOTE"
forged epic submit --epic "$EPIC_ID"
```

For an epic-level input requirement, fix the underlying condition first, then
resolve without `--child`:

```bash
forged epic resolve --epic "$EPIC_ID" --note "$RESOLUTION_NOTE"
forged epic submit --epic "$EPIC_ID"
```

No external-tracker integration, auto-routing, install action, protocol change,
or implicit default-branch approval is allowed.
