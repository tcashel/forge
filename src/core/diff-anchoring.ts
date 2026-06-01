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

interface ParsedFile {
  path: string;
  oldPath: string | null;
  /** Set of RIGHT-side line numbers present as added or context rows. */
  rightLines: Set<number>;
}

/**
 * Minimal unified-diff parse that records, per file, the set of RIGHT-side
 * (new-file) line numbers covered by added or context rows. Deleted rows
 * don't exist on the RIGHT side and so are excluded — a finding anchored only
 * to a deleted line routes out-of-diff.
 */
function parseRightSideLines(diff: string): ParsedFile[] {
  if (!diff) return [];
  const lines = diff.split(/\r?\n/);
  const files: ParsedFile[] = [];
  let current: ParsedFile | null = null;
  let newLine = 0;
  let inHunk = false;

  const finalize = () => {
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
      };
      inHunk = false;
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
      newLine = Number(header[1]);
      inHunk = true;
      continue;
    }
    if (!inHunk) continue;
    if (ln.startsWith("\\")) continue; // "\ No newline at end of file"
    const marker = ln.charAt(0);
    if (marker === "+") {
      current.rightLines.add(newLine);
      newLine += 1;
    } else if (marker === "-") {
      // deletion — no RIGHT-side line
    } else if (marker === " " || marker === "") {
      current.rightLines.add(newLine);
      newLine += 1;
    }
  }
  finalize();
  return files;
}

/**
 * Split findings into `inDiff` (anchorable as inline review comments) and
 * `outOfDiff` (review-body bullets). A finding anchors only when its end line
 * lands on a RIGHT-side row of the file it names; a multi-line range also
 * carries `startLine` when its start line lands on a RIGHT-side row too.
 */
export function partitionFindingsByDiff(findings: ForgeFinding[], diff: string): PartitionResult {
  const files = parseRightSideLines(diff);
  const byPath = new Map<string, Set<number>>();
  for (const f of files) {
    byPath.set(f.path, f.rightLines);
    if (f.oldPath) byPath.set(f.oldPath, f.rightLines);
  }

  const inDiff: AnchoredFinding[] = [];
  const outOfDiff: ForgeFinding[] = [];

  for (const finding of findings) {
    const rightLines = finding.file ? byPath.get(finding.file) : undefined;
    const end = finding.lineEnd > 0 ? finding.lineEnd : finding.lineStart;
    if (!rightLines || end <= 0 || !rightLines.has(end)) {
      outOfDiff.push(finding);
      continue;
    }
    const anchored: AnchoredFinding = { finding, line: end, side: "RIGHT" };
    if (finding.lineStart > 0 && finding.lineStart < end && rightLines.has(finding.lineStart)) {
      anchored.startLine = finding.lineStart;
    }
    inDiff.push(anchored);
  }

  return { inDiff, outOfDiff };
}
