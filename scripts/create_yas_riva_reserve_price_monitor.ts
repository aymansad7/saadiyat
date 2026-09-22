import { createHeartbeatJob } from "../server/_core/heartbeat";

async function main() {
  const result = await createHeartbeatJob({
    name: "yas-riva-reserve-hourly-price-monitor",
    cron: "0 0 4-19 * * *",
    path: "/api/scheduled/yasRivaReservePriceMonitor",
    method: "POST",
    description: "Hourly 08:00-23:00 Gulf official Yas Riva Reserve pricing monitor. It excludes AED 1/zero/blank placeholders, then captures all exact unit prices, saves source evidence to OneDrive, notifies the project owner, and disables itself after the first valid official price release.",
  }, "");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
