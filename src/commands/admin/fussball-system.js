// /fussball-system.js
// Ein komplettes, automatisches Fußballsystem in EINER MongoDB-Collection (League).
// Benötigt: discord.js v14, mongoose bereits verbunden (z.B. in bot startup).
// Einfach einbauen und bei Bedarf anpassen.

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} = require('discord.js');

const mongoose = require('mongoose');

// ------------------------------
// ⚠️ Stelle sicher, dass Mongoose bereits verbunden ist.
// Beispiel (in deinem bot-startup): 
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI);
// ------------------------------

// ------------------------------
// Initial TeamsData (deine Liste, kannst du erweitern/ändern)
// ------------------------------
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

// ------------------------------
// Mongoose: League Schema (ein Dokument hält Teams + Matches + Settings)
// ------------------------------
const TeamSubSchema = new mongoose.Schema({
  name: String,
  players: [String],
  stadium: String,
  // Statistik-Felder
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  points: { type: Number, default: 0 }
}, { _id: false });

const MatchSubSchema = new mongoose.Schema({
  homeTeam: String,
  awayTeam: String,
  date: Date,
  matchday: Number,
  score1: { type: Number, default: null },
  score2: { type: Number, default: null },
  events: [String],
  live: { type: Boolean, default: false },
  endDate: Date
}, { _id: false });

const LeagueSchema = new mongoose.Schema({
  name: { type: String, default: 'Pro League' },
  teams: [TeamSubSchema],
  matches: [MatchSubSchema],
  settings: {
    minuteDurationMs: { type: Number, default: 1000 }, // 1s per minute simulated (anpassen)
  }
});

const League = mongoose.models.League || mongoose.model('League', LeagueSchema);

// ------------------------------
// Helferfunktionen
// ------------------------------
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function getRandomPlayer(team) {
  if (!team || !team.players || team.players.length === 0) return 'Unbekannter Spieler';
  return team.players[Math.floor(Math.random() * team.players.length)];
}
function getTwoDifferentIndices(len) {
  const a = Math.floor(Math.random() * len);
  let b;
  do { b = Math.floor(Math.random() * len); } while (b === a);
  return [a, b];
}
function formatDateDE(date) {
  return new Date(date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }).replace(',', ' -');
}

// Bereite League-Dokument vor (falls leer -> initialisiere Teams)
async function getOrCreateLeague() {
  let league = await League.findOne({});
  if (!league) {
    const teams = teamsData.map(t => ({
      name: t.name, players: t.players, stadium: t.stadium
    }));
    league = await League.create({ teams, matches: [] });
  }
  return league;
}

// Tabelle sortieren (Punkte, Tordifferenz, Tore)
function sortTable(teams) {
  return teams.slice().sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

// ------------------------------
// Haupt-Command-Export
// ------------------------------
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-system')
    .setDescription('Automatisches Fußballsystem (Pro League) — Tabelle, Live-Simulation, Zufallsspiel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const league = await getOrCreateLeague();
    const now = new Date();

    // Lade anstehende Matches (>= jetzt)
    const upcomingMatches = (league.matches || []).filter(m => !m.score1 && (!m.date || m.date >= now)).sort((a,b) => (a.date||0) - (b.date||0));
    const liveMatches = (league.matches || []).filter(m => m.live);

    // Erstelle Tabelle-Embed
    const tableSorted = sortTable(league.teams);
    const tabelleEmbed = new EmbedBuilder()
      .setTitle('`📊` Aktuelle Tabelle')
      .setColor('#0099ff');

    for (let i = 0; i < tableSorted.length; i++) {
      const team = tableSorted[i];
      const displayName = (liveMatches.some(lm => lm.homeTeam === team.name || lm.awayTeam === team.name)) ? `\`🔴\` ${team.name}` : team.name;
      tabelleEmbed.addFields({
        name: `${i + 1}. ${displayName}`,
        value: `Spiele: ${team.played} | S: ${team.won} | U: ${team.draw} | N: ${team.lost} | Tore: ${team.goalsFor} | GT: ${team.goalsAgainst} | TD: ${team.goalsFor - team.goalsAgainst} | Pkte: **${team.points}**`,
        inline: false
      });
    }

    // Nächstes Spiel-Embed
    const nextMatch = upcomingMatches[0];
    const naechstesSpielEmbed = new EmbedBuilder().setTitle('`🏟️` Nächstes Spiel').setColor('#00cc66');
    if (nextMatch) {
      naechstesSpielEmbed.setDescription(`**${nextMatch.homeTeam}** vs **${nextMatch.awayTeam}**\n\`📅\` ${formatDateDE(nextMatch.date)} Uhr`);
    } else {
      naechstesSpielEmbed.setDescription('Kein Spiel geplant.');
    }

    // Overview Embed + Auswahlmenü
    const overviewEmbed = new EmbedBuilder()
      .setTitle('`⚽` » Fußball Übersicht')
      .setDescription('Wähle eine Option: Tabelle, Nächstes Spiel, Zufallsspiel starten.')
      .setColor('Blurple');

    const auswahlMenü = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('fussball-info-menu')
        .setPlaceholder('📋 » Informationen auswählen')
        .addOptions(
          { label: '📊 Aktuelle Tabelle', value: 'tabelle' },
          { label: '🏟️ Nächstes Spiel', value: 'naechstes_spiel' },
          { label: '⚽ Zufallsspiel starten', value: 'zufallsspiel' },
        )
    );

    await interaction.editReply({ content: 'Übersicht erstellt — wähle unten eine Option (ephemeral).', ephemeral: true });
    const msg = await interaction.channel.send({ embeds: [overviewEmbed], components: [auswahlMenü] });

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '> ❌ Nur du darfst das benutzen.', ephemeral: true });
      }
      await i.deferUpdate();

      switch (i.values[0]) {
        case 'tabelle':
          await i.channel.send({ embeds: [tabelleEmbed] });
          break;
        case 'naechstes_spiel':
          await i.channel.send({ embeds: [naechstesSpielEmbed] });
          break;
        case 'zufallsspiel':
          await startRandomMatch(interaction);
          break;
        default:
          await i.channel.send('Unbekannte Option.');
      }
    });

    collector.on('end', () => {
      // optional: Komponenten entfernen
      try { msg.edit({ components: [] }); } catch (e) { /* ignore */ }
    });
  }
};

