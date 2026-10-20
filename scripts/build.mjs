// Builds the static site into dist/ from content/profile.json. No dependencies.
//   node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const P = JSON.parse(readFileSync(join(ROOT, "content", "profile.json"), "utf8"));

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const S = P.site;
const first = P.name.split(" ")[0];
const lastName = P.name.split(" ").slice(1).join(" ");
const RESUME = "assets/Raunak_Singh_Resume.pdf";
const RESUME_ATS = "assets/Raunak_Singh_Resume_ATS.pdf";
const year = new Date().getFullYear();

/* ---------- Hero figure: how Mitti AI turns one photo into a listing ---------- */
function pipelineSvg() {
  const outs = ["Description", "Instagram caption", "SEO keywords", "Design ideas"];
  const ys = [70, 170, 270, 370];
  const wires = ys.map((y, i) => `<path class="wire draw" pathLength="1" style="--d:${(1.95 + i * 0.1).toFixed(2)}s" d="M314 220 C343 220 343 ${y} 372 ${y}"/>`).join("\n      ");
  const chips = ys.map((y, i) => `
      <g>
        <rect class="stroke chip draw" pathLength="1" style="--d:${(2.35 + i * 0.12).toFixed(2)}s" x="372" y="${y - 28}" width="142" height="56" rx="10"/>
        <text class="fade" style="--d:${(2.8 + i * 0.12).toFixed(2)}s" x="443" y="${y + 4.5}" text-anchor="middle">${outs[i]}</text>
      </g>`).join("");
  const packets = ys.map((y) => `
      <circle class="packet" r="4.5" cx="0" cy="0">
        <animateMotion begin="4.9s" dur="6s" repeatCount="indefinite" path="M314 220 C343 220 343 ${y} 372 ${y}" keyPoints="0;1;1" keyTimes="0;0.2;1" calcMode="linear"/>
        <animate attributeName="opacity" begin="4.9s" dur="6s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;0.02;0.18;0.2;1"/>
      </circle>`).join("");
  return `
  <svg viewBox="0 24 520 372" role="img" aria-labelledby="pipe-title pipe-desc">
    <title id="pipe-title">How Mitti AI turns a product photo into a listing</title>
    <desc id="pipe-desc">A product photo goes into the Google Gemini API, which returns a description, an Instagram caption, SEO keywords and design ideas.</desc>
    <g>
      <rect class="stroke draw" pathLength="1" style="--d:0.3s" x="8" y="150" width="124" height="140" rx="10"/>
      <path class="stroke draw" pathLength="1" style="--d:0.7s" d="M58 178 H82 M61 178 C61 194 44 204 44 228 C44 252 55 268 70 268 C85 268 96 252 96 228 C96 204 79 194 79 178"/>
      <text class="node-label fade" style="--d:1s" x="70" y="314" text-anchor="middle">Product photo</text>
    </g>
    <path class="wire draw" pathLength="1" style="--d:1.1s" d="M132 220 H198"/>
    <g>
      <rect class="gem fade" style="--d:1.6s" x="200" y="168" width="114" height="104" rx="14"/>
      <text class="gem-text fade" style="--d:1.9s" x="257" y="215" text-anchor="middle">Google</text>
      <text class="gem-text fade" style="--d:1.9s" x="257" y="234" text-anchor="middle">Gemini API</text>
    </g>
    ${wires}${chips}${packets}
    <circle class="packet" r="4.5" cx="0" cy="0">
      <animateMotion begin="3.6s" dur="6s" repeatCount="indefinite" path="M132 220 H198" keyPoints="0;1;1" keyTimes="0;0.16;1" calcMode="linear"/>
      <animate attributeName="opacity" begin="3.6s" dur="6s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;0.02;0.14;0.16;1"/>
    </circle>
  </svg>`;
}

