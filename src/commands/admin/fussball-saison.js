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

const specialTimes = ['21:00','21:15','21:30','21:45','22:00','22:15','22:30','22:45','23:00'];

const startDatum = new Date(2025, 9, 30, 21, 0);
const LIVE_CHANNEL_ID = '1375803752375648266';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-saison-generieren')
    .setDescription('Generiert die komplette Saison ab dem 30.10.2025 mit Übersicht und startet Live-Updates.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply('`⚡` Saison wird generiert... bitte warten!');

    try {
      const teams = [...proLeagueTeams];
      const spieltage = 34;
      const embeds = [];

      // Funktion: Generiert Paarungen pro Spieltag (jedes Team nur einmal)
      function generateMatchesForSpieltag(teams) {
        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        const matches = [];
        for (let i = 0; i < shuffled.length; i += 2) {
          if (shuffled[i + 1]) {
            matches.push({ homeTeam: shuffled[i], awayTeam: shuffled[i + 1] });
          }
        }
        return matches;
      }

      for (let spieltag = 1; spieltag <= spieltage; spieltag++) {
        const matchData = generateMatchesForSpieltag(teams);
        const matches = [];

        for (const m of matchData) {
          let uhrzeit = spieltag === 1
            ? specialTimes[Math.floor(Math.random() * specialTimes.length)]
            : fixedTimes[Math.floor(Math.random() * fixedTimes.length)];

          const [stunde, minute] = uhrzeit.split(':').map(Number);
          const matchDate = new Date(startDatum.getTime() + (spieltag - 1) * 24 * 60 * 60 * 1000);
          matchDate.setHours(stunde, minute);

          const endDate = new Date(matchDate.getTime() + 90 * 60000);

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

        // Übersicht-Embed pro Spieltag
        const sortedMatches = matches.sort((a,b) => a.date - b.date);
        const spielListe = sortedMatches.map(m => {
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

      // Übersicht der ersten 10 Spieltage posten
      await interaction.followUp({ content: '`📅` Übersicht der ersten 10 Spieltage:', embeds: embeds.slice(0,10) });

      // Kanal für Live-Updates
      const channel = await interaction.client.channels.fetch(LIVE_CHANNEL_ID);
      if (!channel) return console.error('`❌` Kanal nicht gefunden.');

      // Tracken, welche Spiele Konferenz bereits hatten
      const announcedMatches = new Set();

      async function updateLive() {
        const now = new Date();

        // Live-Konferenz
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

          let messages = await channel.messages.fetch({ limit: 10 });
          let liveMsg = messages.find(m => m.author.id === interaction.client.user.id && m.embeds[0]?.title.includes('Live'));
          if (liveMsg) {
            await liveMsg.edit({ embeds: [embed] });
          } else {
            await channel.send({ embeds: [embed] });
          }
        }

        // 10 Minuten vorher Konferenz nur 1x senden
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

        setTimeout(updateLive, 1000);
      }

      updateLive();

    } catch (err) {
      console.error(err);
      await interaction.followUp('❌ Fehler beim Generieren der Saison.');
    }
  }
};
