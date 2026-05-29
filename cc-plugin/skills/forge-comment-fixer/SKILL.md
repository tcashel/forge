---
name: forge-comment-fixer
description: "Activates when an operator selects PR inline comments in the Forge review UI and clicks 'Fix N selected'. Validates each selected comment against the current code, then surgically fixes only the comments judged valid. Used by the forge __comment-fix-worker pipeline."
---

# Forge Comment Fixer

You are fixing a pull request based on a curated subset of reviewer comments
that an operator selected from the Forge review UI. The fixes are validate-
then-apply: for every comment the operator asked you to address, you must
first decide whether the comment is actually actionable against the current
code, then make a code change only for the ones you judged `valid`.

## What the harness gave you

- The PR diff (`gh pr diff`) — what this PR changes against its base.
- The linked Forge spec body (when one exists) — the contract the PR is
  meant to satisfy. Treat it as the source of truth when a comment
  contradicts it.
- A list of **selected inline comments**, each with:
  - `id` — the GitHub comment id (an integer)
  - `path` and `line` — where the comment was anchored
  - `body` — the comment text
  - `commitId` — the commit the comment was written against
  - `currentHunk` — the diff hunk surrounding the anchor as it exists in the
    worktree at HEAD, or `null` if the anchor cannot be resolved

The worktree is already on the PR head branch and is clean. Your edits land
on that branch and are committed + pushed by the worker after you return.

## Phase 1 — emit a validation block (mandatory, first)

Before changing any files, print a single fenced block tagged
`forge-comment-validation`. Inside the block, write **one JSON object per
line** with this exact schema:

```forge-comment-validation
{"commentId": 12345, "verdict": "valid", "reason": "Anchor matches; the rename is a one-line change."}
{"commentId": 12346, "verdict": "disputed", "reason": "Comment asks for a refactor outside the diff scope."}
```

Rules:

- Emit **exactly one entry per selected comment id**. Do not skip any.
- `verdict` must be `"valid"` or `"disputed"`. There is no third option.
- `reason` must be a non-empty sentence explaining the decision.
- Auto-mark `disputed` (with reason `"comment anchor is stale"`) any
  comment whose `currentHunk` is `null`, or whose `commitId` is not
  reachable from the worktree HEAD.
- The block must come **before** any file edits.
- Do not print more than one `forge-comment-validation` block. If you need
  to revise a decision, do it before closing the block.

### What counts as `disputed`

- The comment asks for a behavior change that contradicts the Forge spec.
- The comment asks for work outside the diff scope (refactor, new feature,
  unrelated test additions, sweeping renames).
- The anchor is stale (`currentHunk` is null, or the code at the anchor has
  already been rewritten and the comment no longer applies).
- The comment is a question or remark, not an actionable request.
- Honoring the comment would obviously break a passing test or quality gate.

### What counts as `valid`

- The comment names a concrete bug, regression, contract violation, or
  obvious nit that can be fixed surgically against the current code.
- The fix is local to the file/line the comment anchors to.
- A reasonable reviewer would expect this exact change.

When in doubt between the two, prefer `disputed` with a clear reason — the
operator can re-select and re-run if they disagree.

## Phase 2 — fix the `valid` comments (only)

After the validation block, edit only the files needed to address the
`valid` comments. Obey the **forge-fixer scope rules**:

- Fix `valid` comments only. Never modify code in response to a `disputed`
  comment — even if you privately think the comment is half-right.
- Change only what the comment requires. No refactors, no opportunistic
  cleanups, no new features.
- Do not change public APIs unless the comment explicitly demands it.
- Do not add tests unless a comment specifically calls out a missing test.
- Do not touch unrelated files.

When a `valid` comment requires a product decision you cannot make,
leave a `// TODO(review): <what's ambiguous>` at the relevant line and
move on — do not block the whole batch on one ambiguous comment.

## What you must NOT do

- Do not run `git add`, `git commit`, or `git push` — the worker handles
  staging, committing, and pushing after you exit.
- Do not run `git add -A` (the worker stages specific changed files).
- Do not run the quality commands yourself — the worker runs them.
- Do not write a PR summary file.
- Do not emit a second `forge-comment-validation` block.
- Do not start editing before the validation block is closed.

## Output shape recap

```text
... your reasoning, if any ...

```forge-comment-validation
{"commentId": <int>, "verdict": "valid" | "disputed", "reason": "<text>"}
... one line per selected comment ...
```

... then your file edits ...
```

That's it. Be terse.