/* ---------- Sections ---------- */
const head = (title, sub = "") => `
      <div class="section-head">
        <div class="rule" aria-hidden="true"></div>
        <h2>${esc(title)}</h2>${sub ? `\n        <p class="section-sub">${esc(sub)}</p>` : ""}
      </div>`;

const project = (p, i) => `
        <article class="project${i === 0 ? " featured" : ""}" aria-labelledby="p-${p.id}">
          <div>
            <p class="status">${esc(p.site.status)}</p>
            <h3 id="p-${p.id}">${esc(p.name)}</h3>
            <p class="problem">${esc(p.site.problem)}</p>
            <div class="split">
              <div><h4>What I built</h4><p>${esc(p.site.mine)}</p></div>
              <div><h4>What the team built</h4><p>${esc(p.site.team)}</p></div>
            </div>
            <div class="project-links">
              <a class="btn btn-solid" href="${esc(p.links[1][1])}">${esc(p.links[1][0])}</a>
              <a class="btn btn-line" href="${esc(p.links[0][1])}">${esc(p.links[0][0])} repository</a>
            </div>
          </div>
          <dl class="rail">
            <div><dt>Timeline</dt><dd>${esc(p.site.period)}</dd></div>
            <div><dt>Built with</dt><dd><ul class="stack">${p.site.stack.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></dd></div>${p.site.open ? `
            <div><dt>Open source</dt><dd>${esc(p.site.open)}</dd></div>` : ""}
          </dl>
        </article>`;

const skillRow = ([group, items]) => {
  const note = S.skillNotes?.[group];
  return `
        <div class="skill-row${group === "Learning" ? " learning" : ""}">
          <dt>${esc(group)}</dt>
          <dd><ul class="skill-items">${items.split(",").map((s) => `<li>${esc(s.trim())}</li>`).join("")}</ul>${note ? `<span class="skill-note">${esc(note)}</span>` : ""}</dd>
        </div>`;
};

const role = (r) => `
        <article class="role">
          <p class="role-when">${esc(r.site.period)}</p>
          <div>
            <h3>${esc(r.role)}, ${esc(r.name)}</h3>
            <p class="where">${esc(r.place)}</p>
            <ul>${r.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            <p class="link"><a href="${esc(r.site.link[1])}">${esc(r.site.link[0])}</a></p>
          </div>
        </article>`;

