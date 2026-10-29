import fs from "node:fs";
import crypto from "node:crypto";

// Fonte: pacote porbr2018_vpl.zip de eBible.org; veja licenses/BIBLIA-LIVRE.md.
const input = process.argv[2];
if (!input)
  throw new Error(
    "Uso: node scripts/import-bible.mjs caminho/porbr2018_vpl.txt",
  );
const books = [
  ["GEN", "gn", "Gênesis"],
  ["EXO", "ex", "Êxodo"],
  ["LEV", "lv", "Levítico"],
  ["NUM", "nm", "Números"],
  ["DEU", "dt", "Deuteronômio"],
  ["JOS", "js", "Josué"],
  ["JDG", "jz", "Juízes"],
  ["RUT", "rt", "Rute"],
  ["1SA", "1sm", "1 Samuel"],
  ["2SA", "2sm", "2 Samuel"],
  ["1KI", "1rs", "1 Reis"],
  ["2KI", "2rs", "2 Reis"],
  ["1CH", "1cr", "1 Crônicas"],
  ["2CH", "2cr", "2 Crônicas"],
  ["EZR", "ed", "Esdras"],
  ["NEH", "ne", "Neemias"],
  ["EST", "et", "Ester"],
  ["JOB", "jb", "Jó"],
  ["PSA", "sl", "Salmos"],
  ["PRO", "pv", "Provérbios"],
  ["ECC", "ec", "Eclesiastes"],
  ["SOL", "ct", "Cânticos"],
  ["ISA", "is", "Isaías"],
  ["JER", "jr", "Jeremias"],
  ["LAM", "lm", "Lamentações"],
  ["EZE", "ez", "Ezequiel"],
  ["DAN", "dn", "Daniel"],
  ["HOS", "os", "Oséias"],
  ["JOE", "jl", "Joel"],
  ["AMO", "am", "Amós"],
  ["OBA", "ob", "Obadias"],
  ["JON", "jn", "Jonas"],
  ["MIC", "mq", "Miquéias"],
  ["NAH", "na", "Naum"],
  ["HAB", "hc", "Habacuque"],
  ["ZEP", "sf", "Sofonias"],
  ["HAG", "ag", "Ageu"],
  ["ZEC", "zc", "Zacarias"],
  ["MAL", "ml", "Malaquias"],
  ["MAT", "mt", "Mateus"],
  ["MAR", "mc", "Marcos"],
  ["LUK", "lc", "Lucas"],
  ["JOH", "jo", "João"],
  ["ACT", "at", "Atos"],
  ["ROM", "rm", "Romanos"],
  ["1CO", "1co", "1 Coríntios"],
  ["2CO", "2co", "2 Coríntios"],
  ["GAL", "gl", "Gálatas"],
  ["EPH", "ef", "Efésios"],
  ["PHI", "fp", "Filipenses"],
  ["COL", "cl", "Colossenses"],
  ["1TH", "1ts", "1 Tessalonicenses"],
  ["2TH", "2ts", "2 Tessalonicenses"],
  ["1TI", "1tm", "1 Timóteo"],
  ["2TI", "2tm", "2 Timóteo"],
  ["TIT", "tt", "Tito"],
  ["PHM", "fm", "Filemom"],
  ["HEB", "hb", "Hebreus"],
  ["JAM", "tg", "Tiago"],
  ["1PE", "1pe", "1 Pedro"],
  ["2PE", "2pe", "2 Pedro"],
  ["1JO", "1jo", "1 João"],
  ["2JO", "2jo", "2 João"],
  ["3JO", "3jo", "3 João"],
  ["JUD", "jd", "Judas"],
  ["REV", "ap", "Apocalipse"],
];
const corpus = books.map(([, abbrev, name]) => ({
  abbrev,
  name,
  chapters: [],
}));
const byCode = new Map(books.map(([code], i) => [code, corpus[i]]));
const raw = fs.readFileSync(input, "utf8");
for (const line of raw.trim().split(/\r?\n/)) {
  const match = /^(\w+) (\d+):(\d+) (.+)$/.exec(line);
  if (!match) throw new Error(`Linha VPL inválida: ${line.slice(0, 40)}`);
  const [, code, chapter, verse, text] = match;
  const book = byCode.get(code);
  if (!book) throw new Error(`Livro desconhecido: ${code}`);
  const verses = (book.chapters[Number(chapter) - 1] ||= []);
  if (Number(verse) !== verses.length + 1)
    throw new Error(`Numeração descontínua: ${code} ${chapter}:${verse}`);
  verses.push(text);
}
for (const book of corpus) {
  if (!book.chapters.length || book.chapters.some((c) => !c?.length))
    throw new Error(`Livro incompleto: ${book.name}`);
}
fs.writeFileSync("bible.json", JSON.stringify(corpus) + "\n");
const eligible = corpus.filter((b) => b.abbrev.length === 2);
const counts = Object.fromEntries(
  eligible.map((b) => [
    b.abbrev,
    b.chapters.flatMap((c, i) =>
      i < 99 ? [{ chapter: i + 1, versicles: Math.min(c.length, 99) }] : [],
    ),
  ]),
);
fs.writeFileSync(
  "bible-index.js",
  `// Gerado por scripts/import-bible.mjs a partir da Bíblia Livre.\nconst bible = ${JSON.stringify(counts)};\n`,
);
console.log(
  `Importados ${corpus.length} livros, ${corpus.reduce((n, b) => n + b.chapters.reduce((s, c) => s + c.length, 0), 0)} versículos. SHA-256 VPL: ${crypto.createHash("sha256").update(raw).digest("hex")}`,
);
