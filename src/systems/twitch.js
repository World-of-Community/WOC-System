import fetch from "node-fetch";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import client from "#client";
import logger from "#core/logger.js";
import { env } from "#config";
import { settings } from "#core/settings.js";

const log = logger.child("Twitch");

let accessToken = "";
let tokenExpiresAt = 0;
let updatePromise = null;

// Discord error codes meaning the stored message is really gone
const MISSING_MESSAGE_CODES = [10003, 10004, 10008];
const EMBED_AUTHOR_NAME = "Red3405 Ankündigung";

const twitchUser = () => settings.get("twitch.user");
const twitchUrl = () => `https://twitch.tv/${twitchUser()}`;

export function isTwitchStatusEnabled() {
  return settings.get("twitch.enabled") !== false;
}

export async function setTwitchStatusEnabled(enabled, by = null) {
  await settings.set("twitch.enabled", enabled, by);
}

function hasCompleteConfig() {
  return Boolean(env.twitch.clientId && env.twitch.clientSecret && twitchUser() && settings.get("channels.twitch"));
}

async function getAccessToken(force = false) {
  if (!env.twitch.clientId || !env.twitch.clientSecret) {
    throw new Error("TWITCH_CLIENT_ID oder TWITCH_CLIENT_SECRET nicht in der .env gesetzt");
  }

  if (!force && accessToken && Date.now() < tokenExpiresAt) {return accessToken;}

  const params = new URLSearchParams({
    client_id: env.twitch.clientId,
    client_secret: env.twitch.clientSecret,
    grant_type: "client_credentials",
  });
  const res = await fetch("https://id.twitch.tv/oauth2/token", { method: "POST", body: params });
  const data = await res.json();
  if (!data.access_token) {throw new Error("Konnte Access Token nicht abrufen");}

  accessToken = data.access_token;
  // 5 min safety margin so the token does not expire mid-update
  tokenExpiresAt = Date.now() + ((data.expires_in || 3600) * 1000) - 5 * 60 * 1000;

  return accessToken;
}

function createOfflineEmbed() {
  return new EmbedBuilder()
    .setAuthor({ name: EMBED_AUTHOR_NAME, iconURL: client.user.displayAvatarURL({ dynamic: true }), url: twitchUrl() })
    .setTitle("Offline!")
    .setDescription("- Titel: **?**\n- Kategorie: **?**\n- Zuschauer: **0**")
    .setColor("Red")
    .setFooter({ text: "Zuletzt aktualisiert" })
    .setTimestamp();
}

function createLiveEmbed(stream) {
  return new EmbedBuilder()
    .setAuthor({ name: EMBED_AUTHOR_NAME, iconURL: client.user.displayAvatarURL({ dynamic: true }), url: twitchUrl() })
    .setTitle(`${stream.user_name} streamt!`)
    .setDescription(
      `- Titel: **${stream.title || "Kein Titel"}**\n` +
      `- Kategorie: **${stream.game_name || "Keine Angabe"}**\n` +
      `- Zuschauer: **${stream.viewer_count.toLocaleString("de-DE")}**`,
    )
    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUser()}-640x360.jpg?${Date.now()}`)
    .setColor("Purple")
    .setFooter({ text: "Live seit" })
    .setTimestamp(new Date(stream.started_at));
}

function createButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("🔗 Twitch: Red3405").setStyle(ButtonStyle.Link).setURL(twitchUrl()),
  );
}

async function fetchStream() {
  const request = async () => fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(twitchUser())}`, {
    headers: {
      "Client-ID": env.twitch.clientId,
      Authorization: `Bearer ${await getAccessToken()}`,
    },
  });

  let res = await request();

  // token expired or revoked -> refresh once and retry
  if (res.status === 401) {
    await getAccessToken(true);
    res = await request();
  }

  if (!res.ok) {throw new Error(`Twitch API Fehler: ${res.status} ${res.statusText}`);}

  const data = await res.json();
  return data.data?.length > 0 ? data.data[0] : null;
}

// avoids duplicate status messages when statusMessageId got lost
async function findExistingStatusMessage(channel) {
  try {
    const messages = await channel.messages.fetch({ limit: 50 });
    return messages.find((message) =>
      message.author.id === client.user.id &&
      message.embeds[0]?.author?.name === EMBED_AUTHOR_NAME,
    ) || null;
  } catch (err) {
    log.warn("Could not search channel history:", err);
    return null;
  }
}

async function setStatusMessageId(messageId) {
  if (settings.get("twitch.statusMessageId") === messageId) {return;}
  await settings.set("twitch.statusMessageId", messageId);
}

async function runTwitchStatusUpdate() {
  if (!hasCompleteConfig()) {throw new Error("Twitch-Konfiguration ist unvollständig (.env TWITCH_* oder /settings twitch).");}

  const stream = await fetchStream();

  const channel = await client.channels.fetch(settings.get("channels.twitch"));
  if (!channel || !channel.isTextBased()) {throw new Error("Konnte Kanal nicht finden oder ist kein Textkanal.");}

  const payload = {
    content: `https://www.twitch.tv/${twitchUser()}`,
    embeds: [stream ? createLiveEmbed(stream) : createOfflineEmbed()],
    components: [createButton()],
  };

  const statusMessageId = settings.get("twitch.statusMessageId");
  if (statusMessageId) {
    try {
      const message = await channel.messages.fetch(statusMessageId);
      await message.edit(payload);
      return;
    } catch (err) {
      // only re-send if the message is actually gone; rate limits / outages / missing perms should surface as errors
      if (!MISSING_MESSAGE_CODES.includes(err?.code)) {throw err;}
      log.warn("Stored status message is gone, looking for an existing one.");
    }
  }

  const existing = await findExistingStatusMessage(channel);
  if (existing) {
    await existing.edit(payload);
    await setStatusMessageId(existing.id);
    return;
  }

  const message = await channel.send(payload);
  await setStatusMessageId(message.id);
}

// cron and /twitch-status must not run concurrently (would create two messages)
export async function updateTwitchStatus() {
  if (updatePromise) {return updatePromise;}

  updatePromise = runTwitchStatusUpdate().finally(() => {
    updatePromise = null;
  });

  return updatePromise;
}
