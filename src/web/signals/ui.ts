import { signal } from "@preact/signals";
import type { SidebarFilter, ViewMode } from "../types";

export const viewMode = signal<ViewMode>("tasks");
export const searchQuery = signal<string>("");
export const selectedRepo = signal<string>("");
export const sidebarFilter = signal<SidebarFilter>("all");
export const modalOpen = signal<boolean>(false);
