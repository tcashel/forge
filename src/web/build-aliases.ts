// Preact-compat aliasing for the Workbench bundle.
//
// `@git-diff-view/react` is authored against React. We run it under Preact
// (the rest of the Workbench is Preact + @preact/signals), so its bare
// `react`/`react-dom`/`react/jsx-runtime` imports must resolve to
// preact/compat. Bun.build's BuildConfig has no first-class `alias` field,
// so we pin the mechanism explicitly: a Bun.build resolver plugin
// (`diffViewAliasPlugin`) verified against Bun 1.3. The same module names
// are mirrored in `tsconfig.json` `compilerOptions.paths` for the
// type-checker.
//
// Important: `react/jsx-runtime` → `preact/jsx-runtime` (NOT preact/compat,
// which does not export `jsx`/`jsxs`). `@git-diff-view/lowlight` is aliased
// to a local no-op stub so highlight.js never enters the bundle (see
// `lib/lowlight-stub.ts`).

import * as path from "node:path";

/** Module-name → target package, applied as exact-match resolves. */
export const PREACT_COMPAT_ALIASES: Record<string, string> = {
  "react/jsx-runtime": "preact/jsx-runtime",
  "react/jsx-dev-runtime": "preact/jsx-dev-runtime",
  "react-dom": "preact/compat",
  "react-dom/client": "preact/compat",
  react: "preact/compat",
};

/** Absolute path to the lowlight stub that replaces highlight.js. */
export function lowlightStubPath(repoRoot: string): string {
  return path.join(repoRoot, "src", "web", "lib", "lowlight-stub.ts");
}

interface BunPluginBuilder {
  onResolve(opts: { filter: RegExp }, cb: (args: { path: string }) => { path: string }): void;
}

/**
 * Bun.build plugin that resolves React module specifiers to preact/compat
 * and `@git-diff-view/lowlight` to the local stub. `resolveFrom` is the repo
 * root (where node_modules lives); defaults to process.cwd().
 */
export function diffViewAliasPlugin(resolveFrom: string = process.cwd()) {
  const stub = lowlightStubPath(resolveFrom);
  return {
    name: "diff-view-preact-alias",
    setup(build: BunPluginBuilder) {
      build.onResolve({ filter: /^@git-diff-view\/lowlight$/ }, () => ({ path: stub }));
      for (const [from, to] of Object.entries(PREACT_COMPAT_ALIASES)) {
        const filter = new RegExp(`^${from.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")}$`);
        build.onResolve({ filter }, () => ({ path: Bun.resolveSync(to, resolveFrom) }));
      }
    },
  };
}
