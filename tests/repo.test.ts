/**
 * Coverage for package-manager selection in src/core/repo.ts. jsInstallCmd
 * drives the worktree dependency bootstrap; picking npm in a Bun repo writes an
 * untracked package-lock.json that dirties a freshly-rehydrated worktree.
 */

import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { detectRepo, jsInstallCmd } from "../src/core/repo.ts";

function tmpDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test("jsInstallCmd prefers bun when a bun lockfile is present", () => {
  const root = tmpDir("forge-repo-bun-");
  try {
    fs.writeFileSync(path.join(root, "package.json"), "{}\n");
    fs.writeFileSync(path.join(root, "bun.lock"), "");
    assert.deepEqual(jsInstallCmd(root), ["bun", ["install"]]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("jsInstallCmd recognises the legacy binary bun.lockb", () => {
  const root = tmpDir("forge-repo-bunb-");
  try {
    fs.writeFileSync(path.join(root, "package.json"), "{}\n");
    fs.writeFileSync(path.join(root, "bun.lockb"), "");
    assert.deepEqual(jsInstallCmd(root), ["bun", ["install"]]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("jsInstallCmd picks pnpm and yarn by their lockfiles", () => {
  const pnpm = tmpDir("forge-repo-pnpm-");
  const yarn = tmpDir("forge-repo-yarn-");
  try {
    fs.writeFileSync(path.join(pnpm, "pnpm-lock.yaml"), "");
    assert.deepEqual(jsInstallCmd(pnpm), ["pnpm", ["install"]]);
    fs.writeFileSync(path.join(yarn, "yarn.lock"), "");
    assert.deepEqual(jsInstallCmd(yarn), ["yarn", ["install"]]);
  } finally {
    fs.rmSync(pnpm, { recursive: true, force: true });
    fs.rmSync(yarn, { recursive: true, force: true });
  }
});

test("jsInstallCmd falls back to npm for an unmarked repo", () => {
  const root = tmpDir("forge-repo-npm-");
  try {
    fs.writeFileSync(path.join(root, "package.json"), "{}\n");
    assert.deepEqual(jsInstallCmd(root), ["npm", ["install"]]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("quality commands use bun, not npm, in a bun repo", () => {
  const root = tmpDir("forge-repo-bun-quality-");
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    fs.writeFileSync(path.join(root, "bun.lock"), "");
    fs.writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ scripts: { lint: "biome check .", typecheck: "tsc --noEmit", test: "bun test" } }),
    );
    const profile = detectRepo(root);
    assert.deepEqual(profile?.qualityCommands, ["bun run lint", "bun run typecheck", "bun run test"]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
