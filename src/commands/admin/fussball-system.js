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

const teamsData = [
  { name: "FC Adler", players: ["Müller", "Schmidt", "Fischer", "Weber"], stadium: "Adler Arena" },
  { name: "SV Löwen", players: ["Schneider", "Wagner", "Becker", "Hoffmann"], stadium: "Löwenstein-Stadion" },
  { name: "TSV Eiche", players: ["Bauer", "Koch", "Richter", "Klein"], stadium: "Stadion am Eichenweg" },
  { name: "SC Blau", players: ["Wolf", "Neumann", "Schröder", "Krüger"], stadium: "Blau-Weiß Arena" },
  { name: "VfB Stern", players: ["Hartmann", "Lange", "Schmitt", "Werner"], stadium: "Sternenfelder Stadion" },
  { name: "FC Rot-Weiß", players: ["Krause", "Meier", "Schulz", "Hahn"], stadium: "RW Arena" },
  { name: "SV Grünwald", players: ["König", "Fuchs", "Bergmann", "Lorenz"], stadium: "Grünwaldstadion" },
  { name: "TSV Nord", players: ["Frank", "Mayer", "Jung", "Albrecht"], stadium: "Nordstadion" },
  { name: "SC Süd", players: ["Böhm", "Engel", "Jäger", "Brandt"], stadium: "Südpark Stadion" },
  { name: "VfB West", players: ["Peters", "Simon", "Vogel", "Friedrich"], stadium: "Stadion am Westufer" },
  { name: "FC Ostwind", players: ["Paul", "Hoffmeister", "Bender", "Keller"], stadium: "Ostwind-Arena" },
  { name: "SV Nordstern", players: ["Mayerhofer", "Schulze", "Graf", "Krafft"], stadium: "Nordstern-Stadion" },
  { name: "TSV Berg", players: ["Winkler", "Horn", "Seidel", "Busch"], stadium: "Bergstadion" },
  { name: "SC Tal", players: ["Zimmermann", "Lutz", "Hahn", "Franke"], stadium: "Talgrund-Stadion" },
  { name: "VfB See", players: ["Döring", "Kuhn", "Voigt", "Bach"], stadium: "Seestadion" },
  { name: "FC Sturm", players: ["Schulz", "Ritter", "Heinrich", "Friedl"], stadium: "Sturmfeld Arena" },
  { name: "SV Blitz", players: ["Köhler", "Dietrich", "Eckert", "Löwe"], stadium: "Blitz Arena" },
  { name: "TSV Vulkan", players: ["Maier", "Groß", "Schulze", "Hoffmann"], stadium: "Vulkanstadion" },
  { name: "SC Frost", players: ["Schuster", "Brand", "Sauer", "Lang"], stadium: "Frostpark" },
  { name: "VfB Flamme", players: ["Reuter", "Schiller", "Born", "Herz"], stadium: "Flammenarena" },
  { name: "FC Donner", players: ["Lorenz", "Bauer", "Wolf", "Schmid"], stadium: "Donnerdom Arena" },
  { name: "SV Schatten", players: ["Ziegler", "Beck", "Kruse", "Hart"], stadium: "Schattenfeldstadion" },
  { name: "TSV Nebel", players: ["Lang", "Winter", "Schwarz", "Beier"], stadium: "Stadion am Nebelhang" },
  { name: "SC Licht", players: ["Günther", "Kaiser", "Sachs", "Mayer"], stadium: "Lichtstadion" }
];

// Erstellt das Tabellen-Embed
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

