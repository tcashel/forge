/**
 * Launch runner script — truthfulness + headless hardening.
 *
 * Pins the production-hardening audit findings against the bash that
 * generateRunnerScript emits:
 *
 *   - set_status / set_meta_field quoting: the old `""$1""` form collapsed to
 *     a bare token, json.loads raised, and `2>/dev/null || true` swallowed it —
 *     every status transition and baseSha/finalSha/reviewError write was a
 *     silent no-op (failed runs showed "running" forever). Helpers must now
 *     round-trip through a real meta.json and log failures to
 *     session-helpers.log.
 *   - terminal-status discipline: no 'done' write at PR creation (a poll in
 *     the done→reviewing window latched the plan terminally mid-run); one
 *     terminal write at the end; an EXIT trap force-writes 'failed' naming
 *     the dying phase so there are no silent terminal states.
 *   - sidecar trust (PR #64): stage_result_valid rescues a non-zero pipeline
 *     exit whose stream sidecar holds a valid terminal result, and force-fails
 *     a zero exit without one, at the agent / reviewer / fixer / re-reviewer
 *     sites for streaming adapters.
 *   - headless git: env-only GIT_TERMINAL_PROMPT / commit.gpgsign=false
 *     exports so no commit in the run can block on a signing prompt.
 *   - per-stage watchdog: portable bash (no GNU timeout on macOS) that kills
 *     a hung stage's tree and surfaces a timeout-specific failure.
 *
 * Helper behavior is proven by executing the script's own preamble (everything
 * above the "# ── Init" marker) against a temp meta.json — never by spawning
 * real agents, gh, or tmux.
 */

import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { generateRunnerScript, type LaunchConfig } from "../src/core/launch.ts";
import { ForgeStore } from "../src/core/store.ts";

const PLAN_ID = "plan-runner-t";

function makeConfig(overrides: Partial<LaunchConfig> = {}): LaunchConfig {
  return {
    planId: PLAN_ID,
    specContent: "spec body",
    specTitle: "Launch runner hardening",
    target: "claude",
    model: "opus",
    worktreePath: "/tmp/wt",
    qualityCommands: ["bun test"],
    defaultBranch: "main",
    branch: "feat/runner-t",
    repoRoot: "/repo/x",
    repoName: "x",
    contextContent: null,
    reviewerTarget: "claude",
    reviewerModel: "opus",
    autoFix: true,
    autoFixRounds: 2,
    fixerTarget: "claude",
    fixerModel: "opus",
    ...overrides,
  };
}

function setup(overrides: Partial<LaunchConfig> = {}): {
  forgeDir: string;
  store: ForgeStore;
  runDir: string;
  metaFile: string;
  script: string;
} {
  const forgeDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-launch-runner-"));
  const store = new ForgeStore({ forgeDir });
  const config = makeConfig(overrides);
  const script = generateRunnerScript(config, store, { jobRunNumber: 1 });
  const runDir = store.ensureRunDir(config.planId);
  return { forgeDir, store, runDir, metaFile: path.join(runDir, "meta.json"), script };
}

/** Everything above the Init marker: vars, helpers, trap, watchdog, validator. */
function preambleOf(script: string): string {
  const idx = script.indexOf("# ── Init");
  assert.ok(idx > 0, "init marker must exist for the harness slice");
  return script.slice(0, idx);
}

/** Run preamble + body as a bash script; capture exit code and stdout. */
function runHarness(runDir: string, script: string, body: string): { status: number; out: string } {
  const harness = path.join(runDir, "harness.sh");
  fs.writeFileSync(harness, `${preambleOf(script)}\n${body}\n`, { mode: 0o755 });
  try {
    const out = execSync(`bash '${harness}'`, { encoding: "utf-8", stdio: "pipe" });
    return { status: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string };
    return { status: err.status ?? -1, out: String(err.stdout ?? "") };
  }
}

function readMeta(metaFile: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(metaFile, "utf-8")) as Record<string, unknown>;
}

// ─── 1. Quoting (exec-headless-set-status-quoting-silently-broken /
//        pub-runner-meta-quoting-noop) ───────────────────────────────────────

