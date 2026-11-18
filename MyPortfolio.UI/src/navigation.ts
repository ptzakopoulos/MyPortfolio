/** Mobile menu toggles (one per theme view) + active-link highlighting. */
export default function Navigation() {
  document.querySelectorAll<HTMLElement>(".view").forEach((view) => {
    const toggle = view.querySelector<HTMLButtonElement>(".nav__toggle");
    const menu = view.querySelector<HTMLElement>(".nav__links");
    if (!toggle || !menu) return;

    const setOpen = (open: boolean) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () =>
      setOpen(toggle.getAttribute("aria-expanded") !== "true"),
    );
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false)),
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  });

  // Active link: hidden views never intersect, so one observer covers all three.
  const links = [...document.querySelectorAll<HTMLAnchorElement>(".nav__links a")];
  const byId = new Map<string, HTMLAnchorElement[]>();
  links.forEach((l) => {
    const id = l.hash.slice(1);
    if (!id || l.matches(".lt-btn, .sp-btn")) return;
    byId.set(id, [...(byId.get(id) ?? []), l]);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const view = entry.target.closest(".view");
        view?.querySelectorAll(".nav__links a").forEach((l) => l.classList.remove("is-active"));
        byId.get(entry.target.id)?.forEach((l) => l.classList.add("is-active"));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}
