---
name: run-epic
description: "Submit a locked native Beads epic to Forged for durable wave execution, mechanically integrate clean child slices, and stop at one draft PR to the default branch or an explicit input-required state. Use when the operator explicitly invokes /forged:run-epic."
---

# /forged:run-epic

Position: locked epic → execution handoff. Next: durable detached execution
under Forged's controller. After: adjudicate the one draft PR.

Hand a reviewed native epic and its child graph to Forged. Forged freezes the
inventory, profile, roster, repository, and integration strategy, then performs
durable wave execution. The lead agent remains responsible for operator
conversation and final judgment.

## Preflight — one read-only command

`forged epic preflight` rehearses every check `epic start` will enforce and
returns the identity tuple a start would freeze, creating nothing:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged epic preflight --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --profile "${PROFILE:-standard}" --roster "${ROSTER:-default}" --rolling
```

The report's `checks` cover the repository checkout, base ref (a **bare**
branch name existing on origin — never `origin/main`), epic bead shape,
child spec completeness vs honest planning stubs, definition and rolling
package compiles, provider binaries, and `gh` auth. Fix every `ok: false`
check before starting; each failure names its cause.

Show the operator the returned `identities` tuple for approval before the
mutating start: normalized `baseRef`, `integrationBranch`, `assuranceStage`,
and each child's `runId`, `branch`, and `worktreePath`.

For judgment calls the checklist cannot make — real dependencies only, no
unresolved epic-level question or critique CRUX — use bounded reads
(`bd show "$EPIC_ID" --json`, `bd children "$EPIC_ID" --json`), never
`--long --include-comments` recursion, which expands full parent and
dependency records past host output budgets.

## Freeze a proportional profile

Use standard assurance for ordinary code slices: deterministic gates, one
independent review, and a bounded remediation loop. Escalate only the specific
children or seams whose security, data, concurrency, or compatibility risk
warrants more. The profile's loop budget is the stopping rule.

## Typed handoff

The v0.2 ordered handoff contains no spec-file argument:

```bash
forged epic start --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --profile "${PROFILE:-standard}" --roster "${ROSTER:-default}" --rolling
forged epic submit --epic "$EPIC_ID"
```

The start output must match the approved preflight identities. Submit the
exact epic id and return immediately; do not build a second watcher loop
around the durable controller.

## Execution and terminal boundary

Forged may auto-merge only mechanically clean, accepted child slices into the
epic integration branch. It must reconcile later-wave stubs with merged reality
before dispatch. It must not merge the default branch.

The terminal result is exactly one draft integration-to-default PR with evidence
for human adjudication, or an explicit input-required stop naming the failed
gate, exhausted budget, stale assumption, conflict, or missing authority.

Report the epic id, frozen children and waves, profile, integration/default
branches, and controller identity, then include these concrete read-only
reconnect commands:

```bash
forged overview --epic "$EPIC_ID"
forged epic status --epic "$EPIC_ID"
forged events --run "$EPIC_ID" --limit 200
```

Use the child run id returned by epic status to inspect an active provider
session. Use the attempt id returned by session list for the Herdr pane read:

```bash
forged session list --run "$CHILD_RUN_ID"
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

## Recovery

- `restart-budget-exhausted` attention: read the recorded failure in
  `epic status` / the attention item's detail, fix that cause, then resubmit
  the same epic id — `forged epic submit --epic "$EPIC_ID"` mints the next
  control revision and resets the restart budget. Resubmitting without
  fixing the recorded failure repeats it.
- `BEADS_CONTENTION` from `epic advance`: a live detached controller already
  drives the epic. Observe with `epic status`; do not drive.

When `inputRequired.childId` names a child, first update and adjudicate that
child's native Bead fields. Then clear only that recorded hold and submit the
next detached controller generation:

```bash
forged epic resolve --epic "$EPIC_ID" --child "$CHILD_ID" \
  --note "$RESOLUTION_NOTE"
forged epic submit --epic "$EPIC_ID"
```

For an input requirement that names no child (for example
`integration-setup-failed`, raised when the integration branch cannot be
pushed), fix the underlying condition first, then resolve the epic-level hold
by omitting `--child`:

```bash
forged epic resolve --epic "$EPIC_ID" --note "$RESOLUTION_NOTE"
forged epic submit --epic "$EPIC_ID"
```

No external-tracker integration, auto-routing, install action,
protocol change, or implicit default-branch approval is allowed.
