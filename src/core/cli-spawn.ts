/**
 * Spawn another forge CLI verb from inside a running forge process, detached.
 *
 * Three routes we tried before landing here, all failed in production:
 *   - `spawn("/.../bin/forge.ts", …)` — bun's child_process bridge on macOS
 *     does not reliably honor `.ts` shebangs; posix_spawn returns ENOENT.
 *   - `spawn("bun", …)` — node:child_process.spawn does not PATH-resolve
 *     the bare name; posix_spawn gets literal "bun" and returns ENOENT.
 *   - `spawn(process.execPath, …)` — execPath is a snapshot taken at
 *     process start. When a package manager (brew, apt, etc.) replaces or
 *     cleans up the bun binary at that path mid-session, the running
 *     process stays alive via its open inode but posix_spawn can't find
 *     the path. Documented in claude-code #47253 (Apr 2026): a 9-day-old
 *     process had been running on a deleted binary, all subprocess
 *     spawns ENOENT.
 *
 * Fix per bun's own docs (https://bun.com/docs/runtime/child-process):
 * use `Bun.spawn` (bun-native, not the node:child_process compatibility
 * layer) and re-resolve the bun binary via `Bun.which("bun")` at spawn
 * time, so a stale execPath snapshot can't bite us. The detached recipe
 * is `detached: true` + `stdio: ["ignore", "ignore", "ignore"]` +
 * `proc.unref()` — all three are required because stdio handles otherwise
 * keep the parent process alive.
 *
 * The next person to look at this: do not "simplify" back to
 * node:child_process or to `process.execPath`. Both fail in ways that
 * are hard to reproduce locally but bite real users on real machines.
 *
 * One more landmine to know about: bun #24012 — Bun.spawn reports
 * "ENOENT posix_spawn '<bun-path>'" when the *cwd* doesn't exist,
 * lying about which path it couldn't find. We `statSync` cwd up front
 * and throw a real error so the next time a plan has a stale repoRoot,
 * the failure surfaces as "plan's repoRoot does not exist" instead of
 * a wild goose chase through bun internals.
 */

import * as fs from "node:fs";
import { CliError } from "../cli/output.ts";

export interface SpawnForgeCliOptions {
  cwd?: string;
  /** Defaults to `process.env`. Pass a sanitized copy if you need to scrub variables. */
  env?: Record<string, string | undefined>;
}

export function spawnForgeCli(args: string[], opts: SpawnForgeCliOptions = {}): Bun.Subprocess {
  const scriptPath = process.argv[1];
  if (!scriptPath) {
    throw new CliError("INTERNAL", "process.argv[1] missing — cannot spawn forge CLI subprocess");
  }
  const bunPath = Bun.which("bun");
  if (!bunPath) {
    throw new CliError("INTERNAL", "Bun.which('bun') returned null — cannot locate bun on PATH");
  }
  if (opts.cwd && !isExistingDirectory(opts.cwd)) {
    throw new CliError(
      "BAD_STATE",
      `Working directory does not exist: ${opts.cwd}. Likely a plan with a stale repoRoot pointing at a deleted worktree or scratch path.`,
    );
  }
  const proc = Bun.spawn({
    cmd: [bunPath, scriptPath, ...args],
    cwd: opts.cwd,
    env: opts.env,
    stdio: ["ignore", "ignore", "ignore"],
  });
  proc.unref();
  return proc;
}

function isExistingDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}
