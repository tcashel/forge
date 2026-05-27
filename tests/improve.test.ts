import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import type { CritiqueConfig, CritiqueSyncResult } from "../src/core/critique.ts";
import {
  extractActionableFindings,
  type ImproveConfig,
  type ImproveOverrides,
  parseImprovedOutput,
  rewriteSpec,
  runImprover,
} from "../src/core/improve.ts";
import { ForgeStore, type Plan } from "../src/core/store.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withTmpHome(t: { after: (fn: () => void) => void }): { home: string; store: ForgeStore } {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "forge-improve-"));
  const prev = process.env.HOME;
  process.env.HOME = home;
  t.after(() => {
    fs.rmSync(home, { recursive: true, force: true });
    if (prev !== undefined) process.env.HOME = prev;
    else delete process.env.HOME;
  });
  const store = new ForgeStore();
  return { home, store };
}

function seedTask(store: ForgeStore, id: string, body: string): Plan {
  const task: Plan = {
    id,
    title: "Original title",
    repoRoot: "/tmp/repo",
    repoName: "repo",
    branch: `forge/${id}`,
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: new Date().toISOString(),
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "",
    specVersion: 1,
    lastImproveError: null,
  };
  const fm = [
    "---",
    `id: ${task.id}`,
    `repo: ${task.repoRoot}`,
    `repoName: ${task.repoName}`,
    `createdAt: ${task.createdAt}`,
    `status: ${task.status}`,
    `suggestedBranch: ${task.branch}`,
    `specVersion: ${task.specVersion}`,
    "---",
    "",
  ].join("\n");
  task.specFile = store.writeSpec(id, fm + body);
  store.upsertPlan(task);
  return task;
}

const AGENT_CLAUDE = { agent: "claude", model: "claude-opus-4-7" } as const;
const AGENT_CODEX = { agent: "codex", model: "gpt-5-codex" } as const;

function buildConfig(task: Plan, body: string): ImproveConfig {
  return {
    planId: task.id,
    repoRoot: task.repoRoot,
    repoName: task.repoName,
    specTitle: task.title,
    specBody: body,
    contextContent: null,
    criticA: { ...AGENT_CLAUDE },
    criticB: { ...AGENT_CODEX },
    synthesizer: { ...AGENT_CLAUDE },
    improver: { ...AGENT_CLAUDE },
  };
}

const NOOP_RECS = `\`\`\`forge-spec-recommendations
## Summary

No actionable findings.

## Recommended Edits

(none)

## Findings Triage

| # | Finding | Critic A | Critic B | Classification | Action |
|---|---------|----------|----------|----------------|--------|

## Confidence Note

Both critics found minor issues only.
\`\`\`
`;

function actionableRecs(): string {
  return `\`\`\`forge-spec-recommendations
## Summary

Two findings.

## Recommended Edits

### 1. Tighten the acceptance criterion
**Classification:** corroborated
**Severity:** BLOCKER
**Source:** Critic A finding "vague AC" + Critic B finding "AC missing exit codes"
**Current spec text:**
> Acceptance: works as expected

**Recommended replacement:**
> Acceptance: returns exit 0 on success, 2 on validation error.

**Rationale:** specifies exit codes.

### 2. Add a quality gate
**Classification:** Synthesizer addition
**Severity:** HIGH
**Source:** noticed during synthesis
**Current spec text:**
> (none)

**Recommended replacement:**
> Run \`bun test\` before opening the PR.

**Rationale:** prevents regressions.

### 3. Style tweak
**Classification:** single-critic-only
**Severity:** LOW
**Source:** Critic A
**Rationale:** cosmetic.

## Findings Triage
\`\`\`
`;
}

