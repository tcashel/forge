import { strict as assert } from "node:assert";
import { test } from "node:test";
import { isFixTargetSource, parseTargetKey, targetKey } from "../src/core/fix-targets.ts";

test("targetKey renders source:id tokens", () => {
  assert.equal(targetKey("finding", "ab12cd"), "finding:ab12cd");
  assert.equal(targetKey("comment", 12345), "comment:12345");
  assert.equal(targetKey("review", 999), "review:999");
});

test("parseTargetKey round-trips valid tokens", () => {
  assert.deepEqual(parseTargetKey("finding:ab12cd"), { source: "finding", id: "ab12cd" });
  assert.deepEqual(parseTargetKey("comment:12345"), { source: "comment", id: "12345" });
  assert.deepEqual(parseTargetKey("review:999"), { source: "review", id: "999" });
});

test("parseTargetKey keeps colons inside the id", () => {
  // ids are split on the first colon only.
  assert.deepEqual(parseTargetKey("comment:12:34"), { source: "comment", id: "12:34" });
});

test("parseTargetKey rejects malformed tokens", () => {
  assert.equal(parseTargetKey(""), null);
  assert.equal(parseTargetKey("nocolon"), null);
  assert.equal(parseTargetKey(":missing-source"), null);
  assert.equal(parseTargetKey("bogus:1"), null);
  assert.equal(parseTargetKey("comment:"), null);
});

test("isFixTargetSource guards the source enum", () => {
  assert.equal(isFixTargetSource("finding"), true);
  assert.equal(isFixTargetSource("comment"), true);
  assert.equal(isFixTargetSource("review"), true);
  assert.equal(isFixTargetSource("bogus"), false);
  assert.equal(isFixTargetSource(42), false);
  assert.equal(isFixTargetSource(null), false);
});
