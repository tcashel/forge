import { useEffect, useRef, useState } from "preact/hooks";
import { apiPost } from "../lib/api";
import "../lib/forge-bridge";
import { repos } from "../signals/repos";
import { selectedRepo } from "../signals/ui";
import type { RepoView } from "../types";

function repoKey(r: RepoView): string {
  return r.root || r.name || "";
}

export function RepoPicker() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [addPath, setAddPath] = useState("");
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => searchRef.current?.focus(), 0);
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (popoverRef.current?.contains(t)) return;
      if (buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const inField = tag === "input" || tag === "textarea" || tag === "select";
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (!open && e.key === "r" && !e.metaKey && !e.ctrlKey && !inField) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const list = repos.value;
  const sel = selectedRepo.value;
  const totalTaskCount = list.reduce((acc, r) => acc + (r.taskCount || 0), 0);
  const active = list.filter((r) => !r.stale);
  const stale = list.filter((r) => r.stale && r.registered);
  const f = filter.toLowerCase().trim();
  const matchesFilter = (r: RepoView) => !f || `${r.name} ${r.root || ""}`.toLowerCase().includes(f);

  const selectedRepoView = sel ? (list.find((r) => repoKey(r) === sel) ?? null) : null;

  const onSelect = (key: string) => {
    setOpen(false);
    setFilter("");
    const bridge = window.__forge?.legacy;
    if (bridge?.setSelectedRepo) {
      bridge.setSelectedRepo(key);
    } else {
      selectedRepo.value = key;
    }
  };

  const onAddSubmit = async (e: Event) => {
    e.preventDefault();
    const repoRoot = addPath.trim();
    if (!repoRoot) return;
    const bridge = window.__forge?.legacy;
    setAdding(true);
    try {
      const data = (await apiPost<{ repo?: { root?: string } }>("/api/repos", { repoRoot })) || {};
      if (bridge?.refreshRepos) await bridge.refreshRepos();
      const newKey = data.repo?.root || repoRoot;
      setAddPath("");
      setOpen(false);
      setFilter("");
      if (bridge?.setSelectedRepo) bridge.setSelectedRepo(newKey);
      else selectedRepo.value = newKey;
      bridge?.showToast?.(`Added repo ${newKey}`, "info");
    } catch (err) {
      const e2 = err as { message?: string; hint?: string };
      const msg = e2.hint ? `${e2.message ?? ""} — ${e2.hint}` : (e2.message ?? "Could not add repo");
      bridge?.showToast?.(msg, "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div class="repo-selector">
      <button
        ref={buttonRef}
        type="button"
        class={`repo-btn${open ? " open" : ""}`}
        id="repo-btn"
        aria-expanded={open ? "true" : "false"}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <span class={`repo-dot${selectedRepoView ? "" : " multi"}`} id="repo-btn-dot" />
        <span class="repo-name" id="repo-btn-name">
          {selectedRepoView ? selectedRepoView.name : sel || "All repos"}
        </span>
        {selectedRepoView?.branch ? (
          <>
            <span class="slash" id="repo-btn-slash">
              /
            </span>
            <span class="branch" id="repo-btn-branch">
              {selectedRepoView.branch}
            </span>
          </>
        ) : null}
        <span class="slash">·</span>
        <span class="scope">workbench</span>
        <span class="caret">▾</span>
      </button>
      <div ref={popoverRef} class="repo-popover" id="repo-popover" hidden={!open}>
        <input
          ref={searchRef}
          type="text"
          class="repo-search"
          id="repo-search"
          placeholder="Filter repos…"
          value={filter}
          onInput={(e) => setFilter((e.currentTarget as HTMLInputElement).value)}
        />
        <div class="repo-section">Scope</div>
        <button
          type="button"
          class={`repo-option${sel === "" ? " active" : ""}`}
          data-repo=""
          onClick={(e) => {
            e.stopPropagation();
            onSelect("");
          }}
          style={f ? { display: "none" } : undefined}
        >
          <span class="repo-dot multi" />
          <span class="repo-name">All repos</span>
          <span class="repo-count" id="repo-count-all">
            {totalTaskCount}
          </span>
          <span class="check">✓</span>
        </button>
        <div class="repo-divider" />
        {list.length === 0 ? (
          <div style="padding:10px 12px;color:var(--dim);font-size:12px">
            No repos yet — add one below or save a spec with <code>forge spec save</code>.
          </div>
        ) : (
          <>
            <div class="repo-section" id="repo-list-section">
              Repos with active work
            </div>
            <div id="repo-list">
              {active.filter(matchesFilter).map((r) => (
                <button
                  key={repoKey(r)}
                  type="button"
                  class={`repo-option${repoKey(r) === sel ? " active" : ""}`}
                  data-repo={repoKey(r)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(repoKey(r));
                  }}
                >
                  <span class="repo-dot" />
                  <span class="repo-name">
                    {r.name}
                    {r.current ? " · current" : ""}
                  </span>
                  <span class="branch-mini">{r.branch || ""}</span>
                  <span class="repo-count">{r.taskCount}</span>
                  <span class="check">✓</span>
                </button>
              ))}
              {stale.filter(matchesFilter).length > 0 ? (
                <>
                  <div class="repo-section">Stale or missing</div>
                  {stale.filter(matchesFilter).map((r) => (
                    <button
                      key={repoKey(r)}
                      type="button"
                      class={`repo-option stale${repoKey(r) === sel ? " active" : ""}`}
                      data-repo={repoKey(r)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(repoKey(r));
                      }}
                    >
                      <span class="repo-dot" />
                      <span class="repo-name">{r.name}</span>
                      <span class="branch-mini">{r.branch || ""}</span>
                      <span class="repo-state">stale</span>
                      <span class="repo-count">{r.taskCount}</span>
                      <span class="check">✓</span>
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          </>
        )}
        <div class="repo-divider" />
        <form class="repo-add" id="repo-add-form" onSubmit={onAddSubmit}>
          <input
            type="text"
            id="repo-add-path"
            placeholder="/absolute/path/to/git/repo"
            aria-label="Repo path"
            value={addPath}
            onInput={(e) => setAddPath((e.currentTarget as HTMLInputElement).value)}
          />
          <button type="submit" class="btn btn-secondary sm" disabled={adding}>
            {adding ? "Adding…" : "Add repo"}
          </button>
        </form>
      </div>
    </div>
  );
}
