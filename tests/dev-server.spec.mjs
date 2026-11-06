import { test, expect } from "@playwright/test";
import { createSiteServer } from "../scripts/serve.mjs";
import { spawnSync } from "node:child_process";

test("o comando de teste LAN recusa NODE_ENV=production", () => {
  const result = spawnSync(process.execPath, ["scripts/serve-lan.mjs"], {
    env: { ...process.env, NODE_ENV: "production" },
    encoding: "utf8",
    timeout: 10000,
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("exclusivo de desenvolvimento");
});

function restoreEnvironment(previous) {
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
}

test("LAN é bloqueada em produção mesmo com opt-in", async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    await expect(
      createSiteServer({
        host: "0.0.0.0",
        port: 0,
        results: false,
        allowLan: true,
      }),
    ).rejects.toThrow("Acesso LAN exige");
  } finally {
    restoreEnvironment(previous);
  }
});

test("LAN exige opt-in explícito mesmo em desenvolvimento", async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  try {
    await expect(
      createSiteServer({ host: "0.0.0.0", port: 0, results: false }),
    ).rejects.toThrow("Acesso LAN exige");
  } finally {
    restoreEnvironment(previous);
  }
});

test("o auxiliar HTTP existe somente no servidor LAN de desenvolvimento", async ({
  request,
}) => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  const lan = await createSiteServer({
    host: "0.0.0.0",
    port: 0,
    results: false,
    allowLan: true,
  });
  const local = await createSiteServer({ port: 0, results: false });
  try {
    const hash = await request.get(`${lan.url}/__dev/sha256?message=abc`);
    expect(hash.status()).toBe(200);
    expect(await hash.json()).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(
      (await request.get(`${local.url}/__dev/sha256?message=abc`)).status(),
    ).toBe(404);
    expect(
      await (await request.get(`${local.url}/script.js`)).text(),
    ).not.toContain("/__dev/sha256");
    expect(await (await request.get(`${lan.url}/script.js`)).text()).toContain(
      "/__dev/sha256",
    );
  } finally {
    await lan.close();
    await local.close();
    restoreEnvironment(previous);
  }
});
