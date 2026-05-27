import { strict as assert } from "node:assert";
import { test } from "node:test";
import { claudeJobCommand } from "../src/core/launch.ts";

test("claudeJobCommand emits stream-json with a tee + jq projection", () => {
  const cmd = claudeJobCommand("claude-opus-4-7", "/tmp/p.txt", "/tmp/run/agent.stream.jsonl");
  // The shell pipeline must persist the raw stream to disk and project a
  // human-readable view onto stdout so $LOG_FILE keeps its existing shape.
  assert.ok(cmd.includes("--output-format stream-json"), `missing stream-json flag: ${cmd}`);
  assert.ok(cmd.includes("--verbose"), `missing --verbose: ${cmd}`);
  assert.ok(cmd.includes("--dangerously-skip-permissions"), `missing --dangerously-skip-permissions: ${cmd}`);
  assert.ok(cmd.includes('tee "/tmp/run/agent.stream.jsonl"'), `missing tee for stream: ${cmd}`);
  assert.ok(cmd.includes("jq -r"), `missing jq projection: ${cmd}`);
  // The model name must land verbatim — no shell-substitution placeholders.
  assert.ok(cmd.includes('"claude-opus-4-7"'), `model not embedded literally: ${cmd}`);
});
