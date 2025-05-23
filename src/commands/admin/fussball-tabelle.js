const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');

// Pro League Teams (24 feste Namen)
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
      // Alle Teams aus der DB laden
      const alleTeams = await Team.find({});
      
      // Map zum schnellen Zugriff
      const teamMap = new Map();
      for (const team of alleTeams) {
        const name = team.name.trim();
        teamMap.set(name, team);
      }

      // Fehlende Pro League Teams ergänzen mit Default-Werten
      for (const name of proLeagueTeams) {
        if (!teamMap.has(name)) {
          teamMap.set(name, {
            name,
            spiele: 0,
            siege: 0,
            unentschieden: 0,
            niederlagen: 0,
            tore: 0,
            gegnerTore: 0,
            punkte: 0
          });
        }
      }

      // Sortieren nach Punkten und Torverhältnis
      const proLeagueData = proLeagueTeams
        .map(name => teamMap.get(name))
        .sort((a, b) => {
          if (b.punkte !== a.punkte) return b.punkte - a.punkte;
          const tvB = b.tore - b.gegnerTore;
          const tvA = a.tore - a.gegnerTore;
          return tvB - tvA;
        });

      // Tabellenbeschreibung erstellen
      const description = proLeagueData.map((team, i) => {
        const tv = team.tore - team.gegnerTore;
        return `**${i + 1}. ${team.name}** - ${team.punkte} Pkt | Spiele: ${team.spiele} | S: ${team.siege} | U: ${team.unentschieden} | N: ${team.niederlagen} | Tore: ${team.tore}:${team.gegnerTore} (TV: ${tv})`;
      }).join('\n') || 'Keine Daten vorhanden.';

      const embed = new EmbedBuilder()
        .setTitle('⚽ Pro League Tabelle')
        .setDescription(description)
        .setColor('Blue');

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Fehler beim Anzeigen der Pro League Tabelle:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Beim Abrufen der Tabelle ist ein Fehler aufgetreten.', ephemeral: true });
      }
    }
  }
};
