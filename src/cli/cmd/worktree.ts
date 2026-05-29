/**
 * `forge worktree` — lifecycle verbs for the per-task git worktrees.
 *
 * All logic lives in `src/core/worktrees.ts`; this module is a thin shell
 * that parses args, formats output, and confirms destructive verbs.
 *
 * Subverbs:
 *   list             Inventory + safety badges (--json for raw entries).
 *   remove <target>  Remove one worktree (refuses in-use/unsafe unless --force).
 *   clean-merged     Bulk-remove every `safe` worktree.
 *   test <target>    Park a worktree and check its branch out in the main repo.
 *   restore          Undo `test` — return main to its prior ref.
 */

import * as path from "node:path";
import { parseArgs } from "node:util";
import { detectRepo } from "../../core/repo.ts";
import type { ForgeStore } from "../../core/store.ts";
import {
  listWorktrees,
  parkWorktreeForTest,
  removeWorktreeUnsafe,
  resolveWorktreeTarget,
  restoreFromTestState,
  TestLocallyError,
  type WorktreeEntry,
} from "../../core/worktrees.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge worktree <list|remove|clean-merged|test|restore> [...args]

Manage the per-task git worktrees Forge creates under <parent-of-repo>/worktrees/.

Subcommands:
  list                       Show all Forge worktrees with safety badges
  list --json                Same, machine-readable
  remove <target>            Remove a single worktree (clears Plan.worktree)
    --force                  Override the unsafe/in-use refusal (won't override in-use)
    --pr <n> | --branch <b> | --path <dir>   Explicit target (skip resolution)
  clean-merged               Bulk-remove every worktree whose PR is merged/closed
    --dry-run                Print what would be removed without removing
    --yes                    Skip the TTY confirmation
  test <target>              Park the worktree and check its branch out in main
  restore                    Restore main to its prior ref (undo \`test\`)

The "safety" verdict is computed live from \`git worktree list\` +
\`gh pr view\` + the sessions/jobs tables. \`clean-merged\` only touches
worktrees with verdict = "safe".
`;

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const sub = argv[0];
  if (!sub || sub === "--help" || sub === "-h") {
    process.stdout.write(HELP);
    process.exit(sub ? 0 : 1);
  }
  switch (sub) {
    case "list":
    case "ls":
      return runList(argv.slice(1), store);
    case "remove":
    case "rm":
      return runRemove(argv.slice(1), store);
    case "clean-merged":
      return runCleanMerged(argv.slice(1), store);
    case "test":
      return runTest(argv.slice(1), store);
    case "restore":
      return runRestore(argv.slice(1), store);
    default:
      throw new CliError("UNKNOWN_SUBCMD", `Unknown worktree subcommand: ${sub}`, {
        hint: "Try: forge worktree list | remove | clean-merged | test | restore",
        exitCode: 1,
      });
  }
}

// ─── list ────────────────────────────────────────────────────────────────────

async function runList(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const repoRoot = resolveRepoRoot();
  const entries = listWorktrees(repoRoot, store);
  emitOk({ worktrees: entries }, values.json === true, () =>
    entries.length === 0 ? "(no Forge worktrees)" : entries.map(formatRow).join("\n"),
  );
}

function formatRow(e: WorktreeEntry): string {
  const branch = e.branch ?? "(detached)";
  const pr = e.prNumber != null ? `PR #${e.prNumber} ${e.prState}` : "(no PR)";
  return `  ${badge(e.safety)}  ${e.path}\n      branch=${branch}  ${pr}  ${e.reason}`;
}

function badge(safety: WorktreeEntry["safety"]): string {
  switch (safety) {
    case "safe":
      return "[SAFE]      ";
    case "removable":
      return "[REMOVABLE] ";
    case "in-use":
      return "[IN-USE]    ";
    case "unsafe":
      return "[UNSAFE]    ";
    case "unmanaged":
      return "[UNMANAGED] ";
    default:
      return "[UNKNOWN]   ";
  }
}

// ─── remove ──────────────────────────────────────────────────────────────────

async function runRemove(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      force: { type: "boolean", default: false },
      pr: { type: "string" },
      branch: { type: "string" },
      path: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });
  const repoRoot = resolveRepoRoot();
  const entries = listWorktrees(repoRoot, store);
  const entry = pickEntry(entries, {
    target: positionals[0],
    pr: typeof values.pr === "string" ? values.pr : undefined,
    branch: typeof values.branch === "string" ? values.branch : undefined,
    path: typeof values.path === "string" ? values.path : undefined,
  });
  if (entry.safety === "in-use") {
    throw new CliError("WORKTREE_IN_USE", `Worktree ${entry.path} is in use by a running session.`, {
      hint: "Kill the session first (forge kill / or via the dashboard), then retry.",
      exitCode: 1,
    });
  }
  if (entry.safety === "unsafe" && !values.force) {
    throw new CliError("WORKTREE_UNSAFE", `Worktree ${entry.path} is unsafe to remove: ${entry.reason}`, {
      hint: "Re-run with --force if you really want to discard local changes / unpushed commits.",
      exitCode: 1,
    });
  }
  if (entry.safety === "unmanaged") {
    throw new CliError("WORKTREE_UNMANAGED", `Worktree ${entry.path} is not Forge-managed.`, {
      hint: "Use `git worktree remove` directly for unmanaged checkouts.",
      exitCode: 1,
    });
  }
  const res = removeWorktreeUnsafe(repoRoot, entry.path, { force: values.force === true, store });
  if (!res.ok) {
    throw new CliError("WORKTREE_REMOVE_FAILED", `git worktree remove failed: ${res.error ?? "(unknown)"}`, {
      exitCode: 3,
    });
  }
  emitOk({ removed: entry }, values.json === true, () => `removed ${entry.path}`);
}

