/**
 * forge serve — localhost HTTP + SSE for the Workbench UI.
 *
 * Boots a Bun.serve on 127.0.0.1:<port>, serves static UI bytes from
 * src/web/index.html, and exposes read endpoints + four POST action
 * endpoints (specs / launch / critique / kill) backed by the same
 * programmatic cores the CLI uses (saveSpec, doLaunch, doCritique).
 *
 * Localhost-only by design. There is no auth in this revision.
 */

import { execSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import type { GhTarget } from "../../core/gh.ts";
import { fetchPrs } from "../../core/gh-pr.ts";
import { isTmuxSessionAlive, killTmuxSession } from "../../core/launch.ts";
import { detectRepo } from "../../core/repo.ts";
import type { CritiqueMeta, ForgeStore, RunMeta, TaskRecord, TaskStatus } from "../../core/store.ts";
import { CliError } from "../output.ts";
import { doCritique } from "./critique.ts";
import { doLaunch } from "./launch.ts";
import { improveSpec, saveSpec } from "./spec.ts";

export const HELP = `forge serve [...flags]

Serve the Forge Workbench (web UI) on a local HTTP port. Localhost-only;
no authentication. Reads state from ~/.forge/; mutations go through the
existing CLI subcommands so the agent contract stays single-sourced.

Flags:
  --port <n>          Port to bind (default: 7456)
  --host <addr>       Host to bind (default: 127.0.0.1)
  --open              Launch the UI in your browser after the server boots
  --json              Emit a one-line JSON envelope after the server boots
                      (useful when scripting; the server keeps running)
`;

const DEFAULT_PORT = 7456;
const DEFAULT_HOST = "127.0.0.1";

// ─── enriched task shape exposed to the UI ───────────────────────────────────

type WorkbenchSection = "running" | "attention" | "ready" | "drafting" | "done";

interface TaskView {
  id: string;
  title: string;
  status: TaskStatus;
  section: WorkbenchSection;
  statLabel: string;
  statClass: WorkbenchSection;
  kind?: "critique-ready" | "failed";
  branch: string;
  agent: string | null;
  agentLabel: string | null;
  repo: string;
  repoRoot: string;
  blurb: string | null;
  age: string;
  ageMs: number;
  prUrl: string | null;
  prNumber: number | null;
  error: string | null;
  tmuxAlive: boolean;
  hasSpec: boolean;
  hasLog: boolean;
  critique: { id: string; status: CritiqueMeta["status"]; viewedAt: string | null } | null;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null | undefined): { label: string; ms: number } {
  if (!iso) return { label: "—", ms: Number.POSITIVE_INFINITY };
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return { label: "—", ms: Number.POSITIVE_INFINITY };
  if (ms < 60_000) return { label: `${Math.max(1, Math.round(ms / 1000))}s`, ms };
  if (ms < 3_600_000) return { label: `${Math.round(ms / 60_000)}m`, ms };
  if (ms < 86_400_000) return { label: `${Math.round(ms / 3_600_000)}h`, ms };
  return { label: `${Math.round(ms / 86_400_000)}d`, ms };
}

function shortModel(model: string | null): string | null {
  if (!model) return null;
  // claude-opus-4-7 → opus-4-7; gpt-5-codex → gpt-5-codex; o3 → o3
  return model.replace(/^claude-/, "");
}

function agentLabel(agent: string | null, model: string | null): string | null {
  if (!agent && !model) return null;
  if (!agent) return shortModel(model);
  if (!model) return agent;
  return `${agent} · ${shortModel(model)}`;
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}

function blurbFromSpec(specBody: string): string | null {
  const body = stripFrontmatter(specBody);
  // Skip the H1 if present, take the first non-empty paragraph.
  const lines = body.split(/\r?\n/);
  const buf: string[] = [];
  for (const ln of lines) {
    const trimmed = ln.trim();
    if (trimmed.startsWith("# ")) {
      if (buf.length > 0) break;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      if (buf.length > 0) break;
      continue;
    }
    if (trimmed === "") {
      if (buf.length > 0) break;
      continue;
    }
    buf.push(trimmed);
    if (buf.join(" ").length > 200) break;
  }
  if (buf.length === 0) return null;
  const out = buf.join(" ").replace(/\s+/g, " ").trim();
  return out.length > 240 ? `${out.slice(0, 237)}…` : out;
}

function statusInfo(
  task: TaskRecord,
  store: ForgeStore,
): {
  section: WorkbenchSection;
  statLabel: string;
  statClass: WorkbenchSection;
  kind?: "critique-ready" | "failed";
  error: string | null;
  critique: TaskView["critique"];
} {
  const latestCritiqueId = store.getLatestCritique(task.id);
  const critiqueMeta = latestCritiqueId ? store.readCritiqueMeta(task.id, latestCritiqueId) : null;
  const critique = critiqueMeta
    ? { id: latestCritiqueId as string, status: critiqueMeta.status, viewedAt: critiqueMeta.viewedAt }
    : null;

  switch (task.status) {
    case "running":
      return { section: "running", statLabel: "Running", statClass: "running", error: null, critique };
    case "quality_check":
      return { section: "running", statLabel: "Quality", statClass: "running", error: null, critique };
    case "creating_pr":
      return { section: "running", statLabel: "Opening PR", statClass: "running", error: null, critique };
    case "fixing":
      return { section: "running", statLabel: "Fixing", statClass: "running", error: null, critique };
    case "failed":
      return {
        section: "attention",
        statLabel: "Failed",
        statClass: "failed" as WorkbenchSection,
        kind: "failed",
        error: failureMessage(task, store),
        critique,
      };
    case "quality_failed":
      return {
        section: "attention",
        statLabel: "Quality failed",
        statClass: "failed" as WorkbenchSection,
        kind: "failed",
        error: failureMessage(task, store),
        critique,
      };
    case "done":
      return { section: "done", statLabel: "Merged", statClass: "done", error: null, critique };
    case "draft": {
      if (critiqueMeta?.status === "done" && !critiqueMeta.viewedAt) {
        return {
          section: "attention",
          statLabel: "Critique ready",
          statClass: "attention" as WorkbenchSection,
          kind: "critique-ready",
          error: null,
          critique,
        };
      }
      // Critics or synthesizer in flight — auto-improve / critique is
      // actively running. Stay in drafting (the task isn't launched), but
      // give the pill the running pulse so the user sees activity.
      if (critiqueMeta?.status === "running_critics" || critiqueMeta?.status === "running_synth") {
        return { section: "drafting", statLabel: "Improving", statClass: "running", error: null, critique };
      }
      // "Ready" today = the auto-improver has already revised this spec
      // (specVersion > 1). It's a coarse signal but matches the prototype's
      // "auto-improve passed" framing without requiring a new field.
      if (task.specVersion > 1) {
        return { section: "ready", statLabel: "Ready", statClass: "ready", error: null, critique };
      }
      return { section: "drafting", statLabel: "Drafting", statClass: "drafting", error: null, critique };
    }
  }
}

function failureMessage(task: TaskRecord, store: ForgeStore): string | null {
  const meta = store.readRunMeta(task.id);
  if (task.status === "quality_failed") {
    const results = (meta?.qualityResults as { command: string; ok: boolean }[] | undefined) ?? [];
    const failed = results.filter((r) => !r.ok).map((r) => r.command);
    if (failed.length > 0) return `quality failed: ${failed.join(", ")}`;
  }
  const errMsg = meta?.errorMessage as string | undefined;
  if (errMsg) return errMsg.replace(/\s+/g, " ").trim().slice(0, 240);
  const tail = store.tailLog(task.id, 1);
  if (tail[0]) return tail[0].slice(0, 240);
  return null;
}

function specBranchInDisk(repoRoot: string): string | null {
  try {
    const out = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 3000,
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function ghTargetForRepo(store: ForgeStore, repoRoot: string): GhTarget | undefined {
  const cfg = store.getRepoConfig(repoRoot);
  if (!cfg.ghUser && !cfg.ghHost) return undefined;
  return { user: cfg.ghUser, host: cfg.ghHost };
}

function viewTask(task: TaskRecord, store: ForgeStore): TaskView {
  const info = statusInfo(task, store);
  const ageRef = task.launchedAt ?? task.createdAt;
  const age = timeAgo(ageRef);
  const spec = store.getSpec(task.id);
  const blurb = spec ? blurbFromSpec(spec) : null;
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    section: info.section,
    statLabel: info.statLabel,
    statClass: info.statClass,
    kind: info.kind,
    branch: task.branch,
    agent: task.agent,
    agentLabel: agentLabel(task.agent, task.model),
    repo: task.repoName,
    repoRoot: task.repoRoot,
    blurb,
    age: age.label,
    ageMs: age.ms,
    prUrl: task.prUrl,
    prNumber: task.prNumber,
    error: info.error,
    tmuxAlive: task.tmuxSession ? isTmuxSessionAlive(task.tmuxSession) : false,
    hasSpec: !!spec,
    hasLog: fs.existsSync(store.getLogFile(task.id)),
    critique: info.critique,
  };
}

// ─── response helpers ────────────────────────────────────────────────────────

interface ApiError {
  ok: false;
  error: { code: string; message: string; hint?: string };
}

function jsonOk(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    ...init,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...(init?.headers ?? {}) },
  });
}

