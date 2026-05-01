/**
 * ANSI-backed theme for the standalone Forge dashboard.
 *
 * Surface matches pi-tui's: Theme = { fg(color, text), bold(text) }.
 * Six named colors (success/error/warning/accent/dim/text). NO_COLOR env
 * disables all escape codes.
 */

const ESC = "\x1b";

const COLOR_CODES: Record<string, string> = {
  success: "\x1b[32m", // green
  error: "\x1b[31m", // red
  warning: "\x1b[33m", // yellow
  accent: "\x1b[36m", // cyan
  dim: "\x1b[2m",
  text: "\x1b[39m", // default fg
};

const RESET = "\x1b[0m";

export interface Theme {
  fg(color: string, text: string): string;
  bold(text: string): string;
}

export function makeTheme(noColor = process.env.NO_COLOR != null): Theme {
  if (noColor) {
    return {
      fg: (_c, t) => t,
      bold: (t) => t,
    };
  }
  return {
    fg: (color, text) => {
      const code = COLOR_CODES[color] ?? "";
      return code ? `${code}${text}${RESET}` : text;
    },
    bold: (text) => `${ESC}[1m${text}${ESC}[22m`,
  };
}
