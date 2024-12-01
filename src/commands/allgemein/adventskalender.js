const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Advent = require('./models/Advent'); // Datenbank-Modell importieren

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adventskalender')
    .setDescription('» Öffne deinen Adventskalender! 🎁'),

  async execute(interaction) {
    const currentDay = new Date().getDate();
    const maxDay = 24;

    // Datenbankabfrage
    let userData = await Advent.findOne({ userId: interaction.user.id });
    if (!userData) {
      userData = await Advent.create({ userId: interaction.user.id });
    }

    // Kalender-Buttons erstellen
    const row = new ActionRowBuilder();
    for (let i = 1; i <= maxDay; i++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`advent_${i}`)
          .setLabel(i.toString())
          .setStyle(userData.openedDays.includes(i) ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(i > currentDay)
      );
    }

    const embed = new EmbedBuilder()
      .setTitle('🎄 Adventskalender 🎁')
      .setDescription('Klicke auf den Tag, um deine Belohnung zu erhalten!')
      .setFooter({ text: `Heute ist der ${currentDay}. Dezember` });

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
