// Execute one split MCP App exactly as a host would: complete the handshake,
// deliver a tool result, mutate host context, observe size notifications, and
// tear the resource down. The shim is intentionally dependency-free so this
// remains a hermetic repository test rather than a browser-stack test.

import { readFileSync } from "node:fs";

const asset = process.argv[2];
if (!asset) throw new Error("usage: split_app_host.mjs <split-app.html>");
const operations = asset.endsWith("operations-overview.html");
const html = readFileSync(asset, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error(`${asset} has no inline script`);

let innerHTMLWrites = 0;
function element(tag) {
  const listeners = new Map();
  const node = {
    tag,
    className: "",
    textContent: undefined,
    title: "",
    hidden: false,
    disabled: false,
    kids: [],
    style: {
      values: {},
      setProperty(key, value) { this.values[key] = value; },
    },
    append(...kids) { node.kids.push(...kids); },
    replaceChildren(...kids) { node.kids = [...kids]; },
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
  };
  Object.defineProperty(node, "innerHTML", {
    get() { return ""; },
    set(_) { innerHTMLWrites += 1; },
  });
  return node;
}

const registry = new Map();
const documentElement = element("html");
documentElement.scrollHeight = 480;
const document = {
  documentElement,
  body: element("body"),
  createElement: element,
  getElementById(id) {
    if (!registry.has(id)) registry.set(id, element(id === "refresh" ? "button" : "div"));
    return registry.get(id);
  },
};

const posted = [];
const windowListeners = new Map();
const window = {
  innerWidth: 720,
  parent: { postMessage(message) { posted.push(message); } },
  addEventListener(type, listener) {
    if (!windowListeners.has(type)) windowListeners.set(type, new Set());
    windowListeners.get(type).add(listener);
  },
  removeEventListener(type, listener) { windowListeners.get(type)?.delete(listener); },
};
function dispatch(message) {
  for (const listener of [...(windowListeners.get("message") || [])]) listener({ data: message });
}

let nextTimer = 0;
const activeTimers = new Map();
function setTimeoutShim(callback) { const id = ++nextTimer; activeTimers.set(id, callback); return id; }
function clearTimeoutShim(id) { activeTimers.delete(id); }
let nextFrame = 0;
const activeFrames = new Map();
function requestAnimationFrameShim(callback) { const id = ++nextFrame; activeFrames.set(id, callback); return id; }
function cancelAnimationFrameShim(id) { activeFrames.delete(id); }
function flushFrames() {
  const frames = [...activeFrames.values()];
  activeFrames.clear();
  for (const callback of frames) callback(0);
}

let resizeObserver = null;
class ResizeObserverShim {
  constructor(callback) { this.callback = callback; this.disconnected = false; resizeObserver = this; }
  observe() { this.observing = true; }
  disconnect() { this.disconnected = true; this.observing = false; }
}

Object.assign(globalThis, {
  document,
  window,
  ResizeObserver: ResizeObserverShim,
  setTimeout: setTimeoutShim,
  clearTimeout: clearTimeoutShim,
  requestAnimationFrame: requestAnimationFrameShim,
  cancelAnimationFrame: cancelAnimationFrameShim,
});

new Function(match[1])();
const initialize = posted.find((message) => message.method === "ui/initialize");
if (!initialize) throw new Error("App did not initialize");
dispatch({
  jsonrpc: "2.0",
  id: initialize.id,
  result: {
    // Deliberately omit serverTools. Operations must still render exact
    // selectors, but may not issue a tools/call request.
    hostCapabilities: { updateModelContext: true },
    hostContext: { theme: "dark", styles: { variables: { "--host-accent": "violet" } } },
  },
});
await Promise.resolve();
await Promise.resolve();
const initialTheme = documentElement.style.colorScheme;
const initialVariable = documentElement.style.values["--host-accent"];
flushFrames();

const malicious = '<img src=x onerror="globalThis.injected=true">';
const payload = operations
  ? {
      schema: "forged.operations-overview/1",
      scope: {},
      sourceHealth: { ledger: { state: "available" }, beads: { state: "available" }, plan: { state: "available" } },
      coverage: { total: 2, shown: 2, truncated: false },
      counts: { live: 1, queued: 0, attention: 0, planOnly: 1, reviewReady: 0 },
      spend: { costUsdKnown: 0 },
      attention: [{ condition: malicious, detail: "text only" }],
      queue: {
        groups: [{
          code: "running",
          label: "Running",
          total: 2,
          shown: 2,
          entries: [
            { id: "plan-one", state: "planned", source: "live-plan", identity: { displayTitle: malicious }, detailTarget: null },
            { id: "display-alias", state: "active", source: "durable", identity: { displayTitle: "Durable work" }, detailTarget: { subjectKind: "run", subjectId: "run-1" } },
          ],
        }],
      },
    }
  : {
      schema: "forged.work-detail/1",
      id: "run-1",
      kind: "run",
      workRef: { kind: "run" },
      identity: { displayTitle: malicious, bead: { id: "beads-one" }, repository: { path: "/repo" } },
      status: { state: "active" },
      workers: { sessions: [] },
      reviews: { latestFindings: [] },
      artifacts: [],
      events: { events: [] },
      usage: { totals: { costUsdKnown: 0 } },
    };
dispatch({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: { structuredContent: { ok: true, result: payload } } });
await Promise.resolve();
documentElement.scrollHeight = 640;
flushFrames();

dispatch({
  jsonrpc: "2.0",
  method: "ui/notifications/host-context-changed",
  params: { theme: "light", styles: { variables: { "--host-accent": "teal" } } },
});
const changedTheme = documentElement.style.colorScheme;
const changedVariable = documentElement.style.values["--host-accent"];

// Leave one frame and the update-model-context request pending so teardown
// must cancel real scheduled work, not merely pass with empty collections.
resizeObserver.callback();
const beforeTeardown = {
  timers: activeTimers.size,
  frames: activeFrames.size,
  observer: !!resizeObserver?.observing,
  messageListeners: windowListeners.get("message")?.size || 0,
};
dispatch({ jsonrpc: "2.0", id: 991, method: "ui/resource-teardown", params: {} });
await Promise.resolve();

function flatten(root) {
  const out = [];
  const walk = (node) => {
    out.push({ tag: node.tag, class: node.className, text: node.textContent, title: node.title, disabled: !!node.disabled });
    for (const kid of node.kids) walk(kid);
  };
  walk(root);
  return out;
}
const nodes = [...registry.values()].flatMap(flatten);
const rows = nodes.filter((node) => node.class === "row");
const text = nodes.map((node) => node.text).filter((value) => value !== undefined).map(String);
const sizeNotifications = posted.filter((message) => message.method === "ui/notifications/size-changed");
process.stdout.write(JSON.stringify({
  operations,
  rows,
  text,
  malicious,
  innerHTMLWrites,
  injected: !!globalThis.injected,
  toolCalls: posted.filter((message) => message.method === "tools/call").length,
  initialTheme,
  initialVariable,
  changedTheme,
  changedVariable,
  sizeNotifications,
  beforeTeardown,
  afterTeardown: {
    timers: activeTimers.size,
    frames: activeFrames.size,
    observerDisconnected: !!resizeObserver?.disconnected,
    messageListeners: windowListeners.get("message")?.size || 0,
  },
  teardownAck: posted.some((message) => message.id === 991 && message.result),
}));
