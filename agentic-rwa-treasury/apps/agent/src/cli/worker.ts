import "dotenv/config";
import { Cron } from "croner";
import { bootstrap } from "../bootstrap.js";
import { runEpoch } from "../epoch/run-epoch.js";

const application = await bootstrap();
let running = false;

async function execute(): Promise<void> {
  if (running) {
    application.dependencies.logger.warn("epoch.overlap_skipped");
    return;
  }
  running = true;
  try {
    await runEpoch(application.dependencies);
  } finally {
    running = false;
  }
}

const job = new Cron(application.config.cron, { timezone: "UTC", protect: true }, execute);
application.dependencies.logger.info("worker.started", {
  cron: application.config.cron,
  nextRun: job.nextRun()?.toISOString(),
  runOnStart: application.config.runOnStart,
});

if (application.config.runOnStart) {
  void execute();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    job.stop();
    await application.dependencies.diagnostics.close();
    process.exit(0);
  });
}
