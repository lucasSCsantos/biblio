import { test as base, expect } from "@playwright/test";
import { createSiteServer } from "../scripts/serve.mjs";
import { createHash } from "node:crypto";

const test = base.extend({
  service: async ({}, use) => {
    const service = await createSiteServer({ port: 0 });
    await use(service);
    await service.close();
  },
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("biblio-palavra-intro-seen", "true"),
  );
  await page.route(/^https:\/\//, (route) => route.abort());
});

test("Difícil sorteia outra referência e mantém o desafio ao recarregar", async ({ page }) => {
  await page.route("**/bible-index.js", route => route.fulfill({
    contentType: "text/javascript", body: "const bible = {jo: [{chapter: 1, versicles: 2}]};",
  }));
  await page.route("**/bible.json", route => route.fulfill({ json: [{
    abbrev: "jo", name: "João", chapters: [["Primeira passagem.", "Segunda passagem."]],
  }] }));
  await page.goto("/");
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await expect(page.locator("#game[data-ready=true]")).toBeVisible();
  const normal = await page.locator(".versicle h2").textContent();
  await page.getByRole("link", { name: "Difícil", exact: true }).click();
  await expect(page.locator("#game[data-ready=true]")).toBeVisible();
  await expect(page.locator(".versicle h2")).not.toHaveText(normal);
  const difficult = await page.locator(".versicle h2").textContent();
  await page.reload();
  await expect(page.locator(".versicle h2")).toHaveText(difficult);
  await page.getByRole("link", { name: "Referência", exact: true }).click();
  await expect(page.locator(".versicle h2")).toHaveText(normal);
});

async function referenceGame(page, book, mode = "") {
  await page.route("**/bible-index.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `const bible = ${JSON.stringify({ [book]: [{ chapter: 1, versicles: 1 }] })};`,
    }),
  );
  await page.route("**/bible.json", (route) =>
    route.fulfill({
      json: [
        {
          abbrev: book,
          name: book === "jo" ? "João" : `${book[0]} Samuel`,
          chapters: [["Uma passagem para o teste."]],
        },
      ],
    }),
  );
  await page.goto(`/${mode ? `?modo=${mode}` : ""}`);
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await expect(page.locator("#game[data-ready=true]")).toBeVisible();
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
}

