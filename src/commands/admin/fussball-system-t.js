// Datei: fussball-systemv2.js
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
const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');

// --- Lokale Testdaten (falls DB-Daten fehlen) ---
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
];

// --- Globale Map, speichert laufende Spiele ---
// Struktur: matchId -> { team1Name, team2Name, score1, score2, minute, interval, statusMessageId, channelId, events[] }
const liveMatchesMap = new Map();

// Globale Referenz auf das "Laufende Spiele"-Embed (Message-ID + Channel-ID)
let liveOverviewMessage = null; // { messageId, channelId }

/* -------------------- Hilfsfunktionen -------------------- */

function getTwoDifferentTeams(teams) {
  const idx1 = Math.floor(Math.random() * teams.length);
  let idx2;
  do { idx2 = Math.floor(Math.random() * teams.length); } while (idx2 === idx1);
  return [teams[idx1], teams[idx2]];
}

function getRandomPlayer(team) {
  if (!team || !team.players || team.players.length === 0) return 'Unbekannter Spieler';
  return team.players[Math.floor(Math.random() * team.players.length)];
}

function generateOdds() {
  const probTeam1 = Math.random() * 0.5 + 0.25;
  const probTeam2 = Math.random() * (0.75 - probTeam1) + 0.25;
  const probDraw = Math.max(0, 1 - probTeam1 - probTeam2);
  return {
    team1: (1 / probTeam1),
    draw: probDraw ? (1 / probDraw) : (1 / 0.01),
    team2: (1 / probTeam2),
  };
}

function formatDate(date) {
  return new Date(date).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin'
  }).replace(',', ' -');
}

function createOverviewEmbed(teams, now = new Date()) {
  const embed = new EmbedBuilder()
    .setTitle('`⚽` » Fußball Übersicht')
    .setColor('Blurple')
    .setDescription('Wähle unten, um Tabelle, nächstes Spiel, Spieltag oder ein Zufallsspiel zu starten.');

  // kleine Tabelle-Preview (Top 5)
  if (teams && teams.length) {
    const top = teams.slice(0, 5);
    embed.addFields({ name: 'Top 5 (Preview)', value: top.map((t, i) => `${i+1}. ${t.name} — ${t.points ?? 0} Pkt`).join('\n'), inline: false });
  }

  // Live-Spiele Count
  embed.addFields({ name: 'Laufende Spiele', value: `${liveMatchesMap.size} Spiel(e)`, inline: true });
  embed.setFooter({ text: `Stand: ${formatDate(now)}` });
  return embed;
}

function buildMainMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('fussball-info-menu')
      .setPlaceholder('📋 » Informationen auswählen')
      .addOptions(
        { label: '📊 Aktuelle Tabelle', value: 'tabelle' },
        { label: '🏟️ Nächstes Spiel', value: 'naechstes_spiel' },
        { label: '📅 Nächster Spieltag', value: 'spieltag' },
        { label: '⚽ Zufallsspiel starten', value: 'zufallsspiel' },
        { label: '🔴 Laufende Spiele (Übersicht)', value: 'lives_overview' },
      )
  );
}

/* -------------------- Live-Overview Update -------------------- */