function jsonErr(status: number, code: string, message: string, hint?: string): Response {
  const body: ApiError = { ok: false, error: { code, message, hint } };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

// ─── log SSE ─────────────────────────────────────────────────────────────────

function tailBytes(filePath: string, lines: number): string {
  if (!fs.existsSync(filePath)) return "";
  const content = fs.readFileSync(filePath, "utf-8");
  const split = content.split(/\r?\n/);
  const head = split.length > lines ? split.slice(split.length - lines) : split;
  // Drop the trailing empty token from the final newline so the SSE
  // payload doesn't paint a blank line on connect.
  if (head.length > 0 && head[head.length - 1] === "") head.pop();
  return head.join("\n");
}

function logSseResponse(logFile: string, initialLines: number): Response {
  // Cleanup is shared between start() (which builds it) and cancel()
  // (which the client fires on disconnect). Default no-op so we never
  // call undefined if cancel races ahead of start.
  let cleanup: () => void = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: string) => {
        const payload = `event: ${event}\ndata: ${data.replace(/\n/g, "\ndata: ")}\n\n`;
        try {
          controller.enqueue(enc.encode(payload));
        } catch {
          // controller already closed
        }
      };

      // 1) initial dump
      send("snapshot", tailBytes(logFile, initialLines));

      // 2) tail-watch
      let offset = fs.existsSync(logFile) ? fs.statSync(logFile).size : 0;
      let watcher: fs.FSWatcher | null = null;
      let pollTimer: ReturnType<typeof setInterval> | null = null;
      let heartbeat: ReturnType<typeof setInterval> | null = null;
      let closed = false;

      const tearDown = () => {
        if (closed) return;
        closed = true;
        if (watcher) {
          try {
            watcher.close();
          } catch {
            /* noop */
          }
          watcher = null;
        }
        if (pollTimer) clearInterval(pollTimer);
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* noop */
        }
      };
      cleanup = tearDown;

      const pump = () => {
        if (closed) return;
        try {
          if (!fs.existsSync(logFile)) return;
          const size = fs.statSync(logFile).size;
          if (size <= offset) return;
          const fd = fs.openSync(logFile, "r");
          try {
            const buf = Buffer.alloc(size - offset);
            fs.readSync(fd, buf, 0, buf.length, offset);
            const chunk = buf.toString("utf-8").replace(/\n+$/, "");
            if (chunk) send("append", chunk);
          } finally {
            fs.closeSync(fd);
          }
          offset = size;
        } catch {
          tearDown();
        }
      };

      try {
        if (fs.existsSync(logFile)) {
          watcher = fs.watch(logFile, () => pump());
        }
      } catch {
        /* fall back to poll */
      }
      // Belt-and-suspenders: poll every 1.5s in case fs.watch misses an
      // event (it does, occasionally, on macOS APFS under heavy load).
      pollTimer = setInterval(pump, 1500);

      // Heartbeat every 25s so any intermediate proxy doesn't kill the
      // connection. SSE comments are ignored by the browser.
      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(": heartbeat\n\n"));
        } catch {
          tearDown();
        }
      }, 25_000);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

