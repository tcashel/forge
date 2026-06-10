/**
 * Docs-alignment regression tests (F0 "Docs match behavior").
 *
 * Guards the Wave-2 documentation fixes:
 *  - README documents the full public CLI surface (docs-readme-cli-drift)
 *  - README documents the review pipeline, FORGE_HOME, and timeout keys
 *  - strategy docs no longer teach the archived Track B plan
 *    (docs-vision-buildpath-contradict-roadmap)
 *  - reviewer skill no longer describes the never-implemented
 *    publishReviewToGitHub dual gate (ADR-0031)
 *  - SCHEMA.md factual drift (docs-schema-doc-drift)
 *
 * Pure file reads — no ~/.forge access, no subprocesses.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { PLAN_STATUSES } from "../src/core/store.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

// ─── README — CLI surface ────────────────────────────────────────────────────

test("README documents every public CLI command dispatched in main.ts", () => {
  const main = read("src/cli/main.ts");
  const readme = read("README.md");
  // Public verbs from the dispatch switch; internal workers are __-prefixed.
  const cases = [...main.matchAll(/case "([^"]+)":/g)].map((m) => m[1]).filter((c) => !c.startsWith("__"));
  assert.ok(cases.length >= 18, `expected the full dispatch list, got ${cases.length}`);
  for (const cmd of cases) {
    assert.ok(readme.includes(`forge ${cmd}`), `README.md is missing public command: forge ${cmd}`);
  }
});

test("README documents the spec subverbs from spec.ts HELP", () => {
  const readme = read("README.md");
  for (const sub of ["spec save", "spec ls", "spec show", "spec improve", "spec diff", "spec archive"]) {
    assert.ok(readme.includes(`forge ${sub}`), `README.md is missing: forge ${sub}`);
  }
  assert.match(readme, /auto-improve/, "README must mention spec save's default auto-improve loop");
  assert.match(readme, /--no-improve/, "README must mention --no-improve");
});

test("README documents the review pipeline contract", () => {
  const readme = read("README.md");
  for (const needle of [
    "--run",
    "--publish",
    "--publish-only",
    "publish.json",
    "findings.json",
    "forge-finding",
    "at-least-once",
  ]) {
    assert.ok(readme.includes(needle), `README review section is missing: ${needle}`);
  }
  // Exit codes for --run / --publish-only (0/1/4) and per-finding outcomes.
  assert.match(readme, /`0` success, `1` review failed[\s\S]*`4` publish failed/);
  for (const outcome of ["posted", "already-published", "out-of-diff-posted", "failed"]) {
    assert.ok(readme.includes(outcome), `README is missing per-finding outcome: ${outcome}`);
  }
});

test("README documents FORGE_HOME, the state layout, and timeout config keys", () => {
  const readme = read("README.md");
  assert.ok(readme.includes("FORGE_HOME"), "README must document FORGE_HOME");
  for (const entry of ["forge.db", "plan-drafts", "repo-config.json", "index.json"]) {
    assert.ok(readme.includes(entry), `README state layout is missing: ${entry}`);
  }
  for (const key of ["agentTimeoutMinutes", "reviewerTimeoutMinutes", "fixerTimeoutMinutes"]) {
    assert.ok(readme.includes(key), `README is missing config key: ${key}`);
  }
});

test("README lists every skill directory and every plan status", () => {
  const readme = read("README.md");
  const skillDirs = fs
    .readdirSync(path.join(ROOT, "skills"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  assert.ok(skillDirs.length >= 7, `expected >= 7 skills, found ${skillDirs.length}`);
  for (const dir of skillDirs) {
    assert.ok(readme.includes(dir), `README repo layout is missing skill: ${dir}`);
  }
  for (const status of PLAN_STATUSES) {
    assert.ok(readme.includes(`\`${status}\``), `README task-status list is missing: ${status}`);
  }
  assert.match(readme, /python3/, "README prerequisites must include python3 (launch runner dependency)");
});

// ─── Strategy docs — Track B is archived ─────────────────────────────────────

test("strategy docs say Forge is the deliverable, not a prototype for a Rust product", () => {
  for (const rel of ["CLAUDE.md", "docs/README.md", "docs/VISION.md"]) {
    assert.ok(read(rel).includes("is the deliverable"), `${rel} must state that Forge is the deliverable`);
  }
  const claude = read("CLAUDE.md");
  assert.ok(!claude.includes("eventual paid product"), "CLAUDE.md still teaches the archived Track B plan");
  assert.ok(!claude.includes("prototype track"), "CLAUDE.md still calls Forge the prototype track");

  const docsIndex = read("docs/README.md");
  assert.ok(!docsIndex.includes("Track B begins"), "docs/README.md still describes the Track B gate as current");
  assert.ok(docsIndex.includes("archive/ROADMAP-track-b-juicer.md"), "docs/README.md must point at the archive");

  const vision = read("docs/VISION.md");
  assert.ok(!vision.includes("gets rebuilt in Rust + GPUI"), "VISION.md still promises the Rust rebuild");
  assert.ok(!vision.includes("Track B begins when"), "VISION.md still describes the Track B gate as current");

  const buildPath = read("docs/BUILD_PATH.md");
  assert.match(buildPath, /Archived 2026-06/, "BUILD_PATH.md must be marked as the archived plan");
});

// ─── Reviewer skill — publish gate matches ADR-0031 ──────────────────────────

test("forge-reviewer skill describes the per-request publish gate, not the dual config gate", () => {
  const skill = read("skills/forge-reviewer/SKILL.md");
  assert.ok(!skill.includes("publishReviewToGitHub"), "SKILL.md still references the never-implemented config gate");
  assert.ok(skill.includes("--publish-only"), "SKILL.md must mention the retry verb");
  assert.ok(skill.includes("ADR-0031"), "SKILL.md must reference ADR-0031");
  assert.ok(skill.includes("forge-finding"), "SKILL.md must keep the idempotent marker description");
});

// ─── SCHEMA.md — factual drift ───────────────────────────────────────────────

test("SCHEMA.md matches the migrations on disk", () => {
  const schema = read("docs/SCHEMA.md");
  assert.ok(!schema.includes("All IDs are UUIDs"), "SCHEMA.md still claims IDs are UUIDs (they are slugs)");
  const migrationFiles = fs.readdirSync(path.join(ROOT, "migrations")).filter((f) => f.endsWith(".sql"));
  for (const file of migrationFiles) {
    assert.ok(schema.includes(file), `SCHEMA.md does not mention applied migration ${file}`);
  }
  assert.ok(
    !schema.includes("juicer-storage"),
    "SCHEMA.md still claims migrations are mirrored into the Track B crate",
  );
});
