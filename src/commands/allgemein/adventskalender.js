const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { setTimeout } = require('timers/promises');

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

    // Buttons erstellen
    const rows = [];
    let currentRow = new ActionRowBuilder();
    
    for (let i = 1; i <= maxDay; i++) {
      const buttonData = buttonConfig[i] || {};
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`advent_${i}`)
          .setLabel(buttonData.label || i.toString())
          .setStyle(buttonData.style || ButtonStyle.Primary)
          .setDisabled(i > currentDay) // Zukünftige Tage deaktivieren
      );

      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }
    if (currentRow.components.length > 0) rows.push(currentRow);

    // Adventskalender Embed erstellen
    const Adventskalender = new EmbedBuilder()
      .setTitle('🎄 Adventskalender')
      .setDescription(`» Klicke auf einen Tag, um deine Belohnung zu erhalten!\n\nHeute ist der **${currentDay}. Dezember**.`)
      .setColor('Green')
      .setFooter({ text: `» ${interaction.guild.name} wünscht euch Frohe Weihnachten!`, iconURL: `${interaction.guild.iconURL()}` });

    await interaction.reply({ content: '> \`✅\` » Der Adventskalender wurde erfolgreich gesendet.', ephemeral: true });
    await interaction.channel.send({ embeds: [Adventskalender], components: rows });

    // Täglich um Mitternacht
cron.schedule('44 0 * * *', async () => {
  const currentDay = new Date().getDate();
  const maxDay = 24;

  // IDs der Zielkanäle und Nachrichten
  const channelId = '1312772215791685743'; // Ersetze durch deine Kanal-ID
  const messageId = '1314368948229111819'; // Ersetze durch die Nachricht-ID des Embeds

  try {
    // Kanal und Nachricht abrufen
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error('Kanal nicht gefunden!');

    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error('Nachricht nicht gefunden!');

    // Neue Button-Logik
    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 1; i <= maxDay; i++) {
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`advent_${i}`)
          .setLabel(i.toString())
          .setStyle(ButtonStyle.Primary)
          .setDisabled(i > currentDay) // Zukünftige Tage deaktivieren
      );

      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }
    if (currentRow.components.length > 0) rows.push(currentRow);

    // Aktualisiertes Embed
    const updatedEmbed = EmbedBuilder.from(message.embeds[0]);

    // Nachricht bearbeiten
    await message.edit({ embeds: [updatedEmbed], components: rows });
    console.log(`Adventskalener-Embed erfolgreich aktualisiert: Heute ist der ${currentDay}. Dezember`);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Embeds:', error);
  }
});
  },
};
