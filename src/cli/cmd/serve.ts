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
import { AGENT_MODELS, validateAgentModelPairs } from "../../core/agent-models.ts";
import { spawnForgeCli } from "../../core/cli-spawn.ts";
import { syncJobState } from "../../core/db/writes.ts";
import type { GhTarget } from "../../core/gh.ts";
import { fetchPrs, type GhFetchOpts, type GhPr } from "../../core/gh-pr.ts";
import { buildPlanHistory } from "../../core/history.ts";
import { isTmuxSessionAlive, killTmuxSession } from "../../core/launch.ts";
import {
  abortInFlight,
  BadCwdError,
  createDraft as createPlanDraft,
  deleteDraft as deletePlanDraft,
  isValidDraftId,
  loadHistory as loadPlanHistory,
  loadSkillPrompt,
  promoteDraft as promotePlanDraft,
  reapStalePlanChats,
  runChatTurn,
  type ScopeRef,
  wipeHistory as wipePlanHistory,
} from "../../core/plan-chat.ts";
import { detectRepo } from "../../core/repo.ts";
import type {
  CritiqueMeta,
  ForgeStore,
  LaunchTarget,
  Plan,
  PlanStatus,
  ReasoningEffort,
  RepoConfig,
} from "../../core/store.ts";
import { CliError } from "../output.ts";
import { doCritique } from "./critique.ts";
import { doLaunch } from "./launch.ts";
import { saveSpec } from "./spec.ts";

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

interface PlanView {
  id: string;
  title: string;
  status: PlanStatus;
  section: WorkbenchSection;
  statLabel: string;
  statClass: WorkbenchSection;
  kind?: "critique-ready" | "failed";
  branch: string;
  agent: string | null;
  agentLabel: string | null;
  repo: string;
  repoRoot: string;
  repoReachable: boolean;
  repoHasGit: boolean;
  repoStale: boolean;
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
  lastImproveError: { mode: string; error: string; at: string } | null;
  provenance: { specVersion: number; priorRuns: number; lastRunState: string | null } | null;
}

interface RepoView {
  name: string;
  root: string;
  branch: string | null;
  planCount: number;
  registered: boolean;
  current: boolean;
  reachable: boolean;
  hasGit: boolean;
  stale: boolean;
}

type PrFetcher = (opts: GhFetchOpts) => Promise<{ prs: GhPr[]; me: string }>;

const CONFIG_STRING_KEYS = new Set([
  "ghUser",
  "ghHost",
  "jiraProject",
  "jiraType",
  "defaultModel",
  "critiqueModelA",
  "critiqueModelB",
  "critiqueModelSynth",
  "reviewerModel",
  "fixerModel",
  "improverModel",
]);
const CONFIG_AGENT_KEYS = new Set([
  "defaultAgent",
  "critiqueAgentA",
  "critiqueAgentB",
  "critiqueAgentSynth",
  "reviewerAgent",
  "fixerAgent",
  "improverAgent",
]);
const CONFIG_EFFORT_KEYS = new Set([
  "critiqueReasoningA",
  "critiqueReasoningB",
  "critiqueReasoningSynth",
  "reviewerReasoningEffort",
  "fixerReasoningEffort",
  "improverReasoning",
]);
const CONFIG_BOOLEAN_KEYS = new Set(["autoFix", "autoImprove"]);
const CONFIG_NUMBER_KEYS = new Set(["autoFixRounds"]);
const VALID_AGENTS: LaunchTarget[] = ["claude", "codex", "opencode", "gemini"];
const VALID_EFFORTS: ReasoningEffort[] = ["low", "medium", "high", "xhigh"];

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
  task: Plan,
  store: ForgeStore,
): {
  section: WorkbenchSection;
  statLabel: string;
  statClass: WorkbenchSection;
  kind?: "critique-ready" | "failed";
  error: string | null;
  critique: PlanView["critique"];
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
      return { section: "done", statLabel: "PR opened", statClass: "done", error: null, critique };
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

function failureMessage(task: Plan, store: ForgeStore): string | null {
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

function repoDiskInfo(repoRoot: string): { reachable: boolean; hasGit: boolean; branch: string | null } {
  if (!repoRoot || !path.isAbsolute(repoRoot) || !fs.existsSync(repoRoot)) {
    return { reachable: false, hasGit: false, branch: null };
  }
  const detected = detectRepo(repoRoot);
  return { reachable: true, hasGit: !!detected, branch: detected ? specBranchInDisk(detected.root) : null };
}

function ghTargetForRepo(store: ForgeStore, repoRoot: string): GhTarget | undefined {
  const cfg = store.getRepoConfig(repoRoot);
  if (!cfg.ghUser && !cfg.ghHost) return undefined;
  return { user: cfg.ghUser, host: cfg.ghHost };
}

function resolveConfigRepo(repos: RepoView[], repoName: string | undefined): RepoView | null {
  if (repoName) {
    const byRoot = repos.find((r) => r.root === repoName);
    if (byRoot) return byRoot;
    return repos.find((r) => r.name === repoName && !r.stale) ?? repos.find((r) => r.name === repoName) ?? null;
  }
  return repos.find((r) => r.current) ?? repos.find((r) => !r.stale) ?? repos[0] ?? null;
}

function validateConfigPatch(
  input: unknown,
  current: Partial<RepoConfig> = {},
): { ok: true; patch: Partial<RepoConfig> } | { ok: false; error: Response } {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: jsonErr(400, "BAD_REQUEST", "`config` must be an object.") };
  }
  const patch: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(input)) {
    if (
      !CONFIG_STRING_KEYS.has(key) &&
      !CONFIG_AGENT_KEYS.has(key) &&
      !CONFIG_EFFORT_KEYS.has(key) &&
      !CONFIG_BOOLEAN_KEYS.has(key) &&
      !CONFIG_NUMBER_KEYS.has(key)
    ) {
      return { ok: false, error: jsonErr(400, "BAD_CONFIG_KEY", `Unsupported config key: ${key}`) };
    }
    if (raw === null || raw === "") {
      patch[key] = undefined;
      continue;
    }
    if (CONFIG_STRING_KEYS.has(key)) {
      if (typeof raw !== "string") return { ok: false, error: jsonErr(400, "BAD_VALUE", `${key} must be a string.`) };
      patch[key] = raw;
    } else if (CONFIG_AGENT_KEYS.has(key)) {
      if (typeof raw !== "string" || !VALID_AGENTS.includes(raw as LaunchTarget)) {
        return { ok: false, error: jsonErr(400, "BAD_VALUE", `${key} must be one of: ${VALID_AGENTS.join(", ")}.`) };
      }
      patch[key] = raw;
    } else if (CONFIG_EFFORT_KEYS.has(key)) {
      if (typeof raw !== "string" || !VALID_EFFORTS.includes(raw as ReasoningEffort)) {
        return { ok: false, error: jsonErr(400, "BAD_VALUE", `${key} must be one of: ${VALID_EFFORTS.join(", ")}.`) };
      }
      patch[key] = raw;
    } else if (CONFIG_BOOLEAN_KEYS.has(key)) {
      if (typeof raw !== "boolean") return { ok: false, error: jsonErr(400, "BAD_VALUE", `${key} must be boolean.`) };
      patch[key] = raw;
    } else if (CONFIG_NUMBER_KEYS.has(key)) {
      if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 1) {
        return { ok: false, error: jsonErr(400, "BAD_VALUE", `${key} must be a positive integer.`) };
      }
      patch[key] = raw;
    }
  }
  // Validate agent/model pairs — reject orphans like {improverModel: "gpt-5.5"}
  // when the matching agent is claude. Falls back to DEFAULT_FALLBACK_AGENT
  // when no agent is pinned.
  const pairErrors = validateAgentModelPairs(patch, current as Record<string, unknown>);
  if (pairErrors.length > 0) {
    const e = pairErrors[0];
    return {
      ok: false,
      error: jsonErr(
        400,
        "MODEL_NOT_IN_AGENT",
        `${e.modelKey} "${e.model}" is not a known model for agent "${e.agent}" (resolved via ${e.agentKey}). Allowed: ${e.allowed.join(", ")}. Use the Custom… escape hatch or set ${e.agentKey} to match.`,
      ),
    };
  }

  return { ok: true, patch: patch as Partial<RepoConfig> };
}

