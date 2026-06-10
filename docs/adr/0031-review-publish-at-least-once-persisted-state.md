# ADR 0031 — Review publishing is at-least-once with persisted per-finding state

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-06-09
**Related:** [`0027-publish-pr-review-findings-to-github`](./0027-publish-pr-review-findings-to-github.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`../ROADMAP.md`](../ROADMAP.md)

## Context

ADR-0027 made publishing idempotent (hidden markers, GitHub as store of record)
but left delivery **best-effort and invisible**: `publishReviewFindings`'s result
was discarded by the worker, every failure path ended as a log line in a detached
`agent.log`, and the session finalized `completed` regardless. The 2026-06
hardening audit ([`../experiments/2026-06-hardening-audit.md`](../experiments/2026-06-hardening-audit.md))
confirmed this as the operator's top pain: findings that never reach the PR with
no signal anywhere, and no retry path. Two further gaps compounded it: the
`repoConfig.publishReviewToGitHub` gate ADR-0027 specified was never implemented
(the only gate is a default-off Workbench checkbox), and one bad inline anchor
422s the whole batched review POST, sinking every finding at once.

F0's bar ("no silent failure"; every finding either lands on the PR or surfaces
as a loud, actionable failure) requires publish delivery to be a first-class,
persisted state machine — not a fire-and-forget side effect.

## Decision

Publishing review findings to GitHub is **at-least-once with persisted
per-finding state**:

1. **Publish record.** Every review run writes a `publish.json` artifact in its
   run dir (`src/core/publish-record.ts`): overall state (`published | partial |
   failed | nothing-new | not-requested | reconcile-failed`) plus a per-finding
   outcome (`posted | already-published | out-of-diff-posted | failed`, with the
   error text). A compact summary is stamped into the session metrics blob, and
   a requested-but-failed publish sets the session's error field so `forge
   status`, the review history API, and the Workbench all show it loudly.
2. **Per-finding fallback.** When the batched review POST fails, findings are
   re-posted individually; an anchoring failure falls back to an out-of-diff
   body mention. One bad anchor can no longer sink the batch. Idempotency via
   ADR-0027's markers is what makes retries safe.
3. **Retry is a first-class verb.** `forge review <pr> --publish-only` (and a
   Workbench retry action) re-runs the idempotent publish from the latest
   `findings.json` at any time.
4. **Headless invocation exists.** `forge review <pr> --run [--publish]`
   executes the reviewer end-to-end from the CLI — the Workbench checkbox is no
   longer the only path. Launch auto-review findings are extracted to
   `findings.json` (lighting up the previously dead launch bucket), making them
   publishable via the same retry verb; auto-publishing them mid-run remains
   out of scope (ADR-0027's churn argument stands).
5. **The config gate is dropped, not implemented.** Supersedes ADR-0027's
   dual-gate: the per-request opt-in (checkbox / `--publish` flag) is the only
   gate. A never-implemented config key that docs claim exists is worse than no
   key; one explicit gate is enough for a single-operator tool.

**Risks to monitor:**
- Individual-POST fallback multiplies API calls on systemically failing PRs —
  acceptable at single-operator scale; revisit if rate limits bite.
- Finding ids hash `lineStart`, so line shifts between re-reviews create new ids
  and can duplicate comments next to resolved threads. Known, deferred — needs a
  marker `v=2` + fuzzy reconciliation pass of its own.

## Consequences

- `PublishResult` carries per-finding outcomes; `ReviewRunSummary`/
  `ReviewRunDetail` expose the publish record; the Workbench renders a publish
  state chip with the failure text and a retry affordance.
- `runGh` returns stderr and a timed-out flag so publish failures are
  diagnosable ("could not resolve owner/repo", HTTP body, "timed out after
  20000ms") instead of `unknown`.
- The head commit is re-checked immediately before posting; a moved head
  re-fetches the diff and re-partitions instead of posting stale anchors.
- Sections of ADR-0027 superseded: the `publishReviewToGitHub` repo-config gate
  (Consequences) and the implicit best-effort delivery posture. The marker
  contract, partition rules, and non-goals (no bot identity, no new SQLite
  table) remain in force.
