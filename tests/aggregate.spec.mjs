import { test, expect } from "@playwright/test";
import { createHash, randomBytes } from "node:crypto";
import { createSiteServer } from "../scripts/serve.mjs";

test("compara os cinco indicadores acumulados apenas com outros jogadores ativos do mesmo modo", async ({
  page,
}) => {
  const service = await createSiteServer({ port: 0 });
  try {
    await page.route(/^https:\/\//, (route) => route.abort());
    await page.goto(service.url);
    const result = await page.evaluate(async () => {
      const localDay = (offset) => {
        const date = new Date(Date.now() + offset * 86400000);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
      };
      const today = localDay(0);
      const previousDay = localDay(-1);
      async function participant(baseline, outcome, mode = "palavra") {
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
          body: JSON.stringify({ baselines: { [mode]: baseline } }),
        });
        let resultRowsWritten = 0;
        if (outcome) {
          const response = await fetch("/api/results", {
            method: "POST",
            headers,
            body: JSON.stringify({ mode, ...outcome }),
          });
          resultRowsWritten = (await response.json()).measuredD1
            ?.resultRowsWritten;
        }
        return { token, resultRowsWritten };
      }

      const own = await participant(
        {
          games: 10,
          wins: 6,
          winStreak: 2,
          maxStreak: 4,
          lastWinDay: previousDay,
          lastPlayedDay: previousDay,
        },
        { day: today, won: true, attempts: 1 },
      );
      await participant(
        {
          games: 20,
          wins: 9,
          winStreak: 1,
          maxStreak: 5,
          lastWinDay: previousDay,
          lastPlayedDay: previousDay,
        },
        { day: today, won: false, attempts: 6 },
      );
      await participant(
        {
          games: 8,
          wins: 7,
          winStreak: 4,
          maxStreak: 5,
          lastWinDay: previousDay,
          lastPlayedDay: previousDay,
        },
        { day: today, won: true, attempts: 2 },
      );
      await participant(
        {
          games: 5,
          wins: 2,
          winStreak: 1,
          maxStreak: 3,
          lastWinDay: previousDay,
          lastPlayedDay: previousDay,
        },
        { day: today, won: true, attempts: 3 },
      );
      await participant(
        {
          games: 10,
          wins: 6,
          winStreak: 2,
          maxStreak: 3,
          lastWinDay: previousDay,
          lastPlayedDay: previousDay,
        },
        { day: today, won: true, attempts: 4 },
      );
      await participant(
        { games: 30, wins: 20, winStreak: 8, maxStreak: 10 },
        { day: localDay(-40), won: true, attempts: 1 },
      );
      await participant({
        games: 0,
        wins: 0,
        winStreak: 0,
        maxStreak: 0,
        lastWinDay: today,
        lastPlayedDay: today,
      });
      await participant(
        { games: 50, wins: 40, winStreak: 12, maxStreak: 15 },
        { day: today, won: true, attempts: 1 },
        "referencia",
      );

      const response = await fetch(`/api/history?mode=palavra&day=${today}`, {
        headers: { Authorization: `Bearer ${own.token}` },
      });
      return {
        status: response.status,
        data: await response.json(),
        own: own.token,
        resultRowsWritten: own.resultRowsWritten,
        today,
      };
    });

    expect(result.status).toBe(200);
    expect(result.data.stats).toEqual({
      games: 11,
      wins: 7,
      winStreak: 3,
      maxStreak: 4,
    });
    expect(result.data.comparisons).toEqual({
      activePlayers: 4,
      measuredD1: { cohortRowsRead: 6 },
      metrics: {
        games: { beaten: 2, percentage: 50 },
        wins: { beaten: 1, percentage: 25 },
        winRate: { beaten: 2, percentage: 50 },
        winStreak: { beaten: 2, percentage: 50 },
        maxStreak: { beaten: 2, percentage: 50 },
      },
    });
    expect(result.resultRowsWritten).toBe(7);
    expect(result.data.comparisons.measuredD1.cohortRowsRead).toBe(6);
    await page.evaluate(
      ({ token, today }) =>
        localStorage.setItem(
          "biblio-results-v1",
          JSON.stringify({
            version: 1,
            token,
            baselines: {
              referencia: { games: 0, wins: 0, winStreak: 0, maxStreak: 0 },
              palavra: {
                games: 10,
                wins: 6,
                winStreak: 2,
                maxStreak: 4,
                lastWinDay: new Date(Date.parse(`${today}T00:00:00Z`) - 86400000)
                  .toISOString()
                  .slice(0, 10),
                lastPlayedDay: new Date(Date.parse(`${today}T00:00:00Z`) - 86400000)
                  .toISOString()
                  .slice(0, 10),
              },
            },
            capturedAt: today,
            pending: [],
            confirmed: {},
          }),
        ),
      { token: result.own, today: result.today },
    );
    await page.goto(`${service.url}/estatisticas.html?modo=palavra`);
    await expect(page.locator("#stats-comparison-status")).toContainText(
      "4 jogadores ativos",
    );
    for (const metric of ["games", "wins", "win-rate", "win-streak", "max-streak"])
      await expect(page.locator(`#comparison-${metric}`)).toContainText("%");
    await page.evaluate(() => {
      localStorage.removeItem("biblio-results-v1");
      localStorage.setItem(
        "stats",
        JSON.stringify({
          games: 0,
          wins: 0,
          winStreak: 0,
          maxStreak: 0,
          lastWin: 1,
        }),
      );
      localStorage.setItem(
        "state",
        JSON.stringify({ currentGame: 1, expirationTime: Date.now() + 86400000 }),
      );
    });
    await page.reload();
    const cleanedLegacyBaseline = await page.evaluate(
      () => JSON.parse(localStorage.getItem("biblio-results-v1")).baselines.referencia,
    );
    expect(cleanedLegacyBaseline.lastPlayedDay).toBeNull();
    expect(cleanedLegacyBaseline.lastWinDay).toBeNull();
  } finally {
    await service.close();
  }
});

