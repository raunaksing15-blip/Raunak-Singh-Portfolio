// Small enhancements only. The page is complete without this file.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Scroll progress line in the header
  const bar = $("#progress");
  let ticking = false;
  const paint = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (bar) bar.style.setProperty("--p", p.toFixed(4));
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();

  // Mobile menu
  const btn = $("#menu-btn");
  const list = $("#nav-list");
  if (btn && list) {
    const set = (open) => { list.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => set(!list.classList.contains("open")));
    list.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && list.classList.contains("open")) { set(false); btn.focus(); } });
  }

  // Current section in the nav
  const links = $$("#nav-list a");
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const a = byId.get(en.target.id);
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

    // Headings: the sheet's dividing rule draws in as a section arrives
    const rules = $$(".rule");
    if (reduce) rules.forEach((r) => r.classList.add("in"));
    else {
      const seen = new IntersectionObserver((entries, o) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); o.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -15% 0px" });
      rules.forEach((r) => seen.observe(r));
    }
  } else {
    $$(".rule").forEach((r) => r.classList.add("in"));
  }

  // Hero: the grid lights up under the pointer (mouse and pen only)
  const hero = $(".hero");
  if (hero && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
      hero.classList.add("is-tracking");
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("is-tracking"));
  }

  // Diagram: stop the travelling dots when motion is reduced
  const svg = $(".pipeline svg");
  if (svg && reduce && typeof svg.pauseAnimations === "function") svg.pauseAnimations();

  // Copy email
  const copy = $("#copy-email");
  const status = $("#copy-status");
  if (copy) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const text = copy.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "Email address copied.";
      } catch {
        const t = document.createElement("textarea");
        t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch { ok = false; }
        t.remove();
        status.textContent = ok ? "Email address copied." : "Copy failed. Select the address above instead.";
      }
      setTimeout(() => { status.textContent = ""; }, 2600);
    });
  }
})();
