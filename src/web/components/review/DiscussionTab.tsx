import type { IssuePrComment, PrReview, PrReviewBundle } from "../../types";
import { MarkdownViewer } from "../MarkdownViewer";
import { reviewClass, timeAgo } from "../prs/pr-format";

// One timeline entry — either a top-level issue comment or a submitted review
// summary — normalized so the conversation can render both chronologically.
interface ConversationEntry {
  key: string;
  user: string;
  body: string;
  ts: string;
  htmlUrl: string;
  reviewState?: PrReview["state"];
}

function reviewStateLabel(state: PrReview["state"]): string {
  if (state === "APPROVED") return "approved";
  if (state === "CHANGES_REQUESTED") return "requested changes";
  return "commented";
}

function ConversationItem({ entry }: { entry: ConversationEntry }) {
  return (
    <article class="review-issue-comment">
      <header>
        <span class="user">@{entry.user || "unknown"}</span>
        {entry.reviewState ? (
          <span class={`review-conv-state pr-status ${reviewClass(entry.reviewState)}`}>
            {reviewStateLabel(entry.reviewState)}
          </span>
        ) : null}
        <span class="ts">{timeAgo(entry.ts)} ago</span>
        {entry.htmlUrl ? (
          <a href={entry.htmlUrl} target="_blank" rel="noreferrer">
            view on GitHub
          </a>
        ) : null}
      </header>
      <MarkdownViewer markdown={entry.body || ""} class="review-md" />
    </article>
  );
}

// Merge issue comments + submitted review summaries into one chronological
// list so the conversation shows everything, not just issue comments.
export function buildConversation(issueComments: IssuePrComment[], prReviews: PrReview[]): ConversationEntry[] {
  const entries: ConversationEntry[] = [
    ...issueComments.map((c) => ({
      key: `issue-${c.id}`,
      user: c.user,
      body: c.body,
      ts: c.createdAt,
      htmlUrl: c.htmlUrl,
    })),
    ...prReviews.map((r) => ({
      key: `review-${r.id}`,
      user: r.user,
      body: r.body,
      ts: r.submittedAt ?? "",
      htmlUrl: r.htmlUrl,
      reviewState: r.state,
    })),
  ];
  return entries.sort((a, b) => a.ts.localeCompare(b.ts));
}

export function DiscussionTab({ bundle }: { bundle: PrReviewBundle }) {
  const conversation = buildConversation(bundle.issueComments, bundle.prReviews);
  if (conversation.length === 0) {
    return <p class="review-tab-empty">No discussion on this PR yet.</p>;
  }
  return (
    <div class="review-issue-comments-list">
      {conversation.map((entry) => (
        <ConversationItem key={entry.key} entry={entry} />
      ))}
    </div>
  );
}
