/**
 * Worker for store-atomic.test.ts.
 *
 * Reads HOME from the environment so the test can isolate ~/.forge to
 * a tempdir. Calls upsertPlan once with the id passed via argv.
 */

import { ForgeStore, type Plan } from "../../src/core/store.ts";

const id = process.argv[2];
if (!id) {
  console.error("usage: concurrent-writer.ts <id>");
  process.exit(2);
}

const store = new ForgeStore();
const task: Plan = {
  id,
  title: `task-${id}`,
  repoRoot: "/tmp/repo",
  repoName: "repo",
  branch: id,
  worktree: null,
  status: "draft",
  agent: null,
  model: null,
  createdAt: new Date(Date.now() + Math.random() * 1000).toISOString(),
  launchedAt: null,
  completedAt: null,
  prUrl: null,
  prNumber: null,
  tmuxSession: null,
  logFile: null,
  jiraTicket: null,
  specFile: `/tmp/specs/${id}.md`,
  specVersion: 1,
  lastImproveError: null,
  archivedAt: null,
};

store.upsertPlan(task);
