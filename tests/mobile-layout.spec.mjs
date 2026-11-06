import { test, expect } from "@playwright/test";

const sizes = [
  [320, 480],
  [320, 400],
  [280, 440],
  [360, 520],
  [375, 550],
  [393, 650],
  [430, 740],
  [700, 900],
  [667, 280],
  [844, 300],
  [320, 480],
];

async function expectGameInViewport(
  page,
  width,
  height,
  allowPageScroll = height < 550,
) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, 0);
  });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const measurements = await page.evaluate(
    (selectors) => {
      const rectangles = selectors.map((selector) => ({
        selector,
        ...document.querySelector(selector).getBoundingClientRect().toJSON(),
      }));
      const clue =
        document.querySelector(".verse-reference") ||
        document.querySelector(".versicle h2");
      const boxes = document.querySelectorAll(".grid .box");
      const firstKey = document.querySelector(".keyboard .key");
      return {
        rectangles,
        stageBottom: document.querySelector("#game").getBoundingClientRect()
          .bottom,
        keysInside: [...document.querySelectorAll(".key")].every((key) => {
          const box = key.getBoundingClientRect();
          return (
            box.top >= 0 &&
            box.left >= 0 &&
            box.bottom <=
              Math.max(
                innerHeight,
                document.querySelector("#game").getBoundingClientRect().bottom,
              ) +
                1 &&
            box.right <= innerWidth + 1
          );
        }),
        gaps: {
          above:
            boxes[0].getBoundingClientRect().top -
            clue.getBoundingClientRect().bottom,
          below:
            firstKey.getBoundingClientRect().top -
            boxes[boxes.length - 1].getBoundingClientRect().bottom,
        },
      };
    },
    [
      ".site-header",
      ".game-modes",
      ".game-toolbar",
      ".versicle",
      ".grid",
      ".keyboard",
      ".keyboard-row:last-child",
    ],
  );
  for (const rect of measurements.rectangles) {
    const { selector } = rect;
    expect(rect.height, `${selector}: não pode desaparecer`).toBeGreaterThan(0);
    expect(rect.y, `${selector}: acima da tela`).toBeGreaterThanOrEqual(0);
    expect(
      rect.y + rect.height,
      `${selector}: abaixo da tela`,
    ).toBeLessThanOrEqual(
      (allowPageScroll ? Math.max(height, measurements.stageBottom) : height) +
        1,
    );
    expect(rect.x, `${selector}: cortado à esquerda`).toBeGreaterThanOrEqual(0);
    expect(
      rect.x + rect.width,
      `${selector}: cortado à direita`,
    ).toBeLessThanOrEqual(width + 1);
  }
  expect(
    measurements.keysInside,
    "todas as teclas precisam caber na área visível",
  ).toBe(true);
  expect(
    await page
      .locator(".versicle h2")
      .evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    "versículo inteiro sem scroll interno",
  ).toBe(true);
  if (width <= height) {
    const { gaps } = measurements;
    expect(
      Math.abs(gaps.above - gaps.below),
      "espaços visuais iguais acima e abaixo do tabuleiro",
    ).toBeLessThanOrEqual(2);
    expect(gaps.below).toBeGreaterThanOrEqual(16);
  }
  if (allowPageScroll && measurements.stageBottom > height) {
    await page.evaluate(
      (offset) => scrollTo(0, offset),
      measurements.stageBottom - height,
    );
  }
  const margins = await page.locator(".key").evaluateAll((keys) => {
    const rects = keys.map((key) => key.getBoundingClientRect());
    return {
      bottom: innerHeight - Math.max(...rects.map((r) => r.bottom)),
      left: Math.min(...rects.map((r) => r.left)),
      right: innerWidth - Math.max(...rects.map((r) => r.right)),
    };
  });
  expect(
    Math.abs(margins.bottom - margins.right),
    `margens iguais em ${width}x${height}: ${JSON.stringify(margins)}`,
  ).toBeLessThanOrEqual(1);
  if (width <= height)
    expect(Math.abs(margins.bottom - margins.left)).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("biblio-palavra-intro-seen", "true"),
  );
  await page.route(/^https:\/\//, (route) => route.abort());
});

for (const mode of ["referencia", "hard", "palavra"]) {
  test(`${mode}: banner de privacidade empurra o jogo sem reduzir peças`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 650 });
    await page.goto(`/?modo=${mode}`);
    await expect(page.locator("#game[data-ready=true]")).toBeVisible();
    const measure = () =>
      page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        return [".grid", ".keyboard", ".box", ".key"].map((selector) => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            top: rect.top + scrollY,
          };
        });
      });
    const withBanner = await measure();
    await page.getByRole("button", { name: "Recusar opcionais" }).click();
    const withoutBanner = await measure();
    for (let i = 0; i < withBanner.length; i++) {
      expect(withBanner[i].width).toBeCloseTo(withoutBanner[i].width, 1);
      expect(withBanner[i].height).toBeCloseTo(withoutBanner[i].height, 1);
      expect(withBanner[i].top).toBeGreaterThan(withoutBanner[i].top);
    }
  });
}

