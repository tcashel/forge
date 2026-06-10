import type { PrReviewBundle } from "../../types";
import { ciClass, ciLabel, reviewClass, reviewLabel, timeAgo } from "../prs/pr-format";
import { ReviewTabs } from "./ReviewTabs";

interface Props {
  bundle: PrReviewBundle;
  repoRoot: string;
}

export function ReviewHeader({ bundle, repoRoot }: Props) {
  const { pr, diffStats, warnings } = bundle;
  return (
    <section class="review-header">
      <div class="row1">
        <span class="pr-num big">#{pr.number}</span>
        {pr.isDraft ? <span class="pr-tag">draft</span> : null}
        <span class={`pr-status ${ciClass(pr.statusCheckRollup)}`}>{ciLabel(pr.statusCheckRollup)}</span>
        <span class={`pr-status ${reviewClass(pr.reviewDecision)}`}>{reviewLabel(pr.reviewDecision)}</span>
      </div>
      <h1>
        {pr.url ? (
          <a class="review-title-link" href={pr.url} target="_blank" rel="noreferrer">
            {pr.title}
          </a>
        ) : (
          pr.title
        )}
      </h1>
      <div class="meta">
        <span>
          <b>Author</b> @{pr.author || "unknown"}
        </span>
        <span>
          <b>Branch</b> {pr.headRefName} → {pr.baseRefName}
        </span>
        <span>
          <b>Updated</b> {timeAgo(pr.updatedAt)} ago
        </span>
        <span>
          <b>Files</b> {diffStats.changedFiles}
        </span>
        <span>
          <span class="plus">+{diffStats.additions}</span> <span class="minus">−{diffStats.deletions}</span>
        </span>
      </div>
      {warnings.length > 0 ? (
        <ul class="review-warnings">
          {warnings.map((w) => (
            <li key={`${w.source}:${w.message}`}>
              <b>{w.source}:</b> {w.message}
            </li>
          ))}
        </ul>
      ) : null}
      <ReviewTabs bundle={bundle} repoRoot={repoRoot} />
    </section>
  );
}
