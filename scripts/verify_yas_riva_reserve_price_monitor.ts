import { listHeartbeatJobs } from "../server/_core/heartbeat";

async function main() {
  const result = await listHeartbeatJobs("");
  const job = result.jobs.find(item => item.taskUid === "3nJAfFkdayU5PAhzxYnuqH");
  if (!job) throw new Error("Yas Riva Reserve price monitor was not found.");
  console.log(JSON.stringify({
    taskUid: job.taskUid,
    name: job.name,
    cron: job.cronExpression,
    path: job.callbackPath,
    enabled: job.isEnable,
    description: job.description,
  }, null, 2));
  process.exit(0);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
