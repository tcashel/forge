---
description: Attach to a running forge task's tmux session in a separate terminal.
argument-hint: [task-id]
---

`forge attach <id>` execs into a tmux session, which Claude Code can't do interactively from a slash command (the tool would hang). Surface the right command for the user to run themselves.

Steps:
1. If $1 is empty: run `forge ls --status running --json` to find live tasks. If exactly one, use it. If many, ask which.
2. Print the exact command for the user to run in their own terminal:
   ```
   forge attach <id>
   ```
   or, if the task ID is awkward to type:
   ```
   tmux attach -t <session>
   ```
3. Note that detaching from tmux is `Ctrl-b d`.

Do not try to spawn `tmux attach` yourself — that's a TTY-bound command and Claude Code's Bash tool isn't running in the user's terminal.
