/**
 * Coverage for the safety verdict + inventory robustness in
 * src/core/worktrees.ts. Verdict tests exercise computeSafety directly
 * (no git required); inventory + rehydration tests spin up real
 * git repos under a tmp dir.
 */

import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { recordJobStarted, recordPlanCreated } from "../src/core/db/writes.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";
import {
  computeSafety,
  ensureWorktreeForBranch,
  isCleanMergedTarget,
  listWorktrees,
  parkWorktreeForTest,
  resolveMainWorktreeRoot,
  resolveWorktreeTarget,
  restoreFromTestState,
  type WorktreeEntry,
} from "../src/core/worktrees.ts";

function makeEntry(overrides: Partial<WorktreeEntry> = {}): WorktreeEntry {
  return {
    path: "/tmp/wt",
    branch: "feature",
    head: "deadbeef",
    prNumber: 1,
    prState: "open",
    planId: "plan-1",
    dirty: false,
    unpushed: false,
    unpushedReason: null,
    inFlight: false,
    managed: true,
    safety: "removable",
    reason: "",
    ...overrides,
  };
}

function tmpDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function gitRaw(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: "plan-test-1",
    title: "test",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/test",
    worktree: null,
    status: "draft",
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: "2026-04-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-test-1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
    ...overrides,
  };
}

// ─── computeSafety verdict matrix ────────────────────────────────────────────

test("computeSafety: unmanaged wins over everything else", () => {
  const out = computeSafety({
    managed: false,
    inFlight: true,
    dirty: true,
    unpushed: true,
    unpushedReason: null,
    prState: "merged",
  });
  assert.equal(out.safety, "unmanaged");
});

test("computeSafety: in-use overrides dirty/unpushed/state", () => {
  const out = computeSafety({
    managed: true,
    inFlight: true,
    dirty: true,
    unpushed: true,
    unpushedReason: null,
    prState: "open",
  });
  assert.equal(out.safety, "in-use");
});

test("computeSafety: dirty → unsafe", () => {
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: true,
    unpushed: false,
    unpushedReason: null,
    prState: "open",
  });
  assert.equal(out.safety, "unsafe");
});

test("computeSafety: unpushed + open PR → unsafe", () => {
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: false,
    unpushed: true,
    unpushedReason: "1 commit ahead",
    prState: "open",
  });
  assert.equal(out.safety, "unsafe");
});

test("computeSafety: squash-merge case — clean + merged + unpushed → safe", () => {
  // Squash-/rebase-merged PRs leave the local branch "ahead" forever.
  // Don't flag unsafe for those.
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: false,
    unpushed: true,
    unpushedReason: "3 commits ahead",
    prState: "merged",
  });
  assert.equal(out.safety, "safe");
});

test("computeSafety: clean + merged + pushed → safe", () => {
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: false,
    unpushed: false,
    unpushedReason: null,
    prState: "merged",
  });
  assert.equal(out.safety, "safe");
});

test("computeSafety: clean + closed + pushed → safe", () => {
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: false,
    unpushed: false,
    unpushedReason: null,
    prState: "closed",
  });
  assert.equal(out.safety, "safe");
});

test("computeSafety: clean + open + pushed → removable", () => {
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: false,
    unpushed: false,
    unpushedReason: null,
    prState: "open",
  });
  assert.equal(out.safety, "removable");
});

test("computeSafety: clean + unknown state → unknown (never safe)", () => {
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: false,
    unpushed: false,
    unpushedReason: null,
    prState: "unknown",
  });
  assert.equal(out.safety, "unknown");
});

test("isCleanMergedTarget: merged + safe → eligible", () => {
  assert.equal(isCleanMergedTarget(makeEntry({ safety: "safe", prState: "merged" })), true);
});

test("isCleanMergedTarget: closed (no merge) + safe → SKIP (must be removed explicitly)", () => {
  // Regression: clean-merged previously deleted closed-but-unmerged worktrees.
  // The spec reserves bulk-cleanup for merged PRs only.
  assert.equal(isCleanMergedTarget(makeEntry({ safety: "safe", prState: "closed" })), false);
});

test("isCleanMergedTarget: removable (open PR) → SKIP", () => {
  assert.equal(isCleanMergedTarget(makeEntry({ safety: "removable", prState: "open" })), false);
});

test("isCleanMergedTarget: unsafe → SKIP regardless of prState", () => {
  assert.equal(isCleanMergedTarget(makeEntry({ safety: "unsafe", prState: "merged" })), false);
});

test("computeSafety: clean + unlinked → removable (no PR yet)", () => {
  const out = computeSafety({
    managed: true,
    inFlight: false,
    dirty: false,
    unpushed: false,
    unpushedReason: null,
    prState: "unlinked",
  });
  assert.equal(out.safety, "removable");
});

