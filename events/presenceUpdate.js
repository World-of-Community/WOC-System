import client from "../index.js";
import {
  Events,
  ActivityType,
  PermissionFlagsBits,
} from "discord.js";
import logger from "../functions/logger.js";

const STREAM_ROLE_ID = "1266095218239995968";

async function updateStreamerRole(member) {
  try {
    if (!member || member.user.bot) {return;}

    const guild = member.guild;
    const liveRole = guild.roles.cache.get(STREAM_ROLE_ID);

    if (!liveRole) {
      logger.error(
        `❌ Streamer-Rolle ${STREAM_ROLE_ID} wurde auf ${guild.name} nicht gefunden.`,
      );
      return;
    }

    const botMember = guild.members.me;

    if (!botMember) {return;}

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      logger.error(
        `❌ Der Bot hat keine Berechtigung "Rollen verwalten" auf ${guild.name}.`,
      );
      return;
    }

    if (liveRole.position >= botMember.roles.highest.position) {
      logger.error(
        `❌ Die Streamer-Rolle "${liveRole.name}" steht über oder auf gleicher Position wie die höchste Bot-Rolle.`,
      );
      return;
    }

    const isStreaming = member.presence?.activities?.some(
      (activity) => activity.type === ActivityType.Streaming,
    ) ?? false;

    const hasRole = member.roles.cache.has(STREAM_ROLE_ID);

    // ==========================================
    // AKTUELL LIVE → ROLLE VERGEBEN
    // ==========================================

    if (isStreaming && !hasRole) {
      await member.roles.add(
        liveRole,
        "Streamer ist aktuell live",
      );

      logger.info(
        `🟢 Streamer-Rolle vergeben: ${member.user.tag}`,
      );

      return;
    }

    // ==========================================
    // NICHT MEHR LIVE → ROLLE ENTFERNEN
    // ==========================================

    if (!isStreaming && hasRole) {
      await member.roles.remove(
        liveRole,
        "Streamer ist nicht mehr live",
      );

      logger.info(
        `🔴 Streamer-Rolle entfernt: ${member.user.tag}`,
      );
    }
  } catch (error) {
    logger.error(
      `❌ Fehler beim Streamer-System für ${member?.user?.tag}:`,
    );
    logger.error(error);
  }
}

// ==========================================
// PRESENCE UPDATE
// ==========================================

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
  if (!newPresence?.member) {return;}

  await updateStreamerRole(newPresence.member);
});

// ==========================================
// BOT START → AKTUELL LIVE PRÜFEN
// ==========================================

client.once(Events.ClientReady, async () => {
  logger.info("🟢 Prüfe aktuell laufende Streams...");

  for (const guild of client.guilds.cache.values()) {
    await guild.members.fetch();

    for (const member of guild.members.cache.values()) {
      await updateStreamerRole(member);
    }
  }

  logger.info("✅ Prüfung der aktuell laufenden Streams abgeschlossen.");
});

