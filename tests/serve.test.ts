/**
 * forge serve — read endpoint smoke tests.
 *
 * Boots the HTTP server against a tmp ~/.forge/, hits each read endpoint,
 * and asserts on the envelope shape. Bun's runtime is required (the
 * server uses Bun.serve); tests run via `bun test`.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { startServer } from "../src/cli/cmd/serve.ts";
import { ForgeStore } from "../src/core/store.ts";

interface ServerHandle {
  baseUrl: string;
  stop: () => void;
  store: ForgeStore;
  tmpHome: string;
}

function bootServer(): ServerHandle {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-serve-"));
  const forgeDir = path.join(tmpHome, ".forge");
  try {
    // Pass forgeDir explicitly: os.homedir() is captured at process start
    // and won't pick up mid-run HOME tweaks, so we can't isolate via env.
    const store = new ForgeStore({ forgeDir });
    const { port, stop } = startServer(store, { port: 0, host: "127.0.0.1" });
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
    tasks?: TaskView[];
    repos?: RepoView[];
    task?: TaskView;
    body?: string;
    ok?: boolean;
    version?: string;
    [k: string]: unknown;
  };
  error?: { code: string; message: string; hint?: string };
}

interface TaskView {
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
  taskCount: number;
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
  store.upsertTask({
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
  });
}

test("GET /api/health returns ok", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/health`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.ok, true);
});

test("GET / returns the workbench HTML", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const res = await fetch(`${h.baseUrl}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Forge — Workbench/);
  assert.match(html, /id="repo-popover"/);
});

test("empty index → /api/tasks returns []", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/tasks`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.deepEqual(body.data!.tasks, []);
});

test("empty index → /api/repos returns []", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { body } = await getJson(`${h.baseUrl}/api/repos`);
  assert.equal(body.ok, true);
  assert.deepEqual(body.data!.repos, []);
});

test("single draft → /api/tasks enriches with section + statLabel + blurb", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-foo", h.tmpHome, "demo", "feat(demo): add the thing");
  const { body } = await getJson(`${h.baseUrl}/api/tasks`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.tasks.length, 1);
  const task = body.data!.tasks[0];
  assert.equal(task.id, "draft-foo");
  assert.equal(task.title, "feat(demo): add the thing");
  assert.equal(task.section, "drafting");
  assert.equal(task.statLabel, "Drafting");
  assert.match(task.blurb, /short blurb/);
  assert.equal(task.repo, "demo");
});

test("single draft → /api/tasks/:id returns full record", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-bar", h.tmpHome, "demo", "feat(demo): bar");
  const { body } = await getJson(`${h.baseUrl}/api/tasks/draft-bar`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.task.id, "draft-bar");
  assert.equal(body.data!.task.section, "drafting");
});

test("/api/tasks/:id/spec returns markdown body", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-spec", h.tmpHome, "demo", "feat(demo): spec");
  const { body } = await getJson(`${h.baseUrl}/api/tasks/draft-spec/spec`);
  assert.equal(body.ok, true);
  assert.match(body.data!.body, /^# feat\(demo\): spec/);
});

test("unknown task id → 404 envelope", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/tasks/nope`);
  assert.equal(status, 404);
  assert.equal(body.ok, false);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("repo filter returns only the requested repo's tasks", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-a", "/repo-a", "alpha", "feat(alpha): a");
  makeDraftTask(h.store, "draft-b", "/repo-b", "beta", "feat(beta): b");
  const { body } = await getJson(`${h.baseUrl}/api/tasks?repo=alpha`);
  assert.equal(body.ok, true);
  assert.equal(body.data!.tasks.length, 1);
  assert.equal(body.data!.tasks[0].repo, "alpha");
});

test("/api/repos groups by repoRoot with a task count", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-a1", "/repo-a", "alpha", "feat(alpha): one");
  makeDraftTask(h.store, "draft-a2", "/repo-a", "alpha", "feat(alpha): two");
  makeDraftTask(h.store, "draft-b1", "/repo-b", "beta", "feat(beta): one");
  const { body } = await getJson(`${h.baseUrl}/api/repos`);
  assert.equal(body.ok, true);
  const byName = new Map((body.data!.repos ?? []).map((r) => [r.name, r] as const));
  assert.equal(byName.get("alpha")!.taskCount, 2);
  assert.equal(byName.get("beta")!.taskCount, 1);
});

test("running task surfaces section=running + log file path", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  // Seed a running task by hand.
  const id = "run-baz";
  const now = new Date().toISOString();
  h.store.upsertTask({
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
  });
  // Drop a log file so hasLog flips true.
  fs.mkdirSync(path.join(h.store.runsDir, id), { recursive: true });
  fs.writeFileSync(h.store.getLogFile(id), "[12:00:00] starting up\n[12:00:01] working\n");

  const { body } = await getJson(`${h.baseUrl}/api/tasks`);
  const task = (body.data!.tasks ?? []).find((x) => x.id === id);
  assert.ok(task, "task should be in the list");
  assert.equal(task.section, "running");
  assert.equal(task.hasLog, true);
  assert.equal(task.agentLabel, "claude · opus-4-7");
});

test("path traversal under / is blocked", async (t) => {
  const h = bootServer();
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
  const h = bootServer();
  t.after(() => h.stop());
  const res = await fetch(`${h.baseUrl}/api/tasks`, { method: "POST" });
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
  const h = bootServer();
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
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs`, { repoRoot: "/tmp/foo" });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "BAD_REQUEST");
  assert.match(body.error!.message, /markdown/);
});

test("POST /api/specs rejects relative repoRoot", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs`, {
    markdown: "# feat(x): y\n\nbody",
    repoRoot: "relative/path",
  });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "BAD_REQUEST");
});

test("POST /api/specs rejects non-git repoRoot", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs`, {
    markdown: "# feat(x): y\n\nbody",
    repoRoot: h.tmpHome, // exists but not a git repo
  });
  assert.equal(status, 400);
  assert.equal(body.error!.code, "NOT_A_REPO");
});

test("POST /api/tasks/:id/launch returns 404 for unknown task", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/tasks/nope/launch`, {});
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/tasks/:id/critique returns 404 for unknown task", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/tasks/nope/critique`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/tasks/:id/improve returns 404 for unknown task", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/tasks/nope/improve`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/tasks/:id/resume returns 501", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/tasks/anything/resume`);
  assert.equal(status, 501);
  assert.equal(body.error!.code, "NOT_IMPLEMENTED");
});

test("POST /api/tasks/:id/kill flips status, merges errorMessage into run-meta", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());

  const id = "kill-target";
  const now = new Date().toISOString();
  h.store.upsertTask({
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
  });

  // Seed run-meta with an unrelated key so we can assert merge (not overwrite).
  fs.mkdirSync(path.join(h.store.runsDir, id), { recursive: true });
  h.store.writeRunMeta(id, {
    taskId: id,
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

  const { status, body } = await postJson(`${h.baseUrl}/api/tasks/${id}/kill`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.killed, true);

  const task = h.store.getTask(id);
  assert.equal(task!.status, "failed");
  const meta = h.store.readRunMeta(id);
  assert.equal(meta!.errorMessage, "killed from Workbench");
  assert.deepEqual(meta!.qualityResults, [{ command: "lint", ok: true, durationMs: 10 }]);
});

test("POST /api/tasks/:id/kill rejects when task has no tmux session", async (t) => {
  const h = bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "nokill", h.tmpHome, "demo", "feat(demo): no session");
  const { status, body } = await postJson(`${h.baseUrl}/api/tasks/nokill/kill`);
  assert.equal(status, 400);
  assert.equal(body.error!.code, "NO_TMUX_SESSION");
});