test("Difícil aceita numeral, permite apagar e preserva a partida ao trocar de modo", async ({
  page,
}, testInfo) => {
  await referenceGame(page, "1sm", "hard");
  await expect(page.locator(".grid .box")).toHaveCount(42);
  await expect(
    page.getByRole("link", { name: "Difícil", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.type("2S");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await expect(page.locator("#box00")).toBeEmpty();
  await page.keyboard.type("1SM0101");
  await page.getByRole("link", { name: "Referência", exact: true }).click();
  await expect(page.locator(".grid .box")).toHaveCount(36);
  await expect(page.locator("#box00")).toBeEmpty();
  await page.getByRole("link", { name: "Difícil", exact: true }).click();
  await expect(page.locator("#box00")).toHaveText("1");
  for (const selector of [".grid", ".keyboard", ".game-modes"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(
      page.viewportSize().width + 1,
    );
  }
  await page.screenshot({
    path: `.scratch/hard/${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#stats-title")).toContainText("Difícil");
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await expect(page.locator("#tag")).toHaveText("1 Samuel 1:1");
  await expect(page.locator(".grid .right")).toHaveCount(7);
  await page.reload();
  await expect(page.locator(".grid .right")).toHaveCount(7);
  await page.getByRole("link", { name: "Ver histórico completo" }).click();
  await expect(page.locator("#stats-mode-title")).toHaveText("Difícil");
  await expect(page.locator("#stats-games")).toHaveText("1");
});

test("Difícil pula a casa opcional ao começar por letra e avalia a casa vazia", async ({
  page,
}) => {
  await referenceGame(page, "jo", "hard");
  await page.keyboard.type("J");
  await expect(page.locator("#box00")).toBeEmpty();
  await expect(page.locator("#box01")).toHaveText("J");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("1JO0101");
  await page.keyboard.press("Enter"); // A sigla numerada não está no corpus deste teste.
  await expect(page.locator("#box00")).toBeEmpty();
  await page.keyboard.type("JO0101");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#box00")).toHaveClass(/right/);
  await page.reload();
  await expect(page.locator("#box00")).toHaveClass(/right/);
  await expect(page.locator(".grid .right")).toHaveCount(7);
});

test("o tabuleiro Difícil cabe em celulares estreitos", async ({ page }) => {
  await referenceGame(page, "1sm", "hard");
  for (const width of [375, 361, 360, 320]) {
    await page.setViewportSize({ width, height: 800 });
    const grid = await page.locator(".grid").boundingBox();
    expect(grid.x).toBeGreaterThanOrEqual(0);
    expect(grid.x + grid.width).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

for (const book of ["1sm", "2sm"]) {
  test(`normal sorteia ${book} e aceita SM sem numeral`, async ({ page }) => {
    await referenceGame(page, book);
    await page.keyboard.type("SM0101");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Fechar progresso" }).click();
    await expect(page.locator("#tag")).toHaveText(`${book[0]} Samuel 1:1`);
    await expect(page.locator(".grid .right")).toHaveCount(6);
  });
}

test("a API mantém resultados e histórico Difícil separados do normal", async ({
  request,
  service,
}) => {
  const headers = { Authorization: `Bearer ${"a".repeat(64)}` };
  const day = "2026-11-01";
  const player = await request.put(`${service.url}/api/player`, {
    headers,
    data: { baselines: {} },
  });
  expect(player.status()).toBe(200);
  for (const mode of ["referencia", "hard"]) {
    const response = await request.post(`${service.url}/api/results`, {
      headers,
      data: { mode, day, won: true, attempts: mode === "hard" ? 2 : 1 },
    });
    expect(response.status()).toBe(200);
  }
  for (const mode of ["referencia", "hard"]) {
    const response = await request.get(
      `${service.url}/api/history?mode=${mode}&day=${day}`,
      { headers },
    );
    expect(response.status()).toBe(200);
    const history = await response.json();
    expect(history.stats.games).toBe(1);
    expect(history.history).toEqual([
      { day, won: true, attempts: mode === "hard" ? 2 : 1 },
    ]);
  }
});

test("a migração conserva histórico e comparação normal e permite jogar Difícil", async ({
  request,
}) => {
  const token = "b".repeat(64);
  const headers = { Authorization: `Bearer ${token}` };
  const id = createHash("sha256").update(token).digest("hex");
  const day = "2026-10-30";
  const service = await createSiteServer({
    port: 0,
    beforeMigration: async ({ file, db }) => {
      if (file !== "0003-hard-mode.sql") return;
      const baseline = JSON.stringify({
        referencia: {
          games: 2,
          wins: 1,
          winStreak: 1,
          maxStreak: 1,
          lastPlayedDay: "2026-10-29",
        },
      });
      await db
        .prepare("INSERT INTO players(id, baseline) VALUES (?, ?)")
        .bind(id, baseline)
        .run();
      await db
        .prepare(
          "INSERT INTO results(player_id, mode, day, won, attempts, score) VALUES (?, 'referencia', ?, 1, 2, 2)",
        )
        .bind(id, day)
        .run();
      await db
        .prepare("INSERT INTO players(id, baseline) VALUES ('peer', '{}')")
        .run();
      await db
        .prepare(
          "INSERT INTO results(player_id, mode, day, won, attempts, score) VALUES ('peer', 'referencia', ?, 1, 3, 3)",
        )
        .bind(day)
        .run();
    },
  });
  try {
    const response = await request.get(
      `${service.url}/api/history?mode=referencia&day=${day}`,
      { headers },
    );
    expect(response.status()).toBe(200);
    const history = await response.json();
    expect(history.stats).toMatchObject({
      games: 3,
      wins: 2,
      winStreak: 2,
      maxStreak: 2,
    });
    expect(history.history).toEqual([{ day, won: true, attempts: 2 }]);
    const stats = await request.get(
      `${service.url}/api/stats?mode=referencia&day=${day}`,
      { headers },
    );
    expect((await stats.json()).daily).toMatchObject({
      otherPlayers: 1,
      percentage: 100,
    });
    const hard = await request.post(`${service.url}/api/results`, {
      headers,
      data: { mode: "hard", day, won: true, attempts: 1 },
    });
    expect(hard.status()).toBe(200);
    expect((await hard.json()).stats.games).toBe(1);
  } finally {
    await service.close();
  }
});
