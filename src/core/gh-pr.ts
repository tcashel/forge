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
  /**
   * When present, stdin is piped and `JSON.stringify(inputJson)` is written
   * to it. Used by the write helpers (`gh-pr-write.ts`) to feed request
   * bodies to `gh api --input -` without a second gh-spawn path. Read calls
   * leave this undefined and stdin stays `"ignore"` (byte-for-byte unchanged).
   */
  inputJson?: unknown;
  /**
   * Already-resolved `owner/repo` for `gh api` paths (which don't template
   * `{owner}/{repo}`). The write helpers pass this through to avoid a second
   * `gh repo view` round-trip; resolved internally when omitted.
   */
  ownerRepo?: string;
  /**
   * Already-resolved enterprise host (the `--hostname` value). `null`/omitted
   * means github.com (no flag added).
   */
  apiHost?: string | null;
}

export interface GhResult {
  stdout: string;
  /** Trimmed and capped — diagnostic detail for callers' error strings. */
  stderr: string;
  ok: boolean;
  /** True when the call was aborted by the timeout (stderr says how long). */
  timedOut: boolean;
}

// Cap stderr so a runaway gh (e.g. dumping a whole HTTP response) can't bloat
// error strings persisted into session rows / publish records.
const GH_STDERR_CAP = 2048;

function capStderr(stderr: string): string {
  const trimmed = stderr.trim();
  return trimmed.length > GH_STDERR_CAP ? `${trimmed.slice(0, GH_STDERR_CAP)}…` : trimmed;
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
export function runGh(args: string[], opts?: GhFetchOpts): Promise<GhResult> {
  const timeout = opts?.timeoutMs ?? 20000;
  return new Promise((resolve) => {
    const ac = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ac.abort();
    }, timeout);
    let stdout = "";
    let stderr = "";
    let settled = false;
    const settle = (result: { stdout: string; ok: boolean; stderr?: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const detail = timedOut ? `timed out after ${timeout}ms` : capStderr(result.stderr ?? stderr);
      resolve({ stdout: result.stdout, stderr: detail, ok: result.ok && !timedOut, timedOut });
    };

    // resolveGhEnv returns {} when no override is configured, so the
    // child inherits gh's default behaviour in that case.
    const resolved = resolveGhEnv(opts?.ghTarget);
    if (resolved.error) {
      // Configured account isn't logged in — fail fast rather than
      // silently falling back to the wrong account.
      settle({ stdout: "", ok: false, stderr: resolved.error });
      return;
    }
    const env = { ...process.env, ...resolved.env };

    const hasInput = opts?.inputJson !== undefined;
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn("gh", args, {
        stdio: [hasInput ? "pipe" : "ignore", "pipe", "pipe"],
        signal: ac.signal,
        cwd: opts?.cwd,
        env,
      });
    } catch (e) {
      settle({ stdout: "", ok: false, stderr: (e as Error).message });
      return;
    }

    if (hasInput && child.stdin) {
      // Guard against EPIPE if gh exits before reading the body — the close
      // handler still settles with the process exit status.
      child.stdin.on("error", () => {});
      try {
        child.stdin.end(JSON.stringify(opts?.inputJson));
      } catch {
        /* settled by close/error below */
      }
    }

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => settle({ stdout: "", ok: false, stderr: stderr || err.message }));
    child.on("close", (code) => {
      settle({ stdout: stdout.trim(), ok: code === 0 });
    });
  });
}

// Test seam: read helpers in this module route gh invocations through this
// indirection so tests can inject a fake runner (mirrors gh-pr-write.ts).
type GhRunner = typeof runGh;
let ghRunner: GhRunner = runGh;
export function __setGhRunner(fn: GhRunner | null): void {
  ghRunner = fn ?? runGh;
  // A new (or restored) runner means a new fake world — drop the
  // login/@me caches so values from the previous runner can't leak
  // across tests.
  __resetGhCaches();
}

/**
 * Parse the stdout of a `gh api --paginate --slurp` call into a flat array of
 * items. `--slurp` collects each page into an outer array (array-of-pages), so
 * a multi-page response is `[[...page1], [...page2]]` rather than a single
 * concatenated/invalid JSON blob. We flatten one level so callers see the same
 * flat item list whether the PR had one page or ten. A bare object (some
 * single-page error/edge shapes) or a flat array are both tolerated.
 */
