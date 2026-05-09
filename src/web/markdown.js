import { escapeHTML } from "./dom.js";

function escapeMarkdown(s) {
  return escapeHTML(s);
}

export function renderMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inUL = false;
  let inOL = false;
  let inCode = false;
  let codeBuf = [];
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
  for (const ln of lines) {
    if (inCode) {
      if (/^```/.test(ln)) {
        out.push(`<pre><code>${escapeMarkdown(codeBuf.join("\n"))}</code></pre>`);
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
    const ulm = ln.match(/^\s*[-*]\s+(.+)/);
    if (ulm) {
      if (!inUL) {
        flush();
        out.push("<ul>");
        inUL = true;
      }
      out.push(`<li>${inline(ulm[1])}</li>`);
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
  if (inCode) out.push(`<pre><code>${escapeMarkdown(codeBuf.join("\n"))}</code></pre>`);
  flush();
  return out.join("\n");

  function inline(s) {
    let out = escapeHTML(s);
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return out;
  }
}
