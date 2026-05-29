# forge opencode plugin

Registers Forge skills and slash commands in opencode.

## Prerequisites

The `forge` CLI must be on `PATH`:

```bash
cd <forge-repo>
bun install
bun link
forge --version
```

## Install

Add the plugin to `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "<forge-repo>/opencode-plugin/plugin.ts"
  ]
}
```

Restart opencode after changing config.

## Commands

- `/forge-ship-plan [title]` - save a Forge spec from the current plan, then confirm and launch
- `/forge-launch <id-or-substring>` - launch an existing draft spec
- `/forge-status [id]` - list tasks or show one task's status
- `/forge-attach [id]` - print the terminal attach command for a running task
- `/forge-review <pr-number>` - review a Forge-launched PR
- `/forge-critique <id>` - run two-critic + synthesizer spec critique
- `/forge-dash` - print the command for the TUI dashboard

## Skills

The plugin registers the existing Forge skills from `cc-plugin/skills/`:

- `forge-planner`
- `forge-reviewer`
- `forge-critic`
- `forge-synthesizer`
- `forge-fixer`
- `forge-spec-improver`
