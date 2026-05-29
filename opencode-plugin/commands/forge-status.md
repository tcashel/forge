---
description: Show Forge task status for the current repo or one task.
---

Show Forge task state.

Task argument: $1

If $1 is empty, run `forge ls --json` and summarize tasks for this repo: status, branch, PR URL, and tmux liveness.

If $1 is set, run `forge status $1 --tail 8 --json` and surface: status, branch, agent/model, tmux session aliveness, PR URL, and last 8 log lines. If the JSON includes `meta.errorMessage`, surface it prominently.

Do not launch, kill, or modify anything. This is a read-only status pass.
