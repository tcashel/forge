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
import { adapterStreamsTokens, agentJobCommand } from "./agents/index.ts";
import { executionSessionId, liveJobId, recordJobStarted } from "./db/writes.ts";
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
  /** Watchdog budget for the implementing-agent stage, in minutes. Default 120. */
  agentTimeoutMinutes?: number;
  /** Watchdog budget for each reviewer pass, in minutes. Default 60. */
  reviewerTimeoutMinutes?: number;
  /** Watchdog budget for each auto-fix fixer pass, in minutes. Default 60. */
  fixerTimeoutMinutes?: number;
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

// ─── Runner script ────────────────────────────────────────────────────────────

function conventionalCommitPrefix(branch: string): string {
  const m = branch.match(/^(feat|fix|chore|docs|refactor|test|ci|style|perf|build)\//);
  return m ? m[1] : "feat";
}

/**
 * Bash snippet emitted at the top of every runner script: defines
 * `forge_session_start` / `forge_session_finish` helpers that call the
 * forge CLI for session recording. Failures route to a side log so the
 * job itself is never blocked on DB write success.
 */
function forgeSessionHelperShell(forgeBin: string, runDir: string): string {
  const helperLog = path.join(runDir, "session-helper.log");
  return `FORGE_BIN="${forgeBin}"
SESSION_HELPER_LOG="${helperLog}"
forge_session_start() {
  bun "$FORGE_BIN" session start "$@" >/dev/null 2>>"$SESSION_HELPER_LOG" || true
}
forge_session_finish() {
  bun "$FORGE_BIN" session finish "$@" >/dev/null 2>>"$SESSION_HELPER_LOG" || true
}`;
}

/**
 * Bash single-quoted token for the reviewer's expected fenced block marker.
 * Plain backticks — no backslash escapes: the value is matched with `grep -F`
 * (fixed string), and a `\`` inside the pattern is a literal backtick to BSD
 * grep but a buffer anchor to GNU grep, which silently broke the gate on CI.
 */
const FORGE_REVIEW_FENCE_TOK = "'```forge-review'";

/**
 * Bash snippet reconciling a streaming stage's pipeline exit code against its
 * stream-json sidecar via `stage_result_valid` (anvil lesson 2, PR #64): a
 * non-zero exit with a valid terminal result is rescued, a zero exit without
 * one is force-failed. A watchdog-killed stage (marker file present) is never
 * rescued. Non-streaming adapters keep exit-code-only behavior.
 *
 * `streamTok` / `outTok` / `fenceTok` / `markerTok` are pre-quoted bash tokens.
 */
function stageReconcileShell(opts: {
  adapter: LaunchTarget;
  exitVar: string;
  streamTok: string;
  outTok: string;
  fenceTok: string;
  label: string;
  markerTok: string;
  indent: string;
}): string {
  const I = opts.indent;
  if (!adapterStreamsTokens(opts.adapter)) {
    return `${I}# ${opts.label}: ${opts.adapter} emits no parseable sidecar — exit code stays authoritative`;
  }
  const call = `stage_result_valid "${opts.adapter}" ${opts.streamTok} ${opts.outTok} ${opts.fenceTok}`;
  return [
    `${I}if [ -f ${opts.markerTok} ]; then`,
    `${I}  : # watchdog kill — never rescue a timed-out ${opts.label}`,
    `${I}elif [ "$${opts.exitVar}" -ne 0 ] && ${call}; then`,
    `${I}  ${opts.exitVar}=0`,
    `${I}  log "  (${opts.label}: non-zero exit but valid result — rescued)"`,
    `${I}elif [ "$${opts.exitVar}" -eq 0 ] && ! ${call}; then`,
    `${I}  ${opts.exitVar}=1`,
    `${I}  log "  (${opts.label} silent failure: no valid terminal result in sidecar)"`,
    `${I}fi`,
  ].join("\n");
}

function generateAutoFixBlock(
  config: LaunchConfig,
  runDir: string,
  cmds: {
    fixerCmd: string;
    reviewerCmd: string;
    fixerStreamArg: string;
    reviewerStreamArg: string;
    fixerReconcile: string;
    reReviewReconcile: string;
    reviewerTimeoutMin: number;
    fixerTimeoutMin: number;
  },
): string {
  const { fixerCmd, reviewerCmd, fixerStreamArg, reviewerStreamArg, reviewerTimeoutMin, fixerTimeoutMin } = cmds;
  const qualityCheck = fixQualityBlock(config.qualityCommands);
  return `  # ── Auto-fix ────────────────────────────────────────────────────────────────
  RUN_PHASE="auto_fix"
  CURRENT_VERDICT=$(python3 -c "
import json
try:
    d = json.load(open('${runDir}/meta.json'))
    print(d.get('reviewVerdict', '') or '')
except Exception:
    print('')
" 2>>"$HELPER_LOG" || echo "")
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
    FIX_SESSION_ID="s-fix-$JOB_ID-r$FIX_ROUND"
    forge_session_start --id "$FIX_SESSION_ID" --purpose fix --agent "${config.fixerTarget}" --model "${config.fixerModel}" --related-id "$JOB_ID" --cwd "$WORKTREE"
    rm -f "$RUN_DIR/.stage-timeout-fixer"
    ( ${fixerCmd} > "$RUN_DIR/fix-raw-$FIX_ROUND.md" 2>&1 ) &
    FIXER_PID=$!
    watch_stage "$FIXER_PID" $(( FIXER_TIMEOUT_MINUTES * 60 )) "fixer" &
    FIXER_WATCHDOG=$!
    wait "$FIXER_PID"
    FIX_EXIT=$?
    kill "$FIXER_WATCHDOG" 2>/dev/null || true
${cmds.fixerReconcile}
    forge_session_finish --id "$FIX_SESSION_ID" --exit-code "$FIX_EXIT"${fixerStreamArg}
    if [ -f "$RUN_DIR/.stage-timeout-fixer" ]; then
      log "⚠  Fixer timed out after ${fixerTimeoutMin} minutes — stopping auto-fix"
      set_meta_field "reviewError" "\\"fixer timed out after ${fixerTimeoutMin} minutes\\""
      break
    fi
    if [ "$FIX_EXIT" -ne 0 ]; then
      log "⚠  Fixer agent failed (exit $FIX_EXIT) — stopping auto-fix"
      set_meta_field "reviewError" '"fixer agent failed"'
      break
    fi
    log "✓ Fixer completed"

    # Re-run quality gates
    FIX_QUALITY_OK=1
${qualityCheck}

    if [ "$FIX_QUALITY_OK" != "1" ]; then
      log "⚠  Quality gates failed after fix — stopping auto-fix"
      break
    fi

    # Commit and push fixes if there are changes
    if git -C "$WORKTREE" diff --quiet && git -C "$WORKTREE" diff --cached --quiet; then
      log "  (no changes to commit after fix)"
    else
      git -C "$WORKTREE" add -A
      if git -C "$WORKTREE" commit -m "fix(review): address reviewer feedback (round $FIX_ROUND)" 2>&1 | tee -a "$LOG_FILE"; then
        git -C "$WORKTREE" push 2>&1 | tee -a "$LOG_FILE"
        log "✓ Fix committed and pushed"
      else
        log "⚠  Fix commit failed — stopping auto-fix"
        set_meta_field "reviewError" '"fix commit failed"'
        break
      fi
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

    REVIEW_SESSION_ID="s-review-$JOB_ID-r$(( FIX_ROUND + 1 ))"
    forge_session_start --id "$REVIEW_SESSION_ID" --purpose review --agent "${config.reviewerTarget}" --model "${config.reviewerModel}" --related-id "$JOB_ID" --cwd "$WORKTREE"
    rm -f "$RUN_DIR/.stage-timeout-re-reviewer"
    ( ${reviewerCmd} > "$RUN_DIR/review-raw-fix-$FIX_ROUND.md" 2>&1 ) &
    RE_PID=$!
    watch_stage "$RE_PID" $(( REVIEWER_TIMEOUT_MINUTES * 60 )) "re-reviewer" &
    RE_WATCHDOG=$!
    wait "$RE_PID"
    RE_EXIT=$?
    kill "$RE_WATCHDOG" 2>/dev/null || true
${cmds.reReviewReconcile}
    forge_session_finish --id "$REVIEW_SESSION_ID" --exit-code "$RE_EXIT"${reviewerStreamArg}
    if [ -f "$RUN_DIR/.stage-timeout-re-reviewer" ]; then
      log "⚠  Re-reviewer timed out after ${reviewerTimeoutMin} minutes — stopping auto-fix"
      set_meta_field "reviewError" "\\"re-reviewer timed out after ${reviewerTimeoutMin} minutes\\""
      break
    fi
    if [ "$RE_EXIT" -ne 0 ]; then
      log "⚠  Re-reviewer failed (exit $RE_EXIT) — stopping auto-fix"
      set_meta_field "reviewError" '"re-reviewer process failed"'
      break
    fi
    # Same last-match strategy as the first reviewer pass — see
    # rationale on the original verdict extractor above.
    NEW_VERDICT=$(bun "$FORGE_BIN" __extract-review "$RUN_DIR/review-raw-fix-$FIX_ROUND.md" "$RUN_DIR/review.md" 2>>"$HELPER_LOG")
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

/**
 * Compute the run number the next job for this plan will be assigned.
 * Mirrors the `MAX(run_number) + 1` logic in `recordJobStarted`. Used
 * to embed the deterministic execution session id into the runner
 * script before tmux is started.
 */
function nextJobRunNumber(store: ForgeStore, planId: string): number {
  try {
    const row = store.db.db
      .prepare(
        `SELECT COALESCE(MAX(j.run_number), 0) AS n
           FROM jobs j JOIN tasks t ON j.task_id = t.id
           WHERE t.plan_id = ?`,
      )
      .get(planId) as { n: number } | undefined;
    return (row?.n ?? 0) + 1;
  } catch {
    return 1;
  }
}

/** Exported for tests: the generated bash is the contract under test. */
export function generateRunnerScript(config: LaunchConfig, store: ForgeStore, ids: { jobRunNumber: number }): string {
  const runDir = store.ensureRunDir(config.planId);
  const logFile = store.getLogFile(config.planId);
  const metaFile = path.join(runDir, "meta.json");
  const promptFile = store.getPromptFile(config.planId);
  const specFile = path.join(store.specsDir, `${config.planId}.md`);
  const extDir = path.dirname(fileURLToPath(import.meta.url));
  const prBodyTsPath = path.join(extDir, "pr-body.ts");
  const prBodyArgsTsPath = path.join(extDir, "pr-body-args.ts");
  // bin/forge.ts is two levels up from src/core/launch.ts.
  const forgeBin = path.join(extDir, "..", "..", "bin", "forge.ts");
  const sessionHelper = forgeSessionHelperShell(forgeBin, runDir);

  // ── claude / codex bash runner ──────────────────────────────
  // claude and codex stream JSONL into a sidecar so the session-finish hook
  // can extract tokens (+ cost); other adapters use the plain command and
  // record no tokens.
  const streamFile = path.join(runDir, "agent.stream.jsonl");
  const agentCmd = agentJobCommand(config.target, config.model, promptFile, streamFile, {
    reasoningEffort: config.reasoningEffort,
  });
  const agentStreamFile = adapterStreamsTokens(config.target) ? streamFile : "";
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

  // Build the reviewer agent command for the bash script. claude/codex tee
  // tokens into a per-purpose sidecar; the finish hook parses it. The
  // sidecar is reused across review rounds — runs are strictly sequential
  // (review → fix → re-review), so each finish reads it before the next run
  // overwrites it.
  const reviewerStreamFile = path.join(runDir, "review.stream.jsonl");
  const reviewerCmd = agentJobCommand(
    config.reviewerTarget,
    config.reviewerModel,
    `${runDir}/review-prompt.txt`,
    reviewerStreamFile,
    { reasoningEffort: config.reviewerReasoningEffort },
  );
  const reviewerStreamArg = adapterStreamsTokens(config.reviewerTarget)
    ? ` --stream-json-path "${reviewerStreamFile}"`
    : "";

  // Build the fixer agent command for the bash script
  const fixerStreamFile = path.join(runDir, "fix.stream.jsonl");
  const fixerCmd = agentJobCommand(config.fixerTarget, config.fixerModel, `${runDir}/fix-prompt.txt`, fixerStreamFile, {
    reasoningEffort: config.fixerReasoningEffort,
  });
  const fixerStreamArg = adapterStreamsTokens(config.fixerTarget) ? ` --stream-json-path "${fixerStreamFile}"` : "";

  const agentTimeoutMin = config.agentTimeoutMinutes ?? 120;
  const reviewerTimeoutMin = config.reviewerTimeoutMinutes ?? 60;
  const fixerTimeoutMin = config.fixerTimeoutMinutes ?? 60;

  const agentReconcile = stageReconcileShell({
    adapter: config.target,
    exitVar: "AGENT_EXIT",
    streamTok: `"${streamFile}"`,
    outTok: `"$LOG_FILE"`,
    fenceTok: "''",
    label: "agent",
    markerTok: `"$RUN_DIR/.stage-timeout-agent"`,
    indent: "",
  });
  const reviewerReconcile = stageReconcileShell({
    adapter: config.reviewerTarget,
    exitVar: "REVIEWER_EXIT",
    streamTok: `"${reviewerStreamFile}"`,
    outTok: `"$RUN_DIR/review-raw.md"`,
    fenceTok: FORGE_REVIEW_FENCE_TOK,
    label: "reviewer",
    markerTok: `"$RUN_DIR/.stage-timeout-reviewer"`,
    indent: "  ",
  });
  const fixerReconcile = stageReconcileShell({
    adapter: config.fixerTarget,
    exitVar: "FIX_EXIT",
    streamTok: `"${fixerStreamFile}"`,
    outTok: `"$RUN_DIR/fix-raw-$FIX_ROUND.md"`,
    fenceTok: "''",
    label: "fixer",
    markerTok: `"$RUN_DIR/.stage-timeout-fixer"`,
    indent: "    ",
  });
  const reReviewReconcile = stageReconcileShell({
    adapter: config.reviewerTarget,
    exitVar: "RE_EXIT",
    streamTok: `"${reviewerStreamFile}"`,
    outTok: `"$RUN_DIR/review-raw-fix-$FIX_ROUND.md"`,
    fenceTok: FORGE_REVIEW_FENCE_TOK,
    label: "re-reviewer",
    markerTok: `"$RUN_DIR/.stage-timeout-re-reviewer"`,
    indent: "    ",
  });

  const autoFixBash = config.autoFix
    ? generateAutoFixBlock(config, runDir, {
        fixerCmd,
        reviewerCmd,
        fixerStreamArg,
        reviewerStreamArg,
        fixerReconcile,
        reReviewReconcile,
        reviewerTimeoutMin,
        fixerTimeoutMin,
      })
    : "  # auto-fix disabled";

  return `#!/usr/bin/env bash
# Forge runner — task: ${config.planId}
set -uo pipefail

# Background runners (tmux/launchd) frequently start under a POSIX/C locale.
# There, Python's text-mode open().read() defaults to ASCII and raises
# UnicodeDecodeError on agent output containing em dashes / ✅ / ⚠️ / smart
# quotes — which silently broke verdict extraction (run ended "verdict line
# missing or unrecognised" with no review.md written, even when the reviewer
# returned a perfectly good verdict). PYTHONUTF8 forces Python's UTF-8 mode
# regardless of locale; the LANG default covers gh/git/agent CLIs without
# clobbering a locale the operator already set.
export PYTHONUTF8=1
export LANG="\${LANG:-en_US.UTF-8}"

# Headless git: never prompt for credentials and never invoke a signer —
# gpg/1Password signing prompts hang detached runs while the screen is
# locked. Env-only and operator-scoped: it covers Forge's auto-fix commit
# AND the agent's own commits without writing anything into the target repo.
export GIT_TERMINAL_PROMPT=0
export GIT_CONFIG_COUNT=1
export GIT_CONFIG_KEY_0=commit.gpgsign
export GIT_CONFIG_VALUE_0=false

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
AGENT_TIMEOUT_MINUTES=${agentTimeoutMin}
REVIEWER_TIMEOUT_MINUTES=${reviewerTimeoutMin}
FIXER_TIMEOUT_MINUTES=${fixerTimeoutMin}
HELPER_LOG="${runDir}/session-helpers.log"
RUN_PHASE="init"
RUNNER_FINISHED=0

# ── Helpers ───────────────────────────────────────────────────────────────────

log() { echo "$@" | tee -a "$LOG_FILE"; }

run_cmd() {
  local cmd="$1"
  log ">>> $cmd"
  eval "$cmd" 2>&1 | tee -a "$LOG_FILE"
  return $?  # pipefail makes $? the pipeline's first nonzero exit
}

# Meta writes must never silently no-op: callers pass pre-encoded JSON
# (set_status quotes its argument), anything that doesn't parse falls back
# to a plain string (same as critique.ts's update_meta), and every failure
# lands in $HELPER_LOG instead of /dev/null.
set_meta_field() {
  if ! python3 -c "
import json, sys
with open('$META_FILE') as f: d = json.load(f)
key = sys.argv[1]
val = sys.argv[2]
try:
    d[key] = json.loads(val)
except (json.JSONDecodeError, ValueError):
    d[key] = val
with open('$META_FILE', 'w') as f: json.dump(d, f, indent=2)
" "$1" "$2" 2>>"$HELPER_LOG"; then
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) set_meta_field failed: key=$1" >> "$HELPER_LOG"
  fi
}

set_status() { set_meta_field "status" "\\"$1\\""; }

meta_status() {
  python3 -c "import json; print(json.load(open('$META_FILE')).get('status', ''))" 2>>"$HELPER_LOG" || echo ""
}

# No silent terminal states: if the script dies (crash, signal, tmux
# teardown) while meta still shows a non-terminal status, force-write
# 'failed' naming the phase that was running. Terminal statuses written by
# the normal flow are left untouched.
on_runner_exit() {
  local code=$?
  [ "$RUNNER_FINISHED" = "1" ] && return 0
  case "$(meta_status)" in
    done|failed) ;;
    *)
      set_meta_field "errorMessage" "\\"runner died during phase: $RUN_PHASE (exit $code)\\""
      set_status "failed"
      ;;
  esac
  return 0
}
trap on_runner_exit EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# Recursively signal a stage's process tree, children first. pgrep -P is
# portable to macOS (which ships neither GNU timeout nor setsid).
kill_tree() {
  local pid="$1" sig="$2" kids k
  kids=$(pgrep -P "$pid" 2>/dev/null || true)
  for k in $kids; do kill_tree "$k" "$sig"; done
  kill -"$sig" "$pid" 2>/dev/null || true
}

