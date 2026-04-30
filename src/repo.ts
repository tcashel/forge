/**
 * Forge Repo Detection — fingerprints any git repo with zero config.
 *
 * Detects stack, quality commands, worktree script, named Claude agents,
 * and context files (CLAUDE.md / AGENTS.md) automatically.
 */

import { execSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

export type Stack = "rust" | "python" | "nuxt" | "js-ts" | "unknown";

export interface NamedAgent {
  name: string;
  description: string;
  model?: string;
  filePath: string;
}

export interface RepoProfile {
  root: string;
  name: string;
  stack: Stack;
  contextFile: string | null;
  contextContent: string | null;
  qualityCommands: string[];
  worktreeScript: string | null;
  namedAgents: NamedAgent[];
  defaultBranch: string;
  currentBranch: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sh(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 5000,
    }).trim();
  } catch {
    return "";
  }
}

function readFile(p: string): string | null {
  try {
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null;
  } catch {
    return null;
  }
}

function readJson(p: string): Record<string, unknown> {
  try {
    return JSON.parse(readFile(p) ?? "{}");
  } catch {
    return {};
  }
}

// ─── Stack detection ──────────────────────────────────────────────────────────

function detectStack(root: string): Stack {
  if (fs.existsSync(path.join(root, "Cargo.toml"))) return "rust";
  if (fs.existsSync(path.join(root, "pyproject.toml")) || fs.existsSync(path.join(root, "setup.py"))) return "python";
  // Nuxt check before generic js-ts
  if (fs.existsSync(path.join(root, "nuxt.config.ts")) || fs.existsSync(path.join(root, "nuxt.config.js")))
    return "nuxt";
  if (fs.existsSync(path.join(root, "package.json"))) return "js-ts";
  return "unknown";
}

function pkgMgr(root: string): string {
  if (fs.existsSync(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(root, "yarn.lock"))) return "yarn";
  return "npm run";
}

function detectQualityCommands(root: string, stack: Stack): string[] {
  switch (stack) {
    case "rust":
      return ["cargo fmt --check", "cargo clippy -- -D warnings", "cargo test"];

    case "python": {
      const pyproj = readFile(path.join(root, "pyproject.toml")) ?? "";
      const hasPoe = pyproj.includes("[tool.poe.tasks]");
      if (hasPoe && pyproj.includes("check-all")) return ["poe check-all"];
      const cmds: string[] = [];
      if (hasPoe) {
        if (pyproj.match(/^\s*lint\s*=/m)) cmds.push("poe lint");
        if (pyproj.match(/^\s*format\s*=/m)) cmds.push("poe format");
        if (pyproj.match(/^\s*typecheck\s*=/m)) cmds.push("poe typecheck");
        // Find test task
        const testTask = pyproj.match(/^\s*(test[-\w]*)\s*=.*pytest/m)?.[1];
        cmds.push(testTask ? `poe ${testTask}` : "uv run pytest");
      } else {
        cmds.push("uv run ruff format --check .", "uv run ruff check .", "uv run pytest");
      }
      return cmds;
    }

    case "nuxt":
    case "js-ts": {
      const scripts = (readJson(path.join(root, "package.json")).scripts ?? {}) as Record<string, string>;
      const mgr = pkgMgr(root);
      const cmds: string[] = [];
      if (scripts.lint) cmds.push(`${mgr} lint`);
      if (scripts.typecheck) cmds.push(`${mgr} typecheck`);
      if (scripts["test:run"]) cmds.push(`${mgr} test:run`);
      else if (scripts.test && !scripts.test.includes("watch")) cmds.push(`${mgr} test`);
      return cmds.length ? cmds : [`${mgr} lint`];
    }

    default:
      return [];
  }
}

// ─── Context, agents, branch ──────────────────────────────────────────────────

function detectContextFile(root: string): { file: string | null; content: string | null } {
  for (const name of ["CLAUDE.md", "AGENTS.md", "GEMINI.md"]) {
    const content = readFile(path.join(root, name));
    if (content) return { file: path.join(root, name), content };
  }
  return { file: null, content: null };
}

