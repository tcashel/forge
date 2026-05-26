import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { agentCommand } from "../src/core/launch.ts";
import type { LaunchTarget } from "../src/core/store.ts";

interface AgentCase {
  target: LaunchTarget;
  binary: string;
  helpArgs: string[];
}

const CASES: AgentCase[] = [
  { target: "claude", binary: "claude", helpArgs: ["--help"] },
  { target: "codex", binary: "codex", helpArgs: ["exec", "--help"] },
  { target: "opencode", binary: "opencode", helpArgs: ["run", "--help"] },
  { target: "gemini", binary: "gemini", helpArgs: ["--help"] },
];

function binaryOnPath(binary: string): boolean {
  const r = spawnSync("which", [binary], { stdio: ["ignore", "ignore", "ignore"] });
  return r.status === 0;
}

function getHelp(binary: string, args: string[]): string {
  const r = spawnSync(binary, args, { encoding: "utf-8", timeout: 10_000 });
  return `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
}

function extractFlags(cmd: string): string[] {
  const seen = new Set<string>();
  for (const match of cmd.matchAll(/(?:^|\s)(-[-A-Za-z0-9_]+)/g)) {
    seen.add(match[1]);
  }
  return [...seen];
}

for (const c of CASES) {
  test(`agent flag drift: ${c.target}`, { skip: !binaryOnPath(c.binary) }, () => {
    const cmd = agentCommand(c.target, "dummy-model", "/tmp/forge-test-prompt.txt", {
      reasoningEffort: "low",
    });
    const help = getHelp(c.binary, c.helpArgs);
    const flags = extractFlags(cmd);
    assert.ok(flags.length > 0, `extracted no flags from ${c.target} command: ${cmd}`);
    for (const flag of flags) {
      assert.ok(
        help.includes(flag),
        `${c.target}: flag ${flag} from agentCommand() is not in '${c.binary} ${c.helpArgs.join(" ")}' output. Command: ${cmd}`,
      );
    }
  });
}
