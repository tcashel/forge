// Execute one split MCP App exactly as a host would: complete the handshake,
// deliver a tool result, mutate host context, observe size notifications, and
// tear the resource down. The shim is intentionally dependency-free so this
// remains a hermetic repository test rather than a browser-stack test.

import { readFileSync } from "node:fs";

const asset = process.argv[2];
if (!asset) throw new Error("usage: split_app_host.mjs <split-app.html>");
const scenarioMode = process.argv[3] === "--scenario";
const scenario = scenarioMode ? JSON.parse(readFileSync(0, "utf8")) : null;
const interactive = process.argv[3] === "--interactive";
const operations = asset.endsWith("operations-overview.html");
const workMap = asset.endsWith("work-map.html");
const agentSessions = asset.endsWith("agent-sessions.html");
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
    dataset: {},
    attributes: {},
    hidden: false,
    disabled: false,
    kids: [],
    get firstChild() { return node.kids[0]; },
    classList: {
      add(...names) {
        const current = new Set(node.className.split(/\s+/).filter(Boolean));
        for (const name of names) current.add(name);
        node.className = [...current].join(" ");
      },
      toggle(name) {
        const current = new Set(node.className.split(/\s+/).filter(Boolean));
        const enabled = !current.has(name);
        if (enabled) current.add(name); else current.delete(name);
        node.className = [...current].join(" ");
        return enabled;
      },
    },
    style: {
      values: {},
      setProperty(key, value) { this.values[key] = value; },
    },
    append(...kids) { node.kids.push(...kids); },
    replaceChildren(...kids) { node.kids = [...kids]; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { width: 720, height: node.scrollHeight || 480 }; },
    focus() {},
    remove() {},
    setAttribute(name, value) { node.attributes[name] = String(value); },
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    click() {
      if (node.disabled) return;
      for (const listener of [...(listeners.get("click") || [])]) listener({ type: "click", target: node });
    },
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
const documentListeners = new Map();
const document = {
  documentElement,
  body: element("body"),
  head: element("head"),
  visibilityState: "visible",
  createElement: element,
  createTextNode(text) { const node = element("#text"); node.textContent = String(text); return node; },
  getElementById(id) {
    if (!registry.has(id)) registry.set(id, element(id === "refresh" ? "button" : "div"));
    return registry.get(id);
  },
  addEventListener(type, listener) {
    if (!documentListeners.has(type)) documentListeners.set(type, new Set());
    documentListeners.get(type).add(listener);
  },
  removeEventListener(type, listener) { documentListeners.get(type)?.delete(listener); },
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
  Node: Object,
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
    // The default lifecycle pass deliberately omits serverTools. A separate
    // interactive Agent Sessions pass opts in explicitly.
    hostCapabilities: scenario?.hostCapabilities || { updateModelContext: true, ...(interactive ? { serverTools: true } : {}) },
    hostContext: scenario?.hostContext || { theme: "dark", styles: { variables: { "--host-accent": "violet" } } },
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
  : workMap
    ? {
      schema: "forged.work-map/1",
      scope: { kind: "repository", repository: "/repo" },
      sourceHealth: {
        ledger: { state: "available" }, beads: { state: "available" },
        plan: { state: "available" }, history: { state: "degraded" },
      },
      counts: { nodes: 2, edges: 1, runs: 1, epics: 0, attention: 0, historyUnattached: 1 },
      nodes: [
        {
          workRef: { schema: "forged.work-ref/1", kind: "plan", id: "plan-one" },
          source: "live-plan", contextOnly: false,
          identity: { displayTitle: malicious }, plan: { status: "open" },
          queue: { group: "planned" }, execution: { source: "none" }, history: null,
          attention: [], detailTarget: null,
        },
        {
          workRef: { schema: "forged.work-ref/1", kind: "run", id: "run-1" },
          source: "durable", contextOnly: false,
          identity: { displayTitle: "Durable work" }, plan: null,
          queue: { group: "running" }, execution: { state: "active" }, history: null,
          attention: [], detailTarget: { subjectKind: "run", subjectId: "run-1" },
        },
      ],
      edges: [{ source: { kind: "run", id: "run-1" }, target: { kind: "plan", id: "plan-one" }, kind: "execution-of", contextOnly: false }],
      graphHealth: { healthy: true }, capturedAt: { ledger: "2026-08-14T00:00:00Z" },
    }
    : agentSessions
      ? {
        schema: "forged.provider-session-inventory/1",
        asOf: "2026-08-15T00:00:00Z",
        filters: { repository: "/repo", includeHistorical: false },
        coverage: { missingWorkIdentity: 0, missingRepository: 0, missingDesiredWork: 0, missingOwnedProjection: 0, legacyHerdrRows: 0, processRows: 0, unknownHostRows: 0, degradationFacts: [] },
        summary: { totalMatched: 1, returned: 1, active: 1, historical: 0, ownedHerdr: 1, process: 0, legacyHerdr: 0, unknownHost: 0 },
        rows: [{
          runId: "run-1", packetId: "run-1/implement/1", attemptId: 4, epicId: null,
          identity: { subject: { kind: "run", id: "run-1" }, displayTitle: malicious },
          repository: "/repo", stage: "implementation", provider: "codex", model: "gpt-5.6-sol",
          attempt: { activity: "running", claimant: "secret-claimant", revokeReason: "secret-revoke", failNote: "secret-failure", startedAt: "2026-08-15T00:00:00Z", updatedAt: "2026-08-15T00:01:00Z", lastHeartbeatAt: null, endedAt: null },
          recovery: "healthy",
          desiredWork: { subjectKind: "run", subjectId: "run-1", desiredState: "running", controlRevision: 2, controllerGeneration: 1, predecessorGeneration: null, reconciliationOutcome: "healthy", restartBudget: 2, restartUsed: 0, nextWakeAt: null, lastProgressAt: "2026-08-15T00:01:00Z", lastError: "secret-desired-error", exhaustedAt: null, updatedAt: "2026-08-15T00:01:00Z" },
          pendingInterventions: 0, hostMode: "owned-herdr",
          ownedHerdr: { identity: { ownershipId: "owned-1", paneId: "pane-1", socketPath: "/secret/socket", sentinelPath: "/secret/sentinel", layoutId: "layout-1", protocol: 19 }, mutable: { lifecycleState: "active", cleanupState: "not-requested", cleanupRelease: null, cleanupRetryBudget: 3, cleanupRetryUsed: 0, nextCleanupAt: null, lastCleanupError: "secret-cleanup-error", registeredAt: "2026-08-15T00:00:00Z", commandStartedAt: "2026-08-15T00:00:01Z", cleanupRequestedAt: null, lastCleanupAttemptAt: null, releasedAt: null, updatedAt: "2026-08-15T00:01:00Z" } },
          legacyHerdr: null,
          projection: { identity: { projectionId: "projection-1", target: { kind: "attempt", runId: "run-1", packetId: "run-1/implement/1", attemptId: 4, claimToken: "secret-claim-token" }, paneId: "pane-1", socketPath: "/secret/projection-socket", protocol: 19, metadataSource: "forged:projection:metadata:test", lifecycleSource: "forged:projection:lifecycle:test", lifecycleAgent: "forged" }, mutable: { desiredRevision: 2, desiredLifecycle: "working", desiredRelease: false, metadata: { nextSequence: 3, appliedSequence: 2, appliedRevision: 2, state: "published", retryBudget: 3, retryUsed: 0, nextWakeAt: null, lastError: "secret-metadata-error", lastAttemptAt: "2026-08-15T00:01:00Z", appliedAt: "2026-08-15T00:01:00Z" }, lifecycle: { nextSequence: 3, appliedSequence: 2, appliedRevision: 2, state: "published", retryBudget: 3, retryUsed: 0, nextWakeAt: null, lastError: "secret-lifecycle-error", lastAttemptAt: "2026-08-15T00:01:00Z", appliedAt: "2026-08-15T00:01:00Z" }, providerSession: { candidate: "candidate-1", confirmed: "provider-1", source: "codex-thread-started", observedAt: "2026-08-15T00:00:02Z", error: "secret-provider-error" } } },
          providerSessionId: "provider-1", recommendedAction: "inspect-work",
        }],
        nextCursor: "cursor-2",
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
if (scenario?.toolInput) {
  dispatch({
    jsonrpc: "2.0",
    method: "ui/notifications/tool-input",
    params: { arguments: scenario.toolInput },
  });
} else if (agentSessions) {
  dispatch({
    jsonrpc: "2.0",
    method: "ui/notifications/tool-input",
    params: { arguments: { schemaVersion: 1, params: { repository: "/repo", provider: "codex", limit: 25 } } },
  });
}
function resultParams(result, transport) {
  if (!result) return { structuredContent: { ok: true, result: payload } };
  if (transport === "text") return { content: result.content || [], isError: !!result.isError };
  return result;
}
dispatch({
  jsonrpc: "2.0",
  method: "ui/notifications/tool-result",
  params: resultParams(scenario?.toolResult, scenario?.transport),
});
await Promise.resolve();
documentElement.scrollHeight = 640;
flushFrames();

for (const action of scenario?.actions || []) {
  if (action.type === "tool-result") {
    dispatch({
      jsonrpc: "2.0",
      method: "ui/notifications/tool-result",
      params: resultParams(action.toolResult, action.transport),
    });
  } else if (action.type === "tool-cancelled") {
    dispatch({ jsonrpc: "2.0", method: "ui/notifications/tool-cancelled", params: action.params || {} });
  } else if (action.type === "host-context") {
    dispatch({ jsonrpc: "2.0", method: "ui/notifications/host-context-changed", params: action.params || {} });
  } else {
    throw new Error(`unknown scenario action ${JSON.stringify(action)}`);
  }
  await Promise.resolve();
  flushFrames();
}

dispatch({
  jsonrpc: "2.0",
  method: "ui/notifications/host-context-changed",
  params: { theme: "light", styles: { variables: { "--host-accent": "teal" } } },
});
const changedTheme = documentElement.style.colorScheme;
const changedVariable = documentElement.style.values["--host-accent"];

const interactiveCalls = [];
const automaticToolCalls = posted.filter((message) => message.method === "tools/call").length;
if (interactive) {
  if (!agentSessions) throw new Error("interactive mode is only valid for Agent Sessions");
  const settle = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
  const calls = () => posted.filter((message) => message.method === "tools/call");
  const respond = async (call, result) => {
    dispatch({ jsonrpc: "2.0", id: call.id, result: { structuredContent: { ok: true, result } } });
    await settle();
  };
  const page = (runId, title, includeHistorical, nextCursor) => {
    const value = JSON.parse(JSON.stringify(payload));
    value.filters.includeHistorical = includeHistorical;
    value.rows[0].runId = runId;
    value.rows[0].packetId = `${runId}/implement/1`;
    value.rows[0].identity.subject.id = runId;
    value.rows[0].identity.displayTitle = title;
    value.rows[0].desiredWork.subjectId = runId;
    value.nextCursor = nextCursor;
    return value;
  };

  const beforeRefresh = calls().length;
  registry.get("refresh").click();
  registry.get("refresh").click();
  await settle();
  const refreshCalls = calls().slice(beforeRefresh);
  if (refreshCalls.length !== 1) throw new Error(`refresh was not single-flight: ${refreshCalls.length}`);
  interactiveCalls.push(refreshCalls[0]);
  await respond(refreshCalls[0], page("run-refresh", "Refreshed page", false, "cursor-history"));

  registry.get("history").click();
  await settle();
  const historyCall = calls().at(-1);
  interactiveCalls.push(historyCall);
  await respond(historyCall, page("run-history", "Historical page", true, "cursor-next"));

  registry.get("next").click();
  await settle();
  const nextCall = calls().at(-1);
  interactiveCalls.push(nextCall);
  await respond(nextCall, page("run-next", "Next page work", true, null));

  const live = [];
  const walkLive = node => { live.push(node); for (const kid of node.kids) walkLive(kid); };
  for (const root of registry.values()) walkLive(root);
  const open = live.find(node => node.className === "open-detail" && !node.disabled);
  if (!open) throw new Error("exact Work Detail control is unavailable");
  open.click();
  await settle();
  const detailCall = calls().at(-1);
  interactiveCalls.push(detailCall);
  await respond(detailCall, {
    schema: "forged.work-detail/1", id: "run-next", kind: "run", workRef: { kind: "run" },
    identity: { displayTitle: "Next page work" }, status: { state: "active" },
    workers: { sessions: [] }, reviews: { latestFindings: [] },
  });
}

const allowedTools = new Set(scenario?.allowedTools || []);
for (const call of posted.filter((message) => message.method === "tools/call")) {
  const name = call?.params?.name;
  if (!allowedTools.has(name) && !interactive) {
    throw new Error(`unexpected tools/call ${JSON.stringify(call.params)}`);
  }
}

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
const mapNodes = nodes.filter((node) => node.class.startsWith("node"));
const sessionRows = nodes.filter((node) => node.class === "session-row");
const text = nodes.map((node) => node.text).filter((value) => value !== undefined).map(String);
const sizeNotifications = posted.filter((message) => message.method === "ui/notifications/size-changed");
const modelContext = posted
  .filter((message) => message.method === "ui/update-model-context")
  .map((message) => (message.params?.content || []).map((part) => part.text).join("\n"));
process.stdout.write(JSON.stringify({
  operations,
  workMap,
  agentSessions,
  scenarioMode,
  rows,
  mapNodes,
  sessionRows,
  text,
  malicious,
  innerHTMLWrites,
  injected: !!globalThis.injected,
  toolCalls: posted.filter((message) => message.method === "tools/call").length,
  automaticToolCalls,
  interactiveCalls: interactiveCalls.map(message => message.params),
  initialTheme,
  initialVariable,
  changedTheme,
  changedVariable,
  sizeNotifications,
  modelContext,
  beforeTeardown,
  afterTeardown: {
    timers: activeTimers.size,
    frames: activeFrames.size,
    observerDisconnected: !!resizeObserver?.disconnected,
    messageListeners: windowListeners.get("message")?.size || 0,
  },
  teardownAck: posted.some((message) => message.id === 991 && message.result),
}));
