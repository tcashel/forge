/**
 * Lightweight keymap helpers — replaces @mariozechner/pi-tui's Key + matchesKey.
 *
 * Dashboard input handlers receive raw strings from stdin in raw mode.
 * Plain printable ASCII arrives as the character itself; control keys
 * arrive as ANSI escape sequences. matchesKey checks the input against
 * a named key (e.g. "up", "enter") or a literal char.
 */

export const Key = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
  enter: "enter",
  escape: "escape",
  tab: "tab",
  backspace: "backspace",
  space: "space",
  pageUp: "pageUp",
  pageDown: "pageDown",
  home: "home",
  end: "end",
  delete: "delete",
} as const;

export type KeyName = (typeof Key)[keyof typeof Key];

const KEY_SEQUENCES: Record<string, string[]> = {
  up: ["\x1b[A", "\x1bOA"],
  down: ["\x1b[B", "\x1bOB"],
  right: ["\x1b[C", "\x1bOC"],
  left: ["\x1b[D", "\x1bOD"],
  enter: ["\r", "\n", "\r\n"],
  escape: ["\x1b"],
  tab: ["\t"],
  backspace: ["\x7f", "\b"],
  space: [" "],
  pageUp: ["\x1b[5~"],
  pageDown: ["\x1b[6~"],
  home: ["\x1b[H", "\x1b[1~"],
  end: ["\x1b[F", "\x1b[4~"],
  delete: ["\x1b[3~"],
};

export function matchesKey(input: string, spec: string): boolean {
  const seqs = KEY_SEQUENCES[spec.toLowerCase()];
  if (seqs) return seqs.includes(input);
  return input === spec;
}
