(() => {
  const key = "biblio-privacy-v1";
  const config = window.BIBLIO_CONFIG || {};
  const banner = document.getElementById("privacy-choices");
  const analytics = document.getElementById("allow-analytics");
  const advertising = document.getElementById("allow-advertising");
  let active = { analytics: false, advertising: false };

  function readChoice() {
    if (new URL(location.href).searchParams.get("privacy") === "off") {
      return { analytics: false, advertising: false };
    }
    try {
      const choice = JSON.parse(localStorage.getItem(key));
      if (
        choice &&
        choice.expires > Date.now() &&
        typeof choice.analytics === "boolean" &&
        typeof choice.advertising === "boolean"
      )
        return choice;
    } catch {
      /* Uma preferência inválida é tratada como não escolhida. */
    }
    return null;
  }

  function script(src, id) {
    if (document.getElementById(id)) return;
    const element = document.createElement("script");
    element.id = id;
    element.async = true;
    element.src = src;
    element.crossOrigin = "anonymous";
    document.head.appendChild(element);
  }

  // O jogo pode registrar eventos sem criar fila ou carregar terceiros antes da escolha.
  window.biblioTrack = (...args) => {
    if (active.analytics && window.gtag) window.gtag(...args);
  };

  function apply(choice) {
    active = choice;
    if (
      choice.analytics &&
      config.analyticsId &&
      !document.getElementById("biblio-analytics")
    ) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", config.analyticsId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      script(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.analyticsId)}`,
        "biblio-analytics",
      );
    }
    const slot = document.querySelector("[data-ad-space]");
    // Páginas informativas, falhas e partidas ainda não carregadas não exibem anúncios.
    if (
      choice.advertising &&
      config.adsEnabled &&
      slot &&
      document.querySelector("#game[data-ready='true']") &&
      config.publisherId
    ) {
      script(
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.publisherId)}`,
        "biblio-adsense",
      );
      if (!/^\d+$/.test(config.adSlot) || slot.querySelector("ins")) return;
      slot.hidden = false;
      const ad = document.createElement("ins");
      ad.className = "adsbygoogle";
      ad.style.display = "block";
      ad.dataset.adClient = config.publisherId;
      ad.dataset.adSlot = config.adSlot;
      ad.dataset.adFormat = "auto";
      ad.dataset.fullWidthResponsive = "true";
      slot.appendChild(ad);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }

  function openChoices() {
    const choice = readChoice();
    analytics.checked = choice?.analytics === true;
    advertising.checked = choice?.advertising === true;
    banner.hidden = false;
    banner.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("privacy-title").focus({ preventScroll: true });
  }

  function save(choice) {
    const previous = active;
    let persisted = true;
    const saved = { ...choice, expires: Date.now() + 180 * 86400000 };
    try {
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {
      persisted = false;
      document.getElementById("privacy-status").textContent =
        "Não foi possível salvar. Sua escolha vale apenas nesta página.";
    }
    // Um recarregamento encerra os scripts já carregados ao revogar uma escolha.
    if (
      (previous.analytics && !choice.analytics) ||
      (previous.advertising && !choice.advertising)
    ) {
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0].trim();
        if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) continue;
        for (const domain of ["", location.hostname, `.${location.hostname}`]) {
          document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
        }
      }
      if (persisted) location.reload();
      else {
        // A recusa via URL evita restaurar um registro antigo quando salvar falha.
        const url = new URL(location.href);
        url.searchParams.set("privacy", "off");
        location.replace(url.href);
      }
      return;
    }
    if (persisted) {
      const url = new URL(location.href);
      url.searchParams.delete("privacy");
      history.replaceState(null, "", url.href);
    }
    banner.hidden = true;
    apply(saved);
  }

  document
    .querySelectorAll("[data-privacy-settings]")
    .forEach((button) => button.addEventListener("click", openChoices));
  document
    .getElementById("privacy-reject")
    .addEventListener("click", () =>
      save({ analytics: false, advertising: false }),
    );
  document
    .getElementById("privacy-save")
    .addEventListener("click", () =>
      save({ analytics: analytics.checked, advertising: advertising.checked }),
    );
  document.addEventListener("biblio:ready", () => apply(active));
  // A recusa de emergência acompanha a navegação local até poder ser salva.
  document.addEventListener("click", (event) => {
    if (new URL(location.href).searchParams.get("privacy") !== "off") return;
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    url.searchParams.set("privacy", "off");
    link.href = url.href;
  });
  const choice = readChoice();
  if (choice) apply(choice);
  else banner.hidden = false;
})();
