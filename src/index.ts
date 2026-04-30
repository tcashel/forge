/**
 * Forge — mission control for agentic coding workflows.
 *
 * End-to-end developer flow:
 *   idea  →  /forge-spec        (planner skill drafts a spec conversationally)
 *   spec  →  /forge-launch      (launches a coding agent in tmux + worktree)
 *   PR    →  /forge-review <n>  (reviewer skill produces a structured verdict)
 *
 * Commands:
 *   /forge             Mission control dashboard (TUI)
 *   /forge-spec [arg]  Enter spec-mode. Argument can be a JIRA key (Flow B)
 *                      or a free-form idea (Flow A); blank starts from scratch.
 *   /forge-edit-spec   Re-enter spec-mode on an existing saved spec. Loads the
 *                      saved body into the working draft so the conversation
 *                      can pick up where it left off.
 *   /forge-save-spec   Promote the working draft and optionally launch.
 *   /forge-cancel-spec Exit spec-mode (draft file is preserved on disk).
 *   /forge-launch      Launch an agent on an existing spec.
 *   /forge-attach      Attach to a running task's tmux session.
 *   /forge-resume      Resume a failed task from a chosen post-agent phase.
 *   /forge-review <n>  Review PR #n with the bundled forge-reviewer skill.
 *   /forge-settings    View / edit per-repo settings (gh user, gh host, …).
 *   /forge-status      Show task status summary in chat.
 *
 * Bundled skills (loaded via package.json's pi.skills entry):
 *   skills/forge-planner/     Drafts and iterates on Forge specs.
 *   skills/forge-reviewer/    Reviews Forge-launched PRs against their specs.
 *
 * Global state: ~/.forge/  (specs, runs, index, repo-config)
 * Works in any git repo — no per-repo config required.
 */

import { execFileSync, execSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { type CritiqueConfig, launchCritique } from "./critique.js";
import { ForgeDashboard } from "./dashboard.js";
import { listGhAccounts, resolveGhEnv } from "./gh.js";
import * as jira from "./jira.js";
import {
  attachToSession,
  isTmuxAvailable,
  isTmuxSessionAlive,
  killTmuxSession,
  launchAgent,
  type ResumeFrom,
  resumeAgentRun,
} from "./launch.js";
import { createWorktree, detectRepo, getWorktrees, type RepoProfile } from "./repo.js";
import { buildReviewerPrompt } from "./reviewer.js";
import { enterSpecMode, installSpecMode } from "./spec-mode.js";
import { ForgeStore, type LaunchTarget, type ReasoningEffort, type RepoConfig, type TaskRecord } from "./store.js";

// ─── Utilities ────────────────────────────────────────────────────────────────

function sh(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 8000 }).trim();
  } catch {
    return "";
  }
}

function openSpecInViewer(specFile: string, ctx: ExtensionContext): void {
  if (!fs.existsSync(specFile)) {
    ctx.ui.notify(`Spec file not found: ${specFile}`, "error");
    return;
  }

  const envViewer = process.env.FORGE_SPEC_VIEWER;
  let cmd: string;
  let args: string[];

  if (envViewer) {
    cmd = envViewer;
    args = [specFile];
  } else if (process.platform === "darwin") {
    cmd = "open";
    args = [specFile];
  } else if (process.platform === "linux") {
    cmd = "xdg-open";
    args = [specFile];
  } else if (process.platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", specFile];
  } else {
    ctx.ui.notify(
      "No spec viewer available \u2014 set $FORGE_SPEC_VIEWER (e.g. 'zed') or run on macOS/Linux/Windows.",
      "error",
    );
    return;
  }

  try {
    const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
    child.on("error", (err) => ctx.ui.notify(`Could not launch viewer "${cmd}": ${err.message}`, "error"));
    child.unref();
  } catch (err: unknown) {
    ctx.ui.notify(`Could not launch viewer "${cmd}": ${err instanceof Error ? err.message : String(err)}`, "error");
  }
}

// ─── Spec entry ────────────────────────────────────────────────────────────────────

/**
 * Single entry point for both spec-mode flows:
 * - Flow A: free-form idea → planner researches and drafts
 * - Flow B: existing JIRA key → planner reads ticket and drafts
 *
 * `arg` is detected automatically. Empty argument prompts the user.
 */
async function enterSpecModeFlow(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  store: ForgeStore,
  repo: RepoProfile,
  arg?: string,
): Promise<void> {
  let raw = arg?.trim() ?? "";
  if (!raw && ctx.ui.input) {
    const jiraOn = jira.isJiraAvailable();

    let result: string | undefined;
    if (typeof ctx.ui.editor === "function") {
      const title = jiraOn
        ? "JIRA ticket key, rough idea, or leave blank to start from scratch \u2014 e.g. PROJ-123, or 'add Redis caching to user sessions'"
        : "Rough idea, or leave blank to start from scratch \u2014 e.g. 'add Redis caching to user sessions'";
      result = await ctx.ui.editor(title);
    } else {
      const prompt = jiraOn
        ? "JIRA ticket key, rough idea, or leave blank to start from scratch:"
        : "Rough idea, or leave blank to start from scratch:";
      const placeholder = jiraOn
        ? "PROJ-123  /  add Redis caching to user sessions"
        : "add Redis caching to user sessions";
      result = (await ctx.ui.input(prompt, { placeholder })) ?? undefined;
    }

    if (result === undefined) {
      ctx.ui.notify("Spec creation cancelled.", "info");
      return;
    }
    raw = result.trim();
  }

  if (jira.isJiraKey(raw)) {
    await enterSpecMode(pi, ctx, store, { repo, jiraKey: raw });
  } else if (raw) {
    await enterSpecMode(pi, ctx, store, { repo, idea: raw });
  } else {
    await enterSpecMode(pi, ctx, store, { repo });
  }
}

// ─── Shared wizard helpers ─────────────────────────────────────────────────────

const REASONING_EFFORTS: ReasoningEffort[] = ["low", "medium", "high", "xhigh"];

/** Put " (default)" suffix on the matching option so the user sees the pre-selected value. */
function highlightDefault(options: string[], defaultVal: string): string[] {
  return options.map((o) => (o === defaultVal ? `${o} (default)` : o));
}

function stripDefault(choice: string): string {
  return choice.replace(/ \(default\)$/, "");
}

// ─── Launch wizard ────────────────────────────────────────────────────────────

/**
 * Exposed so spec-mode can call back into the launch flow after a save.
 * (spec-mode imports this dynamically to avoid a circular import at
 * module-load time.)
 */
export async function runLaunchWizardOrFail(
  store: ForgeStore,
  ctx: any,
  task: TaskRecord,
  repo: RepoProfile,
): Promise<boolean> {
  return runLaunchWizard(store, ctx, task, repo);
}

