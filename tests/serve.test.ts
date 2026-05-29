/**
 * forge serve — read endpoint smoke tests.
 *
 * Boots the HTTP server against a tmp ~/.forge/, hits each read endpoint,
 * and asserts on the envelope shape. Bun's runtime is required (the
 * server uses Bun.serve); tests run via `bun test`.
 */

import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { startServer } from "../src/cli/cmd/serve.ts";
import { recordJobStarted, recordPlanCreated, syncJobState } from "../src/core/db/writes.ts";
import type { FetchPrBundleResult, GhFetchOpts, GhPr, PrBundle } from "../src/core/gh-pr.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

interface ServerHandle {
  baseUrl: string;
  stop: () => void;
  store: ForgeStore;
  tmpHome: string;
}

async function bootServer(
  opts: {
    prFetcher?: (opts: GhFetchOpts) => Promise<{ prs: GhPr[]; me: string }>;
    prBundleFetcher?: (prNum: number, opts: GhFetchOpts) => Promise<FetchPrBundleResult>;
  } = {},
): Promise<ServerHandle> {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-serve-"));
  const forgeDir = path.join(tmpHome, ".forge");
  try {
    // Pass forgeDir explicitly: os.homedir() is captured at process start
    // and won't pick up mid-run HOME tweaks, so we can't isolate via env.
    const store = new ForgeStore({ forgeDir });
    const { port, stop } = await startServer(store, {
      port: 0,
      host: "127.0.0.1",
      prFetcher: opts.prFetcher,
      prBundleFetcher: opts.prBundleFetcher,
    });
    return {
      baseUrl: `http://127.0.0.1:${port}`,
      store,
      tmpHome,
      stop: () => {
        stop();
        fs.rmSync(tmpHome, { recursive: true, force: true });
      },
    };
  } catch (e) {
    fs.rmSync(tmpHome, { recursive: true, force: true });
    throw e;
  }
}

// Structural envelope (not a discriminated union) so `body.data!.X` access
// in tests doesn't need narrowing on every line. `data` and `error` are
// optional; tests assert on `ok` and then read whichever is present. The
// repo-wide biome override allows non-null assertions in tests, which we
// rely on for the inner shapes.
interface Envelope {
  ok: boolean;
  data?: {
    plans?: PlanView[];
    repos?: RepoView[];
    repo?: RepoView;
    registeredRepos?: RepoView[];
    currentRepo?: { name: string; root: string };
    prs?: GhPr[];
    me?: string;
    repoRoot?: string | null;
    task?: PlanView;
    body?: string;
    ok?: boolean;
    version?: string;
    [k: string]: unknown;
  };
  error?: { code: string; message: string; hint?: string };
}

interface PlanView {
  id: string;
  title: string;
  section: string;
  statLabel: string;
  blurb?: string;
  repo: string;
  hasLog: boolean;
  agentLabel?: string;
  [k: string]: unknown;
}

interface RepoView {
  name: string;
  root: string;
  planCount: number;
  current?: boolean;
  registered?: boolean;
  reachable?: boolean;
  hasGit?: boolean;
  stale?: boolean;
  [k: string]: unknown;
}

async function getJson(url: string): Promise<{ status: number; body: Envelope }> {
  const res = await fetch(url);
  let body: Envelope | null = null;
  try {
    body = (await res.json()) as Envelope;
  } catch {
    /* non-JSON */
  }
  if (!body) throw new Error(`No JSON body from ${url}`);
  return { status: res.status, body };
}

function makeDraftTask(store: ForgeStore, id: string, repoRoot: string, repoName: string, title: string) {
  const now = new Date().toISOString();
  const specBody = `# ${title}\n\nA short blurb describing the work.\n\n## Acceptance criteria\n\n- it does the thing\n`;
  const specPath = store.writeSpec(id, specBody);
  store.upsertPlan({
    id,
    title,
    repoRoot,
    repoName,
    branch: `forge/${id}`,
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: now,
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: specPath,
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });
}

function fakePr(number: number): GhPr {
  return {
    number,
    title: `PR ${number}`,
    headRefName: `forge/pr-${number}`,
    baseRefName: "main",
    url: `https://github.com/acme/repo/pull/${number}`,
    isDraft: true,
    statusCheckRollup: "PENDING",
    reviewDecision: "REVIEW_REQUIRED",
    author: "alice",
    updatedAt: new Date().toISOString(),
    additions: 10,
    deletions: 2,
    changedFiles: 3,
    commentsCount: 1,
    reviewsCount: 0,
    isMine: true,
  };
}

function makeGitRepo(prefix: string): string {
  const repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  execFileSync("git", ["init"], { cwd: repo, stdio: "ignore" });
  return repo;
}

