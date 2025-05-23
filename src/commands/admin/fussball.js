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

      // Letzter Teil des Teamnamens (z.B. „Adler“ aus „FC Adler“)
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Tore', value: 'Noch keine Tore...' }
        );

      const players1 = team1.players ? team1.players : [];
      const players2 = team2.players ? team2.players : [];

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
          .setLabel(`${icon1} ${team1LastName} gewinnt`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('draw')
          .setLabel('Unentschieden')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('win_team2')
          .setLabel(`${icon2} ${team2LastName} gewinnt`)
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

  let minute = 0;
  const totalMatchMinutes = 90;
  const realTimePerMinuteMs = 1000; // 1 Sekunde pro Spielminute

  const embedStatus = new EmbedBuilder()
    .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
    .setColor('Green')
    .addFields(
      { name: 'Spielminute', value: '0\'', inline: true },
      { name: 'Spielstand', value: `0 : 0`, inline: true },
      { name: 'xG', value: `0.00 : 0.00`, inline: true },
      { name: 'Tore', value: 'Noch keine Tore...' }
    );

  await interaction.editReply({ embeds: [embedStatus] });

  for (; minute <= totalMatchMinutes; minute++) {
    // Torchance 30%
    if (Math.random() < 0.3) {
      const scoringTeam = Math.random() < 0.5 ? team1.name : team2.name;
      const players = teamData[scoringTeam];
      const scorer = players.length > 0 ? players[Math.floor(Math.random() * players.length)] : 'Unbekannter Spieler';
      score[scoringTeam]++;

      const chanceXG = (Math.random() * 0.4) + 0.1;
      xG[scoringTeam] += chanceXG;

      log.push(`⚽ ${minute}. Minute: ${scorer} (${scoringTeam}) [xG: ${chanceXG.toFixed(2)}]`);
    } else {
      // Chance auf xG, auch ohne Tor (10%)
      if (Math.random() < 0.1) {
        const teamForXG = Math.random() < 0.5 ? team1.name : team2.name;
        const chanceXG = (Math.random() * 0.09) + 0.01;
        xG[teamForXG] += chanceXG;
      }
    }

    embedStatus.spliceFields(0, 4,
      { name: 'Spielminute', value: `${minute}'`, inline: true },
      { name: 'Spielstand', value: `${score[team1.name]} : ${score[team2.name]}`, inline: true },
      { name: 'xG', value: `${xG[team1.name].toFixed(2)} : ${xG[team2.name].toFixed(2)}`, inline: true },
      { name: 'Tore', value: log.length > 0 ? log.join('\n') : 'Noch keine Tore...' }
    );

    await interaction.editReply({ embeds: [embedStatus] });
    await new Promise(resolve => setTimeout(resolve, realTimePerMinuteMs));
  }

  // Ergebnis auswerten
  let punkte1 = 0, punkte2 = 0;
  let ergebnisText;
  if (score[team1.name] > score[team2.name]) {
    ergebnisText = `${team1LastName} gewinnt`;
    punkte1 = 3;
  } else if (score[team2.name] > score[team1.name]) {
    ergebnisText = `${team2LastName} gewinnt`;
    punkte2 = 3;
  } else {
    ergebnisText = 'Unentschieden';
    punkte1 = 1;
    punkte2 = 1;
  }

  const tippRichtig =
    (userTip === 'team1' && score[team1.name] > score[team2.name]) ||
    (userTip === 'team2' && score[team2.name] > score[team1.name]) ||
    (userTip === 'draw' && score[team1.name] === score[team2.name]);

  await updateTeamStats(team1.name, punkte1);
  await updateTeamStats(team2.name, punkte2);

  embedStatus
    .setTitle(`🏁 Spiel beendet: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
    .setDescription(
      `Endstand: ${score[team1.name]} : ${score[team2.name]}\n` +
      `xG: ${xG[team1.name].toFixed(2)} : ${xG[team2.name].toFixed(2)}\n\n` +
      `Dein Tipp war ${tippRichtig ? '**richtig! 🎉**' : '**falsch. 😞**'}\n` +
      `Ergebnis: **${ergebnisText}**`
    );

  await interaction.editReply({ embeds: [embedStatus] });
}

async function updateTeamStats(teamName, punkte) {
  try {
    const team = await Team.findOne({ name: teamName });
    if (!team) return;
    team.stats = team.stats || {};
    team.stats.spiele = (team.stats.spiele || 0) + 1;
    team.stats.punkte = (team.stats.punkte || 0) + punkte;
    await team.save();
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Stats für ${teamName}:`, error);
  }
}
