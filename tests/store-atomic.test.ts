import { strict as assert } from "node:assert";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerScript = path.join(__dirname, "fixtures", "concurrent-writer.ts");

function runWorker(id: string, home: string): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    // bun runs .ts files natively — no transform flags needed.
    const child = spawn(process.execPath, [workerScript, id], {
      env: { ...process.env, HOME: home },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("exit", (code) => resolve({ code: code ?? -1, stderr }));
  });
}

test("concurrent upsertPlan writers preserve all entries", async (t) => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-atomic-"));
  t.after(() => fs.rmSync(tmpHome, { recursive: true, force: true }));

  const N = 20;
  const ids = Array.from({ length: N }, (_, i) => `task-${i.toString().padStart(3, "0")}`);

  const results = await Promise.all(ids.map((id) => runWorker(id, tmpHome)));
  for (const r of results) {
    assert.equal(r.code, 0, `worker failed: ${r.stderr}`);
  }

  const indexPath = path.join(tmpHome, ".forge", "index.json");
  assert.ok(fs.existsSync(indexPath), "index.json should exist");

  // File must always be valid JSON (atomic rename guarantees no torn writes).
  const parsed = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  assert.equal(parsed.version, 1);

  // Lock around read-modify-write must preserve every entry.
  const stored = Object.keys(parsed.plans).sort();
  assert.deepEqual(stored, ids.sort(), "every concurrently-written task should be in the final index");
});

test("torn writes never expose partial JSON", async (t) => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-atomic-torn-"));
  t.after(() => fs.rmSync(tmpHome, { recursive: true, force: true }));

  const indexPath = path.join(tmpHome, ".forge", "index.json");

  // Spawn writers and concurrently read the index file as fast as possible.
  // Each read must parse cleanly — no half-written buffers.
  let readsAttempted = 0;
  let readsParsed = 0;
  const readUntilDone = { active: true };
  const reader = (async () => {
    while (readUntilDone.active) {
      if (!fs.existsSync(indexPath)) {
        await new Promise((r) => setTimeout(r, 1));
        continue;
      }
      readsAttempted += 1;
      try {
        JSON.parse(fs.readFileSync(indexPath, "utf-8"));
        readsParsed += 1;
      } catch {
        // intentionally swallow: failure here is what we're asserting against
      }
      await new Promise((r) => setTimeout(r, 1));
    }
  })();

  const ids = Array.from({ length: 30 }, (_, i) => `t-${i}`);
  await Promise.all(ids.map((id) => runWorker(id, tmpHome)));
  readUntilDone.active = false;
  await reader;

  assert.ok(readsAttempted > 0, "reader should have attempted at least one read");
  assert.equal(readsParsed, readsAttempted, "every successful read must parse — no torn JSON");
});
