/**
 * Shared CLI output: JSON envelope shape, error type, exit-code mapping.
 *
 * Every subcommand should:
 * - parse args (typically via util.parseArgs) including --json
 * - on success: call `emitOk(value, json)` → stdout JSON or human text
 * - on failure: throw `new CliError(code, msg, {hint, exitCode})` —
 *   main.ts catches it, emits the error envelope, exits with the right code.
 *
 * Exit codes:
 *   0 — success
 *   1 — user error (bad args, unknown id)
 *   2 — precondition (no tmux/gh/git, no TTY when one needed)
 *   3 — runtime failure (subprocess died, network, etc.)
 *   4 — wait timeout
 */

export type ExitCode = 0 | 1 | 2 | 3 | 4;

export interface CliErrorOptions {
  hint?: string;
  detail?: unknown;
  exitCode?: ExitCode;
}

export class CliError extends Error {
  readonly code: string;
  readonly hint?: string;
  readonly detail?: unknown;
  readonly exitCode: ExitCode;

  constructor(code: string, message: string, opts: CliErrorOptions = {}) {
    super(message);
    this.code = code;
    this.hint = opts.hint;
    this.detail = opts.detail;
    this.exitCode = opts.exitCode ?? 1;
  }
}

export interface ErrorEnvelope {
  ok: false;
  error: { code: string; message: string; hint?: string; detail?: unknown };
}

export function emitOk(value: unknown, json: boolean, humanFormatter?: () => string): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(value)}\n`);
  } else if (humanFormatter) {
    process.stdout.write(`${humanFormatter()}\n`);
  } else if (typeof value === "string") {
    process.stdout.write(`${value}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  }
}

export function emitError(err: CliError, json: boolean): void {
  if (json) {
    const envelope: ErrorEnvelope = {
      ok: false,
      error: { code: err.code, message: err.message, hint: err.hint, detail: err.detail },
    };
    process.stdout.write(`${JSON.stringify(envelope)}\n`);
  } else {
    process.stderr.write(`error: ${err.message}\n`);
    if (err.hint) process.stderr.write(`hint: ${err.hint}\n`);
  }
}