// Phase 4 helpers: makeDraftTask only writes the JSON index. The new
// observability endpoints read from SQLite, so the tests below need a
// plan with its plans + plan_versions + synthetic tasks rows.
function makeBackedPlan(store: ForgeStore, id: string): Plan {
  const plan: Plan = {
    id,
    title: `Plan ${id}`,
    repoRoot: "/tmp/repo",
    repoName: "repo",
    branch: `forge/${id}`,
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: "2026-05-01T08:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: `${id}.md`,
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
  store.upsertPlan(plan);
  store.writeSpec(id, `# Plan ${id}\nbody`);
  recordPlanCreated(store.db.db, plan, `# Plan ${id}\nbody`);
  return plan;
}

function makeJobMeta(planId: string, startedAt: string): RunMeta {
  return {
    planId,
    tmuxSession: `forge-${planId}`,
    logFile: "/dev/null",
    agent: "claude",
    model: "sonnet-4-6",
    worktree: "/tmp/wt",
    status: "running",
    startedAt,
    prUrl: null,
  };
}

test("GET /api/agent-activity returns rows for execution sessions", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const plan = makeBackedPlan(h.store, "plan-act-1");
  // recordJobStarted seeds the execution session via upsertSession.
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T09:00:00.000Z"));

  const { body } = await getJson(`${h.baseUrl}/api/agent-activity`);
  assert.equal(body.ok, true);
  const rows = (body.data as { rows: Array<{ purpose: string; state: string; plan: { id: string } | null }> }).rows;
  assert.ok(rows.length >= 1, "at least one session row");
  const exec = rows.find((r) => r.purpose === "execution");
  assert.ok(exec, "execution session shows up");
  assert.equal(exec?.state, "running");
  assert.equal(exec?.plan?.id, plan.id);
});

test("GET /api/agent-activity filters by state", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const plan = makeBackedPlan(h.store, "plan-act-2");
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T09:00:00.000Z"));

  const liveResp = await getJson(`${h.baseUrl}/api/agent-activity?state=running`);
  const liveRows = (liveResp.body.data as { rows: Array<{ state: string }> }).rows;
  assert.ok(liveRows.every((r) => r.state === "running"));

  const failedResp = await getJson(`${h.baseUrl}/api/agent-activity?state=failed`);
  const failedRows = (failedResp.body.data as { rows: Array<unknown> }).rows;
  assert.equal(failedRows.length, 0);
});

test("legacy /api/tasks/* redirects to /api/plans/* with 308 (Phase 3.5 alias)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  // 308 preserves method + body across the redirect, so POST/DELETE keep working.
  const res = await fetch(`${h.baseUrl}/api/tasks/some-id/spec`, { redirect: "manual" });
  assert.equal(res.status, 308);
  assert.equal(res.headers.get("location"), "/api/plans/some-id/spec");

  // Query strings ride through.
  const res2 = await fetch(`${h.baseUrl}/api/tasks?repo=foo`, { redirect: "manual" });
  assert.equal(res2.status, 308);
  assert.equal(res2.headers.get("location"), "/api/plans?repo=foo");
});

test("GET /api/health returns ok", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/health`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.ok, true);
});

test("GET / returns the workbench HTML", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const res = await fetch(`${h.baseUrl}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Forge — Workbench/);
  // Phase 6: Preact owns the shell; index.html ships a bare <div id="app"/>
  // and loads only the bundled module — no legacy /app.js any more.
  assert.match(html, /<div id="app">/);
  assert.match(html, /src="\/dist\/main\.js"/);
  assert.doesNotMatch(html, /\/app\.js/);
});

test("empty index → /api/plans returns []", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/plans`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.deepEqual(body.data!.plans, []);
});

test("empty index → /api/repos still exposes the current repo context", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { body } = await getJson(`${h.baseUrl}/api/repos`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.repos!.length >= 1, true);
  const current = body.data!.repos!.find((r) => r.current);
  assert.ok(current, "current repo should be present");
  assert.equal(current.reachable, true);
  assert.equal(current.hasGit, true);
});

test("GET /api/workbench/context returns current repo and registered repos", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/workbench/context`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.ok(body.data!.currentRepo);
  assert.deepEqual(body.data!.registeredRepos, []);
});

test("GET /api/config returns current repo config", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  h.store.setRepoConfig(process.cwd(), { defaultAgent: "codex", defaultModel: "gpt-5.5" });

  const { status, body } = await getJson(`${h.baseUrl}/api/config`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.repo!.root, process.cwd());
  assert.deepEqual(body.data!.config, { defaultAgent: "codex", defaultModel: "gpt-5.5" });
});

test("POST /api/config saves validated repo settings", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());

  const { status, body } = await postJson(`${h.baseUrl}/api/config`, {
    repoRoot: process.cwd(),
    config: { defaultAgent: "claude", autoImprove: false, autoFixRounds: 2, ghHost: "github.com" },
  });
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  const cfg = body.data!.config as { defaultAgent: string; autoImprove: boolean; autoFixRounds: number };
  assert.equal(cfg.defaultAgent, "claude");
  assert.equal(cfg.autoImprove, false);
  assert.equal(cfg.autoFixRounds, 2);
  assert.equal(h.store.getRepoConfig(process.cwd()).ghHost, "github.com");
});

test("POST /api/config rejects invalid values", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());

  const { status, body } = await postJson(`${h.baseUrl}/api/config`, {
    repoRoot: process.cwd(),
    config: { defaultAgent: "bad-agent" },
  });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "BAD_VALUE");
});

