import { useMemo } from "preact/hooks";
import { parseUnifiedDiff } from "../../lib/diff";
import type { PrReviewBundle } from "../../types";
import { CommentThread } from "./CommentThread";
import { anchorThreads, groupIntoThreads } from "./DiffPane";

interface Props {
  bundle: PrReviewBundle;
}

export function UnanchoredComments({ bundle }: Props) {
  const parsed = useMemo(() => parseUnifiedDiff(bundle.diff), [bundle.diff]);
  const threads = useMemo(() => groupIntoThreads(bundle.inlineComments), [bundle.inlineComments]);
  const { stale } = useMemo(() => anchorThreads(threads, parsed), [threads, parsed]);
  if (stale.length === 0) return null;
  return (
    <section class="review-stale">
      <h2>Stale comments ({stale.length})</h2>
      <p class="hint">
        These inline comments no longer anchor to the current diff — their original lines have been rewritten.
      </p>
      <div class="review-stale-list">
        {stale.map((t) => (
          <CommentThread key={`stale-${t.root.id}`} thread={t} anchored={false} />
        ))}
      </div>
    </section>
  );
}
