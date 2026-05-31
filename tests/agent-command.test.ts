import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { agentCommand, locateTranscript, mintNativeSession, planChatInvocation } from "../src/core/agents/index.ts";
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


test("native Claude session argv and transcript lookup use assigned session id", () => {
  const session = { agent: "claude" as const, sessionId: "11111111-2222-4333-8444-555555555555" };
  assert.deepEqual(planChatInvocation("claude-opus-4-8", { sessionId: session.sessionId, resume: false }).args.slice(0, 3), [
    "--print",
    "--session-id",
    session.sessionId,
  ]);
  assert.deepEqual(planChatInvocation("claude-opus-4-8", { sessionId: session.sessionId, resume: true }).args.slice(0, 3), [
    "--print",
    "--resume",
    session.sessionId,
  ]);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-claude-transcript-"));
  try {
    const transcriptDir = path.join(tmp, "projects", "arbitrary-cwd-hash");
    fs.mkdirSync(transcriptDir, { recursive: true });
    const transcript = path.join(transcriptDir, `${session.sessionId}.jsonl`);
    fs.writeFileSync(transcript, "{}\n", "utf-8");
    assert.equal(locateTranscript(session, { configDir: tmp }), transcript);
    assert.throws(
      () => locateTranscript({ agent: "claude", sessionId: "missing-session" }, { configDir: tmp }),
      /Claude transcript missing-session\.jsonl was not found/,
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("mintNativeSession assigns UUID session ids", () => {
  const session = mintNativeSession("claude");
  assert.equal(session.agent, "claude");
  assert.match(session.sessionId, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
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
