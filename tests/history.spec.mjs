import { test, expect } from "@playwright/test";
import { createSiteServer } from "../scripts/serve.mjs";

test("histórico importado é somado uma vez à nova conclusão e mantém a sequência", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.route(/^https:\/\//, (route) => route.abort());
    await page.goto(service.url);
    const stats = await page.evaluate(async () => {
      const token = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const localDay = (date) =>
        new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
      const today = localDay(new Date());
      const yesterday = localDay(new Date(Date.now() - 86400000));
      await fetch("/api/player", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          baselines: {
            palavra: {
              games: 10,
              wins: 6,
              winStreak: 2,
              maxStreak: 4,
              lastWinDay: yesterday,
              lastPlayedDay: yesterday,
            },
          },
        }),
      });
      await fetch("/api/results", {
        method: "POST",
        headers,
        body: JSON.stringify({
          mode: "palavra",
          day: today,
          won: true,
          attempts: 1,
        }),
      });
      const response = await fetch(`/api/stats?mode=palavra&day=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (await response.json()).stats;
    });

    expect(stats).toEqual({ games: 11, wins: 7, winStreak: 3, maxStreak: 4 });
  } finally {
    await service.close();
  }
});

test("derrota e dia sem jogar interrompem a sequência antes de outra partida", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.route(/^https:\/\//, (route) => route.abort());
    await page.goto(service.url);
    const outcomes = await page.evaluate(async () => {
      const headersFor = () => {
        const token = [...crypto.getRandomValues(new Uint8Array(32))]
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        return {
          token,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };
      };
      const localDay = (offset) => {
        const date = new Date(Date.now() + offset * 86400000);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
      };
      async function read(baseline, result, asOf) {
        const { token, headers } = headersFor();
        await fetch("/api/player", {
          method: "PUT",
          headers,
          body: JSON.stringify({ baselines: { palavra: baseline } }),
        });
        if (result)
          await fetch("/api/results", {
            method: "POST",
            headers,
            body: JSON.stringify({ mode: "palavra", ...result }),
          });
        const response = await fetch(`/api/stats?mode=palavra&day=${asOf}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return (await response.json()).stats;
      }
      const today = localDay(0);
      const yesterday = localDay(-1);
      const anteontem = localDay(-2);
      const tomorrow = localDay(1);
      const baseline = {
        games: 10,
        wins: 6,
        winStreak: 2,
        maxStreak: 4,
      };
      return {
        afterGap: await read(
          { ...baseline, lastWinDay: anteontem, lastPlayedDay: anteontem },
          { day: today, won: true, attempts: 1 },
          today,
        ),
        afterLoss: await read(
          { ...baseline, lastWinDay: yesterday, lastPlayedDay: yesterday },
          { day: today, won: false, attempts: 6 },
          today,
        ),
        missedDay: await read(
          { ...baseline, lastWinDay: yesterday, lastPlayedDay: yesterday },
          null,
          tomorrow,
        ),
      };
    });

    expect(outcomes).toEqual({
      afterGap: { games: 11, wins: 7, winStreak: 1, maxStreak: 4 },
      afterLoss: { games: 11, wins: 6, winStreak: 0, maxStreak: 4 },
      missedDay: { games: 10, wins: 6, winStreak: 0, maxStreak: 4 },
    });
  } finally {
    await service.close();
  }
});

