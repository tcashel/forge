---
description: Print the command to open the Forge mission-control TUI.
---

Tell the user to run `forge dash` in their own terminal. This is an interactive TUI and should not be launched from the agent command.

Print:

```bash
forge dash
```

Then briefly summarize what they will see:

- Current-repo tasks at the top, other running tasks below
- Open PRs from gh in the lower panel
- `j`/`k` to navigate, `enter` for details, `a` to attach to a tmux session, `v` to view a spec, `q` to quit

If the user wants a non-interactive view in chat, suggest `/forge-status` instead.
