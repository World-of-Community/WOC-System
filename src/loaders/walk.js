import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

export const SRC_DIR = path.dirname(fileURLToPath(new URL("../index.js", import.meta.url)));

// Entries starting with "_" are skipped (e.g. _old/, _helpers.js)
export function walkJsFiles(dir) {
  if (!fs.existsSync(dir)) {return [];}

  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) {continue;}
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(full);
    }
  }
  return results.sort();
}

export function importFile(filePath) {
  return import(pathToFileURL(filePath).href);
}

export function relSrc(filePath) {
  return path.relative(SRC_DIR, filePath).replaceAll("\\", "/");
}

export function categoryOf(filePath, base) {
  const rel = path.relative(base, filePath).replaceAll("\\", "/");
  const parts = rel.split("/");
  return parts.length > 1 ? parts[0] : "";
}
