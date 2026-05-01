/**
 * forge spec <save|ls|show> — manage Forge specs.
 *
 * - `forge spec save` reads body from stdin (or --from-file), generates
 *   YAML frontmatter, writes to ~/.forge/specs/<id>.md, and registers the
 *   task in ~/.forge/index.json. Used by the cc-plugin's /forge-ship-plan
 *   to pipe plan-mode output → spec.
 * - `forge spec ls` lists known specs.
 * - `forge spec show <id>` prints a saved spec (with --raw for body only).
 */

import * as fs from "node:fs";
import { parseArgs } from "node:util";
import { detectRepo } from "../../core/repo.ts";
import type { ForgeStore, LaunchTarget, TaskRecord } from "../../core/store.ts";
import { makeTheme } from "../../tui/theme.ts";
import { CliError, emitOk } from "../output.ts";
import { readStdin } from "../pickers.ts";
import { renderMarkdown } from "../render-md.ts";

export const HELP = `forge spec <save|ls|show> [...flags]

Manage Forge specs.

forge spec save [...flags]
  Reads body from stdin (or --from-file), generates YAML frontmatter, writes
  to ~/.forge/specs/<id>.md, registers a draft task in ~/.forge/index.json.

  Flags:
    --title <name>          Override title (default: first H1 in body)
    --branch <name>          Override branch slug (default: forge/<title>)
    --agent <claude|codex>   Pin implementer agent on the task
    --model <model-id>       Pin implementer model on the task
    --jira <key>             Attach a Jira ticket
    --from-file <path>       Read body from a file instead of stdin
    --json

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
  lines.push("---", "");
  return lines.join("\n");
}

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
  };

  const frontmatter = hasFrontmatter ? "" : buildFrontmatter(task, task.agent ?? undefined, task.model ?? undefined);
  const specPath = store.writeSpec(id, frontmatter + body);
  task.specFile = specPath;
  store.upsertTask(task);

  emitOk(
    { taskId: id, specPath, branch, status: "draft" },
    values.json === true,
    () => `saved spec ${id}\n  path: ${specPath}\n  branch: ${branch}`,
  );
}

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
    process.stderr.write("Usage: forge spec <save|ls|show> [...args]\n");
    process.exit(sub ? 0 : 1);
  }
  switch (sub) {
    case "save":
      return runSave(argv.slice(1), store);
    case "ls":
      return runLs(argv.slice(1), store);
    case "show":
      return runShow(argv.slice(1), store);
    default:
      throw new CliError("UNKNOWN_SUBCMD", `Unknown spec subcommand: ${sub}`, {
        hint: "Try: forge spec save | ls | show",
        exitCode: 1,
      });
  }
}
