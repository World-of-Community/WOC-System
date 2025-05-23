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

// 2. Liga Teams (60 Vorschläge, 48 nehmen – ohne Duplikate aus Pro League)
const allSecondLeagueCandidates = [
  'FC Drachen', 'SV Panther', 'TSV Adlerhorst', 'SC Tiger', 'VfB Falken',
  'FC Wölfe', 'SV Bären', 'TSV Löwenherz', 'SC Eichenwald', 'VfB Stürmer',
  'FC Geier', 'SV Habichte', 'TSV Felsen', 'SC Blitz', 'VfB Titan',
  'FC Komet', 'SV Donner', 'TSV Sturmvogel', 'SC Nebel', 'VfB Gladius',
  'FC Sturm', 'SV Schatten', 'TSV Phönix', 'SC Wogen', 'VfB Gletscher',
  'FC Sturmwind', 'SV Flamme', 'TSV Falkenberg', 'SC Pegasus', 'VfB Erle',
  'FC Blitzschlag', 'SV Eisvogel', 'TSV Sternenkrieger', 'SC Löwenmut', 'VfB Himmel',
  'FC Wolfspfad', 'SV Fuchs', 'TSV Mondlicht', 'SC Sturmflut', 'VfB Nebula',
  'FC Krieger', 'SV Orkan', 'TSV Gletscher', 'SC Wildfang', 'VfB Donnerfaust',
  'FC Sturmjäger', 'SV Fluss', 'TSV Felswand', 'SC Eisdorn', 'VfB Feuer',
  'FC Titanen', 'SV Falkenhorst', 'TSV Silber', 'SC Golden', 'VfB Adlerblick',
  'FC Eiswolf', 'SV Schattenläufer', 'TSV Blitzen', 'SC Nebelschleier', 'VfB Flügel'
];

// Filtere alle Teams raus, die bereits in der Pro League sind
const zweiteLigaTeams = allSecondLeagueCandidates.filter(team => !proLeagueTeams.includes(team)).slice(0, 48);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-tabelle')
    .setDescription('Zeigt die aktuellen Tabellen der Pro League und 2. Liga'),

  async execute(interaction) {
    try {
      // Datenbankabfrage
      const alleTeams = await Team.find({});
      const teamMap = new Map();

      // Teams in Map speichern
      for (const team of alleTeams) {
        teamMap.set(team.name, team);
      }

      // Initialisiere fehlende Teams mit 0-Daten
      function ensureTeamsInMap(teamNames) {
        for (const name of teamNames) {
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
      }

      ensureTeamsInMap(proLeagueTeams);
      ensureTeamsInMap(zweiteLigaTeams);

      // Sortierlogik: Punkte > Torverhältnis
      function sortiereTeams(teams) {
        return teams.sort((a, b) => {
          if (b.punkte !== a.punkte) return b.punkte - a.punkte;
          const tvB = b.tore - b.gegnerTore;
          const tvA = a.tore - a.gegnerTore;
          return tvB - tvA;
        });
      }

      const proLeagueData = sortiereTeams(proLeagueTeams.map(t => teamMap.get(t)));
      const zweiteLigaData = sortiereTeams(zweiteLigaTeams.map(t => teamMap.get(t)));

      // Tabellenbeschreibung generieren
      function createTableDescription(teams) {
        return teams.map((team, i) => {
          const tv = team.tore - team.gegnerTore;
          return `**${i + 1}. ${team.name}** - ${team.punkte} Pkt | Spiele: ${team.spiele} | S: ${team.siege} | U: ${team.unentschieden} | N: ${team.niederlagen} | Tore: ${team.tore}:${team.gegnerTore} (TV: ${tv})`;
        }).join('\n') || 'Keine Daten vorhanden.';
      }

      const embedProLeague = new EmbedBuilder()
        .setTitle('⚽ Pro League Tabelle')
        .setDescription(createTableDescription(proLeagueData))
        .setColor('Blue');

      const embedZweiteLiga = new EmbedBuilder()
        .setTitle('⚽ 2. Liga Tabelle')
        .setDescription(createTableDescription(zweiteLigaData))
        .setColor('Green');

      // Antwort zuerst senden
      await interaction.reply({ content: '📊 Tabelle wird angezeigt.', ephemeral: true });

      // Dann Embed posten
      if (interaction.channel) {
        await interaction.channel.send({ embeds: [embedProLeague, embedZweiteLiga] });
      } else {
        console.warn('Konnte Nachricht nicht senden: Kein Channel vorhanden');
      }

    } catch (error) {
      console.error('Fehler beim Anzeigen der Tabelle:', error);
      await interaction.reply({ content: '❌ Beim Abrufen der Tabelle ist ein Fehler aufgetreten.', ephemeral: true });
    }
  }
};
