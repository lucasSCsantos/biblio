const modes = new Set(["referencia", "palavra"]);

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function validDay(day) {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const timestamp = Date.parse(`${day}T00:00:00Z`);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === day &&
    day >= "2024-04-26" &&
    timestamp <= Date.now() + 86400000
  );
}

async function playerId(request) {
  const token = request.headers
    .get("Authorization")
    ?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return null;
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function baselineSnapshot(value) {
  const snapshot = {};
  for (const mode of modes) {
    const raw = value?.[mode];
    const safe = {};
    for (const key of ["games", "wins", "winStreak", "maxStreak"])
      safe[key] =
        Number.isSafeInteger(raw?.[key]) && raw[key] >= 0 && raw[key] <= 1000000
          ? raw[key]
          : 0;
    safe.wins = Math.min(safe.wins, safe.games);
    safe.winStreak = Math.min(safe.winStreak, safe.wins);
    safe.maxStreak = Math.min(
      Math.max(safe.maxStreak, safe.winStreak),
      safe.wins,
    );
    safe.lastWinDay = validDay(raw?.lastWinDay) ? raw.lastWinDay : null;
    safe.lastPlayedDay = validDay(raw?.lastPlayedDay)
      ? raw.lastPlayedDay
      : null;
    if (safe.games === 0) safe.lastPlayedDay = null;
    if (safe.wins === 0) safe.lastWinDay = null;
    if (safe.games === 0) safe.winStreak = 0;
    snapshot[mode] = safe;
  }
  return snapshot;
}

async function readBody(request) {
  if (Number(request.headers.get("Content-Length")) > 16384)
    throw new Error("body");
  const text = await request.text();
  if (text.length > 16384) throw new Error("body");
  const body = JSON.parse(text);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("body");
  return body;
}

async function stats(db, id, mode, day) {
  const own = await db
    .prepare(
      "SELECT day, won, attempts, score FROM results WHERE player_id = ? AND mode = ? AND day = ?",
    )
    .bind(id, mode, day)
    .first();
  const counts = await db
    .prepare("SELECT score, count FROM daily_counts WHERE mode = ? AND day = ?")
    .bind(mode, day)
    .all();
  const total = counts.results.reduce((sum, row) => sum + row.count, 0);
  const otherPlayers = Math.max(0, total - (own ? 1 : 0));
  const beaten = own
    ? counts.results
        .filter((row) => row.score > own.score)
        .reduce((sum, row) => sum + row.count, 0)
    : 0;
  const totals = await readPlayerStats(db, id, mode, day);
  return {
    stats: totals,
    daily: {
      result: own
        ? { day: own.day, won: Boolean(own.won), attempts: own.attempts }
        : null,
      otherPlayers,
      beaten,
      percentage:
        own && otherPlayers ? Math.floor((beaten * 100) / otherPlayers) : null,
      first: Boolean(own && otherPlayers === 0),
    },
  };
}

function dayDistance(left, right) {
  return (
    (Date.parse(`${right}T00:00:00Z`) - Date.parse(`${left}T00:00:00Z`)) /
    86400000
  );
}

function currentStreakAt(row, asOfDay) {
  if (!row || !row.last_played_day) return 0;
  const distance = dayDistance(row.last_played_day, asOfDay);
  return distance < 0 || distance > 1
    ? 0
    : Number(row.current_streak) || 0;
}

async function readPlayerStats(db, id, mode, asOfDay) {
  const row = await db
    .prepare(
      "SELECT games, wins, current_streak, max_streak, last_played_day FROM player_modes WHERE player_id = ? AND mode = ?",
    )
    .bind(id, mode)
    .first();
  return {
    games: Number(row?.games) || 0,
    wins: Number(row?.wins) || 0,
    winStreak: currentStreakAt(row, asOfDay),
    maxStreak: Number(row?.max_streak) || 0,
  };
}

async function rebuildPlayerMode(db, id, mode, asOfDay) {
  const player = await db
    .prepare("SELECT baseline FROM players WHERE id = ?")
    .bind(id)
    .first();
  let imported = {};
  try {
    imported = JSON.parse(player.baseline)?.[mode] || {};
  } catch {
    imported = {};
  }
  const history = await db
    .prepare(
      "SELECT day, won, attempts FROM results WHERE player_id = ? AND mode = ? ORDER BY day ASC",
    )
    .bind(id, mode)
    .all();
  const games = Number.isSafeInteger(imported.games) ? imported.games : 0;
  const wins = Math.min(
    games,
    Number.isSafeInteger(imported.wins) ? imported.wins : 0,
  );
  const base = {
    games,
    wins,
    winStreak: games > 0 && wins > 0 && Number.isSafeInteger(imported.winStreak)
      ? imported.winStreak
      : 0,
    maxStreak: Number.isSafeInteger(imported.maxStreak)
      ? imported.maxStreak
      : 0,
    lastWinDay: wins > 0 && validDay(imported.lastWinDay) ? imported.lastWinDay : null,
    lastPlayedDay: games > 0 && validDay(imported.lastPlayedDay)
      ? imported.lastPlayedDay
      : null,
  };
  let current = base.winStreak;
  let maxStreak = base.maxStreak;
  let previousDay = base.lastPlayedDay || base.lastWinDay;
  const millisecondsPerDay = 86400000;

  for (const result of history.results) {
    const distance = previousDay
      ? (Date.parse(`${result.day}T00:00:00Z`) -
          Date.parse(`${previousDay}T00:00:00Z`)) /
        millisecondsPerDay
      : 0;
    if (result.won) {
      current = distance === 1 && current > 0 ? current + 1 : 1;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 0;
    }
    previousDay = result.day;
  }

  if (
    current > 0 &&
    (!previousDay ||
      (Date.parse(`${asOfDay}T00:00:00Z`) -
        Date.parse(`${previousDay}T00:00:00Z`)) /
        millisecondsPerDay >
        1)
  )
    current = 0;

  const latestDay = history.results.at(-1)?.day || previousDay;
  await db
    .prepare(
      "UPDATE player_modes SET games = ?, wins = ?, current_streak = ?, max_streak = ?, last_played_day = ? WHERE player_id = ? AND mode = ?",
    )
    .bind(
      base.games + history.results.length,
      base.wins + history.results.filter((result) => result.won).length,
      current,
      maxStreak,
      latestDay,
      id,
      mode,
    )
    .run();
  return readPlayerStats(db, id, mode, asOfDay);
}

async function playerStats(db, id, mode, asOfDay, measureD1 = false) {
  const [player, history, stats] = await Promise.all([
    db.prepare("SELECT baseline FROM players WHERE id = ?").bind(id).first(),
    db
      .prepare(
        "SELECT day, won, attempts FROM results WHERE player_id = ? AND mode = ? ORDER BY day DESC",
      )
      .bind(id, mode)
      .all(),
    readPlayerStats(db, id, mode, asOfDay),
  ]);
  let imported = {};
  try {
    imported = JSON.parse(player?.baseline)?.[mode] || {};
  } catch {
    imported = {};
  }
  return {
    stats,
    imported,
    history: history.results.map((result) => ({
      day: result.day,
      won: Boolean(result.won),
      attempts: result.attempts,
    })),
    comparisons: await accumulatedComparisons(
      db,
      id,
      mode,
      asOfDay,
      stats,
      measureD1,
    ),
  };
}

async function accumulatedComparisons(
  db,
  id,
  mode,
  asOfDay,
  own,
  measureD1,
) {
  const cutoff = new Date(
    Date.parse(`${asOfDay}T00:00:00Z`) - 29 * 86400000,
  )
    .toISOString()
    .slice(0, 10);
  const peers = await db
    .prepare(
      `SELECT games, wins,
        CASE WHEN current_streak > 0
              AND julianday(?) - julianday(last_played_day) > 1
          THEN 0 ELSE current_streak END AS current_streak,
        max_streak
       FROM player_modes INDEXED BY player_modes_active
       WHERE mode = ? AND player_id <> ?
         AND last_played_day >= ? AND last_played_day <= ?`,
    )
    .bind(asOfDay, mode, id, cutoff, asOfDay)
    .all();
  const rows = peers.results;
  const activePlayers = rows.length;
  const lower = (predicate) => rows.filter(predicate).length;
  const percentage = (beaten) =>
    activePlayers ? Math.floor((beaten * 100) / activePlayers) : null;
  const rateAvailable = own.games > 0;
  const beaten = {
    games: lower((peer) => peer.games < own.games),
    wins: lower((peer) => peer.wins < own.wins),
    winRate: rateAvailable
      ? lower(
          (peer) => peer.wins * own.games < own.wins * peer.games,
        )
      : null,
    winStreak: lower((peer) => peer.current_streak < own.winStreak),
    maxStreak: lower((peer) => peer.max_streak < own.maxStreak),
  };
  return {
    activePlayers,
    metrics: Object.fromEntries(
      Object.entries(beaten).map(([metric, count]) => [
        metric,
        {
          beaten: count,
          percentage: count === null ? null : percentage(count),
        },
      ]),
    ),
    ...(measureD1
      ? { measuredD1: { cohortRowsRead: Number(peers.meta?.rows_read) || 0 } }
      : {}),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedOrigin = env.ALLOWED_ORIGIN || url.origin;
    const origin = request.headers.get("Origin");
    const cors = {
      "Access-Control-Allow-Origin": allowedOrigin,
      Vary: "Origin",
    };
    if (origin && origin !== allowedOrigin)
      return json({ error: "Origem não permitida" }, 403);
    if (request.method === "OPTIONS")
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      });
    try {
      const id = await playerId(request);
      if (!id) return json({ error: "Identificação inválida" }, 401, cors);
      if (url.pathname === "/api/player" && request.method === "PUT") {
        const body = await readBody(request);
        const baseline = baselineSnapshot(body.baselines);
        await env.DB.prepare(
          "INSERT INTO players(id, baseline) VALUES (?, ?) ON CONFLICT(id) DO NOTHING",
        )
          .bind(id, JSON.stringify(baseline))
          .run();
        return json({ registered: true }, 200, cors);
      }
      const player = await env.DB.prepare("SELECT id FROM players WHERE id = ?")
        .bind(id)
        .first();
      if (!player) return json({ error: "Jogador não registrado" }, 404, cors);
      if (url.pathname === "/api/results" && request.method === "POST") {
        const result = await readBody(request);
        if (
          !modes.has(result.mode) ||
          !validDay(result.day) ||
          typeof result.won !== "boolean" ||
          !Number.isInteger(result.attempts) ||
          result.attempts < 1 ||
          result.attempts > 6 ||
          (!result.won && result.attempts !== 6)
        )
          return json({ error: "Resultado inválido" }, 400, cors);
        const score = result.won ? result.attempts : 7;
        const inserted = await env.DB.prepare(
          "INSERT INTO results(player_id, mode, day, won, attempts, score) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(player_id, mode, day) DO NOTHING",
        )
          .bind(
            id,
            result.mode,
            result.day,
            Number(result.won),
            result.attempts,
            score,
          )
          .run();
        const updatedMode = await env.DB.prepare(
          "SELECT last_played_day FROM player_modes WHERE player_id = ? AND mode = ?",
        )
          .bind(id, result.mode)
          .first();
        if (
          inserted.meta?.changes > 0 &&
          result.day < updatedMode.last_played_day
        )
          await rebuildPlayerMode(env.DB, id, result.mode, result.day);
        const accepted = await env.DB.prepare(
          "SELECT won, attempts FROM results WHERE player_id = ? AND mode = ? AND day = ?",
        )
          .bind(id, result.mode, result.day)
          .first();
        if (
          Boolean(accepted.won) !== result.won ||
          accepted.attempts !== result.attempts
        )
          return json(
            { error: "Já existe outro resultado para este desafio" },
            409,
            cors,
          );
        const response = await stats(env.DB, id, result.mode, result.day);
        if (env.MEASURE_D1)
          response.measuredD1 = {
            resultRowsWritten: Number(inserted.meta?.rows_written) || 0,
          };
        return json(response, 200, cors);
      }
      if (url.pathname === "/api/stats" && request.method === "GET") {
        const mode = url.searchParams.get("mode"),
          day = url.searchParams.get("day");
        if (!modes.has(mode) || !validDay(day))
          return json({ error: "Consulta inválida" }, 400, cors);
        return json(await stats(env.DB, id, mode, day), 200, cors);
      }
      if (url.pathname === "/api/history" && request.method === "GET") {
        const mode = url.searchParams.get("mode");
        const day = url.searchParams.get("day");
        if (!modes.has(mode) || !validDay(day))
          return json({ error: "Consulta invÃ¡lida" }, 400, cors);
        return json(
          await playerStats(env.DB, id, mode, day, Boolean(env.MEASURE_D1)),
          200,
          cors,
        );
      }
      return json({ error: "Recurso não encontrado" }, 404, cors);
    } catch (error) {
      if (error instanceof SyntaxError || error.message === "body")
        return json({ error: "Conteúdo inválido" }, 400, cors);
      console.error("Não foi possível processar o resultado", error.message);
      return json({ error: "Serviço temporariamente indisponível" }, 503, cors);
    }
  },
};