export function flattenSlurpedPages<T>(stdout: string): T[] {
  if (!stdout.trim()) return [];
  const parsed = JSON.parse(stdout) as unknown;
  if (!Array.isArray(parsed)) return [parsed as T];
  const out: T[] = [];
  for (const page of parsed) {
    if (Array.isArray(page)) out.push(...(page as T[]));
    else if (page != null) out.push(page as T);
  }
  return out;
}

// ─── Read-path caches ─────────────────────────────────────────────────────────
// The Workbench polls /api/prs; without caching every poll paid three gh
// network round-trips. The login can't change under a running process
// without re-auth (cache for the process lifetime; failures are NOT
// cached so an unauthenticated boot recovers). The @me PR-number set
// changes rarely (cache 5 min; only successful fetches are cached, so a
// transient gh failure doesn't hide "mine" badges for the window).

function ghCacheKey(opts: GhFetchOpts): string {
  return `${opts.ghTarget?.host ?? ""}\0${opts.ghTarget?.user ?? ""}`;
}

const loginCache = new Map<string, string>();
const MINE_TTL_MS = 5 * 60_000;
const mineCache = new Map<string, { at: number; numbers: Set<number> }>();

/** Test hook: drop the login/@me caches (pairs with __setGhRunner). */
export function __resetGhCaches(): void {
  loginCache.clear();
  mineCache.clear();
}

export async function currentLogin(opts: GhFetchOpts): Promise<string> {
  const key = ghCacheKey(opts);
  const cached = loginCache.get(key);
  if (cached !== undefined) return cached;
  const { stdout, ok } = await ghRunner(["api", "user", "--jq", ".login"], opts);
  if (!ok) return "";
  if (stdout) loginCache.set(key, stdout);
  return stdout;
}

export async function fetchMinePrNumbers(opts: GhFetchOpts): Promise<Set<number>> {
  const key = `${ghCacheKey(opts)}\0${opts.cwd ?? ""}`;
  const cached = mineCache.get(key);
  if (cached && Date.now() - cached.at < MINE_TTL_MS) return cached.numbers;
  // Use gh's own "@me" resolution so this works even when the local gh login
  // (e.g. an org-aliased account like "foo-org") differs from the PR author
  // login on the host (e.g. "foo"). Strict string equality on logins is
  // unreliable across SAML/enterprise account mappings.
  const { stdout, ok } = await ghRunner(["pr", "list", "--author", "@me", "--json", "number", "--limit", "100"], opts);
  if (!ok || !stdout) return new Set();
  try {
    const arr = JSON.parse(stdout) as Array<{ number: number }>;
    const numbers = new Set(arr.map((p) => p.number));
    mineCache.set(key, { at: Date.now(), numbers });
    return numbers;
  } catch {
    return new Set();
  }
}

// ─── Single-PR review bundle (Phase 1 of the PR review page) ─────────────────

export interface PrInlineComment {
  id: number;
  user: string;
  body: string;
  path: string;
  position: number | null;
  originalPosition: number | null;
  line: number | null;
  originalLine: number | null;
  side: "RIGHT" | "LEFT" | null;
  startLine: number | null;
  startSide: "RIGHT" | "LEFT" | null;
  inReplyToId: number | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  commitId: string;
}