# Per-stage watchdog, run in the background while the stage runs. On budget
# expiry it drops a marker file (so the main flow can tell a timeout from an
# ordinary failure), then TERM → grace → KILL the stage's whole tree. The
# main flow kills the watchdog once the stage exits on its own.
watch_stage() {
  local pid="$1" secs="$2" label="$3" waited=0
  while kill -0 "$pid" 2>/dev/null; do
    if [ "$waited" -ge "$secs" ]; then
      : > "$RUN_DIR/.stage-timeout-$label"
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) watchdog: $label exceeded $(( secs / 60 ))m — killing pid $pid tree" >> "$HELPER_LOG"
      kill_tree "$pid" TERM
      sleep 10
      kill_tree "$pid" KILL
      return 0
    fi
    sleep 5
    waited=$(( waited + 5 ))
  done
}

# Trust the stream sidecar's LAST terminal event over the pipeline exit code
# (anvil lesson 2, PR #64; modeled on critique.ts's crit_slot_valid): a
# tee/SIGPIPE hiccup after a complete answer must not fail a finished stage,
# and a clean exit with no valid terminal result must not pass.
# $1 = adapter (claude|codex), $2 = sidecar, $3 = output file (must be
# non-empty), $4 = optional fence marker — when given, the output must
# contain it with a closing fence after the LAST occurrence ('' skips the
# gate; agent/fixer output is free-form).
stage_result_valid() {
  local adapter="$1" stream="$2" out="$3" fence="$4" result_line stop last_marker
  [ -s "$stream" ] || return 1
  if [ "$adapter" = "claude" ]; then
    result_line=$(grep '"type":"result"' "$stream" | tail -1)
    [ -n "$result_line" ] || return 1
    printf '%s' "$result_line" | grep -q '"is_error":true' && return 1
    # stop_reason allowlist (fail closed): if present, must be end_turn /
    # tool_use / stop_sequence. Absent/null stop_reason is allowed.
    stop=$(printf '%s' "$result_line" | grep -o '"stop_reason":"[^"]*"' | head -1 | sed 's/.*:"//; s/"$//')
    if [ -n "$stop" ]; then
      case "$stop" in
        end_turn|tool_use|stop_sequence) ;;
        *) return 1 ;;
      esac
    fi
  elif [ "$adapter" = "codex" ]; then
    # codex JSONL: the last turn.* event must be turn.completed — turn.failed
    # or a stream cut mid-turn fails closed.
    result_line=$(grep -o '"type":"turn\\.[a-z_]*"' "$stream" | tail -1)
    [ "$result_line" = '"type":"turn.completed"' ] || return 1
  else
    return 1
  fi
  [ -s "$out" ] || return 1
  if [ -n "$fence" ]; then
    last_marker=$(grep -nF "$fence" "$out" | tail -1 | cut -d: -f1)
    [ -n "$last_marker" ] || return 1
    tail -n +"$(( last_marker + 1 ))" "$out" | grep -Eq '^[[:space:]]*\`{3,}[[:space:]]*$' || return 1
  fi
  return 0
}