/*
import client from "../index.js";
import { Events } from "discord.js";
import logger from "../functions/logger.js";

const STREAM_ROLE_ID = "1266095218239995968"; // Streamer-Rolle ID

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
  if (!newPresence || !newPresence.member) {return;}

  const member = newPresence.member;
  const liveRole = newPresence.guild.roles.cache.get(STREAM_ROLE_ID);
  if (!liveRole) {return;}

  const isStreaming = newPresence.activities?.some(a => a.type === 1); // 1 = STREAMING

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const timestamp = formatter.format(now);

  if (isStreaming && !member.roles.cache.has(liveRole.id)) {
    await member.roles.add(liveRole).catch(() => {});
    logger.info(`${member.user.tag} ist jetzt LIVE`);
    logger.info(`Datum: ${timestamp}`);
  }
  else if (!isStreaming && member.roles.cache.has(liveRole.id)) {
    await member.roles.remove(liveRole).catch(() => {});
    logger.info(`${member.user.tag} ist nicht mehr live`);
    logger.info(`Datum: ${timestamp}`);
  }
});

/*
import { Events, ActivityType, EmbedBuilder } from "discord.js";
import fs from "fs";
import { Coin } from "../models/coindb";
import StreamSession from "../models/streamSessiondb";

// --- In-Memory State ---
const timers = new Map();
const sessionEarned = new Map();
const sessionStart = new Map();
const lastEnded = new Map();

// --- Konfiguration ---
const INTERVAL_MINUTES = 5;
const REWARD_MIN = 100;
const REWARD_MAX = 250;
const MAX_STREAM_MINUTES = 7 * 24 * 60;
const COOLDOWN_AFTER_STREAM_MINUTES = 0;

// ⚙️ IDs anpassen
const STREAMER_ROLE_ID = "1266095218239995968"; // Optional: Rolle, die streamen darf
const LIVE_ROLE_ID = "1300000000000000000";     // 🟣 Rolle, die beim Streamen vergeben wird

// --- Config-Datei laden (optional) ---
let CONFIG = {};
try {
  const file = fs.readFileSync("json/config.json", "utf-8");
  CONFIG = JSON.parse(file);
} catch {
  console.warn(
    "[StreamReward] Keine oder fehlerhafte config.json gefunden. Stelle sicher, dass json/config.json existiert."
  );
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  name: Events.PresenceUpdate,
  /**
   * @param {import('discord.js').Presence} oldPresence
   * @param {import('discord.js').Presence} newPresence

  async execute(oldPresence, newPresence) {
    try {
      if (!newPresence?.guild) return;
      if (CONFIG.server && newPresence.guild.id !== CONFIG.server) return;

      const member =
        newPresence.member ??
        (await newPresence.guild.members
          .fetch(newPresence.userId)
          .catch(() => null));
      if (!member || member.user?.bot) return;

      const guild = newPresence.guild;

      const wasStreaming = Array.isArray(oldPresence?.activities)
        ? oldPresence.activities.some((a) => a.type === ActivityType.Streaming)
        : false;

      const isStreaming = Array.isArray(newPresence?.activities)
        ? newPresence.activities.some((a) => a.type === ActivityType.Streaming)
        : false;

      // Nur Streamer-Rolle erlaubt (optional)
      const streamerRole = guild.roles.cache.get(STREAMER_ROLE_ID);
      if (streamerRole && !member.roles.cache.has(streamerRole.id)) return;

      // Live-Status prüfen
      const liveRole = guild.roles.cache.get(LIVE_ROLE_ID);

      // 🔴 Stream gestartet
      if (!wasStreaming && isStreaming) {
        if (liveRole && !member.roles.cache.has(LIVE_ROLE_ID)) {
          await member.roles.add(LIVE_ROLE_ID).catch(() => {});
          console.log(`[StreamReward] ${member.user.tag} ist jetzt LIVE.`);
        }
        if (!timers.has(member.id)) await startStreamSession(member);
      }

      // ⚫️ Stream beendet
      if (wasStreaming && !isStreaming) {
        if (liveRole && member.roles.cache.has(LIVE_ROLE_ID)) {
          await member.roles.remove(LIVE_ROLE_ID).catch(() => {});
          console.log(`[StreamReward] ${member.user.tag} ist nicht mehr live.`);
        }
        await clearSession(member.id, "stream ended", member);
      }

      // Restore bei Bot-Neustart
      if (isStreaming && !timers.has(member.id)) {
        const existingSession = await StreamSession.findOne({
          userId: member.id,
        }).catch(() => null);
        if (existingSession) await restoreStreamSession(member, existingSession);
      }
    } catch (err) {
      console.error("[StreamReward] Error in PresenceUpdate handler:", err);
    }
  },
};

// ------------------ Hilfsfunktionen ------------------

async function restoreStreamSession(member, sessionData) {
  const userId = member.id;
  if (timers.has(userId)) return;

  const startDate = sessionData.start ? new Date(sessionData.start) : new Date();
  sessionStart.set(userId, startDate);
  sessionEarned.set(userId, sessionData.earned || 0);

  const intervalMs = INTERVAL_MINUTES * 60 * 1000;
  const interval = setInterval(async () => {
    try {
      const stillStreaming = member.presence?.activities?.some(
        (a) => a.type === ActivityType.Streaming
      );
      if (!stillStreaming) return clearSession(userId, "stream stopped", member);

      const diffMin =
        (Date.now() - sessionStart.get(userId).getTime()) / 1000 / 60;
      if (diffMin > MAX_STREAM_MINUTES)
        return clearSession(userId, "max time reached", member);

      const reward = randInt(REWARD_MIN, REWARD_MAX);
      sessionEarned.set(userId, (sessionEarned.get(userId) || 0) + reward);
      await addCoinsToUser(userId, reward);
      await StreamSession.updateOne(
        { userId },
        { $set: { earned: sessionEarned.get(userId) } }
      );
    } catch (err) {
      console.error("[StreamReward] Error during restore interval:", err);
    }
  }, intervalMs);

  timers.set(userId, interval);
  console.log(`[StreamReward] ${member.user.tag} restored stream session.`);
}

async function startStreamSession(member) {
  const userId = member.id;

  if (COOLDOWN_AFTER_STREAM_MINUTES > 0 && lastEnded.has(userId)) {
    const diffMin =
      (Date.now() - lastEnded.get(userId).getTime()) / 1000 / 60;
    if (diffMin < COOLDOWN_AFTER_STREAM_MINUTES) {
      console.log(
        `[StreamReward] ${member.user.tag} is still on cooldown (${Math.round(
          diffMin
        )}m).`
      );
      return;
    }
  }

  sessionEarned.set(userId, 0);
  sessionStart.set(userId, new Date());

  await StreamSession.updateOne(
    { userId },
    { $set: { start: sessionStart.get(userId), earned: 0 } },
    { upsert: true }
  ).catch((err) => console.error("[StreamReward] DB write error:", err));

  const intervalMs = INTERVAL_MINUTES * 60 * 1000;
  const interval = setInterval(async () => {
    try {
      const stillStreaming = member.presence?.activities?.some(
        (a) => a.type === ActivityType.Streaming
      );
      if (!stillStreaming) return clearSession(userId, "stream stopped", member);

      const diffMin =
        (Date.now() - sessionStart.get(userId).getTime()) / 1000 / 60;
      if (diffMin > MAX_STREAM_MINUTES)
        return clearSession(userId, "max time reached", member);

      const reward = randInt(REWARD_MIN, REWARD_MAX);
      sessionEarned.set(userId, (sessionEarned.get(userId) || 0) + reward);
      await addCoinsToUser(userId, reward);
      await StreamSession.updateOne(
        { userId },
        { $set: { earned: sessionEarned.get(userId) } }
      );
    } catch (err) {
      console.error("[StreamReward] Error during interval:", err);
    }
  }, intervalMs);

  timers.set(userId, interval);
  console.log(`[StreamReward] ${member.user.tag} started stream session.`);
}

async function clearSession(userId, reason = "ended", memberInstance = null) {
  try {
    if (timers.has(userId)) {
      clearInterval(timers.get(userId));
      timers.delete(userId);
    }

    const earned = sessionEarned.get(userId) || 0;
    const start = sessionStart.get(userId);
    const end = new Date();

    sessionEarned.delete(userId);
    sessionStart.delete(userId);
    lastEnded.set(userId, end);

    await StreamSession.deleteOne({ userId });

    if (memberInstance?.user) {
      const finalBalance = await getUserCoins(userId);
      let durationText = "unbekannt";
      if (start) {
        const diffMs = end - start;
        durationText = `${Math.floor(diffMs / 60000)}m ${Math.floor(
          (diffMs % 60000) / 1000
        )}s`;
      }

      const embed = new EmbedBuilder()
        .setTitle("🎥 Stream-Belohnung")
        .setDescription("Danke fürs Streamen! Hier ist deine Belohnung:")
        .addFields(
          { name: "🕒 Dauer", value: durationText, inline: true },
          { name: "💰 Verdient", value: `${earned} Coins`, inline: true },
          { name: "🏦 Kontostand", value: `${finalBalance} Coins`, inline: false }
        )
        .setFooter({ text: `Grund: ${reason}` })
        .setTimestamp();

      await memberInstance.user
        .send({ embeds: [embed] })
        .catch(() =>
          console.log(`[StreamReward] Konnte DM an ${userId} nicht senden.`)
        );
    }

    console.log(
      `[StreamReward] ${memberInstance?.user?.tag ?? userId} stream ended. Earned: ${earned}.`
    );
  } catch (err) {
    console.error("[StreamReward] Error in clearSession:", err);
  }
}

// ------------------ Coin Helpers ------------------
async function addCoinsToUser(userId, amount) {
  try {
    const res = await Coin.findOneAndUpdate(
      { userId },
      { $inc: { coins: amount } },
      { upsert: true, returnDocument: 'after' }
    );
    return res.coins;
  } catch (err) {
    console.error("[StreamReward] addCoinsToUser error:", err);
    return null;
  }
}

async function getUserCoins(userId) {
  try {
    const res = await Coin.findOne({ userId });
    return res?.coins || 0;
  } catch (err) {
    console.error("[StreamReward] getUserCoins error:", err);
    return 0;
  }
}

// Sauberes Beenden
process.on("SIGINT", () => {
  timers.forEach(clearInterval);
  console.log("[StreamReward] Alle Timer beim Shutdown beendet.");
  process.exit(0);
});

// Alte Version des Handlers (nur zur Referenz)*
/*
import { Events, ActivityType, EmbedBuilder } from "discord.js";
import fs from 'fs';
import userdb from "../models/userdb";
import { Coin } from '../models/coindb.js';
import StreamSession from '../models/streamSessiondb.js';

const onlineMap = new Map();
const offlineMessages = new Map();
const timers = new Map();
const sessionEarned = new Map();
const sessionStart = new Map();
const lastEnded = new Map();

const INTERVAL_MINUTES = 5;
const REWARD_MIN = 100;
const REWARD_MAX = 250;
const MAX_STREAM_MINUTES = 7 * 24 * 60;
const COOLDOWN_AFTER_STREAM_MINUTES = 0;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default {
  name: Events.PresenceUpdate,
  async execute(oldPresence, newPresence, client) {
    try {
      const file = fs.readFileSync('json/config.json', 'utf-8');
      const config = JSON.parse(file);
      if (newPresence.guild.id !== config.server) return;

      const member = newPresence.member;
      if (!member || member.user.bot) return;

      const streamerRole = newPresence.guild.roles.cache.get('1266095218239995968');
      if (!streamerRole) return;

      const isStreaming = member.presence?.activities?.some(a => a.type === ActivityType.Streaming);

      // Neustart-gesicherte Session starten
      const existingSession = await StreamSession.findOne({ userId: member.id });
      if (isStreaming && !timers.has(member.id) && existingSession) {
        restoreStreamSession(member, existingSession);
      }

      const wasStreaming = oldPresence?.activities?.some(a => a.type === ActivityType.Streaming) || false;

      if (!wasStreaming && isStreaming) await startStreamSession(member);
      if (wasStreaming && !isStreaming) await clearSession(member.id, "stream ended", member);

    } catch (err) {
      console.error("Error in PresenceUpdate handler:", err);
    }
  }
};

// ------------------ Hilfsfunktionen ------------------

async function restoreStreamSession(member, sessionData) {
  const userId = member.id;
  const intervalMs = INTERVAL_MINUTES * 60 * 1000;

  sessionEarned.set(userId, sessionData.earned);
  sessionStart.set(userId, sessionData.start);

  const interval = setInterval(async () => {
    const stillStreaming = member.presence?.activities?.some(a => a.type === ActivityType.Streaming);
    if (!stillStreaming) return clearSession(userId, "stream stopped", member);

    const diffMin = (Date.now() - sessionStart.get(userId).getTime()) / 1000 / 60;
    if (MAX_STREAM_MINUTES && diffMin > MAX_STREAM_MINUTES) {
      return clearSession(userId, "max time reached", member);
    }

    const reward = randInt(REWARD_MIN, REWARD_MAX);
    sessionEarned.set(userId, (sessionEarned.get(userId) || 0) + reward);
    await addCoinsToUser(userId, reward);

    // Update DB
    await StreamSession.updateOne({ userId }, { $set: { earned: sessionEarned.get(userId) } });
  }, intervalMs);

  timers.set(userId, interval);
  console.log(`[StreamReward] ${member.user.tag} restored stream session.`);
}

async function startStreamSession(member) {
  const userId = member.id;

  if (COOLDOWN_AFTER_STREAM_MINUTES > 0 && lastEnded.has(userId)) {
    const diffMin = (Date.now() - lastEnded.get(userId).getTime()) / 1000 / 60;
    if (diffMin < COOLDOWN_AFTER_STREAM_MINUTES) return;
  }

  sessionEarned.set(userId, 0);
  sessionStart.set(userId, new Date());

  await StreamSession.updateOne(
    { userId },
    { $set: { start: sessionStart.get(userId), earned: 0 } },
    { upsert: true }
  );

  const intervalMs = INTERVAL_MINUTES * 60 * 1000;
  const interval = setInterval(async () => {
    const stillStreaming = member.presence?.activities?.some(a => a.type === ActivityType.Streaming);
    if (!stillStreaming) return clearSession(userId, "stream stopped", member);

    const diffMin = (Date.now() - sessionStart.get(userId).getTime()) / 1000 / 60;
    if (MAX_STREAM_MINUTES && diffMin > MAX_STREAM_MINUTES) {
      return clearSession(userId, "max time reached", member);
    }

    const reward = randInt(REWARD_MIN, REWARD_MAX);
    sessionEarned.set(userId, (sessionEarned.get(userId) || 0) + reward);
    await addCoinsToUser(userId, reward);
    await StreamSession.updateOne({ userId }, { $set: { earned: sessionEarned.get(userId) } });

  }, intervalMs);

  timers.set(userId, interval);
  console.log(`[StreamReward] ${member.user.tag} started stream session.`);
}

// clearSession wie vorher, aber StreamSession DB löschen
async function clearSession(userId, reason = "ended", memberInstance = null) {
  if (timers.has(userId)) {
    clearInterval(timers.get(userId));
    timers.delete(userId);
  }

  const earned = sessionEarned.get(userId) || 0;
  const start = sessionStart.get(userId) || null;
  const end = new Date();

  sessionEarned.delete(userId);
  sessionStart.delete(userId);
  lastEnded.set(userId, end);

  // DB löschen
  await StreamSession.deleteOne({ userId });

  // DM senden...
  const finalBalance = await getUserCoins(userId);
  let durationText = "unbekannt";
  if (start) {
    const diffMs = end - start;
    durationText = `${Math.floor(diffMs / 60000)}m ${Math.floor((diffMs % 60000)/1000)}s`;
  }

  const embed = new EmbedBuilder()
    .setTitle("`🎥` Stream-Belohnung – Übersicht")
    .setDescription("Danke fürs Streamen! Hier ist deine Belohnung:")
    .addFields(
      { name: "`🕒` Dauer", value: durationText, inline: true },
      { name: "`💰` Verdient", value: `${earned} Coins`, inline: true },
      { name: "`🏦` Kontostand", value: `${finalBalance} Coins`, inline: false }
    )
    .setFooter({ text: `Grund: ${reason}` })
    .setTimestamp();

  if (memberInstance?.user) await memberInstance.user.send({ embeds: [embed] }).catch(() => {});

  console.log(`[StreamReward] ${memberInstance?.user?.tag ?? userId} endet stream, Erhalten: ${earned}.`);
}

/*
import { Events, ActivityType, EmbedBuilder } from "discord.js";
import fs from 'fs';
import userdb from "../models/userdb";
import { Coin } from '../models/coindb.js';

// Globale Map
const onlineMap = new Map();
const offlineMessages = new Map(); // Für Ticket-Bot-Nachrichten

// --- KONFIG ---
const INTERVAL_MINUTES = 5;            // Auszahlung alle X Minuten
const REWARD_MIN = 100;                // min Coins pro Intervall
const REWARD_MAX = 250;                // max Coins pro Intervall
const MAX_STREAM_MINUTES = 7 * 24 * 60; // 7 Tage
const COOLDOWN_AFTER_STREAM_MINUTES = 0; // Cooldown nach Stream (0 = keiner)
// -----------------

const timers = new Map();       // userId → IntervalObject
const sessionEarned = new Map(); // userId → total earned this session
const sessionStart = new Map();  // userId → start time
const lastEnded = new Map();     // userId → last stream end

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const file = fs.readFileSync('json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (newPresence.guild.id !== config.server) return;

        const member = newPresence.member;
        if (!member) return;

        const role = newPresence.guild.roles.cache.get(config.vanityRole);
        const streamerRole = newPresence.guild.roles.cache.get('1266095218239995968');
        if (!role || !streamerRole) return console.log("❌ > Eine der Rollen wurde nicht gefunden");

        const activities = member.presence?.activities;
        if (member.user.bot) return;

        // 🔹 Vanity-Link prüfen
        const customActivity = activities?.find(a => a.type === ActivityType.Custom);
        if (customActivity?.state?.includes(`.gg/${config.vanity}`) || customActivity?.state?.includes(`discord.gg/${config.vanity}`)) {
            await member.roles.add(role).catch(() => {});
        } else {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role).catch(() => {});
            }
        }

        // 🔹 Streamer-Rolle prüfen
        const isStreaming = activities?.some(a => a.type === ActivityType.Streaming);
        if (isStreaming) {
            if (!member.roles.cache.has(streamerRole.id)) {
                await member.roles.add(streamerRole).catch(() => {});
                logStreamerRoleChange('hinzugefügt', member);
            }
        } else {
            if (member.roles.cache.has(streamerRole.id)) {
                await member.roles.remove(streamerRole).catch(() => {});
                logStreamerRoleChange('entfernt', member);
            }
        }

        function logStreamerRoleChange(action, member) {
            const now = new Date();
            const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            const tagName = tage[now.getDay()];
            const tag = now.getDate().toString().padStart(2, '0');
            const monat = (now.getMonth() + 1).toString().padStart(2, '0');
            const jahr = now.getFullYear();
            const stunde = now.getHours().toString().padStart(2, '0');
            const minute = now.getMinutes().toString().padStart(2, '0');
            const datumUhrzeit = `${tagName}, ${tag}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;

            console.log(`📺  | Streamer-Rolle ${action} für ${member.user.displayName} (${member.user.username})`);
            console.log(`🕓  | Datum: ${datumUhrzeit}`);
        }

        // 🔹 Online-Zeit speichern
        const newStatus = newPresence.status ?? 'offline';
        if (newStatus === 'offline' || newStatus === 'invisible') {
            await userdb.updateOne(
                { userID: member.id },
                { $set: { lastOnline: new Date() } },
                { upsert: true }
            );
        }

        const userId = newPresence.user?.id;
        if (!userId || newPresence.user.bot) return;

        const oldStatus = oldPresence?.status || "offline";
        const onlineStatuses = ["online", "idle", "dnd"];

        if (!onlineStatuses.includes(oldStatus) && onlineStatuses.includes(newStatus)) {
            onlineMap.set(userId, Date.now());
        }

        if (onlineStatuses.includes(oldStatus) && !onlineStatuses.includes(newStatus)) {
            const start = onlineMap.get(userId);
            if (start) {
                const sessionTime = Date.now() - start;
                await userdb.updateOne(
                    { userID: userId },
                    { $inc: { onlineTime: sessionTime } },
                    { upsert: true }
                );
                onlineMap.delete(userId);
            }
        }

        // 🔹 Ticket-Support-Bot prüfen
        const BOT_ID = "1031487336783028274";
        const CHANNEL_IDS = [
            "819555839362072606", // Ticket Support
            "1006143436677726300" // Team Bewerben
        ];
        let lastStatus = null;

        if (!newPresence || newPresence.user?.id !== BOT_ID) return;
        const status = newPresence.status;

        // Wenn der Bot offline geht
        if (status === "offline" && lastStatus !== "offline") {
            for (const channelId of CHANNEL_IDS) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (!channel?.isTextBased()) continue;

                    const msg = await channel.send(
                        "⚠️ **Aktuell ist der Ticket Support offline.**\nWir bitten um Entschuldigung. Bitte nutze in der Zwischenzeit den **Schrift-Support**."
                    );
                    offlineMessages.set(channelId, msg);
                } catch (e) {
                    console.error(`Fehler beim Senden in Kanal ${channelId}:`, e);
                }
            }
        }

        // Wenn der Bot wieder online geht
        if (status === "online" && lastStatus === "offline") {
            for (const [channelId, msg] of offlineMessages.entries()) {
                try { await msg.delete(); } catch (e) {}
                offlineMessages.delete(channelId);

                setTimeout(async () => {
                    try {
                        const channel = await client.channels.fetch(channelId);
                        if (!channel?.isTextBased()) return;

                        const onlineMsg = await channel.send(
                            "✅ **Der Ticket Support ist nun wieder online!**"
                        );
                        setTimeout(() => onlineMsg.delete().catch(() => {}), 60_000);
                    } catch (e) {
                        console.error(`Fehler beim Senden der Online-Meldung in Kanal ${channelId}:`, e);
                    }
                }, 60_000);
            }
        }
  }}
};

/*
import { Events, ActivityType, EmbedBuilder } from "discord.js";
import fs from 'fs';
import userdb from "../models/userdb";

// Globale Map
const onlineMap = new Map();

export default {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const file = fs.readFileSync('json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (newPresence.guild.id !== config.server) return;

        const member = newPresence.member;
        if (!member) return;

        const role = newPresence.guild.roles.cache.get(config.vanityRole);
        const streamerRole = newPresence.guild.roles.cache.get('1266095218239995968');
        if (!role || !streamerRole) return console.log("❌ > Eine der Rollen wurde nicht gefunden");

        const activities = member.presence?.activities;

        if (member.user.bot) return;

        // Vanity-Link prüfen
        const customActivity = activities?.find(a => a.type === ActivityType.Custom);
        if (customActivity?.state?.includes(`.gg/${config.vanity}`) || customActivity?.state?.includes(`discord.gg/${config.vanity}`)) {
            await member.roles.add(role).catch(() => {});
        } else {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role).catch(() => {});
            }
        }

        if (!member || member.user.bot) return;

        const newStatus = newPresence.status ?? 'offline';

        if (newStatus === 'offline' || newStatus === 'invisible') {
          await userdb.updateOne(
            { userID: member.id },
            { $set: { lastOnline: new Date() } },
            { upsert: true }
          );
        }

        const userId = newPresence.user?.id;
        if (!userId || newPresence.user.bot) return;

        const oldStatus = oldPresence?.status || "offline";

        // Status, die als "online" zählen
        const onlineStatuses = ["online", "idle", "dnd"];

        // Wenn Nutzer jetzt online ist und vorher nicht
        if (!onlineStatuses.includes(oldStatus) && onlineStatuses.includes(newStatus)) {
            onlineMap.set(userId, Date.now());
        }

        // Wenn Nutzer offline/unsichtbar wird und vorher online war
        if (onlineStatuses.includes(oldStatus) && !onlineStatuses.includes(newStatus)) {
            const start = onlineMap.get(userId);
            if (!start) return;

            const sessionTime = Date.now() - start; // Millisekunden

            await userdb.updateOne(
                { userID: userId },
                { $inc: { onlineTime: sessionTime } },
                { upsert: true }
            );

            onlineMap.delete(userId);
        }

        const BOT_ID = "1031487336783028274"; // Bot-ID des Ticket-Support-Bots
        const CHANNEL_IDS = [
            "819555839362072606", // Ticket Support
            "1006143436677726300" // Team Bewerben
        ];
        let lastStatus = null;
        let offlineMessage = null; // Speichert die Offline-Nachricht

        if (!newPresence || newPresence.user?.id !== BOT_ID) return;
        const status = newPresence.status; // online, idle, dnd, offline

        // Wenn der Bot offline geht
        if (status === "offline" && lastStatus !== "offline") {
            for (const channelId of CHANNEL_IDS) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (!channel?.isTextBased()) continue;

                    const msg = await channel.send(
                        "⚠️ **Aktuell ist der Ticket Support offline.**\nWir bitten um Entschuldigung. Bitte nutze in der Zwischenzeit den **Schrift-Support**."
                    );
                    offlineMessages.set(channelId, msg);
                } catch (e) {
                    console.error(`Fehler beim Senden in Kanal ${channelId}:`, e);
                }
            }
        }

    // Wenn der Bot wieder online geht
    if (status === "online" && lastStatus === "offline") {
        for (const [channelId, msg] of offlineMessages.entries()) {
            try { await msg.delete(); } catch (e) {}
            offlineMessages.delete(channelId);

            // 1 Minute warten, dann Online-Meldung senden und nach 1 Minute löschen
            setTimeout(async () => {
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (!channel?.isTextBased()) return;

                    const onlineMsg = await channel.send(
                        "✅ **Der Ticket Support ist nun wieder online!**"
                    );
                    setTimeout(() => onlineMsg.delete().catch(() => {}), 60_000);
                } catch (e) {
                    console.error(`Fehler beim Senden der Online-Meldung in Kanal ${channelId}:`, e);
                }
            }, 60_000);
        }

        // Streamer-Aktivität prüfen
        const isStreaming = activities?.some(a => a.type === ActivityType.Streaming);

        if (isStreaming) {
            if (!member.roles.cache.has(streamerRole.id)) {
                await member.roles.add(streamerRole).catch(() => {});
                logStreamerRoleChange('hinzugefügt', member);
            }
        } else {
            if (member.roles.cache.has(streamerRole.id)) {
                await member.roles.remove(streamerRole).catch(() => {});
                logStreamerRoleChange('entfernt', member);
            }
        }

        function logStreamerRoleChange(action, member) {
            const now = new Date();
            const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            const tagName = tage[now.getDay()];
            const tag = now.getDate().toString().padStart(2, '0');
            const monat = (now.getMonth() + 1).toString().padStart(2, '0');
            const jahr = now.getFullYear();
            const stunde = now.getHours().toString().padStart(2, '0');
            const minute = now.getMinutes().toString().padStart(2, '0');
            const datumUhrzeit = `${tagName}, ${tag}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;

            console.log(`📺  | Streamer-Rolle ${action} für ${member.user.displayName} (${member.user.username})`);
            console.log(`🕓  | Datum: ${datumUhrzeit}`);
        }
    }
}};
*/

