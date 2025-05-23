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

      // Lastname: alles außer erstes Wort, oder kompletten Namen wenn nur eins
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      // Embed 1: Spielstatus (erstes Embed)
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Tore', value: 'Noch keine Tore...' }
        );

      // Embed 2: Aufstellung (zweites Embed)
      // Wir speichern Spieler im Team-Objekt unter 'players' als Array, sonst Dummy
      const players1 = team1.players ? team1.players.join(', ') : 'Keine Spieler-Daten';
      const players2 = team2.players ? team2.players.join(', ') : 'Keine Spieler-Daten';

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2}`
        );

      // Buttons für Tipp abgeben
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

      // Erst Embed 1 senden
      await interaction.reply({ embeds: [embedStatus] });
      // Dann Embed 2 als FollowUp mit Aufstellung
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

        await simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip, embedStatus);
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

async function simulateMatch(interaction, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip, embedStatus) {
  let score1 = 0;
  let score2 = 0;
  let minute = 0;

  const totalMatchMinutes = 90;
  const realTimePerMinuteMs = 1000; // 1 Sekunde pro Spielminute

  // Tracking xG (expected goals) - hier zufällig
  let xG1 = 0.0;
  let xG2 = 0.0;

  for (; minute <= totalMatchMinutes; minute++) {
    let eventText = null;

    // Zufällige Tor-Events (3% Chance pro Minute pro Team)
    if (Math.random() < 0.03) {
      score1++;
      eventText = `Tor für ${icon1} **${team1LastName}**!`;
    } else if (Math.random() < 0.03) {
      score2++;
      eventText = `Tor für ${icon2} **${team2LastName}**!`;
    }

    // xG simulieren (etwas steigen pro Minute)
    xG1 += Math.random() * 0.05;
    xG2 += Math.random() * 0.05;

    // Embed aktualisieren wie in deinem ersten Beispiel
    embedStatus
      .setFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} : ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Tore', value: eventText || 'Keine neuen Tore...', inline: false }
      )
      .setColor(score1 > score2 ? 'Green' : score2 > score1 ? 'Red' : 'Grey')
      .setDescription('Das Spiel läuft...');

    await interaction.editReply({ embeds: [embedStatus] });

    await new Promise(resolve => setTimeout(resolve, realTimePerMinuteMs));
  }

  // Ergebnis ermitteln
  let punkte1 = 0, punkte2 = 0;
  let ergebnisText;
  if (score1 > score2) {
    ergebnisText = `${team1LastName} gewinnt`;
    punkte1 = 3;
  } else if (score2 > score1) {
    ergebnisText = `${team2LastName} gewinnt`;
    punkte2 = 3;
  } else {
    ergebnisText = 'Unentschieden';
    punkte1 = 1;
    punkte2 = 1;
  }

  // Tipp checken
  const tippRichtig =
    (userTip === 'team1' && score1 > score2) ||
    (userTip === 'team2' && score2 > score1) ||
    (userTip === 'draw' && score1 === score2);

  await updateTeamStats(team1.name, punkte1);
  await updateTeamStats(team2.name, punkte2);

  embedStatus
    .setTitle(`🏁 Spiel beendet: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
    .setDescription(
      `Endstand: ${score1} : ${score2}\n` +
      `xG: ${xG1.toFixed(2)} : ${xG2.toFixed(2)}\n\n` +
      `Dein Tipp war ${tippRichtig ? '**richtig! 🎉**' : '**falsch. 😞**'}`
    )
    .setColor(tippRichtig ? 'Gold' : 'DarkRed');

  await interaction.editReply({ embeds: [embedStatus], components: [] });
}

async function updateTeamStats(teamName, punkte) {
  const team = await Team.findOne({ name: teamName });
  if (!team) return;
  team.points = (team.points || 0) + punkte;
  await team.save();
}
