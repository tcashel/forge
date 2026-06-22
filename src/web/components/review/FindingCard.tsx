// Inline finding card rendered as a per-line widget in the diff. This is the
// second view of a Forge finding (the first being FindingsRail); both key on
// the finding id and toggle the SAME selectedTargets token, so checking a
// finding here updates BatchBar's "Fix N selected" count and vice-versa.
import { type FixBadge, fixBadgeFor } from "../../lib/fix-badge";
import { targetKey } from "../../lib/review-targets";
import { commentStatuses, reviewBundle, selectedTargets, toggleTargetSelection } from "../../signals/review";
import type { ForgeFinding } from "../../types";

function badgeFor(token: string): FixBadge | null {
  const live = commentStatuses.value.get(token);
  const persisted = reviewBundle.value?.commentFixState?.[token];
  return fixBadgeFor(live, persisted);
}

export function FindingCard({ finding }: { finding: ForgeFinding }) {
  const token = targetKey("finding", finding.id);
  const badge = badgeFor(token);
  const fixing = badge?.className === "fixing";
  const fixed = badge?.className === "fixed";
  const disabled = fixing || fixed;
  const checked = selectedTargets.value.has(token) && !disabled;
  const sevClass = `sev-${finding.severity.toLowerCase()}`;
  return (
    <div class={`review-inline-finding severity-${finding.severity.toLowerCase()}`}>
      <header class="review-inline-finding-head">
        <label class="review-inline-finding-select">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={() => {
              if (!disabled) toggleTargetSelection(token);
            }}
          />
          <span class="sr-only">Select finding {finding.title}</span>
        </label>
        <span class={`finding-severity ${sevClass}`}>{finding.severity}</span>
        <span class="review-inline-finding-title">{finding.title}</span>
      </header>
      {badge ? (
        <div class={`review-inline-finding-badge badge-${badge.className}`}>
          <span class="badge-label">{badge.label}</span>
          {badge.reason ? <span class="badge-reason"> — {badge.reason}</span> : null}
          {badge.ghError ? <span class="badge-gh-error"> · {badge.ghError}</span> : null}
        </div>
      ) : null}
      <div class="review-inline-finding-body">
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
    </div>
  );
}
