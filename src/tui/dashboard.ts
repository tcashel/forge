/**
 * Forge Dashboard — mission control TUI component.
 *
 * Shows current-repo tasks prominently, other running tasks below,
 * and open PRs from gh. Keyboard-driven for all common actions.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { GhTarget } from "../core/gh.js";
import { fetchPrs, type GhPr } from "../core/gh-pr.js";
import { isTmuxSessionAlive } from "../core/launch.js";
import type { RepoProfile } from "../core/repo.js";
import type { ForgeStore, Plan, PlanStatus } from "../core/store.js";
import { Key, matchesKey } from "./keys.js";
import { truncateToWidth, visibleWidth } from "./width.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Theme {
  fg: (color: string, text: string) => string;
  bold: (text: string) => string;
}
interface Tui {
  requestRender(): void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function statusIcon(theme: Theme, status: PlanStatus, tmuxSession: string | null): string {
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

function statusLabel(theme: Theme, status: PlanStatus, tmuxSession: string | null): string {
  const alive = tmuxSession ? isTmuxSessionAlive(tmuxSession) : false;
  if ((status === "running" || status === "quality_check" || status === "creating_pr") && !alive) {
    return theme.fg("error", "dead");
  }
  const map: Record<PlanStatus, [string, string]> = {
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

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// ─── Dashboard Component ──────────────────────────────────────────────────────

export type DashboardAction =
  | { type: "new_spec" }
  | { type: "edit_spec"; task: Plan }
  | { type: "view_spec"; task: Plan }
  | { type: "launch"; task: Plan }
  | { type: "attach"; task: Plan }
  | { type: "kill"; task: Plan }
  | { type: "run_critique"; task: Plan }
  | { type: "view_critique"; task: Plan; critiqueId: string }
  | { type: "discuss_critique"; task: Plan; critiqueId: string }
  | { type: "settings" }
  | { type: "resume"; task: Plan }
  | { type: "close" };

export class ForgeDashboard {
  private tasks: Plan[] = [];
  private otherTasks: Plan[] = [];
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
  // Per-instance login cache. Recomputed on every refresh so it stays
  // in sync with the per-repo ghUser override and any auth changes.
  private myLogin = "";

  onAction: (action: DashboardAction) => void = () => {};
  onClose: () => void = () => {};

  constructor(
    readonly _theme: Theme,
    private readonly tui: Tui,
    private readonly store: ForgeStore,
    private readonly repo: RepoProfile,
  ) {}

  /** Resolve gh account/host overrides from the per-repo config, if any. */
  private ghTarget(): GhTarget | undefined {
    const cfg = this.store.getRepoConfig(this.repo.root);
    if (!cfg.ghUser && !cfg.ghHost) return undefined;
    return { user: cfg.ghUser, host: cfg.ghHost };
  }

  private fetchOpts() {
    return { cwd: this.repo.root, ghTarget: this.ghTarget() };
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  start(): void {
    void this.refresh();
    // Poll every 8s to sync running task statuses
    this.refreshTimer = setInterval(() => this.syncAndRender(), 8000);
  }

  stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
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
    } else if (data === "R") {
      // Capital R — resume a failed task. Lowercase r is reserved for
      // refresh below; using a different binding keeps the muscle
      // memory clear.
      const task = allTasks[this.selectedIdx];
      if (task && (task.status === "failed" || task.status === "quality_failed")) {
        this.onAction({ type: "resume", task });
      }
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
      this.tasks = this.store.getPlans(this.repo.root);
      this.otherTasks = this.store.getRunningPlans(this.repo.root);

      // Yield so the spinner paints before the network call
      await Promise.resolve();

      // Fetch PRs (async, non-blocking)
      const result = await fetchPrs(this.fetchOpts());
      this.prs = result.prs;
      this.myLogin = result.me;
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
      const result = await fetchPrs(this.fetchOpts());
      this.prs = result.prs;
      this.myLogin = result.me;
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
    this.tasks = this.store.getPlans(this.repo.root);
    this.otherTasks = this.store.getRunningPlans(this.repo.root);
    this.invalidate();
    this.tui.requestRender();
  }

  private syncStatuses(): void {
    // Read meta.json for all running tasks and sync back to index
    const allRunning = this.store.getRunningPlans();
    const repoRunning = this.store
      .getPlans(this.repo.root)
      .filter((t) => t.status === "running" || t.status === "quality_check" || t.status === "creating_pr");
    for (const task of [...allRunning, ...repoRunning]) {
      this.store.syncPlanStatus(task);
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
      ? ` ${theme.fg("accent", SPINNER_FRAMES[this.spinnerFrame % SPINNER_FRAMES.length])}`
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

  private drawTask(lines: string[], width: number, task: Plan, _idx: number, selected: boolean): void {
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
    lines.push(truncateToWidth(`  ${row1Parts.join("")}`, width));

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
      // supervisor writes errorMessage into snapshot.json (via stopped
      // events) and mirrors it into meta.json on terminal-error paths;
      // failedSubLines reads meta first and falls back to snapshot for
      // older runs that pre-date the mirror.
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
  private failedSubLines(task: Plan, width: number): string[] {
    const { theme } = this;
    const out: string[] = [];

    // meta.json carries quality results + error message for the bash runner.
    const meta = this.store.readRunMeta(task.id);

    if (task.status === "quality_failed") {
      const results = (meta?.qualityResults as { command: string; ok: boolean }[] | undefined) ?? [];
      const failed = results.filter((r) => !r.ok).map((r) => r.command);
      const summary = failed.length ? `quality failed: ${failed.join(", ")}` : "quality failed";
      out.push(truncateToWidth(`       ${theme.fg("warning", summary.slice(0, width - 10))}`, width));
      return out;
    }

    // status === "failed"
    const errMsg = (meta?.errorMessage as string | undefined) ?? null;
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

  private progressLines(task: Plan, width: number): string[] {
    const { theme } = this;
    const tail = this.store.tailLog(task.id, 1);
    if (tail[0]) {
      const line = tail[0].slice(0, width - 30);
      return [truncateToWidth(`       ${theme.fg("dim", line)} ${theme.fg("dim", "(log tail)")}`, width)];
    }
    return [];
  }

  // ── Critique sub-line for tasks ───────────────────────────────────────────

  private critiqueSubLine(task: Plan, width: number): string | null {
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
    const me = this.myLogin;
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
      lines.push(truncateToWidth(`  ${hdrParts.join("")}`, width));
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

  resolveSpecPath(task: Plan): string {
    return task.specFile || path.join(this.store.specsDir, `${task.id}.md`);
  }

  // ── Drawing: Action bar ──────────────────────────────────────────────────────

  private drawActionBar(lines: string[], width: number, selected: Plan | undefined): void {
    const { theme } = this;
    const canAttach = selected?.tmuxSession && isTmuxSessionAlive(selected.tmuxSession);
    const canLaunch = selected?.status === "draft" || selected?.status === "failed";
    const canKill = selected?.tmuxSession && isTmuxSessionAlive(selected.tmuxSession);
    const canView = selected && fs.existsSync(this.resolveSpecPath(selected));

    const canEdit = !!selected;
    const canCritique = !!(selected?.specFile && fs.existsSync(selected.specFile));
    const canResume = selected?.status === "failed" || selected?.status === "quality_failed";
    const parts = [
      `[${theme.fg("accent", "n")}] New spec`,
      canEdit ? `[${theme.fg("accent", "e")}] Edit spec` : "",
      canView ? `[${theme.fg("accent", "v")}] View spec` : "",
      canLaunch ? `[${theme.fg("accent", "l")}] Launch` : "",
      canResume ? `[${theme.fg("accent", "R")}] Resume` : "",
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
