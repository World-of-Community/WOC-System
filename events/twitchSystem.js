import cron from "node-cron";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import client from "../index.js";
import logger from "../functions/logger.js";

const TWITCH_STATUS_PATH = path.resolve("json/twitchStatus.json");

let twitchconfig = {};
let accessToken = "";
let tokenExpiresAt = 0;
let isUpdating = false;

function loadTwitchConfig() {
  if (!fs.existsSync(TWITCH_STATUS_PATH)) {
    twitchconfig = {};
    return twitchconfig;
  }

  try {
    twitchconfig = JSON.parse(fs.readFileSync(TWITCH_STATUS_PATH, "utf-8"));
  } catch (err) {
    logger.error("Twitch System: Fehler beim Laden der twitchStatus.json:", err);
    twitchconfig = {};
  }

  return twitchconfig;
}

function saveTwitchConfig() {
  fs.writeFileSync(TWITCH_STATUS_PATH, JSON.stringify(twitchconfig, null, 2), "utf-8");
}

// Direkt laden beim Start
loadTwitchConfig();

// Ohne gesetztes "enabled" läuft der Status weiter, damit bestehende Configs nicht deaktiviert sind
function isTwitchStatusEnabled() {
  return twitchconfig.enabled !== false;
}

async function setTwitchStatusEnabled(enabled) {
  loadTwitchConfig();
  twitchconfig.enabled = enabled;
  saveTwitchConfig();
}

function hasCompleteConfig() {
  return Boolean(
    twitchconfig.twitchClientId &&
    twitchconfig.twitchClientSecret &&
    twitchconfig.twitchUser &&
    twitchconfig.channelId,
  );
}

async function getAccessToken(force = false) {
  if (!twitchconfig.twitchClientId || !twitchconfig.twitchClientSecret) {
    throw new Error("Twitch Client ID oder Secret nicht konfiguriert!");
  }

  if (!force && accessToken && Date.now() < tokenExpiresAt) {return accessToken;}

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${twitchconfig.twitchClientId}&client_secret=${twitchconfig.twitchClientSecret}&grant_type=client_credentials`,
    { method: "POST" },
  );
  const data = await res.json();
  if (!data.access_token) {throw new Error("Konnte Access Token nicht abrufen");}

  accessToken = data.access_token;
  // 5 Minuten Puffer, damit der Token nicht mitten in einem Update abläuft
  tokenExpiresAt = Date.now() + ((data.expires_in || 3600) * 1000) - 5 * 60 * 1000;

  return accessToken;
}

function createOfflineEmbed() {
  return new EmbedBuilder()
    .setAuthor({
      name: "Red3405 Ankündigung",
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
      url: `https://twitch.tv/${twitchconfig.twitchUser}`,
    })
    .setTitle("Offline!")
    .setDescription(
      "- Titel: **?**\n" +
      "- Kategorie: **?**\n" +
      "- Zuschauer: **0**",
    )
    .setColor("Red")
    .setFooter({ text: "Zuletzt aktualisiert" })
    .setTimestamp();
}

function createLiveEmbed(stream) {
  return new EmbedBuilder()
    .setAuthor({
      name: "Red3405 Ankündigung",
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
      url: `https://twitch.tv/${twitchconfig.twitchUser}`,
    })
    .setTitle(`${stream.user_name} streamt!`)
    .setDescription(
      `- Titel: **${stream.title || "Kein Titel"}**\n` +
      `- Kategorie: **${stream.game_name || "Keine Angabe"}**\n` +
      `- Zuschauer: **${stream.viewer_count.toLocaleString("de-DE")}**`,
    )
    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchconfig.twitchUser}-640x360.jpg?${Date.now()}`)
    .setColor("Purple")
    .setFooter({ text: "Live seit" })
    .setTimestamp(new Date(stream.started_at));
}

function createButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🔗 Twitch: Red3405")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://twitch.tv/${twitchconfig.twitchUser}`),
  );
}

async function fetchStream() {
  const request = async () => fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchconfig.twitchUser}`, {
    headers: {
      "Client-ID": twitchconfig.twitchClientId,
      Authorization: `Bearer ${await getAccessToken()}`,
    },
  });

  let res = await request();

  // Token abgelaufen oder ungültig -> einmal neu holen und erneut versuchen
  if (res.status === 401) {
    await getAccessToken(true);
    res = await request();
  }

  if (!res.ok) {throw new Error(`Twitch API Fehler: ${res.status} ${res.statusText}`);}

  const data = await res.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}

async function updateTwitchStatus() {
  loadTwitchConfig();

  if (!hasCompleteConfig()) {throw new Error("Twitch-Konfiguration ist unvollständig (twitchStatus.json).");}

  const stream = await fetchStream();

  const channel = await client.channels.fetch(twitchconfig.channelId);
  if (!channel || !channel.isTextBased()) {throw new Error("Konnte Kanal nicht finden oder ist kein Textkanal.");}

  const payload = {
    content: `https://www.twitch.tv/${twitchconfig.twitchUser}`,
    embeds: [stream ? createLiveEmbed(stream) : createOfflineEmbed()],
    components: [createButton()],
  };

  if (twitchconfig.statusMessageId) {
    try {
      const message = await channel.messages.fetch(twitchconfig.statusMessageId);
      await message.edit(payload);
      return;
    } catch {
      logger.warn("Twitch System: Gespeicherte Status-Nachricht nicht gefunden, sende neue Nachricht.");
    }
  }

  const message = await channel.send(payload);
  twitchconfig.statusMessageId = message.id;
  saveTwitchConfig();
}

// Aktualisiert das Embed jede volle Minute, solange der Status aktiviert ist
cron.schedule("* * * * *", async () => {
  if (!client.isReady() || !isTwitchStatusEnabled() || isUpdating) {return;}

  isUpdating = true;
  try {
    await updateTwitchStatus();
  } catch (err) {
    logger.error("Twitch System: Fehler bei automatischer Status-Aktualisierung:", err);
  } finally {
    isUpdating = false;
  }
});

// Beim Bot-Start einmal sofort aktualisieren, damit das Embed nicht bis zur nächsten Minute veraltet ist
client.once("clientReady", async () => {
  if (!isTwitchStatusEnabled()) {
    logger.info("⏭️  | Twitch-Status-System ist deaktiviert");
    return;
  }

  logger.info("✅  | Twitch-Status-System aktiviert");

  try {
    await updateTwitchStatus();
  } catch (err) {
    logger.error("Twitch System: Fehler beim ersten Status-Update:", err);
  }
});

export { updateTwitchStatus, setTwitchStatusEnabled, isTwitchStatusEnabled };
