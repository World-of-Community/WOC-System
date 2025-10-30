const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Match } = require('../../../Datenbank/fussballdb');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

const startDatum = new Date(2025, 9, 30); // Spieltag-Startdatum
const LIVE_CHANNEL_ID = '1375803752375648266';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-saison-generieren')
    .setDescription('Generiert die komplette Saison ab dem 30.10.2025 mit Übersicht und startet Live-Updates.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply('`⚡` Saison wird generiert... bitte warten!');

    try {
      // 🔹 Alle bisherigen Matches löschen
      await Match.deleteMany({});
      console.log('✅  | Alle bisherigen Matches wurden gelöscht.');

      const teams = [...proLeagueTeams];
      const spieltage = 34;
      const embeds = [];

      function generateMatchesForSpieltag(teams) {
        const available = [...teams];
        const matches = [];
        while (available.length > 1) {
          const homeIndex = Math.floor(Math.random() * available.length);
          const homeTeam = available.splice(homeIndex, 1)[0];
          const awayIndex = Math.floor(Math.random() * available.length);
          const awayTeam = available.splice(awayIndex, 1)[0];
          matches.push({ homeTeam, awayTeam });
        }
        return matches;
      }

      // --------------------------
      // Saison generieren
      // --------------------------
      for (let spieltag = 1; spieltag <= spieltage; spieltag++) {
        const matchData = generateMatchesForSpieltag(teams);
        const matches = [];
        const matchDayDate = new Date(startDatum.getTime() + (spieltag - 1) * 24 * 60 * 60 * 1000);

        for (let index = 0; index < matchData.length; index++) {
          const m = matchData[index];

          // Zeit wählen: erstes Spiel heute = 22:00, sonst aus fixedTimes
          let timeStr;
          const today = new Date();
          if (spieltag === 1 && matchDayDate.toDateString() === today.toDateString() && index === 0) {
            timeStr = '22:05';
          } else {
            timeStr = fixedTimes[Math.floor(Math.random() * fixedTimes.length)];
          }

          const [hour, minute] = timeStr.split(':').map(Number);
          const matchDate = new Date(matchDayDate.getTime());
          matchDate.setHours(hour, minute, 0, 0);
          const endDate = new Date(matchDate.getTime() + 90 * 60000); // 90 Minuten Spielzeit

          matches.push(new Match({
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            matchday: spieltag,
            date: matchDate,
            endDate,
            homeScore: 0,
            awayScore: 0
          }));
        }

        await Match.insertMany(matches);

        const spielListe = matches.map(m => {
          const timeStr = m.date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
          const dateStr = m.date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
          return `${m.homeTeam} vs ${m.awayTeam} (${timeStr} Uhr, ${dateStr})`;
        }).join('\n');

        embeds.push(new EmbedBuilder()
          .setTitle(`Spieltag ${spieltag}`)
          .setDescription(spielListe)
          .setColor('Blue')
        );

        console.log(`Spieltag ${spieltag} erstellt (${matches.length} Spiele).`);
      }

      await interaction.followUp({ content: '`📅` Übersicht der ersten 10 Spieltage:', embeds: embeds.slice(0, 10) });

      // ---------------------------
      // Live-Updates starten
      // ---------------------------
      const channel = await interaction.client.channels.fetch(LIVE_CHANNEL_ID);
      if (!channel) return console.error('`❌` Kanal nicht gefunden.');

      const announcedMatches = new Set();

      async function updateLive() {
        const now = new Date();

        const liveMatches = await Match.find({ date: { $lte: now }, endDate: { $gte: now } }).sort({ date: 1 });

        if (liveMatches.length > 0) {
          const lines = liveMatches.map(m => {
            const diff = Math.floor((now - m.date) / 60000);
            const minute = diff <= 45 ? `${diff}'` : diff <= 50 ? `45' +${diff-45} (Pause)` : `${45 + (diff-50)}'`;
            return `${m.homeTeam} ${m.homeScore ?? 0} - ${m.awayScore ?? 0} ${m.awayTeam} (${minute})`;
          });

          const embed = new EmbedBuilder()
            .setTitle(liveMatches.length > 1 ? '`⚽` Live-Konferenz' : `\`🏟️\` Live: ${liveMatches[0].homeTeam} vs ${liveMatches[0].awayTeam}`)
            .setColor(liveMatches.length > 1 ? 'Orange' : 'Green')
            .setDescription(lines.join('\n'));

          const messages = await channel.messages.fetch({ limit: 10 });
          const liveMsg = messages.find(msg => msg.author.id === interaction.client.user.id && msg.embeds[0]?.title.includes('Live'));
          if (liveMsg) await liveMsg.edit({ embeds: [embed] });
          else await channel.send({ embeds: [embed] });
        }

        // 10 Minuten vorher Konferenz nur 1x
        const upcomingMatches = await Match.find({
          date: { $gt: now, $lte: new Date(now.getTime() + 10 * 60000) }
        }).sort({ date: 1 });

        const newMatches = upcomingMatches.filter(m => !announcedMatches.has(m.id));
        if (newMatches.length > 0) {
          const lines = newMatches.map(m => {
            const timeStr = m.date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            return `${m.homeTeam} vs ${m.awayTeam} (${timeStr} Uhr)`;
          });

          const embed = new EmbedBuilder()
            .setTitle('`⚽` Konferenz startet in 10 Minuten')
            .setColor('Purple')
            .setDescription(lines.join('\n'));

          await channel.send({ embeds: [embed] });
          newMatches.forEach(m => announcedMatches.add(m.id));
        }

        setTimeout(updateLive, 1000); // jede Sekunde = 1 Spielminute
      }

      updateLive();

    } catch (err) {
      console.error(err);
      await interaction.followUp('❌ Fehler beim Generieren der Saison.');
    }
  }
};
