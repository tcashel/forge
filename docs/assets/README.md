# Workbench assets

Screenshots and GIFs of the Forge **Workbench** (the localhost web UI served by
`forge serve`). Used by the root [`README.md`](../../README.md) and available for
future docs.

All screenshots are captured at 1440×900 @2× in both themes; pick the variant
that matches the surrounding page. On GitHub, prefer a theme-responsive
`<picture>` block so the image follows the reader's light/dark setting:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/screenshots/dark/overview.png">
  <img alt="Forge Workbench" src="docs/assets/screenshots/light/overview.png">
</picture>
```

## Screenshots — `screenshots/{light,dark}/`

| File | View |
|---|---|
| `overview.png` | Cockpit landing — "Pick up here", running/attention/ready/drafting/done sections, task detail pane |
| `task-spec.png` | Task detail · **Spec** tab |
| `task-plan.png` | Task detail · **Plan workspace** (planner + live spec document) |
| `task-critique.png` | Task detail · **Critique** — two critics + synthesizer panel |
| `task-gates.png` | Task detail · **Quality gates** — per-command pass/fail + timings |
| `task-history.png` | Task detail · **History** — unified event timeline |
| `task-runs.png` | Task detail · **Runs** — prior jobs for the plan |
| `task-log.png` | Task detail · **Live log** — agent output |
| `prs.png` | Open PRs list + PR detail |
| `review.png` | Full-screen PR review/triage — diff, digest, findings |
| `activity.png` | Agent Activity — per-session purpose/tokens/cost table |
| `worktrees.png` | Worktrees inventory — safety badges + per-worktree actions |
| `usage.png` | Usage & Cost dashboard — daily cost, cost-to-ship, rework ratio |
| `library.png` | Spec library |
| `settings.png` | Per-repo settings (implementer / reviewer / fixer / critic pairs) |
| `new-spec-modal.png` | New-spec modal + planner |

## GIFs — `gifs/`

| File | Flow |
|---|---|
| `cockpit-tour.gif` | Touring the main surfaces (cockpit → PRs → activity → usage → worktrees) |
| `task-tabs.gif` | Walking a task's evidence trail (plan → spec → critique → gates → history → runs) |
| `theme-toggle.gif` | Light ↔ dark theme |
| `new-spec.gif` | Opening the new-spec modal |

## Regenerating

The capture scripts live in the session scratchpad (Playwright driving the
`window.__forge` signal bridge against a running `forge serve`). To refresh:
start `forge serve --port 7456`, then re-run the capture/gif scripts and the
`ffmpeg`/`gifsicle` conversion. Screenshots are driven entirely through the
bridge (`viewMode`, `theme`, `selectTask`, `modalOpen`); the worktrees and
review shots additionally click their in-view buttons.
