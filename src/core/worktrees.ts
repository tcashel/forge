/**
 * Worktree inventory + safety status + rehydration.
 *
 * Ground truth is `git worktree list --porcelain` — the DB
 * (`jobs.worktree_path`, `Plan.worktree`) is annotation only.
 *
 * The safety verdict is evaluated top-down (first match wins):
 *   unmanaged → in-use → unsafe → safe → removable → unknown
 *
 * See ADR-0024 for the lifecycle decision.
 */

import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { createWorktree, detectRepo } from "./repo.ts";
import type { ForgeStore } from "./store.ts";

export type WorktreeSafety = "unmanaged" | "in-use" | "unsafe" | "safe" | "removable" | "unknown";

export type WorktreePrState = "open" | "merged" | "closed" | "unknown" | "unlinked";

export interface WorktreeEntry {
  /** Absolute filesystem path. */
  path: string;
  /** Current branch (or null for detached HEAD). */
  branch: string | null;
  /** HEAD SHA. */
  head: string;
  /** PR number derived from the linked plan (if any). */
  prNumber: number | null;
  /** GitHub PR state (open|merged|closed|unknown|unlinked). */
  prState: WorktreePrState;
  /** Linked plan id (newest plan with prNumber matching this worktree). */
  planId: string | null;
  /** Working tree has uncommitted changes. */
  dirty: boolean;
  /** Commits not pushed to tracked remote (or upstream unresolvable). */
  unpushed: boolean;
  /** Why `unpushed` is true (e.g. "no upstream", "git fetch failed"). */
  unpushedReason: string | null;
  /** A `sessions` row with state='running' has this path as its cwd. */
  inFlight: boolean;
  /** Worktree path is inside `<parent>/worktrees/` AND has a Forge linkage. */
  managed: boolean;
  /** Computed safety verdict. */
  safety: WorktreeSafety;
  /** Short, human-readable reason explaining the verdict (UI surface). */
  reason: string;
}

export interface ListWorktreesOptions {
  /**
   * Override `gh pr view` for tests. Receives the PR number; returns the
   * resolved state or null for "unknown".
   */
  ghPrState?: (prNumber: number, repoRoot: string) => WorktreePrState | null;
}

export interface EnsureWorktreeOptions {
  onProgress?: (msg: string) => void;
}

/**
 * List every git worktree for this repo (excluding the main checkout)
 * annotated with PR/branch linkage + a safety verdict.
 *
 * Listing never throws: a stale `jobs.worktree_path` pointing at a
 * directory that's been removed out-of-band simply doesn't appear.
 */
