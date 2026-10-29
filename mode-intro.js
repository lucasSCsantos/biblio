(() => {
  const dialog = document.getElementById("mode-intro");
  const key = "biblio-palavra-intro-seen";
  let dismissed = false;

  function remember() {
    dismissed = true;
    try {
      localStorage.setItem(key, "true");
    } catch {
      // Fechar a apresentação continua possível se o armazenamento estiver cheio.
    }
  }

  function showIfNew() {
    if (
      dismissed ||
      dialog.open ||
      !document.querySelector("#game[data-ready='true']") ||
      !document.getElementById("modal").classList.contains("hidden")
    )
      return;
    try {
      if (localStorage.getItem(key) === "true") return;
    } catch {
      // A apresentação não depende de uma preferência persistida.
    }
    dialog.showModal();
  }

  dialog.querySelectorAll("[data-dismiss-intro]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
  dialog.querySelector("[data-try-word]").addEventListener("click", remember);
  dialog.addEventListener("close", remember);
  document.addEventListener("biblio:ready", showIfNew);
  document.addEventListener("biblio:stats-closed", showIfNew);
})();
