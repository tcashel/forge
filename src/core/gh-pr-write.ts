/**
 * GitHub PR write helpers — post Forge review findings as inline comments and
 * resolve/reply on their threads when fixed/disputed.
 *
 * Mirrors `gh-pr.ts` conventions: every call routes through `runGh` (the
 * single gh-spawn path), honours per-repo `ghTarget` account/host resolution,
 * and pins the enterprise host via `parseApiHost`. `gh api` doesn't template
 * `{owner}/{repo}`, so each helper resolves `{ ownerRepo, apiHost }` the way
 * `fetchPrBundle` does — or reuses an already-resolved pair passed in `opts`.
 *
 * All calls are best-effort: failures return `{ ok: false, error }` (or an
 * empty list) for the caller to log; they never throw.
 */

import { partitionFindingsByDiff } from "./diff-anchoring.ts";
import { buildFindingCommentBody, buildFindingMarker, extractFindingIds } from "./forge-comment-marker.ts";
import { type GhFetchOpts, parseApiHost, parseNameWithOwner, runGh } from "./gh-pr.ts";
import type { ForgeFinding } from "./reviewer.ts";

// Test seam: all gh invocations go through this indirection so tests can
// inject a fake runner that records calls and returns canned output without
// spawning the real `gh` binary.
type GhRunner = typeof runGh;
let ghRunner: GhRunner = runGh;
export function __setGhRunner(fn: GhRunner | null): void {
  ghRunner = fn ?? runGh;
}

export interface ResolvedApiTarget {
  ownerRepo: string;
  apiHost: string | null;
}

/**
 * Resolve `{ ownerRepo, apiHost }` for a PR's `gh api` calls. Uses the values
 * already on `opts` when present (the publish worker pre-resolves them from
 * the PR url it fetched), otherwise mirrors `fetchPrBundle`: `gh repo view`
 * for owner/repo and the PR url for the enterprise host.
 */
export async function resolvePrApiTarget(prNum: number, opts: GhFetchOpts): Promise<ResolvedApiTarget | null> {
  if (opts.ownerRepo) {
    return { ownerRepo: opts.ownerRepo, apiHost: opts.apiHost ?? null };
  }
  const repoRes = await ghRunner(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"], opts).catch(
    () => ({ ok: false, stdout: "" }),
  );
  const urlRes = await ghRunner(["pr", "view", String(prNum), "--json", "url", "--jq", ".url"], opts).catch(() => ({
    ok: false,
    stdout: "",
  }));
  const url = urlRes.ok ? urlRes.stdout : "";
  const fallback = url ? parseNameWithOwner(url) : null;
  const ownerRepo =
    repoRes.ok && repoRes.stdout ? repoRes.stdout : fallback ? `${fallback.owner}/${fallback.repo}` : null;
  if (!ownerRepo) return null;
  return { ownerRepo, apiHost: url ? parseApiHost(url) : (opts.apiHost ?? null) };
}

function hostArgsFor(apiHost: string | null): string[] {
  return apiHost ? ["--hostname", apiHost] : [];
}

export interface InlineCommentInput {
  path: string;
  line: number;
  startLine?: number;
  side: "RIGHT";
  body: string;
}

export interface PostReviewArgs {
  commitId: string;
  inline: InlineCommentInput[];
  bodySummary: string;
}

export interface GhWriteResult {
  ok: boolean;
  error?: string;
}

/**
 * Post a single PR review (`event: "COMMENT"`) carrying one inline comment per
 * in-diff finding plus a summary body. One review event — not N comment posts.
 */
export async function postReviewWithInlineComments(
  prNum: number,
  args: PostReviewArgs,
  opts: GhFetchOpts,
): Promise<GhWriteResult> {
  const target = await resolvePrApiTarget(prNum, opts);
  if (!target) return { ok: false, error: "could not resolve owner/repo for gh api call" };

  const comments = args.inline.map((c) => {
    const o: Record<string, unknown> = { path: c.path, line: c.line, side: c.side, body: c.body };
    if (c.startLine != null && c.startLine !== c.line) {
      o.start_line = c.startLine;
      o.start_side = c.side;
    }
    return o;
  });
  const payload: Record<string, unknown> = { event: "COMMENT", body: args.bodySummary, comments };
  if (args.commitId) payload.commit_id = args.commitId;

  const res = await ghRunner(
    [
      "api",
      "--method",
      "POST",
      `repos/${target.ownerRepo}/pulls/${prNum}/reviews`,
      "--input",
      "-",
      ...hostArgsFor(target.apiHost),
    ],
    { ...opts, inputJson: payload },
  );
  return res.ok ? { ok: true } : { ok: false, error: res.stdout || "gh api reviews POST failed" };
}

