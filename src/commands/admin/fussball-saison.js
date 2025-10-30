const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Match } = require('../../../Datenbank/fussballdb');

const proLeagueTeams = [
  'FC Adler','SV Löwen','TSV Eiche','SC Blau','VfB Stern',
  'FC Rot-Weiß','SV Grünwald','TSV Nord','SC Süd','VfB West',
  'FC Ostwind','SV Nordstern','TSV Berg','SC Tal','VfB See',
  'FC Sturm','SV Blitz','TSV Vulkan','SC Frost','VfB Flamme',
  'FC Donner','SV Schatten','TSV Nebel','SC Licht'
];

const startDatum = new Date(2025, 9, 30, 21, 30); // erstes Spiel um 21:30
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

        for (let index = 0; index < matchData.length; index++) {
          const m = matchData[index];

          // erstes Spiel = 21:30, danach 5 Min Abstand pro Spiel
          const matchDate = new Date(startDatum.getTime() + (spieltag - 1) * 24 * 60 * 60 * 1000);
          matchDate.setMinutes(matchDate.getMinutes() + index * 5);

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

      await interaction.followUp({ content: '`📅` Übersicht der ersten 10 Spieltage:', embeds: embeds.slice(0,10) });

      // Kanal für Live-Updates
      const channel = await interaction.client.channels.fetch(LIVE_CHANNEL_ID);
      if (!channel) return console.error('`❌` Kanal nicht gefunden.');

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