/*

const streamingUsers = new Map(); // Streaming-Daten für User: { intervalId, startTimestamp }

//// Streaming Belohnungssystem
        //const isStreaming = activities?.some(activity => activity.type === ActivityType.Streaming);
//
        //if (isStreaming && !streamingUsers.has(member.id)) {
        //    const startTimestamp = Date.now();
//
        //    const intervalId = setInterval(async () => {
        //        const data = streamingUsers.get(member.id);
        //        if (!data) return;
//
        //        const streamingDurationMs = Date.now() - data.startTimestamp;
        //        const totalMinutes = Math.floor(streamingDurationMs / (1000 * 60));
        //        const hours = Math.floor(totalMinutes / 60);
        //        const minutes = totalMinutes % 60;
//
        //        let coins;
        //        if (hours >= 3 && hours <= 5) {
        //            coins = 42;
        //        } else {
        //            coins = Math.floor(Math.random() * 4) + 1;
        //        }
//
        //        const formattedCoins = coins.toLocaleString("de-DE");
//
        //        const embed = new EmbedBuilder()
        //            .setTitle('🎥 Streaming-Belohnung')
        //            .setDescription(
        //                `Du hast **${formattedCoins} Coins** für deinen Stream erhalten!\n\n` +
        //                `⏱️ Streamdauer: **${hours} Stunden, ${minutes} Minuten**\n\n` +
        //                `📨 Bitte melde dich im [Ticket Support](https://discord.com/channels/815919809379172354/819555839362072606) ` +
        //                `von World Of Community, um die Coins auf dein Coin-Konto zu erhalten. (Bitte mache von dieser Nachricht einen Screenshot.)`
        //            )
        //            .setColor('Purple')
        //            .setFooter({ text: 'Bleib weiter live für mehr Coins!' });
//
        //        try {
        //            await member.send({ embeds: [embed] });
        //        } catch (err) {
        //            console.log(`(Streaming-Belohnung) Konnte ${member.user.username} keine DM senden.`);
        //        }
//
        //    }, 5 * 60 * 1000); // alle 5 Minuten
//
        //    streamingUsers.set(member.id, { intervalId, startTimestamp });
//
        //} else if (!isStreaming && streamingUsers.has(member.id)) {
        //    const data = streamingUsers.get(member.id);
        //    if (data?.intervalId) clearInterval(data.intervalId);
        //    streamingUsers.delete(member.id);
        //}

        // Streamer-Rollen-Verwaltung
        //if (isStreaming) {
        //    if (!member.roles.cache.has(streamerRole.id)) {
        //        await member.roles.add(streamerRole).catch(() => {});
        //        logStreamerRoleChange("hinzugefügt", member);
        //    }
        //} else {
        //    if (member.roles.cache.has(streamerRole.id)) {
        //        await member.roles.remove(streamerRole).catch(() => {});
        //        logStreamerRoleChange("entfernt", member);
        //    }
        //}
*/
