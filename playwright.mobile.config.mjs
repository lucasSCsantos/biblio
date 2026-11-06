import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config.mjs";

export default defineConfig({
  ...base,
  timeout: 60000,
  expect: { timeout: 15000 },
  testMatch: "mobile-layout.spec.mjs",
  projects: [
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 13"] } },
    {
      name: "firefox-mobile",
      use: {
        browserName: "firefox",
        viewport: { width: 375, height: 667 },
        hasTouch: true,
      },
    },
  ],
});
