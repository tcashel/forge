/**
 * Stable marker contract for Forge findings published as GitHub review
 * comments.
 *
 * Every comment Forge posts for a finding embeds a hidden HTML-comment
 * marker:
 *
 *     <!-- forge-finding id=<id> sev=<SEVERITY> v=1 -->
 *
 * The marker is the store of record for reconciliation — re-running a review
 * parses markers off the PR's existing comments + review bodies to know which
 * findings are already published, so publishing stays idempotent without a
 * local mapping table. The `id` is `ForgeFinding.id` (SHA1 of
 * `file|lineStart|title`); `sev` is the severity; `v` is the marker schema
 * version for forward compatibility.
 */

import type { ForgeFinding, ForgeFindingSeverity } from "./reviewer.ts";

const VALID_SEVERITIES: ReadonlySet<string> = new Set(["BLOCKER", "HIGH", "MEDIUM", "LOW"]);
const MARKER_VERSION = 1;

// Single-match (first marker) and global (all markers) variants. The global
// form is used to collect every published id from a multi-finding review body.
const MARKER_RE = /<!--\s*forge-finding\s+id=([0-9a-f]+)\s+sev=([A-Z]+)\s+v=(\d+)\s*-->/;
const MARKER_GLOBAL_RE = /<!--\s*forge-finding\s+id=([0-9a-f]+)\s+sev=([A-Z]+)\s+v=(\d+)\s*-->/g;

/** Render the hidden marker line for a finding. */
export function buildFindingMarker(id: string, severity: ForgeFindingSeverity): string {
  return `<!-- forge-finding id=${id} sev=${severity} v=${MARKER_VERSION} -->`;
}

/**
 * Extract a fenced ```suggestion block from free-text fix prose. Returns the
 * block verbatim (fences included) when one exists, else null. We never
 * synthesize a suggestion from prose — GitHub's suggested-change UI needs an
 * exact replacement, and guessing one would corrupt the diff.
 */
function extractSuggestionBlock(fix: string): string | null {
  if (!fix) return null;
  const lines = fix.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/^\s{0,3}```suggestion\s*$/.test(lines[i])) {
      const buf = [lines[i].trimStart()];
      for (let j = i + 1; j < lines.length; j++) {
        if (/^\s{0,3}```\s*$/.test(lines[j])) {
          buf.push("```");
          return buf.join("\n");
        }
        buf.push(lines[j]);
      }
      return null; // unterminated fence — fall back to prose
    }
  }
  return null;
}

/**
 * Build the human-readable comment body for a finding, followed by the hidden
 * marker line. When `finding.fix` already contains a fenced ```suggestion
 * block it is passed through verbatim so GitHub renders an applyable
 * suggestion; otherwise the fix is rendered as prose.
 */
export function buildFindingCommentBody(finding: ForgeFinding): string {
  const parts: string[] = [`**[${finding.severity}] ${finding.title}**`];

  if (finding.why?.trim()) {
    parts.push("", `**Why:** ${finding.why.trim()}`);
  }

  const suggestion = extractSuggestionBlock(finding.fix);
  if (suggestion) {
    parts.push("", "**Fix:**", "", suggestion);
  } else if (finding.fix?.trim()) {
    parts.push("", `**Fix:** ${finding.fix.trim()}`);
  }

  parts.push("", buildFindingMarker(finding.id, finding.severity));
  return parts.join("\n");
}

/**
 * Parse the first forge-finding marker out of a comment/review body. Returns
 * null when there is no marker or its severity is unrecognised.
 */
export function parseFindingMarker(body: string): { id: string; severity: ForgeFindingSeverity } | null {
  if (!body) return null;
  const m = body.match(MARKER_RE);
  if (!m) return null;
  const severity = m[2];
  if (!VALID_SEVERITIES.has(severity)) return null;
  return { id: m[1], severity: severity as ForgeFindingSeverity };
}

/** Collect every forge-finding id in a body (review bodies carry many). */
export function extractFindingIds(body: string): string[] {
  if (!body) return [];
  const ids: string[] = [];
  for (const m of body.matchAll(MARKER_GLOBAL_RE)) ids.push(m[1]);
  return ids;
}
