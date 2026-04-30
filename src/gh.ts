/**
 * gh CLI helper — per-repo account/host overrides.
 *
 * Forge can be configured per repo to use a specific gh account and/or
 * host (see RepoConfig.ghUser / ghHost). Mutating gh's "active" account
 * globally would race with parallel forge runs and surprise the user's
 * other tools, so instead we resolve the account's token via
 *
 *     gh auth token --hostname <host> --user <user>
 *
 * and pass it to child gh invocations as GH_TOKEN. GH_HOST is set when
 * a non-default host is configured. Both variables are scoped to the
 * spawned child process.
 */

import { execFileSync } from "node:child_process";

export interface GhTarget {
  user?: string;
  host?: string;
}

export interface GhEnv {
  /** Env vars to merge into spawned gh processes (empty object means "use defaults"). */
  env: Record<string, string>;
  /**
   * Non-null when the configured target couldn't be resolved (e.g. the user
   * isn't logged in to that host). Callers should surface this and either
   * abort or skip gh-dependent steps.
   */
  error: string | null;
}

const DEFAULT_HOST = "github.com";

/**
 * Per `gh help environment`, gh routes auth tokens differently by host:
 *
 *   GH_TOKEN              → used for github.com or any *.ghe.com subdomain
 *                            (GitHub-hosted Enterprise Cloud).
 *   GH_ENTERPRISE_TOKEN   → used for GitHub Enterprise Server (self-hosted,
 *                            arbitrary hostnames like github.example.com).
 *
 * If we set the wrong variable, gh silently ignores it and falls back to
 * whichever account is currently active in `gh auth status` for that host
 * — which is exactly the multi-account confusion this whole feature is
 * meant to prevent. Choose the right variable based on host shape.
 */
export function tokenEnvVarForHost(host: string): "GH_TOKEN" | "GH_ENTERPRISE_TOKEN" {
  const h = host.trim().toLowerCase();
  if (h === "github.com" || h.endsWith(".ghe.com")) return "GH_TOKEN";
  return "GH_ENTERPRISE_TOKEN";
}

/**
 * Resolve a token + host for gh subprocesses. Returns `{ env: {}, error: null }`
 * when no override is configured so callers can pass it through unchanged
 * and gh will use its built-in active account.
 */
export function resolveGhEnv(target: GhTarget | undefined): GhEnv {
  if (!target || (!target.user && !target.host)) {
    return { env: {}, error: null };
  }
  const host = target.host?.trim() || DEFAULT_HOST;
  const env: Record<string, string> = { GH_HOST: host };

  if (target.user) {
    try {
      const token = execFileSync("gh", ["auth", "token", "--hostname", host, "--user", target.user], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
      if (!token) {
        return {
          env: {},
          error: `gh auth token returned empty for user "${target.user}" on host "${host}". Run: gh auth login --hostname ${host}`,
        };
      }
      env[tokenEnvVarForHost(host)] = token;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        env: {},
        error: `gh auth token failed for user "${target.user}" on host "${host}": ${msg.split("\n")[0]}. Run: gh auth login --hostname ${host}`,
      };
    }
  }
  return { env, error: null };
}

/**
 * List github.com accounts gh has tokens for, parsed from `gh auth status`.
 * Returns the active account first, then the rest. Empty array on any error.
 *
 * Used by the settings wizard so users can pick from a menu instead of
 * typing the account name (and risking a typo that bites them 20 minutes
 * later at PR creation time).
 */
export function listGhAccounts(host: string = DEFAULT_HOST): { user: string; active: boolean }[] {
  let raw = "";
  try {
    raw = execFileSync("gh", ["auth", "status", "--hostname", host], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (e: unknown) {
    // `gh auth status` exits non-zero when any account is degraded. The
    // stdout/stderr is still on the error object — parse what we can.
    const err = e as { stdout?: string; stderr?: string };
    raw = (err.stdout ?? "") + "\n" + (err.stderr ?? "");
  }
  if (!raw) return [];

  const accounts: { user: string; active: boolean }[] = [];
  const seen = new Set<string>();
  // Each account block looks like:
  //   ✓ Logged in to github.com account tcashel (keyring)
  //   - Active account: true
  // We pair each "Logged in … account <name>" with the next "Active account:" line.
  const lines = raw.split("\n");
  let pendingUser: string | null = null;
  for (const line of lines) {
    const m = line.match(/Logged in to \S+ account (\S+)/);
    if (m) {
      pendingUser = m[1];
      continue;
    }
    const a = line.match(/Active account:\s*(true|false)/);
    if (a && pendingUser) {
      if (!seen.has(pendingUser)) {
        accounts.push({ user: pendingUser, active: a[1] === "true" });
        seen.add(pendingUser);
      }
      pendingUser = null;
    }
  }
  // Any unpaired user (older gh versions without the Active line) — include
  // as inactive so they're still pickable.
  if (pendingUser && !seen.has(pendingUser)) {
    accounts.push({ user: pendingUser, active: false });
  }
  accounts.sort((x, y) => (x.active === y.active ? x.user.localeCompare(y.user) : x.active ? -1 : 1));
  return accounts;
}

/**
 * Produce a bash snippet that exports the resolved gh env vars in-process.
 * Used by the claude/codex bash runner so all `gh` calls in the script
 * pick up the configured account. Pure-string for testability.
 *
 * The snippet assumes `log` and `set_status` are already defined (they
 * are, at the top of the runner script). When user resolution fails it
 * marks the run as failed and exits 1 — better than running for 20
 * minutes and hitting the same gh error at PR creation time.
 *
 * Returns an empty string when no override is configured.
 */
export function bashGhEnvExport(target: GhTarget | undefined): string {
  if (!target || (!target.user && !target.host)) return "";
  const host = target.host?.trim() || DEFAULT_HOST;
  const tokenVar = tokenEnvVarForHost(host);
  const lines: string[] = [
    "# ── Forge: per-repo gh account override ────────────────────────────",
    `export GH_HOST=${shellQuote(host)}`,
  ];
  if (target.user) {
    lines.push(
      `_FORGE_GH_TOKEN=$(gh auth token --hostname ${shellQuote(host)} --user ${shellQuote(target.user)} 2>/dev/null || true)`,
      `if [ -z "$_FORGE_GH_TOKEN" ]; then`,
      `  log "✗ Forge: gh user '${target.user}' on host '${host}' is not logged in. Run: gh auth login --hostname ${host}"`,
      `  set_status "failed"`,
      `  exit 1`,
      `fi`,
      // Per `gh help environment`: GH_TOKEN is for github.com/*.ghe.com,
      // GH_ENTERPRISE_TOKEN for GitHub Enterprise Server. Picking the
      // wrong one makes gh silently ignore the override.
      `export ${tokenVar}="$_FORGE_GH_TOKEN"`,
      `log "✓ Forge: using gh account '${target.user}' on '${host}' (via ${tokenVar})"`,
    );
  } else {
    lines.push(`log "✓ Forge: using gh host '${host}'"`);
  }
  lines.push("");
  return lines.join("\n");
}

function shellQuote(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}
