/**
 * DiffPane browser smoke test. Bundles the diff pane with the same
 * preact-compat alias plugin the Workbench uses, runs it in happy-dom, and
 * asserts the real rendered DOM: file/row ids resolve, comment and finding
 * widgets land on the expected lines, binary files are handled, the
 * unified/split toggle renders both modes, and marking a file viewed
 * collapses it. This is the end-to-end proof that @git-diff-view renders
 * under Preact with our anchoring + viewed-state wiring.
 */
import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, before, beforeEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import type { ForgeFinding, PrReviewBundle } from "../../../src/web/types.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..", "..");
const SAMPLE = fs.readFileSync(path.join(REPO_ROOT, "tests/fixtures/diff/review-sample.diff"), "utf-8");

type Entry = typeof import("../fixtures/diff-pane-entry.tsx");
let entry: Entry;

before(async () => {
  // 1) Bundle the entry through the production alias plugin via a subprocess.
  //    (In-process Bun.build inside `bun test` resolves nested extensionless
  //    imports differently; the spawned build matches production.)
  const outdir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-diff-smoke-"));
  const build = Bun.spawnSync({
    cmd: ["bun", path.join(HERE, "..", "fixtures", "build-diff-smoke.ts"), outdir],
    cwd: REPO_ROOT,
    stderr: "pipe",
  });
  assert.ok(build.success, `bundle failed: ${build.stderr.toString()}`);

  // 2) DOM + the canvas / layout shims @git-diff-view needs (happy-dom has
  //    no canvas 2d context and reports 0-size rects; the library gates
  //    widget rendering on a measured width > 0).
  GlobalRegistrator.register();
  const g = globalThis as Record<string, unknown>;
  (g.HTMLCanvasElement as typeof HTMLCanvasElement).prototype.getContext = (() => ({
    font: "",
    measureText: (s: string) => ({ width: (s?.length ?? 0) * 7 }),
  })) as unknown as HTMLCanvasElement["getContext"];
  (g.Element as typeof Element).prototype.getBoundingClientRect = (() => ({
    width: 800,
    height: 20,
    top: 0,
    left: 0,
    right: 800,
    bottom: 20,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })) as unknown as Element["getBoundingClientRect"];
  // The library measures the diff width via ResizeObserver and only renders
  // per-line widgets once width > 0. happy-dom never fires layout, so use an
  // observer that invokes its callback on observe() to drive the measurement
  // (real browsers fire it for real).
  g.ResizeObserver = class {
    cb: (entries: unknown[], obs: unknown) => void;
    constructor(cb: (entries: unknown[], obs: unknown) => void) {
      this.cb = cb;
    }
    observe() {
      this.cb([], this);
    }
    unobserve() {}
    disconnect() {}
  };

  // 3) Import the freshly-built bundle.
  entry = (await import(path.join(outdir, "diff-pane-entry.js"))) as Entry;

  // 4) Warm-up render: the first mount in a cold happy-dom triggers the
  //    lazy Shiki load + a key remount that can race the width measurement;
  //    a throwaway mount settles the module state so per-test assertions are
  //    deterministic (a real browser is always "warm" after first paint).
  const warm = document.createElement("div");
  document.body.appendChild(warm);
  entry.mount(warm, bundle(), findings());
  await new Promise((r) => setTimeout(r, 400));
  warm.remove();
});

function bundle(): PrReviewBundle {
  return {
    pr: {
      number: 7,
      title: "Sample",
      headRefName: "feat",
      baseRefName: "main",
      url: "",
      isDraft: false,
      statusCheckRollup: null,
      reviewDecision: null,
      author: "octocat",
      updatedAt: "2026-01-01T00:00:00Z",
      additions: 3,
      deletions: 2,
      changedFiles: 3,
      commentsCount: 1,
      reviewsCount: 0,
      isMine: false,
      worktree: null,
      headRefOid: "sha-abc",
    },
    diff: SAMPLE,
    diffStats: { additions: 3, deletions: 2, changedFiles: 3 },
    inlineComments: [
      {
        id: 101,
        user: "octocat",
        body: "please rename this",
        path: "src/app.ts",
        position: null,
        originalPosition: null,
        line: 3,
        originalLine: null,
        side: "RIGHT",
        startLine: null,
        startSide: null,
        inReplyToId: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        htmlUrl: "",
        commitId: "",
      },
    ],
    issueComments: [],
    prReviews: [],
    linkedPlanId: null,
    worktreePath: null,
    forgeFindings: [],
    commentFixState: {},
    warnings: [],
  };
}

