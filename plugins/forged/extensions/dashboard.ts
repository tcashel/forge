import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { callForged } from "./cli.ts";

export interface DashboardSnapshot {
  operations: Record<string, any>;
  history: Record<string, any> | null;
  sessions: Record<string, any> | null;
  loadedAt: number;
  degradations: string[];
}

type DashboardTab = "work" | "attention" | "usage" | "agents";

const TABS: Array<{ id: DashboardTab; label: string; key: string }> = [
  { id: "work", label: "WORK", key: "1" },
  { id: "attention", label: "ATTENTION", key: "2" },
  { id: "usage", label: "USAGE", key: "3" },
  { id: "agents", label: "AGENTS", key: "4" },
];

const GROUP_LABELS: Record<string, string> = {
  "needs-me": "Needs me",
  "ready-to-merge": "Ready to merge",
  running: "Running",
  "stalled-or-recoverable": "Stalled",
  planned: "Planned",
};

const SPARK = "▁▂▃▄▅▆▇█";

export async function loadDashboard(pi: ExtensionAPI, repository?: string): Promise<DashboardSnapshot> {
  const operationArgs = ["operations", "overview", "--limit", "200"];
  if (repository) operationArgs.push("--repo", repository);

  const [operations, history, sessions] = await Promise.all([
    callForged(pi, operationArgs),
    callForged(
      pi,
      [
        "work",
        "history",
        "--group-by",
        "provider",
        "--limit",
        "50",
      ],
    ).catch(() => null),
    callForged(pi, ["session", "inventory", "--limit", "100"]).catch(() => null),
  ]);

  const degradations: string[] = [];
  const health = operations.result.sourceHealth ?? {};
  for (const [source, value] of Object.entries(health)) {
    const item = value as { state?: string; error?: string };
    if (item.state && item.state !== "available") {
      degradations.push(`${source}: ${item.state}${item.error ? ` (${item.error})` : ""}`);
    }
  }
  if (operations.result.coverage?.truncated) {
    degradations.push(
      `work truncated ${operations.result.coverage.shown}/${operations.result.coverage.matching}`,
    );
  }
  if (!history) degradations.push("history unavailable");
  if (!sessions) degradations.push("agent inventory unavailable");

  return {
    operations: operations.result,
    history: history?.result ?? null,
    sessions: sessions?.result ?? null,
    loadedAt: Date.now(),
    degradations,
  };
}

function plainPad(value: string, width: number, align: "left" | "right" = "left"): string {
  const clipped = truncateToWidth(value, Math.max(0, width), "");
  const missing = Math.max(0, width - visibleWidth(clipped));
  return align === "right" ? " ".repeat(missing) + clipped : clipped + " ".repeat(missing);
}

function joinColumns(left: string[], right: string[], leftWidth: number, gap = 1): string[] {
  const rows = Math.max(left.length, right.length);
  const output: string[] = [];
  for (let index = 0; index < rows; index++) {
    output.push(`${plainPad(left[index] ?? "", leftWidth)}${" ".repeat(gap)}${right[index] ?? ""}`);
  }
  return output;
}

function panel(title: string, lines: string[], width: number, theme: any, accent = false): string[] {
  const inner = Math.max(1, width - 2);
  const titleText = ` ${title} `;
  const borderColor = accent ? "borderAccent" : "borderMuted";
  const topRest = Math.max(0, inner - visibleWidth(titleText));
  const top = theme.fg(borderColor, `╭${titleText}${"─".repeat(topRest)}╮`);
  const body = lines.map((line) => {
    const clipped = truncateToWidth(line, inner, "…");
    return `${theme.fg(borderColor, "│")}${plainPad(clipped, inner)}${theme.fg(borderColor, "│")}`;
  });
  return [top, ...body, theme.fg(borderColor, `╰${"─".repeat(inner)}╯`)];
}

function bar(value: number, max: number, width: number, theme: any, color = "accent"): string {
  const safeMax = Math.max(1, max);
  const filled = Math.min(width, Math.round((Math.max(0, value) / safeMax) * width));
  return theme.fg(color, "█".repeat(filled)) + theme.fg("dim", "░".repeat(width - filled));
}

