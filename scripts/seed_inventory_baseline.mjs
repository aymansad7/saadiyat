/**
 * One-off: run the initial inventory baseline sync (trigger="seed").
 * Uses tsx to import the TypeScript engine directly so it shares the same
 * DB connection / dataset loaders as the server.
 *
 *   pnpm exec tsx scripts/seed_inventory_baseline.mjs
 */
import "dotenv/config";
import { runInventorySync } from "../server/inventorySync.ts";

const trigger = process.argv[2] === "manual" ? "manual" : "seed";

const res = await runInventorySync({ trigger, triggeredBy: "system" });
console.log(JSON.stringify(res, null, 2));
process.exit(0);
