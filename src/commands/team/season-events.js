const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cron = require('node-cron');

let cronInitialized = false;
let activeMessage; 
let aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

const eventEmbeds = {
  ostern: {
    embed: new EmbedBuilder()
      .setTitle('`🌸` Oster-Event `🌸`')
      .setDescription('**Dieses Event startet erst zwischen den Monaten `März` und `April!`**')
      .setColor('Green'),
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-04-30T23:59:59Z',
  },
  ostern: {
    embed: new EmbedBuilder()
      .setTitle('🌸 Oster-Event 🌸')
      .setDescription('**Dieses Event startet erst zwischen den Monaten März und April!**')
      .setColor('Green'),
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-04-30T23:59:59Z',
  },
  halloween: {
    embed: new EmbedBuilder()
      .setTitle('🎃 Halloween-Event 🎃')
      .setDescription('**Dieses Event findet erst zwischen dem 27.Oktober und dem 02.November statt!**')
      .setColor('Orange'),
    startDate: '2024-10-27T00:00:00Z',
    endDate: '2024-11-02T23:59:59Z',
  },
  weihnachten: {
    embed: new EmbedBuilder()
      .setTitle('🎄 Weihnachts-Event 🎄')
      .setDescription('**Dieses Event findet erst zwischen dem 20.Dezember und dem 26.Dezember statt!**')
      .setColor('Green'),
    startDate: '2024-12-20T00:00:00Z',
    endDate: '2024-12-26T23:59:59Z',
  },
  silvester: {
    embed: new EmbedBuilder()
      .setTitle('🎆 Silvester-Event 🎆')
      .setDescription('**Dieses Event findet erst zwischen dem 27.Dezember und dem 02.Januar statt!**')
      .setColor('Blue'),
    startDate: '2024-12-27T00:00:00Z',
    endDate: '2024-01-02T23:59:59Z',
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('» Zeigt die aktuellen Season-Events an. 🧡')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const SeasonEmbed = new EmbedBuilder()
      .setTitle('🧡 Season-Events 🧡')
      .setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``)
      .setColor('Blurple')
      .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png')
      .setFooter({ text: `» ${interaction.guild.name} | Bleibt Gesund 🧡`, iconURL: interaction.guild.iconURL() });

    const firstRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('event-ostern').setLabel('🐇 » Ostern').setStyle(ButtonStyle.Primary),
      // Other buttons remain unchanged
    );

    const secondRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('collect-event-item').setLabel('🎁 » Eventitem einsammeln').setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ content: '> `✅` » Das Season-Embed wurde erfolgreich gesendet.', ephemeral: true });
    activeMessage = await interaction.channel.send({ embeds: [SeasonEmbed], components: [firstRow, secondRow] });

    // Cron-Job for Daily Updates
    if (!cronInitialized) {
      cron.schedule('0 0 * * *', () => {
        const now = new Date();
        aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

        for (const [key, details] of Object.entries(eventEmbeds)) {
          const startDate = new Date(details.startDate);
          const endDate = new Date(details.endDate);

          if (now >= startDate && now <= endDate) {
            aktuellesEvent = details.embed.data.title;
            SeasonEmbed.setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\``).setColor(details.embed.data.color);
            break;
          }
        }

        activeMessage.edit({ embeds: [SeasonEmbed] });
      });

      cronInitialized = true;
    }
  },

  async handleInteraction(interaction) {
    if (!interaction.isButton()) return;

    const eventKey = interaction.customId.replace('event-', '');

    if (eventEmbeds[eventKey]) {
      await interaction.reply({ embeds: [eventEmbeds[eventKey].embed], ephemeral: true });
    } else if (interaction.customId === 'collect-event-item') {
      const isEventActive = aktuellesEvent !== 'Aktuell findet kein "Season-Event" statt!';
      const eventItemEmbed = new EmbedBuilder()
        .setDescription(isEventActive ? '> `🎁` » Du hast ein Event-Item eingesammelt!' : '> `❌` » **Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!**')
        .setColor(isEventActive ? 'Green' : 'Red');

      await interaction.reply({ embeds: [eventItemEmbed], ephemeral: true });
    } else {
      await interaction.reply({ content: '> Unbekannte Aktion!', ephemeral: true });
    }
  },
};
