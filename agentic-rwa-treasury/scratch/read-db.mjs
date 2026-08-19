import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";

function main() {
  const dbPath = resolve("apps/agent/.data/agent.sqlite");
  console.log(`Opening database: ${dbPath}`);
  const db = new DatabaseSync(dbPath);
  
  // Let's get table names
  // In node:sqlite, query returns an array of objects
  const count = db.prepare("SELECT COUNT(*) as count FROM epochs").get();
  console.log(`Table epochs has ${count.count} rows.`);
  
  const sample = db.prepare("SELECT * FROM epochs ORDER BY id DESC LIMIT 5").all();
  console.log("Last 5 epochs:", JSON.stringify(sample, null, 2));
}

main();