test("single draft → /api/plans enriches with section + statLabel + blurb", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-foo", h.tmpHome, "demo", "feat(demo): add the thing");
  const { body } = await getJson(`${h.baseUrl}/api/plans`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.plans!.length, 1);
  const task = body.data!.plans![0];
  assert.equal(task.id, "draft-foo");
  assert.equal(task.title, "feat(demo): add the thing");
  assert.equal(task.section, "drafting");
  assert.equal(task.statLabel, "Drafting");
  assert.match(task.blurb as string, /short blurb/);
  assert.equal(task.repo, "demo");
});

test("single draft → /api/plans/:id returns full record", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-bar", h.tmpHome, "demo", "feat(demo): bar");
  const { body } = await getJson(`${h.baseUrl}/api/plans/draft-bar`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.task!.id, "draft-bar");
  assert.equal(body.data!.task!.section, "drafting");
});

test("/api/plans/:id/spec returns markdown body", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-spec", h.tmpHome, "demo", "feat(demo): spec");
  const { body } = await getJson(`${h.baseUrl}/api/plans/draft-spec/spec`);
  assert.equal(body.ok, true);
  assert.match(body.data!.body as string, /^# feat\(demo\): spec/);
});

test("unknown task id → 404 envelope", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/plans/nope`);
  assert.equal(status, 404);
  assert.equal(body.ok, false);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("GET /api/plans/:id/history returns the unified timeline (Phase 4)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const plan = makeBackedPlan(h.store, "plan-hist");
  // Two launches → four launch events on the timeline (started + completed × 2).
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T10:00:00.000Z"));
  syncJobState(h.store.db.db, plan, { status: "failed", endedAt: "2026-05-01T10:30:00.000Z" });
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T11:00:00.000Z"));

  const { body } = await getJson(`${h.baseUrl}/api/plans/${plan.id}/history`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.planId, plan.id);
  const events = body.data!.events as Array<{ kind: string; ts: string }>;
  // 1 spec_saved + 2 launch_started + 1 launch_completed = 4 events.
  assert.equal(events.length, 4);
  assert.deepEqual(
    events.map((e) => e.kind),
    ["launch_started", "launch_completed", "launch_started", "spec_saved"],
  );
});

test("PlanView includes provenance: spec version + prior-run count + last state (Phase 4e)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const plan = makeBackedPlan(h.store, "plan-prov");
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T10:00:00.000Z"));
  syncJobState(h.store.db.db, plan, { status: "failed", endedAt: "2026-05-01T10:30:00.000Z" });
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T11:00:00.000Z"));

  const { body } = await getJson(`${h.baseUrl}/api/plans/${plan.id}`);
  const view = body.data!.task as unknown as {
    provenance: { specVersion: number; priorRuns: number; lastRunState: string };
  };
  assert.ok(view.provenance, "provenance is populated for plans with a DB row");
  assert.equal(view.provenance.specVersion, 1);
  assert.equal(view.provenance.priorRuns, 2);
  assert.equal(view.provenance.lastRunState, "running");
});

test("GET /api/plans/:id/jobs returns all prior launches newest-first (Phase 4)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const plan = makeBackedPlan(h.store, "plan-jobs");
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T10:00:00.000Z"));
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T11:00:00.000Z"));
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T12:00:00.000Z"));

  const { body } = await getJson(`${h.baseUrl}/api/plans/${plan.id}/jobs`);
  assert.equal(body.ok, true);
  const jobs = body.data!.jobs as Array<{ run_number: number }>;
  assert.deepEqual(
    jobs.map((j) => j.run_number),
    [3, 2, 1],
  );
});

test("GET /api/jobs/:id returns the single job + its (empty) artifacts (Phase 4)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const plan = makeBackedPlan(h.store, "plan-jobid");
  recordJobStarted(h.store.db.db, plan, makeJobMeta(plan.id, "2026-05-01T10:00:00.000Z"));
  const { body } = await getJson(`${h.baseUrl}/api/jobs/j-${plan.id}-r1`);
  assert.equal(body.ok, true);
  assert.equal((body.data!.job as { run_number: number }).run_number, 1);
  assert.deepEqual(body.data!.artifacts, []);
});

test("GET /api/jobs/:id returns 404 UNKNOWN_JOB for a bogus id", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/jobs/does-not-exist`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_JOB");
});

