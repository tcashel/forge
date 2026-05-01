---
description: Review a Forge-launched PR with the bundled forge-reviewer skill.
argument-hint: <pr-number>
---

You are reviewing PR #$1.

Use the **forge-reviewer** skill — pull in `skills/forge-reviewer/SKILL.md`, `severity.md`, and `scoring.md` before producing the verdict.

PR overview:
!`gh pr view $1 --json number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url`

CI status:
!`gh pr checks $1`

PR diff (truncate if huge — call out truncation):
!`gh pr diff $1`

Linked Forge spec (if this PR was launched by Forge):
!`gh pr view $1 --json headRefName --jq .headRefName | xargs -I{} sh -c 'forge ls --all --json | jq -r ".tasks[] | select(.branch==\"{}\") | .id"' | head -1 | xargs -I{} forge spec show {} --raw`

Apply the reviewer skill's rubric (severity bands, scoring) and produce a structured verdict block. End with a clear approve / request-changes / block recommendation.