function sparkline(values: number[], theme: any, color = "accent"): string {
  if (values.length === 0) return theme.fg("dim", "—");
  const max = Math.max(...values, 1);
  return values
    .map((value) => SPARK[Math.min(SPARK.length - 1, Math.floor((value / max) * (SPARK.length - 1)))])
    .map((glyph) => theme.fg(color, glyph))
    .join("");
}

function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return "?";
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}b`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

function money(value: unknown, missing = 0): string {
  const numeric = Number(value ?? 0);
  const base = `$${numeric.toFixed(2)}`;
  return missing > 0 ? `${base}+?` : base;
}

function age(timestamp: unknown): string {
  if (typeof timestamp !== "string") return "—";
  const elapsed = Math.max(0, Date.now() - Date.parse(timestamp));
  if (!Number.isFinite(elapsed)) return "—";
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function titleOf(row: any): string {
  return row?.identity?.displayTitle ?? row?.title ?? row?.id ?? "unknown";
}

function groupEntries(snapshot: DashboardSnapshot): Array<{ code: string; entries: any[] }> {
  return (snapshot.operations.queue?.groups ?? []).map((group: any) => ({
    code: group.code,
    entries: Array.isArray(group.entries) ? group.entries : [],
  }));
}

function allEntries(snapshot: DashboardSnapshot): any[] {
  return groupEntries(snapshot).flatMap((group) => group.entries);
}

export class ForgeDashboard {
  private snapshot: DashboardSnapshot;
  private tab: DashboardTab = "work";
  private selected = 0;
  private group = 0;
  private busy = false;
  private message = "";
  private detail: Record<string, any> | null = null;

  constructor(
    snapshot: DashboardSnapshot,
    private readonly pi: ExtensionAPI,
    private readonly theme: any,
    private readonly requestRender: () => void,
    private readonly close: () => void,
    private readonly repository?: string,
  ) {
    this.snapshot = snapshot;
  }

  invalidate(): void {}

  handleInput(data: string): void {
    if (matchesKey(data, Key.escape) || data === "q") {
      this.close();
      return;
    }
    const keyed = TABS.find((tab) => tab.key === data);
    if (keyed) {
      this.tab = keyed.id;
      this.selected = 0;
      this.detail = null;
      this.requestRender();
      return;
    }
    if (matchesKey(data, Key.tab)) {
      const index = TABS.findIndex((tab) => tab.id === this.tab);
      this.tab = TABS[(index + 1) % TABS.length].id;
      this.selected = 0;
      this.detail = null;
      this.requestRender();
      return;
    }
    if (data === "r") {
      void this.refresh();
      return;
    }
    if (matchesKey(data, Key.left) || data === "h") {
      this.group = Math.max(0, this.group - 1);
      this.selected = 0;
      this.requestRender();
      return;
    }
    if (matchesKey(data, Key.right) || data === "l") {
      this.group = Math.min(groupEntries(this.snapshot).length - 1, this.group + 1);
      this.selected = 0;
      this.requestRender();
      return;
    }
    if (matchesKey(data, Key.up) || data === "k") {
      this.selected = Math.max(0, this.selected - 1);
      this.requestRender();
      return;
    }
    if (matchesKey(data, Key.down) || data === "j") {
      this.selected += 1;
      this.requestRender();
      return;
    }
    if (matchesKey(data, Key.enter) || data === "d") void this.loadDetail();
  }

  private async refresh(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.message = "refreshing live projections…";
    this.requestRender();
    try {
      this.snapshot = await loadDashboard(this.pi, this.repository);
      this.message = "snapshot refreshed";
      this.detail = null;
    } catch (error) {
      this.message = String(error);
    } finally {
      this.busy = false;
      this.requestRender();
    }
  }

  private selectedWork(): any | undefined {
    const groups = groupEntries(this.snapshot);
    const entries = groups[this.group]?.entries ?? [];
    this.selected = Math.min(this.selected, Math.max(0, entries.length - 1));
    return entries[this.selected];
  }

  private async loadDetail(): Promise<void> {
    const row = this.selectedWork();
    const target = row?.detailTarget;
    if (!target?.subjectKind || !target?.subjectId || this.busy) {
      this.message = row ? "plan-only work has no durable detail yet" : "nothing selected";
      this.requestRender();
      return;
    }
    this.busy = true;
    this.message = `loading ${target.subjectKind} ${target.subjectId}…`;
    this.requestRender();
    try {
      const call = await callForged(this.pi, [
        "work",
        "detail",
        "--subject-kind",
        target.subjectKind,
        "--subject-id",
        target.subjectId,
        "--limit",
        "100",
      ]);
      this.detail = call.result;
      this.message = "durable detail loaded";
    } catch (error) {
      this.message = String(error);
    } finally {
      this.busy = false;
      this.requestRender();
    }
  }

  render(width: number): string[] {
    const safeWidth = Math.max(1, width);
    const output = [...this.header(safeWidth)];
    switch (this.tab) {
      case "work":
        output.push(...this.workView(safeWidth));
        break;
      case "attention":
        output.push(...this.attentionView(safeWidth));
        break;
      case "usage":
        output.push(...this.usageView(safeWidth));
        break;
      case "agents":
        output.push(...this.agentsView(safeWidth));
        break;
    }
    output.push(...this.footer(safeWidth));
    return output.map((line) => truncateToWidth(line, safeWidth, ""));
  }

  private header(width: number): string[] {
    const operations = this.snapshot.operations;
    const counts = operations.counts ?? {};
    const spend = operations.spend ?? {};
    const logo = this.theme.fg("accent", this.theme.bold("◆ FORGE"));
    const mode = this.repository ? this.theme.fg("muted", this.repository) : this.theme.fg("muted", "operator portfolio");
    const live = this.theme.fg(counts.live > 0 ? "success" : "dim", `● ${counts.live ?? 0} live`);
    const attention = this.theme.fg(counts.attention > 0 ? "warning" : "success", `▲ ${counts.attention ?? 0} attention`);
    const cost = this.theme.fg("accent", money(spend.costUsdKnown, spend.rowsMissingCost));
    const right = `${live}  ${attention}  ${cost}`;
    const left = `${logo}  ${mode}`;
    const gap = Math.max(1, width - visibleWidth(left) - visibleWidth(right));
    const tabLine = TABS.map((tab) => {
      const label = ` ${tab.key}:${tab.label} `;
      return tab.id === this.tab
        ? this.theme.bg("selectedBg", this.theme.fg("accent", this.theme.bold(label)))
        : this.theme.fg("dim", label);
    }).join(" ");
    const degradation = this.snapshot.degradations.length
      ? this.theme.fg("warning", `degraded: ${this.snapshot.degradations.join(" · ")}`)
      : this.theme.fg("success", "all sources healthy");
    return [`${left}${" ".repeat(gap)}${right}`, tabLine, degradation];
  }

  private workView(width: number): string[] {
    const groups = groupEntries(this.snapshot);
    this.group = Math.min(this.group, Math.max(0, groups.length - 1));
    const counts = this.snapshot.operations.counts ?? {};
    const metricWidth = Math.max(10, Math.floor((width - 3) / 4));
    const metrics = [
      ["ADMITTED", counts.admitted ?? 0, "accent"],
      ["RUNNING", counts.live ?? 0, "success"],
      ["REVIEW READY", counts.reviewReady ?? 0, "warning"],
      ["PLANNED", counts.planOnly ?? 0, "muted"],
    ].map(([label, value, color]) => panel(String(label), [this.theme.fg(String(color), this.theme.bold(String(value)))], metricWidth, this.theme));
    const metricRows = metrics[0].map((_, row) => metrics.map((metric) => plainPad(metric[row], metricWidth)).join(" "));

    const groupLine = groups.map((group, index) => {
      const label = GROUP_LABELS[group.code] ?? group.code;
      const token = ` ${label} ${group.entries.length} `;
      return index === this.group
        ? this.theme.bg("selectedBg", this.theme.fg("accent", this.theme.bold(token)))
        : this.theme.fg("dim", token);
    }).join(" ");

    const active = groups[this.group] ?? { code: "", entries: [] };
    this.selected = Math.min(this.selected, Math.max(0, active.entries.length - 1));
    const listWidth = width >= 100 ? Math.floor(width * 0.62) : width;
    const inspectorWidth = width - listWidth - 1;
    const rows = active.entries.slice(0, 18).map((row: any, index: number) => {
      const selected = index === this.selected;
      const cursor = selected ? this.theme.fg("accent", "▸") : " ";
      const state = this.theme.fg(
        row.queueGroup === "Needs me" ? "warning" : row.queueGroup === "Running" ? "success" : "muted",
        plainPad(String(row.state ?? row.plan?.status ?? "—"), 11),
      );
      const titleWidth = Math.max(12, listWidth - 35);
      const title = plainPad(titleOf(row), titleWidth);
      const tail = `${plainPad(age(row.lastProgressAt), 4, "right")} ${plainPad(money(row.costUsdKnown, row.rowsMissingCost), 9, "right")}`;
      const line = `${cursor} ${state} ${title} ${tail}`;
      return selected ? this.theme.bg("selectedBg", line) : line;
    });
    if (rows.length === 0) rows.push(this.theme.fg("dim", "  no work in this group"));

    const selected = this.selectedWork();
    const inspect = this.detail ? this.detailLines(this.detail, inspectorWidth - 2) : this.inspectLines(selected, inspectorWidth - 2);
    const listPanel = panel(GROUP_LABELS[active.code] ?? "Work", rows, listWidth, this.theme, true);
    if (width < 100) return [...metricRows, groupLine, ...listPanel, ...panel("Inspector", inspect, width, this.theme)];
    return [...metricRows, groupLine, ...joinColumns(listPanel, panel("Inspector", inspect, inspectorWidth, this.theme), listWidth)];
  }

  private inspectLines(row: any, width: number): string[] {
    if (!row) return [this.theme.fg("dim", "Nothing selected")];
    const attention = row.attentionItems?.items ?? [];
    return [
      this.theme.fg("accent", this.theme.bold(row.id ?? "unknown")),
      this.theme.fg("muted", row.kind ?? row.source ?? "—"),
      "",
      `stage   ${row.currentStage ?? "—"}`,
      `seat    ${row.currentSeat ?? "—"}`,
      `agent   ${row.currentAgent ?? "—"}`,
      `branch  ${row.branch ?? "—"}`,
      `claim   ${row.claimHealth?.status ?? "unknown"}`,
      `spend   ${money(row.costUsdKnown, row.rowsMissingCost)}`,
      "",
      this.theme.fg(attention.length ? "warning" : "success", `${attention.length} attention item${attention.length === 1 ? "" : "s"}`),
      this.theme.fg("warning", row.blocker ?? ""),
      this.theme.fg("muted", row.nextAction ?? "No next action recorded"),
      "",
      row.detailTarget ? this.theme.fg("dim", "enter/d: load durable detail") : this.theme.fg("dim", "plan-only: no durable detail"),
    ].map((line) => truncateToWidth(line, width, "…"));
  }

  private detailLines(detail: any, width: number): string[] {
    const status = detail.status ?? {};
    const usage = detail.usage ?? detail.spend ?? {};
    const attempts = detail.attempts ?? {};
    const workers = detail.workers ?? {};
    return [
      this.theme.fg("success", this.theme.bold("DURABLE DETAIL")),
      this.theme.fg("accent", detail.id ?? detail.workRef?.id ?? "unknown"),
      "",
      `state      ${status.state ?? status.lifecycle ?? "—"}`,
      `outcome    ${status.outcome ?? detail.outcome ?? "—"}`,
      `stage      ${status.currentStage ?? detail.currentStage ?? "—"}`,
      `attempts   ${attempts.total ?? attempts.length ?? 0}`,
      `workers    ${workers.total ?? workers.length ?? 0}`,
      `attention  ${(detail.attention ?? []).length}`,
      `cost       ${money(usage.costUsdKnown, usage.rowsMissingCost)}`,
      "",
      this.theme.fg("muted", status.blocker ?? detail.blocker ?? detail.nextAction ?? "No blocker recorded"),
      "",
      this.theme.fg("dim", "r refreshes · arrows return to selection"),
    ].map((line) => truncateToWidth(line, width, "…"));
  }

  private attentionView(width: number): string[] {
    const items = Array.isArray(this.snapshot.operations.attention) ? this.snapshot.operations.attention : [];
    this.selected = Math.min(this.selected, Math.max(0, items.length - 1));
    const severityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const max = Math.max(1, ...items.map((item: any) => severityRank[item.severity] ?? 1));
    const lines = items.slice(0, 30).map((item: any, index: number) => {
      const selected = index === this.selected;
      const severity = String(item.severity ?? "unknown");
      const color = severity === "critical" ? "error" : severity === "high" ? "warning" : "muted";
      const signal = bar(severityRank[severity] ?? 1, max, 4, this.theme, color);
      const owner = plainPad(String(item.owner ?? "—"), 10);
      const condition = plainPad(String(item.condition ?? "unknown"), 25);
      const title = plainPad(item.subjectTitle?.value ?? item.id ?? "unknown", Math.max(12, width - 58));
      const line = `${selected ? this.theme.fg("accent", "▸") : " "} ${signal} ${owner} ${condition} ${title}`;
      return selected ? this.theme.bg("selectedBg", line) : line;
    });
    if (!lines.length) lines.push(this.theme.fg("success", "✓ Nothing needs attention"));
    const selected = items[this.selected];
    const detail = selected
      ? [
          this.theme.fg("warning", this.theme.bold(selected.condition ?? "attention")),
          selected.detail ?? "",
          "",
          `owner       ${selected.owner ?? "—"}`,
          `state       ${selected.state ?? "—"}`,
          `subject     ${selected.subjectKind ?? selected.kind}:${selected.subjectId ?? selected.id}`,
          `opened      ${age(selected.openedAt)}`,
          "",
          this.theme.fg("accent", selected.recommendedAction?.text ?? "No action recorded"),
        ]
      : ["No active attention"];
    return [
      ...panel(`Active attention · ${items.length}`, lines, width, this.theme, items.length > 0),
      ...panel("Selected condition", detail, width, this.theme),
    ];
  }

  private usageView(width: number): string[] {
    const history = this.snapshot.history;
    if (!history) return panel("Usage", [this.theme.fg("warning", "History unavailable")], width, this.theme);
    const metrics = history.metrics ?? {};
    const cards = [
      `cost ${this.theme.fg("accent", money(metrics.costUsdKnown, metrics.rowsMissingCost))}`,
      `tokens ${this.theme.fg("accent", compactNumber((metrics.inputTokens ?? 0) + (metrics.outputTokens ?? 0) + (metrics.cacheReadTokens ?? 0) + (metrics.cacheWriteTokens ?? 0)))}`,
      `attempts ${this.theme.fg("success", compactNumber(metrics.attemptsStarted ?? 0))}`,
      `rework ${this.theme.fg((metrics.reworkRate ?? 0) > 0.2 ? "warning" : "success", `${((metrics.reworkRate ?? 0) * 100).toFixed(1)}%`)}`,
      `failures ${this.theme.fg((metrics.failureRate ?? 0) > 0.2 ? "error" : "success", `${((metrics.failureRate ?? 0) * 100).toFixed(1)}%`)}`,
    ];
    const series = Array.isArray(history.series) ? history.series : [];
    const providerRows = series.map((item: any) => {
      const buckets = item.buckets ?? [];
      const costs = buckets.map((bucket: any) => Number(bucket.metrics?.costUsdKnown ?? 0));
      const attempts = buckets.map((bucket: any) => Number(bucket.metrics?.attemptsStarted ?? 0));
      const totalCost = costs.reduce((sum: number, value: number) => sum + value, 0);
      const totalAttempts = attempts.reduce((sum: number, value: number) => sum + value, 0);
      return `${plainPad(item.label ?? item.key ?? "unknown", 16)} ${sparkline(costs, this.theme, "accent")}  ${plainPad(money(totalCost), 11, "right")}  ${plainPad(`${totalAttempts} attempts`, 13, "right")}`;
    });
    const daily = series[0]?.buckets?.map((bucket: any) => Number(bucket.metrics?.costUsdKnown ?? 0)) ?? [];
    const chartWidth = Math.min(60, Math.max(12, width - 18));
    const recent = daily.slice(-chartWidth);
    return [
      ...panel("30-day pulse", [cards.join("  ·  "), `daily spend  ${sparkline(recent, this.theme, "accent")}`], width, this.theme, true),
      ...panel("Provider lanes", providerRows.length ? providerRows : [this.theme.fg("dim", "No provider usage")], width, this.theme),
      ...panel(
        "Settlement outcomes",
        [
          Object.entries(metrics.settlements ?? {})
            .map(([name, count]) => `${name} ${this.theme.fg("accent", String(count))}`)
            .join("  ·  "),
          `cache read ${compactNumber(metrics.cacheReadTokens ?? 0)}  cache write ${compactNumber(metrics.cacheWriteTokens ?? 0)}  output ${compactNumber(metrics.outputTokens ?? 0)}`,
        ],
        width,
        this.theme,
      ),
    ];
  }

  private agentsView(width: number): string[] {
    const sessions = this.snapshot.sessions;
    if (!sessions) return panel("Agents", [this.theme.fg("warning", "Session inventory unavailable")], width, this.theme);
    const summary = sessions.summary ?? {};
    const rows = Array.isArray(sessions.rows) ? sessions.rows : [];
    this.selected = Math.min(this.selected, Math.max(0, rows.length - 1));
    const metrics = [
      `active ${this.theme.fg("success", String(summary.active ?? 0))}`,
      `historical ${summary.historical ?? 0}`,
      `Herdr ${summary.ownedHerdr ?? 0}`,
      `process ${summary.process ?? 0}`,
      `unknown ${this.theme.fg((summary.unknownHost ?? 0) > 0 ? "warning" : "dim", String(summary.unknownHost ?? 0))}`,
    ].join("  ·  ");
    const lines = rows.slice(0, 30).map((row: any, index: number) => {
      const selected = index === this.selected;
      const activity = String(row.attempt?.activity ?? "unknown");
      const color = activity === "running" ? "success" : activity === "failed" ? "error" : "muted";
      const line = `${selected ? this.theme.fg("accent", "▸") : " "} ${this.theme.fg(color, plainPad(activity, 10))} ${plainPad(`${row.provider ?? "?"}/${row.model ?? "?"}`, 25)} ${plainPad(row.stage ?? "—", 12)} ${plainPad(row.runId ?? "—", 20)} ${plainPad(row.hostMode ?? "—", 14)} ${plainPad(age(row.attempt?.updatedAt), 4, "right")}`;
      return selected ? this.theme.bg("selectedBg", line) : line;
    });
    if (!lines.length) lines.push(this.theme.fg("dim", "No durable provider attempts"));
    const selected = rows[this.selected];
    const detail = selected
      ? [
          this.theme.fg("accent", this.theme.bold(selected.identity?.displayTitle ?? selected.runId ?? "agent")),
          `attempt     ${selected.attemptId ?? "—"}`,
          `packet      ${selected.packetId ?? "—"}`,
          `provider    ${selected.provider ?? "—"}/${selected.model ?? "—"}`,
          `host        ${selected.hostMode ?? "—"}`,
          `recovery    ${selected.recovery ?? "—"}`,
          `heartbeat   ${age(selected.attempt?.lastHeartbeatAt)}`,
          `intervene   ${selected.pendingInterventions ?? 0} pending`,
          this.theme.fg("muted", selected.recommendedAction ?? "none"),
        ]
      : ["No selected attempt"];
    return [
      ...panel("Fleet", [metrics], width, this.theme, true),
      ...panel("Provider attempts", lines, width, this.theme),
      ...panel("Selected agent", detail, width, this.theme),
    ];
  }

  private footer(width: number): string[] {
    const loaded = new Date(this.snapshot.loadedAt).toLocaleTimeString();
    const status = this.message
      ? this.theme.fg(this.busy ? "warning" : "muted", this.message)
      : this.theme.fg("dim", `snapshot ${loaded}`);
    const keys = this.theme.fg("dim", "1–4/tab views  ←→ groups  ↑↓/jk select  enter detail  r refresh  q close");
    return [status, plainPad(keys, width)];
  }
}
