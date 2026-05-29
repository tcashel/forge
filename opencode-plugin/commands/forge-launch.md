---
description: Launch a background agent run for an existing Forge spec.
---

You are launching a Forge spec. The user has already saved a draft via `forge spec save`; now they want a coding agent to execute it.

Task argument: $1

Steps:

1. Resolve the target task. If $1 is empty, run `forge spec ls --json` and pick the most relevant draft, or ask the user if there is more than one. If $1 is given, treat it as a task id substring: run `forge ls --status draft --json` and find the unique match. If multiple match, ask the user.

2. Confirm before launching. Echo back the task title, branch, and agent/model defaults from `forge config list --json`, then ask `launch?`. Do not launch unprompted.

3. Launch only after confirmation. Run `forge launch <id> --json`. Surface `tmuxSession`, `worktreePath`, and `runDir`.

4. Wait. Run `forge wait <id> --until done,failed,quality_failed --json`. Report final status and PR URL.

If the launch fails with `MISSING_REVIEWER_MODEL`, `MISSING_MODEL`, or `MISSING_FLAGS`, run `forge config list --json` and tell the user which keys to set. Example: `forge config set reviewerAgent claude`, `forge config set reviewerModel claude-opus-4-7`.
