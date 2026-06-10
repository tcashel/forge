// Lazy syntax-highlighter wrapper around Shiki. Grammars are loaded on
// first call per language; the highlighter singleton (with the
// JavaScript-regex engine — no WASM) is created lazily on first use.
//
// Tokenization is row-by-row so the diff layout (gutters, line numbers,
// add/delete backgrounds, in-line findings/comments) stays intact —
// only the inner content is highlighted.
import type { HighlighterCore } from "shiki/core";

type Lang = "ts" | "tsx" | "js" | "jsx" | "css" | "md" | "json" | "rs" | "py" | "go";

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
};

export function detectLang(filePath: string): Lang | null {
  const m = /\.([^./\\]+)$/.exec(filePath);
  if (!m) return null;
  return EXT_TO_LANG[m[1].toLowerCase()] ?? null;
}

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

const THEME_NAME = "github-dark";

async function getHighlighter(): Promise<HighlighterCore> {
  if (highlighter) return highlighter;
  if (highlighterPromise) return highlighterPromise;
  highlighterPromise = (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, theme] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/themes/github-dark.mjs"),
    ]);
    const h = await createHighlighterCore({
      themes: [theme.default],
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
};

/** True once a grammar is loaded and rows in this language can tokenize. */
export function isLangLoaded(lang: Lang): boolean {
  return loadedLangs.has(lang);
}

/** Trigger lazy load of a language; safe to call repeatedly. */
export function ensureLang(lang: Lang): void {
  if (loadedLangs.has(lang)) return;
  if (langPromises.has(lang)) return;
  const p = (async () => {
    try {
      const h = await getHighlighter();
      const mod = (await LANG_LOADERS[lang]()) as { default: unknown };
      // Shiki's loadLanguage accepts the grammar export (array or single object).
      await h.loadLanguage(mod.default as Parameters<HighlighterCore["loadLanguage"]>[0]);
      loadedLangs.add(lang);
      notify();
    } catch {
      // Swallow — caller falls back to plain text.
    }
  })();
  langPromises.set(lang, p);
}

export interface HlToken {
  text: string;
  color?: string;
}

// Tokenization cache. Diff rows repeat heavily (blank lines, braces,
// unchanged context re-rendered on every parent state change), and
// Shiki's tokenizer is the most expensive thing on the review page.
// Map-as-LRU: delete+reinsert on hit, evict oldest insertion on
// overflow. Single theme today — clear this cache if theme switching
// ever lands.
const TOKEN_CACHE_MAX = 20_000;
const tokenCache = new Map<string, HlToken[]>();

/**
 * Tokenize a single row of content. Returns null if the highlighter or
 * the language grammar isn't loaded yet (caller renders plain text).
 */
export function tokenizeRow(content: string, lang: Lang): HlToken[] | null {
  if (!highlighter || !loadedLangs.has(lang)) return null;
  const key = `${lang}\0${content}`;
  const cached = tokenCache.get(key);
  if (cached) {
    tokenCache.delete(key);
    tokenCache.set(key, cached);
    return cached;
  }
  try {
    const lines = highlighter.codeToTokensBase(content, {
      lang: LANG_ID[lang],
      theme: THEME_NAME,
      includeExplanation: false,
    });
    const out: HlToken[] = [];
    const line = lines[0] ?? [];
    for (const t of line) {
      out.push({ text: t.content, color: t.color });
    }
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
