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
  }}

//

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('Zeigt die aktuellen Season-Events an'),

  async execute(interaction) {
    let aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

    // Embeds für verschiedene Events
    const eventEmbeds = {
      ostern: new EmbedBuilder()
        .setTitle('🌸 Ostern-Event 🌸')
        .setDescription('Feiere Ostern mit uns und sammle Ostereier!')
        .setColor('Yellow')
        .setImage('https://example.com/ostern-image.png'),

      halloween: new EmbedBuilder()
        .setTitle('🎃 Halloween-Event 🎃')
        .setDescription('Das gruseligste Event des Jahres ist hier!')
        .setColor('Orange')
        .setImage('https://example.com/halloween-image.png'),

      weihnachten: new EmbedBuilder()
        .setTitle('🎄 Weihnachts-Event 🎄')
        .setDescription('Genieße die festliche Zeit mit Geschenken und Überraschungen!')
        .setColor('Green')
        .setImage('https://example.com/weihnachten-image.png'),

      silvester: new EmbedBuilder()
        .setTitle('🎆 Silvester-Event 🎆')
        .setDescription('Feiere den Jahreswechsel mit einem großen Feuerwerk!')
        .setColor('Blue')
        .setImage('https://example.com/silvester-image.png')
    };

    // Haupt-Embed
    const mainEmbed = new EmbedBuilder()
      .setTitle('💛 Season-Events 💛')
      .setDescription(`**Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
      .setColor('Blurple')
      .setImage('https://example.com/main-event-image.png')
      .setFooter({ text: 'World Of Community | Bleibt Gesund 💛' });

    // Buttons
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

    await interaction.reply({ embeds: [mainEmbed], components: [firstRow, secondRow] });

    const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (buttonInteraction) => {
      if (!buttonInteraction.isButton()) return;

      const eventKey = buttonInteraction.customId.replace('event-', '');
      if (eventEmbeds[eventKey]) {
        aktuellesEvent = eventKey.charAt(0).toUpperCase() + eventKey.slice(1);

        const updatedEmbed = new EmbedBuilder()
          .setTitle('💛 Season-Events 💛')
          .setDescription(`**Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
          .setColor('Blurple')
          .setImage(eventEmbeds[eventKey].data.image.url)
          .setFooter({ text: 'World Of Community | Bleibt Gesund 💛' });

        await buttonInteraction.update({ embeds: [updatedEmbed] });
      }
    });

    collector.on('end', () => {
      // Optional: Buttons deaktivieren, wenn der Collector endet
      firstRow.components.forEach((button) => button.setDisabled(true));
      secondRow.components.forEach((button) => button.setDisabled(true));
      interaction.editReply({ components: [firstRow, secondRow] });
    });
  }
};

