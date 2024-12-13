const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('» Zeigt die aktuellen Season-Events an. 🧡')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    let aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

    // Embeds für verschiedene Events
    const eventEmbeds = {
      ostern: new EmbedBuilder()
        .setTitle('🌸 Oster-Event 🌸')
        .setDescription('Feiere Ostern mit uns und sammle Ostereier!')
        .setColor('Green')
        .setImage('https://example.com/ostern.png'),

      halloween: new EmbedBuilder()
        .setTitle('🎃 Halloween-Event 🎃')
        .setDescription('Das gruseligste Event des Jahres ist hier!')
        .setColor('Orange')
        .setImage('https://example.com/halloween.png'),

      weihnachten: new EmbedBuilder()
        .setTitle('🎄 Weihnachts-Event 🎄')
        .setDescription('Genieße die festliche Zeit mit Geschenken und Überraschungen!')
        .setColor('Green')
        .setImage('https://example.com/weihnachten.png'),

      silvester: new EmbedBuilder()
        .setTitle('🎆 Silvester-Event 🎆')
        .setDescription('Feiere den Jahreswechsel mit einem großen Feuerwerk!')
        .setColor('Blue')
        .setImage('https://example.com/silvester.png'),
    };

    // Haupt-Embed
    const SeasonEmbed = new EmbedBuilder()
      .setTitle('🧡 Season-Events 🧡')
      .setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
      .setColor('Blurple')
      .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png')
      .setFooter({ text: `» ${interaction.guild.name} | Bleibt Gesund 🧡`, iconURL: interaction.guild.iconURL() });

    // Buttons
    const firstRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('event-ostern').setLabel('🐇 » Ostern').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('event-halloween').setLabel('🎃 » Halloween').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('event-weihnachten').setLabel('🎄 » Weihnachten').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('event-silvester').setLabel('🎆 » Silvester').setStyle(ButtonStyle.Secondary)
    );

    const secondRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('collect-event-item').setLabel('🎁 » Eventitem einsammeln').setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ content: '> `✅` » Das Season-Embed wurde erfolgreich gesendet.', ephemeral: true });
    const sentMessage = await interaction.channel.send({ embeds: [SeasonEmbed], components: [firstRow, secondRow] });

    // Eventhandler für Buttons
    const collector = sentMessage.createMessageComponentCollector();

    collector.on('collect', async (buttonInteraction) => {
      const eventKey = buttonInteraction.customId.replace('event-', '');
      if (eventEmbeds[eventKey]) {
        aktuellesEvent = eventKey.charAt(0).toUpperCase() + eventKey.slice(1);

        const updatedEmbed = new EmbedBuilder()
          .setTitle('🧡 Season-Events 🧡')
          .setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
          .setColor('Blurple')
          .setImage(eventEmbeds[eventKey].data.image.url)
          .setFooter({ text: `» ${interaction.guild.name} | Bleibt Gesund 🧡`, iconURL: interaction.guild.iconURL() });

        await buttonInteraction.update({ embeds: [updatedEmbed] });
      } else if (buttonInteraction.customId === 'collect-event-item') {
        await buttonInteraction.reply({ content: '> `🎁` » Du hast ein Event-Item eingesammelt!', ephemeral: true });
      }
    });
  }
};
