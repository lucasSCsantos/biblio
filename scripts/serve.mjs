import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const root = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
};
export async function createSiteServer({
  port = Number(process.env.BIBLIO_PORT || 4173),
  persist = false,
  results = true,
  beforeMigration,
  afterMigration,
} = {}) {
  const runtime = results
    ? new Miniflare({
        host: "127.0.0.1",
        port: 0,
        modules: true,
        scriptPath: path.join(root, "worker/index.mjs"),
        compatibilityDate: "2026-07-30",
        bindings: { MEASURE_D1: "1" },
        d1Databases: { DB: "biblio-results" },
        ...(persist ? { d1Persist: path.join(root, ".scratch/d1") } : {}),
      })
    : null;
  if (runtime) {
    const db = await runtime.getD1Database("DB");
    for (const file of (
      await fs.readdir(path.join(root, "worker/migrations"))
    ).sort()) {
      if (file.endsWith(".sql")) {
        await beforeMigration?.({ file, db });
        const migration = await fs.readFile(
          path.join(root, "worker/migrations", file),
          "utf8",
        );
        await db.exec(migration);
        await afterMigration?.({ file, db, migration });
      }
    }
  }
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      if (url.pathname.startsWith("/api/")) {
        if (!runtime) {
          response.writeHead(503);
          response.end();
          return;
        }
        const chunks = [];
        let length = 0;
        for await (const chunk of request) {
          length += chunk.length;
          if (length > 16384) {
            response.writeHead(413);
            response.end();
            return;
          }
          chunks.push(chunk);
        }
        const result = await runtime.dispatchFetch(
          `http://${request.headers.host}${request.url}`,
          {
            method: request.method,
            headers: request.headers,
            ...(!["GET", "HEAD"].includes(request.method)
              ? { body: Buffer.concat(chunks) }
              : {}),
          },
        );
        response.writeHead(result.status, Object.fromEntries(result.headers));
        response.end(Buffer.from(await result.arrayBuffer()));
        return;
      }
      const resource = decodeURIComponent(url.pathname);
      if (resource.includes("\\")) throw new Error("Separador inválido");
      const parts = resource.split("/").filter(Boolean);
      if (
        parts.some(
          (p) =>
            p.startsWith(".") ||
            p === "node_modules" ||
            p === "scripts" ||
            p === "worker" ||
            p === "tests" ||
            p === "wrangler.jsonc" ||
            p === "content",
        )
      )
        throw new Error("Recurso privado");
      const file = path.resolve(
        root,
        `.${resource === "/" ? "/index.html" : resource}`,
      );
      if (!file.startsWith(root + path.sep))
        throw new Error("Caminho inválido");
      let data = await fs.readFile(file);
      if (resource === "/site-config.js" && results)
        data = Buffer.from(
          data
            .toString()
            .replace(/resultsApiUrl:\s*"[^"]*"/, 'resultsApiUrl: "/api"'),
        );
      response.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(data);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Página não encontrada.");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    async close() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await runtime?.dispose();
    },
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const site = await createSiteServer({ persist: true });
  console.log(`Biblio: ${site.url}`);
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, async () => {
      await site.close();
      process.exit(0);
    });
}
