#!/usr/bin/env bun
/**
 * Entry shim. Logic lives in src/cli/main.ts so tests can drive it
 * without spawning a child process.
 */
import { run } from "../src/cli/main.ts";

await run(process.argv.slice(2));
