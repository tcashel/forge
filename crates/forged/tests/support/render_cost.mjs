// Renders the App's Cost tab out of `crates/forged/assets/overview.html`
// itself, so a test can assert on what an operator reads rather than on a
// Rust re-implementation of the same arithmetic.
//
//   node render_cost.mjs <path/to/overview.html>   # projection JSON on stdin
//
// stdout is one JSON object: `nodes` (every rendered node that carries text,
// in document order, with its class) and `text` (those texts joined by
// newlines).
//
// This is a harness, not a toolchain: no package.json, no dependency, no
// build step. It lifts the Cost tab and the four helpers it calls out of the
// asset's single IIFE — which exports nothing — and runs them against a DOM
// shim that records what was appended.

import { readFileSync } from "node:fs";

const asset = process.argv[2];
if (!asset) throw new Error("usage: render_cost.mjs <overview.html>");
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
  if (lines[start].endsWith(";")) return lines[start];
  const closer = lines[start].startsWith("  function") ? "  }" : "  };";
  const end = lines.findIndex((line, i) => i > start && line === closer);
  if (end < 0) throw new Error(`overview.html: no closer for ${name}`);
  return lines.slice(start, end + 1).join("\n");
}

// Enough DOM for the Cost tab: elements that remember their class, their
// text, and the order they were appended in.
const document = {
  createElement(tag) {
    const node = {
      tag,
      className: "",
      textContent: undefined,
      kids: [],
      style: {},
      append(...kids) {
        node.kids.push(...kids);
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

const source = ["el", "arr", "num", "panel", "seatOf", "viewCost"].map(lift).join("\n");
const { viewCost } = new Function("document", `${source}\nreturn { viewCost };`)(document);

let stdin = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) stdin += chunk;
const data = JSON.parse(stdin);

// The App passes no packet rows for an epic (`data.kind === "epic" ? [] :
// packetRows(data)`) — the case the hoisted rows have to carry on their own.
// The spend header never reads that argument, so the harness always passes
// the epic's empty list; only the by-seat labels differ.
const nodes = [];
const walk = (node) => {
  if (node.textContent !== undefined && node.textContent !== null && node.textContent !== "") {
    nodes.push({ class: node.className, text: String(node.textContent) });
  }
  for (const kid of node.kids) walk(kid);
};
for (const panel of viewCost(data, [])) walk(panel);

process.stdout.write(JSON.stringify({ nodes, text: nodes.map((n) => n.text).join("\n") }));
