// Shared markdown rendering for Workbench surfaces. Markdown arrives from
// agents, GitHub comments, and local spec files — GitHub bodies routinely
// embed HTML (<details>, <sub> badges, <img>), which rendered as escaped
// noise when raw HTML was disabled outright. Raw HTML is now allowed through
// markdown-it but every rendered string is passed through a DOM-based
// allowlist sanitizer before injection (scripts/iframes dropped, unknown
// tags unwrapped, event handlers and non-http(s) URLs stripped). In
// non-browser contexts (tests) there is no DOMParser, so we fall back to the
// old escape-everything renderer rather than ever emitting unsanitized HTML.
import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";

function makeRenderer(html: boolean): MarkdownIt {
  const md = new MarkdownIt({
    html,
    linkify: true,
    typographer: true,
    breaks: false,
  })
    .enable(["table", "strikethrough"])
    .use(taskLists, { enabled: false, label: false, labelAfter: false });

  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) => {
      return self.renderToken(tokens, idx, options);
    });

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet("href") ?? "";
    if (/^(https?:)?\/\//i.test(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return md;
}

const mdEscaped = makeRenderer(false);
const mdRaw = makeRenderer(true);

// ─── HTML sanitizer (allowlist) ──────────────────────────────────────────────

// Dangerous containers removed wholesale, content included.
const DROP_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "svg",
  "math",
  "template",
  "noscript",
]);

// Everything else not in this set is unwrapped: the tag goes, its children stay.
const ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "caption",
  "code",
  "dd",
  "del",
  "details",
  "div",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "input",
  "ins",
  "kbd",
  "li",
  "mark",
  "ol",
  "p",
  "picture",
  "pre",
  "q",
  "s",
  "samp",
  "small",
  "span",
  "strike",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const GLOBAL_ATTRS = new Set(["class", "align"]);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  input: new Set(["type", "checked", "disabled"]),
  details: new Set(["open"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
};
const URL_ATTRS = new Set(["href", "src"]);

function isSafeUrl(value: string): boolean {
  try {
    const u = new URL(value, "https://github.com/");
    return u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:";
  } catch {
    return false;
  }
}

/** Allowlist-sanitize an HTML string. Browser-only (needs DOMParser). */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Static snapshot: unwrapped elements' children are already in the list,
  // so they still get visited; nodes detached by DROP just no-op later.
  for (const el of Array.from(doc.body.querySelectorAll("*"))) {
    const tag = el.tagName.toLowerCase();
    if (DROP_TAGS.has(tag)) {
      el.remove();
      continue;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      el.replaceWith(...Array.from(el.childNodes));
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || !(GLOBAL_ATTRS.has(name) || TAG_ATTRS[tag]?.has(name))) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (URL_ATTRS.has(name) && !isSafeUrl(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }
    // Embedded-HTML links bypass the markdown-it link_open rule — pin the
    // same new-tab + opener hygiene here.
    if (tag === "a" && el.getAttribute("href")) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
    // Checkboxes from raw HTML stay inert like task-list ones.
    if (tag === "input") {
      if ((el.getAttribute("type") || "").toLowerCase() !== "checkbox") {
        el.remove();
        continue;
      }
      el.setAttribute("disabled", "");
    }
  }
  return doc.body.innerHTML;
}

export function renderMarkdown(markdown: string): string {
  if (typeof DOMParser === "undefined") {
    return mdEscaped.render(markdown || "");
  }
  return sanitizeHtml(mdRaw.render(markdown || ""));
}