function viewTask(task: Plan, store: ForgeStore): PlanView {
  const info = statusInfo(task, store);
  const ageRef = task.launchedAt ?? task.createdAt;
  const age = timeAgo(ageRef);
  const spec = store.getSpec(task.id);
  const blurb = spec ? blurbFromSpec(spec) : null;
  const repoInfo = repoDiskInfo(task.repoRoot);
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
    repoReachable: repoInfo.reachable,
    repoHasGit: repoInfo.hasGit,
    repoStale: !repoInfo.reachable || !repoInfo.hasGit,
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
    lastImproveError: task.lastImproveError,
    provenance: planProvenance(task, store),
  };
}

/**
 * SQLite-backed enrichment for the "ready" section so the operator can see
 * "v2 spec, launched 2× — last attempt: failed" at a glance, without opening
 * the Runs tab. Returns null for plans with no DB row (legacy data) or
 * mid-flight states — those have other context already on the row.
 */
function planProvenance(task: Plan, store: ForgeStore): PlanView["provenance"] {
  try {
    const row = store.db.db
      .prepare(
        `SELECT
            (SELECT MAX(version_number) FROM plan_versions WHERE plan_id = p.id) AS spec_version,
            (SELECT COUNT(*) FROM jobs j JOIN tasks t ON j.task_id = t.id WHERE t.plan_id = p.id) AS prior_runs,
            (SELECT j.state FROM jobs j JOIN tasks t ON j.task_id = t.id
              WHERE t.plan_id = p.id ORDER BY j.run_number DESC LIMIT 1) AS last_run_state
         FROM plans p WHERE p.id = ?`,
      )
      .get(task.id) as { spec_version: number | null; prior_runs: number; last_run_state: string | null } | undefined;
    if (!row) return null;
    return {
      specVersion: row.spec_version ?? task.specVersion ?? 1,
      priorRuns: row.prior_runs ?? 0,
      lastRunState: row.last_run_state,
    };
  } catch {
    // DB miss or transient error — fall back to JSON-only data on the row.
    return null;
  }
}