export function listWorktrees(repoRoot: string, store: ForgeStore, opts: ListWorktreesOptions = {}): WorktreeEntry[] {
  const rawWorktrees = readWorktreesPorcelain(repoRoot);
  const realRepoRoot = realPathOrSelf(repoRoot);
  const repoBase = path.join(path.dirname(realRepoRoot), "worktrees");
  const runningCwds = readRunningSessionCwds(store);
  const prStateCache = new Map<number, WorktreePrState>();
  const resolvePrState = (prNumber: number): WorktreePrState => {
    if (prStateCache.has(prNumber)) return prStateCache.get(prNumber) as WorktreePrState;
    const v = opts.ghPrState ? opts.ghPrState(prNumber, repoRoot) : queryPrState(prNumber, repoRoot);
    const finalV = v ?? "unknown";
    prStateCache.set(prNumber, finalV);
    return finalV;
  };

  const result: WorktreeEntry[] = [];
  for (const raw of rawWorktrees) {
    if (samePath(raw.path, realRepoRoot)) continue; // main checkout
    if (!fs.existsSync(raw.path)) continue; // out-of-band removed
    const linkage = derivePlanLinkage(store, repoRoot, raw.path, raw.branch);
    const prState: WorktreePrState = linkage.prNumber == null ? "unlinked" : resolvePrState(linkage.prNumber);
    const dirty = computeDirty(raw.path);
    const { unpushed, unpushedReason } = computeUnpushed(raw.path);
    const inFlight = runningCwds.has(raw.path);
    const insideForgeRoot = isInsideDir(raw.path, repoBase);
    const managed = insideForgeRoot && (linkage.planId != null || linkage.prNumber != null);
    const { safety, reason } = computeSafety({
      managed,
      inFlight,
      dirty,
      unpushed,
      unpushedReason,
      prState,
    });
    result.push({
      path: raw.path,
      branch: raw.branch,
      head: raw.head,
      prNumber: linkage.prNumber,
      prState,
      planId: linkage.planId,
      dirty,
      unpushed,
      unpushedReason,
      inFlight,
      managed,
      safety,
      reason,
    });
  }
  return result.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Inputs to `computeSafety`. Extracted so unit tests can exercise the
 * verdict matrix without spinning up a real git repo.
 */
export interface SafetyInputs {
  managed: boolean;
  inFlight: boolean;
  dirty: boolean;
  unpushed: boolean;
  unpushedReason: string | null;
  prState: WorktreePrState;
}

export function computeSafety(i: SafetyInputs): { safety: WorktreeSafety; reason: string } {
  // 1) unmanaged — outside <parent>/worktrees/ OR has no Forge linkage.
  if (!i.managed) {
    return { safety: "unmanaged", reason: "Not a Forge-managed worktree (no plan/job linkage)." };
  }
  // 2) in-use — a running session pins it.
  if (i.inFlight) {
    return { safety: "in-use", reason: "A Forge session is running here." };
  }
  // 3) unsafe — local work could be lost.
  if (i.dirty) {
    return { safety: "unsafe", reason: "Worktree has uncommitted local changes." };
  }
  if (i.unpushed) {
    // A merged PR's local commits are by definition redundant (squash/rebase
    // merges leave the local branch "ahead" forever). Don't flag unsafe.
    if (i.prState !== "merged") {
      return { safety: "unsafe", reason: i.unpushedReason ?? "Local commits not pushed to upstream." };
    }
  }
  // 4) unknown PR state — never safe.
  if (i.prState === "unknown") {
    return { safety: "unknown", reason: "Could not resolve PR state — verify manually before removing." };
  }
  // 5) unlinked — clean, no PR linkage. Treat as removable (operator may
  //    have launched then abandoned before opening a PR).
  if (i.prState === "unlinked") {
    return { safety: "removable", reason: "Clean worktree with no linked PR." };
  }
  // 6) safe — clean and the PR is merged or closed.
  if (i.prState === "merged" || i.prState === "closed") {
    return {
      safety: "safe",
      reason: i.prState === "merged" ? "PR merged — safe to delete." : "PR closed — safe to delete.",
    };
  }
  // 7) removable — clean, pushed, PR open.
  return { safety: "removable", reason: "Clean and pushed; PR still open." };
}

/**
 * Rehydration primitive — guarantees a worktree exists for `branch`.
 *
 * If a worktree is already checked out at `branch`, returns its path
 * unchanged (idempotent). Otherwise fetches `branch` from the remote
 * and creates a worktree checked out to the existing branch.
 *
 * Bootstrap (deps install) runs only when the path lacks the stack's
 * marker file (node_modules/, .venv/). Bootstrap failure is non-fatal —
 * quality gates failing downstream is the visible signal.
 */
export async function ensureWorktreeForBranch(
  repoRoot: string,
  branch: string,
  opts: EnsureWorktreeOptions = {},
): Promise<{ worktreePath: string; rehydrated: boolean; error: string | null }> {
  const onProgress = opts.onProgress ?? (() => {});

  // 1) If we already have a live worktree on this branch, reuse it.
  const existing = readWorktreesPorcelain(repoRoot).find(
    (wt) => wt.path !== repoRoot && wt.branch === branch && fs.existsSync(wt.path),
  );
  if (existing) {
    return { worktreePath: existing.path, rehydrated: false, error: null };
  }

  // 2) Fetch the branch ref from the remote so `git worktree add <path> <branch>` resolves.
  try {
    execFileSync("git", ["-C", repoRoot, "fetch", "origin", `${branch}:${branch}`], {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60_000,
    });
  } catch {
    // Branch may already be local — try fetching the remote ref without forcing.
    // If neither works the branch is genuinely gone; surface a NO_WORKTREE-class error.
    try {
      execFileSync("git", ["-C", repoRoot, "fetch", "origin", branch], {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 60_000,
      });
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : String(e2);
      return {
        worktreePath: "",
        rehydrated: false,
        error: `git fetch origin ${branch} failed: ${msg}`,
      };
    }
  }

  // 3) Create the worktree against the existing branch.
  const repo = detectRepo(repoRoot);
  if (!repo) {
    return { worktreePath: "", rehydrated: false, error: `Not a git repo: ${repoRoot}` };
  }
  const create = await createWorktree(repoRoot, branch, repo.worktreeScript, repo.stack, {
    onProgress,
    mode: "checkout-existing",
  });
  if (create.error) {
    return { worktreePath: create.worktreePath, rehydrated: false, error: create.error };
  }
  return { worktreePath: create.worktreePath, rehydrated: true, error: null };
}

/**
 * Remove a worktree from disk (best-effort) + clear `Plan.worktree` for
 * any linked plan(s). Branch refs are never touched. `jobs` rows are
 * left as history.
 *
 * Caller is responsible for safety checks — this function only knows
 * how to remove. Pass `force=true` to add `--force` to git.
 */
export function removeWorktreeUnsafe(
  repoRoot: string,
  worktreePath: string,
  opts: { force?: boolean; store: ForgeStore },
): { ok: boolean; error: string | null } {
  const args = ["worktree", "remove"];
  if (opts.force) args.push("--force");
  args.push(worktreePath);
  try {
    execFileSync("git", ["-C", repoRoot, ...args], { stdio: ["pipe", "pipe", "pipe"], timeout: 30_000 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
  // Clear Plan.worktree for any plan that still points at this path. We
  // leave jobs.worktree_path alone — it's append-only history.
  try {
    const plans = opts.store.getPlans(repoRoot);
    for (const plan of plans) {
      if (plan.worktree === worktreePath) {
        opts.store.upsertPlan({ ...plan, worktree: null });
      }
    }
  } catch {
    /* annotation only — never fail the remove on this */
  }
  return { ok: true, error: null };
}

// ─── helpers ─────────────────────────────────────────────────────────────────

interface RawWorktree {
  path: string;
  branch: string | null;
  head: string;
}

function readWorktreesPorcelain(repoRoot: string): RawWorktree[] {
  let out = "";
  try {
    out = execFileSync("git", ["-C", repoRoot, "worktree", "list", "--porcelain"], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 10_000,
    });
  } catch {
    return [];
  }
  const result: RawWorktree[] = [];
  let current: Partial<RawWorktree> | null = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) {
      if (current?.path) result.push({ path: current.path, branch: current.branch ?? null, head: current.head ?? "" });
      current = { path: line.slice(9).trim() };
    } else if (line.startsWith("HEAD ")) {
      if (current) current.head = line.slice(5).trim();
    } else if (line.startsWith("branch ")) {
      if (current) {
        const ref = line.slice(7).trim();
        current.branch = ref.startsWith("refs/heads/") ? ref.slice("refs/heads/".length) : ref;
      }
    } else if (line.trim() === "" && current?.path) {
      result.push({ path: current.path, branch: current.branch ?? null, head: current.head ?? "" });
      current = null;
    }
  }
  if (current?.path) {
    result.push({ path: current.path, branch: current.branch ?? null, head: current.head ?? "" });
  }
  return result;
}

function readRunningSessionCwds(store: ForgeStore): Set<string> {
  const cwds = new Set<string>();
  try {
    const rows = store.db.db
      .prepare("SELECT cwd FROM sessions WHERE state = 'running' AND cwd IS NOT NULL")
      .all() as Array<{ cwd: string | null }>;
    for (const row of rows) {
      if (row.cwd) cwds.add(row.cwd);
    }
  } catch {
    /* DB hiccups don't disable the inventory */
  }
  return cwds;
}

interface LinkageResult {
  planId: string | null;
  prNumber: number | null;
}

function derivePlanLinkage(
  store: ForgeStore,
  repoRoot: string,
  worktreePath: string,
  branch: string | null,
): LinkageResult {
  try {
    const plans = store.getPlans(repoRoot).filter((p) => p.status !== "archived");
    // Prefer plan where worktree path matches exactly. Path comparison is
    // realpath-aware so /tmp vs /private/tmp on macOS doesn't drop the link.
    let candidates = plans.filter((p) => p.worktree && samePath(p.worktree, worktreePath));
    if (candidates.length === 0 && branch) {
      candidates = plans.filter((p) => p.branch === branch);
    }
    if (candidates.length === 0) {
      // Fall back to the jobs table — the worktree may pre-date the
      // dual-write window where Plan.worktree was populated. Try the
      // requested path first, then the realpath form.
      try {
        const realPath = realPathOrSelf(worktreePath);
        const row = store.db.db
          .prepare(
            `SELECT t.plan_id AS planId
               FROM jobs j JOIN tasks t ON j.task_id = t.id
               WHERE j.worktree_path IN (?, ?)
               ORDER BY COALESCE(j.started_at, '') DESC, j.run_number DESC
               LIMIT 1`,
          )
          .get(worktreePath, realPath) as { planId: string | null } | undefined;
        if (row?.planId) {
          const plan = store.getPlan(row.planId);
          if (plan) candidates = [plan];
        }
      } catch {
        /* fall through */
      }
    }
    if (candidates.length === 0) return { planId: null, prNumber: null };
    const newest = [...candidates].sort((a, b) => {
      const aKey = a.completedAt ?? a.launchedAt ?? a.createdAt;
      const bKey = b.completedAt ?? b.launchedAt ?? b.createdAt;
      return bKey.localeCompare(aKey);
    })[0];
    return { planId: newest.id, prNumber: newest.prNumber ?? null };
  } catch {
    return { planId: null, prNumber: null };
  }
}

function queryPrState(prNumber: number, repoRoot: string): WorktreePrState {
  try {
    const out = execFileSync("gh", ["pr", "view", String(prNumber), "--json", "state,mergedAt"], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: repoRoot,
      timeout: 10_000,
    }).trim();
    const parsed = JSON.parse(out) as { state?: string; mergedAt?: string | null };
    const state = (parsed.state ?? "").toUpperCase();
    if (state === "MERGED" || parsed.mergedAt) return "merged";
    if (state === "CLOSED") return "closed";
    if (state === "OPEN") return "open";
    return "unknown";
  } catch {
    return "unknown";
  }
}