test("GET /api/sessions/:id/events paginates session_events by rowid (Phase 4)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  // Hand-seed a session + events because we don't have a writer for
  // session_events yet — Phase 4's job is to surface them, not record them.
  h.store.db.db
    .prepare(
      `INSERT INTO sessions (id, purpose, related_id, agent_adapter, model, started_at, state)
       VALUES ('s-evt', 'critique', 'crit-x', 'claude', 'sonnet-4-6', '2026-05-01T10:00:00.000Z', 'running')`,
    )
    .run();
  const insertEvent = h.store.db.db.prepare(
    `INSERT INTO session_events (session_id, sequence, timestamp, kind, payload) VALUES (?, ?, ?, ?, ?)`,
  );
  for (let i = 0; i < 5; i++) {
    insertEvent.run("s-evt", i, `2026-05-01T10:0${i}:00.000Z`, "stdout", `chunk-${i}`);
  }

  const { body } = await getJson(`${h.baseUrl}/api/sessions/s-evt/events?limit=3`);
  assert.equal(body.ok, true);
  const events = body.data!.events as Array<{ id: number; kind: string }>;
  assert.equal(events.length, 3);
  assert.equal(events[0].kind, "stdout");

  // Use the last event's id as the `after` cursor to fetch the remaining two.
  const lastId = events[2].id;
  const { body: body2 } = await getJson(`${h.baseUrl}/api/sessions/s-evt/events?after=${lastId}`);
  assert.equal((body2.data!.events as unknown[]).length, 2);
});

test("repo filter returns only the requested repo's tasks", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-a", "/repo-a", "alpha", "feat(alpha): a");
  makeDraftTask(h.store, "draft-b", "/repo-b", "beta", "feat(beta): b");
  const { body } = await getJson(`${h.baseUrl}/api/plans?repo=alpha`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.plans!.length, 1);
  assert.equal(body.data!.plans![0].repo, "alpha");
});

test("/api/repos groups by repoRoot with a task count", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-a1", "/repo-a", "alpha", "feat(alpha): one");
  makeDraftTask(h.store, "draft-a2", "/repo-a", "alpha", "feat(alpha): two");
  makeDraftTask(h.store, "draft-b1", "/repo-b", "beta", "feat(beta): one");
  const { body } = await getJson(`${h.baseUrl}/api/repos`);
  assert.equal(body.ok, true);
  const byName = new Map((body.data!.repos ?? []).map((r) => [r.name, r] as const));
  assert.equal(byName.get("alpha")!.planCount, 2);
  assert.equal(byName.get("beta")!.planCount, 1);
});

test("POST /api/repos registers a git repo with no tasks", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "forge-registered-repo-")));
  execFileSync("git", ["init"], { cwd: repo, stdio: "ignore" });
  const { status, body } = await postJson(`${h.baseUrl}/api/repos`, { repoRoot: repo });
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.repo!.root, repo);

  const after = await getJson(`${h.baseUrl}/api/repos`);
  const registered = after.body.data!.repos!.find((r) => r.root === repo);
  assert.ok(registered, "registered repo should be listed");
  assert.equal(registered.planCount, 0);
  assert.equal(registered.registered, true);
  assert.equal(registered.stale, false);
});

test("POST /api/repos rejects non-git repoRoot", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "forge-not-git-"));
  const { status, body } = await postJson(`${h.baseUrl}/api/repos`, { repoRoot: repo });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "NOT_A_REPO");
});

test("GET /api/prs uses current repo when there are no tasks", async (t) => {
  let seenCwd = "";
  const h = await bootServer({
    prFetcher: async (opts) => {
      seenCwd = opts.cwd ?? "";
      return { prs: [fakePr(101)], me: "alice" };
    },
  });
  t.after(() => h.stop());

  const { status, body } = await getJson(`${h.baseUrl}/api/prs`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.prs!.length, 1);
  assert.equal(body.data!.repoRoot, process.cwd());
  assert.equal(seenCwd, process.cwd());
});

test("GET /api/prs resolves registered repo by absolute root", async (t) => {
  const repo = makeGitRepo("forge-pr-registered-root-");
  let seenCwd = "";
  const h = await bootServer({
    prFetcher: async (opts) => {
      seenCwd = opts.cwd ?? "";
      return { prs: [fakePr(202)], me: "alice" };
    },
  });
  t.after(() => {
    h.stop();
    fs.rmSync(repo, { recursive: true, force: true });
  });
  h.store.registerWorkbenchRepo({ root: repo, name: path.basename(repo) });

  const { body } = await getJson(`${h.baseUrl}/api/prs?repo=${encodeURIComponent(repo)}`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.prs![0].number, 202);
  assert.equal(body.data!.repoRoot, repo);
  assert.equal(seenCwd, repo);
});

test("GET /api/prs resolves registered repo by name", async (t) => {
  const repo = makeGitRepo("forge-pr-registered-name-");
  let seenCwd = "";
  const h = await bootServer({
    prFetcher: async (opts) => {
      seenCwd = opts.cwd ?? "";
      return { prs: [fakePr(303)], me: "alice" };
    },
  });
  t.after(() => {
    h.stop();
    fs.rmSync(repo, { recursive: true, force: true });
  });
  const name = path.basename(repo);
  h.store.registerWorkbenchRepo({ root: repo, name });

  const { body } = await getJson(`${h.baseUrl}/api/prs?repo=${encodeURIComponent(name)}`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.prs![0].number, 303);
  assert.equal(body.data!.repoRoot, repo);
  assert.equal(seenCwd, repo);
});

