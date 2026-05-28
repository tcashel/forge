import { enterPrMode } from "../../lib/modes";
import { loadReviewBundle } from "../../signals/review";

interface Props {
  prNumber: number;
  repoRoot: string;
  loading: boolean;
}

export function ReviewActionBar({ prNumber, repoRoot, loading }: Props) {
  const onBack = () => enterPrMode();
  const onRefresh = () => {
    void loadReviewBundle(prNumber, repoRoot);
  };
  return (
    <div class="review-action-bar">
      <button type="button" class="btn btn-ghost" onClick={onBack}>
        ← Back to PRs
      </button>
      <button type="button" class="btn btn-secondary" disabled={loading} onClick={onRefresh}>
        {loading ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