test('runner no longer emits the broken ""$1"" quoting and logs helper failures', () => {
  const { forgeDir, script } = setup();
  try {
    // The exact broken patterns the audit reproduced as silent no-ops.
    assert.ok(!script.includes('""$1""'), "set_status must not use the empty+var+empty concatenation");
    assert.ok(!script.includes('""$BASE_SHA""'), "baseSha write must be JSON-quoted");
    assert.ok(!script.includes('""$FINAL_SHA""'), "finalSha write must be JSON-quoted");
    assert.ok(!script.includes('""reviewer process exited'), "reviewError write must be JSON-quoted");
    assert.ok(script.includes('set_meta_field "status" "\\"$1\\""'), "set_status must pass a JSON string");
    assert.ok(script.includes('set_meta_field "baseSha" "\\"$BASE_SHA\\""'));
    assert.ok(script.includes('set_meta_field "finalSha" "\\"$FINAL_SHA\\""'));
    // Failures must land in the run dir's session-helpers.log, not /dev/null.
    assert.ok(script.includes("session-helpers.log"), "helper log file missing");
    const fnStart = script.indexOf("set_meta_field() {");
    const fnBody = script.slice(fnStart, script.indexOf("\n}", fnStart));
    assert.ok(!fnBody.includes("2>/dev/null"), "helper must not swallow stderr");
    assert.ok(fnBody.includes('2>>"$HELPER_LOG"'), "helper stderr must be appended to the helper log");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("set_status and set_meta_field round-trip through a real meta.json", () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "running" }));
    const { status } = runHarness(
      runDir,
      script,
      [
        'set_meta_field "baseSha" "\\"abc123\\""',
        'set_status "quality_check"',
        'set_status "failed"',
        "RUNNER_FINISHED=1",
      ].join("\n"),
    );
    assert.equal(status, 0);
    const meta = readMeta(metaFile);
    assert.equal(meta.status, "failed", "set_status must actually write (was a silent no-op)");
    assert.equal(meta.baseSha, "abc123", "baseSha must round-trip");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("helper failures append to session-helpers.log instead of vanishing", () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "running" }));
    const { status } = runHarness(
      runDir,
      script,
      ['META_FILE="$RUN_DIR/no-such-dir/meta.json"', 'set_status "failed"', "RUNNER_FINISHED=1"].join("\n"),
    );
    assert.equal(status, 0, "a helper failure must never crash the runner");
    const helperLog = path.join(runDir, "session-helpers.log");
    assert.ok(fs.existsSync(helperLog), "session-helpers.log must exist after a failed write");
    assert.match(fs.readFileSync(helperLog, "utf-8"), /set_meta_field failed: key=status/);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

// ─── 2. Terminal-status discipline (data-transient-done-latch-before-review) ─

test("PR creation records prUrl/prNumber as data fields; 'done' is written once, at the end", () => {
  const { forgeDir, script } = setup();
  try {
    assert.ok(!script.includes("d['status'] = 'done'"), "inline python must not write done at PR creation");
    const doneWrites = script.split('set_status "done"').length - 1;
    assert.equal(doneWrites, 1, "exactly one terminal done write");
    const idxDone = script.indexOf('set_status "done"');
    assert.ok(idxDone > script.indexOf("═══ REVIEWER ═══"), "terminal write must come after the reviewer");
    assert.ok(idxDone > script.indexOf("AUTO-FIX"), "terminal write must come after auto-fix");
    assert.ok(idxDone > script.indexOf("Terminal status"), "terminal write lives in the terminal section");

    // The PR-creation window itself must carry no terminal status.
    const prBlock = script.slice(script.indexOf("CREATING DRAFT PR"), script.indexOf("═══ REVIEWER ═══"));
    assert.ok(!prBlock.includes('set_status "done"'));
    assert.ok(prBlock.includes('set_meta_field "prUrl"'), "prUrl recorded as a plain meta field");
    assert.ok(prBlock.includes('set_meta_field "prNumber"'), "prNumber recorded as a plain meta field");

    // quality_failed must survive to the terminal state, not be masked by done.
    const terminal = script.slice(script.indexOf("Terminal status"));
    assert.ok(terminal.includes('set_status "quality_failed"'), "terminal write must preserve quality_failed");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("EXIT trap force-writes failed + dying phase when the script dies non-terminally", () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "running" }));
    const { status } = runHarness(runDir, script, ['RUN_PHASE="agent"', "exit 7"].join("\n"));
    assert.equal(status, 7, "trap must preserve the original exit code");
    const meta = readMeta(metaFile);
    assert.equal(meta.status, "failed", "no silent terminal states: dying run must read failed");
    assert.match(String(meta.errorMessage), /runner died during phase: agent/);
    assert.match(String(meta.errorMessage), /exit 7/);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("EXIT trap leaves an already-terminal status untouched", () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "done" }));
    runHarness(runDir, script, ['RUN_PHASE="review"', "exit 1"].join("\n"));
    const meta = readMeta(metaFile);
    assert.equal(meta.status, "done", "terminal status must not be clobbered by the trap");
    assert.equal(meta.errorMessage, undefined);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

