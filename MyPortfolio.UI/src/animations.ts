import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Fade/slide-in for every element marked with `data-reveal`. */
export default function Animation() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  gsap.set(items, { autoAlpha: 0, y: 24 });

  ScrollTrigger.batch(items, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.08,
      }),
  });
}
