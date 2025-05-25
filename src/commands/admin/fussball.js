const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');

const teamsData = [
  { "name": "FC Adler", "players": ["Müller", "Schmidt", "Fischer", "Weber"] },
  { "name": "SV Löwen", "players": ["Schneider", "Wagner", "Becker", "Hoffmann"] },
  { "name": "TSV Eiche", "players": ["Bauer", "Koch", "Richter", "Klein"] },
  { "name": "SC Blau", "players": ["Wolf", "Neumann", "Schröder", "Krüger"] },
  { "name": "VfB Stern", "players": ["Hartmann", "Lange", "Schmitt", "Werner"] },
  { "name": "FC Rot-Weiß", "players": ["Krause", "Meier", "Schulz", "Hahn"] },
  { "name": "SV Grünwald", "players": ["König", "Fuchs", "Bergmann", "Lorenz"] },
  { "name": "TSV Nord", "players": ["Frank", "Mayer", "Jung", "Albrecht"] },
  { "name": "SC Süd", "players": ["Böhm", "Engel", "Jäger", "Brandt"] },
  { "name": "VfB West", "players": ["Peters", "Simon", "Vogel", "Friedrich"] },
  { "name": "FC Ostwind", "players": ["Paul", "Hoffmeister", "Bender", "Keller"] },
  { "name": "SV Nordstern", "players": ["Mayerhofer", "Schulze", "Graf", "Krafft"] },
  { "name": "TSV Berg", "players": ["Winkler", "Horn", "Seidel", "Busch"] },
  { "name": "SC Tal", "players": ["Zimmermann", "Lutz", "Hahn", "Franke"] },
  { "name": "VfB See", "players": ["Döring", "Kuhn", "Voigt", "Bach"] },
  { "name": "FC Sturm", "players": ["Schulz", "Ritter", "Heinrich", "Friedl"] },
  { "name": "SV Blitz", "players": ["Köhler", "Dietrich", "Eckert", "Löwe"] },
  { "name": "TSV Vulkan", "players": ["Maier", "Groß", "Schulze", "Hoffmann"] },
  { "name": "SC Frost", "players": ["Schuster", "Brand", "Sauer", "Lang"] },
  { "name": "VfB Flamme", "players": ["Reuter", "Schiller", "Born", "Herz"] },
  { "name": "FC Donner", "players": ["Lorenz", "Bauer", "Wolf", "Schmid"] },
  { "name": "SV Schatten", "players": ["Ziegler", "Beck", "Kruse", "Hart"] },
  { "name": "TSV Nebel", "players": ["Lang", "Winter", "Schwarz", "Beier"] },
  { "name": "SC Licht", "players": ["Günther", "Kaiser", "Sachs", "Mayer"] }
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
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

      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${team1Name} vs. ${team2Name}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: '0 - 0', inline: true },
          { name: 'xG', value: '0.00 : 0.00', inline: true },
          { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
        );

      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${team1Name}:**\n${players1.length > 0 ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${team2Name}:**\n${players2.length > 0 ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

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

      const statusMessage = await interaction.reply({ embeds: [embedStatus], fetchReply: true });
      await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async i => {
        let userTip;
        switch (i.customId) {
          case 'win_team1': userTip = 'team1'; break;
          case 'win_team2': userTip = 'team2'; break;
          case 'draw': userTip = 'draw'; break;
        }

        await i.update({ content: '`⏳` Anpfiff in wenigen Sekunden...', embeds: [], components: [] });
        collector.stop();

        await delay(3000);
        await interaction.followUp({ content: '`🔊` **Anpfiff! Das Spiel beginnt!** `⚽`' });
        await simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip);
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: '`⏱️` Zeit abgelaufen, kein Tipp abgegeben.',
            embeds: [],
            components: [],
          });
        }
      });

    } catch (error) {
      console.error('❌ Fehler im /fussball Command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Ein Fehler ist aufgetreten.', ephemeral: true });
      }
    }
  },
};

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomPlayer(team) {
  const validPlayers = Array.isArray(team.players) ? team.players.filter(p => typeof p === 'string' && p.trim() !== '') : [];
  return validPlayers.length > 0 ? validPlayers[Math.floor(Math.random() * validPlayers.length)] : 'Unbekannter Spieler';
}