// ─── route handlers ──────────────────────────────────────────────────────────

interface RouteCtx {
  store: ForgeStore;
  webDir: string;
}

function staticFile(filePath: string, contentType: string): Response {
  if (!fs.existsSync(filePath)) return jsonErr(404, "NOT_FOUND", `File not found: ${filePath}`);
  const buf = fs.readFileSync(filePath);
  return new Response(buf, { headers: { "content-type": contentType, "cache-control": "no-store" } });
}

async function handleApi(url: URL, ctx: RouteCtx): Promise<Response> {
  const { pathname } = url;
  const { store } = ctx;

  // GET /api/health
  if (pathname === "/api/health") {
    return jsonOk({ ok: true, version: "0.4.0-dev" });
  }

  // GET /api/repos
  if (pathname === "/api/repos") {
    const tasks = store.getTasks();
    const counts = new Map<string, { name: string; root: string; count: number }>();
    for (const t of tasks) {
      const entry = counts.get(t.repoRoot) ?? { name: t.repoName, root: t.repoRoot, count: 0 };
      entry.count += 1;
      counts.set(t.repoRoot, entry);
    }
    const repos = Array.from(counts.values())
      .map((r) => ({ name: r.name, root: r.root, branch: specBranchInDisk(r.root), taskCount: r.count }))
      .sort((a, b) => b.taskCount - a.taskCount || a.name.localeCompare(b.name));
    return jsonOk({ repos });
  }

  // GET /api/tasks?repo=<name>&section=<...>
  if (pathname === "/api/tasks") {
    const repo = url.searchParams.get("repo") || undefined;
    const section = url.searchParams.get("section") || undefined;
    let tasks = store.getTasks();
    if (repo) tasks = tasks.filter((t) => t.repoName === repo || t.repoRoot === repo);
    // Sync any running tasks so the UI sees fresh statuses on every poll.
    for (const t of tasks) {
      if (
        t.status === "running" ||
        t.status === "quality_check" ||
        t.status === "creating_pr" ||
        t.status === "fixing"
      ) {
        store.syncTaskStatus(t);
      }
    }
    // Re-read after the sync to pick up any status changes.
    let synced = store.getTasks();
    if (repo) synced = synced.filter((t) => t.repoName === repo || t.repoRoot === repo);
    let views = synced.map((t) => viewTask(t, store));
    if (section) views = views.filter((v) => v.section === section);
    return jsonOk({ tasks: views });
  }

  // GET /api/tasks/:id
  // GET /api/tasks/:id/spec
  // GET /api/tasks/:id/log    (SSE)
  // GET /api/tasks/:id/critique
  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)(?:\/(spec|log|critique))?$/);
  if (taskMatch) {
    const id = decodeURIComponent(taskMatch[1]);
    const sub = taskMatch[2];
    const task = store.getTask(id);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${id}".`);

    if (!sub) {
      const meta = store.readRunMeta(id);
      const view = viewTask(task, store);
      return jsonOk({ task: view, meta });
    }

    if (sub === "spec") {
      const spec = store.getSpec(id);
      if (spec === null) return jsonErr(404, "NO_SPEC", `No spec on disk for task "${id}".`);
      const stripped = url.searchParams.get("raw") === "1" ? stripFrontmatter(spec) : spec;
      return jsonOk({ taskId: id, body: stripped });
    }

    if (sub === "critique") {
      const critiqueId = url.searchParams.get("critiqueId") || store.getLatestCritique(id);
      if (!critiqueId) return jsonOk({ taskId: id, critique: null });
      const meta = store.readCritiqueMeta(id, critiqueId);
      if (!meta) return jsonOk({ taskId: id, critique: null });
      const dir = store.getCritiqueDir(id, critiqueId);
      const recPath = path.join(dir, "recommendations.md");
      const recommendations = fs.existsSync(recPath) ? fs.readFileSync(recPath, "utf-8") : null;
      const critA = path.join(dir, "critic-a.md");
      const critB = path.join(dir, "critic-b.md");
      const synth = path.join(dir, "synth.md");
      return jsonOk({
        taskId: id,
        critique: {
          meta,
          recommendations,
          criticA: fs.existsSync(critA) ? fs.readFileSync(critA, "utf-8") : null,
          criticB: fs.existsSync(critB) ? fs.readFileSync(critB, "utf-8") : null,
          synth: fs.existsSync(synth) ? fs.readFileSync(synth, "utf-8") : null,
        },
      });
    }

    if (sub === "log") {
      const logFile = store.getLogFile(id);
      const linesParam = url.searchParams.get("lines");
      const initial = Math.max(0, Math.min(2000, Number.parseInt(linesParam ?? "200", 10) || 200));
      return logSseResponse(logFile, initial);
    }
  }

  // GET /api/prs?repo=<name>
  if (pathname === "/api/prs") {
    const repoName = url.searchParams.get("repo") || undefined;
    const repos = uniqueRepos(store);
    const target = repoName ? repos.find((r) => r.name === repoName || r.root === repoName) : repos[0];
    if (!target) return jsonOk({ prs: [], me: "" });
    const result = await fetchPrs({ cwd: target.root, ghTarget: ghTargetForRepo(store, target.root) });
    return jsonOk({ prs: result.prs, me: result.me, repo: target.name });
  }

  return jsonErr(404, "NOT_FOUND", `No such endpoint: ${pathname}`);
}

