/* eslint-disable no-console */
// Exports the given collections as JSON into backups/<timestamp>/ before they get dropped.
// node --env-file=.env scripts/db-backup.js name1,name2
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "#db/connection.js";

const names = (process.argv[2] ?? "").split(",").filter(Boolean);
if (names.length === 0) {
  console.error("usage: node scripts/db-backup.js name1,name2");
  process.exit(1);
}

await connectDatabase();
const db = mongoose.connection.db;
const dir = path.resolve("backups", new Date().toISOString().replace(/[:.]/g, "-"));
fs.mkdirSync(dir, { recursive: true });

for (const name of names) {
  const docs = await db.collection(name).find().toArray();
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(docs, null, 2));
  console.log(`${name}: ${docs.length} documents → ${path.relative(process.cwd(), path.join(dir, `${name}.json`))}`);
}

await disconnectDatabase();
process.exit(0);
