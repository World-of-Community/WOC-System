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

    // Letzte 5 Spiele für Form
    const recentMatches = await Match.find({
      $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
      date: { $lt: new Date() }
    }).sort({ date: -1 }).limit(5);

    let formString = 'Keine Spiele';
    if (recentMatches.length > 0) {
      formString = recentMatches.map(match => {
        const isHome = match.homeTeam === teamName;
        const goalsFor = isHome ? match.homeScore : match.awayScore;
        const goalsAgainst = isHome ? match.awayScore : match.homeScore;

        if (goalsFor > goalsAgainst) return '`✅`';
        if (goalsFor < goalsAgainst) return '`❌`';
        return '`➖`';
      }).reverse().join(' ');
    }

    // Zusatzinfos
    const siegquote = team.played > 0 ? ((team.won / team.played) * 100).toFixed(1) : '0.0';
    const tordifferenz = team.goalsFor - team.goalsAgainst;

    const embed = new EmbedBuilder()
      .setTitle(`\`🏟️\` Club-Profil: ${team.name}`)
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
      embed.addFields({
        name: '`📅` Letztes Spiel',
        value: `${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam} (${m.date.toLocaleDateString()})`
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

/*
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
      $or: [{ team1: team._id }, { team2: team._id }],
      date: { $lt: new Date() }
    }).sort({ date: -1 }).limit(1).populate('team1 team2');

    // Form der letzten 5 Spiele
    const recentMatches = await Match.find({
      $or: [{ team1: team._id }, { team2: team._id }],
      date: { $lt: new Date() }
    }).sort({ date: -1 }).limit(5);

    let formString = 'Keine Spiele';
    if (recentMatches.length > 0) {
      formString = recentMatches.map(match => {
        const isTeam1 = match.team1.equals(team._id);
        const goalsFor = isTeam1 ? match.score1 : match.score2;
        const goalsAgainst = isTeam1 ? match.score2 : match.score1;

        if (goalsFor > goalsAgainst) return '`✅`';
        if (goalsFor < goalsAgainst) return '`❌`';
        return '`➖`';
      }).reverse().join(' ');
    }

    // Zusatzinfos
    const siegquote = team.played > 0 ? ((team.won / team.played) * 100).toFixed(1) : '0.0';
    const tordifferenz = team.goalsFor - team.goalsAgainst;

    const embed = new EmbedBuilder()
      .setTitle(`\`🏟️\` Club-Profil: ${team.name}`)
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
      embed.addFields({
        name: '`📅` Letztes Spiel',
        value: `${m.team1.name} ${m.score1} - ${m.score2} ${m.team2.name} (${m.date.toLocaleDateString()})`
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
*/