const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Team = require('../../../Datenbank/fussballdb'); // Dein Mongoose Modell

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
      // Teams aus DB laden (nur Pro League)
      const alleTeams = await Team.find({ league: 'Pro League' });

      // Map der Teams für schnellen Zugriff
      const teamMap = new Map(alleTeams.map(team => [team.name.trim(), team.toObject()]));

      // Fehlende Teams mit Default-Daten ergänzen
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

      // Sortierung nach Punkten, dann Torverhältnis
      const proLeagueData = Array.from(teamMap.values())
        .map(team => {
          team.goalDifference = team.goalsFor - team.goalsAgainst;
          team.points = (team.won * 3) + team.draw;
          return team;
        })
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.goalDifference - a.goalDifference;
        });

      // Embed-Beschreibung aufbauen (max 4096 Zeichen beachten)
      const description = proLeagueData.map((team, i) => 
        `**${i + 1}. ${team.name}** - ${team.points} Pkt | Spiele: ${team.played} | S: ${team.won} | U: ${team.draw} | N: ${team.lost} | Tore: ${team.goalsFor}:${team.goalsAgainst} (TV: ${team.goalDifference})`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('⚽ Pro League Tabelle')
        .setDescription(description)
        .setColor('Blue');

      // Antwort per Interaction senden (ephemeral + Channel Nachricht)
      await interaction.reply({ content: 'Tabelle wird angezeigt...', ephemeral: true });
      await interaction.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Fehler beim Anzeigen der Pro League Tabelle:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Fehler beim Abrufen der Tabelle.', ephemeral: true });
      }
    }
  }
};
