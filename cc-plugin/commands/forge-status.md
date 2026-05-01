---
description: Show forge task status. With no arg, lists tasks for the current repo; with a task id, shows that task's run state.
argument-hint: [task-id]
---

Show forge task state.

If $1 is empty:
- Run `forge ls --json` and summarise the tasks for this repo (status, branch, PR URL, tmux liveness).

If $1 is set:
- Run `forge status $1 --tail 8 --json` and surface: status, branch, agent/model, tmux session aliveness, PR URL, last 8 log lines.
- If the JSON shape includes a `meta.errorMessage`, surface it prominently.

Do not launch, kill, or modify anything. This is a read-only status pass.
