import { useEffect, useRef } from "preact/hooks";
import { searchQuery } from "../signals/ui";

export function Search() {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const inField = tag === "input" || tag === "textarea" || tag === "select";
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
        return;
      }
      if (e.key === "/" && !inField) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div class="search">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        role="img"
        aria-label="Search"
      >
        <title>Search</title>
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3 3" />
      </svg>
      <input
        ref={ref}
        id="search-input"
        placeholder="Search specs, branches…"
        value={searchQuery.value}
        onInput={(e) => {
          searchQuery.value = (e.currentTarget as HTMLInputElement).value;
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            searchQuery.value = "";
            (e.currentTarget as HTMLInputElement).blur();
          }
        }}
      />
      <kbd>⌘ K</kbd>
    </div>
  );
}
