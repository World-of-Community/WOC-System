const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cron = require('node-cron');

let cronInitialized = false;
let activeMessage; 
let aktuellesEvent = 'Aktuell findet kein "Season-Event" statt!';

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

    await interaction.reply({ content: '> `✅` » Das Season-Embed wurde erfolgreich gesendet.', ephemeral: true });

    activeMessage = await interaction.channel.send({ embeds: [SeasonEmbed], components: [firstRow, secondRow] });

    if (!cronInitialized) {
      cron.schedule('0 0 * * *', async () => {
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

        if (activeMessage) {
          try {
            await activeMessage.edit({ embeds: [SeasonEmbed] });
          } catch (error) {
            console.error('Fehler beim Bearbeiten der Nachricht:', error);
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
