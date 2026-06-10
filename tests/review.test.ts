import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { run as runReviewCmd } from "../src/cli/cmd/review.ts";
import { __setReviewExecHooks } from "../src/cli/cmd/review-actions.ts";
import { CliError } from "../src/cli/output.ts";
import { __setGhRunner } from "../src/core/gh-pr-write.ts";
import { buildReviewerPrompt } from "../src/core/reviewer.ts";
import { ForgeStore } from "../src/core/store.ts";

// The CLI command (`forge review`) is a thin wrapper around buildReviewerPrompt.
// We unit-test the composition layer here; the gh / spec-lookup glue is
// covered manually per the plan's verification matrix (it shells out to gh).

test("buildReviewerPrompt includes PR header and section markers", () => {
  const out = buildReviewerPrompt({
    prNum: 42,
    repoName: "tcashel/forge",
    skillsDir: "/tmp/nonexistent-skills",
    prInfoJson: '{"number":42,"title":"x"}',
    ciChecks: "all green",
    diff: "diff --git a/x b/x",
    linkedSpec: null,
  });
  assert.match(out, /Please review PR #42 in tcashel\/forge\./);
  assert.match(out, /## PR metadata/);
  assert.match(out, /## CI checks/);
  assert.match(out, /## Linked Forge spec/);
  assert.match(out, /no forge spec linked to this branch/);
  assert.match(out, /## Diff/);
  assert.match(out, /diff --git a\/x b\/x/);
});

test("buildReviewerPrompt embeds the linked spec body when provided", () => {
  const out = buildReviewerPrompt({
    prNum: 7,
    repoName: "tcashel/forge",
    skillsDir: "/tmp/nonexistent-skills",
    prInfoJson: "{}",
    ciChecks: "",
    diff: "",
    linkedSpec: "# Spec body\n\nSome content.",
  });
  assert.match(out, /## Linked Forge spec/);
  assert.match(out, /# Spec body/);
  assert.match(out, /Some content\./);
  assert.ok(!out.includes("no forge spec linked"), "should not show fallback when spec is provided");
});

test("buildReviewerPrompt truncates very large diffs and notes the truncation", () => {
  const bigDiff = `${"x".repeat(70_000)}`;
  const out = buildReviewerPrompt({
    prNum: 1,
    repoName: "r",
    skillsDir: "/tmp/x",
    prInfoJson: "{}",
    ciChecks: "",
    diff: bigDiff,
    linkedSpec: null,
  });
  assert.match(out, /diff truncated for context budget/);
});

// Paired with the embedded python in `src/core/launch.ts` (the reviewer
// verdict-extractor). If either side changes, update both — duplication is
// accepted here because the prod code is a python heredoc inside a bash
// runner script and can't be imported directly.
const VERDICT_PARSER_PY = `
import re, sys, json
raw = open(sys.argv[1], encoding='utf-8').read()
matches = list(re.finditer(r'\`\`\`forge-review\\s*\\n(.*?)\\n\`\`\`', raw, re.DOTALL))
if not matches:
    sys.exit(2)
block = matches[-1].group(1)
open(sys.argv[2], 'w', encoding='utf-8').write(block)
verdict_match = re.search(r'^##\\s*Verdict\\s*\\n\\s*(\\S+)', block, re.MULTILINE)
verdict = verdict_match.group(1).strip().lower() if verdict_match else None
if verdict not in ('approve', 'request-changes', 'block'):
    verdict = None
print(json.dumps(verdict))
`;

function runVerdictParser(
  rawPath: string,
  envOverride?: Record<string, string>,
): { verdict: string | null; reviewBody: string; exitCode: number } {
  const reviewPath = path.join(
    os.tmpdir(),
    `forge-test-review-${Date.now()}-${Math.random().toString(36).slice(2)}.md`,
  );
  try {
    const stdout = execFileSync("python3", ["-c", VERDICT_PARSER_PY, rawPath, reviewPath], {
      encoding: "utf-8",
      env: envOverride ? { ...process.env, ...envOverride } : process.env,
    });
    const verdict = JSON.parse(stdout.trim()) as string | null;
    const reviewBody = fs.existsSync(reviewPath) ? fs.readFileSync(reviewPath, "utf-8") : "";
    return { verdict, reviewBody, exitCode: 0 };
  } catch (e: unknown) {
    const err = e as { status?: number };
    return { verdict: null, reviewBody: "", exitCode: err.status ?? 1 };
  } finally {
    if (fs.existsSync(reviewPath)) fs.rmSync(reviewPath);
  }
}

test("verdict parser ignores template echo and extracts the real verdict (codex case)", () => {
  const fixture = path.join(import.meta.dirname, "fixtures", "reviewer", "codex-echo-with-template.md");
  const { verdict, reviewBody, exitCode } = runVerdictParser(fixture);
  assert.equal(exitCode, 0);
  assert.equal(verdict, "block", "should pick the real review block, not the template echo");
  assert.match(reviewBody, /Example blocker finding/, "extracted block is the real one");
  assert.ok(
    !reviewBody.includes("<approve | request-changes | block>"),
    "extracted block should not be the placeholder template",
  );
});

test("verdict parser exits 2 when no forge-review block is present", () => {
  const tmp = path.join(os.tmpdir(), `forge-test-noblock-${Date.now()}.md`);
  fs.writeFileSync(tmp, "Some reviewer output without any fenced block.\n");
  try {
    const { exitCode } = runVerdictParser(tmp);
    assert.equal(exitCode, 2);
  } finally {
    fs.rmSync(tmp);
  }
});

// Regression: reviewer output is full of non-ASCII (em dashes, ✅/⚠️, smart
// quotes). Background runners (tmux/launchd) can start under a POSIX/C locale
// where Python's open().read() defaults to ASCII and throws UnicodeDecodeError
// *before* writing review.md — surfacing as "verdict line missing or
// unrecognised" even though the reviewer returned a valid verdict. The parser
// must pin encoding='utf-8' so it survives a hostile locale. The forced env
// below disables UTF-8 mode coercion to reproduce the broken environment.
test("verdict parser extracts non-ASCII review under a POSIX/C locale", () => {
  const tmp = path.join(os.tmpdir(), `forge-test-unicode-${Date.now()}.md`);
  const raw = [
    "```forge-review",
    "## Verdict",
    "request-changes",
    "",
    "## Summary",
    "This PR implements the spec’s singleton — I read every file.",
    "",
    "## Spec Adherence",
    "- ✅ singleton helper present",
    "- ⚠️ CI checks still pending",
    "```",
    "",
  ].join("\n");
  fs.writeFileSync(tmp, raw, "utf-8");
  try {
    const { verdict, reviewBody, exitCode } = runVerdictParser(tmp, {
      LC_ALL: "C",
      LANG: "C",
      LC_CTYPE: "C",
      PYTHONUTF8: "0",
      PYTHONCOERCECLOCALE: "0",
    });
    assert.equal(exitCode, 0, "parser must not crash on non-ASCII under a C locale");
    assert.equal(verdict, "request-changes");
    assert.match(reviewBody, /✅ singleton helper present/, "review.md is written with utf-8 intact");
  } finally {
    fs.rmSync(tmp);
  }
});

// ─── forge review --run / --publish-only (CLI dispatch + exit codes) ─────────
//
// Subprocesses route through __setReviewExecHooks / __setGhRunner — no real
// gh/claude is spawned. The store points at a mkdtemp ~/.forge.

const CLI_DIFF = [
  "diff --git a/src/foo.ts b/src/foo.ts",
  "--- a/src/foo.ts",
  "+++ b/src/foo.ts",
  "@@ -1,2 +1,3 @@",
  " a",
  "+b",
  " c",
].join("\n");

const CLI_RAW_REVIEW = [
  "```forge-review",
  "## Verdict",
  "request-changes",
  "",
  "## Findings",
  "",
  "### [HIGH] something broken",
  "**Where:** `src/foo.ts:2`",
  "**Why:** because",
  "**Fix:** patch",
  "```",
].join("\n");

function setupCliFixture() {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-review-cli-"));
  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
  const repoDir = path.join(tmpHome, "repo");
  fs.mkdirSync(repoDir, { recursive: true });
  execFileSync("git", ["init", "-q", repoDir]);
  // git may resolve the tmp dir through /private on macOS — use its view.
  const repoRoot = execFileSync("git", ["-C", repoDir, "rev-parse", "--show-toplevel"], { encoding: "utf-8" }).trim();
  store.setRepoConfig(repoRoot, { reviewerAgent: "claude", reviewerModel: "test-model" });

  const ghExec = (args: string[]): string => {
    const joined = args.join(" ");
    if (joined.startsWith("pr view")) {
      return JSON.stringify({
        number: 7,
        headRefName: "feat/x",
        url: "https://github.com/acme/repo/pull/7",
        headRefOid: "aaaa111122223333aaaa111122223333aaaa1111",
      });
    }
    if (joined.startsWith("pr checks")) return "all green";
    if (joined.startsWith("pr diff")) return CLI_DIFF;
    return "";
  };
  return { tmpHome, store, repoDir, ghExec };
}

function makeCliPublishRunner(failPost: boolean) {
  return (args: string[]) => {
    const joined = args.join(" ");
    if (args.includes("--paginate") && args.includes("--slurp")) {
      return Promise.resolve({ ok: true, stdout: "[[]]", stderr: "", timedOut: false });
    }
    if (args.includes("--method") && joined.includes("/reviews")) {
      return failPost
        ? Promise.resolve({ ok: false, stdout: "", stderr: "HTTP 401: Bad credentials", timedOut: false })
        : Promise.resolve({ ok: true, stdout: "{}", stderr: "", timedOut: false });
    }
    return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
  };
}

test("forge review --run --publish executes the review and publishes (exit 0 path)", async () => {
  const fx = setupCliFixture();
  try {
    __setReviewExecHooks({
      ghExec: fx.ghExec,
      agentExec: (a) => fs.writeFileSync(a.rawFile, CLI_RAW_REVIEW, "utf-8"),
    });
    __setGhRunner(makeCliPublishRunner(false) as never);
    await runReviewCmd(["7", "--run", "--publish", "--repo", fx.repoDir, "--json"], fx.store);
    // Artifacts land under the mkdtemp store, never the real ~/.forge.
    const prReviewDir = path.join(fx.store.runsDir, "pr-review");
    const dirs = fs.readdirSync(prReviewDir);
    assert.equal(dirs.length, 1);
    const runDir = path.join(prReviewDir, dirs[0]);
    assert.ok(fs.existsSync(path.join(runDir, "findings.json")));
    const publish = JSON.parse(fs.readFileSync(path.join(runDir, "publish.json"), "utf-8")) as { state: string };
    assert.equal(publish.state, "published");
  } finally {
    __setReviewExecHooks(null);
    __setGhRunner(null);
    fs.rmSync(fx.tmpHome, { recursive: true, force: true });
  }
});

test("forge review --run --publish exits 4 (PUBLISH_FAILED) when the POST fails", async () => {
  const fx = setupCliFixture();
  try {
    __setReviewExecHooks({
      ghExec: fx.ghExec,
      agentExec: (a) => fs.writeFileSync(a.rawFile, CLI_RAW_REVIEW, "utf-8"),
    });
    __setGhRunner(makeCliPublishRunner(true) as never);
    await assert.rejects(
      () => runReviewCmd(["7", "--run", "--publish", "--repo", fx.repoDir, "--json"], fx.store),
      (e: unknown) => e instanceof CliError && e.code === "PUBLISH_FAILED" && e.exitCode === 4,
    );
  } finally {
    __setReviewExecHooks(null);
    __setGhRunner(null);
    fs.rmSync(fx.tmpHome, { recursive: true, force: true });
  }
});

test("forge review --run --publish --json writes nothing to stdout on failure (single envelope)", async () => {
  const fx = setupCliFixture();
  const realWrite = process.stdout.write.bind(process.stdout);
  const stdoutWrites: string[] = [];
  // A failed publish with --json must leave stdout to main.ts's single error
  // envelope: no success payload, no progress lines (those go to stderr).
  process.stdout.write = ((chunk: string) => {
    stdoutWrites.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  try {
    __setReviewExecHooks({
      ghExec: fx.ghExec,
      agentExec: (a) => fs.writeFileSync(a.rawFile, CLI_RAW_REVIEW, "utf-8"),
    });
    __setGhRunner(makeCliPublishRunner(true) as never);
    await assert.rejects(
      () => runReviewCmd(["7", "--run", "--publish", "--repo", fx.repoDir, "--json"], fx.store),
      (e: unknown) => e instanceof CliError && e.code === "PUBLISH_FAILED",
    );
    assert.deepEqual(stdoutWrites, [], "stdout must stay empty until main.ts emits the error envelope");
  } finally {
    process.stdout.write = realWrite;
    __setReviewExecHooks(null);
    __setGhRunner(null);
    fs.rmSync(fx.tmpHome, { recursive: true, force: true });
  }
});

test("forge review --run exits 1 (REVIEW_FAILED) when the reviewer produces no block", async () => {
  const fx = setupCliFixture();
  try {
    __setReviewExecHooks({
      ghExec: fx.ghExec,
      agentExec: (a) => fs.writeFileSync(a.rawFile, "no block here", "utf-8"),
    });
    await assert.rejects(
      () => runReviewCmd(["7", "--run", "--repo", fx.repoDir, "--json"], fx.store),
      (e: unknown) => e instanceof CliError && e.code === "REVIEW_FAILED" && e.exitCode === 1,
    );
  } finally {
    __setReviewExecHooks(null);
    fs.rmSync(fx.tmpHome, { recursive: true, force: true });
  }
});

test("forge review --publish-only exits 1 (NO_FINDINGS) when nothing is saved", async () => {
  const fx = setupCliFixture();
  try {
    __setReviewExecHooks({ ghExec: fx.ghExec });
    await assert.rejects(
      () => runReviewCmd(["7", "--publish-only", "--repo", fx.repoDir, "--json"], fx.store),
      (e: unknown) => e instanceof CliError && e.code === "NO_FINDINGS" && e.exitCode === 1,
    );
  } finally {
    __setReviewExecHooks(null);
    fs.rmSync(fx.tmpHome, { recursive: true, force: true });
  }
});
