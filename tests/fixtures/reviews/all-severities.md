## Verdict
request-changes

## Summary
Reviewing the diff against the spec. Multiple severity levels surface here.

## Findings

### [BLOCKER] Synchronous DB call inside the request thread
**Where:** `src/cli/cmd/serve.ts:120`
**Evidence:**
```ts
const row = db.prepare("SELECT ...").get(id);
```
**Why:** Blocks the event loop for ~100ms on cold cache.
**Fix:** Move to the worker pool or pre-warm at boot.

### [HIGH] Missing rate-limit on the run endpoint
**Where:** `src/cli/cmd/serve.ts:200-215`
**Evidence:** No middleware between the route and the orchestrator.
**Why:** A single client can spawn 100 reviewer subprocesses in a tight loop.
**Fix:** Reuse the per-PR concurrency guard from saveSpec.

### [MEDIUM] Re-fetch the bundle even when nothing changed
**Where:** `src/web/components/review/ReviewPage.tsx:18`
**Evidence:** The useEffect refetches on every prNum change, even when the bundle is fresh.
**Why:** Adds a needless round trip on mode toggle.
**Fix:** Gate on `bundle == null || stale`.

### [LOW] Typo in the disabled-reason data attribute
**Where:** `src/web/components/review/BatchBar.tsx:14`
**Evidence:** `data-disabled-reason="phase-2"`
**Why:** Should be "phase-3" — Phase 2 already shipped.
**Fix:** Rename.

## Spec Adherence
- ✅ "new POST route is allowlisted" — `src/cli/cmd/serve.ts:1430`
- ⚠️ "findings parsed from forge-review block" — partial; see [BLOCKER] above.

## What I Verified
- [x] Read every changed file
- [x] Confirmed CI passes

## What I Skipped
- Did not run an end-to-end reviewer pass.
