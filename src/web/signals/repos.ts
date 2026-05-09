import { signal } from "@preact/signals";
import type { RepoView, WorkbenchContext } from "../types";

export const repos = signal<RepoView[]>([]);
export const currentRepoFromContext = signal<WorkbenchContext["currentRepo"]>(null);
