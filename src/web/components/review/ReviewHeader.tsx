import { renderMarkdown } from "../../lib/markdown";
import type { IssuePrComment, PrReviewBundle } from "../../types";
import { ciClass, ciLabel, reviewClass, reviewLabel, timeAgo } from "../prs/pr-format";

interface Props {
  bundle: PrReviewBundle;
}

function IssueComment({ comment }: { comment: IssuePrComment }) {
  return (
    <article class="review-issue-comment">
      <header>
        <span class="user">@{comment.user || "unknown"}</span>
        <span class="ts">{timeAgo(comment.createdAt)} ago</span>
        {comment.htmlUrl ? (
          <a href={comment.htmlUrl} target="_blank" rel="noreferrer">
            view on GitHub
          </a>
        ) : null}
      </header>
      <div class="review-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.body || "") }} />
    </article>
  );
}

export function ReviewHeader({ bundle }: Props) {
  const { pr, diffStats, issueComments, warnings } = bundle;
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
      {issueComments.length > 0 ? (
        <details class="review-issue-comments" open>
          <summary>Conversation ({issueComments.length})</summary>
          <div class="review-issue-comments-list">
            {issueComments.map((c) => (
              <IssueComment key={c.id} comment={c} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