# ── Session-recording helpers (no-op on DB failure) ──────────────────────────
${sessionHelper}

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
set_meta_field "baseSha" "\\"$BASE_SHA\\""

# ── Run Agent ─────────────────────────────────────────────────────────────────

log "═══ AGENT (${config.target}) ═══"
RUN_PHASE="agent"
EXEC_SESSION_ID="${executionSessionId(liveJobId(config.planId, ids.jobRunNumber))}"
JOB_ID="${liveJobId(config.planId, ids.jobRunNumber)}"
forge_session_start --id "$EXEC_SESSION_ID" --purpose execution --agent "${config.target}" --model "${config.model}" --related-id "$JOB_ID" --cwd "$WORKTREE"

rm -f "$RUN_DIR/.stage-timeout-agent"
( ${agentCmd} 2>&1 | tee -a "$LOG_FILE" ) &
AGENT_PID=$!
watch_stage "$AGENT_PID" $(( AGENT_TIMEOUT_MINUTES * 60 )) "agent" &
AGENT_WATCHDOG=$!
wait "$AGENT_PID"
AGENT_EXIT=$?  # the subshell inherits pipefail, so this is the pipeline's status
kill "$AGENT_WATCHDOG" 2>/dev/null || true

${agentReconcile}

forge_session_finish --id "$EXEC_SESSION_ID" --exit-code "$AGENT_EXIT"${agentStreamFile ? ` --stream-json-path "${agentStreamFile}"` : ""}