function buildRepoViews(store: ForgeStore, currentRepo: { name: string; root: string } | null): RepoView[] {
  const byRoot = new Map<string, RepoView>();

  const ensure = (input: {
    name: string;
    root: string;
    planCount?: number;
    registered?: boolean;
    current?: boolean;
  }) => {
    const info = repoDiskInfo(input.root);
    const existing = byRoot.get(input.root);
    const next: RepoView = {
      name: input.name,
      root: input.root,
      branch: info.branch,
      planCount: (existing?.planCount ?? 0) + (input.planCount ?? 0),
      registered: (existing?.registered ?? false) || input.registered === true,
      current: (existing?.current ?? false) || input.current === true,
      reachable: info.reachable,
      hasGit: info.hasGit,
      stale: !info.reachable || !info.hasGit,
    };
    if (existing && (existing.current || existing.registered) && !input.current) next.name = existing.name;
    byRoot.set(input.root, next);
  };

  if (currentRepo) ensure({ ...currentRepo, registered: true, current: true });
  for (const repo of store.getWorkbenchRepos()) ensure({ name: repo.name, root: repo.root, registered: true });

  const counts = new Map<string, { name: string; root: string; count: number }>();
  for (const t of store.getPlans()) {
    const entry = counts.get(t.repoRoot) ?? { name: t.repoName, root: t.repoRoot, count: 0 };
    entry.count += 1;
    counts.set(t.repoRoot, entry);
  }
  for (const repo of counts.values()) ensure({ name: repo.name, root: repo.root, planCount: repo.count });

  return Array.from(byRoot.values()).sort((a, b) => {
    if (a.current !== b.current) return a.current ? -1 : 1;
    if (a.stale !== b.stale) return a.stale ? 1 : -1;
    return b.planCount - a.planCount || a.name.localeCompare(b.name) || a.root.localeCompare(b.root);
  });
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
  currentRepo: { name: string; root: string } | null;
  prFetcher: PrFetcher;
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

  // GET /api/workbench/context
  if (pathname === "/api/workbench/context") {
    return jsonOk({
      currentRepo: ctx.currentRepo,
      registeredRepos: store.getWorkbenchRepos(),
      forgeDir: store.forgeDir,
    });
  }

  // GET /api/repos
  if (pathname === "/api/repos") {
    return jsonOk({ repos: buildRepoViews(store, ctx.currentRepo) });
  }

  // GET /api/agents/models
  // Returns the registry the settings UI uses to populate per-agent
  // model dropdowns and that validation uses to reject orphan pairs.
  if (pathname === "/api/agents/models") {
    return jsonOk({ models: AGENT_MODELS });
  }

  // GET /api/config?repo=<name-or-root>
  if (pathname === "/api/config") {
    const repos = buildRepoViews(store, ctx.currentRepo);
    const target = resolveConfigRepo(repos, url.searchParams.get("repo") || undefined);
    if (!target) return jsonErr(404, "NO_REPO", "No repo is available for settings.");
    return jsonOk({ repo: target, config: store.getRepoConfig(target.root) });
  }

  // GET /api/plans?repo=<name>&section=<...>
  if (pathname === "/api/plans") {
    const repo = url.searchParams.get("repo") || undefined;
    const section = url.searchParams.get("section") || undefined;
    let tasks = store.getPlans();
    if (repo) tasks = tasks.filter((t) => t.repoName === repo || t.repoRoot === repo);
    // Sync any running tasks so the UI sees fresh statuses on every poll.
    for (const t of tasks) {
      if (
        t.status === "running" ||
        t.status === "quality_check" ||
        t.status === "creating_pr" ||
        t.status === "fixing"
      ) {
        store.syncPlanStatus(t);
      }
    }
    // Re-read after the sync to pick up any status changes.
    let synced = store.getPlans();
    if (repo) synced = synced.filter((t) => t.repoName === repo || t.repoRoot === repo);
    let views = synced.map((t) => viewTask(t, store));
    if (section) views = views.filter((v) => v.section === section);
    return jsonOk({ plans: views });
  }

  // GET /api/plans/:id
  // GET /api/plans/:id/spec
  // GET /api/plans/:id/log    (SSE)
  // GET /api/plans/:id/critique
  // GET /api/plans/:id/critiques  (list of all attempts for visibility)
  // GET /api/plans/:id/history    (unified timeline — Phase 4)
  // GET /api/plans/:id/jobs       (every prior launch — Phase 4)
  const taskMatch = pathname.match(/^\/api\/plans\/([^/]+)(?:\/(spec|log|critique|critiques|history|jobs))?$/);
  if (taskMatch) {
    const id = decodeURIComponent(taskMatch[1]);
    const sub = taskMatch[2];
    const task = store.getPlan(id);
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
      return jsonOk({ planId: id, body: stripped });
    }

    if (sub === "critiques") {
      // Surface every attempt for this task so the operator can see
      // history and what's currently in flight, not just the latest.
      const ids = store.listCritiques(id);
      const attempts = ids
        .map((critiqueId) => {
          const meta = store.readCritiqueMeta(id, critiqueId);
          if (!meta) return null;
          return {
            id: critiqueId,
            status: meta.status,
            startedAt: meta.startedAt,
            completedAt: meta.completedAt,
            viewedAt: meta.viewedAt,
            criticA: meta.criticA,
            criticB: meta.criticB,
            synthesizer: meta.synthesizer,
          };
        })
        .filter((a): a is NonNullable<typeof a> => a !== null);
      return jsonOk({ planId: id, attempts });
    }

    if (sub === "critique") {
      const critiqueId = url.searchParams.get("critiqueId") || store.getLatestCritique(id);
      if (!critiqueId) return jsonOk({ planId: id, critique: null });
      const meta = store.readCritiqueMeta(id, critiqueId);
      if (!meta) return jsonOk({ planId: id, critique: null });
      const dir = store.getCritiqueDir(id, critiqueId);
      const recPath = path.join(dir, "recommendations.md");
      const recommendations = fs.existsSync(recPath) ? fs.readFileSync(recPath, "utf-8") : null;
      const critA = path.join(dir, "critic-a.md");
      const critB = path.join(dir, "critic-b.md");
      const synth = path.join(dir, "synth.md");
      return jsonOk({
        planId: id,
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

    if (sub === "history") {
      const events = buildPlanHistory(store.db.db, id);
      return jsonOk({ planId: id, events });
    }

    if (sub === "jobs") {
      const jobs = listJobsForPlan(store, id);
      return jsonOk({ planId: id, jobs });
    }
  }

  // GET /api/jobs/:id — single-job detail (Phase 4).
  const jobMatch = pathname.match(/^\/api\/jobs\/([^/]+)$/);
  if (jobMatch) {
    const jobId = decodeURIComponent(jobMatch[1]);
    const job = findJobById(store, jobId);
    if (!job) return jsonErr(404, "UNKNOWN_JOB", `No job with id "${jobId}".`);
    const artifacts = listArtifactsForJob(store, jobId);
    return jsonOk({ job, artifacts });
  }

  // GET /api/sessions/:id/events?after=<rowid>&limit=<n>
  // ADR-0019 escape-hatch — primary UI is jobs/history, this is for debug
  // drill-down. Paged by rowid so large session histories stay cheap.
  const sessionEventsMatch = pathname.match(/^\/api\/sessions\/([^/]+)\/events$/);
  if (sessionEventsMatch) {
    const sessionId = decodeURIComponent(sessionEventsMatch[1]);
    const session = store.db.db
      .prepare("SELECT id, purpose, state, started_at, finished_at FROM sessions WHERE id = ?")
      .get(sessionId);
    if (!session) return jsonErr(404, "UNKNOWN_SESSION", `No session with id "${sessionId}".`);
    const after = Number.parseInt(url.searchParams.get("after") ?? "0", 10) || 0;
    const limit = Math.max(1, Math.min(1000, Number.parseInt(url.searchParams.get("limit") ?? "200", 10) || 200));
    const events = store.db.db
      .prepare(
        `SELECT id, sequence, timestamp, kind, payload
         FROM session_events
         WHERE session_id = ? AND id > ?
         ORDER BY id ASC
         LIMIT ?`,
      )
      .all(sessionId, after, limit);
    return jsonOk({ sessionId, session, events });
  }

  // ── Planner chat — GETs ──────────────────────────────────────────────
  // GET /api/specs/:id/plan-history → { messages: [...] }
  const specPlanHistoryMatch = pathname.match(/^\/api\/specs\/([^/]+)\/plan-history$/);
  if (specPlanHistoryMatch) {
    const planId = decodeURIComponent(specPlanHistoryMatch[1]);
    const task = store.getPlan(planId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${planId}".`);
    const history = loadPlanHistory(store.forgeDir, { kind: "spec", id: planId });
    return jsonOk({ messages: history.messages });
  }

  // GET /api/plan-chat/draft/:draftId/history → { messages: [...] }
  const draftHistoryMatch = pathname.match(/^\/api\/plan-chat\/draft\/([^/]+)\/history$/);
  if (draftHistoryMatch) {
    const draftId = decodeURIComponent(draftHistoryMatch[1]);
    if (!isValidDraftId(draftId)) return jsonErr(400, "BAD_DRAFT_ID", `Invalid draft id "${draftId}".`);
    const history = loadPlanHistory(store.forgeDir, { kind: "draft", id: draftId });
    return jsonOk({ messages: history.messages });
  }

  // GET /api/prs?repo=<name>
  if (pathname === "/api/prs") {
    const repoName = url.searchParams.get("repo") || undefined;
    const repos = buildRepoViews(store, ctx.currentRepo);
    const target = resolvePrRepo(repos, repoName);
    if (!target) return jsonOk({ prs: [], me: "", repo: null, repoRoot: null });
    const result = await ctx.prFetcher({ cwd: target.root, ghTarget: ghTargetForRepo(store, target.root) });
    return jsonOk({ prs: result.prs, me: result.me, repo: target.name, repoRoot: target.root });
  }

  return jsonErr(404, "NOT_FOUND", `No such endpoint: ${pathname}`);
}

function resolvePrRepo(repos: RepoView[], repoName: string | undefined): RepoView | null {
  const reachable = repos.filter((r) => !r.stale);
  if (!repoName) return reachable[0] ?? repos[0] ?? null;

  const exactRoot = repos.find((r) => r.root === repoName);
  if (exactRoot) return exactRoot.stale ? null : exactRoot;

  const byName = repos.filter((r) => r.name === repoName);
  const reachableByName = byName.find((r) => !r.stale);
  if (reachableByName) return reachableByName;
  return null;
}

// ─── Job / artifact lookups (Phase 4) ────────────────────────────────────────

function listJobsForPlan(store: ForgeStore, planId: string): unknown[] {
  return store.db.db
    .prepare(
      `SELECT j.id, j.run_number, j.run_kind, j.state, j.branch_name, j.worktree_path,
              j.started_at, j.finished_at, j.exit_code, j.summary, j.blocker_summary, j.session_id
       FROM jobs j JOIN tasks t ON j.task_id = t.id
       WHERE t.plan_id = ?
       ORDER BY j.run_number DESC`,
    )
    .all(planId);
}

function findJobById(store: ForgeStore, jobId: string): unknown {
  return store.db.db
    .prepare(
      `SELECT id, task_id, run_number, run_kind, state, branch_name, worktree_path,
              started_at, finished_at, exit_code, summary, blocker_summary, session_id
       FROM jobs WHERE id = ?`,
    )
    .get(jobId);
}

function listArtifactsForJob(store: ForgeStore, jobId: string): unknown[] {
  return store.db.db
    .prepare(
      `SELECT id, kind, path, content, content_blob_id, metadata, created_at
       FROM artifacts WHERE job_id = ?
       ORDER BY created_at ASC`,
    )
    .all(jobId);
}

// ─── POST routes ─────────────────────────────────────────────────────────────

const ACTION_TASK_PATH = /^\/api\/plans\/([^/]+)\/(launch|critique|improve|kill|resume)$/;
const SPEC_PLAN_CHAT_PATH = /^\/api\/specs\/([^/]+)\/plan-chat$/;
const SPEC_PLAN_CHAT_ABORT_PATH = /^\/api\/specs\/([^/]+)\/plan-chat\/abort$/;
const SPEC_PLAN_HISTORY_PATH = /^\/api\/specs\/([^/]+)\/plan-history$/;
const DRAFT_MSG_PATH = /^\/api\/plan-chat\/draft\/([^/]+)\/message$/;
const DRAFT_ABORT_PATH = /^\/api\/plan-chat\/draft\/([^/]+)\/abort$/;
const DRAFT_PROMOTE_PATH = /^\/api\/plan-chat\/draft\/([^/]+)\/promote$/;
const DRAFT_ROOT_PATH = /^\/api\/plan-chat\/draft\/([^/]+)$/;

function allowsPost(pathname: string): boolean {
  if (pathname === "/api/specs") return true;
  if (pathname === "/api/repos") return true;
  if (pathname === "/api/config") return true;
  if (pathname === "/api/plan-chat/draft") return true;
  if (
    SPEC_PLAN_CHAT_PATH.test(pathname) ||
    SPEC_PLAN_CHAT_ABORT_PATH.test(pathname) ||
    DRAFT_MSG_PATH.test(pathname) ||
    DRAFT_ABORT_PATH.test(pathname) ||
    DRAFT_PROMOTE_PATH.test(pathname)
  )
    return true;
  return ACTION_TASK_PATH.test(pathname);
}

function allowsDelete(pathname: string): boolean {
  if (SPEC_PLAN_HISTORY_PATH.test(pathname)) return true;
  if (DRAFT_ROOT_PATH.test(pathname)) return true;
  return false;
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

const VALID_ACTION_AGENTS = new Set(["claude", "codex", "opencode", "gemini"]);

/** Returns: { ok: true, value } | { ok: false, error: Response } | { ok: true, value: undefined } when absent. */
function optAgent(
  body: Record<string, unknown>,
  key: string,
): { ok: true; value: Plan["agent"] } | { ok: false; error: Response } {
  const v = body[key];
  if (v === undefined || v === null || v === "") return { ok: true, value: null };
  if (typeof v !== "string" || !VALID_ACTION_AGENTS.has(v)) {
    return {
      ok: false,
      error: jsonErr(400, "BAD_REQUEST", `\`${key}\` must be one of: ${Array.from(VALID_ACTION_AGENTS).join(", ")}.`),
    };
  }
  return { ok: true, value: v as Plan["agent"] };
}

// Statuses where a `kill` is meaningful — only running-family tasks. Killing
// a `done`/`failed`/`draft` task would silently rewrite the completion record.
const KILLABLE_STATUSES: Set<PlanStatus> = new Set(["running", "quality_check", "creating_pr", "fixing"]);

async function handleApiPost(req: Request, url: URL, ctx: RouteCtx): Promise<Response> {
  try {
    return await dispatchApiPost(req, url, ctx);
  } catch (e) {
    // Last-resort net so bugs don't return Bun's default 500 page. CliErrors
    // are caught at the per-action sites for accurate status mapping; this
    // is for unexpected runtime errors (I/O, type errors, etc.).
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`forge serve: unhandled POST error: ${msg}\n`);
    return jsonErr(500, "INTERNAL", `Unhandled server error: ${msg}`);
  }
}

function getSpecBodyStripped(store: ForgeStore, planId: string): string | null {
  const raw = store.getSpec(planId);
  if (raw === null) return null;
  return stripFrontmatter(raw);
}

function planChatSseResponse(opts: {
  store: ForgeStore;
  scope: ScopeRef;
  message: string;
  model?: string;
  specBody: string | null;
  cwd?: string;
}): Response {
  let turn: { stream: ReadableStream<Uint8Array>; abort: () => void };
  try {
    turn = runChatTurn({
      forgeDir: opts.store.forgeDir,
      scope: opts.scope,
      message: opts.message,
      model: opts.model,
      specBody: opts.specBody,
      cwd: opts.cwd,
    });
  } catch (e) {
    // BAD_CWD is the only typed failure runChatTurn throws synchronously.
    // Convert it to a clean single-frame SSE `error` stream so the
    // browser sees the same shape as a runtime stream failure rather
    // than a JSON 400 mid-`fetch`.
    if (e instanceof BadCwdError) {
      const payload = `event: error\ndata: ${JSON.stringify({ message: e.message })}\n\n`;
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(payload));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache, no-transform",
          "x-accel-buffering": "no",
          connection: "keep-alive",
        },
      });
    }
    throw e;
  }
  // Wrap so cancel() (client disconnect) tears down the spawned child.
  // ReadableStream from runChatTurn already wires cancel → child.kill,
  // but the SSE convention here adds the `x-accel-buffering: no` header.
  return new Response(turn.stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
      connection: "keep-alive",
    },
  });
}

