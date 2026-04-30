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

Before launching, you can pressure-test a spec with `/forge-critique` (or press `c` in the dashboard). This sends the spec to two different models for independent adversarial review, then a third model synthesizes both critiques into a prioritized recommendations document. The whole flow runs in the background via tmux. When it's done, press `c` again to view the recommendations or enter spec-mode with them pre-loaded so you can selectively apply changes.

## Commands

| Command | Description |
|---|---|
| `/forge` | Open mission-control dashboard |
| `/forge-spec [arg]` | Enter spec-mode (arg: JIRA key, idea, or blank) |
| `/forge-edit-spec [arg]` | Re-enter spec-mode on an existing spec |
| `/forge-critique [arg]` | Run adversarial critique on a spec |
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
| `src/index.ts` | Extension entry point — registers all slash commands |
| `src/dashboard.ts` | TUI mission-control view (keyboard-driven task list) |
| `src/spec-mode.ts` | Conversational spec drafting with the planner skill |
| `src/launch.ts` | tmux-based background agent execution and runner script generation |
| `src/repo.ts` | Repo detection — stack, quality commands, worktree helpers |
| `src/store.ts` | `~/.forge/` state management (index, specs, run metadata) |
| `src/jira.ts` | JIRA integration via `acli` CLI |
| `src/pr-body.ts` | PR body builder (frontmatter parsing + summary/test plan) |
| `src/progress.ts` | Structured snapshot types and reducer (WIP — not yet wired into `launch.ts`) |
| `src/supervisor.ts` | Structured progress tracker for pi-runtime tasks (WIP — not yet wired into `launch.ts`) |
| `src/critique.ts` | Adversarial spec critique runner (tmux-based, parallel critics + synthesizer) |
| `skills/forge-planner/` | Planner skill — drafts specs from ideas or JIRA tickets |
| `skills/forge-reviewer/` | Reviewer skill — severity + scoring rubrics for PR review |
| `skills/forge-critic/` | Critic skill — adversarial spec review with severity labels |
| `skills/forge-synthesizer/` | Synthesizer skill — merges two critiques into recommendations |
| `tests/` | Tests (`pr-body.test.ts`, `progress.test.ts`, `supervisor.test.ts`, fixtures) |

## Development

Edit files in place under `~/.pi/agent/extensions/forge/` — pi reloads extensions on agent restart. Run the quality gate with `pnpm run lint`. Run tests with `node --test --experimental-strip-types tests/*.test.ts`.

## Ideas — deferred work

The current scope ends at one-shot review and run capture. Tracked for future
sessions:

- **Reviewer → implementer iteration loop.** Up to 3 rounds, fix-via-new-commit
  (no amend), implementer instructed to push back on bogus findings. Convergence
  guard: bail if iteration N's findings aren't strictly better than N-1.
- **Spec decomposer skill.** Turns one ambitious spec into a DAG of small
  sub-specs that each leave the branch green. Default execution: sequential in
  one worktree, one PR with N commits. `parallel: true` annotation only for
  proven-independent leaves (no file overlap). Avoids stacked-PR tooling cost.
- **`/forge-reflect` skill.** Reads run history across all repos, surfaces
  patterns: which specs needed iteration, which models hold up best on this
  repo, which acceptance criteria the reviewer flags most often. Feeds back
  into improving the planner skill. Requires a few weeks of captured data.
- **Synthesizer apply-recommendations picker.** Parse `forge-spec-recommendations`
  blocks into items; checkbox picker in dashboard; selecting one opens spec-mode
  with the recommendation pre-loaded as the opening turn (discuss, don't
  auto-apply).
- **Markdown-lint on spec save.** Catch structural breakage (broken headings,
  unclosed fences) without trying to enforce writing style.
- **Token / $ capture per run.** Per-runtime parsing of cost output. Engineering
  rabbit hole — punt until reflect needs it.
- **Pre-PR self-check by the implementer.** Walk acceptance criteria, mark
  met/partial/missing, refuse PR open on any BLOCKER-equivalent gap. Possibly
  redundant with the reviewer loop once that lands.
- **Centralized cross-repo run dashboard view.** Summary across `~/.forge/runs/`
  for "what ran today", time-to-PR trends, etc.

## License

TBD (pre-1.0)
