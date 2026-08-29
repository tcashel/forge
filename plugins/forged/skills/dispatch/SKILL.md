---
name: dispatch
description: "Submit one complete ready ledger-native ore work item to Forged for detached provider-neutral execution with a proportional assurance profile, then return immediately with durable status commands. Use when the operator explicitly asks to execute a ready slice or invokes /forged:dispatch."
---

# /forged:dispatch

Position: reviewed ready slice -> immutable run start and submit. Next: Forged
drives the run to a reviewed draft PR or an explicit input-required stop.

Boundary: the lead session selects, verifies, and explicitly hands off one work
item. After submit, Forged owns provider attempts, the durable controller,
gates, and ledger evidence. The lead remains operator-facing and no skill ever
merges the default branch.

## Select and verify

Resolve the canonical target repository. If the operator did not name an id,
read the complete native frontier and select only from that exact repository.
The default limit is 100 and the maximum is 500. Each `result.ready` entry is a
summary row containing only `id`, `title`, `kind`, `status`, `priority`,
`repository`, and `revision`, never specification bodies. Compare
`result.totals.shown` with `result.totals.total`, raise `--limit` to the reported
total when truncated, and fail closed if the total exceeds 500. Fetch each
candidate's full specification by id:

```bash
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
READY_LIMIT=100
while :; do
  READY_JSON="$(forged work ready --repo "$TARGET_REPO" --limit "$READY_LIMIT")" || exit 1
  READY_SHOWN="$(printf '%s' "$READY_JSON" | jq -er '.result.totals.shown')" || exit 1
  READY_TOTAL="$(printf '%s' "$READY_JSON" | jq -er '.result.totals.total')" || exit 1
  [ "$READY_SHOWN" -eq "$READY_TOTAL" ] && break
  if [ "$READY_TOTAL" -gt 500 ]; then
    printf 'ready frontier exceeds maximum limit: %s\n' "$READY_TOTAL" >&2
    exit 1
  fi
  READY_LIMIT="$READY_TOTAL"
done
while IFS= read -r READY_ID; do
  forged work show --id "$READY_ID"
done < <(printf '%s' "$READY_JSON" | jq -r '.result.ready[].id')
```

Read the selected record and its outgoing dependencies again immediately before
the execution gate:

```bash
forged work show --id "$WORK_ID"
```

Verify:

- complete `description`, `design`, `acceptanceCriteria`, and `notes`;
- exact canonical `metadata.repository`;
- no unchecked questions or unresolved critique CRUX;
- no unmet `blocks` edge and actual presence on the ready frontier;
- kind is a reviewable task, not an epic or no-diff coordination record;
- working-tree safety and the repository's configured base branch.

If `notes` contains critique output, every finding, recommendation, CRUX, and
open question must have an explicit disposition. Each accepted item must be
folded into the normative fields; each rejected item must retain its reason.
Checkbox-free critique prose is not evidence of adjudication. Any critique
output without those dispositions makes the record nondispatchable: return it
to `/forged:adjudicate` before any run start. Keep the unchecked-checkbox gate
in addition to this disposition check.

Do not dispatch a record merely because its status text says open.

## Assurance profile

Choose the smallest profile justified by impact and state the choice:

- routine isolated work: standard implementation, deterministic gates, one
  independent review, bounded remediation;
- security, destructive data, concurrency, public compatibility, or similarly
  high-risk work: explicit high assurance with only the seats needed for those
  risks.

Review is bounded by the profile's loop budget. Do not add seats or rounds in
search of unanimity.

## Typed handoff

Use the current installed CLI help if flags differ. The current ordered pair
has no spec-file argument. Its run-start work-item flag is named `--work`;
the persisted operation-envelope key remains the historical `bead` contract:

```bash
PROFILE="${PROFILE:-standard}"
ROSTER="${ROSTER:-default}"
START_JSON="$(
  forged run start --work "$WORK_ID" --repo "$TARGET_REPO" \
    --profile "$PROFILE" --roster "$ROSTER"
)"
RUN_ID="$(printf '%s' "$START_JSON" | jq -er '.result.run_id')"
forged run submit --run "$RUN_ID"
```

Capture the immutable run id returned by `start`; submit that exact id. Do not
modify the work item or repository between freeze and submit. A successful
submit is detached: do not poll in this turn.

## Return to the operator

Report work-item id, run id, repository, frozen profile, base, and work branch
if shown, then include these concrete read-only reconnect commands:

```bash
forged overview --run "$RUN_ID"
forged run status --run "$RUN_ID"
forged session list --run "$RUN_ID"
forged events --run "$RUN_ID" --limit 100
```

When session inventory reports a live attempt, use its returned id:

```bash
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

Explain the terminal contract: a reviewed draft PR or an explicit
input-required stop. A slice has no generic `resolve` command; report the exact
blocker and typed remedy instead of blindly resubmitting. After the requested
decision or an in-place Work amendment, `forged run retry --id "$RUN_ID"`
mints and submits a fresh successor on that same Work. Use `work supersede`
only when a new Work item must replace the specification; never reconstruct the
old stop/create/supersede/start/submit dance for a same-Work retry.

## Never

- Do not auto-route, synchronize an external tracker, install software, add a
  background watch loop, or change protocol.
- Do not mutate the work item between start and submit.
- Do not approve or merge the default branch.
