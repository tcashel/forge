import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderMarkdown } from "../src/cli/render-md.ts";
import { makeTheme } from "../src/tui/theme.ts";

const noColor = makeTheme(true);

const SAMPLE_SPEC = `---
id: abc-123
repo: /tmp/example
status: draft
---
# Title

## Section

Some \`inline\` text with **bold** and a [link](https://example.com).

- bullet one
- bullet two

\`\`\`bash
echo hello
\`\`\`

> a quoted line
`;

test("renderMarkdown with NO_COLOR theme is a stable, structure-preserving transform", () => {
  const out = renderMarkdown(SAMPLE_SPEC, noColor);
  // Frontmatter lines preserved verbatim under noColor (theme.fg is identity).
  assert.match(out, /^---\nid: abc-123/);
  assert.match(out, /\n---\n/);
  // Headers stripped of '#' markers.
  assert.match(out, /\nTitle\n/);
  assert.match(out, /\nSection\n/);
  // Bullets become •
  assert.match(out, /• bullet one/);
  assert.match(out, /• bullet two/);
  // Links inline as "text (url)"
  assert.match(out, /link \(https:\/\/example\.com\)/);
  // Inline code body preserved without backticks (under noColor).
  assert.match(out, /Some inline text/);
  // Bold body preserved without asterisks.
  assert.match(out, /with bold and/);
  // Code fence content preserved.
  assert.match(out, /echo hello/);
  // Blockquote preserved.
  assert.match(out, /> a quoted line/);
});

test("renderMarkdown with color theme emits ANSI escape sequences", () => {
  const colored = renderMarkdown(SAMPLE_SPEC, makeTheme(false));
  assert.ok(colored.includes("\x1b["), "expected ANSI escape codes when color is on");
});

test("renderMarkdown without frontmatter leaves the body untouched structurally", () => {
  const src = "# Hello\n\nBody.\n";
  const out = renderMarkdown(src, noColor);
  // No leading frontmatter block when none was present.
  assert.ok(!out.startsWith("---"), `unexpected leading ---: ${out}`);
  assert.match(out, /^Hello\n/);
  assert.match(out, /\nBody\.\n/);
});

test("renderMarkdown does not mutate code-fence content's special chars", () => {
  const src = "```\n# not a header\n- not a bullet\n```\n";
  const out = renderMarkdown(src, noColor);
  assert.match(out, /# not a header/);
  assert.match(out, /- not a bullet/);
});
