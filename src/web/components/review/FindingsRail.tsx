import { useMemo, useState } from "preact/hooks";
import { scrollToFinding } from "../../lib/review-scroll";
import type { ForgeFinding, ForgeFindingSeverity } from "../../types";

interface AnchoredFinding {
  finding: ForgeFinding;
  diffPosition: number;
}

interface Props {
  anchored: AnchoredFinding[];
  outside: ForgeFinding[];
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

interface RowProps {
  finding: ForgeFinding;
  onClick?: () => void;
  expanded: boolean;
  onToggle: () => void;
}

function FindingRailRow({ finding, onClick, expanded, onToggle }: RowProps) {
  const sevClass = `sev-${finding.severity.toLowerCase()}`;
  const interactive = !!onClick;
  return (
    <li class={`review-rail-finding severity-${finding.severity.toLowerCase()}`}>
      <header>
        <button
          type="button"
          class="review-rail-finding-summary"
          onClick={() => {
            onToggle();
            if (onClick) onClick();
          }}
          title={interactive ? "Jump to this finding in the diff" : finding.title}
        >
          <span class={`finding-severity ${sevClass}`}>{finding.severity}</span>
          <span class="review-rail-finding-title">{finding.title}</span>
          <span class="review-rail-finding-where">
            {finding.file}
            {findingRange(finding)}
          </span>
        </button>
      </header>
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

export function FindingsRail({ anchored, outside }: Props) {
  const total = anchored.length + outside.length;
  const counts = useMemo<Record<ForgeFindingSeverity, number>>(() => {
    const c: Record<ForgeFindingSeverity, number> = { BLOCKER: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const a of anchored) c[a.finding.severity]++;
    for (const f of outside) c[f.severity]++;
    return c;
  }, [anchored, outside]);
  const sortedAnchored = useMemo(() => [...anchored].sort(sortAnchored), [anchored]);
  const sortedOutside = useMemo(() => [...outside].sort(sortOutside), [outside]);
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
          <h2>Findings</h2>
          <span class="review-rail-section-sub">none</span>
        </header>
        <p class="review-rail-empty">No Forge findings on this run.</p>
      </section>
    );
  }

  return (
    <section class="review-rail-findings">
      <header class="review-rail-section-header">
        <h2>Findings</h2>
        <span class="review-rail-section-sub">{total}</span>
      </header>
      <ul class="review-rail-severity-counts">
        {SEV_ORDER.map((sev) => (
          <li key={sev} class={`severity-${sev.toLowerCase()}`}>
            <span class={`finding-severity sev-${sev.toLowerCase()}`}>{sev}</span>
            <span class="review-rail-count">{counts[sev]}</span>
          </li>
        ))}
      </ul>
      {sortedAnchored.length > 0 ? (
        <ul class="review-rail-list">
          {sortedAnchored.map(({ finding, diffPosition }) => (
            <FindingRailRow
              key={finding.id}
              finding={finding}
              expanded={expanded.has(finding.id)}
              onToggle={() => toggle(finding.id)}
              onClick={() => scrollToFinding(finding.file, diffPosition)}
            />
          ))}
        </ul>
      ) : null}
      {sortedOutside.length > 0 ? (
        <>
          <header class="review-rail-section-header sub">
            <h3>Outside the diff</h3>
            <span class="review-rail-section-sub">{sortedOutside.length}</span>
          </header>
          <p class="review-rail-hint">
            Reviewer surfaced these against files not in the unified diff (or with no resolvable line range).
          </p>
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
    </section>
  );
}
