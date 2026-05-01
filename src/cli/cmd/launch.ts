/**
 * forge launch <task-id> — kick off a background agent run.
 *
 * Required flags (or RepoConfig defaults):
 *   --agent <claude|codex|opencode|gemini>
 *   --model <model-id>
 *   --reviewer-agent <claude|codex|opencode|gemini>
 *   --reviewer-model <model-id>
 *
 * Optional flags:
 *   --reasoning <low|medium|high|xhigh>          (codex only)
 *   --reviewer-reasoning <low|medium|high|xhigh> (codex reviewer only)
 *   --in-place                  Run agent in repo root on current branch
 *   --worktree <path>           Use existing worktree at this path
 *   --branch <name>             Branch name for new worktree (default: task.branch)
 *   --json
 *
 * If neither --in-place nor --worktree is set, creates a new worktree
 * for `--branch` (defaulting to task.branch).
 */

import { parseArgs } from "node:util";
import { launchAgent } from "../../core/launch.ts";
import { createWorktree, detectRepo } from "../../core/repo.ts";
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

  const agent = asAgent(values.agent ?? task.agent, "--agent");
  const model = (values.model as string | undefined) ?? task.model;
  if (!model) throw new CliError("MISSING_MODEL", "--model is required.", { exitCode: 1 });

  const reviewerAgent = asAgent(values["reviewer-agent"] ?? repoConfig.reviewerAgent, "--reviewer-agent");
  const reviewerModel = (values["reviewer-model"] as string | undefined) ?? repoConfig.reviewerModel;
  if (!reviewerModel) throw new CliError("MISSING_REVIEWER_MODEL", "--reviewer-model is required.", { exitCode: 1 });

  const reasoning = asEffort(values.reasoning, "--reasoning");
  const reviewerReasoning = asEffort(values["reviewer-reasoning"], "--reviewer-reasoning");

  const fixerAgent = asAgent(values["fixer-agent"] ?? repoConfig.fixerAgent ?? reviewerAgent, "--fixer-agent");
  const fixerModel = (values["fixer-model"] as string | undefined) ?? repoConfig.fixerModel ?? reviewerModel;
  const fixerReasoning = asEffort(values["fixer-reasoning"] ?? repoConfig.fixerReasoningEffort, "--fixer-reasoning");
  const autoFix = !(values["no-auto-fix"] as boolean) && (repoConfig.autoFix ?? true);
  const autoFixRounds = repoConfig.autoFixRounds ?? 1;

  if (agent === reviewerAgent && model === reviewerModel) {
    throw new CliError("REVIEWER_SAME_AS_IMPL", "Implementer and reviewer must differ on agent or model.", {
      exitCode: 1,
    });
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
      target: agent,
      model,
      reasoningEffort: reasoning,
      worktreePath,
      qualityCommands: repo.qualityCommands,
      defaultBranch: repo.defaultBranch,
      branch,
      repoRoot: repo.root,
      repoName: repo.name,
      contextContent: repo.contextContent,
      reviewerTarget: reviewerAgent,
      reviewerModel,
      reviewerReasoningEffort: reviewerReasoning,
      autoFix,
      autoFixRounds,
      fixerTarget: fixerAgent,
      fixerModel,
      fixerReasoningEffort: fixerReasoning,
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
    agent,
    model,
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
