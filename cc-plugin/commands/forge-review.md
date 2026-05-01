---
description: Review a Forge-launched PR with the bundled forge-reviewer skill.
argument-hint: <pr-number>
---

You are reviewing PR #$1.

Compose the reviewer prompt (PR metadata + CI checks + diff + linked Forge spec, with the forge-reviewer skill body embedded):

!`forge review $1`

The output above already embeds the **forge-reviewer** skill instructions (SKILL.md is loaded inline; companion files `severity.md` and `scoring.md` are referenced by absolute path — `read` them if you need the rubric tables).

Now produce the review:

1. Apply the rubric (severity bands, scoring) from the embedded skill.
2. Output a single ` ```forge-review ` fenced block per the skill's output spec.
3. End with a clear **approve / request-changes / block** recommendation.

If `forge review` printed an error envelope (gh auth, unknown PR, not in a forge-managed repo), surface that to the user and stop.
