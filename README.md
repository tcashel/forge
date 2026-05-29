# forge

A control plane for one-shot agentic coding runs. You hand it a spec; it spins up `claude` or `codex` in a fresh git worktree under tmux, runs your quality gates, opens a draft PR, and sends a different model in to review the diff.

Three artifacts ship from this repo:

- **`forge` CLI** — a `bun`-runtime binary you run from any shell.
- **Claude Code plugin** (`cc-plugin/`) — slash commands and skills that drive the CLI from inside Claude Code.
- **opencode plugin** (`opencode-plugin/`) — slash commands and skills that drive the CLI from inside opencode.

## Prerequisites

- `bun` 1.3+
- `tmux`
- `git`
- `gh` (GitHub CLI, authenticated)
- `claude` and/or `codex` on PATH (only the runtimes you'll actually launch)

## Install

```bash
git clone <repo-url> ~/code/forge
cd ~/code/forge
bun install
bun link        # puts ./bin/forge.ts on PATH as `forge`
forge --version
```

For non-developer install once we publish:

```bash
bun install -g <git-url>
```

### Claude Code plugin

Symlink `cc-plugin/` into wherever your Claude Code install loads plugins from (typically `~/.claude/plugins/forge/` — exact path depends on your Claude Code version). The plugin assumes `forge` is on `PATH`.

### opencode plugin

Add the repo plugin path to `~/.config/opencode/opencode.jsonc` and restart opencode:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["<forge-repo>/opencode-plugin/plugin.ts"]
}
```

The plugin assumes `forge` is on `PATH`.

## Quickstart

Set per-repo defaults once:

```bash
cd <some-repo>
forge config set reviewerAgent codex
forge config set reviewerModel o3
```

Save a spec from stdin and launch:

```bash
cat plan.md | forge spec save - --title "Add Redis caching" --json
# → { "taskId": "add-redis-caching-mok…", "specPath": "...", "branch": "forge/add-redis-caching" }

forge launch <task-id> --agent claude --model claude-opus-4-7 --json
forge wait <task-id> --until done,failed,quality_failed --json
```

Or drive the same flow from Claude Code: enter plan mode, produce a plan, exit plan mode, run `/forge-ship-plan`. The planner skill reshapes your plan into the Forge schema and the slash command pipes it into `forge spec save -` for you.

Open the standalone TUI dashboard:

```bash
forge dash
```

Or boot the **Workbench** — a localhost web UI over the same state — with:

```bash
forge serve --open      # default: http://127.0.0.1:7456
```

The Workbench can launch, critique, and kill tasks directly from the UI.
Buttons call into the same programmatic cores the CLI uses, so agents
and humans share one contract. Localhost binding only; no auth. Spec
creation is exposed as `POST /api/specs` for external tooling — there is
no in-UI form yet.

## Subcommand reference

| Command | Purpose |
|---|---|
| `forge spec save [-/--from-file]` | Save a draft from stdin or file. Generates frontmatter + task id. |
| `forge spec ls` | List draft specs. |
| `forge spec show <id> [--raw]` | Print a saved spec. |
| `forge launch <id>` | Launch a draft (claude/codex) into tmux + worktree. Defaults from `forge config`. |
| `forge attach <id>` | Exec into the task's tmux session. |
| `forge ls` | List tasks (current repo by default; `--all` for global). |
| `forge status <id>` | Status, run meta, optional log tail. |
| `forge logs <id> [-f]` | Tail or follow agent.log. |
| `forge wait <id>` | Block until terminal status (`--until done,failed,quality_failed`). NDJSON heartbeats to stderr. |
| `forge critique <id>` | Two-critic + synth adversarial spec critique. |
| `forge config get/set/list <key> [<value>]` | Per-repo settings (reviewer/critique pairs, gh user/host, JIRA project). |
| `forge dash` | Mission-control TUI. |
| `forge serve [--port N] [--open]` | Boot the Workbench (web UI) on localhost. |

Every command supports `--json` and a stable error envelope:

```json
{ "ok": false, "error": { "code": "NO_TMUX", "message": "tmux not found on PATH", "hint": "brew install tmux" } }
```

Exit codes: `0` ok, `1` user error, `2` precondition (no tmux/gh/git/TTY), `3` runtime failure, `4` `forge wait` timeout.

## State

Forge keeps everything in `~/.forge/`:

```
~/.forge/
  specs/             # saved spec markdown per task
  runs/<task-id>/    # per-run logs, meta.json, runner script, prompt
  critiques/<id>/    # critic+synth output per critique invocation
  index.json         # task index (locked atomically on writes)
  repo-config.json   # per-repo settings keyed by absolute repo root
```

Writes are atomic (temp + fsync + rename). Read-modify-writes on `index.json` and `repo-config.json` use an `O_EXCL` lockfile so concurrent writers don't lose updates.

## Repo layout

```
forge/
├── bin/forge.ts              # bun shebang shim
├── src/
│   ├── cli/                  # subcommand dispatch + per-command files
│   ├── core/                 # store, launch, critique, gh, jira, repo, reviewer, pr-body
│   ├── tui/                  # theme, keys, width, render-loop, dashboard
│   └── web/                  # Workbench HTML served by `forge serve`
├── skills/                   # 4 skills used by the CLI and the cc-plugin
│   ├── forge-planner/
│   ├── forge-reviewer/
│   ├── forge-critic/
│   └── forge-synthesizer/
├── cc-plugin/                # Claude Code plugin (in tree)
│   ├── .claude-plugin/plugin.json
│   ├── commands/             # 7 slash commands
│   ├── skills -> ../skills   # symlink so the plugin loader sees the same skills
│   └── README.md
├── opencode-plugin/          # opencode plugin (in tree)
│   ├── plugin.ts             # registers commands + skills via config hook
│   ├── commands/             # 7 slash commands
│   └── README.md
└── tests/                    # bun test
```

## Development

```bash
bun test              # tests
bun run lint          # biome check .
bun run check         # biome check --write .
```

## Status

- Pre-release (0.4.0-dev). API and config keys may change.
- Pi (the previous host) is removed entirely. The pre-rip snapshot is tagged `pre-rip-v0.3.0`.
- `forge resume` is not yet wired — the supervisor that backed it was pi-specific. Re-launching a failed spec from scratch is the current path.

## Vision & roadmap

This repo is the Track A prototype for **Juicer** — the operator's cockpit for staff engineers running agent fleets. See [`docs/`](docs/) for the full vision, roadmap, architecture, schema, and decision log (ADRs). Start at [`docs/README.md`](docs/README.md).

## License

TBD.
