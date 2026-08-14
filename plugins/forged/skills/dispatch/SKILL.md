---
name: dispatch
description: "Submit one complete ready native Bead to Forged for detached provider-neutral execution with a proportional assurance profile, then return immediately with durable status commands. Use when the operator explicitly asks to execute a ready slice or invokes /forged:dispatch."
---

# /forged:dispatch

Hand one reviewed native Bead to the Forged execution control plane. The lead
agent remains the operator-facing controller; Forged freezes the execution
record, runs provider adapters, gates the result, and stops at a reviewed draft
pull request. This skill never merges the default branch.

## Select and verify

Resolve the operator store and canonical target repository. If the operator did
not name an id, query the native repository frontier directly:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
BD_BIN="${BD_BIN:-$(command -v bd)}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" ready \
  --metadata-field "repository=$TARGET_REPO" --json
```

Consider only records whose returned `metadata.repository` exactly matches
that canonical repository.

Read the selected Bead with explicit operator state:

```bash
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" show "$BEAD_ID" \
  --long --include-comments --json
```

Verify:

- complete `description`, `design`, `acceptance_criteria`, and `notes`;
- exact canonical repository metadata;
- no unchecked questions or unresolved critique CRUX;
- no unmet dependency and actual presence on the ready frontier;
- issue type is a reviewable code slice, not an epic or no-diff coordination
  record;
- working tree safety and the repository's configured base branch.

Do not dispatch a record merely because its status text says open.

## Assurance profile

Choose the smallest profile justified by impact and state the choice:

- routine isolated work: standard implementation, deterministic gates, one
  independent review, bounded remediation;
- security, destructive data, concurrency, public compatibility, or similarly
  high-risk work: explicit high-assurance profile with only the additional seats
  needed for those risks.

Review is bounded by the profile's loop budget. Do not add seats or rounds in
search of unanimity.

## Typed handoff

Use the installed Forged CLI's own help when flags differ. The v0.2 handoff is
the following ordered pair, with no spec-file argument:

```bash
PROFILE="${PROFILE:-standard}"
ROSTER="${ROSTER:-default}"
START_JSON="$(
  forged run start --bead "$BEAD_ID" --repo "$TARGET_REPO" \
    --profile "$PROFILE" --roster "$ROSTER"
)"
RUN_ID="$(printf '%s' "$START_JSON" | jq -er '.result.run_id')"
forged run submit --run "$RUN_ID"
```

Capture the immutable run id returned by `start`; submit that exact id. Do not
modify the Bead or repository between freeze and submit. A successful submit is
detached: do not poll in this turn.

## Return to the operator

Report the Bead id, run id, repository, frozen profile, base and work branch if
shown, then include these concrete read-only reconnect commands:

```bash
forged overview --run "$RUN_ID"
forged run status --run "$RUN_ID"
forged session list --run "$RUN_ID"
forged events --run "$RUN_ID" --limit 100
```

When `session list` reports a live Herdr-backed attempt, read its recent output
using that returned attempt id:

```bash
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

Explain the terminal contract: a reviewed draft PR or an explicit
input-required stop. A slice has no generic `resolve` command: report the exact
blocker and its typed remedy rather than blindly resubmitting or starting a
replacement run.

No auto-routing, external-tracker synchronization, background watch loop,
install step, or protocol change belongs here. Never approve or merge the
default branch.
