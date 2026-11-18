import "./style.css";
import "./styles/light.css";
import "./styles/space.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import revealOnScroll from "./animations";
import Navigation from "./navigation";
import initSpace from "./space";
import { getTheme, initThemeSwitcher, type Theme } from "./themes";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let ctx: gsap.Context | null = null;

/** Tear down the previous theme's animations and start the new theme's. */
function activate(theme: Theme) {
  ctx?.revert();
  ctx = null;

  const view = document.querySelector<HTMLElement>(`[data-view="${theme}"]`);
  if (!view || reduceMotion) return;

  ctx = gsap.context(() => {
    if (theme === "space") return initSpace(view);
    revealOnScroll(view, theme === "light" ? 16 : 24);
  }, view);

  ScrollTrigger.refresh();
}

Navigation();
initThemeSwitcher(activate);
activate(getTheme());

document.fonts?.ready.then(() => ScrollTrigger.refresh());
