import { renderMarkdown } from "../../lib/markdown";
import type { IssuePrComment, PrReview, PrReviewBundle } from "../../types";
import { ciClass, ciLabel, reviewClass, reviewLabel, timeAgo } from "../prs/pr-format";

interface Props {
  bundle: PrReviewBundle;
}

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
      <div class="review-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.body || "") }} />
    </article>
  );
}

// Merge issue comments + submitted review summaries into one chronological
// list so the conversation shows everything, not just issue comments.
function buildConversation(issueComments: IssuePrComment[], prReviews: PrReview[]): ConversationEntry[] {
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

export function ReviewHeader({ bundle }: Props) {
  const { pr, diffStats, issueComments, prReviews, warnings } = bundle;
  const conversation = buildConversation(issueComments, prReviews);
  return (
    <section class="review-header">
      <div class="row1">
        <span class="pr-num big">#{pr.number}</span>
        {pr.isDraft ? <span class="pr-tag">draft</span> : null}
        <span class={`pr-status ${ciClass(pr.statusCheckRollup)}`}>{ciLabel(pr.statusCheckRollup)}</span>
        <span class={`pr-status ${reviewClass(pr.reviewDecision)}`}>{reviewLabel(pr.reviewDecision)}</span>
      </div>
      <h1>{pr.title}</h1>
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
      {conversation.length > 0 ? (
        <details class="review-issue-comments" open>
          <summary>Conversation ({conversation.length})</summary>
          <div class="review-issue-comments-list">
            {conversation.map((entry) => (
              <ConversationItem key={entry.key} entry={entry} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
