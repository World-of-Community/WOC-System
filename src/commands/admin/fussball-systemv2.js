const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType 
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-systemv2')
    .setDescription('Zeigt die Fußball-Übersicht an und simuliert Spiele'),

  async execute(interaction) {
    await interaction.deferReply();

    function formatDate(date) {
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin'
      }).replace(',', ' -');
    }

    // Aktuelle Zeit
    const now = new Date();

    // Teams + Spiele laden
    const teams = await Team.find().sort({ points: -1, goalsFor: -1 });
    const upcomingMatches = await Match.find({ date: { $gte: now } }).sort({ date: 1 });

    // Live-Spiele: Spiele die gerade laufen (Start <= jetzt < Ende)
    const liveMatches = await Match.find({
      date: { $lte: now },
      endDate: { $gte: now }
    });

    // Set mit allen Teamnamen, die gerade live spielen
    const liveTeams = new Set();
    for (const match of liveMatches) {
      liveTeams.add(match.homeTeam);
      liveTeams.add(match.awayTeam);
    }

    const tabelleEmbed = new EmbedBuilder()
      .setTitle('\`📊\` Aktuelle Tabelle')
      .setColor('#0099ff');

    for (const [i, team] of teams.entries()) {
      const displayName = liveTeams.has(team.name) ? `\`🔴\` ${team.name}` : team.name;

      const recentMatches = await Match.find({
        $or: [
          { homeTeam: team.name },
          { awayTeam: team.name }
        ],
        score1: { $ne: null },
        score2: { $ne: null },
        date: { $lt: now }
      }).sort({ date: -1 }).limit(5);

      const last5 = recentMatches.map(match => {
        const isHome = match.homeTeam === team.name;
        const teamGoals = isHome ? match.score1 : match.score2;
        const opponentGoals = isHome ? match.score2 : match.score1;
        if (teamGoals > opponentGoals) return '`✅`';
        if (teamGoals < opponentGoals) return '`❌`';
        return '`➖`';
      }).join(' ');

      tabelleEmbed.addFields({
        name: `${i + 1}. ${displayName}`,
        value: `Spiele: ${team.played} | S: ${team.won} | U: ${team.draw} | N: ${team.lost} | Tore: ${team.goalsFor} | GT: ${team.goalsAgainst} | TD: ${team.goalsFor - team.goalsAgainst} | Pkte: **${team.points}**\nLetzte 5: ${last5 || '–'}`,
        inline: false
      })
    }

    // Nächstes Spiel Embed
    const nextMatch = upcomingMatches[0];
    const naechstesSpielEmbed = new EmbedBuilder()
      .setTitle('\`🏟️\` Nächstes Spiel')
      .setColor('#00cc66');
    if (nextMatch) {
      naechstesSpielEmbed.setDescription(
        `**${nextMatch.homeTeam}** vs **${nextMatch.awayTeam}**\n` +
        `\`📅\` ${formatDate(nextMatch.date)} Uhr`
      );
    } else {
      naechstesSpielEmbed.setDescription('Kein Spiel geplant.');
    }

    // Spieltag Embed
    const ersterSpieltag = nextMatch?.matchday ?? null;
    const spieltagMatches = await Match.find({ matchday: ersterSpieltag }).sort({ date: 1 });
    const spieltagEmbed = new EmbedBuilder()
      .setTitle(`\`📅\` Spieltag: ${ersterSpieltag ?? 'N/A'}`)
      .setColor('#ffaa00');
    if (spieltagMatches.length) {
      for (const match of spieltagMatches) {
        spieltagEmbed.addFields({
          name: `${match.homeTeam} vs ${match.awayTeam}`,
          value: `\`🕒\` ${formatDate(match.date)} Uhr`,
          inline: false
        });
      }
    } else {
      spieltagEmbed.setDescription('Keine Spiele anstehend.');
    }

    // Übersicht Embed + Select-Menü
    const overviewEmbed = new EmbedBuilder()
      .setTitle('\`⚽\` » Fußball Übersicht')
      .setDescription(
        'Die **Pro League** ist die höchste Spielklasse in unserem Fußball-Universum. Hier treffen die besten Mannschaften aufeinander, um Ruhm, Ehre und den begehrten Meistertitel zu kämpfen.\n\n' +
        '- `💥` » **Spannende Matches** mit Live-Statistiken\n' +
        '- `🏆` » **Kampf um den Meistertitel** unter den besten Teams\n' +
        '- `📊` » **Detaillierte Spielerwerte** und Teamdaten\n\n' +
        'Klicke unten, um die aktuelle Tabelle, das nächste Spiel oder den nächsten Spieltag anzuzeigen.'
      )
      .setColor('Blurple');

    const auswahlMenü = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('fussball-info-menu')
        .setPlaceholder('📋 » Informationen auswählen')
        .addOptions(
          { label: '📊 Aktuelle Tabelle', value: 'tabelle' },
          { label: '🏟️ Nächstes Spiel', value: 'naechstes_spiel' },
          { label: '📅 Nächster Spieltag', value: 'spieltag' },
          { label: '⚽ Zufallsspiel starten', value: 'zufallsspiel' },
        )
    );

    const msg = await interaction.editReply({ embeds: [overviewEmbed], components: [auswahlMenü] });

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: '> \`❌\` Nur du darfst das benutzen.', ephemeral: true });

      await i.deferUpdate();

      switch (i.values[0]) {
        case 'tabelle':
          await i.followUp({ embeds: [tabelleEmbed] });
          break;
        case 'naechstes_spiel':
          await i.followUp({ embeds: [naechstesSpielEmbed] });
          break;
        case 'spieltag':
          await i.followUp({ embeds: [spieltagEmbed] });
          break;
        case 'zufallsspiel':
          await simulateRandomMatch(i);
          break;
      }
    });
  }
};