function detectNamedAgents(root: string): NamedAgent[] {
  const dir = path.join(root, ".claude", "agents");
  if (!fs.existsSync(dir)) return [];
  const agents: NamedAgent[] = [];
  try {
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const content = readFile(path.join(dir, file));
      if (!content) continue;
      const modelMatch = content.match(/^##\s+Model\s*\n+(\S+)/m);
      const descMatch = content.match(/^## Description\s*\n+(.+)/m) ?? content.match(/^[^#\n].{10,}/m);
      agents.push({
        name: file.replace(".md", ""),
        description: descMatch?.[1]?.trim().slice(0, 80) ?? file.replace(".md", ""),
        model: modelMatch?.[1]?.trim(),
        filePath: path.join(dir, file),
      });
    }
  } catch {
    // ignore
  }
  return agents;
}

function detectDefaultBranch(root: string): string {
  // Try remote HEAD first (most reliable)
  const remote = sh("git symbolic-ref refs/remotes/origin/HEAD --short", root).replace("origin/", "");
  if (remote) return remote;
  // Try common branch names
  for (const b of ["main", "master", "develop", "dev"]) {
    if (sh(`git show-ref --verify refs/heads/${b}`, root)) return b;
  }
  return sh("git rev-parse --abbrev-ref HEAD", root) || "main";
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getGitRoot(cwd: string): string | null {
  const root = sh("git rev-parse --show-toplevel", cwd);
  return root || null;
}

export function detectRepo(cwd: string): RepoProfile | null {
  const root = getGitRoot(cwd);
  if (!root) return null;
  const stack = detectStack(root);
  const { file: contextFile, content: contextContent } = detectContextFile(root);
  return {
    root,
    name: path.basename(root),
    stack,
    contextFile,
    contextContent,
    qualityCommands: detectQualityCommands(root, stack),
    worktreeScript: fs.existsSync(path.join(root, "scripts", "worktree.sh"))
      ? path.join(root, "scripts", "worktree.sh")
      : null,
    namedAgents: detectNamedAgents(root),
    defaultBranch: detectDefaultBranch(root),
    currentBranch: sh("git rev-parse --abbrev-ref HEAD", root) || "main",
  };
}

export function getWorktrees(root: string): Array<{ path: string; branch: string }> {
  const output = sh("git worktree list --porcelain", root);
  const result: Array<{ path: string; branch: string }> = [];
  let p = "";
  for (const line of output.split("\n")) {
    if (line.startsWith("worktree ")) {
      p = line.slice(9);
    } else if (line.startsWith("branch refs/heads/")) {
      const branch = line.slice(18);
      if (p && p !== root) result.push({ path: p, branch });
      p = "";
    }
  }
  return result;
}

/**
 * Run a shell command asynchronously and resolve once it exits. We pipe
 * stdout/stderr through a callback so the caller can stream tail lines into
 * a status indicator (the previous implementation blocked the event loop
 * with execSync, so progress notifications never rendered until the
 * worktree was already finished).
 */
function spawnAsync(
  command: string,
  args: string[],
  opts: { cwd: string; timeoutMs?: number; onLine?: (line: string) => void },
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stderrTail = "";
    const onChunk = (buf: Buffer) => {
      const lines = buf.toString().split(/\r?\n/);
      for (const l of lines) {
        const trimmed = l.trim();
        if (!trimmed) continue;
        if (opts.onLine) opts.onLine(trimmed);
        stderrTail = trimmed;
      }
    };
    child.stdout?.on("data", onChunk);
    child.stderr?.on("data", onChunk);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (opts.timeoutMs) {
      timer = setTimeout(() => {
        child.kill("SIGKILL");
        resolve({ ok: false, error: `timed out after ${opts.timeoutMs}ms` });
      }, opts.timeoutMs);
    }
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (code === 0) resolve({ ok: true });
      else resolve({ ok: false, error: stderrTail || `exit ${code}` });
    });
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      resolve({ ok: false, error: err.message });
    });
  });
}

export interface CreateWorktreeOptions {
  /** Streams progress messages to the caller (e.g. for a status loader). */
  onProgress?: (msg: string) => void;
  /** Skip bootstrap (deps install). Use when the launch is in a hurry. */
  skipBootstrap?: boolean;
}

export async function createWorktree(
  root: string,
  branch: string,
  worktreeScript: string | null,
  stack: Stack,
  options: CreateWorktreeOptions = {},
): Promise<{ worktreePath: string; error: string | null }> {
  const { onProgress, skipBootstrap } = options;
  const progress = (msg: string) => onProgress?.(msg);
  const sanitized = branch.replace(/[/\\]/g, "-");
  const worktreePath = path.join(path.dirname(root), "worktrees", sanitized);

  if (worktreeScript) {
    progress(`Running worktree.sh create ${branch}…`);
    const res = await spawnAsync("bash", [worktreeScript, "create", branch], {
      cwd: root,
      timeoutMs: 180_000,
      onLine: (line) => progress(line.slice(0, 120)),
    });
    if (!res.ok) return { worktreePath, error: `worktree.sh failed: ${res.error}` };
    return { worktreePath, error: null };
  }

  // Plain git worktree add
  progress(`git worktree add ${branch}…`);
  const wt = await spawnAsync("git", ["worktree", "add", "-b", branch, worktreePath], {
    cwd: root,
    timeoutMs: 60_000,
    onLine: (line) => progress(line.slice(0, 120)),
  });
  if (!wt.ok) return { worktreePath, error: `git worktree add failed: ${wt.error}` };

  if (skipBootstrap) return { worktreePath, error: null };

  // Bootstrap based on stack
  const bootstrap: Record<Stack, [string, string[]] | null> = {
    "js-ts": fs.existsSync(path.join(root, "pnpm-lock.yaml")) ? ["pnpm", ["install"]] : ["npm", ["install"]],
    nuxt: fs.existsSync(path.join(root, "pnpm-lock.yaml")) ? ["pnpm", ["install"]] : ["npm", ["install"]],
    python: fs.existsSync(path.join(root, "pyproject.toml")) ? ["uv", ["sync"]] : null,
    rust: null,
    unknown: null,
  };
  const cmd = bootstrap[stack];
  if (cmd) {
    progress(`Bootstrapping deps: ${cmd[0]} ${cmd[1].join(" ")}…`);
    const boot = await spawnAsync(cmd[0], cmd[1], {
      cwd: worktreePath,
      timeoutMs: 300_000,
      onLine: (line) => progress(line.slice(0, 120)),
    });
    if (!boot.ok) {
      // Non-fatal — the agent can retry. Surface a warning but keep going.
      progress(`bootstrap warning: ${boot.error}`);
    }
  }

  return { worktreePath, error: null };
}
