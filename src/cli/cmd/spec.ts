/**
 * forge spec <save|ls|show|improve|diff> — manage Forge specs.
 *
 * - `forge spec save` reads body from stdin (or --from-file), generates
 *   YAML frontmatter, writes to ~/.forge/specs/<id>.md, registers the
 *   task in ~/.forge/index.json, and (by default) runs the auto-improve
 *   loop. Used by the cc-plugin's /forge-ship-plan to pipe plan-mode
 *   output → spec.
 * - `forge spec improve <id>` runs the auto-improve loop on an
 *   already-saved spec. Repeat invocations are cumulative.
 * - `forge spec diff <id>` prints a unified diff of the original vs. the
 *   live spec for the most recent critique (or `--from <critiqueId>`).
 * - `forge spec ls` lists known specs.
 * - `forge spec show <id>` prints a saved spec (with --raw for body only).
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parseArgs } from "node:util";
import type { CritiqueAgent } from "../../core/critique.ts";
import { type ImproveResult, runImprover } from "../../core/improve.ts";
import { detectRepo } from "../../core/repo.ts";
import type { ForgeStore, LaunchTarget, ReasoningEffort, RepoConfig, TaskRecord } from "../../core/store.ts";
import { makeTheme } from "../../tui/theme.ts";
import { CliError, emitOk } from "../output.ts";
import { readStdin } from "../pickers.ts";
import { renderMarkdown } from "../render-md.ts";

export const HELP = `forge spec <save|ls|show|improve|diff> [...flags]

Manage Forge specs.

forge spec save [...flags]
  Reads body from stdin (or --from-file), generates YAML frontmatter, writes
  to ~/.forge/specs/<id>.md, registers a draft task in ~/.forge/index.json.
  By default also runs the auto-improve loop (two critics + synthesizer +
  spec-improver) and rewrites the spec body in place. The JSON envelope
  grows an \`improve\` field describing the outcome (or \`null\` when skipped).

  Flags:
    --title <name>           Override title (default: first H1 in body)
    --branch <name>          Override branch slug (default: forge/<title>)
    --agent <claude|codex>   Pin implementer agent on the task
    --model <model-id>       Pin implementer model on the task
    --jira <key>             Attach a Jira ticket
    --from-file <path>       Read body from a file instead of stdin
    --no-improve             Skip the auto-improve loop (envelope: improve=null)
    --improve-mode <mode>    off | sync | background (default: sync; Phase 1 maps
                             "background" to "sync" with a warning on stderr)
    --json

  Auto-improve is also skipped (envelope improve=null) when:
    - --no-improve is set, or
    - --improve-mode off, or
    - RepoConfig.autoImprove is false, or
    - the supplied body already contained YAML frontmatter (user-supplied).

forge spec improve <task-id> [--json]
  Runs the auto-improve loop on an already-saved spec. Always sync mode.
  Each invocation generates a new critiqueId and bumps specVersion.
  JSON envelope: { taskId, improve: {...} }.

forge spec diff <task-id> [--from <critiqueId>]
  Prints a unified diff of spec-original.md vs. the live spec body
  (frontmatter stripped from both). Without --from, uses the most recent
  critique. Exit codes: 0 = identical, 1 = diff present, 2 = error.

forge spec ls [--all] [--json]
  List draft specs (current repo by default).

forge spec show <task-id> [--raw] [--json]
  Print a saved spec. --raw strips frontmatter.
`;

function deriveTitle(body: string, override?: string): string {
  if (override) return override.trim();
  const m = body.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim();
  return "untitled-spec";
}

function deriveBranch(title: string, override?: string): string {
  if (override) return override.trim();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `forge/${slug || "untitled"}`;
}

function buildFrontmatter(task: TaskRecord, agent?: string, model?: string): string {
  const lines: string[] = ["---", `id: ${task.id}`, `repo: ${task.repoRoot}`, `repoName: ${task.repoName}`];
  lines.push(`createdAt: ${task.createdAt}`);
  lines.push(`status: ${task.status}`);
  if (agent) lines.push(`suggestedAgent: ${agent}`);
  if (model) lines.push(`suggestedModel: ${model}`);
  lines.push(`suggestedBranch: ${task.branch}`);
  if (task.jiraTicket) lines.push(`jiraTicket: ${task.jiraTicket}`);
  lines.push(`specVersion: ${task.specVersion}`);
  lines.push("---", "");
  return lines.join("\n");
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}

// ─── Auto-improve config resolution ─────────────────────────────────────────

interface CritiqueResolution {
  criticA: CritiqueAgent;
  criticB: CritiqueAgent;
  synthesizer: CritiqueAgent;
  improver: CritiqueAgent;
}

const DEFAULT_AGENT: { agent: LaunchTarget; model: string } = { agent: "claude", model: "claude-opus-4-7" };
const DEFAULT_CRITIC_B: { agent: LaunchTarget; model: string } = { agent: "codex", model: "gpt-5-codex" };

function resolveCriticAgents(repoConfig: RepoConfig): CritiqueResolution {
  const fallback = (
    agent: string | undefined,
    model: string | undefined,
    reasoning: ReasoningEffort | undefined,
    base: { agent: LaunchTarget; model: string },
  ): CritiqueAgent => {
    return {
      agent: ((agent as LaunchTarget | undefined) ?? base.agent) as LaunchTarget,
      model: model ?? base.model,
      reasoningEffort: reasoning,
    };
  };

  const defaultBase: { agent: LaunchTarget; model: string } = repoConfig.defaultAgent
    ? { agent: repoConfig.defaultAgent, model: repoConfig.defaultModel ?? DEFAULT_AGENT.model }
    : DEFAULT_AGENT;

  const criticA = fallback(
    repoConfig.critiqueAgentA,
    repoConfig.critiqueModelA,
    repoConfig.critiqueReasoningA,
    defaultBase,
  );
  const criticB = fallback(
    repoConfig.critiqueAgentB,
    repoConfig.critiqueModelB,
    repoConfig.critiqueReasoningB,
    DEFAULT_CRITIC_B,
  );
  const synthesizer = fallback(
    repoConfig.critiqueAgentSynth,
    repoConfig.critiqueModelSynth,
    repoConfig.critiqueReasoningSynth,
    DEFAULT_AGENT,
  );
  const improver = fallback(
    repoConfig.improverAgent,
    repoConfig.improverModel,
    repoConfig.improverReasoning,
    DEFAULT_AGENT,
  );
  return { criticA, criticB, synthesizer, improver };
}

async function runAutoImprove(task: TaskRecord, store: ForgeStore): Promise<ImproveResult> {
  const repoConfig = store.getRepoConfig(task.repoRoot);
  const repo = detectRepo(task.repoRoot);
  const contextContent = repo?.contextContent ?? null;
  const { criticA, criticB, synthesizer, improver } = resolveCriticAgents(repoConfig);

  const spec = store.getSpec(task.id) ?? "";
  const body = stripFrontmatter(spec);

  return await runImprover(
    {
      taskId: task.id,
      repoRoot: task.repoRoot,
      repoName: task.repoName,
      specTitle: task.title,
      specBody: body,
      contextContent,
      criticA,
      criticB,
      synthesizer,
      improver,
    },
    store,
  );
}

// ─── save ───────────────────────────────────────────────────────────────────

async function runSave(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      title: { type: "string" },
      branch: { type: "string" },
      agent: { type: "string" },
      model: { type: "string" },
      "from-file": { type: "string" },
      jira: { type: "string" },
      "no-improve": { type: "boolean" },
      "improve-mode": { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  let body: string;
  if (typeof values["from-file"] === "string") {
    if (!fs.existsSync(values["from-file"])) {
      throw new CliError("NO_FILE", `--from-file path not found: ${values["from-file"]}`, { exitCode: 1 });
    }
    body = fs.readFileSync(values["from-file"], "utf-8");
  } else {
    if (process.stdin.isTTY) {
      throw new CliError("NO_INPUT", "spec save expects body on stdin or --from-file <path>.", {
        hint: "Pipe a plan: `forge spec save - < plan.md` or use --from-file.",
        exitCode: 1,
      });
    }
    body = await readStdin();
  }
  if (!body.trim()) {
    throw new CliError("EMPTY_INPUT", "spec body is empty.", {
      hint: "Provide content via stdin or --from-file <path>.",
      exitCode: 1,
    });
  }

  // If body already has frontmatter, leave it alone — caller knows what
  // they're doing. Otherwise generate one.
  const hasFrontmatter = /^---\s*\n[\s\S]*?\n---\s*\n/.test(body);

  const repo = detectRepo(process.cwd());
  if (!repo) {
    throw new CliError("NOT_A_REPO", "Not in a git repository.", {
      hint: "spec save infers repo info from the cwd.",
      exitCode: 2,
    });
  }

  const title = deriveTitle(body, values.title as string | undefined);
  const id = store.generateId(title);
  const branch = deriveBranch(title, values.branch as string | undefined);

  const task: TaskRecord = {
    id,
    title,
    repoRoot: repo.root,
    repoName: repo.name,
    branch,
    worktree: null,
    status: "draft",
    agent: (values.agent as LaunchTarget | undefined) ?? null,
    model: (values.model as string | undefined) ?? null,
    createdAt: new Date().toISOString(),
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: (values.jira as string | undefined) ?? null,
    specFile: "", // filled by store
    specVersion: 1,
  };

  const frontmatter = hasFrontmatter ? "" : buildFrontmatter(task, task.agent ?? undefined, task.model ?? undefined);
  const specPath = store.writeSpec(id, frontmatter + body);
  task.specFile = specPath;
  store.upsertTask(task);

  // ── Decide whether to auto-improve ────────────────────────────────────────
  const repoConfig = store.getRepoConfig(repo.root);
  const improveMode = (values["improve-mode"] as string | undefined)?.toLowerCase();
  if (improveMode === "background") {
    process.stderr.write("(improve-mode=background not yet supported in Phase 1, falling back to sync)\n");
  }
  const explicitOff = values["no-improve"] === true || improveMode === "off";
  const repoOff = repoConfig.autoImprove === false;
  const userFm = hasFrontmatter;
  const skip = explicitOff || repoOff || userFm;

  let improve: ImproveResult | null = null;
  if (!skip) {
    try {
      improve = await runAutoImprove(task, store);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      improve = {
        critiqueId: "",
        applied: false,
        changeCount: 0,
        mode: "skipped",
        error: `IMPROVE_FAILED: ${msg}`,
      };
    }
    if (improve.error) {
      process.stderr.write(
        `${improve.error.startsWith("IMPROVE_") ? improve.error : `IMPROVE_FAILED: ${improve.error}`}\n`,
      );
    }
  }

  emitOk({ taskId: id, specPath, branch, status: "draft", improve }, values.json === true, () => {
    const lines = [`saved spec ${id}`, `  path: ${specPath}`, `  branch: ${branch}`];
    if (improve) {
      if (improve.mode === "applied") {
        lines.push(`  improve: applied ${improve.changeCount} change(s) (critique ${improve.critiqueId})`);
      } else if (improve.mode === "no-op") {
        lines.push("  improve: no actionable findings");
      } else {
        lines.push(`  improve: skipped (${improve.error ?? "unknown"})`);
      }
    }
    return lines.join("\n");
  });
}

// ─── improve ────────────────────────────────────────────────────────────────

async function runImproveCmd(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      json: { type: "boolean", default: false },
      mode: { type: "string" },
    },
    strict: false,
    allowPositionals: true,
  });

  if (typeof values.mode === "string") {
    throw new CliError("UNSUPPORTED_FLAG", "--mode is reserved for Phase 2; only sync mode is supported in Phase 1.", {
      exitCode: 1,
    });
  }

  const id = positionals[0];
  if (!id) throw new CliError("MISSING_ARG", "Usage: forge spec improve <task-id> [--json]", { exitCode: 1 });

  const task = store.getTask(id);
  if (!task) throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, { exitCode: 1 });

  const improve = await runAutoImprove(task, store);
  if (improve.error) {
    process.stderr.write(
      `${improve.error.startsWith("IMPROVE_") ? improve.error : `IMPROVE_FAILED: ${improve.error}`}\n`,
    );
  }

  emitOk({ taskId: task.id, improve }, values.json === true, () => {
    if (improve.mode === "applied")
      return `improved ${task.id}: ${improve.changeCount} change(s) (critique ${improve.critiqueId})`;
    if (improve.mode === "no-op") return `no actionable findings for ${task.id}`;
    return `improve skipped for ${task.id}: ${improve.error ?? "unknown"}`;
  });
}

// ─── diff ───────────────────────────────────────────────────────────────────

async function runDiff(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      from: { type: "string" },
    },
    strict: false,
    allowPositionals: true,
  });

  const id = positionals[0];
  if (!id) {
    process.stderr.write("Usage: forge spec diff <task-id> [--from <critiqueId>]\n");
    process.exit(2);
  }

  const task = store.getTask(id);
  if (!task) {
    process.stderr.write(`error: no task with id "${id}"\n`);
    process.exit(2);
  }

  const requestedCritique = values.from as string | undefined;
  const critiqueId = requestedCritique ?? store.getLatestCritique(id);
  if (!critiqueId) {
    process.stderr.write(`error: no critique recorded for task "${id}"\n`);
    process.exit(2);
  }
  const dir = store.getCritiqueDir(id, critiqueId);
  const originalPath = path.join(dir, "spec-original.md");
  if (!fs.existsSync(originalPath)) {
    process.stderr.write(`error: spec-original.md missing for critique "${critiqueId}"\n`);
    process.exit(2);
  }
  const live = store.getSpec(id);
  if (live === null) {
    process.stderr.write(`error: live spec missing for task "${id}"\n`);
    process.exit(2);
  }

  const originalBody = stripFrontmatter(fs.readFileSync(originalPath, "utf-8"));
  const liveBody = stripFrontmatter(live);

  if (originalBody === liveBody) process.exit(0);

  // Stage stripped bodies to temp files, then run `diff -u`. We can't use
  // `originalPath` directly because it includes frontmatter we want to
  // ignore. `diff` exits 1 when files differ — that's our success path.
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-diff-"));
  const origTmp = path.join(tmpDir, "original");
  const liveTmp = path.join(tmpDir, "current");
  fs.writeFileSync(origTmp, originalBody);
  fs.writeFileSync(liveTmp, liveBody);

  let diffOut = "";
  try {
    diffOut = execFileSync(
      "diff",
      ["-u", "--label", `original/${critiqueId}`, "--label", "current", origTmp, liveTmp],
      { encoding: "utf-8" },
    );
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: Buffer | string };
    if (err.status === 1 && err.stdout != null) {
      diffOut = typeof err.stdout === "string" ? err.stdout : err.stdout.toString();
    } else if (err.status === 2) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      process.stderr.write(`error: diff failed (exit 2)\n`);
      process.exit(2);
    } else {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      process.stderr.write(`error: diff failed: ${e instanceof Error ? e.message : String(e)}\n`);
      process.exit(2);
    }
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
  process.stdout.write(diffOut);
  if (!diffOut.endsWith("\n")) process.stdout.write("\n");
  process.exit(1);
}

// ─── ls / show ──────────────────────────────────────────────────────────────

async function runLs(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      json: { type: "boolean", default: false },
      all: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  let repoRoot: string | undefined;
  if (!values.all) {
    const detected = detectRepo(process.cwd());
    repoRoot = detected?.root;
  }

  const tasks = store.getTasks(repoRoot).filter((t) => t.status === "draft");
  emitOk({ tasks }, values.json === true, () =>
    tasks.length === 0 ? "(no draft specs)" : tasks.map((t) => `  ${t.id}  ${t.title}  (${t.branch})`).join("\n"),
  );
}

async function runShow(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      raw: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const id = positionals[0];
  if (!id) throw new CliError("MISSING_ARG", "Usage: forge spec show <task-id>", { exitCode: 1 });

  const spec = store.getSpec(id);
  if (!spec) throw new CliError("UNKNOWN_TASK", `No spec for task id "${id}".`, { exitCode: 1 });

  if (values.raw) {
    process.stdout.write(spec.replace(/^---[\s\S]*?---\n*/m, ""));
    return;
  }

  if (values.json) {
    emitOk({ taskId: id, body: spec }, true);
    return;
  }

  // Pipes / redirects get raw markdown; only render in a real TTY.
  if (!process.stdout.isTTY) {
    process.stdout.write(spec);
    return;
  }

  const theme = makeTheme();
  process.stdout.write(`${renderMarkdown(spec, theme)}\n`);
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const sub = argv[0];
  if (!sub || sub === "--help") {
    process.stderr.write("Usage: forge spec <save|ls|show|improve|diff> [...args]\n");
    process.exit(sub ? 0 : 1);
  }
  switch (sub) {
    case "save":
      return runSave(argv.slice(1), store);
    case "ls":
      return runLs(argv.slice(1), store);
    case "show":
      return runShow(argv.slice(1), store);
    case "improve":
      return runImproveCmd(argv.slice(1), store);
    case "diff":
      return runDiff(argv.slice(1), store);
    default:
      throw new CliError("UNKNOWN_SUBCMD", `Unknown spec subcommand: ${sub}`, {
        hint: "Try: forge spec save | ls | show | improve | diff",
        exitCode: 1,
      });
  }
}
