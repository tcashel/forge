OpenAI Codex v0.131.0
--------
workdir: /tmp/some-worktree
model: gpt-5.5
--------
user
Please review the PR in forge.

## forge-reviewer skill

[ ... portions of SKILL.md echoed back by codex ... ]

## Output format

Output your review as a single fenced block tagged `forge-review`. Forge extracts this when you're done.

````markdown
```forge-review
## Verdict
<approve | request-changes | block>

## Summary
<2–4 sentences. What this PR does, what you checked, why this verdict.>

## Findings

### [BLOCKER] <short title>
**Where:** <file:line>
**Evidence:** <what you observed>
**Why:** <why this matters>
**Fix:** <what to change>
```
````

[ ... rest of the prompt ... ]

codex
```forge-review
## Verdict
block

## Summary
The PR has structural issues that need addressing before merge.

## Findings

### [BLOCKER] Example blocker finding
**Where:** src/example.ts:42
**Evidence:** This breaks an invariant.
**Why:** The spec requires X.
**Fix:** Do Y instead.
```

tokens used
12,345
```forge-review
## Verdict
block

## Summary
The PR has structural issues that need addressing before merge.

## Findings

### [BLOCKER] Example blocker finding
**Where:** src/example.ts:42
**Evidence:** This breaks an invariant.
**Why:** The spec requires X.
**Fix:** Do Y instead.
```