function computeDirty(worktreePath: string): boolean {
  try {
    const out = execFileSync("git", ["-C", worktreePath, "status", "--porcelain"], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 10_000,
    });
    return out.trim().length > 0;
  } catch {
    // If we can't tell, be conservative — treat as dirty so we don't
    // bulk-delete a worktree in a weird state.
    return true;
  }
}

function computeUnpushed(worktreePath: string): { unpushed: boolean; unpushedReason: string | null } {
  // Detect detached HEAD first.
  let branch = "";
  try {
    branch = execFileSync("git", ["-C", worktreePath, "branch", "--show-current"], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 5_000,
    }).trim();
  } catch (e) {
    return { unpushed: true, unpushedReason: `git branch --show-current failed: ${(e as Error).message}` };
  }
  if (!branch) {
    return { unpushed: true, unpushedReason: "detached HEAD — no branch to track" };
  }

  // Best-effort upstream resolution.
  let upstream = "";
  try {
    upstream = execFileSync(
      "git",
      ["-C", worktreePath, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 5_000 },
    ).trim();
  } catch {
    return { unpushed: true, unpushedReason: "no upstream configured for branch" };
  }
  if (!upstream) return { unpushed: true, unpushedReason: "no upstream configured for branch" };

  // Best-effort fetch so we compare against an up-to-date remote ref.
  // A failed fetch is reported (network down, deleted remote) but doesn't
  // get treated as silently safe.
  let fetchFailed = false;
  try {
    execFileSync("git", ["-C", worktreePath, "fetch", "--quiet"], {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 15_000,
    });
  } catch {
    fetchFailed = true;
  }

  try {
    const ahead = execFileSync("git", ["-C", worktreePath, "rev-list", "--count", `${upstream}..HEAD`], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 5_000,
    }).trim();
    const aheadCount = Number.parseInt(ahead, 10);
    if (!Number.isFinite(aheadCount)) {
      return { unpushed: true, unpushedReason: "git rev-list returned non-numeric output" };
    }
    if (aheadCount === 0) {
      return fetchFailed
        ? { unpushed: true, unpushedReason: "git fetch failed — could not verify upstream state" }
        : { unpushed: false, unpushedReason: null };
    }
    return { unpushed: true, unpushedReason: `${aheadCount} commit(s) ahead of ${upstream}` };
  } catch (e) {
    return { unpushed: true, unpushedReason: `git rev-list failed: ${(e as Error).message}` };
  }
}

