/**
 * forge dash — open the standalone mission-control TUI.
 *
 * Read-only by default for v0.4: navigation, attach, view-spec, and
 * kill all work in-process. Actions that previously opened a wizard
 * (launch, spec save, critique, settings) drop out of the dashboard
 * and tell the user the equivalent forge subcommand to run. The pi
 * extension's modal-select wizards do not exist outside pi; layering
 * them back in is a follow-up.
 *
 * Exits with code 2 if stdout isn't a TTY.
 */

import { execSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import { detectRepo } from "../../core/repo.ts";
import type { ForgeStore } from "../../core/store.ts";
import { ForgeDashboard } from "../../tui/dashboard.ts";
import { runTui } from "../../tui/render-loop.ts";
import { makeTheme } from "../../tui/theme.ts";
import { CliError } from "../output.ts";

export const HELP = `forge dash

Open the standalone mission-control TUI. Read-only navigation: select tasks,
attach to tmux sessions, view specs, kill runs. Exits 2 if stdout is not a
TTY.
`;

function openSpecInViewer(specFile: string): void {
  if (!fs.existsSync(specFile)) return;
  const opener =
    process.env.FORGE_SPEC_VIEWER ??
    (process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open");
  const child = spawn(opener, [specFile], { detached: true, stdio: "ignore" });
  child.unref();
}

export async function run(_argv: string[], store: ForgeStore): Promise<void> {
  if (!process.stdout.isTTY) {
    throw new CliError("NO_TTY", "forge dash requires a TTY.", {
      hint: "Run `forge ls --json` for a non-interactive task list.",
      exitCode: 2,
    });
  }

  const repo = detectRepo(process.cwd());
  if (!repo) {
    throw new CliError("NOT_A_REPO", "Not in a git repository.", { exitCode: 2 });
  }

  await runTui((handle) => {
    const theme = makeTheme();
    const tuiAdapter = { requestRender: () => handle.invalidate() };
    const dash = new ForgeDashboard(theme, tuiAdapter, store, repo);

    dash.onClose = () => handle.stop();
    dash.onAction = async (action) => {
      switch (action.type) {
        case "attach": {
          if (!action.task.tmuxSession) return;
          await handle.suspend(async () => {
            try {
              execSync(`tmux attach -t ${action.task.tmuxSession}`, { stdio: "inherit" });
            } catch {
              /* user detached or session ended */
            }
          });
          dash.invalidate();
          handle.invalidate();
          return;
        }
        case "view_spec": {
          openSpecInViewer(action.task.specFile);
          dash.invalidate();
          handle.invalidate();
          return;
        }
        case "kill": {
          if (action.task.tmuxSession) {
            try {
              execSync(`tmux kill-session -t ${action.task.tmuxSession}`, { stdio: "ignore" });
            } catch {
              /* session may already be dead */
            }
            store.upsertTask({
              ...action.task,
              status: "failed",
              completedAt: new Date().toISOString(),
            });
          }
          dash.invalidate();
          handle.invalidate();
          return;
        }
        case "view_critique": {
          const recFile = store.getRecommendationsFile(action.task.id, action.critiqueId);
          if (fs.existsSync(recFile)) {
            const opener = process.platform === "darwin" ? "open" : "xdg-open";
            spawn(opener, [recFile], { detached: true, stdio: "ignore" }).unref();
            store.markCritiqueViewed(action.task.id, action.critiqueId);
          }
          dash.invalidate();
          handle.invalidate();
          return;
        }
        default:
          // launch / new_spec / edit_spec / run_critique / discuss_critique
          // / settings / resume — exit the dash and print the right command.
          handle.stop();
          process.stderr.write(`\nDashboard action "${action.type}" not yet wired in standalone mode.\n`);
          process.stderr.write(`Use the equivalent forge subcommand from another shell, e.g.\n`);
          process.stderr.write(`  forge launch <id>     # launch a draft\n`);
          process.stderr.write(`  forge spec save -     # save a new spec from stdin\n`);
          process.stderr.write(`  forge config list     # view per-repo settings\n\n`);
          return;
      }
    };

    return {
      render: (w) => dash.render(w),
      handleInput: (data) => dash.handleInput(data),
      invalidate: () => dash.invalidate(),
      start: () => dash.start(),
      stop: () => dash.stop(),
    };
  });
}
