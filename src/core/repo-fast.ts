/**
 * Subprocess-free repo facts for the serve hot path.
 *
 * `/api/plans` only needs three facts per task repo — does the path
 * exist, is it a git checkout, what branch is on disk — but previously
 * derived them from detectRepo() + `git rev-parse`, costing several
 * execSync subprocess spawns per task per 3s poll and blocking Bun's
 * event loop. Everything here is a handful of small fs reads.
 *
 * Branch is read straight from HEAD:
 *  - `.git` directory  → read `.git/HEAD`
 *  - `.git` file       → linked worktree / submodule: parse
 *    `gitdir: <path>` (possibly relative to the root) and read
 *    `<gitdir>/HEAD`
 *  - `ref: refs/heads/<branch>` → branch name
 *  - raw SHA (detached) → "HEAD", matching `git rev-parse --abbrev-ref HEAD`
 *
 * Results are cached for a 2s micro-TTL — strictly below the Workbench's
 * 3s poll period, so the operator never sees repo state older than one
 * poll tick.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface RepoQuickInfo {
  reachable: boolean;
  hasGit: boolean;
  branch: string | null;
}

/** Resolve the actual git dir for a checkout root (handles `.git` files). */
function resolveGitDir(root: string): string | null {
  const dotGit = path.join(root, ".git");
  let stat: fs.Stats;
  try {
    stat = fs.statSync(dotGit);
  } catch {
    return null;
  }
  if (stat.isDirectory()) return dotGit;
  if (!stat.isFile()) return null;
  try {
    const content = fs.readFileSync(dotGit, "utf-8");
    const m = /^gitdir:\s*(.+)\s*$/m.exec(content);
    if (!m) return null;
    const target = m[1].trim();
    return path.isAbsolute(target) ? target : path.resolve(root, target);
  } catch {
    return null;
  }
}

export function readHeadBranch(root: string): string | null {
  const gitDir = resolveGitDir(root);
  if (!gitDir) return null;
  let head: string;
  try {
    head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf-8").trim();
  } catch {
    return null;
  }
  const ref = /^ref:\s*refs\/heads\/(.+)$/.exec(head);
  if (ref) return ref[1];
  // Detached HEAD stores a raw SHA; `git rev-parse --abbrev-ref HEAD`
  // prints "HEAD" in that state, so mirror it.
  if (/^[0-9a-f]{40}([0-9a-f]{24})?$/.test(head)) return "HEAD";
  return null;
}

function computeQuickInfo(root: string): RepoQuickInfo {
  if (!root || !path.isAbsolute(root) || !fs.existsSync(root)) {
    return { reachable: false, hasGit: false, branch: null };
  }
  const gitDir = resolveGitDir(root);
  if (!gitDir) return { reachable: true, hasGit: false, branch: null };
  return { reachable: true, hasGit: true, branch: readHeadBranch(root) };
}

const TTL_MS = 2_000;
const cache = new Map<string, { at: number; info: RepoQuickInfo }>();

export function repoQuickInfo(root: string): RepoQuickInfo {
  const hit = cache.get(root);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.info;
  const info = computeQuickInfo(root);
  cache.set(root, { at: Date.now(), info });
  return info;
}

/** Test hook: drop the micro-TTL cache so each case sees fresh disk state. */
export function __resetRepoFastCache(): void {
  cache.clear();
}
