// Tiny static server for previewing dist/:  node scripts/serve.mjs [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
const DIST = join(fileURLToPath(new URL("..", import.meta.url)), "dist");
const port = Number(process.argv[2]) || 4173;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".woff": "font/woff", ".webp": "image/webp", ".pdf": "application/pdf", ".txt": "text/plain" };
createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  if (path.endsWith("/") || path === "") path = join(path, "index.html");
  try {
    const body = await readFile(join(DIST, path));
    res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404, { "content-type": "text/plain" }); res.end("Not found"); }
}).listen(port, () => console.log(`Preview at http://localhost:${port}`));
