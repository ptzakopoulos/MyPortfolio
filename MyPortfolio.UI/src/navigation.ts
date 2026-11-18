/** Mobile menu toggle + active-link highlighting while scrolling. */
export default function Navigation() {
  const toggle = document.querySelector<HTMLButtonElement>(".nav__toggle");
  const menu = document.querySelector<HTMLElement>(".nav__links");
  const links = [...document.querySelectorAll<HTMLAnchorElement>(".nav__links a")];

  const setOpen = (open: boolean) => {
    toggle?.setAttribute("aria-expanded", String(open));
    menu?.classList.toggle("is-open", open);
  };

  toggle?.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true"),
  );
  links.forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  const byId = new Map(links.map((l) => [l.hash.slice(1), l]));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove("is-active"));
        byId.get(entry.target.id)?.classList.add("is-active");
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
