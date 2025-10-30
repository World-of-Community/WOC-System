const { Team, Match, ProLeagueEmbed } = require('../../../Datenbank/fussballdb');

const proLeagueTeams = [
  'FC Adler','SV Löwen','TSV Eiche','SC Blau','VfB Stern',
  'FC Rot-Weiß','SV Grünwald','TSV Nord','SC Süd','VfB West',
  'FC Ostwind','SV Nordstern','TSV Berg','SC Tal','VfB See',
  'FC Sturm','SV Blitz','TSV Vulkan','SC Frost','VfB Flamme',
  'FC Donner','SV Schatten','TSV Nebel','SC Licht'
];

const fixedTimes = [
  '00:30','01:30','02:00','04:00','06:00','07:30','09:00','09:30','10:30','11:00','11:30',
  '12:30','13:30','14:00','15:00','15:30','16:45','18:00','18:30','19:00','19:30','20:00',
  '20:30','21:45','23:00'
];

// Startdatum der Saison
const startDatum = new Date(2025, 7, 1); // 01.08.2025

async function generiereSaison() {
  try {
    const teams = [...proLeagueTeams];
    const spieltage = 34; // Anzahl der Spieltage

    for (let spieltag = 1; spieltag <= spieltage; spieltag++) {
      // Teams mischen für diesen Spieltag
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

      // Spiele des Spieltags erstellen
      const matches = [];
      for (let i = 0; i < shuffledTeams.length; i += 2) {
        const heimTeam = shuffledTeams[i];
        const auswaertsTeam = shuffledTeams[i + 1];

        // Uhrzeit zufällig wählen
        const uhrzeit = fixedTimes[Math.floor(Math.random() * fixedTimes.length)];
        const [stunde, minute] = uhrzeit.split(':').map(Number);

        // Datum für Spieltag: addiere Spieltag-Tage zum Startdatum
        const matchDate = new Date(startDatum.getTime() + (spieltag - 1) * 24 * 60 * 60 * 1000);
        matchDate.setHours(stunde, minute);

        const endDate = new Date(matchDate.getTime() + 90 * 60000); // +90 Minuten

        matches.push(new Match({
          homeTeam: heimTeam,
          awayTeam: auswaertsTeam,
          matchday: spieltag,
          date: matchDate,
          endDate
        }));
      }

      await Match.insertMany(matches);
      console.log(`Spieltag ${spieltag} mit ${matches.length} Spielen erstellt.`);
    }

    console.log('✅ Saison komplett generiert!');
  } catch (err) {
    console.error('❌ Fehler beim Generieren der Saison:', err);
  }
}

generiereSaison();
