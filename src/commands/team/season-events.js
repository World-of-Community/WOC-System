const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cron = require('node-cron');
const { EventStats } = require('../../../Datenbank/eventstats'); // Deine Datenbank-Collection

let cronInitialized = false;
let activeMessage; 
let aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('» Zeigt die aktuellen Season-Events an. 🧡')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {

    // === Top 3 Spieler aus der Datenbank holen ===
    async function getTop3(eventName) {
      const stats = await EventStats.find({ eventType: eventName })
        .sort({ count: -1 })
        .limit(3);

      if (!stats.length) return '> Noch keine Sammler vorhanden. 😢';

      const lines = stats.map((entry, i) => {
        const medal = ['🥇', '🥈', '🥉'][i];
        return `${medal} × <@${entry.userId}>\n» **${entry.count}x gesammelt**`;
      });

      return lines.join('\n');
    }

    // === Embed bauen ===
    async function buildEmbed() {
      let bestListText = '> Kein aktives Event.';
      if (aktuellesEvent && aktuellesEvent !== 'Aktuell findet kein "Season-Event" statt!') {
        bestListText = await getTop3(aktuellesEvent);
      }

      return new EmbedBuilder()
        .setTitle('🧡 Season-Events 🧡')
        .setDescription(`> **Aktuelles Event:**\n\`\`\`${aktuellesEvent}\`\`\`\n\n> 🏆 **Leaderboard - ${aktuellesEvent}**\n${bestListText}`)
        .setColor('Blurple')
        .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png')
        .setFooter({ text: `» ${interaction.guild.name} | Bleibt Gesund 🧡`, iconURL: interaction.guild.iconURL() });
    }

    // === Buttons für Events ===
    const firstRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('easter_event').setLabel('🐇 » Ostern').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('halloween_event').setLabel('🎃 » Halloween').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('christmas_event').setLabel('🎄 » Weihnachten').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('newyear_event').setLabel('🎆 » Silvester').setStyle(ButtonStyle.Primary),
    );

    const secondRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('collect_event')
        .setLabel('🎁 » Eventitem einsammeln')
        .setStyle(ButtonStyle.Success)
    );

    // === Embed senden ===
    const SeasonEmbed = await buildEmbed();
    await interaction.reply({ content: '> `✅` » Das Season-Embed wurde erfolgreich gesendet.', ephemeral: true });
    activeMessage = await interaction.channel.send({ embeds: [SeasonEmbed], components: [firstRow, secondRow] });

    // === Cronjob für tägliche Aktualisierung ===
    if (!cronInitialized) {
      cron.schedule('0 0 * * *', async () => {
        const now = new Date();
        aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

        // eventEmbeds muss definiert sein; Beispiel: eventName → { startDate, endDate, embed }
        for (const [key, details] of Object.entries(eventEmbeds)) {
          const startDate = new Date(details.startDate);
          const endDate = new Date(details.endDate);

          if (now >= startDate && now <= endDate) {
            aktuellesEvent = details.embed.data.title;
            break;
          }
        }

        if (activeMessage) {
          try {
            const newEmbed = await buildEmbed();
            await activeMessage.edit({ embeds: [newEmbed] });
          } catch (error) {
            console.error('Fehler beim Aktualisieren des Embeds:', error);
          }
        }
      });

      cronInitialized = true;
    }
  },
};

//const eventEmbeds = {
//  ostern: {
//    embed: new EmbedBuilder()
//      .setTitle('🌸 Oster-Event 🌸')
//      .setDescription('**Dieses Event startet zwischen März und April!**')
//      .setColor('Green'),
//    startDate: '2024-03-01T00:00:00Z',
//    endDate: '2024-04-30T23:59:59Z',
//  },
//  halloween: {
//    embed: new EmbedBuilder()
//      .setTitle('🎃 Halloween-Event 🎃')
//      .setDescription('**Dieses Event findet zwischen dem 27. Oktober und dem 2. November statt!**')
//      .setColor('Orange'),
//    startDate: '2024-10-27T00:00:00Z',
//    endDate: '2024-11-02T23:59:59Z',
//  },
//  weihnachten: {
//    embed: new EmbedBuilder()
//      .setTitle('🎄 Weihnachts-Event 🎄')
//      .setDescription('**Dieses Event findet zwischen dem 20. und 26. Dezember statt!**')
//      .setColor('Green'),
//    startDate: '2024-12-20T00:00:00Z',
//    endDate: '2024-12-26T23:59:59Z',
//  },
//  silvester: {
//    embed: new EmbedBuilder()
//      .setTitle('🎆 Silvester-Event 🎆')
//      .setDescription('**Dieses Event findet zwischen dem 27. Dezember und dem 2. Januar statt!**')
//      .setColor('Blue'),
//    startDate: '2024-12-27T00:00:00Z',
//    endDate: '2024-01-02T23:59:59Z',
//  },
//};