function uniqueRepos(store: ForgeStore): Array<{ name: string; root: string }> {
  const seen = new Map<string, { name: string; root: string }>();
  for (const t of store.getTasks()) {
    if (!seen.has(t.repoRoot)) seen.set(t.repoRoot, { name: t.repoName, root: t.repoRoot });
  }
  return Array.from(seen.values());
}

// ─── POST routes ─────────────────────────────────────────────────────────────

const ACTION_TASK_PATH = /^\/api\/tasks\/([^/]+)\/(launch|critique|improve|kill|resume)$/;

function allowsPost(pathname: string): boolean {
  if (pathname === "/api/specs") return true;
  return ACTION_TASK_PATH.test(pathname);
}

/** Map a CliError to an HTTP status. exitCode 1 = user error → 400 by default. */
function httpStatusFor(err: CliError): number {
  switch (err.code) {
    case "UNKNOWN_TASK":
      return 404;
    case "BAD_STATE":
      return 409;
    case "EMPTY_INPUT":
    case "NOT_A_REPO":
    case "MISSING_FLAGS":
    case "DEFAULT_BRANCH":
    case "BAD_REQUEST":
      return 400;
    default:
      return err.exitCode === 1 ? 400 : 500;
  }
}

function fromCliError(err: CliError): Response {
  return jsonErr(httpStatusFor(err), err.code, err.message, err.hint);
}