// ─── clean-merged ────────────────────────────────────────────────────────────

async function runCleanMerged(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      "dry-run": { type: "boolean", default: false },
      yes: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });
  const repoRoot = resolveRepoRoot();
  const entries = listWorktrees(repoRoot, store);
  const safe = entries.filter((e) => e.safety === "safe");
  const skipped = entries.filter((e) => e.safety !== "safe").map((entry) => ({ entry, reason: skipReason(entry) }));

  if (values["dry-run"]) {
    emitOk({ removed: safe, skipped, dryRun: true }, values.json === true, () =>
      formatCleanSummary(safe, skipped, true),
    );
    return;
  }

  if (safe.length === 0) {
    emitOk({ removed: [], skipped, dryRun: false }, values.json === true, () =>
      formatCleanSummary(safe, skipped, false),
    );
    return;
  }

  if (process.stdout.isTTY && !values.yes) {
    process.stderr.write(`About to remove ${safe.length} safe worktree(s):\n`);
    for (const e of safe) process.stderr.write(`  - ${e.path}\n`);
    process.stderr.write("Pass --yes to confirm (or --dry-run to preview).\n");
    throw new CliError("NEEDS_CONFIRMATION", "clean-merged requires --yes when run interactively.", { exitCode: 1 });
  }

  const removed: WorktreeEntry[] = [];
  const failed: Array<{ entry: WorktreeEntry; reason: string }> = [];
  for (const entry of safe) {
    const res = removeWorktreeUnsafe(repoRoot, entry.path, { force: false, store });
    if (res.ok) removed.push(entry);
    else failed.push({ entry, reason: res.error ?? "(unknown error)" });
  }

  emitOk(
    { removed, skipped, failed, dryRun: false },
    values.json === true,
    () => `${formatCleanSummary(removed, skipped, false)}${failed.length ? `\nFailures: ${failed.length}` : ""}`,
  );
}

function skipReason(e: WorktreeEntry): string {
  switch (e.safety) {
    case "in-use":
      return "in-use";
    case "unsafe":
      return `unsafe (${e.reason})`;
    case "unmanaged":
      return "unmanaged";
    case "unknown":
      return "unknown PR state";
    case "removable":
      return "still open / unmerged";
    default:
      return e.safety;
  }
}

function formatCleanSummary(
  removed: WorktreeEntry[],
  skipped: Array<{ entry: WorktreeEntry; reason: string }>,
  isDryRun: boolean,
): string {
  const verb = isDryRun ? "Would remove" : "Removed";
  const lines: string[] = [];
  lines.push(`${verb} ${removed.length} safe worktree(s).`);
  for (const e of removed) lines.push(`  - ${e.path}`);
  if (skipped.length > 0) {
    lines.push(`Kept ${skipped.length} (not safe to bulk-remove):`);
    for (const s of skipped) lines.push(`  - ${s.entry.path}  [${s.reason}]`);
  }
  return lines.join("\n");
}

