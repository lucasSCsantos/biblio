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
  const totals = await playerStats(db, id, mode, day);
  return {
    stats: totals.stats,
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

async function playerStats(db, id, mode, asOfDay) {
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
  const base = {
    games: Number.isSafeInteger(imported.games) ? imported.games : 0,
    wins: Number.isSafeInteger(imported.wins) ? imported.wins : 0,
    winStreak: Number.isSafeInteger(imported.winStreak)
      ? imported.winStreak
      : 0,
    maxStreak: Number.isSafeInteger(imported.maxStreak)
      ? imported.maxStreak
      : 0,
    lastWinDay: validDay(imported.lastWinDay) ? imported.lastWinDay : null,
    lastPlayedDay: validDay(imported.lastPlayedDay)
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

  return {
    stats: {
      games: base.games + history.results.length,
      wins: base.wins + history.results.filter((result) => result.won).length,
      winStreak: current,
      maxStreak,
    },
    imported: base,
    history: [...history.results].reverse().map((result) => ({
      day: result.day,
      won: Boolean(result.won),
      attempts: result.attempts,
    })),
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
        await env.DB.prepare(
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
        return json(
          await stats(env.DB, id, result.mode, result.day),
          200,
          cors,
        );
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
        return json(await playerStats(env.DB, id, mode, day), 200, cors);
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
