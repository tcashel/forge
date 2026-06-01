/**
 * Forge Critique — adversarial spec review via two independent critics
 * and a synthesizer.
 *
 * Each critique run gets its own tmux session: forge-crit-<short-id>
 * Critics run in parallel, then the synthesizer merges their output.
 * Status is written to ~/.forge/critiques/<planId>/<critiqueId>/critique-meta.json.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { agentCommand, claudeJobCommand } from "./agents/index.ts";
import { readResultFromFile } from "./claude-stream.ts";
import { recordCritiqueStarted, type SidecarMetricsPatch, syncCritiqueState } from "./db/writes.ts";
import { isTmuxSessionAlive, killTmuxSession } from "./launch.js";
import type { CritiqueMeta, ForgeStore, LaunchTarget, ReasoningEffort } from "./store.js";

/**
 * Derive the stream-json sidecar path for a critique slot from its `.md`
 * output path. Single source of truth — both the bash runner and the TS
 * finalize call site call this so they cannot drift.
 *
 * `critique-a.md` → `critique-a.stream.jsonl`, etc.
 */
export function slotSidecarPath(outputMdPath: string): string {
  return outputMdPath.replace(/\.md$/, ".stream.jsonl");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CritiqueAgent {
  agent: LaunchTarget;
  model: string;
  reasoningEffort?: ReasoningEffort;
}

export interface CritiqueConfig {
  planId: string;
  critiqueId: string;
  specBody: string;
  specTitle: string;
  repoRoot: string;
  repoName: string;
  contextContent: string | null;
  criticA: CritiqueAgent;
  criticB: CritiqueAgent;
  synthesizer: CritiqueAgent;
  /**
   * Informational only. `runCritiqueSync` always runs sync regardless;
   * `launchCritique` always runs background regardless. Tracked here so
   * callers can pass through their intent without splitting config types.
   */
  mode?: "sync" | "background";
}

export interface CritiqueResult {
  tmuxSession: string;
  logFile: string;
  error: string | null;
}

// ─── Skill loading ────────────────────────────────────────────────────────────

function skillDir(): string {
  // critique.ts lives at src/core/, but skills/ is at the repo root.
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "skills");
}