if [ -f "$RUN_DIR/.stage-timeout-agent" ]; then
  log ""
  log "✗ Agent stage timed out after ${agentTimeoutMin} minutes"
  set_meta_field "errorMessage" "\\"agent stage timed out after ${agentTimeoutMin} minutes\\""
  set_status "failed"
  exit 1
fi

if [ "$AGENT_EXIT" -ne 0 ]; then
  log ""
  log "✗ Agent exited with code $AGENT_EXIT"
  set_meta_field "errorMessage" "\\"agent exited with code $AGENT_EXIT\\""
  set_status "failed"
  exit "$AGENT_EXIT"
fi

log ""
log "✓ Agent completed"

# ── Quality checks ────────────────────────────────────────────────────────────

log ""
log "═══ QUALITY CHECKS ═══"
RUN_PHASE="quality"
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
" 2>>"$HELPER_LOG" || true

# ── Verify commits & push ─────────────────────────────────────────────────────────────

log ""
log "═══ VERIFY COMMITS & PUSH ═══"
RUN_PHASE="push"

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
  set_meta_field "errorMessage" '"agent did not commit any work"'
  set_status "failed"
  exit 1
fi

log "✓ $COMMITS_AHEAD commit(s) ahead of $BASE_REF"
git log --oneline "$BASE_REF..HEAD" 2>&1 | tee -a "$LOG_FILE" || true

