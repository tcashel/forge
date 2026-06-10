import { type ReviewTab, reviewActiveTab } from "../../signals/review";
import type { PrReviewBundle } from "../../types";
import { CommitsTab } from "./CommitsTab";
import { DescriptionTab } from "./DescriptionTab";
import { DiscussionTab } from "./DiscussionTab";

interface Props {
  bundle: PrReviewBundle;
  repoRoot: string;
}

export function ReviewTabs({ bundle, repoRoot }: Props) {
  const conversationCount = bundle.issueComments.length + bundle.prReviews.length;
  // Auto default: lead with the description when there is one, otherwise the
  // discussion — matches what the operator most likely wants to read first.
  const active: ReviewTab = reviewActiveTab.value ?? ((bundle.pr.body ?? "").trim() ? "description" : "discussion");

  const tabs: Array<{ id: ReviewTab; label: string; badge?: string }> = [
    { id: "description", label: "Description" },
    { id: "discussion", label: "Discussion", badge: conversationCount > 0 ? String(conversationCount) : undefined },
    { id: "commits", label: "Commits" },
  ];

  return (
    <div class="review-tabs">
      <nav class="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            class={`tab ${active === tab.id ? "active" : ""}`}
            onClick={() => {
              reviewActiveTab.value = tab.id;
            }}
          >
            {tab.badge ? <span class="pill">{tab.badge}</span> : null} {tab.label}
          </button>
        ))}
      </nav>
      <div class="review-tab-body">
        {active === "description" ? <DescriptionTab bundle={bundle} /> : null}
        {active === "discussion" ? <DiscussionTab bundle={bundle} /> : null}
        {active === "commits" ? <CommitsTab bundle={bundle} repoRoot={repoRoot} /> : null}
      </div>
    </div>
  );
}