test("a migration backfills baseline and completed results already stored in D1", async ({
  page,
}) => {
  const token = randomBytes(32).toString("hex");
  const playerId = createHash("sha256").update(token).digest("hex");
  const localDay = (offset) => {
    const date = new Date(Date.now() + offset * 86400000);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };
  const today = localDay(0);
  const yesterday = localDay(-1);
  const baseline = {
    referencia: {
      games: 0,
      wins: 0,
      winStreak: 0,
      maxStreak: 0,
      lastWinDay: today,
      lastPlayedDay: today,
    },
    palavra: {
      games: 10,
      wins: 6,
      winStreak: 2,
      maxStreak: 4,
      lastWinDay: yesterday,
      lastPlayedDay: yesterday,
    },
  };
  let migrationDb;
  const service = await createSiteServer({
    port: 0,
    beforeMigration: async ({ file, db }) => {
      if (file !== "0002-player-modes.sql") return;
      migrationDb = db;
      await db
        .prepare("INSERT INTO players(id, baseline) VALUES (?, ?)")
        .bind(playerId, JSON.stringify(baseline))
        .run();
      await db
        .prepare(
          "INSERT INTO results(player_id, mode, day, won, attempts, score) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(playerId, "palavra", today, 1, 1, 1)
        .run();
    },
    afterMigration: async ({ file, db, migration }) => {
      if (file === "0002-player-modes.sql") await db.exec(migration);
    },
  });
  try {
    await page.goto(service.url);
    const response = await page.evaluate(
      async ({ token, today }) => {
        const result = await fetch(
          `/api/history?mode=palavra&day=${today}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return { status: result.status, data: await result.json() };
      },
      { token, today },
    );

    expect(response.status).toBe(200);
    expect(response.data.stats).toEqual({
      games: 11,
      wins: 7,
      winStreak: 3,
      maxStreak: 4,
    });
    const malformedMode = await migrationDb
      .prepare(
        "SELECT games, current_streak, last_played_day FROM player_modes WHERE player_id = ? AND mode = 'referencia'",
      )
      .bind(playerId)
      .first();
    expect(malformedMode).toEqual({
      games: 0,
      current_streak: 0,
      last_played_day: null,
    });
    expect(response.data.history).toEqual([
      { day: today, won: true, attempts: 1 },
    ]);
    expect(response.data.comparisons.activePlayers).toBe(0);
    await page.evaluate(
      ({ token, baseline, today }) =>
        localStorage.setItem(
          "biblio-results-v1",
          JSON.stringify({
            version: 1,
            token,
            baselines: baseline,
            capturedAt: today,
            pending: [],
            confirmed: {},
          }),
        ),
      { token, baseline, today },
    );
    await page.goto(`${service.url}/estatisticas.html?modo=palavra`);
    await expect(page.locator("#stats-comparison-status")).toHaveText(
      "Sem outros jogadores ativos para comparar ainda.",
    );
    await expect(page.locator("#stats-comparison-metrics")).toBeHidden();
  } finally {
    await service.close();
  }
});
