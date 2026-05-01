/**
 * forge critique <task-id> — adversarial spec review.
 *
 * Spawns two independent critic agents and a synthesizer in tmux.
 * Defaults are read from the per-repo critique config; CLI flags override.
 *
 * Required (via repo-config or flags):
 *   --critic-a-agent <claude|codex|opencode|gemini>   --critic-a-model <id>
 *   --critic-b-agent <claude|codex|opencode|gemini>   --critic-b-model <id>
 *   --synth-agent    <claude|codex|opencode|gemini>   --synth-model    <id>
 *
 * Optional:
 *   --critic-a-reasoning <low|medium|high|xhigh>  (codex only)
 *   --critic-b-reasoning <low|medium|high|xhigh>  (codex only)
 *   --synth-reasoning    <low|medium|high|xhigh>  (codex only)
 *   --json
 */

import { parseArgs } from "node:util";
import { type CritiqueAgent, launchCritique } from "../../core/critique.ts";
import { detectRepo } from "../../core/repo.ts";
import type { ForgeStore, LaunchTarget, ReasoningEffort } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

const VALID_AGENTS: LaunchTarget[] = ["claude", "codex", "opencode", "gemini"];
const VALID_EFFORTS: ReasoningEffort[] = ["low", "medium", "high", "xhigh"];

function asAgent(v: unknown, field: string): LaunchTarget {
  if (typeof v !== "string" || !VALID_AGENTS.includes(v as LaunchTarget)) {
    throw new CliError("BAD_AGENT", `${field} must be one of: ${VALID_AGENTS.join(", ")}`, { exitCode: 1 });
  }
  return v as LaunchTarget;
}

function asEffort(v: unknown, field: string): ReasoningEffort | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "string" || !VALID_EFFORTS.includes(v as ReasoningEffort)) {
    throw new CliError("BAD_EFFORT", `${field} must be one of: ${VALID_EFFORTS.join(", ")}`, { exitCode: 1 });
  }
  return v as ReasoningEffort;
}

function resolveCritiqueAgent(
  label: string,
  cliAgent: unknown,
  cliModel: unknown,
  cliReasoning: unknown,
  cfgAgent: string | undefined,
  cfgModel: string | undefined,
  cfgReasoning: ReasoningEffort | undefined,
): CritiqueAgent {
  const agent = asAgent(cliAgent ?? cfgAgent, `--${label}-agent`);
  const model = (cliModel as string | undefined) ?? cfgModel;
  if (!model) {
    throw new CliError("MISSING_CRITIQUE_CONFIG", `--${label}-model is required (or set via 'forge config set').`, {
      hint: `Try: forge config set ${label === "critic-a" ? "critiqueModelA" : label === "critic-b" ? "critiqueModelB" : "critiqueModelSynth"} <model-id>`,
      exitCode: 1,
    });
  }
  const reasoningEffort = asEffort(cliReasoning, `--${label}-reasoning`) ?? cfgReasoning;
  return { agent, model, reasoningEffort };
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      "critic-a-agent": { type: "string" },
      "critic-a-model": { type: "string" },
      "critic-a-reasoning": { type: "string" },
      "critic-b-agent": { type: "string" },
      "critic-b-model": { type: "string" },
      "critic-b-reasoning": { type: "string" },
      "synth-agent": { type: "string" },
      "synth-model": { type: "string" },
      "synth-reasoning": { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const id = positionals[0];
  if (!id) throw new CliError("MISSING_ARG", "Usage: forge critique <task-id> [...flags]", { exitCode: 1 });

  const task = store.getTask(id);
  if (!task) throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, { exitCode: 1 });

  const repoConfig = store.getRepoConfig(task.repoRoot);
  const repo = detectRepo(task.repoRoot);
  if (!repo) {
    throw new CliError("NOT_A_REPO", `Task's repo root is not a git repo: ${task.repoRoot}`, { exitCode: 2 });
  }

  const criticA = resolveCritiqueAgent(
    "critic-a",
    values["critic-a-agent"],
    values["critic-a-model"],
    values["critic-a-reasoning"],
    repoConfig.critiqueAgentA,
    repoConfig.critiqueModelA,
    repoConfig.critiqueReasoningA,
  );
  const criticB = resolveCritiqueAgent(
    "critic-b",
    values["critic-b-agent"],
    values["critic-b-model"],
    values["critic-b-reasoning"],
    repoConfig.critiqueAgentB,
    repoConfig.critiqueModelB,
    repoConfig.critiqueReasoningB,
  );
  const synthesizer = resolveCritiqueAgent(
    "synth",
    values["synth-agent"],
    values["synth-model"],
    values["synth-reasoning"],
    repoConfig.critiqueAgentSynth,
    repoConfig.critiqueModelSynth,
    repoConfig.critiqueReasoningSynth,
  );

  const fullSpec = store.getSpec(task.id);
  if (!fullSpec) throw new CliError("NO_SPEC", `Spec file missing for ${task.id}.`, { exitCode: 2 });
  const specBody = fullSpec.replace(/^---[\s\S]*?---\n*/m, "").trim();

  const critiqueId = store.generateCritiqueId();

  const result = await launchCritique(
    {
      taskId: task.id,
      critiqueId,
      specBody,
      specTitle: task.title,
      repoRoot: repo.root,
      repoName: repo.name,
      contextContent: repo.contextContent,
      criticA,
      criticB,
      synthesizer,
    },
    store,
  );

  if (result.error) {
    throw new CliError("CRITIQUE_FAIL", `Critique launch failed: ${result.error}`, { exitCode: 3 });
  }

  emitOk(
    {
      taskId: task.id,
      critiqueId,
      tmuxSession: result.tmuxSession,
      critiqueDir: store.getCritiqueDir(task.id, critiqueId),
      logFile: result.logFile,
    },
    values.json === true,
    () =>
      `✓ critique launched ${critiqueId}\n  tmux: ${result.tmuxSession}\n  attach: tmux attach -t ${result.tmuxSession}`,
  );
}
