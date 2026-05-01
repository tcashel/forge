---
description: Open the forge mission-control TUI dashboard in the user's terminal.
---

Tell the user to run `forge dash` in their own terminal. The Bash tool inside Claude Code can't host an interactive TTY component (it would hang or render incorrectly), so this command is informational rather than executed.

Print:
```
forge dash
```

Then briefly summarise what they'll see:
- Current-repo tasks at the top, other running tasks below
- Open PRs from gh in the lower panel
- `j`/`k` to navigate, `enter` for details, `a` to attach to a tmux session, `v` to view a spec, `q` to quit

If the user wants a non-interactive view here in chat, suggest `/forge-status` instead.
