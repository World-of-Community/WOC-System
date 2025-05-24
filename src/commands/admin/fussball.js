const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const fs = require('fs');
const { Team } = require('../../../Datenbank/fussballdb'); // Dein Datenbankmodell
const teams = JSON.parse(fs.readFileSync('../../../fussballteams.json', 'utf-8'));

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
      // 1. Pro League Teams aus DB holen
      const proLeagueTeams = await Team.find({ league: 'Pro League' });
      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      // 2. Zwei verschiedene Teams auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      // 3. Icons aus Mapping, falls nicht vorhanden ⚽ Standard
      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // 4. Letzter Teil vom Teamnamen (z.B. "Adler" aus "FC Adler")
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      // 5. Wettquoten (Zufall)
      const odds = generateOdds();

      // 6. Status-Embed initial
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Tore', value: 'Noch keine Tore...' }
        );

      // 7. Aufstellung-Embed
      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // 8. Buttons für Tipp (Team1 gewinnt, Unentschieden, Team2 gewinnt)
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

      // 9. Button-Collector, nur für User, 60 Sekunden Zeit
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

        // Spiel simulieren mit dem Tipp des Nutzers
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

/**
 * Generiert fiktive Wettquoten für Team1 Sieg, Unentschieden und Team2 Sieg.
 * Summe der Wahrscheinlichkeiten = 1
 */
function generateOdds() {
  const pTeam1 = Math.random() * 0.6 + 0.2; // zwischen 0.2 und 0.8
  const pTeam2 = Math.random() * (1 - pTeam1);
  const pDraw = 1 - pTeam1 - pTeam2;

  const qTeam1 = Math.max(1.01, 1 / pTeam1);
  const qDraw = Math.max(1.01, 1 / pDraw);
  const qTeam2 = Math.max(1.01, 1 / pTeam2);

  return { team1: qTeam1, draw: qDraw, team2: qTeam2 };
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
    if (minute === 0) {
      // Noch kein Tor, nur Start
      await sleep(realTimePerMinuteMs);
      continue;
    }

    // xG-Wert pro Minute zufällig (klein)
    xG[team1.name] += Math.random() * 0.03;
    xG[team2.name] += Math.random() * 0.03;

    // Prüfen, ob ein Tor fällt (kleine Chance proportional zu xG)
    const chanceTeam1Goal = xG[team1.name] * 0.05; 
    const chanceTeam2Goal = xG[team2.name] * 0.05;

    if (Math.random() < chanceTeam1Goal) {
      score[team1.name]++;
      const scorer = randomArrayElement(teamData[team1.name]) || 'Unbekannter Spieler';
      log.push(`⚽ ${minute}': Tor für ${team1.name} durch ${scorer}`);
    }
    if (Math.random() < chanceTeam2Goal) {
      score[team2.name]++;
      const scorer = randomArrayElement(teamData[team2.name]) || 'Unbekannter Spieler';
      log.push(`⚽ ${minute}': Tor für ${team2.name} durch ${scorer}`);
    }

    // Update Embed
    let goalsText = log.length > 0 ? log.slice(-5).join('\n') : 'Noch keine Tore...';

    const embedUpdate = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score[team1.name]} : ${score[team2.name]}`, inline: true },
        { name: 'xG', value: `${xG[team1.name].toFixed(2)} : ${xG[team2.name].toFixed(2)}`, inline: true },
        { name: 'Tore', value: goalsText }
      );

    await interaction.editReply({ embeds: [embedUpdate] });

    await sleep(realTimePerMinuteMs);
  }

  // Endergebnis
  const finalScoreText = `${score[team1.name]} : ${score[team2.name]}`;

  // Tipp auswerten
  let resultText = '';
  if (
    (score[team1.name] > score[team2.name] && userTip === 'team1') ||
    (score[team2.name] > score[team1.name] && userTip === 'team2') ||
    (score[team1.name] === score[team2.name] && userTip === 'draw')
  ) {
    resultText = '🎉 Du hast richtig getippt!';
  } else {
    resultText = '❌ Dein Tipp war leider falsch.';
  }

  // Ergebnis-Embed
  const embedEnd = new EmbedBuilder()
    .setTitle('🏁 Spiel beendet')
    .setColor('Purple')
    .setDescription(
      `${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}\n` +
      `Endstand: **${finalScoreText}**\n\n` +
      `${resultText}`
    );

  await interaction.editReply({ embeds: [embedEnd] });
}

function randomArrayElement(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
