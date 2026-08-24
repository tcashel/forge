import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { StringEnum } from "@earendil-works/pi-ai";
import {
  BorderedLoader,
  type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { addOptional, asToolResult, callForged, modelText } from "./cli.ts";
import { ForgeDashboard, loadDashboard } from "./dashboard.ts";

const extensionDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(extensionDir, "..");

const SubjectKind = StringEnum(["run", "epic"] as const);
const SubmitKind = StringEnum(["slice", "epic"] as const);
const QueueGroup = StringEnum([
  "needs-me",
  "ready-to-merge",
  "running",
  "stalled-or-recoverable",
  "planned",
] as const);
const WorkSource = StringEnum(["durable", "live-plan"] as const);
const HistoryGroup = StringEnum(["none", "repository", "epic", "stage", "provider"] as const);
const ControlAction = StringEnum(["epic-pause", "epic-resume", "run-cancel"] as const);
const AttentionAction = StringEnum(["list", "acknowledge", "resolve", "reopen"] as const);
const AttentionState = StringEnum(["active", "open", "all"] as const);
const AttentionDisposition = StringEnum([
  "fixed",
  "accepted-risk",
  "accepted-unknown",
  "superseded",
  "evidence-absent",
  "automatic",
] as const);

function runIdFrom(result: Record<string, any>, fallback: string): string {
  const candidate = result.runId ?? result.run_id ?? result.id ?? result.run?.id;
  return typeof candidate === "string" && candidate.trim() ? candidate : fallback;
}

function renderToolResult(result: any, _options: any, theme: any) {
  const details = result.details as { result?: Record<string, any>; schema?: string } | undefined;
  const value = details?.result;
  const schema = details?.schema ?? value?.schema ?? "forged result";
  const ok = result.isError ? theme.fg("error", "✗") : theme.fg("success", "✓");
  const summary = value?.counts
    ? ` · ${value.counts.live ?? 0} live · ${value.counts.attention ?? 0} attention`
    : value?.id
      ? ` · ${value.id}`
      : "";
  return {
    render: () => [`${ok} ${theme.fg("toolTitle", theme.bold(schema))}${theme.fg("muted", summary)}`],
    invalidate() {},
  };
}

export default function forgedPiExtension(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "forged_overview",
    label: "Forge Overview",
    description:
      "Read the bounded authoritative Forge queue: Beads plans plus durable Forged work, attention, health, and spend. This tool is read-only.",
    promptSnippet: "Inspect the Forge portfolio, queue, source health, attention, and spend",
    promptGuidelines: [
      "Use forged_overview before selecting Forge work; never infer a mutation target from a title alone.",
    ],
    parameters: Type.Object({
      repository: Type.Optional(Type.String({ description: "Exact canonical repository path" })),
      group: Type.Optional(QueueGroup),
      source: Type.Optional(WorkSource),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 500, default: 100 })),
    }),
    async execute(_id, params, signal) {
      const args = ["operations", "overview"];
      addOptional(args, "--repo", params.repository);
      addOptional(args, "--group", params.group);
      addOptional(args, "--source", params.source);
      addOptional(args, "--limit", params.limit ?? 100);
      return asToolResult(await callForged(pi, args, signal));
    },
    renderResult: renderToolResult,
  });

  pi.registerTool({
    name: "forged_detail",
    label: "Forge Work Detail",
    description:
      "Read exact durable status, attempts, workers, gates, evidence, usage, attention, and events for one canonical Forge run or epic.",
    parameters: Type.Object({
      subjectKind: SubjectKind,
      subjectId: Type.String({ minLength: 1, description: "Exact canonical run or epic id" }),
      eventLimit: Type.Optional(Type.Integer({ minimum: 1, maximum: 1000, default: 100 })),
    }),
    async execute(_id, params, signal) {
      const args = [
        "work",
        "detail",
        "--subject-kind",
        params.subjectKind,
        "--subject-id",
        params.subjectId,
        "--limit",
        String(params.eventLimit ?? 100),
      ];
      return asToolResult(await callForged(pi, args, signal));
    },
    renderResult: renderToolResult,
  });

  pi.registerTool({
    name: "forged_history",
    label: "Forge History",
    description:
      "Read bounded cross-run throughput, attempts, rework, settlement, token, and cost history from the durable Forge ledger.",
    parameters: Type.Object({
      groupBy: Type.Optional(HistoryGroup),
      repository: Type.Optional(Type.String()),
      epic: Type.Optional(Type.String()),
      subject: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 200, default: 50 })),
    }),
    async execute(_id, params, signal) {
      const args = ["work", "history"];
      addOptional(args, "--group-by", params.groupBy);
      addOptional(args, "--repo", params.repository);
      addOptional(args, "--epic", params.epic);
      addOptional(args, "--subject", params.subject);
      addOptional(args, "--limit", params.limit ?? 50);
      return asToolResult(await callForged(pi, args, signal));
    },
    renderResult: renderToolResult,
  });

  pi.registerTool({
    name: "forged_sessions",
    label: "Forge Agent Sessions",
    description:
      "Read the durable inventory of provider attempts, host ownership, recovery, and interventions. This is diagnostic and read-only.",
    parameters: Type.Object({
      run: Type.Optional(Type.String()),
      epic: Type.Optional(Type.String()),
      repository: Type.Optional(Type.String()),
      provider: Type.Optional(Type.String()),
      model: Type.Optional(Type.String()),
      includeHistorical: Type.Optional(Type.Boolean({ default: false })),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 500, default: 100 })),
    }),
    async execute(_id, params, signal) {
      const args = ["session", "inventory"];
      addOptional(args, "--run", params.run);
      addOptional(args, "--epic", params.epic);
      addOptional(args, "--repository", params.repository);
      addOptional(args, "--provider", params.provider);
      addOptional(args, "--model", params.model);
      if (params.includeHistorical) args.push("--include-historical");
      addOptional(args, "--limit", params.limit ?? 100);
      return asToolResult(await callForged(pi, args, signal));
    },
    renderResult: renderToolResult,
  });

  pi.registerTool({
    name: "forged_submit",
    label: "Submit to Forge",
    description:
      "After explicit operator approval, freeze and submit one ready native Bead slice or epic to the detached Forged controller. Performs exactly start then submit and never merges.",
    promptGuidelines: [
      "Call forged_submit only after the shared Forge skill has presented and received explicit approval for the exact subject, repository, base, profile, and roster.",
    ],
    parameters: Type.Object({
      kind: SubmitKind,
      id: Type.String({ minLength: 1, description: "Bead id for a slice or epic id" }),
      repository: Type.String({ minLength: 1, description: "Canonical absolute repository path" }),
      profile: Type.Optional(Type.String({ default: "standard" })),
      roster: Type.Optional(Type.String({ default: "default" })),
      baseRef: Type.Optional(Type.String()),
    }),
    async execute(_id, params, signal) {
      const startArgs = params.kind === "slice"
        ? ["run", "start", "--bead", params.id, "--repo", params.repository]
        : ["epic", "start", "--epic", params.id, "--repo", params.repository];
      addOptional(startArgs, "--profile", params.profile ?? "standard");
      addOptional(startArgs, "--roster", params.roster ?? "default");
      addOptional(startArgs, "--base-ref", params.baseRef);
      const started = await callForged(pi, startArgs, signal, 60_000);
      const subjectId = params.kind === "slice" ? runIdFrom(started.result, params.id) : params.id;
      const submitArgs = params.kind === "slice"
        ? ["run", "submit", "--run", subjectId]
        : ["epic", "submit", "--epic", subjectId];
      const submitted = await callForged(pi, submitArgs, signal, 60_000);
      const result = {
        schema: "forged.pi-submission/1",
        kind: params.kind,
        subjectId,
        start: started.result,
        submit: submitted.result,
        reconnect: params.kind === "slice"
          ? [`forged work detail --subject-kind run --subject-id ${subjectId}`, `forged run status --run ${subjectId}`]
          : [`forged work detail --subject-kind epic --subject-id ${subjectId}`, `forged epic status --epic ${subjectId}`],
      };
      return {
        content: [{ type: "text", text: modelText(result) }],
        details: { schema: result.schema, result },
      };
    },
    renderResult: renderToolResult,
  });

  pi.registerTool({
    name: "forged_control",
    label: "Control Forge Work",
    description:
      "Apply one exact existing-work lifecycle control: pause/resume an epic or cancel a run, then read back durable detail. Never starts or submits work.",
    parameters: Type.Object({
      action: ControlAction,
      subjectId: Type.String({ minLength: 1 }),
      reason: Type.String({ minLength: 1 }),
      idempotencyKey: Type.Optional(Type.String()),
    }),
    async execute(_id, params, signal, _update, ctx) {
      if (params.action === "run-cancel" && ctx.hasUI) {
        const confirmed = await ctx.ui.confirm(
          "Cancel durable Forge run?",
          `${params.subjectId}\n\n${params.reason}\n\nThis terminalizes the run as cancelled.`,
        );
        if (!confirmed) throw new Error("Run cancellation was not confirmed");
      }
      const args = params.action === "epic-pause"
        ? ["epic", "pause", "--epic", params.subjectId, "--reason", params.reason]
        : params.action === "epic-resume"
          ? ["epic", "resume", "--epic", params.subjectId, "--reason", params.reason]
          : ["run", "stop", "--run", params.subjectId, "--outcome", "cancelled", "--reason", params.reason];
      addOptional(args, "--idempotency-key", params.idempotencyKey);
      const controlled = await callForged(pi, args, signal, 60_000);
      const kind = params.action.startsWith("epic-") ? "epic" : "run";
      const detail = await callForged(pi, [
        "work",
        "detail",
        "--subject-kind",
        kind,
        "--subject-id",
        params.subjectId,
        "--limit",
        "100",
      ], signal);
      const result = {
        schema: "forged.pi-control/1",
        action: params.action,
        subjectId: params.subjectId,
        transition: controlled.result,
        readback: detail.result,
      };
      return {
        content: [{ type: "text", text: modelText(result) }],
        details: { schema: result.schema, result },
      };
    },
    renderResult: renderToolResult,
  });

  pi.registerTool({
    name: "forged_attention",
    label: "Forge Attention",
    description:
      "List authoritative Forge attention or apply one occurrence-fenced custody transition. Attention controls never resume, retry, settle, or merge work.",
    parameters: Type.Object({
      action: AttentionAction,
      repository: Type.Optional(Type.String()),
      state: Type.Optional(AttentionState),
      condition: Type.Optional(Type.String()),
      subject: Type.Optional(Type.String()),
      attentionId: Type.Optional(Type.String()),
      occurrenceId: Type.Optional(Type.String()),
      actor: Type.Optional(Type.String()),
      disposition: Type.Optional(AttentionDisposition),
      note: Type.Optional(Type.String()),
      idempotencyKey: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 500, default: 100 })),
    }),
    async execute(_id, params, signal) {
      if (params.action === "list") {
        const args = ["attention", "list"];
        addOptional(args, "--repo", params.repository);
        addOptional(args, "--state", params.state);
        addOptional(args, "--condition", params.condition);
        addOptional(args, "--limit", params.limit ?? 100);
        return asToolResult(await callForged(pi, args, signal));
      }
      for (const [name, value] of [
        ["subject", params.subject],
        ["attentionId", params.attentionId],
        ["occurrenceId", params.occurrenceId],
        ["actor", params.actor],
      ] as const) {
        if (!value?.trim()) throw new Error(`${name} is required for ${params.action}`);
      }
      if (params.action === "resolve" && !params.disposition) {
        throw new Error("disposition is required for attention resolution");
      }
      const verb = params.action === "acknowledge" ? "acknowledge" : params.action;
      const args = [
        "attention",
        verb,
        "--subject",
        params.subject!,
        "--attention-id",
        params.attentionId!,
        "--occurrence-id",
        params.occurrenceId!,
        "--actor",
        params.actor!,
      ];
      addOptional(args, "--disposition", params.disposition);
      addOptional(args, "--note", params.note);
      addOptional(args, "--idempotency-key", params.idempotencyKey);
      return asToolResult(await callForged(pi, args, signal));
    },
    renderResult: renderToolResult,
  });

  pi.registerTool({
    name: "forged_critic",
    label: "Forge Spec Critic",
    description:
      "Run the shared Forge critic as an isolated read-only Pi process against a rendered native Bead specification and repository.",
    parameters: Type.Object({
      bead: Type.String({ minLength: 1, description: "Complete rendered native Bead JSON or text" }),
      repository: Type.String({ minLength: 1, description: "Canonical repository path" }),
      model: Type.Optional(Type.String({ description: "Optional Pi provider/model coordinate" })),
    }),
    async execute(_id, params, signal, onUpdate) {
      const scratch = await mkdtemp(join(tmpdir(), "forged-pi-critic-"));
      const taskPath = join(scratch, "bead.md");
      try {
        await writeFile(taskPath, params.bead, { encoding: "utf8", mode: 0o600 });
        const criticPath = join(pluginRoot, "agents", "critic.md");
        const critic = await readFile(criticPath, "utf8");
        const body = critic.replace(/^---\n[\s\S]*?\n---\n/, "");
        const systemPath = join(scratch, "critic-system.md");
        await writeFile(systemPath, body, { encoding: "utf8", mode: 0o600 });
        const args = [
          "--mode",
          "json",
          "-p",
          "--no-session",
          "--no-extensions",
          "--approve",
          "--tools",
          "read,bash,grep,find,ls",
          "--append-system-prompt",
          systemPath,
        ];
        if (params.model) args.push("--model", params.model);
        args.push(`@${taskPath}`, "Critique this complete native Bead against the repository. Return only the required fenced critique block.");
        onUpdate?.({ content: [{ type: "text", text: "Running shared read-only Forge critic…" }] });
        const execution = await pi.exec(process.env.PI_BIN?.trim() || "pi", args, {
          cwd: params.repository,
          signal,
          timeout: 15 * 60_000,
        });
        let final = "";
        let usage: any;
        for (const line of execution.stdout.split("\n")) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "message_end" && event.message?.role === "assistant") {
              final = (event.message.content ?? [])
                .filter((part: any) => part.type === "text")
                .map((part: any) => part.text)
                .join("\n");
              usage = event.message.usage;
            }
          } catch {
            // JSON mode may be followed by a partial line on abrupt exit; the
            // process outcome below remains authoritative.
          }
        }
        if (execution.code !== 0 || !final) {
          throw new Error(execution.stderr.trim() || `Pi critic exited ${execution.code} without a final response`);
        }
        return {
          content: [{ type: "text", text: final }],
          details: { result: { critique: final, model: params.model, usage } },
          usage,
        };
      } finally {
        await rm(scratch, { recursive: true, force: true });
      }
    },
    renderResult: renderToolResult,
  });

  pi.registerCommand("forge", {
    description: "Open the Forge operations cockpit",
    handler: async (args, ctx) => {
      if (ctx.mode !== "tui") {
        const call = await callForged(pi, ["operations", "overview", "--limit", "100"]);
        pi.sendMessage({
          customType: "forged-dashboard",
          content: modelText(call.result),
          display: true,
        });
        return;
      }
      const repository = args.trim() || undefined;
      const snapshot = await ctx.ui.custom<any>((tui, theme, _keybindings, done) => {
        const loader = new BorderedLoader(tui, theme, "Loading Forge control plane…");
        loader.onAbort = () => done(null);
        loadDashboard(pi, repository).then(done).catch((error) => done({ error: String(error) }));
        return loader;
      });
      if (!snapshot) return;
      if (snapshot.error) {
        ctx.ui.notify(snapshot.error, "error");
        return;
      }
      await ctx.ui.custom<void>((tui, theme, _keybindings, done) =>
        new ForgeDashboard(snapshot, pi, theme, () => tui.requestRender(), () => done(), repository),
      );
    },
  });

  pi.on("session_start", (_event, ctx) => {
    ctx.ui.setStatus("forged", ctx.ui.theme.fg("muted", "◆ forge"));
  });

  pi.on("session_shutdown", (_event, ctx) => {
    ctx.ui.setStatus("forged", undefined);
  });
}
