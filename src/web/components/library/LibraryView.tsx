// Spec library — cross-repo discovery surface for saved Forge specs.
// Left: a filtered/searchable list of saved specs (drafts / archived / all,
// mirroring `forge spec ls`'s status semantics). Right: the selected spec
// rendered in the existing plan-document pane for reading/editing.
//
// Reads through GET /api/spec-library (same storage layer as the CLI). Search
// is server-side substring over title + spec body. No SQLite/FTS (ADR-0023).
import { useRef } from "preact/hooks";
import {
  libraryError,
  libraryFilter,
  libraryLoading,
  librarySearch,
  librarySelectedId,
  librarySpecs,
  refreshLibrary,
} from "../../signals/library";
import { currentTaskId } from "../../signals/tasks";
import type { LibraryFilter, LibrarySpec } from "../../types";
import { PlanDocumentPane } from "../tasks/tabs/PlanDocumentPane";

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "drafts", label: "Drafts" },
  { id: "archived", label: "Archived" },
  { id: "all", label: "All" },
];

function formatCreated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function LibraryRow({ spec }: { spec: LibrarySpec }) {
  const selected = librarySelectedId.value === spec.id;
  const onOpen = () => {
    librarySelectedId.value = spec.id;
    currentTaskId.value = spec.id;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: matches the .task-row div styling used across the list panes.
    <div
      class={`task-row ${selected ? "selected" : ""}`}
      data-id={spec.id}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onKey}
    >
      <div class="task-main">
        <div class="title">{spec.title}</div>
        <div class="meta">
          <span class="repo-chip">
            <span class="repo-dot" />
            {spec.repo}
          </span>
          <span style="color:var(--rule-2)">·</span>
          <span>Created {formatCreated(spec.createdAt)}</span>
          <span style="color:var(--rule-2)">·</span>
          <span>v{spec.specVersion}</span>
          <span style="color:var(--rule-2)">·</span>
          <span>
            {spec.openQuestionCount} open question{spec.openQuestionCount === 1 ? "" : "s"}
          </span>
          {spec.status === "archived" ? (
            <>
              <span style="color:var(--rule-2)">·</span>
              <span class="err">archived</span>
            </>
          ) : null}
          {!spec.hasSpec ? (
            <>
              <span style="color:var(--rule-2)">·</span>
              <span class="err">no spec on disk</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LibraryDetail() {
  const id = librarySelectedId.value;
  if (!id) {
    return <div class="detail-empty">Select a spec to read or edit it.</div>;
  }
  const spec = librarySpecs.value.find((s) => s.id === id);
  if (!spec) {
    return <div class="detail-empty">This spec is no longer in the current list.</div>;
  }
  return (
    <div class="detail-body">
      <PlanDocumentPane t={{ id: spec.id, title: spec.title }} />
    </div>
  );
}

export function LibraryView() {
  const specs = librarySpecs.value;
  const loading = libraryLoading.value;
  const err = libraryError.value;
  const filter = libraryFilter.value;
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onFilter = (id: LibraryFilter) => {
    if (libraryFilter.value === id) return;
    libraryFilter.value = id;
    void refreshLibrary();
  };

  const onSearch = (e: Event) => {
    librarySearch.value = (e.currentTarget as HTMLInputElement).value;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      void refreshLibrary();
    }, 250);
  };

  return (
    <div class="library-panel">
      <div class="library-head">
        <div>
          <h2>Plan library</h2>
          <p>Saved specs across every repo</p>
        </div>
        <div class="library-actions">
          <div class="library-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                class={`nav-chip${filter === f.id ? " active" : ""}`}
                onClick={() => onFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            class="library-search"
            placeholder="Search title or content…"
            value={librarySearch.value}
            onInput={onSearch}
          />
        </div>
      </div>
      {err ? <div class="library-error">{err}</div> : null}
      <div class="library-split">
        <aside class="library-list">
          {loading && specs.length === 0 ? <div class="library-empty">Loading specs…</div> : null}
          {!loading && specs.length === 0 && !err ? (
            <div class="library-empty">
              {librarySearch.value.trim() ? "No specs match your search." : "No saved specs in this filter."}
            </div>
          ) : null}
          {specs.map((spec) => (
            <LibraryRow key={spec.id} spec={spec} />
          ))}
        </aside>
        <main class="library-detail">
          <LibraryDetail />
        </main>
      </div>
    </div>
  );
}
