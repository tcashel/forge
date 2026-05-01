/**
 * forge — agentic coding workflow control plane.
 *
 * Entry point dispatched from bin/forge.ts. Each subcommand lives in
 * src/cli/cmd/<name>.ts and exports `run(argv, store)`. Errors thrown
 * as CliError are caught here and rendered into the standard envelope.
 */

import { ForgeStore } from "../core/store.ts";
import * as attach from "./cmd/attach.ts";
import * as config from "./cmd/config.ts";
import * as critique from "./cmd/critique.ts";
import * as dash from "./cmd/dash.ts";
import * as launch from "./cmd/launch.ts";
import * as logs from "./cmd/logs.ts";
import * as ls from "./cmd/ls.ts";
import * as review from "./cmd/review.ts";
import * as spec from "./cmd/spec.ts";
import * as status from "./cmd/status.ts";
import * as wait from "./cmd/wait.ts";
import { CliError, emitError } from "./output.ts";

const VERSION = "0.4.0-dev";

function printUsage(): void {
  process.stderr.write(`forge ${VERSION} — agentic coding workflow control plane

Usage: forge <command> [...args]

Commands:
  spec save        Save a draft spec from stdin or --from-file
  spec ls          List draft specs
  spec show <id>   Print a saved spec

  launch <id>      Kick off a background agent run for a spec
  critique <id>    Run two-critic + synthesizer adversarial critique on a spec
  review <pr>      Compose the reviewer prompt for a PR (pipe to claude/codex)
  attach <id>      Exec into the task's tmux session
  ls               List tasks (current repo by default)
  status <id>      Show task and run state
  logs <id>        Print or tail (-f) the run log
  wait <id>        Block until the task reaches a terminal state

  config get <k>           Read a per-repo setting
  config set <k> <v>       Write a per-repo setting
  config list              List per-repo settings

  dash                     Open the mission-control TUI dashboard

Global flags:
  --json                   Machine-readable output
  --help, -h               Show this help
  --version, -V            Show version

Run 'forge <command> --help' for command-specific flags (TODO).
`);
}

function isJsonRequested(argv: string[]): boolean {
  return argv.includes("--json");
}

export async function run(argv: string[]): Promise<void> {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    printUsage();
    process.exit(argv.length === 0 ? 1 : 0);
  }
  if (argv[0] === "--version" || argv[0] === "-V") {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  }

  const cmd = argv[0];
  const rest = argv.slice(1);
  const store = new ForgeStore();
  const json = isJsonRequested(rest);

  try {
    switch (cmd) {
      case "spec":
        await spec.run(rest, store);
        return;
      case "launch":
        await launch.run(rest, store);
        return;
      case "critique":
        await critique.run(rest, store);
        return;
      case "review":
        await review.run(rest, store);
        return;
      case "attach":
        await attach.run(rest, store);
        return;
      case "ls":
        await ls.run(rest, store);
        return;
      case "status":
        await status.run(rest, store);
        return;
      case "logs":
        await logs.run(rest, store);
        return;
      case "wait":
        await wait.run(rest, store);
        return;
      case "config":
        await config.run(rest, store);
        return;
      case "dash":
        await dash.run(rest, store);
        return;
      default: {
        const e = new CliError("UNKNOWN_CMD", `Unknown command: ${cmd}`, { exitCode: 1 });
        emitError(e, json);
        process.exit(e.exitCode);
      }
    }
  } catch (err) {
    if (err instanceof CliError) {
      emitError(err, json);
      process.exit(err.exitCode);
    }
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    emitError(new CliError("INTERNAL", message, { exitCode: 3, detail: stack }), json);
    process.exit(3);
  }
}
