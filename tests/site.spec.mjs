import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

test("revogar análise com armazenamento cheio mantém a recusa após recarregar", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "biblio-privacy-v1" && this.getItem(key))
        throw new DOMException("Quota cheia", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.goto("/");
  await page.getByLabel("Permitir análise de uso", { exact: false }).check();
  await page.getByRole("button", { name: "Salvar escolhas" }).click();
  await expect(page.locator("#biblio-analytics")).toHaveCount(1);
  await page.getByRole("button", { name: "Preferências de cookies" }).click();
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await expect(page.locator(".grid .box")).toHaveCount(36);
  await expect(page.locator("#biblio-analytics")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Sobre", exact: true })
    .click();
  await expect(page.locator("#biblio-analytics")).toHaveCount(0);
});

test("progresso inválido recupera a partida e preserva as estatísticas", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".grid .box")).toHaveCount(36);
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("state"));
    localStorage.setItem("state", JSON.stringify({ ...state, currentRow: 99 }));
    localStorage.setItem(
      "stats",
      JSON.stringify({ games: 9, wins: 4, winStreak: 1, maxStreak: 2 }),
    );
  });
  await page.reload();
  await expect(page.locator(".grid .box")).toHaveCount(36);
  await page.getByRole("button", { name: "Meu progresso" }).click();
  await expect(page.locator("#games .stat-number")).toHaveText("9");
});

test("o servidor não entrega arquivos privados por separadores do Windows", async ({
  request,
}) => {
  const response = await request.get("/images%5c..%5c.git%5cconfig");
  expect(response.status()).toBe(404);
});

test("Jó e João têm siglas distintas nas regras", async ({ page }) => {
  await page.goto("/como-jogar.html");
  await expect(page.getByRole("cell", { name: "JO", exact: true })).toHaveCount(
    1,
  );
  await expect(
    page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: "Jó", exact: true }) }),
  ).toContainText("JB");
});

test.beforeEach(async ({ page }) => {
  // A avaliação do site não deve enviar telemetria nem pedir anúncios reais.
  await page.route(/^https:\/\//, (route) => route.abort());
});

test("o desafio de Atos abre e permite enviar uma tentativa", async ({
  page,
}) => {
  const baseline = process.env.BIBLIO_BASELINE === "1";
  if (baseline) {
    const original = execFileSync("git", ["show", "1e41a97:script.js"], {
      encoding: "utf8",
    });
    const originalBible = execFileSync("git", ["show", "1e41a97:bible.json"], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    });
    await page.route("**/bible.json", (route) =>
      route.fulfill({ body: originalBible, contentType: "application/json" }),
    );
    await page.route("**/bible-index.js", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }),
    );
    await page.route("**/script.js", (route) =>
      route.fulfill({ body: original, contentType: "text/javascript" }),
    );
  }
  // Datas com sorteio de Atos nas respectivas versões do índice.
  await page.clock.install({
    time: new Date(baseline ? "2026-10-13T12:00:00" : "2026-10-31T12:00:00"),
  });
  await page.goto("/");
  await expect(page.locator(".grid .box")).toHaveCount(36);
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
  await page.keyboard.type("AT0402");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await expect(page.locator("#tag")).toHaveText("Atos 4:2");
  await expect(page.locator(".grid .right")).toHaveCount(6);
});

test("uma falha no texto bíblico oferece nova tentativa e não solicita anúncios", async ({
  page,
}) => {
  const adRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("googlesyndication"))
      adRequests.push(request.url());
  });
  await page.route("**/site-config.js", (route) =>
    route.fulfill({
      body: 'window.BIBLIO_CONFIG = { adsEnabled: true, adSlot: "123456789", publisherId: "ca-pub-4020170826821314" };',
      contentType: "text/javascript",
    }),
  );
  await page.route("**/bible.json", (route) =>
    route.fulfill({ status: 503, body: "indisponível" }),
  );
  await page.goto("/");
  await page.getByLabel("Permitir publicidade", { exact: false }).check();
  await page.getByRole("button", { name: "Salvar escolhas" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível carregar",
  );
  await expect(
    page.getByRole("button", { name: "Tentar novamente" }),
  ).toBeVisible();
  expect(adRequests).toEqual([]);
  await page.unroute("**/bible.json");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".grid .box")).toHaveCount(36);
});

