const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Team = require('../../../Datenbank/fussballdb');  // Pfad zu deinem Mongoose Modell

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-tabelle')
    .setDescription('Zeigt die aktuelle Tabelle der Pro League'),

  async execute(interaction) {
    try {
      // Teams aus DB laden, nur Pro League
      const alleTeams = await Team.find({ league: 'Pro League' });
      const teamMap = new Map();

      for (const team of alleTeams) {
        teamMap.set(team.name.trim(), team);
      }

      // Fehlende Teams mit Defaultwerten ergänzen
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
            points: 0,
            yellowCards: 0,
            redCards: 0
          });
        }
      }

      // Teams nach Punkten & Torverhältnis sortieren
      const proLeagueData = proLeagueTeams
        .map(name => {
          const team = teamMap.get(name);
          team.goalDifference = team.goalsFor - team.goalsAgainst;
          team.points = (team.won * 3) + team.draw;
          return team;
        })
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.goalDifference - a.goalDifference;
        });

      // Embed-Beschreibung erstellen
      const description = proLeagueData.map((team, i) => 
        `**${i + 1}. ${team.name}** - ${team.points} Pkt | Spiele: ${team.played} | S: ${team.won} | U: ${team.draw} | N: ${team.lost} | Tore: ${team.goalsFor}:${team.goalsAgainst} (TV: ${team.goalDifference})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('⚽ Pro League Tabelle')
        .setDescription(description)
        .setColor('Blue');

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: 'Tabelle gesendet.', ephemeral: true });

    } catch (error) {
      console.error('Fehler beim Anzeigen der Pro League Tabelle:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Fehler beim Abrufen der Tabelle.', ephemeral: true });
      }
    }
  }
};