async function updateLiveOverviewEmbed(client) {
  // Wenn keine Übersicht gesichert ist, nichts tun
  if (!liveOverviewMessage) return;

  try {
    const channel = await client.channels.fetch(liveOverviewMessage.channelId).catch(() => null);
    if (!channel) {
      liveOverviewMessage = null;
      return;
    }

    const msg = await channel.messages.fetch(liveOverviewMessage.messageId).catch(() => null);
    if (!msg) {
      liveOverviewMessage = null;
      return;
    }

    // Wenn keine Spiele laufen -> Nachricht anpassen und Referenz löschen
    if (liveMatchesMap.size === 0) {
      await msg.edit({ content: '`⚽` Es laufen aktuell keine Spiele.', embeds: [], components: [] }).catch(() => {});
      liveOverviewMessage = null;
      return;
    }

    const overview = new EmbedBuilder()
      .setTitle('`🔴` Aktuell laufende Spiele')
      .setColor('Red')
      .setFooter({ text: `Stand: ${formatDate(new Date())}` });

    for (const [id, m] of liveMatchesMap.entries()) {
      overview.addFields({
        name: `${m.team1Name} vs ${m.team2Name}`,
        value: `${m.score1 ?? 0} - ${m.score2 ?? 0} (${m.minute ?? 0}')`,
        inline: false,
      });
    }

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_live_game')
        .setPlaceholder('Wähle ein laufendes Spiel')
        .addOptions(
          ...Array.from(liveMatchesMap.entries()).slice(0, 25).map(([id, mm]) => ({
            label: `${mm.team1Name} vs ${mm.team2Name}`,
            value: id,
          }))
        )
    );

    await msg.edit({ content: null, embeds: [overview], components: [menu] }).catch(() => {});
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Live-Overview-Embeds:', err);
  }
}

/* -------------------- Simulation (Interval-basiert) -------------------- */

