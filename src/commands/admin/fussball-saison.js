const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType 
} = require('discord.js');
const { Match } = require('../../../Datenbank/fussballdb');

const proLeagueTeams = [
  'FC Adler','SV Löwen','TSV Eiche','SC Blau','VfB Stern',
  'FC Rot-Weiß','SV Grünwald','TSV Nord','SC Süd','VfB West',
  'FC Ostwind','SV Nordstern','TSV Berg','SC Tal','VfB See',
  'FC Sturm','SV Blitz','TSV Vulkan','SC Frost','VfB Flamme',
  'FC Donner','SV Schatten','TSV Nebel','SC Licht'
];

const fixedTimes = [
  '12:30','13:30','14:00','15:00','15:30','16:45','18:00','18:30','19:00','19:30','20:00',
  '20:30','21:45'
];

const startDatum = new Date(2025, 9, 30); // 30.10.2025
const LIVE_CHANNEL_ID = '1375803752375648266';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-saison-generieren')
    .setDescription('Generiert die komplette Saison ab dem 30.10.2025 mit Übersicht und startet Live-Updates.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply('`⚡` Saison wird generiert... bitte warten!');

    try {
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
        const matchDayDate = new Date(startDatum);
        matchDayDate.setDate(startDatum.getDate() + (spieltag - 1));

        for (let index = 0; index < matchData.length; index++) {
          const m = matchData[index];

          // Uhrzeit festlegen
          let timeStr;
          const today = new Date();
          if (spieltag === 1 && index === 0) {
            timeStr = '22:31'; // erstes Spiel feste Zeit
          } else {
            timeStr = fixedTimes[Math.floor(Math.random() * fixedTimes.length)];
          }

          const [hour, minute] = timeStr.split(':').map(Number);
          const matchDate = new Date(matchDayDate);
          matchDate.setHours(hour, minute, 0, 0);
          const endDate = new Date(matchDate.getTime() + 90 * 60000); // reguläre Spielzeit

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
      }

      // --------------------------
      // Spieltage per Button anzeigen
      // --------------------------
      let page = 0;
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅️ Zurück')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️ Weiter')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(embeds.length <= 1)
        );

      const msg = await interaction.followUp({ embeds: [embeds[page]], components: [row] });

      const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) 
          return i.reply({ content: 'Nur der Command-Ersteller kann navigieren.', ephemeral: true });

        if (i.customId === 'next') page++;
        if (i.customId === 'prev') page--;

        row.components[0].setDisabled(page === 0);
        row.components[1].setDisabled(page === embeds.length - 1);

        await i.update({ embeds: [embeds[page]], components: [row] });
      });

      // --------------------------
      // Live-Updates
      // --------------------------
      const channel = await interaction.client.channels.fetch(LIVE_CHANNEL_ID);
      if (!channel) return console.error('`❌` Kanal nicht gefunden.');

      let liveMsg;
      const announcedMatches = new Set();
      const maxNormalTime = 90;
      const maxExtraTime = 20;

      async function updateLive() {
        const now = new Date();
        const liveMatches = await Match.find({ date: { $lte: now }, endDate: { $gte: now } }).sort({ date: 1 });

        if (liveMatches.length > 0) {
          const lines = [];

          for (const m of liveMatches) {
            const diffMinutes = Math.floor((now - m.date) / 60000);
            let minuteDisplay;

            if (diffMinutes < 45) {
              minuteDisplay = `${diffMinutes}'`;
            } else if (diffMinutes < 46) {
              minuteDisplay = `45' (Pause)`;
            } else if (diffMinutes <= maxNormalTime) {
              minuteDisplay = `${diffMinutes}'`;
            } else {
              const extra = Math.min(diffMinutes - maxNormalTime, maxExtraTime);
              minuteDisplay = `${maxNormalTime}' +${extra}`;
            }

            // Zufällige Tore
            if (Math.random() < 0.03) m.homeScore++;
            if (Math.random() < 0.025) m.awayScore++;
            await m.save();

            lines.push(`${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam} (${minuteDisplay})`);
          }

          const embed = new EmbedBuilder()
            .setTitle(liveMatches.length > 1 ? '`⚽` Live-Konferenz' : `\`🏟️\` Live: ${liveMatches[0].homeTeam} vs ${liveMatches[0].awayTeam}`)
            .setColor(liveMatches.length > 1 ? 'Orange' : 'Green')
            .setDescription(lines.join('\n'));

          if (liveMsg) {
            await liveMsg.edit({ embeds: [embed] });
          } else {
            liveMsg = await channel.send({ embeds: [embed] });
          }
        }

        // Spiele, die in 10 Sekunden starten
        const upcomingMatches = await Match.find({
          date: { $gt: now, $lte: new Date(now.getTime() + 10000) }
        }).sort({ date: 1 });

        const newMatches = upcomingMatches.filter(m => !announcedMatches.has(m.id));
        if (newMatches.length > 0) {
          const lines = newMatches.map(m => {
            const timeStr = m.date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            return `${m.homeTeam} vs ${m.awayTeam} (${timeStr} Uhr)`;
          });

          const embed = new EmbedBuilder()
            .setTitle('`⚽` Spiele starten in wenigen Sekunden')
            .setColor('Purple')
            .setDescription(lines.join('\n'));

          await channel.send({ embeds: [embed] });
          newMatches.forEach(m => announcedMatches.add(m.id));
        }

        setTimeout(updateLive, 1000); // Simulation jede Sekunde
      }

      updateLive();

    } catch (err) {
      console.error(err);
      await interaction.followUp('❌ Fehler beim Generieren der Saison.');
    }
  }
};
