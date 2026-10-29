import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.clock.install({ time: new Date("2026-10-31T12:00:00") });
});

test("a apresentação aparece uma vez e Escape permite continuar jogando", async ({
  page,
}) => {
  await page.goto("/");
  const intro = page.getByRole("dialog", { name: "Temos um novo modo!" });
  await expect(intro).toBeVisible();
  await expect(intro).toContainText("cinco letras");
  await page.keyboard.type("MC");
  await expect(page.locator("#box00")).toBeEmpty();
  await page.keyboard.press("Escape");
  await expect(intro).not.toBeVisible();
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await page.locator("#game").click({ position: { x: 5, y: 5 } });
  await page.keyboard.type("MC");
  await expect(page.locator("#box00")).toHaveText("M");
  await page.reload();
  await expect(page.locator("#game[data-ready=true]")).toBeVisible();
  await expect(intro).not.toBeVisible();
  await expect(page.locator("#box00")).toHaveText("M");
});

test("a apresentação permite experimentar Palavra sem reaparecer", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const intro = page.getByRole("dialog", { name: "Temos um novo modo!" });
  await expect(intro).toBeVisible();
  await page.screenshot({
    path: `.scratch/modo-palavra/intro-${testInfo.project.name}.png`,
  });
  await intro.getByRole("link", { name: "Jogar Palavra" }).click();
  await expect(page.locator("#game[data-ready=true] .box")).toHaveCount(30, {
    timeout: 15000,
  });
  await expect(intro).not.toBeVisible();
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  await page.getByRole("link", { name: "Referência", exact: true }).click();
  await expect(page.locator("#game[data-ready=true] .box")).toHaveCount(36);
  await expect(intro).not.toBeVisible();
});

test("a barra ocupa a largura da tela e fica compacta logo abaixo do header", async ({
  page,
}, testInfo) => {
  await page.goto("/?modo=palavra");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Recusar opcionais" }).click();
  const bar = await page
    .getByRole("navigation", { name: "Modos de jogo" })
    .boundingBox();
  const header = await page.locator(".site-header").boundingBox();
  expect(bar.x).toBe(0);
  expect(bar.width).toBe(page.viewportSize().width);
  expect(bar.height).toBeLessThanOrEqual(36);
  expect(bar.y).toBeCloseTo(header.y + header.height);
  await expect(
    page.getByRole("link", { name: "Palavra", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.screenshot({
    path: `.scratch/modo-palavra/bar-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
