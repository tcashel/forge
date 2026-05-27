import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
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

test("jq projection emits the final answer exactly once (AC11)", { skip: !jqAvailable() }, () => {
  // The assistant and result events both carry the final text. If the
  // projection forwards both, $LOG_FILE shows the answer twice — that's
  // the regression the reviewer flagged.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const fixture = path.join(here, "fixtures", "claude-stream-result.jsonl");
  const cmd = claudeJobCommand("claude-opus-4-7", "/tmp/p.txt", "/tmp/agent.stream.jsonl");
  // Extract the jq invocation embedded in the runner command, then pipe
  // the fixture through it directly.
  const jqMatch = cmd.match(/(jq -r[^|]+?)'/);
  assert.ok(jqMatch, `couldn't locate jq invocation in: ${cmd}`);
  // The match captures the part before the closing quote; reconstruct.
  const jqStart = cmd.indexOf("jq -r");
  const tail = cmd.slice(jqStart);
  // Strip leading "jq -r ", then drop the trailing pipe (none) — the jq
  // call is the last command in the pipeline.
  const jqInvocation = tail.trim();
  const projection = execSync(`cat "${fixture}" | ${jqInvocation}`, { encoding: "utf-8" });
  const occurrences = projection.split(/\n/).filter((line) => line === "done").length;
  assert.equal(occurrences, 1, `expected the final answer once, got ${occurrences} copies:\n${projection}`);
  // Ensure no JSON keys leaked into the log shape (AC11).
  assert.ok(!projection.includes('"type"'), `raw JSON event leaked into log projection:\n${projection}`);
  // Suppress unused-var warning for the fs import even when jq isn't present.
  void fs;
});

function jqAvailable(): boolean {
  try {
    execSync("which jq", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
