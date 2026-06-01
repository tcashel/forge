/**
 * Partition Forge findings into those that anchor onto the PR diff (eligible
 * for inline review comments) and those that don't (must route to the review
 * body as bullets — GitHub 422s on inline comments off the diff hunks).
 *
 * This is the line/side anchoring the line-based reviews API needs, distinct
 * from the legacy `diffPosition` anchoring in `src/web/lib/diff.ts`. It is a
 * pure core module — it must NOT import from `src/web/` — so both the publish
 * worker and tests can use it without pulling in the Preact diff component.
 */

import type { ForgeFinding } from "./reviewer.ts";

export interface AnchoredFinding {
  finding: ForgeFinding;
  /**
   * The diff's NEW (post-rename, RIGHT-side) path for the file. This is what
   * the GitHub inline-comment payload must use — a RIGHT-side anchor on a
   * renamed file's OLD path 422s the whole batched review. Equal to
   * `finding.file` for non-renamed files.
   */
  path: string;
  /** RIGHT-side line the comment anchors to (the end of the range). */
  line: number;
  side: "RIGHT";
  /** First line of a multi-line range, when distinct from `line`. */
  startLine?: number;
}

export interface PartitionResult {
  inDiff: AnchoredFinding[];
  outOfDiff: ForgeFinding[];
}

const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

function stripPrefix(p: string): string {
  if (p.startsWith("a/") || p.startsWith("b/")) return p.slice(2);
  return p;
}

/** Half-open-free [start, end] inclusive RIGHT-side line span of one hunk. */
interface HunkRange {
  start: number;
  end: number;
}

interface ParsedFile {
  path: string;
  oldPath: string | null;
  /** Set of RIGHT-side line numbers present as added or context rows. */
  rightLines: Set<number>;
  /**
   * GitHub `position` values present in this file's diff. `position` is the
   * 1-based count of lines following the file's first `@@` header (later `@@`s
   * count too) — the same semantics `src/web/lib/diff.ts` uses to anchor review
   * comments. Used to mirror the UI's "does this comment still anchor" check.
   */
  positions: Set<number>;
  /**
   * Inclusive RIGHT-side line spans for each hunk in this file, in diff order.
   * A multi-line review anchor is only valid when both ends fall in the same
   * span — GitHub rejects a start_line/line pair that crosses hunks.
   */
  hunks: HunkRange[];
}

/**
 * Minimal unified-diff parse that records, per file, the set of RIGHT-side
 * (new-file) line numbers covered by added or context rows, plus the inclusive
 * RIGHT-side line span of each hunk. Deleted rows don't exist on the RIGHT side
 * and so are excluded — a finding anchored only to a deleted line routes
 * out-of-diff.
 */
function parseRightSideLines(diff: string): ParsedFile[] {
  if (!diff) return [];
  const lines = diff.split(/\r?\n/);
  const files: ParsedFile[] = [];
  let current: ParsedFile | null = null;
  let newLine = 0;
  let inHunk = false;
  let currentHunk: HunkRange | null = null;
  // GitHub `position` counter, mirroring src/web/lib/diff.ts: 0 on the first
  // hunk header of a file, +1 on each later hunk header, +1 on each content row
  // (additions, deletions, and context — but not `\ No newline` markers).
  let position = 0;
  let positionStarted = false;

  // A hunk's RIGHT-side span only counts rows that actually exist on the RIGHT
  // side (added/context). Close out the open hunk before starting a new one or
  // a new file, dropping empty (deletion-only) hunks.
  const closeHunk = () => {
    if (current && currentHunk && currentHunk.end >= currentHunk.start) {
      current.hunks.push(currentHunk);
    }
    currentHunk = null;
  };

  const finalize = () => {
    closeHunk();
    if (current) files.push(current);
  };

  for (const ln of lines) {
    if (ln.startsWith("diff --git ")) {
      finalize();
      const parts = ln.slice("diff --git ".length).split(" ");
      const oldPath = parts.length >= 1 ? stripPrefix(parts[0]) : null;
      const newPath = parts.length >= 2 ? stripPrefix(parts[1]) : oldPath;
      current = {
        path: newPath ?? "",
        oldPath: oldPath && oldPath !== newPath ? oldPath : null,
        rightLines: new Set(),
        positions: new Set(),
        hunks: [],
      };
      inHunk = false;
      position = 0;
      positionStarted = false;
      continue;
    }
    if (!current) continue;
    if (ln.startsWith("--- ")) {
      const p = ln.slice(4).trim();
      current.oldPath = p === "/dev/null" ? null : stripPrefix(p);
      continue;
    }
    if (ln.startsWith("+++ ")) {
      const p = ln.slice(4).trim();
      if (p !== "/dev/null") current.path = stripPrefix(p);
      continue;
    }
    const header = ln.match(HUNK_HEADER);
    if (header) {
      closeHunk();
      newLine = Number(header[1]);
      inHunk = true;
      // Position: 0 on the first `@@` of the file, +1 on each later one.
      if (!positionStarted) {
        positionStarted = true;
        position = 0;
      } else {
        position += 1;
      }
      // Seed an empty span; the first RIGHT-side row sets its real start.
      currentHunk = { start: Number.POSITIVE_INFINITY, end: -1 };
      continue;
    }
    if (!inHunk || !positionStarted) continue;
    if (ln.startsWith("\\")) continue; // "\ No newline at end of file"
    const marker = ln.charAt(0);
    // A genuine context row always carries a leading space — even a blank line
    // is `" "` in a unified diff. A truly empty string is the artifact left by
    // `diff.split(/\r?\n/)` on the trailing newline from `gh pr diff`; counting
    // it would invent a phantom RIGHT-side line past the last hunk, so skip it.
    if (marker === "+" || marker === " ") {
      position += 1;
      current.positions.add(position);
      // Added or context row — present on the RIGHT side.
      current.rightLines.add(newLine);
      if (currentHunk) {
        if (newLine < currentHunk.start) currentHunk.start = newLine;
        if (newLine > currentHunk.end) currentHunk.end = newLine;
      }
      newLine += 1;
    } else if (marker === "-") {
      // deletion — counts for `position` but has no RIGHT-side line.
      position += 1;
      current.positions.add(position);
    }
  }
  finalize();
  return files;
}

