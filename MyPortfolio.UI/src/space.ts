import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let staticSetupDone = false;

/** One-time DOM setup that is safe to keep across theme switches. */
function setupStatic(view: HTMLElement) {
  if (staticSetupDone) return;
  staticSetupDone = true;

  // Twinkling starfield
  const stars = view.querySelector<HTMLElement>(".sp-stars");
  if (stars) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 140; i++) {
      const s = document.createElement("span");
      s.className = "sp-star";
      const size = Math.random() < 0.85 ? 1 + Math.random() : 2 + Math.random() * 1.5;
      s.style.cssText = [
        `left:${(Math.random() * 100).toFixed(2)}%`,
        `top:${(Math.random() * 100).toFixed(2)}%`,
        `--s:${size.toFixed(2)}px`,
        `--d:${(2.5 + Math.random() * 4).toFixed(2)}s`,
        `--delay:${(-Math.random() * 6).toFixed(2)}s`,
        `--o:${(0.5 + Math.random() * 0.5).toFixed(2)}`,
      ].join(";");
      frag.appendChild(s);
    }
    stars.appendChild(frag);
  }

  // Scale the 560×560 hero artboard to its wrapper width
  const wrap = view.querySelector<HTMLElement>(".sp-art-wrap");
  if (wrap) {
    new ResizeObserver(([entry]) => {
      wrap.style.setProperty("--art-scale", String(entry.contentRect.width / 560));
    }).observe(wrap);
  }

  // Pointer-follow spotlight on glass cards
  view.addEventListener("pointermove", (e) => {
    const card = (e.target as Element).closest<HTMLElement>(".sp-glass");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

const fromBelow = (trigger: Element, start = "top 85%") => ({
  trigger,
  start,
  toggleActions: "play none none none",
});

/**
 * All Space-theme motion. Must run inside a gsap.context scoped to the view;
 * the returned function cleans up listeners on revert.
 */
export default function initSpace(view: HTMLElement): () => void {
  setupStatic(view);

  const q = gsap.utils.selector(view);
  const cleanups: Array<() => void> = [];

  /* ---------- Scroll progress bar ---------- */
  gsap.to(q(".sp-progress"), {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: view, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  /* ---------- Hero intro ---------- */
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(q(".sp-nav"), { y: -30, autoAlpha: 0, duration: 0.6 })
    .from(q('[data-sp="hero-kicker"]'), { clipPath: "inset(0 100% 0 0)", duration: 1, ease: "power2.inOut" }, "-=0.2")
    .from(q('[data-sp="hero-line"]'), { yPercent: 110, duration: 0.9, stagger: 0.14 }, "-=0.6")
    .from(q('[data-sp="hero-fade"]'), { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, "-=0.5")
    .from(q('[data-sp="hero-chip"]'), { scale: 0.6, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: "back.out(2)" }, "-=0.4")
    .from(q(".sp-core"), { scale: 0.3, autoAlpha: 0, duration: 1.2, ease: "elastic.out(1, 0.6)" }, 0.3)
    .from(q(".sp-ring"), { scale: 0.6, autoAlpha: 0, duration: 1.2, stagger: 0.12 }, 0.4)
    .from(q(".sp-art__parallax"), { scale: 0.4, autoAlpha: 0, duration: 1.6, ease: "power2.out" }, 0.2)
    .from(q(".sp-art-card"), { y: 50, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.6)" }, 0.9)
    .from(q(".sp-dot"), { scale: 0, duration: 0.5, stagger: 0.1, ease: "back.out(3)" }, 1.2);

  /* ---------- Hero ambient loops (Figma "v3 Motion – Hero A/B") ---------- */
  q(".sp-art-card").forEach((card, i) => {
    gsap.to(card, {
      y: -12 - i * 3,
      duration: 3 + i * 0.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2 + i * 0.4,
    });
  });
  gsap.to(q(".sp-core"), { y: -10, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(q(".sp-core__shine"), { autoAlpha: 0.55, scale: 0.85, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
  const orbits: Array<[string, number]> = [
    [".sp-orbit--a", 26],
    [".sp-orbit--b", -34],
    [".sp-orbit--c", 20],
    [".sp-orbit--d", -30],
  ];
  orbits.forEach(([sel, secs]) => {
    gsap.to(q(sel), { rotation: secs > 0 ? 360 : -360, duration: Math.abs(secs), ease: "none", repeat: -1 });
  });

  /* ---------- Mouse parallax on the hero art ---------- */
  const hero = q(".sp-hero")[0] as HTMLElement | undefined;
  if (hero && window.matchMedia("(pointer: fine)").matches) {
    const layers = q<HTMLElement>("[data-depth]").map((el) => ({
      depth: Number(el.dataset.depth) || 1,
      x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
    }));
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => {
        l.x(nx * 28 * l.depth);
        l.y(ny * 28 * l.depth);
      });
    };
    const onLeave = () => layers.forEach((l) => (l.x(0), l.y(0)));
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    });
  }

  /* ---------- Hero scroll-out parallax ---------- */
  gsap.to(q(".sp-art-wrap"), {
    yPercent: 18,
    scale: 0.92,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(q(".sp-hero__text"), {
    y: -60,
    autoAlpha: 0.2,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "center top+=200", end: "bottom top", scrub: true },
  });

  /* ---------- Ambient page glows drift with scroll ---------- */
  q(".sp-ambient img").forEach((img, i) => {
    gsap.to(img, {
      yPercent: i % 2 ? -35 : -20,
      xPercent: i % 2 ? -8 : 10,
      rotation: i % 2 ? -25 : 25,
      ease: "none",
      scrollTrigger: { trigger: view, start: "top top", end: "bottom bottom", scrub: 1.5 },
    });
  });

  /* ---------- Client strip entrance ---------- */
  gsap.from(q(".sp-strip"), {
    autoAlpha: 0,
    scaleX: 0.8,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: fromBelow(q(".sp-strip")[0], "top 95%"),
  });

  /* ---------- Stats: rise + count-up ---------- */
  const statsWrap = q(".sp-stats")[0];
  gsap.from(q('[data-sp="stat"]'), {
    y: 60,
    autoAlpha: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: fromBelow(statsWrap),
  });
  q<HTMLElement>("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count) || 0;
    const counter = { v: 0 };
    el.textContent = "0";
    gsap.to(counter, {
      v: target,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => (el.textContent = String(Math.round(counter.v))),
      scrollTrigger: fromBelow(statsWrap),
    });
  });

  /* ---------- Section headers ---------- */
  q(".sp-head, .sp-contact").forEach((head) => {
    const kicker = head.querySelector('[data-sp="kicker"]');
    const title = head.querySelector('[data-sp="title"]');
    const tl = gsap.timeline({ scrollTrigger: fromBelow(head) });
    if (kicker) tl.from(kicker, { clipPath: "inset(0 100% 0 0)", duration: 0.8, ease: "power2.inOut" });
    if (title) tl.from(title, { y: 40, autoAlpha: 0, filter: "blur(10px)", duration: 0.8, ease: "power3.out" }, "-=0.4");
  });

  /* ---------- Skill cards: 3D flip-up, chips pop in ---------- */
  q(".sp-skill").forEach((card, i) => {
    const tl = gsap.timeline({ scrollTrigger: fromBelow(card, "top 88%") });
    tl.from(card, {
      y: 80,
      rotateX: -18,
      transformPerspective: 900,
      transformOrigin: "50% 0%",
      autoAlpha: 0,
      duration: 0.9,
      delay: (i % 2) * 0.12,
      ease: "power3.out",
    }).from(
      card.querySelectorAll(".sp-chip"),
      { scale: 0.5, autoAlpha: 0, duration: 0.4, stagger: 0.035, ease: "back.out(2.2)" },
      "-=0.45",
    );
  });

  /* ---------- Experience: slide in, timeline bar grows with scroll ---------- */
  const job = q('[data-sp="job"]')[0];
  if (job) {
    gsap.from(job, { x: -70, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: fromBelow(job) });
    gsap.from(job.querySelector(".sp-job__bar"), {
      scaleY: 0,
      ease: "none",
      scrollTrigger: { trigger: job, start: "top 75%", end: "bottom 55%", scrub: true },
    });
    gsap.from(job.querySelectorAll(".sp-job__list li"), {
      x: 30,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: fromBelow(job, "top 70%"),
    });
  }

  /* ---------- Principles: grid stagger, icons spin in ---------- */
  const principles = q('[data-sp="principle"]');
  if (principles.length) {
    const grid = principles[0].parentElement!;
    const tl = gsap.timeline({ scrollTrigger: fromBelow(grid) });
    tl.from(principles, {
      y: 70,
      scale: 0.92,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: { each: 0.1, grid: "auto", from: "start" },
    }).from(
      grid.querySelectorAll(".sp-icon"),
      { rotation: -180, scale: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.8)" },
      "-=0.7",
    );
  }

  /* ---------- Clients: random pop ---------- */
  const clients = q('[data-sp="client"]');
  if (clients.length) {
    gsap.from(clients, {
      y: 40,
      scale: 0.85,
      autoAlpha: 0,
      duration: 0.7,
      ease: "back.out(1.6)",
      stagger: { each: 0.07, from: "random" },
      scrollTrigger: fromBelow(clients[0].parentElement!),
    });
  }

  /* ---------- Generic cards (project, education) ---------- */
  q('[data-sp="card"]:not(.sp-skill)').forEach((card, i) => {
    gsap.from(card, {
      x: i % 2 ? 60 : -60,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: fromBelow(card, "top 90%"),
    });
  });

  /* ---------- Contact finale ---------- */
  const contact = q(".sp-contact")[0];
  if (contact) {
    const tl = gsap.timeline({ scrollTrigger: fromBelow(contact, "top 70%") });
    tl.from(contact.querySelectorAll('[data-sp="contact-line"]'), { yPercent: 110, duration: 1, stagger: 0.15, ease: "power4.out" })
      .from(contact.querySelectorAll('[data-sp="contact-fade"]'), { y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, "-=0.5");

    contact.querySelectorAll(".sp-contact__glow").forEach((glow, i) => {
      gsap.fromTo(
        glow,
        { scale: 0.5, rotation: i ? -40 : 40, autoAlpha: 0.2 },
        {
          scale: 1.1,
          rotation: 0,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: { trigger: contact, start: "top bottom", end: "bottom bottom", scrub: 1 },
        },
      );
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