export interface ReviewThread {
  threadId: string;
  isResolved: boolean;
  comments: Array<{ databaseId: number; body: string }>;
}

const REVIEW_THREADS_QUERY = `query($owner:String!,$repo:String!,$num:Int!){
  repository(owner:$owner,name:$repo){
    pullRequest(number:$num){
      reviewThreads(first:100){
        nodes{
          id
          isResolved
          comments(first:50){ nodes{ databaseId body } }
        }
      }
    }
  }
}`;

/**
 * Fetch the PR's review threads via GraphQL. The REST comment id
 * (`databaseId`) is carried alongside the GraphQL thread node id because
 * resolving a thread needs the node id, not the REST id. Capped at the first
 * 100 threads — sufficient for Forge-authored reviews; a deeper page would
 * need cursor pagination.
 */
export async function fetchReviewThreads(prNum: number, opts: GhFetchOpts): Promise<ReviewThread[]> {
  const target = await resolvePrApiTarget(prNum, opts);
  if (!target) return [];
  const [owner, repo] = target.ownerRepo.split("/");
  if (!owner || !repo) return [];

  const res = await ghRunner(
    [
      "api",
      "graphql",
      ...hostArgsFor(target.apiHost),
      "-f",
      `query=${REVIEW_THREADS_QUERY}`,
      "-f",
      `owner=${owner}`,
      "-f",
      `repo=${repo}`,
      "-F",
      `num=${prNum}`,
    ],
    opts,
  ).catch(() => ({ ok: false, stdout: "" }));
  if (!res.ok || !res.stdout) return [];
  try {
    const parsed = JSON.parse(res.stdout) as {
      data?: {
        repository?: {
          pullRequest?: {
            reviewThreads?: {
              nodes?: Array<{
                id: string;
                isResolved: boolean;
                comments?: { nodes?: Array<{ databaseId: number; body: string }> };
              }>;
            };
          };
        };
      };
    };
    const nodes = parsed.data?.repository?.pullRequest?.reviewThreads?.nodes ?? [];
    return nodes.map((n) => ({
      threadId: n.id,
      isResolved: n.isResolved,
      comments: (n.comments?.nodes ?? []).map((c) => ({ databaseId: c.databaseId, body: c.body ?? "" })),
    }));
  } catch {
    return [];
  }
}

const RESOLVE_THREAD_MUTATION = `mutation($id:ID!){ resolveReviewThread(input:{threadId:$id}){ thread { id isResolved } } }`;

/**
 * Resolve a review thread by its GraphQL node id. `opts.apiHost` pins the
 * enterprise host (callers resolve the target once and pass it through).
 */
export async function resolveReviewThread(threadId: string, opts: GhFetchOpts): Promise<GhWriteResult> {
  const res = await ghRunner(
    [
      "api",
      "graphql",
      ...hostArgsFor(opts.apiHost ?? null),
      "-f",
      `query=${RESOLVE_THREAD_MUTATION}`,
      "-f",
      `id=${threadId}`,
    ],
    opts,
  );
  return res.ok ? { ok: true } : { ok: false, error: res.stdout || "resolveReviewThread mutation failed" };
}

/**
 * Reply to an inline review comment (REST). Used to post a dispute reason on a
 * thread Forge published, leaving the thread open.
 */
export async function replyToReviewComment(
  prNum: number,
  commentId: number,
  body: string,
  opts: GhFetchOpts,
): Promise<GhWriteResult> {
  const target = await resolvePrApiTarget(prNum, opts);
  if (!target) return { ok: false, error: "could not resolve owner/repo for gh api call" };
  const res = await ghRunner(
    [
      "api",
      "--method",
      "POST",
      `repos/${target.ownerRepo}/pulls/${prNum}/comments/${commentId}/replies`,
      "--input",
      "-",
      ...hostArgsFor(target.apiHost),
    ],
    { ...opts, inputJson: { body } },
  );
  return res.ok ? { ok: true } : { ok: false, error: res.stdout || "reply POST failed" };
}

