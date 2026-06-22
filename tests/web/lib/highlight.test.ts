/**
 * highlight — the single Shiki instance, its language detection, theme-keyed
 * token cache, and the @git-diff-view DiffHighlighter it exposes.
 */
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  detectLang,
  ensureLang,
  getDiffHighlighter,
  isLangLoaded,
  onHighlighterReady,
  shikiLangId,
  tokenizeRow,
} from "../../../src/web/lib/highlight.ts";

// detectLang takes a Lang we can't name here (it's private), so drive it
// through ensureLang via a tiny helper that re-detects.
function langFor(path: string) {
  return detectLang(path);
}

async function waitForLang(path: string, timeoutMs = 8000): Promise<void> {
  const lang = langFor(path);
  assert.ok(lang, `no language detected for ${path}`);
  ensureLang(lang);
  if (isLangLoaded(lang)) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      off();
      reject(new Error(`grammar for ${path} did not load in time`));
    }, timeoutMs);
    const off = onHighlighterReady(() => {
      if (isLangLoaded(lang)) {
        clearTimeout(timer);
        off();
        resolve();
      }
    });
  });
}

test("detects the newly-registered config/markup languages", () => {
  assert.equal(shikiLangId(langFor("config.yaml")!), "yaml");
  assert.equal(shikiLangId(langFor("pnpm-lock.yaml")!), "yaml");
  assert.equal(shikiLangId(langFor("Cargo.toml")!), "toml");
  assert.equal(shikiLangId(langFor("run.sh")!), "bash");
  assert.equal(shikiLangId(langFor("setup.bash")!), "bash");
  assert.equal(shikiLangId(langFor("Dockerfile")!), "docker");
  assert.equal(shikiLangId(langFor("index.html")!), "html");
  assert.equal(shikiLangId(langFor("schema.sql")!), "sql");
  assert.equal(shikiLangId(langFor("pom.xml")!), "xml");
});

test("tokenizeRow keys its cache by theme (light vs dark differ)", async () => {
  await waitForLang("a.ts");
  const dark = tokenizeRow("const x = 1;", langFor("a.ts")!, "dark");
  const light = tokenizeRow("const x = 1;", langFor("a.ts")!, "light");
  assert.ok(dark && dark.length > 0);
  assert.ok(light && light.length > 0);
  const darkColors = dark.map((t) => t.color).join(",");
  const lightColors = light.map((t) => t.color).join(",");
  assert.notEqual(darkColors, lightColors);
});

test("getDiffHighlighter produces a processable AST through the single Shiki", async () => {
  await waitForLang("config.yaml");
  const hl = getDiffHighlighter();
  assert.equal(hl.type, "style");
  assert.ok(hl.hasRegisteredCurrentLang("yaml"));
  const ast = hl.getAST("name: forge\nversion: 2\n", "config.yaml", "yaml", "dark");
  assert.equal(ast.type, "root");
  const { syntaxFileObject, syntaxFileLineNumber } = hl.processAST(ast);
  assert.ok(syntaxFileLineNumber >= 2);
  assert.ok(syntaxFileObject[1]);
  assert.ok(syntaxFileObject[1].value.includes("name"));
});

test("getAST returns an empty AST for an unregistered language (plain text)", () => {
  const hl = getDiffHighlighter();
  const ast = hl.getAST("whatever", "x.unknownext", "no-such-lang", "dark");
  assert.deepEqual(ast.children, []);
});
