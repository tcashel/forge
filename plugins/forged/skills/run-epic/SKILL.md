---
name: run-epic
description: "Submit a locked native Beads epic to Forged for durable wave execution, mechanically integrate clean child slices, and stop at one draft PR to the default branch or an explicit input-required state. Use when the operator explicitly invokes /forged:run-epic."
---

# /forged:run-epic

Hand a reviewed native epic and its child graph to Forged. Forged freezes the
inventory, profile, roster, repository, and integration strategy, then performs
durable wave execution. The lead agent remains responsible for operator
conversation and final judgment.

## Verify the epic before handoff

Using explicit `BEADS_DIR`, read the epic and its native children, dependencies,
comments, and repository metadata. Require:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
BD_BIN="${BD_BIN:-$(command -v bd)}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" show "$EPIC_ID" \
  --long --include-comments --json
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" children "$EPIC_ID" --json
```

- native type `epic` and a complete integrated-outcome specification;
- every child linked through the native parent edge;
- identical canonical `metadata.repository` on epic and children;
- full specifications for the executable frontier;
- honest blocked stubs for later waves, with assumptions and dependency edges;
- no unresolved epic-level question or critique CRUX;
- real dependencies only, with independent siblings left parallel;
- a clean target worktree and explicit integration/default branch strategy.

The epic itself need not appear on `bd ready`; readiness is evaluated on its
child frontier. Reject an inventory that exposes an incomplete stub as ready or
that references a parallel spec file.

## Freeze a proportional profile

Use standard assurance for ordinary code slices: deterministic gates, one
independent review, and a bounded remediation loop. Escalate only the specific
children or seams whose security, data, concurrency, or compatibility risk
warrants more. The profile's loop budget is the stopping rule.

## Revision-bound typed handoff

Consume the exact observed epic revision and strict
`forged-execution-approval/2` scratch file supplied by the execution gate,
including the exact approved base SHA and definition digests. Do not write
approval to a Bead comment. The ordered handoff contains no spec-file argument:

```bash
PROFILE="${PROFILE:-standard}"
ROSTER="${ROSTER:-default}"
: "${OBSERVED_REVISION:?exact approved epic revision is required}"
: "${APPROVAL_FILE:?strict execution approval JSON is required}"
forged epic start --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --profile "$PROFILE" --roster "$ROSTER" \
  --expected-bead-revision "$OBSERVED_REVISION" \
  --approval "$APPROVAL_FILE"
forged epic submit --epic "$EPIC_ID"
```

The start atomically checks the epic id, revision, repository, base ref and
remote SHA, exact profile/roster/package content, and `epic-start-submit`
action, then retains that approval with the frozen epic.
`EXECUTION_APPROVAL_MISMATCH` creates no new epic or external effect: stop for
a fresh tuple and never retry unguarded. Use output from `start` to verify the
frozen inventory and branches before submitting. Submit the exact epic id and
return immediately; do not build a second watcher loop around the durable
controller.

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

When `inputRequired.childId` names a child, first update and adjudicate that
child's native Bead fields. Then clear only that recorded hold and submit the
next detached controller generation:

```bash
forged epic resolve --epic "$EPIC_ID" --child "$CHILD_ID" \
  --note "$RESOLUTION_NOTE"
forged epic submit --epic "$EPIC_ID"
```

Do not invoke `epic resolve` for an input requirement that names no child; report
that global blocker because the current typed command deliberately requires a
child id. No external-tracker integration, auto-routing, install action,
protocol change, or implicit default-branch approval is allowed.
