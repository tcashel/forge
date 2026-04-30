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
import { fileURLToPath } from "node:url";
import { buildReviewerPromptPrefix } from "./reviewer.js";
import type { ForgeStore, LaunchTarget, ReasoningEffort, RunMeta } from "./store.js";

export interface LaunchConfig {
  taskId: string;
  specContent: string; // raw spec markdown (body only, no frontmatter)
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
  reviewerTarget: LaunchTarget;
  reviewerModel: string;
  reviewerReasoningEffort?: ReasoningEffort;
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

export function agentCommand(
  target: LaunchTarget,
  model: string,
  promptFile: string,
  opts?: { reasoningEffort?: "low" | "medium" | "high" | "xhigh" },
): string {
  switch (target) {
    case "pi":
      // pi --print reads the trailing message args; for long prompts pipe via stdin
      return `pi --print --model "${model}" --no-session < "${promptFile}"`;
    case "claude":
      return `claude --print --model "${model}" < "${promptFile}"`;
    case "codex": {
      const reasoningFlag = opts?.reasoningEffort ? ` --config reasoning_effort=${opts.reasoningEffort}` : "";
      return `codex exec --model "${model}"${reasoningFlag} -a never --add-dir "${path.dirname(promptFile)}" "$(cat '${promptFile}')"`;
    }
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
  const extDir = path.dirname(fileURLToPath(import.meta.url));
  const prBodyTsPath = path.join(extDir, "pr-body.ts");

  // ── pi runtime: supervisor-based runner ──────────────────────────────
  if (config.target === "pi") {
    const supervisorPath = path.join(extDir, "supervisor.ts");
    const argsJsonPath = path.join(runDir, "supervisor-args.json");
    const safeTitle = config.specTitle.replace(/'/g, "'\\''").slice(0, 70);
    const supervisorArgs = JSON.stringify(
      {
        taskId: config.taskId,
        runDir,
        promptFile,
        worktreePath: config.worktreePath,
        repoName: config.repoName,
        branch: config.branch,
        defaultBranch: config.defaultBranch,
        qualityCommands: config.qualityCommands,
        model: config.model,
        specTitle: safeTitle,
        commitMessage: `${conventionalCommitPrefix(config.branch)}(${config.repoName}): ${safeTitle}`,
        specFile,
        skipGit: false,
        reviewerTarget: config.reviewerTarget,
        reviewerModel: config.reviewerModel,
        reviewerReasoningEffort: config.reviewerReasoningEffort,
      },
      null,
      2,
    );
    return `#!/usr/bin/env bash
# Forge runner (pi supervisor) — task: ${config.taskId}
set -uo pipefail

LOG_FILE="${logFile}"
mkdir -p "$(dirname "$LOG_FILE")"
: > "$LOG_FILE"

cat > '${argsJsonPath}' << 'FORGE_SUPERVISOR_ARGS_EOF'
${supervisorArgs}
FORGE_SUPERVISOR_ARGS_EOF

exec node --experimental-strip-types '${supervisorPath}' '${argsJsonPath}'
`;
  }

  // ── claude / codex: existing bash runner (byte-identical) ────────────
  const agentCmd = agentCommand(config.target, config.model, promptFile);
  // Shell-escaped PR title for `gh pr create --title`. Capped at 70 chars
  // because long titles render badly in GitHub's PR list.
  const safeTitle = config.specTitle.replace(/'/g, "'\\''").slice(0, 70);

  const qualityBlock =
    config.qualityCommands.length > 0
      ? config.qualityCommands
          .map((cmd) => {
            const escaped = cmd.replace(/"/g, '\\"');
            return `  QUAL_START=$SECONDS
  run_cmd "${escaped}"
  QUAL_OK=$?
  QUAL_DUR=$(( (SECONDS - QUAL_START) * 1000 ))
  if [ "$QUAL_OK" -ne 0 ]; then QUALITY_FAILED=1; fi
  echo '{"command":"${escaped}","ok":'$([ "$QUAL_OK" -eq 0 ] && echo true || echo false)',"durationMs":'$QUAL_DUR'}' >> "${runDir}/quality.jsonl"`;
          })
          .join("\n")
      : '  echo "No quality commands configured — skipping."';

  // Build the reviewer agent command for the bash script
  const reviewerCmd = agentCommand(config.reviewerTarget, config.reviewerModel, `${runDir}/review-prompt.txt`, {
    reasoningEffort: config.reviewerReasoningEffort,
  });

  return `#!/usr/bin/env bash
# Forge runner — task: ${config.taskId}
set -uo pipefail

TASK_ID="${config.taskId}"
WORKTREE="${config.worktreePath}"
META_FILE="${metaFile}"
LOG_FILE="${logFile}"
SPEC_FILE="${specFile}"
RUN_DIR="${runDir}"
DEFAULT_BRANCH="${config.defaultBranch}"
BRANCH="${config.branch}"
QUALITY_FAILED=0
RUN_STARTED_EPOCH=$(date +%s)

# ── Helpers ───────────────────────────────────────────────────────────────────

log() { echo "$@" | tee -a "$LOG_FILE"; }

run_cmd() {
  local cmd="$1"
  log ">>> $cmd"
  eval "$cmd" 2>&1 | tee -a "$LOG_FILE"
  return $?  # pipefail makes $? the pipeline's first nonzero exit
}

set_meta_field() {
  python3 -c "
import json, sys
with open('$META_FILE') as f: d = json.load(f)
key = sys.argv[1]
val_json = sys.argv[2]
d[key] = json.loads(val_json)
with open('$META_FILE', 'w') as f: json.dump(d, f, indent=2)
" "$1" "$2" 2>/dev/null || true
}

set_status() { set_meta_field "status" ""$1""; }

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

# Capture base SHA for run metadata
BASE_SHA=$(git rev-parse "origin/$DEFAULT_BRANCH" 2>/dev/null || git rev-parse HEAD)
set_meta_field "baseSha" ""$BASE_SHA""

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

# Write qualityResults into meta.json
python3 -c "
import json, os, sys
qpath = os.path.join('${runDir}', 'quality.jsonl')
results = []
if os.path.exists(qpath):
    with open(qpath) as f:
        for line in f:
            line = line.strip()
            if line:
                try: results.append(json.loads(line))
                except: pass
with open('$META_FILE') as f: d = json.load(f)
d['qualityResults'] = results
with open('$META_FILE', 'w') as f: json.dump(d, f, indent=2)
" 2>/dev/null || true

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

# Capture final SHA before pushing
FINAL_SHA=$(git rev-parse HEAD)
set_meta_field "finalSha" ""$FINAL_SHA""

git push -u origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE" || log "push failed — PR creation may fail"

# ── Build structured PR body ──────────────────────────────────────────────────

log ""
log "═══ BUILD PR BODY ═══"

PR_BODY_FILE="${runDir}/pr-body.md"
PR_BODY_BUILT=0

# Use python3 to safely build pr-body-args.json with proper escaping
python3 -c "
import json, subprocess, os, sys

base_ref = '$BASE_REF'
branch = '$BRANCH'
spec_file = '$SPEC_FILE'
run_dir = '${runDir}'
task_id = '${config.taskId}'
agent = '${config.target}'
model = '${config.model}'

# Gather commits
commits = []
try:
    log = subprocess.check_output(
        ['git', 'log', '--no-merges', '--format=%h %s', base_ref + '..HEAD'],
        text=True, stderr=subprocess.DEVNULL
    ).strip()
    for line in log.split('\n'):
        if line.strip():
            sha, _, subj = line.partition(' ')
            commits.append({'sha': sha, 'subject': subj})
except Exception:
    pass

# Gather shortstat
additions = None
deletions = None
files_changed = None
try:
    stat = subprocess.check_output(
        ['git', 'diff', '--shortstat', base_ref + '..HEAD'],
        text=True, stderr=subprocess.DEVNULL
    ).strip()
    import re
    m = re.search(r'(\\d+) files? changed', stat)
    if m:
        files_changed = int(m.group(1))
    m = re.search(r'(\\d+) insertions?', stat)
    if m:
        additions = int(m.group(1))
    m = re.search(r'(\\d+) deletions?', stat)
    if m:
        deletions = int(m.group(1))
except Exception:
    pass

# Read quality results
quality = []
qpath = os.path.join(run_dir, 'quality.jsonl')
if os.path.exists(qpath):
    with open(qpath) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    quality.append(json.loads(line))
                except Exception:
                    pass

args = {
    'specPath': spec_file,
    'agentSummaryPath': os.path.join(run_dir, 'agent-summary.md'),
    'outputPath': os.path.join(run_dir, 'pr-body.md'),
    'input': {
        'taskId': task_id,
        'specBody': '',
        'branch': branch,
        'baseRef': base_ref,
        'commits': commits,
        'additions': additions,
        'deletions': deletions,
        'filesChanged': files_changed,
        'qualityResults': quality,
        'agent': agent,
        'model': model,
        'jiraTicket': None,
        'jiraUrl': None,
        'agentSummary': None,
    }
}
with open(os.path.join(run_dir, 'pr-body-args.json'), 'w') as f:
    json.dump(args, f, indent=2)
" 2>&1 | tee -a "$LOG_FILE"

if node --experimental-strip-types '${prBodyTsPath}' "${runDir}/pr-body-args.json" 2>&1 | tee -a "$LOG_FILE"; then
  if [ -f "$PR_BODY_FILE" ]; then
    PR_BODY_BUILT=1
    log "✓ PR body built"
  fi
fi

if [ "$PR_BODY_BUILT" -eq 0 ]; then
  log "⚠  PR body build failed — falling back to spec file"
  PR_BODY_FILE="$SPEC_FILE"
fi

# ── Create draft PR ───────────────────────────────────────────────────────────

log ""
log "═══ CREATING DRAFT PR ═══"
set_status "creating_pr"

PR_URL=$(gh pr create \\
  --draft \\
  --title '${safeTitle}' \\
  --body-file "$PR_BODY_FILE" \\
  --base "$DEFAULT_BRANCH" \\
  --head "$BRANCH" 2>&1 | tee -a "$LOG_FILE" | grep -Eo 'https://github[^ ]+' | tail -1 || true)

PR_NUMBER=""
if [ -n "$PR_URL" ]; then
  log ""
  log "✓ Draft PR: $PR_URL"
  PR_NUMBER=$(python3 -c "import sys, re; m = re.search(r'/pull/(\\d+)$', sys.argv[1]); print(m.group(1) if m else '')" "$PR_URL" 2>/dev/null || true)
  ENDED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  DURATION_MS=$(( ($(date +%s) - RUN_STARTED_EPOCH) * 1000 ))
  python3 -c "
import json, sys
with open('$META_FILE') as f: d = json.load(f)
d['status'] = 'done'
d['prUrl'] = sys.argv[1]
d['endedAt'] = sys.argv[2]
d['durationMs'] = int(sys.argv[3])
pr_num = sys.argv[4]
if pr_num: d['prNumber'] = int(pr_num)
with open('$META_FILE', 'w') as f: json.dump(d, f, indent=2)
" "$PR_URL" "$ENDED_AT" "$DURATION_MS" "$PR_NUMBER" 2>/dev/null || true
else
  log "✗ PR creation failed — check log above"
  set_status "failed"
fi

# ── Reviewer ──────────────────────────────────────────────────────────────────

if [ -n "$PR_URL" ] && [ -n "$PR_NUMBER" ]; then
  log ""
  log "═══ REVIEWER ═══"
  set_status "reviewing"

  # Compose the full reviewer prompt from prefix + dynamic gh output
  {
    cat "$RUN_DIR/review-prompt-prefix.txt"
    echo
    echo "## PR metadata"
    echo
    echo '\`\`\`json'
    gh pr view "$PR_NUMBER" --json number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url 2>/dev/null || echo '{}'
    echo '\`\`\`'
    echo
    echo "## CI checks"
    echo
    echo '\`\`\`'
    gh pr checks "$PR_NUMBER" 2>&1 || echo "(no check status available)"
    echo '\`\`\`'
    echo
    echo "## Linked Forge spec"
    echo
    echo '\`\`\`markdown'
    cat "$RUN_DIR/spec-snapshot.md"
    echo '\`\`\`'
    echo
    echo "## Diff"
    echo
    echo '\`\`\`diff'
    gh pr diff "$PR_NUMBER" 2>/dev/null | head -c 60000
    echo '\`\`\`'
    echo
    echo 'Now produce the review in a single \`\`\`forge-review fenced block per the skill instructions.'
  } > "$RUN_DIR/review-prompt.txt"

  log "Running reviewer: ${config.reviewerTarget} / ${config.reviewerModel}"
  if ${reviewerCmd} > "$RUN_DIR/review-raw.md" 2>&1; then
    # Extract the forge-review fenced block and verdict
    VERDICT=$(python3 -c "
import re, sys, json
raw = open(sys.argv[1]).read()
m = re.search(r'\`\`\`forge-review\\s*\\n(.*?)\\n\`\`\`', raw, re.DOTALL)
if not m:
    sys.exit(2)
block = m.group(1)
open(sys.argv[2], 'w').write(block)
verdict_match = re.search(r'^##\\s*Verdict\\s*\\n\\s*(\\S+)', block, re.MULTILINE)
verdict = verdict_match.group(1).strip().lower() if verdict_match else None
if verdict not in ('approve', 'request-changes', 'block'):
    verdict = None
print(json.dumps(verdict))
" "$RUN_DIR/review-raw.md" "$RUN_DIR/review.md" 2>/dev/null)
    EXTRACT_EXIT=$?

    if [ "$EXTRACT_EXIT" -eq 2 ]; then
      log "⚠  No fenced forge-review block in reviewer output"
      set_meta_field "reviewVerdict" "null"
      set_meta_field "reviewError" '"no fenced forge-review block in reviewer output"'
    elif [ -z "$VERDICT" ] || [ "$VERDICT" = "null" ]; then
      log "⚠  Verdict line missing or unrecognised"
      set_meta_field "reviewVerdict" "null"
      set_meta_field "reviewError" '"verdict line missing or unrecognised"'
    else
      log "✓ Review verdict: $VERDICT"
      set_meta_field "reviewVerdict" "$VERDICT"
    fi
  else
    REVIEWER_EXIT=$?
    log "⚠  Reviewer process failed (exit $REVIEWER_EXIT)"
    set_meta_field "reviewVerdict" "null"
    set_meta_field "reviewError" ""reviewer process exited with code $REVIEWER_EXIT""
  fi

  set_status "done"
fi

log ""
log "═══ DONE: $(date -u +%Y-%m-%dT%H:%M:%SZ) ═══"
`;
}

// ─── Agent prompt ─────────────────────────────────────────────────────────────

function buildAgentPrompt(config: LaunchConfig, store: ForgeStore): string {
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
6. Before exiting (after committing), write a short PR summary to
   \`${path.join(store.runsDir, config.taskId, "agent-summary.md")}\` — 3–6 sentences in plain prose,
   describing what you actually did and any noteworthy decisions or
   follow-ups. Skip implementation details that are obvious from
   the diff. If the change is trivial (one-line fix, typo, etc.),
   a single sentence is fine. Do NOT write the file if you didn't
   complete the task.
7. Exit successfully (exit code 0) when the task is complete and committed.
8. Do NOT push or create a PR — the forge system handles that automatically.
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
  const prompt = buildAgentPrompt(config, store);
  fs.writeFileSync(store.getPromptFile(config.taskId), prompt, "utf-8");

  // Snapshot the spec body so it's preserved alongside run artifacts
  const runDir = store.ensureRunDir(config.taskId);
  fs.writeFileSync(path.join(runDir, "spec-snapshot.md"), config.specContent, "utf-8");

  // Write reviewer prompt prefix for the post-PR reviewer step
  const reviewPrefix = buildReviewerPromptPrefix({
    repoName: config.repoName,
    skillsDir: path.join(path.dirname(fileURLToPath(import.meta.url)), "skills", "forge-reviewer"),
  });
  fs.writeFileSync(path.join(runDir, "review-prompt-prefix.txt"), reviewPrefix, "utf-8");

  // Write runner script
  const script = generateRunnerScript(config, store);
  const runnerPath = store.getRunnerScript(config.taskId);
  fs.writeFileSync(runnerPath, script, { mode: 0o755 });

  // Seed meta.json so bash script can update it
  const meta: RunMeta = {
    taskId: config.taskId,
    tmuxSession,
    logFile,
    agent: config.target,
    model: config.model,
    worktree: config.worktreePath,
    status: "running",
    startedAt: new Date().toISOString(),
    prUrl: null,
    reviewerAgent: config.reviewerTarget,
    reviewerModel: config.reviewerModel,
    reviewerReasoningEffort: config.reviewerReasoningEffort,
  };
  store.writeRunMeta(config.taskId, meta);

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
