/**
 * Visible-width helpers that account for ANSI escape sequences.
 *
 * No emoji / wide-char awareness — Forge's TUI doesn't render any.
 * If that changes, switch to Bun.stringWidth / npm "string-width".
 */

// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape regex requires the literal control char.
const ANSI_RE = /\x1b\[[0-9;]*m/g;

export function visibleWidth(s: string): number {
  return s.replace(ANSI_RE, "").length;
}

export function truncateToWidth(s: string, width: number): string {
  if (visibleWidth(s) <= width) return s;
  let visible = 0;
  let result = "";
  let i = 0;
  while (i < s.length && visible < width) {
    if (s.charCodeAt(i) === 0x1b && s[i + 1] === "[") {
      const end = s.indexOf("m", i);
      if (end === -1) break;
      result += s.slice(i, end + 1);
      i = end + 1;
    } else {
      result += s[i];
      visible += 1;
      i += 1;
    }
  }
  // Reset any open SGR state at the truncation boundary.
  if (s.includes("\x1b[")) result += "\x1b[0m";
  return result;
}