function isInsideDir(p: string, dir: string): boolean {
  const normP = realPathOrSelf(p);
  const normDir = realPathOrSelf(dir);
  return normP === normDir || normP.startsWith(`${normDir}${path.sep}`);
}

/**
 * Resolve symlinks when possible. macOS surfaces tmp paths as
 * `/private/tmp/...` via `git worktree list` but as `/tmp/...` from
 * mkdtempSync — pretending they're the same string drops links.
 */
function realPathOrSelf(p: string): string {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

function samePath(a: string, b: string): boolean {
  return realPathOrSelf(a) === realPathOrSelf(b);
}

/**
 * Cheap, PR-detail-friendly worktree snapshot. Skips the gh PR state
 * lookup + `git fetch` — only checks local state — so it's safe to call
 * for every PR on the PrList. Returns null when there's no Forge-managed
 * worktree linked to the PR.
 */
export interface WorktreeChipInfo {
  path: string;
  safety: WorktreeSafety;
  reason: string;
}

export function summarizeWorktreeForPr(store: ForgeStore, repoRoot: string, prNumber: number): WorktreeChipInfo | null {
  try {
    const candidates = store.getPlans(repoRoot).filter((p) => p.status !== "archived" && p.prNumber === prNumber);
    if (candidates.length === 0) return null;
    const newest = [...candidates].sort((a, b) => {
      const aKey = a.completedAt ?? a.launchedAt ?? a.createdAt;
      const bKey = b.completedAt ?? b.launchedAt ?? b.createdAt;
      return bKey.localeCompare(aKey);
    })[0];
    const recordedPath = newest.worktree ?? null;
    if (!recordedPath) {
      // Look up via jobs as a fallback.
      let fallback: string | null = null;
      try {
        const row = store.db.db
          .prepare(
            `SELECT j.worktree_path AS path
               FROM jobs j JOIN tasks t ON j.task_id = t.id
               WHERE t.plan_id = ? AND j.worktree_path IS NOT NULL
               ORDER BY COALESCE(j.started_at, '') DESC, j.run_number DESC
               LIMIT 1`,
          )
          .get(newest.id) as { path: string | null } | undefined;
        fallback = row?.path ?? null;
      } catch {
        fallback = null;
      }
      if (!fallback) return null;
      if (!fs.existsSync(fallback)) return null;
      const dirty = computeDirty(fallback);
      const inFlight = readRunningSessionCwds(store).has(fallback);
      const { safety, reason } = computeSafety({
        managed: true,
        inFlight,
        dirty,
        unpushed: false,
        unpushedReason: null,
        prState: "open",
      });
      return { path: fallback, safety, reason };
    }
    if (!fs.existsSync(recordedPath)) return null;
    const dirty = computeDirty(recordedPath);
    const inFlight = readRunningSessionCwds(store).has(recordedPath);
    const { safety, reason } = computeSafety({
      managed: true,
      inFlight,
      dirty,
      unpushed: false, // cheap path skips fetch
      unpushedReason: null,
      prState: "open",
    });
    return { path: recordedPath, safety, reason };
  } catch {
    return null;
  }
}

/**
 * Resolve a `forge worktree` positional target by precedence:
 *   1) exact path on disk
 *   2) numeric → PR number
 *   3) branch name
 *
 * Returns the matching WorktreeEntry. Ambiguous cases (a numeric value
 * that also looks like a branch) yield a `kind: "ambiguous"` result so
 * the caller can render a `CliError` with a clear hint.
 */
export interface TestLocallyState {
  repoRoot: string;
  targetBranch: string;
  priorRef: string;
  priorRefKind: "branch" | "sha";
  parkedWorktreePath: string;
}

export function testStateFilePath(store: ForgeStore, repoRoot: string): string {
  const slug = repoRoot.replace(/[/\\]/g, "-");
  return path.join(store.forgeDir, "worktree-test-state", `${slug}.json`);
}

/**
 * Errors `parkWorktreeForTest` and `restoreFromTestState` can raise.
 * Callers translate them into HTTP status codes / CLI errors.
 */
export class TestLocallyError extends Error {
  readonly code: string;
  readonly hint?: string;
  constructor(code: string, message: string, hint?: string) {
    super(message);
    this.code = code;
    this.hint = hint;
  }
}

/**
 * Park `entry` (detach it) and check the target branch out in the main
 * repo. Records a state file so `restoreFromTestState` can undo it.
 *
 * Throws TestLocallyError on:
 *   - TEST_STATE_EXISTS — a previous park hasn't been restored
 *   - MAIN_DIRTY        — main repo has uncommitted changes
 *   - WORKTREE_DETACHED — target worktree has no branch to test
 *   - WORKTREE_IN_USE / WORKTREE_UNSAFE — refuse on non-safe entries
 *   - PARK_FAILED / CHECKOUT_FAILED — git plumbing failed
 */
export function parkWorktreeForTest(
  store: ForgeStore,
  repoRoot: string,
  entry: WorktreeEntry,
): { parked: WorktreeEntry; priorRef: string; repoRoot: string } {
  const statePath = testStateFilePath(store, repoRoot);
  if (fs.existsSync(statePath)) {
    throw new TestLocallyError(
      "TEST_STATE_EXISTS",
      `A test-locally session is already active for ${repoRoot}.`,
      "Restore it first (forge worktree restore or POST /api/worktrees/restore).",
    );
  }
  if (mainRepoDirty(repoRoot)) {
    throw new TestLocallyError(
      "MAIN_DIRTY",
      `Main repo at ${repoRoot} has uncommitted changes.`,
      "Commit or stash first.",
    );
  }
  if (!entry.branch) {
    throw new TestLocallyError("WORKTREE_DETACHED", `Worktree ${entry.path} is detached — no branch to test.`);
  }
  if (entry.safety === "in-use") {
    throw new TestLocallyError("WORKTREE_IN_USE", `Worktree ${entry.path} is in use by a running session.`);
  }
  if (entry.safety === "unsafe") {
    throw new TestLocallyError("WORKTREE_UNSAFE", `Worktree ${entry.path} is unsafe to park: ${entry.reason}`);
  }

  const priorBranch = runGitCapture(repoRoot, ["branch", "--show-current"]) ?? "";
  const priorRef = priorBranch || (runGitCapture(repoRoot, ["rev-parse", "HEAD"]) ?? "");
  const priorRefKind: "branch" | "sha" = priorBranch ? "branch" : "sha";

  const detach = spawnSync("git", ["-C", entry.path, "checkout", "--detach", "HEAD"], { stdio: "pipe" });
  if (detach.status !== 0) {
    throw new TestLocallyError(
      "PARK_FAILED",
      `Could not detach worktree ${entry.path}: ${detach.stderr?.toString().trim()}`,
    );
  }
  const co = spawnSync("git", ["-C", repoRoot, "checkout", entry.branch], { stdio: "pipe" });
  if (co.status !== 0) {
    spawnSync("git", ["-C", entry.path, "checkout", entry.branch], { stdio: "pipe" });
    throw new TestLocallyError(
      "CHECKOUT_FAILED",
      `Could not checkout ${entry.branch} in main: ${co.stderr?.toString().trim()}`,
    );
  }
  spawnSync("git", ["-C", repoRoot, "pull", "--ff-only"], { stdio: "pipe" });

  const state: TestLocallyState = {
    repoRoot,
    targetBranch: entry.branch,
    priorRef,
    priorRefKind,
    parkedWorktreePath: entry.path,
  };
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
  return { parked: entry, priorRef, repoRoot };
}

/**
 * Undo `parkWorktreeForTest`: re-attach the parked worktree's branch
 * and check out the prior ref in main.
 *
 * Returns { noop: true } when no state file exists. Throws
 * TestLocallyError on MAIN_DIRTY / BAD_STATE_FILE / RESTORE_FAILED.
 */
export function restoreFromTestState(
  store: ForgeStore,
  repoRoot: string,
): { restoredTo: string | null; noop?: true; repoRoot: string } {
  const statePath = testStateFilePath(store, repoRoot);
  if (!fs.existsSync(statePath)) {
    return { noop: true, restoredTo: null, repoRoot };
  }
  if (mainRepoDirty(repoRoot)) {
    throw new TestLocallyError(
      "MAIN_DIRTY",
      `Main repo at ${repoRoot} has uncommitted changes.`,
      "Commit or stash first.",
    );
  }
  let state: TestLocallyState;
  try {
    state = JSON.parse(fs.readFileSync(statePath, "utf-8")) as TestLocallyState;
  } catch (e) {
    throw new TestLocallyError("BAD_STATE_FILE", `Could not read ${statePath}: ${(e as Error).message}`);
  }
  if (fs.existsSync(state.parkedWorktreePath)) {
    const reattach = spawnSync("git", ["-C", state.parkedWorktreePath, "checkout", state.targetBranch], {
      stdio: "pipe",
    });
    if (reattach.status !== 0) {
      process.stderr.write(
        `warn: could not re-attach ${state.parkedWorktreePath} to ${state.targetBranch}: ${reattach.stderr?.toString().trim()}\n`,
      );
    }
  }
  const co = spawnSync("git", ["-C", repoRoot, "checkout", state.priorRef], { stdio: "pipe" });
  if (co.status !== 0) {
    throw new TestLocallyError(
      "RESTORE_FAILED",
      `Could not checkout ${state.priorRef} in main: ${co.stderr?.toString().trim()}`,
    );
  }
  fs.unlinkSync(statePath);
  return { restoredTo: state.priorRef, repoRoot };
}

function mainRepoDirty(repoRoot: string): boolean {
  const out = runGitCapture(repoRoot, ["status", "--porcelain"]);
  return out == null ? true : out.trim().length > 0;
}

function runGitCapture(repoRoot: string, args: string[]): string | null {
  try {
    return execFileSync("git", ["-C", repoRoot, ...args], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 10_000,
    }).trim();
  } catch {
    return null;
  }
}

