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

      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: `0'`, inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Tore', value: 'Noch keine Tore...' }
        );

      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

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

function generateOdds() {
  const pTeam1 = Math.random() * 0.6 + 0.2;
  const pTeam2 = Math.random() * (1 - pTeam1);
  const pDraw = 1 - pTeam1 - pTeam2;

  return {
    team1: Math.max(1.01, 1 / pTeam1),
    draw: Math.max(1.01, 1 / pDraw),
    team2: Math.max(1.01, 1 / pTeam2),
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomPlayer(players) {
  if (!players || players.length === 0) return 'Unbekannter Spieler';
  return players[Math.floor(Math.random() * players.length)];
}

async function simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip) {
  let score = { [team1.name]: 0, [team2.name]: 0 };
  let xG = { [team1.name]: 0, [team2.name]: 0 };
  let log = [];
  const teamData = { [team1.name]: team1.players || [], [team2.name]: team2.players || [] };
  const realTimePerMinuteMs = 1000;

  for (let minute = 1; minute <= 90; minute++) {
    xG[team1.name] += Math.random() * 0.03;
    xG[team2.name] += Math.random() * 0.03;

    if (Math.random() < xG[team1.name] / 10 - score[team1.name] * 0.1) {
      score[team1.name]++;
      const scorer = getRandomPlayer(teamData[team1.name]);
      log.push(`⚽ ${icon1} ${team1LastName} Tor durch **${scorer}** (${minute}')`);
    }

    if (Math.random() < xG[team2.name] / 10 - score[team2.name] * 0.1) {
      score[team2.name]++;
      const scorer = getRandomPlayer(teamData[team2.name]);
      log.push(`⚽ ${icon2} ${team2LastName} Tor durch **${scorer}** (${minute}')`);
    }

    const embedUpdate = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score[team1.name]} : ${score[team2.name]}`, inline: true },
        { name: 'xG', value: `${xG[team1.name].toFixed(2)} : ${xG[team2.name].toFixed(2)}`, inline: true },
        { name: 'Tore', value: log.length > 0 ? log.join('\n') : 'Noch keine Tore...' }
      );

    await interaction.editReply({ embeds: [embedUpdate] });
    await sleep(realTimePerMinuteMs);
  }

  // Ergebnis auswerten
  let result;
  if (score[team1.name] > score[team2.name]) result = 'team1';
  else if (score[team1.name] < score[team2.name]) result = 'team2';
  else result = 'draw';

  const gewonnen = result === userTip;

  const resultMessage = new EmbedBuilder()
    .setTitle(`🏁 Spiel beendet: ${icon1} ${team1LastName} ${score[team1.name]} : ${score[team2.name]} ${icon2} ${team2LastName}`)
    .setDescription(`${gewonnen ? '✅ Glückwunsch, dein Tipp war richtig!' : '❌ Leider war dein Tipp falsch.'}`)
    .setColor(gewonnen ? 'Green' : 'Red');

  await interaction.followUp({ embeds: [resultMessage] });
}
