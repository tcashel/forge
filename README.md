# forge

A [pi](https://github.com/badlogic/pi) extension that wraps a spec → launch → review → PR workflow behind a few slash commands.

## Prerequisites

- `pi` — the host agent (forge is a pi extension)
- Node 22+ — required by `supervisor.ts` (`node --experimental-strip-types`)
- `tmux` — agent runs execute in background tmux sessions
- `git` — worktree management, branch operations
- `gh` — PR create, view, diff, checks

## Install

Clone into the pi extensions directory:

```
git clone <your-remote>:tcashel/forge.git ~/.pi/agent/extensions/forge
```

Pi auto-loads extensions that declare a `pi` block in `package.json` — no further config needed.

## Usage

`/forge` opens the mission-control dashboard. From there, press `n` (or run `/forge-spec`) to start a new task — the bundled planner skill will research the repo and draft a spec conversationally. When the spec looks right, `Alt+S` saves it and offers to launch. Press `v` on any task to open its saved spec in your default `.md` viewer (or set `FORGE_SPEC_VIEWER=zed` to pick a specific editor). Forge spins up the chosen agent (`pi`, `claude`, or `codex`) in a tmux session inside a fresh git worktree. `/forge-attach` lets you watch (or detach with `Ctrl-B d`). On completion the runner executes the repo's quality gates, pushes the branch, and opens a draft PR. `/forge-review <n>` runs the bundled reviewer skill against the PR diff and linked spec.

## Commands

| Command | Description |
|---|---|
| `/forge` | Open mission-control dashboard |
| `/forge-spec [arg]` | Enter spec-mode (arg: JIRA key, idea, or blank) |
| `/forge-edit-spec [arg]` | Re-enter spec-mode on an existing spec |
| `/forge-save-spec` | Promote working draft and optionally launch |
| `/forge-cancel-spec` | Exit spec-mode (draft preserved on disk) |
| `/forge-launch` | Launch an agent on an existing spec |
| `/forge-attach` | Attach to a running agent's tmux session |
| `/forge-review <pr>` | Review a PR with the forge-reviewer skill |
| `/forge-status` | Show task status summary in chat |

## State

All persistent state lives under `~/.forge/`:

```
~/.forge/
  specs/            # saved spec markdown per task
  runs/             # per-task run dir (logs, meta, runner script, prompt)
  drafts/           # working drafts during spec-mode
  index.json        # task index (all repos)
  repo-config.json  # per-repo settings (JIRA defaults, etc.)
```

## Source map

| File | Role |
|---|---|
| `index.ts` | Extension entry point — registers all slash commands |
| `dashboard.ts` | TUI mission-control view (keyboard-driven task list) |
| `spec-mode.ts` | Conversational spec drafting with the planner skill |
| `launch.ts` | tmux-based background agent execution and runner script generation |
| `repo.ts` | Repo detection — stack, quality commands, worktree helpers |
| `store.ts` | `~/.forge/` state management (index, specs, run metadata) |
| `jira.ts` | JIRA integration via `acli` CLI |
| `progress.ts` | Structured snapshot types and reducer (WIP — not yet wired into `launch.ts`) |
| `supervisor.ts` | Structured progress tracker for pi-runtime tasks (WIP — not yet wired into `launch.ts`) |
| `skills/forge-planner/` | Planner skill — drafts specs from ideas or JIRA tickets |
| `skills/forge-reviewer/` | Reviewer skill — severity + scoring rubrics for PR review |
| `tests/` | Tests (`supervisor.test.ts`, `progress.test.ts`, fixtures) |

## Development

Edit files in place under `~/.pi/agent/extensions/forge/` — pi reloads extensions on agent restart. Run the quality gate with `npm run lint`. Run tests with `node --test --experimental-strip-types tests/*.test.ts`.

## License

TBD (pre-1.0)