// ─── 3. Sidecar trust (exec-headless-result-event-rescue-only-in-critique) ───

test("stage_result_valid: claude result-event semantics (executed)", () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "running" }));
    const body = [
      "RUNNER_FINISHED=1",
      'S="$RUN_DIR/t.stream.jsonl"; O="$RUN_DIR/t-out.md"',
      'check() { if stage_result_valid "$1" "$2" "$3" "$4"; then echo "$5=valid"; else echo "$5=invalid"; fi; }',
      'echo "agent output" > "$O"',
      `printf '%s\\n' '{"type":"system"}' '{"type":"result","is_error":false,"stop_reason":"end_turn","result":"ok"}' > "$S"`,
      'check claude "$S" "$O" "" good',
      `printf '%s\\n' '{"type":"result","is_error":true,"stop_reason":"error"}' > "$S"`,
      'check claude "$S" "$O" "" iserr',
      `printf '%s\\n' '{"type":"result","is_error":false,"stop_reason":"refusal"}' > "$S"`,
      'check claude "$S" "$O" "" badstop',
      `printf '%s\\n' '{"type":"assistant"}' > "$S"`,
      'check claude "$S" "$O" "" noresult',
      ': > "$S"',
      'check claude "$S" "$O" "" empty',
    ].join("\n");
    const { status, out } = runHarness(runDir, script, body);
    assert.equal(status, 0);
    assert.match(out, /good=valid/, "valid terminal result must pass");
    assert.match(out, /iserr=invalid/, "is_error result must fail closed");
    assert.match(out, /badstop=invalid/, "unknown stop_reason must fail closed (allowlist)");
    assert.match(out, /noresult=invalid/, "no result event must fail");
    assert.match(out, /empty=invalid/, "empty sidecar must fail");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("stage_result_valid: codex turn-event semantics (executed)", () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "running" }));
    const body = [
      "RUNNER_FINISHED=1",
      'S="$RUN_DIR/t.stream.jsonl"; O="$RUN_DIR/t-out.md"',
      'check() { if stage_result_valid "$1" "$2" "$3" "$4"; then echo "$5=valid"; else echo "$5=invalid"; fi; }',
      'echo "fixer output" > "$O"',
      `printf '%s\\n' '{"type":"turn.started"}' '{"type":"turn.completed","usage":{"input_tokens":1}}' > "$S"`,
      'check codex "$S" "$O" "" good',
      `printf '%s\\n' '{"type":"turn.started"}' '{"type":"turn.failed"}' > "$S"`,
      'check codex "$S" "$O" "" failedturn',
      `printf '%s\\n' '{"type":"turn.started"}' > "$S"`,
      'check codex "$S" "$O" "" cutmidturn',
    ].join("\n");
    const { status, out } = runHarness(runDir, script, body);
    assert.equal(status, 0);
    assert.match(out, /good=valid/, "terminal turn.completed must pass");
    assert.match(out, /failedturn=invalid/, "turn.failed must fail closed");
    assert.match(out, /cutmidturn=invalid/, "stream cut mid-turn must fail closed");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("stage_result_valid: fence gate requires a complete forge-review block (executed)", () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "running" }));
    // The exact pre-quoted fence token the generated runner passes.
    const fenceTok = "'\\`\\`\\`forge-review'";
    const body = [
      "RUNNER_FINISHED=1",
      'S="$RUN_DIR/t.stream.jsonl"; O="$RUN_DIR/t-out.md"',
      'check() { if stage_result_valid "$1" "$2" "$3" "$4"; then echo "$5=valid"; else echo "$5=invalid"; fi; }',
      `printf '%s\\n' '{"type":"result","is_error":false,"stop_reason":"end_turn"}' > "$S"`,
      "{ echo 'preamble'; echo '```forge-review'; echo 'verdict: approve'; echo '```'; echo 'trailing'; } > \"$O\"",
      `check claude "$S" "$O" ${fenceTok} complete`,
      "{ echo '```forge-review'; echo 'verdict: approve'; } > \"$O\"",
      `check claude "$S" "$O" ${fenceTok} truncated`,
      "echo 'no fenced block at all' > \"$O\"",
      `check claude "$S" "$O" ${fenceTok} missing`,
    ].join("\n");
    const { status, out } = runHarness(runDir, script, body);
    assert.equal(status, 0);
    assert.match(out, /complete=valid/, "complete fenced block (with trailing text) must pass");
    assert.match(out, /truncated=invalid/, "unterminated fenced block must fail closed");
    assert.match(out, /missing=invalid/, "missing fence marker must fail closed");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("runner applies sidecar reconcile at agent/reviewer/fixer/re-reviewer for streaming adapters only", () => {
  const streaming = setup();
  try {
    for (const label of ["agent", "reviewer", "fixer", "re-reviewer"]) {
      assert.ok(
        streaming.script.includes(`(${label}: non-zero exit but valid result — rescued)`),
        `${label} rescue branch missing`,
      );
      assert.ok(
        streaming.script.includes(`(${label} silent failure: no valid terminal result in sidecar)`),
        `${label} force-fail branch missing`,
      );
    }
    // A watchdog-killed stage must never be rescued.
    assert.ok(streaming.script.includes("watchdog kill — never rescue a timed-out agent"));
  } finally {
    fs.rmSync(streaming.forgeDir, { recursive: true, force: true });
  }

  const plain = setup({ target: "opencode", reviewerTarget: "gemini", fixerTarget: "opencode" });
  try {
    assert.ok(!plain.script.includes("rescued"), "plain-text adapters keep exit-code behavior");
    assert.ok(plain.script.includes("exit code stays authoritative"));
  } finally {
    fs.rmSync(plain.forgeDir, { recursive: true, force: true });
  }
});