function readSkillFile(relPath: string): string {
  try {
    return fs.readFileSync(path.join(skillDir(), relPath), "utf-8");
  } catch {
    return "";
  }
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildCriticPrompt(config: CritiqueConfig, label: "A" | "B"): string {
  const skillBody = readSkillFile("forge-critic/SKILL.md");
  const severityPath = path.join(skillDir(), "forge-critic", "severity.md");

  const ctxSection = config.contextContent
    ? `## Repository Context\n\n${config.contextContent.slice(0, 4000)}\n\n---\n\n`
    : "";

  return `You are Critic ${label} in an adversarial spec review.

Working directory: ${config.repoRoot}

${ctxSection}## forge-critic skill

Use these instructions. The severity labels file sits at:
- ${severityPath}

${skillBody.trim()}

---

## Spec Under Review

Title: ${config.specTitle}

${config.specBody}

---

## Instructions

1. Read the spec above carefully.
2. Use your read-only tools to verify file paths and claims in the spec against the actual codebase at ${config.repoRoot}.
3. Produce your critique in a single \`\`\`forge-spec-critique fenced block per the skill instructions.
4. Read-only — do not edit, write, or run mutating commands.
`;
}

// ─── Runner script generation ─────────────────────────────────────────────────

/** Escape single quotes for safe embedding in bash single-quoted strings. */
function escapeSQ(s: string): string {
  return s.replace(/'/g, "'\\''");
}

export function generateRunnerScript(config: CritiqueConfig, store: ForgeStore): string {
  const dir = store.getCritiqueDir(config.planId, config.critiqueId);
  const metaFile = path.join(dir, "critique-meta.json");

  const promptA = path.join(dir, "critic-a.txt");
  const promptB = path.join(dir, "critic-b.txt");
  const promptSynth = path.join(dir, "synth.txt");
  const outputA = path.join(dir, "critique-a.md");
  const outputB = path.join(dir, "critique-b.md");
  const outputRec = path.join(dir, "recommendations.md");
  const logA = path.join(dir, "agent-a.log");
  const logB = path.join(dir, "agent-b.log");
  const logSynth = path.join(dir, "synth.log");
  const streamA = slotSidecarPath(outputA);
  const streamB = slotSidecarPath(outputB);
  const streamRec = slotSidecarPath(outputRec);

  const cmdA =
    config.criticA.agent === "claude"
      ? claudeJobCommand(config.criticA.model, promptA, streamA)
      : agentCommand(config.criticA.agent, config.criticA.model, promptA, {
          reasoningEffort: config.criticA.reasoningEffort,
        });
  const cmdB =
    config.criticB.agent === "claude"
      ? claudeJobCommand(config.criticB.model, promptB, streamB)
      : agentCommand(config.criticB.agent, config.criticB.model, promptB, {
          reasoningEffort: config.criticB.reasoningEffort,
        });
  const cmdSynth =
    config.synthesizer.agent === "claude"
      ? claudeJobCommand(config.synthesizer.model, promptSynth, streamRec)
      : agentCommand(config.synthesizer.agent, config.synthesizer.model, promptSynth, {
          reasoningEffort: config.synthesizer.reasoningEffort,
        });

  const criticAIsClaude = config.criticA.agent === "claude";
  const criticBIsClaude = config.criticB.agent === "claude";
  const synthIsClaude = config.synthesizer.agent === "claude";

  // Build synth prompt parts for bash heredoc assembly after critics finish
  const synthSkill = readSkillFile("forge-synthesizer/SKILL.md");
  const synthPreamble = escapeSQ(`You are the Critique Synthesizer.

${synthSkill.trim()}

---

## Original Spec

Title: ${config.specTitle}

${config.specBody}

---

## Critique A

`);

  const synthMiddle = escapeSQ(`

---

## Critique B

`);

  const synthPostamble = escapeSQ(`

---

## Instructions

Read the original spec and both critiques above. Produce your recommendations in a single \`\`\`forge-spec-recommendations fenced block per the skill instructions.
`);

  return `#!/usr/bin/env bash
# Forge critique runner — task: ${config.planId} critique: ${config.critiqueId}
set -uo pipefail

META_FILE="${metaFile}"
REPO_ROOT="${config.repoRoot}"

update_meta() {
  python3 -c "
import json, sys
with open('$META_FILE') as f: d = json.load(f)
for kv in sys.argv[1:]:
    keys, val = kv.split('=', 1)
    parts = keys.split('.')
    obj = d
    for p in parts[:-1]:
        obj = obj[p]
    try:
        obj[parts[-1]] = json.loads(val)
    except (json.JSONDecodeError, ValueError):
        obj[parts[-1]] = val
with open('$META_FILE', 'w') as f: json.dump(d, f, indent=2)
" "$@" 2>/dev/null || true
}

# Trust the stream-json sidecar's terminal result event as the source of
# truth for a claude slot, in both directions: it force-fails a clean (exit
# 0) run whose sidecar never produced a valid result, and it rescues a
# non-zero exit whose sidecar DID produce one (claude/tee/SIGPIPE hiccups
# after a complete critique). $1 = sidecar, $2 = .md output, $3 = fence
# marker the output must contain. Evaluates is_error / stop_reason against
# the LAST "type":"result" line only — a mid-stream tool_result carrying
# "is_error":true (e.g. a read-only grep that matched nothing) must not
# count. stop_reason is an allowlist (end_turn/tool_use/stop_sequence);
# anything else — max_tokens, error, or an unknown stop — fails closed. The
# .md must be a COMPLETE fenced block (opening marker + closing fence).
crit_slot_valid() {
  local stream="$1" md="$2" fence="$3" result_line stop last
  [ -s "$stream" ] || return 1
  result_line=$(grep '"type":"result"' "$stream" | tail -1)
  [ -n "$result_line" ] || return 1
  printf '%s' "$result_line" | grep -q '"is_error":true' && return 1
  # stop_reason allowlist (fail closed): if present, must be end_turn /
  # tool_use / stop_sequence. max_tokens, error, and any unknown/future stop
  # (refusal, pause_turn, …) fail. An absent/null stop_reason is allowed.
  stop=$(printf '%s' "$result_line" | grep -o '"stop_reason":"[^"]*"' | head -1 | sed 's/.*:"//; s/"$//')
  if [ -n "$stop" ]; then
    case "$stop" in
      end_turn|tool_use|stop_sequence) ;;
      *) return 1 ;;
    esac
  fi
  # output must be a COMPLETE fenced block: opening marker present AND a closing
  # fence as the last non-blank line. A run killed mid-write after the opening
  # fence lacks the close and must not be rescued (truncated output). The close
  # is matched whitespace-tolerantly — CommonMark allows leading indent and
  # trailing spaces on the closing fence, so a clean critic must not be
  # force-failed merely for padding around its \`\`\`.
  [ -s "$md" ] || return 1
  grep -q "$fence" "$md" || return 1
  last=$(grep -v '^[[:space:]]*$' "$md" | tail -1 | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')
  printf '%s' "$last" | grep -Eq '^\`{3,}$' || return 1
  return 0
}

echo "╔══════════════════════════════════════════════════════╗"
echo "  FORGE CRITIQUE — ${config.critiqueId}"
echo "  Spec  : ${config.specTitle}"
echo "  Repo  : ${config.repoName}"
echo "  Start : $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

cd "$REPO_ROOT"

# ── Phase 1: Run critics in parallel ─────────────────────────────────────────

echo "═══ CRITICS (parallel) ═══"
update_meta "status=running_critics"

CRIT_A_START=$SECONDS
(
  ${cmdA} > "${outputA}" 2> "${logA}"
) &
PID_A=$!

CRIT_B_START=$SECONDS
(
  ${cmdB} > "${outputB}" 2> "${logB}"
) &
PID_B=$!

wait $PID_A
EXIT_A=$?
CRIT_A_DUR=$(( (SECONDS - CRIT_A_START) * 1000 ))

wait $PID_B
EXIT_B=$?
CRIT_B_DUR=$(( (SECONDS - CRIT_B_START) * 1000 ))

# Reconcile each claude slot against its stream-json sidecar. A clean (exit
# 0) run whose sidecar never produced a valid terminal result is force-failed
# so synthesis does not feed garbage into the synth prompt; a non-zero exit
# whose sidecar DID produce a valid result (plus a non-empty critique .md) is
# rescued — the terminal result event, not the pipeline exit code, is the
# source of truth. Codex slots stay exit-code-only (no parseable sidecar).
${
  criticAIsClaude
    ? `if [ "$EXIT_A" -eq 0 ]; then
  if ! crit_slot_valid "${streamA}" "${outputA}" '\`\`\`forge-spec-critique'; then
    EXIT_A=1
    echo "  (critic A silent failure: sidecar empty, missing/failed result, or empty/truncated output)"
  fi
elif crit_slot_valid "${streamA}" "${outputA}" '\`\`\`forge-spec-critique'; then
  EXIT_A=0
  echo "  (critic A: non-zero exit but valid result — rescued)"
fi`
    : "# critic A not claude — no stream-json sidecar check"
}
${
  criticBIsClaude
    ? `if [ "$EXIT_B" -eq 0 ]; then
  if ! crit_slot_valid "${streamB}" "${outputB}" '\`\`\`forge-spec-critique'; then
    EXIT_B=1
    echo "  (critic B silent failure: sidecar empty, missing/failed result, or empty/truncated output)"
  fi
elif crit_slot_valid "${streamB}" "${outputB}" '\`\`\`forge-spec-critique'; then
  EXIT_B=0
  echo "  (critic B: non-zero exit but valid result — rescued)"
fi`
    : "# critic B not claude — no stream-json sidecar check"
}

if [ "$EXIT_A" -eq 0 ]; then
  update_meta "criticA.status=done" "criticA.durationMs=$CRIT_A_DUR"
  echo "✓ Critic A completed (\${CRIT_A_DUR}ms)"
else
  update_meta "criticA.status=failed" "criticA.durationMs=$CRIT_A_DUR"
  echo "✗ Critic A failed (exit $EXIT_A)"
fi

if [ "$EXIT_B" -eq 0 ]; then
  update_meta "criticB.status=done" "criticB.durationMs=$CRIT_B_DUR"
  echo "✓ Critic B completed (\${CRIT_B_DUR}ms)"
else
  update_meta "criticB.status=failed" "criticB.durationMs=$CRIT_B_DUR"
  echo "✗ Critic B failed (exit $EXIT_B)"
fi

if [ "$EXIT_A" -ne 0 ] || [ "$EXIT_B" -ne 0 ]; then
  update_meta "status=failed" "completedAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "✗ One or both critics failed — skipping synthesizer"
  exit 1
fi

# ── Build synth prompt with actual critique content ───────────────────────────

echo ""
echo "═══ BUILDING SYNTH PROMPT ═══"

{
  echo '${synthPreamble}'
  cat "${outputA}"
  echo '${synthMiddle}'
  cat "${outputB}"
  echo '${synthPostamble}'
} > "${promptSynth}"

echo "✓ Synth prompt written"

# ── Phase 2: Run synthesizer ─────────────────────────────────────────────────

echo ""
echo "═══ SYNTHESIZER ═══"
update_meta "status=running_synth"

SYNTH_START=$SECONDS
${cmdSynth} > "${outputRec}" 2> "${logSynth}"
EXIT_SYNTH=$?
SYNTH_DUR=$(( (SECONDS - SYNTH_START) * 1000 ))

${
  synthIsClaude
    ? `if [ "$EXIT_SYNTH" -eq 0 ]; then
  if ! crit_slot_valid "${streamRec}" "${outputRec}" '\`\`\`forge-spec-recommendations'; then
    EXIT_SYNTH=1
    echo "  (synthesizer silent failure: sidecar empty, missing/failed result, or empty/truncated output)"
  fi
elif crit_slot_valid "${streamRec}" "${outputRec}" '\`\`\`forge-spec-recommendations'; then
  EXIT_SYNTH=0
  echo "  (synthesizer: non-zero exit but valid result — rescued)"
fi`
    : "# synthesizer not claude — no stream-json sidecar check"
}

if [ "$EXIT_SYNTH" -eq 0 ]; then
  update_meta "synthesizer.status=done" "synthesizer.durationMs=$SYNTH_DUR" "status=done" "completedAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "✓ Synthesizer completed (\${SYNTH_DUR}ms)"
else
  update_meta "synthesizer.status=failed" "synthesizer.durationMs=$SYNTH_DUR" "status=failed" "completedAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "✗ Synthesizer failed (exit $EXIT_SYNTH)"
  exit 1
fi

echo ""
echo "═══ DONE: $(date -u +%Y-%m-%dT%H:%M:%SZ) ═══"
echo "Recommendations: ${outputRec}"
`;
}

/**
 * Set up the critique directory: write critic prompts, seed
 * critique-meta.json, generate the runner script. Shared by both
 * `launchCritique` (tmux/background) and `runCritiqueSync` (synchronous).
 */
function prepareCritique(config: CritiqueConfig, store: ForgeStore, tmuxSession: string): { runnerPath: string } {
  const critiqueDir = store.getCritiqueDir(config.planId, config.critiqueId);
  fs.mkdirSync(critiqueDir, { recursive: true });

  fs.writeFileSync(path.join(critiqueDir, "critic-a.txt"), buildCriticPrompt(config, "A"), "utf-8");
  fs.writeFileSync(path.join(critiqueDir, "critic-b.txt"), buildCriticPrompt(config, "B"), "utf-8");

  const meta: CritiqueMeta = {
    schemaVersion: 1,
    planId: config.planId,
    critiqueId: config.critiqueId,
    specTitle: config.specTitle,
    repoRoot: config.repoRoot,
    repoName: config.repoName,
    status: "running_critics",
    startedAt: new Date().toISOString(),
    completedAt: null,
    viewedAt: null,
    tmuxSession,
    criticA: {
      agent: config.criticA.agent,
      model: config.criticA.model,
      reasoningEffort: config.criticA.reasoningEffort,
      status: "pending",
      durationMs: null,
    },
    criticB: {
      agent: config.criticB.agent,
      model: config.criticB.model,
      reasoningEffort: config.criticB.reasoningEffort,
      status: "pending",
      durationMs: null,
    },
    synthesizer: {
      agent: config.synthesizer.agent,
      model: config.synthesizer.model,
      reasoningEffort: config.synthesizer.reasoningEffort,
      status: "pending",
      durationMs: null,
    },
  };
  store.writeCritiqueMeta(config.planId, config.critiqueId, meta);

  // Phase 3 dual-write: record critique start in SQLite. DB failure is
  // warned, not fatal — the critique-meta.json above is the live source
  // of truth during the dual-write window.
  try {
    const task = store.getPlan(config.planId);
    if (task) recordCritiqueStarted(store.db.db, task, meta);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`warn: failed to record critique_runs for ${config.critiqueId}: ${msg}\n`);
  }

  const script = generateRunnerScript(config, store);
  const runnerPath = path.join(critiqueDir, "run.sh");
  fs.writeFileSync(runnerPath, script, { mode: 0o755 });

  return { runnerPath };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function launchCritique(config: CritiqueConfig, store: ForgeStore): Promise<CritiqueResult> {
  const tmuxSession = `forge-crit-${config.critiqueId.slice(-14)}`;
  const critiqueDir = store.getCritiqueDir(config.planId, config.critiqueId);
  const logFile = path.join(critiqueDir, "agent-a.log");

  const { runnerPath } = prepareCritique(config, store, tmuxSession);

  // Kill stale session
  killTmuxSession(tmuxSession);

  try {
    execSync(
      `tmux new-session -d -s "${tmuxSession}" -c "${config.repoRoot}" "bash '${runnerPath}'; read -p 'Press Enter to close...' "`,
      { stdio: "pipe" },
    );
    await new Promise((r) => setTimeout(r, 500));
    if (!isTmuxSessionAlive(tmuxSession)) {
      return { tmuxSession, logFile, error: "tmux session died immediately — check runner script" };
    }
    return { tmuxSession, logFile, error: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { tmuxSession, logFile, error: `Failed to start tmux: ${msg}` };
  }
}

export interface CritiqueSyncResult {
  recommendationsPath: string;
  critiqueId: string;
  error: string | null;
}

/**
 * Run the critique pipeline synchronously, blocking until the runner exits.
 * Used by the auto-improve loop where the caller needs the recommendations
 * file in the same process. No tmux session, no polling.
 */
export async function runCritiqueSync(config: CritiqueConfig, store: ForgeStore): Promise<CritiqueSyncResult> {
  const tmuxSession = `forge-crit-${config.critiqueId.slice(-14)}`;
  const critiqueDir = store.getCritiqueDir(config.planId, config.critiqueId);
  const recommendationsPath = path.join(critiqueDir, "recommendations.md");
  const runnerLog = path.join(critiqueDir, "runner.log");

  const { runnerPath } = prepareCritique(config, store, tmuxSession);

  let runnerError: string | null = null;
  try {
    const out = fs.openSync(runnerLog, "w");
    try {
      execSync(`bash '${runnerPath.replace(/'/g, "'\\''")}'`, {
        stdio: ["ignore", out, out],
      });
    } finally {
      fs.closeSync(out);
    }
  } catch (e: unknown) {
    runnerError = e instanceof Error ? e.message : String(e);
  }

  const finalMeta = store.readCritiqueMeta(config.planId, config.critiqueId);
  if (finalMeta) {
    const sidecarMetrics = await readCritiqueSidecarMetrics(finalMeta, critiqueDir);
    try {
      syncCritiqueState(store.db.db, finalMeta, { sidecarMetrics });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`warn: syncCritiqueState failed for ${config.critiqueId}: ${msg}\n`);
    }
  }

  if (runnerError !== null) {
    const detail = finalMeta?.status === "failed" ? "critics or synthesizer failed" : runnerError;
    return { recommendationsPath, critiqueId: config.critiqueId, error: `critique runner failed: ${detail}` };
  }
  if (!finalMeta || finalMeta.status !== "done") {
    return {
      recommendationsPath,
      critiqueId: config.critiqueId,
      error: `critique did not complete (status=${finalMeta?.status ?? "unknown"})`,
    };
  }
  if (!fs.existsSync(recommendationsPath)) {
    return {
      recommendationsPath,
      critiqueId: config.critiqueId,
      error: "recommendations file missing after critique",
    };
  }
  return { recommendationsPath, critiqueId: config.critiqueId, error: null };
}

/**
 * Parse stream-json sidecars for each claude slot in a critique and
 * project the result into the patch shape `syncCritiqueState` expects.
 * Non-claude slots are absent from the map (no sidecar exists). Missing
 * / unreadable / is_error sidecars also leave their slot absent so prior
 * metrics are preserved via mergeMetrics rather than clobbered with nulls.
 */
export async function readCritiqueSidecarMetrics(
  meta: CritiqueMeta,
  critiqueDir: string,
): Promise<Partial<Record<"criticA" | "criticB" | "synth", SidecarMetricsPatch>>> {
  const out: Partial<Record<"criticA" | "criticB" | "synth", SidecarMetricsPatch>> = {};
  if (meta.criticA.agent === "claude") {
    const patch = await readSidecarPatch(path.join(critiqueDir, "critique-a.stream.jsonl"));
    if (patch) out.criticA = patch;
  }
  if (meta.criticB.agent === "claude") {
    const patch = await readSidecarPatch(path.join(critiqueDir, "critique-b.stream.jsonl"));
    if (patch) out.criticB = patch;
  }
  if (meta.synthesizer.agent === "claude") {
    const patch = await readSidecarPatch(path.join(critiqueDir, "recommendations.stream.jsonl"));
    if (patch) out.synth = patch;
  }
  return out;
}

/**
 * Read-path safety net for background critiques. The tmux runner exits
 * after writing critique-meta.json, but the original TS process that
 * invoked `launchCritique` is long gone — so nothing on the call path
 * has finalized the DB sessions. The Activity endpoint calls this
 * before serving the list so terminal critiques land their tokens/cost.
 *
 * Idempotent: skips critiques whose sessions are no longer `running`.
 */
export async function reconcileCritiqueSessions(store: ForgeStore): Promise<void> {
  const rows = store.db.db
    .prepare(
      `SELECT DISTINCT s.related_id AS critiqueId
         FROM sessions s
        WHERE s.purpose IN ('critique','synthesis')
          AND s.state = 'running'
          AND s.related_id IS NOT NULL`,
    )
    .all() as Array<{ critiqueId: string }>;

  for (const { critiqueId } of rows) {
    const planRow = store.db.db
      .prepare(
        `SELECT pv.plan_id AS planId
           FROM critic_runs cr
           JOIN plan_versions pv ON pv.id = cr.target_id AND cr.target_kind = 'plan_version'
          WHERE cr.id LIKE ?
          LIMIT 1`,
      )
      .get(`cr-${critiqueId}-%`) as { planId: string } | undefined;
    if (!planRow) continue;

    const meta = store.readCritiqueMeta(planRow.planId, critiqueId);
    if (!meta) continue;
    if (meta.status !== "done" && meta.status !== "failed") continue;

    const dir = store.getCritiqueDir(planRow.planId, critiqueId);
    const sidecarMetrics = await readCritiqueSidecarMetrics(meta, dir);
    try {
      syncCritiqueState(store.db.db, meta, { sidecarMetrics });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`warn: syncCritiqueState failed for ${critiqueId}: ${msg}\n`);
    }
  }
}

/**
 * Read a stream-json sidecar and project the final `result` event into a
 * SessionMetrics patch. Drops `durationMs` (the bash wall-clock in
 * critique-meta.json is authoritative) and returns null when the sidecar
 * is missing / has no result event / reports an empty result string — the
 * caller treats absence as "tokens unknown" and leaves prior metrics alone.
 */
export async function readSidecarPatch(sidecarPath: string): Promise<SidecarMetricsPatch | null> {
  if (!fs.existsSync(sidecarPath)) return null;
  const r = await readResultFromFile(sidecarPath);
  // Zero tokens + null cost means either no `result` event was found
  // (no useful patch) or the event was an is_error / empty-result one
  // (real claude failure — the slot will already be marked failed by
  // the bash silent-failure check). Either way, suppress the patch so
  // mergeMetrics preserves whatever was there before.
  const hasTokens = (r.tokensIn ?? 0) > 0 || (r.tokensOut ?? 0) > 0;
  if (!hasTokens && r.totalCostUsd === null) return null;
  return {
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
    cacheRead: r.cacheRead,
    cacheCreate: r.cacheCreate,
    costUsd: r.totalCostUsd,
    costSource: r.totalCostUsd !== null ? "provider" : null,
  };
}
