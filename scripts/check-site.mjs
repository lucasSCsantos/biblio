import fs from "node:fs";
import vm from "node:vm";

// Verifica que todo endereço sorteável existe na mesma tradução publicada.
const corpus = JSON.parse(fs.readFileSync("bible.json", "utf8"));
const index = vm.runInNewContext(
  fs.readFileSync("bible-index.js", "utf8") + ";bible",
);
const abbreviations = Object.keys(index).map((abbrev) =>
  abbrev
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""),
);
if (new Set(abbreviations).size !== abbreviations.length)
  throw new Error("Siglas ambíguas no índice do jogo");
let references = 0;
for (const [abbrev, chapters] of Object.entries(index)) {
  const book = corpus.find((book) => book.abbrev === abbrev);
  if (!book) throw new Error(`Sigla sem texto correspondente: ${abbrev}`);
  for (const { chapter, versicles } of chapters) {
    for (let verse = 1; verse <= versicles; verse++) {
      if (!book.chapters[chapter - 1]?.[verse - 1]?.trim())
        throw new Error(`Referência vazia: ${abbrev} ${chapter}:${verse}`);
      references++;
    }
  }
}

// Os links internos, recursos e âncoras das páginas geradas devem resolver localmente.
const pages = fs.readdirSync(".").filter((file) => file.endsWith(".html"));
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length)
    throw new Error(`IDs duplicados em ${page}`);
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(value)) continue;
    const [target, anchor] = value.split("#");
    const file = target || page;
    if (!fs.existsSync(file))
      throw new Error(`Recurso ausente em ${page}: ${value}`);
    if (anchor && !fs.readFileSync(file, "utf8").includes(`id="${anchor}"`))
      throw new Error(`Âncora ausente em ${page}: ${value}`);
  }
}
console.log(
  `${pages.length} páginas: links e IDs válidos; ${references} referências disponíveis em ${Object.keys(index).length} livros.`,
);