test("GET /api/prs prefers reachable current repo over stale same-name task repo", async (t) => {
  let seenCwd = "";
  const h = await bootServer({
    prFetcher: async (opts) => {
      seenCwd = opts.cwd ?? "";
      return { prs: [fakePr(404)], me: "alice" };
    },
  });
  t.after(() => h.stop());
  makeDraftTask(
    h.store,
    "stale-pr-repo",
    path.join(h.tmpHome, "missing"),
    path.basename(process.cwd()),
    "feat(stale): old",
  );

  const { body } = await getJson(`${h.baseUrl}/api/prs?repo=${encodeURIComponent(path.basename(process.cwd()))}`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.prs![0].number, 404);
  assert.equal(body.data!.repoRoot, process.cwd());
  assert.equal(seenCwd, process.cwd());
});

function fakeBundle(prNum: number): PrBundle {
  return {
    pr: { ...fakePr(prNum), isMine: false, reviewsCount: 0, commentsCount: 0 },
    diff: "diff --git a/x b/x\nindex 1..2 100644\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n-a\n+b\n",
    diffStats: { additions: 1, deletions: 1, changedFiles: 1 },
    inlineComments: [],
    issueComments: [],
    prReviews: [],
    warnings: [],
  };
}

test("GET /api/prs/:num/review-bundle returns merged bundle for a known PR", async (t) => {
  const h = await bootServer({
    prBundleFetcher: async (num) => ({ ok: true, bundle: fakeBundle(num) }),
  });
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/prs/42/review-bundle`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  const data = body.data as {
    pr: { number: number };
    diff: string;
    inlineComments: unknown[];
    issueComments: unknown[];
    linkedPlanId: string | null;
    worktreePath: string | null;
    warnings: unknown[];
  };
  assert.equal(data.pr.number, 42);
  assert.match(data.diff, /diff --git/);
  assert.deepEqual(data.inlineComments, []);
  assert.deepEqual(data.issueComments, []);
  assert.equal(data.linkedPlanId, null);
  assert.equal(data.worktreePath, null);
  assert.deepEqual(data.warnings, []);
});

test("GET /api/prs/:num/review-bundle rejects non-numeric PR numbers", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/prs/abc/review-bundle`);
  assert.equal(status, 400);
  assert.equal(body.error!.code, "INVALID_PR_NUMBER");
});

test("GET /api/prs/:num/review-bundle 404s when gh pr view fails", async (t) => {
  const h = await bootServer({
    prBundleFetcher: async () => ({ ok: false, error: "could not find pull request" }),
  });
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/prs/9999/review-bundle`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "PR_NOT_FOUND");
  assert.match(body.error!.message, /could not find/);
});

test("GET /api/prs/:num/review-bundle 404s when the repo is unknown", async (t) => {
  const h = await bootServer({
    prBundleFetcher: async (num) => ({ ok: true, bundle: fakeBundle(num) }),
  });
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/prs/1/review-bundle?repo=/tmp/no-such-repo`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_REPO");
});

test("GET /api/prs/:num/review-bundle links to a matching plan by repoRoot+prNumber", async (t) => {
  const h = await bootServer({
    prBundleFetcher: async (num) => ({ ok: true, bundle: fakeBundle(num) }),
  });
  t.after(() => h.stop());
  const id = "plan-pr-link";
  const now = new Date().toISOString();
  const repoRoot = process.cwd();
  h.store.upsertPlan({
    id,
    title: "feat(demo): link",
    repoRoot,
    repoName: path.basename(repoRoot),
    branch: `forge/${id}`,
    worktree: null,
    status: "done",
    agent: null,
    model: null,
    createdAt: now,
    launchedAt: now,
    completedAt: now,
    prUrl: "https://example.com/pull/77",
    prNumber: 77,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: h.store.writeSpec(id, "# spec\n"),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });

  const { body } = await getJson(`${h.baseUrl}/api/prs/77/review-bundle`);
  assert.equal(body.ok, true);
  assert.equal((body.data as { linkedPlanId: string | null }).linkedPlanId, id);
});

test("missing task repoRoot is marked stale in /api/repos and /api/plans", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const missing = path.join(h.tmpHome, "missing-repo");
  makeDraftTask(h.store, "stale-repo-task", missing, "missing", "feat(missing): stale");

  const repos = await getJson(`${h.baseUrl}/api/repos`);
  const staleRepo = repos.body.data!.repos!.find((r) => r.root === missing);
  assert.ok(staleRepo, "stale repo should still be visible");
  assert.equal(staleRepo!.reachable, false);
  assert.equal(staleRepo!.hasGit, false);
  assert.equal(staleRepo!.stale, true);

  const tasks = await getJson(`${h.baseUrl}/api/plans`);
  const task = tasks.body.data!.plans!.find((x) => x.id === "stale-repo-task");
  assert.equal(task!.repoStale, true);
});

