const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const config = require('../../json/config.json');

const twitchStatusPath = path.join(__dirname, '../../../src/json/twitchStatus.json');
const twitchconfig = require('../../json/twitchStatus.json');

let accessToken = '';
let statusMessageId = null;

// Versuche, die gespeicherte Nachricht-ID zu laden
if (fs.existsSync(twitchStatusPath)) {
  try {
    const data = fs.readFileSync(twitchStatusPath, 'utf-8');
    const json = JSON.parse(data);
    statusMessageId = json.statusMessageId || null;
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
      await getAccessToken();
      await updateTwitchStatus(interaction.client);
      await interaction.editReply({ content: '✅ Twitch-Status erfolgreich aktualisiert.' });
    } catch (err) {
      console.error('Fehler beim Ausführen von /twitch-status:', err);
      await interaction.editReply({ content: '❌ Fehler beim Senden des Twitch-Status.' });
    }
  }
};

// Holt den Access Token von Twitch
async function getAccessToken() {
  const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${twitchconfig.twitch.twitchClientId}&client_secret=${twitchconfig.twitch.twitchClientSecret}&grant_type=client_credentials`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Konnte Access Token nicht abrufen');
  accessToken = data.access_token;
}

// Erstellt das Embed für Offline-Status
function createOfflineEmbed() {
  return new EmbedBuilder()
    .setTitle('🔴 Stream Offline')
    .setURL(`https://twitch.tv/${config.twitchUser}`)
    .addFields(
      { name: '- Titel', value: '**?**', inline: false },
      { name: '- Kategorie', value: '**?**', inline: false },
      { name: '- Zuschauer', value: '**?**', inline: false }
    )
    .setColor('Red')
    .setTimestamp();
}

// Erstellt das Embed für Live-Status
function createLiveEmbed(stream) {
  return new EmbedBuilder()
    .setTitle(`${stream.user_name} streamt!`)
    .setURL(`https://twitch.tv/${stream.user_name}`)
    .addFields(
      { name: '- Titel', value: stream.title || 'Kein Titel', inline: false },
      { name: '- Kategorie', value: stream.game_name || 'Keine Angabe', inline: false },
      { name: '- Zuschauer', value: stream.viewer_count.toString(), inline: false }
    )
    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${config.twitchUser}-640x360.jpg?${Date.now()}`)
    .setColor('Purple')
    .setTimestamp();
}

// Erstellt den Button
function createButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('➡️ Zum Stream')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://twitch.tv/${config.twitchUser}`)
  );
}

// Hauptlogik zur Aktualisierung oder Erstellung der Statusnachricht
async function updateTwitchStatus(client) {
  const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${config.twitchUser}`, {
    headers: {
      'Client-ID': config.twitchClientId,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await res.json();
  const stream = data.data && data.data.length > 0 ? data.data[0] : null;

  const channel = await client.channels.fetch(config.channelId);
  if (!channel || !channel.isTextBased()) throw new Error('Konnte Kanal nicht finden oder ist kein Textkanal.');

  let message;
  const embed = stream ? createLiveEmbed(stream) : createOfflineEmbed();

  if (statusMessageId) {
    try {
      message = await channel.messages.fetch(statusMessageId);
      await message.edit({ embeds: [embed], components: [createButton()] });
    } catch {
      message = await channel.send({ embeds: [embed], components: [createButton()] });
      statusMessageId = message.id;
      saveStatusMessageId(statusMessageId);
    }
  } else {
    message = await channel.send({ embeds: [embed], components: [createButton()] });
    statusMessageId = message.id;
    saveStatusMessageId(statusMessageId);
  }
}

// Speichert die Nachricht-ID
function saveStatusMessageId(messageId) {
  try {
    fs.writeFileSync(twitchStatusPath, JSON.stringify({ statusMessageId: messageId }, null, 2));
  } catch (err) {
    console.error('Fehler beim Speichern der statusMessageId:', err);
  }
}
