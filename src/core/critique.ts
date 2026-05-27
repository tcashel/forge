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
import { recordCritiqueStarted } from "./db/writes.ts";
import { agentCommand, isTmuxSessionAlive, killTmuxSession } from "./launch.js";
import type { CritiqueMeta, ForgeStore, LaunchTarget, ReasoningEffort } from "./store.js";

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

function generateRunnerScript(config: CritiqueConfig, store: ForgeStore): string {
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

  const cmdA = agentCommand(config.criticA.agent, config.criticA.model, promptA, {
    reasoningEffort: config.criticA.reasoningEffort,
  });
  const cmdB = agentCommand(config.criticB.agent, config.criticB.model, promptB, {
    reasoningEffort: config.criticB.reasoningEffort,
  });
  const cmdSynth = agentCommand(config.synthesizer.agent, config.synthesizer.model, promptSynth, {
    reasoningEffort: config.synthesizer.reasoningEffort,
  });

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
    const msg = e instanceof Error ? e.message : String(e);
    const finalMeta = store.readCritiqueMeta(config.planId, config.critiqueId);
    const detail = finalMeta?.status === "failed" ? "critics or synthesizer failed" : msg;
    return { recommendationsPath, critiqueId: config.critiqueId, error: `critique runner failed: ${detail}` };
  }

  const finalMeta = store.readCritiqueMeta(config.planId, config.critiqueId);
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
