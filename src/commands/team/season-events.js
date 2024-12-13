const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('Zeigt die aktuellen Season-Events an'),

  async execute(interaction) {
    // Aktuelles Event setzen (kann dynamisch angepasst werden)
    const aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!'; // Beispiel: 'Halloween - 31. Oktober'

    const SeasonEmbed = new EmbedBuilder()
      .setTitle('💛 Season-Events 💛')
      .setDescription(`**Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
      .setColor('Blurple')
      .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png?ex=675dbbb7&is=675c6a37&hm=260c2aefd648ecdb6cd69ec1fcb0efbd1aa5c1aa3cc4964985702ae8a708b0ea&') // Optionales Bild
      .setFooter({ text: `» ${interaction.guild.name} | Bleibt Gesund 💛`, iconURL: `${interaction.guild.iconURL()}` });

    // Action Rows mit Buttons
    const firstRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('event-ostern')
        .setLabel('» Ostern')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('event-halloween')
        .setLabel('» Halloween')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('event-weihnachten')
        .setLabel('🎄 » Weihnachten')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('event-silvester')
        .setLabel('🎆 » Silvester')
        .setStyle(ButtonStyle.Secondary)
    );

    const secondRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('collect-event-item')
        .setLabel('Eventitem einsammeln')
        .setStyle(ButtonStyle.Success)
    );

    if (!interaction.isButton()) return;

  // Embeds für die jeweiligen Events
  const eventEmbeds = {
    'event-ostern': new EmbedBuilder()
      .setTitle('🌸 Ostern Event 🌸')
      .setDescription('Das Ostern-Event findet am **9. April** statt.')
      .setColor('Green')
      .setImage('https://example.com/easter-image.png') // Beispielbild
      .setFooter({ text: 'World Of Community | Frohe Ostern!' }),

    'event-halloween': new EmbedBuilder()
      .setTitle('🎃 Halloween Event 🎃')
      .setDescription('Das Halloween-Event findet am **31. Oktober** statt.')
      .setColor('Orange')
      .setImage('https://example.com/halloween-image.png')
      .setFooter({ text: 'World Of Community | Happy Halloween!' }),

    'event-weihnachten': new EmbedBuilder()
      .setTitle('🎄 Weihnachts-Event 🎄')
      .setDescription('Das Weihnachts-Event beginnt am **24. Dezember**.')
      .setColor('Red')
      .setImage('https://example.com/christmas-image.png')
      .setFooter({ text: 'World Of Community | Frohe Weihnachten!' }),

    'event-silvester': new EmbedBuilder()
      .setTitle('🎆 Silvester-Event 🎆')
      .setDescription('Das Silvester-Event findet am **31. Dezember** statt.')
      .setColor('Blue')
      .setImage('https://example.com/newyear-image.png')
      .setFooter({ text: 'World Of Community | Guten Rutsch ins neue Jahr!' }),
  };

  // Interaktion basierend auf Button-ID
  if (eventEmbeds[interaction.customId]) {
    // Neues Embed senden, wenn ein Event-Button gedrückt wird
    await interaction.reply({
      embeds: [eventEmbeds[interaction.customId]],
      ephemeral: true, // Nur für den klickenden User sichtbar
    });
  } else if (interaction.customId === 'collect-event-item') {
    // Eventitem einsammeln
    await interaction.reply({
      content: 'Du hast erfolgreich dein Eventitem eingesammelt!',
      ephemeral: true,
    });
  } else {
    // Unbekannter Button
    await interaction.reply({
      content: 'Unbekannter Button!',
      ephemeral: true,
    });
  }

    // Nachricht senden
    await interaction.reply({
      embeds: [embed],
      components: [firstRow, secondRow],
    });
  },
};
