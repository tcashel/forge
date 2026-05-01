/**
 * forge attach <task-id> — exec into the task's tmux session.
 *
 * Replaces the current process with `tmux attach -t <session>` so the
 * user's keystrokes go directly to the session. Exits 2 if no tmux,
 * 1 if the session isn't alive.
 */

import { spawn } from "node:child_process";
import { isTmuxAvailable, isTmuxSessionAlive } from "../../core/launch.ts";
import type { ForgeStore } from "../../core/store.ts";
import { CliError } from "../output.ts";

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const id = argv[0];
  if (!id) {
    throw new CliError("MISSING_ARG", "Usage: forge attach <task-id>", { exitCode: 1 });
  }

  if (!isTmuxAvailable()) {
    throw new CliError("NO_TMUX", "tmux not found on PATH.", {
      hint: "Install with: brew install tmux",
      exitCode: 2,
    });
  }

  const task = store.getTask(id);
  if (!task) {
    throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, { exitCode: 1 });
  }
  if (!task.tmuxSession) {
    throw new CliError("NO_SESSION", `Task ${id} has no tmux session recorded.`, { exitCode: 1 });
  }
  if (!isTmuxSessionAlive(task.tmuxSession)) {
    throw new CliError("DEAD_SESSION", `Tmux session "${task.tmuxSession}" is not alive.`, {
      hint: "The agent has exited. Run `forge logs` or `forge status` to inspect.",
      exitCode: 1,
    });
  }

  const child = spawn("tmux", ["attach", "-t", task.tmuxSession], { stdio: "inherit" });
  await new Promise<void>((resolve) => {
    child.on("exit", (code) => {
      process.exit(code ?? 0);
      resolve();
    });
  });
}