const nav = [["home", "Home"], ["about", "About"], ["projects", "Projects"], ["skills", "Skills"], ["experience", "Experience"], ["open-source", "Open source"], ["contact", "Contact"]];
const title = `${P.name} | Software developer and B.Tech student`;
const canonical = S.url ? `\n  <link rel="canonical" href="${esc(S.url)}">\n  <meta property="og:url" content="${esc(S.url)}">` : "";
const ld = {
  "@context": "https://schema.org", "@type": "Person", name: P.name, jobTitle: P.title, email: `mailto:${P.email}`,
  sameAs: [P.github, P.linkedin, P.x], ...(S.url ? { url: S.url } : {}),
};

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(P.summary)}">
  <meta name="theme-color" content="#0b1630">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(P.summary)}">
  <meta name="twitter:card" content="summary">${canonical}
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/Poppins-Bold.woff" as="font" type="font/woff" crossorigin>
  <link rel="preload" href="assets/fonts/Lora-Variable.woff" as="font" type="font/woff" crossorigin>
  <script>document.documentElement.classList.add("js");if(matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("rm");</script>
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap">
      <a class="wordmark" href="#home">${esc(P.name)}</a>
      <nav aria-label="Primary">
        <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="nav-list">Menu</button>
        <ul class="nav-list" id="nav-list">
          ${nav.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("\n          ")}
        </ul>
      </nav>
    </div>
    <div class="progress" id="progress" aria-hidden="true"></div>
  </header>

  <main id="main">
    <section class="hero" id="home" aria-label="Introduction">
      <div class="wrap hero-grid">
        <div>
          <h1><span class="line"><span class="word">${esc(first)}</span></span><span class="line"><span class="word">${esc(lastName)}</span></span></h1>
          <p class="hero-title">${esc(S.headline)}</p>
          <p class="hero-intro">${esc(S.intro)}</p>
          <div class="hero-actions">
            <a class="btn btn-solid" href="#projects">View projects</a>
            <a class="btn btn-line" href="${RESUME}" download>Download resume</a>
          </div>
          <p class="hero-links"><a href="${esc(P.github)}">GitHub</a><a href="${esc(P.linkedin)}">LinkedIn</a><a href="${esc(P.x)}">X</a></p>
        </div>
        <figure class="pipeline">${pipelineSvg()}
          <figcaption>How Mitti AI turns one product photo into a listing. Simplified from the live app.</figcaption>
        </figure>
      </div>
    </section>

    <section class="section" id="about">
      <div class="wrap">${head("About")}
        <div class="about-grid">
          <img class="portrait" src="assets/raunak.webp" width="560" height="560" alt="Portrait of ${esc(P.name)}" decoding="async">
          <div>
            <div class="about-copy">${S.about.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
            <dl class="facts">
              <div><dt>Studying</dt><dd>${esc(P.education.degree)}</dd></div>
              <div><dt>College</dt><dd>${esc(P.education.school)}</dd></div>
              <div><dt>Graduating</dt><dd>${esc(P.education.dates.replace("Expected ", ""))}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <section class="section band" id="projects">
      <div class="wrap">${head("Projects", "Both are team projects that are still in progress. Each panel separates what I built from what my teammates built.")}
        ${P.projects.map(project).join("\n")}
      </div>
    </section>

    <section class="section" id="skills">
      <div class="wrap">${head("Skills", "What I use now, kept apart from what I am still learning.")}
        <dl class="skill-rows">${P.skills.map(skillRow).join("")}
        </dl>
      </div>
    </section>

    <section class="section" id="experience">
      <div class="wrap">${head("Experience and leadership")}
        ${P.leadership.map(role).join("\n")}
      </div>
    </section>

    <section class="section" id="open-source">
      <div class="wrap">${head("Open source")}
        <p class="os-lead">${esc(S.openSource.lead)}</p>
        <ul class="os-points">${S.openSource.points.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="section contact" id="contact">
      <div class="wrap">${head("Contact", S.contactLead)}
        <a class="contact-mail" href="mailto:${esc(P.email)}">${esc(P.email)}</a>
        <div class="contact-actions">
          <button class="btn btn-solid" id="copy-email" type="button" data-copy="${esc(P.email)}" hidden>Copy email address</button>
          <a class="btn btn-line" href="${RESUME}" download>Download resume</a>
          <span class="copy-status" id="copy-status" role="status" aria-live="polite"></span>
        </div>
        <p class="social"><a href="${esc(P.github)}">GitHub</a><a href="${esc(P.linkedin)}">LinkedIn</a><a href="${esc(P.x)}">X</a><a href="${RESUME_ATS}" download>Resume, plain ATS version</a></p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p>&copy; ${year} ${esc(P.name)}</p>
      <nav aria-label="Social links"><a href="${esc(P.github)}">GitHub</a><a href="${esc(P.linkedin)}">LinkedIn</a><a href="${esc(P.x)}">X</a></nav>
    </div>
  </footer>
  <script src="main.js" defer></script>
</body>
</html>
`;

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, "index.html"), html);
for (const f of ["styles.css", "main.js", "favicon.svg", "robots.txt"]) cpSync(join(SRC, f), join(DIST, f));
cpSync(join(SRC, "assets"), join(DIST, "assets"), {
  recursive: true,
  filter: (src) => ![".docx", ".txt"].includes(extname(src)), // editable resume files stay out of the public site
});
console.log(`Built ${join("dist", "index.html")} (${(html.length / 1024).toFixed(1)} KB html)`);
