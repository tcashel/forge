# ADR 0027 — Publish PR review findings to GitHub and resolve on fix

**Status:** Accepted (clarified by [`0031-review-publish-at-least-once-persisted-state`](./0031-review-publish-at-least-once-persisted-state.md) — drops the never-implemented `publishReviewToGitHub` config gate, makes delivery at-least-once with persisted state)
**Deciders:** Tripp
**Date:** 2026-05-31
**Related:** [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`../SCHEMA.md`](../SCHEMA.md)

## Context

The PR-page ad-hoc reviewer (`runReviewWorker`) writes its findings to a local
`findings.json` and renders them only inside Forge. That makes the review
invisible to the people and agents who actually live on the PR — human
reviewers, CodeRabbit, a Cursor cloud agent. Forge's comment-fixer can fix a
finding, but there's no durable, PR-side trail of what was raised, what got
fixed, and what was disputed.

We want Forge findings to land on the PR as **GitHub inline review comments**
so the review history is durable and readable by anyone, while keeping
publishing **idempotent** (re-running a review must not duplicate comments) and
**stateless** (no new local mapping table — GitHub is the store of record for
what's published).

Constraints we already know:
- `gh api` does not template `{owner}/{repo}` and does not infer an enterprise
  host the way `gh pr view` does, so each write must resolve `{ ownerRepo,
  apiHost }` the way `fetchPrBundle` does.
- Inline comments off the diff hunks 422 the whole review; findings must be
  partitioned into in-diff (inline) and out-of-diff (review body) before posting.
- Resolving a thread needs the GraphQL thread node id, not the REST comment id.

## Options

### A — Local mapping table (SQLite) of finding-id → comment-id

**Pros:**
- O(1) reconciliation; no parsing.

**Cons:**
- New schema + migration; drifts from GitHub truth when comments are deleted
  out-of-band; another store to keep consistent across the Track A → B move.

### B — Embedded marker, GitHub as the store of record (chosen)

**Pros:**
- Stateless: a hidden `<!-- forge-finding id=… sev=… v=1 -->` marker on each
  published comment/body is parsed back on re-run to know what's published.
- Interoperable: any agent can read the marker; nothing Forge-private.

**Cons:**
- Reconciliation costs a comments+reviews fetch and a parse on each publish.
- Marker must stay stable (hence the `v=1` version field).

## Decision

Publish PR-page ad-hoc review findings as GitHub inline review comments, each
embedding a stable hidden marker, and reconcile statelessly by parsing markers
off the PR's existing comments and review bodies. When the comment-fixer fixes
a published finding, resolve its GitHub review thread; when it disputes one,
reply with the reason and leave the thread open.

**Rationale:** The marker keeps the feature stateless and interoperable and
avoids a schema change this early. GitHub is already the durable surface we
want the trail to live on.

**Risks to monitor:**
- Diff-position anchoring is fragile — partition before posting or GitHub 422s.
- A moving head commit can reject line anchors — anchor against the
  `headRefOid` fetched in the same pass.
- GraphQL/REST id mismatch — the thread node id is required to resolve.

## Consequences

- New modules: `src/core/forge-comment-marker.ts` (marker contract),
  `src/core/diff-anchoring.ts` (in/out-of-diff partition), and
  `src/core/gh-pr-write.ts` (write helpers + idempotent publish), all routing
  through the single `runGh` gh-spawn path (extended with an `inputJson`
  stdin seam).
- Publishing is **opt-in, default off**: it requires BOTH
  `repoConfig.publishReviewToGitHub === true` and a per-request
  `publishToGitHub` that survives the detach via the session metrics blob.
  With the flag off, behavior is byte-for-byte unchanged and no GitHub writes
  occur.
- The review-bundle endpoint de-dups a finding whose id appears in an inline
  comment marker (one row, not two) and surfaces `{ forgeFindingId,
  reviewThreadId, isResolved }` for it.
- `ValidationFileEntry` gains `ghResolved` so the fix worker's resolution is
  persisted and surfaced.

## Non-goals locked by this ADR

- **No bot identity / GitHub App.** Comments post under the operator's
  configured `ghTarget` identity. A dedicated bot account is a future/Track B
  concern.
- **No publishing of launch auto-review findings.** Posting + resolving in the
  same headless run is pure PR churn; scope is the PR-page ad-hoc review only.
- **No new SQLite table.** Reconciliation is via the embedded marker.