export interface PrIssueComment {
  id: number;
  user: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

/**
 * A submitted PR review — the top-level summary text that humans and AI
 * reviewers (CodeRabbit, Copilot, Gemini, …) attach to an APPROVE /
 * REQUEST_CHANGES / COMMENT submission. Distinct from inline comments, which
 * come from the `/pulls/{n}/comments` endpoint.
 */
export interface PrReview {
  id: number;
  user: string;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED";
  body: string;
  submittedAt: string | null;
  htmlUrl: string;
}

export interface PrBundleWarning {
  source: "diff" | "inlineComments" | "issueComments" | "prReviews" | "linkage";
  message: string;
}

export interface PrBundle {
  pr: GhPr;
  diff: string;
  diffStats: { additions: number; deletions: number; changedFiles: number };
  inlineComments: PrInlineComment[];
  issueComments: PrIssueComment[];
  prReviews: PrReview[];
  warnings: PrBundleWarning[];
}

export type FetchPrBundleResult = { ok: true; bundle: PrBundle } | { ok: false; error: string };

interface RawPrView {
  number: number;
  title: string;
  headRefName: string;
  baseRefName: string;
  url: string;
  isDraft: boolean;
  statusCheckRollup: Array<{ state?: string; conclusion?: string }> | null;
  reviewDecision: string | null;
  author: { login?: string } | null;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

interface RawInlineComment {
  id: number;
  user?: { login?: string } | null;
  body?: string;
  path?: string;
  position?: number | null;
  original_position?: number | null;
  line?: number | null;
  original_line?: number | null;
  side?: string | null;
  start_line?: number | null;
  start_side?: string | null;
  in_reply_to_id?: number | null;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
  commit_id?: string;
}

interface RawIssueComment {
  id: number;
  user?: { login?: string } | null;
  body?: string;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
}

interface RawPrReview {
  id: number;
  user?: { login?: string } | null;
  body?: string;
  state?: string;
  submitted_at?: string | null;
  html_url?: string;
}

function normalizeReviewState(value: string | undefined): PrReview["state"] | null {
  if (value === "APPROVED" || value === "CHANGES_REQUESTED" || value === "COMMENTED") return value;
  return null;
}

function rollupCiStatus(checks: Array<{ state?: string; conclusion?: string }> | null): string | null {
  const arr = checks ?? [];
  const hasFailure = arr.some((c) => c.state === "FAILURE" || c.conclusion === "FAILURE");
  const allSuccess = arr.length > 0 && arr.every((c) => c.state === "SUCCESS" || c.conclusion === "SUCCESS");
  const hasPending = arr.some((c) => c.state === "PENDING" || c.conclusion === null);
  return hasFailure ? "FAILURE" : allSuccess ? "SUCCESS" : hasPending ? "PENDING" : null;
}

function normalizeSide(value: string | null | undefined): "RIGHT" | "LEFT" | null {
  if (value === "RIGHT" || value === "LEFT") return value;
  return null;
}

export function parseNameWithOwner(url: string): { owner: string; repo: string } | null {
  // gh urls look like https://github.com/owner/repo/pull/N (or enterprise host).
  const m = url.match(/https?:\/\/[^/]+\/([^/]+)\/([^/]+)\/(?:pull|pulls)\/\d+/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

/**
 * Host the PR lives on, parsed from its url. `gh api` (unlike `gh pr view`)
 * defaults to github.com and does NOT auto-detect the host from the local
 * git remote, so enterprise PRs need the host pinned via --hostname or the
 * comment endpoints 404. Returns null for github.com (the default) so we
 * only add the flag when it changes behaviour.
 */
export function parseApiHost(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return host && host !== "github.com" ? host : null;
  } catch {
    return null;
  }
}

/**
 * Fetch everything the PR review page needs in a single fan-out.
 *
 * `pr view` is the only mandatory call — if it fails we return `ok: false`
 * (the route maps this to a 404). The other three calls each carry their
 * own try-block so a single gh hiccup degrades to a warning rather than
 * failing the whole bundle.
 */
export async function fetchPrBundle(prNum: number, opts: GhFetchOpts): Promise<FetchPrBundleResult> {
  const prJsonFields =
    "number,title,headRefName,baseRefName,url,isDraft,statusCheckRollup,reviewDecision,author,updatedAt,additions,deletions,changedFiles";
  const prViewPromise = ghRunner(["pr", "view", String(prNum), "--json", prJsonFields], opts);
  const diffPromise = ghRunner(["pr", "diff", String(prNum)], opts);

  // The two comment endpoints need {owner}/{repo} which `gh api` doesn't
  // template for us; resolve once in parallel with pr view + diff.
  const repoPromise = ghRunner(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"], opts);

  const [prViewRes, diffRes, repoRes] = await Promise.all([prViewPromise, diffPromise, repoPromise]);

  if (!prViewRes.ok || !prViewRes.stdout) {
    return {
      ok: false,
      error: prViewRes.stdout || `gh pr view ${prNum} failed${prViewRes.stderr ? `: ${prViewRes.stderr}` : ""}`,
    };
  }
  let raw: RawPrView;
  try {
    raw = JSON.parse(prViewRes.stdout) as RawPrView;
  } catch (e) {
    return { ok: false, error: `gh pr view returned invalid JSON: ${(e as Error).message}` };
  }

  const warnings: PrBundleWarning[] = [];
  let diff = "";
  if (diffRes.ok) {
    diff = diffRes.stdout;
  } else {
    warnings.push({
      source: "diff",
      message: `gh pr diff ${prNum} failed${diffRes.stderr ? `: ${diffRes.stderr}` : ""}`,
    });
  }

  let inlineComments: PrInlineComment[] = [];
  let issueComments: PrIssueComment[] = [];
  let prReviews: PrReview[] = [];

  const ownerRepo = repoRes.ok && repoRes.stdout ? repoRes.stdout : null;
  const fallback = parseNameWithOwner(raw.url);
  const resolved = ownerRepo ? { full: ownerRepo } : fallback ? { full: `${fallback.owner}/${fallback.repo}` } : null;

  // `gh api` defaults to github.com and won't infer the enterprise host from
  // the local git remote the way `gh pr view`/`pr diff` do, so pin it from the
  // PR url. Empty array for github.com PRs leaves the call unchanged.
  const apiHost = parseApiHost(raw.url);
  const hostArgs = apiHost ? ["--hostname", apiHost] : [];

  if (!resolved) {
    warnings.push({ source: "inlineComments", message: "could not resolve owner/repo for gh api calls" });
    warnings.push({ source: "issueComments", message: "could not resolve owner/repo for gh api calls" });
    warnings.push({ source: "prReviews", message: "could not resolve owner/repo for gh api calls" });
  } else {
    // `--paginate --slurp` everywhere below: without `--slurp` a >100-item
    // response is back-to-back JSON arrays that JSON.parse rejects, silently
    // dropping every comment/review on exactly the busy PRs being worked.
    //
    // The three endpoints are independent, so the calls are started
    // together and only awaited in parsing order — one round-trip wave
    // instead of three for the review page's bundle load.
    const ghFallback = (e: unknown) => ({
      ok: false,
      stdout: "",
      stderr: String((e as Error)?.message ?? e),
      timedOut: false,
    });
    const inlinePromise = ghRunner(
      ["api", `repos/${resolved.full}/pulls/${prNum}/comments`, "--paginate", "--slurp", ...hostArgs],
      opts,
    ).catch(ghFallback);
    const issuePromise = ghRunner(
      ["api", `repos/${resolved.full}/issues/${prNum}/comments`, "--paginate", "--slurp", ...hostArgs],
      opts,
    ).catch(ghFallback);
    const reviewsPromise = ghRunner(
      ["api", `repos/${resolved.full}/pulls/${prNum}/reviews`, "--paginate", "--slurp", ...hostArgs],
      opts,
    ).catch(ghFallback);

    const inlineRes = await inlinePromise;
    if (inlineRes.ok && inlineRes.stdout) {
      try {
        const parsed = flattenSlurpedPages<RawInlineComment>(inlineRes.stdout);
        inlineComments = parsed.map((c) => ({
          id: c.id,
          user: c.user?.login ?? "",
          body: c.body ?? "",
          path: c.path ?? "",
          position: c.position ?? null,
          originalPosition: c.original_position ?? null,
          line: c.line ?? null,
          originalLine: c.original_line ?? null,
          side: normalizeSide(c.side),
          startLine: c.start_line ?? null,
          startSide: normalizeSide(c.start_side),
          inReplyToId: c.in_reply_to_id ?? null,
          createdAt: c.created_at ?? "",
          updatedAt: c.updated_at ?? "",
          htmlUrl: c.html_url ?? "",
          commitId: c.commit_id ?? "",
        }));
      } catch (e) {
        warnings.push({ source: "inlineComments", message: `parse error: ${(e as Error).message}` });
      }
    } else {
      warnings.push({
        source: "inlineComments",
        message: `gh api pulls/${prNum}/comments failed${inlineRes.stderr ? `: ${inlineRes.stderr}` : ""}`,
      });
    }

    const issueRes = await issuePromise;
    if (issueRes.ok && issueRes.stdout) {
      try {
        const parsed = flattenSlurpedPages<RawIssueComment>(issueRes.stdout);
        issueComments = parsed.map((c) => ({
          id: c.id,
          user: c.user?.login ?? "",
          body: c.body ?? "",
          createdAt: c.created_at ?? "",
          updatedAt: c.updated_at ?? "",
          htmlUrl: c.html_url ?? "",
        }));
      } catch (e) {
        warnings.push({ source: "issueComments", message: `parse error: ${(e as Error).message}` });
      }
    } else {
      warnings.push({
        source: "issueComments",
        message: `gh api issues/${prNum}/comments failed${issueRes.stderr ? `: ${issueRes.stderr}` : ""}`,
      });
    }

    const reviewsRes = await reviewsPromise;
    if (reviewsRes.ok && reviewsRes.stdout) {
      try {
        const parsed = flattenSlurpedPages<RawPrReview>(reviewsRes.stdout);
        prReviews = parsed
          .map((r) => {
            const state = normalizeReviewState(r.state);
            const body = (r.body ?? "").trim();
            // Keep only reviews that carry a usable summary. PENDING/DISMISSED
            // states normalize to null; empty-body APPROVE/COMMENT reviews are
            // just a thumbs-up with nothing to act on.
            if (!state || body.length === 0) return null;
            return {
              id: r.id,
              user: r.user?.login ?? "",
              state,
              body,
              submittedAt: r.submitted_at ?? null,
              htmlUrl: r.html_url ?? "",
            } satisfies PrReview;
          })
          .filter((r): r is PrReview => r !== null);
      } catch (e) {
        warnings.push({ source: "prReviews", message: `parse error: ${(e as Error).message}` });
      }
    } else {
      warnings.push({
        source: "prReviews",
        message: `gh api pulls/${prNum}/reviews failed${reviewsRes.stderr ? `: ${reviewsRes.stderr}` : ""}`,
      });
    }
  }

  const pr: GhPr = {
    number: raw.number,
    title: raw.title,
    headRefName: raw.headRefName,
    baseRefName: raw.baseRefName,
    url: raw.url,
    isDraft: raw.isDraft,
    statusCheckRollup: rollupCiStatus(raw.statusCheckRollup),
    reviewDecision: raw.reviewDecision,
    author: raw.author?.login ?? "",
    updatedAt: raw.updatedAt,
    additions: raw.additions,
    deletions: raw.deletions,
    changedFiles: raw.changedFiles,
    commentsCount: inlineComments.length + issueComments.length,
    reviewsCount: 0,
    isMine: false,
  };

  return {
    ok: true,
    bundle: {
      pr,
      diff,
      diffStats: { additions: raw.additions, deletions: raw.deletions, changedFiles: raw.changedFiles },
      inlineComments,
      issueComments,
      prReviews,
      warnings,
    },
  };
}

/**
 * `ok: false` marks a failure-shaped result (gh call failed or returned
 * unparseable JSON) as opposed to a genuinely-empty PR list. The serve
 * layer uses this to skip caching failures — otherwise a transient gh
 * hiccup would pin "No open PRs" for the whole SWR window.
 */
export async function fetchPrs(opts: GhFetchOpts): Promise<{ prs: GhPr[]; me: string; ok?: boolean }> {
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
  // The list has no data dependency on login/@me (isMine is computed after
  // the fact), so all three round-trips run concurrently. With the
  // login/@me caches warm this is a single gh call.
  const [me, mineNumbers, { stdout, ok }] = await Promise.all([
    currentLogin(opts),
    fetchMinePrNumbers(opts),
    ghRunner(
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
    ),
  ]);
  if (!ok || !stdout) return { prs: [], me, ok: false };
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
    return { prs: mapped, me, ok: true };
  } catch {
    return { prs: [], me, ok: false };
  }
}
