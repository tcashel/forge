/**
 * forge config <get|set|list> — read/write per-repo settings.
 *
 * Settings live in ~/.forge/repo-config.json keyed by repo root path.
 *
 * Examples:
 *   forge config list
 *   forge config get reviewerAgent
 *   forge config set reviewerAgent claude
 *   forge config set ghUser personal-account
 */

import { parseArgs } from "node:util";
import { detectRepo } from "../../core/repo.ts";
import type { ForgeStore, LaunchTarget, ReasoningEffort, RepoConfig } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

const STRING_KEYS = [
  "ghUser",
  "ghHost",
  "jiraProject",
  "jiraType",
  "reviewerModel",
  "critiqueModelA",
  "critiqueModelB",
  "critiqueModelSynth",
] as const;

const AGENT_KEYS = ["reviewerAgent", "critiqueAgentA", "critiqueAgentB", "critiqueAgentSynth"] as const;
const EFFORT_KEYS = [
  "reviewerReasoningEffort",
  "critiqueReasoningA",
  "critiqueReasoningB",
  "critiqueReasoningSynth",
] as const;

const VALID_AGENTS: LaunchTarget[] = ["pi", "claude", "codex"];
const VALID_EFFORTS: ReasoningEffort[] = ["low", "medium", "high", "xhigh"];

type ConfigKey = (typeof STRING_KEYS)[number] | (typeof AGENT_KEYS)[number] | (typeof EFFORT_KEYS)[number];

function repoRootFromArgs(values: Record<string, unknown>): string {
  if (typeof values.repo === "string") return values.repo;
  const detected = detectRepo(process.cwd());
  if (!detected) {
    throw new CliError("NOT_A_REPO", "Not in a git repo. Pass --repo <path>.", { exitCode: 2 });
  }
  return detected.root;
}

function validateValue(key: ConfigKey, value: string): unknown {
  if ((AGENT_KEYS as readonly string[]).includes(key)) {
    if (!VALID_AGENTS.includes(value as LaunchTarget)) {
      throw new CliError("BAD_VALUE", `${key} must be one of: ${VALID_AGENTS.join(", ")}`, { exitCode: 1 });
    }
    return value;
  }
  if ((EFFORT_KEYS as readonly string[]).includes(key)) {
    if (!VALID_EFFORTS.includes(value as ReasoningEffort)) {
      throw new CliError("BAD_VALUE", `${key} must be one of: ${VALID_EFFORTS.join(", ")}`, { exitCode: 1 });
    }
    return value;
  }
  return value;
}

async function runGet(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      repo: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const key = positionals[0] as ConfigKey | undefined;
  if (!key) throw new CliError("MISSING_ARG", "Usage: forge config get <key> [--repo <path>]", { exitCode: 1 });

  const repoRoot = repoRootFromArgs(values);
  const cfg = store.getRepoConfig(repoRoot);
  const value = (cfg as Record<string, unknown>)[key];

  emitOk({ repoRoot, key, value: value ?? null }, values.json === true, () =>
    value === undefined ? `(unset) ${key}` : `${key} = ${value}`,
  );
}

async function runSet(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      repo: { type: "string" },
      json: { type: "boolean", default: false },
      clear: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const key = positionals[0] as ConfigKey | undefined;
  if (!key) throw new CliError("MISSING_ARG", "Usage: forge config set <key> <value> [--repo <path>]", { exitCode: 1 });

  const repoRoot = repoRootFromArgs(values);

  if (values.clear) {
    const patch: Record<string, undefined> = { [key]: undefined };
    store.setRepoConfig(repoRoot, patch as Partial<RepoConfig>);
    emitOk({ repoRoot, key, value: null }, values.json === true, () => `cleared ${key}`);
    return;
  }

  const rawValue = positionals[1];
  if (rawValue === undefined) {
    throw new CliError("MISSING_ARG", "Usage: forge config set <key> <value> [--repo <path>]", { exitCode: 1 });
  }
  const validated = validateValue(key, rawValue);
  const patch = { [key]: validated } as Partial<RepoConfig>;
  store.setRepoConfig(repoRoot, patch);
  emitOk({ repoRoot, key, value: validated }, values.json === true, () => `set ${key} = ${rawValue}`);
}

async function runList(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      repo: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const repoRoot = repoRootFromArgs(values);
  const config = store.getRepoConfig(repoRoot);

  emitOk({ repoRoot, config }, values.json === true, () => {
    const entries = Object.entries(config);
    if (entries.length === 0) return `(no config for ${repoRoot})`;
    return [`config for ${repoRoot}`, ...entries.map(([k, v]) => `  ${k}: ${v}`)].join("\n");
  });
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const sub = argv[0];
  switch (sub) {
    case "get":
      return runGet(argv.slice(1), store);
    case "set":
      return runSet(argv.slice(1), store);
    case "list":
      return runList(argv.slice(1), store);
    default:
      throw new CliError("UNKNOWN_SUBCMD", `Usage: forge config <get|set|list>`, { exitCode: 1 });
  }
}
