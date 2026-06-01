import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
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

test("codexJobCommand wraps the pipeline in a brace group so the runner's 2>&1 captures codex stderr", () => {
  // Runners embed this as `${cmd} 2>&1 | tee log` / `${cmd} > raw 2>&1`. The
  // pipeline must be a `{ … ; }` group so the outer 2>&1 binds to the whole
  // group (incl. `codex exec` stderr) rather than only the final bun filter.
  const cmd = codexJobCommand("gpt-5.5", "/tmp/p.txt", "/tmp/run/agent.stream.jsonl");
  assert.ok(cmd.startsWith("{ codex exec --json"), `pipeline must open with a brace group: ${cmd}`);
  assert.ok(cmd.endsWith(" ; }"), `brace group must close with the required ' ; }': ${cmd}`);
  // The stderr redirect must NOT be injected before the first pipe — that
  // would merge codex stderr into the JSONL stream and corrupt token capture.
  assert.ok(!cmd.includes("--json 2>&1"), `codex stderr must not be merged before the sidecar tee: ${cmd}`);
  assert.ok(!/2>&1[^}]*tee "\/tmp\/run\/agent\.stream\.jsonl"/.test(cmd), `no 2>&1 before the sidecar tee: ${cmd}`);
});

test("brace-grouped command captures codex stderr in the log without polluting the sidecar JSONL", () => {
  // End-to-end proof of the grouping fix: a fake codex emits JSONL on stdout
  // and a diagnostic on stderr. Embedded the way the runner does
  // (`${cmd} 2>&1 | tee log`), the sidecar must stay pure JSONL (token capture
  // intact) while the log must contain BOTH the projected answer and stderr.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-codex-stderr-"));
  try {
    const stream = path.join(tmp, "agent.stream.jsonl");
    const log = path.join(tmp, "run.log");
    // Stand-in for `codex exec --json`: prints two JSONL lines on stdout + a
    // stderr warning. Wrapped in its own `( … )` so the JSONL stdout (not just
    // the trailing echo) is what flows into the downstream `| tee | filter`.
    const fakeCodex = `( printf '%s\\n%s\\n' '{"type":"item.completed","item":{"type":"agent_message","text":"Done."}}' '{"type":"turn.completed","usage":{"input_tokens":10,"cached_input_tokens":2,"output_tokens":3}}' ; echo 'codex: WARNING auth token near expiry' >&2 )`;
    // Reuse the real grouping shape: { <codex> | tee stream | filter ; } 2>&1 | tee log
    const grouped = `{ ${fakeCodex} | tee "${stream}" | ${codexJobStreamFilter} ; } 2>&1 | tee "${log}" > /dev/null`;
    execSync(grouped, { shell: "/bin/bash", encoding: "utf-8" });

    const sidecar = fs.readFileSync(stream, "utf-8");
    assert.ok(sidecar.includes('"turn.completed"'), `sidecar must hold the usage JSONL: ${sidecar}`);
    assert.ok(!sidecar.includes("WARNING"), `codex stderr must NOT leak into the sidecar JSONL: ${sidecar}`);

    const logged = fs.readFileSync(log, "utf-8");
    assert.ok(logged.includes("Done."), `log must contain the projected final answer: ${logged}`);
    assert.ok(
      logged.includes("codex: WARNING auth token near expiry"),
      `log must capture codex stderr via the brace group + outer 2>&1: ${logged}`,
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
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
