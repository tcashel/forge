import { useEffect } from "preact/hooks";
import { loadReviewCommits, reviewCommits, reviewCommitsError, reviewCommitsLoading } from "../../signals/review";
import type { PrReviewBundle } from "../../types";
import { timeAgo } from "../prs/pr-format";

interface Props {
  bundle: PrReviewBundle;
  repoRoot: string;
}

export function CommitsTab({ bundle, repoRoot }: Props) {
  const commits = reviewCommits.value;
  // Lazy: first activation fetches; ReviewPage's PR-switch effect resets
  // reviewCommits (clearPerPrHeaderState) so a stale list never carries
  // across PRs.
  useEffect(() => {
    if (reviewCommits.value === null && !reviewCommitsLoading.value) {
      void loadReviewCommits(bundle.pr.number, repoRoot);
    }
  }, [bundle.pr.number, repoRoot]);

  if (reviewCommitsLoading.value && commits === null) {
    return <p class="review-tab-empty">Loading commits…</p>;
  }
  if (reviewCommitsError.value) {
    return <p class="review-tab-empty error">{reviewCommitsError.value}</p>;
  }
  if (!commits || commits.length === 0) {
    return <p class="review-tab-empty">No commits found.</p>;
  }
  return (
    <ul class="review-commits">
      {commits.map((c) => (
        <li key={c.oid} class="review-commit">
          <a class="review-commit-oid" href={`${bundle.pr.url}/commits/${c.oid}`} target="_blank" rel="noreferrer">
            {c.oid.slice(0, 7)}
          </a>
          <span class="review-commit-headline" title={c.messageBody || undefined}>
            {c.messageHeadline}
          </span>
          <span class="review-commit-meta">
            @{c.authors[0]?.login || c.authors[0]?.name || "unknown"}
            {c.authoredDate ? ` · ${timeAgo(c.authoredDate)} ago` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
