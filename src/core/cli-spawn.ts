/**
 * Spawn another forge CLI verb from inside a running forge process.
 *
 * Two failure modes we hit going the obvious routes — both came from
 * bun's `child_process.spawn` bridge on macOS:
 *   - `spawn("/path/to/bin/forge.ts", …)` with a `#!/usr/bin/env bun`
 *     shebang on a +x script returns ENOENT from `posix_spawn`. Bun's
 *     spawn bridge does not reliably honor shebangs on `.ts` files.
 *   - `spawn("bun", …)` returns ENOENT because `posix_spawn` does not
 *     PATH-resolve the bare name. It receives literal `"bun"` and the
 *     kernel can't find a file at that path.
 *
 * Both routes fall over because something in the chain needs PATH
 * resolution and doesn't do it. The fix: pass two absolute paths and
 * skip PATH lookup entirely.
 *   - `cmd = process.execPath` — absolute path to the bun binary that
 *     is currently running this process.
 *   - `argv[1]` — absolute path to the entry script bun is executing
 *     (`bin/forge.ts` in production, a test file under `bun test`).
 *
 * The next person to look at this: do not "simplify" to spawn("bun", …).
 * It does not work.
 */

import { type ChildProcess, type SpawnOptions, spawn } from "node:child_process";
import { CliError } from "../cli/output.ts";

export interface SpawnForgeCliOptions {
  cwd?: string;
  detached?: boolean;
  stdio?: SpawnOptions["stdio"];
  env?: NodeJS.ProcessEnv;
}

export function spawnForgeCli(args: string[], opts: SpawnForgeCliOptions = {}): ChildProcess {
  const scriptPath = process.argv[1];
  if (!scriptPath) {
    throw new CliError("INTERNAL", "process.argv[1] missing — cannot spawn forge CLI subprocess");
  }
  return spawn(process.execPath, [scriptPath, ...args], {
    cwd: opts.cwd,
    detached: opts.detached,
    stdio: opts.stdio,
    env: opts.env,
  });
}
