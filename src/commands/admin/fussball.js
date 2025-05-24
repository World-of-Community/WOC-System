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

        await simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip, players1, players2);
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
      console.error(error);
      interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  }
};

// Hilfsfunktionen

function getTwoDifferentTeams(teams) {
  const index1 = Math.floor(Math.random() * teams.length);
  let index2;
  do {
    index2 = Math.floor(Math.random() * teams.length);
  } while (index2 === index1);
  return [teams[index1], teams[index2]];
}

function generateOdds() {
  // Beispielquoten, mit einem leichten Vorteil für Team1 (kann randomisiert werden)
  const team1 = (Math.random() * 2 + 1).toFixed(2);
  const draw = (Math.random() * 3 + 2).toFixed(2);
  const team2 = (Math.random() * 2 + 1).toFixed(2);
  return { team1, draw, team2 };
}

async function simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip, players1, players2) {
  let minute = 0;
  let score1 = 0;
  let score2 = 0;
  let xG1 = 0;
  let xG2 = 0;
  let events = [];

  // Simuliere 90 Minuten in Schritten von 5 Minuten
  while (minute < 90) {
    minute += 5;

    // Simuliere ein Event
    const event = generateEvent(team1LastName, team2LastName, players1, players2, icon1, icon2);
    if (event) {
      events.push(`**${minute}'** - ${event.text}`);
      if (event.scoredBy === 'team1') {
        score1++;
        xG1 += event.xG;
      } else if (event.scoredBy === 'team2') {
        score2++;
        xG2 += event.xG;
      }
    }

    // Zwischenergebnis posten
    const embedUpdate = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} : ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: events.slice(-5).join('\n') || 'Noch keine Ereignisse...' }
      );

    await interaction.followUp({ embeds: [embedUpdate] });
    await delay(1500); // kurze Pause, damit nicht alles instant passiert
  }

  // Ergebnis auswerten und Gewinner ermitteln
  let winnerText = 'Unentschieden';
  if (score1 > score2) winnerText = `${icon1} ${team1LastName} gewinnt!`;
  else if (score2 > score1) winnerText = `${icon2} ${team2LastName} gewinnt!`;

  const tipCorrect = 
    (userTip === 'team1' && score1 > score2) ||
    (userTip === 'team2' && score2 > score1) ||
    (userTip === 'draw' && score1 === score2);

  const embedFinal = new EmbedBuilder()
    .setTitle(`🏁 Spiel beendet: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
    .setColor(tipCorrect ? 'Green' : 'Red')
    .addFields(
      { name: 'Endstand', value: `${score1} : ${score2}`, inline: true },
      { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
      { name: 'Ereignisse', value: events.join('\n') || 'Keine Ereignisse' },
      { name: 'Dein Tipp', value: userTip === 'team1' ? `${icon1} ${team1LastName}` : userTip === 'team2' ? `${icon2} ${team2LastName}` : 'Unentschieden' },
      { name: 'Tipp Ergebnis', value: tipCorrect ? '✅ Dein Tipp war richtig!' : '❌ Leider falsch.' }
    );

  await interaction.followUp({ embeds: [embedFinal] });
}

function generateEvent(team1Name, team2Name, players1, players2, icon1, icon2) {
  // Eventtypen mit Wahrscheinlichkeiten
  const eventTypes = [
    { type: 'goal', prob: 0.15 },
    { type: 'yellow', prob: 0.10 },
    { type: 'red', prob: 0.03 },
    { type: 'corner', prob: 0.12 },
    { type: 'foul', prob: 0.20 },
    { type: 'shot_on_target', prob: 0.20 },
    { type: 'nothing', prob: 0.20 }
  ];

  // Zufallswert zum Auswählen
  let rand = Math.random();
  let acc = 0;
  let selectedType = 'nothing';
  for (const e of eventTypes) {
    acc += e.prob;
    if (rand <= acc) {
      selectedType = e.type;
      break;
    }
  }
  if (selectedType === 'nothing') return null;

  // Team für Event wählen
  const teamIs1 = Math.random() < 0.5;
  const teamName = teamIs1 ? team1Name : team2Name;
  const icon = teamIs1 ? icon1 : icon2;
  const players = teamIs1 ? players1 : players2;
  const player = players.length ? players[Math.floor(Math.random() * players.length)] : 'Spieler';

  // xG Werte für Tore/Schüsse
  const xGValue = (Math.random() * 0.3 + 0.05);

  switch (selectedType) {
    case 'goal':
      return { 
        text: `${icon} Tor für **${teamName}** durch **${player}**! ⚽ (xG: ${xGValue.toFixed(2)})`, 
        scoredBy: teamIs1 ? 'team1' : 'team2', 
        xG: xGValue 
      };
    case 'yellow':
      return { text: `Gelbe Karte für **${player}** von ${icon} ${teamName} 🟨`, scoredBy: null, xG: 0 };
    case 'red':
      return { text: `Rote Karte für **${player}** von ${icon} ${teamName} 🟥`, scoredBy: null, xG: 0 };
    case 'corner':
      return { text: `Ecke für ${icon} ${teamName} ⚽`, scoredBy: null, xG: 0 };
    case 'foul':
      return { text: `Foul von **${player}** (${icon} ${teamName}) ❌`, scoredBy: null, xG: 0 };
    case 'shot_on_target':
      return { 
        text: `Schuss aufs Tor von **${player}** (${icon} ${teamName}) (xG: ${xGValue.toFixed(2)})`, 
        scoredBy: null, 
        xG: xGValue 
      };
    default:
      return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