// ─── test / restore ──────────────────────────────────────────────────────────

async function runTest(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      pr: { type: "string" },
      branch: { type: "string" },
      path: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });
  const repoRoot = resolveRepoRoot();
  const entries = listWorktrees(repoRoot, store);
  const entry = pickEntry(entries, {
    target: positionals[0],
    pr: typeof values.pr === "string" ? values.pr : undefined,
    branch: typeof values.branch === "string" ? values.branch : undefined,
    path: typeof values.path === "string" ? values.path : undefined,
  });
  try {
    const result = parkWorktreeForTest(store, repoRoot, entry);
    emitOk(
      result,
      values.json === true,
      () => `parked ${entry.path}; main repo now on ${entry.branch} (was ${result.priorRef})`,
    );
  } catch (e) {
    if (e instanceof TestLocallyError) {
      throw new CliError(e.code, e.message, { hint: e.hint, exitCode: 1 });
    }
    throw e;
  }
}

async function runRestore(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const repoRoot = resolveRepoRoot();
  try {
    const result = restoreFromTestState(store, repoRoot);
    if (result.noop) {
      emitOk({ noop: true }, values.json === true, () => "no test-locally state to restore");
      return;
    }
    emitOk(result, values.json === true, () => `main repo restored to ${result.restoredTo}`);
  } catch (e) {
    if (e instanceof TestLocallyError) {
      throw new CliError(e.code, e.message, { hint: e.hint, exitCode: 1 });
    }
    throw e;
  }
}

// ─── shared helpers ──────────────────────────────────────────────────────────

function resolveRepoRoot(): string {
  const repo = detectRepo(process.cwd());
  if (!repo) {
    throw new CliError("NOT_A_REPO", `Not inside a git repository: ${process.cwd()}`, { exitCode: 1 });
  }
  return repo.root;
}

function pickEntry(
  entries: WorktreeEntry[],
  opts: { target?: string; pr?: string; branch?: string; path?: string },
): WorktreeEntry {
  const explicit = (opts.pr ? 1 : 0) + (opts.branch ? 1 : 0) + (opts.path ? 1 : 0);
  if (explicit > 1) {
    throw new CliError("AMBIGUOUS_TARGET", "Pass only one of --pr, --branch, --path.", { exitCode: 1 });
  }
  if (opts.path) {
    const want = path.resolve(opts.path);
    const hit = entries.find((e) => path.resolve(e.path) === want);
    if (!hit) throw new CliError("WORKTREE_NOT_FOUND", `No Forge worktree at path "${opts.path}".`, { exitCode: 1 });
    return hit;
  }
  if (opts.pr) {
    const num = Number.parseInt(opts.pr, 10);
    if (!Number.isFinite(num) || num <= 0) {
      throw new CliError("BAD_PR", `--pr expects a positive integer (got "${opts.pr}").`, { exitCode: 1 });
    }
    const hit = entries.filter((e) => e.prNumber === num);
    if (hit.length === 0) {
      throw new CliError("WORKTREE_NOT_FOUND", `No Forge worktree linked to PR #${num}.`, { exitCode: 1 });
    }
    if (hit.length > 1) {
      throw new CliError("AMBIGUOUS_TARGET", `Multiple worktrees link to PR #${num} — use --path.`, { exitCode: 1 });
    }
    return hit[0];
  }
  if (opts.branch) {
    const hit = entries.filter((e) => e.branch === opts.branch);
    if (hit.length === 0) {
      throw new CliError("WORKTREE_NOT_FOUND", `No Forge worktree on branch "${opts.branch}".`, { exitCode: 1 });
    }
    if (hit.length > 1) {
      throw new CliError("AMBIGUOUS_TARGET", `Multiple worktrees on branch "${opts.branch}" — use --path.`, {
        exitCode: 1,
      });
    }
    return hit[0];
  }
  if (!opts.target) {
    throw new CliError("MISSING_TARGET", "Provide a target (positional, --pr, --branch, or --path).", { exitCode: 1 });
  }
  const resolved = resolveWorktreeTarget(entries, opts.target);
  if (resolved.kind === "ok") return resolved.entry;
  const code = resolved.kind === "ambiguous" ? "AMBIGUOUS_TARGET" : "WORKTREE_NOT_FOUND";
  throw new CliError(code, resolved.reason, { exitCode: 1 });
}
