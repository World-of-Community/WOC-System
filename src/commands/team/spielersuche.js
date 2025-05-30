const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spielersuche')
    .setDescription('» Aktiviert das Spielersuche-System')
    .addStringOption(option =>
      option.setName('spiel')
        .setDescription('Welches Spiel?')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('anzahl')
        .setDescription('Wie viele Mitspieler?')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rollen')
        .setDescription('Welche Rolle soll gepingt werden?')
        .setRequired(true)
    ),

  async execute(interaction) {
    const game = interaction.options.getString('spiel');
    const anzahl = interaction.options.getInteger('anzahl');
    const rollen = interaction.options.getRole('rollen');

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

    // ⏲️ Lösche die Nachricht nach 5 Sekunden
    setTimeout(async () => {
      try {
        await message.delete();
      } catch (error) {
        console.error('Fehler beim Löschen der Nachricht:', error);
      }
    }, 5000);
  }
};
