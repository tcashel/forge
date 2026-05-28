## Verdict
block

## Summary
This PR adds a new sessions feed and runner session recording. I reviewed the full diff against the linked spec; local tests pass and lint exits 0, but several acceptance criteria are not met and an existing log-format guarantee is broken.

## Findings

### [BLOCKER] Sessions cannot resolve their plan or render outputs
**Where:** `src/cli/cmd/serve.ts:1068`
**Evidence:** `resolvePlanRefForRow()` sends `purpose === "synthesis"` through `lookupPlanIdViaCritique(store, row.id)`, but the session id is never stored in `critic_runs.session_id`.
**Why:** The spec explicitly requires plan linkage via `critic_syntheses.session_id` or `sessions.metrics.planId`. As written, synthesis rows have `plan: null`.
**Fix:** Either add `critic_syntheses.session_id` and resolve through it, or stash `metrics.planId` on the synthesis session.

### [BLOCKER] Promotion never updates drafting sessions with the new plan id
**Where:** `src/cli/cmd/serve.ts:1615-1617`
**Evidence:** Promotion only aborts in-flight work and moves the history file; there is no update to `sessions.metrics.planId` for `related_id = draftId`.
**Why:** Without it, promoted draft activity remains unlinked and the Activity table keeps showing the draft slug.
**Fix:** In the promote path, update matching drafting session metrics to include `planId`.

### [HIGH] Activity view is squeezed into the old detail column
**Where:** `src/web/components/App.tsx:43-45`
**Evidence:** Activity mode renders only a `detail-pane`; `.detail-pane` is assigned to the `detail` grid area.
**Why:** The spec calls for a top-level Activity view with table + detail pane.
**Fix:** Give activity mode its own workspace layout.

## Spec Adherence
- ⚠️ AC1 drafting session rows: workbench writes `purpose='drafting'`; promotion linkage is broken.
- ✅ AC2 critique/synthesis rows: deterministic ids are written.

## What I Verified
- [x] Read every changed file
- [x] Compared implementation against acceptance criteria

## What I Skipped
- Did not run a live forge launch.
