/**
 * Coverage for package-manager selection in src/core/repo.ts. jsInstallCmd
 * drives the worktree dependency bootstrap; picking npm in a Bun repo writes an
 * untracked package-lock.json that dirties a freshly-rehydrated worktree.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { jsInstallCmd } from "../src/core/repo.ts";

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
