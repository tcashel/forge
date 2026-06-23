// Unified-diff parser for the PR review page.
//
// Output shape is tuned for anchoring GitHub review comments: each content
// row carries the `diffPosition` semantics GitHub uses for the `position`
// field on pull-request review comments — 1-based count of the lines that
// follow the file's first `@@` header (subsequent hunk headers count too).

export type DiffRowKind = "context" | "addition" | "deletion";

export interface DiffRow {
  kind: DiffRowKind;
  oldLine: number | null;
  newLine: number | null;
  content: string;
  diffPosition: number;
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  rows: DiffRow[];
}

export interface DiffFile {
  path: string;
  oldPath: string | null;
  isRename: boolean;
  isBinary: boolean;
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
}

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

function parseHunkHeader(line: string): {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
} | null {
  const m = line.match(HUNK_HEADER);
  if (!m) return null;
  return {
    oldStart: Number(m[1]),
    oldCount: m[2] === undefined ? 1 : Number(m[2]),
    newStart: Number(m[3]),
    newCount: m[4] === undefined ? 1 : Number(m[4]),
  };
}

function stripPrefix(p: string): string {
  if (p.startsWith("a/") || p.startsWith("b/")) return p.slice(2);
  return p;
}

function newFile(path: string, oldPath: string | null): DiffFile {
  return {
    path,
    oldPath: oldPath && oldPath !== path ? oldPath : null,
    isRename: oldPath !== null && oldPath !== path,
    isBinary: false,
    hunks: [],
    additions: 0,
    deletions: 0,
  };
}

export function parseUnifiedDiff(text: string): DiffFile[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const files: DiffFile[] = [];

  let current: DiffFile | null = null;
  let currentHunk: DiffHunk | null = null;
  let oldLine = 0;
  let newLine = 0;
  let position = 0;
  let positionStarted = false;
  // `diff --git` headers come before we know if it's a rename; stash the
  // declared paths and apply them once we see ---/+++ or rename markers.
  let pendingOld: string | null = null;
  let pendingNew: string | null = null;

  const finalize = () => {
    if (current) files.push(current);
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    if (ln.startsWith("diff --git ")) {
      finalize();
      current = null;
      currentHunk = null;
      positionStarted = false;
      position = 0;
      // diff --git a/<old> b/<new>
      const parts = ln.slice("diff --git ".length).split(" ");
      pendingOld = parts.length >= 1 ? stripPrefix(parts[0]) : null;
      pendingNew = parts.length >= 2 ? stripPrefix(parts[1]) : null;
      current = newFile(pendingNew ?? pendingOld ?? "", pendingOld);
      continue;
    }

    if (!current) continue;

    if (ln.startsWith("rename from ")) {
      current.oldPath = ln.slice("rename from ".length);
      current.isRename = true;
      continue;
    }
    if (ln.startsWith("rename to ")) {
      current.path = ln.slice("rename to ".length);
      current.isRename = true;
      continue;
    }
    if (ln.startsWith("Binary files ") || ln.startsWith("GIT binary patch")) {
      current.isBinary = true;
      continue;
    }
    if (ln.startsWith("--- ")) {
      const p = ln.slice(4).trim();
      if (p !== "/dev/null") current.oldPath = stripPrefix(p);
      else current.oldPath = null;
      continue;
    }
    if (ln.startsWith("+++ ")) {
      const p = ln.slice(4).trim();
      if (p !== "/dev/null") current.path = stripPrefix(p);
      continue;
    }

    const header = parseHunkHeader(ln);
    if (header) {
      currentHunk = {
        header: ln,
        oldStart: header.oldStart,
        oldCount: header.oldCount,
        newStart: header.newStart,
        newCount: header.newCount,
        rows: [],
      };
      current.hunks.push(currentHunk);
      oldLine = header.oldStart;
      newLine = header.newStart;
      // First `@@` of the file establishes position 0; later `@@`s still
      // advance position so positions stay monotonic across hunks.
      if (!positionStarted) {
        positionStarted = true;
        position = 0;
      } else {
        position += 1;
      }
      continue;
    }

    if (!currentHunk || !positionStarted) continue;
    // "\ No newline at end of file" does not advance position.
    if (ln.startsWith("\\")) continue;

    position += 1;
    const marker = ln.charAt(0);
    const content = ln.slice(1);
    if (marker === "+") {
      currentHunk.rows.push({
        kind: "addition",
        oldLine: null,
        newLine,
        content,
        diffPosition: position,
      });
      current.additions += 1;
      newLine += 1;
    } else if (marker === "-") {
      currentHunk.rows.push({
        kind: "deletion",
        oldLine,
        newLine: null,
        content,
        diffPosition: position,
      });
      current.deletions += 1;
      oldLine += 1;
    } else if (marker === " " || marker === "") {
      currentHunk.rows.push({
        kind: "context",
        oldLine,
        newLine,
        content,
        diffPosition: position,
      });
      oldLine += 1;
      newLine += 1;
    }
  }
  finalize();
  return files;
}

/**
 * Split a multi-file unified diff into per-file raw segments, each starting
 * at its `diff --git` header. The segments align 1:1 (same order) with
 * `parseUnifiedDiff`'s output, and each is a well-formed single-file diff
 * suitable for feeding to `@git-diff-view`'s `data.hunks`.
 */
export function splitDiffSegments(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const segments: string[] = [];
  let buf: string[] | null = null;
  for (const ln of lines) {
    if (ln.startsWith("diff --git ")) {
      if (buf) segments.push(buf.join("\n"));
      buf = [ln];
    } else if (buf) {
      buf.push(ln);
    }
  }
  if (buf) segments.push(buf.join("\n"));
  return segments;
}

export interface FindRowOpts {
  newLine?: number | null;
  position?: number | null;
}

export function findRow(diff: DiffFile[], filePath: string, opts: FindRowOpts): DiffRow | null {
  const file = diff.find((f) => f.path === filePath || f.oldPath === filePath);
  if (!file) return null;
  for (const h of file.hunks) {
    for (const r of h.rows) {
      if (opts.position != null && r.diffPosition === opts.position) return r;
    }
  }
  if (opts.newLine != null) {
    for (const h of file.hunks) {
      for (const r of h.rows) {
        if (r.newLine === opts.newLine && (r.kind === "addition" || r.kind === "context")) return r;
      }
    }
  }
  return null;
}
