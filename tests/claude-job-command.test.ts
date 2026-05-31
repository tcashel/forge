import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { claudeJobCommand, claudeJobStreamFilter } from "../src/core/agents/index.ts";

test("claudeJobCommand emits stream-json with a tee + bun projection", () => {
  const cmd = claudeJobCommand("claude-opus-4-7", "/tmp/p.txt", "/tmp/run/agent.stream.jsonl");
  assert.ok(cmd.includes("--output-format stream-json"), `missing stream-json flag: ${cmd}`);
  assert.ok(cmd.includes("--verbose"), `missing --verbose: ${cmd}`);
  assert.ok(cmd.includes("--dangerously-skip-permissions"), `missing --dangerously-skip-permissions: ${cmd}`);
  assert.ok(cmd.includes('tee "/tmp/run/agent.stream.jsonl"'), `missing tee for stream: ${cmd}`);
  assert.ok(cmd.includes("bun -e"), `missing bun projection: ${cmd}`);
  assert.ok(!cmd.includes("jq "), `jq dependency should not be present: ${cmd}`);
  assert.ok(cmd.includes('"claude-opus-4-7"'), `model not embedded literally: ${cmd}`);
});

test("stream filter emits the final answer exactly once (AC11)", () => {
  // The assistant and result events both carry the final text. If the
  // projection forwards both, $LOG_FILE shows the answer twice — that's
  // the regression the reviewer flagged.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const fixture = path.join(here, "fixtures", "claude-stream-result.jsonl");
  const projection = execSync(`cat "${fixture}" | ${claudeJobStreamFilter}`, { encoding: "utf-8" });
  const occurrences = projection.split(/\n/).filter((line) => line === "done").length;
  assert.equal(occurrences, 1, `expected the final answer once, got ${occurrences} copies:\n${projection}`);
  assert.ok(!projection.includes('"type"'), `raw JSON event leaked into log projection:\n${projection}`);
});
