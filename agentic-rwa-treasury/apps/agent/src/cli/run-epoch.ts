import "dotenv/config";
import { bootstrap } from "../bootstrap.js";
import { runEpoch } from "../epoch/run-epoch.js";

const application = await bootstrap();
try {
  const result = await runEpoch(application.dependencies);
  console.log(JSON.stringify(result, (_, value) => typeof value === "bigint" ? value.toString() : value, 2));
  if (result.status === "skipped") process.exitCode = 2;
} finally {
  await application.dependencies.diagnostics.close();
}
