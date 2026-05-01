/**
 * forge launch <task-id> — kick off a background agent run.
 *
 * Required flags (or RepoConfig defaults):
 *   --agent <claude|codex>           or repoConfig.defaultAgent (or task.agent)
 *   --model <model-id>               or repoConfig.defaultModel  (or task.model)
 *   --reviewer-agent <claude|codex>  or repoConfig.reviewerAgent
 *   --reviewer-model <model-id>      or repoConfig.reviewerModel
 *
 * Implementer precedence (highest first): --agent flag → task.agent → repoConfig.defaultAgent.
 * Same for --model → task.model → repoConfig.defaultModel.
 *
 * Optional flags:
 *   --reasoning <low|medium|high|xhigh>          (codex only)
 *   --reviewer-reasoning <low|medium|high|xhigh> (codex reviewer only)
 *   --fixer-agent / --fixer-model / --fixer-reasoning   (default: reviewer values)
 *   --no-auto-fix
 *   --in-place                  Run agent in repo root on current branch
 *   --worktree <path>           Use existing worktree at this path
 *   --branch <name>             Branch name for new worktree (default: task.branch)
 *   --dry-run                   Resolve config and print without launching
 *   --json
 *
 * If neither --in-place nor --worktree is set, creates a new worktree
 * for `--branch` (defaulting to task.branch).
 *
 * NOTE: keep this docblock in sync with the HELP const below.
 */

import { parseArgs } from "node:util";
import { launchAgent } from "../../core/launch.ts";
import { createWorktree, detectRepo } from "../../core/repo.ts";
import type { ForgeStore, LaunchTarget, ReasoningEffort, RepoConfig, TaskRecord } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge launch <task-id> [...flags]

Kick off a background agent run for a saved spec.

Implementer (precedence: flag → task → repoConfig):
  --agent <claude|codex>      defaultAgent
  --model <model-id>          defaultModel

Reviewer (precedence: flag → repoConfig):
  --reviewer-agent <claude|codex>     reviewerAgent
  --reviewer-model <model-id>         reviewerModel
  --reviewer-reasoning <low|medium|high|xhigh>   (codex reviewer only)

Fixer (defaults to reviewer values):
  --fixer-agent <claude|codex>
  --fixer-model <model-id>
  --fixer-reasoning <low|medium|high|xhigh>
  --no-auto-fix                Disable the auto-fix loop after request-changes

Reasoning:
  --reasoning <low|medium|high|xhigh>   (codex implementer only)

Workspace:
  --in-place                   Run in repo root on current branch (must not be default)
  --worktree <path>            Use an existing worktree
  --branch <name>              Branch for a new worktree (default: task.branch)

Output:
  --dry-run                    Resolve config and print without launching
  --json                       Machine-readable output