async function simulateMatchInterval(client, channel, matchId, matchObj) {
  // matchObj initial state: { team1Name, team2Name, stadium, userTip(optional) }
  const { team1Name, team2Name, stadium } = matchObj;

  let score1 = 0, score2 = 0;
  let minute = 0;
  let extraTime = Math.floor(Math.random() * 6); // kleine Nachspielzeit
  let events = [`\`🔊\` Anpfiff! Das Spiel beginnt! (0')`];
  let xG1 = 0, xG2 = 0;
  let yellow1 = 0, yellow2 = 0;
  let corners1 = 0, corners2 = 0;

  // Status-Embed initial
  const statusEmbed = new EmbedBuilder()
    .setTitle(`\`🏟️\` Fußballspiel: ${team1Name} vs. ${team2Name}`)
    .setDescription(`\`📍\` Austragungsort: **${stadium || 'Unbekannt'}**`)
    .addFields(
      { name: 'Spielminute', value: `0'`, inline: true },
      { name: 'Spielstand', value: `0 - 0`, inline: true },
      { name: 'xG', value: `0.00 - 0.00`, inline: true },
      { name: 'Gelbe Karten', value: `\`🟨\` 0-0`, inline: true },
      { name: 'Ballbesitz', value: `50% - 50%`, inline: true },
      { name: 'Ecken', value: `\`🚩\` 0-0`, inline: true },
      { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
    )
    .setImage('https://media.istockphoto.com/id/179518838/de/vektor/realistische-vektor-fu%C3%9Fball-fu%C3%9Fballplatz.jpg?s=612x612&w=0&k=20&c=1eyMFLfUuGZtZm8VCbLjEIo68OzOuQEoHe5zq8teRWQ=');

  // Nachricht posten
  const statusMessage = await channel.send({ embeds: [statusEmbed] }).catch(() => null);
  if (!statusMessage) {
    console.warn('Konnte Status-Nachricht nicht posten, Match nicht gestartet:', matchId);
    return;
  }

  // speichern
  matchObj.statusMessageId = statusMessage.id;
  matchObj.channelId = channel.id;
  matchObj.score1 = score1; matchObj.score2 = score2; matchObj.minute = minute; matchObj.events = events;
  liveMatchesMap.set(matchId, matchObj);

  // Update Live Overview (falls aktiv)
  await updateLiveOverviewEmbed(channel.client).catch(() => {});

  // Interval: jede Sekunde = 1 Minute (konfigurierbar)
  const interval = setInterval(async () => {
    try {
      minute++;

      // Torchancen/Sonstiges
      if (minute % 4 === 0 && Math.random() < 0.18) {
        const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
        const scorer = getRandomPlayer(teamsData.find(t => t.name === (teamScored === 'team1' ? team1Name : team2Name)) || { players: [] });
        const xG = parseFloat((Math.random() * 0.7 + 0.05).toFixed(2));

        // VAR Chance
        if (Math.random() < 0.12) {
          if (Math.random() < 0.5) {
            events.push(`\`🖥️\` VAR: Tor von **${scorer}** aberkannt \`❌\` | ${score1} - ${score2} (${minute}')`);
          } else {
            events.push(`\`🖥️\` VAR: Tor von **${scorer}** bestätigt \`✅\` | ${score1} - ${score2} (${minute}')`);
            if (teamScored === 'team1') { score1++; xG1 += xG; } else { score2++; xG2 += xG; }
            events.push(`\`⚽\` TOOOR! für ${teamScored==='team1'?team1Name:team2Name} durch **${scorer}**! ${score1} - ${score2} (${minute}')`);
          }
        } else {
          if (teamScored === 'team1') { score1++; xG1 += xG; } else { score2++; xG2 += xG; }
          events.push(`\`⚽\` TOOOR! für ${teamScored==='team1'?team1Name:team2Name} durch **${scorer}**! ${score1} - ${score2} (${minute}')`);
        }
      }

      // Karten / Fouls
      if (Math.random() < 0.08) {
        const team = Math.random() < 0.5 ? 'team1' : 'team2';
        const player = getRandomPlayer(teamsData.find(t => t.name === (team === 'team1' ? team1Name : team2Name)) || { players: [] });
        events.push(`\`🤕\` Foul von **${player}** (${team === 'team1' ? team1Name : team2Name}) (${minute}')`);
        if (Math.random() < 0.5) {
          if (team === 'team1') yellow1++; else yellow2++;
          events.push(`\`🟨\` Gelbe Karte für **${player}** (${team === 'team1' ? team1Name : team2Name}) (${minute}')`);
        }
      }

      // Ecken
      if (minute % 5 === 0 && Math.random() < 0.22) {
        const teamCorner = Math.random() < 0.5 ? 'team1' : 'team2';
        if (teamCorner === 'team1') corners1++; else corners2++;
        events.push(`\`🚩\` Ecke für ${teamCorner==='team1'?team1Name:team2Name} (${minute}')`);
      }

      // Ballbesitz (simples Modell)
      const passes1 = Math.floor(Math.random() * minute) + 1;
      const passes2 = Math.floor(Math.random() * minute) + 1;
      const totalPasses = passes1 + passes2;
      const possession1 = totalPasses ? Math.round((passes1/totalPasses)*100) : 50;
      const possession2 = 100 - possession1;

      // Status-Embed aktualisieren
      const statusEmbedUpdate = new EmbedBuilder()
        .setTitle(`\`🏟️\` Fußballspiel: ${team1Name} vs. ${team2Name}`)
        .setDescription(`\`📍\` Austragungsort: **${stadium || 'Unbekannt'}**`)
        .addFields(
          { name: 'Spielminute', value: `${minute}'`, inline: true },
          { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
          { name: 'xG', value: `${xG1.toFixed(2)} - ${xG2.toFixed(2)}`, inline: true },
          { name: 'Gelbe Karten', value: `\`🟨\` ${yellow1}-${yellow2}`, inline: true },
          { name: 'Ballbesitz', value: `${possession1}% - ${possession2}%`, inline: true },
          { name: 'Ecken', value: `\`🚩\` ${corners1}-${corners2}`, inline: true },
          { name: 'Ereignisse', value: events.slice(-5).join('\n') || 'Noch keine Ereignisse...' }
        )
        .setImage('https://media.istockphoto.com/id/179518838/de/vektor/realistische-vektor-fu%C3%9Fball-fu%C3%9Fballplatz.jpg?s=612x612&w=0&k=20&c=1eyMFLfUuGZtZm8VCbLjEIo68OzOuQEoHe5zq8teRWQ=');

      // edit
      await channel.messages.fetch(matchObj.statusMessageId).then(m => m.edit({ embeds: [statusEmbedUpdate] })).catch(() => {});

      // update map
      matchObj.score1 = score1; matchObj.score2 = score2; matchObj.minute = minute; matchObj.events = events;
      liveMatchesMap.set(matchId, matchObj);

      // Update die Live-Overview (wenn sie existiert)
      await updateLiveOverviewEmbed(channel.client).catch(() => {});

      // Ende (nach 90 + extraTime Minuten)
      if (minute >= 90 + extraTime) {
        events.push(`\`🔔\` Schlusspfiff! Endstand: **${team1Name} ${score1} - ${score2} ${team2Name}**`);

        // Kurze Abschluss-Edit
        const finalEmbed = new EmbedBuilder()
          .setTitle(`\`🏁\` Spiel beendet: ${team1Name} vs ${team2Name}`)
          .setDescription(`Endstand: **${team1Name} ${score1} - ${score2} ${team2Name}**\n\nAustragungsort: **${stadium || 'Unbekannt'}**`)
          .addFields(
            { name: 'Tore', value: `\`⚽\` ${score1} - ${score2}` },
            { name: 'Ereignisse (letzte)', value: events.slice(-6).join('\n') || '–' }
          );

        await channel.messages.fetch(matchObj.statusMessageId).then(m => m.edit({ embeds: [finalEmbed] })).catch(() => {});

        clearInterval(interval);
        // aus Map entfernen
        liveMatchesMap.delete(matchId);

        // Update die Live-Overview (entferne das beendete Spiel dort)
        await updateLiveOverviewEmbed(channel.client).catch(() => {});
      }

    } catch (err) {
      console.error('Fehler im Match-Interval', err);
      clearInterval(interval);
      liveMatchesMap.delete(matchId);
      await updateLiveOverviewEmbed(channel.client).catch(() => {});
    }
  }, 1000); // 1 Sekunde = 1 Spielminute

  // Interval referenz speichern
  matchObj.interval = interval;
  liveMatchesMap.set(matchId, matchObj);
}

/* -------------------- Command Definition -------------------- */

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-systemv2')
    .setDescription('Zeigt die Fußball-Übersicht an und simuliert Spiele')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('overview').setDescription('Zeigt die Hauptübersicht mit Menü'))
    .addSubcommand(sub => sub.setName('simulate').setDescription('Startet ein Zufallsspiel (Pro League)'))
    .addSubcommand(sub => sub.setName('lives').setDescription('Zeigt alle laufenden Spiele an')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'overview') {
      await interaction.deferReply({ ephemeral: true });

      const now = new Date();
      const teams = await Team.find().sort({ points: -1, goalsFor: -1 }).catch(() => []);
      const overviewEmbed = createOverviewEmbed(teams, now);
      const menu = buildMainMenu();

      await interaction.editReply({ content: 'Übersicht', embeds: [overviewEmbed], components: [menu], ephemeral: false });

      // send to channel as public interactive message
      const sent = await interaction.channel.send({ embeds: [overviewEmbed], components: [menu] });

      const collector = sent.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1000 * 60 * 10 });
      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) return i.reply({ content: '> ❌ Nur der Befehlsersteller kann das Menü benutzen.', ephemeral: true });
        await i.deferUpdate();

        const val = i.values[0];
        if (val === 'tabelle') {
          // Tabelle
          const teamsList = await Team.find().sort({ points: -1, goalsFor: -1 }).catch(() => []);
          const tabelleEmbed = new EmbedBuilder().setTitle('`📊` Aktuelle Tabelle').setColor('#0099ff');
          for (const [idx, t] of teamsList.entries()) {
            const recentMatches = await Match.find({ $or: [{ homeTeam: t.name }, { awayTeam: t.name }], score1: { $ne: null }, score2: { $ne: null } }).sort({ date: -1 }).limit(5).catch(() => []);
            const last5 = recentMatches.map(m => {
              const isHome = m.homeTeam === t.name;
              const goalsFor = isHome ? m.score1 : m.score2;
              const goalsAgainst = isHome ? m.score2 : m.score1;
              if (goalsFor > goalsAgainst) return '`✅`'; if (goalsFor < goalsAgainst) return '`❌`'; return '`➖`';
            }).join(' ');
            tabelleEmbed.addFields({ name: `${idx+1}. ${t.name}`, value: `Spiele: ${t.played ?? 0} | S:${t.won ?? 0} U:${t.draw ?? 0} N:${t.lost ?? 0} | Tore: ${t.goalsFor ?? 0} | GT: ${t.goalsAgainst ?? 0} | Pkte: **${t.points ?? 0}**\nLetzte 5: ${last5 || '–'}`, inline: false });
          }
          await i.channel.send({ embeds: [tabelleEmbed] });
        } else if (val === 'naechstes_spiel') {
          const now2 = new Date();
          const upcoming = await Match.find({ date: { $gte: now2 } }).sort({ date: 1 }).limit(1).catch(() => []);
          const naechstesEmbed = new EmbedBuilder().setTitle('`🏟️` Nächstes Spiel').setColor('#00cc66');
          if (upcoming[0]) naechstesEmbed.setDescription(`**${upcoming[0].homeTeam}** vs **${upcoming[0].awayTeam}**\n\`📅\` ${formatDate(upcoming[0].date)} Uhr`);
          else naechstesEmbed.setDescription('Kein Spiel geplant.');
          await i.channel.send({ embeds: [naechstesEmbed] });
        } else if (val === 'spieltag') {
          const next = await Match.findOne({ date: { $gte: new Date() } }).sort({ date: 1 }).catch(() => null);
          const spieltag = next?.matchday ?? null;
          const matches = spieltag ? await Match.find({ matchday: spieltag }).sort({ date: 1 }).catch(() => []) : [];
          const embed = new EmbedBuilder().setTitle(`\`📅\` Spieltag: ${spieltag ?? 'N/A'}`).setColor('#ffaa00');
          if (matches.length) { matches.forEach(m => embed.addFields({ name: `${m.homeTeam} vs ${m.awayTeam}`, value: `\`🕒\` ${formatDate(m.date)} Uhr`, inline: false })); }
          else embed.setDescription('Keine Spiele anstehend.');
          await i.channel.send({ embeds: [embed] });
        } else if (val === 'zufallsspiel') {
          await simulateRandomMatch(interaction);
        } else if (val === 'lives_overview') {
          // show lives overview - post a persistent message and store reference
          if (liveMatchesMap.size === 0) return i.channel.send('`⚽` Es laufen aktuell keine Spiele.');
          const overview = new EmbedBuilder().setTitle('`🔴` Aktuell laufende Spiele').setColor('Red');
          for (const [id, m] of liveMatchesMap.entries()) {
            overview.addFields({ name: `${m.team1Name} vs ${m.team2Name}`, value: `${m.score1 ?? 0} - ${m.score2 ?? 0} (${m.minute ?? 0}')`, inline: false });
          }
          const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('select_live_game').setPlaceholder('Wähle ein laufendes Spiel').addOptions(
              ...Array.from(liveMatchesMap.entries()).slice(0, 25).map(([id, mm]) => ({ label: `${mm.team1Name} vs ${mm.team2Name}`, value: id }))
            )
          );
          const posted = await i.channel.send({ embeds: [overview], components: [menu] });
          // save reference
          liveOverviewMessage = { messageId: posted.id, channelId: posted.channel.id };
        }
      });

      return;
    }

    if (sub === 'simulate') {
      await interaction.deferReply();
      await simulateRandomMatch(interaction);
      return;
    }

    if (sub === 'lives') {
      await interaction.deferReply({ ephemeral: false });
      if (liveMatchesMap.size === 0) return interaction.editReply({ content: '`⚽` Es laufen aktuell keine Spiele.' });
      const overview = new EmbedBuilder().setTitle('`🔴` Aktuell laufende Spiele').setColor('Red');
      for (const [id, m] of liveMatchesMap.entries()) overview.addFields({ name: `${m.team1Name} vs ${m.team2Name}`, value: `${m.score1 ?? 0} - ${m.score2 ?? 0} (${m.minute ?? 0}')`, inline: false });
      const posted = await interaction.editReply({ embeds: [overview] }).catch(() => null);
      // store reference if it's a Message (editReply returns the message)
      if (posted && posted.id && posted.channel) {
        liveOverviewMessage = { messageId: posted.id, channelId: posted.channel.id };
      } else {
        // fallback: send a new message
        const sent = await interaction.channel.send({ embeds: [overview] }).catch(() => null);
        if (sent) liveOverviewMessage = { messageId: sent.id, channelId: sent.channel.id };
      }
      return;
    }
  }
};