/** The hunk containing `line` on the RIGHT side, or null if none does. */
function hunkContaining(hunks: HunkRange[], line: number): HunkRange | null {
  for (const h of hunks) {
    if (line >= h.start && line <= h.end) return h;
  }
  return null;
}

/** A published inline comment's current anchor coordinates on the PR diff. */
export interface CommentAnchor {
  path: string;
  position: number | null;
  line: number | null;
}

/**
 * Whether an existing inline review comment still anchors onto the current PR
 * diff — the server-side mirror of the Review UI's staleness check in
 * `src/web/components/review/DiffPane.tsx` (`anchorThreads`): a comment anchors
 * when its `position` resolves to a row in the named file, or failing that when
 * its `line` lands on a RIGHT-side (addition/context) row. A comment that
 * resolves to neither is "stale" and renders with a disabled checkbox, so the
 * bundle route must keep the underlying Forge finding selectable elsewhere.
 *
 * The file is matched by new OR old path so renamed files still resolve.
 */
export function commentAnchorsToDiff(diff: string, anchor: CommentAnchor): boolean {
  if (!anchor.path) return false;
  const files = parseRightSideLines(diff);
  const file = files.find((f) => f.path === anchor.path || f.oldPath === anchor.path);
  if (!file) return false;
  if (anchor.position != null && file.positions.has(anchor.position)) return true;
  if (anchor.line != null && file.rightLines.has(anchor.line)) return true;
  return false;
}

/**
 * Split findings into `inDiff` (anchorable as inline review comments) and
 * `outOfDiff` (review-body bullets).
 *
 * A finding anchors only when its end line lands on a RIGHT-side row of the
 * file it names; otherwise it routes out-of-diff (GitHub 422s on inline
 * comments off the diff hunks).
 *
 * A multi-line range carries `startLine` only when its start and end lines fall
 * in the SAME hunk — GitHub requires a `start_line`/`line` pair to be anchorable
 * within one hunk, and an invalid pair fails the entire batched review POST
 * (which would block every other inline finding from publishing). When the
 * range spans hunks (or its start isn't on a RIGHT-side row), we fall back to a
 * single-line anchor at `end` — still valid and less lossy than dropping the
 * finding out-of-diff.
 */
export function partitionFindingsByDiff(findings: ForgeFinding[], diff: string): PartitionResult {
  const files = parseRightSideLines(diff);
  const byPath = new Map<string, ParsedFile>();
  for (const f of files) {
    byPath.set(f.path, f);
    if (f.oldPath) byPath.set(f.oldPath, f);
  }

  const inDiff: AnchoredFinding[] = [];
  const outOfDiff: ForgeFinding[] = [];

  for (const finding of findings) {
    const parsed = finding.file ? byPath.get(finding.file) : undefined;
    const end = finding.lineEnd > 0 ? finding.lineEnd : finding.lineStart;
    // The end line must exist on the RIGHT side to anchor an inline comment.
    if (!parsed || end <= 0 || !parsed.rightLines.has(end)) {
      outOfDiff.push(finding);
      continue;
    }
    // Anchor on the diff's NEW path, not finding.file: a finding may name the
    // pre-rename (old) path, but the RIGHT-side comment must use the new one.
    const anchored: AnchoredFinding = { finding, path: parsed.path, line: end, side: "RIGHT" };
    // Multi-line range: carry startLine only when start and end share a hunk.
    if (finding.lineStart > 0 && finding.lineStart < end) {
      const endHunk = hunkContaining(parsed.hunks, end);
      const startHunk = hunkContaining(parsed.hunks, finding.lineStart);
      if (startHunk && endHunk && startHunk === endHunk) {
        anchored.startLine = finding.lineStart;
      }
      // else: cross-hunk or start not on a RIGHT-side row → single-line anchor.
    }
    inDiff.push(anchored);
  }

  return { inDiff, outOfDiff };
}
