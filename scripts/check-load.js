/* eslint-disable no-console */
// Imports every command, component, event and schedule module through the real loaders
// without logging in or touching the database. Exits non-zero if anything fails to load.
process.env.DISCORD_TOKEN ??= "check";
process.env.DISCORD_CLIENT_ID ??= "0";
process.env.DISCORD_GUILD_ID ??= "0";
process.env.MONGO_URI ??= "mongodb://localhost/check";
process.env.LOG_LEVEL = "warn";

const client = (await import("#client")).default;
(await import("#core/settings.js")).loadDefaultsOnly();
const { loadAll } = await import("../src/loaders/index.js");

const warnings = [];
const logger = (await import("#core/logger.js")).default;
const origWarn = logger.warn;
const origError = logger.error;
logger.warn = (...a) => { warnings.push(a.join(" ")); origWarn(...a); };
logger.error = (...a) => { warnings.push(a.join(" ")); origError(...a); };

await loadAll(client);

// every settings.get("group.key") in the code must exist in the schema
const { iterateSettings } = await import("#config/settings.schema.js");
const { walkJsFiles, SRC_DIR } = await import("../src/loaders/walk.js");
const known = new Set([...iterateSettings()].map((s) => s.path));
const fsMod = await import("node:fs");
for (const file of walkJsFiles(SRC_DIR)) {
  for (const [, key] of fsMod.readFileSync(file, "utf8").matchAll(/settings\.(?:get|set|reset)\("([^"]+)"/g)) {
    if (!known.has(key)) {warnings.push(`unknown setting "${key}" in ${file}`);}
  }
}

const counts = {
  commands: client.slashCommands.size,
  buttons: client.buttons.size,
  modals: client.modals.size,
  selectMenus: client.selectMenus.size,
};
console.log(JSON.stringify(counts));

if (warnings.length > 0) {
  console.error(`\n${warnings.length} problem(s) while loading`);
  process.exit(1);
}
process.exit(0);
