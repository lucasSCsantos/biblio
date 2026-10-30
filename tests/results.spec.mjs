import { test as base, expect } from "@playwright/test";
import { createSiteServer } from "../scripts/serve.mjs";

const test = base.extend({
  service: async ({}, use) => {
    const service = await createSiteServer({ port: 0 });
    await use(service);
    await service.close();
  },
});

async function peerResult(page, result) {
  return page.evaluate(async (result) => {
    const token = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    await fetch("/api/player", {
      method: "PUT",
      headers,
      body: JSON.stringify({ baselines: {} }),
    });
    const day = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    const response = await fetch("/api/results", {
      method: "POST",
      headers,
      body: JSON.stringify({ mode: "palavra", day, ...result }),
    });
    return { status: response.status, data: await response.json() };
  }, result);
}

async function openGame(page, service) {
  await page.addInitScript(() =>
    localStorage.setItem("biblio-palavra-intro-seen", "true"),
  );
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.route("**/bible-index.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "const bible = {at: [{chapter: 4, versicles: 1}]};",
    }),
  );
  await page.route("**/bible.json", (route) =>
    route.fulfill({
      json: [
        {
          abbrev: "gn",
          name: "Gênesis",
          chapters: [["A graça.", "Acaso acesa arara."]],
        },
        { abbrev: "at", name: "Atos", chapters: [[], [], [], ["A graça."]] },
      ],
    }),
  );
  await page.goto(`${service.url}/?modo=palavra`);
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await expect(page.locator("#game[data-ready=true]")).toBeVisible();
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
}

async function finish(page, guesses = ["GRACA"], fast = false) {
  for (const [index, guess] of guesses.entries()) {
    await page.keyboard.type(guess);
    await page.keyboard.press("Enter");
    if (fast) await page.clock.fastForward(1800);
    if (index < guesses.length - 1)
      await expect(page.locator("#game-feedback")).toContainText(
        `Tentativa ${index + 1} enviada`,
      );
  }
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("primeiro resultado fica salvo no D1 e a comparação persiste ao recarregar", async ({
  page,
  service,
}) => {
  await openGame(page, service);
  await finish(page);
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir o desafio de hoje",
  );
  await page.reload();
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir o desafio de hoje",
  );
});

test("comparação diária exclui o jogador e os empates sem duplicar recargas", async ({
  page,
  service,
}) => {
  await openGame(page, service);
  await finish(page);
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir",
  );
  const lower = await peerResult(page, { won: true, attempts: 2 });
  expect(lower.status).toBe(200);
  expect(lower.data.daily.percentage).toBe(0);
  await page.reload();
  await expect(page.locator("#daily-comparison")).toHaveText(
    "Você superou 100% dos outros jogadores até agora.",
  );
  const tied = await peerResult(page, { won: true, attempts: 1 });
  expect(tied.data.daily.percentage).toBe(50);
  await page.reload();
  await expect(page.locator("#daily-comparison")).toHaveText(
    "Você superou 50% dos outros jogadores até agora.",
  );
  await peerResult(page, { won: false, attempts: 6, mode: "referencia" });
  await page.reload();
  await expect(page.locator("#daily-comparison")).toHaveText(
    "Você superou 50% dos outros jogadores até agora.",
  );
});

test("resposta perdida após gravar no D1 é reenviada uma só vez", async ({
  page,
  service,
}) => {
  await openGame(page, service);
  let committed = false;
  await page.route("**/api/results", async (route) => {
    if (!committed) {
      await route.fetch();
      committed = true;
    }
    await route.abort();
  });
  await finish(page);
  await expect(page.locator("#daily-comparison")).toContainText(
    "Aguardando envio",
  );
  expect(committed).toBe(true);
  await page.unroute("**/api/results");
  await page.reload();
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir",
  );
  await peerResult(page, { won: true, attempts: 2 });
  await peerResult(page, { won: true, attempts: 1 });
  await page.reload();
  await expect(page.locator("#daily-comparison")).toHaveText(
    "Você superou 50% dos outros jogadores até agora.",
  );
});

test("o serviço autentica leituras e rejeita conclusões inválidas ou conflitantes", async ({
  page,
  service,
}) => {
  await openGame(page, service);
  await finish(page);
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir",
  );
  const statuses = await page.evaluate(async () => {
    const state = JSON.parse(localStorage.getItem("biblio-results-v1"));
    const headers = {
      Authorization: `Bearer ${state.token}`,
      "Content-Type": "application/json",
    };
    const day = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    const send = async (result) =>
      (
        await fetch("/api/results", {
          method: "POST",
          headers,
          body: JSON.stringify({
            mode: "palavra",
            day,
            won: true,
            attempts: 1,
            ...result,
          }),
        })
      ).status;
    return [
      (await fetch(`/api/stats?mode=palavra&day=${day}`)).status,
      await send({ won: false, attempts: 6 }),
      await send({ attempts: 0 }),
      await send({ mode: "desconhecido" }),
      await send({ day: "2026-02-30" }),
      await send({ won: false, attempts: 2 }),
      await send({ day: "2099-01-01" }),
    ];
  });
  expect(statuses).toEqual([401, 409, 400, 400, 400, 400, 400]);
  await page.reload();
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir",
  );
});

test("derrotas empatam e uma vitória na sexta tentativa supera qualquer derrota", async ({
  page,
  service,
}) => {
  await page.clock.install({ time: new Date() });
  await openGame(page, service);
  await peerResult(page, { won: false, attempts: 6 });
  await finish(page, Array(6).fill("ACESA"), true);
  await expect(page.locator("#daily-comparison")).toHaveText(
    "Você superou 0% dos outros jogadores até agora.",
  );
  const winner = await peerResult(page, { won: true, attempts: 6 });
  expect(winner.data.daily.percentage).toBe(100);
  await page.reload();
  await expect(page.locator("#daily-comparison")).toHaveText(
    "Você superou 0% dos outros jogadores até agora.",
  );
});

test("serviço indisponível não bloqueia o jogo e o resultado é enviado ao voltar", async ({
  page,
  service,
}) => {
  await openGame(page, service);
  await page.route("**/api/**", (route) => route.abort());
  await finish(page);
  await expect(page.locator("#games .stat-number")).toHaveText("1");
  await expect(page.locator("#daily-comparison")).toContainText(
    "Aguardando envio",
  );
  await page.unroute("**/api/**");
  await page.reload();
  await expect(page.locator("#games .stat-number")).toHaveText("1");
  await expect(page.locator("#daily-comparison")).toContainText(
    "primeiro a concluir",
  );
});