# Capture final SHA before pushing
FINAL_SHA=$(git rev-parse HEAD)
set_meta_field "finalSha" "\\"$FINAL_SHA\\""

git push -u origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE" || log "push failed — PR creation may fail"

# ── Build structured PR body ──────────────────────────────────────────────────

log ""
log "═══ BUILD PR BODY ═══"
RUN_PHASE="pr_body"

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
RUN_PHASE="create_pr"
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
  PR_NUMBER=$(python3 -c "import sys, re; m = re.search(r'/pull/(\\d+)$', sys.argv[1]); print(m.group(1) if m else '')" "$PR_URL" 2>>"$HELPER_LOG" || true)
  # PR coordinates are data fields, not a terminal status. The single
  # terminal status write happens at the end of the script, after
  # review/auto-fix — writing 'done' here let a status poll latch the plan
  # terminally while the fixer was still pushing commits.
  set_meta_field "prUrl" "\\"$PR_URL\\""
  if [ -n "$PR_NUMBER" ]; then
    set_meta_field "prNumber" "$PR_NUMBER"
  fi
else
  log "✗ PR creation failed — check log above"
  set_meta_field "errorMessage" '"PR creation failed"'
  set_status "failed"
fi

# ── Reviewer ──────────────────────────────────────────────────────────────────

