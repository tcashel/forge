/**
 * forge logs <task-id> — print agent run log.
 *
 * Flags:
 *   --tail N        Lines from end (default: 200; 0 = full file)
 *   --follow / -f   Stream new lines as they're appended
 */

import * as fs from "node:fs";
import { parseArgs } from "node:util";
import type { ForgeStore } from "../../core/store.ts";
import { CliError } from "../output.ts";

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      tail: { type: "string", default: "200" },
      follow: { type: "boolean", short: "f", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const id = positionals[0];
  if (!id) {
    throw new CliError("MISSING_ARG", "Usage: forge logs <task-id>", { exitCode: 1 });
  }

  const task = store.getTask(id);
  if (!task) {
    throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, { exitCode: 1 });
  }

  const logFile = store.getLogFile(id);
  if (!fs.existsSync(logFile)) {
    throw new CliError("NO_LOG", `Log file not found: ${logFile}`, {
      hint: "Run may not have started yet, or run dir was deleted.",
      exitCode: 2,
    });
  }

  const tailN = Number.parseInt(values.tail as string, 10);
  if (tailN > 0) {
    const lines = store.tailLog(id, tailN);
    for (const ln of lines) process.stdout.write(`${ln}\n`);
  } else {
    process.stdout.write(fs.readFileSync(logFile, "utf-8"));
  }

  if (!values.follow) return;

  // Tail-follow: watch the file and stream appended bytes from the
  // current end. Stops on SIGINT.
  let offset = fs.statSync(logFile).size;
  const stream = (until: number) => {
    if (until <= offset) return;
    const fd = fs.openSync(logFile, "r");
    try {
      const buf = Buffer.alloc(until - offset);
      fs.readSync(fd, buf, 0, buf.length, offset);
      process.stdout.write(buf);
    } finally {
      fs.closeSync(fd);
    }
    offset = until;
  };

  const watcher = fs.watch(logFile, () => {
    try {
      stream(fs.statSync(logFile).size);
    } catch {
      // file rotated or removed — stop
      watcher.close();
    }
  });

  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });

  // Park until the watcher exits.
  await new Promise<void>(() => {});
}
