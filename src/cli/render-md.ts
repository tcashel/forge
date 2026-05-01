/**
 * Minimal markdown → ANSI renderer for `forge spec show` in a TTY.
 *
 * Deliberately small: handles the subset of markdown that forge specs use
 * (headers, fenced code, inline code, bullets, blockquotes, bold, links,
 * YAML frontmatter). No external deps — uses the existing TUI theme.
 *
 * Non-TTY callers (`--raw`, piped, `--json`) bypass this entirely.
 */
import type { Theme } from "../tui/theme.ts";

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

function renderInline(line: string, theme: Theme): string {
  // Inline code: `text` → accent-coloured.
  let out = line.replace(/`([^`]+)`/g, (_m, code) => theme.fg("accent", code));
  // Bold: **text** → bold.
  out = out.replace(/\*\*([^*]+)\*\*/g, (_m, text) => theme.bold(text));
  // Markdown links: [text](url) → text (url-dim).
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => `${text} ${theme.fg("dim", `(${url})`)}`);
  return out;
}

function renderBody(body: string, theme: Theme): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      out.push(theme.fg("dim", line));
      continue;
    }
    if (inFence) {
      out.push(theme.fg("dim", line));
      continue;
    }

    const h1 = line.match(/^# (.+)$/);
    if (h1) {
      out.push(theme.bold(theme.fg("accent", h1[1])));
      continue;
    }
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      out.push(theme.bold(h2[1]));
      continue;
    }
    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      out.push(theme.fg("accent", h3[1]));
      continue;
    }

    const bullet = line.match(/^(\s*)[-*] (.+)$/);
    if (bullet) {
      out.push(`${bullet[1]}${theme.fg("accent", "•")} ${renderInline(bullet[2], theme)}`);
      continue;
    }

    if (line.startsWith("> ")) {
      out.push(theme.fg("dim", line));
      continue;
    }

    out.push(renderInline(line, theme));
  }

  return out.join("\n");
}

export function renderMarkdown(src: string, theme: Theme): string {
  const fmMatch = src.match(FRONTMATTER_RE);
  if (!fmMatch) {
    return renderBody(src, theme);
  }
  const fmBlock = fmMatch[0].replace(/\n$/, "");
  const dimmedFm = fmBlock
    .split("\n")
    .map((l) => theme.fg("dim", l))
    .join("\n");
  const body = src.slice(fmMatch[0].length);
  return `${dimmedFm}\n${renderBody(body, theme)}`;
}
