const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spielersuche')
    .setDescription('Startet das automatische Spielersuche-System (alle 24h)'),

  async execute(interaction) {
    await interaction.reply({ content: '> `✅` »  Das Spielersuche-System wurde gestartet und postet nun alle 24 Stunden eine neue Nachricht.', ephemeral: true });

    const channel = interaction.channel;

    async function sendeSpielersuche() {
      const rollen = '<@&1259972154963918858> <@&1303652117487157300> <@&1263620833423654942>';

      const SpielersucheEmbed = new EmbedBuilder()
        .setTitle('🎮 Spielersuche System')
        .setDescription(
          `Hier kannst du deinen Spielpartner finden, benutze \`/game <rolle>\` und finde deinen Spielpartner.\n\n` +
          `Server Spielmodi\n\n`
          `- <@&1259972154963918858>\n` +
          `- <@&1303652117487157300>\n` +
          `- <@&1263620833423654942>\n\n` +
          `Für erweiterte Spielersuche\n\n` +
          `- <@&1232072165654794281>\n` +
          `- <@&1232066510554529905>\n` +
          `- <@&1232066545492955136>\n` +
          `- <@&1232066588216135880>\n` +
          `- <@&1232066657896108082>\n` +
          `- <@&1273369483951734866>\n` +
          `- <@&1232066632491208704>\n` +
          `- <@&1232070141127426058>`
        )
        .setColor('Blurple')

      const message = await channel.send({ embeds: [SpielersucheEmbed], });

      setTimeout(async () => {
        try {
          if (message.deletable) await message.delete();
        } catch (err) {
          console.error('❌ Fehler beim Löschen:', err);
        }

        sendeSpielersuche(); // Wiederholen
      }, 24 * 60 * 60 * 1000); // 24 Stunden
    }

    sendeSpielersuche(); // Starte Schleife
  }
};

/*
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spielersuche')
    .setDescription('» Aktiviert das Spielersuche-System')
    .addRoleOption(option =>
      option.setName('rollen')
        .setDescription('Welche Rolle soll gepingt werden?')
        .setRequired(true)
    .addIntegerOption(option =>
      option.setName('anzahl')
        .setDescription('Wie viele Mitspieler?')
        .setRequired(true))
    ),

  async execute(interaction) {
    const rollen = interaction.options.getRole('rollen');
    const anzahl = interaction.options.getInteger('anzahl');

    const embed = new EmbedBuilder()
      .setTitle('🎮 Spielersuche gestartet!')
      .setDescription(`**Spiel:** ${game}\n**Gesuchte Spieler:** ${anzahl}\n**Wer kann mitspielen?**`)
      .addFields({ name: 'Erstellt von', value: `<@${interaction.user.id}>`, inline: true })
      .setColor('Blurple')
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('spielersuche_melden')
        .setLabel('Ich will mitspielen!')
        .setStyle(ButtonStyle.Success)
    );

    const message = await interaction.reply({ content: `${rollen}`, embeds: [embed], components: [button], fetchReply: true });

    // ⏲️ Lösche die Nachricht nach 24 Stunden
    setTimeout(async () => {
      try {
        await message.delete();
      } catch (error) {
        console.error('Fehler beim Löschen der Nachricht:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }
};
*/
