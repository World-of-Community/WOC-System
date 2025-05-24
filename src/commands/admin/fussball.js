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

      // Zwei verschiedene Teams auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // Letzter Teil des Teamnamens für Kurzform (z.B. "Adler" aus "FC Adler")
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      const odds = generateOdds();

      // Status-Embed initial
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: `0'`, inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
        );

      // Aufstellung aus teamsData holen
      const players1 = teamsData.find(t => t.name === team1.name)?.players || [];
      const players2 = teamsData.find(t => t.name === team2.name)?.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons mit Quoten
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

      await interaction.reply({ embeds: [embedStatus] });
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
          default:
            return await i.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
        }

        await i.update({ content: 'Das Spiel startet... ⚽', embeds: [], components: [] });
        collector.stop();

        await simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip);
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: '⏱️ Zeit abgelaufen, kein Tipp abgegeben.',
            components: [],
          });
        }
      });
    } catch (error) {
      console.error('❌ Fehler im /fussball Command:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
      }
    }
  },
};

function getTwoDifferentTeams(teams) {
  let idx1 = Math.floor(Math.random() * teams.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * teams.length);
  } while (idx2 === idx1);
  return [teams[idx1], teams[idx2]];
}

function generateOdds() {
  // Beispiel-Quoten zwischen 1.2 und 4.5, gleich nicht exakt 1.0
  const team1 = (Math.random() * 3.3 + 1.2).toFixed(2);
  const team2 = (Math.random() * 3.3 + 1.2).toFixed(2);
  const draw = (Math.random() * 3 + 2).toFixed(2);
  return { team1, team2, draw };
}

async function simulateMatch(interaction, team1, team2, icon1, icon2, team1Name, team2Name, userTip) {
  let minute = 0;
  let score = [0, 0];
  let xG = [0, 0];
  let events = [];

  const maxMinutes = 90;
  const eventPool = [
  `${icon1} Ecke für ${team1Name}`,
  `${icon2} Freistoß für ${team2Name}`,
  `${icon1} Torschuss knapp vorbei von ${getRandomPlayer(team1Players)}`,
  `${icon2} Gelbe Karte für ${getRandomPlayer(team2Players)}`,
  `${icon1} Torchance für ${getRandomPlayer(team1Players)}!`,
  `${icon2} Torchance für ${getRandomPlayer(team2Players)}!`,
  `${icon1} Spieler ${getRandomPlayer(team1Players)} verletzt sich`,
  `${icon2} Spieler ${getRandomPlayer(team2Players)} verletzt sich`,
  `${icon1} Tor! Torschütze: ${getRandomPlayer(team1Players)}`,
  `${icon2} Tor! Torschütze: ${getRandomPlayer(team2Players)}`,
];

  // Einfache Simulation: alle 5 Sekunden eine Spielminute erhöhen und evtl. Event
  for (; minute <= maxMinutes; minute += 5) {
    // Zufälliges Ereignis (50% Chance)
    if (Math.random() < 0.5) {
      let event = eventPool[Math.floor(Math.random() * eventPool.length)];

      // Wenn Tor, erhöhe Score und xG
      if (event.includes('Tor!')) {
        if (event.includes(icon1)) {
          score[0]++;
          xG[0] += parseFloat((Math.random() * 0.7 + 0.3).toFixed(2));
        } else {
          score[1]++;
          xG[1] += parseFloat((Math.random() * 0.7 + 0.3).toFixed(2));
        }
      } else {
        // Normale Ereignisse erhöhen xG leicht
        if (event.includes(icon1)) xG[0] += 0.05;
        if (event.includes(icon2)) xG[1] += 0.05;
      }

      events.push(`${minute}' - ${event}`);

      if (events.length > 5) events.shift(); // max 5 Events anzeigen
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1Name} vs. ${icon2} ${team2Name}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score[0]} : ${score[1]}`, inline: true },
        { name: 'xG', value: `${xG[0].toFixed(2)} : ${xG[1].toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: events.length ? events.join('\n') : 'Noch keine Ereignisse...' }
      );

    await interaction.editReply({ embeds: [embed] });
    await delay(5000);
  }

  // Spiel beendet: Ergebnis auswerten und Tipp vergleichen
  let result;
  if (score[0] > score[1]) result = 'team1';
  else if (score[1] > score[0]) result = 'team2';
  else result = 'draw';

  const tipCorrect = result === userTip;

  const resultEmbed = new EmbedBuilder()
    .setTitle(`⚽ Spiel beendet: ${icon1} ${team1Name} vs. ${icon2} ${team2Name}`)
    .setColor(tipCorrect ? 'Green' : 'Red')
    .addFields(
      { name: 'Endstand', value: `${score[0]} : ${score[1]}`, inline: true },
      { name: 'Dein Tipp', value: userTip === 'team1' ? `${icon1} Sieg` : userTip === 'team2' ? `${icon2} Sieg` : 'Unentschieden', inline: true },
      { name: 'Ergebnis', value: tipCorrect ? '✅ Richtig getippt!' : '❌ Leider falsch getippt.' }
    );

  await interaction.editReply({ embeds: [resultEmbed] });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
