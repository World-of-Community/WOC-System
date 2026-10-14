/* eslint-disable no-console */
// Lists collections that no model uses any more. Dry run by default;
// `node scripts/db-cleanup.js --apply name,name2` drops exactly the named collections.
import mongoose from "mongoose";
import path from "node:path";
import { connectDatabase, disconnectDatabase } from "#db/connection.js";
import { walkJsFiles, importFile, SRC_DIR } from "../src/loaders/walk.js";

const apply = process.argv.includes("--apply");
const requested = new Set((process.argv[process.argv.indexOf("--apply") + 1] ?? "").split(",").filter(Boolean));

await connectDatabase();

const used = new Set();
for (const file of walkJsFiles(path.join(SRC_DIR, "database", "models"))) {
  used.add((await importFile(file)).default.collection.collectionName);
}

const db = mongoose.connection.db;
const collections = (await db.listCollections().toArray()).map((c) => c.name).sort();

console.log("\ncollection                 docs   status");
for (const name of collections) {
  const count = await db.collection(name).countDocuments();
  const status = used.has(name) ? "used by model" : "UNUSED";
  console.log(`${name.padEnd(26)} ${String(count).padStart(5)}   ${status}`);
}

if (apply) {
  for (const name of requested) {
    if (used.has(name)) {
      console.log(`skip ${name}: still used by a model`);
      continue;
    }
    if (!collections.includes(name)) {
      console.log(`skip ${name}: does not exist`);
      continue;
    }
    await db.collection(name).drop();
    console.log(`dropped ${name}`);
  }
} else {
  console.log("\nDry run. Drop with: node scripts/db-cleanup.js --apply <name,name2,...>");
}

await disconnectDatabase();
process.exit(0);
