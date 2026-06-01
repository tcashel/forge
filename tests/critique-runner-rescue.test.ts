/**
 * Critique runner sidecar-rescue behavior.
 *
 * The claude critique pipeline (`claude … | tee sidecar | filter`) can exit
 * non-zero AFTER emitting a complete, valid critique — a `claude` CLI that
 * exits non-zero post-result, a tee/filter hiccup, SIGPIPE — and with
 * `set -uo pipefail` that fails the whole pipeline. The runner now trusts the
 * sidecar's terminal `"type":"result"` event as the source of truth in both
 * directions: it force-fails a clean exit whose sidecar never produced a valid
 * result, and rescues a non-zero exit whose sidecar DID (plus a non-empty,
 * fenced `.md`).
 *
 * Asserts:
 *   - the generated run.sh carries a rescue-specific branch per claude slot
 *     (reachable only on non-zero original exit) — keyed on a token absent
 *     from the old force-fail-only path.
 *   - end-to-end: a fake `claude` that exits non-zero after writing a valid
 *     sidecar + fenced `.md` lands every slot `done` and the run reaches
 *     `done` (synthesizer runs).
 *   - an `is_error` terminal result is NOT rescued — the slot stays `failed`.
 *   - a valid terminal result with an empty/truncated `.md` is NOT rescued.
 */

import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { generateRunnerScript } from "../src/core/critique.ts";
import { type CritiqueMeta, ForgeStore } from "../src/core/store.ts";

const ALL_CLAUDE = {
  planId: "plan-r",
  critiqueId: "crit-r",
  specBody: "spec body",
  specTitle: "spec title",
  repoName: "repo-r",
  contextContent: null,
  criticA: { agent: "claude" as const, model: "opus" },
  criticB: { agent: "claude" as const, model: "opus" },
  synthesizer: { agent: "claude" as const, model: "opus" },
};

function seedMeta(store: ForgeStore, planId: string, critiqueId: string): void {
  const meta: CritiqueMeta = {
    schemaVersion: 1,
    planId,
    critiqueId,
    specTitle: "spec title",
    repoRoot: "/repo-r",
    repoName: "repo-r",
    status: "running_critics",
    startedAt: "2026-05-29T01:00:00.000Z",
    completedAt: null,
    viewedAt: null,
    tmuxSession: "forge-crit-r",
    criticA: { agent: "claude", model: "opus", status: "pending", durationMs: null },
    criticB: { agent: "claude", model: "opus", status: "pending", durationMs: null },
    synthesizer: { agent: "claude", model: "opus", status: "pending", durationMs: null },
  };
  store.writeCritiqueMeta(planId, critiqueId, meta);
}

/**
 * Write a fake `claude` onto a fresh PATH dir. It drains stdin, prints the
 * canned stream-json lines from `linesFile`, then exits `exitCode`. tee/filter
 * stay real, so the sidecar + `.md` are produced exactly as in production.
 */
function fakeClaudeBin(dir: string, linesFile: string, exitCode: number): string {
  const bin = path.join(dir, "bin");
  fs.mkdirSync(bin, { recursive: true });
  const script = `#!/usr/bin/env bash
cat > /dev/null
cat "${linesFile}"
exit ${exitCode}
`;
  const p = path.join(bin, "claude");
  fs.writeFileSync(p, script, { mode: 0o755 });
  return bin;
}

