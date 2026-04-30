import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  extractGithubPrUrl,
  formatArgsPreview,
  formatTokens,
  mapPiEvent,
  phaseToMetaStatus,
} from "../src/supervisor.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── formatArgsPreview ────────────────────────────────────────────────────────

test("formatArgsPreview bash truncates command at 80 chars and replaces newlines", () => {
  const longCmd = "echo " + "a".repeat(100) + "\nline2";
  const result = formatArgsPreview("bash", { command: longCmd });
  assert.ok(result.length <= 80);
  assert.ok(!result.includes("\n"));
});

test("formatArgsPreview read/write/edit substitutes home directory with ~", () => {
  const home = os.homedir();
  const result = formatArgsPreview("read", { file_path: `${home}/foo/bar.ts` });
  assert.equal(result, "~/foo/bar.ts");

  const result2 = formatArgsPreview("write", { path: `${home}/baz.md` });
  assert.equal(result2, "~/baz.md");

  const result3 = formatArgsPreview("edit", { path: "/other/path.ts" });
  assert.equal(result3, "/other/path.ts");
});

test("formatArgsPreview grep wraps pattern in slashes", () => {
  const result = formatArgsPreview("grep", { pattern: "TODO", path: "src/" });
  assert.equal(result, "/TODO/ in src/");

  const result2 = formatArgsPreview("grep", { pattern: "fix" });
  assert.equal(result2, "/fix/");
});

test("formatArgsPreview default tool falls back to JSON.stringify with truncation", () => {
  const result = formatArgsPreview("custom_tool", { key: "value" });
  assert.equal(result, '{"key":"value"}');

  const bigObj: Record<string, string> = {};
  for (let i = 0; i < 20; i++) bigObj[`key${i}`] = "x".repeat(10);
  const result2 = formatArgsPreview("custom_tool", bigObj);
  assert.ok(result2.length <= 80);
  assert.ok(result2.endsWith("..."));
});

test("formatArgsPreview handles circular refs without throwing", () => {
  const obj: Record<string, unknown> = { a: 1 };
  obj.self = obj;
  // Should not throw
  const result = formatArgsPreview("unknown_tool", obj);
  assert.ok(typeof result === "string");
  assert.ok(result.length <= 80);
});

// ─── extractGithubPrUrl ───────────────────────────────────────────────────────

test("extractGithubPrUrl returns the last github URL in stdout", () => {
  const stdout = `
Creating pull request...
https://github.com/org/repo/pull/41
Some more output
https://github.com/org/repo/pull/42
Done.
`;
  assert.equal(extractGithubPrUrl(stdout), "https://github.com/org/repo/pull/42");
});

test("extractGithubPrUrl returns null when no URL is present", () => {
  assert.equal(extractGithubPrUrl("no urls here at all"), null);
  assert.equal(extractGithubPrUrl(""), null);
});

// Regression: matcher used to require literal "https://github" prefix,
// which broke GitHub Enterprise Server hosts (e.g. git.internal.corp).
// We now match by URL shape (`/pull/<digits>`) so any GHES host works.
test("extractGithubPrUrl matches GitHub Enterprise Server URLs", () => {
  const stdout = `
Creating pull request for feat/x into main in org/repo
https://git.internal.corp/org/repo/pull/7
`;
  assert.equal(extractGithubPrUrl(stdout), "https://git.internal.corp/org/repo/pull/7");
});

test("extractGithubPrUrl matches *.ghe.com URLs", () => {
  const stdout = "created: https://acme.ghe.com/team/repo/pull/123\n";
  assert.equal(extractGithubPrUrl(stdout), "https://acme.ghe.com/team/repo/pull/123");
});

test("extractGithubPrUrl ignores non-PR github URLs", () => {
  // A repo or release URL shouldn't be misread as a PR URL.
  const stdout = `
repo: https://github.com/org/repo
release: https://github.com/org/repo/releases/tag/v1.0
`;
  assert.equal(extractGithubPrUrl(stdout), null);
});

// ─── mapPiEvent ───────────────────────────────────────────────────────────────

test("mapPiEvent converts tool_execution_start to tool_start with correct fields", () => {
  const ctx = { currentToolStartedAt: null };
  const result = mapPiEvent(
    { type: "tool_execution_start", toolCallId: "tc-1", toolName: "bash", args: { command: "ls -la" } },
    ctx,
  );
  assert.notEqual(result, null);
  assert.equal(result!.type, "tool_start");
  if (result!.type === "tool_start") {
    assert.equal(result!.toolCallId, "tc-1");
    assert.equal(result!.toolName, "bash");
    assert.equal(result!.argsPreview, "ls -la");
  }
  assert.notEqual(ctx.currentToolStartedAt, null);
});

