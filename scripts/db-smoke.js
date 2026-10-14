/* eslint-disable no-console */
// Connects to the real database, seeds/loads settings and checks that every model
// points at a collection with data. Read-only apart from the settings seed.
import { connectDatabase, disconnectDatabase } from "#db/connection.js";
import { loadSettings, settings } from "#core/settings.js";
import { walkJsFiles, importFile, SRC_DIR } from "../src/loaders/walk.js";
import path from "node:path";

await connectDatabase();
await loadSettings();

console.log("\nsettings groups:", settings.groups().map((g) => g.name).join(", "));
console.log("roles.verify =", settings.get("roles.verify"));

console.log("\nmodel → collection → documents");
for (const file of walkJsFiles(path.join(SRC_DIR, "database", "models"))) {
  const model = (await importFile(file)).default;
  const count = await model.countDocuments();
  console.log(`${model.modelName.padEnd(16)} ${model.collection.collectionName.padEnd(20)} ${count}`);
}

await disconnectDatabase();
process.exit(0);
