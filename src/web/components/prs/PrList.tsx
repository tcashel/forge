import { useComputed } from "@preact/signals";
import {
  currentPr,
  currentPrNumber,
  prFilterMine,
  prMe,
  prs,
  prsError,
  prsLoading,
  prsRepoName,
  refreshPrs,
  visiblePrs,
} from "../../signals/prs";
import { repos } from "../../signals/repos";
import { selectedRepo } from "../../signals/ui";
import type { RepoView } from "../../types";
import { PrRow } from "./PrRow";

function selectedRepoName(repoList: RepoView[], sel: string): string {
  if (!sel) return "";
  const r = repoList.find((x) => x.root === sel || x.name === sel);
  return r ? r.name : sel;
}

function repoLabel(repoList: RepoView[], sel: string, fromApi: string | null): string {
  return fromApi || selectedRepoName(repoList, sel) || "selected repo";
}

export function PrList() {
  const list = visiblePrs.value;
  const all = prs.value;
  const me = prMe.value;
  const fromApi = prsRepoName.value;
  const sel = selectedRepo.value;
  const loading = prsLoading.value;
  const err = prsError.value;
  const filterMine = prFilterMine.value;
  const selected = useComputed(() => currentPr.value?.number ?? null);
  const selectedNumber = selected.value;
  const label = repoLabel(repos.value, sel, fromApi);
  const mineCount = all.filter((p) => p.isMine).length;

  const onAll = () => {
    prFilterMine.value = false;
    const next = prs.value[0];
    currentPrNumber.value = next?.number ?? null;
  };
  const onMine = () => {
    prFilterMine.value = true;
    const next = prs.value.filter((p) => p.isMine)[0];
    currentPrNumber.value = next?.number ?? null;
  };
  const onRefresh = () => {
    void refreshPrs();
  };

  return (
    <>
      <div class="pr-panel-head">
        <div>
          <h2>Open PRs</h2>
          <p>
            {label}
            {me ? ` · @${me}` : ""}
          </p>
        </div>
        <button type="button" class="btn sm btn-secondary" id="pr-refresh" disabled={loading} onClick={onRefresh}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <div class="pr-filter">
        <button type="button" class={filterMine ? "" : "active"} data-pr-filter="all" onClick={onAll}>
          All <span>{all.length}</span>
        </button>
        <button type="button" class={filterMine ? "active" : ""} data-pr-filter="mine" onClick={onMine}>
          Mine <span>{mineCount}</span>
        </button>
      </div>
      <div class="pr-rows">
        {loading && all.length === 0 ? <div class="pr-row-placeholder">Loading open pull requests…</div> : null}
        {!loading && err ? <div class="pr-row-placeholder error">{err}</div> : null}
        {!loading && !err && list.length === 0 ? <div class="pr-row-placeholder">No matching open PRs.</div> : null}
        {list.map((p) => (
          <PrRow key={p.number} pr={p} selected={p.number === selectedNumber} />
        ))}
      </div>
    </>
  );
}
