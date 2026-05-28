import { signal } from "@preact/signals";
import type { ActivityFilter, SidebarFilter, ViewMode } from "../types";

export const viewMode = signal<ViewMode>("tasks");
export const searchQuery = signal<string>("");
export const selectedRepo = signal<string>("");
export const sidebarFilter = signal<SidebarFilter>("all");
export const modalOpen = signal<boolean>(false);
export const activityFilter = signal<ActivityFilter>("all");
export const activitySelectedId = signal<string | null>(null);
export const currentReviewPrNumber = signal<number | null>(null);
export const currentReviewRepo = signal<string | null>(null);