test("running task surfaces section=running + log file path", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  // Seed a running task by hand.
  const id = "run-baz";
  const now = new Date().toISOString();
  h.store.upsertPlan({
    id,
    title: "feat(demo): running",
    repoRoot: h.tmpHome,
    repoName: "demo",
    branch: "forge/run-baz",
    worktree: null,
    status: "running",
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: now,
    launchedAt: now,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: "forge-run-baz",
    logFile: null,
    jiraTicket: null,
    specFile: h.store.writeSpec(id, "# running task\n"),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });
  // Drop a log file so hasLog flips true.
  fs.mkdirSync(path.join(h.store.runsDir, id), { recursive: true });
  fs.writeFileSync(h.store.getLogFile(id), "[12:00:00] starting up\n[12:00:01] working\n");

  const { body } = await getJson(`${h.baseUrl}/api/plans`);
  const task = (body.data!.plans ?? []).find((x) => x.id === id);
  assert.ok(task, "task should be in the list");
  assert.equal(task.section, "running");
  assert.equal(task.hasLog, true);
  assert.equal(task.agentLabel, "claude · opus-4-7");
});

test("path traversal under / is blocked", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const res = await fetch(`${h.baseUrl}/../package.json`);
  // The browser/fetch will normalize the URL before sending; the ".." gets
  // collapsed client-side. The server still has to refuse anything that
  // resolves outside src/web/ when it does see a relative-ish path. We
  // exercise the explicit guard via a known-out-of-tree path.
  const res2 = await fetch(`${h.baseUrl}/%2e%2e/package.json`);
  // Either the path normalizes safely (200/404 from the static handler)
  // or the guard fires (403). Both are acceptable; the failure mode we
  // care about is a 200 returning package.json content.
  if (res2.status === 200) {
    const txt = await res2.text();
    assert.doesNotMatch(txt, /"name":\s*"forge"/);
  }
  // Drain primary response.
  await res.text();
});

test("POST is rejected on read endpoints", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const res = await fetch(`${h.baseUrl}/api/plans`, { method: "POST" });
  assert.equal(res.status, 405);
  const body = (await res.json()) as Envelope;
  assert.equal(body.error!.code, "METHOD_NOT_ALLOWED");
});

// ─── action endpoints ────────────────────────────────────────────────────────

async function postJson(url: string, body?: unknown): Promise<{ status: number; body: Envelope }> {
  const res = await fetch(url, {
    method: "POST",
    headers: body !== undefined ? { "content-type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let parsed: Envelope | null = null;
  try {
    parsed = (await res.json()) as Envelope;
  } catch {
    /* non-JSON */
  }
  if (!parsed) throw new Error(`No JSON body from POST ${url}`);
  return { status: res.status, body: parsed };
}

test("POST /api/specs rejects non-JSON content-type", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const res = await fetch(`${h.baseUrl}/api/specs`, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "not json",
  });
  assert.equal(res.status, 415);
  const body = (await res.json()) as Envelope;
  assert.equal(body.error!.code, "UNSUPPORTED_MEDIA_TYPE");
});

test("POST /api/specs rejects body missing markdown", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs`, { repoRoot: "/tmp/foo" });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "BAD_REQUEST");
  assert.match(body.error!.message, /markdown/);
});

test("POST /api/specs rejects relative repoRoot", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs`, {
    markdown: "# feat(x): y\n\nbody",
    repoRoot: "relative/path",
  });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "BAD_REQUEST");
});

test("POST /api/specs rejects non-git repoRoot", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs`, {
    markdown: "# feat(x): y\n\nbody",
    repoRoot: h.tmpHome, // exists but not a git repo
  });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "NOT_A_REPO");
});

test("POST /api/plans/:id/launch returns 404 for unknown task", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/nope/launch`, {});
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/plans/:id/critique returns 404 for unknown task", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/nope/critique`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/plans/:id/improve returns 404 for unknown task", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/nope/improve`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/plans/:id/improve queues a draft task (returns immediately, no event-loop block)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "improve-queue", h.tmpHome, "demo", "feat(demo): improvable");
  const start = Date.now();
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/improve-queue/improve`);
  const elapsed = Date.now() - start;
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.queued, true);
  assert.equal(typeof body.data!.pid, "number");
  // The whole point is to NOT block on the improve work — must return fast
  // even though the spawned child is doing real work in another process.
  assert.ok(elapsed < 2000, `expected fast response, got ${elapsed}ms`);
});

