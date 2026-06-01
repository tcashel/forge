import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  adapterStreamsTokens,
  agentJobCommand,
  codexJobCommand,
  codexJobStreamFilter,
} from "../src/core/agents/index.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CODEX_FIXTURE = path.join(HERE, "fixtures", "codex-stream-result.jsonl");

test("codexJobCommand streams json + tees a sidecar + projects via the codex filter", () => {
  const cmd = codexJobCommand("gpt-5.5", "/tmp/p.txt", "/tmp/run/agent.stream.jsonl");
  assert.ok(cmd.includes("codex exec --json"), `missing codex exec --json: ${cmd}`);
  assert.ok(cmd.includes('--model "gpt-5.5"'), `model not embedded literally: ${cmd}`);
  assert.ok(cmd.includes("--dangerously-bypass-approvals-and-sandbox"), `missing codex auto-approve flag: ${cmd}`);
  // The sidecar tee is what readCodexResultFromFile later reads for tokens.
  assert.ok(cmd.includes('tee "/tmp/run/agent.stream.jsonl"'), `missing tee for stream sidecar: ${cmd}`);
  // Plain-text projection for review-verdict extraction / log files.
  assert.ok(cmd.includes(codexJobStreamFilter), `missing codex stream projection: ${cmd}`);
  assert.ok(!cmd.includes("jq "), `jq dependency should not be present: ${cmd}`);
});

test("codexJobCommand threads reasoning_effort when provided", () => {
  const withEffort = codexJobCommand("gpt-5.5", "/tmp/p.txt", "/tmp/s.jsonl", { reasoningEffort: "high" });
  assert.ok(withEffort.includes("--config reasoning_effort=high"), `missing reasoning flag: ${withEffort}`);
  const without = codexJobCommand("gpt-5.5", "/tmp/p.txt", "/tmp/s.jsonl");
  assert.ok(!without.includes("reasoning_effort"), `reasoning flag should be absent: ${without}`);
});

test("agentJobCommand routes codex to codexJobCommand", () => {
  const direct = codexJobCommand("gpt-5.5", "/tmp/p.txt", "/tmp/s.jsonl", { reasoningEffort: "medium" });
  const viaDispatch = agentJobCommand("codex", "gpt-5.5", "/tmp/p.txt", "/tmp/s.jsonl", {
    reasoningEffort: "medium",
  });
  assert.equal(viaDispatch, direct, "agentJobCommand(codex) must equal codexJobCommand");
});

test("agentJobCommand falls back to the plain command for non-streaming adapters", () => {
  const cmd = agentJobCommand("opencode", "some-model", "/tmp/p.txt", "/tmp/s.jsonl");
  // Plain agentCommand: no sidecar tee, no stream filter.
  assert.ok(!cmd.includes('tee "/tmp/s.jsonl"'), `non-streaming adapter must not tee a sidecar: ${cmd}`);
  assert.ok(!cmd.includes(codexJobStreamFilter), `non-streaming adapter must not project: ${cmd}`);
  assert.ok(cmd.includes("opencode run"), `expected plain opencode command: ${cmd}`);
});

test("codex is a token-streaming adapter; opencode/gemini are not", () => {
  assert.equal(adapterStreamsTokens("codex"), true);
  assert.equal(adapterStreamsTokens("claude"), true);
  assert.equal(adapterStreamsTokens("opencode"), false);
  assert.equal(adapterStreamsTokens("gemini"), false);
});

test("codexJobStreamFilter projects only the agent_message text from the codex fixture", () => {
  // The fixture interleaves thread.started / turn.started / item.completed /
  // turn.completed. Only the agent_message text ("Hi.") must reach stdout —
  // raw JSONL must not leak, so review-verdict extraction sees plain text.
  const projection = execSync(`cat "${CODEX_FIXTURE}" | ${codexJobStreamFilter}`, { encoding: "utf-8" });
  assert.equal(projection.trim(), "Hi.", `expected only the agent message, got:\n${projection}`);
  assert.ok(!projection.includes('"type"'), `raw JSON event leaked into projection:\n${projection}`);
  assert.ok(!projection.includes("input_tokens"), `usage event leaked into projection:\n${projection}`);
});

test("launch-style execution/review/fix runner strings pass codex stream sidecars", () => {
  // Mirrors how generateRunnerScript builds the three codex command strings
  // (execution / review / fix), each with its own per-purpose sidecar that
  // the session-finish hook reads via `--stream-json-path`.
  const runDir = "/tmp/run";
  const sidecars = {
    execution: `${runDir}/agent.stream.jsonl`,
    review: `${runDir}/review.stream.jsonl`,
    fix: `${runDir}/fix.stream.jsonl`,
  };
  for (const [purpose, streamFile] of Object.entries(sidecars)) {
    const cmd = agentJobCommand("codex", "gpt-5.5", `${runDir}/${purpose}-prompt.txt`, streamFile);
    assert.ok(cmd.includes(`tee "${streamFile}"`), `${purpose}: command must tee its sidecar: ${cmd}`);
    // The runner only appends --stream-json-path for token-streaming adapters.
    assert.equal(adapterStreamsTokens("codex"), true, `${purpose}: codex must be a streaming adapter`);
    const finishArg = adapterStreamsTokens("codex") ? ` --stream-json-path "${streamFile}"` : "";
    assert.equal(
      finishArg,
      ` --stream-json-path "${streamFile}"`,
      `${purpose}: finish hook must pass the codex sidecar`,
    );
  }
});
