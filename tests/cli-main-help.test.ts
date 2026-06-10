/**
 * main.ts help safety (cli-help-after-positional-executes-command).
 *
 * `forge launch <id> --help` used to dispatch into the subcommand —
 * strict:false parseArgs swallowed --help and the command actually ran
 * (for launch, that means starting an agent). main.run now scans the FULL
 * argv remainder for --help/-h before any store/dispatch work.
 *
 * Dispatch-level coverage spawns the real CLI entry (bin/forge.ts) in a
 * subprocess with FORGE_HOME pointed at a temp dir — exercising the actual
 * process.exit paths without touching the operator's ~/.forge and without
 * spawning gh/claude/tmux (the help path exits before any of that).
 */

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { wantsHelp } from "../src/cli/main.ts";

const REPO_ROOT = path.join(import.meta.dir, "..");
const FORGE_BIN = path.join(REPO_ROOT, "bin", "forge.ts");

function runForge(args: string[], forgeDir: string): { status: number | null; stdout: string; stderr: string } {
  const res = spawnSync("bun", [FORGE_BIN, ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, FORGE_HOME: forgeDir },
    encoding: "utf-8",
    timeout: 30_000,
  });
  return { status: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
}

function withTmpForgeDir<T>(fn: (dir: string) => T): T {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-cli-help-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("wantsHelp finds --help/-h anywhere before a bare -- terminator", () => {
  assert.equal(wantsHelp([]), false);
  assert.equal(wantsHelp(["--help"]), true);
  assert.equal(wantsHelp(["-h"]), true);
  assert.equal(wantsHelp(["my-task", "--help"]), true, "trailing --help after a positional must count");
  assert.equal(wantsHelp(["my-task", "--branch", "x", "-h"]), true);
  assert.equal(wantsHelp(["my-task", "--branch", "x"]), false);
  assert.equal(wantsHelp(["--", "--help"]), false, "tokens after -- are payload, not flags");
  assert.equal(wantsHelp(["my-task", "--", "-h"]), false);
});

test("forge launch <id> --help prints help and exits 0 without dispatching", () => {
  withTmpForgeDir((dir) => {
    // No plan named "some-task" exists in the temp FORGE_HOME: if this ever
    // dispatched, launch would exit 1 with UNKNOWN_TASK instead of printing help.
    const res = runForge(["launch", "some-task", "--help"], dir);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /forge launch <task-id>/);
    assert.doesNotMatch(res.stdout + res.stderr, /UNKNOWN_TASK|No task with id/);
  });
});

test("forge status <id> -h prints help instead of running the command", () => {
  withTmpForgeDir((dir) => {
    const res = runForge(["status", "nope", "-h"], dir);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /forge status <task-id>/);
  });
});

test("unknown command exits 1 with an UNKNOWN_CMD envelope and a --help hint", () => {
  withTmpForgeDir((dir) => {
    const res = runForge(["bogus-cmd", "--json"], dir);
    assert.equal(res.status, 1);
    const envelope = JSON.parse(res.stdout) as { ok: boolean; error: { code: string; hint?: string } };
    assert.equal(envelope.ok, false);
    assert.equal(envelope.error.code, "UNKNOWN_CMD");
    assert.match(envelope.error.hint ?? "", /forge --help/);
  });
});

test("bare `forge` prints usage and exits 1; `forge --help` exits 0", () => {
  withTmpForgeDir((dir) => {
    const bare = runForge([], dir);
    assert.equal(bare.status, 1);
    assert.match(bare.stderr, /Usage: forge <command>/);

    const help = runForge(["--help"], dir);
    assert.equal(help.status, 0);
  });
});

test("missing required arg exits non-zero with a usage message", () => {
  withTmpForgeDir((dir) => {
    const res = runForge(["status"], dir);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /Usage: forge status <task-id>/);
  });
});
