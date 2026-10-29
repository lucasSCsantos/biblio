import fs from "node:fs";

const pages = [
  [
    "index.html",
    "Biblio — desafio bíblico diário",
    "Dois jogos bíblicos diários: descubra a referência ou a palavra que falta no versículo em seis tentativas. Gratuito e sem cadastro.",
    "Jogar",
  ],
  [
    "como-jogar.html",
    "Como jogar Biblio",
    "Aprenda as regras do Biblio, as siglas dos livros e o significado das cores de cada tentativa.",
    "Como jogar",
  ],
  [
    "guias.html",
    "Guias para ler e jogar",
    "Entenda referências bíblicas e aprenda estratégias para aproveitar o desafio diário do Biblio.",
    "Guias",
  ],
  [
    "referencias-biblicas.html",
    "Como entender uma referência bíblica",
    "Livro, capítulo e versículo: um guia prático para localizar uma passagem e ler seu contexto.",
    "Guias",
  ],
  [
    "estrategias.html",
    "Como usar as pistas do Biblio",
    "Combine memória e lógica para interpretar as cores, comparar tentativas e aprender com cada partida.",
    "Guias",
  ],
  [
    "sobre.html",
    "Sobre o Biblio",
    "Conheça o projeto Biblio, seu criador, a tradução Bíblia Livre e a proposta do desafio diário.",
    "Sobre",
  ],
  [
    "contato.html",
    "Contato",
    "Entre em contato com o responsável pelo Biblio para relatar erros, enviar sugestões ou tratar de privacidade.",
    "Contato",
  ],
  [
    "privacidade.html",
    "Política de privacidade",
    "Saiba como o Biblio armazena seu progresso e gerencia suas escolhas sobre análise de uso e publicidade.",
    "",
  ],
];
const nav = [
  ["index.html", "Jogar"],
  ["como-jogar.html", "Como jogar"],
  ["guias.html", "Guias"],
  ["sobre.html", "Sobre"],
  ["contato.html", "Contato"],
];
const bible = JSON.parse(fs.readFileSync("bible.json", "utf8"));
const bookTable = `<div class="table-scroll"><table><caption>Siglas dos livros disponíveis no jogo</caption><thead><tr><th scope="col">Sigla</th><th scope="col">Livro</th></tr></thead><tbody>${bible
  .filter((b) => b.abbrev.length === 2)
  .map(
    (b) =>
      `<tr><td>${b.abbrev
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")}</td><td>${b.name}</td></tr>`,
  )
  .join("")}</tbody></table></div>`;
const privacy = `<section id="privacy-choices" class="privacy-panel" aria-labelledby="privacy-title" hidden>
  <div><p class="eyebrow">Você escolhe</p><h2 id="privacy-title" tabindex="-1">Sua privacidade, suas preferências</h2>
  <p>O progresso do jogo fica neste navegador. Análise de uso e publicidade são opcionais e só carregam com sua permissão. Você pode jogar sem aceitar.</p>
  <p><a href="privacidade.html">Leia a política de privacidade</a>. Altere sua escolha a qualquer momento pelo rodapé.</p></div>
  <div class="privacy-controls"><label><input id="allow-analytics" type="checkbox"> Permitir análise de uso (Google Analytics)</label>
  <label><input id="allow-advertising" type="checkbox"> Permitir publicidade (Google AdSense, quando disponível)</label>
  <div class="button-row"><button id="privacy-reject" type="button">Recusar opcionais</button><button id="privacy-save" type="button">Salvar escolhas</button></div>
  <p id="privacy-status" role="status"></p></div>
</section>`;
for (const [file, title, description, active] of pages) {
  const [body, dialog = ""] = fs
    .readFileSync(`content/${file}`, "utf8")
    .replace("<!-- BOOK_TABLE -->", bookTable)
    .split("<!-- GAME_DIALOG -->");
  const home = file === "index.html";
  const canonical = `https://bibliooo.com.br/${home ? "" : file}`;
  fs.writeFileSync(
    file,
    `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta name="google-adsense-account" content="ca-pub-4020170826821314">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="images/favicon.ico">
  <link rel="stylesheet" href="styles.css">
  <script src="site-config.js" defer></script>
  <script src="site.js" defer></script>
${home ? '  <script src="bible-index.js" defer></script>\n  <script src="word-game.js" defer></script>\n  <script src="script.js" defer></script>' : ""}
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="site-header"><a class="brand" href="index.html" aria-label="Biblio, página inicial">BIBLIO</a>
    <nav aria-label="Navegação principal">${nav.map(([url, label]) => `<a href="${url}"${label === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
  </header>
  <div class="page-shell">${privacy}
  <main id="conteudo"${home ? ' class="home-content"' : ' class="article"'}>${body}</main>
  </div>${dialog}
  <footer class="site-footer"><div><a class="footer-brand" href="index.html">Biblio</a><p>Memória, descoberta e um novo versículo a cada dia.</p></div>
    <nav aria-label="Informações do site"><a href="sobre.html">Sobre e créditos</a><a href="contato.html">Contato</a><a href="privacidade.html">Privacidade</a><button type="button" data-privacy-settings>Preferências de cookies</button></nav>
    <p class="attribution">Textos bíblicos: <a href="https://sites.google.com/site/biblialivre/">Bíblia Livre (BLIVRE)</a>, fevereiro de 2018. © Diego Santos, Mario Sérgio e Marco Teles. Distribuição eBible sob <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Conversão para JSON pelo Biblio. <a href="sobre.html#traducao">Fonte e licença</a>.</p>
  </footer>
</body>
</html>\n`,
  );
}
fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([file]) => `  <url><loc>https://bibliooo.com.br/${file === "index.html" ? "" : file}</loc></url>`).join("\n")}\n</urlset>\n`,
);
console.log(`Geradas ${pages.length} páginas estáticas e sitemap.xml.`);
