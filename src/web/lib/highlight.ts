// Lazy syntax-highlighter wrapper around Shiki — the single highlighter
// instance for the whole Workbench. Grammars are loaded on first use per
// language; the highlighter singleton (JavaScript-regex engine — no WASM)
// is created lazily on first call. Both `github-light` and `github-dark`
// are loaded so syntax colours can track the app's `data-theme`.
//
// Two consumers:
//   • `tokenizeRow` — per-row token spans (legacy helper / tests).
//   • `getDiffHighlighter` — a `@git-diff-view` `DiffHighlighter` backed by
//     this same instance, so the PR review diff highlights through one
//     Shiki (no second engine, no highlight.js — see `lib/lowlight-stub.ts`).
import type { HighlighterCore } from "shiki/core";

type Lang =
  | "ts"
  | "tsx"
  | "js"
  | "jsx"
  | "css"
  | "md"
  | "json"
  | "rs"
  | "py"
  | "go"
  | "yaml"
  | "toml"
  | "sh"
  | "html"
  | "sql"
  | "dockerfile"
  | "xml";

const EXT_TO_LANG: Record<string, Lang> = {
  ts: "ts",
  tsx: "tsx",
  mts: "ts",
  cts: "ts",
  js: "js",
  jsx: "jsx",
  mjs: "js",
  cjs: "js",
  css: "css",
  md: "md",
  markdown: "md",
  json: "json",
  rs: "rs",
  py: "py",
  go: "go",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  sh: "sh",
  bash: "sh",
  zsh: "sh",
  html: "html",
  htm: "html",
  sql: "sql",
  xml: "xml",
  svg: "xml",
};

// Files whose basename (lowercased) maps to a language regardless of suffix.
const FILENAME_TO_LANG: Record<string, Lang> = {
  dockerfile: "dockerfile",
  ".dockerignore": "sh",
  ".gitignore": "sh",
  ".env": "sh",
};

function basename(filePath: string): string {
  const m = /([^/\\]+)$/.exec(filePath);
  return (m ? m[1] : filePath).toLowerCase();
}

export function detectLang(filePath: string): Lang | null {
  const base = basename(filePath);
  if (FILENAME_TO_LANG[base]) return FILENAME_TO_LANG[base];
  if (base.startsWith("dockerfile")) return "dockerfile";
  const m = /\.([^.]+)$/.exec(base);
  if (!m) return null;
  return EXT_TO_LANG[m[1]] ?? null;
}

export type ThemeMode = "light" | "dark";

const SHIKI_THEME: Record<ThemeMode, string> = {
  light: "github-light",
  dark: "github-dark",
};

let highlighterPromise: Promise<HighlighterCore> | null = null;
let highlighter: HighlighterCore | null = null;
const loadedLangs = new Set<string>();
const langPromises = new Map<string, Promise<void>>();
const subscribers = new Set<() => void>();

/** Subscribe to load events; returns an unsubscribe. */
export function onHighlighterReady(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function notify(): void {
  for (const cb of subscribers) cb();
}

async function getHighlighter(): Promise<HighlighterCore> {
  if (highlighter) return highlighter;
  if (highlighterPromise) return highlighterPromise;
  highlighterPromise = (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, dark, light] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/themes/github-dark.mjs"),
      import("shiki/themes/github-light.mjs"),
    ]);
    const h = await createHighlighterCore({
      themes: [dark.default, light.default],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
    highlighter = h;
    return h;
  })();
  return highlighterPromise;
}

