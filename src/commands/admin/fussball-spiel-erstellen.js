const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Match } = require('../../../Datenbank/fussballdb');

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

const startDatum = new Date(2025, 7, 1); // 01.08.2025

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-saison-generieren')
    .setDescription('Erstellt automatisch die komplette Saison mit allen Spieltagen und Spielen.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply('⚡ Saison wird generiert... bitte warten!');

    try {
      const teams = [...proLeagueTeams];
      const spieltage = 34;
      const embeds = [];

      for (let spieltag = 1; spieltag <= spieltage; spieltag++) {
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        const matches = [];

        for (let i = 0; i < shuffledTeams.length; i += 2) {
          const heimTeam = shuffledTeams[i];
          const auswaertsTeam = shuffledTeams[i + 1];

          const uhrzeit = fixedTimes[Math.floor(Math.random() * fixedTimes.length)];
          const [stunde, minute] = uhrzeit.split(':').map(Number);

          const matchDate = new Date(startDatum.getTime() + (spieltag - 1) * 24 * 60 * 60 * 1000);
          matchDate.setHours(stunde, minute);

          const endDate = new Date(matchDate.getTime() + 90 * 60000);

          matches.push(new Match({
            homeTeam: heimTeam,
            awayTeam: auswaertsTeam,
            matchday: spieltag,
            date: matchDate,
            endDate
          }));
        }

        await Match.insertMany(matches);
        console.log(`Spieltag ${spieltag} erstellt (${matches.length} Spiele).`);

        // Embed für diesen Spieltag erstellen
        const spielListe = matches.map(m => {
          return `${m.homeTeam} vs ${m.awayTeam} (${m.date.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })})`;
        }).join('\n');

        embeds.push(new EmbedBuilder()
          .setTitle(`Spieltag ${spieltag}`)
          .setDescription(spielListe)
          .setColor('Blue')
        );
      }

      await interaction.followUp({ content: '> `✅` Saison erfolgreich generiert!', embeds: embeds.slice(0, 10) });
      // Hinweis: nur die ersten 10 Spieltage auf einmal anzeigen, bei Bedarf kannst du Paginierung einbauen

    } catch (err) {
      console.error(err);
      await interaction.followUp('❌ Fehler beim Generieren der Saison.');
    }
  }
};
