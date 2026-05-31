import mermaid from "mermaid";
import { useEffect, useMemo, useRef } from "preact/hooks";
import { codeToHtml } from "shiki";
import { renderMarkdown } from "../lib/markdown";

interface MarkdownViewerProps {
  markdown: string;
  class?: string;
}

const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  py: "python",
};

let mermaidConfigured = false;

function currentShikiTheme(): string {
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "light" ? "github-light" : "github-dark";
}

function currentMermaidTheme(): "default" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "light" ? "default" : "dark";
}

function languageFromClass(className: string): string {
  const m = className.match(/(?:^|\s)language-([^\s]+)/);
  return (m?.[1] ?? "").toLowerCase();
}

async function enhanceMarkdown(root: HTMLElement, isCancelled: () => boolean): Promise<void> {
  const codeBlocks = Array.from(root.querySelectorAll("pre > code"));
  const mermaidNodes: HTMLElement[] = [];

  for (const code of codeBlocks) {
    const pre = code.parentElement;
    if (!pre) continue;
    const source = code.textContent ?? "";
    const rawLang = languageFromClass(code.className);
    const lang = LANG_ALIASES[rawLang] ?? rawLang;

    if (lang === "mermaid") {
      const node = document.createElement("div");
      node.className = "mermaid markdown-mermaid";
      node.textContent = source;
      pre.replaceWith(node);
      mermaidNodes.push(node);
      continue;
    }

    if (!lang) continue;
    try {
      const highlighted = await codeToHtml(source, { lang, theme: currentShikiTheme() });
      if (isCancelled()) return;
      pre.outerHTML = highlighted;
    } catch {
      pre.classList.add("markdown-code-unhighlighted");
    }
  }

  if (mermaidNodes.length === 0 || isCancelled()) return;
  try {
    if (!mermaidConfigured) {
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: currentMermaidTheme() });
      mermaidConfigured = true;
    }
    await mermaid.run({ nodes: mermaidNodes });
  } catch {
    for (const node of mermaidNodes) node.classList.add("markdown-mermaid-error");
  }
}

export function MarkdownViewer(props: MarkdownViewerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const html = useMemo(() => renderMarkdown(props.markdown), [props.markdown]);

  useEffect(() => {
    let cancelled = false;
    const root = rootRef.current;
    if (root) void enhanceMarkdown(root, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={rootRef}
      class={`markdown-viewer ${props.class ?? ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
