import { useEffect, useMemo, useState } from "preact/hooks";
import { type DiffFile, type DiffRow, findRow, parseUnifiedDiff } from "../../lib/diff";
import { detectLang, ensureLang, onHighlighterReady, tokenizeRow } from "../../lib/highlight";
import { fileDomId, rowDomId } from "../../lib/review-scroll";
import type { ForgeFinding, InlinePrComment, PrReviewBundle } from "../../types";
import { CommentThread, type InlineThread } from "./CommentThread";

interface Props {
  bundle: PrReviewBundle;
  /**
   * Kept for source-compat with prior call sites; the three-pane review
   * surface routes findings to the right-rail FindingsRail and the
   * DiffPane only renders rows + inline reviewer comments.
   */
  findings?: ForgeFinding[];
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
  /** flat list with the resolved diffPosition stamped on each thread (rail use) */
  anchoredFlat: Array<{ thread: InlineThread; diffPosition: number }>;
  stale: InlineThread[];
} {
  const anchored = new Map<string, InlineThread[]>();
  const anchoredFlat: Array<{ thread: InlineThread; diffPosition: number }> = [];
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
    anchoredFlat.push({ thread: t, diffPosition: key.position });
  }
  return { anchored, anchoredFlat, stale };
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
): {
  anchored: Map<string, ForgeFinding[]>;
  /** flat list with the resolved diffPosition stamped on each entry */
  anchoredFlat: Array<{ finding: ForgeFinding; diffPosition: number }>;
  outside: ForgeFinding[];
} {
  const anchored = new Map<string, ForgeFinding[]>();
  const anchoredFlat: Array<{ finding: ForgeFinding; diffPosition: number }> = [];
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
    anchoredFlat.push({ finding: f, diffPosition: row.diffPosition });
  }
  return { anchored, anchoredFlat, outside };
}

function rowGutter(r: DiffRow): string {
  if (r.kind === "addition") return "+";
  if (r.kind === "deletion") return "−";
  return " ";
}

function RowContent({ row, lang }: { row: DiffRow; lang: ReturnType<typeof detectLang> }) {
  const tokens = lang ? tokenizeRow(row.content, lang) : null;
  if (!tokens) {
    return <span class="content">{row.content}</span>;
  }
  return (
    <span class="content">
      {tokens.map((t, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: tokens are stable per render
        <span key={i} style={t.color ? { color: t.color } : undefined}>
          {t.text}
        </span>
      ))}
    </span>
  );
}

function DiffFileCard({
  file,
  threadsByAnchor,
  highlightTick,
}: {
  file: DiffFile;
  threadsByAnchor: Map<string, InlineThread[]>;
  highlightTick: number;
}) {
  const lang = useMemo(() => detectLang(file.path), [file.path]);
  useEffect(() => {
    if (lang && !file.isBinary) ensureLang(lang);
  }, [lang, file.isBinary]);
  // Re-render on highlighter readiness so freshly-loaded grammars
  // light up in place.
  void highlightTick;
  return (
    <details class="review-file" id={fileDomId(file.path)} open>
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
                return (
                  <div key={`${hi}-${ri}`}>
                    <div
                      class={`review-row row-${r.kind}`}
                      data-position={r.diffPosition}
                      id={rowDomId(file.path, r.diffPosition)}
                    >
                      <span class="ln old">{r.oldLine ?? ""}</span>
                      <span class="ln new">{r.newLine ?? ""}</span>
                      <span class="gutter">{rowGutter(r)}</span>
                      <RowContent row={r} lang={lang} />
                    </div>
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

export function DiffPane({ bundle, findings: _findings }: Props) {
  const { diff, inlineComments } = bundle;
  const parsed = useMemo(() => parseUnifiedDiff(diff), [diff]);
  const threads = useMemo(() => groupIntoThreads(inlineComments), [inlineComments]);
  const { anchored } = useMemo(() => anchorThreads(threads, parsed), [threads, parsed]);

  // Tick that bumps every time a grammar finishes loading so rows
  // re-render with their now-available tokens.
  const [highlightTick, setHighlightTick] = useState(0);
  useEffect(() => {
    return onHighlighterReady(() => setHighlightTick((t) => t + 1));
  }, []);

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
        <DiffFileCard key={file.path} file={file} threadsByAnchor={anchored} highlightTick={highlightTick} />
      ))}
    </section>
  );
}

export { anchorFindings, anchorThreads, groupIntoThreads };
