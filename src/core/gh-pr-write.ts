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
import { flattenSlurpedPages, type GhFetchOpts, parseApiHost, parseNameWithOwner, runGh } from "./gh-pr.ts";
import type { FindingPublishOutcome } from "./publish-record.ts";
import type { ForgeFinding } from "./reviewer.ts";

// Test seam: all gh invocations go through this indirection so tests can
// inject a fake runner that records calls and returns canned output without
// spawning the real `gh` binary.
type GhRunner = typeof runGh;
let ghRunner: GhRunner = runGh;
export function __setGhRunner(fn: GhRunner | null): void {
  ghRunner = fn ?? runGh;
}

/**
 * Compose the diagnostic detail for a failed gh call. gh splits its failure
 * story across streams (HTTP error JSON on stdout, message + status on
 * stderr); fakes injected by tests may omit `stderr` entirely.
 */
function ghErrorDetail(res: { stdout?: string; stderr?: string }, fallback: string): string {
  const parts = [res.stdout?.trim(), res.stderr?.trim()].filter((s): s is string => !!s && s.length > 0);
  return parts.join(" — ") || fallback;
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
    () => ({ ok: false, stdout: "", stderr: "", timedOut: false }),
  );
  const urlRes = await ghRunner(["pr", "view", String(prNum), "--json", "url", "--jq", ".url"], opts).catch(() => ({
    ok: false,
    stdout: "",
    stderr: "",
    timedOut: false,
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

/** `gh pr ready` — flip a draft PR to ready-for-review. */
export async function markPrReady(prNum: number, opts: GhFetchOpts): Promise<GhWriteResult> {
  const res = await ghRunner(["pr", "ready", String(prNum)], opts);
  if (!res.ok) return { ok: false, error: ghErrorDetail(res, `gh pr ready ${prNum} failed`) };
  return { ok: true };
}

/**
 * `gh pr review --approve` — submit an approving review. GitHub rejects
 * self-approval (422); the caller surfaces gh's error verbatim rather than
 * pre-gating, so enterprise policy differences stay GitHub's call.
 */
export async function approvePr(prNum: number, opts: GhFetchOpts, body?: string): Promise<GhWriteResult> {
  const args = ["pr", "review", String(prNum), "--approve"];
  if (body?.trim()) args.push("--body", body.trim());
  const res = await ghRunner(args, opts);
  if (!res.ok) return { ok: false, error: ghErrorDetail(res, `gh pr review ${prNum} --approve failed`) };
  return { ok: true };
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
  return res.ok ? { ok: true } : { ok: false, error: ghErrorDetail(res, "gh api reviews POST failed") };
}

export interface ReviewThread {
  threadId: string;
  isResolved: boolean;
  comments: Array<{ databaseId: number; body: string }>;
}

const REVIEW_THREADS_QUERY = `query($owner:String!,$repo:String!,$num:Int!,$after:String){
  repository(owner:$owner,name:$repo){
    pullRequest(number:$num){
      reviewThreads(first:100,after:$after){
        pageInfo{ hasNextPage endCursor }
        nodes{
          id
          isResolved
          comments(first:50){ nodes{ databaseId body } }
        }
      }
    }
  }
}`;

// Hard ceiling on cursor pages so a malformed `hasNextPage`/`endCursor` can't
// spin forever. 100 threads/page × 50 pages = 5000 threads, far beyond any
// realistic Forge-reviewed PR.
const MAX_REVIEW_THREAD_PAGES = 50;

interface ReviewThreadsPage {
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  nodes?: Array<{
    id: string;
    isResolved: boolean;
    comments?: { nodes?: Array<{ databaseId: number; body: string }> };
  }>;
}

/**
 * Fetch the PR's review threads via GraphQL, paging through `pageInfo` until
 * exhausted (or the page ceiling is hit). The REST comment id (`databaseId`)
 * is carried alongside the GraphQL thread node id because resolving a thread
 * needs the node id, not the REST id. Paging matters: published finding threads
 * past the first 100 are otherwise invisible to resolve-on-fix and bundle
 * enrichment, so fixed findings would never resolve on busy PRs.
 */
export async function fetchReviewThreads(prNum: number, opts: GhFetchOpts): Promise<ReviewThread[]> {
  const target = await resolvePrApiTarget(prNum, opts);
  if (!target) return [];
  const [owner, repo] = target.ownerRepo.split("/");
  if (!owner || !repo) return [];

  const threads: ReviewThread[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_REVIEW_THREAD_PAGES; page++) {
    const args = [
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
    ];
    // GraphQL `$after` is nullable; only send it once we have a cursor so the
    // first request fetches from the start.
    if (after) args.push("-f", `after=${after}`);

    const res = await ghRunner(args, opts).catch(() => ({ ok: false, stdout: "", stderr: "", timedOut: false }));
    if (!res.ok || !res.stdout) break;
    let connection: ReviewThreadsPage | undefined;
    try {
      const parsed = JSON.parse(res.stdout) as {
        data?: { repository?: { pullRequest?: { reviewThreads?: ReviewThreadsPage } } };
      };
      connection = parsed.data?.repository?.pullRequest?.reviewThreads;
    } catch {
      break;
    }
    const nodes = connection?.nodes ?? [];
    for (const n of nodes) {
      threads.push({
        threadId: n.id,
        isResolved: n.isResolved,
        comments: (n.comments?.nodes ?? []).map((c) => ({ databaseId: c.databaseId, body: c.body ?? "" })),
      });
    }
    const info = connection?.pageInfo;
    if (!info?.hasNextPage || !info.endCursor) break;
    after = info.endCursor;
  }
  return threads;
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
  return res.ok ? { ok: true } : { ok: false, error: ghErrorDetail(res, "resolveReviewThread mutation failed") };
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
  return res.ok ? { ok: true } : { ok: false, error: ghErrorDetail(res, "reply POST failed") };
}

export type PublishedFindingIdsResult =
  | { ok: true; ids: Set<string>; anchors: Set<string> }
  | { ok: false; error: string };

/** Key for the colocated-anchor dedup set: current anchor of a marker comment. */
export function anchorKey(path: string, line: number): string {
  return `${path}:${line}`;
}

/**
 * Fetch the set of finding ids already published on the PR — parsed from both
 * prior inline comment bodies and prior PR review bodies (out-of-diff findings
 * carry their marker in the review body). Drives idempotent re-publishing.
 *
 * Reconciliation is a required precondition for posting: a fetch or parse
 * failure returns `{ ok: false, error }` rather than an incomplete id set, so
 * the caller can skip the review POST instead of treating the failure as
 * "nothing published" and re-posting already-published findings.
 */
export async function fetchPublishedFindingIds(prNum: number, opts: GhFetchOpts): Promise<PublishedFindingIdsResult> {
  const target = await resolvePrApiTarget(prNum, opts);
  if (!target) return { ok: false, error: "could not resolve owner/repo for gh api call" };
  const hostArgs = hostArgsFor(target.apiHost);
  const ids = new Set<string>();
  const anchors = new Set<string>();

  // `--paginate --slurp`: across multiple pages gh emits one JSON array per
  // page collected into an outer array. Without `--slurp` a >1-page response is
  // concatenated JSON documents that `JSON.parse` rejects — which previously
  // hit the parse-error path and skipped publishing on busy PRs.
  const inlineRes = await ghRunner(
    ["api", `repos/${target.ownerRepo}/pulls/${prNum}/comments`, "--paginate", "--slurp", ...hostArgs],
    opts,
  ).catch((e) => ({ ok: false, stdout: "", stderr: String((e as Error)?.message ?? e), timedOut: false }));
  if (!inlineRes.ok) {
    return { ok: false, error: `could not fetch existing inline comments: ${ghErrorDetail(inlineRes, "unknown")}` };
  }
  if (inlineRes.stdout) {
    try {
      const arr = flattenSlurpedPages<{ body?: string; path?: string; line?: number | null }>(inlineRes.stdout);
      for (const c of arr) {
        const markerIds = extractFindingIds(c.body ?? "");
        for (const id of markerIds) ids.add(id);
        // Marker comments also contribute their CURRENT anchor: re-reviews are
        // LLM passes that re-title the same defect (new id), so exact-id dedup
        // alone re-posts it. A still-anchored marker comment at the same
        // path:line is treated as the same finding. `line` is null once the
        // comment is outdated — those no longer claim an anchor.
        if (markerIds.length > 0 && c.path && typeof c.line === "number") {
          anchors.add(anchorKey(c.path, c.line));
        }
      }
    } catch (e) {
      return { ok: false, error: `could not parse existing inline comments: ${(e as Error).message}` };
    }
  }

  const reviewsRes = await ghRunner(
    ["api", `repos/${target.ownerRepo}/pulls/${prNum}/reviews`, "--paginate", "--slurp", ...hostArgs],
    opts,
  ).catch((e) => ({ ok: false, stdout: "", stderr: String((e as Error)?.message ?? e), timedOut: false }));
  if (!reviewsRes.ok) {
    return { ok: false, error: `could not fetch existing reviews: ${ghErrorDetail(reviewsRes, "unknown")}` };
  }
  if (reviewsRes.stdout) {
    try {
      const arr = flattenSlurpedPages<{ body?: string }>(reviewsRes.stdout);
      for (const r of arr) for (const id of extractFindingIds(r.body ?? "")) ids.add(id);
    } catch (e) {
      return { ok: false, error: `could not parse existing reviews: ${(e as Error).message}` };
    }
  }
  return { ok: true, ids, anchors };
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

export type PublishResultState = "published" | "partial" | "failed" | "nothing-new" | "reconcile-failed";

export interface PublishResult {
  state: PublishResultState;
  posted: number;
  outOfDiff: number;
  skipped: number;
  skippedPost: boolean;
  failed: number;
  error: string | null;
  /** Per-finding outcome for every finding passed in. */
  findings: FindingPublishOutcome[];
}

/** GitHub rejects un-anchorable inline comments with HTTP 422. */
function isAnchoring422(error: string): boolean {
  return /\b422\b|unprocessable/i.test(error);
}

/**
 * Idempotently publish review findings to the PR. Fetches already-published
 * ids, partitions remaining findings against the diff, posts a single review
 * with one inline comment per new in-diff finding plus a body listing new
 * out-of-diff findings. Skips the POST entirely when nothing new anchors.
 *
 * When the batched review POST fails with more than one inline comment, falls
 * back to posting findings INDIVIDUALLY (one single-comment review each) so a
 * single bad anchor can't sink the batch; a finding whose individual POST
 * 422s on anchoring degrades to an out-of-diff body mention. Idempotency via
 * the embedded markers makes retries of any partial outcome safe.
 */
export async function publishReviewFindings(
  prNum: number,
  args: { findings: ForgeFinding[]; diff: string; commitId: string },
  opts: GhFetchOpts,
  log: (msg: string) => void = () => {},
): Promise<PublishResult> {
  const reconciled = await fetchPublishedFindingIds(prNum, opts);
  if (!reconciled.ok) {
    // Reconciliation is a hard precondition: without a reliable view of what's
    // already on the PR we can't post without risking duplicates. Skip and log.
    log(`[publish] skipping review post — could not reconcile published findings: ${reconciled.error}`);
    return {
      state: "reconcile-failed",
      posted: 0,
      outOfDiff: 0,
      skipped: 0,
      skippedPost: true,
      failed: args.findings.length,
      error: reconciled.error,
      findings: args.findings.map((f) => ({
        id: f.id,
        status: "failed" as const,
        error: `reconcile failed: ${reconciled.error}`,
      })),
    };
  }
  const published = reconciled.ids;
  const { inDiff, outOfDiff } = partitionFindingsByDiff(args.findings, args.diff);

  // Two dedup layers: exact marker id, then colocated anchor. The id is
  // sha1(file|lineStart|title), but a re-review is an independent LLM pass that
  // routinely re-titles the same defect and shifts its line — so a new-id
  // finding that anchors exactly where a live marker comment already sits is
  // the same finding, not a new one. Verified live on PR #68: without this,
  // every re-review duplicated every comment.
  const colocated = inDiff.filter(
    (a) => !published.has(a.finding.id) && reconciled.anchors.has(anchorKey(a.path, a.line)),
  );
  const newInDiff = inDiff.filter(
    (a) => !published.has(a.finding.id) && !reconciled.anchors.has(anchorKey(a.path, a.line)),
  );
  const newOutOfDiff = outOfDiff.filter((f) => !published.has(f.id));
  const skipped = args.findings.length - newInDiff.length - newOutOfDiff.length;
  if (colocated.length > 0) {
    log(
      `[publish] ${colocated.length} finding(s) skipped — an existing Forge comment already anchors at the same line: ${colocated
        .map((a) => anchorKey(a.path, a.line))
        .join(", ")}`,
    );
  }
  const outcomes: FindingPublishOutcome[] = [
    ...args.findings
      .filter((f) => published.has(f.id))
      .map((f) => ({ id: f.id, status: "already-published" as const })),
    // Colocated ≠ verified: the marker id was NOT found on the PR, we are
    // inferring "same defect, re-titled" from the shared anchor. A distinct
    // status keeps that inference visible in publish.json / the CLI outcome
    // table, so a genuinely new same-line finding is auditable instead of
    // silently passing as already-published.
    ...colocated.map((a) => ({
      id: a.finding.id,
      status: "skipped-colocated" as const,
      error: `existing Forge comment anchors at ${anchorKey(a.path, a.line)} — assumed re-titled duplicate`,
    })),
  ];

  if (newInDiff.length === 0 && newOutOfDiff.length === 0) {
    log(`[publish] nothing new to post (${skipped} already published)`);
    return {
      state: "nothing-new",
      posted: 0,
      outOfDiff: 0,
      skipped,
      skippedPost: true,
      failed: 0,
      error: null,
      findings: outcomes,
    };
  }

  const inline: InlineCommentInput[] = newInDiff.map((a) => ({
    // Use the anchor's NEW (post-rename) path, not finding.file — a RIGHT-side
    // comment on a renamed file's old path 422s the whole batched review.
    path: a.path,
    line: a.line,
    startLine: a.startLine,
    side: a.side,
    body: buildFindingCommentBody(a.finding),
  }));
  const bodySummary = buildReviewBodySummary(newOutOfDiff);

  const res = await postReviewWithInlineComments(prNum, { commitId: args.commitId, inline, bodySummary }, opts);
  if (res.ok) {
    for (const a of newInDiff) outcomes.push({ id: a.finding.id, status: "posted" });
    for (const f of newOutOfDiff) outcomes.push({ id: f.id, status: "out-of-diff-posted" });
    log(
      `[publish] posted ${newInDiff.length} inline, ${newOutOfDiff.length} out-of-diff, skipped ${skipped} already published`,
    );
    return {
      state: "published",
      posted: newInDiff.length,
      outOfDiff: newOutOfDiff.length,
      skipped,
      skippedPost: false,
      failed: 0,
      error: null,
      findings: outcomes,
    };
  }

  const batchError = res.error ?? "gh api reviews POST failed";
  log(`[publish] batched review post failed: ${batchError}`);

  // Per-finding fallback. Findings that 422 on anchoring (stale line/side on
  // the named commit) degrade to an out-of-diff body mention instead of being
  // dropped — at-least-once delivery with per-finding visibility.
  let posted = 0;
  const failures: string[] = [];
  const demoted: ForgeFinding[] = [];

  if (newInDiff.length === 1) {
    // The batched POST WAS this finding's individual POST — don't repeat it.
    const f = newInDiff[0].finding;
    if (isAnchoring422(batchError)) {
      demoted.push(f);
    } else {
      outcomes.push({ id: f.id, status: "failed", error: batchError });
      failures.push(batchError);
    }
  } else {
    for (let i = 0; i < newInDiff.length; i++) {
      const finding = newInDiff[i].finding;
      const single = await postReviewWithInlineComments(
        prNum,
        { commitId: args.commitId, inline: [inline[i]], bodySummary: "" },
        opts,
      );
      if (single.ok) {
        posted++;
        outcomes.push({ id: finding.id, status: "posted" });
        continue;
      }
      const err = single.error ?? "gh api reviews POST failed";
      if (isAnchoring422(err)) {
        demoted.push(finding);
      } else {
        outcomes.push({ id: finding.id, status: "failed", error: err });
        failures.push(err);
      }
    }
    if (posted > 0) log(`[publish] individual fallback posted ${posted}/${newInDiff.length} inline`);
  }

  // One body-only review carries the out-of-diff findings plus any demoted
  // in-diff findings (their markers keep retries idempotent).
  let outOfDiffPosted = 0;
  const bodyFindings = [...newOutOfDiff, ...demoted];
  if (bodyFindings.length > 0) {
    if (demoted.length > 0) log(`[publish] ${demoted.length} finding(s) demoted to out-of-diff after anchoring 422`);
    const bodyRes = await postReviewWithInlineComments(
      prNum,
      { commitId: args.commitId, inline: [], bodySummary: buildReviewBodySummary(bodyFindings) },
      opts,
    );
    if (bodyRes.ok) {
      outOfDiffPosted = bodyFindings.length;
      for (const f of bodyFindings) outcomes.push({ id: f.id, status: "out-of-diff-posted" });
    } else {
      const err = bodyRes.error ?? "gh api reviews POST failed";
      for (const f of bodyFindings) outcomes.push({ id: f.id, status: "failed", error: err });
      failures.push(err);
    }
  }

  const failedCount = outcomes.filter((o) => o.status === "failed").length;
  const state: PublishResultState =
    failedCount === 0 ? "published" : posted + outOfDiffPosted > 0 ? "partial" : "failed";
  const error = failedCount > 0 ? failures.join("; ").slice(0, 500) || batchError : null;
  log(
    `[publish] fallback result: ${posted} inline, ${outOfDiffPosted} out-of-diff, ${failedCount} failed, ${skipped} already published`,
  );
  return {
    state,
    posted,
    outOfDiff: outOfDiffPosted,
    skipped,
    skippedPost: false,
    failed: failedCount,
    error,
    findings: outcomes,
  };
}
