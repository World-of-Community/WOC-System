const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('club-profil')
    .setDescription('Zeigt Informationen zu einem Fußballclub.')
    .addStringOption(option =>
      option.setName('team')
        .setDescription('Name des Teams')
        .setRequired(true)
        .addChoices(
          ...proLeagueTeams.map(team => ({ name: team, value: team }))
        )
    ),

  async execute(interaction) {
    const teamName = interaction.options.getString('team');

    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return interaction.reply({ content: `⚠️ Team **${teamName}** wurde nicht gefunden.`, ephemeral: true });
    }

    const lastMatch = await Match.find({
        $or: [{ team1: team._id }, { team2: team._id }],
        date: { $lt: new Date() }
    }).sort({ date: -1 }).limit(1).populate('team1 team2');

    const embed = new EmbedBuilder()
      .setTitle(`\`🏟️\` Club-Profil: ${team.name}`)
      .setColor('Green')
      .addFields(
        { name: '📊 Spiele', value: `${team.played}`, inline: true },
        { name: '✅ Siege', value: `${team.won}`, inline: true },
        { name: '➖ Unentschieden', value: `${team.draw}`, inline: true },
        { name: '❌ Niederlagen', value: `${team.lost}`, inline: true },
        { name: '⚽ Tore (für)', value: `${team.goalsFor}`, inline: true },
        { name: '🥅 Tore (gegen)', value: `${team.goalsAgainst}`, inline: true },
        { name: '🏆 Punkte', value: `${team.points}`, inline: true }
      );

    if (lastMatch.length > 0) {
      const m = lastMatch[0];
      embed.addFields({
        name: '📅 Letztes Spiel',
        value: `${m.team1} ${m.score1} - ${m.score2} ${m.team2} (${m.date.toLocaleDateString()})`
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
