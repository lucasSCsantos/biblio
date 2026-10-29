import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
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
http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const resource = decodeURIComponent(url.pathname);
      if (resource.includes("\\")) throw new Error("Separador inválido");
      const parts = resource.split("/").filter(Boolean);
      if (
        parts.some(
          (p) =>
            p.startsWith(".") ||
            p === "node_modules" ||
            p === "scripts" ||
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
      const data = await fs.readFile(file);
      response.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(data);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Página não encontrada.");
    }
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Biblio: http://127.0.0.1:4173"),
  );
