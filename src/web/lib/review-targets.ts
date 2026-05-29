// Web mirror of src/core/fix-targets.ts. A "fix target" is anything the
// operator can select in the review surface and send to the validate-then-fix
// worker: a Forge finding, a GitHub inline comment, or a PR review summary.
// Each is identified by a stable `${source}:${id}` token that the selection
// signal, the fix API payload, and the persisted commentFixState all share.

export type FixTargetSource = "finding" | "comment" | "review";

export interface FixTarget {
  source: FixTargetSource;
  id: string;
}

const SOURCES: readonly FixTargetSource[] = ["finding", "comment", "review"];

export function targetKey(source: FixTargetSource, id: string | number): string {
  return `${source}:${id}`;
}

export function parseTargetKey(token: string): FixTarget | null {
  const idx = token.indexOf(":");
  if (idx <= 0) return null;
  const source = token.slice(0, idx);
  const id = token.slice(idx + 1);
  if (!SOURCES.includes(source as FixTargetSource) || id.length === 0) return null;
  return { source: source as FixTargetSource, id };
}
