// Spec library signals — back the cross-repo "Library" sidebar view.
//
// refreshLibrary() hits GET /api/spec-library with the active status filter
// and (server-side) search substring. Reads go through the same storage layer
// as `forge spec ls`; no SQLite/FTS (ADR-0023 — JSON is authoritative during
// the dual-write cutover). On error we keep the prior rows and surface a
// non-blocking error so the pane doesn't blank out.
import { signal } from "@preact/signals";
import { type ApiError, fetchSpecLibrary } from "../lib/api";
import type { LibraryFilter, LibrarySpec } from "../types";

export const librarySpecs = signal<LibrarySpec[]>([]);
export const libraryLoading = signal<boolean>(false);
export const libraryError = signal<string | null>(null);
export const libraryFilter = signal<LibraryFilter>("drafts");
export const librarySearch = signal<string>("");
export const librarySelectedId = signal<string | null>(null);

export async function refreshLibrary(): Promise<void> {
  libraryLoading.value = true;
  try {
    const data = await fetchSpecLibrary(libraryFilter.value, librarySearch.value.trim() || undefined);
    librarySpecs.value = data.specs || [];
    libraryError.value = null;
  } catch (e) {
    const err = e as ApiError;
    // Keep the previous results visible; only flag the error.
    libraryError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not load the spec library.";
  } finally {
    libraryLoading.value = false;
  }
}
