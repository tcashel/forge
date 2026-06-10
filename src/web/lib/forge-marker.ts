// Web-side mirror of the marker contract in src/core/forge-comment-marker.ts.
// Comment bodies arrive with the hidden `<!-- forge-finding ... -->` marker
// still embedded; rendered markdown hides HTML comments, but plain-text
// snippets (the findings rail) would show it verbatim without this strip.
const MARKER_GLOBAL_RE = /<!--\s*forge-finding\s+id=[0-9a-f]+\s+sev=[A-Z]+\s+v=\d+\s*-->/g;

export function stripFindingMarker(body: string): string {
  return (body || "").replace(MARKER_GLOBAL_RE, "");
}
