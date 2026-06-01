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

/**
 * The fix-target token for a selectable inline comment row. A comment carrying
 * a `forgeFindingId` marker IS the published view of a Forge finding, so it
 * must be selected as a `finding:` target — otherwise the fixer skips it as
 * someone else's `comment:` and never resolves the GitHub thread.
 */
export function commentTargetToken(comment: { id: string | number; forgeFindingId?: string }): string {
  return comment.forgeFindingId ? targetKey("finding", comment.forgeFindingId) : targetKey("comment", comment.id);
}

export function parseTargetKey(token: string): FixTarget | null {
  const idx = token.indexOf(":");
  if (idx <= 0) return null;
  const source = token.slice(0, idx);
  const id = token.slice(idx + 1);
  if (!SOURCES.includes(source as FixTargetSource) || id.length === 0) return null;
  return { source: source as FixTargetSource, id };
}