// ------------------------------
// Zufallsspiel starten -> benutzt League-Dokument, aktualisiert Matches + Teams
// ------------------------------
async function startRandomMatch(interaction) {
  const league = await getOrCreateLeague();
  if (!league.teams || league.teams.length < 2) {
    return interaction.followUp({ content: '`❌` Nicht genug Teams in der Liga.', ephemeral: true });
  }

  const [i1, i2] = getTwoDifferentIndices(league.teams.length);
  const team1 = league.teams[i1];
  const team2 = league.teams[i2];
  const stadium = team1.stadium || 'Unbekanntes Stadion';

  // Erstelle Match-Eintrag und setze live = true
  const matchEntry = {
    homeTeam: team1.name,
    awayTeam: team2.name,
    date: new Date(),
    matchday: (league.matches.length ? league.matches.length + 1 : 1),
    score1: null,
    score2: null,
    events: [],
    live: true,
    endDate: null
  };
  league.matches.push(matchEntry);
  await league.save();

  // Odds & Embeds
  const odds = {
    team1: (Math.random() * 1.5 + 1.2).toFixed(2),
    draw: (Math.random() * 2 + 2.0).toFixed(2),
    team2: (Math.random() * 1.5 + 1.2).toFixed(2)
  };

  const statusEmbed = new EmbedBuilder()
    .setTitle(`\`🏟️\` Fußballspiel: ${team1.name} vs. ${team2.name}`)
    .setDescription(`\`📍\` Austragungsort: **${stadium}**`)
    .setColor('Green')
    .addFields(
      { name: 'Spielminute', value: "0'", inline: true },
      { name: 'Spielstand', value: '0 - 0', inline: true },
      { name: 'xG', value: '0.00 - 0.00', inline: true },
      { name: 'Gelbe Karten', value: '`🟨` 0-0', inline: true },
      { name: 'Ballbesitz', value: '0% - 0%', inline: true },
      { name: 'Ecken', value: '`🚩` 0-0', inline: true },
      { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
    )
    .setImage('https://media.istockphoto.com/id/179518838/de/vektor/realistische-vektor-fu%C3%9Fball-fu%C3%9Fballplatz.jpg');

  const lineupEmbed = new EmbedBuilder()
    .setTitle('`📋` Aufstellungen')
    .setColor('Blue')
    .setDescription(`**${team1.name}:**\n${team1.players.join(', ') || 'Keine Daten'}\n\n**${team2.name}:**\n${team2.players.join(', ') || 'Keine Daten'}`);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('win_team1').setLabel(`${team1.name} gewinnt (${odds.team1})`).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('draw').setLabel(`Unentschieden (${odds.draw})`).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('win_team2').setLabel(`${team2.name} gewinnt (${odds.team2})`).setStyle(ButtonStyle.Primary),
  );

  // Send status + lineup
  const statusMessage = await interaction.followUp({ embeds: [statusEmbed], fetchReply: true });
  await interaction.followUp({ embeds: [lineupEmbed], components: [buttons] });

  // Tipp-Collector (nur der Aufrufer darf tippen)
  const filter = i => i.user.id === interaction.user.id;
  const collector = statusMessage.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 20_000 });

  let userTip = null;

  collector.on('collect', async i => {
    switch (i.customId) {
      case 'win_team1': userTip = 'team1'; break;
      case 'draw': userTip = 'draw'; break;
      case 'win_team2': userTip = 'team2'; break;
    }
    await i.update({ content: '`⏳` Anpfiff in wenigen Sekunden...', embeds: [], components: [] });
    collector.stop();
    await delay(1500);
    await interaction.followUp({ content: '`🔊` **Anpfiff!**' });
    // Starte Simulation
    await simulateMatch(interaction, statusMessage, league, team1, team2, userTip);
  });

  collector.on('end', async collected => {
    if (collected.size === 0) {
      // Wenn keiner getippt hat, starte trotzdem
      await interaction.followUp({ content: '`⏱️` Zeit abgelaufen, kein Tipp. Starte trotzdem...' });
      await delay(1000);
      await simulateMatch(interaction, statusMessage, league, team1, team2, null);
    }
  });
}

