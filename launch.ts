/**
 * Forge Launcher — tmux-based background agent execution.
 *
 * Each task gets its own named tmux session: forge-<short-id>
 * A generated bash runner script handles: agent → quality → commit → draft PR
 * Status is written to ~/.forge/runs/<id>/meta.json by the bash script.
 */

import { execSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { LaunchTarget } from "./store.js";
import { ForgeStore } from "./store.js";

export interface LaunchConfig {
  taskId: string;
  specContent: string;   // raw spec markdown (body only, no frontmatter)
  specTitle: string;
  target: LaunchTarget;
  model: string;
  worktreePath: string;
  qualityCommands: string[];
  defaultBranch: string;
  branch: string;
  repoRoot: string;
  repoName: string;
  contextContent: string | null;
}

// ─── tmux utilities ───────────────────────────────────────────────────────────

export function isTmuxAvailable(): boolean {
  try {
    execSync("which tmux", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function isTmuxSessionAlive(session: string): boolean {
  try {
    execSync(`tmux has-session -t "${session}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function killTmuxSession(session: string): void {
  try {
    execSync(`tmux kill-session -t "${session}"`, { stdio: "pipe" });
  } catch {
    // already dead
  }
}

/**
 * Foreground a tmux session, transferring the user's terminal to it. Returns
 * when the user detaches (Ctrl-B d) or the session ends.
 *
 * Uses spawnSync with inherited stdio so tmux can take over the TTY. The
 * forge dashboard must call `done()` (closing the pi custom UI) before
 * invoking this so pi has released its hold on the terminal.
 */
export function attachToSession(session: string): void {
  spawnSync("tmux", ["attach-session", "-t", session], { stdio: "inherit" });
}

export function tmuxSessionName(taskId: string): string {
  // tmux names: 16 chars max for readability, use last part of id which has the timestamp
  return `forge-${taskId.slice(-14)}`;
}

// ─── Agent command builder ────────────────────────────────────────────────────

function agentCommand(target: LaunchTarget, model: string, promptFile: string): string {
  switch (target) {
    case "pi":
      // pi --print reads the trailing message args; for long prompts pipe via stdin
      return `pi --print --model "${model}" --no-session < "${promptFile}"`;
    case "claude":
      return `claude --print --model "${model}" < "${promptFile}"`;
    case "codex":
      // codex exec reads from arg; we write a concise prompt to avoid shell quoting issues
      return `codex exec --model "${model}" -a never --add-dir "${path.dirname(promptFile)}" "$(cat '${promptFile}')"`;
  }
}

// ─── Runner script ────────────────────────────────────────────────────────────

function conventionalCommitPrefix(branch: string): string {
  const m = branch.match(/^(feat|fix|chore|docs|refactor|test|ci|style|perf|build)\//);
  return m ? m[1] : "feat";
}

function generateRunnerScript(config: LaunchConfig, store: ForgeStore): string {
  const runDir = store.ensureRunDir(config.taskId);
  const logFile = store.getLogFile(config.taskId);
  const metaFile = path.join(runDir, "meta.json");
  const promptFile = store.getPromptFile(config.taskId);
  const specFile = path.join(store.specsDir, `${config.taskId}.md`);

  const agentCmd = agentCommand(config.target, config.model, promptFile);
  // Shell-escaped PR title for `gh pr create --title`. Capped at 70 chars
  // because long titles render badly in GitHub's PR list.
  const safeTitle = config.specTitle.replace(/'/g, "'\\''").slice(0, 70);

  const qualityBlock =
    config.qualityCommands.length > 0
      ? config.qualityCommands
          .map((cmd) => `  run_cmd "${cmd.replace(/"/g, '\\"')}" || QUALITY_FAILED=1`)
          .join("\n")
      : '  echo "No quality commands configured — skipping."';

  return `#!/usr/bin/env bash
# Forge runner — task: ${config.taskId}
set -uo pipefail

TASK_ID="${config.taskId}"
WORKTREE="${config.worktreePath}"
META_FILE="${metaFile}"
LOG_FILE="${logFile}"
SPEC_FILE="${specFile}"
DEFAULT_BRANCH="${config.defaultBranch}"
BRANCH="${config.branch}"
QUALITY_FAILED=0

# ── Helpers ───────────────────────────────────────────────────────────────────

log() { echo "$@" | tee -a "$LOG_FILE"; }

run_cmd() {
  local cmd="$1"
  log ">>> $cmd"
  eval "$cmd" 2>&1 | tee -a "$LOG_FILE"
  return $?  # pipefail makes $? the pipeline's first nonzero exit
}

set_status() {
  python3 -c "
import json, sys
with open('$META_FILE') as f: d = json.load(f)
d['status'] = sys.argv[1]
with open('$META_FILE', 'w') as f: json.dump(d, f, indent=2)
" "$1" 2>/dev/null || true
}

# ── Init ──────────────────────────────────────────────────────────────────────

mkdir -p "$(dirname "$LOG_FILE")"
: > "$LOG_FILE"  # truncate / create

log "╔══════════════════════════════════════════════════════╗"
log "  FORGE — ${config.taskId}"
log "  Agent : ${config.target} / ${config.model}"
log "  Repo  : ${config.repoName}  branch: ${config.branch}"
log "  Start : $(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "╚══════════════════════════════════════════════════════╝"
log ""

cd "$WORKTREE"
set_status "running"

# ── Run Agent ─────────────────────────────────────────────────────────────────

log "═══ AGENT (${config.target}) ═══"
${agentCmd} 2>&1 | tee -a "$LOG_FILE"
AGENT_EXIT=$?  # correct because pipefail is set

if [ "$AGENT_EXIT" -ne 0 ]; then
  log ""
  log "✗ Agent exited with code $AGENT_EXIT"
  set_status "failed"
  exit "$AGENT_EXIT"
fi

log ""
log "✓ Agent completed"

# ── Quality checks ────────────────────────────────────────────────────────────

log ""
log "═══ QUALITY CHECKS ═══"
set_status "quality_check"

${qualityBlock}

if [ "$QUALITY_FAILED" -ne 0 ]; then
  log ""
  log "⚠  Quality checks had failures — PR will be created as draft for CI"
  set_status "quality_failed"
fi

# ── Verify commits & push ─────────────────────────────────────────────────────────────

log ""
log "═══ VERIFY COMMITS & PUSH ═══"

# Forge does NOT auto-stage or auto-commit. The agent owns its commits so
# build artifacts, scratch files, generated lockfile noise, etc. don't get
# swept into the PR by a blanket \`git add -A\`.

LEFTOVER=$(git status --porcelain)
if [ -n "$LEFTOVER" ]; then
  log "⚠  Uncommitted changes left in working tree (NOT auto-added):"
  echo "$LEFTOVER" | tee -a "$LOG_FILE"
  log ""
  log "   These files were intentionally NOT staged. If they should be part"
  log "   of the PR, the agent should have committed them. If they're build"
  log "   artifacts or temp files, add them to .gitignore."
  log ""
fi

# Pick the best base ref to diff against. Prefer origin/<default> so this
# works correctly in fresh worktrees that haven't pulled the local branch.
BASE_REF="$DEFAULT_BRANCH"
if git rev-parse --verify "origin/$DEFAULT_BRANCH" >/dev/null 2>&1; then
  BASE_REF="origin/$DEFAULT_BRANCH"
fi

COMMITS_AHEAD=$(git rev-list --count "$BASE_REF..HEAD" 2>/dev/null || echo 0)
if [ "$COMMITS_AHEAD" -eq 0 ]; then
  log "✗ No commits ahead of $BASE_REF — agent did not commit any work."
  log "  Skipping push and PR creation. Inspect the worktree, commit"
  log "  manually if appropriate, then re-run /forge-launch."
  set_status "failed"
  exit 1
fi

log "✓ $COMMITS_AHEAD commit(s) ahead of $BASE_REF"
git log --oneline "$BASE_REF..HEAD" 2>&1 | tee -a "$LOG_FILE" || true

git push -u origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE" || log "push failed — PR creation may fail"

# ── Create draft PR ───────────────────────────────────────────────────────────

log ""
log "═══ CREATING DRAFT PR ═══"
set_status "creating_pr"

PR_URL=$(gh pr create \\
  --draft \\
  --title '${safeTitle}' \\
  --body-file "$SPEC_FILE" \\
  --base "$DEFAULT_BRANCH" \\
  --head "$BRANCH" 2>&1 | tee -a "$LOG_FILE" | grep -Eo 'https://github[^ ]+' | tail -1 || true)

if [ -n "$PR_URL" ]; then
  log ""
  log "✓ Draft PR: $PR_URL"
  python3 -c "
import json, sys
with open('$META_FILE') as f: d = json.load(f)
d['status'] = 'done'
d['prUrl'] = sys.argv[1]
with open('$META_FILE', 'w') as f: json.dump(d, f, indent=2)
" "$PR_URL" 2>/dev/null || true
else
  log "✗ PR creation failed — check log above"
  set_status "failed"
fi

log ""
log "═══ DONE: $(date -u +%Y-%m-%dT%H:%M:%SZ) ═══"
`;
}

// ─── Agent prompt ─────────────────────────────────────────────────────────────

function buildAgentPrompt(config: LaunchConfig): string {
  const ctxSection = config.contextContent
    ? `## Repository Context\n\n${config.contextContent.slice(0, 4000)}\n\n---\n\n`
    : "";

  return `You are a coding agent working in the "${config.repoName}" repository.
Branch: ${config.branch}
Working directory: ${config.worktreePath}

${ctxSection}## Task Spec

${config.specContent}

---

## Agent Instructions

1. Implement the task described above. Read the existing codebase to understand patterns before writing code.
2. Write clean code consistent with the existing style — no excessive comments, no slop.
3. Run quality checks as you go (${config.qualityCommands.join(", ") || "none configured"}).
4. **You own all commits.** Forge does NOT run \`git add\` for you. Stage and
   commit ONLY the files you intentionally changed for this task:
     - Use \`git add <path>\` (or \`git add -p\`) on the specific files you wrote/edited.
     - Do NOT \`git add -A\` or \`git add .\` blindly.
     - Do NOT commit build artifacts, generated files, dependency caches,
       editor scratch files, debug logs, or temporary code.
     - If a generated file (e.g. a lockfile) legitimately needs to update,
       commit it in its own commit with a clear message.
     - Use conventional commit format: \`${conventionalCommitPrefix(config.branch)}(scope): summary\`.
     - Multiple small commits are fine and often preferable to one mega-commit.
5. Before exiting, run \`git status\` and confirm the working tree is clean
   (or contains only files you intentionally chose not to commit, e.g. local
   experiments). Anything left uncommitted will be surfaced as a warning
   and will NOT make it into the PR.
6. Exit successfully (exit code 0) when the task is complete and committed.
7. Do NOT push or create a PR — the forge system handles that automatically.
`;
}

// ─── Public launch API ────────────────────────────────────────────────────────

export interface LaunchResult {
  tmuxSession: string;
  logFile: string;
  error: string | null;
}

export async function launchAgent(config: LaunchConfig, store: ForgeStore): Promise<LaunchResult> {
  const tmuxSession = tmuxSessionName(config.taskId);
  store.ensureRunDir(config.taskId);
  const logFile = store.getLogFile(config.taskId);

  // Write agent prompt
  const prompt = buildAgentPrompt(config);
  fs.writeFileSync(store.getPromptFile(config.taskId), prompt, "utf-8");

  // Write runner script
  const script = generateRunnerScript(config, store);
  const runnerPath = store.getRunnerScript(config.taskId);
  fs.writeFileSync(runnerPath, script, { mode: 0o755 });

  // Seed meta.json so bash script can update it
  store.writeRunMeta(config.taskId, {
    taskId: config.taskId,
    tmuxSession,
    logFile,
    agent: config.target,
    model: config.model,
    worktree: config.worktreePath,
    status: "running",
    startedAt: new Date().toISOString(),
    prUrl: null,
  });

  // Kill any stale session with the same name
  killTmuxSession(tmuxSession);

  // Launch in tmux — pipe-pane captures output to log alongside tee in script
  try {
    execSync(
      `tmux new-session -d -s "${tmuxSession}" -c "${config.worktreePath}" "bash '${runnerPath}'; read -p 'Press Enter to close...' "`,
      { stdio: "pipe" },
    );
    // Brief pause then check it actually started
    await new Promise((r) => setTimeout(r, 500));
    if (!isTmuxSessionAlive(tmuxSession)) {
      return { tmuxSession, logFile, error: "tmux session died immediately — check runner script" };
    }
    return { tmuxSession, logFile, error: null };
  } catch (e: any) {
    return { tmuxSession, logFile, error: `Failed to start tmux: ${e.message ?? e}` };
  }
}
