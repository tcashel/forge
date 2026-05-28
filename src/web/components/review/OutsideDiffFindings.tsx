import type { ForgeFinding, ForgeFindingSeverity } from "../../types";

interface Props {
  findings: ForgeFinding[];
}

const SEVERITY_ORDER: Record<ForgeFindingSeverity, number> = {
  BLOCKER: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function compareFindings(a: ForgeFinding, b: ForgeFinding): number {
  const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  if (sev !== 0) return sev;
  const file = a.file.localeCompare(b.file);
  if (file !== 0) return file;
  return a.lineStart - b.lineStart;
}

export function OutsideDiffFindings({ findings }: Props) {
  if (findings.length === 0) return null;
  const sorted = [...findings].sort(compareFindings);
  return (
    <section class="review-outside-diff">
      <h2>Findings outside this diff</h2>
      <p class="hint">
        Forge reviewer surfaced these against files not in the unified diff (or with a missing line range).
      </p>
      <ul class="review-outside-diff-list">
        {sorted.map((f) => (
          <li key={f.id} class={`review-finding outside severity-${f.severity.toLowerCase()}`}>
            <header>
              <span class={`finding-severity sev-${f.severity.toLowerCase()}`}>{f.severity}</span>
              <span class="finding-title">{f.title}</span>
              <span class="finding-where">
                {f.file}
                {f.lineStart > 0 ? `:${f.lineStart}${f.lineEnd > f.lineStart ? `-${f.lineEnd}` : ""}` : ""}
              </span>
            </header>
            {f.evidence ? <pre class="finding-evidence">{f.evidence}</pre> : null}
            {f.why ? (
              <p class="finding-why">
                <strong>Why:</strong> {f.why}
              </p>
            ) : null}
            {f.fix ? (
              <p class="finding-fix">
                <strong>Fix:</strong> {f.fix}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
