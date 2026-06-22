import { DiffModeEnum, DiffView } from "@git-diff-view/react";
import type { FunctionComponent } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { type DiffFile, type DiffRow, findRow, parseUnifiedDiff, splitDiffSegments } from "../../lib/diff";
import {
  detectLang,
  ensureLang,
  getDiffHighlighter,
  isLangLoaded,
  onHighlighterReady,
  shikiLangId,
} from "../../lib/highlight";
import { fileDomId, rowDomId } from "../../lib/review-scroll";
import { expandedFiles, setFileExpanded, toggleViewedFile, viewedFiles } from "../../signals/review";
import { theme } from "../../signals/theme";
import type { ForgeFinding, InlinePrComment, PrReviewBundle } from "../../types";
import { CommentThread, type InlineThread } from "./CommentThread";
import { FindingCard } from "./FindingCard";

interface Props {
  bundle: PrReviewBundle;
  /** Findings to render inline as per-line widgets (also shown in FindingsRail). */
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

// ─── @git-diff-view glue ─────────────────────────────────────────────────────

// The library is React-typed; we run it under preact/compat. Narrow the
// props we actually use to keep the call site type-safe without dragging in
// the library's React-flavoured generics.
type ExtendPayload = {
  file: string;
  diffPosition: number;
  threads: InlineThread[];
  findings: ForgeFinding[];
};
interface DiffViewProps {
  data: { oldFile?: object; newFile?: object; hunks: string[] };
  diffViewMode: number;
  diffViewTheme: "light" | "dark";
  diffViewHighlight: boolean;
  diffViewWrap: boolean;
  registerHighlighter: unknown;
  extendData?: { oldFile?: Record<number, { data: ExtendPayload }>; newFile?: Record<number, { data: ExtendPayload }> };
  renderExtendLine?: (args: { data?: ExtendPayload }) => preact.ComponentChildren;
}
const DiffViewTyped = DiffView as unknown as FunctionComponent<DiffViewProps>;

/**
 * Which split-mode column a row's widget belongs in. In split mode the
 * library renders the extend line into a side-specific cell (old → left,
 * new → right), so the side here decides where the comment/finding shows.
 *
 * Deletions live on the old (left) side, additions on the new (right). A
 * context line exists on both sides: findings annotate the new-side code, so
 * they stay right, but a comment left explicitly on the OLD side belongs in
 * the left column — otherwise a left-side thread renders under the
 * right-hand line. A context row that mixes a finding (or a right-side
 * comment) with a left-side comment stays on the new side so the row keeps a
 * single widget — and therefore a single `rowDomId` (the rail/nav jump
 * anchor); splitting it would mint a duplicate id for one diffPosition.
 */
function extendSide(r: DiffRow, threads: InlineThread[], findings: ForgeFinding[]): "old" | "new" {
  if (r.kind === "deletion") return "old";
  if (r.kind === "addition") return "new";
  if (findings.length === 0 && threads.length > 0 && threads.every((t) => t.root.side === "LEFT")) {
    return "old";
  }
  return "new";
}

/**
 * Build the library's per-line `extendData` for a file from the anchored
 * comment/finding maps. The payload carries `diffPosition` so the widget can
 * stamp the row DOM id that the rail/nav jump to; `extendSide` picks the
 * split-mode column (see its doc).
 *
 * Always returns the maps (even empty) — never `undefined`. The library's
 * prop-sync only calls `setExtendData` when the prop is truthy, so omitting
 * it leaves the previous widgets in the store. Switching the displayed
 * findings (run selection) on a still-mounted DiffView can drop a file to
 * zero entries; an empty map clears the stale keys, an `undefined` would
 * strand them on screen.
 */
function buildExtendData(
  file: DiffFile,
  threadsByAnchor: Map<string, InlineThread[]>,
  findingsByAnchor: Map<string, ForgeFinding[]>,
): DiffViewProps["extendData"] {
  const oldFile: Record<number, { data: ExtendPayload }> = {};
  const newFile: Record<number, { data: ExtendPayload }> = {};
  for (const h of file.hunks) {
    for (const r of h.rows) {
      const key = `${file.path}@${r.diffPosition}`;
      const threads = threadsByAnchor.get(key) ?? [];
      const findings = findingsByAnchor.get(key) ?? [];
      if (threads.length === 0 && findings.length === 0) continue;
      const side = extendSide(r, threads, findings);
      const lineNumber = side === "old" ? r.oldLine : r.newLine;
      if (lineNumber == null) continue;
      const payload: ExtendPayload = { file: file.path, diffPosition: r.diffPosition, threads, findings };
      (side === "old" ? oldFile : newFile)[lineNumber] = { data: payload };
    }
  }
  return { oldFile, newFile };
}

function ExtendWidget({ payload }: { payload: ExtendPayload }) {
  return (
    <div class="review-extend" id={rowDomId(payload.file, payload.diffPosition)}>
      {payload.findings.map((f) => (
        <FindingCard key={`f-${f.id}`} finding={f} />
      ))}
      {payload.threads.map((t) => (
        <CommentThread key={`t-${t.root.id}`} thread={t} />
      ))}
    </div>
  );
}

function filePathLabel(file: DiffFile): string {
  return file.isRename && file.oldPath ? `${file.oldPath} → ${file.path}` : file.path;
}

function DiffFileCard({
  file,
  rawSegment,
  mode,
  threadsByAnchor,
  findingsByAnchor,
}: {
  file: DiffFile;
  rawSegment: string;
  mode: "unified" | "split";
  threadsByAnchor: Map<string, InlineThread[]>;
  findingsByAnchor: Map<string, ForgeFinding[]>;
}) {
  const lang = useMemo(() => detectLang(file.path), [file.path]);
  const langId = lang ? shikiLangId(lang) : undefined;
  useEffect(() => {
    if (lang && !file.isBinary) ensureLang(lang);
  }, [lang, file.isBinary]);
  // Re-mount the DiffView once this file's grammar arrives so the library
  // re-runs syntax with the now-loaded grammar (see `key` below).
  const [loaded, setLoaded] = useState(() => (lang ? isLangLoaded(lang) : false));
  useEffect(() => {
    if (!lang || loaded) return;
    if (isLangLoaded(lang)) {
      setLoaded(true);
      return;
    }
    return onHighlighterReady(() => {
      if (isLangLoaded(lang)) setLoaded(true);
    });
  }, [lang, loaded]);

  const themeMode: "light" | "dark" = theme.value === "dark" ? "dark" : "light";
  const viewed = viewedFiles.value.has(file.path);
  const collapsed = viewed && !expandedFiles.value.has(file.path);

  const extendData = useMemo(
    () => (file.isBinary ? undefined : buildExtendData(file, threadsByAnchor, findingsByAnchor)),
    [file, threadsByAnchor, findingsByAnchor],
  );

  const data = useMemo(
    () => ({
      oldFile: { fileName: file.oldPath ?? file.path, fileLang: langId },
      newFile: { fileName: file.path, fileLang: langId },
      hunks: [rawSegment],
    }),
    [file.oldPath, file.path, langId, rawSegment],
  );

  const renderExtendLine = useCallback(
    ({ data: payload }: { data?: ExtendPayload }) => (payload ? <ExtendWidget payload={payload} /> : null),
    [],
  );

  return (
    <section class="review-file" id={fileDomId(file.path)} data-viewed={viewed ? "1" : undefined}>
      <header class="review-file-header">
        <button
          type="button"
          class="review-file-toggle"
          onClick={() => setFileExpanded(file.path, collapsed)}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand file" : "Collapse file"}
        >
          <span class={`review-file-caret ${collapsed ? "collapsed" : ""}`} aria-hidden="true">
            ▾
          </span>
          <span class="path">{filePathLabel(file)}</span>
        </button>
        <span class="counts">
          <span class="plus">+{file.additions}</span> <span class="minus">−{file.deletions}</span>
        </span>
        {file.isBinary ? null : (
          <label class="review-file-viewed" title="Mark this file viewed">
            <input type="checkbox" checked={viewed} onChange={() => toggleViewedFile(file.path)} />
            <span>Viewed</span>
          </label>
        )}
      </header>
      {file.isBinary ? (
        <p class="review-binary">Binary diff omitted.</p>
      ) : collapsed ? null : (
        <div class="review-file-diff">
          <DiffViewTyped
            key={`${file.path}::${mode}::${themeMode}::${loaded}`}
            data={data}
            diffViewMode={mode === "split" ? DiffModeEnum.Split : DiffModeEnum.Unified}
            diffViewTheme={themeMode}
            diffViewHighlight
            diffViewWrap={false}
            registerHighlighter={getDiffHighlighter()}
            extendData={extendData}
            renderExtendLine={renderExtendLine}
          />
        </div>
      )}
    </section>
  );
}

export function DiffPane({ bundle, findings }: Props) {
  const { diff, inlineComments } = bundle;
  const parsed = useMemo(() => parseUnifiedDiff(diff), [diff]);
  const segments = useMemo(() => splitDiffSegments(diff), [diff]);
  const threads = useMemo(() => groupIntoThreads(inlineComments), [inlineComments]);
  const { anchored: threadsByAnchor } = useMemo(() => anchorThreads(threads, parsed), [threads, parsed]);
  const { anchored: findingsByAnchor } = useMemo(() => anchorFindings(findings ?? [], parsed), [findings, parsed]);
  const [mode, setMode] = useState<"unified" | "split">("unified");

  if (parsed.length === 0) {
    return (
      <section class="review-diff">
        <p class="review-empty-diff">No diff to display.</p>
      </section>
    );
  }

  return (
    <section class="review-diff">
      <div class="review-diff-toolbar">
        <div class="review-diff-mode" role="toolbar" aria-label="Diff view mode">
          <button
            type="button"
            class={`review-diff-mode-btn ${mode === "unified" ? "active" : ""}`}
            aria-pressed={mode === "unified"}
            onClick={() => setMode("unified")}
          >
            Unified
          </button>
          <button
            type="button"
            class={`review-diff-mode-btn ${mode === "split" ? "active" : ""}`}
            aria-pressed={mode === "split"}
            onClick={() => setMode("split")}
          >
            Split
          </button>
        </div>
      </div>
      {parsed.map((file, i) => (
        <DiffFileCard
          key={file.path}
          file={file}
          rawSegment={segments[i] ?? ""}
          mode={mode}
          threadsByAnchor={threadsByAnchor}
          findingsByAnchor={findingsByAnchor}
        />
      ))}
    </section>
  );
}

export { anchorFindings, anchorThreads, groupIntoThreads };
