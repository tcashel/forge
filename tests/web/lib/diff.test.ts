import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findRow, parseUnifiedDiff } from "../../../src/web/lib/diff.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = fs.readFileSync(path.join(HERE, "..", "..", "fixtures", "diff", "multi-file.diff"), "utf-8");

test("parses every file in a multi-file diff", () => {
  const files = parseUnifiedDiff(FIXTURE);
  assert.equal(files.length, 3);
  assert.deepEqual(
    files.map((f) => f.path),
    ["src/alpha.ts", "src/beta.ts", "src/new-name.ts"],
  );
});

test("addition/deletion/context kinds parse with correct line numbers", () => {
  const [alpha] = parseUnifiedDiff(FIXTURE);
  assert.equal(alpha.hunks.length, 1);
  const rows = alpha.hunks[0].rows;
  const kinds = rows.map((r) => r.kind);
  assert.deepEqual(kinds, ["context", "deletion", "addition", "addition", "context", "context", "context"]);

  const firstContext = rows[0];
  assert.equal(firstContext.oldLine, 1);
  assert.equal(firstContext.newLine, 1);

  const deletion = rows[1];
  assert.equal(deletion.oldLine, 2);
  assert.equal(deletion.newLine, null);

  const addition = rows[2];
  assert.equal(addition.oldLine, null);
  assert.equal(addition.newLine, 2);
  assert.equal(addition.content, '  return "new";');
});

test("addition/deletion counts roll up per file", () => {
  const files = parseUnifiedDiff(FIXTURE);
  const beta = files.find((f) => f.path === "src/beta.ts");
  assert.ok(beta);
  assert.equal(beta.additions, 2); // `+export const z = 3;` and `+const d = 0;`
  assert.equal(beta.deletions, 2); // two `-export const ...` lines
});

test("renamed files capture oldPath and the new path", () => {
  const files = parseUnifiedDiff(FIXTURE);
  const renamed = files.find((f) => f.path === "src/new-name.ts");
  assert.ok(renamed);
  assert.equal(renamed.isRename, true);
  assert.equal(renamed.oldPath, "src/old-name.ts");
});

test("diffPosition increments 1-based after the first @@ and advances across subsequent hunks", () => {
  const [, beta] = parseUnifiedDiff(FIXTURE);
  const h1 = beta.hunks[0];
  const h2 = beta.hunks[1];

  // First row inside the file's first hunk is position 1.
  assert.equal(h1.rows[0].diffPosition, 1);
  // h1 has 5 rows: positions 1..5. The second hunk header consumes
  // position 6, then h2's first row is position 7.
  assert.equal(h1.rows[h1.rows.length - 1].diffPosition, 5);
  assert.equal(h2.rows[0].diffPosition, 7);
  // Final addition in beta.ts is the 10th counted line.
  const lastBetaRow = h2.rows[h2.rows.length - 1];
  assert.equal(lastBetaRow.diffPosition, 10);
  assert.equal(lastBetaRow.kind, "addition");
});

test("position resets per file — the renamed file starts at 1 again", () => {
  const files = parseUnifiedDiff(FIXTURE);
  const renamed = files.find((f) => f.path === "src/new-name.ts");
  assert.ok(renamed);
  assert.equal(renamed.hunks[0].rows[0].diffPosition, 1);
});

test("findRow locates a row by position", () => {
  const files = parseUnifiedDiff(FIXTURE);
  const r = findRow(files, "src/alpha.ts", { position: 3 });
  assert.ok(r);
  assert.equal(r.kind, "addition");
  assert.equal(r.content, '  return "new";');
});

test("findRow falls back to newLine when position is missing", () => {
  const files = parseUnifiedDiff(FIXTURE);
  const r = findRow(files, "src/alpha.ts", { newLine: 2 });
  assert.ok(r);
  assert.equal(r.kind, "addition");
  assert.equal(r.newLine, 2);
});

test("findRow can match a renamed file by either its new or old path", () => {
  const files = parseUnifiedDiff(FIXTURE);
  const byNew = findRow(files, "src/new-name.ts", { position: 1 });
  const byOld = findRow(files, "src/old-name.ts", { position: 1 });
  assert.ok(byNew);
  assert.ok(byOld);
  assert.equal(byNew.content, byOld.content);
});

test("findRow returns null when nothing matches", () => {
  const files = parseUnifiedDiff(FIXTURE);
  assert.equal(findRow(files, "src/alpha.ts", { position: 9999 }), null);
  assert.equal(findRow(files, "nope.ts", { position: 1 }), null);
});

test("empty input returns no files", () => {
  assert.deepEqual(parseUnifiedDiff(""), []);
});
