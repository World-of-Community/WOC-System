import Redis from "ioredis";
import { ChannelType, Events } from "discord.js";
import { env } from "#config";
import logger from "./logger.js";
import { loadSettings } from "./settings.js";
import { KEYS, COMMANDS, SNAPSHOT_INTERVAL, SNAPSHOT_TTL } from "#config/dashboardProtocol.js";
import { reviewSuggestion, syncReviewMessage } from "#systems/emojiQuiz.js";
import registerCommands from "../loaders/registerCommands.js";

const log = logger.child("Dashboard");

let pub = null;
let sub = null;
let timer = null;

function buildSnapshot(client) {
  const guild = client.guilds.cache.get(env.discord.guildId);
  return {
    updatedAt: Date.now(),
    ready: client.isReady(),
    startedAt: client.readyTimestamp,
    ping: client.ws.ping,
    user: client.user ? { id: client.user.id, tag: client.user.tag, avatar: client.user.displayAvatarURL() } : null,
    guild: guild ? {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
    } : null,
    roles: guild ? guild.roles.cache
      .filter((r) => r.id !== guild.id)
      .map((r) => ({ id: r.id, name: r.name, color: r.hexColor, position: r.position }))
      .sort((a, b) => b.position - a.position) : [],
    channels: guild ? guild.channels.cache
      .map((c) => ({ id: c.id, name: c.name, type: ChannelType[c.type], parentId: c.parentId ?? null }))
      .sort((a, b) => a.name.localeCompare(b.name)) : [],
    commands: [...client.slashCommands.values()].map((c) => ({
      name: c.name,
      description: c.description ?? "",
      category: c.category ?? "",
    })),
  };
}

async function publishSnapshot(client) {
  try {
    await pub.set(KEYS.snapshot, JSON.stringify(buildSnapshot(client)), "EX", SNAPSHOT_TTL);
  } catch (error) {
    log.warn("Snapshot failed:", error.message);
  }
}

const HANDLERS = {
  async [COMMANDS.settingsReload]() {
    await loadSettings();
    return { ok: true };
  },

  async [COMMANDS.commandsSync](client) {
    await loadSettings();
    await registerCommands(client);
    return { ok: true };
  },

  async [COMMANDS.emojiQuizReview](client, { suggestionId, accept, reviewerId, reviewerName }) {
    const suggestion = await reviewSuggestion(client, suggestionId, Boolean(accept), reviewerId);
    await syncReviewMessage(client, suggestion, Boolean(accept), reviewerName);
    return { ok: true, status: suggestion.status };
  },
};

async function handleMessage(client, raw) {
  let request;
  try {
    request = JSON.parse(raw);
  } catch {
    return;
  }

  const handler = HANDLERS[request.type];
  let result;
  if (!handler) {
    result = { ok: false, error: `Unknown command "${request.type}"` };
  } else {
    try {
      result = await handler(client, request.payload ?? {});
    } catch (error) {
      log.warn(`${request.type} failed: ${error.message}`);
      result = { ok: false, error: error.message };
    }
  }

  await pub.set(KEYS.result(request.id), JSON.stringify(result), "EX", 60).catch(() => {});
}

export async function startDashboardBridge(client) {
  if (!env.redis.url) {
    log.info("REDIS_URL not set – dashboard bridge disabled");
    return;
  }

  pub = new Redis(env.redis.url, { maxRetriesPerRequest: 3 });
  sub = new Redis(env.redis.url);
  // ioredis retries on its own; one warning per minute is enough
  let lastWarn = 0;
  pub.on("error", (error) => {
    if (Date.now() - lastWarn < 60_000) {return;}
    lastWarn = Date.now();
    log.warn(`Redis: ${error.message || error.code} – retrying in the background`);
  });
  sub.on("error", () => {});

  await sub.subscribe(KEYS.commandChannel);
  sub.on("message", (_channel, raw) => { handleMessage(client, raw); });

  client.on(Events.ClientReady, () => publishSnapshot(client));
  await publishSnapshot(client);
  timer = setInterval(() => publishSnapshot(client), SNAPSHOT_INTERVAL);
  timer.unref();
  log.success("Bridge connected");
}

export async function stopDashboardBridge() {
  clearInterval(timer);
  await Promise.allSettled([pub?.quit(), sub?.quit()]);
}
