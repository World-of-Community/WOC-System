const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Pfad zur Statusdatei mit Twitch-Credentials und Nachricht-ID
const twitchStatusPath = path.join(__dirname, '../../../src/json/twitchStatus.json');

let twitchconfig = {};
let accessToken = '';
let statusMessageId = null;

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
      await getAccessToken();
      await updateTwitchStatus(interaction.client, interaction.guild);
      await interaction.editReply({ content: '> `✅` » Twitch-Status erfolgreich aktualisiert.' });
    } catch (err) {
      console.error('Fehler beim Ausführen von /twitch-status:', err);
      await interaction.editReply({ content: '> `❌` » Fehler beim Senden des Twitch-Status.' });
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
function createOfflineEmbed(guild) {
  return new EmbedBuilder()
    .setAuthor({ name: 'Red3405 Ankündigung', iconURL: guild.iconURL() || undefined })
    .setTitle('Offline')
    .setURL(`https://twitch.tv/${twitchconfig.twitchUser}`)
    .addFields(
      { name: '- Titel', value: '**?**', inline: true },
      { name: '- Kategorie', value: '**?**', inline: true },
      { name: '- Zuschauer', value: '**0**', inline: true }
    )
    .setColor('Red')
    .setFooter({ text: 'Zuletzt aktualisiert' })
    .setTimestamp();
}

// Embed für Live-Status (Stream läuft)
function createLiveEmbed(stream, guild) {
  return new EmbedBuilder()
    .setAuthor({ name: 'Red3405 Ankündigung', iconURL: guild.iconURL() || undefined })
    .setTitle(`${stream.user_name} streamt!`)
    .setURL(`https://twitch.tv/${stream.user_name}`)
    .addFields(
      { name: '- Titel', value: stream.title || 'Kein Titel', inline: true },
      { name: '- Kategorie', value: stream.game_name || 'Keine Angabe', inline: true },
      { name: '- Zuschauer', value: stream.viewer_count.toString(), inline: true }
    )
    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchconfig.twitchUser}-640x360.jpg?${Date.now()}`)
    .setColor('Purple')
    .setFooter({ text: 'Zuletzt aktualisiert' })
    .setTimestamp();
}

// Erzeugt den Link-Button zum Twitch-Stream
function createButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(`🔗 Twitch: ${twitchconfig.twitchUser}`)
      .setStyle(ButtonStyle.Link)
      .setURL(`https://twitch.tv/${twitchconfig.twitchUser}`)
  );
}

// Hauptfunktion: Sendet oder aktualisiert die Twitch-Status-Nachricht
async function updateTwitchStatus(client, guild) {
  const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchconfig.twitchUser}`, {
    headers: {
      'Client-ID': twitchconfig.twitchClientId,
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) throw new Error(`Twitch API Fehler: ${res.status} ${res.statusText}`);

  const data = await res.json();
  const stream = data.data && data.data.length > 0 ? data.data[0] : null;

  // Kanal aus twitchconfig holen
  const channel = await client.channels.fetch(twitchconfig.channelId);
  if (!channel || !channel.isTextBased()) throw new Error('Konnte Kanal nicht finden oder ist kein Textkanal.');

  const embed = stream ? createLiveEmbed(stream, guild) : createOfflineEmbed(guild);

  let message;

  if (statusMessageId) {
    try {
      // Existierende Nachricht holen und aktualisieren
      message = await channel.messages.fetch(statusMessageId);
      await message.edit({ embeds: [embed], components: [createButton()] });
    } catch {
      // Falls Nachricht nicht gefunden wird, neu senden
      message = await channel.send({ embeds: [embed], components: [createButton()] });
      statusMessageId = message.id;
      saveStatusMessageId(statusMessageId);
    }
  } else {
    // Nachricht noch nicht vorhanden => neu senden
    message = await channel.send({ embeds: [embed], components: [createButton()] });
    statusMessageId = message.id;
    saveStatusMessageId(statusMessageId);
  }
}

// Nachricht-ID speichern, ohne die anderen twitchconfig-Keys zu verlieren
function saveStatusMessageId(messageId) {
  try {
    // Aktuelle Daten laden
    let currentData = {};
    if (fs.existsSync(twitchStatusPath)) {
      currentData = JSON.parse(fs.readFileSync(twitchStatusPath, 'utf-8'));
    }
    // statusMessageId updaten
    currentData.statusMessageId = messageId;
    // Zurückschreiben
    fs.writeFileSync(twitchStatusPath, JSON.stringify(currentData, null, 2));
  } catch (err) {
    console.error('Fehler beim Speichern der statusMessageId:', err);
  }
}
