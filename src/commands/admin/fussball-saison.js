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

// Startdatum: 30.10.2025, 21:00 Uhr
const startDatum = new Date(2025, 9, 30, 21, 0);

// ID des Kanals, in dem Live-Spiele angezeigt werden sollen
const LIVE_CHANNEL_ID = '1375803752375648266';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-saison-generieren')
    .setDescription('Generiert die komplette Saison und startet Live-Updates.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply('⚡ Saison wird generiert... bitte warten!');

    try {
      const teams = [...proLeagueTeams];
      const spieltage = 34;

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
            endDate,
            homeScore: 0,
            awayScore: 0
          }));
        }

        await Match.insertMany(matches);
        console.log(`Spieltag ${spieltag} erstellt (${matches.length} Spiele).`);
      }

      await interaction.followUp('✅ Saison erfolgreich generiert! Live-Updates werden gestartet.');

      // Live-Update starten
      const channel = await interaction.client.channels.fetch(LIVE_CHANNEL_ID);
      if (!channel) return console.error('❌ Kanal nicht gefunden.');

      async function updateLive() {
        const now = new Date();
        const liveMatches = await Match.find({ date: { $lte: now }, endDate: { $gte: now } }).sort({ date: 1 });
        if (!liveMatches.length) {
          return setTimeout(updateLive, 1000);
        }

        const lines = liveMatches.map(m => {
          const diff = Math.floor((now - m.date) / 60000);
          const minute = diff <= 45 ? `${diff}'` : diff <= 50 ? `45' +${diff-45} (Pause)` : `${45 + (diff-50)}'`;
          return `${m.homeTeam} ${m.homeScore ?? 0} - ${m.awayScore ?? 0} ${m.awayTeam} (${minute})`;
        });

        const embed = new EmbedBuilder()
          .setTitle(liveMatches.length > 1 ? '⚽ Live-Konferenz' : `🏟️ Live: ${liveMatches[0].homeTeam} vs ${liveMatches[0].awayTeam}`)
          .setColor(liveMatches.length > 1 ? 'Orange' : 'Green')
          .setDescription(lines.join('\n'));

        // Nachricht prüfen oder neue senden
        let messages = await channel.messages.fetch({ limit: 10 });
        let liveMsg = messages.find(m => m.author.id === interaction.client.user.id && m.embeds[0]?.title.includes('Live'));
        if (liveMsg) {
          await liveMsg.edit({ embeds: [embed] });
        } else {
          await channel.send({ embeds: [embed] });
        }

        setTimeout(updateLive, 1000); // 1 Sekunde Pause
      }

      updateLive();

    } catch (err) {
      console.error(err);
      await interaction.followUp('❌ Fehler beim Generieren der Saison.');
    }
  }
};