function findings(): ForgeFinding[] {
  return [
    {
      id: "F1",
      severity: "BLOCKER",
      title: "unsafe rename",
      file: "src/app.ts",
      lineStart: 2,
      lineEnd: 2,
      evidence: null,
      why: "x",
      fix: "y",
    },
  ];
}

let root: HTMLElement;
beforeEach(() => {
  root = document.createElement("div");
  document.body.appendChild(root);
});
afterEach(() => {
  root.remove();
});

const tick = () => new Promise((r) => setTimeout(r, 250));

test("renders file ids, comment + finding widgets on the right rows, and binary handling", async () => {
  entry.mount(root, bundle(), findings());
  await tick();

  // File wrappers resolve by DOM id.
  assert.ok(document.getElementById("diff-file-src/app.ts"), "missing app.ts file wrapper");
  assert.ok(document.getElementById("diff-file-config.yaml"), "missing yaml file wrapper");
  assert.ok(document.getElementById("diff-file-logo.png"), "missing binary file wrapper");

  // Finding (new line 2 → diffPosition 3) and comment (new line 3 → 4) land
  // on their expected rows.
  const findingRow = document.getElementById("diff-row-src/app.ts-3");
  const commentRow = document.getElementById("diff-row-src/app.ts-4");
  assert.ok(findingRow, "finding widget not anchored to diffPosition 3");
  assert.ok(commentRow, "comment widget not anchored to diffPosition 4");
  assert.ok(findingRow.textContent?.includes("unsafe rename"), "finding card content missing");
  assert.ok(commentRow.textContent?.includes("please rename this"), "comment content missing");

  // Binary file: message shown, no "Viewed" checkbox.
  const binary = document.getElementById("diff-file-logo.png");
  assert.ok(binary?.textContent?.includes("Binary diff omitted"));
  assert.equal(binary?.querySelectorAll(".review-file-viewed input").length, 0);

  // Non-binary files each carry a Viewed checkbox (M = 2).
  assert.equal(document.querySelectorAll(".review-file-viewed input").length, 2);
});

test("the unified/split toggle renders both modes", async () => {
  entry.mount(root, bundle(), findings());
  await tick();
  // Unified is the default.
  assert.ok(document.querySelector(".unified-diff-view"), "unified view not default");

  const buttons = [...document.querySelectorAll(".review-diff-mode-btn")] as HTMLButtonElement[];
  const splitBtn = buttons.find((b) => b.textContent?.trim() === "Split");
  assert.ok(splitBtn, "split toggle missing");
  splitBtn.click();
  await tick();
  assert.ok(document.querySelector(".split-diff-view"), "split view did not render after toggle");

  // Scroll targets must still resolve in split mode — the finding/comment
  // jump (scrollToFinding) looks up `diff-row-<file>-<pos>` by id, and split
  // renders two columns, so a regression here is a duplicate-id or a dropped
  // widget. Assert each anchor resolves to exactly one element.
  assert.equal(
    document.querySelectorAll("#diff-row-src\\/app\\.ts-3").length,
    1,
    "finding anchor must resolve to exactly one row in split mode",
  );
  assert.equal(
    document.querySelectorAll("#diff-row-src\\/app\\.ts-4").length,
    1,
    "comment anchor must resolve to exactly one row in split mode",
  );

  // Flip back to unified and confirm the same anchors resolve there too.
  const unifiedBtn = buttons.find((b) => b.textContent?.trim() === "Unified");
  assert.ok(unifiedBtn, "unified toggle missing");
  unifiedBtn.click();
  await tick();
  assert.ok(document.querySelector(".unified-diff-view"), "unified view did not render after toggle back");
  assert.ok(document.getElementById("diff-row-src/app.ts-3"), "finding anchor lost in unified mode");
  assert.ok(document.getElementById("diff-row-src/app.ts-4"), "comment anchor lost in unified mode");
});

test("marking a file viewed collapses its diff body", async () => {
  entry.mount(root, bundle(), findings());
  await tick();
  const before = document.getElementById("diff-file-src/app.ts");
  assert.ok(before?.querySelector(".review-file-diff"), "diff body should be visible before viewing");

  entry.toggleViewedFile("src/app.ts");
  await tick();
  const after = document.getElementById("diff-file-src/app.ts");
  assert.equal(after?.querySelectorAll(".review-file-diff").length, 0, "diff body should collapse when viewed");
});
