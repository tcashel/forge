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

test("formatCommand picks a write-mode `format` script and refuses check-mode ones", () => {
  const writable = tmpDir("forge-repo-fmt-write-");
  const checkOnly = tmpDir("forge-repo-fmt-check-");
  const none = tmpDir("forge-repo-fmt-none-");
  try {
    for (const root of [writable, checkOnly, none]) {
      execFileSync("git", ["init", "-q"], { cwd: root });
      fs.writeFileSync(path.join(root, "bun.lock"), "");
    }
    fs.writeFileSync(
      path.join(writable, "package.json"),
      JSON.stringify({ scripts: { format: "biome format --write ." } }),
    );
    fs.writeFileSync(
      path.join(checkOnly, "package.json"),
      JSON.stringify({ scripts: { format: "prettier --check ." } }),
    );
    fs.writeFileSync(path.join(none, "package.json"), JSON.stringify({ scripts: { lint: "biome check ." } }));

    assert.equal(detectRepo(writable)?.formatCommand, "bun run format");
    assert.equal(detectRepo(checkOnly)?.formatCommand, null, "check-mode format script must not be auto-run");
    assert.equal(detectRepo(none)?.formatCommand, null);

    // A write-mode `check` script wins over `format` — it also applies safe
    // lint fixes (import ordering), not just formatting.
    fs.writeFileSync(
      path.join(writable, "package.json"),
      JSON.stringify({ scripts: { format: "biome format --write .", check: "biome check --write ." } }),
    );
    assert.equal(detectRepo(writable)?.formatCommand, "bun run check");
  } finally {
    fs.rmSync(writable, { recursive: true, force: true });
    fs.rmSync(checkOnly, { recursive: true, force: true });
    fs.rmSync(none, { recursive: true, force: true });
  }
});

test("formatCommand for rust is cargo fmt", () => {
  const root = tmpDir("forge-repo-fmt-rust-");
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    fs.writeFileSync(path.join(root, "Cargo.toml"), '[package]\nname = "x"\n');
    assert.equal(detectRepo(root)?.formatCommand, "cargo fmt");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
