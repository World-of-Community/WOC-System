const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const advent = require("../../../Datenbank/adventdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adventskalender')
    .setDescription('» Öffne deinen Adventskalender! 🎁'),

  async execute(interaction) {
    // Kalender anzeigen
    if (interaction.isChatInputCommand()) {
      const currentDay = new Date().getDate();
      const maxDay = 24;

      // Buttons erstellen
      const rows = [];
      for (let i = 1; i <= maxDay; i += 5) {
        const row = new ActionRowBuilder();
        for (let j = i; j < i + 5 && j <= maxDay; j++) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`advent_${j}`)
              .setLabel(j.toString())
              .setStyle(ButtonStyle.Primary)
              .setDisabled(j > currentDay) // Zukünftige Tage deaktivieren
          );
        }
        rows.push(row);
      }

      // Embed erstellen
      const embed = new EmbedBuilder()
        .setTitle('🎄 Adventskalender 🎁')
        .setDescription(
          'Klicke auf einen Tag, um deine Belohnung zu erhalten!\n\n' +
          '🔒 Zukünftige Tage sind deaktiviert.\n\n' +
          `Heute ist der **${currentDay}. Dezember**.`
        )
        .setColor('#FF0000')
        .setFooter({ text: 'Frohe Weihnachten!' });

      // Antwort mit Embed und Buttons
      await interaction.reply({ embeds: [embed], components: rows, ephemeral: true });
    }

    // Button-Interaktion verarbeiten
    if (interaction.isButton() && interaction.customId.startsWith('advent_')) {
      const [, day] = interaction.customId.split('_');
      const currentDay = new Date().getDate();
      const dayNumber = parseInt(day);

      // Datenbank überprüfen oder initialisieren
      let userData = await Advent.findOne({ userId: interaction.user.id });
      if (!userData) {
        userData = await Advent.create({ userId: interaction.user.id, openedDays: [] });
      }

      // Validierung: Tag schon geöffnet?
      if (userData.openedDays.includes(dayNumber)) {
        return interaction.reply({ content: '> `❗` » Du hast diesen Tag bereits geöffnet!', ephemeral: true });
      }

      // Validierung: Zukünftige Tage
      if (dayNumber > currentDay) {
        return interaction.reply({ content: '> `❌` » Du kannst zukünftige Tage nicht öffnen!', ephemeral: true });
      }

      // Belohnung vergeben
      userData.openedDays.push(dayNumber);
      await userData.save();

      // Belohnungslogik (z. B. Punkte, Rolle)
      const reward = `🎉 Du hast die Belohnung für den **${dayNumber}. Dezember** erhalten!`;
      return interaction.reply({ content: reward, ephemeral: true });
    }
  },
};
