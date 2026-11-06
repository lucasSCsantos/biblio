// O texto tem prioridade: só a página pode crescer, nunca uma janela interna do versículo.
(() => {
  const game = document.getElementById("game");
  const mobile = matchMedia(
    "(max-width: 700px), (max-height: 600px), (pointer: coarse)",
  );
  let frame;
  let observedPassage;

  function fit() {
    if (!mobile.matches) {
      document.body.classList.remove("mobile-game", "mobile-landscape");
      document.documentElement.style.removeProperty("--visible-game-height");
      return;
    }
    if (
      game.dataset.ready !== "true" ||
      (window.visualViewport?.scale || 1) > 1.01
    )
      return;
    const height = Math.min(
      innerHeight,
      window.visualViewport?.height || innerHeight,
    );
    document.documentElement.style.setProperty(
      "--visible-game-height",
      `${height}px`,
    );
    const landscape =
      document.documentElement.clientWidth > height && height < 500;
    document.body.classList.add("mobile-game");
    document.body.classList.toggle("mobile-landscape", landscape);
    const privacy = document.querySelector(".privacy-panel");
    const privacyStyle = getComputedStyle(privacy);
    const modes = document.querySelector(".game-modes");
    const privacyHeight = privacy.hidden
      ? 0
      : privacy.getBoundingClientRect().bottom +
        parseFloat(privacyStyle.marginBottom) -
        (modes.getBoundingClientRect().bottom +
          parseFloat(getComputedStyle(modes).marginBottom));
    // O banner desloca o jogo na página, sem consumir seu espaço de layout.
    const available =
      height - (game.getBoundingClientRect().top + scrollY - privacyHeight);
    if (available <= 0) return;
    game.style.setProperty("--game-view-height", `${available}px`);
    const style = getComputedStyle(game);
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const contentHeight = available - padding;
    const passage = game.querySelector(".versicle");
    if (passage !== observedPassage) {
      observer.observe(passage);
      observedPassage = passage;
    }
    const textHeight = passage.getBoundingClientRect().height;
    const rows = game.querySelectorAll(".keyboard-row").length;
    const grid = game.querySelector(".grid");
    const columns = grid.classList.contains("hard-grid")
      ? 7
      : grid.classList.contains("word-grid")
        ? 5
        : 6;
    const boardWidth = landscape
      ? (game.clientWidth - 6) * 0.46
      : game.clientWidth;
    const minimumGap = 16;
    const minimumCell = 8;
    const minimumKey = 24;
    let keyHeight = landscape
      ? Math.max(minimumKey, Math.min(48, (contentHeight - 12) / rows - 4))
      : Math.max(minimumKey, Math.min(48, (contentHeight * 0.34) / rows - 4));
    if (!landscape) {
      const roomForKeys =
        contentHeight - textHeight - minimumGap * 2 - (minimumCell + 4) * 6;
      keyHeight = Math.min(
        keyHeight,
        Math.max(minimumKey, roomForKeys / rows - 4),
      );
    }
    const byHeight =
      (contentHeight -
        textHeight -
        minimumGap * (landscape ? 1 : 2) -
        (landscape ? 0 : rows * (keyHeight + 4)) -
        24) /
      6;
    const cell = Math.floor(
      Math.max(
        minimumCell,
        Math.min(48, (boardWidth - 48) / columns, byHeight),
      ),
    );
    game.style.setProperty("--game-cell", `${cell}px`);
    game.style.setProperty("--game-key-height", `${Math.floor(keyHeight)}px`);
    const boardHeight = grid.getBoundingClientRect().height;
    const keyboardHeight = game
      .querySelector(".keyboard")
      .getBoundingClientRect().height;
    const required = landscape
      ? Math.max(textHeight + boardHeight + minimumGap, keyboardHeight)
      : textHeight + boardHeight + keyboardHeight + minimumGap * 2;
    const stageHeight = Math.max(available, required + padding);
    game.style.setProperty("--game-view-height", `${stageHeight}px`);
    game.dataset.pageScroll = stageHeight > available + 1 ? "true" : "false";
    const free =
      stageHeight -
      padding -
      textHeight -
      boardHeight -
      (landscape ? 0 : keyboardHeight);
    game.style.setProperty(
      "--game-section-gap",
      `${Math.max(minimumGap, free / (landscape ? 1 : 2))}px`,
    );
    passage.setAttribute("role", "region");
    passage.setAttribute("aria-label", "Texto completo do versículo");
  }

  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  }
  const observer = new ResizeObserver(schedule);
  for (const selector of [
    ".site-header",
    ".game-modes",
    ".game-toolbar",
    ".privacy-panel",
  ])
    observer.observe(document.querySelector(selector));
  new MutationObserver(schedule).observe(
    game.querySelector(".versicle") || game,
    { childList: true, subtree: true, characterData: true },
  );
  document.addEventListener("biblio:ready", schedule);
  window.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("resize", schedule);
  document.fonts.ready.then(schedule);
})();
