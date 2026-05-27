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
import { recordJobStarted } from "./db/writes.ts";
import { bashGhEnvExport } from "./gh.js";
import { buildFixerPromptPrefix, buildReviewerPromptPrefix } from "./reviewer.js";
import type { ForgeStore, LaunchTarget, ReasoningEffort, RunMeta } from "./store.js";

export interface LaunchConfig {
  planId: string;
  specContent: string; // raw spec markdown (body only, no frontmatter)
  specTitle: string;
  target: LaunchTarget;
  model: string;
  reasoningEffort?: ReasoningEffort;
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
  autoFix: boolean;
  autoFixRounds: number;
  fixerTarget: LaunchTarget;
  fixerModel: string;
  fixerReasoningEffort?: ReasoningEffort;
  /** Per-repo gh account override (see gh.ts). Falls back to gh's active account. */
  ghUser?: string;
  /** Per-repo gh host override. Falls back to github.com. */
  ghHost?: string;
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

export function tmuxSessionName(planId: string): string {
  // tmux names: 16 chars max for readability, use last part of id which has the timestamp
  return `forge-${planId.slice(-14)}`;
}

// ─── Agent command builder ────────────────────────────────────────────────────

export function agentCommand(
  target: LaunchTarget,
  model: string,
  promptFile: string,
  opts?: { reasoningEffort?: "low" | "medium" | "high" | "xhigh" },
): string {
  switch (target) {
    case "claude":
      return `claude --print --dangerously-skip-permissions --model "${model}" < "${promptFile}"`;
    case "codex": {
      const reasoningFlag = opts?.reasoningEffort ? ` --config reasoning_effort=${opts.reasoningEffort}` : "";
      return `codex exec --model "${model}"${reasoningFlag} --dangerously-bypass-approvals-and-sandbox --add-dir "${path.dirname(promptFile)}" "$(cat '${promptFile}')"`;
    }
    case "opencode":
      // opencode `run` takes the message as a positional. Headless mode auto-approves
      // tool calls (verified via smoke test).
      return `opencode run --model "${model}" "$(cat '${promptFile}')"`;
    case "gemini":
      // -y is gemini's "yolo" mode — auto-approve all tool calls. Equivalent of
      // claude's --dangerously-skip-permissions and codex's --dangerously-bypass-approvals-and-sandbox.
      return `gemini -y -m "${model}" -p "$(cat '${promptFile}')"`;
  }
}

// ─── Runner script ────────────────────────────────────────────────────────────

function conventionalCommitPrefix(branch: string): string {
  const m = branch.match(/^(feat|fix|chore|docs|refactor|test|ci|style|perf|build)\//);
  return m ? m[1] : "feat";
}

function generateAutoFixBlock(config: LaunchConfig, runDir: string, fixerCmd: string, reviewerCmd: string): string {
  const qualityCheck = fixQualityBlock(config.qualityCommands);
  return `  # ── Auto-fix ────────────────────────────────────────────────────────────────
  CURRENT_VERDICT=$(python3 -c "
import json
try:
    d = json.load(open('${runDir}/meta.json'))
    print(d.get('reviewVerdict', '') or '')
except Exception:
    print('')
" 2>/dev/null || echo "")
  FIX_ROUND=0
  while [ "$CURRENT_VERDICT" = "request-changes" ] && [ $FIX_ROUND -lt ${config.autoFixRounds} ]; do
    FIX_ROUND=$(( FIX_ROUND + 1 ))
    log ""
    log "═══ AUTO-FIX round $FIX_ROUND / ${config.autoFixRounds} ═══"
    set_status "fixing"

    # Build fixer prompt: skill header + spec + review findings
    {
      cat "$RUN_DIR/fixer-prompt-prefix.txt"
      echo
      echo "## Spec"
      echo
      cat "$RUN_DIR/spec-snapshot.md"
      echo
      echo "## Review findings to address"
      echo "(Fix BLOCKER and HIGH severity findings only. Leave MEDIUM and LOW for the human reviewer.)"
      echo
      cat "$RUN_DIR/review.md"
    } > "$RUN_DIR/fix-prompt.txt"

    # Run fixer agent
    if ${fixerCmd} > "$RUN_DIR/fix-raw-$FIX_ROUND.md" 2>&1; then
      log "✓ Fixer completed"

      # Re-run quality gates
      FIX_QUALITY_OK=1
${qualityCheck}

      if [ "$FIX_QUALITY_OK" = "1" ]; then
        # Commit and push fixes if there are changes
        if git -C "$WORKTREE" diff --quiet && git -C "$WORKTREE" diff --cached --quiet; then
          log "  (no changes to commit after fix)"
        else
          git -C "$WORKTREE" add -A
          git -C "$WORKTREE" commit -m "fix(review): address reviewer feedback (round $FIX_ROUND)"
          git -C "$WORKTREE" push 2>&1 | tee -a "$LOG_FILE"
          log "✓ Fix committed and pushed"
        fi

        # Re-run reviewer with fresh diff
        log ""
        log "═══ RE-REVIEW after fix $FIX_ROUND ═══"
        set_status "reviewing"

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

        if ${reviewerCmd} > "$RUN_DIR/review-raw-fix-$FIX_ROUND.md" 2>&1; then
          NEW_VERDICT=$(python3 -c "
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
" "$RUN_DIR/review-raw-fix-$FIX_ROUND.md" "$RUN_DIR/review.md" 2>/dev/null)
          RE_EXTRACT=$?

          if [ "$RE_EXTRACT" -eq 2 ]; then
            log "⚠  No forge-review block in re-review output"
            set_meta_field "reviewVerdict" "null"
            set_meta_field "reviewError" '"no forge-review block in re-review"'
            CURRENT_VERDICT=""
          elif [ -z "$NEW_VERDICT" ] || [ "$NEW_VERDICT" = "null" ]; then
            log "⚠  Verdict missing from re-review"
            set_meta_field "reviewVerdict" "null"
            CURRENT_VERDICT=""
          else
            log "✓ Re-review verdict: $NEW_VERDICT"
            set_meta_field "reviewVerdict" "$NEW_VERDICT"
            CURRENT_VERDICT=$(echo "$NEW_VERDICT" | tr -d '"')
          fi
        else
          RE_EXIT=$?
          log "⚠  Re-reviewer failed (exit $RE_EXIT) — stopping auto-fix"
          set_meta_field "reviewError" '"re-reviewer process failed"'
          break
        fi
      else
        log "⚠  Quality gates failed after fix — stopping auto-fix"
        break
      fi
    else
      FIX_EXIT=$?
      log "⚠  Fixer agent failed (exit $FIX_EXIT) — stopping auto-fix"
      set_meta_field "reviewError" '"fixer agent failed"'
      break
    fi
  done

  if [ "$CURRENT_VERDICT" = "approve" ]; then
    log ""
    log "✓ Auto-fix complete — reviewer approved"
  elif [ $FIX_ROUND -ge ${config.autoFixRounds} ] && [ $FIX_ROUND -gt 0 ]; then
    log ""
    log "↩  Auto-fix reached max rounds (${config.autoFixRounds}) — final verdict: $CURRENT_VERDICT"
  fi`;
}

function fixQualityBlock(qualityCommands: string[]): string {
  if (qualityCommands.length === 0) return "        : # no quality commands";
  return qualityCommands
    .map((cmd) => {
      const escaped = cmd.replace(/"/g, '\\"');
      return `        if ! (cd "$WORKTREE" && eval "${escaped}" >> "$LOG_FILE" 2>&1); then
          log "  ✗ quality gate failed after fix"
          FIX_QUALITY_OK=0
        fi`;
    })
    .join("\n");
}

function generateRunnerScript(config: LaunchConfig, store: ForgeStore): string {
  const runDir = store.ensureRunDir(config.planId);
  const logFile = store.getLogFile(config.planId);
  const metaFile = path.join(runDir, "meta.json");
  const promptFile = store.getPromptFile(config.planId);
  const specFile = path.join(store.specsDir, `${config.planId}.md`);
  const extDir = path.dirname(fileURLToPath(import.meta.url));
  const prBodyTsPath = path.join(extDir, "pr-body.ts");
  const prBodyArgsTsPath = path.join(extDir, "pr-body-args.ts");

  // ── claude / codex bash runner ──────────────────────────────
  const agentCmd = agentCommand(config.target, config.model, promptFile, {
    reasoningEffort: config.reasoningEffort,
  });
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

  // Build the fixer agent command for the bash script
  const fixerCmd = agentCommand(config.fixerTarget, config.fixerModel, `${runDir}/fix-prompt.txt`, {
    reasoningEffort: config.fixerReasoningEffort,
  });

  const autoFixBash = config.autoFix
    ? generateAutoFixBlock(config, runDir, fixerCmd, reviewerCmd)
    : "  # auto-fix disabled";

  return `#!/usr/bin/env bash
# Forge runner — task: ${config.planId}
set -uo pipefail

TASK_ID="${config.planId}"
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
log "  FORGE — ${config.planId}"
log "  Agent : ${config.target} / ${config.model}"
log "  Repo  : ${config.repoName}  branch: ${config.branch}"
log "  Start : $(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "╚══════════════════════════════════════════════════════╝"
log ""

cd "$WORKTREE"
set_status "running"

${bashGhEnvExport({ user: config.ghUser, host: config.ghHost })}
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

# Build pr-body-args.json via the typed TS CLI (replaces a fragile Python heredoc).
ARGS_FILE="${runDir}/pr-body-args.json"
ARGS_BUILT=0
if node --experimental-strip-types '${prBodyArgsTsPath}' \\
    --task-id "$TASK_ID" \\
    --branch "$BRANCH" \\
    --base-ref "$BASE_REF" \\
    --run-dir "$RUN_DIR" \\
    --spec-path "$SPEC_FILE" \\
    --agent '${config.target}' \\
    --model '${config.model}' \\
    > "$ARGS_FILE" 2>> "$LOG_FILE"; then
  ARGS_BUILT=1
else
  log "⚠  pr-body-args builder failed — see log"
fi

if [ "$ARGS_BUILT" -eq 1 ]; then
  if node --experimental-strip-types '${prBodyTsPath}' "$ARGS_FILE" 2>&1 | tee -a "$LOG_FILE"; then
    if [ -f "$PR_BODY_FILE" ]; then
      PR_BODY_BUILT=1
      log "✓ PR body built"
    fi
  fi
fi

if [ "$PR_BODY_BUILT" -eq 0 ]; then
  log "⚠  PR body build failed — writing minimal Claude Code-format body"
  cat > "$PR_BODY_FILE" <<'FORGE_FALLBACK_EOF'
## Summary

- PR body builder failed during this Forge run. The agent committed the work; please review the diff directly.
- Run logs: see \`~/.forge/runs/${config.planId}/agent.log\`.

## Test plan

- [ ] Manual review of the diff (the structured body could not be auto-generated).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
FORGE_FALLBACK_EOF
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

${autoFixBash}

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
6. Before exiting (after committing), write a structured PR summary to
   \`${path.join(store.runsDir, config.planId, "agent-summary.md")}\`.
   The file MUST contain EXACTLY these two top-level sections (no others,
   no YAML frontmatter):

       ## Summary

       3–6 markdown bullets. Each starts with a bold label and a colon
       describing the kind of change, then a single sentence. Examples:
         - **Bug fix:** unbreak unattended claude runs by passing
           \`--dangerously-skip-permissions\`.
         - **Feature:** add \`forge spec diff\` to show pre/post improvement
           diff for any auto-improved spec.

       ## Test plan

       A markdown checkbox list. Use \`- [x]\` for items you actually ran
       and verified during this run, \`- [ ]\` for items left for the human
       reviewer (e.g. an end-to-end smoke that needs a live agent harness).
       Examples:
         - [x] \`bun test\` — all suites pass
         - [x] Smoke: \`forge launch ... --dry-run\` resolves config
         - [ ] End-to-end: real forge launch in a fresh worktree (deferred)

   If the change is trivial, a single bullet per section is fine. If you
   didn't complete the task, do NOT write the file.
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

// Resume support deleted with the pi-runtime supervisor — claude/codex
// runs don't carry a supervisor-args.json, so resume can't repoint at
// them without first synthesizing one. Re-add later if and when the bash
// runner gains structured state capture.

export async function launchAgent(config: LaunchConfig, store: ForgeStore): Promise<LaunchResult> {
  const tmuxSession = tmuxSessionName(config.planId);
  store.ensureRunDir(config.planId);
  const logFile = store.getLogFile(config.planId);

  // Write agent prompt
  const prompt = buildAgentPrompt(config, store);
  fs.writeFileSync(store.getPromptFile(config.planId), prompt, "utf-8");

  // Snapshot the spec body so it's preserved alongside run artifacts
  const runDir = store.ensureRunDir(config.planId);
  fs.writeFileSync(path.join(runDir, "spec-snapshot.md"), config.specContent, "utf-8");

  // Write reviewer prompt prefix for the post-PR reviewer step.
  // launch.ts now lives at src/core/, but skills/ is at the repo root.
  const skillsRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "skills");
  const reviewPrefix = buildReviewerPromptPrefix({
    repoName: config.repoName,
    skillsDir: path.join(skillsRoot, "forge-reviewer"),
  });
  fs.writeFileSync(path.join(runDir, "review-prompt-prefix.txt"), reviewPrefix, "utf-8");

  // Write fixer prompt prefix for the auto-fix step (if enabled).
  const fixerPrefix = buildFixerPromptPrefix({ skillsDir: path.join(skillsRoot, "forge-fixer") });
  fs.writeFileSync(path.join(runDir, "fixer-prompt-prefix.txt"), fixerPrefix, "utf-8");

  // Write runner script
  const script = generateRunnerScript(config, store);
  const runnerPath = store.getRunnerScript(config.planId);
  fs.writeFileSync(runnerPath, script, { mode: 0o755 });

  // Seed meta.json so bash script can update it
  const meta: RunMeta = {
    planId: config.planId,
    tmuxSession,
    logFile,
    agent: config.target,
    model: config.model,
    worktree: config.worktreePath,
    status: "running",
    startedAt: new Date().toISOString(),
    prUrl: null,
    reasoningEffort: config.reasoningEffort,
    reviewerAgent: config.reviewerTarget,
    reviewerModel: config.reviewerModel,
    reviewerReasoningEffort: config.reviewerReasoningEffort,
  };
  store.writeRunMeta(config.planId, meta);

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

    // Phase 3 dual-write: record the jobs row only after tmux is confirmed
    // alive. Inserting earlier leaves a phantom `running` row when tmux
    // fails — no later sync path covers a launch that never started.
    // Failure here doesn't break the launch; meta.json is still the live
    // source of truth during the cutover.
    try {
      const task = store.getPlan(config.planId);
      if (task) recordJobStarted(store.db.db, task, meta);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`warn: failed to record jobs row for ${config.planId}: ${msg}\n`);
    }

    return { tmuxSession, logFile, error: null };
  } catch (e: any) {
    return { tmuxSession, logFile, error: `Failed to start tmux: ${e.message ?? e}` };
  }
}