// Erstellt das Embed für den nächsten Spieltag
async function createNextMatchdayEmbed() {
  const now = new Date();

  const nextMatches = await Match.find({ date: { $gte: now } })
    .sort({ date: 1 })
    .limit(10);

  if (!nextMatches.length) {
    return new EmbedBuilder()
      .setTitle('`📅` Nächster Spieltag')
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
    .setTitle(`\`📅\` Nächster Spieltag: Spieltag ${nextMatchdayNumber}`)
    .setDescription(matchdayText)
    .setColor(0x00BFFF);
}

// Formatiert Spielminute
function formatMatchMinute(match) {
  const now = new Date();
  const diffMin = Math.floor((now - match.date) / 60000);
  if (diffMin < 0 && diffMin >= -5) return `0 (startet in ${Math.abs(diffMin)} Min)`;
  if (diffMin >= 0 && diffMin <= 90) return diffMin.toString();
  if (diffMin > 90 && diffMin <= 110) return `90+${diffMin - 90}`;
  if (diffMin < -5) return '0';
  return 'Ende';
}

// Einfaches Live Match Embed (Übersicht)
function createLiveMatchEmbed(match, liveCount) {
  const startTime = new Date(match.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const spielminute = formatMatchMinute(match);
  const scoreHome = match.homeScore ?? 0;
  const scoreAway = match.awayScore ?? 0;

  return new EmbedBuilder()
    .setTitle(`\`🔴\` Live Spiele: ${liveCount}`)
    .setDescription(`${match.homeTeam} ${scoreHome} - ${scoreAway} ${match.awayTeam} (Anpfiff: ${startTime} Uhr, Spielminute: ${spielminute}')`)
    .setColor(0xff0000)
    .setFooter({ text: 'Zuletzt aktualisiert'})
    .setTimestamp();
}

// Select Menü für Live Spiele Übersicht
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

// Aufstellung (optional)
      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${team1Name}:**\n${players1.length > 0 ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${team2Name}:**\n${players2.length > 0 ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

function getRandomPlayer(team) {
  const validPlayers = Array.isArray(team.players) ? team.players.filter(p => typeof p === 'string' && p.trim() !== '') : [];
  return validPlayers.length > 0 ? validPlayers[Math.floor(Math.random() * validPlayers.length)] : 'Unbekannter Spieler';
}

// Detailliertes Embed zu einem Live-Spiel mit Statistiken (Beispiel)
function createLiveMatchDetailEmbed(match, events = [], statusMessage, team1, team2, team1Name, team2Name, userTip) {
  const startTime = new Date(match.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const spielminute = formatMatchMinute(match);
  const scoreHome = match.homeScore ?? 0;
  const scoreAway = match.awayScore ?? 0;

  // Beispielwerte, bitte mit echten Daten ersetzen, falls vorhanden
  const xG1 = (match.xGHome ?? 0).toFixed(2);
  const xG2 = (match.xGAway ?? 0).toFixed(2);
  const yellowCardsHome = match.yellowCardsHome ?? 0;
  const yellowCardsAway = match.yellowCardsAway ?? 0;
  const cornersHome = match.cornersHome ?? 0;
  const cornersAway = match.cornersAway ?? 0;
  const ballPossessionHome = match.ballPossessionHome ?? 50;
  const ballPossessionAway = 100 - ballPossessionHome;

  let score1 = 0;
  let score2 = 0;
  let yellowCardsTeam1 = 0;
  let yellowCardsTeam2 = 0;
  let ballPossessionCountTeam1 = 0;
  let ballPossessionCountTeam2 = 0;
  let cornersTeam1 = 0;
  let cornersTeam2 = 0;
  let team1Passes = 0;
  let team2Passes = 0;
  let team1Shots = 0;
  let team2Shots = 0;
  let team1Tackles = 0;
  let team2Tackles = 0;
  let team1Saves = 0;
  let team2Saves = 0;

  const extraTime = Math.floor(Math.random() * 20) + 1;  // 1 bis 20 Minuten

  for (let minute = 1; minute <= 90 + extraTime; minute++) {
  const eventsBefore = events.length;  // Anzahl Events zu Beginn der Minute

  let torGezaehlt = true;
  let scorer = '';
  let xG = 0;

  if (minute % 4 === 0 && Math.random() < 0.25) {
    const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
    xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
    scorer = getRandomPlayer(teamScored === 'team1' ? team1 : team2);

    const fullTeam1Data = teamsData.find(t => t.name === match.team1);
    const stadium = fullTeam1Data?.stadium || 'Unbekanntes Stadion';

    if (!Array.isArray(events)) events = [];

    if (Math.random() < 0.4) { // Torversuch mit 40% Chance pro Minute
    const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
    xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
    scorer = getRandomPlayer(teamScored === 'team1' ? team1 : team2);
  
    let torGezaehlt = true; // Standard: Tor wird gezählt
  
    // VAR prüft Tor
    if (Math.random() < 0.1) {  // 10% Chance auf VAR-Check
      if (Math.random() < 0.5) { // 50% Chance auf Aberkennung
        torGezaehlt = false;
        events.push(`\`🖥️\` VAR-Überprüfung: Tor von **${scorer}** wird ABERKANNT \`❌\` - ${score1}-${score2} (${spielminute}')`);
      } else {
        events.push(`\`🖥️\` VAR-Überprüfung: Tor von **${scorer}** wird bestätigt \`✅\` - ${score1}-${score2} (${mspielinute}')`);
      }
    }
  
    if (torGezaehlt) {
      if (teamScored === 'team1') {
        score1++;
        xG1 += xG;
        events.push(`\`⚽\` TOOOR! - ${team1Name} - von **${scorer}** - ${score1}-${score2} (${spielminute}')`);
      } else {
        score2++;
        xG2 += xG;
        events.push(`\`⚽\` TOOOR! - ${team2Name} - von **${scorer}** - ${score1}-${score2} (${spielminute}')`);
      }
    }
   }
  }

  if (Math.random() < 0.5) team1Passes++; else team2Passes++;
  if (Math.random() < 0.3) team1Shots++; else team2Shots++;
  if (Math.random() < 0.2) team1Tackles++; else team2Tackles++;

  if (Math.random() < 0.15 && minute % 6 === 0) {
    const team = Math.random() < 0.5 ? 'team1' : 'team2';
    const player = getRandomPlayer(team === 'team1' ? team1 : team2);
    if (team === 'team1') yellowCardsTeam1++;
    else yellowCardsTeam2++;
    events.push(`\`🟨\` Gelbe Karte für **${player}** (${spielminute}')`);
  }

  if (Math.random() < 0.05) {
    const team = Math.random() < 0.5 ? team1Name : team2Name;
    const teamName = team === team1 ? team1Name : team2Name;
    events.push(`\`🎯\` Freistoß für ${teamName} (${spielminute}')`);
  }

  if (Math.random() < 0.04) {
    const team = Math.random() < 0.5 ? team1 : team2;
    const teamName = team === team1 ? team1Name : team2Name;
    const player = getRandomPlayer(team);
    events.push(`\`🏳️\` Abseits von ${teamName} durch **${player}** (${spielminute}')`);
  }

  if (Math.random() < 0.08) {
    const team = Math.random() < 0.5 ? team1 : team2;
    const teamName = team === team1 ? team1Name : team2Name;
    const player = getRandomPlayer(team);
    events.push(`\`🔥\` Gefährlicher Angriff von ${teamName} durch **${player}** (${spielminute}')`);
  }

  if (Math.random() < 0.03) {
    events.push(`\`⏸️\` Spielunterbrechung (${spielminute}')`);
  }

  if (Math.random() < 0.1) {
    const team = Math.random() < 0.5 ? 'team1' : 'team2';
    if (team === 'team1') cornersTeam1++;
    else cornersTeam2++;

    const teamName = team === 'team1' ? team1Name : team2Name;
    events.push(`\`🚩\` Ecke für ${teamName} (${spielminute}')`);
  }

  // *** HIER: Prüfen, ob mindestens ein Event in dieser Minute hinzugefügt wurde ***
  if (events.length === eventsBefore) {
    const neutralTeam = Math.random() < 0.5 ? team1Name : team2Name;
    events.push(`\`🕹️\` ${neutralTeam} im Ballbesitz (${spielminute}')`);
  }

  // Beispiel für Nachspielzeit und Schlusspfiff
  if (spielminute === 90) {
    events.push(`\`⏳\` Nachspielzeit beginnt! (+${extraTime}')`);
  }
  if (spielminute === 90 + extraTime) {
    events.push(`\`🔔\` Schlusspfiff! Endstand: **${team1Name} ${score1} - ${score2} ${team2Name}**`);
  }

    const fullTeam1Data = teamsData.find(t => t.name === match.team1);
    const stadium = fullTeam1Data?.stadium || 'Unbekanntes Stadion';

  return new EmbedBuilder()
    .setTitle(`\`🔴\` Live-Spiel Detail: ${match.homeTeam} vs ${match.awayTeam}`)
    .setDescription(`\`📍\` Austragungsort: **${stadium}**`)
    .addFields(
      { name: 'Spielminute', value: `${spielminute}'`, inline: true },
      { name: 'Spielstand', value: `${scoreHome} - ${scoreAway}`, inline: true },
      { name: 'xG', value: `${xG1} : ${xG2}`, inline: true },
      { name: 'Gelbe Karten', value: `\`🟨\` ${yellowCardsHome} - ${yellowCardsAway}`, inline: true },
      { name: 'Ballbesitz', value: `${ballPossessionHome}% - ${ballPossessionAway}%`, inline: true },
      { name: 'Ecken', value: `\`🚩\` ${cornersHome} - ${cornersAway}`, inline: true },
      { name: 'Ereignisse', value: events.slice(-5).join('\n') || 'Noch keine Ereignisse...' }
    )
    .setColor(0xff0000)
    .setFooter({ text: 'Zuletzt aktualisiert'})
    .setTimestamp();
}}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-system')
    .setDescription('Zeigt die Fußball-Übersicht an'),

  async execute(interaction) {

    const proLeagueTeams = await Team.find({ league: 'Pro League' });

      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);
      const team1Name = team1.name;
      const team2Name = team2.name;
  
      const odds = generateOdds();

      const fullTeam1Data = teamsData.find(t => t.name === team1.name);
      const stadium = fullTeam1Data?.stadium || 'Unbekanntes Stadion';

      function getTwoDifferentTeams(teams) {
        const team1Index = Math.floor(Math.random() * teams.length);
        let team2Index;
        do {
          team2Index = Math.floor(Math.random() * teams.length);
        } while (team2Index === team1Index);
        return [teams[team1Index], teams[team2Index]];
      }

      function generateOdds() {
        const probTeam1 = Math.random() * 0.5 + 0.25;
        const probTeam2 = Math.random() * (1 - probTeam1);
        const probDraw = 1 - probTeam1 - probTeam2;
      
        return {
          team1: 1 / probTeam1,
          draw: 1 / probDraw,
          team2: 1 / probTeam2,
        };
      }

    // Initiales Info-Embed mit Buttons
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

    const message = await interaction.fetchReply();

    // Collector für die Buttons
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000,
    });

    // State für Live-Spiel Navigation
    let liveMatches = [];
    let currentIndex = 0;
    let liveMessage;
    let updateInterval;

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Nur du darfst diese Buttons benutzen.', ephemeral: true });
      }

      if (i.customId === 'tabelle') {
        await i.deferReply({ ephemeral: true });
        const tabelleEmbed = await createTabelleEmbed();
        await i.editReply({ embeds: [tabelleEmbed], ephemeral: true });

      } else if (i.customId === 'spieltag') {
        await i.deferReply({ ephemeral: true });
        const spieltagEmbed = await createNextMatchdayEmbed();
        await i.editReply({ embeds: [spieltagEmbed], ephemeral: true });

      } else if (i.customId === 'live') {
        await i.deferReply({ ephemeral: false });

        const now = new Date();
        liveMatches = await Match.find({
          date: { $lte: now },
          endDate: { $gte: now },
        }).sort({ date: 1 });

        if (liveMatches.length === 0) {
          return i.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('`🔴` Live Spiele: 0')
                .setDescription('Zurzeit laufen keine Spiele.')
                .setColor(0xff0000),
            ],
            components: [],
          });
        }

        currentIndex = 0;
        liveMessage = await i.editReply({
          embeds: [createLiveMatchEmbed(liveMatches[currentIndex], liveMatches.length)],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('prev_match')
                .setLabel('⬅️ Vorherige Seite')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('next_match')
                .setLabel('➡️ Nächste Seite')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(liveMatches.length <= 1),
            ),
            new ActionRowBuilder().addComponents(createLiveMatchesSelectMenu(liveMatches)),
          ],
        });

        updateInterval = setInterval(async () => {
          try {
            const now = new Date();
            liveMatches = await Match.find({
              date: { $lte: now },
              endDate: { $gte: now },
            }).sort({ date: 1 });

            if (liveMatches.length === 0) {
              await liveMessage.edit({
                embeds: [
                  new EmbedBuilder()
                    .setTitle('`🔴` Live Spiele: 0')
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
              embeds: [createLiveMatchEmbed(liveMatches[currentIndex], liveMatches.length)],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('prev_match')
                    .setLabel('⬅️ Vorherige Seite')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === 0),
                  new ButtonBuilder()
                    .setCustomId('next_match')
                    .setLabel('➡️ Nächste Seite')
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
              embeds: [createLiveMatchEmbed(liveMatches[currentIndex], liveMatches.length)],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('prev_match')
                    .setLabel('⬅️ Vorherige Seite')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === 0),
                  new ButtonBuilder()
                    .setCustomId('next_match')
                    .setLabel('➡️ Nächste Seite')
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

              // Bei Auswahl detailliertes Live-Spiel-Embed zeigen
              const detailEmbed = createLiveMatchDetailEmbed(liveMatches[currentIndex]);

              await btnInt.update({
                embeds: [detailEmbed],
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId('prev_match')
                      .setLabel('⬅️ Vorherige Seite')
                      .setStyle(ButtonStyle.Secondary)
                      .setDisabled(currentIndex === 0),
                    new ButtonBuilder()
                      .setCustomId('next_match')
                      .setLabel('➡️ Nächste Seite')
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
      }
    });

    collector.on('end', () => {
      clearInterval(updateInterval);
      // Optional: clean up or disable buttons
    });
  },
};

/*
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
      .setTitle('\`📅\` Nächster Spieltag')
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
    .setTitle(`\`📅\` Nächster Spieltag: Spieltag ${nextMatchdayNumber}`)
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

function createLiveMatchEmbed(match, liveCount) {
  const startTime = new Date(match.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const spielminute = formatMatchMinute(match);
  const scoreHome = match.homeScore ?? 0;
  const scoreAway = match.awayScore ?? 0;

  return new EmbedBuilder()
    .setTitle(`\`🔴\` Live Spiele: ${liveCount}`)
    .setDescription(`${match.homeTeam} ${scoreHome} - ${scoreAway} ${match.awayTeam} (Anpfiff: ${startTime} Uhr, Spielminute: ${spielminute}')`)
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
                .setTitle(`\`🔴\` Live Spiele: 0`)
                .setDescription('Zurzeit laufen keine Spiele.')
                .setColor(0xff0000),
            ],
            components: [],
          });
        }

        currentIndex = 0;
        liveMessage = await i.editReply({
          embeds: [createLiveMatchEmbed(liveMatches[currentIndex], liveMatches.length)],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('prev_match')
                .setLabel('⬅️ Vorherige Seite')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('next_match')
                .setLabel('➡️ Nächste Seite')
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
                    .setTitle(`\`🔴\` Live Spiele: 0`)
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
              embeds: [createLiveMatchEmbed(liveMatches[currentIndex], liveMatches.length)],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('prev_match')
                    .setLabel('⬅️ Vorherige Seite')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === 0),
                  new ButtonBuilder()
                    .setCustomId('next_match')
                    .setLabel('➡️ Nächste Seite')
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
              embeds: [createLiveMatchEmbed(liveMatches[currentIndex], liveMatches.length)],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('prev_match')
                    .setLabel('⬅️ Vorherige Seite')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === 0),
                  new ButtonBuilder()
                    .setCustomId('next_match')
                    .setLabel('➡️ Nächste Seite')
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
                embeds: [createLiveMatchEmbed(liveMatches[currentIndex], liveMatches.length)],
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId('prev_match')
                      .setLabel('⬅️ Vorherige Seite')
                      .setStyle(ButtonStyle.Secondary)
                      .setDisabled(currentIndex === 0),
                    new ButtonBuilder()
                      .setCustomId('next_match')
                      .setLabel('➡️ Nächste Seite')
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
*/