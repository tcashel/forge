/**
 * Standalone TUI render loop for `forge dash`.
 *
 * Owns raw-mode setup, alt-screen entry/exit, render scheduling, and
 * teardown on SIGINT / process exit. The component (e.g. the dashboard)
 * exposes `render(width)` returning a string[] frame, plus `handleInput`
 * for raw keystrokes.
 *
 * Components that need to suspend the TUI for an interactive subprocess
 * (e.g. `tmux attach`) call `suspend(fn)`: the loop drops alt-screen,
 * restores cooked mode, awaits fn, then re-enters and re-renders.
 */

const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const ENTER_ALT = "\x1b[?1049h";
const EXIT_ALT = "\x1b[?1049l";
const CLEAR = "\x1b[H\x1b[2J";

export interface TuiComponent {
  render(width: number): string[];
  handleInput(data: string): void;
  invalidate(): void;
  start?(): void;
  stop?(): void;
}

export interface TuiHandle {
  invalidate(): void;
  suspend<T>(fn: () => Promise<T>): Promise<T>;
  stop(): void;
}

export interface ComponentFactory {
  (handle: TuiHandle): TuiComponent;
}

export async function runTui(factory: ComponentFactory): Promise<void> {
  if (!process.stdout.isTTY) {
    throw new Error("forge dash requires a TTY on stdout.");
  }

  let renderQueued = false;
  let stopped = false;

  function enterAltScreen() {
    process.stdout.write(`${ENTER_ALT}${HIDE_CURSOR}`);
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf-8");
    process.stdin.resume();
  }

  function exitAltScreen() {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write(`${EXIT_ALT}${SHOW_CURSOR}`);
  }

  function scheduleRender() {
    if (renderQueued || stopped) return;
    renderQueued = true;
    setImmediate(() => {
      renderQueued = false;
      if (stopped) return;
      const w = process.stdout.columns ?? 80;
      const h = process.stdout.rows ?? 24;
      const lines = component.render(w);
      process.stdout.write(CLEAR);
      const visible = lines.slice(0, h);
      process.stdout.write(visible.join("\n"));
    });
  }

  const handle: TuiHandle = {
    invalidate: scheduleRender,
    suspend: async (fn) => {
      exitAltScreen();
      try {
        return await fn();
      } finally {
        if (!stopped) {
          enterAltScreen();
          scheduleRender();
        }
      }
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      try {
        component.stop?.();
      } catch {
        /* ignore */
      }
      exitAltScreen();
    },
  };

  const component = factory(handle);

  enterAltScreen();
  process.stdout.on("resize", scheduleRender);
  process.stdin.on("data", (chunk: string) => {
    if (stopped) return;
    component.handleInput(chunk);
  });
  const cleanup = () => handle.stop();
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", cleanup);

  component.start?.();
  scheduleRender();

  // Park until the component (or signal handler) calls handle.stop().
  await new Promise<void>((resolve) => {
    const tick = setInterval(() => {
      if (stopped) {
        clearInterval(tick);
        resolve();
      }
    }, 100);
  });
}
