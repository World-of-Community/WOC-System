const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cron = require('node-cron');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('» Zeigt die aktuellen Season-Events an. 🧡')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    let aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

    const eventEmbeds = {
      ostern: {
        embed: new EmbedBuilder()
          .setTitle('`🌸` Oster-Event `🌸`')
          .setDescription('**Dieses Event startet erst zwischen den Monaten `März` und `April!`**')
          .setColor('Green'),
        startDate: '2024-03-01T00:00:00Z',
        endDate: '2024-04-30T23:59:59Z',
        rewards: { type: 'coins', value: 150 },
      },
      halloween: {
        embed: new EmbedBuilder()
          .setTitle('`🎃` Halloween-Event `🎃`')
          .setDescription('**Dieses Event findet erst zwischen dem `27.Oktober` und dem `02.November` statt!**')
          .setColor('Orange'),
        startDate: '2024-10-27T00:00:00Z',
        endDate: '2024-11-02T23:59:59Z',
        rewards: { type: 'role', value: '123456789012345678' }, // Beispiel-Rollen-ID
      },
      default: {
        embed: new EmbedBuilder()
          .setDescription('**Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!**')
          .setColor('Red'),
        rewards: null,
      },
    };

    const SeasonEmbed = new EmbedBuilder()
      .setTitle('🧡 Season-Events 🧡')
      .setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
      .setColor('Blurple')
      .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png')
      .setFooter({ text: `» ${interaction.guild.name} | Bleibt Gesund 🧡`, iconURL: interaction.guild.iconURL() });

    const firstRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('event-ostern').setLabel('🐇 » Ostern').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('event-halloween').setLabel('🎃 » Halloween').setStyle(ButtonStyle.Primary)
    );

    const secondRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('collect-event-item').setLabel('🎁 » Eventitem einsammeln').setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ content: '> `✅` » Das Season-Embed wurde erfolgreich gesendet.', ephemeral: true });
    const sentMessage = await interaction.channel.send({ embeds: [SeasonEmbed], components: [firstRow, secondRow] });

    cron.schedule('0 0 * * *', () => {
      const now = new Date();
      aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

      for (const [key, details] of Object.entries(eventEmbeds)) {
        const startDate = new Date(details.startDate);
        const endDate = new Date(details.endDate);

        if (now >= startDate && now <= endDate) {
          aktuellesEvent = details.embed.data.title;
          SeasonEmbed.setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
            .setImage(details.embed.data.image?.url || null)
            .setColor(details.embed.data.color);
          break;
        }
      }

      sentMessage.edit({ embeds: [SeasonEmbed] });
    });

    const collector = sentMessage.createMessageComponentCollector();

    collector.on('collect', async (buttonInteraction) => {
      const eventKey = buttonInteraction.customId.replace('event-', '');

      if (eventEmbeds[eventKey]) {
        const eventDetails = eventEmbeds[eventKey];
        const now = new Date();
        const startDate = new Date(eventDetails.startDate);
        const endDate = new Date(eventDetails.endDate);

        if (now >= startDate && now <= endDate) {
          const eventRewards = eventDetails.rewards;
          let rewardMessage;

          switch (eventRewards.type) {
            case 'coins':
              rewardMessage = `> \`🎉\` » Du hast **${eventRewards.value} Coins** für das Event **${eventKey}** erhalten!`;
              break;

            case 'role':
              const role = interaction.guild.roles.cache.find(r => r.id === eventRewards.value);
              if (role) {
                await buttonInteraction.member.roles.add(role);
                rewardMessage = `> \`🎉\` » Du hast die Rolle **<@&${role.id}>** für das Event **${eventKey}** erhalten!`;
              } else {
                rewardMessage = '> \`❗\` » Die Rolle wurde nicht gefunden. Bitte melde dich im Support.';
              }
              break;

            default:
              rewardMessage = `> \`🎁\` » Keine Belohnung für das Event **${eventKey}** verfügbar.`;
          }

          await buttonInteraction.reply({ content: rewardMessage, ephemeral: true });
        } else {
          
          const Eventitem = new EmbedBuilder()
            .setDescription('> \`❌\` » Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!')
            .setColor('Red')

            await interaction.reply({ embeds: [Eventitem], ephemeral: true });
        }
      } else if (buttonInteraction.customId === 'collect-event-item') {
        await buttonInteraction.reply({ content: '> \`🎁\` » Du hast ein Event-Item eingesammelt!', ephemeral: true });
      }
    });
  },
};
