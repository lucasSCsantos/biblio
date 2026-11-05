import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function buildBibleIndex(corpus) {
  const counts = Object.fromEntries(
    corpus.map((book) => [
      book.abbrev,
      book.chapters.flatMap((verses, i) =>
        i < 99
          ? [{ chapter: i + 1, versicles: Math.min(verses.length, 99) }]
          : [],
      ),
    ]),
  );
  fs.writeFileSync(
    "bible-index.js",
    `// Gerado por scripts/build-bible-index.mjs a partir da Bíblia Livre.\nconst bible = ${JSON.stringify(counts)};\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  buildBibleIndex(JSON.parse(fs.readFileSync("bible.json", "utf8")));
