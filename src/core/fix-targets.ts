/**
 * Shared "fix target" identity for the comment-fix flow.
 *
 * A fix target is anything the operator can select in the review surface and
 * send to the validate-then-fix worker. There are three sources:
 *
 *   - `finding` — a Forge finding (id is the finding's hashed string id)
 *   - `comment` — a GitHub inline review comment (id is its numeric id)
 *   - `review`  — a GitHub PR review summary (id is its numeric review id)
 *
 * Every target is uniquely identified by a `${source}:${id}` token that
 * threads through selection → API → worker → validation → persisted state.
 * Finding ids are hex (no colon) and comment/review ids are integers, so the
 * `source:` prefix is unambiguous.
 */

export type FixTargetSource = "finding" | "comment" | "review";

export interface FixTarget {
  source: FixTargetSource;
  id: string;
}

const SOURCES: readonly FixTargetSource[] = ["finding", "comment", "review"];

export function isFixTargetSource(value: unknown): value is FixTargetSource {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value);
}

/** Render a target as its stable `source:id` token. */
export function targetKey(source: FixTargetSource, id: string | number): string {
  return `${source}:${id}`;
}

/** Parse a `source:id` token back into a target, or null if malformed. */
export function parseTargetKey(token: string): FixTarget | null {
  const idx = token.indexOf(":");
  if (idx <= 0) return null;
  const source = token.slice(0, idx);
  const id = token.slice(idx + 1);
  if (!isFixTargetSource(source) || id.length === 0) return null;
  return { source, id };
}
