/**
 * forge spec archive — soft-archive draft specs.
 *
 * Covers:
 *   - happy path: draft → archived (JSON + SQLite stage + archived_at)
 *   - round trip: archive → unarchive restores draft + clears archivedAt
 *   - status guard: rejects post-launch and unknown tasks
 *   - BUSY guard: rejects while a critique/improve is mid-flight
 *   - improveSpec refuses archived tasks (extends the existing draft-only guard)
 *   - readIndex backfills archivedAt: null on legacy records
 *   - ls filters: drafts only (default), --archived, --all
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { archiveSpec, improveSpec, unarchiveSpec } from "../src/cli/cmd/spec.ts";
import { CliError } from "../src/cli/output.ts";
import { recordPlanCreated } from "../src/core/db/writes.ts";
import { type CritiqueMeta, ForgeStore, type Plan } from "../src/core/store.ts";

function tmpStore(t: { after: (fn: () => void) => void }): ForgeStore {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "forge-archive-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return new ForgeStore({ forgeDir: path.join(home, ".forge") });
}

function seedDraft(store: ForgeStore, id: string, overrides: Partial<Plan> = {}): Plan {
  const task: Plan = {
    id,
    title: id,
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
    specFile: `${id}.md`,
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
    ...overrides,
  };
  store.upsertPlan(task);
  store.writeSpec(id, `# ${id}\nbody`);
  recordPlanCreated(store.db.db, task, `# ${id}\nbody`);
  return task;
}

function writeCritique(store: ForgeStore, planId: string, status: CritiqueMeta["status"]): string {
  const critiqueId = `crit-${planId}-1`;
  store.writeCritiqueMeta(planId, critiqueId, {
    schemaVersion: 1,
    planId,
    critiqueId,
    specTitle: planId,
    repoRoot: "/tmp/repo",
    repoName: "repo",
    status,
    startedAt: new Date().toISOString(),
    completedAt: status === "done" || status === "failed" ? new Date().toISOString() : null,
    viewedAt: null,
    tmuxSession: `forge-${critiqueId}`,
    criticA: { agent: "claude", model: "claude-opus-4-7", status: "pending", durationMs: null },
    criticB: { agent: "codex", model: "gpt-5.5", status: "pending", durationMs: null },
    synthesizer: { agent: "claude", model: "claude-opus-4-7", status: "pending", durationMs: null },
  });
  return critiqueId;
}

test("archiveSpec flips status to archived, sets archivedAt, writes SQLite stage", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-1");

  const result = archiveSpec("arc-1", store);
  assert.equal(result.status, "archived");
  assert.ok(result.archivedAt, "archivedAt is populated");

  const after = store.getPlan("arc-1");
  assert.equal(after?.status, "archived");
  assert.equal(after?.archivedAt, result.archivedAt);

  const row = store.db.db.prepare("SELECT stage, archived_at FROM plans WHERE id = ?").get("arc-1") as {
    stage: string;
    archived_at: string | null;
  };
  assert.equal(row.stage, "archived");
  assert.equal(row.archived_at, result.archivedAt);
});

test("unarchiveSpec restores draft, clears archivedAt + SQLite columns", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-2");
  archiveSpec("arc-2", store);

  const result = unarchiveSpec("arc-2", store);
  assert.equal(result.status, "draft");
  assert.equal(result.archivedAt, null);

  const after = store.getPlan("arc-2");
  assert.equal(after?.status, "draft");
  assert.equal(after?.archivedAt, null);

  const row = store.db.db.prepare("SELECT stage, archived_at FROM plans WHERE id = ?").get("arc-2") as {
    stage: string;
    archived_at: string | null;
  };
  assert.equal(row.stage, "drafting");
  assert.equal(row.archived_at, null);
});

test("archiveSpec rejects post-launch tasks with BAD_STATE", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-running", { status: "running" });
  assert.throws(
    () => archiveSpec("arc-running", store),
    (e: unknown) => e instanceof CliError && e.code === "BAD_STATE" && /running/.test(e.message),
  );
});

test("archiveSpec rejects unknown tasks with UNKNOWN_TASK", (t) => {
  const store = tmpStore(t);
  assert.throws(
    () => archiveSpec("nope", store),
    (e: unknown) => e instanceof CliError && e.code === "UNKNOWN_TASK",
  );
});

test("archiveSpec is idempotent on already-archived specs", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-idem");
  const first = archiveSpec("arc-idem", store);
  const second = archiveSpec("arc-idem", store);
  assert.equal(second.status, "archived");
  // archivedAt must not be rewritten when called twice (preserves the
  // original archive timestamp).
  assert.equal(second.archivedAt, first.archivedAt);
});

test("archiveSpec refuses while a critique is running (BUSY)", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-busy-c");
  writeCritique(store, "arc-busy-c", "running_critics");
  assert.throws(
    () => archiveSpec("arc-busy-c", store),
    (e: unknown) => e instanceof CliError && e.code === "BUSY",
  );
});

test("archiveSpec refuses while a synth is running (BUSY)", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-busy-s");
  writeCritique(store, "arc-busy-s", "running_synth");
  assert.throws(
    () => archiveSpec("arc-busy-s", store),
    (e: unknown) => e instanceof CliError && e.code === "BUSY",
  );
});

test("archiveSpec succeeds when the last critique is done (not mid-flight)", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-not-busy");
  writeCritique(store, "arc-not-busy", "done");
  const result = archiveSpec("arc-not-busy", store);
  assert.equal(result.status, "archived");
});

test("improveSpec refuses archived tasks with BAD_STATE", async (t) => {
  const store = tmpStore(t);
  seedDraft(store, "arc-no-improve");
  archiveSpec("arc-no-improve", store);
  await assert.rejects(
    () => improveSpec("arc-no-improve", store),
    (e: unknown) => e instanceof CliError && e.code === "BAD_STATE" && /archived/i.test(e.message),
  );
});

test("readIndex backfills archivedAt: null on legacy plans", (t) => {
  const store = tmpStore(t);
  // Hand-write an index entry without archivedAt (legacy on-disk shape).
  fs.mkdirSync(store.forgeDir, { recursive: true });
  const legacy = {
    version: 1 as const,
    plans: {
      "legacy-1": {
        id: "legacy-1",
        title: "legacy",
        repoRoot: "/tmp/repo",
        repoName: "repo",
        branch: "forge/legacy-1",
        worktree: null,
        status: "draft",
        agent: null,
        model: null,
        createdAt: "2026-04-01T00:00:00.000Z",
        launchedAt: null,
        completedAt: null,
        prUrl: null,
        prNumber: null,
        tmuxSession: null,
        logFile: null,
        jiraTicket: null,
        specFile: "legacy-1.md",
        specVersion: 1,
        lastImproveError: null,
      },
    },
  };
  fs.writeFileSync(store.indexFile, JSON.stringify(legacy));
  const plan = store.getPlan("legacy-1");
  assert.ok(plan, "legacy plan loads");
  assert.equal(plan.archivedAt, null);
});

test("getPlans returns archived plans (callers filter on status)", (t) => {
  const store = tmpStore(t);
  seedDraft(store, "ls-a");
  seedDraft(store, "ls-b");
  archiveSpec("ls-b", store);

  const all = store.getPlans();
  assert.equal(all.length, 2);
  const drafts = all.filter((p) => p.status === "draft");
  const archived = all.filter((p) => p.status === "archived");
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].id, "ls-a");
  assert.equal(archived.length, 1);
  assert.equal(archived[0].id, "ls-b");
});
