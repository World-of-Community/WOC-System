const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');
const path = require('path');

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

      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      const odds = generateOdds();

      // Status-Embed
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

      // Aufstellungs-Embed
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
  }
};

// Hilfsfunktionen

function getTwoDifferentTeams(teams) {
  let idx1 = Math.floor(Math.random() * teams.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * teams.length);
  } while (idx2 === idx1);
  return [teams[idx1], teams[idx2]];
}

function generateOdds() {
  // Beispielhafte Quoten, kannst du beliebig anpassen
  const team1 = 1 + Math.random() * 3;
  const team2 = 1 + Math.random() * 3;
  const draw = 1 + Math.random() * 3;
  return { team1, team2, draw };
}

async function simulateMatch(interaction, team1, team2, icon1, icon2, name1, name2, userTip) {
  let score1 = 0;
  let score2 = 0;
  let minute = 0;
  let xG1 = 0;
  let xG2 = 0;
  let events = [];

  const maxMinutes = 90;

  // Simuliere jeden 10. Spielminute mit kurzer Pause
  for (minute = 10; minute <= maxMinutes; minute += 10) {
    // Simuliere Ereignisse und Tore mit Wahrscheinlichkeiten
    const eventChance = Math.random();
    if (eventChance < 0.3) {
      // Torchance
      const scoringTeam = Math.random() < 0.5 ? 1 : 2;
      if (scoringTeam === 1) {
        score1++;
        xG1 += +(0.5 + Math.random()).toFixed(2);
        events.push(`${minute}' - Tor für ${icon1} ${name1}!`);
      } else {
        score2++;
        xG2 += +(0.5 + Math.random()).toFixed(2);
        events.push(`${minute}' - Tor für ${icon2} ${name2}!`);
      }
    } else {
      // Keine Tore, nur xG steigern
      xG1 += +(Math.random() * 0.3).toFixed(2);
      xG2 += +(Math.random() * 0.3).toFixed(2);
      events.push(`${minute}' - Keine Tore, Spiel läuft.`);
    }

    // Status-Embed updaten
    const embed = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${icon1} ${name1} vs. ${icon2} ${name2}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} : ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: events.slice(-5).join('\n') }
      );

    await interaction.followUp({ embeds: [embed] });

    // Kurze Pause simulieren
    await new Promise(res => setTimeout(res, 3000));
  }

  // Ergebnis auswerten und Tipp überprüfen
  let resultText;
  if (score1 > score2) resultText = 'team1';
  else if (score1 < score2) resultText = 'team2';
  else resultText = 'draw';

  const won = (resultText === userTip);
  const resultString = won ? 'Du hast richtig getippt! 🎉' : 'Leider falsch getippt. 😢';

  // Endergebnis-Embed
  const embedFinal = new EmbedBuilder()
    .setTitle(`🏁 Spiel beendet: ${icon1} ${name1} ${score1} : ${score2} ${icon2} ${name2}`)
    .setColor(won ? 'Green' : 'Red')
    .setDescription(resultString)
    .addFields(
      { name: 'Dein Tipp', value: userTip === 'team1' ? `${icon1} ${name1} gewinnt` : userTip === 'team2' ? `${icon2} ${name2} gewinnt` : 'Unentschieden' },
      { name: 'Spielstand', value: `${score1} : ${score2}` },
      { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}` }
    );

  await interaction.followUp({ embeds: [embedFinal] });
}
