// Coleta funcional do jogo. Não depende da preferência de Google Analytics.
window.BiblioResults = (() => {
  const key = "biblio-results-v1";
  const modeKeys = {
    referencia: ["stats", "state"],
    palavra: ["biblio-palavra-stats", "biblio-palavra-state"],
  };
  const views = new Map();
  let running;
  let retry;
  let retryDelay = 1000;
  let usable = true;

  const day = (date = new Date()) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  const shiftDay = (value, offset) =>
    new Date(Date.parse(`${value}T00:00:00Z`) + offset * 86400000)
      .toISOString()
      .slice(0, 10);
  const resultKey = (result) => `${result.mode}:${result.day}`;
  const api = () =>
    (window.BIBLIO_CONFIG?.resultsApiUrl || "").replace(/\/$/, "");
  const parse = (name) => {
    try {
      return JSON.parse(localStorage.getItem(name));
    } catch {
      return null;
    }
  };

  function legacySnapshot(mode) {
    const [statsKey, stateKey] = modeKeys[mode];
    const raw = parse(statsKey) || {},
      state = parse(stateKey);
    const baseline = {};
    for (const field of ["games", "wins", "winStreak", "maxStreak"])
      baseline[field] =
        Number.isSafeInteger(raw[field]) && raw[field] >= 0
          ? Math.min(raw[field], 1000000)
          : 0;
    baseline.wins = Math.min(baseline.wins, baseline.games);
    baseline.winStreak = Math.min(baseline.winStreak, baseline.wins);
    baseline.maxStreak = Math.min(
      Math.max(baseline.maxStreak, baseline.winStreak),
      baseline.wins,
    );
    const stateDay = Number.isFinite(state?.expirationTime)
      ? day(new Date(state.expirationTime - 1))
      : day();
    const sequential =
      Math.floor((Date.now() - Date.parse("2024-04-26T00:00:00Z")) / 86400000) +
      1;
    const anchor = Number.isInteger(state?.currentGame)
      ? state.currentGame
      : sequential;
    let result;
    if (
      state &&
      (state.won === true || state.gameOver === true) &&
      Number.isInteger(state.currentRow) &&
      state.currentRow >= 0 &&
      state.currentRow < 6
    ) {
      result = {
        mode,
        day: state.challengeDay || stateDay,
        won: state.won === true,
        attempts: state.currentRow + 1,
      };
      if (!result.won && result.attempts !== 6) result = null;
    }
    const currentWinIncluded = result?.won && baseline.games > 0;
    const lastWinOffset =
      Number.isInteger(raw.lastWin) &&
      raw.lastWin === anchor &&
      !currentWinIncluded
        ? -1
        : raw.lastWin - anchor;
    baseline.lastWinDay =
      Number.isInteger(raw.lastWin) && raw.lastWin > 0 && raw.lastWin <= anchor
        ? shiftDay(stateDay, lastWinOffset)
        : null;
    baseline.lastPlayedDay = baseline.lastWinDay;
    if (result) {
      const wasIncludedInTotals = baseline.games > 0;
      if (wasIncludedInTotals) baseline.games--;
      if (wasIncludedInTotals)
        baseline.wins = Math.max(0, baseline.wins - Number(result.won));
      if (result.won && wasIncludedInTotals) {
        baseline.winStreak = Math.max(0, baseline.winStreak - 1);
        baseline.lastWinDay = baseline.winStreak
          ? shiftDay(result.day, -1)
          : null;
      }
      baseline.maxStreak = Math.max(
        baseline.winStreak,
        Math.min(baseline.maxStreak, baseline.wins),
      );
      baseline.lastPlayedDay = baseline.lastWinDay;
    }
    return { baseline, result };
  }

  function initialize() {
    try {
      let stored = parse(key);
      if (
        !stored ||
        stored.version !== 1 ||
        !/^[a-f0-9]{64}$/.test(stored.token) ||
        !Array.isArray(stored.pending)
      ) {
        const token = [...crypto.getRandomValues(new Uint8Array(32))]
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        const baselines = {},
          pending = [];
        for (const mode of Object.keys(modeKeys)) {
          const snapshot = legacySnapshot(mode);
          baselines[mode] = snapshot.baseline;
          if (snapshot.result) pending.push(snapshot.result);
        }
        stored = {
          version: 1,
          token,
          baselines,
          capturedAt: day(),
          pending,
          confirmed: {},
        };
        localStorage.setItem(key, JSON.stringify(stored));
      }
      return stored;
    } catch {
      usable = false;
      return null;
    }
  }

  function save(state) {
    localStorage.setItem(key, JSON.stringify(state));
  }
  function publish(mode, date, status, data) {
    const view = { status, ...(data ? { data } : {}) };
    views.set(`${mode}:${date}`, view);
    document.dispatchEvent(
      new CustomEvent("biblio:results-updated", {
        detail: { mode, day: date, ...view },
      }),
    );
    return view;
  }

  async function request(path, method = "GET", body) {
    const state = initialize();
    if (!state || !api()) throw new Error("unavailable");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${api()}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${state.token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function snapshot(mode, date = day()) {
    const state = initialize();
    if (!state || !usable) return { status: "unavailable" };
    if (!api()) return { status: "disabled" };
    return (
      views.get(`${mode}:${date}`) || {
        status: state.pending.some(
          (result) => resultKey(result) === `${mode}:${date}`,
        )
          ? "pending"
          : "idle",
      }
    );
  }

  function localHistory(mode, stored) {
    const [statsKey, stateKey] = modeKeys[mode];
    const savedStats = parse(statsKey) || {};
    const state = parse(stateKey);
    const currentDay = day();
    const stateDay = Number.isFinite(state?.expirationTime)
      ? day(new Date(state.expirationTime - 1))
      : currentDay;
    const sequential =
      Math.floor((Date.now() - Date.parse("2024-04-26T00:00:00Z")) / 86400000) +
      1;
    const anchor = Number.isInteger(state?.currentGame)
      ? state.currentGame
      : sequential;
    const lastWinOffset =
      Number.isInteger(savedStats.lastWin) &&
      savedStats.lastWin === anchor &&
      state?.won !== true
        ? -1
        : savedStats.lastWin - anchor;
    const lastWinDay =
      Number.isInteger(savedStats.lastWin) &&
      savedStats.lastWin > 0 &&
      savedStats.lastWin <= anchor
        ? shiftDay(stateDay, lastWinOffset)
        : null;
    let winStreak = Math.max(0, Number(savedStats.winStreak) || 0);
    if (
      winStreak > 0 &&
      lastWinDay &&
      (Date.parse(`${currentDay}T00:00:00Z`) -
        Date.parse(`${lastWinDay}T00:00:00Z`)) /
        86400000 >
        1
    )
      winStreak = 0;

    const byDay = new Map();
    for (const [id, result] of Object.entries(stored?.confirmed || {})) {
      if (id.startsWith(`${mode}:`))
        byDay.set(id.slice(mode.length + 1), result);
    }
    for (const result of stored?.pending || [])
      if (result.mode === mode) byDay.set(result.day, result);
    if (state && (state.won || state.gameOver)) {
      const resultDay = state.challengeDay || stateDay;
      if (!byDay.has(resultDay))
        byDay.set(resultDay, {
          day: resultDay,
          won: state.won === true,
          attempts: state.currentRow + 1,
        });
    }
    return {
      stats: {
        games: Math.max(0, Number(savedStats.games) || 0),
        wins: Math.max(0, Number(savedStats.wins) || 0),
        winStreak,
        maxStreak: Math.max(0, Number(savedStats.maxStreak) || 0),
      },
      imported: stored?.baselines?.[mode] || null,
      history: [...byDay.entries()]
        .map(([resultDay, result]) => ({ ...result, day: resultDay }))
        .sort((left, right) => right.day.localeCompare(left.day)),
    };
  }

  function scheduleRetry() {
    if (retry || !api() || !usable) return;
    retry = setTimeout(() => {
      retry = null;
      sync();
    }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 60000);
  }

  async function sync() {
    if (running) return running;
    const initial = initialize();
    if (!initial || !api()) return false;
    running = (async () => {
      try {
        await request("/player", "PUT", {
          baselines: initial.baselines,
          capturedAt: initial.capturedAt,
        });
        let result;
        while ((result = initialize()?.pending[0])) {
          let data;
          try {
            data = await request("/results", "POST", result);
          } catch (error) {
            if (error.status === 400) {
              const state = initialize();
              state.pending = state.pending.filter(
                (pending) => resultKey(pending) !== resultKey(result),
              );
              save(state);
              publish(result.mode, result.day, "unavailable");
              continue;
            }
            if (error.status !== 409) throw error;
            data = await request(
              `/stats?mode=${result.mode}&day=${result.day}`,
            );
          }
          const state = initialize();
          if (!state) return false;
          state.pending = state.pending.filter(
            (pending) => resultKey(pending) !== resultKey(result),
          );
          state.confirmed ||= {};
          state.confirmed[resultKey(result)] = data.daily?.result || result;
          save(state);
          publish(result.mode, result.day, "ready", data);
        }
        retryDelay = 1000;
        return true;
      } catch {
        for (const result of initialize()?.pending || [])
          publish(result.mode, result.day, "pending");
        scheduleRetry();
        return false;
      } finally {
        running = null;
      }
    })();
    return running;
  }

  function record(result) {
    try {
      const state = initialize();
      if (!state) return Promise.resolve(false);
      if (
        !state.confirmed?.[resultKey(result)] &&
        !state.pending.some(
          (pending) => resultKey(pending) === resultKey(result),
        )
      ) {
        state.pending.push(result);
        save(state);
      }
      if (!api()) return Promise.resolve(false);
      publish(result.mode, result.day, "pending");
      return sync();
    } catch {
      usable = false;
      publish(result.mode, result.day, "unavailable");
      return Promise.resolve(false);
    }
  }

  async function refresh(mode, date = day()) {
    if (!api()) return publish(mode, date, "disabled");
    if (!(await sync()))
      return publish(
        mode,
        date,
        snapshot(mode, date).status === "pending" ? "pending" : "unavailable",
      );
    try {
      return publish(
        mode,
        date,
        "ready",
        await request(`/stats?mode=${mode}&day=${date}`),
      );
    } catch {
      return publish(mode, date, "unavailable");
    }
  }

  async function history(mode, date = day()) {
    const stored = initialize();
    const fallback = localHistory(mode, stored);
    if (!api()) return { status: "disabled", data: fallback };
    if (!(await sync()))
      return {
        status:
          snapshot(mode, date).status === "pending" ? "pending" : "unavailable",
        data: fallback,
      };
    try {
      return {
        status: "ready",
        data: await request(`/history?mode=${mode}&day=${date}`),
      };
    } catch {
      return { status: "unavailable", data: fallback };
    }
  }

  window.addEventListener("online", () => {
    clearTimeout(retry);
    retry = null;
    sync();
  });
  return { initialize, record, refresh, history, snapshot, sync };
})();