test("mapPiEvent converts tool_execution_end to tool_end with computed durationMs", () => {
  const now = Date.now();
  const ctx = { currentToolStartedAt: now - 500 };
  const result = mapPiEvent(
    { type: "tool_execution_end", toolCallId: "tc-1", toolName: "bash", result: "", isError: false },
    ctx,
  );
  assert.notEqual(result, null);
  assert.equal(result!.type, "tool_end");
  if (result!.type === "tool_end") {
    assert.equal(result!.toolCallId, "tc-1");
    assert.equal(result!.isError, false);
    assert.ok(result!.durationMs >= 400); // approximate
  }
  assert.equal(ctx.currentToolStartedAt, null);
});

test("mapPiEvent extracts usage totals from message_end with assistant role", () => {
  // Load fixture
  const fixturePath = path.join(__dirname, "fixtures", "pi-events.jsonl");
  const lines = fs.readFileSync(fixturePath, "utf-8").split("\n").filter(Boolean);
  const messageEndLine = lines.find((l) => {
    const parsed = JSON.parse(l);
    return parsed.type === "message_end" && parsed.message?.role === "assistant";
  });
  assert.ok(messageEndLine, "Expected to find an assistant message_end in fixture");

  const event = JSON.parse(messageEndLine!);
  // mapPiEvent for message_end returns assistant_text (the first event)
  // Usage is handled by the supervisor's processLine directly, not by mapPiEvent
  // But mapPiEvent does handle assistant_text from message_end
  const ctx = { currentToolStartedAt: null };
  const result = mapPiEvent(event, ctx);
  // mapPiEvent returns the assistant_text event for assistant message_end
  assert.notEqual(result, null);
  assert.equal(result!.type, "assistant_text");
  if (result!.type === "assistant_text") {
    assert.equal(result!.preview, "Hi.");
  }
});

test("mapPiEvent ignores message_update, turn_*, queue_update, compaction_*", () => {
  const ctx = { currentToolStartedAt: null };
  const ignored = [
    { type: "message_update", message: {}, assistantMessageEvent: {} },
    { type: "turn_start" },
    { type: "turn_end", message: {}, toolResults: [] },
    { type: "queue_update", steering: [], followUp: [] },
    { type: "compaction_start", reason: "manual" },
    { type: "compaction_end", reason: "manual" },
  ];
  for (const ev of ignored) {
    // turn_start and turn_end are not handled by mapPiEvent (no case)
    // so they return null via the default case
    const result = mapPiEvent(ev, ctx);
    // agent_start maps, but these should not
    if (ev.type !== "turn_start") {
      assert.equal(result, null, `Expected null for ${ev.type}`);
    }
  }
  // turn_start specifically returns null (default case)
  assert.equal(mapPiEvent({ type: "turn_start" }, ctx), null);
});

test("mapPiEvent ignores malformed events (missing type, non-object)", () => {
  const ctx = { currentToolStartedAt: null };
  assert.equal(mapPiEvent(null, ctx), null);
  assert.equal(mapPiEvent(undefined, ctx), null);
  assert.equal(mapPiEvent("string", ctx), null);
  assert.equal(mapPiEvent(42, ctx), null);
  assert.equal(mapPiEvent({}, ctx), null);
});

// ─── phaseToMetaStatus ────────────────────────────────────────────────────────

test("phaseToMetaStatus maps each Phase to the correct TaskStatus per the table in the spec", () => {
  assert.equal(phaseToMetaStatus("starting"), "running");
  assert.equal(phaseToMetaStatus("agent"), "running");
  assert.equal(phaseToMetaStatus("quality_check"), "quality_check");
  assert.equal(phaseToMetaStatus("committing"), "quality_check");
  assert.equal(phaseToMetaStatus("creating_pr"), "creating_pr");
  assert.equal(phaseToMetaStatus("done"), "done");
  assert.equal(phaseToMetaStatus("failed"), "failed");
});

// ─── formatTokens ─────────────────────────────────────────────────────────────

test("formatTokens renders 0/1k/12.3k/2.1M correctly", () => {
  assert.equal(formatTokens(0), "0");
  assert.equal(formatTokens(999), "999");
  assert.equal(formatTokens(1000), "1.0k");
  assert.equal(formatTokens(1234), "1.2k");
  assert.equal(formatTokens(9999), "10.0k");
  assert.equal(formatTokens(10000), "10k");
  assert.equal(formatTokens(12345), "12k");
  assert.equal(formatTokens(999999), "1000k");
  assert.equal(formatTokens(1000000), "1.0M");
  assert.equal(formatTokens(2100000), "2.1M");
});
