/**
 * repo-fast — subprocess-free branch detection for the serve hot path.
 *
 * Cases mirror what `git rev-parse --abbrev-ref HEAD` (the helper this
 * replaces) reported: normal checkout, linked worktree (`.git` file with
 * gitdir pointer), detached HEAD ("HEAD"), and non-repos. Real git repos
 * are used so the on-disk shapes are authentic.
 */

import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { __resetRepoFastCache, readHeadBranch, repoQuickInfo } from "../src/core/repo-fast.ts";

// Same isolation as tests/worktrees.test.ts: a global commit.gpgsign=true
// (e.g. 1Password signing) would fail or hang every test commit.
const GIT_IDENTITY_FLAGS = [
  "-c",
  "user.name=Test",
  "-c",
  "user.email=test@example.com",
  "-c",
  "commit.gpgsign=false",
  "-c",
  "tag.gpgsign=false",
];

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", [...GIT_IDENTITY_FLAGS, ...args], {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" },
  }).trim();
}

function makeRepo(t: { after: (fn: () => void) => void }, branch = "main"): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-repofast-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  git(dir, "init", "-b", branch);
  git(dir, "commit", "--allow-empty", "-m", "init");
  return dir;
}

test("normal checkout reports its branch", (t) => {
  __resetRepoFastCache();
  const repo = makeRepo(t, "main");
  assert.equal(readHeadBranch(repo), "main");
  assert.deepEqual(repoQuickInfo(repo), { reachable: true, hasGit: true, branch: "main" });
});

test("branch with slashes is reported in full", (t) => {
  __resetRepoFastCache();
  const repo = makeRepo(t);
  git(repo, "checkout", "-b", "forge/lint-cleanup");
  assert.equal(readHeadBranch(repo), "forge/lint-cleanup");
});

test("linked worktree (.git file with gitdir pointer) reports its own branch", (t) => {
  __resetRepoFastCache();
  const repo = makeRepo(t);
  const wt = path.join(repo, "..", `${path.basename(repo)}-wt`);
  t.after(() => fs.rmSync(wt, { recursive: true, force: true }));
  git(repo, "worktree", "add", wt, "-b", "feature/wt-branch");

  assert.ok(fs.statSync(path.join(wt, ".git")).isFile(), "worktree .git must be a file");
  assert.equal(readHeadBranch(wt), "feature/wt-branch");
  assert.equal(readHeadBranch(repo), "main", "parent checkout unaffected");
  assert.deepEqual(repoQuickInfo(wt), { reachable: true, hasGit: true, branch: "feature/wt-branch" });
});

test("relative gitdir pointer resolves against the root", (t) => {
  __resetRepoFastCache();
  const repo = makeRepo(t);
  const fake = fs.mkdtempSync(path.join(os.tmpdir(), "forge-repofast-rel-"));
  t.after(() => fs.rmSync(fake, { recursive: true, force: true }));
  // Hand-build a `.git` file pointing back into the real repo's gitdir.
  const rel = path.relative(fake, path.join(repo, ".git"));
  fs.writeFileSync(path.join(fake, ".git"), `gitdir: ${rel}\n`);
  assert.equal(readHeadBranch(fake), "main");
});

test("detached HEAD reports HEAD, matching git rev-parse --abbrev-ref", (t) => {
  __resetRepoFastCache();
  const repo = makeRepo(t);
  const sha = git(repo, "rev-parse", "HEAD");
  git(repo, "checkout", "--detach", sha);
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), "HEAD");
  assert.equal(readHeadBranch(repo), "HEAD");
});

test("non-repo and missing paths", (t) => {
  __resetRepoFastCache();
  const plain = fs.mkdtempSync(path.join(os.tmpdir(), "forge-repofast-plain-"));
  t.after(() => fs.rmSync(plain, { recursive: true, force: true }));
  assert.deepEqual(repoQuickInfo(plain), { reachable: true, hasGit: false, branch: null });
  assert.deepEqual(repoQuickInfo(path.join(plain, "does-not-exist")), {
    reachable: false,
    hasGit: false,
    branch: null,
  });
  assert.deepEqual(repoQuickInfo("relative/path"), { reachable: false, hasGit: false, branch: null });
});

test("micro-TTL serves cached info, reset hook clears it", (t) => {
  __resetRepoFastCache();
  const repo = makeRepo(t);
  assert.equal(repoQuickInfo(repo).branch, "main");
  git(repo, "checkout", "-b", "after-cache");
  // Within the 2s TTL the cached branch is served…
  assert.equal(repoQuickInfo(repo).branch, "main");
  // …and the reset hook (or TTL expiry) picks up the new state.
  __resetRepoFastCache();
  assert.equal(repoQuickInfo(repo).branch, "after-cache");
});
