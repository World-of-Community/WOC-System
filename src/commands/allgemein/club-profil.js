import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Team } from '../../../Datenbank/fussballdb.js';
import Match from '../../../Datenbank/matchdb.js';

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

export default {
  data: new SlashCommandBuilder()
    .setName('club-profil')
    .setDescription('» Zeigt Informationen zu einem Fußballclub. ⚽')
    .addStringOption(option =>
      option.setName('team')
        .setDescription('Name des Teams')
        .setRequired(true)
        .addChoices(
          ...proLeagueTeams.map(name => ({ name, value: name }))
        )
    ),

  async execute(interaction) {
    const teamName = interaction.options.getString('team');
    const team = await Team.findOne({ name: teamName });

    if (!team) {
      return interaction.reply({ content: `> ⚠️ Team **${teamName}** wurde nicht gefunden.`, ephemeral: true });
    }

    // Letztes Spiel
    const lastMatch = await Match.find({
      $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
      date: { $lt: new Date() }
    }).sort({ date: -1 }).limit(1);

    // Letzte 5 Spiele (mit Ergebnis)
    const recentMatches = await Match.find({
      $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
      date: { $lt: new Date() }
    }).sort({ date: -1 }).limit(5);

    // Filter: Nur Spiele mit Ergebnis
    const recentMatchesWithResult = recentMatches.filter(match =>
      match.homeScore !== null && match.awayScore !== null
    );

    let formString = 'Keine Spiele mit Ergebnis Verfügbar.';

    if (recentMatchesWithResult.length > 0) {
      formString = recentMatchesWithResult.map(match => {
        const isHome = match.homeTeam === teamName;

        const goalsFor = isHome ? Number(match.homeScore) : Number(match.awayScore);
        const goalsAgainst = isHome ? Number(match.awayScore) : Number(match.homeScore);

        // Optional Debug:
        // console.log({ matchHome: match.homeTeam, matchAway: match.awayTeam, goalsFor, goalsAgainst, isHome });

        if (goalsFor > goalsAgainst) return '`✅`';
        if (goalsFor < goalsAgainst) return '`❌`';
        return '`➖`';
      }).reverse().join(' ');
    }

    // Team-Statistiken
    const siegquote = team.played > 0 ? ((team.won / team.played) * 100).toFixed(1) : '0.0';
    const tordifferenz = team.goalsFor - team.goalsAgainst;

    const embed = new EmbedBuilder()
      .setTitle(`\`🏟️\` Club-Profil: ${team.name}`)
      .setDescription('- `⏳` = Spiel nicht ausgewertet bzw. Ergebnis fehlt.')
      .setColor('Green')
      .addFields(
        { name: '`📊` Spiele', value: `${team.played}`, inline: true },
        { name: '`📈` Siegquote', value: `${siegquote}%`, inline: true },
        { name: '`🏆` Punkte', value: `${team.points}`, inline: true },
        { name: '`✅` Siege', value: `${team.won}`, inline: true },
        { name: '`➖` Unentschieden', value: `${team.draw}`, inline: true },
        { name: '`❌` Niederlagen', value: `${team.lost}`, inline: true },
        { name: '`🔢` Tordifferenz', value: `${tordifferenz}`, inline: true },
        { name: '`⚽` Tore', value: `${team.goalsFor}`, inline: true },
        { name: '`🥅` Gegentore', value: `${team.goalsAgainst}`, inline: true },
        { name: '`📉` Form (letzte 5)', value: formString, inline: true }
      );

    if (lastMatch.length > 0) {
      const m = lastMatch[0];

      const homeScore = m.homeScore !== null ? m.homeScore : '-';
      const awayScore = m.awayScore !== null ? m.awayScore : '-';

      const formattedDate = m.date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      embed.addFields({
        name: '`📅` Letztes Spiel',
        value: `${m.homeTeam} ${homeScore} - ${awayScore} ${m.awayTeam} (${formattedDate})`
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
