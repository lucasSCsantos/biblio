(() => {
  const params = new URLSearchParams(location.search);
  const mode = params.get("modo") === "palavra" ? "palavra" : "referencia";
  const title = mode === "palavra" ? "Palavra" : "Referência";
  const today = new Date();
  const challengeDay = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 10);

  document.getElementById("stats-mode-title").textContent = title;
  window.biblioTrack?.("event", "statistics_open", {
    surface: "statistics_page",
    mode,
    challenge_day: challengeDay,
  });
  document.querySelectorAll("[data-stats-mode]").forEach((link) => {
    if (link.dataset.statsMode === mode)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
    link.addEventListener("click", () => {
      if (link.dataset.statsMode !== mode)
        window.biblioTrack?.("event", "mode_changed", {
          from_mode: mode,
          to_mode: link.dataset.statsMode,
          surface: "statistics_page",
          challenge_day: challengeDay,
        });
    });
  });
  document.getElementById("back-to-game").href =
    mode === "palavra" ? "index.html?modo=palavra" : "index.html";

  const percent = (wins, games) =>
    games
      ? `${((wins * 100) / games).toFixed(1).replace(".0", "").replace(".", ",")}%`
      : "0%";

  function renderHistory(history) {
    const list = document.getElementById("stats-history");
    if (!history.length) {
      const empty = document.createElement("li");
      empty.className = "statistics-empty";
      empty.textContent = "Nenhum resultado detalhado ainda.";
      list.append(empty);
      return;
    }
    for (const result of history) {
      const item = document.createElement("li");
      const date = document.createElement("time");
      date.dateTime = result.day;
      date.textContent = new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${result.day}T12:00:00Z`));
      const outcome = document.createElement("span");
      outcome.textContent = result.won
        ? `Vitória · ${result.attempts} ${result.attempts === 1 ? "tentativa" : "tentativas"}`
        : "Derrota";
      item.append(date, outcome);
      list.append(item);
    }
  }

  async function load() {
    const availability = document.getElementById("stats-availability");
    try {
      const snapshot = await window.BiblioResults.history(mode, challengeDay);
      const data = snapshot.data || {};
      const stats = data.stats || {};
      const games = Number(stats.games) || 0;
      const wins = Number(stats.wins) || 0;
      document.getElementById("stats-games").textContent = String(games);
      document.getElementById("stats-wins").textContent = String(wins);
      document.getElementById("stats-win-rate").textContent = percent(
        wins,
        games,
      );
      document.getElementById("stats-current-streak").textContent = String(
        Number(stats.winStreak) || 0,
      );
      document.getElementById("stats-max-streak").textContent = String(
        Number(stats.maxStreak) || 0,
      );
      if (snapshot.status === "ready")
        availability.textContent = "Histórico sincronizado.";
      else if (snapshot.status === "pending")
        availability.textContent =
          "Há resultados aguardando envio. Este navegador mantém seu histórico disponível.";
      else if (snapshot.status === "disabled")
        availability.textContent = "Seu histórico está salvo neste navegador.";
      else
        availability.textContent =
          "O serviço está indisponível. Seu histórico salvo neste navegador continua disponível.";

      const importedGames = Number(data.imported?.games) || 0;
      const imported = document.getElementById("stats-imported");
      if (importedGames > 0) {
        imported.hidden = false;
        imported.textContent =
          snapshot.status === "ready"
            ? `${importedGames} jogos importados do histórico anterior. Os detalhes desses resultados antigos não estavam disponíveis.`
            : `Seu histórico anterior inclui ${importedGames} jogos. Os detalhes desses resultados antigos não estavam disponíveis.`;
      }
      renderHistory(Array.isArray(data.history) ? data.history : []);
    } catch {
      availability.textContent =
        "O histórico não pôde ser carregado neste navegador.";
    }
  }

  load();
})();
