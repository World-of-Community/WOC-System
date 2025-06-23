const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

async function createTabelleEmbed() {
  const allTeams = await Team.find({ league: 'Pro League' });
  const liveNow = new Date();
  const liveMatches = await Match.find({
    date: { $lte: liveNow },
    endDate: { $gte: liveNow } // Du brauchst dieses Feld in deiner Match-Datenbank!
  });

  const liveTeams = new Set();
  for (const m of liveMatches) {
    liveTeams.add(m.homeTeam);
    liveTeams.add(m.awayTeam);
  }

  const teamMap = new Map(allTeams.map(t => [t.name.trim(), t.toObject()]));

  for (const name of proLeagueTeams) {
    if (!teamMap.has(name)) {
      teamMap.set(name, {
        name,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      });
    }
  }

  const proLeagueData = Array.from(teamMap.values())
    .map(t => {
      t.goalDifference = t.goalsFor - t.goalsAgainst;
      t.points = (t.won * 3) + t.draw;
      return t;
    })
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

  const description = proLeagueData.map((t, i) => {
    const isLive = liveTeams.has(t.name);
    const platz = (i + 1).toString().padStart(2, ' ');
    const teamDisplay = `${isLive ? '`🔴`' : ''} ${t.name}`.padEnd(17);
    return `**${platz}.** ${teamDisplay} | Sp: ${t.played.toString().padStart(2)} | S: ${t.won.toString().padStart(2)} | U: ${t.draw.toString().padStart(2)} | N: ${t.lost.toString().padStart(2)} | T: ${t.goalsFor.toString().padStart(2)} | GT: ${t.goalsAgainst.toString().padStart(2)} | TD: ${t.goalDifference.toString().padStart(3)} | Pkte: ${t.points.toString().padStart(3)}`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle('🏆 Pro League Tabelle')
    .setDescription(description || 'Keine Daten vorhanden')
    .setColor(0xFFD700)
    .setFooter({ text: '🔴 = Team spielt aktuell live | Zuletzt aktualisiert' })
    .setTimestamp();
}

async function createNextMatchdayEmbed() {
  const now = new Date();

  const nextMatches = await Match.find({ date: { $gte: now } })
    .sort({ date: 1 })
    .limit(10);

  if (!nextMatches.length) {
    return new EmbedBuilder()
      .setTitle('📅 Nächster Spieltag')
      .setDescription('Keine Spiele für den nächsten Spieltag gefunden.')
      .setColor(0x00BFFF);
  }

  const nextMatchdayNumber = nextMatches[0].matchday;
  const matchdayGames = await Match.find({ matchday: nextMatchdayNumber }).sort({ date: 1 });

  const matchdayText = matchdayGames.map(m => {
    const dateStr = new Date(m.date).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    return `${m.homeTeam} vs ${m.awayTeam} - ${dateStr}`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle(`📅 Nächster Spieltag: Spieltag ${nextMatchdayNumber}`)
    .setDescription(matchdayText)
    .setColor(0x00BFFF);
}

async function createLiveMatchesEmbed() {
  const now = new Date();

  const liveMatches = await Match.find({
    date: { $lte: now },
    endDate: { $gte: now }
  }).sort({ date: 1 });

  if (liveMatches.length === 0) {
    return new EmbedBuilder()
      .setTitle('`🔴` Live Spiele')
      .setDescription('Zurzeit laufen keine Spiele.')
      .setColor(0xFF0000);
  }

  const matchDescriptions = liveMatches.map(m => {
    const now = new Date();
    const startTime = new Date(m.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    const diffMs = now - m.date;
    const diffMin = Math.floor(diffMs / 60000);

    let spielminute;
    let startInfo = '';

    if (diffMin < 0 && diffMin >= -5) {
    // Spiel startet in weniger als 5 Minuten (negative Differenz)
      startInfo = `, Spiel beginnt in ${Math.abs(diffMin)} Minute${Math.abs(diffMin) === 1 ? '' : 'n'}`;
      spielminute = '0';
    } else if (diffMin <= 90 && diffMin >= 0) {
      spielminute = diffMin.toString();
    } else if (diffMin > 90 && diffMin <= 110) { // max. 20 Minuten Nachspielzeit
      spielminute = `90+${diffMin - 90}`;
    } else if (diffMin < -5) {
    // Spiel beginnt später als 5 Minuten
      spielminute = '0';
    } else {
      spielminute = 'Ende';
    }

    const scoreHome = m.homeScore ?? '0';
    const scoreAway = m.awayScore ?? '0';
    return `**${m.homeTeam}** ${scoreHome} - ${scoreAway} **${m.awayTeam}**  (Anpfiff: ${startTime} Uhr, Spielminute: ${spielminute}')`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle('`🔴` Live Spiele')
    .setDescription(matchDescriptions)
    .setColor(0xFF0000)
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-system')
    .setDescription('Zeigt die Fußball-Übersicht an'),

  async execute(interaction) {
    const overviewEmbed = new EmbedBuilder()
      .setTitle('⚽ » Fußball Übersicht')
      .setDescription(
        'Die **Pro League** ist die höchste Spielklasse in unserem Fußball-Universum. Hier treffen die besten Mannschaften aufeinander, um Ruhm, Ehre und den begehrten Meistertitel zu kämpfen. Nur die stärksten Teams schaffen es in diese Liga – hier zählen Taktik, Teamgeist und Strategie.\n\n' +
        '- `💥` » **Spannende Matches** mit Live-Statistiken\n' +
        '- `🏆` » **Kampf um den Meistertitel** unter den besten Teams\n' +
        '- `📊` » **Detaillierte Spielerwerte** und Teamdaten\n\n' +
        'Klicke unten, um die aktuelle Tabelle, den nächsten Spieltag oder die Live-Spiele anzuzeigen.'
      )
      .setColor('Blurple');

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tabelle')
        .setLabel('📊 Tabelle')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('live')
        .setLabel('🔴 Live Spiele (BETA)')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('spieltag')
        .setLabel('📅 Nächster Spieltag')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [overviewEmbed], components: [buttonRow] });
    await interaction.followUp({ content: 'Fußball Info gesendet.', ephemeral: true });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Nur du darfst diese Buttons benutzen.', ephemeral: true });
      }

      await i.deferReply({ ephemeral: true });

      if (i.customId === 'tabelle') {
        const tabelleEmbed = await createTabelleEmbed();
        await i.editReply({ embeds: [tabelleEmbed], ephemeral: true });
      } else if (i.customId === 'spieltag') {
        const spieltagEmbed = await createNextMatchdayEmbed();
        await i.editReply({ embeds: [spieltagEmbed], ephemeral: true });
      } else if (i.customId === 'live') {
        const liveEmbed = await createLiveMatchesEmbed();
        await i.editReply({ embeds: [liveEmbed], ephemeral: true });
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (err) {
        console.error('Fehler beim Entfernen der Buttons:', err);
      }
    });
  }
};