for (const mode of ["referencia", "hard", "palavra"]) {
  test(`${mode}: jogo completo cabe sem remover cabeçalho, modos ou barra de ações`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto(`/?modo=${mode}`);
    await page.getByRole("button", { name: "Recusar opcionais" }).click();
    await expect(page.locator("#game[data-ready=true]")).toBeVisible();
    await page.evaluate(() => scrollTo(0, 0));
    await expect(page.locator(".daily-label")).toContainText("Desafio do dia");
    await expect(
      page.locator(".game-toolbar").getByRole("link", { name: "Como jogar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Meu progresso" }),
    ).toBeVisible();
    await expect(page.locator(".site-header nav a")).toHaveCount(6);
    await expect(page.locator(".game-modes a")).toHaveCount(3);
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await expectGameInViewport(page, width, height);
      if (width === 667)
        await page.screenshot({
          path: `.scratch/mobile-preserved/${testInfo.project.name}-${mode}-landscape.png`,
        });
    }
    await expect(page.locator(".game-note")).toBeVisible();
    await expect(page.locator(".intro-section")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
    await page.screenshot({
      path: `.scratch/mobile-preserved/${testInfo.project.name}-${mode}.png`,
    });
    await page.getByRole("button", { name: "Meu progresso" }).click();
    await expect(page.locator("#modal:not(.hidden)")).toBeVisible();
  });

  test(`${mode}: texto longo e margens do celular não cortam o teclado nem removem conteúdo`, async ({
    page,
  }, testInfo) => {
    const passage = "A graça de Deus. ".repeat(100);
    await page.route("**/bible-index.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: "const bible = {jo: [{chapter: 1, versicles: 2}]};",
      }),
    );
    await page.route("**/bible.json", (route) =>
      route.fulfill({
        json: [{ abbrev: "jo", name: "João", chapters: [[passage, passage]] }],
      }),
    );
    await page.setViewportSize({ width: 375, height: 550 });
    await page.goto(`/?modo=${mode}`);
    await page.getByRole("button", { name: "Recusar opcionais" }).click();
    await expect(page.locator("body")).toHaveClass(/mobile-game/);
    // Simula as margens físicas, além da área visível reduzida pelas barras do navegador.
    await page.addStyleTag({
      content:
        ".mobile-game {--game-edge-inset:40px} .mobile-game .site-header {padding-top:30px;padding-left:32px;padding-right:32px}",
    });
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await expectGameInViewport(page, 375, 550, true);
    if (mode === "palavra") {
      const reference = await page.locator(".verse-reference").boundingBox();
      const verse = await page.locator(".versicle").boundingBox();
      expect(reference.y).toBeGreaterThanOrEqual(verse.y);
      expect(reference.y + reference.height).toBeLessThanOrEqual(
        verse.y + verse.height + 1,
      );
    }
    expect(
      (await page.locator(".versicle h2").textContent()).length,
    ).toBeGreaterThan(1000);
    expect(
      await page
        .locator(".versicle h2")
        .evaluate((el) => el.scrollHeight > el.clientHeight),
    ).toBe(false);
    await page
      .locator(".versicle h2")
      .evaluate((el) => (el.scrollTop = el.scrollHeight));
    expect(
      await page.locator(".versicle h2").evaluate((el) => el.scrollTop),
    ).toBe(0);
    const keyboard = await page.locator(".keyboard").boundingBox();
    expect(keyboard.y + keyboard.height).toBeLessThanOrEqual(511);
    await page.getByRole("button", { name: "J", exact: true }).click();
    await expect(
      page.locator(mode === "hard" ? "#box01" : "#box00"),
    ).toHaveText("J");
    await expect(page.locator(".daily-label")).toContainText("Desafio do dia");
    await page.screenshot({
      path: `.scratch/mobile-preserved/${testInfo.project.name}-${mode}-long.png`,
    });
  });

  test(`${mode}: referência correta aparece acima do modal e volta ao jogo ao fechar`, async ({
    page,
  }, testInfo) => {
    await page.route("**/bible-index.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: "const bible = {jo: [{chapter: 1, versicles: 1}]};",
      }),
    );
    await page.route("**/bible.json", (route) =>
      route.fulfill({
        json: [
          { abbrev: "jo", name: "João", chapters: [["A graça de Deus."]] },
          { abbrev: "gn", name: "Gênesis", chapters: [["A graça de Deus."]] },
        ],
      }),
    );
    await page.setViewportSize({ width: 375, height: 550 });
    await page.goto(`/?modo=${mode}`);
    await page.getByRole("button", { name: "Recusar opcionais" }).click();
    await expect(page.locator("#game[data-ready=true]")).toBeVisible();
    await page.locator("#game").click({ position: { x: 5, y: 5 } });
    await page.keyboard.type(mode === "palavra" ? "GRACA" : "JO0101");
    await page.keyboard.press("Enter");
    const answer = mode === "palavra" ? "graça — Gênesis 1:1" : "João 1:1";
    await expect(page.locator("#modal #tag")).toHaveText(answer);
    const blue = await page.locator("#modal #tag").boundingBox();
    const modal = await page.locator(".modal-container").boundingBox();
    expect(blue.y).toBeGreaterThanOrEqual(0);
    expect(blue.y + blue.height + 8).toBeLessThanOrEqual(modal.y);
    expect(modal.y + modal.height).toBeLessThanOrEqual(550);
    expect(
      await page.locator("#tag").evaluate((el) => !!el.closest("[inert]")),
    ).toBe(false);
    await page.screenshot({
      path: `.scratch/mobile-preserved/${testInfo.project.name}-${mode}-answer.png`,
    });
    await page.reload();
    await expect(page.locator("#modal #tag")).toHaveText(answer);
    await page.getByRole("button", { name: "Fechar progresso" }).click();
    await expect(page.locator(".game-panel > #tag")).toHaveCount(0);
    await expect(page.locator("#modal #tag")).toBeHidden();
  });
}
