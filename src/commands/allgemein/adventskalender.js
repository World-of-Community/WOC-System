const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

// Anpassbare Buttons
const buttonConfig = {
  1: { label: '1🎁', style: ButtonStyle.Primary },
  2: { label: '2🌨️', style: ButtonStyle.Primary },
  3: { label: '3🎄', style: ButtonStyle.Primary },
  4: { label: '4⛄', style: ButtonStyle.Primary },
  5: { label: '5⭐', style: ButtonStyle.Primary },
  6: { label: '6❄️', style: ButtonStyle.Primary },
  7: { label: '7✨', style: ButtonStyle.Primary },
  8: { label: '8🎄', style: ButtonStyle.Primary },
  9: { label: '9☃️', style: ButtonStyle.Primary },
  10: { label: '10🎁', style: ButtonStyle.Primary },
  11: { label: '11⭐', style: ButtonStyle.Primary },
  12: { label: '12❄️', style: ButtonStyle.Primary },
  13: { label: '13🌨️', style: ButtonStyle.Primary },
  14: { label: '14🎄', style: ButtonStyle.Primary },
  15: { label: '15⭐', style: ButtonStyle.Primary },
  16: { label: '16✨', style: ButtonStyle.Primary },
  17: { label: '17❄️', style: ButtonStyle.Primary },
  18: { label: '18🎄', style: ButtonStyle.Primary },
  19: { label: '19🧸', style: ButtonStyle.Primary },
  20: { label: '20🦌', style: ButtonStyle.Primary },
  21: { label: '21✨', style: ButtonStyle.Primary },
  22: { label: '22🎉', style: ButtonStyle.Primary },
  23: { label: '23🎁', style: ButtonStyle.Primary },
  24: { label: '24🎅', style: ButtonStyle.Primary },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adventskalender')
    .setDescription('» Schickt den Adventskalender. 🎁'),

  async execute(interaction) {
    const currentDay = new Date().getDate();
    const maxDay = 24;

    if (interaction.isChatInputCommand()) {
      // Buttons erstellen
      const rows = [];
      let currentRow = new ActionRowBuilder();
      
      for (let i = 1; i <= maxDay; i++) {
        const buttonData = buttonConfig[i] || {}; // Standardwerte für Button
        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`advent_${i}`)
            .setLabel(buttonData.label || i.toString()) // Button-Label anpassen
            .setStyle(buttonData.style || ButtonStyle.Primary) // Button-Style anpassen
            .setDisabled(i > currentDay) // Zukünftige Tage deaktivieren
        );

        // Wenn 5 Buttons in der Reihe sind, füge sie der rows-Liste hinzu und starte eine neue Reihe
        if (currentRow.components.length === 5) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder(); // Neue Reihe starten
        }
      }

      // Füge die letzte Reihe hinzu, falls sie weniger als 5 Buttons enthält
      if (currentRow.components.length > 0) {
        rows.push(currentRow);
      }

      // Adventskalender Embed erstellen
      const Adventskalender = new EmbedBuilder()
        .setTitle('🎄 Adventskalender')
        .setDescription(`Klicke auf einen Tag, um deine Belohnung zu erhalten!\n\nHeute ist der **${currentDay}. Dezember**.`)
        .setColor('Green')
        .setFooter({ text: `${interaction.guild.name} wünscht euch Frohe Weihnachten!`, iconURL: `${interaction.guild.iconURL()}` });

      // Sende Embed mit Buttons
      await interaction.deferReply({ ephemeral: true }); // Antwort verzögern
      await interaction.channel.send({ embeds: [Adventskalender], components: rows });
      await interaction.editReply({ content: '> ✅ » Der Adventskalender wurde erfolgreich gesendet.', ephemeral: true });
    }
  },
};
