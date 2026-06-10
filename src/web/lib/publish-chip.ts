// Pure projection of a PublishRecord onto the review-history publish chip.
// Kept signal/DOM-free so tests/web/lib/publish-chip.test.ts can drive it
// directly. The class names map onto the existing `.pr-status` palette
// (pass = green, pend = amber, fail = red, none = neutral).

import type { PublishRecord } from "../types";

export type PublishChipClass = "pass" | "pend" | "fail" | "none";

export interface PublishChip {
  label: string;
  className: PublishChipClass;
  /** Error/extra text shown on hover (title) and in the expanded detail. */
  detail: string | null;
  /** True when a "Retry publish" action makes sense for this record. */
  retryable: boolean;
}

/** Findings that actually reached GitHub (posted inline, posted as
 *  out-of-diff body bullets, or skipped because already published). */
export function publishSucceededCount(record: PublishRecord): number {
  return (record.posted || 0) + (record.outOfDiff || 0) + (record.skipped || 0);
}

/** Findings the publish attempted to place (succeeded + failed). */
export function publishAttemptedCount(record: PublishRecord): number {
  return publishSucceededCount(record) + (record.failed || 0);
}

/**
 * Map a publish record to its chip. Returns null for pre-Wave-1 runs that
 * have no publish.json (we can't distinguish "not requested" from "unknown"
 * for those, so we render nothing rather than guess).
 */
export function publishChip(record: PublishRecord | null | undefined): PublishChip | null {
  if (!record) return null;
  const headMovedNote = record.headMoved ? " (PR head moved during review)" : "";
  switch (record.state) {
    case "not-requested":
      return { label: "Not published", className: "none", detail: null, retryable: false };
    case "nothing-new":
      return { label: "Nothing to publish", className: "none", detail: null, retryable: false };
    case "published":
      return {
        label: `Published ${publishSucceededCount(record)}`,
        className: "pass",
        detail: headMovedNote ? headMovedNote.trim() : null,
        retryable: false,
      };
    case "partial":
      return {
        label: `Partial ${publishSucceededCount(record)}/${publishAttemptedCount(record)}`,
        className: "pend",
        detail: `${record.error ?? `${record.failed} finding(s) failed to publish`}${headMovedNote}`,
        retryable: true,
      };
    case "reconcile-failed":
      return {
        label: "Publish failed",
        className: "fail",
        detail: `${record.error ?? "could not reconcile already-published findings"}${headMovedNote}`,
        retryable: true,
      };
    default:
      // "failed" plus any unknown future state — surface as a failure
      // rather than rendering nothing.
      return {
        label: "Publish failed",
        className: "fail",
        detail: `${record.error ?? "publish failed"}${headMovedNote}`,
        retryable: true,
      };
  }
}
