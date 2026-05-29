// Tiny markdown renderer. Originally a direct port of legacy `markdown.js`
// (spec / critique recommendation rendering); extended to cover the GFM
// features human/bot PR comments commonly use — tables, blockquotes, and
// task-list checkboxes — so non-Forge comments render formatted instead of
// as raw markdown.
//
// Everything is HTML-escaped: output is injected via dangerouslySetInnerHTML,
// so we deliberately do NOT pass through inline HTML (e.g. the `<details>` /
// `<summary>` / tables some bots emit as raw HTML). Without a sanitizer
// dependency that would be an XSS vector; such markup stays escaped/literal.
import { escapeHTML } from "./format";

function inline(s: string): string {
  let out = escapeHTML(s);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

// Render a GFM-style task-list bullet (`- [ ]` / `- [x]`) as a disabled
// checkbox, falling back to null when the line isn't a task item.
function taskListItem(text: string): string | null {
  const m = text.match(/^\[([ xX])\]\s+(.*)$/);
  if (!m) return null;
  const checked = m[1].toLowerCase() === "x" ? " checked" : "";
  return `<li class="task-list-item"><input type="checkbox" disabled${checked}> ${inline(m[2])}</li>`;
}

// Split a GFM table row on unescaped pipes, trimming the leading/trailing
// border pipes GitHub-flavoured tables use.
function splitRow(row: string): string[] {
  return row
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

const TABLE_DIVIDER = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;

export function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inUL = false;
  let inOL = false;
  let inCode = false;
  let codeBuf: string[] = [];
  const flush = () => {
    if (inUL) {
      out.push("</ul>");
      inUL = false;
    }
    if (inOL) {
      out.push("</ol>");
      inOL = false;
    }
  };
  // Index-based loop so block constructs that span multiple lines (tables,
  // blockquotes) can consume their own range.
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (inCode) {
      if (/^```/.test(ln)) {
        out.push(`<pre><code>${escapeHTML(codeBuf.join("\n"))}</code></pre>`);
        inCode = false;
        codeBuf = [];
      } else {
        codeBuf.push(ln);
      }
      continue;
    }
    if (/^```\s*(\w+)?/.test(ln)) {
      flush();
      inCode = true;
      continue;
    }
    if (/^#\s+/.test(ln)) {
      flush();
      out.push(`<h1>${inline(ln.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }
    if (/^##\s+/.test(ln)) {
      flush();
      out.push(`<h2>${inline(ln.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^###\s+/.test(ln)) {
      flush();
      out.push(`<h3>${inline(ln.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    // GFM table: a row of `| … |` immediately followed by a `|---|` divider.
    if (ln.includes("|") && i + 1 < lines.length && TABLE_DIVIDER.test(lines[i + 1])) {
      flush();
      const header = splitRow(ln);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].includes("|") && lines[j].trim() !== "") {
        rows.push(splitRow(lines[j]));
        j++;
      }
      const head = header.map((c) => `<th>${inline(c)}</th>`).join("");
      const body = rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("");
      out.push(`<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
      i = j - 1;
      continue;
    }
    // Blockquote: consume consecutive `>`-prefixed lines.
    if (/^\s*>/.test(ln)) {
      flush();
      const quoted: string[] = [];
      let j = i;
      while (j < lines.length && /^\s*>/.test(lines[j])) {
        quoted.push(lines[j].replace(/^\s*>\s?/, ""));
        j++;
      }
      out.push(`<blockquote>${quoted.map((q) => `<p>${inline(q)}</p>`).join("")}</blockquote>`);
      i = j - 1;
      continue;
    }
    const ulm = ln.match(/^\s*[-*]\s+(.+)/);
    if (ulm) {
      if (!inUL) {
        flush();
        out.push("<ul>");
        inUL = true;
      }
      out.push(taskListItem(ulm[1]) ?? `<li>${inline(ulm[1])}</li>`);
      continue;
    }
    const olm = ln.match(/^\s*\d+\.\s+(.+)/);
    if (olm) {
      if (!inOL) {
        flush();
        out.push("<ol>");
        inOL = true;
      }
      out.push(`<li>${inline(olm[1])}</li>`);
      continue;
    }
    if (/^---+$/.test(ln)) {
      flush();
      out.push("<hr>");
      continue;
    }
    if (ln.trim() === "") {
      flush();
      continue;
    }
    flush();
    out.push(`<p>${inline(ln)}</p>`);
  }
  if (inCode) out.push(`<pre><code>${escapeHTML(codeBuf.join("\n"))}</code></pre>`);
  flush();
  return out.join("\n");
}