test("startServer reaps stale critique-meta on boot", async (t) => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-reap-"));
  const forgeDir = path.join(tmpHome, ".forge");
  const store = new ForgeStore({ forgeDir });
  // Seed a critique-meta in `running_critics` with a startedAt 30 minutes ago.
  // We expect the reaper at startServer to mark it failed.
  const planId = "reap-target";
  makeDraftTask(store, planId, tmpHome, "demo", "feat(demo): reap me");
  const critiqueId = "crit-stale-001";
  const dir = store.getCritiqueDir(planId, critiqueId);
  fs.mkdirSync(dir, { recursive: true });
  const oldStartedAt = new Date(Date.now() - 30 * 60_000).toISOString();
  store.writeCritiqueMeta(planId, critiqueId, {
    schemaVersion: 1,
    planId,
    critiqueId,
    specTitle: "feat(demo): reap me",
    repoRoot: tmpHome,
    repoName: "demo",
    status: "running_critics",
    startedAt: oldStartedAt,
    completedAt: null,
    viewedAt: null,
    tmuxSession: "forge-crit-fake-stale",
    criticA: {
      agent: "claude",
      model: "claude-opus-4-7",
      reasoningEffort: undefined,
      status: "pending",
      durationMs: null,
    },
    criticB: { agent: "codex", model: "gpt-5.5", reasoningEffort: undefined, status: "pending", durationMs: null },
    synthesizer: {
      agent: "claude",
      model: "claude-opus-4-7",
      reasoningEffort: undefined,
      status: "pending",
      durationMs: null,
    },
  });

  const { stop } = await startServer(store, { port: 0, host: "127.0.0.1" });
  t.after(() => {
    stop();
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  const meta = store.readCritiqueMeta(planId, critiqueId);
  assert.equal(meta!.status, "failed");
  assert.ok(meta!.completedAt, "reaped record should have a completedAt");
});

test("startServer leaves recent critique-meta alone (under stale threshold)", async (t) => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-reap-recent-"));
  const forgeDir = path.join(tmpHome, ".forge");
  const store = new ForgeStore({ forgeDir });
  const planId = "recent-improving";
  makeDraftTask(store, planId, tmpHome, "demo", "feat(demo): recent");
  const critiqueId = "crit-recent-001";
  const dir = store.getCritiqueDir(planId, critiqueId);
  fs.mkdirSync(dir, { recursive: true });
  // 30 seconds ago — well under the 10-minute stale threshold.
  const recentStartedAt = new Date(Date.now() - 30_000).toISOString();
  store.writeCritiqueMeta(planId, critiqueId, {
    schemaVersion: 1,
    planId,
    critiqueId,
    specTitle: "feat(demo): recent",
    repoRoot: tmpHome,
    repoName: "demo",
    status: "running_critics",
    startedAt: recentStartedAt,
    completedAt: null,
    viewedAt: null,
    tmuxSession: "forge-crit-fake-recent",
    criticA: {
      agent: "claude",
      model: "claude-opus-4-7",
      reasoningEffort: undefined,
      status: "pending",
      durationMs: null,
    },
    criticB: { agent: "codex", model: "gpt-5.5", reasoningEffort: undefined, status: "pending", durationMs: null },
    synthesizer: {
      agent: "claude",
      model: "claude-opus-4-7",
      reasoningEffort: undefined,
      status: "pending",
      durationMs: null,
    },
  });

  const { stop } = await startServer(store, { port: 0, host: "127.0.0.1" });
  t.after(() => {
    stop();
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  const meta = store.readCritiqueMeta(planId, critiqueId);
  assert.equal(meta!.status, "running_critics", "recent record must not be reaped");
});

test("POST /api/plans/:id/resume returns 501", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/anything/resume`);
  assert.equal(status, 501);
  assert.equal(body.error!.code, "NOT_IMPLEMENTED");
});

test("POST /api/plans/:id/kill flips status, merges errorMessage into run-meta", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());

  const id = "kill-target";
  const now = new Date().toISOString();
  h.store.upsertPlan({
    id,
    title: "feat(demo): killable",
    repoRoot: h.tmpHome,
    repoName: "demo",
    branch: "forge/kill-target",
    worktree: null,
    status: "running",
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: now,
    launchedAt: now,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    // Use a name that almost certainly doesn't exist on the test runner.
    // killTmuxSession swallows the "no such session" error, so this is fine.
    tmuxSession: "forge-noop-12345",
    logFile: null,
    jiraTicket: null,
    specFile: h.store.writeSpec(id, "# kill\n"),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });

  // Seed run-meta with an unrelated key so we can assert merge (not overwrite).
  fs.mkdirSync(path.join(h.store.runsDir, id), { recursive: true });
  h.store.writeRunMeta(id, {
    planId: id,
    tmuxSession: "forge-noop-12345",
    logFile: "/tmp/x.log",
    agent: "claude",
    model: "claude-opus-4-7",
    worktree: "/tmp/wt",
    status: "running",
    startedAt: now,
    prUrl: null,
    qualityResults: [{ command: "lint", ok: true, durationMs: 10 }],
  });

  const { status, body } = await postJson(`${h.baseUrl}/api/plans/${id}/kill`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.killed, true);

  const task = h.store.getPlan(id);
  assert.equal(task!.status, "failed");
  const meta = h.store.readRunMeta(id);
  assert.equal(meta!.errorMessage, "Killed by user");
  assert.deepEqual(meta!.qualityResults, [{ command: "lint", ok: true, durationMs: 10 }]);
});

test("POST /api/plans/:id/kill rejects draft (non-running) tasks with 409", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "nokill-draft", h.tmpHome, "demo", "feat(demo): draft");
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/nokill-draft/kill`);
  assert.equal(status, 409);
  assert.equal(body.error!.code, "BAD_STATE");
});