async function readJsonBody(req: Request): Promise<{ body: Record<string, unknown> } | { error: Response }> {
  const ct = req.headers.get("content-type") ?? "";
  // Allow an empty body for endpoints that don't take one (e.g. /critique, /kill).
  // Browsers may set content-length: 0 with no content-type.
  if (req.headers.get("content-length") === "0") return { body: {} };
  if (!ct.toLowerCase().includes("application/json")) {
    return { error: jsonErr(415, "UNSUPPORTED_MEDIA_TYPE", "Expected Content-Type: application/json.") };
  }
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return { error: jsonErr(400, "BAD_JSON", "Request body is not valid JSON.") };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: jsonErr(400, "BAD_JSON", "Request body must be a JSON object.") };
  }
  return { body: parsed as Record<string, unknown> };
}

function reqString(body: Record<string, unknown>, key: string): string | null {
  const v = body[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function optString(body: Record<string, unknown>, key: string): string | undefined {
  const v = body[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

async function handleApiPost(req: Request, url: URL, ctx: RouteCtx): Promise<Response> {
  const { pathname } = url;
  const { store } = ctx;
  const parsed = await readJsonBody(req);
  if ("error" in parsed) return parsed.error;
  const body = parsed.body;

  // POST /api/specs
  if (pathname === "/api/specs") {
    const markdown = reqString(body, "markdown");
    const repoRoot = reqString(body, "repoRoot");
    if (!markdown) return jsonErr(400, "BAD_REQUEST", "`markdown` is required.");
    if (!repoRoot) return jsonErr(400, "BAD_REQUEST", "`repoRoot` is required.");
    if (!path.isAbsolute(repoRoot)) return jsonErr(400, "BAD_REQUEST", "`repoRoot` must be an absolute path.");
    const repo = detectRepo(repoRoot);
    if (!repo) {
      return jsonErr(400, "NOT_A_REPO", `Not a git repository: ${repoRoot}`);
    }
    try {
      const result = await saveSpec(
        {
          body: markdown,
          repoRoot: repo.root,
          repoName: repo.name,
          title: optString(body, "title"),
          agent: (optString(body, "agent") as TaskRecord["agent"]) ?? undefined,
          model: optString(body, "model"),
          autoImprove: body.autoImprove === false ? false : undefined,
        },
        store,
      );
      return jsonOk(result);
    } catch (e) {
      if (e instanceof CliError) return fromCliError(e);
      throw e;
    }
  }

  const m = pathname.match(ACTION_TASK_PATH);
  if (!m) return jsonErr(404, "NOT_FOUND", `No such endpoint: ${pathname}`);
  const taskId = decodeURIComponent(m[1]);
  const action = m[2];

  if (action === "resume") {
    return jsonErr(
      501,
      "NOT_IMPLEMENTED",
      "forge resume is not wired in this version.",
      "Re-launch from scratch with POST /api/tasks/:id/launch.",
    );
  }

  if (action === "kill") {
    const task = store.getTask(taskId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${taskId}".`);
    if (!task.tmuxSession) {
      return jsonErr(400, "NO_TMUX_SESSION", `Task ${taskId} has no tmux session — it hasn't been launched.`);
    }
    killTmuxSession(task.tmuxSession);
    // Merge errorMessage into existing meta so the failure card surfaces a
    // clean reason. writeRunMeta is a full overwrite, so we read-then-write.
    const existing = store.readRunMeta(taskId);
    if (existing) {
      const merged: RunMeta = { ...(existing as unknown as RunMeta), errorMessage: "killed from Workbench" };
      store.writeRunMeta(taskId, merged);
    }
    store.upsertTask({ ...task, status: "failed", completedAt: new Date().toISOString() });
    return jsonOk({ killed: true, taskId });
  }

  if (action === "launch") {
    try {
      const result = await doLaunch(
        {
          taskId,
          agent: (optString(body, "agent") as TaskRecord["agent"]) ?? undefined,
          model: optString(body, "model"),
        },
        store,
      );
      return jsonOk(result);
    } catch (e) {
      if (e instanceof CliError) return fromCliError(e);
      throw e;
    }
  }

  if (action === "critique") {
    try {
      const result = await doCritique({ taskId }, store);
      return jsonOk(result);
    } catch (e) {
      if (e instanceof CliError) return fromCliError(e);
      throw e;
    }
  }

  if (action === "improve") {
    try {
      const result = await improveSpec(taskId, store);
      return jsonOk(result);
    } catch (e) {
      if (e instanceof CliError) return fromCliError(e);
      throw e;
    }
  }

  return jsonErr(404, "NOT_FOUND", `No such endpoint: ${pathname}`);
}

// ─── server boot ─────────────────────────────────────────────────────────────

declare const Bun: {
  serve: (opts: unknown) => { port: number; hostname: string; stop: (closeActive?: boolean) => void };
};

export interface ServeOptions {
  port?: number;
  host?: string;
  open?: boolean;
}

/**
 * Boot the HTTP server. Exposed (as opposed to `run()`) so tests can
 * spin up a server, hit it, and call `stop()` instead of fork-spawning
 * a subprocess.
 */
export function startServer(store: ForgeStore, opts: ServeOptions = {}): { port: number; stop: () => void } {
  const port = opts.port ?? DEFAULT_PORT;
  const host = opts.host ?? DEFAULT_HOST;

  const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "web");
  const indexFile = path.join(webDir, "index.html");
  if (!fs.existsSync(indexFile)) {
    throw new CliError("NO_WEB_ASSETS", `Forge UI not found at ${indexFile}.`, {
      hint: "Re-install forge or check that src/web/index.html exists in your checkout.",
      exitCode: 2,
    });
  }

  const ctx: RouteCtx = { store, webDir };

  const server = Bun.serve({
    port,
    hostname: host,
    development: false,
    error(err: Error) {
      process.stderr.write(`forge serve: unhandled error: ${err.message}\n`);
      return new Response(JSON.stringify({ ok: false, error: { code: "INTERNAL", message: err.message } }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    },
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url);
      const { pathname } = url;

      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, POST, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        });
      }

      if (pathname.startsWith("/api/")) {
        if (req.method === "POST" && allowsPost(pathname)) {
          return handleApiPost(req, url, ctx);
        }
        if (req.method !== "GET") {
          return jsonErr(405, "METHOD_NOT_ALLOWED", `${req.method} not allowed for ${pathname}.`);
        }
        return handleApi(url, ctx);
      }

      // Static UI. Serve src/web/<path>; default `/` → index.html.
      const rel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      // Anchor the resolution at webDir; refuse anything that escapes it.
      const candidate = path.resolve(webDir, rel);
      if (!candidate.startsWith(webDir + path.sep) && candidate !== webDir) {
        return jsonErr(403, "FORBIDDEN", "Path traversal blocked.");
      }
      const contentType = guessContentType(candidate);
      return staticFile(candidate, contentType);
    },
  }) as { port: number; hostname: string; stop: (closeActive?: boolean) => void };

  return {
    port: server.port,
    stop: () => server.stop(true),
  };
}

function guessContentType(p: string): string {
  const ext = path.extname(p).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      port: { type: "string" },
      host: { type: "string" },
      open: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: false,
  });

  const portRaw = typeof values.port === "string" ? Number.parseInt(values.port, 10) : DEFAULT_PORT;
  if (Number.isNaN(portRaw) || portRaw < 1 || portRaw > 65535) {
    throw new CliError("BAD_PORT", `Invalid --port: ${values.port}`, { exitCode: 1 });
  }
  const host = typeof values.host === "string" ? values.host : DEFAULT_HOST;
  const open = values.open === true;
  const json = values.json === true;

  const { port, stop } = startServer(store, { port: portRaw, host });
  const url = `http://${host}:${port}`;

  if (json) {
    process.stdout.write(`${JSON.stringify({ ok: true, data: { url, port, host } })}\n`);
  } else {
    process.stderr.write(`Forge Workbench: ${url}\n`);
    process.stderr.write(`(Ctrl-C to stop)\n`);
  }

  if (open) {
    const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    const child = spawn(opener, [url], { stdio: "ignore", detached: true });
    child.unref();
  }

  const shutdown = () => {
    process.stderr.write("\nshutting down…\n");
    stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Park forever — the server lives as long as the process does.
  await new Promise<void>(() => {});
}
