/**
 * bashGhEnvExport failure path — the runner snippet must record an
 * errorMessage BEFORE set_status "failed", quoted as a JSON string the same
 * way the launch runner's other failure branches do. Without it the
 * Workbench failure card shows a failed run with no reason.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bashGhEnvExport } from "../src/core/gh.ts";

test("token-resolution failure sets errorMessage before set_status failed", () => {
  const snippet = bashGhEnvExport({ user: "octo", host: "github.com" });

  const errIdx = snippet.indexOf('set_meta_field "errorMessage"');
  const statusIdx = snippet.indexOf('set_status "failed"');
  assert.ok(errIdx !== -1, "errorMessage line present");
  assert.ok(statusIdx !== -1, "set_status failed line present");
  assert.ok(errIdx < statusIdx, "errorMessage recorded before the status flip");

  // Quoted per the runner contract: set_meta_field "errorMessage" "\"…\""
  // (the value must parse as a JSON string inside the bash double quotes).
  const line = snippet.split("\n").find((l) => l.includes('set_meta_field "errorMessage"'));
  assert.ok(line, "errorMessage line found");
  assert.match(line as string, /set_meta_field "errorMessage" "\\".*\\""/);
  assert.match(line as string, /gh user 'octo' on host 'github\.com' is not logged in/);

  // Both live inside the empty-token guard so a successful resolve skips them.
  const guardIdx = snippet.indexOf('if [ -z "$_FORGE_GH_TOKEN" ]; then');
  const fiIdx = snippet.indexOf("fi", guardIdx);
  assert.ok(guardIdx !== -1 && guardIdx < errIdx && errIdx < fiIdx, "errorMessage is inside the failure guard");
});

test("host-only override has no failure branch (nothing to error on)", () => {
  const snippet = bashGhEnvExport({ host: "github.example.com" });
  assert.ok(!snippet.includes("errorMessage"));
  assert.ok(!snippet.includes('set_status "failed"'));
});

test("no override returns an empty snippet", () => {
  assert.equal(bashGhEnvExport(undefined), "");
});