Set defaults with: forge config set <key> <value>
`;

const VALID_AGENTS: LaunchTarget[] = ["claude", "codex"];
const VALID_EFFORTS: ReasoningEffort[] = ["low", "medium", "high", "xhigh"];

/** Stable JSON shape for `MISSING_FLAGS` errors — cc-plugin parses this. */
interface Problem {
  flag: string;
  message: string;
  hint?: string;
}

type Source = "flag" | "task" | "default";

interface ResolvedLaunchConfig {
  agent: LaunchTarget;
  agentSource: Source;
  model: string;
  modelSource: Source;
  reasoning?: ReasoningEffort;
  reviewerAgent: LaunchTarget;
  reviewerModel: string;
  reviewerReasoning?: ReasoningEffort;
  fixerAgent: LaunchTarget;
  fixerModel: string;
  fixerReasoning?: ReasoningEffort;
  autoFix: boolean;
  autoFixRounds: number;
}

function isAgent(v: unknown): v is LaunchTarget {
  return typeof v === "string" && (VALID_AGENTS as string[]).includes(v);
}

function isEffort(v: unknown): v is ReasoningEffort {
  return typeof v === "string" && (VALID_EFFORTS as string[]).includes(v);
}

function fmtProblems(problems: Problem[]): { message: string; hint: string } {
  const message = `${problems.length === 1 ? "Missing/invalid flag" : "Missing/invalid flags"}:\n${problems
    .map((p) => `  - ${p.flag}: ${p.message}`)
    .join("\n")}`;
  const hint = problems
    .map((p) => p.hint)
    .filter((h): h is string => Boolean(h))
    .join("; ");
  return { message, hint };
}

/**
 * Resolve launch config from flags + task + repoConfig. Pure: no side effects,
 * returns problems instead of throwing so callers can aggregate.
 */
export function resolveLaunchConfig(
  values: Record<string, unknown>,
  task: TaskRecord,
  repoConfig: RepoConfig,
): { config: ResolvedLaunchConfig | null; problems: Problem[] } {
  const problems: Problem[] = [];

  // ── Implementer agent ────────────────────────────────────────────────────
  let agent: LaunchTarget | undefined;
  let agentSource: Source = "default";
  const flagAgent = values.agent;
  if (flagAgent !== undefined) {
    if (isAgent(flagAgent)) {
      agent = flagAgent;
      agentSource = "flag";
    } else {
      problems.push({
        flag: "--agent",
        message: `must be one of: ${VALID_AGENTS.join(", ")}`,
        hint: `forge config set defaultAgent <${VALID_AGENTS.join("|")}>`,
      });
    }
  } else if (task.agent && isAgent(task.agent)) {
    agent = task.agent;
    agentSource = "task";
  } else if (repoConfig.defaultAgent && isAgent(repoConfig.defaultAgent)) {
    agent = repoConfig.defaultAgent;
    agentSource = "default";
  } else {
    problems.push({
      flag: "--agent",
      message: `required (one of: ${VALID_AGENTS.join(", ")})`,
      hint: `forge config set defaultAgent <${VALID_AGENTS.join("|")}>`,
    });
  }

  // ── Implementer model ────────────────────────────────────────────────────
  let model: string | undefined;
  let modelSource: Source = "default";
  const flagModel = values.model;
  if (typeof flagModel === "string") {
    model = flagModel;
    modelSource = "flag";
  } else if (task.model) {
    model = task.model;
    modelSource = "task";
  } else if (repoConfig.defaultModel) {
    model = repoConfig.defaultModel;
    modelSource = "default";
  } else {
    problems.push({
      flag: "--model",
      message: "required",
      hint: "forge config set defaultModel <model-id>",
    });
  }

  // ── Reviewer agent ───────────────────────────────────────────────────────
  let reviewerAgent: LaunchTarget | undefined;
  const flagReviewerAgent = values["reviewer-agent"];
  const cfgReviewerAgent = repoConfig.reviewerAgent;
  if (flagReviewerAgent !== undefined) {
    if (isAgent(flagReviewerAgent)) {
      reviewerAgent = flagReviewerAgent;
    } else {
      problems.push({
        flag: "--reviewer-agent",
        message: `must be one of: ${VALID_AGENTS.join(", ")}`,
        hint: `forge config set reviewerAgent <${VALID_AGENTS.join("|")}>`,
      });
    }
  } else if (cfgReviewerAgent && isAgent(cfgReviewerAgent)) {
    reviewerAgent = cfgReviewerAgent;
  } else {
    problems.push({
      flag: "--reviewer-agent",
      message: `required (one of: ${VALID_AGENTS.join(", ")})`,
      hint: `forge config set reviewerAgent <${VALID_AGENTS.join("|")}>`,
    });
  }

  // ── Reviewer model ───────────────────────────────────────────────────────
  let reviewerModel: string | undefined;
  const flagReviewerModel = values["reviewer-model"];
  if (typeof flagReviewerModel === "string") {
    reviewerModel = flagReviewerModel;
  } else if (repoConfig.reviewerModel) {
    reviewerModel = repoConfig.reviewerModel;
  } else {
    problems.push({
      flag: "--reviewer-model",
      message: "required",
      hint: "forge config set reviewerModel <model-id>",
    });
  }

  // ── Reasoning efforts (optional) ─────────────────────────────────────────
  const reasoning = parseEffort(values.reasoning, "--reasoning", problems);
  const reviewerReasoning = parseEffort(values["reviewer-reasoning"], "--reviewer-reasoning", problems);

  // ── Fixer (defaults to reviewer values; no problem-accumulation needed
  //    when reviewer has already failed — we still validate flag-provided
  //    fixer values independently so callers see *all* invalid input).
  let fixerAgent: LaunchTarget | undefined;
  const flagFixerAgent = values["fixer-agent"];
  if (flagFixerAgent !== undefined) {
    if (isAgent(flagFixerAgent)) {
      fixerAgent = flagFixerAgent;
    } else {
      problems.push({
        flag: "--fixer-agent",
        message: `must be one of: ${VALID_AGENTS.join(", ")}`,
        hint: `forge config set fixerAgent <${VALID_AGENTS.join("|")}>`,
      });
    }
  } else if (repoConfig.fixerAgent && isAgent(repoConfig.fixerAgent)) {
    fixerAgent = repoConfig.fixerAgent;
  } else {
    fixerAgent = reviewerAgent;
  }

  let fixerModel: string | undefined;
  const flagFixerModel = values["fixer-model"];
  if (typeof flagFixerModel === "string") fixerModel = flagFixerModel;
  else if (repoConfig.fixerModel) fixerModel = repoConfig.fixerModel;
  else fixerModel = reviewerModel;

  const fixerReasoning =
    parseEffort(values["fixer-reasoning"], "--fixer-reasoning", problems) ?? repoConfig.fixerReasoningEffort;

  const autoFix = !(values["no-auto-fix"] as boolean) && (repoConfig.autoFix ?? true);
  const autoFixRounds = repoConfig.autoFixRounds ?? 1;

  // Must-differ check — only meaningful once both halves resolved cleanly.
  if (
    agent !== undefined &&
    model !== undefined &&
    reviewerAgent !== undefined &&
    reviewerModel !== undefined &&
    agent === reviewerAgent &&
    model === reviewerModel
  ) {
    problems.push({
      flag: "implementer/reviewer",
      message: `agent+model match (${agent} / ${model}) — must differ on agent or model`,
      hint: `forge config set reviewerAgent <other> or override --reviewer-model`,
    });
  }

  if (
    problems.length > 0 ||
    agent === undefined ||
    model === undefined ||
    reviewerAgent === undefined ||
    reviewerModel === undefined ||
    fixerAgent === undefined ||
    fixerModel === undefined
  ) {
    return { config: null, problems };
  }

  return {
    config: {
      agent,
      agentSource,
      model,
      modelSource,
      reasoning,
      reviewerAgent,
      reviewerModel,
      reviewerReasoning,
      fixerAgent,
      fixerModel,
      fixerReasoning,
      autoFix,
      autoFixRounds,
    },
    problems: [],
  };
}

function parseEffort(v: unknown, flag: string, problems: Problem[]): ReasoningEffort | undefined {
  if (v === undefined) return undefined;
  if (isEffort(v)) return v;
  problems.push({
    flag,
    message: `must be one of: ${VALID_EFFORTS.join(", ")}`,
  });
  return undefined;
}

function dryRunHumanFormat(c: ResolvedLaunchConfig, taskId: string): string {
  const lines: string[] = [
    `dry-run resolved config for ${taskId}`,
    `  agent: ${c.agent} (${c.agentSource})`,
    `  model: ${c.model} (${c.modelSource})`,
  ];
  if (c.reasoning) lines.push(`  reasoning: ${c.reasoning}`);
  lines.push(`  reviewer-agent: ${c.reviewerAgent}`);
  lines.push(`  reviewer-model: ${c.reviewerModel}`);
  if (c.reviewerReasoning) lines.push(`  reviewer-reasoning: ${c.reviewerReasoning}`);
  lines.push(`  fixer-agent: ${c.fixerAgent}`);
  lines.push(`  fixer-model: ${c.fixerModel}`);
  if (c.fixerReasoning) lines.push(`  fixer-reasoning: ${c.fixerReasoning}`);
  lines.push(`  auto-fix: ${c.autoFix} (rounds: ${c.autoFixRounds})`);
  return lines.join("\n");
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      agent: { type: "string" },
      model: { type: "string" },
      "reviewer-agent": { type: "string" },
      "reviewer-model": { type: "string" },
      reasoning: { type: "string" },
      "reviewer-reasoning": { type: "string" },
      "fixer-agent": { type: "string" },
      "fixer-model": { type: "string" },
      "fixer-reasoning": { type: "string" },
      "no-auto-fix": { type: "boolean", default: false },
      "in-place": { type: "boolean", default: false },
      worktree: { type: "string" },
      branch: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const id = positionals[0];
  if (!id) throw new CliError("MISSING_ARG", "Usage: forge launch <task-id> [...flags]", { exitCode: 1 });

  const task = store.getTask(id);
  if (!task) throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, { exitCode: 1 });
  if (task.status !== "draft" && task.status !== "failed" && task.status !== "quality_failed") {
    throw new CliError("BAD_STATE", `Task ${id} is in state "${task.status}" — cannot launch.`, {
      hint: "Use `forge resume` for partial-failure recovery.",
      exitCode: 1,
    });
  }

  const repoConfig = store.getRepoConfig(task.repoRoot);
  const repo = detectRepo(task.repoRoot);
  if (!repo) {
    throw new CliError("NOT_A_REPO", `Task's repo root is not a git repo: ${task.repoRoot}`, { exitCode: 2 });
  }

  const { config: resolved, problems } = resolveLaunchConfig(values, task, repoConfig);
  if (!resolved) {
    const { message, hint } = fmtProblems(problems);
    throw new CliError("MISSING_FLAGS", message, {
      hint: hint || undefined,
      detail: problems,
      exitCode: 1,
    });
  }

  // ── --dry-run: print resolved config and exit ───────────────────────────
  if (values["dry-run"] as boolean) {
    emitOk({ taskId: task.id, repoRoot: task.repoRoot, ...resolved }, values.json === true, () =>
      dryRunHumanFormat(resolved, task.id),
    );
    return;
  }

  // ── Resolve workspace ────────────────────────────────────────────────────
  let worktreePath: string;
  let branch = (values.branch as string | undefined) ?? task.branch;

  if (values["in-place"]) {
    branch = repo.currentBranch;
    if (branch === repo.defaultBranch) {
      throw new CliError("DEFAULT_BRANCH", `Refusing to run in place on default branch "${branch}".`, {
        hint: "Switch to a feature branch first, or omit --in-place to create a worktree.",
        exitCode: 1,
      });
    }
    worktreePath = repo.root;
  } else if (typeof values.worktree === "string") {
    worktreePath = values.worktree;
  } else {
    const result = await createWorktree(repo.root, branch, repo.worktreeScript, repo.stack);
    if (result.error) {
      throw new CliError("WORKTREE_FAIL", `Worktree creation failed: ${result.error}`, { exitCode: 3 });
    }
    worktreePath = result.worktreePath;
  }

  const fullSpec = store.getSpec(task.id);
  if (!fullSpec) throw new CliError("NO_SPEC", `Spec file missing for ${task.id}.`, { exitCode: 2 });
  const specBody = fullSpec.replace(/^---[\s\S]*?---\n*/m, "").trim();

  const result = await launchAgent(
    {
      taskId: task.id,
      specContent: specBody,
      specTitle: task.title,
      target: resolved.agent,
      model: resolved.model,
      reasoningEffort: resolved.reasoning,
      worktreePath,
      qualityCommands: repo.qualityCommands,
      defaultBranch: repo.defaultBranch,
      branch,
      repoRoot: repo.root,
      repoName: repo.name,
      contextContent: repo.contextContent,
      reviewerTarget: resolved.reviewerAgent,
      reviewerModel: resolved.reviewerModel,
      reviewerReasoningEffort: resolved.reviewerReasoning,
      autoFix: resolved.autoFix,
      autoFixRounds: resolved.autoFixRounds,
      fixerTarget: resolved.fixerAgent,
      fixerModel: resolved.fixerModel,
      fixerReasoningEffort: resolved.fixerReasoning,
      ghUser: repoConfig.ghUser,
      ghHost: repoConfig.ghHost,
    },
    store,
  );

  if (result.error) {
    throw new CliError("LAUNCH_FAIL", `Launch failed: ${result.error}`, { exitCode: 3 });
  }

  store.upsertTask({
    ...task,
    status: "running",
    agent: resolved.agent,
    model: resolved.model,
    branch,
    worktree: worktreePath,
    tmuxSession: result.tmuxSession,
    logFile: result.logFile,
    launchedAt: new Date().toISOString(),
  });

  emitOk(
    {
      taskId: task.id,
      tmuxSession: result.tmuxSession,
      worktreePath,
      branch,
      runDir: store.ensureRunDir(task.id),
      logFile: result.logFile,
    },
    values.json === true,
    () => `✓ launched ${task.id}\n  tmux: ${result.tmuxSession}\n  attach: tmux attach -t ${result.tmuxSession}`,
  );
}
