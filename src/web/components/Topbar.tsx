import { useEffect, useState } from "preact/hooks";
import { enterPrMode, enterTaskMode } from "../lib/modes";
import { viewMode } from "../signals/ui";
import { RepoPicker } from "./RepoPicker";
import { Search } from "./Search";
import { ThemeToggle } from "./ThemeToggle";

function fmtClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function Topbar() {
  const [now, setNow] = useState(() => fmtClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(fmtClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const mode = viewMode.value;
  const onMobileWork = () => {
    enterTaskMode("all");
  };
  const onMobilePrs = () => {
    enterPrMode();
  };

  return (
    <header class="topbar">
      <RepoPicker />
      <Search />
      <div class="mobile-switch" id="mobile-switch">
        <button
          type="button"
          id="mobile-work-btn"
          class={mode === "tasks" ? "active" : undefined}
          onClick={onMobileWork}
        >
          Work
        </button>
        <button type="button" id="mobile-prs-btn" class={mode === "prs" ? "active" : undefined} onClick={onMobilePrs}>
          PRs
        </button>
      </div>
      <div class="right">
        {/* Legacy app.js mutates classList on #refresh-dot (live/stale).
            Preact's prop diff is identity-based: since `class` is the same
            string literal on every re-render, Preact never writes the class
            attribute again — legacy DOM mutations survive. */}
        <span class="refresh-dot live" id="refresh-dot" title="Auto-refreshing" />
        <span class="clock" id="clock">
          {now}
        </span>
        <ThemeToggle />
        <div class="avatar" id="avatar">
          ··
        </div>
      </div>
    </header>
  );
}
