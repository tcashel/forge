import { effect, signal } from "@preact/signals";
import type { Theme } from "../types";

const STORAGE_KEY = "forge.theme";

function readStored(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    // localStorage may be unavailable (private mode, etc.) — fall through.
  }
  return null;
}

function initial(): Theme {
  if (typeof document === "undefined") return "light";
  const stored = readStored();
  if (stored) return stored;
  if (typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export const theme = signal<Theme>(initial());

effect(() => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme.value;
  try {
    localStorage.setItem(STORAGE_KEY, theme.value);
  } catch {
    // best-effort persistence; ignore quota / disabled-storage errors.
  }
});

export function toggleTheme(): void {
  theme.value = theme.value === "dark" ? "light" : "dark";
}
