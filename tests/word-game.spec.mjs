import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("biblio-palavra-intro-seen", "true"),
  );
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.clock.install({ time: new Date("2026-10-31T12:00:00") });
});

test("o jogador escolhe Palavra e recebe um tabuleiro de cinco letras", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await page
    .getByRole("navigation", { name: "Modos de jogo" })
    .getByRole("link", { name: "Palavra", exact: true })
    .click();
  await expect(page.locator("#game[data-ready=true] .box")).toHaveCount(30);
  await expect(page.locator(".verse-reference")).toHaveText(/\S+ \d+:\d+/);
  await expect(page.locator(".versicle h2")).toContainText("_____");
  await expect(page.locator(".colon")).toHaveCount(0);
  await expect(page.locator(".keyboard-row")).toHaveCount(3);
  for (const selector of [".game-modes", ".grid", ".keyboard"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(
      page.viewportSize().width + 1,
    );
  }
  const passage = await page.locator(".versicle").innerText();
  await page.reload();
  await expect(page.locator(".versicle")).toHaveText(passage, {
    useInnerText: true,
  });
  await page.screenshot({
    path: `.scratch/modo-palavra/${testInfo.project.name}.png`,
    fullPage: true,
  });
});

// Corpus pequeno para exercitar repetições e acentos com resposta conhecida.
async function knownChallenge(page) {
  await page.route("**/bible.json", (route) =>
    route.fulfill({
      json: [
        {
          abbrev: "gn",
          name: "Gênesis",
          chapters: [
            ["A graça, a GRAÇA e a graça!", "Acaso acesa acres arara."],
          ],
        },
        {
          abbrev: "at",
          name: "Atos",
          chapters: [[], [], [], ["Acaso.", "A graça."]],
        },
      ],
    }),
  );
  await page.goto("/?modo=palavra");
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await expect(page.locator("#game[data-ready=true] .box")).toHaveCount(30);
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
}

test("oculta todas as ocorrências e usa referência diferente do outro modo", async ({
  page,
}) => {
  await knownChallenge(page);
  await expect(page.locator(".verse-reference")).toHaveText("Gênesis 1:1");
  await expect(page.locator(".versicle h2")).toHaveText(
    "“A _____, a _____ e a _____!”",
  );
  await page.getByRole("link", { name: "Referência", exact: true }).click();
  await page
    .locator("#game[data-ready=true]")
    .click({ position: { x: 5, y: 5 } });
  await page.keyboard.type("AT0402");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await expect(page.locator("#tag")).toHaveText("Atos 4:2");
});

test("palavra inválida não consome tentativa e cedilha permite vencer", async ({
  page,
}) => {
  await knownChallenge(page);
  await page.keyboard.type("ZZZZZ");
  await page.keyboard.press("Enter");
  await expect(page.locator("#game-feedback")).toContainText(
    "sem perder uma tentativa",
  );
  await expect(page.locator("#box00")).toHaveClass(/active/);
  await expect(page.locator(".grid .wrong")).toHaveCount(0);
  for (let i = 0; i < 5; i++) await page.keyboard.press("Backspace");
  await page.keyboard.type("gra");
  await page.locator("body").dispatchEvent("keyup", { key: "ç" });
  await page.keyboard.type("a");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#games .stat-number")).toHaveText("1");
  await expect(page.locator("#percentage .stat-number")).toHaveText("100%");
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await expect(page.locator(".grid .right")).toHaveCount(5);
  await expect(page.locator(".versicle h2")).toHaveText(
    "“A graça, a GRAÇA e a graça!”",
  );
  await expect(page.locator("#tag")).toHaveText("graça — Gênesis 1:1");
});

