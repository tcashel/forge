---
name: dispatch
description: "Submit one complete ready ledger-native ore to Forged for detached provider-neutral execution with a proportional assurance profile, then return immediately with durable status commands. Use when the operator explicitly asks to execute a ready slice or invokes /forged:dispatch."
---

# /forged:dispatch

Lifecycle position: adjudicated ready ore → immutable slice run. Next: observe
the detached run until it yields a reviewed draft PR or explicit
input-required stop. Selection and approval happen in the lead session;
after `run submit`, Forged owns execution, controllers, provider attempts,
gates, and durable evidence. The lead agent remains the operator-facing
controller and never merges the default branch.

## Select and verify

Resolve the canonical repository. If the operator did not name an id, read the
ledger-native frontier and filter it to that exact repository:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged work ready |
  jq --arg repo "$TARGET_REPO" \
    '.result.ready[] | select(.metadata.repository == $repo)'
```

Read the selected ore and its hydrated dependencies:

```bash
forged work show --id "$ORE_ID"
```

Verify:

- complete `description`, `design`, `acceptanceCriteria`, and `notes`;
- exact canonical `metadata.repository`;
- no unchecked question or unresolved critique CRUX;
- no unmet `blocks` dependency and actual presence on `work ready`;
- kind is `task`, not an epic or no-diff coordination record;
- working-tree safety and the repository's configured base branch.

Do not dispatch merely because status says open.

## Assurance profile

Choose the smallest profile justified by impact and state the choice:

- routine isolated work: standard implementation, deterministic gates, one
  independent review, and bounded remediation;
- security, destructive data, concurrency, public compatibility, or similarly
  high-risk work: explicit high assurance with only the additional seats
  needed for those risks.

Review is bounded by the profile's loop budget. Do not add seats or rounds in
search of unanimity. Resolve the exact selection before starting:

```bash
PROFILE="${PROFILE:-standard}"
ROSTER="${ROSTER:-default}"
forged definition validate --profile "$PROFILE" --roster "$ROSTER"
```

## Typed handoff

The current run CLI retains `--bead` as the work-id selector; pass the
ledger-native ore id there. The ordered handoff contains no spec-file argument:

```bash
START_JSON="$(
  forged run start --bead "$ORE_ID" --repo "$TARGET_REPO" \
    --profile "$PROFILE" --roster "$ROSTER"
)"
RUN_ID="$(printf '%s' "$START_JSON" | jq -er '.result.run_id')"
forged run submit --run "$RUN_ID"
```

Capture the immutable run id returned by `start` and submit that exact id.
Do not modify the work item or repository between freeze and submit. A
successful submit is detached: return to the operator without polling.

## Return to the operator

Report the ore id, run id, repository, frozen profile and roster, base, and
work branch if shown. Include these concrete read-only reconnect commands:

```bash
forged overview --run "$RUN_ID"
forged run status --run "$RUN_ID"
forged session list --run "$RUN_ID"
forged events --run "$RUN_ID" --limit 100
```

When `session list` reports a live Herdr-backed attempt, read recent output
using the returned attempt id:

```bash
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

The terminal contract is a reviewed draft PR or an explicit input-required
stop. A slice has no generic resolve command: report the exact blocker and its
typed remedy rather than blindly resubmitting or starting a replacement run.

No auto-routing, external-tracker synchronization, background watch loop,
install step, or protocol change belongs here. Never approve or merge the
default branch.