async function simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip) {
  let score1 = 0;
  let score2 = 0;
  let xG1 = 0.0;
  let xG2 = 0.0;
  const events = [];
  const extraTime = Math.floor(Math.random() * 20) + 1;  // 1 bis 20 Minuten
  
  for (let minute = 1; minute <= 90 + extraTime; minute++) {
    let torGezaehlt = true;
    let scorer = '';
    let xG = 0;

    if (minute % 4 === 0 && Math.random() < 0.25) {
      const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
      xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
      scorer = getRandomPlayer(teamScored === 'team1' ? team1 : team2);

      // VAR prüft Tor
      if (Math.random() < 0.1) {
        if (Math.random() < 0.5) {
          torGezaehlt = false;
          events.push(`\`🖥️\` VAR-Überprüfung: Tor von ${scorer} wird ABERKANNT (${minute}')`);
        } else {
          events.push(`\`🖥️\` VAR-Überprüfung: Tor von ${scorer} wird bestätigt ✅ (${minute}')`);
        }
      }

      if (torGezaehlt) {
        if (teamScored === 'team1') {
          score1++;
          xG1 += xG;
          events.push(`\`⚽\` Tooor! ${team1Name} - ${scorer} (${minute}')`);
        } else {
          score2++;
          xG2 += xG;
          events.push(`\`⚽\` Tooor! ${team2Name} - ${scorer} (${minute}')`);
        }
      }
    }

    if (minute % 6 === 0 && Math.random() < 0.15) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const player = getRandomPlayer(team);
      events.push(`\`🟨\` Gelbe Karte für ${player} (${minute}')`);
    }

    if (minute % 20 === 0 && Math.random() < 0.5) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const teamName = team === team1 ? team1Name : team2Name;
      const outPlayer = getRandomPlayer(team);
      const inPlayer = `Spieler ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      events.push(`\`🔁\` Wechsel bei ${teamName}: ${outPlayer} raus, ${inPlayer} rein (${minute}')`);
    }

    if (Math.random() < 0.05) {
      const team = Math.random() < 0.5 ? team1Name : team2Name;
      const teamName = team === team1 ? team1Name : team2Name;
      events.push(`\`🎯\` Freistoß für ${teamName} (${minute}')`);
    }

    if (Math.random() < 0.04) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const teamName = team === team1 ? team1Name : team2Name;
      const player = getRandomPlayer(team);
      events.push(`\`🚩\` Abseits von ${teamName} durch ${player} (${minute}')`);
    }

    // Gefährlicher Angriff (z.B. 8% Chance pro Minute)
    if (Math.random() < 0.08) {
      const team = Math.random() < 0.5 ? team1 : team2;
      const teamName = team === team1 ? team1Name : team2Name;
      const player = getRandomPlayer(team);
      events.push(`\`🔥\` Gefährlicher Angriff von ${teamName} durch ${player} (${minute}')`);
    }

    // Spielunterbrechung (z.B. 3% Chance)
    if (Math.random() < 0.03) {
      events.push(`\`⏸️\` Spielunterbrechung (${minute}')`);
    }

    if (Math.random() < 0.05) { // 5% Chance pro Minute
      const team = Math.random() < 0.5 ? team1 : team2;
      const teamName = team === team1 ? team1Name : team2Name;
      events.push(`\`🕹️\` ${teamName} im Ballbesitz (${getDisplayMinute(minute)})`);
    }

    // Funktion zur Anzeige der Spielminute
    function getDisplayMinute(minute) {
      if (minute <= 90) return `${minute}'`;
      return `90' +${minute - 90}`;
    }
    
    // Beispielhafte Event-Generierung in einem Spiel-Tick
    if (minute === 90) {
      events.push(`\`⏳\` Nachspielzeit beginnt! (+${extraTime}')`);
    }
    
    if (minute === 90 + extraTime) {
      events.push(`\`🔔\` Schlusspfiff! Endstand: ${team1Name} ${score1} : ${score2} ${team2Name}`);
    }

    const embedUpdate = EmbedBuilder.from(statusMessage.embeds[0])
      .setFields(
        { name: 'Spielminute', value: getDisplayMinute(minute), inline: true },
        { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: events.slice(-5).join('\n') || 'Noch keine Ereignisse...' }
      );

    await statusMessage.edit({ embeds: [embedUpdate] });
    await delay(1000);
  }

  const ergebnis = score1 > score2 ? 'team1' : score1 < score2 ? 'team2' : 'draw';
  const tippErgebnis = ergebnis === userTip ? '`✅` Du hast richtig getippt!' : '`❌` Dein Tipp war leider falsch.';

  await interaction.followUp({
    content: `\`🏁\` Abpfiff! Endstand: **${team1Name} ${score1} - ${score2} ${team2Name}**\n${tippErgebnis}`,
  });
}

