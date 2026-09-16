---
title: Inspect and recover
description: Find what needs attention, inspect evidence for one run, and use the recommended recovery action.
---

Start with the durable record. A live terminal, a process, or an `active` label
alone cannot tell you whether useful work is running or whether a PR is ready.

## Find what needs you

From your target repository:

```sh
forged next --repo "$PWD"
```

The view puts decisions first, followed by running work, ready work, recent
deliveries, and counts of hidden symptoms or parked work. Running work includes
stage and progress evidence; missing verification stays visible.

Use an exact ID from that response for the next read:

```sh
forged explain --id "$WORK_ID"
```

An explanation combines lifecycle position, health inputs, and available
actions. Its action classes have specific meanings:

| Class | Meaning |
| --- | --- |
| `should` | The one recommended next action, when a decision requires one. |
| `can` | An optional action, with its conditions. |
| `repair` | A recovery action for state that cannot resolve itself. |

Use the action's returned ID and arguments. Titles and visible panes are
descriptions, not selectors for a mutation. When no `should` is present, the
subject may be terminal or idle; there is no required action to invent.

## Inspect the evidence you need

```sh
forged run status --run "$RUN_ID"
forged work show --id "$WORK_ID" --full
forged usage --run "$RUN_ID"
```

Read the gate verdict and the code revision it checked, the reviewers'
findings, the delivery identity, and any remaining decision. An attempted or
settled gate operation is not proof of a passed gate. Likewise, a draft PR is
not evidence that the default branch has been merged.

For a Herdr-backed attempt, inspect a bounded pane tail:

```sh
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

Process-backed attempts have no readable Herdr pane. Use `run status` and the
run's recorded artifacts for those attempts.

Recorded costs distinguish provider-billed amounts from rate-card estimates.
Missing cost remains unknown; it is not zero. Use
`forged usage --repo "$PWD" --models` to compare recorded role, model, and
effort groups on that repository.

## Wait for a change

```sh
forged wait --id "$WORK_ID" --until decision --timeout 240
```

Choose `stage` or `terminal` instead of `decision` when that is the condition
you need. A timeout can return `changed: false`; it does not mean the run
failed. A single bounded wait replaces repeated status polling.

For a human watching a terminal, `forged next --follow` refreshes the view.
Use `--symptoms` to expose hidden operational trouble, or
`--section decisions --limit 50` to widen one section deliberately.

## Recover from a stop

Repair the condition described by the current explanation before taking its
recommended action. Common cases are:

| Condition | Response |
| --- | --- |
| A seat proposes a spec amendment | Review the evidence, update and adjudicate the work as needed, then retry for `spec-amended`. |
| The environment or authentication changed | Repair the environment, then follow the returned reopen or `world-changed` retry action. |
| A merge conflict requires new work | Follow the returned `rebase` retry action after checking the affected branch. |
| A child holds an epic for input | Resolve its specification and decisions, then use the exact `epic resolve` action. |
| The review budget is exhausted | Review the remaining findings and choose an explicit disposition. Do not silently add more review rounds. |

A retry creates a successor run on the same work item. It preserves the
source run's outcome and history:

```sh
forged run retry --id "$RUN_ID" --because world-changed
```

Implementation may be reusable when Forge can prove its recorded revision,
heads, and execution contract still match the permitted recovery path.
Successor gates and independent review run afresh. A historical pass does not
validate the new run.

## Read structured refusals

A refused operation can include an `error.detail.remedy` with a verb,
arguments, and reason. Fill any required arguments from verified evidence and
retry only the refused operation when its preconditions are met.

| Refusal | Next step |
| --- | --- |
| `OPERATION_IN_PROGRESS` | Inspect the advertised `reconcile` remedy for the held operation. |
| `BEADS_CONTENTION` | The epic scheduler currently holds the control lease. Observe status, back off, and retry the refused control verb. |
| `SPEC_DRIFT` | Re-read the current work specification and revision. |
| `INVALID_REQUEST` | Fix the named field or prerequisite, such as a repository or base branch mismatch. |
| `ADJUDICATION_REQUIRED` | Resolve the stated evidence gap before considering the exceptional settlement operation. |

Do not edit the SQLite ledger or frozen packages to force progress. Use the
typed operation and inspect the durable readback. The
[agent runbook](https://github.com/tcashel/forge/blob/main/docs/DRIVING.md)
describes retry reuse, deadline failures, messaging, and settlement in detail.