test("recusar opcionais mantém o jogo funcional sem carregar Google", async ({
  page,
}) => {
  const external = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://")) external.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator(".grid .box")).toHaveCount(36);
  expect(external).toEqual([]);
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await page.reload();
  await expect(page.locator(".grid .box")).toHaveCount(36);
  await expect(page.locator("#privacy-choices")).toBeHidden();
  await page.getByRole("button", { name: "Meu progresso" }).click();
  await expect(page.locator("#games .stat-number")).toHaveText("0");
  await expect(page.locator("#percentage .stat-number")).toHaveText("0%");
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
  await page.keyboard.type("GN");
  await expect(page.locator("#box00")).toHaveText("G");
  await page.reload();
  await expect(page.locator("#box01")).toHaveText("N");
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
  await page.keyboard.type("0101");
  await expect(page.locator("#box02")).toHaveText("0");
  expect(external).toEqual([]);
});

test("análise depende de escolha e pode ser revogada", async ({ page }) => {
  const analyticsRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("googletagmanager"))
      analyticsRequests.push(request.url());
  });
  await page.goto("/");
  await page.getByLabel("Permitir análise de uso", { exact: false }).check();
  await page.getByRole("button", { name: "Salvar escolhas" }).click();
  await expect(page.locator("#biblio-analytics")).toHaveCount(1);
  expect(analyticsRequests).toHaveLength(1);
  await page.getByRole("button", { name: "Preferências de cookies" }).click();
  await page.getByLabel("Permitir análise de uso", { exact: false }).uncheck();
  await page.getByRole("button", { name: "Salvar escolhas" }).click();
  await expect(page.locator("#privacy-choices")).toBeHidden();
  await expect(page.locator("#biblio-analytics")).toHaveCount(0);
  await expect(page.locator(".grid .box")).toHaveCount(36);
  expect(analyticsRequests).toHaveLength(1);
});

test("a publicidade configurada só ocupa o espaço abaixo do jogo após permissão", async ({
  page,
}) => {
  await page.route("**/site-config.js", (route) =>
    route.fulfill({
      body: 'window.BIBLIO_CONFIG = { adsEnabled: true, adSlot: "123456789", publisherId: "ca-pub-4020170826821314" };',
      contentType: "text/javascript",
    }),
  );
  await page.goto("/");
  await expect(page.locator(".grid .box")).toHaveCount(36);
  await expect(page.locator("#biblio-adsense")).toHaveCount(0);
  await page.getByLabel("Permitir publicidade", { exact: false }).check();
  await page.getByRole("button", { name: "Salvar escolhas" }).click();
  await expect(page.locator("#biblio-adsense")).toHaveCount(1);
  await expect(page.locator("[data-ad-space] ins")).toHaveCount(1);
  const game = await page.locator(".game-panel").boundingBox();
  const ad = await page.locator("[data-ad-space]").boundingBox();
  expect(ad.y).toBeGreaterThan(game.y + game.height + 32);
  await page.reload();
  await expect(page.locator("[data-ad-space] ins")).toHaveCount(1);
});

test("páginas públicas e navegação funcionam sem JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Como jogar" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Como jogar Biblio",
  );
  await expect(
    page.getByRole("cell", { name: "Atos", exact: true }),
  ).toBeVisible();
  for (const [file, title] of [
    ["guias.html", "Mais que acertar uma referência."],
    [
      "referencias-biblicas.html",
      "Livro, capítulo e versículo: por onde começar?",
    ],
    ["estrategias.html", "Transforme as cores em pistas."],
    ["sobre.html", "Uma pausa para as Escrituras."],
    ["contato.html", "Contato"],
    ["privacidade.html", "Política de privacidade"],
  ]) {
    await page.goto(`http://127.0.0.1:4173/${file}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(
      page.getByRole("navigation", { name: "Informações do site" }),
    ).toBeVisible();
  }
  await context.close();
});

test("o tabuleiro cabe na tela e a prévia mantém o conteúdo legível", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await expect(page.locator(".grid .box")).toHaveCount(36);
  const viewport = page.viewportSize();
  for (const selector of [
    ".grid",
    ".keyboard",
    ".site-header",
    ".site-footer",
  ]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  }
  await page.screenshot({
    path: `.scratch/adsense/${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
