const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Pfad zur Statusdatei mit Twitch-Credentials und Nachricht-ID
const twitchStatusPath = path.join(__dirname, '../../../src/json/twitchStatus.json');

let twitchconfig = {};
let accessToken = '';
let statusMessageId = null;
let updateIntervalHandle = null; // Globaler Timer

// Twitch-Daten und evtl. gespeicherte statusMessageId laden
if (fs.existsSync(twitchStatusPath)) {
  try {
    const data = fs.readFileSync(twitchStatusPath, 'utf-8');
    twitchconfig = JSON.parse(data);
    statusMessageId = twitchconfig.statusMessageId || null;
  } catch (err) {
    console.error('Fehler beim Laden der twitchStatus.json:', err);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twitch-status')
    .setDescription('Sendet oder aktualisiert den Twitch-Status im Kanal'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Access Token holen
      await getAccessToken();

      // Update einmalig sofort ausführen
      await updateTwitchStatus(interaction.client, interaction.guild, interaction.user);

      // Timer nur einmal starten (wenn noch nicht gestartet)
      if (!updateIntervalHandle) {
        updateIntervalHandle = setInterval(async () => {
          try {
            await getAccessToken(); // Token ggf. erneuern
            await updateTwitchStatus(interaction.client, interaction.guild, interaction.user);
          } catch (err) {
            console.error('Fehler bei automatischer Twitch-Status-Aktualisierung:', err);
          }
        }, 60 * 1000); // alle 60 Sekunden
      }

      await interaction.editReply({ content: '> ✅ » Twitch-Status erfolgreich aktualisiert und automatischer Refresh aktiviert.' });
    } catch (err) {
      console.error('Fehler beim Ausführen von /twitch-status:', err);
      await interaction.editReply({ content: '> ❌ » Fehler beim Senden des Twitch-Status.' });
    }
  }
};

// Twitch Access Token holen (Client Credentials Flow)
async function getAccessToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${twitchconfig.twitchClientId}&client_secret=${twitchconfig.twitchClientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error('Konnte Access Token nicht abrufen');
  accessToken = data.access_token;
}

// Embed für Offline-Status
function createOfflineEmbed(user) {
  return new EmbedBuilder()
    .setAuthor({ 
      name: 'Red3405 Ankündigung', 
      iconURL: user.displayAvatarURL({ dynamic: true }),
      url: `https://twitch.tv/${twitchconfig.twitchUser}`  // klickbarer Author-Link!
    })
    .setTitle('Offline!')
    .setDescription(
      `- Titel: **?**\n` +
      `- Kategorie: **?**\n` +
      `- Zuschauer: **0**`
    )
    .setColor('Red')
    .setFooter({ text: 'Zuletzt aktualisiert' })
    .setTimestamp();
}

// Embed für Live-Status (Stream läuft)
function createLiveEmbed(stream, user) {
  return new EmbedBuilder()
    .setAuthor({ 
      name: 'Red3405 Ankündigung', 
      iconURL: user.displayAvatarURL({ dynamic: true }),
      url: `https://twitch.tv/${twitchconfig.twitchUser}` // klickbarer Author-Link!
    })
    .setTitle(`${stream.user_name} streamt!`)
    .setDescription(
      `- Titel: **${stream.title || 'Kein Titel'}**\n` +
      `- Kategorie: **${stream.game_name || 'Keine Angabe'}**\n` +
      `- Zuschauer: **${stream.viewer_count.toLocaleString('de-DE')}**`
    )
    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchconfig.twitchUser}-640x360.jpg?${Date.now()}`)
    .setColor('Purple')
    .setFooter({ text: 'Live seit' })
    .setTimestamp(new Date(stream.started_at)); // Zeit festsetzen auf Streamstart
}

// Button mit dynamischem Twitch-User
function createButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(`🔗 Twitch: Red3405`)
      .setStyle(ButtonStyle.Link)
      .setURL(`https://twitch.tv/${twitchconfig.twitchUser}`)
  );
}

// Speichert die statusMessageId zurück in die Datei
function saveStatusMessageId(id) {
  twitchconfig.statusMessageId = id;
  fs.writeFileSync(twitchStatusPath, JSON.stringify(twitchconfig, null, 2), 'utf-8');
}

// Hauptfunktion: Sendet oder aktualisiert die Twitch-Status-Nachricht mit Link über dem Embed
async function updateTwitchStatus(client, guild, user) {
  const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchconfig.twitchUser}`, {
    headers: {
      'Client-ID': twitchconfig.twitchClientId,
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) throw new Error(`Twitch API Fehler: ${res.status} ${res.statusText}`);

  const data = await res.json();
  const stream = data.data && data.data.length > 0 ? data.data[0] : null;

  const channel = await client.channels.fetch(twitchconfig.channelId);
  if (!channel || !channel.isTextBased()) throw new Error('Konnte Kanal nicht finden oder ist kein Textkanal.');

  const embed = stream ? createLiveEmbed(stream, user) : createOfflineEmbed(user);

  let message;

  if (statusMessageId) {
    try {
      message = await channel.messages.fetch(statusMessageId);
      await message.edit({
        content: `https://www.twitch.tv/${twitchconfig.twitchUser}`,
        embeds: [embed],
        components: [createButton()]
      });
    } catch {
      message = await channel.send({
        content: `https://www.twitch.tv/${twitchconfig.twitchUser}`,
        embeds: [embed],
        components: [createButton()]
      });
      statusMessageId = message.id;
      saveStatusMessageId(statusMessageId);
    }
  } else {
    message = await channel.send({
      content: `https://www.twitch.tv/${twitchconfig.twitchUser}`,
      embeds: [embed],
      components: [createButton()]
    });
    statusMessageId = message.id;
    saveStatusMessageId(statusMessageId);
  }
}
