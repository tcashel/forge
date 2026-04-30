import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bashGhEnvExport, resolveGhEnv } from "../src/gh.ts";

// ─── resolveGhEnv: no-op path ────────────────────────────────────────────────
//
// When neither user nor host is configured, the resolver returns an empty
// env so callers can pass `{ ...process.env, ...resolved.env }` and gh
// uses its built-in active account.

test("resolveGhEnv with no target returns empty env and no error", () => {
  const r = resolveGhEnv(undefined);
  assert.deepEqual(r.env, {});
  assert.equal(r.error, null);
});

test("resolveGhEnv with empty target returns empty env and no error", () => {
  const r = resolveGhEnv({});
  assert.deepEqual(r.env, {});
  assert.equal(r.error, null);
});

// ─── bashGhEnvExport ─────────────────────────────────────────────────────────
//
// Pure-string snippet generator; covers shell quoting + GH_HOST/GH_TOKEN
// emission. We don't exercise gh itself here.

test("bashGhEnvExport returns empty string when nothing is configured", () => {
  assert.equal(bashGhEnvExport(undefined), "");
  assert.equal(bashGhEnvExport({}), "");
});

test("bashGhEnvExport emits GH_HOST when only host is configured (no token resolution)", () => {
  const out = bashGhEnvExport({ host: "github.example.com" });
  assert.match(out, /export GH_HOST='github\.example\.com'/);
  assert.ok(!out.includes("GH_TOKEN"), "should not touch GH_TOKEN when no user is set");
  assert.ok(!out.includes("gh auth token"), "should not call gh auth token when no user is set");
});

test("bashGhEnvExport emits GH_HOST + GH_TOKEN resolution when user is configured", () => {
  const out = bashGhEnvExport({ user: "tcashelmgni", host: "github.com" });
  assert.match(out, /export GH_HOST='github\.com'/);
  assert.match(out, /gh auth token --hostname 'github\.com' --user 'tcashelmgni'/);
  assert.match(out, /export GH_TOKEN="\$_FORGE_GH_TOKEN"/);
  assert.match(out, /set_status "failed"/);
});

test("bashGhEnvExport defaults host to github.com when only user is set", () => {
  const out = bashGhEnvExport({ user: "alice" });
  assert.match(out, /export GH_HOST='github\.com'/);
  assert.match(out, /--user 'alice'/);
});

test("bashGhEnvExport quotes single quotes in user/host safely", () => {
  // Single-quoted '\'' splice — pathological but the helper should not break.
  const out = bashGhEnvExport({ user: "weird'name", host: "host'.com" });
  // Each literal apostrophe becomes '\'' inside the quoted string.
  assert.ok(out.includes("'weird'\\''name'"), `actual: ${out}`);
  assert.ok(out.includes("'host'\\''.com'"), `actual: ${out}`);
});