/*

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb'); // Dein Mongoose-Modell

// Beispiel-Daten (wird nicht genutzt, da DB-Daten geladen werden)
const teamsData = [
  { name: "FC Adler", players: ["Müller", "Schmidt", "Fischer", "Weber"] },
  // ... weitere Teams
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
      // Alle Teams aus der Pro League laden
      const proLeagueTeams = await Team.find({ league: 'Pro League' });

      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      // Zwei verschiedene Teams zufällig auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const team1Name = team1.name;
      const team2Name = team2.name;

      // Wettquoten generieren
      const odds = generateOdds();

      // Status-Embed (Spielinfo)
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${team1Name} vs. ${team2Name}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: '0 - 0', inline: true },
          { name: 'xG', value: '0.00 : 0.00', inline: true },
          { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
        );

      // Aufstellung-Embed
      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${team1Name}:**\n${players1.length > 0 ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${team2Name}:**\n${players2.length > 0 ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons für Tippabgabe
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

      // Nachricht mit Spielstatus senden
      const statusMessage = await interaction.reply({ embeds: [embedStatus], fetchReply: true });
      // Folge-Nachricht mit Aufstellung und Buttons
      await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

      // Collector, der nur den Command-Ersteller zulässt
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000, // 60 Sekunden
      });

      collector.on('collect', async i => {
        let userTip;
        switch (i.customId) {
          case 'win_team1': userTip = 'team1'; break;
          case 'win_team2': userTip = 'team2'; break;
          case 'draw': userTip = 'draw'; break;
          default:
            return await i.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
        }

        await i.update({ content: 'Das Spiel startet... ⚽', embeds: [], components: [] });
        collector.stop();

        // Spielsimulation starten
        await simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip);
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: '⏱️ Zeit abgelaufen, kein Tipp abgegeben.',
            embeds: [],
            components: [],
          });
        }
      });

    } catch (error) {
      console.error('❌ Fehler im /fussball Command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Ein Fehler ist aufgetreten.', ephemeral: true });
      }
    }
  },
};

// Helferfunktion: Zwei unterschiedliche Teams auswählen
function getTwoDifferentTeams(teams) {
  const team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);
  return [teams[team1Index], teams[team2Index]];
}

// Quoten generieren (vereinfacht)
function generateOdds() {
  const probTeam1 = Math.random() * 0.5 + 0.25; // zwischen 0.25 und 0.75
  const probTeam2 = Math.random() * (1 - probTeam1);
  const probDraw = 1 - probTeam1 - probTeam2;

  return {
    team1: 1 / probTeam1,
    draw: 1 / probDraw,
    team2: 1 / probTeam2,
  };
}

// Spielsimulation
async function simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip) {
  let score1 = 0;
  let score2 = 0;
  let xG1 = 0.0;
  let xG2 = 0.0;
  const goals = [];

  for (let minute = 1; minute <= 90; minute++) {
    // Status-Embed aktualisieren
    const embedUpdate = EmbedBuilder.from(statusMessage.embeds[0])
      .setFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Noch keine Ereignisse...' }
      );

    await statusMessage.edit({ embeds: [embedUpdate] });

    // Event: Torchance alle 4 Minuten mit 25% Wahrscheinlichkeit
    if (minute % 4 === 0 && Math.random() < 0.25) {
      const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
      const xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
      const players = teamScored === 'team1' ? team1.players : team2.players;

      const validPlayers = Array.isArray(players) ? players.filter(p => typeof p === 'string' && p.trim() !== '') : [];
      const scorer = validPlayers.length > 0 ? validPlayers[Math.floor(Math.random() * validPlayers.length)] : 'Unbekannter Spieler';

      if (teamScored === 'team1') {
        score1++;
        xG1 += xG;
        goals.push(`⚽ Tooor! ${team1Name} - ${scorer} (${minute}')`);
      } else {
        score2++;
        xG2 += xG;
        goals.push(`⚽ Tooor! ${team2Name} - ${scorer} (${minute}')`);
      }
    }

    await delay(1000); // 1 Sekunde Pause zwischen Minuten
  }

  // Event: Gelbe Karte
  if (minute % 6 === 0 && Math.random() < 0.15) {
    const team = Math.random() < 0.5 ? team1 : team2;
    const players = team.players || [];
    const validPlayers = players.filter(p => typeof p === 'string' && p.trim() !== '');
    const player = validPlayers.length > 0 ? validPlayers[Math.floor(Math.random() * validPlayers.length)] : 'Unbekannter Spieler';
    goals.push(`🟨 Gelbe Karte für ${player} (${minute}')`);
  }

  // Event: Auswechslung
  if (minute % 20 === 0 && Math.random() < 0.3) {
    const team = Math.random() < 0.5 ? team1 : team2;
    const players = team.players || [];
    const validPlayers = players.filter(p => typeof p === 'string' && p.trim() !== '');
    const outPlayer = validPlayers.length > 0 ? validPlayers[Math.floor(Math.random() * validPlayers.length)] : 'Spieler A';
    const inPlayer = `Spieler ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    goals.push(`🔁 Wechsel bei ${team.name}: ${outPlayer} raus, ${inPlayer} rein (${minute}')`);
  }

  function freistossEvent(minute, team1Name, team2Name) {
  const team = Math.random() < 0.5 ? team1Name : team2Name;
  return `🆓 Freistoß für ${team} (${minute}')`;
  }

  if (Math.random() < 0.1) events.push(freistossEvent(minute, team1Name, team2Name));

  function abseitsEvent(minute, team1, team2) {
  const team = Math.random() < 0.5 ? team1 : team2;
  const player = getRandomPlayer(team);
  return `🚩 Abseits von ${player} (${minute}')`;
  }

  if (Math.random() < 0.05) events.push(abseitsEvent(minute, team1, team2));

  function foulEvent(minute, team1, team2) {
  const team = Math.random() < 0.5 ? team1 : team2;
  const player = getRandomPlayer(team);
  return `🚫 Foul von ${player} (${minute}')`;
  }

  if (Math.random() < 0.07) events.push(foulEvent(minute, team1, team2));

  function eckeEvent(minute, team1Name, team2Name) {
  const team = Math.random() < 0.5 ? team1Name : team2Name;
  return `🏳️ Ecke für ${team} (${minute}')`;
  }

  if (Math.random() < 0.08) events.push(eckeEvent(minute, team1Name, team2Name));

  function varEvent(minute) {
  return `📺 VAR-Überprüfung wegen möglichem Handspiel (${minute}')`;
  }

  if (Math.random() < 0.03) events.push(varEvent(minute));

  function elfmeterEvent(minute, team1Name, team2Name) {
  const team = Math.random() < 0.5 ? team1Name : team2Name;
  return `⚽ Elfmeter für ${team} (${minute}')`;
  }

  if (Math.random() < 0.04) events.push(elfmeterEvent(minute, team1Name, team2Name));

  // Ergebnis-Embed
  const embedResult = new EmbedBuilder()
    .setTitle(`🏁 Spiel beendet: ${team1Name} vs. ${team2Name}`)
    .setColor(score1 > score2 ? 'Green' : score2 > score1 ? 'Red' : 'Yellow')
    .addFields(
      { name: 'Endstand', value: `${score1} - ${score2}`, inline: true },
      { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
      { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Keine Tore' }
    );

  // Tipp auswerten
  let tipMessage = '';
  if (userTip === 'team1') {
    tipMessage = score1 > score2
      ? '✅ Du hast richtig getippt! Dein Team hat gewonnen.'
      : '❌ Leider falsch getippt. Dein Team hat nicht gewonnen.';
  } else if (userTip === 'team2') {
    tipMessage = score2 > score1
      ? '✅ Du hast richtig getippt! Dein Team hat gewonnen.'
      : '❌ Leider falsch getippt. Dein Team hat nicht gewonnen.';
  } else if (userTip === 'draw') {
    tipMessage = score1 === score2
      ? '✅ Du hast richtig getippt! Das Spiel endete unentschieden.'
      : '❌ Leider falsch getippt. Das Spiel endete nicht unentschieden.';
  }

  await interaction.followUp({ embeds: [embedResult], content: tipMessage });
}

// Delay-Hilfsfunktion
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

*/
