---
description: Print the attach command for a running Forge task's tmux session.
---

`forge attach <id>` execs into a tmux session. Do not try to spawn `tmux attach` yourself from this command; it is TTY-bound and should run in the user's terminal.

Task argument: $1

Steps:

1. If $1 is empty, run `forge ls --status running --json` to find live tasks. If exactly one is running, use it. If many are running, ask which.

2. Print the exact command for the user to run in their own terminal:

```bash
forge attach <id>
```

or, if the task ID is awkward to type:

```bash
tmux attach -t <session>
```

3. Note that detaching from tmux is `Ctrl-b d`.