function getTwoDifferentTeams(teams) {
  const idx1 = Math.floor(Math.random() * teams.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * teams.length);
  } while (idx2 === idx1);
  return [teams[idx1], teams[idx2]];
}

function getRandomPlayer(team) {
  if (!team.players || team.players.length === 0) return 'Unbekannter Spieler';
  return team.players[Math.floor(Math.random() * team.players.length)];
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/*
function getDisplayMinute(minute, extraTimeFirstHalf, extraTimeSecondHalf) {
  if (minute < 45) return `${minute}'`;
  
  if (minute >= 45 && minute < 45 + extraTimeFirstHalf) {
    return `45' +${minute - 45}`;
  }

  if (minute >= 45 + extraTimeFirstHalf && minute <= 50 + extraTimeFirstHalf) {
    return `45' +${extraTimeFirstHalf} (Pause)`;
  }

  const zweiteHalbzeit = minute - (50 + extraTimeFirstHalf); // Pause ist 5 Min lang
  const spielminute = 46 + zweiteHalbzeit;

  if (spielminute <= 90) return `${spielminute}'`;

  if (spielminute > 90 && spielminute <= 90 + extraTimeSecondHalf) {
    return `90' +${spielminute - 90}`;
  }

  return `${spielminute}'`;
}
*/

const extraTimeFirstHalf = Math.floor(Math.random() * 10) + 1; // 1-10 Minuten Nachspielzeit 1. Halbzeit
const extraTimeSecondHalf = Math.floor(Math.random() * 20) + 1; // 1-20 Minuten Nachspielzeit 2. Halbzeit

const pauseDuration = 5; // 5 Minuten Pause

const totalMatchTime = 45 + extraTimeFirstHalf + pauseDuration + 45 + extraTimeSecondHalf; // Gesamtminuten inklusive Pause

function getDisplayMinute(minute) {
  if (minute <= 45) {
    // Erste Halbzeit normale Zeit
    return `${minute}'`;
  } else if (minute <= 45 + extraTimeFirstHalf) {
    // Erste Halbzeit Nachspielzeit
    return `45' +${minute - 45}`;
  } else if (minute <= 45 + extraTimeFirstHalf + pauseDuration) {
    // Pause anzeigen
    return `Pause`;
  } else if (minute <= 45 + extraTimeFirstHalf + pauseDuration + 45) {
    // Zweite Halbzeit normale Zeit
    const secondHalfMinute = minute - (45 + extraTimeFirstHalf + pauseDuration);
    return `${45 + secondHalfMinute}'`;
  } else {
    // Zweite Halbzeit Nachspielzeit
    const secondHalfExtra = minute - (45 + extraTimeFirstHalf + pauseDuration + 45);
    return `90' +${secondHalfExtra}`;
  }
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

async function simulateRandomMatch(interaction) {
  const proLeagueTeams = await Team.find({ league: 'Pro League' });
  if (!proLeagueTeams || proLeagueTeams.length < 2) {
    return interaction.followUp({ content: '> \`❌\` Nicht genug Teams in Pro League.', ephemeral: true });
  }

  const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);
  const team1Name = team1.name;
  const team2Name = team2.name;
  const fullTeam1Data = teamsData.find(t => t.name === team1Name);
  const stadium = fullTeam1Data?.stadium || 'Unbekanntes Stadion';

  const odds = generateOdds();

  const embedStatus = new EmbedBuilder()
    .setTitle(`\`🏟️\` Fußballspiel: ${team1Name} vs. ${team2Name}`)
    .setDescription(`\`📍\` Austragungsort: **${stadium}**`)
    .setColor('Green')
    .addFields(
      { name: 'Spielminute', value: '0\'', inline: true },
      { name: 'Spielstand', value: '0 - 0', inline: true },
      { name: 'xG', value: '0.00 - 0.00', inline: true },
      { name: 'Gelbe Karten', value: '\`🟨\` 0-0', inline: true },
      { name: 'Ballbesitz', value: '0% - 0%', inline: true },
      { name: 'Ecken', value: '\`🚩\` 0-0', inline: true },
      { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
    )
    .setImage('https://media.istockphoto.com/id/179518838/de/vektor/realistische-vektor-fu%C3%9Fball-fu%C3%9Fballplatz.jpg?s=612x612&w=0&k=20&c=1eyMFLfUuGZtZm8VCbLjEIo68OzOuQEoHe5zq8teRWQ=');

  // Aufstellung Embed
  const players1 = teamsData.find(t => t.name === team1Name)?.players || [];
  const players2 = teamsData.find(t => t.name === team2Name)?.players || [];
  const embedLineup = new EmbedBuilder()
    .setTitle('\`📋\` Aufstellung')
    .setColor('Blue')
    .setDescription(
      `**${team1Name}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
      `**${team2Name}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
    );

  // Tipp-Buttons
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('win_team1')
      .setLabel(`${team1Name} gewinnt (${odds.team1.toFixed(2)})`)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('draw')
      .setLabel(`Unentschieden (${odds.draw.toFixed(2)})`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('win_team2')
      .setLabel(`${team2Name} gewinnt (${odds.team2.toFixed(2)})`)
      .setStyle(ButtonStyle.Primary),
  );

  // Erstes Reply (Status)
  const statusMessage = await interaction.followUp({ embeds: [embedStatus], fetchReply: true });
  // Zweites Reply (Aufstellung + Buttons)
  await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

  // Button Collector für Tipps
  const filter = i => i.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button });

  let userTip;

  collector.on('collect', async i => {
    switch (i.customId) {
      case 'win_team1': userTip = 'team1'; break;
      case 'draw': userTip = 'draw'; break;
      case 'win_team2': userTip = 'team2'; break;
    }
    await i.update({ content: '\`⏳\` Anpfiff in wenigen Sekunden...', embeds: [], components: [] });
    collector.stop();
    await delay(3000);
    await interaction.followUp({ content: '\`🔊\` **Anpfiff! Das Spiel beginnt!** \`⚽\`' });
    await simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip);
  });

  collector.on('end', async collected => {
    if (collected.size === 0) {
      await interaction.followUp({ content: '\`⏱️\` Zeit abgelaufen, kein Tipp abgegeben.' });
    }
  });
}

