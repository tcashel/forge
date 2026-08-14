// Drives a whole envelope through the App's own `ingest` and `render`, so a
// test asserts the DISPATCH and not just the view it should reach.
//
//   node render_dispatch.mjs <path/to/overview.html>   # envelope on stdin
//
// `render_resolution.mjs` lifts `viewResolution` and calls it directly. That
// proves the chooser draws, and proves nothing about whether a resolution
// payload ever gets there: `render`'s `if (data.resolution)` branch could be
// deleted and those tests would stay green. This harness enters where the
// host enters — one envelope into `ingest` — and reports what came out.
//
// stdout is one JSON object:
//   view      every rendered node under #view that carries text, in document
//             order, with its class, plus `picks` for a clickable card
//   ident     the identity line's text
//   chips     the chip labels rendered beside it
//   rail      the attention rail's items, each `{label, detail}` — the rail
//             lives outside #view, and a payload whose whole point is what
//             needs a human is not observable without it
//   tabsHidden / controlsHidden   what the resolution branch asserts
//   args      `state.args` after ingest, which is what Refresh would send
//   error     `state.error`, so an unknown schema is observable too
//
// Same contract as the sibling harnesses: no package.json, no dependency, no
// build step.

import { readFileSync } from "node:fs";

const asset = process.argv[2];
if (!asset) throw new Error("usage: render_dispatch.mjs <overview.html>");
const lines = readFileSync(asset, "utf8").split("\n");

/**
 * Lift one top-level declaration out of the asset's IIFE.
 *
 * Everything inside that IIFE sits at two-space indent, so a declaration runs
 * to the first later line that is exactly its closer. Reformatting the asset
 * breaks this loudly instead of silently rendering stale code.
 */
function lift(name) {
  const heads = [`  function ${name}(`, `  const ${name} = `];
  const start = lines.findIndex((line) => heads.some((head) => line.startsWith(head)));
  if (start < 0) throw new Error(`overview.html no longer declares ${name}`);
  if (lines[start].endsWith(";")) return lines[start];
  const closer = lines[start].startsWith("  function") ? "  }" : "  };";
  const end = lines.findIndex((line, i) => i > start && line === closer);
  if (end < 0) throw new Error(`overview.html: no closer for ${name}`);
  return lines.slice(start, end + 1).join("\n");
}

function element(tag) {
  const node = {
    tag,
    className: "",
    textContent: undefined,
    hidden: false,
    kids: [],
    style: {},
    handler: null,
    append(...kids) {
      for (const kid of kids) {
        kid.parent = node;
        node.kids.push(kid);
      }
    },
    remove() {
      const kids = node.parent?.kids;
      if (kids) kids.splice(kids.indexOf(node), 1);
    },
    // The refusal branch styles `box.body.firstChild` directly.
    get firstChild() {
      return node.kids[0] ?? null;
    },
    addEventListener(event, fn) {
      if (event === "click") node.handler = fn;
    },
    // The resolution branch clears prior chips with this before appending
    // its own; a shim that ignored the selector would hide a stale chip.
    querySelectorAll(selector) {
      const want = selector.split(",").map((s) => s.trim().replace(/^\./, ""));
      const hits = [];
      const walk = (current) => {
        for (const kid of current.kids) {
          if (want.some((cls) => kid.className.split(/\s+/).includes(cls))) hits.push(kid);
          walk(kid);
        }
      };
      walk(node);
      return hits;
    },
  };
  node.classList = {
    add(name) {
      node.className = `${node.className} ${name}`.trim();
    },
    remove(name) {
      node.className = node.className.split(/\s+/).filter((c) => c && c !== name).join(" ");
    },
    toggle(name, on) {
      if (on) node.classList.add(name);
      else node.classList.remove(name);
    },
    contains(name) {
      return node.className.split(/\s+/).includes(name);
    },
  };
  // `textContent = ""` is how the asset empties a container.
  return new Proxy(node, {
    set(target, key, value) {
      if (key === "textContent" && value === "") target.kids.length = 0;
      target[key] = value;
      return true;
    },
  });
}

const registry = new Map();
const document = {
  createElement: element,
  createTextNode: (text) => {
    const node = element("#text");
    node.textContent = text;
    return node;
  },
  getElementById(id) {
    if (!registry.has(id)) registry.set(id, element("div"));
    return registry.get(id);
  },
};

const source = [
  "el", "arr", "at", "num", "int", "chip", "panel", "pickGrid", "choose", "upToPortfolio",
  "viewResolution", "viewPortfolio", "drawRail", "portfolioRail", "render", "subjectParams",
  "ingest",
]
  .map(lift)
  .join("\n");
// `state` and `nodes` are lifted too — they are the objects the dispatch
// writes through, and substituting our own would test the substitute.
const host = {
  connected: true,
  capabilities: { serverTools: process.env.SERVER_TOOLS !== "0" },
};
const { ingest, state, nodes } = new Function(
  "document",
  "setTimeout",
  "reportSize",
  "refresh",
  "packetRows",
  "headline",
  "host",
  `${lift("state")}\n${lift("nodes")}\n${source}\nreturn { ingest, state, nodes };`,
)(document, () => {}, () => {}, () => {}, () => [], () => ({}), host);

let stdin = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) stdin += chunk;
ingest(JSON.parse(stdin));

// Firing a card's click to record what it would ask for WRITES `state.args`,
// which is also one of the things being reported. Snapshot it before the
// walk and restore it after, or the report shows whichever candidate was
// clicked last instead of what ingest left behind.
const ingested = state.args;
const report = (root) => {
  const out = [];
  const walk = (node) => {
    if (node.textContent !== undefined && node.textContent !== null && node.textContent !== "") {
      out.push({ class: node.className, text: String(node.textContent) });
    }
    if (node.handler) {
      state.args = null;
      node.handler();
      out.push({
        class: node.className,
        text: "",
        picks: state.args,
        // JSON.stringify drops an `undefined` value but Object.keys does
        // not: `{run: undefined}` must not masquerade as the portfolio's
        // genuinely empty params object in this harness.
        paramKeys: Object.keys(state.args?.params || {}),
      });
    }
    for (const kid of node.kids) walk(kid);
  };
  walk(root);
  return out;
};
// Navigation lives under the identity strip, outside #view. Report it
// separately so its click contract is exercised without changing `view`'s
// card-only `picks` contract.
const subident = report(nodes.subident);
const view = report(nodes.view);
state.args = ingested;

process.stdout.write(
  JSON.stringify({
    view,
    subident,
    text: view.map((n) => n.text).filter(Boolean).join("\n"),
    ident: nodes.identText.textContent ?? "",
    chips: nodes.ident.kids.filter((k) => k.className.includes("chip")).map((k) => k.textContent),
    rail: nodes.rail.kids.map((item) => ({
      label: String(item.kids[0]?.textContent ?? ""),
      detail: String(item.kids[1]?.textContent ?? ""),
    })),
    tabsHidden: nodes.tabs.hidden,
    controlsHidden: nodes.controls.hidden,
    args: state.args,
    error: state.error,
  }),
);
