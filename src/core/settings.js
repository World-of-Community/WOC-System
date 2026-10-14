import Settings from "#models/Settings.js";
import logger from "./logger.js";
import { SETTINGS_SCHEMA, iterateSettings } from "#config/settings.schema.js";

const log = logger.child("Settings");

// group -> { key: value }
const cache = new Map();
let loaded = false;

function definition(path) {
  const [group, key] = path.split(".");
  const spec = SETTINGS_SCHEMA[group]?.keys?.[key];
  if (!spec) {throw new Error(`Unknown setting "${path}"`);}
  return { group, key, ...spec };
}

export function getSetting(path) {
  const { group, key, default: fallback } = definition(path);
  if (!loaded) {log.debug(`getSetting("${path}") before load – using default`);}
  const value = cache.get(group)?.[key];
  return value === undefined ? fallback : value;
}

export function getGroup(group) {
  const def = SETTINGS_SCHEMA[group];
  if (!def) {throw new Error(`Unknown settings group "${group}"`);}
  const result = {};
  for (const key of Object.keys(def.keys)) {
    result[key] = getSetting(`${group}.${key}`);
  }
  return result;
}

// Seeds missing groups/keys with their defaults so a fresh database is fully configured.
export async function loadSettings() {
  const docs = await Settings.find().lean();
  const byGroup = new Map(docs.map((d) => [d._id, d]));
  let seeded = 0;

  for (const [group, def] of Object.entries(SETTINGS_SCHEMA)) {
    const doc = byGroup.get(group) ?? {};
    const values = {};
    const missing = {};

    for (const [key, spec] of Object.entries(def.keys)) {
      if (doc[key] === undefined) {
        values[key] = spec.default;
        missing[key] = spec.default;
        seeded += 1;
      } else {
        values[key] = doc[key];
      }
    }

    if (Object.keys(missing).length > 0) {
      await Settings.updateOne({ _id: group }, { $set: missing, $setOnInsert: { updatedAt: new Date() } }, { upsert: true });
    }
    cache.set(group, values);
  }

  loaded = true;
  log.info(`${cache.size} groups loaded${seeded ? `, ${seeded} value(s) seeded with defaults` : ""}`);
}

// Loads defaults only (no database) – used by scripts/check-load.js
export function loadDefaultsOnly() {
  for (const [group, def] of Object.entries(SETTINGS_SCHEMA)) {
    cache.set(group, Object.fromEntries(Object.entries(def.keys).map(([k, s]) => [k, s.default])));
  }
  loaded = true;
}

export async function setSetting(path, value, updatedBy = null) {
  const { group, key, type } = definition(path);
  const parsed = coerce(type, value);

  await Settings.updateOne(
    { _id: group },
    { $set: { [key]: parsed, updatedAt: new Date(), updatedBy } },
    { upsert: true },
  );
  cache.get(group)[key] = parsed;
  log.info(`${path} = ${JSON.stringify(parsed)}${updatedBy ? ` (by ${updatedBy})` : ""}`);
  return parsed;
}

export async function resetSetting(path, updatedBy = null) {
  return setSetting(path, definition(path).default, updatedBy);
}

export function listSettings(group) {
  const entries = [];
  for (const spec of iterateSettings()) {
    if (group && spec.group !== group) {continue;}
    entries.push({ ...spec, value: getSetting(spec.path) });
  }
  return entries;
}

export function settingGroups() {
  return Object.entries(SETTINGS_SCHEMA).map(([name, def]) => ({ name, label: def.label }));
}

const SNOWFLAKE = /^\d{17,20}$/;
const ID_TYPES = new Set(["role", "channel", "category", "thread", "message", "user", "emoji"]);

function extractId(raw) {
  const str = String(raw).trim();
  const mention = str.match(/^<(?:@&|@!?|#|a?:\w+:)(\d{17,20})>$/);
  return mention ? mention[1] : str;
}

// Accepts raw ids, mentions, "ja/nein", comma separated lists and JSON.
export function coerce(type, raw) {
  if (ID_TYPES.has(type)) {
    const id = extractId(raw);
    if (!SNOWFLAKE.test(id)) {throw new Error(`"${raw}" ist keine gültige Discord-ID`);}
    return id;
  }
  if (type === "string") {return String(raw);}
  if (type === "number") {
    const n = Number(raw);
    if (!Number.isFinite(n)) {throw new Error(`"${raw}" ist keine Zahl`);}
    return n;
  }
  if (type === "boolean") {
    if (typeof raw === "boolean") {return raw;}
    const s = String(raw).toLowerCase();
    if (["true", "ja", "yes", "1", "on", "an"].includes(s)) {return true;}
    if (["false", "nein", "no", "0", "off", "aus"].includes(s)) {return false;}
    throw new Error(`"${raw}" ist kein Wahrheitswert (ja/nein)`);
  }
  if (type === "roleList" || type === "channelList") {
    const list = Array.isArray(raw) ? raw : String(raw).split(/[,\s]+/).filter(Boolean);
    return list.map((v) => {
      const id = extractId(v);
      if (!SNOWFLAKE.test(id)) {throw new Error(`"${v}" ist keine gültige Discord-ID`);}
      return id;
    });
  }
  if (type === "stringList") {
    return Array.isArray(raw) ? raw.map(String) : String(raw).split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (type === "json") {
    if (typeof raw === "object") {return raw;}
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("Ungültiges JSON");
    }
  }
  throw new Error(`Unknown setting type "${type}"`);
}

export function formatValue(type, value) {
  if (value === null || value === undefined || value === "") {return "`–`";}
  switch (type) {
    case "role": return `<@&${value}> (\`${value}\`)`;
    case "channel": case "category": case "thread": return `<#${value}> (\`${value}\`)`;
    case "user": return `<@${value}> (\`${value}\`)`;
    case "roleList": return value.length ? value.map((v) => `<@&${v}>`).join(", ") : "`–`";
    case "channelList": return value.length ? value.map((v) => `<#${v}>`).join(", ") : "`–`";
    case "stringList": return value.length ? value.map((v) => `\`${v}\``).join(", ") : "`–`";
    case "json": return `\`\`\`json\n${JSON.stringify(value, null, 2).slice(0, 900)}\n\`\`\``;
    case "boolean": return value ? "`✅ an`" : "`❌ aus`";
    default: return `\`${value}\``;
  }
}

export const settings = {
  get: getSetting,
  group: getGroup,
  set: setSetting,
  reset: resetSetting,
  list: listSettings,
  groups: settingGroups,
  load: loadSettings,
  schema: SETTINGS_SCHEMA,
};

export default settings;
