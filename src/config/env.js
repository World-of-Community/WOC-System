import "dotenv/config";

const REQUIRED = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "DISCORD_GUILD_ID", "MONGO_URI"];

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  // logger is not loaded yet at this point
  // eslint-disable-next-line no-console
  console.error(`[ENV] Missing environment variables: ${missing.join(", ")} (see .env.example)`);
  process.exit(1);
}

const LOG_LEVELS = ["debug", "info", "warn", "error"];
const logLevel = (process.env.LOG_LEVEL ?? "info").toLowerCase();

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "production",
  isDev: (process.env.NODE_ENV ?? "production") === "development",
  logLevel: LOG_LEVELS.includes(logLevel) ? logLevel : "info",

  discord: Object.freeze({
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
  }),

  mongo: Object.freeze({
    uri: process.env.MONGO_URI,
    maxRetries: Number.parseInt(process.env.MONGO_MAX_RETRIES ?? "5", 10),
  }),

  twitch: Object.freeze({
    clientId: process.env.TWITCH_CLIENT_ID ?? "",
    clientSecret: process.env.TWITCH_CLIENT_SECRET ?? "",
  }),
});

export default env;