/* -------------------- Hilfsfunktion: Zufallsspiel starten -------------------- */

async function simulateRandomMatch(interaction) {
  // interaction kann vom SlashCommand oder von Collector kommen
  const channel = interaction.channel || interaction.message?.channel;
  const client = interaction.client;

  const proLeagueTeams = await Team.find({ league: 'Pro League' }).catch(() => []);
  const available = (proLeagueTeams && proLeagueTeams.length >= 2) ? proLeagueTeams : teamsData;

  if (!available || available.length < 2) return interaction.followUp({ content: '> `❌` Nicht genug Teams vorhanden.', ephemeral: true });

  const [team1, team2] = getTwoDifferentTeams(available);
  const team1Name = team1.name || team1;
  const team2Name = team2.name || team2;
  const stadium = (teamsData.find(t => t.name === team1Name)?.stadium) || 'Unbekanntes Stadion';

  const matchId = `${team1Name}_vs_${team2Name}_${Date.now()}`;

  // Odds (nur Dekoration)
  const odds = generateOdds();

  // initial Message + Aufstellungs-Embed
  const embedLineup = new EmbedBuilder().setTitle('`📋` Aufstellung').setColor('Blue')
    .setDescription(`**${team1Name}:**\n${(teamsData.find(t=>t.name===team1Name)?.players||[]).join(', ') || 'Keine Daten'}\n\n**${team2Name}:**\n${(teamsData.find(t=>t.name===team2Name)?.players||[]).join(', ') || 'Keine Daten'}`);

  const tipButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('win_team1').setLabel(`${team1Name} gewinnt (${odds.team1.toFixed(2)})`).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('draw').setLabel(`Unentschieden (${odds.draw.toFixed(2)})`).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('win_team2').setLabel(`${team2Name} gewinnt (${odds.team2.toFixed(2)})`).setStyle(ButtonStyle.Primary),
  );

  // Informiere User und zeige Aufstellung
  await interaction.followUp({ embeds: [embedLineup], components: [tipButtons] });

  // Warte auf Tipp (nur der Befehlsersteller)
  const filter = i => i.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 30_000 });

  let userTip = null;
  collector.on('collect', async i => {
    if (i.customId === 'win_team1') userTip = 'team1';
    if (i.customId === 'win_team2') userTip = 'team2';
    if (i.customId === 'draw') userTip = 'draw';
    await i.update({ content: '\`⏳\` Anpfiff in wenigen Sekunden...', embeds: [], components: [] });
    collector.stop();
  });

  collector.on('end', async collected => {
    if (collected.size === 0) {
      await interaction.followUp({ content: '\`⏱️\` Zeit abgelaufen, kein Tipp abgegeben.', ephemeral: true });
      // trotzdem starten
    }

    // Starte Match-Objekt
    const matchObj = { team1Name, team2Name, stadium, userTip };
    await simulateMatchInterval(client, channel, matchId, matchObj);
    await interaction.followUp({ content: `\`🔊\` **Anpfiff!** ${team1Name} vs ${team2Name} (Match-ID: ${matchId})` });

    // Update Live Overview (falls aktiv) — in simulateMatchInterval wird ebenfalls geupdated, das ist hier praktisch redundant aber sicher.
    await updateLiveOverviewEmbed(client).catch(() => {});
  });
}

// Export helper für externe Verwendung (z.B. Tests)
module.exports._liveMatchesMap = liveMatchesMap;
module.exports._simulateRandomMatch = simulateRandomMatch;
