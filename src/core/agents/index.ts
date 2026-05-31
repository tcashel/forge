import { spawn, type ChildProcess } from "node:child_process";
import * as path from "node:path";
import type { LaunchTarget } from "../store.ts";

export type AgentSpawnImpl = (binary: string, args: string[], cwd?: string) => ChildProcess;

export interface AgentCommandOptions {
  reasoningEffort?: "low" | "medium" | "high" | "xhigh";
}

export interface AgentInvocation {
  binary: string;
  args: string[];
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

export function planChatInvocation(model: string): AgentInvocation {
  return {
    binary: "claude",
    args: [
      "--print",
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
