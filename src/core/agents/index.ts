import { type ChildProcess, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readResultFromFile } from "../claude-stream.ts";
import { readCodexResultFromFile } from "../codex-stream.ts";
import { type CostSource, estimateCost } from "../pricing.ts";
import type { LaunchTarget } from "../store.ts";

export type AgentSpawnImpl = (binary: string, args: string[], cwd?: string) => ChildProcess;

export interface AgentCommandOptions {
  reasoningEffort?: "low" | "medium" | "high" | "xhigh";
}

export interface AgentInvocation {
  binary: string;
  args: string[];
}

export interface NativeAgentSession {
  agent: LaunchTarget;
  sessionId: string;
}

export interface LocateTranscriptOptions {
  configDir?: string;
}

export function agentCommand(
  target: LaunchTarget,
  model: string,
  promptFile: string,
  opts?: AgentCommandOptions,
): string {
  switch (target) {
    case "claude":
      return `claude --print --dangerously-skip-permissions --model "${model}" < "${promptFile}"`;
    case "codex": {
      const reasoningFlag = opts?.reasoningEffort ? ` --config reasoning_effort=${opts.reasoningEffort}` : "";
      return `codex exec --model "${model}"${reasoningFlag} --dangerously-bypass-approvals-and-sandbox --add-dir "${path.dirname(promptFile)}" "$(cat '${promptFile}')"`;
    }
    case "opencode":
      // opencode `run` takes the message as a positional. Headless mode auto-approves
      // tool calls (verified via smoke test).
      return `opencode run --model "${model}" "$(cat '${promptFile}')"`;
    case "gemini":
      // -y is gemini's "yolo" mode — auto-approve all tool calls. Equivalent of
      // claude's --dangerously-skip-permissions and codex's --dangerously-bypass-approvals-and-sandbox.
      return `gemini -y -m "${model}" -p "$(cat '${promptFile}')"`;
  }
}

/**
 * Shell-quoted bun command that reads stream-json line-by-line from stdin
 * and emits the final assistant text exactly once. Exported so tests can
 * pipe fixtures through the same projection that production uses.
 *
 * Why bun and not jq: README only lists bun/tmux/git/gh and the agent CLIs
 * as launcher requirements. Adding jq as a soft dep would silently break
 * launches on hosts where it isn't installed (jq missing → exit 127 under
 * `set -uo pipefail`, run marked failed even though claude ran fine).
 *
 * Why project only the `result` event: `claude --print --output-format
 * stream-json` emits the final answer twice — once on the last
 * `assistant` content block and again on the terminating `result` event.
 * Plain `claude --print` (no stream-json) emits it once, and AC11 says
 * LogTab must keep that original shape.
 */
export const claudeJobStreamFilter = `bun -e "const rl=require('readline').createInterface({input:process.stdin});rl.on('line',l=>{try{const e=JSON.parse(l);if(e.type==='result'&&typeof e.result==='string')process.stdout.write(e.result+'\\n')}catch{}})"`;

/**
 * Job-runner-only claude invocation. Emits stream-json so the runner can
 * tee the raw events into a sidecar file (for token + cost extraction)
 * and pipe a human-readable projection to the log file.
 */
export function claudeJobCommand(model: string, promptFile: string, streamPath: string): string {
  return `claude --print --output-format stream-json --verbose --dangerously-skip-permissions --model "${model}" < "${promptFile}" | tee "${streamPath}" | ${claudeJobStreamFilter}`;
}

/**
 * Codex analogue of `claudeJobStreamFilter`. `codex exec --json` emits one
 * JSONL event per line; the final answer arrives as an `item.completed`
 * event whose `item.type === "agent_message"`. Project each agent message's
 * text so downstream consumers (review-verdict extraction, log files) keep
 * seeing plain text exactly as the non-streaming `codex exec` did.
 */
export const codexJobStreamFilter = `bun -e "const rl=require('readline').createInterface({input:process.stdin});rl.on('line',l=>{try{const e=JSON.parse(l);if(e.type==='item.completed'&&e.item&&e.item.type==='agent_message'&&typeof e.item.text==='string')process.stdout.write(e.item.text+'\\n')}catch{}})"`;

/**
 * Job-runner-only codex invocation. Mirrors `claudeJobCommand`: runs
 * `codex exec --json`, tees the raw JSONL events into a sidecar (for token
 * extraction via readCodexResultFromFile) and projects the final assistant
 * message to stdout via `codexJobStreamFilter`.
 */
