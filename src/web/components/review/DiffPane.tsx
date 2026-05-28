import { useMemo } from "preact/hooks";
import { type DiffFile, type DiffRow, findRow, parseUnifiedDiff } from "../../lib/diff";
import type { ForgeFinding, InlinePrComment, PrReviewBundle } from "../../types";
import { CommentThread, type InlineThread } from "./CommentThread";

interface Props {
  bundle: PrReviewBundle;
}

interface AnchorKey {
  file: string;
  position: number;
}

function groupIntoThreads(comments: InlinePrComment[]): InlineThread[] {
  const byId = new Map<number, InlinePrComment>();
  for (const c of comments) byId.set(c.id, c);
  const roots = comments.filter((c) => c.inReplyToId == null);
  const repliesByRoot = new Map<number, InlinePrComment[]>();
  for (const c of comments) {
    if (c.inReplyToId == null) continue;
    // Walk up to the root in case of nested replies.
    let cursor: InlinePrComment | undefined = c;
    while (cursor && cursor.inReplyToId != null) {
      const parent = byId.get(cursor.inReplyToId);
      if (!parent || parent === cursor) break;
      cursor = parent;
    }
    if (!cursor) continue;
    const arr = repliesByRoot.get(cursor.id) ?? [];
    arr.push(c);
    repliesByRoot.set(cursor.id, arr);
  }
  return roots.map((root) => ({
    root,
    replies: (repliesByRoot.get(root.id) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }));
}

function anchorThreads(
  threads: InlineThread[],
  diff: DiffFile[],
): {
  anchored: Map<string, InlineThread[]>;
  stale: InlineThread[];
} {
  const anchored = new Map<string, InlineThread[]>();
  const stale: InlineThread[] = [];
  for (const t of threads) {
    const c = t.root;
    let key: AnchorKey | null = null;
    if (c.position != null) {
      const row = findRow(diff, c.path, { position: c.position });
      if (row) key = { file: c.path, position: row.diffPosition };
    }
    if (!key && c.line != null) {
      const row = findRow(diff, c.path, { newLine: c.line });
      if (row) key = { file: c.path, position: row.diffPosition };
    }
    if (!key) {
      stale.push(t);
      continue;
    }
    const k = `${key.file}@${key.position}`;
    const arr = anchored.get(k) ?? [];
    arr.push(t);
    anchored.set(k, arr);
  }
  return { anchored, stale };
}

/**
 * Anchor forge findings the same way we anchor comments: by newLine →
 * findRow → diffPosition. A finding without a line range or whose
 * lineStart doesn't resolve falls through to the "outside the diff"
 * section.
 */
function anchorFindings(
  findings: ForgeFinding[],
  diff: DiffFile[],
): { anchored: Map<string, ForgeFinding[]>; outside: ForgeFinding[] } {
  const anchored = new Map<string, ForgeFinding[]>();
  const outside: ForgeFinding[] = [];
  for (const f of findings) {
    if (!f.file || f.lineStart <= 0) {
      outside.push(f);
      continue;
    }
    const row = findRow(diff, f.file, { newLine: f.lineStart });
    if (!row) {
      outside.push(f);
      continue;
    }
    const key = `${f.file}@${row.diffPosition}`;
    const arr = anchored.get(key) ?? [];
    arr.push(f);
    anchored.set(key, arr);
  }
  return { anchored, outside };
}

function rowGutter(r: DiffRow): string {
  if (r.kind === "addition") return "+";
  if (r.kind === "deletion") return "−";
  return " ";
}

function FindingRow({ finding }: { finding: ForgeFinding }) {
  const range =
    finding.lineEnd > finding.lineStart ? `${finding.lineStart}-${finding.lineEnd}` : String(finding.lineStart);
  return (
    <div class={`review-finding inline severity-${finding.severity.toLowerCase()}`} data-source="forge">
      <header>
        <span class={`finding-severity sev-${finding.severity.toLowerCase()}`}>{finding.severity}</span>
        <span class="finding-source-badge">forge</span>
        <span class="finding-title">{finding.title}</span>
        <span class="finding-where">{`${finding.file}:${range}`}</span>
      </header>
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
  );
}

function DiffFileCard({
  file,
  threadsByAnchor,
  findingsByAnchor,
}: {
  file: DiffFile;
  threadsByAnchor: Map<string, InlineThread[]>;
  findingsByAnchor: Map<string, ForgeFinding[]>;
}) {
  return (
    <details class="review-file" open>
      <summary>
        <span class="path">{file.isRename && file.oldPath ? `${file.oldPath} → ${file.path}` : file.path}</span>
        <span class="counts">
          <span class="plus">+{file.additions}</span> <span class="minus">−{file.deletions}</span>
        </span>
      </summary>
      {file.isBinary ? (
        <p class="review-binary">Binary diff omitted.</p>
      ) : (
        <div class="review-hunks">
          {file.hunks.map((h, hi) => (
            <div class="review-hunk" key={`${file.path}-${hi}`}>
              <div class="review-hunk-header">{h.header}</div>
              {h.rows.map((r, ri) => {
                const key = `${file.path}@${r.diffPosition}`;
                const threads = threadsByAnchor.get(key);
                const findings = findingsByAnchor.get(key);
                return (
                  <div key={`${hi}-${ri}`}>
                    <div class={`review-row row-${r.kind}`} data-position={r.diffPosition}>
                      <span class="ln old">{r.oldLine ?? ""}</span>
                      <span class="ln new">{r.newLine ?? ""}</span>
                      <span class="gutter">{rowGutter(r)}</span>
                      <span class="content">{r.content}</span>
                    </div>
                    {findings ? findings.map((f) => <FindingRow key={`forge-${f.id}`} finding={f} />) : null}
                    {threads ? threads.map((t) => <CommentThread key={`thread-${t.root.id}`} thread={t} />) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </details>
  );
}

export function DiffPane({ bundle }: Props) {
  const { diff, inlineComments, forgeFindings } = bundle;
  const parsed = useMemo(() => parseUnifiedDiff(diff), [diff]);
  const threads = useMemo(() => groupIntoThreads(inlineComments), [inlineComments]);
  const { anchored } = useMemo(() => anchorThreads(threads, parsed), [threads, parsed]);
  const { anchored: findingsAnchored } = useMemo(
    () => anchorFindings(forgeFindings ?? [], parsed),
    [forgeFindings, parsed],
  );

  if (parsed.length === 0) {
    return (
      <section class="review-diff">
        <p class="review-empty-diff">No diff to display.</p>
      </section>
    );
  }

  return (
    <section class="review-diff">
      {parsed.map((file) => (
        <DiffFileCard key={file.path} file={file} threadsByAnchor={anchored} findingsByAnchor={findingsAnchored} />
      ))}
    </section>
  );
}

export { anchorFindings, anchorThreads, groupIntoThreads };
