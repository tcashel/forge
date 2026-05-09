import { copyCmd } from "../../lib/actions";
import { currentPr, prFilterMine, prMe, prsError, prsLoading, prsRepoName } from "../../signals/prs";
import { repos } from "../../signals/repos";
import { selectedRepo } from "../../signals/ui";
import type { PrView, RepoView } from "../../types";
import { ciClass, ciLabel, reviewClass, reviewLabel, timeAgo } from "./pr-format";

function selectedRepoName(repoList: RepoView[], sel: string): string {
  if (!sel) return "";
  const r = repoList.find((x) => x.root === sel || x.name === sel);
  return r ? r.name : sel;
}

function repoLabel(repoList: RepoView[], sel: string, fromApi: string | null): string {
  return fromApi || selectedRepoName(repoList, sel) || "selected repo";
}

function PrEmpty() {
  if (prsLoading.value) {
    return <div class="detail-empty">Loading open PRs…</div>;
  }
  if (prsError.value) {
    return (
      <div class="detail-empty pr-empty">
        <div>
          <div class="big">Could not load PRs</div>
          <p>{prsError.value}</p>
        </div>
      </div>
    );
  }
  const mineText = prFilterMine.value && prMe.value ? ` by @${prMe.value}` : "";
  const label = repoLabel(repos.value, selectedRepo.value, prsRepoName.value);
  return (
    <div class="detail-empty pr-empty">
      <div>
        <div class="big">No open PRs{mineText}</div>
        <p>{label} has no matching open pull requests.</p>
      </div>
    </div>
  );
}

interface PrBodyProps {
  pr: PrView;
}

function PrBody({ pr }: PrBodyProps) {
  const label = repoLabel(repos.value, selectedRepo.value, prsRepoName.value);
  const onOpen = () => {
    window.open(pr.url, "_blank");
  };
  const onReview = () => {
    void copyCmd(`forge review ${pr.number}`);
  };
  const onCopyUrl = () => {
    void copyCmd(pr.url);
  };
  const onCopyBranch = () => {
    void copyCmd(pr.headRefName);
  };
  return (
    <>
      <div class="pr-detail-head">
        <div class="row1">
          <span class="pr-num big">#{pr.number}</span>
          {pr.isDraft ? <span class="pr-tag">draft</span> : null}
          {pr.isMine ? <span class="pr-tag mine">mine</span> : null}
          <span class={`pr-status ${ciClass(pr.statusCheckRollup)}`}>{ciLabel(pr.statusCheckRollup)}</span>
          <span class={`pr-status ${reviewClass(pr.reviewDecision)}`}>{reviewLabel(pr.reviewDecision)}</span>
        </div>
        <h1>{pr.title}</h1>
        <div class="meta">
          <span>
            <b>Repo</b> {label}
          </span>
          <span>
            <b>Author</b> @{pr.author || "unknown"}
          </span>
          <span>
            <b>Updated</b> {timeAgo(pr.updatedAt)} ago
          </span>
        </div>
        <div class="detail-actions">
          <button type="button" class="btn btn-primary" data-pr-action="open" onClick={onOpen}>
            Open PR
          </button>
          <button type="button" class="btn btn-secondary" data-pr-action="review" onClick={onReview}>
            Copy review cmd
          </button>
          <button type="button" class="btn btn-ghost" data-pr-action="copy-url" onClick={onCopyUrl}>
            Copy URL
          </button>
          <button type="button" class="btn btn-ghost" data-pr-action="copy-branch" onClick={onCopyBranch}>
            Copy branch
          </button>
        </div>
      </div>
      <div class="pr-detail-body">
        <div class="pr-facts">
          <div>
            <span>Branch</span>
            <b>{pr.headRefName}</b>
          </div>
          <div>
            <span>Base</span>
            <b>{pr.baseRefName}</b>
          </div>
          <div>
            <span>Files</span>
            <b>{Number(pr.changedFiles || 0)}</b>
          </div>
          <div>
            <span>Diff</span>
            <b>
              <span class="plus">+{Number(pr.additions || 0)}</span>{" "}
              <span class="minus">-{Number(pr.deletions || 0)}</span>
            </b>
          </div>
          <div>
            <span>Comments</span>
            <b>{Number(pr.commentsCount || 0)}</b>
          </div>
          <div>
            <span>Reviews</span>
            <b>{Number(pr.reviewsCount || 0)}</b>
          </div>
        </div>
        <div class="pr-url">
          <span>URL</span>
          <a href={pr.url} target="_blank" rel="noreferrer">
            {pr.url}
          </a>
        </div>
      </div>
    </>
  );
}

export function PrDetail() {
  const pr = currentPr.value;
  if (!pr) return <PrEmpty />;
  return <PrBody pr={pr} />;
}