test("POST /api/plans/:id/kill rejects already-done tasks (no state corruption)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const id = "done-task";
  const now = new Date().toISOString();
  h.store.upsertPlan({
    id,
    title: "feat(demo): merged",
    repoRoot: h.tmpHome,
    repoName: "demo",
    branch: "forge/done-task",
    worktree: null,
    status: "done", // already completed; tmuxSession is set but stale
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: now,
    launchedAt: now,
    completedAt: now,
    prUrl: "https://github.com/x/y/pull/1",
    prNumber: 1,
    tmuxSession: "forge-stale-99999", // never cleared on completion
    logFile: null,
    jiraTicket: null,
    specFile: h.store.writeSpec(id, "# done\n"),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/${id}/kill`);
  assert.equal(status, 409);
  assert.equal(body.error!.code, "BAD_STATE");
  // Status must still be "done" — kill should not have touched it.
  assert.equal(h.store.getPlan(id)!.status, "done");
});

test("POST /api/specs rejects invalid agent value", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs`, {
    markdown: "# feat(x): y\n\nbody",
    repoRoot: "/tmp/foo",
    agent: "rm -rf /",
  });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "BAD_REQUEST");
  assert.match(body.error!.message, /agent/);
});

test("POST /api/plans/:id/improve rejects non-draft tasks with 409", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const id = "improve-running";
  const now = new Date().toISOString();
  h.store.upsertPlan({
    id,
    title: "feat(demo): improving running",
    repoRoot: h.tmpHome,
    repoName: "demo",
    branch: "forge/improve-running",
    worktree: null,
    status: "running",
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: now,
    launchedAt: now,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: "forge-x",
    logFile: null,
    jiraTicket: null,
    specFile: h.store.writeSpec(id, "# x\n"),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/${id}/improve`);
  assert.equal(status, 409);
  assert.equal(body.error!.code, "BAD_STATE");
});

test("POST /api/plans/:id/critique rejects non-draft tasks with 409", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const id = "critique-done";
  const now = new Date().toISOString();
  h.store.upsertPlan({
    id,
    title: "feat(demo): critique on done",
    repoRoot: h.tmpHome,
    repoName: "demo",
    branch: "forge/critique-done",
    worktree: null,
    status: "done",
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: now,
    launchedAt: now,
    completedAt: now,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: h.store.writeSpec(id, "# x\n"),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/${id}/critique`);
  assert.equal(status, 409);
  assert.equal(body.error!.code, "BAD_STATE");
});

test("POST /api/plans/:id/archive hides a draft from /api/plans (and unarchive restores it)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "arc-route", h.tmpHome, "demo", "feat(demo): archivable");

  const archived = await postJson(`${h.baseUrl}/api/plans/arc-route/archive`);
  assert.equal(archived.status, 200);
  assert.equal(archived.body.data!.status, "archived");
  assert.ok(typeof archived.body.data!.archivedAt === "string");

  const list = await getJson(`${h.baseUrl}/api/plans`);
  const found = (list.body.data!.plans ?? []).find((p) => p.id === "arc-route");
  assert.equal(found, undefined, "archived task must not surface in /api/plans");

  const unarchived = await postJson(`${h.baseUrl}/api/plans/arc-route/unarchive`);
  assert.equal(unarchived.body.data!.status, "draft");
  assert.equal(unarchived.body.data!.archivedAt, null);

  const list2 = await getJson(`${h.baseUrl}/api/plans`);
  const back = (list2.body.data!.plans ?? []).find((p) => p.id === "arc-route");
  assert.ok(back, "unarchived task reappears in /api/plans");
});

test("POST /api/plans/:id/archive rejects post-launch tasks with 409 BAD_STATE", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const now = new Date().toISOString();
  h.store.upsertPlan({
    id: "arc-running",
    title: "feat(demo): running",
    repoRoot: h.tmpHome,
    repoName: "demo",
    branch: "forge/arc-running",
    worktree: null,
    status: "running",
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: now,
    launchedAt: now,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: "forge-arc-running",
    logFile: null,
    jiraTicket: null,
    specFile: h.store.writeSpec("arc-running", "# x\n"),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  });
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/arc-running/archive`);
  assert.equal(status, 409);
  assert.equal(body.error!.code, "BAD_STATE");
  assert.match(body.error!.message, /running/);
});

test("POST /api/plans/:id/archive returns 409 BUSY while a critique is mid-flight", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "arc-busy-http", h.tmpHome, "demo", "feat(demo): busy");
  const critiqueId = "crit-busy-http";
  h.store.writeCritiqueMeta("arc-busy-http", critiqueId, {
    schemaVersion: 1,
    planId: "arc-busy-http",
    critiqueId,
    specTitle: "feat(demo): busy",
    repoRoot: h.tmpHome,
    repoName: "demo",
    status: "running_critics",
    startedAt: new Date().toISOString(),
    completedAt: null,
    viewedAt: null,
    tmuxSession: `forge-${critiqueId}`,
    criticA: { agent: "claude", model: "claude-opus-4-7", status: "pending", durationMs: null },
    criticB: { agent: "codex", model: "gpt-5.5", status: "pending", durationMs: null },
    synthesizer: { agent: "claude", model: "claude-opus-4-7", status: "pending", durationMs: null },
  });
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/arc-busy-http/archive`);
  assert.equal(status, 409);
  assert.equal(body.error!.code, "BUSY");
});

test("POST /api/plans/:id/archive returns 404 for unknown task", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/plans/nope/archive`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});
