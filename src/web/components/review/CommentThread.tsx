import { renderMarkdown } from "../../lib/markdown";
import { selectedComments, toggleCommentSelection } from "../../signals/review";
import type { InlinePrComment } from "../../types";
import { timeAgo } from "../prs/pr-format";

export interface InlineThread {
  root: InlinePrComment;
  replies: InlinePrComment[];
}

interface Props {
  thread: InlineThread;
}

function CommentBody({ comment }: { comment: InlinePrComment }) {
  return (
    <article class="review-inline-comment">
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

export function CommentThread({ thread }: Props) {
  const sel = selectedComments.value;
  const checked = sel.has(String(thread.root.id));
  const onToggle = () => toggleCommentSelection(thread.root.id);
  return (
    <div class="review-thread">
      <label class="review-thread-select">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span class="sr-only">Select thread #{thread.root.id}</span>
      </label>
      <div class="review-thread-body">
        <CommentBody comment={thread.root} />
        {thread.replies.length > 0 ? (
          <div class="review-thread-replies">
            {thread.replies.map((r) => (
              <CommentBody key={r.id} comment={r} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