function makeCritiqueMock(recsBody: string): ImproveOverrides["runCritiqueSync"] {
  return async (config: CritiqueConfig, store: ForgeStore): Promise<CritiqueSyncResult> => {
    const dir = store.getCritiqueDir(config.planId, config.critiqueId);
    fs.mkdirSync(dir, { recursive: true });
    const recsPath = path.join(dir, "recommendations.md");
    fs.writeFileSync(recsPath, recsBody);
    // Also seed critique-meta.json so markCritiqueViewed works on the no-op path.
    store.writeCritiqueMeta(config.planId, config.critiqueId, {
      schemaVersion: 1,
      planId: config.planId,
      critiqueId: config.critiqueId,
      specTitle: config.specTitle,
      repoRoot: config.repoRoot,
      repoName: config.repoName,
      status: "done",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      viewedAt: null,
      tmuxSession: "test-session",
      criticA: { agent: config.criticA.agent, model: config.criticA.model, status: "done", durationMs: 1 },
      criticB: { agent: config.criticB.agent, model: config.criticB.model, status: "done", durationMs: 1 },
      synthesizer: { agent: config.synthesizer.agent, model: config.synthesizer.model, status: "done", durationMs: 1 },
    });
    return { recommendationsPath: recsPath, critiqueId: config.critiqueId, error: null };
  };
}

