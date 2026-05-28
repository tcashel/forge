import { enterReviewMode } from "../../lib/modes";
import { currentPrNumber, prsRepoRoot } from "../../signals/prs";
import type { PrView } from "../../types";
import { ciClass, ciLabel, reviewClass, reviewLabel, timeAgo } from "./pr-format";

interface PrRowProps {
  pr: PrView;
  selected: boolean;
}

export function PrRow({ pr, selected }: PrRowProps) {
  const repoRoot = prsRepoRoot.value;
  const onSelect = () => {
    currentPrNumber.value = pr.number;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };
  const onReview = (e: MouseEvent) => {
    e.stopPropagation();
    if (repoRoot) enterReviewMode(pr.number, repoRoot);
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: avoid nesting <button>s; the row hosts an inner Review <button>
    <div
      role="button"
      tabIndex={0}
      class={`pr-row${selected ? " selected" : ""}`}
      data-pr-number={pr.number}
      onClick={onSelect}
      onKeyDown={onKey}
    >
      <span class="pr-num">#{pr.number}</span>
      <span class="pr-main">
        <span class="pr-title">{pr.title}</span>
        <span class="pr-meta">
          <span>{pr.headRefName}</span>
          <span>→</span>
          <span>{pr.baseRefName}</span>
          <span>·</span>
          <span>@{pr.author || "unknown"}</span>
        </span>
      </span>
      <span class="pr-badges">
        {pr.isDraft ? <span class="pr-tag">draft</span> : null}
        {pr.isMine ? <span class="pr-tag mine">mine</span> : null}
        <span class={`pr-status ${ciClass(pr.statusCheckRollup)}`}>{ciLabel(pr.statusCheckRollup)}</span>
        <span class={`pr-status ${reviewClass(pr.reviewDecision)}`}>{reviewLabel(pr.reviewDecision)}</span>
        <button type="button" class="btn sm btn-secondary pr-review-btn" disabled={repoRoot == null} onClick={onReview}>
          Review
        </button>
      </span>
      <span class="pr-stats">
        <span>{timeAgo(pr.updatedAt)} ago</span>
        <span class="plus">+{Number(pr.additions || 0)}</span>
        <span class="minus">-{Number(pr.deletions || 0)}</span>
      </span>
    </div>
  );
}
