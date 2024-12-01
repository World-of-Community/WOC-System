const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Advent = require('./models/Advent'); // Datenbank-Modell

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adventskalender')
    .setDescription('» Öffne deinen Adventskalender! 🎁'),

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const currentDay = new Date().getDate();
      const maxDay = 24;

      // Datenbankabfrage
      let userData = await Advent.findOne({ userId: interaction.user.id });
      if (!userData) {
        userData = await Advent.create({ userId: interaction.user.id, openedDays: [] });
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

      return await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    if (interaction.isButton()) {
      const [type, day] = interaction.customId.split('_');
      if (type !== 'advent') return;

      const currentDay = new Date().getDate();

      if (parseInt(day) > currentDay) {
        return interaction.reply({ content: '> `❌` » Du kannst zukünftige Tage nicht öffnen!', ephemeral: true });
      }

      let userData = await Advent.findOne({ userId: interaction.user.id });
      if (!userData) {
        userData = await Advent.create({ userId: interaction.user.id, openedDays: [] });
      }

      if (userData.openedDays.includes(parseInt(day))) {
        return interaction.reply({ content: '> `❗` » Du hast diesen Tag bereits geöffnet!', ephemeral: true });
      }

      // Belohnung vergeben
      userData.openedDays.push(parseInt(day));
      await userData.save();

      // Belohnungslogik (z. B. Rolle, Punkte)
      const reward = `🎉 Du hast die Belohnung für den ${day}. Dezember erhalten!`;
      return interaction.reply({ content: reward, ephemeral: true });
    }
  },
};
