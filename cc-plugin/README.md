# forge — Claude Code plugin

Drives the `forge` CLI from inside Claude Code. Skills + slash commands that turn plan-mode output into background agent runs and review their PRs.

## Prerequisites

The `forge` CLI must be on your `PATH`:

```bash
cd <forge-repo>
bun install
bun link
forge --version  # 0.4.0-dev
```

`forge` itself needs `tmux`, `git`, `gh`, and a `claude` or `codex` CLI on PATH for actual launches.

## Slash commands

| Command | Description |
|---|---|
| `/forge-ship-plan [title]` | Take the plan you just produced (in plan mode or the conversation) and ship it: save a spec, ask, launch. |
| `/forge-launch <id-or-substring>` | Launch an existing draft spec. |
| `/forge-status [id]` | List tasks (no arg) or show one task's run state. |
| `/forge-attach [id]` | Print the `forge attach` command to run in your own terminal. |
| `/forge-critique <id>` | Run two-critic + synthesizer adversarial critique on a saved spec. |
| `/forge-review <pr-number>` | Review a PR with the bundled forge-reviewer skill. |
| `/forge-dash` | Print the `forge dash` command (interactive TUI — opens in your terminal). |

## Skills

Bundled in `cc-plugin/skills/`:

- `forge-planner` — drafts a spec from an idea or a plan-mode plan.
- `forge-reviewer` — produces a structured verdict against a PR diff + linked spec.
- `forge-critic` — adversarial spec review with severity labels.
- `forge-synthesizer` — merges two critic outputs into ranked recommendations.

The planner skill is loaded automatically by `/forge-ship-plan`. The reviewer skill is loaded by `/forge-review`. The critic + synthesizer skills are exercised inside the spawned agents that `forge critique` launches — they don't need to load in your Claude Code conversation.

## Config (per repo)

`forge launch` and `forge critique` take agent/model defaults from `~/.forge/repo-config.json`. Set them once per repo:

```bash
forge config set reviewerAgent codex
forge config set reviewerModel o3
forge config set critiqueAgentA claude
forge config set critiqueModelA claude-opus-4-7
forge config set critiqueAgentB codex
forge config set critiqueModelB o3
forge config set critiqueAgentSynth claude
forge config set critiqueModelSynth claude-opus-4-7

# Optional: per-repo gh account override
forge config set ghUser my-personal-account
```

## Install

The plugin lives at `cc-plugin/` in the same repo as the CLI.

**For iterative use (current dev workflow):** load the local directory directly with `claude`'s `--plugin-dir` flag — no copy or symlink, edits take effect on `/reload-plugins`.

```bash
cd <forge-repo>
claude --plugin-dir ./cc-plugin
```

`~/.claude/plugins/` is owned by Claude Code itself and only stores marketplace-installed plugins; don't symlink into it.

**Marketplace install — local clone (fastest, works for private repos):**

```bash
/plugin marketplace add /path/to/forge
/plugin install forge
```

**Marketplace install — private git repo via SSH:**

```bash
/plugin marketplace add git@github.com:tcashel/forge
/plugin install forge
```

**Marketplace install — public HTTPS:**

```bash
/plugin marketplace add https://github.com/tcashel/forge
/plugin install forge
```

## Notes

- `/forge-ship-plan` reshapes a plan-mode plan into the Forge schema before saving — it does not save the plan verbatim.
- `forge attach` and `forge dash` need a real TTY, so the slash commands print the command for you to run yourself rather than executing it.
- All other commands run `forge` via the Bash tool with `--json` and surface the structured response.
