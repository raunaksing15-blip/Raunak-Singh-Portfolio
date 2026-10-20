// Static checks on dist/index.html:  node scripts/check.mjs   (run build first)
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const html = readFileSync(join(DIST, "index.html"), "utf8");
const problems = [];
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const urls = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
const external = new Set();
for (const u of urls) {
  if (u.startsWith("#")) { if (!ids.has(u.slice(1))) problems.push(`Missing anchor target: ${u}`); }
  else if (/^(https?:|mailto:)/.test(u)) external.add(u);
  else if (!existsSync(join(DIST, u))) problems.push(`Missing file: ${u}`);
}
for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0])) problems.push(`Image without alt: ${m[0].slice(0, 60)}`);
if ((html.match(/<h1\b/g) || []).length !== 1) problems.push("Page must have exactly one h1");
if (/lorem|todo|placeholder|example\.com|your-name/i.test(html)) problems.push("Placeholder-looking text found");
if (/AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}|api[_-]?key\s*[:=]/i.test(html)) problems.push("Possible secret found");
console.log(`Local links checked. ${external.size} external links to verify by hand or with the browser test:`);
[...external].sort().forEach((u) => console.log("  " + u));
if (problems.length) { console.error("\nProblems:\n - " + problems.join("\n - ")); process.exit(1); }
console.log("\nStatic checks passed.");