/**
 * Fetch the set of finding ids already published on the PR — parsed from both
 * prior inline comment bodies and prior PR review bodies (out-of-diff findings
 * carry their marker in the review body). Drives idempotent re-publishing.
 */
export async function fetchPublishedFindingIds(prNum: number, opts: GhFetchOpts): Promise<Set<string>> {
  const target = await resolvePrApiTarget(prNum, opts);
  const ids = new Set<string>();
  if (!target) return ids;
  const hostArgs = hostArgsFor(target.apiHost);

  const inlineRes = await ghRunner(
    ["api", `repos/${target.ownerRepo}/pulls/${prNum}/comments`, "--paginate", ...hostArgs],
    opts,
  ).catch(() => ({ ok: false, stdout: "" }));
  if (inlineRes.ok && inlineRes.stdout) {
    try {
      const arr = JSON.parse(inlineRes.stdout) as Array<{ body?: string }>;
      for (const c of arr) for (const id of extractFindingIds(c.body ?? "")) ids.add(id);
    } catch {
      /* ignore parse error — best-effort */
    }
  }

  const reviewsRes = await ghRunner(
    ["api", `repos/${target.ownerRepo}/pulls/${prNum}/reviews`, "--paginate", ...hostArgs],
    opts,
  ).catch(() => ({ ok: false, stdout: "" }));
  if (reviewsRes.ok && reviewsRes.stdout) {
    try {
      const arr = JSON.parse(reviewsRes.stdout) as Array<{ body?: string }>;
      for (const r of arr) for (const id of extractFindingIds(r.body ?? "")) ids.add(id);
    } catch {
      /* ignore parse error */
    }
  }
  return ids;
}

function buildReviewBodySummary(outOfDiff: ForgeFinding[]): string {
  const lines = ["Forge automated review."];
  if (outOfDiff.length > 0) {
    lines.push("", "**Findings outside the diff hunks:**", "");
    for (const f of outOfDiff) {
      const loc = f.lineStart > 0 ? `${f.file}:${f.lineStart}` : f.file;
      lines.push(`- **[${f.severity}]** ${f.title} (\`${loc}\`) ${buildFindingMarker(f.id, f.severity)}`);
    }
  }
  return lines.join("\n");
}

export interface PublishResult {
  posted: number;
  outOfDiff: number;
  skipped: number;
  skippedPost: boolean;
}

/**
 * Idempotently publish review findings to the PR. Fetches already-published
 * ids, partitions remaining findings against the diff, posts a single review
 * with one inline comment per new in-diff finding plus a body listing new
 * out-of-diff findings. Skips the POST entirely when nothing new anchors.
 */
export async function publishReviewFindings(
  prNum: number,
  args: { findings: ForgeFinding[]; diff: string; commitId: string },
  opts: GhFetchOpts,
  log: (msg: string) => void = () => {},
): Promise<PublishResult> {
  const published = await fetchPublishedFindingIds(prNum, opts);
  const { inDiff, outOfDiff } = partitionFindingsByDiff(args.findings, args.diff);

  const newInDiff = inDiff.filter((a) => !published.has(a.finding.id));
  const newOutOfDiff = outOfDiff.filter((f) => !published.has(f.id));
  const skipped = args.findings.length - newInDiff.length - newOutOfDiff.length;

  if (newInDiff.length === 0 && newOutOfDiff.length === 0) {
    log(`[publish] nothing new to post (${skipped} already published)`);
    return { posted: 0, outOfDiff: 0, skipped, skippedPost: true };
  }

  const inline: InlineCommentInput[] = newInDiff.map((a) => ({
    path: a.finding.file,
    line: a.line,
    startLine: a.startLine,
    side: a.side,
    body: buildFindingCommentBody(a.finding),
  }));
  const bodySummary = buildReviewBodySummary(newOutOfDiff);

  const res = await postReviewWithInlineComments(prNum, { commitId: args.commitId, inline, bodySummary }, opts);
  if (!res.ok) {
    log(`[publish] review post failed: ${res.error ?? "unknown"}`);
    return { posted: 0, outOfDiff: 0, skipped, skippedPost: false };
  }
  log(
    `[publish] posted ${newInDiff.length} inline, ${newOutOfDiff.length} out-of-diff, skipped ${skipped} already published`,
  );
  return { posted: newInDiff.length, outOfDiff: newOutOfDiff.length, skipped, skippedPost: false };
}
