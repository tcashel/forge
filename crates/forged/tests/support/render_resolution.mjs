// Renders the App's candidate chooser out of
// `crates/forged/assets/overview.html` itself, so a test can assert that an
// unresolvable id degrades into a menu rather than into "a payload this view
// does not know how to draw".
//
//   node render_resolution.mjs <path/to/overview.html>   # resolution on stdin
//
// stdout is one JSON object: `nodes` (every rendered node that carries text,
// in document order, with its class and its chosen args when it is pickable)
// and `text` (those texts joined by newlines).
//
// Same harness contract as render_cost.mjs: no package.json, no dependency,
// no build step. It lifts `viewResolution` and the helpers it calls out of
// the asset's single IIFE — which exports nothing — and runs them against a
// DOM shim that records what was appended and what a click would ask for.

import { readFileSync } from "node:fs";

const asset = process.argv[2];
if (!asset) throw new Error("usage: render_resolution.mjs <overview.html>");
const lines = readFileSync(asset, "utf8").split("\n");

/**
 * Lift one top-level declaration out of the asset's IIFE.
 *
 * Everything inside that IIFE sits at two-space indent, so a declaration
 * runs to the first later line that is exactly its closer. Reformatting the
 * asset breaks this loudly instead of silently rendering stale code.
 */
function lift(name) {
  const heads = [`  function ${name}(`, `  const ${name} = `];
  const start = lines.findIndex((line) => heads.some((head) => line.startsWith(head)));
  if (start < 0) throw new Error(`overview.html no longer declares ${name}`);
  if (lines[start].endsWith(";") || (lines[start].startsWith("  function") && lines[start].endsWith(" }"))) return lines[start];
  const closer = lines[start].startsWith("  function") ? "  }" : "  };";
  const end = lines.findIndex((line, i) => i > start && line === closer);
  if (end < 0) throw new Error(`overview.html: no closer for ${name}`);
  return lines.slice(start, end + 1).join("\n");
}

// Enough DOM for the chooser: elements that remember their class, their
// text, the order they were appended in, and their click handler.
const document = {
  createElement(tag) {
    const node = {
      tag,
      className: "",
      textContent: undefined,
      kids: [],
      style: {},
      handler: null,
      append(...kids) {
        node.kids.push(...kids);
      },
      addEventListener(event, fn) {
        if (event === "click") node.handler = fn;
      },
    };
    node.classList = {
      add(name) {
        node.className = `${node.className} ${name}`.trim();
      },
    };
    return node;
  },
};

// `choose` is the asset's own: picking a candidate must set `state.args` to
// the explicit param the candidate's kind implies. `refresh` is stubbed —
// the harness has no host to call.
const state = { args: null };
const refresh = () => {};
// The chooser reads the host's capabilities: a host that does not proxy
// `tools/call` gets cards it cannot open. Default to a capable host; set
// SERVER_TOOLS=0 to render the other one.
const host = {
  connected: true,
  capabilities: { serverTools: process.env.SERVER_TOOLS !== "0" },
};
const source = [
  "el", "arr", "num", "int", "DECISION_CONDITIONS", "SYMPTOM_CONDITIONS", "stamp", "ms", "ago",
  "ageTone", "ageNode", "conditionRows", "semanticState", "semanticLabel", "spendText", "chip", "panel",
  "pickGrid", "choose", "viewResolution",
]
  .map(lift)
  .join("\n");
const { viewResolution, choose } = new Function(
  "document",
  "state",
  "refresh",
  "host",
  `${source}\nreturn { viewResolution, choose };`,
)(document, state, refresh, host);

let stdin = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) stdin += chunk;
const resolution = JSON.parse(stdin);

const nodes = [];
const walk = (node) => {
  if (node.textContent !== undefined && node.textContent !== null && node.textContent !== "") {
    const entry = { class: node.className, text: String(node.textContent) };
    nodes.push(entry);
  }
  // A pickable card carries no text of its own; record what its click asks
  // for against the id it renders, which is its first texted descendant.
  if (node.handler) {
    state.args = null;
    node.handler();
    nodes.push({ class: node.className, text: "", picks: state.args });
  }
  for (const kid of node.kids) walk(kid);
};
for (const panel of viewResolution(resolution)) walk(panel);

process.stdout.write(
  JSON.stringify({ nodes, text: nodes.map((n) => n.text).filter(Boolean).join("\n") }),
);
