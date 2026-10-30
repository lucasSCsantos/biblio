import { test, expect } from "@playwright/test";

for (const path of ["/", "/sobre.html"]) {
  test(`fonte inicial sem troca visivel em ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const font = await page.evaluate(
      () =>
        [...document.fonts].find((face) => face.family === "Lilita One")
          ?.display,
    );
    expect(font).toBe("block");
    await expect(
      page.locator('link[rel="preload"][as="font"]'),
    ).toHaveAttribute("href", "fonts/LilitaOne-Regular.ttf");
    expect(
      await page.evaluate(() => document.fonts.check('16px "Lilita One"')),
    ).toBe(true);
  });
}