export type ResolveTargetResult =
  | { kind: "ok"; entry: WorktreeEntry }
  | { kind: "not-found"; reason: string }
  | { kind: "ambiguous"; reason: string };

export function resolveWorktreeTarget(entries: WorktreeEntry[], target: string): ResolveTargetResult {
  if (!target) return { kind: "not-found", reason: "no target specified" };
  // 1) Path on disk.
  const byPath = entries.find((e) => path.resolve(e.path) === path.resolve(target));
  if (byPath) return { kind: "ok", entry: byPath };

  // 2) Numeric → PR number — but watch for branches literally named "42".
  const isNumeric = /^\d+$/.test(target);
  if (isNumeric) {
    const num = Number.parseInt(target, 10);
    const byPr = entries.filter((e) => e.prNumber === num);
    const byBranch = entries.filter((e) => e.branch === target);
    if (byPr.length === 1 && byBranch.length === 0) return { kind: "ok", entry: byPr[0] };
    if (byPr.length === 0 && byBranch.length === 1) return { kind: "ok", entry: byBranch[0] };
    if (byPr.length + byBranch.length === 0) {
      return { kind: "not-found", reason: `no worktree matches PR #${num} or branch "${num}"` };
    }
    return {
      kind: "ambiguous",
      reason: `"${target}" matches both PR #${num} and a branch — use --pr ${num} or --branch ${num}`,
    };
  }

  // 3) Branch name.
  const byBranch = entries.filter((e) => e.branch === target);
  if (byBranch.length === 1) return { kind: "ok", entry: byBranch[0] };
  if (byBranch.length === 0) return { kind: "not-found", reason: `no worktree matches branch "${target}"` };
  return {
    kind: "ambiguous",
    reason: `"${target}" matches ${byBranch.length} worktrees with the same branch — use --path <dir>`,
  };
}
