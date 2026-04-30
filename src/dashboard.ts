/**
 * Forge Dashboard — mission control TUI component.
 *
 * Shows current-repo tasks prominently, other running tasks below,
 * and open PRs from gh. Keyboard-driven for all common actions.
 */

import { execSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { Key, matchesKey, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { isTmuxSessionAlive, killTmuxSession } from "./launch.js";
import type { RepoProfile } from "./repo.js";
import type { ForgeStore, Snapshot, TaskRecord, TaskStatus } from "./store.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GhPr {
  number: number;
  title: string;
  headRefName: string;
  baseRefName: string;
  url: string;
  isDraft: boolean;
  statusCheckRollup: string | null;
  reviewDecision: string | null;
  author: string;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commentsCount: number;
  reviewsCount: number;
  isMine: boolean;
}

interface Theme {
  fg: (color: string, text: string) => string;
  bold: (text: string) => string;
}
interface Tui {
  requestRender(): void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function runGh(args: string[], opts?: { timeoutMs?: number }): Promise<{ stdout: string; ok: boolean }> {
  const timeout = opts?.timeoutMs ?? 20000;
  return new Promise((resolve) => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeout);
    let stdout = "";
    let stderr = "";
    let settled = false;
    const settle = (result: { stdout: string; ok: boolean }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    let child: ReturnType<typeof spawn>;
    try {
      child = spawn("gh", args, {
        stdio: ["ignore", "pipe", "pipe"],
        signal: ac.signal,
      });
    } catch {
      settle({ stdout: "", ok: false });
      return;
    }

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", () => settle({ stdout: "", ok: false }));
    child.on("close", (code) => {
      void stderr; // captured for diagnostics, discarded on success
      settle({ stdout: stdout.trim(), ok: code === 0 });
    });
  });
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return `${Math.round(sec)}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  return `${Math.round(sec / 86400)}d ago`;
}

function padEnd(s: string, len: number): string {
  const w = visibleWidth(s);
  return w >= len ? truncateToWidth(s, len) : s + " ".repeat(len - w);
}

function sep(width: number, char = "─"): string {
  return char.repeat(width);
}

function fmtTokens(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1000000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

function statusIcon(theme: Theme, status: TaskStatus, tmuxSession: string | null): string {
  const alive = tmuxSession ? isTmuxSessionAlive(tmuxSession) : false;
  switch (status) {
    case "done":
      return theme.fg("success", "✓");
    case "failed":
    case "quality_failed":
      return theme.fg("error", "✗");
    case "running":
    case "quality_check":
    case "creating_pr":
      return alive ? theme.fg("warning", "⟳") : theme.fg("error", "✗");
    case "draft":
      return theme.fg("dim", "○");
    default:
      return theme.fg("dim", "·");
  }
}

function statusLabel(theme: Theme, status: TaskStatus, tmuxSession: string | null): string {
  const alive = tmuxSession ? isTmuxSessionAlive(tmuxSession) : false;
  if ((status === "running" || status === "quality_check" || status === "creating_pr") && !alive) {
    return theme.fg("error", "dead");
  }
  const map: Record<TaskStatus, [string, string]> = {
    draft: ["dim", "draft"],
    running: ["warning", "agent ⟳"],
    quality_check: ["warning", "quality ⟳"],
    creating_pr: ["accent", "PR ⟳"],
    done: ["success", "done"],
    failed: ["error", "failed"],
    quality_failed: ["warning", "quality ✗"],
  };
  const [color, label] = map[status] ?? ["dim", status];
  return theme.fg(color, label);
}

function ciCell(theme: Theme, status: string | null | undefined): string {
  switch (status) {
    case "SUCCESS":
      return theme.fg("success", "✓");
    case "FAILURE":
    case "ERROR":
      return theme.fg("error", "✗");
    case "PENDING":
      return theme.fg("warning", "⟳");
    default:
      return theme.fg("dim", "·");
  }
}

function reviewCell(theme: Theme, decision: string | null | undefined): string {
  switch (decision) {
    case "APPROVED":
      return theme.fg("success", "✓");
    case "CHANGES_REQUESTED":
      return theme.fg("error", "✗");
    case "REVIEW_REQUIRED":
      return theme.fg("warning", "·");
    default:
      return theme.fg("dim", "·");
  }
}

let cachedLogin: string | null = null;
async function currentLogin(): Promise<string> {
  if (cachedLogin !== null) return cachedLogin;
  const { stdout, ok } = await runGh(["api", "user", "--jq", ".login"]);
  cachedLogin = ok ? stdout : "";
  return cachedLogin;
}

async function fetchMinePrNumbers(): Promise<Set<number>> {
  // Use gh's own "@me" resolution so this works even when the local gh login
  // (e.g. an org-aliased account like "foo-org") differs from the PR author
  // login on the host (e.g. "foo"). Strict string equality on logins is
  // unreliable across SAML/enterprise account mappings.
  const { stdout, ok } = await runGh(["pr", "list", "--author", "@me", "--json", "number", "--limit", "100"]);
  if (!ok || !stdout) return new Set();
  try {
    const arr = JSON.parse(stdout) as Array<{ number: number }>;
    return new Set(arr.map((p) => p.number));
  } catch {
    return new Set();
  }
}

async function fetchPrs(_repoRoot: string): Promise<GhPr[]> {
  const [me, mineNumbers] = await Promise.all([currentLogin(), fetchMinePrNumbers()]);
  // Use gh's built-in `--jq` to project the (potentially huge) `comments`
  // and `reviews` arrays down to scalar counts on gh's side. Without this,
  // the full review/comment bodies blow past execSync's default maxBuffer
  // and the call silently returns nothing.
  const jq =
    "[.[] | {" +
    "number,title,headRefName,baseRefName,url,isDraft," +
    "statusCheckRollup,reviewDecision,author,updatedAt," +
    "additions,deletions,changedFiles," +
    "commentsCount:(.comments|length),reviewsCount:(.reviews|length)" +
    "}]";
  const { stdout, ok } = await runGh([
    "pr",
    "list",
    "--json",
    "number,title,headRefName,baseRefName,url,isDraft,statusCheckRollup,reviewDecision,author,updatedAt,additions,deletions,changedFiles,comments,reviews",
    "--jq",
    jq,
    "--limit",
    "30",
  ]);
  if (!ok || !stdout) return [];
  try {
    const prs = JSON.parse(stdout) as Array<{
      number: number;
      title: string;
      headRefName: string;
      baseRefName: string;
      url: string;
      isDraft: boolean;
      statusCheckRollup: Array<{ state?: string; conclusion?: string }>;
      reviewDecision: string | null;
      author: { login?: string } | null;
      updatedAt: string;
      additions: number;
      deletions: number;
      changedFiles: number;
      commentsCount: number;
      reviewsCount: number;
    }>;
    return prs.map((pr) => {
      const checks = pr.statusCheckRollup ?? [];
      const hasFailure = checks.some((c) => c.state === "FAILURE" || c.conclusion === "FAILURE");
      const allSuccess = checks.length > 0 && checks.every((c) => c.state === "SUCCESS" || c.conclusion === "SUCCESS");
      const hasPending = checks.some((c) => c.state === "PENDING" || c.conclusion === null);
      const ciStatus = hasFailure ? "FAILURE" : allSuccess ? "SUCCESS" : hasPending ? "PENDING" : null;
      const author = pr.author?.login ?? "";
      return {
        number: pr.number,
        title: pr.title,
        headRefName: pr.headRefName,
        baseRefName: pr.baseRefName,
        url: pr.url,
        isDraft: pr.isDraft,
        statusCheckRollup: ciStatus,
        reviewDecision: pr.reviewDecision,
        author,
        updatedAt: pr.updatedAt,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changedFiles,
        commentsCount: pr.commentsCount ?? 0,
        reviewsCount: pr.reviewsCount ?? 0,
        isMine: mineNumbers.has(pr.number) || (me !== "" && author === me),
      };
    });
  } catch {
    return [];
  }
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// ─── Dashboard Component ──────────────────────────────────────────────────────

export type DashboardAction =
  | { type: "new_spec" }
  | { type: "edit_spec"; task: TaskRecord }
  | { type: "view_spec"; task: TaskRecord }
  | { type: "launch"; task: TaskRecord }
  | { type: "attach"; task: TaskRecord }
  | { type: "kill"; task: TaskRecord }
  | { type: "run_critique"; task: TaskRecord }
  | { type: "view_critique"; task: TaskRecord; critiqueId: string }
  | { type: "discuss_critique"; task: TaskRecord; critiqueId: string }
  | { type: "settings" }
  | { type: "close" };

export class ForgeDashboard {
  private tasks: TaskRecord[] = [];
  private otherTasks: TaskRecord[] = [];
  private prs: GhPr[] = [];
  private selectedIdx = 0;
  private prMode = false;
  private prSelectedIdx = 0;
  private prFilterMine = false;
  private prDetailsOpen = false;
  private loading = false;
  private lastRefresh: Date | null = null;
  private cached?: string[];
  private cachedWidth?: number;
  private refreshTimer?: ReturnType<typeof setInterval>;
  private spinnerFrame = 0;
  private spinnerTimer?: ReturnType<typeof setInterval>;
  private refreshInFlight = false;

  onAction: (action: DashboardAction) => void = () => {};
  onClose: () => void = () => {};

  constructor(
    private readonly theme: Theme,
    private readonly tui: Tui,
    private readonly store: ForgeStore,
    private readonly repo: RepoProfile,
  ) {}

  // ── Public API ──────────────────────────────────────────────────────────────

  start(): void {
    void this.refresh();
    // Poll every 8s to sync running task statuses
    this.refreshTimer = setInterval(() => this.syncAndRender(), 8000);
  }

  stop(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.stopSpinner();
  }

  handleInput(data: string): void {
    if (this.prMode) {
      this.handlePrInput(data);
      return;
    }
    const allTasks = [...this.tasks, ...this.otherTasks];

    if (matchesKey(data, "j") || matchesKey(data, Key.down)) {
      this.selectedIdx = Math.min(this.selectedIdx + 1, allTasks.length - 1);
      this.invalidate();
      this.tui.requestRender();
    } else if (matchesKey(data, "k") || matchesKey(data, Key.up)) {
      this.selectedIdx = Math.max(this.selectedIdx - 1, 0);
      this.invalidate();
      this.tui.requestRender();
    } else if (matchesKey(data, "n")) {
      this.onAction({ type: "new_spec" });
    } else if (matchesKey(data, "e")) {
      // Re-enter spec-mode pre-loaded with this task's saved spec.
      const task = allTasks[this.selectedIdx];
      if (task) this.onAction({ type: "edit_spec", task });
    } else if (matchesKey(data, "v")) {
      const task = allTasks[this.selectedIdx];
      if (task && fs.existsSync(this.resolveSpecPath(task))) {
        this.onAction({ type: "view_spec", task });
      }
    } else if (matchesKey(data, "l")) {
      const task = allTasks[this.selectedIdx];
      if (task) this.onAction({ type: "launch", task });
    } else if (matchesKey(data, Key.enter)) {
      const task = allTasks[this.selectedIdx];
      if (task?.tmuxSession && isTmuxSessionAlive(task.tmuxSession)) {
        this.onAction({ type: "attach", task });
      }
    } else if (data === "K") {
      const task = allTasks[this.selectedIdx];
      if (task) this.onAction({ type: "kill", task });
    } else if (matchesKey(data, "c")) {
      const task = allTasks[this.selectedIdx];
      if (task) this.onAction({ type: "run_critique", task });
    } else if (matchesKey(data, "s")) {
      this.onAction({ type: "settings" });
    } else if (matchesKey(data, "p")) {
      this.prMode = true;
      this.invalidate();
      this.tui.requestRender();
    } else if (matchesKey(data, "r")) {
      void this.refresh();
    } else if (matchesKey(data, Key.escape) || data === "q" || data === "Q") {
      this.stop();
      this.onClose();
    }
  }

  render(width: number): string[] {
    if (this.cached && this.cachedWidth === width) return this.cached;
    const lines: string[] = [];
    this.drawHeader(lines, width);
    if (this.prMode) {
      this.drawPrPanel(lines, width);
    } else {
      this.drawTaskPanel(lines, width);
    }
    this.cached = lines;
    this.cachedWidth = width;
    return lines;
  }

  invalidate(): void {
    this.cached = undefined;
    this.cachedWidth = undefined;
  }

  // ── Data loading ────────────────────────────────────────────────────────────

  private async refresh(): Promise<void> {
    if (this.refreshInFlight) return;
    this.refreshInFlight = true;
    this.loading = true;
    this.startSpinner();
    try {
      // Sync statuses from meta.json
      this.syncStatuses();

      // Load tasks
      this.tasks = this.store.getTasks(this.repo.root);
      this.otherTasks = this.store.getRunningTasks(this.repo.root);

      // Yield so the spinner paints before the network call
      await Promise.resolve();

      // Fetch PRs (async, non-blocking)
      this.prs = await fetchPrs(this.repo.root);
    } finally {
      this.lastRefresh = new Date();
      this.loading = false;
      this.refreshInFlight = false;
      this.stopSpinner();
    }
  }

  private async refreshPrsOnly(): Promise<void> {
    if (this.refreshInFlight) return;
    this.refreshInFlight = true;
    this.loading = true;
    this.startSpinner();
    try {
      this.prs = await fetchPrs(this.repo.root);
      this.prSelectedIdx = Math.min(this.prSelectedIdx, Math.max(0, this.visiblePrs().length - 1));
    } finally {
      this.loading = false;
      this.refreshInFlight = false;
      this.stopSpinner();
    }
  }

  private startSpinner(): void {
    if (this.spinnerTimer) return;
    this.invalidate();
    this.tui.requestRender();
    this.spinnerTimer = setInterval(() => {
      this.spinnerFrame++;
      this.invalidate();
      this.tui.requestRender();
    }, 100);
  }

  private stopSpinner(): void {
    if (this.spinnerTimer) {
      clearInterval(this.spinnerTimer);
      this.spinnerTimer = undefined;
    }
    this.spinnerFrame = 0;
    this.invalidate();
    this.tui.requestRender();
  }

  private syncAndRender(): void {
    this.syncStatuses();
    this.tasks = this.store.getTasks(this.repo.root);
    this.otherTasks = this.store.getRunningTasks(this.repo.root);
    this.invalidate();
    this.tui.requestRender();
  }

  private syncStatuses(): void {
    // Read meta.json for all running tasks and sync back to index
    const allRunning = this.store.getRunningTasks();
    const repoRunning = this.store
      .getTasks(this.repo.root)
      .filter((t) => t.status === "running" || t.status === "quality_check" || t.status === "creating_pr");
    for (const task of [...allRunning, ...repoRunning]) {
      this.store.syncTaskStatus(task);
    }
  }

  // ── PR input ────────────────────────────────────────────────────────────────

  private handlePrInput(data: string): void {
    const visible = this.visiblePrs();
    if (matchesKey(data, Key.escape) || data === "q" || matchesKey(data, "p")) {
      this.prMode = false;
      this.invalidate();
      this.tui.requestRender();
    } else if (matchesKey(data, "r")) {
      void this.refreshPrsOnly();
    } else if (matchesKey(data, "m")) {
      this.prFilterMine = !this.prFilterMine;
      this.prSelectedIdx = 0;
      this.invalidate();
      this.tui.requestRender();
    } else if (matchesKey(data, "j") || matchesKey(data, Key.down)) {
      this.prSelectedIdx = Math.min(this.prSelectedIdx + 1, Math.max(0, visible.length - 1));
      this.invalidate();
      this.tui.requestRender();
    } else if (matchesKey(data, "k") || matchesKey(data, Key.up)) {
      this.prSelectedIdx = Math.max(this.prSelectedIdx - 1, 0);
      this.invalidate();
      this.tui.requestRender();
    } else if (matchesKey(data, Key.enter) || matchesKey(data, "o")) {
      const pr = visible[this.prSelectedIdx];
      if (pr) {
        try {
          execSync(`gh pr view ${pr.number} --web`, {
            stdio: "ignore",
            timeout: 5000,
          });
        } catch {
          /* no-op */
        }
      }
    } else if (matchesKey(data, "d")) {
      this.prDetailsOpen = !this.prDetailsOpen;
      this.invalidate();
      this.tui.requestRender();
    }
  }

  private visiblePrs(): GhPr[] {
    return this.prFilterMine ? this.prs.filter((p) => p.isMine) : this.prs;
  }

  // ── Drawing: Header ─────────────────────────────────────────────────────────

  private drawHeader(lines: string[], width: number): void {
    const { theme } = this;
    const spin = this.loading
      ? " " + theme.fg("accent", SPINNER_FRAMES[this.spinnerFrame % SPINNER_FRAMES.length])
      : "";
    const left = `  ${theme.bold("⚙ FORGE")}${spin}   ${theme.fg("accent", this.repo.name)}  ${theme.fg("dim", this.repo.currentBranch)}`;
    const runningCount = this.tasks.filter(
      (t) => t.status === "running" || t.status === "quality_check" || t.status === "creating_pr",
    ).length;
    const refreshed = this.lastRefresh ? theme.fg("dim", `refreshed ${this.lastRefresh.toLocaleTimeString()}`) : "";
    const right =
      runningCount > 0 ? `${theme.fg("warning", `${runningCount} running`)}  ${refreshed}  ` : `${refreshed}  `;

    const lw = visibleWidth(left);
    const rw = visibleWidth(right);
    const mid = Math.max(0, width - lw - rw);
    lines.push(sep(width, "═"));
    lines.push(truncateToWidth(left + " ".repeat(mid) + right, width));
    lines.push(sep(width, "═"));
  }

  // ── Drawing: Task Panel ──────────────────────────────────────────────────────

  private drawTaskPanel(lines: string[], width: number): void {
    const { theme } = this;
    const allTasks = [...this.tasks, ...this.otherTasks];

    if (this.tasks.length === 0 && this.otherTasks.length === 0) {
      lines.push("");
      lines.push(
        `  ${theme.fg("dim", "No tasks yet — press")} ${theme.fg("accent", "n")} ${theme.fg("dim", "to create a spec.")}`,
      );
      lines.push("");
    } else {
      // Current repo tasks
      if (this.tasks.length > 0) {
        lines.push("");
        lines.push(`  ${theme.fg("accent", theme.bold("THIS REPO"))}  ${theme.fg("dim", this.repo.name)}`);
        lines.push(`  ${sep(width - 2)}`);
        for (let i = 0; i < this.tasks.length; i++) {
          this.drawTask(lines, width, this.tasks[i], i, i === this.selectedIdx);
        }
      }

      // Pending critiques panel (cross-repo)
      const pending = this.store.getPendingCritiques();
      if (pending.length > 0) {
        lines.push("");
        lines.push(`  ${theme.fg("accent", theme.bold("PENDING CRITIQUES"))}`);
        lines.push(`  ${sep(width - 2, "·")}`);
        for (const entry of pending) {
          const m = entry.meta;
          let statusStr: string;
          if (m.status === "running_critics" || m.status === "running_synth") {
            statusStr = theme.fg("warning", "running");
          } else if (m.status === "done" && !m.viewedAt) {
            statusStr = theme.fg("accent", "ready");
          } else if (m.status === "failed") {
            statusStr = theme.fg("error", "failed");
          } else {
            continue;
          }
          const age = timeAgo(m.startedAt);
          lines.push(
            truncateToWidth(`    🤔 [${statusStr}] ${m.specTitle}  (${m.repoName})  ${theme.fg("dim", age)}`, width),
          );
        }
      }

      // Other running tasks
      if (this.otherTasks.length > 0) {
        lines.push("");
        lines.push(`  ${theme.fg("dim", theme.bold("OTHER ACTIVE"))}`);
        lines.push(`  ${sep(width - 2, "·")}`);
        for (let i = 0; i < this.otherTasks.length; i++) {
          const globalIdx = this.tasks.length + i;
          this.drawTask(lines, width, this.otherTasks[i], globalIdx, globalIdx === this.selectedIdx);
        }
      }
    }

    lines.push("");
    lines.push(sep(width));
    this.drawActionBar(lines, width, allTasks[this.selectedIdx]);
  }

  private drawTask(lines: string[], width: number, task: TaskRecord, idx: number, selected: boolean): void {
    const { theme } = this;
    const cursor = selected ? theme.fg("accent", "▶") : " ";
    const icon = statusIcon(theme, task.status, task.tmuxSession);
    const statusLbl = padEnd(statusLabel(theme, task.status, task.tmuxSession), 12);
    const branch = padEnd(truncateToWidth(task.branch, 30), 32);
    const when = theme.fg("dim", timeAgo(task.launchedAt ?? task.createdAt));
    const agentLbl = task.agent
      ? theme.fg("dim", `${task.agent}·${(task.model ?? "").split("-").slice(-1)[0]}`)
      : theme.fg("dim", "draft");
    const repoLbl = task.repoName !== this.repo.name ? theme.fg("dim", `  [${task.repoName}]`) : "";

    // Row 1: cursor icon status branch agent when
    const row1Parts = [cursor, " ", icon, "  ", statusLbl, "  ", theme.bold(branch), agentLbl, "  ", when, repoLbl];
    lines.push(truncateToWidth("  " + row1Parts.join(""), width));

    // Row 2: indented title
    const titleColor = selected ? "text" : "dim";
    lines.push(truncateToWidth(`       ${theme.fg(titleColor, task.title.slice(0, width - 10))}`, width));

    // Row 3+: PR link or progress lines
    if (task.prUrl) {
      lines.push(truncateToWidth(`       ${theme.fg("accent", `→ ${task.prUrl}`)}`, width));
    } else if (task.status === "running" || task.status === "quality_check" || task.status === "creating_pr") {
      const progress = this.progressLines(task, width);
      for (const pl of progress) lines.push(pl);
    } else if (task.status === "failed" || task.status === "quality_failed") {
      // Surface the failure reason on the row itself so users don't have to
      // attach to tmux or grep agent.log to figure out why a run died. The
      // supervisor writes errorMessage into meta.json + snapshot.json on
      // PR-creation failures (and any other terminal error path).
      for (const fl of this.failedSubLines(task, width)) lines.push(fl);
    }

    // Critique progress sub-line
    const critLine = this.critiqueSubLine(task, width);
    if (critLine) lines.push(critLine);

    lines.push("");
  }

  // ── Progress line for running tasks ─────────────────────────────────────────

  // Failure sub-line for failed / quality_failed tasks. See description in
  // failedSubLines() below — surfaces meta.errorMessage on the row so the
  // user doesn't have to attach to tmux just to learn why a run died.
  private failedSubLines(task: TaskRecord, width: number): string[] {
    const { theme } = this;
    const out: string[] = [];

    // Try meta.json first (written by both bash + supervisor runners),
    // then snapshot.json (supervisor only). Both are best-effort.
    const meta = this.store.readRunMeta(task.id);
    const snap = this.store.readSnapshot(task.id);

    if (task.status === "quality_failed") {
      const results =
        (meta?.qualityResults as { command: string; ok: boolean }[] | undefined) ?? snap?.qualityResults ?? [];
      const failed = results.filter((r) => !r.ok).map((r) => r.command);
      const summary = failed.length ? `quality failed: ${failed.join(", ")}` : "quality failed";
      out.push(truncateToWidth(`       ${theme.fg("warning", summary.slice(0, width - 10))}`, width));
      return out;
    }

    // status === "failed"
    const errMsg = (meta?.errorMessage as string | undefined) ?? snap?.errorMessage ?? null;
    if (errMsg) {
      // Squeeze whitespace + cap so multi-line errors stay on one row.
      const flat = errMsg.replace(/\s+/g, " ").trim();
      out.push(truncateToWidth(`       ${theme.fg("error", `✖ ${flat.slice(0, width - 12)}`)}`, width));
    } else {
      // No structured error — fall back to the last log line so the user
      // at least sees *something* without attaching to tmux.
      const tail = this.store.tailLog(task.id, 1);
      if (tail[0]) {
        out.push(truncateToWidth(`       ${theme.fg("error", `✖ ${tail[0].slice(0, width - 12)}`)}`, width));
      }
    }

    // If a PR-creation error log was written, point the user at it.
    const errorLog = path.join(this.store.runsDir, task.id, "pr-create-error.log");
    if (fs.existsSync(errorLog)) {
      out.push(truncateToWidth(`       ${theme.fg("dim", `see ${errorLog}`)}`, width));
    }
    return out;
  }

  private progressLines(task: TaskRecord, width: number): string[] {
    const { theme } = this;

    // pi-runtime tasks: try snapshot first
    if (task.agent === "pi") {
      const snap = this.store.readSnapshot(task.id);
      if (snap) return this.snapshotLines(snap, width);
      // No snapshot — pre-supervisor task, fall through to tailLog
      const tail = this.store.tailLog(task.id, 1);
      if (tail[0]) return [truncateToWidth(`       ${theme.fg("dim", tail[0].slice(0, width - 10))}`, width)];
      return [];
    }

    // claude / codex: tailLog with limited-progress suffix
    const tail = this.store.tailLog(task.id, 1);
    if (tail[0]) {
      const line = tail[0].slice(0, width - 30);
      return [truncateToWidth(`       ${theme.fg("dim", line)} ${theme.fg("dim", "(limited progress)")}`, width)];
    }
    return [];
  }

  private snapshotLines(snap: Snapshot, width: number): string[] {
    const { theme } = this;
    const lines: string[] = [];
    const phaseIcons: Record<string, string> = {
      starting: "○",
      agent: "⟳",
      quality_check: "✔",
      committing: "↑",
      creating_pr: "↗",
      done: "✓",
      failed: "✗",
    };
    const icon = phaseIcons[snap.phase] ?? "·";
    const secAgo = Math.round((Date.now() - snap.lastEventAt) / 1000);

    if (snap.phase === "agent") {
      const tool = snap.currentTool?.toolName ?? "thinking";
      const preview = snap.currentTool?.argsPreview ?? "";
      const line1 = `${icon} ${snap.phase} · ${tool} ${preview}`;
      lines.push(truncateToWidth(`       ${line1.slice(0, width - 10)}`, width));

      const inp = fmtTokens(snap.usage.inputTokens);
      const out = fmtTokens(snap.usage.outputTokens);
      const badge = this.healthBadge(snap.health);
      const errs = snap.consecutiveToolErrors ?? 0;
      const struggle = errs > 0 ? ` · ${theme.fg(errs >= 3 ? "error" : "warning", `${errs}✗ in a row`)}` : "";
      const line2 = `↑${inp} ↓${out} · turn ${snap.usage.turns}${struggle} · ${secAgo}s ago · ${badge}`;
      lines.push(truncateToWidth(`       ${line2}`, width));
    } else {
      const line1 = `${icon} ${snap.phase} · ${secAgo}s ago`;
      lines.push(truncateToWidth(`       ${theme.fg("dim", line1)}`, width));
    }
    return lines;
  }

  private healthBadge(health: string): string {
    const { theme } = this;
    switch (health) {
      case "active":
        return theme.fg("success", "active");
      case "idle":
        return theme.fg("dim", "idle");
      case "stalled":
        return theme.fg("warning", "stalled");
      case "error":
        return theme.fg("error", "error");
      default:
        return theme.fg("dim", health);
    }
  }

  // ── Critique sub-line for tasks ───────────────────────────────────────────

  private critiqueSubLine(task: TaskRecord, width: number): string | null {
    const { theme } = this;
    const latestId = this.store.getLatestCritique(task.id);
    if (!latestId) return null;
    const meta = this.store.readCritiqueMeta(task.id, latestId);
    if (!meta) return null;

    if (meta.status === "running_critics" || meta.status === "running_synth") {
      const label = `🤔 critique · A:${meta.criticA.status} B:${meta.criticB.status} · synth:${meta.synthesizer.status}`;
      return truncateToWidth(`       ${theme.fg("warning", label)}`, width);
    }
    if (meta.status === "done" && !meta.viewedAt) {
      return truncateToWidth(`       ${theme.fg("accent", "🤔 critique ready · press c to review")}`, width);
    }
    if (meta.status === "failed") {
      return truncateToWidth(`       ${theme.fg("error", "🤔 critique failed · press c for details")}`, width);
    }
    return null;
  }

  // ── Drawing: PR Panel ────────────────────────────────────────────────────────

  private drawPrPanel(lines: string[], width: number): void {
    const { theme } = this;
    const visible = this.visiblePrs();
    const me = cachedLogin ?? "";
    const total = this.prs.length;
    const mineCount = this.prs.filter((p) => p.isMine).length;

    // ── Header row ─────────────────────────────────────────────────────────
    const filterLabel = this.prFilterMine
      ? theme.fg("accent", `mine (${mineCount})`)
      : theme.fg("accent", `all (${total})`);
    const otherLabel = this.prFilterMine
      ? theme.fg("dim", `· all (${total})`)
      : me
        ? theme.fg("dim", `· mine (${mineCount})`)
        : "";
    lines.push("");
    lines.push(
      `  ${theme.bold(theme.fg("accent", "OPEN PRs"))}  ${theme.fg("dim", this.repo.name)}   ${filterLabel} ${otherLabel}`,
    );
    lines.push(`  ${sep(width - 2)}`);

    if (this.loading && this.prs.length === 0) {
      lines.push("");
      const frame = SPINNER_FRAMES[this.spinnerFrame % SPINNER_FRAMES.length];
      lines.push(`  ${theme.fg("accent", frame)} ${theme.fg("dim", "Loading PRs…")}`);
    } else if (visible.length === 0) {
      lines.push("");
      const msg = this.prFilterMine
        ? me
          ? `No open PRs by @${me}.`
          : "Could not detect your gh login. Run `gh auth status`."
        : "No open PRs.";
      lines.push(`  ${theme.fg("dim", msg)}`);
    } else {
      // ── Column layout ──────────────────────────────────────────────────
      // Compute width budget: cursor(2) + #(6) + ci(2) + rv(2) + draft(7)
      //   + author(varies) + age(8) + diff(varies) + title(rest)
      const showAuthor = !this.prFilterMine;
      const authorW = showAuthor ? Math.min(14, Math.max(6, ...visible.map((p) => p.author.length + 1))) : 0;
      const numW = Math.max(4, ...visible.map((p) => `#${p.number}`.length));
      const ageW = 7;
      const diffW = 10;
      const fixed =
        2 /*cursor*/ +
        1 +
        numW +
        2 +
        1 /*ci*/ +
        1 +
        1 /*rv*/ +
        2 +
        (showAuthor ? authorW + 2 : 0) +
        ageW +
        2 +
        diffW +
        2 +
        7; /*draft tag space*/
      const titleW = Math.max(20, width - 2 - fixed);

      // Header row
      const hdrParts: string[] = [];
      hdrParts.push("  "); // cursor space
      hdrParts.push(theme.fg("dim", padEnd("#", numW)));
      hdrParts.push("  ");
      hdrParts.push(theme.fg("dim", "CI"));
      hdrParts.push(" ");
      hdrParts.push(theme.fg("dim", "R"));
      hdrParts.push("  ");
      hdrParts.push(theme.fg("dim", padEnd("TITLE", titleW)));
      hdrParts.push("  ");
      if (showAuthor) {
        hdrParts.push(theme.fg("dim", padEnd("AUTHOR", authorW)));
        hdrParts.push("  ");
      }
      hdrParts.push(theme.fg("dim", padEnd("AGE", ageW)));
      hdrParts.push("  ");
      hdrParts.push(theme.fg("dim", padEnd("±LINES", diffW)));
      lines.push(truncateToWidth("  " + hdrParts.join(""), width));
      lines.push("");

      for (let i = 0; i < visible.length; i++) {
        const pr = visible[i];
        const selected = i === this.prSelectedIdx;
        const cursor = selected ? theme.fg("accent", "▶") : " ";

        const numStr = padEnd(`#${pr.number}`, numW);
        const num = selected ? theme.bold(numStr) : theme.fg("dim", numStr);
        const ci = ciCell(theme, pr.statusCheckRollup);
        const rv = reviewCell(theme, pr.reviewDecision);

        const draftTag = pr.isDraft ? theme.fg("dim", " ◐") : "  ";
        const titleStr = padEnd(truncateToWidth(pr.title, titleW), titleW);
        const title = selected ? theme.bold(titleStr) : titleStr;

        const author = showAuthor
          ? padEnd(pr.author === me ? theme.fg("accent", `@${pr.author}`) : theme.fg("dim", `@${pr.author}`), authorW)
          : "";
        const age = theme.fg("dim", padEnd(timeAgo(pr.updatedAt), ageW));
        const diff = padEnd(
          theme.fg("success", `+${pr.additions}`) + theme.fg("dim", "/") + theme.fg("error", `-${pr.deletions}`),
          diffW,
        );

        const row1: string[] = ["  ", cursor, " ", num, "  ", ci, " ", rv, draftTag, " ", title, "  "];
        if (showAuthor) row1.push(author, "  ");
        row1.push(age, "  ", diff);
        lines.push(truncateToWidth(row1.join(""), width));

        // Sub-row (branch only) — render only for the selected PR to keep the
        // list compact. The URL is intentionally omitted; press ↵/o to open.
        if (selected) {
          const subParts = `       ${theme.fg("text", pr.headRefName)}`;
          lines.push(truncateToWidth(subParts, width));
          if (this.prDetailsOpen) {
            // Details block: shown under the selected row when [d] is toggled on.
            const refs = `${theme.fg("dim", pr.baseRefName)} ${theme.fg("dim", "←")} ${theme.fg("text", pr.headRefName)}`;
            const draft = pr.isDraft ? `  ${theme.fg("dim", "◐ draft")}` : "";
            const stats: string[] = [];
            stats.push(
              `${theme.fg("success", `+${pr.additions}`)}${theme.fg("dim", "/")}${theme.fg("error", `-${pr.deletions}`)} ${theme.fg("dim", `(${pr.changedFiles} files)`)}`,
            );
            const commentColor = pr.commentsCount > 0 ? "accent" : "dim";
            const reviewColor = pr.reviewsCount > 0 ? "accent" : "dim";
            stats.push(theme.fg(commentColor, `💬 ${pr.commentsCount}`));
            stats.push(theme.fg(reviewColor, `📝 ${pr.reviewsCount}`));
            lines.push(truncateToWidth(`         ${refs}${draft}`, width));
            lines.push(truncateToWidth(`         ${stats.join("  ")}`, width));
            lines.push(truncateToWidth(`         ${theme.fg("accent", pr.url)}`, width));
          }
        }
      }
    }

    lines.push(sep(width));
    const filterHint = this.prFilterMine
      ? `[${theme.fg("accent", "m")}] all`
      : `[${theme.fg("accent", "m")}] mine only`;
    const detailsHint = this.prDetailsOpen
      ? `[${theme.fg("accent", "d")}] hide details`
      : `[${theme.fg("accent", "d")}] details`;
    lines.push(
      `  [${theme.fg("accent", "j/k")}] move   [${theme.fg("accent", "↵")}/${theme.fg("accent", "o")}] open   ${detailsHint}   ${filterHint}   [${theme.fg("accent", "r")}] refresh   [${theme.fg("accent", "p")}/${theme.fg("accent", "q")}] back`,
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  resolveSpecPath(task: TaskRecord): string {
    return task.specFile || path.join(this.store.specsDir, `${task.id}.md`);
  }

  // ── Drawing: Action bar ──────────────────────────────────────────────────────

  private drawActionBar(lines: string[], width: number, selected: TaskRecord | undefined): void {
    const { theme } = this;
    const canAttach = selected?.tmuxSession && isTmuxSessionAlive(selected.tmuxSession);
    const canLaunch = selected?.status === "draft" || selected?.status === "failed";
    const canKill = selected?.tmuxSession && isTmuxSessionAlive(selected.tmuxSession);
    const canView = selected && fs.existsSync(this.resolveSpecPath(selected));

    const canEdit = !!selected;
    const canCritique = !!(selected?.specFile && fs.existsSync(selected.specFile));
    const parts = [
      `[${theme.fg("accent", "n")}] New spec`,
      canEdit ? `[${theme.fg("accent", "e")}] Edit spec` : "",
      canView ? `[${theme.fg("accent", "v")}] View spec` : "",
      canLaunch ? `[${theme.fg("accent", "l")}] Launch` : "",
      canCritique ? `[${theme.fg("accent", "c")}] Critique` : "",
      canAttach ? `[${theme.fg("accent", "↵")}] Attach` : "",
      canKill ? `[${theme.fg("error", "K")}] Kill` : "",
      `[${theme.fg("accent", "p")}] PRs`,
      `[${theme.fg("accent", "s")}] Settings`,
      `[${theme.fg("accent", "r")}] Refresh`,
      `[${theme.fg("accent", "q")}] Close`,
    ]
      .filter(Boolean)
      .join("   ");

    lines.push(`  ${truncateToWidth(parts, width - 2)}`);
  }
}
