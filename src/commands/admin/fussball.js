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
        await i.reply({ content: `Du hast getippt: ${userTip}`, ephemeral: true });
        collector.stop(userTip);
      });

      collector.on('end', async (_, reason) => {
        if (reason === 'time') {
          await interaction.followUp('⏰ Zeit abgelaufen! Es wurde kein Tipp abgegeben.');
          return;
        }
        const userTip = reason; // Der getippte Ausgang

        // Simuliere das Spiel und Ergebnis
        const gameResult = simulateGame(team1.name, team2.name);

        // Ergebnis-Embed erstellen
        const resultEmbed = new EmbedBuilder()
          .setTitle('⚽ Spielende!')
          .setColor('Gold')
          .setDescription(
            `**${icon1} ${team1LastName}** vs **${icon2} ${team2LastName}**\n` +
            `Endstand: **${gameResult.score1} : ${gameResult.score2}**\n` +
            `xG: ${gameResult.xg1.toFixed(2)} : ${gameResult.xg2.toFixed(2)}\n\n` +
            `**Dein Tipp:** ${userTip}\n` +
            (checkUserTip(userTip, gameResult.score1, gameResult.score2)
              ? '🎉 Du hast richtig getippt!'
              : '❌ Leider falsch getippt.')
          )
          .addFields(
            { name: 'Ereignisse', value: gameResult.events.length ? gameResult.events.join('\n') : 'Keine besonderen Ereignisse.' }
          );

        await interaction.followUp({ embeds: [resultEmbed], components: [] });
      });

    } catch (error) {
      console.error(error);
      interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  }
};

// Hilfsfunktionen

function getTwoDifferentTeams(teams) {
  if (teams.length < 2) throw new Error('Nicht genug Teams in DB');

  let idx1 = Math.floor(Math.random() * teams.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * teams.length);
  } while (idx2 === idx1);

  return [teams[idx1], teams[idx2]];
}

function generateOdds() {
  // Einfach Zufallsquoten
  const team1 = (Math.random() * 3 + 1).toFixed(2);
  const draw = (Math.random() * 3 + 1).toFixed(2);
  const team2 = (Math.random() * 3 + 1).toFixed(2);
  return { team1, draw, team2 };
}

function simulateGame(team1Name, team2Name) {
  // Zufällige Toranzahl 0-5
  const score1 = Math.floor(Math.random() * 6);
  const score2 = Math.floor(Math.random() * 6);

  // Zufällige xG-Werte (expected goals)
  const xg1 = (Math.random() * 3).toFixed(2);
  const xg2 = (Math.random() * 3).toFixed(2);

  // Zufällige Ereignisse
  const possibleEvents = [
    "Gelbe Karte für Müller",
    "Elfmeter für " + team1Name,
    "Rote Karte für Schmidt",
    "Freistoß für " + team2Name,
    "Tor für " + team1Name,
    "Tor für " + team2Name,
    "Verletzung bei Spieler X",
  ];
  const events = [];
  const eventCount = Math.floor(Math.random() * 5);
  for (let i = 0; i < eventCount; i++) {
    const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    events.push(`'${(i+1)*10}' - ${event}`);
  }

  return { score1, score2, xg1: parseFloat(xg1), xg2: parseFloat(xg2), events };
}

function checkUserTip(tip, score1, score2) {
  if (tip === 'draw') return score1 === score2;
  if (tip === 'team1') return score1 > score2;
  if (tip === 'team2') return score2 > score1;
  return false;
}
