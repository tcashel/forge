import { targetKey } from "../../lib/review-targets";
import { commentStatuses, reviewBundle, selectedTargets, toggleTargetSelection } from "../../signals/review";
import type { InlinePrComment } from "../../types";
import { MarkdownViewer } from "../MarkdownViewer";
import { timeAgo } from "../prs/pr-format";

export interface InlineThread {
  root: InlinePrComment;
  replies: InlinePrComment[];
}

interface Props {
  thread: InlineThread;
  /** When false, the checkbox is disabled (stale anchor — not fixable). */
  anchored?: boolean;
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
      <MarkdownViewer markdown={comment.body || ""} class="review-md" />
    </article>
  );
}

interface StatusBadge {
  label: string;
  className: string;
  reason?: string;
}

function statusBadgeFor(token: string): StatusBadge | null {
  const live = commentStatuses.value.get(token);
  if (live === "fixing") return { label: "fixing…", className: "fixing" };
  const persisted = reviewBundle.value?.commentFixState?.[token];
  if (!persisted) return null;
  if (persisted.status === "fixed") return { label: "fixed", className: "fixed", reason: persisted.reason };
  if (persisted.status === "disputed") return { label: "disputed", className: "disputed", reason: persisted.reason };
  if (persisted.status === "failed") return { label: "failed", className: "failed", reason: persisted.reason };
  return null;
}

export function CommentThread({ thread, anchored = true }: Props) {
  const sel = selectedTargets.value;
  const id = thread.root.id;
  const token = targetKey("comment", id);
  const checked = sel.has(token);
  const badge = statusBadgeFor(token);
  const fixing = badge?.className === "fixing";
  const fixed = badge?.className === "fixed";
  const disabled = !anchored || fixing || fixed;
  const onToggle = () => {
    if (disabled) return;
    toggleTargetSelection(token);
  };
  return (
    <div class="review-thread">
      <label class="review-thread-select">
        <input
          type="checkbox"
          checked={checked && !disabled}
          disabled={disabled}
          onChange={onToggle}
          title={
            !anchored
              ? "Stale anchor — not fixable"
              : fixing
                ? "Already running fix"
                : fixed
                  ? "Already fixed"
                  : undefined
          }
        />
        <span class="sr-only">Select thread #{id}</span>
      </label>
      <div class="review-thread-body">
        <CommentBody comment={thread.root} />
        {badge ? (
          <div class={`review-thread-badge badge-${badge.className}`}>
            <span class="badge-label">{badge.label}</span>
            {badge.reason ? <span class="badge-reason"> — {badge.reason}</span> : null}
          </div>
        ) : null}
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
