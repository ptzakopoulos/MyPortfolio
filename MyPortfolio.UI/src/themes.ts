export type Theme = "dark" | "light" | "space";

const THEMES: Theme[] = ["dark", "light", "space"];
const STORAGE_KEY = "theme";

const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as string[]).includes(value);

export function getTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : "dark";
}

function save(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode etc.) — theme just won't persist */
  }
}

/**
 * Wires the floating Dark / Light / Space switcher.
 * `onChange` runs after the new view is visible.
 */
export function initThemeSwitcher(onChange: (theme: Theme) => void) {
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-theme-option]"),
  ];

  const sync = (theme: Theme) => {
    buttons.forEach((btn) => {
      const active = btn.dataset.themeOption === theme;
      btn.setAttribute("aria-checked", String(active));
      btn.tabIndex = active ? 0 : -1;
    });
  };

  const apply = (theme: Theme) => {
    if (theme === getTheme()) return;
    document.documentElement.dataset.theme = theme;
    save(theme);
    sync(theme);
    window.scrollTo({ top: 0, behavior: "instant" });

    const view = document.querySelector<HTMLElement>(`[data-view="${theme}"]`);
    view?.classList.remove("is-entering");
    void view?.offsetWidth; // restart the fade-in
    view?.classList.add("is-entering");

    onChange(theme);
  };

  buttons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.themeOption;
      if (isTheme(theme)) apply(theme);
    });

    // Radiogroup keyboard support: arrows move between options.
    btn.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = buttons[(i + step + buttons.length) % buttons.length];
      next.focus();
      next.click();
    });
  });

  sync(getTheme());
}
