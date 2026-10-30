import { test as base, expect } from "@playwright/test";
import { createSiteServer } from "../scripts/serve.mjs";

const test = base.extend({
  service: async ({}, use) => {
    const service = await createSiteServer({ port: 0 });
    await use(service);
    await service.close();
  },
});

async function openWordGame(page, service, analytics, nativeShare = false) {
  await page.addInitScript((allowAnalytics) => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Desktop BiblioTest",
    });
    localStorage.setItem("biblio-palavra-intro-seen", "true");
    window.dataLayer = [];
    const push = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = (...args) => {
      const stored = JSON.parse(
        sessionStorage.getItem("biblio-test-analytics") || "[]",
      );
      stored.push(
        args.map((value) =>
          Object.prototype.toString.call(value) === "[object Arguments]"
            ? Array.from(value)
            : value,
        ),
      );
      sessionStorage.setItem("biblio-test-analytics", JSON.stringify(stored));
      return push(...args);
    };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.copiedText = text;
        },
      },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  }, analytics);
  if (nativeShare)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value: "Android BiblioTest",
      });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async () => {
          if (window.shareOutcome === "cancelled")
            throw new DOMException("Share dismissed", "AbortError");
          if (window.shareOutcome === "failed")
            throw new Error("Share failed");
        },
      });
    });
  await page.clock.install({ time: new Date("2026-10-31T12:00:00") });
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.route("**/bible.json", (route) =>
    route.fulfill({
      json: [
        {
          abbrev: "gn",
          name: "Gênesis",
          chapters: [["A graça, a GRAÇA e a graça!"]],
        },
        { abbrev: "at", name: "Atos", chapters: [[], [], [], ["Acaso."]] },
      ],
    }),
  );
  await page.goto(`${service.url}/?modo=palavra`);
  if (analytics) {
    await page.getByLabel("Permitir análise de uso").check();
    await page.getByRole("button", { name: "Salvar escolhas" }).click();
  } else {
    await page.getByRole("button", { name: "Recusar opcionais" }).click();
  }
  await expect(page.locator("#privacy-choices")).toBeHidden();
  await expect(page.locator("#game[data-ready=true] .box")).toHaveCount(30);
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
}

async function finishKnownChallenge(page) {
  await page.keyboard.type("GRACA");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function events(page) {
  return page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("biblio-test-analytics") || "[]")
      .flat()
      .filter((entry) => Array.isArray(entry) && entry[0] === "event")
      .map(([, name, parameters = {}]) => ({ name, parameters })),
  );
}

test("opt-in mede ações de jogo e compartilhamento sem falsos inícios após reload", async ({
  page,
  service,
}) => {
  await openWordGame(page, service, true);
  await finishKnownChallenge(page);
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir",
  );
  await page.getByRole("button", { name: "Compartilhar resultado" }).click();

  let captured = await events(page);
  const named = (name) => captured.filter((event) => event.name === name);
  expect(named("game_start")).toHaveLength(1);
  expect(named("guess_submitted")).toHaveLength(1);
  expect(named("guess_submitted")[0].parameters).toMatchObject({
    mode: "palavra",
    attempt_number: 1,
  });
  expect(named("game_complete")).toHaveLength(1);
  expect(named("game_complete")[0].parameters).toMatchObject({
    mode: "palavra",
    challenge_day: "2026-10-31",
    won: true,
    attempts: 1,
  });
  expect(named("share_button_click")).toHaveLength(1);
  expect(named("share_action_result")).toContainEqual(
    expect.objectContaining({
      parameters: expect.objectContaining({ method: "clipboard", outcome: "copied" }),
    }),
  );
  expect(named("statistics_open")).toHaveLength(0);

  await page.reload();
  captured = await events(page);
  expect(captured.filter((event) => event.name === "game_start")).toHaveLength(1);
  expect(captured.filter((event) => event.name === "game_complete")).toHaveLength(1);
  await page.getByRole("button", { name: "Fechar progresso" }).click();
  await page.getByRole("button", { name: "Meu progresso" }).click();
  expect((await events(page)).filter((event) => event.name === "statistics_open"))
    .toHaveLength(1);
  await page.getByRole("link", { name: "Ver histórico completo" }).click();
  await expect(page).toHaveURL(/estatisticas\.html\?modo=palavra/);
  await expect
    .poll(
      async () =>
        (await events(page)).filter((event) => event.name === "statistics_open")
          .length,
    )
    .toBe(2);
  await page.getByRole("link", { name: "Referência", exact: true }).click();
  expect((await events(page)).filter((event) => event.name === "mode_changed"))
    .toContainEqual(
      expect.objectContaining({
        parameters: expect.objectContaining({
          from_mode: "palavra",
          to_mode: "referencia",
          surface: "statistics_page",
        }),
      }),
    );
});

test("Web Share distingue sucesso, cancelamento e falha observáveis", async ({
  page,
  service,
}) => {
  await openWordGame(page, service, true, true);
  await finishKnownChallenge(page);
  const button = page.getByRole("button", { name: "Compartilhar resultado" });

  for (const outcome of ["shared", "cancelled", "failed"]) {
    await page.evaluate((next) => (window.shareOutcome = next), outcome);
    await button.click();
  }

  const results = (await events(page))
    .filter((event) => event.name === "share_action_result")
    .map(({ parameters }) => [parameters.method, parameters.outcome]);
  expect(results).toEqual([
    ["web_share", "shared"],
    ["web_share", "cancelled"],
    ["web_share", "failed"],
  ]);
});

test("ações anteriores ao consentimento não são enfileiradas nem reenviadas", async ({
  page,
  service,
}) => {
  await openWordGame(page, service, false);
  await page.keyboard.type("G");
  await page.getByRole("button", { name: "Preferências de cookies" }).click();
  await page.getByLabel("Permitir análise de uso").check();
  await page.getByRole("button", { name: "Salvar escolhas" }).click();
  expect((await events(page)).filter((event) => event.name === "game_start"))
    .toHaveLength(0);

  await page.keyboard.type("RACA");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect((await events(page)).filter((event) => event.name === "game_start"))
    .toHaveLength(0);
  expect((await events(page)).filter((event) => event.name === "guess_submitted"))
    .toHaveLength(1);
});

test("recusar Analytics não envia eventos e mantém o resultado compartilhado", async ({
  page,
  service,
}) => {
  const externalRequests = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://")) externalRequests.push(request.url());
  });
  const resultResponse = page.waitForResponse(
    (response) => response.url().includes("/api/results") && response.status() === 200,
  );
  await openWordGame(page, service, false);
  await finishKnownChallenge(page);
  await resultResponse;
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir",
  );
  expect(await events(page)).toEqual([]);
  expect(externalRequests).toEqual([]);
  await expect(page.locator("#biblio-analytics")).toHaveCount(0);
});
