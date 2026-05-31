import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderMarkdown } from "../src/web/lib/markdown.ts";

// renderMarkdown backs both spec/critique rendering and (now) PR comment
// bodies. These cover the GFM extensions added so non-Forge comments render
// formatted instead of as raw markdown.

test("renders a GFM table into thead/tbody", () => {
  const md = ["| Col A | Col B |", "| --- | --- |", "| 1 | 2 |", "| 3 | 4 |"].join("\n");
  const html = renderMarkdown(md);
  assert.ok(html.includes("<table>"));
  assert.ok(html.includes("<th>Col A</th>"));
  assert.ok(html.includes("<th>Col B</th>"));
  assert.ok(html.includes("<td>1</td>"));
  assert.ok(html.includes("<td>4</td>"));
  // The divider row must not leak into the body.
  assert.ok(!html.includes("---"));
});

test("renders blockquotes, including multi-line", () => {
  const html = renderMarkdown("> first line\n> second line");
  assert.ok(html.includes("<blockquote>"));
  assert.ok(html.includes("<p>first line\nsecond line</p>"));
  assert.ok(html.includes("</blockquote>"));
});

test("renders task-list checkboxes (checked + unchecked)", () => {
  const html = renderMarkdown("- [ ] todo\n- [x] done");
  assert.ok(html.includes('type="checkbox"> todo'));
  assert.ok(html.includes('checked="" disabled="" type="checkbox"> done'));
});

test("escapes HTML in all extensions (no raw passthrough)", () => {
  const html = renderMarkdown("> <script>alert(1)</script>");
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("still renders headings, lists, and bold (regression)", () => {
  const html = renderMarkdown("# Title\n\n- one\n- two\n\n**bold**");
  assert.ok(html.includes("<h1>Title</h1>"));
  assert.ok(html.includes("<li>one</li>"));
  assert.ok(html.includes("<strong>bold</strong>"));
});
