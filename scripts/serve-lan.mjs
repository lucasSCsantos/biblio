import { networkInterfaces } from "node:os";
import { createSiteServer } from "./serve.mjs";

if (process.env.NODE_ENV === "production")
  throw new Error("O servidor LAN é exclusivo de desenvolvimento.");
process.env.NODE_ENV = "development";
const port = Number(process.env.BIBLIO_PORT || 4175);
const site = await createSiteServer({
  host: "0.0.0.0",
  port,
  allowLan: true,
  persist: true,
});
console.log("Biblio — somente desenvolvimento na rede local:");
for (const addresses of Object.values(networkInterfaces()))
  for (const address of addresses || [])
    if (address.family === "IPv4" && !address.internal)
      console.log(`http://${address.address}:${port}`);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await site.close();
    process.exit(0);
  });
