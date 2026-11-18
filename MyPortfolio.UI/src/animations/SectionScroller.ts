import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/all";
const test = () => {
  gsap.registerPlugin(ScrollToPlugin);
  let animating = false;
  const sections = document.querySelectorAll("section");
  function goToSection(e: WheelEvent) {
    const target = e.target as HTMLElement;
    const index = [...sections].findIndex((section) => section == target);
    const delta = e.deltaY;
    const direction = delta / Math.abs(delta);
    if (!animating) {
      gsap.to(window, {
        scrollTo: { y: sections[index + direction], autoKill: false },
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          animating = false;
        },
      });
      animating = true;
    }
  }

  if (sections && sections.length > 0) {
    sections.forEach((section) => {
      section.addEventListener("wheel", goToSection);
    });
  }
};
export default test;
