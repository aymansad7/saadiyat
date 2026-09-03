import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const revision = "d4206f558747b82de4c537a045821627c7686e23";
const output = resolve(root, "server/data/sources/world-of-aldar/2026-08-12/alghadeer_gardens_r2_pricing.json");
const historic = JSON.parse(execFileSync("git", ["show", `${revision}:server/data/aldar_other.json`], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
}));
const project = historic.projects.find(row => row.slug === "al-ghadeer-gardens");
if (!project) throw new Error("Historic Al Ghadeer Gardens project was not found.");
const units = project.buildings.flatMap(building => building.units)
  .filter(unit => /^AlGhadeerGardens-R2-(?:V|TH)-\d{3}$/i.test(unit.unit_name ?? ""))
  .map(unit => ({
    unit_name: unit.unit_name,
    price_aed: unit.price_aed,
    reservation_amount: unit.reservation_amount,
    online_reservation_fee: unit.online_reservation_fee,
    payment_plans: unit.payment_plans,
    inventory_category: unit.inventory_category,
    property_status: unit.property_status,
    mandatory_pool: unit.mandatory_pool,
    mandatory_premium: unit.mandatory_premium,
    darna_applicable: unit.darna_applicable,
    virtual_tour: unit.virtual_tour,
    service_charge_aed_sqm: unit.service_charge_aed_sqm,
    service_charge_escalation_pct: unit.service_charge_escalation_pct,
    car_parks: unit.car_parks,
    source_status: unit.status,
  }));
if (units.length !== 434 || units.some(unit => typeof unit.price_aed !== "number" || unit.price_aed <= 0)) {
  throw new Error(`Expected 434 priced R2 rows, found ${units.length}.`);
}
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify({
  source: "Historical Aldar official price snapshot preserved from 2026-08-12",
  source_revision: revision,
  captured_at: "2026-08-12",
  units,
})}\n`, "utf8");
console.log(JSON.stringify({ output, unitCount: units.length }, null, 2));
