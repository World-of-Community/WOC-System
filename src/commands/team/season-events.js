const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cron = require('node-cron'); // Cron-Modul einbinden

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('» Zeigt die aktuellen Season-Events an. 🧡')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    let aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

    // Embeds für verschiedene Events
    const eventEmbeds = {
      ostern: {
        embed: new EmbedBuilder()
          .setTitle('🌸 Oster-Event 🌸')
          .setDescription('Feiere Ostern mit uns und sammle Ostereier!')
          .setColor('Green')
          .setImage('https://example.com/ostern.png'),
        startDate: '2024-04-01T00:00:00Z',
        endDate: '2024-04-30T23:59:59Z',
      },
      halloween: {
        embed: new EmbedBuilder()
          .setTitle('🎃 Halloween-Event 🎃')
          .setDescription('Das gruseligste Event des Jahres ist hier!')
          .setColor('Orange')
          .setImage('https://example.com/halloween.png'),
        startDate: '2024-10-01T00:00:00Z',
        endDate: '2024-10-31T23:59:59Z',
      },
      weihnachten: {
        embed: new EmbedBuilder()
          .setTitle('🎄 Weihnachts-Event 🎄')
          .setDescription('Genieße die festliche Zeit mit Geschenken und Überraschungen!')
          .setColor('Green')
          .setImage('https://example.com/weihnachten.png'),
        startDate: '2024-12-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      },
      silvester: {
        embed: new EmbedBuilder()
          .setTitle('🎆 Silvester-Event 🎆')
          .setDescription('Feiere den Jahreswechsel mit einem großen Feuerwerk!')
          .setColor('Blue')
          .setImage('https://example.com/silvester.png'),
        startDate: '2024-12-31T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      },
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

    // Cron-Job für tägliches Update um 0 Uhr
    cron.schedule('0 0 * * *', () => {
      const now = new Date();
      aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

      // Überprüfen, welches Event gerade aktiv ist
      for (const [key, details] of Object.entries(eventEmbeds)) {
        const startDate = new Date(details.startDate);
        const endDate = new Date(details.endDate);

        if (now >= startDate && now <= endDate) {
          aktuellesEvent = details.embed.data.title;
          SeasonEmbed.setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
            .setImage(details.embed.data.image.url)
            .setColor(details.embed.data.color);
          break;
        }
      }

      sentMessage.edit({ embeds: [SeasonEmbed] });
    });

    // Eventhandler für Buttons
    const collector = sentMessage.createMessageComponentCollector();

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.customId.startsWith('event-')) {
        const eventKey = buttonInteraction.customId.replace('event-', '');
        if (eventEmbeds[eventKey]) {
          await buttonInteraction.reply({ embeds: [eventEmbeds[eventKey].embed], ephemeral: true });
        }
      } else if (buttonInteraction.customId === 'collect-event-item') {
        await buttonInteraction.reply({ content: '> `🎁` » Du hast ein Event-Item eingesammelt!', ephemeral: true });
      }
    });
  },
};
