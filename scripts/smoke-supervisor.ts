/**
 * Forge Supervisor — end-to-end smoke test.
 *
 * Runner: `node --experimental-strip-types scripts/smoke-supervisor.ts`
 *   Requires Node 22. No tsx.
 *
 * Model: claude-haiku-4-5 (cheapest reasonable default). Override by
 * editing the MODEL constant below if you use a different provider.
 *
 * Spawns the supervisor against pi --mode json with a trivial prompt,
 * skipGit: true, and asserts the snapshot populates correctly.
 *
 * If the chosen model cannot be reached (no API key, network down), the
 * test prints SKIPPED and exits 0.
 */

import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ─── Node 22 preflight ───────────────────────────────────────────────────────

const major = parseInt(process.versions.node.split(".")[0], 10);
if (major < 22) {
  console.error(`forge smoke test requires Node 22+; got ${process.versions.node}. Run \`nvm use 22\` and retry.`);
  process.exit(2);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MODEL = "claude-haiku-4-5";
const TIMEOUT_MS = 90_000;
const _POLL_MS = 500;
const FORGE_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const tmpBase = path.join(os.tmpdir(), `forge-smoke-${Date.now()}`);
  fs.mkdirSync(tmpBase, { recursive: true });

  const promptFile = path.join(tmpBase, "prompt.txt");
  fs.writeFileSync(
    promptFile,
    "Print the result of 2+2. Do not call any tools. Stop after one assistant message.",
    "utf-8",
  );

  const runDir = path.join(tmpBase, "run");
  const argsFile = path.join(tmpBase, "args.json");
  const args = {
    planId: "smoke-test",
    runDir,
    promptFile,
    worktreePath: tmpBase,
    repoName: "smoke",
    branch: "main",
    defaultBranch: "main",
    qualityCommands: [],
    model: MODEL,
    specTitle: "smoke",
    commitMessage: "smoke",
    specFile: path.join(tmpBase, "nonexistent.md"),
    skipGit: true,
  };
  fs.writeFileSync(argsFile, JSON.stringify(args, null, 2), "utf-8");

  console.log(`Smoke test: spawning supervisor with model=${MODEL}`);
  console.log(`  tmpDir: ${tmpBase}`);

  const supervisorPath = path.join(FORGE_ROOT, "supervisor.ts");
  const child = spawn("node", ["--experimental-strip-types", supervisorPath, argsFile], {
    cwd: tmpBase,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  let _stdout = "";
  let stderr = "";
  child.stdout.on("data", (d) => {
    _stdout += d.toString();
    process.stdout.write(d);
  });
  child.stderr.on("data", (d) => {
    stderr += d.toString();
    process.stderr.write(d);
  });

  // Poll for completion or timeout
  const snapshotFile = path.join(runDir, "snapshot.json");
  const progressFile = path.join(runDir, "progress.jsonl");
  const metaFile = path.join(runDir, "meta.json");
  const startTime = Date.now();

  const exitCode = await new Promise<number>((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));

    // Timeout guard
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(124); // timeout exit code
    }, TIMEOUT_MS);

    child.on("close", () => clearTimeout(timer));
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nSupervisor exited with code ${exitCode} after ${elapsed}s`);

  // ── Detect model unreachable ──────────────────────────────────────────

  if (exitCode !== 0) {
    // Check if pi couldn't reach model: exited non-zero within 30s, no agent_start in progress
    const duration = Date.now() - startTime;
    let hasAgentStart = false;
    if (fs.existsSync(progressFile)) {
      const content = fs.readFileSync(progressFile, "utf-8");
      hasAgentStart = content.includes('"type":"phase_change"') && content.includes('"to":"agent"');
    }
    if (duration < 30000 && !hasAgentStart) {
      console.log(`\nSKIPPED: pi could not reach model ${MODEL} — set the appropriate API key and retry`);
      cleanup(tmpBase);
      process.exit(0);
    }

    console.error(`\nFAIL: Supervisor exited with code ${exitCode}`);
    console.error(`  stderr tail: ${stderr.slice(-500)}`);
    cleanup(tmpBase);
    process.exit(1);
  }

  // ── Assertions ────────────────────────────────────────────────────────

  const errors: string[] = [];

  function check(condition: boolean, msg: string): void {
    if (!condition) errors.push(msg);
  }

  // snapshot.json
  check(fs.existsSync(snapshotFile), "snapshot.json does not exist");
  let snapshot: {
    schemaVersion?: number;
    phase?: string;
    usage?: { turns?: number };
    lastEventAt?: number;
    startedAt?: number;
    exitCode?: number;
  } | null = null;
  if (fs.existsSync(snapshotFile)) {
    try {
      snapshot = JSON.parse(fs.readFileSync(snapshotFile, "utf-8"));
    } catch (e) {
      errors.push(`snapshot.json parse error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (snapshot) {
    check(snapshot.schemaVersion === 1, `schemaVersion: expected 1, got ${snapshot.schemaVersion}`);
    check(snapshot.phase === "done", `phase: expected "done", got "${snapshot.phase}"`);
    check(snapshot.usage?.turns >= 1, `usage.turns: expected >= 1, got ${snapshot.usage?.turns}`);
    check(snapshot.lastEventAt > snapshot.startedAt, `lastEventAt should be > startedAt`);
    check(snapshot.exitCode === 0, `exitCode: expected 0, got ${snapshot.exitCode}`);
  }

  // progress.jsonl
  check(fs.existsSync(progressFile), "progress.jsonl does not exist");
  if (fs.existsSync(progressFile)) {
    const lines = fs.readFileSync(progressFile, "utf-8").split("\n").filter(Boolean);
    const events = lines
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const types = events.map((e) => e.type);
    check(types.includes("phase_change"), "progress.jsonl missing phase_change event");
    check(types.includes("usage"), "progress.jsonl missing usage event");
    check(types.includes("stopped"), "progress.jsonl missing stopped event");
  }

  // meta.json
  check(fs.existsSync(metaFile), "meta.json does not exist");
  if (fs.existsSync(metaFile)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
      check(meta.status === "done", `meta.status: expected "done", got "${meta.status}"`);
    } catch (e) {
      errors.push(`meta.json parse error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // ── Result ──────────────────────────────────────────────────────────────

  if (errors.length > 0) {
    console.error(`\nFAIL (${errors.length} assertion(s)):`);
    for (const err of errors) console.error(`  ✗ ${err}`);
    if (snapshot) console.error(`\nSnapshot:\n${JSON.stringify(snapshot, null, 2)}`);
    cleanup(tmpBase);
    process.exit(1);
  }

  console.log("\nOK (smoke passed)");
  cleanup(tmpBase);
  process.exit(0);
}

function cleanup(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

main().catch((err) => {
  console.error("Smoke test fatal:", err);
  process.exit(1);
});
