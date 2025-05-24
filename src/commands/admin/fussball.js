const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');

const teamIcons = {
  'FC Adler': '🦅', 'SV Löwen': '🦁', 'TSV Eiche': '🌳', 'SC Blau': '🔵',
  'VfB Stern': '⭐', 'FC Rot-Weiß': '🔴⚪', 'SV Grünwald': '🌲', 'TSV Nord': '❄️',
  'SC Süd': '☀️', 'VfB West': '🌅', 'FC Ostwind': '🌬️', 'SV Nordstern': '🌟',
  'TSV Berg': '⛰️', 'SC Tal': '🏞️', 'VfB See': '🌊', 'FC Sturm': '🌪️',
  'SV Blitz': '⚡', 'TSV Vulkan': '🌋', 'SC Frost': '❄️', 'VfB Flamme': '🔥',
  'FC Donner': '⛈️', 'SV Schatten': '🌑', 'TSV Nebel': '🌫️', 'SC Licht': '💡',
};

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
  { "name": "SC Licht", "players": ["Günther", "Kaiser", "Sachs", "Mayer"] },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
      // Teams aus der DB laden (nur Pro League)
      const proLeagueTeams = await Team.find({ league: 'Pro League' });

      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      // Zwei unterschiedliche Teams zufällig auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      // Team-Icons laden (Fallback auf ⚽)
      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // Letzter Teil des Teamnamens (z.B. „Adler“ aus „FC Adler“)
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      // Wettquoten generieren
      const odds = generateOdds();

      // Status-Embed mit Spielstart
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Tore', value: 'Noch keine Tore...' }
        );

      // Aufstellungs-Embed mit Spielern
      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length > 0 ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length > 0 ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons für Tipp abgeben
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('win_team1')
          .setLabel(`${icon1} ${team1LastName} gewinnt (${odds.team1.toFixed(2)})`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('draw')
          .setLabel(`Unentschieden (${odds.draw.toFixed(2)})`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('win_team2')
          .setLabel(`${icon2} ${team2LastName} gewinnt (${odds.team2.toFixed(2)})`)
          .setStyle(ButtonStyle.Primary),
      );

      // Erstantwort mit Status-Embed
      await interaction.reply({ embeds: [embedStatus] });
      // Zweite Nachricht mit Aufstellung + Buttons
      await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

      // Filter für Button-Collector (nur Nutzer, der den Befehl nutzt)
      const filter = i => i.user.id === interaction.user.id;

      // Collector für Button-Klicks, Timeout nach 60 Sekunden
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

        // Update, um Buttons zu entfernen und Start anzukündigen
        await i.update({ content: 'Das Spiel startet... ⚽', embeds: [], components: [] });
        collector.stop();

        // Match simulieren
        await simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip);
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          // Wenn keine Auswahl getroffen wurde
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

function getTwoDifferentTeams(teams) {
  if (teams.length < 2) throw new Error('Mindestens zwei Teams benötigt.');
  const team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);
  return [teams[team1Index], teams[team2Index]];
}

/**
 * Generiert fiktive Wettquoten für Team1 Sieg, Unentschieden und Team2 Sieg.
 * Summe der Wahrscheinlichkeiten = 1
 * Die Quoten sind das Inverse der Wahrscheinlichkeiten (vereinfacht).
 */
function generateOdds() {
  // Beispiel Wahrscheinlichkeiten (Summe = 1)
  const pTeam1 = Math.random() * 0.6 + 0.2; // 0.2 bis 0.8
  const pTeam2 = Math.random() * (1 - pTeam1);
  const pDraw = 1 - pTeam1 - pTeam2;

  // Quoten sind das Inverse der Wahrscheinlichkeiten (vereinfachte Wettquote)
  const qTeam1 = Math.max(1.01, 1 / pTeam1);
  const qDraw = Math.max(1.01, 1 / pDraw);
  const qTeam2 = Math.max(1.01, 1 / pTeam2);

  return { team1: qTeam1, draw: qDraw, team2: qTeam2 };
}

// Hilfsfunktion für Delay
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip) {
  let score = {};
  score[team1.name] = 0;
  score[team2.name] = 0;

  let xG = {};
  xG[team1.name] = 0;
  xG[team2.name] = 0;

  let log = [];

  const teamData = {};
  teamData[team1.name] = team1.players || [];
  teamData[team2.name] = team2.players || [];

  const totalMatchMinutes = 90;
  const realTimePerMinuteMs = 1000; // 1 Sekunde pro Spielminute

  const embed = new EmbedBuilder()
    .setTitle(`⚽ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
    .setColor('Green');

  // Simuliere jeden Spielabschnitt mit zufälligen Ereignissen
  for (let minute = 1; minute <= totalMatchMinutes; minute += 15) {
    // Simuliere xG-Zuwachs (0.0 bis 0.6) pro Team
    xG[team1.name] += Math.random() * 0.6;
    xG[team2.name] += Math.random() * 0.6;

    // Simuliere Torchancen
    if (Math.random() < 0.3) {
      // Tor für Team1
      score[team1.name]++;
      const scorer = randomFromArray(teamData[team1.name]) || 'Unbekannter Spieler';
      log.push(`⚽ ${minute}': Tor für ${team1LastName} durch ${scorer}`);
    }
    if (Math.random() < 0.3) {
      // Tor für Team2
      score[team2.name]++;
      const scorer = randomFromArray(teamData[team2.name]) || 'Unbekannter Spieler';
      log.push(`⚽ ${minute}': Tor für ${team2LastName} durch ${scorer}`);
    }

    embed.setFields(
      { name: 'Spielminute', value: `${minute}'`, inline: true },
      { name: 'Spielstand', value: `${score[team1.name]} : ${score[team2.name]}`, inline: true },
      {
        name: 'xG',
        value: `${xG[team1.name].toFixed(2)} : ${xG[team2.name].toFixed(2)}`,
        inline: true,
      },
      { name: 'Tore', value: log.length > 0 ? log.join('\n') : 'Noch keine Tore...' }
    );

    await interaction.editReply({ embeds: [embed] });
    await wait(realTimePerMinuteMs * 2); // kurze Pause (2 Sekunden pro 15 Minuten Spielzeit)
  }

  // Ergebnis festlegen
  let resultText = '';
  let winningTeam = null;
  if (score[team1.name] > score[team2.name]) {
    resultText = `${icon1} ${team1LastName} gewinnt!`;
    winningTeam = 'team1';
  } else if (score[team1.name] < score[team2.name]) {
    resultText = `${icon2} ${team2LastName} gewinnt!`;
    winningTeam = 'team2';
  } else {
    resultText = 'Das Spiel endet unentschieden!';
    winningTeam = 'draw';
  }

  // Tipp-Auswertung
  let tipResult = '';
  if (userTip === winningTeam) {
    tipResult = '✅ Dein Tipp war richtig!';
  } else {
    tipResult = '❌ Dein Tipp war leider falsch.';
  }

  // Abschluss-Embed
  const embedFinal = new EmbedBuilder()
    .setTitle(`🏆 Spiel beendet: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
    .setColor(winningTeam === 'draw' ? 'Yellow' : 'Green')
    .addFields(
      { name: 'Endergebnis', value: `${score[team1.name]} : ${score[team2.name]}` },
      { name: 'Tore', value: log.length > 0 ? log.join('\n') : 'Keine Tore' },
      { name: 'Dein Tipp', value: tipResult }
    );

  await interaction.editReply({ embeds: [embedFinal] });
}

function randomFromArray(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
