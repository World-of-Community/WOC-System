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
const EMBED_AUTHOR_SUFFIX = "Ankündigung";
const LOGIN_RE = /^[a-z0-9_]{3,25}$/i;

const twitchUrl = (login) => `https://twitch.tv/${login}`;
const authorName = (login) => `${login} ${EMBED_AUTHOR_SUFFIX}`;

export function isTwitchStatusEnabled() {
  return settings.get("twitch.enabled") !== false;
}

export async function setTwitchStatusEnabled(enabled, by = null) {
  await settings.set("twitch.enabled", enabled, by);
}

export function getStreamers() {
  const list = settings.get("twitch.streamers");
  return Array.isArray(list) ? list : [];
}

export async function addStreamer(login, by = null) {
  const normalized = String(login).trim().toLowerCase().replace(/^@/, "");
  if (!LOGIN_RE.test(normalized)) { throw new Error(`"${login}" ist kein gültiger Twitch-Name`); }

  const streamers = getStreamers();
  if (streamers.some((s) => s.login === normalized)) { throw new Error(`"${normalized}" ist bereits eingetragen`); }

  await settings.set("twitch.streamers", [...streamers, { login: normalized, messageId: null }], by);
  return normalized;
}

export async function removeStreamer(login, by = null) {
  const normalized = String(login).trim().toLowerCase();
  const streamers = getStreamers();
  const entry = streamers.find((s) => s.login === normalized);
  if (!entry) { throw new Error(`"${normalized}" ist nicht eingetragen`); }

  await settings.set("twitch.streamers", streamers.filter((s) => s.login !== normalized), by);

  if (entry.messageId) {
    const channel = await client.channels.fetch(settings.get("channels.twitch")).catch(() => null);
    const message = await channel?.messages.fetch(entry.messageId).catch(() => null);
    await message?.delete().catch(() => { });
  }
  return normalized;
}

async function patchStreamer(login, patch) {
  const streamers = getStreamers().map((s) => (s.login === login ? { ...s, ...patch } : s));
  await settings.set("twitch.streamers", streamers);
}

const saveMessageId = (login, messageId) => patchStreamer(login, { messageId });

// Announces once per stream. lastStreamId === undefined means "never checked" – then only remember, do not ping,
// so a deploy while someone is live does not re-announce.
async function announceIfNewStream(streamer, stream) {
  const known = Object.prototype.hasOwnProperty.call(streamer, "lastStreamId");
  const currentId = stream?.id ?? null;
  if (!stream) {
    if (!known) { await patchStreamer(streamer.login, { lastStreamId: null }); }
    return;
  }
  if (known && streamer.lastStreamId === currentId) { return; }

  await patchStreamer(streamer.login, { lastStreamId: currentId });
  if (!known) { return; }

  const channelId = settings.get("channels.twitchLive") || settings.get("channels.twitch");
  const roleId = settings.get("pingRoles.twitch");
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) {
    log.warn(`Live announcement channel ${channelId} not found`);
    return;
  }

  //${roleId ? ` <@&${roleId}>` : ""}
  await channel.send({
    content: `**${stream.user_name}** ist jetzt Live auf Twitch <@&1560010284519784639>`,
    allowedMentions: { roles: roleId ? [roleId] : [] },
  });
  log.info(`Live announcement sent for ${streamer.login}`);
}

async function getAccessToken(force = false) {
  if (!env.twitch.clientId || !env.twitch.clientSecret) {
    throw new Error("TWITCH_CLIENT_ID oder TWITCH_CLIENT_SECRET nicht in der .env gesetzt");
  }

  if (!force && accessToken && Date.now() < tokenExpiresAt) { return accessToken; }

  const params = new URLSearchParams({
    client_id: env.twitch.clientId,
    client_secret: env.twitch.clientSecret,
    grant_type: "client_credentials",
  });
  const res = await fetch("https://id.twitch.tv/oauth2/token", { method: "POST", body: params });
  const data = await res.json();
  if (!data.access_token) { throw new Error("Konnte Access Token nicht abrufen"); }

  accessToken = data.access_token;
  // 5 min safety margin so the token does not expire mid-update
  tokenExpiresAt = Date.now() + ((data.expires_in || 3600) * 1000) - 5 * 60 * 1000;

  return accessToken;
}

