import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { agentCommand, planChatInvocation } from "../src/core/agents/index.ts";
import type { LaunchTarget } from "../src/core/store.ts";

interface AgentCase {
  target: LaunchTarget;
  binary: string;
  helpArgs: string[];
  helpOmittedFlags?: string[];
}

const CASES: AgentCase[] = [
  { target: "claude", binary: "claude", helpArgs: ["--help"] },
  { target: "codex", binary: "codex", helpArgs: ["exec", "--help"] },
  { target: "opencode", binary: "opencode", helpArgs: ["run", "--help"] },
  { target: "gemini", binary: "gemini", helpArgs: ["--help"], helpOmittedFlags: ["-y", "-m", "-p"] },
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

test("agentCommand legacy command snapshots stay byte-identical", () => {
  const prompt = "/tmp/forge prompts/prompt.txt";
  assert.equal(
    agentCommand("claude", "claude-opus-4-8", prompt),
    'claude --print --dangerously-skip-permissions --model "claude-opus-4-8" < "/tmp/forge prompts/prompt.txt"',
  );
  assert.equal(
    agentCommand("codex", "gpt-5.1", prompt, { reasoningEffort: "high" }),
    `codex exec --model "gpt-5.1" --config reasoning_effort=high --dangerously-bypass-approvals-and-sandbox --add-dir "/tmp/forge prompts" "$(cat '/tmp/forge prompts/prompt.txt')"`,
  );
  assert.equal(
    agentCommand("opencode", "opencode-model", prompt),
    `opencode run --model "opencode-model" "$(cat '/tmp/forge prompts/prompt.txt')"`,
  );
  assert.equal(
    agentCommand("gemini", "gemini-pro", prompt),
    `gemini -y -m "gemini-pro" -p "$(cat '/tmp/forge prompts/prompt.txt')"`,
  );
});

test("plan-chat legacy claude argv snapshot stays byte-identical", () => {
  assert.deepEqual(planChatInvocation("claude-opus-4-8"), {
    binary: "claude",
    args: [
      "--print",
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
      "--dangerously-skip-permissions",
      "--model",
      "claude-opus-4-8",
    ],
  });
});

for (const c of CASES) {
  test(`agent flag drift: ${c.target}`, { skip: !binaryOnPath(c.binary) }, () => {
    const cmd = agentCommand(c.target, "dummy-model", "/tmp/forge-test-prompt.txt", {
      reasoningEffort: "low",
    });
    const help = getHelp(c.binary, c.helpArgs);
    const flags = extractFlags(cmd);
    assert.ok(flags.length > 0, `extracted no flags from ${c.target} command: ${cmd}`);
    for (const flag of flags) {
      if (c.helpOmittedFlags?.includes(flag)) continue;
      assert.ok(
        help.includes(flag),
        `${c.target}: flag ${flag} from agentCommand() is not in '${c.binary} ${c.helpArgs.join(" ")}' output. Command: ${cmd}`,
      );
    }
  });
}
