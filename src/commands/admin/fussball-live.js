const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  ComponentType,
  PermissionFlagsBits
} = require('discord.js');
const { Team, Match } = require('../../../Datenbank/fussballdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-live')
    .setDescription('Zeigt alle laufenden Spiele in Einzel- oder Konferenzmodus an.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const now = new Date();

    // Alle laufenden Spiele
    const liveMatches = await Match.find({
      date: { $lte: now },
      endDate: { $gte: now }
    }).sort({ date: 1 });

    if (!liveMatches.length) {
      return interaction.editReply('Zurzeit laufen keine Spiele.');
    }

    // Funktion, um die aktuelle Spielminute zu berechnen
    function getMinute(match) {
      const start = match.date;
      const extraFirstHalf = match.extraFirstHalf || 0;
      const extraSecondHalf = match.extraSecondHalf || 0;
      const pause = 5;

      let diff = Math.floor((now - start) / 60000); // Minuten seit Anpfiff
      if (diff <= 45) return `${diff}'`;
      if (diff <= 45 + extraFirstHalf) return `45' +${diff - 45}`;
      if (diff <= 50 + extraFirstHalf) return `45' +${extraFirstHalf} (Pause)`;
      diff -= 50 + extraFirstHalf;
      if (diff <= 45) return `${45 + diff}'`;
      return `90' +${diff - 45}`;
    }

    if (liveMatches.length === 1) {
      // Einzelspielmodus
      const match = liveMatches[0];
      const embed = new EmbedBuilder()
        .setTitle(`\`🏟️\` Live: ${match.homeTeam} vs ${match.awayTeam}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: getMinute(match), inline: true },
          { name: 'Spielstand', value: `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`, inline: true }
        );
      return interaction.editReply({ embeds: [embed] });
    }

    // Konferenzmodus
    const lines = liveMatches.map(m => {
      const minute = getMinute(m);
      const scoreHome = m.homeScore ?? 0;
      const scoreAway = m.awayScore ?? 0;
      return `${m.homeTeam} ${scoreHome} - ${scoreAway} ${m.awayTeam} (${minute})`;
    });

    const embed = new EmbedBuilder()
      .setTitle('⚽ Live-Konferenz')
      .setColor('Orange')
      .setDescription(lines.join('\n'));

    await interaction.editReply({ embeds: [embed] });

    // Live-Update jede Minute
    const message = await interaction.fetchReply();
    const interval = setInterval(async () => {
      const updatedMatches = await Match.find({
        date: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).sort({ date: 1 });

      if (!updatedMatches.length) {
        clearInterval(interval);
        return message.edit({ content: 'Alle Spiele sind beendet.', embeds: [] });
      }

      const updatedLines = updatedMatches.map(m => {
        const minute = getMinute(m);
        const scoreHome = m.homeScore ?? 0;
        const scoreAway = m.awayScore ?? 0;
        return `${m.homeTeam} ${scoreHome} - ${scoreAway} ${m.awayTeam} (${minute})`;
      });

      const updatedEmbed = new EmbedBuilder()
        .setTitle(updatedMatches.length > 1 ? '⚽ Live-Konferenz' : `🏟️ Live: ${updatedMatches[0].homeTeam} vs ${updatedMatches[0].awayTeam}`)
        .setColor(updatedMatches.length > 1 ? 'Orange' : 'Green')
        .setDescription(updatedLines.join('\n'));

      message.edit({ embeds: [updatedEmbed] });
    }, 1000); // 1,0 Sekunden Pause pro Minute (kann angepasst werden)
  }
};
