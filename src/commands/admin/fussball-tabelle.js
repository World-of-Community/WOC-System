const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Team, Match } = require('../../../Datenbank/fussballdb');

// Pro League Teams (24 feste Namen)
const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

// 2. Liga Teams - mehr Teams, aber ohne Pro League Teams (z.B. 60 Vorschläge, dann 48 nehmen)
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

// Filtere 2. Liga Teams raus, die in Pro League sind
const zweiteLigaTeams = allSecondLeagueCandidates.filter(team => !proLeagueTeams.includes(team)).slice(0, 48);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-tabelle')
    .setDescription('Zeigt die aktuellen Tabellen der Pro League und 2. Liga'),

  async execute(interaction) {
    // Lade alle Teams aus der DB
    const alleTeams = await Team.find({});

    // Map für schnellen Zugriff
    const teamMap = new Map();
    for (const team of alleTeams) {
      teamMap.set(team.name, team);
    }

    // Hilfsfunktion: Stellt sicher, dass alle Teams in teamMap sind, sonst mit 0 initialisieren
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

    // Sicherstellen, dass alle Teams in der Map sind
    ensureTeamsInMap(proLeagueTeams);
    ensureTeamsInMap(zweiteLigaTeams);

    // Sortierfunktion
    function sortiereTeams(teams) {
      return teams.sort((a, b) => {
        if (b.punkte !== a.punkte) return b.punkte - a.punkte;
        const torverhaeltnisB = b.tore - b.gegnerTore;
        const torverhaeltnisA = a.tore - a.gegnerTore;
        return torverhaeltnisB - torverhaeltnisA;
      });
    }

    // Pro League Teams sortieren
    const proLeagueData = sortiereTeams(proLeagueTeams.map(t => teamMap.get(t)));

    // 2. Liga Teams sortieren
    const zweiteLigaData = sortiereTeams(zweiteLigaTeams.map(t => teamMap.get(t)));

    // Erstelle Beschreibungstext für Embed
    function createTableDescription(teams) {
      let description = '';
      let platz = 1;
      for (const team of teams) {
        const torverhaeltnis = team.tore - team.gegnerTore;
        description += `**${platz}. ${team.name}** - ${team.punkte} Pkt | Spiele: ${team.spiele} | S: ${team.siege} | U: ${team.unentschieden} | N: ${team.niederlagen} | Tore: ${team.tore}:${team.gegnerTore} (TV: ${torverhaeltnis})\n`;
        platz++;
      }
      return description || 'Keine Daten vorhanden.';
    }

    const embedProLeague = new EmbedBuilder()
      .setTitle('⚽ Pro League Tabelle')
      .setDescription(createTableDescription(proLeagueData))
      .setColor('Blue');

    const embedZweiteLiga = new EmbedBuilder()
      .setTitle('⚽ 2. Liga Tabelle')
      .setDescription(createTableDescription(zweiteLigaData))
      .setColor('Green');

    await interaction.channel.send({ embeds: [embedProLeague, embedZweiteLiga] })
    await interaction.reply({ content: 'erfolgreich gesendet', ephemeral: true });
  }
};