test("resultados offline recebidos fora de ordem preservam a sequência e os modos", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.route(/^https:\/\//, (route) => route.abort());
    await page.goto(service.url);
    const data = await page.evaluate(async () => {
      const token = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const localDay = (offset) => {
        const date = new Date(Date.now() + offset * 86400000);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
      };
      const yesterday = localDay(-1);
      const today = localDay(0);
      await fetch("/api/player", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          baselines: {
            palavra: {
              games: 10,
              wins: 6,
              winStreak: 2,
              maxStreak: 4,
              lastWinDay: localDay(-2),
              lastPlayedDay: localDay(-2),
            },
            referencia: {
              games: 4,
              wins: 2,
              winStreak: 1,
              maxStreak: 2,
              lastWinDay: yesterday,
              lastPlayedDay: yesterday,
            },
          },
        }),
      });
      async function send(mode, day) {
        return fetch("/api/results", {
          method: "POST",
          headers,
          body: JSON.stringify({ mode, day, won: true, attempts: 2 }),
        });
      }
      await send("palavra", today);
      await send("palavra", yesterday);
      await fetch("/api/player", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          baselines: {
            palavra: { games: 99, wins: 99, winStreak: 99, maxStreak: 99 },
          },
        }),
      });
      const summaryResponse = await fetch(
        `/api/stats?mode=palavra&day=${today}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const historyResponse = await fetch(
        `/api/history?mode=palavra&day=${today}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const otherModeResponse = await fetch(
        `/api/history?mode=referencia&day=${today}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        today,
        summary: (await summaryResponse.json()).stats,
        history: await historyResponse.json(),
        otherMode: await otherModeResponse.json(),
      };
    });

    expect(data.summary).toEqual({
      games: 12,
      wins: 8,
      winStreak: 4,
      maxStreak: 4,
    });
    expect(data.history.history.map(({ day }) => day)).toHaveLength(2);
    expect(data.history.history[0].day).toBe(data.today);
    expect(data.history.imported.games).toBe(10);
    expect(data.otherMode.stats).toEqual({
      games: 4,
      wins: 2,
      winStreak: 1,
      maxStreak: 2,
    });
    expect(data.otherMode.history).toEqual([]);
  } finally {
    await service.close();
  }
});

test("página mantém totais locais e atualiza uma sequência antiga sem conexão", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.addInitScript(() => {
      const sequential =
        Math.floor(
          (Date.now() - Date.parse("2024-04-26T00:00:00Z")) / 86400000,
        ) + 1;
      localStorage.setItem(
        "biblio-privacy-v1",
        JSON.stringify({
          analytics: false,
          advertising: false,
          expires: Date.now() + 86400000,
        }),
      );
      localStorage.setItem(
        "stats",
        JSON.stringify({
          games: 5,
          wins: 2,
          winStreak: 1,
          maxStreak: 3,
          lastWin: sequential - 2,
        }),
      );
    });
    await page.route(/^https:\/\//, (route) => route.abort());
    await page.route("**/api/**", (route) => route.abort());
    await page.goto(`${service.url}/estatisticas.html`);

    await expect(page.locator("#stats-games")).toHaveText("5");
    await expect(page.locator("#stats-wins")).toHaveText("2");
    await expect(page.locator("#stats-current-streak")).toHaveText("0");
    await expect(page.locator("#stats-max-streak")).toHaveText("3");
    await expect(page.locator("#stats-availability")).toContainText(
      "serviço está indisponível",
    );
  } finally {
    await service.close();
  }
});

test("partida concluída antes da migração não é somada duas vezes e aparece em Estatísticas", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.addInitScript(() => {
      localStorage.setItem("biblio-palavra-intro-seen", "true");
      localStorage.setItem(
        "biblio-privacy-v1",
        JSON.stringify({
          analytics: false,
          advertising: false,
          expires: Date.now() + 86400000,
        }),
      );
      const currentGame =
        Math.floor(
          (Date.now() - Date.parse("2024-04-26T00:00:00Z")) / 86400000,
        ) + 1;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const stats = {
        games: 11,
        wins: 7,
        winStreak: 3,
        maxStreak: 4,
        lastWin: currentGame,
      };
      localStorage.setItem("biblio-palavra-stats", JSON.stringify(stats));
      localStorage.setItem(
        "stats",
        JSON.stringify({
          games: 4,
          wins: 2,
          winStreak: 1,
          maxStreak: 2,
          lastWin: currentGame,
        }),
      );
      localStorage.setItem(
        "biblio-palavra-state",
        JSON.stringify({
          translation: "blivre-2018",
          currentRow: 2,
          currentColumn: 5,
          grid: Array.from({ length: 6 }, () => Array(5).fill("")),
          versicle: "A graça.",
          won: true,
          gameOver: false,
          currentGame,
          expirationTime: tomorrow.getTime(),
          answer: "graça",
          secret: ["G", "R", "A", "C", "A"],
        }),
      );
    });
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
          { abbrev: "gn", name: "Gênesis", chapters: [["A graça."]] },
          { abbrev: "at", name: "Atos", chapters: [[], [], [], ["A graça."]] },
        ],
      }),
    );
    await page.goto(`${service.url}/?modo=palavra`);
    await expect(page.locator("#modal:not(.hidden)")).toBeVisible();
    await expect(page.locator("#games .stat-number")).toHaveText("11");
    await expect(page.locator("#streak .stat-number")).toHaveText("3");
    await page.getByRole("link", { name: "Ver histórico completo" }).click();
    await expect(
      page.getByRole("heading", { name: "Estatísticas" }),
    ).toBeVisible();
    await expect(page.locator("#stats-mode-title")).toHaveText("Palavra");
    await expect(page.locator("#stats-games")).toHaveText("11");
    await expect(page.locator("#stats-wins")).toHaveText("7");
    await expect(page.locator("#stats-win-rate")).toHaveText("63,6%");
    await expect(page.locator("#stats-current-streak")).toHaveText("3");
    await expect(page.locator("#stats-max-streak")).toHaveText("4");
    await expect(page.locator("#stats-history")).toContainText("3 tentativas");
    await expect(page.locator("#stats-imported")).toContainText(
      "10 jogos importados",
    );
    await page.getByRole("link", { name: "Referência", exact: true }).click();
    await expect(page.locator("#stats-mode-title")).toHaveText("Referência");
    await expect(page.locator("#stats-games")).toHaveText("4");
    await expect(page.locator("#stats-wins")).toHaveText("2");
  } finally {
    await service.close();
  }
});

test("conclusão antiga recuperável é importada mesmo se os totais locais estiverem ausentes", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.addInitScript(() => {
      localStorage.setItem("biblio-palavra-intro-seen", "true");
      localStorage.setItem(
        "biblio-privacy-v1",
        JSON.stringify({
          analytics: false,
          advertising: false,
          expires: Date.now() + 86400000,
        }),
      );
      const currentGame =
        Math.floor(
          (Date.now() - Date.parse("2024-04-26T00:00:00Z")) / 86400000,
        ) + 1;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      localStorage.setItem(
        "biblio-palavra-state",
        JSON.stringify({
          translation: "blivre-2018",
          currentRow: 0,
          currentColumn: 5,
          grid: Array.from({ length: 6 }, () => Array(5).fill("")),
          versicle: "A graça.",
          won: true,
          gameOver: false,
          currentGame,
          expirationTime: tomorrow.getTime(),
          answer: "graça",
          secret: ["G", "R", "A", "C", "A"],
        }),
      );
    });
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
          { abbrev: "gn", name: "Gênesis", chapters: [["A graça."]] },
          { abbrev: "at", name: "Atos", chapters: [[], [], [], ["A graça."]] },
        ],
      }),
    );
    await page.goto(`${service.url}/?modo=palavra`);
    await expect(page.locator("#modal:not(.hidden)")).toBeVisible();
    await page.getByRole("link", { name: "Ver histórico completo" }).click();
    await expect(page.locator("#stats-games")).toHaveText("1");
    await expect(page.locator("#stats-wins")).toHaveText("1");
    await expect(page.locator("#stats-current-streak")).toHaveText("1");
    await expect(page.locator("#stats-history")).toContainText("1 tentativa");
  } finally {
    await service.close();
  }
});

test("sequência legada inacabada ancora a última vitória no dia local anterior", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.addInitScript(() => {
      localStorage.setItem("biblio-palavra-intro-seen", "true");
      localStorage.setItem(
        "biblio-privacy-v1",
        JSON.stringify({
          analytics: false,
          advertising: false,
          expires: Date.now() + 86400000,
        }),
      );
      const currentGame =
        Math.floor(
          (Date.now() - Date.parse("2024-04-26T00:00:00Z")) / 86400000,
        ) + 1;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      localStorage.setItem(
        "biblio-palavra-stats",
        JSON.stringify({
          games: 10,
          wins: 6,
          winStreak: 2,
          maxStreak: 4,
          lastWin: currentGame,
        }),
      );
      localStorage.setItem(
        "biblio-palavra-state",
        JSON.stringify({
          translation: "blivre-2018",
          currentRow: 0,
          currentColumn: 0,
          grid: Array.from({ length: 6 }, () => Array(5).fill("")),
          versicle: "",
          won: false,
          gameOver: false,
          currentGame,
          expirationTime: tomorrow.getTime(),
        }),
      );
    });
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
          { abbrev: "gn", name: "Gênesis", chapters: [["A graça."]] },
          { abbrev: "at", name: "Atos", chapters: [[], [], [], ["A graça."]] },
        ],
      }),
    );
    await page.goto(`${service.url}/?modo=palavra`);
    await expect(page.locator("#game[data-ready=true]")).toBeVisible();
    await page.getByRole("button", { name: "Meu progresso" }).click();
    await expect(page.locator("#modal:not(.hidden)")).toBeVisible();
    const imported = await page.evaluate(async () => {
      const token = JSON.parse(localStorage.getItem("biblio-results-v1")).token;
      const date = new Date();
      const day = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      const response = await fetch(`/api/history?mode=palavra&day=${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (await response.json()).imported;
    });
    const yesterday = await page.evaluate(() => {
      const date = new Date(Date.now() - 86400000);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    });
    expect(imported.lastWinDay).toBe(yesterday);
    expect(imported.winStreak).toBe(2);
  } finally {
    await service.close();
  }
});
