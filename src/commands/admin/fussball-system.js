const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  StringSelectMenuBuilder,
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
    endDate: { $gte: liveNow }
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

function formatMatchMinute(match) {
  const now = new Date();
  const diffMin = Math.floor((now - match.date) / 60000);
  if (diffMin < 0 && diffMin >= -5) return `0 (startet in ${Math.abs(diffMin)} Min)`;
  if (diffMin >= 0 && diffMin <= 90) return diffMin.toString();
  if (diffMin > 90 && diffMin <= 110) return `90+${diffMin - 90}`;
  if (diffMin < -5) return '0';
  return 'Ende';
}

function createLiveMatchEmbed(match) {
  const startTime = new Date(match.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const spielminute = formatMatchMinute(match);
  const scoreHome = match.homeScore ?? 0;
  const scoreAway = match.awayScore ?? 0;

  return new EmbedBuilder()
    .setTitle(`🔴 Live Spiel: ${match.homeTeam} vs ${match.awayTeam}`)
    .setDescription(`Anpfiff: ${startTime} Uhr\nSpielminute: ${spielminute}'\n\n**${match.homeTeam}** ${scoreHome} - ${scoreAway} **${match.awayTeam}**`)
    .setColor(0xff0000)
    .setTimestamp();
}

function createLiveMatchesSelectMenu(liveMatches) {
  return new StringSelectMenuBuilder()
    .setCustomId('live_match_select')
    .setPlaceholder('Wähle ein Live-Spiel')
    .addOptions(
      liveMatches.map((match, idx) => ({
        label: `${match.homeTeam} vs ${match.awayTeam}`,
        description: `Anpfiff: ${new Date(match.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
        value: idx.toString(),
      }))
    );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-system')
    .setDescription('Zeigt die Fußball-Übersicht an'),

  async execute(interaction) {
    const overviewEmbed = new EmbedBuilder()
      .setTitle('`⚽` » Fußball Übersicht')
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
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000,
    });

    // Zustand für Live-Spiel Navigation
    let liveMatches = [];
    let currentIndex = 0;
    let liveMessage;
    let updateInterval;

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Nur du darfst diese Buttons benutzen.', ephemeral: true });
      }

      if (i.customId === 'live') {
        await i.deferReply({ ephemeral: false });

        let now = new Date();
        liveMatches = await Match.find({
          date: { $lte: now },
          endDate: { $gte: now },
        }).sort({ date: 1 });

        if (liveMatches.length === 0) {
          return i.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('🔴 Live Spiele')
                .setDescription('Zurzeit laufen keine Spiele.')
                .setColor(0xff0000),
            ],
            components: [],
          });
        }

        currentIndex = 0;
        liveMessage = await i.editReply({
          embeds: [createLiveMatchEmbed(liveMatches[currentIndex])],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('prev_match')
                .setLabel('⬅️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('next_match')
                .setLabel('➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(liveMatches.length <= 1),
            ),
            new ActionRowBuilder().addComponents(createLiveMatchesSelectMenu(liveMatches)),
          ],
        });

        // Alle 60 Sekunden automatisch aktualisieren
        updateInterval = setInterval(async () => {
          try {
            now = new Date();
            liveMatches = await Match.find({
              date: { $lte: now },
              endDate: { $gte: now },
            }).sort({ date: 1 });

            if (liveMatches.length === 0) {
              await liveMessage.edit({
                embeds: [
                  new EmbedBuilder()
                    .setTitle('🔴 Live Spiele')
                    .setDescription('Zurzeit laufen keine Spiele.')
                    .setColor(0xff0000),
                ],
                components: [],
              });
              clearInterval(updateInterval);
              return;
            }

            if (currentIndex >= liveMatches.length) currentIndex = liveMatches.length - 1;
            if (currentIndex < 0) currentIndex = 0;

            await liveMessage.edit({
              embeds: [createLiveMatchEmbed(liveMatches[currentIndex])],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('prev_match')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === 0),
                  new ButtonBuilder()
                    .setCustomId('next_match')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === liveMatches.length - 1),
                ),
                new ActionRowBuilder().addComponents(createLiveMatchesSelectMenu(liveMatches)),
              ],
            });
          } catch (error) {
            console.error('Fehler beim Aktualisieren des Live-Embeds:', error);
            clearInterval(updateInterval);
          }
        }, 60 * 1000);

        const filter = btnInt => btnInt.user.id === i.user.id;

        const liveCollector = liveMessage.createMessageComponentCollector({
          filter,
          time: 5 * 60 * 1000,
        });

        liveCollector.on('collect', async btnInt => {
          if (btnInt.isButton()) {
            if (btnInt.customId === 'prev_match') {
              currentIndex = Math.max(0, currentIndex - 1);
            } else if (btnInt.customId === 'next_match') {
              currentIndex = Math.min(liveMatches.length - 1, currentIndex + 1);
            }

            await btnInt.update({
              embeds: [createLiveMatchEmbed(liveMatches[currentIndex])],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('prev_match')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === 0),
                  new ButtonBuilder()
                    .setCustomId('next_match')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === liveMatches.length - 1),
                ),
                new ActionRowBuilder().addComponents(createLiveMatchesSelectMenu(liveMatches)),
              ],
            });
          } else if (btnInt.isStringSelectMenu()) {
            const selectedIndex = parseInt(btnInt.values[0], 10);
            if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < liveMatches.length) {
              currentIndex = selectedIndex;
              await btnInt.update({
                embeds: [createLiveMatchEmbed(liveMatches[currentIndex])],
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId('prev_match')
                      .setLabel('⬅️')
                      .setStyle(ButtonStyle.Secondary)
                      .setDisabled(currentIndex === 0),
                    new ButtonBuilder()
                      .setCustomId('next_match')
                      .setLabel('➡️')
                      .setStyle(ButtonStyle.Secondary)
                      .setDisabled(currentIndex === liveMatches.length - 1),
                  ),
                  new ActionRowBuilder().addComponents(createLiveMatchesSelectMenu(liveMatches)),
                ],
              });
            } else {
              await btnInt.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
            }
          }
        });

        liveCollector.on('end', async () => {
          clearInterval(updateInterval);
          try {
            await liveMessage.edit({ components: [] });
          } catch {}
        });

      } else if (i.customId === 'tabelle') {
        await i.deferReply({ ephemeral: true });
        const tabelleEmbed = await createTabelleEmbed();
        await i.editReply({ embeds: [tabelleEmbed], ephemeral: true });

      } else if (i.customId === 'spieltag') {
        await i.deferReply({ ephemeral: true });
        const spieltagEmbed = await createNextMatchdayEmbed();
        await i.editReply({ embeds: [spieltagEmbed], ephemeral: true });
      }
    });

    collector.on('end', () => {
      // Haupt-Collector Ende
    });
  },
};
