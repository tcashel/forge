// Build helper for the DiffPane smoke test. Run as a subprocess
// (`bun build-diff-smoke.ts <outdir>`): in-process Bun.build inside
// `bun test` resolves nested extensionless imports differently, so the smoke
// test spawns this instead. Mirrors the Workbench bundle config.
import * as path from "node:path";
import { diffViewAliasPlugin } from "../../../src/web/build-aliases.ts";

const outdir = process.argv[2];
if (!outdir) {
  process.stderr.write("usage: build-diff-smoke.ts <outdir>\n");
  process.exit(2);
}
const repoRoot = path.resolve(import.meta.dir, "..", "..", "..");
const res = await Bun.build({
  entrypoints: [path.join(import.meta.dir, "diff-pane-entry.tsx")],
  outdir,
  target: "browser",
  format: "esm",
  splitting: true,
  plugins: [diffViewAliasPlugin(repoRoot)],
});
if (!res.success) {
  for (const l of res.logs) process.stderr.write(`${String(l)}\n`);
  process.exit(1);
}
