import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// The inner markup of #list-pane / #detail-pane / #pickup-section is still
// owned by legacy app.js (Phase 3 will port it). We render the wrapping
// containers via Preact and seed their innerHTML once with the structure
// legacy code expects, then never re-render those subtrees.
//
// Using `dangerouslySetInnerHTML` here is a deliberate handoff: Preact will
// only set the innerHTML on the initial mount (the html string is constant);
// subsequent re-renders of <App /> diff the static empty `__html` against
// the previous static empty `__html` and skip the DOM write, leaving the
// children (now owned by legacy) untouched.

const PICKUP_INNER = `
  <div class="pickup-head">
    <h2>Pick up here</h2>
    <span class="sub" id="pickup-sub">—</span>
  </div>
  <div class="pickup-cards" id="pickup-cards"></div>
`;

const LIST_PANE_INNER = `
  <header class="section-h" data-section="running">
    <span class="ic running"></span>
    <span class="name">Running now</span>
    <span class="count">0</span>
    <span class="help">Live — auto-refreshes every 3s</span>
  </header>
  <div id="list-running"></div>

  <header class="section-h" data-section="attention">
    <span class="ic attention"></span>
    <span class="name">Needs your attention</span>
    <span class="count">0</span>
    <span class="help">Failures + critique-ready</span>
  </header>
  <div id="list-attention"></div>

  <header class="section-h" data-section="ready">
    <span class="ic ready"></span>
    <span class="name">Ready to launch</span>
    <span class="count">0</span>
    <span class="help">Auto-improver has revised these</span>
  </header>
  <div id="list-ready"></div>

  <header class="section-h" data-section="drafting">
    <span class="ic drafting"></span>
    <span class="name">Drafting</span>
    <span class="count">0</span>
    <span class="help">First-pass specs — could use shape</span>
  </header>
  <div id="list-drafting"></div>

  <details class="done-section">
    <summary>
      <span class="chev">›</span>
      <span class="ic done" style="width:8px;height:8px;border-radius:50%;background:var(--done)"></span>
      <span>Recently done</span>
      <span class="count" style="margin-left:8px">0</span>
    </summary>
    <div id="list-done"></div>
  </details>
`;

const DETAIL_PANE_INNER = `
  <div class="detail-empty" id="detail-empty">Select a task to see details.</div>
  <div class="detail-head" id="detail-head" hidden></div>
  <nav class="tabs" id="detail-tabs" hidden></nav>
  <div class="detail-body" id="detail-body" hidden></div>
`;

export function App() {
  return (
    <div class="app">
      <Sidebar />
      <Topbar />
      <div class="workspace-body">
        <section class="pickup" id="pickup-section" dangerouslySetInnerHTML={{ __html: PICKUP_INNER }} />
        <aside class="list-pane" id="list-pane" dangerouslySetInnerHTML={{ __html: LIST_PANE_INNER }} />
        <main class="detail-pane" id="detail-pane" dangerouslySetInnerHTML={{ __html: DETAIL_PANE_INNER }} />
      </div>
    </div>
  );
}