const LANG_LOADERS: Record<Lang, () => Promise<unknown>> = {
  ts: () => import("shiki/langs/typescript.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  js: () => import("shiki/langs/javascript.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  md: () => import("shiki/langs/markdown.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  rs: () => import("shiki/langs/rust.mjs"),
  py: () => import("shiki/langs/python.mjs"),
  go: () => import("shiki/langs/go.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  toml: () => import("shiki/langs/toml.mjs"),
  sh: () => import("shiki/langs/bash.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  dockerfile: () => import("shiki/langs/docker.mjs"),
  xml: () => import("shiki/langs/xml.mjs"),
};

const LANG_ID: Record<Lang, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  css: "css",
  md: "markdown",
  json: "json",
  rs: "rust",
  py: "python",
  go: "go",
  yaml: "yaml",
  toml: "toml",
  sh: "bash",
  html: "html",
  sql: "sql",
  dockerfile: "docker",
  xml: "xml",
};

/** Shiki grammar id for a detected language (e.g. "typescript", "yaml"). */
export function shikiLangId(lang: Lang): string {
  return LANG_ID[lang];
}

/** True once a grammar is loaded and rows in this language can tokenize. */
export function isLangLoaded(lang: Lang): boolean {
  return loadedLangs.has(LANG_ID[lang]);
}

/** Trigger lazy load of a language; safe to call repeatedly. */
export function ensureLang(lang: Lang): void {
  const id = LANG_ID[lang];
  if (loadedLangs.has(id)) return;
  if (langPromises.has(id)) return;
  const p = (async () => {
    try {
      const h = await getHighlighter();
      const mod = (await LANG_LOADERS[lang]()) as { default: unknown };
      await h.loadLanguage(mod.default as Parameters<HighlighterCore["loadLanguage"]>[0]);
      loadedLangs.add(id);
      notify();
    } catch {
      // Swallow — caller falls back to plain text.
    }
  })();
  langPromises.set(id, p);
}

export interface HlToken {
  text: string;
  color?: string;
}

// Tokenization cache. Diff rows repeat heavily (blank lines, braces,
// unchanged context). Map-as-LRU: delete+reinsert on hit, evict oldest on
// overflow. Keyed by theme + lang + content so cached tokens never bleed
// across light/dark.
const TOKEN_CACHE_MAX = 20_000;
const tokenCache = new Map<string, HlToken[]>();

/**
 * Tokenize a single row of content. Returns null if the highlighter or the
 * language grammar isn't loaded yet (caller renders plain text).
 */
export function tokenizeRow(content: string, lang: Lang, theme: ThemeMode = "dark"): HlToken[] | null {
  const id = LANG_ID[lang];
  if (!highlighter || !loadedLangs.has(id)) return null;
  const themeName = SHIKI_THEME[theme];
  const key = `${themeName}\0${id}\0${content}`;
  const cached = tokenCache.get(key);
  if (cached) {
    tokenCache.delete(key);
    tokenCache.set(key, cached);
    return cached;
  }
  try {
    const lines = highlighter.codeToTokensBase(content, {
      lang: id,
      theme: themeName,
      includeExplanation: false,
    });
    const out: HlToken[] = [];
    const line = lines[0] ?? [];
    for (const t of line) out.push({ text: t.content, color: t.color });
    tokenCache.set(key, out);
    if (tokenCache.size > TOKEN_CACHE_MAX) {
      const oldest = tokenCache.keys().next();
      if (!oldest.done) tokenCache.delete(oldest.value);
    }
    return out;
  } catch {
    return null;
  }
}

// ─── @git-diff-view DiffHighlighter backed by the single Shiki instance ──────

// hast types (mirrors the shape `codeToHast` returns / `processAST` walks).
interface HastNode {
  type: string;
  value?: string;
  tagName?: string;
  properties?: { style?: string; className?: string[]; [k: string]: unknown };
  children?: HastNode[];
  lineNumber?: number;
  startIndex?: number;
  endIndex?: number;
}
type HastRoot = { type: "root"; children: HastNode[] };

interface SyntaxLine {
  value: string;
  lineNumber: number;
  valueLength: number;
  nodeList: { node: HastNode; wrapper?: HastNode }[];
}

// Vendored from `@git-diff-view/shiki` `processAST` — a pure hast walk that
// groups text nodes into 1-based lines and records each node's char range.
// Vendored (not imported) because importing the adapter eagerly spins up a
// second Shiki instance with ~35 grammars; we drive everything from our
// own Shiki via `getAST` below.
function processAST(ast: HastRoot): { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number } {
  let lineNumber = 1;
  const syntaxObj: Record<number, SyntaxLine> = {};
  const loopAST = (nodes: HastNode[], wrapper?: HastNode) => {
    nodes.forEach((node) => {
      if (node.type === "text") {
        const value = node.value ?? "";
        if (value.indexOf("\n") === -1) {
          const valueLength = value.length;
          if (!syntaxObj[lineNumber]) {
            node.startIndex = 0;
            node.endIndex = valueLength - 1;
            syntaxObj[lineNumber] = { value, lineNumber, valueLength, nodeList: [{ node, wrapper }] };
          } else {
            node.startIndex = syntaxObj[lineNumber].valueLength;
            node.endIndex = node.startIndex + valueLength - 1;
            syntaxObj[lineNumber].value += value;
            syntaxObj[lineNumber].valueLength += valueLength;
            syntaxObj[lineNumber].nodeList.push({ node, wrapper });
          }
          node.lineNumber = lineNumber;
          return;
        }
        const lines = value.split("\n");
        node.children = node.children || [];
        for (let i = 0; i < lines.length; i++) {
          const _value = i === lines.length - 1 ? lines[i] : `${lines[i]}\n`;
          const _lineNumber = i === 0 ? lineNumber : ++lineNumber;
          const _valueLength = _value.length;
          const _node: HastNode = { type: "text", value: _value, lineNumber: _lineNumber };
          if (!syntaxObj[_lineNumber]) {
            _node.startIndex = 0;
            _node.endIndex = _valueLength - 1;
            syntaxObj[_lineNumber] = {
              value: _value,
              lineNumber: _lineNumber,
              valueLength: _valueLength,
              nodeList: [{ node: _node, wrapper }],
            };
          } else {
            _node.startIndex = syntaxObj[_lineNumber].valueLength;
            _node.endIndex = _node.startIndex + _valueLength - 1;
            syntaxObj[_lineNumber].value += _value;
            syntaxObj[_lineNumber].valueLength += _valueLength;
            syntaxObj[_lineNumber].nodeList.push({ node: _node, wrapper });
          }
        }
        return;
      }
      if (node.children) {
        loopAST(node.children, node);
        node.lineNumber = lineNumber;
      }
    });
  };
  loopAST(ast.children);
  return { syntaxFileObject: syntaxObj, syntaxFileLineNumber: lineNumber };
}

const EMPTY_AST: HastRoot = { type: "root", children: [] };

let diffHighlighter: DiffHighlighterLike | null = null;

/** Shape of the `registerHighlighter` prop the diff view consumes. */
export interface DiffHighlighterLike {
  name: string;
  type: "class" | "style";
  maxLineToIgnoreSyntax: number;
  setMaxLineToIgnoreSyntax: (v: number) => void;
  ignoreSyntaxHighlightList: (string | RegExp)[];
  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
  getAST: (raw: string, fileName?: string, lang?: string, theme?: ThemeMode) => HastRoot;
  processAST: (ast: HastRoot) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };
  hasRegisteredCurrentLang: (lang: string) => boolean;
}

/**
 * A `@git-diff-view` `DiffHighlighter` that tokenizes through this module's
 * single Shiki instance. `getAST` is synchronous (the library requires it);
 * if the grammar/theme isn't ready yet it returns an empty AST (plain text)
 * and callers re-render once `onHighlighterReady` fires.
 */
export function getDiffHighlighter(): DiffHighlighterLike {
  if (diffHighlighter) return diffHighlighter;
  let maxLine = 20_000;
  let ignore: (string | RegExp)[] = [];
  diffHighlighter = {
    name: "forge-shiki",
    type: "style",
    get maxLineToIgnoreSyntax() {
      return maxLine;
    },
    set maxLineToIgnoreSyntax(v: number) {
      maxLine = v;
    },
    setMaxLineToIgnoreSyntax: (v: number) => {
      maxLine = v;
    },
    get ignoreSyntaxHighlightList() {
      return ignore;
    },
    set ignoreSyntaxHighlightList(v: (string | RegExp)[]) {
      ignore = v;
    },
    setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => {
      ignore = v;
    },
    getAST: (raw: string, _fileName?: string, lang?: string, theme?: ThemeMode): HastRoot => {
      if (!highlighter || !lang || !loadedLangs.has(lang)) return EMPTY_AST;
      try {
        return highlighter.codeToHast(raw, {
          lang,
          theme: SHIKI_THEME[theme ?? "dark"],
        }) as unknown as HastRoot;
      } catch {
        return EMPTY_AST;
      }
    },
    processAST,
    hasRegisteredCurrentLang: (lang: string) => loadedLangs.has(lang),
  } as DiffHighlighterLike;
  return diffHighlighter;
}