// ------------------------------
// Simulation einer Partie (aktualisiert League-Dokument)
// ------------------------------
async function simulateMatch(interaction, statusMessage, leagueDoc, team1, team2, userTip) {
  let score1 = 0, score2 = 0;
  let xG1 = 0, xG2 = 0;
  let yellow1 = 0, yellow2 = 0;
  let corners1 = 0, corners2 = 0;
  let passes1 = 0, passes2 = 0;
  const goalEvents = [];
  const events = [`\`🔊\` Anpfiff! (0')`];

  const extraTime = Math.floor(Math.random() * 6) + 1; // kurze Nachspielzeit
  const minuteMs = leagueDoc.settings?.minuteDurationMs || 1000;

  // Simuliere Minuten 1..90+extra
  for (let minute = 1; minute <= 90 + extraTime; minute++) {
    // Torchance
    if (minute % 4 === 0 && Math.random() < 0.15) {
      const which = Math.random() < 0.5 ? 'team1' : 'team2';
      const scorer = getRandomPlayer(which === 'team1' ? team1 : team2);
      const xg = parseFloat((Math.random() * 0.6 + 0.05).toFixed(2));
      let goalCounted = true;

      // xG wird immer hinzugefügt, egal ob Tor oder nicht
      if (teamScored === 'team1') xG1 += xG;
      else xG2 += xG;

      // VAR Chance
      if (Math.random() < 0.1) {
        if (Math.random() < 0.5) {
          goalCounted = false;
          events.push(`\`🖥️\` VAR: Tor von **${scorer}** aberkannt \`❌\` (${minute}')`);
        } else {
          events.push(`\`🖥️\` VAR: Tor von **${scorer}** bestätigt \`✅\` (${minute}')`);
        }
      }

      if (goalCounted) {
        if (which === 'team1') { score1++; xG1 += xg; }
        else { score2++; xG2 += xg; }
        goalEvents.push({ type: 'goal', time: minute, player: scorer, team: which === 'team1' ? team1.name : team2.name });
        events.push(`\`⚽\` TOOOR! ${which === 'team1' ? team1.name : team2.name} — **${scorer}** (${minute}') — ${score1} - ${score2}`);
      }
    }

    // Fouls / Karten
    if (Math.random() < 0.08) {
      const which = Math.random() < 0.5 ? 'team1' : 'team2';
      const player = getRandomPlayer(which === 'team1' ? team1 : team2);
      events.push(`\`🤕\` Foul von **${player}** (${which === 'team1' ? team1.name : team2.name}) (${minute}')`);
      if (Math.random() < 0.5) {
        if (which === 'team1') yellow1++; else yellow2++;
        events.push(`\`🟨\` Gelbe Karte für **${player}** (${minute}')`);
      }
    }

    // Ecken
    if (minute % 5 === 0 && Math.random() < 0.22) {
      if (Math.random() < 0.5) { corners1++; events.push(`\`🚩\` Ecke für ${team1.name} (${minute}')`); }
      else { corners2++; events.push(`\`🚩\` Ecke für ${team2.name} (${minute}')`); }
    }

    // Weitere Aktionen (Angriff, Freistoß, Abseits)
    if (Math.random() < 0.12) events.push(`\`🔥\` Angriff (${minute}')`);
    if (Math.random() < 0.05) events.push(`\`🎯\` Freistoß (${minute}')`);
    if (Math.random() < 0.04) events.push(`\`🏳️\` Abseits (${minute}')`);

    // Statistik-Aktionen
    passes1 += Math.floor(Math.random() * 5);
    passes2 += Math.floor(Math.random() * 5);

    const totalPasses = passes1 + passes2;
    const possession1 = totalPasses ? Math.round((passes1 / totalPasses) * 100) : 50;
    const possession2 = 100 - possession1;

    // Gruppiere Tore pro Spieler für Embed-Display
    const groupGoals = (goals, teamName) => {
      const map = new Map();
      for (const g of goals) {
        if (g.team !== teamName) continue;
        if (!map.has(g.player)) map.set(g.player, []);
        map.get(g.player).push(`${g.time}'`);
      }
      const arr = [];
      let first = true;
      for (const [player, mins] of map.entries()) {
        arr.push(`${first ? '`⚽` ' : ''}${mins.join(' ')} ${player}`);
        first = false;
      }
      return arr.join(' ');
    };
    const goalsTeam1 = groupGoals(goalEvents, team1.name);
    const goalsTeam2 = groupGoals(goalEvents, team2.name);
    const goalString = (goalsTeam1 || goalsTeam2) ? `${goalsTeam1} ${goalsTeam2}`.trim() : '';

    // Update Embed
    const minuteDisplay = minute <= 90 ? `${minute}'` : `90' +${minute - 90}`;
    const statusEmbed = new EmbedBuilder()
      .setTitle(`\`🏟️\` ${team1.name} vs ${team2.name}`)
      .setDescription(`\`📍\` ${team1.stadium || 'Unbekanntes Stadion'}\n\n${goalString || ''}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: minuteDisplay, inline: true },
        { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} - ${xG2.toFixed(2)}`, inline: true },
        { name: 'Gelbe Karten', value: `\`🟨\` ${yellow1}-${yellow2}`, inline: true },
        { name: 'Ballbesitz', value: `${possession1}% - ${possession2}%`, inline: true },
        { name: 'Ecken', value: `\`🚩\` ${corners1}-${corners2}`, inline: true },
        { name: 'Ereignisse', value: events.slice(-5).join('\n') || 'Noch keine Ereignisse...' }
      )
      .setImage('https://media.istockphoto.com/id/179518838/de/vektor/realistische-vektor-fu%C3%9Fball-fu%C3%9Fballplatz.jpg');

    try { await statusMessage.edit({ embeds: [statusEmbed] }); } catch (e) { /* ignore if message deleted */ }

    // kleine Pause pro Minute
    await delay(minuteMs);

    // Ende?
    if (minute === 90 + extraTime) {
      events.push(`\`🔔\` Schlusspfiff! Endstand: **${team1.name} ${score1} - ${score2} ${team2.name}**`);

      // Update League-Dokument: finalize match
      // Finde match (live=true) zwischen den Teams, setze Ergebnisse
      const league = await League.findOne({});
      const matchIdx = league.matches.findIndex(m => m.live && m.homeTeam === team1.name && m.awayTeam === team2.name);
      if (matchIdx >= 0) {
        league.matches[matchIdx].score1 = score1;
        league.matches[matchIdx].score2 = score2;
        league.matches[matchIdx].events = events;
        league.matches[matchIdx].live = false;
        league.matches[matchIdx].endDate = new Date();
      }

      // Tabelle aktualisieren
      const t1 = league.teams.find(t => t.name === team1.name);
      const t2 = league.teams.find(t => t.name === team2.name);
      if (t1 && t2) {
        t1.played++; t2.played++;
        t1.goalsFor += score1; t1.goalsAgainst += score2;
        t2.goalsFor += score2; t2.goalsAgainst += score1;
        if (score1 > score2) { t1.won++; t1.points += 3; t2.lost++; }
        else if (score2 > score1) { t2.won++; t2.points += 3; t1.lost++; }
        else { t1.draw++; t2.draw++; t1.points += 1; t2.points += 1; }
      }

      await league.save();

      // Ergebnis posten + Tipp auswerten
      let result;
      if (score1 > score2) result = 'team1';
      else if (score2 > score1) result = 'team2';
      else result = 'draw';

      let tippText = userTip === 'team1' ? team1.name : userTip === 'team2' ? team2.name : userTip === 'draw' ? 'Unentschieden' : null;
      if (userTip && tippText) {
        if (userTip === result) {
          await interaction.followUp(`> \`🎉\` Dein Tipp auf **${tippText}** war korrekt! Endstand **${team1.name} ${score1} - ${score2} ${team2.name}**`);
        } else {
          await interaction.followUp(`> \`❌\` Dein Tipp auf **${tippText}** war falsch. Endstand **${team1.name} ${score1} - ${score2} ${team2.name}**`);
        }
      } else {
        await interaction.followUp(`\`🔚\` Spiel beendet: **${team1.name} ${score1} - ${score2} ${team2.name}**`);
      }

      break;
    }
  } // Ende Schleife Minute
} // Ende simulateMatch

// fertig
