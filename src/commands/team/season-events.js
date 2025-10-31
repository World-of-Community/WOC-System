const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cron = require('node-cron');
const EventItem = require('../../../Datenbank/eventitems'); // Dein Schema

let cronInitialized = false;
let activeMessage;
let aktuellesEvent = null; // Start ohne Event

// Event-spezifische Einstellungen
const eventEmbeds = {
  halloween_event: {
    title: 'css Halloween',
    emoji: '`🎃`',
    color: 0x0000FF, // blau
    startDate: '2025-10-27T00:00:00',
    endDate: '2025-11-02T23:59:59',
    image: 'https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png',
    itemName: 'Kürbisse'
  },
  easter_event: {
    title: 'diff Ostern',
    emoji: '`🐇`',
    color: 0x00FF00, // grün
    startDate: '2025-04-01T00:00:00',
    endDate: '2025-04-02T23:59:59',
    image: 'https://cdn.discordapp.com/attachments/1269339771420016722/123456789012345678/ostereier.png',
    itemName: 'Ostereier'
  },
  christmas_event: {
    title: '- Weihnachten',
    emoji: '`🎄`',
    color: 0xFF0000, // rot
    startDate: '2025-12-20T00:00:00',
    endDate: '2025-12-26T23:59:59',
    image: 'https://cdn.discordapp.com/attachments/1269339771420016722/123456789012345678/weihnachtsbaeume.png',
    itemName: 'Weihnachtsbäume'
  },
  newyear_event: {
    title: 'fix Silvester',
    emoji: '`🎆`',
    color: 0xFFA500, // orange
    startDate: '2025-12-27T00:00:00',
    endDate: '2026-01-02T23:59:59',
    image: 'https://cdn.discordapp.com/attachments/1269339771420016722/123456789012345678/raketen.png',
    itemName: 'Raketen'
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-events')
    .setDescription('» Zeigt die aktuellen Season-Events an. 🧡')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {

    // === Top 3 Spieler aus der Datenbank holen ===
    async function getTop3(eventType, itemName) {
      const stats = await EventItem.find({ eventType })
        .sort({ amount: -1 })
        .limit(3);

      if (!stats.length) return '> Noch keine Sammler aktiv. `😢`';

      return stats.map((entry, i) => {
        const medal = ['`🥇`', '`🥈`', '`🥉`'][i];
        return `${medal} × <@${entry.userId}>\n» **${entry.amount} ${itemName} gesammelt**`;
      }).join('\n');
    }

    // === Embed bauen ===
    async function buildEmbed() {
      let settings = null;
      let description = '> __Aktuelles Event:__\n\`\`\`# Aktuell findet kein "Season-Event" statt!\`\`\`';
      const defaultImage = 'https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png';

      if (aktuellesEvent) {
        settings = eventEmbeds[aktuellesEvent];
        if (settings) {
          const bestListText = await getTop3(aktuellesEvent, settings.itemName);
          description = `> **Aktuelles Event:** ${settings.emoji}\n\`\`\`${settings.title}\`\`\`\n\n> \`🏆\` **Leaderboard - ${settings.title}**\n${bestListText}`;
        }
      }

      return new EmbedBuilder()
        .setTitle('`🧡` Season-Events `🧡`')
        .setDescription(description)
        .setColor(settings ? settings.color : 0x808080) // fallback auf Grau
        .setImage(settings ? settings.image : defaultImage)
        .setFooter({ text: `» ${interaction.guild.name} | Bleibt Gesund 🧡` });
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

    // === Cronjob für minütliche Aktualisierung ===
    if (!cronInitialized) {
      cron.schedule('* * * * *', async () => {
        const now = new Date();
        let newEvent = null;

        for (const [key, details] of Object.entries(eventEmbeds)) {
          const startDate = new Date(details.startDate);
          const endDate = new Date(details.endDate);

          if (now >= startDate && now <= endDate) {
            newEvent = key;
            break;
          }
        }

        if (newEvent !== aktuellesEvent) {
          aktuellesEvent = newEvent;
          if (activeMessage) {
            try {
              const newEmbed = await buildEmbed();
              await activeMessage.edit({ embeds: [newEmbed] });
            } catch (error) {
              console.error('Fehler beim Aktualisieren des Embeds:', error);
            }
          }
        }
      });

      cronInitialized = true;
    }
  },
};
