import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { parsePlanDocument, updatePlanSection } from "../src/core/plan-document.ts";
import {
  acceptPendingPlanEdit,
  applyDirectPlanBodyEdit,
  getPlanWorkspaceDocument,
  resolveOpenQuestion,
  stageOpenQuestion,
  stagePlanSectionEdit,
} from "../src/core/plan-edit.ts";
import { ForgeStore, type Plan } from "../src/core/store.ts";

function makeStore(): { store: ForgeStore; forgeDir: string } {
  const forgeDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-plan-edit-"));
  return { store: new ForgeStore({ forgeDir }), forgeDir };
}

function makeTask(store: ForgeStore, body: string): Plan {
  const now = new Date().toISOString();
  const id = "plan-edit-test";
  const specPath = store.writeSpec(
    id,
    `---\nid: ${id}\nspecVersion: 1\n---\n${body.replace(/^\n+/, "").replace(/\s+$/g, "")}\n`,
  );
  const task: Plan = {
    id,
    title: "feat(plan): test edit flow",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/plan-edit",
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
  };
  store.upsertPlan(task);
  return task;
}

test("plan document parser extracts structured sections and open questions", () => {
  const parsed = parsePlanDocument(`# feat(plan): demo

## Goals

- Ship the workspace

## Open Questions

- [ ] Which reviewer owns final sign-off?
- [x] Which DB table stores sections?
- None
`);
  assert.equal(parsed.title, "feat(plan): demo");
  assert.equal(parsed.sections.goals.content, "- Ship the workspace");
  assert.deepEqual(parsed.openQuestions, ["Which reviewer owns final sign-off?"]);
});

test("updatePlanSection replaces existing section and appends missing sections", () => {
  const first = updatePlanSection("# t\n\n## Goals\n\nold\n\n## Open Questions\n\n- [ ] q\n", "goals", "new");
  assert.match(first, /## Goals\n\nnew\n\n## Open Questions\n\n- \[ \] q\n$/);
  const second = updatePlanSection(first, "risks", "- Risk one");
  assert.match(second, /## Risks\n\n- Risk one\n$/);
});

test("staged planner edit is reviewable and accept writes a new plan_versions row", () => {
  const { store, forgeDir } = makeStore();
  try {
    makeTask(store, "# feat(plan): test edit flow\n\n## Goals\n\n- Old goal\n");
    const edit = stagePlanSectionEdit({
      store,
      planId: "plan-edit-test",
      section: "goals",
      content: "- New goal",
    });
    assert.match(edit.diff, /- Old goal/);
    assert.match(edit.diff, /\+- New goal/);
    assert.equal(store.getPlan("plan-edit-test")?.specVersion, 1, "staging does not silently persist");

    const accepted = acceptPendingPlanEdit(store, "plan-edit-test");
    assert.equal(accepted.specVersion, 2);
    assert.equal(accepted.pendingEdit, null);
    assert.match(store.getSpec("plan-edit-test") ?? "", /specVersion: 2/);

    const v2 = store.db.db
      .prepare(
        "SELECT created_by, sections, open_questions FROM plan_versions WHERE plan_id = ? AND version_number = 2",
      )
      .get("plan-edit-test") as { created_by: string; sections: string; open_questions: string | null };
    assert.equal(v2.created_by, "agent:planner");
    assert.equal(JSON.parse(v2.sections).goals, "- New goal");
    assert.equal(v2.open_questions, null);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("multiple staged planner edits accumulate into one pending diff", () => {
  const { store, forgeDir } = makeStore();
  try {
    makeTask(
      store,
      "# feat(plan): multi edit\n\n## Goals\n\n- Old goal\n\n## Approach\n\n- Old approach\n\n## Open Questions\n\n- [ ] First?\n",
    );
    const first = stagePlanSectionEdit({
      store,
      planId: "plan-edit-test",
      section: "goals",
      content: "- New goal",
    });
    const second = stagePlanSectionEdit({
      store,
      planId: "plan-edit-test",
      section: "approach",
      content: "- New approach",
    });

    assert.equal(second.id, first.id, "subsequent edits update the existing pending edit");
    assert.match(second.diff, /\+- New goal/);
    assert.match(second.diff, /\+- New approach/);
    assert.deepEqual(second.openQuestions, ["First?"]);

    const accepted = acceptPendingPlanEdit(store, "plan-edit-test");
    assert.equal(accepted.parsed.sections.goals.content, "- New goal");
    assert.equal(accepted.parsed.sections.approach.content, "- New approach");
    assert.equal(accepted.openQuestionCount, 1);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("open question staging drives workspace count and direct edits persist as user versions", () => {
  const { store, forgeDir } = makeStore();
  try {
    makeTask(store, "# feat(plan): questions\n\n## Open Questions\n\n- [ ] First?\n");
    assert.equal(getPlanWorkspaceDocument(store, "plan-edit-test").openQuestionCount, 1);

    const staged = stageOpenQuestion({ store, planId: "plan-edit-test", question: "Second?" });
    assert.deepEqual(staged.openQuestions, ["First?", "Second?"]);

    const afterDirect = applyDirectPlanBodyEdit({
      store,
      planId: "plan-edit-test",
      body: "# feat(plan): questions\n\n## Open Questions\n\n- [x] First?\n",
    });
    assert.equal(afterDirect.openQuestionCount, 0);
    const v2 = store.db.db
      .prepare("SELECT created_by, open_questions FROM plan_versions WHERE plan_id = ? AND version_number = 2")
      .get("plan-edit-test") as { created_by: string; open_questions: string | null };
    assert.equal(v2.created_by, "user");
    assert.equal(v2.open_questions, null);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("resolveOpenQuestion skips checked matches and resolves the open item", () => {
  const { store, forgeDir } = makeStore();
  try {
    makeTask(
      store,
      [
        "# feat(plan): questions",
        "",
        "## Open Questions",
        "",
        "- [x] Confirm owner?",
        "- [ ] Confirm owner?",
        "- [ ] Different question?",
        "",
      ].join("\n"),
    );

    const edit = resolveOpenQuestion({ store, planId: "plan-edit-test", query: "Confirm owner" });
    const lines = edit.sections.open_questions.content.split("\n");
    assert.equal(lines[0], "- [x] Confirm owner?");
    assert.equal(lines[1], "- [x] Confirm owner?");
    assert.equal(lines[2], "- [ ] Different question?");
    assert.deepEqual(edit.openQuestions, ["Different question?"]);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