export function codexJobCommand(
  model: string,
  promptFile: string,
  streamPath: string,
  opts?: AgentCommandOptions,
): string {
  const reasoningFlag = opts?.reasoningEffort ? ` --config reasoning_effort=${opts.reasoningEffort}` : "";
  return `codex exec --json --model "${model}"${reasoningFlag} --dangerously-bypass-approvals-and-sandbox --add-dir "${path.dirname(promptFile)}" "$(cat '${promptFile}')" | tee "${streamPath}" | ${codexJobStreamFilter}`;
}

/**
 * Adapter-aware job command for token capture. claude and codex stream
 * JSONL into `streamPath` and project plain final text to stdout; other
 * adapters fall back to the plain `agentCommand` (no sidecar, no tokens).
 * Pair with `adapterStreamsTokens` to decide whether to pass the sidecar
 * to `forge session finish --stream-json-path` / parse it after the run.
 */
export function agentJobCommand(
  target: LaunchTarget,
  model: string,
  promptFile: string,
  streamPath: string,
  opts?: AgentCommandOptions,
): string {
  switch (target) {
    case "claude":
      return claudeJobCommand(model, promptFile, streamPath);
    case "codex":
      return codexJobCommand(model, promptFile, streamPath, opts);
    default:
      return agentCommand(target, model, promptFile, opts);
  }
}

/** True for adapters whose `agentJobCommand` writes a parseable token sidecar. */
export function adapterStreamsTokens(target: LaunchTarget): boolean {
  return target === "claude" || target === "codex";
}

/** Metrics patch (subset of SessionMetrics) extracted from a token sidecar. */
export interface SidecarMetricsPatch {
  durationMs: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
  cacheRead: number | null;
  cacheCreate: number | null;
  costUsd: number | null;
  costSource: CostSource | null;
  modelPricedAt: string | null;
}

/**
 * Parse a token sidecar written by `agentJobCommand` into a metrics patch.
 * Picks the adapter-correct parser (codex → turn.completed usage, else →
 * claude `result`), then falls back to the price table for cost when the
 * provider didn't report one (codex always; claude never, since it omits
 * itself from the table). Shared by the launch finish hook and the
 * in-process review / comment-fix workers.
 */
export async function captureSidecarMetrics(
  adapter: string,
  model: string | null,
  streamPath: string,
): Promise<SidecarMetricsPatch> {
  const r = adapter === "codex" ? await readCodexResultFromFile(streamPath) : await readResultFromFile(streamPath);
  const costSource: CostSource | null = r.totalCostUsd !== null ? "provider" : null;
  const patch: SidecarMetricsPatch = {
    durationMs: r.durationMs,
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
    cacheRead: r.cacheRead,
    cacheCreate: r.cacheCreate,
    costUsd: r.totalCostUsd,
    costSource,
    modelPricedAt: null,
  };
  if (costSource === null) {
    const est = estimateCost({ agentAdapter: adapter, model, tokensIn: r.tokensIn, tokensOut: r.tokensOut });
    return { ...patch, ...est };
  }
  return patch;
}

export function mintNativeSession(agent: LaunchTarget): NativeAgentSession {
  return { agent, sessionId: randomUUID() };
}

export function planChatInvocation(model: string, session?: { sessionId: string; resume: boolean }): AgentInvocation {
  const sessionArgs = session
    ? session.resume
      ? ["--resume", session.sessionId]
      : ["--session-id", session.sessionId]
    : [];
  return {
    binary: "claude",
    args: [
      "--print",
      ...sessionArgs,
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
      "--dangerously-skip-permissions",
      "--model",
      model,
    ],
  };
}

export function defaultAgentSpawn(binary: string, args: string[], cwd?: string): ChildProcess {
  return spawn(binary, args, { stdio: ["pipe", "pipe", "pipe"], env: process.env, cwd });
}

export function locateTranscript(session: NativeAgentSession, opts: LocateTranscriptOptions = {}): string {
  if (session.agent !== "claude") {
    throw new Error(`native transcript lookup is not implemented for ${session.agent}`);
  }
  const projectsDir = path.join(opts.configDir ?? path.join(os.homedir(), ".claude"), "projects");
  const target = `${session.sessionId}.jsonl`;
  const matches: string[] = [];

  const visit = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        visit(full);
      } else if (ent.isFile() && ent.name === target) {
        matches.push(full);
      }
    }
  };

  visit(projectsDir);
  if (matches.length === 0) {
    throw new Error(`Claude transcript ${target} was not found under ${projectsDir}`);
  }
  matches.sort();
  return matches[0];
}
