const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Team } = require('../../../Datenbank/fussballdb');

const fussballteams = require(path.join(__dirname, '..', '..', 'json', 'fussballteams.json'));

const teamIcons = {
  'FC Adler': '🦅', 'SV Löwen': '🦁', 'TSV Eiche': '🌳', 'SC Blau': '🔵',
  'VfB Stern': '⭐', 'FC Rot-Weiß': '🔴⚪', 'SV Grünwald': '🌲', 'TSV Nord': '❄️',
  'SC Süd': '☀️', 'VfB West': '🌅', 'FC Ostwind': '🌬️', 'SV Nordstern': '🌟',
  'TSV Berg': '⛰️', 'SC Tal': '🏞️', 'VfB See': '🌊', 'FC Sturm': '🌪️',
  'SV Blitz': '⚡', 'TSV Vulkan': '🌋', 'SC Frost': '❄️', 'VfB Flamme': '🔥',
  'FC Donner': '⛈️', 'SV Schatten': '🌑', 'TSV Nebel': '🌫️', 'SC Licht': '💡',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    const proLeagueTeams = await Team.find({ league: 'Pro League' });
    if (!proLeagueTeams || proLeagueTeams.length < 2) {
      return interaction.reply({
        content: '❌ Es sind nicht genug Teams in der Pro League.',
        ephemeral: true,
      });
    }

    const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);
    const icon1 = teamIcons[team1.name] || '⚽';
    const icon2 = teamIcons[team2.name] || '⚽';
    const team1Short = team1.name.split(' ').slice(1).join(' ') || team1.name;
    const team2Short = team2.name.split(' ').slice(1).join(' ') || team2.name;

    const odds = generateOdds();

    const embedStatus = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1Short} vs. ${icon2} ${team2Short}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: '0\'', inline: true },
        { name: 'Spielstand', value: `0 : 0`, inline: true },
        { name: 'xG', value: `0.00 : 0.00`, inline: true },
        { name: 'Tore', value: 'Noch keine Tore...' }
      );

    const players1 = team1.players?.length
      ? team1.players
      : getPlayersFromJSON(team1.name);
    const players2 = team2.players?.length
      ? team2.players
      : getPlayersFromJSON(team2.name);

    const embedLineup = new EmbedBuilder()
      .setTitle('📋 Aufstellung')
      .setColor('Blue')
      .setDescription(
        `**${icon1} ${team1Short}:**\n${players1.join(', ') || 'Keine Spieler-Daten'}\n\n` +
        `**${icon2} ${team2Short}:**\n${players2.join(', ') || 'Keine Spieler-Daten'}`
      );

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('win_team1')
        .setLabel(`${icon1} ${team1Short} gewinnt (${odds.team1.toFixed(2)})`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('draw')
        .setLabel(`Unentschieden (${odds.draw.toFixed(2)})`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('win_team2')
        .setLabel(`${icon2} ${team2Short} gewinnt (${odds.team2.toFixed(2)})`)
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

      await i.update({
        content: `📢 Du hast auf **${userTip === 'team1' ? icon1 + ' ' + team1Short : userTip === 'team2' ? icon2 + ' ' + team2Short : 'Unentschieden'}** getippt. Das Spiel startet...`,
        embeds: [],
        components: [],
      });

      collector.stop();

      await simulateMatch(interaction, team1, team2, icon1, icon2, team1Short, team2Short, userTip);
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.followUp({ content: '⏱️ Zeit zum Tippen ist abgelaufen!', components: [] });
      }
    });
  }
};

// Hilfsfunktionen
function getTwoDifferentTeams(teams) {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function generateOdds() {
  const team1 = Math.random() * (2.5 - 1.2) + 1.2;
  const team2 = Math.random() * (2.5 - 1.2) + 1.2;
  const draw = Math.random() * (3.5 - 2.0) + 2.0;
  return { team1, team2, draw };
}

function getPlayersFromJSON(teamName) {
  const team = fussballteams.find(t => t.name === teamName);
  return team?.players || [];
}

async function simulateMatch(interaction, team1, team2, icon1, icon2, team1Short, team2Short, userTip) {
  // Dummy Simulation
  const goals1 = Math.floor(Math.random() * 5);
  const goals2 = Math.floor(Math.random() * 5);

  const embedResult = new EmbedBuilder()
    .setTitle(`🏁 Endstand: ${icon1} ${team1Short} ${goals1} : ${goals2} ${icon2} ${team2Short}`)
    .setColor('Gold')
    .setDescription(userTip === (goals1 > goals2 ? 'team1' : goals2 > goals1 ? 'team2' : 'draw')
      ? '🎉 Du hast richtig getippt!'
      : '😢 Leider daneben getippt.');

  await interaction.followUp({ embeds: [embedResult] });
}
