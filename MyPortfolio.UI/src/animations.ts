import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade/slide-in for every `data-reveal` element inside a view (Dark & Light).
 * Call inside a gsap.context so switching themes reverts it cleanly.
 */
export default function revealOnScroll(view: HTMLElement, distance = 24) {
  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", view);
  if (!items.length) return;

  gsap.set(items, { autoAlpha: 0, y: distance });

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
        overwrite: true,
      }),
  });
}