function resolveSpecModel(store: ForgeStore, planId: string, override: string | undefined): string | undefined {
  if (override) return override;
  const task = store.getPlan(planId);
  if (!task) return undefined;
  const cfg = store.getRepoConfig(task.repoRoot);
  return cfg.defaultModel ?? task.model ?? undefined;
}

async function handleApiDelete(url: URL, ctx: RouteCtx): Promise<Response> {
  const { pathname } = url;
  const { store } = ctx;

  const specHistoryMatch = pathname.match(SPEC_PLAN_HISTORY_PATH);
  if (specHistoryMatch) {
    const planId = decodeURIComponent(specHistoryMatch[1]);
    const task = store.getPlan(planId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${planId}".`);
    wipePlanHistory(store.forgeDir, { kind: "spec", id: planId });
    return jsonOk({ ok: true });
  }

  const draftRootMatch = pathname.match(DRAFT_ROOT_PATH);
  if (draftRootMatch) {
    const draftId = decodeURIComponent(draftRootMatch[1]);
    if (!isValidDraftId(draftId)) return jsonErr(400, "BAD_DRAFT_ID", `Invalid draft id "${draftId}".`);
    abortInFlight({ kind: "draft", id: draftId });
    deletePlanDraft(store.forgeDir, draftId);
    return jsonOk({ ok: true });
  }

  return jsonErr(404, "NOT_FOUND", `No such endpoint: ${pathname}`);
}

async function dispatchApiPost(req: Request, url: URL, ctx: RouteCtx): Promise<Response> {
  const { pathname } = url;
  const { store } = ctx;

  // ── Plan-chat dispatch (some routes are SSE, not JSON-bodied) ──────────
  // POST /api/specs/:id/plan-chat/abort
  const specAbortMatch = pathname.match(SPEC_PLAN_CHAT_ABORT_PATH);
  if (specAbortMatch) {
    const planId = decodeURIComponent(specAbortMatch[1]);
    const task = store.getPlan(planId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${planId}".`);
    const killed = abortInFlight({ kind: "spec", id: planId });
    return jsonOk({ aborted: killed, planId });
  }

  // POST /api/plan-chat/draft/:draftId/abort
  const draftAbortMatch = pathname.match(DRAFT_ABORT_PATH);
  if (draftAbortMatch) {
    const draftId = decodeURIComponent(draftAbortMatch[1]);
    if (!isValidDraftId(draftId)) return jsonErr(400, "BAD_DRAFT_ID", `Invalid draft id "${draftId}".`);
    const killed = abortInFlight({ kind: "draft", id: draftId });
    return jsonOk({ aborted: killed, draftId });
  }

  // POST /api/plan-chat/draft (mint a new draftId)
  if (pathname === "/api/plan-chat/draft") {
    const result = createPlanDraft(store.forgeDir);
    return jsonOk(result);
  }

  // POST /api/specs/:id/plan-chat → SSE
  const specChatMatch = pathname.match(SPEC_PLAN_CHAT_PATH);
  if (specChatMatch) {
    const planId = decodeURIComponent(specChatMatch[1]);
    const task = store.getPlan(planId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${planId}".`);
    const parsed = await readJsonBody(req);
    if ("error" in parsed) return parsed.error;
    const body = parsed.body;
    const message = reqString(body, "message");
    if (!message) return jsonErr(400, "BAD_REQUEST", "`message` is required.");
    const model = resolveSpecModel(store, planId, optString(body, "model"));
    const specBody = getSpecBodyStripped(store, planId);
    // Spec scope: server resolves the working directory from the task
    // record so the planner runs against the right repo regardless of
    // where `forge serve` was launched. Falls through to runChatTurn's
    // BAD_CWD validation if the task's repoRoot has been deleted.
    return planChatSseResponse({
      store,
      scope: { kind: "spec", id: planId },
      message,
      model,
      specBody,
      cwd: task.repoRoot,
    });
  }

  // POST /api/plan-chat/draft/:draftId/message → SSE
  const draftMsgMatch = pathname.match(DRAFT_MSG_PATH);
  if (draftMsgMatch) {
    const draftId = decodeURIComponent(draftMsgMatch[1]);
    if (!isValidDraftId(draftId)) return jsonErr(400, "BAD_DRAFT_ID", `Invalid draft id "${draftId}".`);
    // Drafts are filesystem-backed only; no DB row to validate against.
    // We still verify the draft folder exists so abort/promote stay sane.
    const draftRoot = path.join(store.forgeDir, "plan-drafts", draftId);
    if (!fs.existsSync(draftRoot)) {
      return jsonErr(404, "UNKNOWN_DRAFT", `No plan-chat draft "${draftId}".`);
    }
    const parsed = await readJsonBody(req);
    if ("error" in parsed) return parsed.error;
    const body = parsed.body;
    const message = reqString(body, "message");
    if (!message) return jsonErr(400, "BAD_REQUEST", "`message` is required.");
    const model = optString(body, "model");
    // Draft scope has no task record yet, so the frontend must tell us
    // which repo the planner should explore. When absent, we fall
    // through to process.cwd() (legacy behavior) — runChatTurn will
    // reject an explicit but invalid path with BAD_CWD.
    const cwd = optString(body, "repoRoot");
    return planChatSseResponse({
      store,
      scope: { kind: "draft", id: draftId },
      message,
      model,
      specBody: null,
      cwd,
    });
  }

  // POST /api/plan-chat/draft/:draftId/promote
  const draftPromoteMatch = pathname.match(DRAFT_PROMOTE_PATH);
  if (draftPromoteMatch) {
    const draftId = decodeURIComponent(draftPromoteMatch[1]);
    if (!isValidDraftId(draftId)) return jsonErr(400, "BAD_DRAFT_ID", `Invalid draft id "${draftId}".`);
    const parsed = await readJsonBody(req);
    if ("error" in parsed) return parsed.error;
    const body = parsed.body;
    const planId = reqString(body, "planId");
    if (!planId) return jsonErr(400, "BAD_REQUEST", "`planId` is required.");
    const task = store.getPlan(planId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${planId}".`);
    try {
      abortInFlight({ kind: "draft", id: draftId });
      promotePlanDraft(store.forgeDir, draftId, planId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return jsonErr(409, "PROMOTE_CONFLICT", msg);
    }
    return jsonOk({ ok: true, planId, draftId });
  }

  // ── JSON-bodied POSTs ──────────────────────────────────────────────
  const parsed = await readJsonBody(req);
  if ("error" in parsed) return parsed.error;
  const body = parsed.body;

  // POST /api/specs
  if (pathname === "/api/repos") {
    const repoRoot = reqString(body, "repoRoot");
    if (!repoRoot) return jsonErr(400, "BAD_REQUEST", "`repoRoot` is required.");
    if (!path.isAbsolute(repoRoot)) return jsonErr(400, "BAD_REQUEST", "`repoRoot` must be an absolute path.");
    const repo = detectRepo(repoRoot);
    if (!repo) return jsonErr(400, "NOT_A_REPO", `Not a git repository: ${repoRoot}`);
    const record = store.registerWorkbenchRepo({ root: repo.root, name: repo.name });
    return jsonOk({ repo: record });
  }

  if (pathname === "/api/config") {
    const repoRoot = reqString(body, "repoRoot");
    if (!repoRoot) return jsonErr(400, "BAD_REQUEST", "`repoRoot` is required.");
    if (!path.isAbsolute(repoRoot)) return jsonErr(400, "BAD_REQUEST", "`repoRoot` must be an absolute path.");
    const parsedPatch = validateConfigPatch(body.config, store.getRepoConfig(repoRoot));
    if (!parsedPatch.ok) return parsedPatch.error;
    store.setRepoConfig(repoRoot, parsedPatch.patch);
    return jsonOk({ repoRoot, config: store.getRepoConfig(repoRoot) });
  }

  // POST /api/specs
  if (pathname === "/api/specs") {
    const markdown = reqString(body, "markdown");
    const repoRoot = reqString(body, "repoRoot");
    if (!markdown) return jsonErr(400, "BAD_REQUEST", "`markdown` is required.");
    if (!repoRoot) return jsonErr(400, "BAD_REQUEST", "`repoRoot` is required.");
    if (!path.isAbsolute(repoRoot)) return jsonErr(400, "BAD_REQUEST", "`repoRoot` must be an absolute path.");
    const agentResult = optAgent(body, "agent");
    if (!agentResult.ok) return agentResult.error;
    const repo = detectRepo(repoRoot);
    if (!repo) return jsonErr(400, "NOT_A_REPO", `Not a git repository: ${repoRoot}`);
    try {
      const result = await saveSpec(
        {
          body: markdown,
          repoRoot: repo.root,
          repoName: repo.name,
          title: optString(body, "title"),
          agent: agentResult.value ?? undefined,
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
  const planId = decodeURIComponent(m[1]);
  const action = m[2];

  if (action === "resume") {
    return jsonErr(
      501,
      "NOT_IMPLEMENTED",
      "forge resume is not wired in this version.",
      "Re-launch from scratch with POST /api/plans/:id/launch.",
    );
  }

  if (action === "kill") {
    const task = store.getPlan(planId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${planId}".`);
    if (!KILLABLE_STATUSES.has(task.status)) {
      return jsonErr(
        409,
        "BAD_STATE",
        `Task ${planId} is in state "${task.status}" — only running tasks can be killed.`,
      );
    }
    if (!task.tmuxSession) {
      return jsonErr(400, "NO_TMUX_SESSION", `Task ${planId} has no tmux session — it hasn't been launched.`);
    }
    killTmuxSession(task.tmuxSession);
    // Locked merge: the runner's bash set_status writes meta concurrently,
    // so a naive read-spread-write would lose either field.
    store.mergeRunMeta(planId, { errorMessage: "Killed by user", status: "failed" });
    const killedAt = new Date().toISOString();
    store.upsertPlan({ ...task, status: "failed", completedAt: killedAt });
    // Sync the SQLite jobs row too. syncPlanStatus early-returns once a plan
    // is terminal, so without this the killed run stays `running` in DB
    // surfaces (`forge run ls`, Runs tab, history) indefinitely.
    try {
      syncJobState(
        store.db.db,
        { ...task, status: "failed" },
        { status: "failed", endedAt: killedAt, errorMessage: "Killed by user" },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`warn: syncJobState failed on kill for ${planId}: ${msg}\n`);
    }
    return jsonOk({ killed: true, planId });
  }

  if (action === "launch") {
    const agentResult = optAgent(body, "agent");
    if (!agentResult.ok) return agentResult.error;
    try {
      const result = await doLaunch(
        { planId, agent: agentResult.value ?? undefined, model: optString(body, "model") },
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
      const result = await doCritique({ planId }, store);
      return jsonOk(result);
    } catch (e) {
      if (e instanceof CliError) return fromCliError(e);
      throw e;
    }
  }

  if (action === "improve") {
    const task = store.getPlan(planId);
    if (!task) return jsonErr(404, "UNKNOWN_TASK", `No task with id "${planId}".`);
    if (task.status !== "draft") {
      return jsonErr(
        409,
        "BAD_STATE",
        `Task ${planId} is in state "${task.status}" — improve only runs on draft specs.`,
      );
    }
    // runImprover uses synchronous execSync to drive critic + synth + improver
    // agents, which would block the entire Bun event loop for 1–2 minutes
    // (every other request — health, polls, log SSE pumps — would queue
    // behind it). Spawn a detached child running the equivalent CLI so the
    // request returns immediately. The next 3s task poll picks up the
    // critique-meta status flip ("Improving" pill → "Ready" / "Failed").
    try {
      const child = spawnForgeCli(["spec", "improve", planId, "--json"], {
        cwd: task.repoRoot,
        env: process.env,
      });
      return jsonOk({ planId, queued: true, pid: child.pid });
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
  prFetcher?: PrFetcher;
}

/**
 * Boot the HTTP server. Exposed (as opposed to `run()`) so tests can
 * spin up a server, hit it, and call `stop()` instead of fork-spawning
 * a subprocess.
 */
/**
 * Boot-time sweep: any critique-meta in `running_critics`/`running_synth`
 * older than the threshold is almost certainly orphaned (the worker
 * process died — server crashed mid-improve, terminal closed during a
 * `forge spec save`, etc.). Mark it failed so the Workbench's
 * "Improving" pulse pill doesn't stick forever.
 *
 * We can't use isTmuxSessionAlive as a liveness check because the sync
 * improve path writes a tmuxSession in the meta but never actually
 * creates that tmux session — only the async path does.
 */
const STALE_IMPROVE_MS = 10 * 60_000;
function reapStaleCritiques(store: ForgeStore): number {
  const now = Date.now();
  let swept = 0;
  for (const { planId, critiqueId, meta } of store.getPendingCritiques()) {
    if (meta.status !== "running_critics" && meta.status !== "running_synth") continue;
    const startedMs = new Date(meta.startedAt).getTime();
    if (Number.isNaN(startedMs)) continue;
    if (now - startedMs < STALE_IMPROVE_MS) continue;
    store.writeCritiqueMeta(planId, critiqueId, {
      ...meta,
      status: "failed",
      completedAt: new Date().toISOString(),
    });
    swept++;
  }
  return swept;
}

export async function startServer(
  store: ForgeStore,
  opts: ServeOptions = {},
): Promise<{ port: number; stop: () => void }> {
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

  const swept = reapStaleCritiques(store);
  if (swept > 0) {
    process.stderr.write(`forge serve: reaped ${swept} stale critique-meta record(s).\n`);
  }

  // Boot reaper for plan-chat subprocesses + stale prompt files.
  const sweptPlanChats = reapStalePlanChats(store.forgeDir);
  if (sweptPlanChats > 0) {
    process.stderr.write(`forge serve: reaped ${sweptPlanChats} stale plan-chat artifact(s).\n`);
  }

  // Warm the SKILL prompt cache so the first /plan-chat doesn't pay a
  // disk read on the SSE-spawn path. Best-effort; failure is logged but
  // non-fatal (the chat endpoint will still try at request time).
  try {
    loadSkillPrompt();
  } catch (e) {
    process.stderr.write(`forge serve: failed to preload planner SKILL.md: ${e instanceof Error ? e.message : e}\n`);
  }

  // Periodic plan-chat reaper — every 60s. Cheap (in-memory map walk +
  // shallow filesystem scan); guarantees stuck subprocesses are killed
  // within ~6 minutes of becoming stale.
  const planChatReaper = setInterval(() => {
    try {
      reapStalePlanChats(store.forgeDir);
    } catch (e) {
      process.stderr.write(`forge serve: plan-chat reaper error: ${e instanceof Error ? e.message : e}\n`);
    }
  }, 60_000);
  // Don't keep the event loop alive just for the reaper.
  if (typeof planChatReaper.unref === "function") planChatReaper.unref();

  const webDistDir = path.join(webDir, "dist");
  try {
    fs.rmSync(webDistDir, { recursive: true, force: true });
    fs.mkdirSync(webDistDir, { recursive: true });
    const result = await Bun.build({
      entrypoints: [path.join(webDir, "main.tsx")],
      outdir: webDistDir,
      target: "browser",
      format: "esm",
      minify: false,
      sourcemap: "inline",
      naming: "[name].js",
    });
    if (!result.success) {
      console.error("[forge serve] web bundle failed:", result.logs);
    }
  } catch (e) {
    console.error("[forge serve] web bundle threw:", e);
    // Phase 6: bundle failure leaves /dist/main.js missing; the page
    // will load with no JS and show a blank shell. Operator must fix
    // the build error and re-run.
  }

  const detectedCurrentRepo = detectRepo(process.cwd());
  const ctx: RouteCtx = {
    store,
    webDir,
    currentRepo: detectedCurrentRepo ? { name: detectedCurrentRepo.name, root: detectedCurrentRepo.root } : null,
    prFetcher: opts.prFetcher ?? fetchPrs,
  };

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
            "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        });
      }

      if (pathname.startsWith("/api/tasks")) {
        // Phase 3.5 — `/api/tasks/*` was renamed to `/api/plans/*`. Old
        // browser tabs and shell scripts can still hit the legacy path
        // for one release; 308 keeps the method + body intact across
        // POST/DELETE redirects (vs. 301 which downgrades to GET).
        const redirected = `/api/plans${pathname.slice("/api/tasks".length)}${url.search}`;
        return new Response(null, { status: 308, headers: { location: redirected } });
      }

      if (pathname.startsWith("/api/")) {
        if (req.method === "POST" && allowsPost(pathname)) {
          return handleApiPost(req, url, ctx);
        }
        if (req.method === "DELETE" && allowsDelete(pathname)) {
          return handleApiDelete(url, ctx);
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

  const { port, stop } = await startServer(store, { port: portRaw, host });
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