function resultLine(opts: { result: string; isError: boolean; stopReason: string }): string {
  return JSON.stringify({
    type: "result",
    subtype: opts.isError ? "error" : "success",
    is_error: opts.isError,
    duration_ms: 1000,
    num_turns: 1,
    result: opts.result,
    stop_reason: opts.stopReason,
    session_id: "fake",
    total_cost_usd: 0.01,
    usage: { input_tokens: 5, output_tokens: 6, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
  });
}

/** Run the generated runner with a fake claude; return the terminal meta. */
function runWithFakeClaude(
  binDir: string,
  runnerPath: string,
  store: ForgeStore,
  planId: string,
  critiqueId: string,
): CritiqueMeta {
  const env = { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ""}` };
  try {
    execSync(`bash '${runnerPath}'`, { stdio: "pipe", env });
  } catch {
    // Runner exits non-zero when a slot genuinely fails — meta still written.
  }
  const meta = store.readCritiqueMeta(planId, critiqueId);
  assert.ok(meta, "meta must exist after runner");
  return meta as CritiqueMeta;
}

function setup(): { forgeDir: string; store: ForgeStore; dir: string; repoRoot: string; runnerPath: string } {
  const forgeDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-rescue-"));
  const store = new ForgeStore({ forgeDir });
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-repo-"));
  const dir = store.getCritiqueDir(ALL_CLAUDE.planId, ALL_CLAUDE.critiqueId);
  fs.mkdirSync(dir, { recursive: true });
  // Critic prompt files are read via `< prompt`; they must exist or the
  // redirection fails before claude runs.
  fs.writeFileSync(path.join(dir, "critic-a.txt"), "prompt A");
  fs.writeFileSync(path.join(dir, "critic-b.txt"), "prompt B");
  seedMeta(store, ALL_CLAUDE.planId, ALL_CLAUDE.critiqueId);
  const cfg = { ...ALL_CLAUDE, repoRoot };
  const runnerPath = path.join(dir, "run.sh");
  fs.writeFileSync(runnerPath, generateRunnerScript(cfg, store), { mode: 0o755 });
  return { forgeDir, store, dir, repoRoot, runnerPath };
}

test("generated run.sh carries a rescue-specific branch for each claude slot", () => {
  const forgeDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-rescue-gen-"));
  try {
    const store = new ForgeStore({ forgeDir });
    fs.mkdirSync(store.getCritiqueDir(ALL_CLAUDE.planId, ALL_CLAUDE.critiqueId), { recursive: true });
    const script = generateRunnerScript({ ...ALL_CLAUDE, repoRoot: "/repo-r" }, store);
    // The "rescued" echo strings exist only on the new non-zero-exit branch;
    // the old force-fail-only path cannot green this.
    assert.ok(
      script.includes("(critic A: non-zero exit but valid result — rescued)"),
      "critic A rescue branch missing",
    );
    assert.ok(
      script.includes("(critic B: non-zero exit but valid result — rescued)"),
      "critic B rescue branch missing",
    );
    assert.ok(
      script.includes("(synthesizer: non-zero exit but valid result — rescued)"),
      "synthesizer rescue branch missing",
    );
    // Each rescue is reached via an elif on the slot's exit-code guard.
    assert.ok(script.includes("elif crit_slot_valid"), "rescue must branch off the exit-code guard");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("non-zero exit with a valid sidecar + fenced .md is rescued to done; synth runs", () => {
  const { forgeDir, store, dir, runnerPath } = setup();
  const binBase = fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-bin-"));
  try {
    // One canned result whose text carries BOTH fence markers, so the same
    // fake serves critic (forge-spec-critique) and synth (recommendations).
    const linesFile = path.join(binBase, "lines.jsonl");
    const text = "```forge-spec-critique\nfindings\n```\n\n```forge-spec-recommendations\nrecs\n```";
    fs.writeFileSync(
      linesFile,
      `${JSON.stringify({ type: "system", subtype: "init" })}\n${resultLine({ result: text, isError: false, stopReason: "end_turn" })}\n`,
    );
    const binDir = fakeClaudeBin(binBase, linesFile, 1); // non-zero exit after a valid result

    const meta = runWithFakeClaude(binDir, runnerPath, store, ALL_CLAUDE.planId, ALL_CLAUDE.critiqueId);

    assert.equal(meta.criticA.status, "done", "critic A should be rescued to done");
    assert.equal(meta.criticB.status, "done", "critic B should be rescued to done");
    assert.equal(meta.synthesizer.status, "done", "synthesizer should be rescued to done");
    assert.equal(meta.status, "done", "run should reach done");
    // Sidecar + fenced output really were produced.
    assert.ok(fs.readFileSync(path.join(dir, "critique-a.md"), "utf-8").includes("forge-spec-critique"));
    assert.ok(fs.existsSync(path.join(dir, "critique-a.stream.jsonl")));
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(binBase, { recursive: true, force: true });
  }
});

test("non-zero exit with an is_error terminal result is NOT rescued — stays failed", () => {
  const { forgeDir, store, runnerPath } = setup();
  const binBase = fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-bin-"));
  try {
    const linesFile = path.join(binBase, "lines.jsonl");
    fs.writeFileSync(
      linesFile,
      `${JSON.stringify({ type: "system", subtype: "init" })}\n${resultLine({ result: "", isError: true, stopReason: "error" })}\n`,
    );
    const binDir = fakeClaudeBin(binBase, linesFile, 1);

    const meta = runWithFakeClaude(binDir, runnerPath, store, ALL_CLAUDE.planId, ALL_CLAUDE.critiqueId);

    assert.equal(meta.criticA.status, "failed", "is_error result must stay failed");
    assert.equal(meta.status, "failed", "run must fail, not synthesize");
    assert.equal(meta.synthesizer.status, "pending", "synth must not run");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(binBase, { recursive: true, force: true });
  }
});

test("non-zero exit with a valid result but truncated .md is NOT rescued — stays failed", () => {
  const { forgeDir, store, runnerPath } = setup();
  const binBase = fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-bin-"));
  try {
    // Valid terminal success, but the result text has no fenced block, so the
    // projected .md is non-fenced — the .md gate must reject it.
    const linesFile = path.join(binBase, "lines.jsonl");
    fs.writeFileSync(
      linesFile,
      `${JSON.stringify({ type: "system", subtype: "init" })}\n${resultLine({ result: "no fence here", isError: false, stopReason: "end_turn" })}\n`,
    );
    const binDir = fakeClaudeBin(binBase, linesFile, 1);

    const meta = runWithFakeClaude(binDir, runnerPath, store, ALL_CLAUDE.planId, ALL_CLAUDE.critiqueId);

    assert.equal(meta.criticA.status, "failed", "valid sidecar but unfenced .md must stay failed");
    assert.equal(meta.status, "failed");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(binBase, { recursive: true, force: true });
  }
});
