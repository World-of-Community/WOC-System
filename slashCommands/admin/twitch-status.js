import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const twitchStatusPath = path.join(__dirname, "../../../json/twitchStatus.json");

let twitchconfig = {};
let accessToken = "";
let updateIntervalHandle = null;
let tokenRefreshIntervalHandle = null;

function loadTwitchConfig() {
  if (fs.existsSync(twitchStatusPath)) {
    try {
      const data = fs.readFileSync(twitchStatusPath, "utf-8");
      twitchconfig = JSON.parse(data);
    } catch (err) {
      console.error("Fehler beim Laden der twitchStatus.json:", err);
      twitchconfig = {};
    }
  }
}

function saveTwitchConfig() {
  fs.writeFileSync(twitchStatusPath, JSON.stringify(twitchconfig, null, 2), "utf-8");
}

// Direkt laden beim Start
loadTwitchConfig();

export default {
  name: "twitch-status",
  description: "Aktiviere oder deaktiviere den automatischen Twitch-Status",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 3,
      "choices": [
        {
          "name": "Aktivieren",
          "value": "start",
        },
        {
          "name": "Deaktivieren",
          "value": "stop",
        },
      ],
      "name": "aktion",
      "description": "Wähle, ob du den Auto-Status aktivieren oder deaktivieren willst",
      "required": true,
    },
  ],

  async run(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const aktion = interaction.options.getString("aktion");

    if (aktion === "start") {
      try {
        await getAccessToken();
        await updateTwitchStatus(interaction.client, interaction.guild, interaction.user);

        if (!updateIntervalHandle) {
          startExactMinuteInterval(async () => {
            try {
              await updateTwitchStatus(interaction.client, interaction.guild, interaction.user);
            } catch (err) {
              console.error("Fehler bei automatischer Twitch-Status-Aktualisierung:", err);
            }
          }, 60 * 1000);
        }

        if (!tokenRefreshIntervalHandle) {
          tokenRefreshIntervalHandle = setInterval(async () => {
            try {
              await getAccessToken();
            } catch (err) {
              console.error("Fehler beim Erneuern des Twitch Access Tokens:", err);
            }
          }, 10 * 60 * 1000);
        }

        await interaction.editReply({ content: "> `✅` » Automatische Twitch-Status-Aktualisierung wurde **aktiviert**." });

      } catch (err) {
        console.error("Fehler beim Starten:", err);
        await interaction.editReply({ content: "> `❌` » Fehler beim Starten des automatischen Status-Updates." });
      }

    } else if (aktion === "stop") {
      clearInterval(updateIntervalHandle);
      clearInterval(tokenRefreshIntervalHandle);
      updateIntervalHandle = null;
      tokenRefreshIntervalHandle = null;

      await interaction.editReply({ content: "> `🛑` » Automatische Twitch-Status-Aktualisierung wurde **deaktiviert**." });
    }
  },
};

function startExactMinuteInterval(callback, interval) {
  const now = new Date();
  const msTillNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  setTimeout(() => {
    callback();
    updateIntervalHandle = setInterval(callback, interval);
  }, msTillNextMinute);
}

async function getAccessToken() {
  if (!twitchconfig.twitchClientId || !twitchconfig.twitchClientSecret) {
    throw new Error("Twitch Client ID oder Secret nicht konfiguriert!");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${twitchconfig.twitchClientId}&client_secret=${twitchconfig.twitchClientSecret}&grant_type=client_credentials`,
    { method: "POST" },
  );
  const data = await res.json();
  if (!data.access_token) {throw new Error("Konnte Access Token nicht abrufen");}
  accessToken = data.access_token;
}

function createOfflineEmbed(user) {
  return new EmbedBuilder()
    .setAuthor({
      name: "Red3405 Ankündigung",
      iconURL: user.displayAvatarURL({ dynamic: true }),
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

function createLiveEmbed(stream, user) {
  return new EmbedBuilder()
    .setAuthor({
      name: "Red3405 Ankündigung",
      iconURL: user.displayAvatarURL({ dynamic: true }),
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

async function updateTwitchStatus(client, guild, user) {
  loadTwitchConfig();

  const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchconfig.twitchUser}`, {
    headers: {
      "Client-ID": twitchconfig.twitchClientId,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {throw new Error(`Twitch API Fehler: ${res.status} ${res.statusText}`);}

  const data = await res.json();
  const stream = data.data && data.data.length > 0 ? data.data[0] : null;

  const channel = await client.channels.fetch(twitchconfig.channelId);
  if (!channel || !channel.isTextBased()) {throw new Error("Konnte Kanal nicht finden oder ist kein Textkanal.");}

  const embed = stream ? createLiveEmbed(stream, user) : createOfflineEmbed(user);

  let message;

  if (twitchconfig.statusMessageId) {
    try {
      message = await channel.messages.fetch(twitchconfig.statusMessageId);
      await message.edit({
        content: `https://www.twitch.tv/${twitchconfig.twitchUser}`,
        embeds: [embed],
        components: [createButton()],
      });
    } catch (err) {
      console.warn("Gespeicherte Twitch-Status-Nachricht nicht gefunden, sende neue Nachricht.");
      message = await channel.send({
        content: `https://www.twitch.tv/${twitchconfig.twitchUser}`,
        embeds: [embed],
        components: [createButton()],
      });
      twitchconfig.statusMessageId = message.id;
      saveTwitchConfig();
    }
  } else {
    message = await channel.send({
      content: `https://www.twitch.tv/${twitchconfig.twitchUser}`,
      embeds: [embed],
      components: [createButton()],
    });
    twitchconfig.statusMessageId = message.id;
    saveTwitchConfig();
  }
}
