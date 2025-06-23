const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

async function createTabelleEmbed() {
  const allTeams = await Team.find({ league: 'Pro League' });
  const teamMap = new Map(allTeams.map(t => [t.name.trim(), t.toObject()]));

  for (const name of proLeagueTeams) {
    if (!teamMap.has(name)) {
      teamMap.set(name, {
        name,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      });
    }
  }

  const proLeagueData = Array.from(teamMap.values())
    .map(t => {
      t.goalDifference = t.goalsFor - t.goalsAgainst;
      t.points = (t.won * 3) + t.draw;
      return t;
    })
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

  const description = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n` +
    proLeagueData.map((t, i) => {
      const platz = (i + 1).toString().padStart(2, ' ');
      return `┃ **${platz}.** ${t.name.padEnd(15)} | Sp: ${t.played.toString().padStart(2)} | S: ${t.won.toString().padStart(2)} | U: ${t.draw.toString().padStart(2)} | N: ${t.lost.toString().padStart(2)} | T: ${t.goalsFor.toString().padStart(2)} | GT: ${t.goalsAgainst.toString().padStart(2)} | TD: ${t.goalDifference.toString().padStart(3)} | Pkte: ${t.points.toString().padStart(3)} `;
    }).join('\n') +
    `\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  return new EmbedBuilder()
    .setTitle('🏆 Pro League Tabelle')
    .setDescription(description || 'Keine Daten vorhanden')
    .setColor(0xFFD700)
    .setFooter({ text: 'Zuletzt aktualisiert' })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-system')
    .setDescription('Zeigt die Fußball-Übersicht an'),

  async execute(interaction) {
    await interaction.deferReply();

    const overviewEmbed = new EmbedBuilder()
      .setTitle('⚽ » Fußball Übersicht')
      .setDescription(
        'Die **Pro League** ist die höchste Spielklasse in unserem Fußball-Universum. Hier treffen die besten Mannschaften aufeinander, um Ruhm, Ehre und den begehrten Meistertitel zu kämpfen. Nur die stärksten Teams schaffen es in diese Liga – hier zählen Taktik, Teamgeist und Strategie.\n\n' +
        '- 💥 » **Spannende Matches** mit Live-Statistiken\n' +
        '- 🏆 » **Kampf um den Meistertitel** unter den besten Teams\n' +
        '- 📊 » **Detaillierte Spielerwerte** und Teamdaten\n\n' +
        'Klicke unten, um die aktuelle Tabelle einzublenden.'
      )
      .setColor('Blurple');

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tabelle')
        .setLabel('📊 Tabelle anzeigen')
        .setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.followUp({
      embeds: [overviewEmbed],
      components: [buttonRow],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Nur du darfst diesen Button verwenden.', ephemeral: true });
      }

      if (i.customId === 'tabelle') {
        const tabelleEmbed = await createTabelleEmbed();
        await i.update({ embeds: [tabelleEmbed], components: [] });
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (err) {
        console.error('Fehler beim Entfernen der Buttons:', err);
      }
    });
  }
};