async function simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip) {
  let score1 = 0, score2 = 0;
  let xG1 = 0, xG2 = 0;
  let yellowCardsTeam1 = 0, yellowCardsTeam2 = 0;
  let cornersTeam1 = 0, cornersTeam2 = 0;
  let team1Passes = 0, team2Passes = 0;
  let team1Shots = 0, team2Shots = 0;
  let team1Tackles = 0, team2Tackles = 0;
  let team1Saves = 0, team2Saves = 0;

  const extraTime = Math.floor(Math.random() * 20) + 1;

  const pauseStart = 45 + extraTime;
  const pauseEnd = pauseStart + 5;

  const events = [`\`🔊\` Anpfiff! Das Spiel beginnt! (0')`];

  for (let minute = 1; minute <= 90 + extraTime; minute++) {
    let torGezaehlt = true;
    let scorer = '';
    let xG = 0;

    const extraTimeFirstHalf = Math.floor(Math.random() * 10) + 1; // 1-10 Minuten Nachspielzeit 1. Halbzeit
    const extraTimeSecondHalf = Math.floor(Math.random() * 20) + 1; // 1-20 Minuten Nachspielzeit 2. Halbzeit

    // Halbzeitpause starten
    if (minute === pauseStart + 1) {
      events.push(`\`⏸️\` Halbzeitpause. (${getDisplayMinute(minute - 1, extraTime)})`);
    }

    // Zweite Halbzeit starten
    if (minute === pauseEnd + 1) {
      events.push(`\`▶️\` 2. Halbzeit startet! (${getDisplayMinute(minute - 1, extraTime)})`);
    }

    // Während der Pause keine Aktionen, nur warten und keine Status-Aktualisierung
    if (minute > pauseStart && minute <= pauseEnd) {
      await delay(1000);
      continue;
    }

    // Torchance alle 4 Minuten mit 25% Wahrscheinlichkeit
    if (minute % 4 === 0 && Math.random() < 0.25) {
      const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
      xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
      scorer = getRandomPlayer(teamScored === 'team1' ? team1 : team2);

      // VAR-Check mit 10% Chance
      if (Math.random() < 0.1) {
        if (Math.random() < 0.5) {
          torGezaehlt = false;
          events.push(`\`🖥️\` VAR: Tor von **${scorer}** aberkannt \`❌\` | ${score1} - ${score2} (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
        } else {
          events.push(`\`🖥️\` VAR: Tor von **${scorer}** bestätigt \`✅\` | ${score1} - ${score2} (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
        }
      }

      if (torGezaehlt) {
        if (teamScored === 'team1') {
          score1++;
          xG1 += xG;
        } else {
          score2++;
          xG2 += xG;
        }
        events.push(`\`⚽\` TOOOR! für ${teamScored === 'team1' ? team1Name : team2Name} durch **${scorer}**! ${score1} - ${score2} (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
      }
    }

    if (Math.random() < 0.015) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const opponentName = team === team1 ? team2Name : team1Name;
      const teamName = team === team1 ? team1Name : team2Name;
      const player = getRandomPlayer(team);
    
      if (Math.random() < 0.5) {
        events.push(`\`🖥️\` VAR prüft ein Foul von **${player}** (${teamName}) \`✅\` Elfmeter für ${opponentName}! (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
      } else {
        events.push(`\`🖥️\` VAR prüft ein Foul von **${player}** (${teamName}) \`❌\` Kein Elfmeter. (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
      }
    }

    // Gelbe Karte alle 7 Minuten mit 15% Wahrscheinlichkeit
    if (minute % 7 === 0 && Math.random() < 0.15) {
      const teamCard = Math.random() < 0.5 ? 'team1' : 'team2';
      const teamName = teamCard === 'team1' ? team1Name : team2Name;
      const player = getRandomPlayer(teamCard === 'team1' ? team1 : team2);
      if (teamCard === 'team1') yellowCardsTeam1++; else yellowCardsTeam2++;
      events.push(`\`🟨\` Gelbe Karte für **${player}** (${teamName}) (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    // Ecken alle 5 Minuten mit 20% Wahrscheinlichkeit
    if (minute % 5 === 0 && Math.random() < 0.2) {
      const teamCorner = Math.random() < 0.5 ? 'team1' : 'team2';
      const teamName = teamCorner === 'team1' ? team1Name : team2Name;
      if (teamCorner === 'team1') cornersTeam1++; else cornersTeam2++;
      events.push(`\`🚩\` Ecke für ${teamName} (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.08) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const player = getRandomPlayer(team);
      const teamName = team === team1 ? team1Name : team2Name;
      events.push(`\`🔥\` Gefährlicher Angriff von ${teamName} durch **${player}** (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.05) {
      const team = Math.random() < 0.5 ? team1Name : team2Name;
      events.push(`\`🎯\` Freistoß für ${team} (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.04) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const player = getRandomPlayer(team);
      events.push(`\`🏳️\` Abseits von ${(team === team1 ? team1Name : team2Name)} durch **${player}** (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.15) {
      const team = Math.random() < 0.5 ? team1 : team2;
      events.push(`\`🕹️\` ${(team === team1 ? team1Name : team2Name)} im Ballbesitz (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.01) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const player = getRandomPlayer(team);
      const teamName = team === team1 ? team1Name : team2Name;
      events.push(`\`🚑\` **${player}** (${teamName}) hat sich verletzt. Kurze Unterbrechung. (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (minute % 15 === 0 && Math.random() < 0.2) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const playerOut = getRandomPlayer(team);
      const playerIn = getRandomPlayer(team);
      const teamName = team === team1 ? team1Name : team2Name;
      events.push(`\`🔁\` Auswechslung bei ${teamName}: **${playerOut}** geht raus, **${playerIn}** kommt rein. (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.06) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const player = getRandomPlayer(team);
      const treffer = Math.random() < 0.5 ? 'Latten' : 'Pfosten';
      events.push(`\`💥\` ${treffer}schuss von ${(team === team1 ? team1Name : team2Name)} durch **${player}** (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.04) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const player = getRandomPlayer(team);
      events.push(`\`🚀\` Weitschuss von **${player}** ${team === team1 ? team1Name : team2Name} knapp drüber! (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    if (Math.random() < 0.03) {
      events.push(`\`⏸️\` Spielunterbrechung (${getDisplayMinute(minute, extraFirstHalf, extraSecondHalf)})`);
    }

    // Ballbesitz & Aktionen jede Minute aktualisieren
    team1Passes += Math.floor(Math.random() * 5);
    team2Passes += Math.floor(Math.random() * 5);
    team1Shots += Math.floor(Math.random() * 2);
    team2Shots += Math.floor(Math.random() * 2);
    team1Tackles += Math.floor(Math.random() * 2);
    team2Tackles += Math.floor(Math.random() * 2);
    team1Saves += Math.floor(Math.random() * 1);
    team2Saves += Math.floor(Math.random() * 1);

    // Ballbesitz in Prozent
    const totalPasses = team1Passes + team2Passes;
    const ballBesitzTeam1 = totalPasses ? Math.round((team1Passes / totalPasses) * 100) : 50;
    const ballBesitzTeam2 = totalPasses ? Math.max(0, Math.min(100, 100 - ballBesitzTeam1)) : 50;

    const fullTeam1Data = teamsData.find(t => t.name === team1Name);
    const stadium = fullTeam1Data?.stadium || 'Unbekanntes Stadion';

    // Status-Embed aktualisieren
    const statusEmbed = new EmbedBuilder()
      .setTitle(`\`🏟️\` Fußballspiel: ${team1Name} vs. ${team2Name}`)
      .setDescription(`\`📍\` Austragungsort: **${stadium}**`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: getDisplayMinute(minute, extraFirstHalf, extraSecondHalf), inline: true },
        { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} - ${xG2.toFixed(2)}`, inline: true },
        { name: 'Gelbe Karten', value: `\`🟨\` ${yellowCardsTeam1}-${yellowCardsTeam2}`, inline: true },
        { name: 'Ballbesitz', value: `${ballBesitzTeam1}% - ${ballBesitzTeam2}%`, inline: true },
        { name: 'Ecken', value: `\`🚩\` ${cornersTeam1}-${cornersTeam2}`, inline: true },
        { name: 'Ereignisse', value: events.slice(-5).join('\n') || 'Noch keine Ereignisse...' }
      )
      .setImage('https://media.istockphoto.com/id/179518838/de/vektor/realistische-vektor-fu%C3%9Fball-fu%C3%9Fballplatz.jpg?s=612x612&w=0&k=20&c=1eyMFLfUuGZtZm8VCbLjEIo68OzOuQEoHe5zq8teRWQ=');

    await statusMessage.edit({ embeds: [statusEmbed] });

    await delay(1000); // 1,0 Sekunden Pause pro Minute (kann angepasst werden)

    const extraFirstHalf = Math.floor(Math.random() * 10) + 1; // 1 bis 10 Minuten Nachspielzeit 1. Halbzeit
    const extraSecondHalf = Math.floor(Math.random() * 20) + 1; // 1 bis 20 Minuten Nachspielzeit 2. Halbzeit

    if (minute === 45) {
      events.push(`\`⏳\` Nachspielzeit 1. Halbzeit: +${extraFirstHalf}'`);
    }

    if (minute === 90) {
      events.push(`\`⏳\` Nachspielzeit: +${extraSecondHalf}'`);
    }

    if (minute === 90 + extraTime) {
      events.push(`\`🔔\` Schlusspfiff! Endstand: **${team1Name} ${score1} - ${score2} ${team2Name}**`);

      // Ergebnis auswerten, Tipp checken und abschließen
      let result;
      if (score1 > score2) result = 'team1';
      else if (score2 > score1) result = 'team2';
      else result = 'draw';

      // Tipp auswerten und User benachrichtigen
      if (userTip === result) {
        await interaction.followUp(`> \`🎉\` Dein Tipp war korrekt! Das Ergebnis: **${team1Name} ${score1} - ${score2} ${team2Name}**`);
      } else if (userTip) {
        await interaction.followUp(`> \`❌\` Dein Tipp war leider falsch. Das Ergebnis: **${team1Name} ${score1} - ${score2} ${team2Name}**`);
      } else {
        await interaction.followUp(`Das Spiel ist beendet. Ergebnis: **${team1Name} ${score1} - ${score2} ${team2Name}**`);
      }
      break;
    }
  }
}
