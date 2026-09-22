import { monitorYasRivaReserveOfficialPricing } from "../server/yasRivaReserveOfficialSync";

async function main() {
  const result = await monitorYasRivaReserveOfficialPricing({
    trigger: "manual",
    triggeredBy: "owner-requested-yas-riva-reserve-price-check",
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
