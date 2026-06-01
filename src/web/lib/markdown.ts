// Shared markdown rendering for Workbench surfaces. This deliberately keeps
// raw HTML disabled; rendered output is injected into the DOM, and Forge
// surfaces markdown from agents, GitHub comments, and local spec files.
import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";

const md = new MarkdownIt({
  html: false,
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

export function renderMarkdown(markdown: string): string {
  return md.render(markdown || "");
}