function makeImproverMock(
  modeLine: "applied" | "no-op",
  improvedBody: string,
  summary: string,
): ImproveOverrides["runImproverAgent"] {
  return async (args) => {
    const out = `Some preamble.\n\n\`\`\`forge-spec-improved\n## Mode\n\n${modeLine}\n\n## Improved Spec\n\n${improvedBody}\n\n## Change Summary\n\n${summary}\n\`\`\`\n`;
    fs.writeFileSync(args.outputPath, out);
    fs.writeFileSync(args.errLogPath, "");
    return 0;
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("extractActionableFindings filters by severity and classification", () => {
  const findings = extractActionableFindings(actionableRecs());
  assert.equal(findings.length, 2);
  assert.equal(findings[0].number, 1);
  assert.equal(findings[1].number, 2);
  assert.match(findings[0].text, /BLOCKER/);
  assert.match(findings[1].text, /Synthesizer addition/);
});

test("extractActionableFindings returns empty for an empty edits section", () => {
  assert.equal(extractActionableFindings(NOOP_RECS).length, 0);
});

test("parseImprovedOutput reads mode + body + summary", () => {
  const raw =
    "garbage\n```forge-spec-improved\n## Mode\napplied\n## Improved Spec\n# Title\n\nbody\n## Change Summary\n- Recommendation #1: did X\n```\ntrailing";
  const out = parseImprovedOutput(raw);
  assert.ok(out);
  assert.equal(out.mode, "applied");
  assert.match(out.improvedSpec, /^# Title/);
  assert.match(out.changeSummary, /Recommendation #1/);
});

test("parseImprovedOutput handles inner ``` fences inside the improved spec body", () => {
  // Regression: real improver outputs contain code blocks (bash, yaml, etc.)
  // inside the spec body. A non-greedy outer match prematurely terminates
  // at the first inner ``` and the parser returns null.
  const raw = [
    "```forge-spec-improved",
    "## Mode",
    "applied",
    "## Improved Spec",
    "# Title",
    "",
    "Some prose.",
    "",
    "```bash",
    "bun test",
    "```",
    "",
    "More prose.",
    "",
    "```yaml",
    "ticketSource:",
    "  provider: linear",
    "```",
    "",
    "## Change Summary",
    "- Recommendation #1: did X",
    "- Recommendation #2: did Y",
    "```",
  ].join("\n");
  const out = parseImprovedOutput(raw);
  assert.ok(out, "parser must handle nested fences");
  assert.equal(out.mode, "applied");
  assert.match(out.improvedSpec, /^# Title/);
  assert.match(out.improvedSpec, /bun test/);
  assert.match(out.improvedSpec, /ticketSource:/);
  assert.match(out.changeSummary, /Recommendation #1/);
  assert.match(out.changeSummary, /Recommendation #2/);
});

test("rewriteSpec preserves existing frontmatter keys and adds the three new ones", () => {
  const src = `---\nid: abc\nrepo: /tmp/r\nrepoName: r\ncreatedAt: 2025-01-01T00:00:00Z\nstatus: draft\nsuggestedBranch: forge/x\nspecVersion: 1\n---\n# Old\n\nold body\n`;
  const next = rewriteSpec(src, "# New\n\nnew body", {
    specVersion: 2,
    improvedAt: "2026-01-01T00:00:00Z",
    critiqueId: "crit-xyz",
  });
  assert.match(next, /^---\nid: abc\n/);
  assert.match(next, /repo: \/tmp\/r/);
  assert.match(next, /createdAt: 2025-01-01T00:00:00Z/);
  assert.match(next, /suggestedBranch: forge\/x/);
  assert.match(next, /specVersion: 2/);
  assert.match(next, /improvedAt: 2026-01-01T00:00:00Z/);
  assert.match(next, /critiqueId: crit-xyz/);
  assert.match(next, /\n# New\n\nnew body/);
});

// ─── No-op path ──────────────────────────────────────────────────────────────

test("runImprover no-op path keeps spec untouched", async (t) => {
  const { store } = withTmpHome(t);
  const body = "# Title\n\nBody untouched.\n";
  const task = seedTask(store, "task-noop-001", body);
  const before = store.getSpec(task.id) ?? "";

  const result = await runImprover(buildConfig(task, body), store, {
    runCritiqueSync: makeCritiqueMock(NOOP_RECS),
  });

  assert.equal(result.applied, false);
  assert.equal(result.mode, "no-op");
  assert.equal(result.changeCount, 0);

  const after = store.getSpec(task.id) ?? "";
  assert.equal(after, before, "spec must be byte-identical on no-op");

  // markCritiqueViewed wrote viewedAt to the meta file.
  const meta = store.readCritiqueMeta(task.id, result.critiqueId);
  assert.ok(meta?.viewedAt, "critique should be marked viewed");

  const summaryPath = path.join(store.getCritiqueDir(task.id, result.critiqueId), "change-summary.md");
  assert.equal(fs.readFileSync(summaryPath, "utf-8"), "no-op\n");
});

// ─── Applied path ────────────────────────────────────────────────────────────

test("runImprover applied path bumps specVersion and writes frontmatter", async (t) => {
  const { store } = withTmpHome(t);
  const body = "# Old Title\n\nOld body.\n";
  const task = seedTask(store, "task-app-001", body);

  const improvedBody = "# New Title\n\nNew body with edits.\n";
  const summary = "- Recommendation #1: tightened acceptance criterion\n- Recommendation #2: added quality gate";
  const result = await runImprover(buildConfig(task, body), store, {
    runCritiqueSync: makeCritiqueMock(actionableRecs()),
    runImproverAgent: makeImproverMock("applied", improvedBody, summary),
  });

  assert.equal(result.mode, "applied");
  assert.equal(result.applied, true);
  assert.equal(result.changeCount, 2);

  // Plan.specVersion bumped 1 → 2.
  const updated = store.getPlan(task.id);
  assert.equal(updated?.specVersion, 2);

  // Spec frontmatter contains the three new keys plus all originals.
  const live = store.getSpec(task.id) ?? "";
  assert.match(live, /id: task-app-001/);
  assert.match(live, /repo: \/tmp\/repo/);
  assert.match(live, /createdAt: /);
  assert.match(live, /suggestedBranch: forge\/task-app-001/);
  assert.match(live, /status: draft/);
  assert.match(live, /specVersion: 2/);
  assert.match(live, /improvedAt: /);
  assert.match(live, new RegExp(`critiqueId: ${result.critiqueId}`));

  // Body matches the improved body verbatim.
  const liveBody = live.replace(/^---[\s\S]*?---\n/, "").trimEnd();
  assert.equal(liveBody, improvedBody.trimEnd());
});

// ─── Critique failure ────────────────────────────────────────────────────────

test("runImprover surfaces critique failures and leaves the spec alone", async (t) => {
  const { store } = withTmpHome(t);
  const body = "# Title\n\nBody.\n";
  const task = seedTask(store, "task-fail-001", body);
  const before = store.getSpec(task.id) ?? "";

  let agentCalls = 0;
  const result = await runImprover(buildConfig(task, body), store, {
    runCritiqueSync: async (config) => ({
      recommendationsPath: path.join(store.getCritiqueDir(task.id, config.critiqueId), "recommendations.md"),
      critiqueId: config.critiqueId,
      error: "boom",
    }),
    runImproverAgent: async () => {
      agentCalls += 1;
      return 0;
    },
  });

  assert.equal(result.mode, "skipped");
  assert.equal(result.applied, false);
  assert.equal(result.error, "boom");
  assert.equal(agentCalls, 0, "improver agent must not run when critique fails");
  assert.equal(store.getSpec(task.id), before);
});

// ─── Cumulative invocation ───────────────────────────────────────────────────

test("runImprover is cumulative — two passes bump specVersion 1 → 2 → 3", async (t) => {
  const { store } = withTmpHome(t);
  const body = "# Title\n\nBody.\n";
  const task = seedTask(store, "task-cum-001", body);

  const recs = actionableRecs();
  const r1 = await runImprover(buildConfig(task, body), store, {
    runCritiqueSync: makeCritiqueMock(recs),
    runImproverAgent: makeImproverMock(
      "applied",
      "# Pass 1\n\npass 1 body\n",
      "- Recommendation #1: x\n- Recommendation #2: y",
    ),
  });
  assert.equal(r1.applied, true);
  assert.equal(store.getPlan(task.id)?.specVersion, 2);

  // Second pass uses the already-improved body.
  const taskAfter = store.getPlan(task.id);
  if (!taskAfter) throw new Error("task missing");
  const bodyAfter1 = (store.getSpec(task.id) ?? "").replace(/^---[\s\S]*?---\n/, "");
  const r2 = await runImprover(buildConfig(taskAfter, bodyAfter1), store, {
    runCritiqueSync: makeCritiqueMock(recs),
    runImproverAgent: makeImproverMock(
      "applied",
      "# Pass 2\n\npass 2 body\n",
      "- Recommendation #1: x\n- Recommendation #2: y",
    ),
  });
  assert.equal(r2.applied, true);
  assert.notEqual(r1.critiqueId, r2.critiqueId, "each pass generates a new critiqueId");

  const final = store.getPlan(task.id);
  assert.equal(final?.specVersion, 3);

  const liveSpec = store.getSpec(task.id) ?? "";
  assert.match(liveSpec, new RegExp(`critiqueId: ${r2.critiqueId}`));

  // Two distinct critique dirs.
  assert.ok(fs.existsSync(store.getCritiqueDir(task.id, r1.critiqueId)));
  assert.ok(fs.existsSync(store.getCritiqueDir(task.id, r2.critiqueId)));
});

// ─── Improver no-op despite findings ─────────────────────────────────────────

test("runImprover treats Mode: no-op as a contract violation when findings exist", async (t) => {
  const { store } = withTmpHome(t);
  const body = "# Title\n\nBody.\n";
  const task = seedTask(store, "task-nopdesp-001", body);
  const before = store.getSpec(task.id) ?? "";

  const result = await runImprover(buildConfig(task, body), store, {
    runCritiqueSync: makeCritiqueMock(actionableRecs()),
    // Improver claims no-op despite findings — orchestrator must reject it.
    runImproverAgent: makeImproverMock("no-op", "# unused\n\n", "- Recommendation #1: noop"),
  });

  assert.equal(result.mode, "skipped");
  assert.equal(result.applied, false);
  assert.equal(result.error, "IMPROVE_NOOP_DESPITE_FINDINGS");
  assert.equal(store.getSpec(task.id), before);
});
