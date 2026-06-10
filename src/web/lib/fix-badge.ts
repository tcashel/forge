// Pure resolution of the per-target fix badge shown next to comments,
// findings, and review summaries. Combines the live in-page status (the
// `commentStatuses` signal) with the persisted validation entry from the
// review bundle, and surfaces GitHub write failures (`ghError`) so a failed
// thread-resolve never hides behind a green "fixed" label.

import type { CommentFixStateEntry } from "../types";

export interface FixBadge {
  label: string;
  className: "fixing" | "fixed" | "disputed" | "failed";
  reason?: string;
  /** Detail when the GitHub write for this target failed (e.g.
   *  "resolve failed: …" / "dispute reply failed: …"). */
  ghError?: string;
  /** True when the published review thread was resolved on GitHub. */
  ghResolved?: boolean;
}

export function fixBadgeFor(
  live: string | undefined,
  persisted: CommentFixStateEntry | undefined | null,
): FixBadge | null {
  if (live === "fixing") return { label: "fixing…", className: "fixing" };
  if (!persisted) return null;
  if (persisted.status !== "fixed" && persisted.status !== "disputed" && persisted.status !== "failed") return null;
  return {
    label: persisted.status,
    className: persisted.status,
    reason: persisted.reason,
    ghError: persisted.ghError,
    ghResolved: persisted.ghResolved,
  };
}
