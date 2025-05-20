const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fetch = require('node-fetch');
const config = require('../../config.json'); // Pfad zu deiner config
let accessToken = '';
let statusMessageId = null;
let isLive = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twitch-status')
    .setDescription('Sendet oder aktualisiert den Twitch-Status im Kanal'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      await getAccessToken();
      await checkStream(interaction.client);
      await interaction.editReply({ content: '✅ Twitch-Status erfolgreich gesendet oder aktualisiert.' });
    } catch (err) {
      console.error('Fehler beim Senden des Twitch-Status:', err);
      await interaction.editReply({ content: '❌ Fehler beim Senden des Twitch-Status.' });
    }
  }
};

// Auth holen
async function getAccessToken() {
  const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${config.twitchClientId}&client_secret=${config.twitchClientSecret}&grant_type=client_credentials`, {
    method: 'POST'
  });
  const data = await res.json();
  accessToken = data.access_token;
}

// Embeds & Button
function createOfflineEmbed() {
  return new EmbedBuilder()
    .setTitle('Offline!')
    .setURL(`https://twitch.tv/${config.twitchUser}`)
    .addFields(
      { name: '- Titel', value: '?', inline: false },
      { name: '- Kategorie', value: '?', inline: false },
      { name: '- Zuschauer', value: '0', inline: false }
    )
    .setColor('Red')
    .setTimestamp();
}

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

function createButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Zum Stream')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://twitch.tv/${config.twitchUser}`)
  );
}

// Hauptlogik
async function checkStream(client) {
  const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${config.twitchUser}`, {
    headers: {
      'Client-ID': config.twitchClientId,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await res.json();
  const stream = data.data[0];
  const channel = await client.channels.fetch(config.channelId);
  if (!channel) throw new Error('Kanal nicht gefunden');

  if (!statusMessageId) {
    // Neue Nachricht senden
    const offlineEmbed = createOfflineEmbed();
    const liveEmbed = createOfflineEmbed();
    const message = await channel.send({
      embeds: [offlineEmbed, liveEmbed],
      components: [createButton()]
    });
    statusMessageId = message.id;
  }

  const message = await channel.messages.fetch(statusMessageId);

  if (stream) {
    isLive = true;
    const offlineEmbed = createOfflineEmbed();
    const liveEmbed = createLiveEmbed(stream);
    await message.edit({
      embeds: [offlineEmbed, liveEmbed],
      components: [createButton()]
    });
  } else {
    isLive = false;
    const offlineEmbed = createOfflineEmbed();
    const liveEmbed = createOfflineEmbed();
    await message.edit({
      embeds: [offlineEmbed, liveEmbed],
      components: [createButton()]
    });
  }
}