// ─── inventory robustness ────────────────────────────────────────────────────

test("listWorktrees tolerates a Plan.worktree pointing at a non-existent directory", () => {
  const forgeDir = tmpDir("forge-wt-stale-");
  const repoDir = tmpDir("forge-wt-repo-");
  try {
    git(repoDir, ["init", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "hello\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);

    const store = new ForgeStore({ forgeDir });
    // Seed a plan whose recorded worktree path no longer exists.
    const plan = makePlan({
      repoRoot: repoDir,
      worktree: "/tmp/does-not-exist-forge-stale",
      prNumber: 42,
    });
    store.upsertPlan(plan);

    // listWorktrees should not throw and should simply skip the missing dir.
    const entries = listWorktrees(repoDir, store, { ghPrState: () => "open" });
    assert.equal(entries.length, 0);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }
});

test("listWorktrees annotates a live worktree with PR linkage + safety", () => {
  const forgeDir = tmpDir("forge-wt-list-");
  const repoDir = tmpDir("forge-wt-repo-");
  try {
    git(repoDir, ["init", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "hello\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);

    // Create a worktree under <parent>/worktrees/<branch> so the "managed"
    // path check succeeds.
    const worktreeRoot = path.join(path.dirname(repoDir), "worktrees");
    fs.mkdirSync(worktreeRoot, { recursive: true });
    const branch = "forge-test-branch";
    const wtPath = path.join(worktreeRoot, branch);
    git(repoDir, ["worktree", "add", "-b", branch, wtPath]);

    const store = new ForgeStore({ forgeDir });
    const plan = makePlan({
      id: "plan-wt-list",
      repoRoot: repoDir,
      branch,
      worktree: wtPath,
      prNumber: 99,
    });
    store.upsertPlan(plan);

    const entries = listWorktrees(repoDir, store, { ghPrState: () => "merged" });
    assert.equal(entries.length, 1);
    const e = entries[0];
    assert.equal(e.branch, branch);
    assert.equal(e.prNumber, 99);
    assert.equal(e.prState, "merged");
    assert.equal(e.managed, true);
    // Merged + clean + (likely) unpushed/no-upstream → still "safe" because
    // merged trumps unpushed.
    assert.equal(e.safety, "safe");

    const entriesFromLinkedWorktree = listWorktrees(wtPath, store, { ghPrState: () => "merged" });
    assert.equal(entriesFromLinkedWorktree.length, 1);
    assert.equal(entriesFromLinkedWorktree[0].managed, true);
    assert.equal(resolveMainWorktreeRoot(wtPath), fs.realpathSync(repoDir));
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(path.join(path.dirname(repoDir), "worktrees"), { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }
});

// ─── ensureWorktreeForBranch ─────────────────────────────────────────────────

test("ensureWorktreeForBranch is idempotent when a live worktree already exists for the branch", async () => {
  const repoDir = tmpDir("forge-wt-ensure-");
  try {
    git(repoDir, ["init", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "hello\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);

    const branch = "forge-ensure-test";
    const worktreeRoot = path.join(path.dirname(repoDir), "worktrees");
    fs.mkdirSync(worktreeRoot, { recursive: true });
    const wtPath = path.join(worktreeRoot, branch);
    git(repoDir, ["worktree", "add", "-b", branch, wtPath]);

    const realWt = fs.realpathSync(wtPath);
    const first = await ensureWorktreeForBranch(repoDir, branch);
    assert.equal(first.error, null);
    assert.equal(fs.realpathSync(first.worktreePath), realWt);
    assert.equal(first.rehydrated, false);

    const second = await ensureWorktreeForBranch(repoDir, branch);
    assert.equal(second.error, null);
    assert.equal(fs.realpathSync(second.worktreePath), realWt);
    assert.equal(second.rehydrated, false);
  } finally {
    fs.rmSync(path.join(path.dirname(repoDir), "worktrees"), { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }
});

test("ensureWorktreeForBranch returns an actionable error when the branch is checked out in the primary worktree", async () => {
  const root = tmpDir("forge-wt-primary-busy-");
  const remoteDir = path.join(root, "remote.git");
  const repoDir = path.join(root, "repo");
  try {
    gitRaw(["init", "--bare", remoteDir]);
    gitRaw(["clone", remoteDir, repoDir]);
    git(repoDir, ["checkout", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "main\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);
    git(repoDir, ["push", "-u", "origin", "HEAD:main"]);
    // Create the feature branch and leave the PRIMARY checkout sitting on it.
    git(repoDir, ["checkout", "-b", "feature"]);
    fs.writeFileSync(path.join(repoDir, "feature.txt"), "x\n");
    git(repoDir, ["add", "feature.txt"]);
    git(repoDir, ["commit", "-m", "feature"]);
    git(repoDir, ["push", "-u", "origin", "feature"]);

    const ensured = await ensureWorktreeForBranch(repoDir, "feature");
    assert.equal(ensured.worktreePath, "");
    assert.equal(ensured.rehydrated, false);
    assert.equal(ensured.errorCode, "BRANCH_BUSY_PRIMARY");
    assert.match(ensured.error ?? "", /git switch/);
  } finally {
    fs.rmSync(path.join(root, "worktrees"), { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("ensureWorktreeForBranch force-refreshes a stale local branch before rehydrating", async () => {
  const root = tmpDir("forge-wt-force-fetch-");
  const remoteDir = path.join(root, "remote.git");
  const repoDir = path.join(root, "repo");
  const otherDir = path.join(root, "other");
  try {
    gitRaw(["init", "--bare", remoteDir]);
    gitRaw(["clone", remoteDir, repoDir]);
    git(repoDir, ["checkout", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "main\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);
    git(repoDir, ["push", "-u", "origin", "HEAD:main"]);
    git(repoDir, ["checkout", "-b", "feature"]);
    fs.writeFileSync(path.join(repoDir, "feature.txt"), "old\n");
    git(repoDir, ["add", "feature.txt"]);
    git(repoDir, ["commit", "-m", "old feature"]);
    git(repoDir, ["push", "-u", "origin", "feature"]);
    git(repoDir, ["checkout", "main"]);

    gitRaw(["clone", remoteDir, otherDir]);
    git(otherDir, ["config", "user.email", "test@example.com"]);
    git(otherDir, ["config", "user.name", "Test"]);
    git(otherDir, ["checkout", "-B", "feature", "origin/main"]);
    fs.writeFileSync(path.join(otherDir, "feature.txt"), "new\n");
    git(otherDir, ["add", "feature.txt"]);
    git(otherDir, ["commit", "-m", "force-pushed feature"]);
    git(otherDir, ["push", "--force", "origin", "feature"]);
    const remoteSha = git(otherDir, ["rev-parse", "HEAD"]);

    const ensured = await ensureWorktreeForBranch(repoDir, "feature");
    assert.equal(ensured.error, null);
    assert.equal(git(ensured.worktreePath, ["rev-parse", "HEAD"]), remoteSha);
    assert.equal(fs.readFileSync(path.join(ensured.worktreePath, "feature.txt"), "utf-8"), "new\n");
  } finally {
    fs.rmSync(path.join(root, "worktrees"), { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("ensureWorktreeForBranch can rehydrate a fork PR via gh pr checkout fallback", async () => {
  const root = tmpDir("forge-wt-fork-pr-");
  const remoteDir = path.join(root, "remote.git");
  const repoDir = path.join(root, "repo");
  const fakeBin = path.join(root, "bin");
  try {
    gitRaw(["init", "--bare", remoteDir]);
    gitRaw(["clone", remoteDir, repoDir]);
    git(repoDir, ["checkout", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "main\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);
    git(repoDir, ["push", "-u", "origin", "HEAD:main"]);

    fs.mkdirSync(fakeBin, { recursive: true });
    const ghScript = path.join(fakeBin, "gh");
    fs.writeFileSync(
      ghScript,
      [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        'if [ "$1" = "pr" ] && [ "$2" = "checkout" ] && [ "$3" = "123" ]; then',
        "  git checkout -B fork-branch",
        "  exit 0",
        "fi",
        'echo "unexpected gh args: $*" >&2',
        "exit 1",
        "",
      ].join("\n"),
    );
    fs.chmodSync(ghScript, 0o755);

    const ensured = await ensureWorktreeForBranch(repoDir, "fork-branch", {
      prNumber: 123,
      ghEnv: { ...process.env, PATH: `${fakeBin}${path.delimiter}${process.env.PATH ?? ""}` },
    });
    assert.equal(ensured.error, null);
    assert.equal(ensured.rehydrated, true);
    assert.equal(git(ensured.worktreePath, ["branch", "--show-current"]), "fork-branch");
  } finally {
    fs.rmSync(path.join(root, "worktrees"), { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ─── target resolution ──────────────────────────────────────────────────────

test("resolveWorktreeTarget: numeric matches PR number", () => {
  const entries: WorktreeEntry[] = [
    {
      path: "/tmp/a",
      branch: "feature-a",
      head: "deadbeef",
      prNumber: 42,
      prState: "open",
      planId: "plan-a",
      dirty: false,
      unpushed: false,
      unpushedReason: null,
      inFlight: false,
      managed: true,
      safety: "removable",
      reason: "",
    },
  ];
  const r = resolveWorktreeTarget(entries, "42");
  assert.equal(r.kind, "ok");
  if (r.kind === "ok") assert.equal(r.entry.prNumber, 42);
});

test("resolveWorktreeTarget: branch name match", () => {
  const entries: WorktreeEntry[] = [
    {
      path: "/tmp/a",
      branch: "feature-a",
      head: "deadbeef",
      prNumber: null,
      prState: "unlinked",
      planId: null,
      dirty: false,
      unpushed: false,
      unpushedReason: null,
      inFlight: false,
      managed: true,
      safety: "removable",
      reason: "",
    },
  ];
  const r = resolveWorktreeTarget(entries, "feature-a");
  assert.equal(r.kind, "ok");
});

test("resolveWorktreeTarget: numeric collides with a branch literally named that number", () => {
  const entries: WorktreeEntry[] = [
    {
      path: "/tmp/a",
      branch: "42",
      head: "x",
      prNumber: null,
      prState: "unlinked",
      planId: null,
      dirty: false,
      unpushed: false,
      unpushedReason: null,
      inFlight: false,
      managed: true,
      safety: "removable",
      reason: "",
    },
    {
      path: "/tmp/b",
      branch: "feature-b",
      head: "y",
      prNumber: 42,
      prState: "open",
      planId: "plan-b",
      dirty: false,
      unpushed: false,
      unpushedReason: null,
      inFlight: false,
      managed: true,
      safety: "removable",
      reason: "",
    },
  ];
  const r = resolveWorktreeTarget(entries, "42");
  assert.equal(r.kind, "ambiguous");
});

test("restoreFromTestState restores main before reattaching the parked worktree", () => {
  const forgeDir = tmpDir("forge-wt-restore-state-");
  const repoDir = tmpDir("forge-wt-restore-repo-");
  try {
    git(repoDir, ["init", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "main\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);

    const branch = "restore-branch";
    const worktreeRoot = path.join(path.dirname(repoDir), "worktrees");
    fs.mkdirSync(worktreeRoot, { recursive: true });
    const wtPath = path.join(worktreeRoot, branch);
    git(repoDir, ["worktree", "add", "-b", branch, wtPath]);

    const store = new ForgeStore({ forgeDir });
    const entry = makeEntry({ path: wtPath, branch, safety: "removable" });
    parkWorktreeForTest(store, repoDir, entry);
    assert.equal(git(repoDir, ["branch", "--show-current"]), branch);
    assert.equal(git(wtPath, ["branch", "--show-current"]), "");

    const restored = restoreFromTestState(store, repoDir);
    assert.equal(restored.restoredTo, "main");
    assert.equal(git(repoDir, ["branch", "--show-current"]), "main");
    assert.equal(git(wtPath, ["branch", "--show-current"]), branch);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(path.join(path.dirname(repoDir), "worktrees"), { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }
});

// ─── linkage via jobs table (no Plan.worktree) ─────────────────────────────

test("listWorktrees derives linkage from jobs.worktree_path when Plan.worktree is null", () => {
  const forgeDir = tmpDir("forge-wt-jobs-");
  const repoDir = tmpDir("forge-wt-repo-");
  try {
    git(repoDir, ["init", "-b", "main"]);
    git(repoDir, ["config", "user.email", "test@example.com"]);
    git(repoDir, ["config", "user.name", "Test"]);
    fs.writeFileSync(path.join(repoDir, "README.md"), "hello\n");
    git(repoDir, ["add", "README.md"]);
    git(repoDir, ["commit", "-m", "init"]);

    const branch = "forge-job-link";
    const worktreeRoot = path.join(path.dirname(repoDir), "worktrees");
    fs.mkdirSync(worktreeRoot, { recursive: true });
    const wtPath = path.join(worktreeRoot, branch);
    git(repoDir, ["worktree", "add", "-b", branch, wtPath]);

    const store = new ForgeStore({ forgeDir });
    const plan = makePlan({
      id: "plan-job-link",
      repoRoot: repoDir,
      branch,
      worktree: null, // intentionally null
      prNumber: 7,
    });
    store.upsertPlan(plan);
    recordPlanCreated(store.db.db, plan, "# spec");

    const meta: RunMeta = {
      planId: plan.id,
      tmuxSession: "forge-job-link",
      logFile: "/tmp/log",
      agent: "claude",
      model: "claude-opus-4-7",
      worktree: wtPath,
      status: "running",
      startedAt: "2026-04-01T01:00:00.000Z",
      prUrl: null,
    };
    recordJobStarted(store.db.db, plan, meta);

    const entries = listWorktrees(repoDir, store, { ghPrState: () => "open" });
    assert.equal(entries.length, 1);
    assert.equal(entries[0].prNumber, 7);
    assert.equal(entries[0].managed, true);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(path.join(path.dirname(repoDir), "worktrees"), { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }
});