test("letras repetidas recebem pistas apenas até a quantidade da resposta", async ({
  page,
}) => {
  await knownChallenge(page);
  await page.keyboard.type("ARARA");
  await page.keyboard.press("Enter");
  await expect(page.locator("#game-feedback")).toContainText(
    "Tentativa 1 enviada",
  );
  for (const index of [1, 2, 4])
    await expect(page.locator(`#box0${index}`)).toHaveClass(/right/);
  for (const index of [0, 3])
    await expect(page.locator(`#box0${index}`)).toHaveClass(/wrong/);
  await page.keyboard.type("ACESA");
  await page.keyboard.press("Enter");
  await expect(page.locator("#game-feedback")).toContainText(
    "Tentativa 2 enviada",
  );
  for (const index of [0, 1])
    await expect(page.locator(`#box1${index}`)).toHaveClass(/parcial/);
  for (const index of [2, 3])
    await expect(page.locator(`#box1${index}`)).toHaveClass(/wrong/);
  await expect(page.locator("#box14")).toHaveClass(/right/);
});

test("alternar os modos preserva partidas e estatísticas independentes", async ({
  page,
}) => {
  await knownChallenge(page);
  await page.keyboard.type("ACESA");
  await page.keyboard.press("Enter");
  await expect(page.locator("#game-feedback")).toContainText(
    "Tentativa 1 enviada",
  );
  await page.getByRole("link", { name: "Referência", exact: true }).click();
  await page
    .locator("#game[data-ready=true]")
    .click({ position: { x: 5, y: 5 } });
  await page.keyboard.type("AT0402");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await page.getByRole("link", { name: "Palavra", exact: true }).click();
  await expect(page.locator("#box00")).toHaveText("A");
  await expect(page.locator("#box10")).toHaveClass(/active/);
  await page.getByRole("button", { name: "Meu progresso" }).click();
  await expect(page.locator("#games .stat-number")).toHaveText("0");
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
  await page.keyboard.type("GRACA");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#games .stat-number")).toHaveText("1");
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#games .stat-number")).toHaveText("1");
});

test("seis erros revelam a resposta e encerram a partida", async ({ page }) => {
  await knownChallenge(page);
  for (let attempt = 1; attempt <= 6; attempt++) {
    await page.keyboard.type("ACESA");
    await page.keyboard.press("Enter");
    if (attempt < 6)
      await expect(page.locator("#game-feedback")).toContainText(
        `Tentativa ${attempt} enviada`,
      );
  }
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#percentage .stat-number")).toHaveText("0%");
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await expect(page.locator("#tag")).toHaveText("graça — Gênesis 1:1");
  await expect(page.locator(".grid .active")).toHaveCount(0);
});

test("a virada do dia renova a partida e mantém as estatísticas", async ({
  page,
}) => {
  await knownChallenge(page);
  await page.keyboard.type("GRACA");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await page.clock.fastForward("12:00:01");
  await expect(page.locator("#game[data-ready=true] .active")).toHaveCount(5);
  await expect(page.locator("#box00")).toBeEmpty();
  await expect(page.locator(".versicle h2")).toContainText("_____");
  await page.getByRole("button", { name: "Meu progresso" }).click();
  await expect(page.locator("#games .stat-number")).toHaveText("1");
});

test("compartilhar identifica o modo e mantém a resposta oculta", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: async (data) => {
        window.sharedText = data.text;
      },
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          window.sharedText = text;
        },
      },
    });
  });
  await knownChallenge(page);
  for (const letter of "GRACA")
    await page
      .locator(".keyboard")
      .getByRole("button", { name: letter, exact: true })
      .click();
  await page.getByRole("button", { name: "Enviar tentativa" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Compartilhar resultado" }).click();
  const shared = await page.evaluate(() => window.sharedText);
  expect(shared).toContain("Palavra");
  expect(shared).toContain("🟩🟩🟩🟩🟩");
  expect(shared).toContain("A _____, a _____ e a _____!");
  expect(shared).not.toMatch(/graça|graca/i);
  expect(shared).toContain("?modo=palavra");
});