async function runLaunchWizard(
  store: ForgeStore,
  ctx: {
    ui: {
      select: (prompt: string, options: string[]) => Promise<string | null>;
      input?: (prompt: string, opts?: object) => Promise<string | null>;
      notify: (msg: string, type: string) => void;
      confirm: (title: string, msg: string) => Promise<boolean>;
    };
  },
  task: TaskRecord,
  repoProfile: ReturnType<typeof detectRepo>,
): Promise<boolean> {
  if (!repoProfile) {
    ctx.ui.notify("Cannot detect repo.", "error");
    return false;
  }
  if (!isTmuxAvailable()) {
    ctx.ui.notify("tmux not found — install with: brew install tmux", "error");
    return false;
  }

  // Read spec body (strip frontmatter)
  const fullSpec = store.getSpec(task.id);
  if (!fullSpec) {
    ctx.ui.notify("Spec file not found.", "error");
    return false;
  }
  const specBody = fullSpec.replace(/^---[\s\S]*?---\n*/m, "").trim();

  // 1. Choose agent
  const agentChoice = await ctx.ui.select("Agent runtime:", ["pi", "claude", "codex"]);
  if (!agentChoice) return false;
  const agent = agentChoice as LaunchTarget;

  // 2. Choose model (sensible defaults per agent)
  const modelDefaults: Record<LaunchTarget, string[]> = {
    pi: ["claude-opus-4-7", "claude-opus-4-6", "claude-sonnet-4-6", "gemini-3.1-pro", "claude-haiku-4-5"],
    claude: ["claude-opus-4-7", "claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5"],
    codex: ["o3", "o4-mini", "codex-mini-latest"],
  };
  const modelChoice = await ctx.ui.select("Model:", modelDefaults[agent]);
  if (!modelChoice) return false;

  // 3. Workspace — in place, create new worktree, or attach to existing
  //
  // "in place" runs the agent directly in the current repo root on the
  // current branch. Useful when you've already cut a branch locally, want
  // to iterate without the worktree dance, or are working on a small repo
  // where worktree bootstrap is overkill.
  let branch = task.branch;
  const existingWorktrees = getWorktrees(repoProfile.root);
  const IN_PLACE_LABEL = `in place: ${repoProfile.currentBranch} (current repo, no worktree)`;
  const worktreeOptions = [
    IN_PLACE_LABEL,
    `create new: ${branch}`,
    ...existingWorktrees.map((wt) => `use existing: ${wt.branch} (${wt.path})`),
  ];
  const worktreeChoice = await ctx.ui.select("Workspace:", worktreeOptions);
  if (!worktreeChoice) return false;

  let worktreePath: string;
  if (worktreeChoice === IN_PLACE_LABEL) {
    // Run in place. Use the current branch as-is — the user is responsible
    // for being on the branch they want the agent to commit/push to.
    branch = repoProfile.currentBranch;

    // Hard guard: never let the agent commit/push to the default branch.
    if (branch === repoProfile.defaultBranch) {
      ctx.ui.notify(
        `Refusing to run in place on default branch "${branch}". Switch to a feature branch first.`,
        "error",
      );
      return false;
    }

    // Soft warn on dirty working tree. Forge no longer auto-stages, so
    // these files won't be swept into the PR — but they will sit on disk
    // alongside whatever the agent writes, which can be confusing if the
    // agent edits the same files.
    const dirty = sh("git status --porcelain", repoProfile.root).trim();
    const ok = await ctx.ui.confirm(
      "Run agent in place?",
      [
        `The agent will run directly in:\n  ${repoProfile.root}\n  branch: ${branch}`,
        dirty
          ? `\n\n⚠ Working tree has uncommitted changes. Forge will NOT auto-stage them — the agent owns its commits. Existing edits will sit alongside whatever the agent writes; consider stashing or committing first if you don't want them mixed in.`
          : "",
        `\n\nContinue?`,
      ].join(""),
    );
    if (!ok) return false;

    worktreePath = repoProfile.root;
  } else if (worktreeChoice.startsWith("create new:")) {
    // Branch name prompt only matters for "create new" — skip it otherwise.
    if (ctx.ui.input) {
      const branchInput = await ctx.ui.input("Branch name:", { value: branch });
      if (!branchInput) return false;
      branch = branchInput.trim();
    }

    // Live progress via the footer status badge — worktree creation +
    // dependency bootstrap can take 30–90s and was previously a silent hang.
    const setStatus = (ctx as any).ui.setStatus as ((k: string, msg?: string) => void) | undefined;
    setStatus?.("forge", `Creating worktree ${branch}…`);
    ctx.ui.notify(`Creating worktree for ${branch}… (this can take a minute on first run)`, "info");
    const { worktreePath: wtp, error } = await createWorktree(
      repoProfile.root,
      branch,
      repoProfile.worktreeScript,
      repoProfile.stack,
      {
        onProgress: (msg) => setStatus?.("forge", msg.slice(0, 80)),
      },
    );
    setStatus?.("forge", undefined);
    if (error) {
      ctx.ui.notify(`Worktree creation failed: ${error}`, "error");
      return false;
    }
    worktreePath = wtp;
  } else {
    // "use existing: <branch> (<path>)" — index into the existing list.
    // Account for the two synthetic options at the top of worktreeOptions.
    const idx = worktreeOptions.indexOf(worktreeChoice) - 2;
    worktreePath = existingWorktrees[idx].path;
    branch = existingWorktrees[idx].branch;
  }

  // 4. Choose reviewer agent, model, reasoning effort
  const remembered = store.getRepoConfig(repoProfile.root);
  const reviewerModelDefaults: Record<LaunchTarget, string[]> = {
    pi: ["claude-opus-4-7", "claude-opus-4-6", "claude-sonnet-4-6", "gemini-3.1-pro", "claude-haiku-4-5"],
    claude: ["claude-opus-4-7", "claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5"],
    codex: ["o3", "o4-mini", "codex-mini-latest"],
  };
  const defaultReviewerAgent: LaunchTarget =
    (remembered.reviewerAgent as LaunchTarget) ?? (agent === "pi" ? "claude" : "pi");
  const reviewerAgentChoice = await ctx.ui.select(
    "Reviewer runtime:",
    highlightDefault(["pi", "claude", "codex"], defaultReviewerAgent),
  );
  if (!reviewerAgentChoice) return false;
  const reviewerAgent = stripDefault(reviewerAgentChoice) as LaunchTarget;

  const defaultReviewerModel = remembered.reviewerModel ?? reviewerModelDefaults[reviewerAgent][0];
  const reviewerModelChoice = await ctx.ui.select(
    "Reviewer model:",
    highlightDefault(reviewerModelDefaults[reviewerAgent], defaultReviewerModel),
  );
  if (!reviewerModelChoice) return false;
  const reviewerModel = stripDefault(reviewerModelChoice);

  let reviewerReasoningEffort: ReasoningEffort | undefined;
  if (reviewerAgent === "codex") {
    const rChoice = await ctx.ui.select(
      "Reviewer reasoning effort:",
      highlightDefault(REASONING_EFFORTS, (remembered.reviewerReasoningEffort as string) ?? "xhigh"),
    );
    if (!rChoice) return false;
    reviewerReasoningEffort = stripDefault(rChoice) as ReasoningEffort;
  }

  // Reject identical implementer/reviewer (agent, model) pairs
  if (agent === reviewerAgent && modelChoice === reviewerModel) {
    ctx.ui.notify(
      "Implementer and reviewer must use different models or runtimes \u2014 pick something else for the reviewer.",
      "error",
    );
    return false;
  }

  // Persist reviewer choices
  store.setRepoConfig(repoProfile.root, {
    reviewerAgent,
    reviewerModel,
    reviewerReasoningEffort,
  });

  // Pre-flight: if a per-repo gh override is configured, validate it now
  // so we fail fast instead of running for 20 minutes only to hit
  // "Could not resolve to a Repository" at PR creation time.
  if (remembered.ghUser || remembered.ghHost) {
    const probe = resolveGhEnv({ user: remembered.ghUser, host: remembered.ghHost });
    if (probe.error) {
      ctx.ui.notify(
        `gh override is misconfigured — not launching:\n${probe.error}\n\nRun /forge-settings to fix.`,
        "error",
      );
      return false;
    }
    // Sanity-check the configured account can actually see the repo.
    try {
      execFileSync("gh", ["repo", "view", "--json", "name"], {
        cwd: repoProfile.root,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, ...probe.env },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const firstLine = msg.split("\n").find((l) => l.trim()) ?? msg;
      ctx.ui.notify(
        `gh override (${remembered.ghUser ?? "default user"} @ ${remembered.ghHost ?? "github.com"}) cannot access this repo:\n${firstLine}\n\nRun /forge-settings to change the account.`,
        "error",
      );
      return false;
    }
  }

  ctx.ui.notify(
    `Launching ${agent} (${modelChoice}) in tmux…\n  branch:   ${branch}\n  worktree: ${worktreePath}\n  reviewer: ${reviewerAgent} / ${reviewerModel}`,
    "info",
  );
  const result = await launchAgent(
    {
      taskId: task.id,
      specContent: specBody,
      specTitle: task.title,
      target: agent,
      model: modelChoice,
      worktreePath,
      qualityCommands: repoProfile.qualityCommands,
      defaultBranch: repoProfile.defaultBranch,
      branch,
      repoRoot: repoProfile.root,
      repoName: repoProfile.name,
      contextContent: repoProfile.contextContent,
      reviewerTarget: reviewerAgent,
      reviewerModel,
      reviewerReasoningEffort,
      ghUser: remembered.ghUser,
      ghHost: remembered.ghHost,
    },
    store,
  );

  if (result.error) {
    ctx.ui.notify(`Launch failed: ${result.error}`, "error");
    return false;
  }

  // Update task record
  store.upsertTask({
    ...task,
    status: "running",
    agent,
    model: modelChoice,
    branch,
    worktree: worktreePath,
    tmuxSession: result.tmuxSession,
    logFile: result.logFile,
    launchedAt: new Date().toISOString(),
  });

  ctx.ui.notify(
    `✓ Launched in tmux session "${result.tmuxSession}"\n  Attach: tmux attach -t ${result.tmuxSession}`,
    "success",
  );
  return true;
}

// ─── Critique wizard ───────────────────────────────────────────────────────────

const critiqueModelDefaults: Record<LaunchTarget, string[]> = {
  pi: ["claude-opus-4-7", "claude-opus-4-6", "claude-sonnet-4-6", "gemini-3.1-pro", "claude-haiku-4-5"],
  claude: ["claude-opus-4-7", "claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5"],
  codex: ["gpt-5.5", "o3", "o4-mini", "codex-mini-latest"],
};

async function runCritiqueWizard(
  store: ForgeStore,
  ctx: {
    ui: {
      select: (prompt: string, options: string[]) => Promise<string | null>;
      input?: (prompt: string, opts?: object) => Promise<string | null>;
      notify: (msg: string, type: string) => void;
    };
  },
  task: TaskRecord,
  repo: RepoProfile,
): Promise<boolean> {
  if (!isTmuxAvailable()) {
    ctx.ui.notify("tmux not found — install with: brew install tmux", "error");
    return false;
  }

  const fullSpec = store.getSpec(task.id);
  if (!fullSpec) {
    ctx.ui.notify("Spec file not found.", "error");
    return false;
  }
  const specBody = fullSpec.replace(/^---[\s\S]*?---\n*/m, "").trim();
  const remembered = store.getRepoConfig(repo.root);

  // ── Critic A ─────────────────────────────────────────────────────────────
  const agentAChoice = await ctx.ui.select(
    "Critic A runtime:",
    highlightDefault(["pi", "claude", "codex"], (remembered.critiqueAgentA as string) ?? "pi"),
  );
  if (!agentAChoice) return false;
  const agentA = stripDefault(agentAChoice) as LaunchTarget;

  const modelAChoice = await ctx.ui.select(
    "Critic A model:",
    highlightDefault(critiqueModelDefaults[agentA], remembered.critiqueModelA ?? critiqueModelDefaults[agentA][0]),
  );
  if (!modelAChoice) return false;
  const modelA = stripDefault(modelAChoice);

  let reasoningA: ReasoningEffort | undefined;
  if (agentA === "codex") {
    const rChoice = await ctx.ui.select(
      "Critic A reasoning effort:",
      highlightDefault(REASONING_EFFORTS, (remembered.critiqueReasoningA as string) ?? "xhigh"),
    );
    if (!rChoice) return false;
    reasoningA = stripDefault(rChoice) as ReasoningEffort;
  }

  // ── Critic B ─────────────────────────────────────────────────────────────
  const agentBChoice = await ctx.ui.select(
    "Critic B runtime:",
    highlightDefault(["pi", "claude", "codex"], (remembered.critiqueAgentB as string) ?? "codex"),
  );
  if (!agentBChoice) return false;
  const agentB = stripDefault(agentBChoice) as LaunchTarget;

  const modelBChoice = await ctx.ui.select(
    "Critic B model:",
    highlightDefault(critiqueModelDefaults[agentB], remembered.critiqueModelB ?? critiqueModelDefaults[agentB][0]),
  );
  if (!modelBChoice) return false;
  const modelB = stripDefault(modelBChoice);

  let reasoningB: ReasoningEffort | undefined;
  if (agentB === "codex") {
    const rChoice = await ctx.ui.select(
      "Critic B reasoning effort:",
      highlightDefault(REASONING_EFFORTS, (remembered.critiqueReasoningB as string) ?? "xhigh"),
    );
    if (!rChoice) return false;
    reasoningB = stripDefault(rChoice) as ReasoningEffort;
  }

  // Reject identical (agent, model) pairs
  if (agentA === agentB && modelA === modelB) {
    ctx.ui.notify("Critic A and Critic B must use different models or runtimes — pick something else for B.", "error");
    return false;
  }

  // ── Synthesizer ──────────────────────────────────────────────────────────
  const agentSynthChoice = await ctx.ui.select(
    "Synthesizer runtime:",
    highlightDefault(["pi", "claude", "codex"], (remembered.critiqueAgentSynth as string) ?? "pi"),
  );
  if (!agentSynthChoice) return false;
  const agentSynth = stripDefault(agentSynthChoice) as LaunchTarget;

  const modelSynthChoice = await ctx.ui.select(
    "Synthesizer model:",
    highlightDefault(
      critiqueModelDefaults[agentSynth],
      remembered.critiqueModelSynth ?? critiqueModelDefaults[agentSynth][0],
    ),
  );
  if (!modelSynthChoice) return false;
  const modelSynth = stripDefault(modelSynthChoice);

  let reasoningSynth: ReasoningEffort | undefined;
  if (agentSynth === "codex") {
    const rChoice = await ctx.ui.select(
      "Synthesizer reasoning effort:",
      highlightDefault(REASONING_EFFORTS, (remembered.critiqueReasoningSynth as string) ?? "xhigh"),
    );
    if (!rChoice) return false;
    reasoningSynth = stripDefault(rChoice) as ReasoningEffort;
  }

  // Remember choices
  store.setRepoConfig(repo.root, {
    critiqueAgentA: agentA,
    critiqueModelA: modelA,
    critiqueReasoningA: reasoningA,
    critiqueAgentB: agentB,
    critiqueModelB: modelB,
    critiqueReasoningB: reasoningB,
    critiqueAgentSynth: agentSynth,
    critiqueModelSynth: modelSynth,
    critiqueReasoningSynth: reasoningSynth,
  });

  const critiqueId = store.generateCritiqueId();
  const config: CritiqueConfig = {
    taskId: task.id,
    critiqueId,
    specBody,
    specTitle: task.title,
    repoRoot: repo.root,
    repoName: repo.name,
    contextContent: repo.contextContent,
    criticA: { agent: agentA, model: modelA, reasoningEffort: reasoningA },
    criticB: { agent: agentB, model: modelB, reasoningEffort: reasoningB },
    synthesizer: { agent: agentSynth, model: modelSynth, reasoningEffort: reasoningSynth },
  };

  ctx.ui.notify(
    `Launching critique in tmux…\n  Critic A: ${agentA}/${modelA}\n  Critic B: ${agentB}/${modelB}\n  Synth: ${agentSynth}/${modelSynth}`,
    "info",
  );

  const result = await launchCritique(config, store);
  if (result.error) {
    ctx.ui.notify(`Critique launch failed: ${result.error}`, "error");
    return false;
  }

  ctx.ui.notify(
    `✓ Critique launched in tmux session "${result.tmuxSession}"\n  Attach: tmux attach -t ${result.tmuxSession}`,
    "success",
  );
  return true;
}

// ─── Resume wizard ───────────────────────────────────────────────────────────────────────────
//
// Resume a failed pi-runtime task from a chosen post-agent phase.
// Reads the existing meta.json to render a status summary so the user
// can see exactly what's already done, then offers the resume points
// that make sense given that state (e.g. "reviewer only" only appears
// when a PR already exists).

async function runResumeWizard(
  store: ForgeStore,
  ctx: {
    ui: {
      select: (p: string, o: string[]) => Promise<string | null>;
      input?: (p: string, o?: object) => Promise<string | null>;
      notify: (m: string, t: string) => void;
      confirm: (title: string, msg: string) => Promise<boolean>;
    };
  },
  task: TaskRecord,
): Promise<boolean> {
  if (task.agent !== "pi") {
    ctx.ui.notify(
      `Resume currently supports pi-runtime tasks only. This task ran on ${task.agent}.\nFollow-up: synthesize supervisor-args.json from meta.json so claude/codex resume can reuse the same path.`,
      "error",
    );
    return false;
  }
  const runDir = store.ensureRunDir(task.id);
  const argsPath = path.join(runDir, "supervisor-args.json");
  if (!fs.existsSync(argsPath)) {
    ctx.ui.notify(
      "No supervisor-args.json on disk — the run dir was deleted, or this task pre-dates resume support.",
      "error",
    );
    return false;
  }

  // Build state summary from meta.json (with snapshot.json fallback for
  // older runs that pre-date the meta.errorMessage fix).
  const meta = (store.readRunMeta(task.id) ?? {}) as Record<string, unknown>;
  const snap = store.readSnapshot(task.id);
  const qualityResults = (meta.qualityResults as { command: string; ok: boolean }[] | undefined) ?? [];
  const qualityAllOk = qualityResults.length > 0 && qualityResults.every((r) => r.ok);
  const qualityAnyFail = qualityResults.some((r) => !r.ok);
  const finalSha = (meta.finalSha as string | undefined) ?? null;
  const prUrl = (meta.prUrl as string | undefined) ?? null;
  const prNumber = (meta.prNumber as number | undefined) ?? null;
  const reviewVerdict = (meta.reviewVerdict as string | null | undefined) ?? null;
  const errorMessage = (meta.errorMessage as string | undefined) ?? snap?.errorMessage ?? null;

  const fmt = (label: string, ok: boolean | null, detail: string) => {
    const icon = ok === true ? "✓" : ok === false ? "✗" : "·";
    return `  ${icon} ${label.padEnd(12)} ${detail}`;
  };
  const summary = [
    `Resume "${task.title}"`,
    `  branch: ${task.branch}`,
    `  worktree: ${meta.worktree ?? task.worktree ?? "(unknown)"}`,
    "",
    "Pipeline state:",
    fmt("agent", true, `— ran in the original launch (we never re-run the agent on resume)`),
    fmt(
      "quality",
      qualityResults.length === 0 ? null : qualityAllOk ? true : false,
      qualityResults.length === 0
        ? "— no results recorded"
        : `${qualityResults.length} check(s)${
            qualityAnyFail
              ? `, ${qualityResults
                  .filter((r) => !r.ok)
                  .map((r) => r.command)
                  .join(", ")} failed`
              : ", all passed"
          }`,
    ),
    fmt("commits", finalSha != null, finalSha != null ? `head: ${finalSha.slice(0, 7)}` : "(no finalSha recorded)"),
    fmt("pr", prUrl != null, prUrl != null ? `${prUrl}${prNumber != null ? ` (#${prNumber})` : ""}` : "(not created)"),
    fmt(
      "review",
      reviewVerdict != null && reviewVerdict !== "null" ? true : null,
      reviewVerdict != null && reviewVerdict !== "null" ? `verdict: ${reviewVerdict}` : "(no verdict)",
    ),
    "",
    errorMessage ? `Last error: ${errorMessage.slice(0, 200)}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  ctx.ui.notify(summary, "info");

  // Offer resume points based on what's already done.
  type Option = { label: string; resumeFrom: ResumeFrom };
  const options: Option[] = [];
  options.push({
    label: "Re-run quality checks → commit & push → PR → review",
    resumeFrom: "quality_check",
  });
  options.push({
    label: "Skip quality → commit & push → PR → review",
    resumeFrom: "committing",
  });
  options.push({
    label: "Skip to PR creation (commits already pushed) → review",
    resumeFrom: "creating_pr",
  });
  if (prUrl != null && prNumber != null) {
    options.push({
      label: "Run reviewer only (PR exists, no commits/push needed)",
      resumeFrom: "reviewing",
    });
  }

  const choice = await ctx.ui.select(
    "Resume from:",
    options.map((o) => o.label),
  );
  if (!choice) return false;
  const picked = options.find((o) => o.label === choice);
  if (!picked) return false;

  const repoConfig = store.getRepoConfig(task.repoRoot);
  const result = await resumeAgentRun(
    {
      taskId: task.id,
      resumeFrom: picked.resumeFrom,
      ghUser: repoConfig.ghUser,
      ghHost: repoConfig.ghHost,
    },
    store,
  );
  if (result.error) {
    ctx.ui.notify(`Resume failed: ${result.error}`, "error");
    return false;
  }

  // Move the task back into a running state so the dashboard reflects it.
  store.upsertTask({
    ...task,
    status: "running",
    tmuxSession: result.tmuxSession,
    completedAt: null,
  });

  ctx.ui.notify(
    `✓ Resumed in tmux session "${result.tmuxSession}" (from ${picked.resumeFrom}).\n  Attach: tmux attach -t ${result.tmuxSession}`,
    "success",
  );
  return true;
}

// ─── Settings wizard ────────────────────────────────────────────────────────
//
// Per-repo settings live in ~/.forge/repo-config.json keyed by absolute repo
// root. The wizard exposes the fields that are useful to set explicitly
// (mostly gh account/host — the originator of this feature). Reviewer and
// critic preferences are remembered automatically by their respective
// wizards, so they're shown read-only here for visibility.

const CLEAR_SENTINEL = "— clear (use gh default) —";
const CUSTOM_SENTINEL = "— enter custom… —";

async function editGhUser(
  ctx: {
    ui: {
      select: (p: string, o: string[]) => Promise<string | null>;
      input?: (p: string, o?: object) => Promise<string | null>;
      notify: (m: string, t: string) => void;
    };
  },
  current: string | undefined,
  host: string,
): Promise<{ updated: boolean; value: string | undefined }> {
  const accounts = listGhAccounts(host);
  const options = [...accounts.map((a) => `${a.user}${a.active ? " (active)" : ""}`), CUSTOM_SENTINEL, CLEAR_SENTINEL];
  const prompt = current
    ? `gh user (currently "${current}"). Pick one:`
    : "gh user (currently using gh's active account). Pick one:";
  const choice = await ctx.ui.select(prompt, options);
  if (!choice) return { updated: false, value: current };
  if (choice === CLEAR_SENTINEL) return { updated: true, value: undefined };
  if (choice === CUSTOM_SENTINEL) {
    if (!ctx.ui.input) return { updated: false, value: current };
    const typed = await ctx.ui.input("gh user:", { value: current ?? "" });
    if (typed === null) return { updated: false, value: current };
    const trimmed = typed.trim();
    return { updated: true, value: trimmed || undefined };
  }
  // Strip trailing " (active)" suffix if present.
  const user = choice.replace(/ \(active\)$/, "");
  return { updated: true, value: user };
}

async function editGhHost(
  ctx: {
    ui: {
      select: (p: string, o: string[]) => Promise<string | null>;
      input?: (p: string, o?: object) => Promise<string | null>;
      notify: (m: string, t: string) => void;
    };
  },
  current: string | undefined,
): Promise<{ updated: boolean; value: string | undefined }> {
  if (!ctx.ui.input) return { updated: false, value: current };
  const typed = await ctx.ui.input("gh host (e.g. github.com or github.example.com). Empty to clear:", {
    value: current ?? "",
  });
  if (typed === null) return { updated: false, value: current };
  const trimmed = typed.trim();
  return { updated: true, value: trimmed || undefined };
}

async function runSettingsWizard(
  store: ForgeStore,
  ctx: {
    ui: {
      select: (p: string, o: string[]) => Promise<string | null>;
      input?: (p: string, o?: object) => Promise<string | null>;
      notify: (m: string, t: string) => void;
    };
  },
  repo: RepoProfile,
): Promise<void> {
  while (true) {
    const cfg = store.getRepoConfig(repo.root);
    const ghHost = cfg.ghHost ?? "github.com";

    // Live status of the gh override so the user can see if it's broken.
    let ghStatus = "";
    if (cfg.ghUser || cfg.ghHost) {
      const probe = resolveGhEnv({ user: cfg.ghUser, host: cfg.ghHost });
      ghStatus = probe.error ? "  ✖ broken" : "  ✓ ok";
    }

    const fmt = (label: string, value: string | undefined, hint?: string) =>
      `${label}: ${value ?? "(default)"}${hint ? `  — ${hint}` : ""}`;

    const items = [
      fmt("gh user", cfg.ghUser, "GitHub CLI account used for PRs") + ghStatus,
      fmt("gh host", cfg.ghHost, "defaults to github.com"),
      fmt(
        "reviewer",
        cfg.reviewerAgent ? `${cfg.reviewerAgent} / ${cfg.reviewerModel ?? "?"}` : undefined,
        "set automatically by /forge-launch",
      ),
      fmt(
        "critic A",
        cfg.critiqueAgentA ? `${cfg.critiqueAgentA} / ${cfg.critiqueModelA ?? "?"}` : undefined,
        "set automatically by /forge-critique",
      ),
      fmt(
        "critic B",
        cfg.critiqueAgentB ? `${cfg.critiqueAgentB} / ${cfg.critiqueModelB ?? "?"}` : undefined,
        "set automatically by /forge-critique",
      ),
      fmt("jira project", cfg.jiraProject, "set automatically by /forge-spec"),
      "── done ──",
    ];

    const choice = await ctx.ui.select(`Settings for ${repo.name} (${repo.root})`, items);
    if (!choice || choice === items[items.length - 1]) return;

    if (choice.startsWith("gh user:")) {
      const result = await editGhUser(ctx, cfg.ghUser, ghHost);
      if (!result.updated) continue;
      const patch: Partial<RepoConfig> = { ghUser: result.value };
      store.setRepoConfig(repo.root, patch);
      // Validate the new value if non-empty.
      if (result.value) {
        const probe = resolveGhEnv({ user: result.value, host: cfg.ghHost });
        if (probe.error) {
          ctx.ui.notify(`⚠ ${probe.error}`, "warning");
        } else {
          ctx.ui.notify(`✓ gh user set to "${result.value}"`, "success");
        }
      } else {
        ctx.ui.notify("gh user cleared (will use gh's active account).", "info");
      }
      continue;
    }
    if (choice.startsWith("gh host:")) {
      const result = await editGhHost(ctx, cfg.ghHost);
      if (!result.updated) continue;
      store.setRepoConfig(repo.root, { ghHost: result.value });
      ctx.ui.notify(result.value ? `✓ gh host set to "${result.value}"` : "gh host cleared.", "success");
      continue;
    }
    // Read-only fields just close the inner loop
    ctx.ui.notify("Read-only here — set automatically by the relevant wizard.", "info");
  }
}

/** Open a file in the user's preferred viewer (or system default). */
function openInViewer(file: string): void {
  const opener = process.env.FORGE_VIEWER ?? (process.platform === "darwin" ? "open" : "xdg-open");
  const child = spawn(opener, [file], { detached: true, stdio: "ignore" });
  child.unref();
}

// ─── Extension entry ──────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  const store = new ForgeStore();

  // Install spec-mode hooks (planner skill, tool restrictions, save
  // shortcut, /forge-save-spec command, status badge). Does nothing
  // until the user actually enters spec-mode via /forge-spec or `n`
  // from the dashboard.
  installSpecMode(pi, store);

  // ── /forge — dashboard ────────────────────────────────────────────────────

  pi.registerCommand("forge", {
    description: "Open the Forge mission control dashboard",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify("forge requires interactive TUI mode.", "error");
        return;
      }

      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }

      await ctx.ui.custom<void>((tui, theme, _kb, done) => {
        const dash = new ForgeDashboard(theme as unknown as any, tui as unknown as any, store, repo);

        dash.onClose = () => done(undefined);

        dash.onAction = async (action) => {
          switch (action.type) {
            case "new_spec": {
              done(undefined); // close dashboard first so the planner conversation owns the screen
              await enterSpecModeFlow(pi, ctx as ExtensionContext, store, repo);
              break;
            }
            case "edit_spec": {
              done(undefined);
              await enterSpecMode(pi, ctx as ExtensionContext, store, {
                repo,
                editingTask: action.task,
              });
              break;
            }
            case "launch": {
              done(undefined);
              await runLaunchWizard(store, ctx as any, action.task, repo);
              break;
            }
            case "attach": {
              const session = action.task.tmuxSession!;
              done(undefined);
              // Small delay then attach — gives pi TUI time to restore terminal
              await new Promise((r) => setTimeout(r, 300));
              attachToSession(session);
              break;
            }
            case "view_spec": {
              const specPath = dash.resolveSpecPath(action.task);
              openSpecInViewer(specPath, ctx as ExtensionContext);
              dash.invalidate();
              tui.requestRender();
              break;
            }
            case "kill": {
              const ok = await ctx.ui.confirm(
                "Kill agent?",
                `Kill tmux session "${action.task.tmuxSession}" for task:\n${action.task.title}`,
              );
              if (ok && action.task.tmuxSession) {
                killTmuxSession(action.task.tmuxSession);
                store.upsertTask({ ...action.task, status: "failed", completedAt: new Date().toISOString() });
                ctx.ui.notify("Killed.", "info");
                dash.invalidate();
                tui.requestRender();
              }
              break;
            }
            case "run_critique": {
              // Smart dispatch based on existing critique state
              const latestId = store.getLatestCritique(action.task.id);
              if (latestId) {
                const meta = store.readCritiqueMeta(action.task.id, latestId);
                if (meta?.status === "running_critics" || meta?.status === "running_synth") {
                  ctx.ui.notify(`Critique still running — check tmux session forge-crit-${latestId}`, "info");
                  break;
                }
                if (meta?.status === "done") {
                  const choice = await ctx.ui.select("Critique available:", [
                    "View latest recommendations",
                    "Discuss latest in spec-mode",
                    "Run a new critique",
                  ]);
                  if (choice === "View latest recommendations") {
                    const recFile = store.getRecommendationsFile(action.task.id, latestId);
                    if (fs.existsSync(recFile)) {
                      openInViewer(recFile);
                      store.markCritiqueViewed(action.task.id, latestId);
                    } else {
                      openInViewer(path.join(store.getCritiqueDir(action.task.id, latestId), "critique-meta.json"));
                    }
                    dash.invalidate();
                    tui.requestRender();
                    break;
                  }
                  if (choice === "Discuss latest in spec-mode") {
                    done(undefined);
                    await enterSpecMode(pi, ctx as ExtensionContext, store, {
                      repo,
                      editingTask: action.task,
                      seedCritiqueRecommendations: store.getRecommendationsFile(action.task.id, latestId),
                    });
                    break;
                  }
                  if (choice !== "Run a new critique") break;
                  // fall through to launch new critique
                }
                if (meta?.status === "failed") {
                  const choice = await ctx.ui.select("Last critique failed:", [
                    "View partial output (logs)",
                    "Run a new critique",
                  ]);
                  if (choice === "View partial output (logs)") {
                    const recFile = store.getRecommendationsFile(action.task.id, latestId);
                    const target = fs.existsSync(recFile)
                      ? recFile
                      : path.join(store.getCritiqueDir(action.task.id, latestId), "critique-meta.json");
                    openInViewer(target);
                    dash.invalidate();
                    tui.requestRender();
                    break;
                  }
                  if (choice !== "Run a new critique") break;
                  // fall through to launch new critique
                }
              }
              await runCritiqueWizard(store, ctx as any, action.task, repo);
              dash.invalidate();
              tui.requestRender();
              break;
            }
            case "view_critique": {
              const recFile = store.getRecommendationsFile(action.task.id, action.critiqueId);
              if (fs.existsSync(recFile)) {
                openInViewer(recFile);
              } else {
                openInViewer(path.join(store.getCritiqueDir(action.task.id, action.critiqueId), "critique-meta.json"));
              }
              store.markCritiqueViewed(action.task.id, action.critiqueId);
              dash.invalidate();
              tui.requestRender();
              break;
            }
            case "discuss_critique": {
              done(undefined);
              await enterSpecMode(pi, ctx as ExtensionContext, store, {
                repo,
                editingTask: action.task,
                seedCritiqueRecommendations: store.getRecommendationsFile(action.task.id, action.critiqueId),
              });
              break;
            }
            case "settings": {
              await runSettingsWizard(store, ctx as any, repo);
              dash.invalidate();
              tui.requestRender();
              break;
            }
            case "resume": {
              await runResumeWizard(store, ctx as any, action.task);
              dash.invalidate();
              tui.requestRender();
              break;
            }
          }
        };

        dash.start();

        return {
          render: (w: number) => dash.render(w),
          invalidate: () => dash.invalidate(),
          handleInput: (data: string) => {
            dash.handleInput(data);
            tui.requestRender();
          },
        };
      });
    },
  });

  // ── /forge-spec — spec wizard ─────────────────────────────────────────────

  pi.registerCommand("forge-spec", {
    description: "Plan a new Forge task spec conversationally (accepts JIRA key or idea as argument)",
    handler: async (args, ctx) => {
      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }
      const arg = typeof args === "string" ? args : Array.isArray(args) ? args.join(" ") : "";
      await enterSpecModeFlow(pi, ctx as ExtensionContext, store, repo, arg);
    },
  });

  // ── /forge-launch — launch wizard (for existing specs) ────────────────────

  // ── /forge-edit-spec — jump back into spec-mode for an existing draft ────────

  pi.registerCommand("forge-edit-spec", {
    description: "Re-enter spec-mode to refine an existing Forge spec (arg: optional task id substring)",
    handler: async (args, ctx) => {
      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }
      const arg = (typeof args === "string" ? args : Array.isArray(args) ? args.join(" ") : "").trim();

      // Show all tasks for this repo — user might want to edit a launched
      // or done spec, not just drafts. Sort newest first.
      const tasks = store.getTasks(repo.root);
      if (tasks.length === 0) {
        ctx.ui.notify("No specs found for this repo. Use /forge-spec to create one.", "info");
        return;
      }

      let task: TaskRecord | undefined;
      if (arg) {
        // Match by exact id or unique substring of id/title.
        const lower = arg.toLowerCase();
        const matches = tasks.filter(
          (t) => t.id === arg || t.id.includes(lower) || t.title.toLowerCase().includes(lower),
        );
        if (matches.length === 1) {
          task = matches[0];
        } else if (matches.length === 0) {
          ctx.ui.notify(`No spec matched "${arg}".`, "error");
          return;
        } else {
          // Ambiguous — fall through to picker.
          const options = matches.map((t) => `[${t.status}] ${t.title}  (${t.id})`);
          const choice = await ctx.ui.select("Multiple matches — pick one:", options);
          if (!choice) return;
          task = matches[options.indexOf(choice)];
        }
      } else {
        const options = tasks.map((t) => `[${t.status}] ${t.title}  (${t.id})`);
        const choice = await ctx.ui.select("Pick a spec to edit:", options);
        if (!choice) return;
        task = tasks[options.indexOf(choice)];
      }
      if (!task) return;

      await enterSpecMode(pi, ctx as ExtensionContext, store, {
        repo,
        editingTask: task,
      });
    },
  });

  pi.registerCommand("forge-launch", {
    description: "Launch an agent on an existing Forge spec",
    handler: async (args, ctx) => {
      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }

      const tasks = store.getTasks(repo.root).filter((t) => t.status === "draft" || t.status === "failed");
      if (tasks.length === 0) {
        ctx.ui.notify("No draft or failed tasks for this repo. Run /forge-spec first.", "info");
        return;
      }

      // Include task ID so identical-titled tasks (common after retries)
      // don't collide on options.indexOf(choice) and resolve to the
      // wrong row.
      const options = tasks.map((t) => `[${t.status}] ${t.title}  (${t.id})`);
      const choice = await ctx.ui.select("Select task to launch:", options);
      if (!choice) return;

      const task = tasks[options.indexOf(choice)];
      await runLaunchWizard(store, ctx as any, task, repo);
    },
  });

  // ── /forge-critique — adversarial spec critique ──────────────────────────

  pi.registerCommand("forge-critique", {
    description: "Run adversarial critique on a Forge spec (arg: optional task id substring)",
    handler: async (args, ctx) => {
      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }
      const arg = (typeof args === "string" ? args : Array.isArray(args) ? args.join(" ") : "").trim();

      const tasks = store.getTasks(repo.root).filter((t) => t.specFile && fs.existsSync(t.specFile));
      if (tasks.length === 0) {
        ctx.ui.notify("No specs found for this repo. Use /forge-spec to create one.", "info");
        return;
      }

      let task: TaskRecord | undefined;
      if (arg) {
        const lower = arg.toLowerCase();
        const matches = tasks.filter(
          (t) => t.id === arg || t.id.includes(lower) || t.title.toLowerCase().includes(lower),
        );
        if (matches.length === 1) {
          task = matches[0];
        } else if (matches.length === 0) {
          ctx.ui.notify(`No spec matched "${arg}".`, "error");
          return;
        } else {
          const options = matches.map((t) => `[${t.status}] ${t.title}  (${t.id})`);
          const choice = await ctx.ui.select("Multiple matches — pick one:", options);
          if (!choice) return;
          task = matches[options.indexOf(choice)];
        }
      } else {
        const options = tasks.map((t) => `[${t.status}] ${t.title}  (${t.id})`);
        const choice = await ctx.ui.select("Pick a spec to critique:", options);
        if (!choice) return;
        task = tasks[options.indexOf(choice)];
      }
      if (!task) return;

      await runCritiqueWizard(store, ctx as any, task, repo);
    },
  });

  // ── /forge-attach — attach to a running task ──────────────────────────────

  pi.registerCommand("forge-attach", {
    description: "Attach to a running Forge agent's tmux session",
    handler: async (_args, ctx) => {
      const repo = detectRepo(process.cwd());
      const allTasks = store.getTasks(repo?.root);
      const running = allTasks.filter((t) => t.tmuxSession && isTmuxSessionAlive(t.tmuxSession));

      if (running.length === 0) {
        ctx.ui.notify("No active tmux sessions found.", "info");
        return;
      }

      const options = running.map((t) => `${t.tmuxSession}  —  ${t.title} [${t.repoName}]`);
      const choice = await ctx.ui.select("Select session to attach:", options);
      if (!choice) return;

      const task = running[options.indexOf(choice)];
      ctx.ui.notify(`Attaching to ${task.tmuxSession}…`, "info");
      await new Promise((r) => setTimeout(r, 300));
      attachToSession(task.tmuxSession!);
    },
  });

  // ── /forge-review — review a PR with the bundled forge-reviewer skill ──────
  //
  // Lightweight today: fetches the PR diff + linked Forge spec (if any),
  // injects the reviewer SKILL.md content + context as a one-shot user
  // turn, lets the model produce a `forge-review` block. The user can
  // then act on it (e.g. paste into `gh pr comment`). A full
  // review-mode state machine (auto-post, re-run after fix, merge gate)
  // is a follow-up phase.

  pi.registerCommand("forge-review", {
    description: "Review a PR using the bundled forge-reviewer skill (arg: PR number)",
    handler: async (args, ctx) => {
      const arg = (typeof args === "string" ? args : Array.isArray(args) ? args.join(" ") : "").trim();
      const prNum = parseInt(arg, 10);
      if (!Number.isFinite(prNum)) {
        ctx.ui.notify("Usage: /forge-review <pr-number>", "error");
        return;
      }
      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }

      ctx.ui.notify(`Loading PR #${prNum}…`, "info");
      const prInfo = sh(
        `gh pr view ${prNum} --json number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url`,
      );
      if (!prInfo) {
        ctx.ui.notify(`Could not fetch PR #${prNum}. Is gh authenticated?`, "error");
        return;
      }
      const checks = sh(`gh pr checks ${prNum}`) || "(no check status available)";
      const diff = sh(`gh pr diff ${prNum}`) || "(empty diff)";

      // If the PR was launched by forge, find the linked spec.
      let linkedSpec: string | null = null;
      try {
        const parsed = JSON.parse(prInfo) as { headRefName?: string };
        const tasks = store.getTasks(repo.root);
        const match = tasks.find((t) => t.branch === parsed.headRefName);
        if (match) linkedSpec = store.getSpec(match.id);
      } catch {
        /* ignore */
      }

      const { fileURLToPath } = await import("node:url");
      const skillsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "skills", "forge-reviewer");

      const userMessage = buildReviewerPrompt({
        prNum,
        repoName: repo.name,
        skillsDir,
        prInfoJson: prInfo,
        ciChecks: checks,
        diff,
        linkedSpec,
      });

      pi.sendUserMessage(userMessage);
    },
  });

  // ── /forge-resume — resume a failed task from a chosen post-agent phase ────────────────────
  //
  // The most common failure mode is `gh pr create` blowing up *after* the
  // agent succeeded — 5 commits and a green test suite, but no PR. Re-running
  // the whole task wastes the agent's tokens and time. Resume reuses the
  // existing run dir and lets you pick which phase to restart from.

  pi.registerCommand("forge-resume", {
    description: "Resume a failed Forge task from a chosen phase (skip the agent, re-run quality / push / PR / review)",
    handler: async (args, ctx) => {
      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }
      const arg = (typeof args === "string" ? args : Array.isArray(args) ? args.join(" ") : "").trim();

      // Resume is only useful for failed/quality_failed tasks. Filter to those.
      const tasks = store.getTasks(repo.root).filter((t) => t.status === "failed" || t.status === "quality_failed");
      if (tasks.length === 0) {
        ctx.ui.notify("No failed tasks to resume.", "info");
        return;
      }

      let task: TaskRecord | undefined;
      if (arg) {
        const lower = arg.toLowerCase();
        const matches = tasks.filter(
          (t) => t.id === arg || t.id.includes(lower) || t.title.toLowerCase().includes(lower),
        );
        if (matches.length === 1) {
          task = matches[0];
        } else if (matches.length === 0) {
          ctx.ui.notify(`No failed task matched "${arg}".`, "error");
          return;
        } else {
          const options = matches.map((t) => `[${t.status}] ${t.title}  (${t.id})`);
          const choice = await ctx.ui.select("Multiple matches — pick one:", options);
          if (!choice) return;
          task = matches[options.indexOf(choice)];
        }
      } else {
        // Include task ID so identical-titled failures (common when
        // re-launching the same spec multiple times) don't collide on
        // options.indexOf(choice) and resume the wrong run.
        const options = tasks.map((t) => `[${t.status}] ${t.title}  (${t.id})`);
        const choice = await ctx.ui.select("Pick a failed task to resume:", options);
        if (!choice) return;
        task = tasks[options.indexOf(choice)];
      }
      if (!task) return;

      await runResumeWizard(store, ctx as any, task);
    },
  });

  // ── /forge-settings — view/edit per-repo settings ────────────────────────
  //
  // Stored in ~/.forge/repo-config.json keyed by repo root. Useful for
  // making things like "which gh account does forge use here" explicit
  // per repo, instead of relying on gh's global active-account state.

  pi.registerCommand("forge-settings", {
    description: "View / edit per-repo Forge settings (gh account, host, …)",
    handler: async (_args, ctx) => {
      const repo = detectRepo(process.cwd());
      if (!repo) {
        ctx.ui.notify("Not in a git repository.", "error");
        return;
      }
      await runSettingsWizard(store, ctx as any, repo);
    },
  });

  // ── /forge-status — quick status summary ─────────────────────────────────

  pi.registerCommand("forge-status", {
    description: "Show Forge task status summary in chat",
    handler: async (_args, ctx) => {
      const repo = detectRepo(process.cwd());
      const allTasks = repo ? store.getTasks(repo.root) : [];
      const globalRunning = store.getRunningTasks(repo?.root);

      if (allTasks.length === 0 && globalRunning.length === 0) {
        ctx.ui.notify("No forge tasks found.", "info");
        return;
      }

      const lines: string[] = [];
      if (repo && allTasks.length > 0) {
        lines.push(`**${repo.name}** tasks:`);
        for (const t of allTasks.slice(0, 10)) {
          const icon = t.status === "done" ? "✓" : t.status === "failed" ? "✗" : t.status === "draft" ? "○" : "⟳";
          const alive = t.tmuxSession ? isTmuxSessionAlive(t.tmuxSession) : false;
          const pr = t.prUrl ? ` → ${t.prUrl}` : "";
          const session = t.tmuxSession && alive ? ` [tmux: ${t.tmuxSession}]` : "";
          lines.push(`  ${icon} \`${t.branch}\` — ${t.status}${pr}${session}`);
        }
      }
      if (globalRunning.length > 0) {
        lines.push(`\n**Other running tasks:**`);
        for (const t of globalRunning) {
          lines.push(`  ⟳ \`${t.branch}\` in ${t.repoName}`);
        }
      }

      // Inject into conversation
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });
}
