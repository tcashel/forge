---
description: Launch a background agent run for an existing forge spec.
argument-hint: <task-id-or-substring>
---

You are launching a Forge spec. The user has already saved a draft via `forge spec save`; now they want a coding agent to execute it.

Steps:
1. **Resolve the target task.** If $1 is empty, run `forge spec ls --json` and pick the most relevant draft (or ask the user if there's more than one). If $1 is given, treat it as a task id substring — run `forge ls --status draft --json` and find the unique match. If multiple match, ask the user.
2. **Confirm before launching.** Echo back the task title, branch, agent/model defaults (`forge config list --json`), and ask "launch?". Don't launch unprompted.
3. **Launch.** `forge launch <id> --json`. Surface `tmuxSession`, `worktreePath`, `runDir`.
4. **Wait.** `forge wait <id> --until done,failed,quality_failed --json`. Report the final status and PR URL.

If the launch fails with `MISSING_REVIEWER_MODEL` / `MISSING_MODEL`, run `forge config list --json` and tell the user which keys to set — example: `forge config set reviewerAgent codex`, `forge config set reviewerModel o3`.
