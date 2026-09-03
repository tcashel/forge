// Renders the epic Waves tab out of `crates/forged/assets/overview.html`
// itself. The child rows have a distinct wire shape (`runState`,
// `terminalOutcome`, and object-valued `merged` evidence), so exercising the
// shared semantic helper through this view prevents portfolio-shaped fixtures
// from masking drift in the epic projection.

import { readFileSync } from "node:fs";

const asset = process.argv[2];
if (!asset) throw new Error("usage: render_waves.mjs <overview.html>");
const lines = readFileSync(asset, "utf8").split("\n");

function lift(name) {
  const heads = [`  function ${name}(`, `  const ${name} = `];
  const start = lines.findIndex((line) => heads.some((head) => line.startsWith(head)));
  if (start < 0) throw new Error(`overview.html no longer declares ${name}`);
  if (lines[start].endsWith(";") || (lines[start].startsWith("  function") && lines[start].endsWith(" }"))) return lines[start];
  const closer = lines[start].startsWith("  function") ? "  }" : "  };";
  const end = lines.findIndex((line, index) => index > start && line === closer);
  if (end < 0) throw new Error(`overview.html: no closer for ${name}`);
  return lines.slice(start, end + 1).join("\n");
}

const document = {
  createElement(tag) {
    const node = {
      tag,
      className: "",
      textContent: undefined,
      kids: [],
      append(...kids) { node.kids.push(...kids); },
    };
    node.classList = {
      add(name) { node.className = `${node.className} ${name}`.trim(); },
    };
    return node;
  },
};

const source = [
  "el", "arr", "at", "DECISION_CONDITIONS", "SYMPTOM_CONDITIONS",
  "attentionRows", "subjectOf", "conditionRows", "semanticState", "semanticLabel", "chip", "panel", "viewWaves",
]
  .map(lift)
  .join("\n");
const { viewWaves } = new Function(
  "document",
  "host",
  "Node",
  `${source}\nreturn { viewWaves };`,
)(document, { capabilities: {} }, Object);

let stdin = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) stdin += chunk;
const data = JSON.parse(stdin);

const descendants = (root) => {
  const values = [];
  const walk = (node) => {
    if (node.textContent !== undefined && node.textContent !== null && node.textContent !== "") {
      values.push(String(node.textContent));
    }
    for (const kid of node.kids) walk(kid);
  };
  walk(root);
  return values;
};
const cards = [];
for (const root of viewWaves(data)) {
  const walk = (node) => {
    if (node.className.split(/\s+/).includes("work-card")) {
      cards.push({ class: node.className, text: descendants(node) });
    }
    for (const kid of node.kids) walk(kid);
  };
  walk(root);
}

process.stdout.write(JSON.stringify({ cards }));