if [ -n "$PR_URL" ] && [ -n "$PR_NUMBER" ]; then
  log ""
  log "═══ REVIEWER ═══"
  RUN_PHASE="review"
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
  REVIEW_SESSION_ID="s-review-${liveJobId(config.planId, ids.jobRunNumber)}-r1"
  forge_session_start --id "$REVIEW_SESSION_ID" --purpose review --agent "${config.reviewerTarget}" --model "${config.reviewerModel}" --related-id "$JOB_ID" --cwd "$WORKTREE"
  rm -f "$RUN_DIR/.stage-timeout-reviewer"
  ( ${reviewerCmd} > "$RUN_DIR/review-raw.md" 2>&1 ) &
  REVIEWER_PID=$!
  watch_stage "$REVIEWER_PID" $(( REVIEWER_TIMEOUT_MINUTES * 60 )) "reviewer" &
  REVIEWER_WATCHDOG=$!
  wait "$REVIEWER_PID"
  REVIEWER_EXIT=$?
  kill "$REVIEWER_WATCHDOG" 2>/dev/null || true
${reviewerReconcile}
  forge_session_finish --id "$REVIEW_SESSION_ID" --exit-code "$REVIEWER_EXIT"${reviewerStreamArg}

  if [ -f "$RUN_DIR/.stage-timeout-reviewer" ]; then
    log "⚠  Reviewer timed out after ${reviewerTimeoutMin} minutes"
    set_meta_field "reviewVerdict" "null"
    set_meta_field "reviewError" "\\"reviewer timed out after ${reviewerTimeoutMin} minutes\\""
  elif [ "$REVIEWER_EXIT" -ne 0 ]; then
    log "⚠  Reviewer process failed (exit $REVIEWER_EXIT)"
    set_meta_field "reviewVerdict" "null"
    set_meta_field "reviewError" "\\"reviewer process exited with code $REVIEWER_EXIT\\""
  else
    # Extract the forge-review fenced block and verdict.
    # Take the LAST matching block, not the first: codex-as-reviewer echoes
    # the SKILL.md prompt verbatim, which contains a template forge-review
    # block whose verdict line is a literal angle-bracketed placeholder
    # (approve | request-changes | block in angle brackets), not a real
    # verdict. The real review is always last. Paired with the fixture in
    # tests/fixtures/reviewer/.
    VERDICT=$(bun "$FORGE_BIN" __extract-review "$RUN_DIR/review-raw.md" "$RUN_DIR/review.md" 2>>"$HELPER_LOG")
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
  fi

${autoFixBash}
fi

# ── Terminal status ───────────────────────────────────────────────────────────

# Single terminal write, after review/auto-fix. quality_failed survives to
# the terminal state instead of being masked by 'done'; a failed PR creation
# already wrote 'failed' above. RUNNER_FINISHED tells the EXIT trap this was
# an orderly shutdown.
RUN_PHASE="finalize"
set_meta_field "endedAt" "\\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\""
set_meta_field "durationMs" "$(( ($(date +%s) - RUN_STARTED_EPOCH) * 1000 ))"
if [ -n "$PR_URL" ]; then
  if [ "$QUALITY_FAILED" -ne 0 ]; then
    set_status "quality_failed"
  else
    set_status "done"
  fi
fi
RUNNER_FINISHED=1

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

  // Write runner script. Compute the expected run number now so the
  // deterministic session ids it embeds match the jobs row recorded
  // post-tmux-alive below.
  const jobRunNumber = nextJobRunNumber(store, config.planId);
  const script = generateRunnerScript(config, store, { jobRunNumber });
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { tmuxSession, logFile, error: `Failed to start tmux: ${message}` };
  }
}
