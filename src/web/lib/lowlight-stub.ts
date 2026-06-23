// Stub for `@git-diff-view/lowlight`.
//
// `@git-diff-view/core` statically imports a default `highlighter` from
// `@git-diff-view/lowlight`, which transitively pulls in highlight.js
// (~9 MB) and lowlight. The review page drives all syntax highlighting
// through the single Shiki instance in `./highlight.ts` (see
// `getDiffHighlighter`), so the lowlight fallback is never used. Aliasing
// the package to this no-op stub (build plugin + tsconfig paths, see
// `build-aliases.ts`) keeps highlight.js out of the bundle entirely while
// satisfying the import contract: an unsupported language simply renders
// as plain text, which is the desired behaviour anyway.

type StubAST = { type: "root"; children: [] };

const emptyAst = (): StubAST => ({ type: "root", children: [] });
const emptyProcessed = () => ({ syntaxFileObject: {}, syntaxFileLineNumber: 0 });

export const highlighter = {
  name: "lowlight-stub",
  type: "class" as const,
  maxLineToIgnoreSyntax: 0,
  setMaxLineToIgnoreSyntax: () => {},
  ignoreSyntaxHighlightList: [] as (string | RegExp)[],
  setIgnoreSyntaxHighlightList: () => {},
  getAST: emptyAst,
  processAST: emptyProcessed,
  hasRegisteredCurrentLang: () => false,
  getHighlighterEngine: () => null,
};

export const _getAST = emptyAst;
export const processAST = emptyProcessed;
export const versions = "stub";
