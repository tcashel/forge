---
description: Review a Forge-launched PR with the bundled forge-reviewer skill.
---

You are reviewing PR #$1.

Compose the reviewer prompt by running this command, which includes PR metadata, CI checks, diff, linked Forge spec, and embedded `forge-reviewer` instructions:

!`forge review $1`

The output above already embeds the `forge-reviewer` skill instructions. Companion files `severity.md` and `scoring.md` are referenced by absolute path in that output; read them if you need the rubric tables.

Now produce the review:

1. Apply the rubric from the embedded skill.
2. Output a single `forge-review` fenced block per the skill's output spec.
3. End with a clear `approve`, `request-changes`, or `block` recommendation.

If `forge review` printed an error envelope, such as gh auth, unknown PR, or not in a forge-managed repo, surface that to the user and stop.