// One request for all streamers; returns Map<login, stream|null>
async function fetchStreams(logins) {
  const query = logins.map((l) => `user_login=${encodeURIComponent(l)}`).join("&");
  const request = async () => fetch(`https://api.twitch.tv/helix/streams?${query}`, {
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

  if (!res.ok) { throw new Error(`Twitch API Fehler: ${res.status} ${res.statusText}`); }

  const data = await res.json();
  const result = new Map(logins.map((l) => [l, null]));
  for (const stream of data.data ?? []) {
    result.set(stream.user_login.toLowerCase(), stream);
  }
  return result;
}

function createEmbed(login, stream) {
  const author = { name: authorName(login), iconURL: client.user.displayAvatarURL({ dynamic: true }), url: twitchUrl(login) };

  if (!stream) {
    return new EmbedBuilder()
      .setAuthor(author)
      .setTitle("Offline!")
      .setDescription("- Titel: **?**\n- Kategorie: **?**\n- Zuschauer: **0**")
      .setColor("Red")
      .setFooter({ text: "Zuletzt aktualisiert" })
      .setTimestamp();
  }

  return new EmbedBuilder()
    .setAuthor(author)
    .setTitle(`${stream.user_name} streamt!`)
    .setDescription(
      `- Titel: **${stream.title || "Kein Titel"}**\n` +
      `- Kategorie: **${stream.game_name || "Keine Angabe"}**\n` +
      `- Zuschauer: **${stream.viewer_count.toLocaleString("de-DE")}**`,
    )
    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${login}-640x360.jpg?${Date.now()}`)
    .setColor("Purple")
    .setFooter({ text: "Live seit" })
    .setTimestamp(new Date(stream.started_at));
}

function createButton(login) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel(`🔗 Twitch: ${login}`).setStyle(ButtonStyle.Link).setURL(twitchUrl(login)),
  );
}

// avoids duplicate status messages when a messageId got lost
async function findExistingStatusMessage(channel, login) {
  try {
    const messages = await channel.messages.fetch({ limit: 50 });
    return messages.find((m) => m.author.id === client.user.id && m.embeds[0]?.author?.name === authorName(login)) || null;
  } catch (err) {
    log.warn("Could not search channel history:", err?.message ?? err);
    return null;
  }
}

async function updateStreamerMessage(channel, streamer, stream) {
  const payload = {
    content: twitchUrl(streamer.login),
    embeds: [createEmbed(streamer.login, stream)],
    components: [createButton(streamer.login)],
  };

  if (streamer.messageId) {
    try {
      const message = await channel.messages.fetch(streamer.messageId);
      await message.edit(payload);
      return;
    } catch (err) {
      // only re-send if the message is actually gone; rate limits / outages / missing perms should surface as errors
      if (!MISSING_MESSAGE_CODES.includes(err?.code)) { throw err; }
      log.warn(`Status message for ${streamer.login} is gone, looking for an existing one`);
    }
  }

  const existing = await findExistingStatusMessage(channel, streamer.login);
  if (existing) {
    await existing.edit(payload);
    await saveMessageId(streamer.login, existing.id);
    return;
  }

  const message = await channel.send(payload);
  await saveMessageId(streamer.login, message.id);
}

async function runTwitchStatusUpdate() {
  const streamers = getStreamers();
  if (streamers.length === 0) { return; }
  if (!env.twitch.clientId || !env.twitch.clientSecret) { throw new Error("TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET fehlen in der .env"); }

  const channel = await client.channels.fetch(settings.get("channels.twitch"));
  if (!channel?.isTextBased()) { throw new Error("Twitch-Kanal nicht gefunden oder kein Textkanal"); }

  const streams = await fetchStreams(streamers.map((s) => s.login));

  for (const streamer of streamers) {
    const stream = streams.get(streamer.login);
    await announceIfNewStream(streamer, stream);
    await updateStreamerMessage(channel, getStreamers().find((x) => x.login === streamer.login) ?? streamer, stream);
  }
}

// cron and /settings twitch must not run concurrently (would create duplicate messages)
export async function updateTwitchStatus() {
  if (updatePromise) { return updatePromise; }

  updatePromise = runTwitchStatusUpdate().finally(() => {
    updatePromise = null;
  });

  return updatePromise;
}
