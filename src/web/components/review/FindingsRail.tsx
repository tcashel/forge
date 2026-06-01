import { useMemo, useState } from "preact/hooks";
import { scrollToFinding } from "../../lib/review-scroll";
import { commentTargetToken, targetKey } from "../../lib/review-targets";
import { commentStatuses, reviewBundle, selectedTargets, toggleTargetSelection } from "../../signals/review";
import type { ForgeFinding, ForgeFindingSeverity, PrReview } from "../../types";
import type { InlineThread } from "./CommentThread";

interface AnchoredFinding {
  finding: ForgeFinding;
  diffPosition: number;
}

interface AnchoredComment {
  thread: InlineThread;
  diffPosition: number;
}

interface Props {
  anchoredFindings: AnchoredFinding[];
  outsideFindings: ForgeFinding[];
  anchoredComments: AnchoredComment[];
  staleComments: InlineThread[];
  reviews: PrReview[];
}

const SEV_ORDER: ForgeFindingSeverity[] = ["BLOCKER", "HIGH", "MEDIUM", "LOW"];
const SEV_RANK: Record<ForgeFindingSeverity, number> = {
  BLOCKER: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function sortAnchored(a: AnchoredFinding, b: AnchoredFinding): number {
  const sev = SEV_RANK[a.finding.severity] - SEV_RANK[b.finding.severity];
  if (sev !== 0) return sev;
  const file = a.finding.file.localeCompare(b.finding.file);
  if (file !== 0) return file;
  return a.finding.lineStart - b.finding.lineStart;
}

function sortOutside(a: ForgeFinding, b: ForgeFinding): number {
  const sev = SEV_RANK[a.severity] - SEV_RANK[b.severity];
  if (sev !== 0) return sev;
  const file = a.file.localeCompare(b.file);
  if (file !== 0) return file;
  return a.lineStart - b.lineStart;
}

function findingRange(f: ForgeFinding): string {
  if (f.lineStart <= 0) return "";
  if (f.lineEnd > f.lineStart) return `:${f.lineStart}-${f.lineEnd}`;
  return `:${f.lineStart}`;
}

function snippet(text: string, max = 160): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

// ─── shared selection + status helpers ───────────────────────────────────────

interface StatusBadge {
  label: string;
  className: string;
  reason?: string;
}

interface RowState {
  checked: boolean;
  disabled: boolean;
  badge: StatusBadge | null;
}

/**
 * Resolve the live + persisted state for a fix-target token. `selectable`
 * is false for stale comments (no anchor to fix against).
 */
function rowStateFor(token: string, selectable: boolean): RowState {
  const live = commentStatuses.value.get(token);
  const persisted = reviewBundle.value?.commentFixState?.[token];
  let badge: StatusBadge | null = null;
  if (live === "fixing") {
    badge = { label: "fixing…", className: "fixing" };
  } else if (persisted) {
    if (persisted.status === "fixed") badge = { label: "fixed", className: "fixed", reason: persisted.reason };
    else if (persisted.status === "disputed")
      badge = { label: "disputed", className: "disputed", reason: persisted.reason };
    else if (persisted.status === "failed") badge = { label: "failed", className: "failed", reason: persisted.reason };
  }
  const fixing = badge?.className === "fixing";
  const fixed = badge?.className === "fixed";
  const disabled = !selectable || fixing || fixed;
  return { checked: selectedTargets.value.has(token) && !disabled, disabled, badge };
}

function RailSelect({ token, state, label }: { token: string; state: RowState; label: string }) {
  return (
    <label class="review-rail-select">
      <input
        type="checkbox"
        checked={state.checked}
        disabled={state.disabled}
        onChange={() => {
          if (!state.disabled) toggleTargetSelection(token);
        }}
      />
      <span class="sr-only">{label}</span>
    </label>
  );
}

function RailBadge({ badge }: { badge: StatusBadge | null }) {
  if (!badge) return null;
  return (
    <div class={`review-rail-badge badge-${badge.className}`}>
      <span class="badge-label">{badge.label}</span>
      {badge.reason ? <span class="badge-reason"> — {badge.reason}</span> : null}
    </div>
  );
}

// ─── finding rows ─────────────────────────────────────────────────────────────

interface FindingRowProps {
  finding: ForgeFinding;
  onJump?: () => void;
  expanded: boolean;
  onToggle: () => void;
}

function FindingRailRow({ finding, onJump, expanded, onToggle }: FindingRowProps) {
  const sevClass = `sev-${finding.severity.toLowerCase()}`;
  const token = targetKey("finding", finding.id);
  const state = rowStateFor(token, true);
  return (
    <li class={`review-rail-finding severity-${finding.severity.toLowerCase()}`}>
      <header>
        <RailSelect token={token} state={state} label={`Select finding ${finding.title}`} />
        <button
          type="button"
          class="review-rail-finding-summary"
          onClick={() => {
            onToggle();
            if (onJump) onJump();
          }}
          title={onJump ? "Jump to this finding in the diff" : finding.title}
        >
          <span class={`finding-severity ${sevClass}`}>{finding.severity}</span>
          <span class="review-rail-finding-title">{finding.title}</span>
          <span class="review-rail-finding-where">
            {finding.file}
            {findingRange(finding)}
          </span>
        </button>
      </header>
      <RailBadge badge={state.badge} />
      {expanded ? (
        <div class="review-rail-finding-body">
          {finding.evidence ? <pre class="finding-evidence">{finding.evidence}</pre> : null}
          {finding.why ? (
            <p class="finding-why">
              <strong>Why:</strong> {finding.why}
            </p>
          ) : null}
          {finding.fix ? (
            <p class="finding-fix">
              <strong>Fix:</strong> {finding.fix}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

// ─── comment rows ─────────────────────────────────────────────────────────────

function CommentRailRow({ thread, onJump }: { thread: InlineThread; onJump?: () => void }) {
  const c = thread.root;
  const token = commentTargetToken(c);
  const state = rowStateFor(token, !!onJump);
  return (
    <li class="review-rail-comment">
      <header>
        <RailSelect token={token} state={state} label={`Select comment from ${c.user || "unknown"}`} />
        <button
          type="button"
          class="review-rail-comment-summary"
          onClick={onJump}
          disabled={!onJump}
          title={onJump ? "Jump to this comment in the diff" : "Stale anchor — not fixable"}
        >
          <span class="review-rail-comment-user">@{c.user || "unknown"}</span>
          <span class="review-rail-comment-where">
            {c.path}
            {c.line != null ? `:${c.line}` : ""}
          </span>
          <span class="review-rail-comment-snippet">{snippet(c.body)}</span>
        </button>
      </header>
      <RailBadge badge={state.badge} />
    </li>
  );
}

// ─── review-summary rows ──────────────────────────────────────────────────────

function ReviewRailRow({ review }: { review: PrReview }) {
  const token = targetKey("review", review.id);
  const state = rowStateFor(token, true);
  const stateClass = review.state.toLowerCase().replace(/_/g, "-");
  return (
    <li class="review-rail-review">
      <header>
        <RailSelect token={token} state={state} label={`Select review summary from ${review.user || "unknown"}`} />
        <div class="review-rail-review-summary">
          <span class="review-rail-comment-user">@{review.user || "unknown"}</span>
          <span class={`review-rail-review-state state-${stateClass}`}>{review.state}</span>
          {review.htmlUrl ? (
            <a href={review.htmlUrl} target="_blank" rel="noreferrer">
              view
            </a>
          ) : null}
          <span class="review-rail-comment-snippet">{snippet(review.body)}</span>
        </div>
      </header>
      <RailBadge badge={state.badge} />
    </li>
  );
}

export function FindingsRail({ anchoredFindings, outsideFindings, anchoredComments, staleComments, reviews }: Props) {
  const total =
    anchoredFindings.length + outsideFindings.length + anchoredComments.length + staleComments.length + reviews.length;
  const counts = useMemo<Record<ForgeFindingSeverity, number>>(() => {
    const c: Record<ForgeFindingSeverity, number> = { BLOCKER: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const a of anchoredFindings) c[a.finding.severity]++;
    for (const f of outsideFindings) c[f.severity]++;
    return c;
  }, [anchoredFindings, outsideFindings]);
  const sortedAnchored = useMemo(() => [...anchoredFindings].sort(sortAnchored), [anchoredFindings]);
  const sortedOutside = useMemo(() => [...outsideFindings].sort(sortOutside), [outsideFindings]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (total === 0) {
    return (
      <section class="review-rail-findings">
        <header class="review-rail-section-header">
          <h2>Findings &amp; Comments</h2>
          <span class="review-rail-section-sub">none</span>
        </header>
        <p class="review-rail-empty">No Forge findings, comments, or reviews on this PR.</p>
      </section>
    );
  }

  const findingsTotal = sortedAnchored.length + sortedOutside.length;

  return (
    <section class="review-rail-findings">
      <header class="review-rail-section-header">
        <h2>Findings &amp; Comments</h2>
        <span class="review-rail-section-sub">{total}</span>
      </header>
      {findingsTotal > 0 ? (
        <ul class="review-rail-severity-counts">
          {SEV_ORDER.map((sev) => (
            <li key={sev} class={`severity-${sev.toLowerCase()}`}>
              <span class={`finding-severity sev-${sev.toLowerCase()}`}>{sev}</span>
              <span class="review-rail-count">{counts[sev]}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {sortedAnchored.length > 0 ? (
        <ul class="review-rail-list">
          {sortedAnchored.map(({ finding, diffPosition }) => (
            <FindingRailRow
              key={finding.id}
              finding={finding}
              expanded={expanded.has(finding.id)}
              onToggle={() => toggle(finding.id)}
              onJump={() => scrollToFinding(finding.file, diffPosition)}
            />
          ))}
        </ul>
      ) : null}

      {sortedOutside.length > 0 ? (
        <>
          <header class="review-rail-section-header sub">
            <h3>Findings outside the diff</h3>
            <span class="review-rail-section-sub">{sortedOutside.length}</span>
          </header>
          <ul class="review-rail-list outside">
            {sortedOutside.map((finding) => (
              <FindingRailRow
                key={finding.id}
                finding={finding}
                expanded={expanded.has(finding.id)}
                onToggle={() => toggle(finding.id)}
              />
            ))}
          </ul>
        </>
      ) : null}

      {anchoredComments.length > 0 ? (
        <>
          <header class="review-rail-section-header sub">
            <h3>Comments</h3>
            <span class="review-rail-section-sub">{anchoredComments.length}</span>
          </header>
          <ul class="review-rail-list comments">
            {anchoredComments.map(({ thread, diffPosition }) => (
              <CommentRailRow
                key={`c-${thread.root.id}`}
                thread={thread}
                onJump={() => scrollToFinding(thread.root.path, diffPosition)}
              />
            ))}
          </ul>
        </>
      ) : null}

      {staleComments.length > 0 ? (
        <>
          <header class="review-rail-section-header sub">
            <h3>Stale comments</h3>
            <span class="review-rail-section-sub">{staleComments.length}</span>
          </header>
          <p class="review-rail-hint">Their original lines were rewritten, so they can't be auto-fixed.</p>
          <ul class="review-rail-list comments stale">
            {staleComments.map((thread) => (
              <CommentRailRow key={`stale-${thread.root.id}`} thread={thread} />
            ))}
          </ul>
        </>
      ) : null}

      {reviews.length > 0 ? (
        <>
          <header class="review-rail-section-header sub">
            <h3>Review summaries</h3>
            <span class="review-rail-section-sub">{reviews.length}</span>
          </header>
          <ul class="review-rail-list reviews">
            {reviews.map((review) => (
              <ReviewRailRow key={`r-${review.id}`} review={review} />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
