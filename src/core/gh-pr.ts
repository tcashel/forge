/**
 * Shared `gh` PR-list helpers.
 *
 * Used by the TUI dashboard and the `forge serve` HTTP API. Both surfaces
 * need the same per-repo gh account/host resolution, the same author=@me
 * detection (login can differ from PR author across SAML/enterprise
 * mappings), and the same compact PR projection (gh's full review/comment
 * arrays blow past execSync's default maxBuffer).
 */

import { spawn } from "node:child_process";
import { type GhTarget, resolveGhEnv } from "./gh.js";

export interface GhPr {
  number: number;
  title: string;
  headRefName: string;
  baseRefName: string;
  url: string;
  isDraft: boolean;
  statusCheckRollup: string | null;
  reviewDecision: string | null;
  author: string;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commentsCount: number;
  reviewsCount: number;
  isMine: boolean;
}

export interface GhFetchOpts {
  cwd?: string;
  timeoutMs?: number;
  ghTarget?: GhTarget;
}

/**
 * Spawn `gh` with optional per-repo account/host overrides.
 *
 * Bare `gh` always uses gh's globally-active account regardless of the
 * per-repo `ghUser`/`ghHost` configured in repo-config.json — that made
 * forge show an empty PR list (or the wrong @me) for any repo whose
 * configured account differs from gh's active one. We mirror what the
 * runner scripts do: resolve a token via `gh auth token --user …` and
 * inject GH_HOST + GH_TOKEN/GH_ENTERPRISE_TOKEN into the child env.
 */
export function runGh(args: string[], opts?: GhFetchOpts): Promise<{ stdout: string; ok: boolean }> {
  const timeout = opts?.timeoutMs ?? 20000;
  return new Promise((resolve) => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeout);
    let stdout = "";
    let stderr = "";
    let settled = false;
    const settle = (result: { stdout: string; ok: boolean }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    // resolveGhEnv returns {} when no override is configured, so the
    // child inherits gh's default behaviour in that case.
    const resolved = resolveGhEnv(opts?.ghTarget);
    if (resolved.error) {
      // Configured account isn't logged in — fail fast rather than
      // silently falling back to the wrong account.
      settle({ stdout: "", ok: false });
      return;
    }
    const env = { ...process.env, ...resolved.env };

    let child: ReturnType<typeof spawn>;
    try {
      child = spawn("gh", args, {
        stdio: ["ignore", "pipe", "pipe"],
        signal: ac.signal,
        cwd: opts?.cwd,
        env,
      });
    } catch {
      settle({ stdout: "", ok: false });
      return;
    }

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", () => settle({ stdout: "", ok: false }));
    child.on("close", (code) => {
      void stderr; // captured for diagnostics, discarded on success
      settle({ stdout: stdout.trim(), ok: code === 0 });
    });
  });
}

export async function currentLogin(opts: GhFetchOpts): Promise<string> {
  const { stdout, ok } = await runGh(["api", "user", "--jq", ".login"], opts);
  return ok ? stdout : "";
}

export async function fetchMinePrNumbers(opts: GhFetchOpts): Promise<Set<number>> {
  // Use gh's own "@me" resolution so this works even when the local gh login
  // (e.g. an org-aliased account like "foo-org") differs from the PR author
  // login on the host (e.g. "foo"). Strict string equality on logins is
  // unreliable across SAML/enterprise account mappings.
  const { stdout, ok } = await runGh(["pr", "list", "--author", "@me", "--json", "number", "--limit", "100"], opts);
  if (!ok || !stdout) return new Set();
  try {
    const arr = JSON.parse(stdout) as Array<{ number: number }>;
    return new Set(arr.map((p) => p.number));
  } catch {
    return new Set();
  }
}

export async function fetchPrs(opts: GhFetchOpts): Promise<{ prs: GhPr[]; me: string }> {
  const [me, mineNumbers] = await Promise.all([currentLogin(opts), fetchMinePrNumbers(opts)]);
  // Use gh's built-in `--jq` to project the (potentially huge) `comments`
  // and `reviews` arrays down to scalar counts on gh's side. Without this,
  // the full review/comment bodies blow past execSync's default maxBuffer
  // and the call silently returns nothing.
  const jq =
    "[.[] | {" +
    "number,title,headRefName,baseRefName,url,isDraft," +
    "statusCheckRollup,reviewDecision,author,updatedAt," +
    "additions,deletions,changedFiles," +
    "commentsCount:(.comments|length),reviewsCount:(.reviews|length)" +
    "}]";
  const { stdout, ok } = await runGh(
    [
      "pr",
      "list",
      "--json",
      "number,title,headRefName,baseRefName,url,isDraft,statusCheckRollup,reviewDecision,author,updatedAt,additions,deletions,changedFiles,comments,reviews",
      "--jq",
      jq,
      "--limit",
      "30",
    ],
    opts,
  );
  if (!ok || !stdout) return { prs: [], me };
  try {
    const prs = JSON.parse(stdout) as Array<{
      number: number;
      title: string;
      headRefName: string;
      baseRefName: string;
      url: string;
      isDraft: boolean;
      statusCheckRollup: Array<{ state?: string; conclusion?: string }>;
      reviewDecision: string | null;
      author: { login?: string } | null;
      updatedAt: string;
      additions: number;
      deletions: number;
      changedFiles: number;
      commentsCount: number;
      reviewsCount: number;
    }>;
    const mapped = prs.map((pr) => {
      const checks = pr.statusCheckRollup ?? [];
      const hasFailure = checks.some((c) => c.state === "FAILURE" || c.conclusion === "FAILURE");
      const allSuccess = checks.length > 0 && checks.every((c) => c.state === "SUCCESS" || c.conclusion === "SUCCESS");
      const hasPending = checks.some((c) => c.state === "PENDING" || c.conclusion === null);
      const ciStatus = hasFailure ? "FAILURE" : allSuccess ? "SUCCESS" : hasPending ? "PENDING" : null;
      const author = pr.author?.login ?? "";
      return {
        number: pr.number,
        title: pr.title,
        headRefName: pr.headRefName,
        baseRefName: pr.baseRefName,
        url: pr.url,
        isDraft: pr.isDraft,
        statusCheckRollup: ciStatus,
        reviewDecision: pr.reviewDecision,
        author,
        updatedAt: pr.updatedAt,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changedFiles,
        commentsCount: pr.commentsCount ?? 0,
        reviewsCount: pr.reviewsCount ?? 0,
        isMine: mineNumbers.has(pr.number) || (me !== "" && author === me),
      };
    });
    return { prs: mapped, me };
  } catch {
    return { prs: [], me };
  }
}
