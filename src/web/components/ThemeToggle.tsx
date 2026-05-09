import { theme, toggleTheme } from "../signals/theme";

export function ThemeToggle() {
  const isDark = theme.value === "dark";
  return (
    <button
      type="button"
      class="theme-toggle"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
    >
      <span class="theme-glyph" aria-hidden="true">
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}
