# Verdict — How to Decide approve / request-changes / block

Loaded by `forge-reviewer` after you've classified all findings. Produces the single overall verdict that goes at the top of the `forge-review` block.

The verdict is what downstream automation acts on. Get it right.

## The three verdicts

### `approve`

The PR is mergeable. Use when **all** of:

- Zero `BLOCKER` findings
- Zero `HIGH` findings
- All Acceptance Criteria from the spec are met (if a spec exists)
- CI is green, or you've explicitly noted a flaky check that's acceptable
- You actually read every changed file (not just the diff summary)

`MEDIUM` and `LOW` findings are allowed under `approve` — they're feedback, not gates. List them so the author can address in a follow-up.

### `request-changes`

The PR has issues that must be fixed, but the diff is the right shape and the author should iterate on it rather than starting over. Use when:

- One or more `HIGH` findings, **or**
- A small number of `BLOCKER` findings that are localized fixes (e.g. one wrong error class, one missing validation)
- Spec criteria mostly met, with specific gaps

This is the most common verdict for non-trivial changes. It's not punitive — it's "you're 90% there, here's the last 10%".

### `block`

The PR has fundamental problems. Either:

- Multiple `BLOCKER` findings spread across the diff, indicating the approach is wrong
- The implementation diverges from the spec in ways that suggest the spec was misread
- Security or data-integrity issue that requires a redesign, not a patch
- CI is failing for non-trivial reasons caused by this PR

`block` is rare. When in doubt between `block` and `request-changes`, prefer `request-changes` and explain in the summary that the gap is wide.

## The decision tree

```
Are there any BLOCKER findings?
├── No
│   └── Are there any HIGH findings?
│       ├── No
│       │   └── Are all spec criteria met (if spec exists)?
│       │       ├── Yes → approve
│       │       └── No  → request-changes (note which criteria)
│       └── Yes → request-changes
└── Yes
    └── Are the BLOCKERs localized (one or two specific lines)?
        ├── Yes → request-changes (so the author iterates)
        └── No  → block (the approach needs rework)
```

## What goes in the `Summary` section

2–4 sentences. The summary should let a busy human decide whether to read the rest of the review. Cover:

- **What this PR does** in one sentence (paraphrased from the title or spec, not from the PR description verbatim).
- **What you actually checked** — the spec, the diff, the tests, CI.
- **Why this verdict** — the load-bearing finding(s), or the absence of any.

Examples:

> ✅ "Adds Redis-backed caching to user session lookup as specified. Verified all four acceptance criteria are met, the new tests cover hit/miss/expiry/validation paths, and CI is green. No findings above LOW. Approving."

> ✅ "Implements session caching but uses a generic `Error` class instead of the spec's `ValidationError`, and the expiry-path test is missing. Both are localized fixes. Requesting changes — the diff is otherwise sound."

> ❌ "LGTM!" (Says nothing. Not a verdict, not a summary.)

## What goes in `What I Verified`

Honesty checklist. Tick what you actually did:

- [x] Read every changed file (not just the diff summary)
- [x] Compared against spec Acceptance Criteria, criterion by criterion
- [x] Confirmed CI status with `gh pr checks`
- [x] Verified tests actually exercise the changed code (not just mocks)
- [x] Searched for behavioral-contract regressions (exact error strings, ordering, validation)

If you skipped any, list it under `What I Skipped` with the reason. Skipping is acceptable; pretending you didn't is not.

## What goes in `What I Skipped`

A short, honest note. Examples:

> "Did not run the test suite locally — accepted CI status."
> "Did not review `pnpm-lock.yaml` (generated)."
> "Did not deeply audit the migration script — verified it follows the existing convention but didn't trace each statement."
> "Diff was 2400 lines; concentrated on `src/` and `tests/`, skimmed `docs/`."

If you actually checked everything: `"Nothing skipped."`

## Don't

- Don't write a verdict before classifying findings. The findings drive the verdict, not vice versa.
- Don't approve to be nice. False approvals shipped bugs.
- Don't `block` to avoid making a call. If the issues are localized, `request-changes` is the right answer.
- Don't write a summary without the verdict-supporting evidence.
- Don't pad the review. Reviewers who write essays get skipped.
