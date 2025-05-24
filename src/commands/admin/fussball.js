const { 
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb'); // Deine Datenbankanbindung

// Emojis für Teams
const teamIcons = {
  'FC Adler': '🦅', 'SV Löwen': '🦁', 'TSV Eiche': '🌳', 'SC Blau': '🔵',
  'VfB Stern': '⭐', 'FC Rot-Weiß': '🔴⚪', 'SV Grünwald': '🌲', 'TSV Nord': '❄️',
  'SC Süd': '☀️', 'VfB West': '🌅', 'FC Ostwind': '🌬️', 'SV Nordstern': '🌟',
  'TSV Berg': '⛰️', 'SC Tal': '🏞️', 'VfB See': '🌊', 'FC Sturm': '🌪️',
  'SV Blitz': '⚡', 'TSV Vulkan': '🌋', 'SC Frost': '❄️', 'VfB Flamme': '🔥',
  'FC Donner': '⛈️', 'SV Schatten': '🌑', 'TSV Nebel': '🌫️', 'SC Licht': '💡',
};

// Feste Teams und Spieler für Anzeige
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
];

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

      // Zwei unterschiedliche Teams auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // Kurzname ohne den ersten Wortteil (z.B. "FC Adler" -> "Adler")
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      const odds = generateOdds();

      // Erstes Embed: Spielstatus
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: `0'`, inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
        );

      // Spieler aus dem Array holen
      const players1 = teamsData.find(t => t.name === team1.name)?.players || [];
      const players2 = teamsData.find(t => t.name === team2.name)?.players || [];

      // Zweites Embed: Aufstellung
      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons für Tippmöglichkeiten
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('win_team1')
          .setLabel(`${icon1} ${team1LastName} gewinnt (${odds.team1})`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('draw')
          .setLabel(`Unentschieden (${odds.draw})`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('win_team2')
          .setLabel(`${icon2} ${team2LastName} gewinnt (${odds.team2})`)
          .setStyle(ButtonStyle.Primary),
      );

      // Status-Embed senden
      const statusMessage = await interaction.reply({ embeds: [embedStatus], fetchReply: true });
      // Aufstellungs-Embed + Buttons senden
      const lineupMessage = await interaction.followUp({ embeds: [embedLineup], components: [buttons], fetchReply: true });

      // Collector für Buttonklicks, nur vom Befehlsausführer, 60 Sekunden aktiv
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
          default:
            return await i.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
        }

        // Buttons entfernen, Nachricht anpassen
        await i.update({ content: 'Das Spiel startet... ⚽', embeds: [], components: [] });

        // Spielsimulation starten
        await simulateMatch(statusMessage, team1, team2, icon1, icon2);
        collector.stop();
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.followUp('⏰ Zeit abgelaufen! Du hast nicht getippt.');
          // Buttons entfernen, falls noch sichtbar
          lineupMessage.edit({ components: [] }).catch(() => {});
        }
      });

    } catch (error) {
      console.error(error);
      interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  }
};

// Helferfunktionen

// Zwei verschiedene Teams aus der Liste auswählen
function getTwoDifferentTeams(teams) {
  let team1 = teams[Math.floor(Math.random() * teams.length)];
  let team2;
  do {
    team2 = teams[Math.floor(Math.random() * teams.length)];
  } while (team1.name === team2.name);
  return [team1, team2];
}

// Zufällige Wettquoten generieren
function generateOdds() {
  const team1 = (Math.random() * 2 + 1.5).toFixed(2);
  const draw = (Math.random() * 2 + 1.5).toFixed(2);
  const team2 = (Math.random() * 2 + 1.5).toFixed(2);
  return { team1, draw, team2 };
}

// Kurzname aus Teamname (optional)
function getShortName(fullName) {
  return fullName.split(' ').slice(1).join(' ') || fullName;
}

// Delay für Simulation
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Spielsimulation mit 20 Minuten (simuliert als Sekunden für Schnelligkeit)
async function simulateMatch(message, team1, team2, icon1, icon2) {
  let minute = 0;
  let score1 = 0;
  let score2 = 0;
  let xG1 = 0;
  let xG2 = 0;
  let events = [];

  const team1Short = getShortName(team1.name);
  const team2Short = getShortName(team2.name);

  while (minute <= 20) {
    await delay(1000); // 1 Sekunde pro "Minute"

    // Zufällige Chancen und Ereignisse
    if (Math.random() < 0.3) {
      // Chance für Team1
      const xgChance = +(Math.random() * 0.5).toFixed(2);
      xG1 += xgChance;
      events.push(`${icon1} Chance für ${team1Short} (xG: ${xgChance.toFixed(2)})`);
      if (Math.random() < xgChance / 2) {
        score1++;
        events.push(`⚽ Tor für ${icon1} ${team1Short}!`);
      }
    }

    if (Math.random() < 0.3) {
      // Chance für Team2
      const xgChance = +(Math.random() * 0.5).toFixed(2);
      xG2 += xgChance;
      events.push(`${icon2} Chance für ${team2Short} (xG: ${xgChance.toFixed(2)})`);
      if (Math.random() < xgChance / 2) {
        score2++;
        events.push(`⚽ Tor für ${icon2} ${team2Short}!`);
      }
    }

    // Ereignisse kürzen auf max 5 Einträge
    if (events.length > 5) events = events.slice(events.length - 5);

    // Embed aktualisieren
    const embed = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1Short} vs. ${icon2} ${team2Short}`)
      .setColor(score1 > score2 ? 'Green' : score1 < score2 ? 'Red' : 'Yellow')
      .addFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} : ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: events.join('\n') || 'Noch keine Ereignisse...' }
      );

    await message.edit({ embeds: [embed] });

    minute++;
  }

  // Endergebnis
  const resultText = score1 > score2
    ? `${icon1} ${team1Short} gewinnt! 🎉`
    : score2 > score1
      ? `${icon2} ${team2Short} gewinnt! 🎉`
      : `Unentschieden! 🤝`;

  await message.channel.send(resultText);
}