// ─── 4. Headless git (exec-headless-forge-commits-hit-gpg-signing-prompt) ────

test("runner exports headless git env; commits succeed in a gpgsign=true repo with a broken signer", () => {
  const { forgeDir, script } = setup();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "forge-gpg-repo-"));
  try {
    const exports = script.split("\n").filter((l) => l.startsWith("export GIT_"));
    assert.deepEqual(exports, [
      "export GIT_TERMINAL_PROMPT=0",
      "export GIT_CONFIG_COUNT=1",
      "export GIT_CONFIG_KEY_0=commit.gpgsign",
      "export GIT_CONFIG_VALUE_0=false",
    ]);
    // Exports must precede every git/agent invocation.
    assert.ok(script.indexOf("export GIT_TERMINAL_PROMPT=0") < script.indexOf("# ── Init"));

    execSync(
      `git init -q "${repo}" && git -C "${repo}" config user.email t@t.dev && git -C "${repo}" config user.name t ` +
        `&& git -C "${repo}" config commit.gpgsign true && git -C "${repo}" config gpg.program /nonexistent-forge-signer`,
      { stdio: "pipe" },
    );

    // Without the overrides the signer breaks the commit (in the operator's
    // real setup it hangs on a 1Password prompt instead).
    assert.throws(() => execSync(`git -C "${repo}" commit --allow-empty -m unsigned`, { stdio: "pipe" }));

    // With the runner's exact export lines the commit must succeed unsigned.
    execSync(`${exports.join("; ")}; git -C "${repo}" commit --allow-empty -m headless-ok`, {
      stdio: "pipe",
      shell: "/bin/bash",
    });
    const subject = execSync(`git -C "${repo}" log -1 --format=%s`, { encoding: "utf-8" }).trim();
    assert.equal(subject, "headless-ok");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

// ─── 5. Watchdog (exec-headless-no-timeouts-hung-agent-runs-forever) ─────────

test("runner wires per-stage watchdogs with defaults and config overrides", () => {
  const def = setup();
  try {
    assert.ok(def.script.includes("AGENT_TIMEOUT_MINUTES=120"));
    assert.ok(def.script.includes("REVIEWER_TIMEOUT_MINUTES=60"));
    assert.ok(def.script.includes("FIXER_TIMEOUT_MINUTES=60"));
    assert.ok(def.script.includes('watch_stage "$AGENT_PID" $(( AGENT_TIMEOUT_MINUTES * 60 )) "agent"'));
    assert.ok(def.script.includes('watch_stage "$REVIEWER_PID" $(( REVIEWER_TIMEOUT_MINUTES * 60 )) "reviewer"'));
    assert.ok(def.script.includes('watch_stage "$FIXER_PID" $(( FIXER_TIMEOUT_MINUTES * 60 )) "fixer"'));
    assert.ok(def.script.includes('watch_stage "$RE_PID" $(( REVIEWER_TIMEOUT_MINUTES * 60 )) "re-reviewer"'));
    // Timeout is a terminal failure for the agent stage…
    assert.ok(def.script.includes("agent stage timed out after 120 minutes"));
    // …and a recorded reviewError for review/fix stages.
    assert.ok(def.script.includes("reviewer timed out after 60 minutes"));
    assert.ok(def.script.includes("fixer timed out after 60 minutes"));
    assert.ok(def.script.includes("re-reviewer timed out after 60 minutes"));
  } finally {
    fs.rmSync(def.forgeDir, { recursive: true, force: true });
  }

  const tuned = setup({ agentTimeoutMinutes: 5, reviewerTimeoutMinutes: 7, fixerTimeoutMinutes: 9 });
  try {
    assert.ok(tuned.script.includes("AGENT_TIMEOUT_MINUTES=5"));
    assert.ok(tuned.script.includes("REVIEWER_TIMEOUT_MINUTES=7"));
    assert.ok(tuned.script.includes("FIXER_TIMEOUT_MINUTES=9"));
    assert.ok(tuned.script.includes("agent stage timed out after 5 minutes"));
    assert.ok(tuned.script.includes("reviewer timed out after 7 minutes"));
    assert.ok(tuned.script.includes("fixer timed out after 9 minutes"));
  } finally {
    fs.rmSync(tuned.forgeDir, { recursive: true, force: true });
  }
});

// The watchdog polls every 5s, so this test needs more than bun's 5s default.
test("watch_stage kills a hung stage tree and drops the timeout marker (executed)", { timeout: 30000 }, () => {
  const { forgeDir, runDir, metaFile, script } = setup();
  try {
    fs.writeFileSync(metaFile, JSON.stringify({ status: "running" }));
    // 1-second budget; the watchdog polls every 5s, so this fires on the
    // first check (~5s) — well inside the test budget, no GNU timeout needed.
    const body = [
      "RUNNER_FINISHED=1",
      "( sleep 300 ) >/dev/null 2>&1 &",
      "PID=$!",
      'watch_stage "$PID" 1 "agent" >/dev/null 2>&1 &',
      "WD=$!",
      'wait "$PID"',
      "EXITC=$?",
      'kill "$WD" 2>/dev/null || true',
      'echo "exit=$EXITC"',
      'if [ -f "$RUN_DIR/.stage-timeout-agent" ]; then echo "marker=yes"; fi',
    ].join("\n");
    const { status, out } = runHarness(runDir, script, body);
    assert.equal(status, 0);
    assert.match(out, /marker=yes/, "watchdog must drop the timeout marker before killing");
    const exitc = Number(/exit=(\d+)/.exec(out)?.[1] ?? "0");
    assert.ok(exitc >= 128, `hung stage must die by signal, got exit=${exitc}`);
    const helperLog = fs.readFileSync(path.join(runDir, "session-helpers.log"), "utf-8");
    assert.match(helperLog, /watchdog: agent exceeded 0m/);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
