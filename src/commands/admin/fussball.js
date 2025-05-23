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

      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      const embed = new EmbedBuilder()
        .setTitle(`⚽ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setDescription('Tippe, wer gewinnt, oder ob es ein Unentschieden wird!')
        .setColor('Blue');

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

      await interaction.reply({ embeds: [embed], components: [buttons] });

      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async i => {
        let userTip;
        switch (i.customId) {
          case 'win_team1':
            userTip = 'team1';
            break;
          case 'win_team2':
            userTip = 'team2';
            break;
          case 'draw':
            userTip = 'draw';
            break;
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
  let score1 = 0;
  let score2 = 0;
  let minute = 0;

  const embed = new EmbedBuilder()
    .setTitle(`⚽ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
    .setColor('Blue');

  const totalMatchMinutes = 90;
  const realTimePerMinuteMs = 1000;

  for (; minute <= totalMatchMinutes; minute++) {
    if (Math.random() < 0.03) {
      score1++;
      await interaction.editReply({
        content: null,
        embeds: [
          embed.setDescription(`Minute ${minute}: Tor für ${icon1} **${team1LastName}**! (${score1} : ${score2})`)
        ],
      });
    } else if (Math.random() < 0.03) {
      score2++;
      await interaction.editReply({
        content: null,
        embeds: [
          embed.setDescription(`Minute ${minute}: Tor für ${icon2} **${team2LastName}**! (${score1} : ${score2})`)
        ],
      });
    }

    if (minute % 10 === 0 && minute !== 0) {
      await interaction.editReply({
        content: null,
        embeds: [
          embed.setDescription(`Minute ${minute}: Spielstand ${icon1} **${score1}** : ${icon2} **${score2}**`)
        ],
      });
    }

    await new Promise(resolve => setTimeout(resolve, realTimePerMinuteMs));
  }

  let punkte1 = 0;
  let punkte2 = 0;
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

  let tippRichtig = false;
  if (
    (userTip === 'team1' && score1 > score2) ||
    (userTip === 'team2' && score2 > score1) ||
    (userTip === 'draw' && score1 === score2)
  ) {
    tippRichtig = true;
  }

  await updateTeamStats(team1.name, punkte1);
  await updateTeamStats(team2.name, punkte2);

  // Nutze addFields für bessere Struktur
  embed
    .setDescription('🏁 Spiel beendet!')
    .addFields(
      { name: 'Ergebnis', value: `${icon1} **${team1LastName}** ${score1} : ${score2} ${icon2} **${team2LastName}**`, inline: false },
      { name: 'Dein Tipp', value: `${tippRichtig ? '✅ richtig' : '❌ falsch'} (${userTip === 'team1' ? team1LastName : userTip === 'team2' ? team2LastName : 'Unentschieden'})`, inline: false },
      { name: 'Punkte', value: `${icon1} ${team1LastName}: ${punkte1}\n${icon2} ${team2LastName}: ${punkte2}`, inline: false },
    );

  await interaction.editReply({ content: null, embeds: [embed], components: [] });
}

async function updateTeamStats(teamName, punkte) {
  try {
    const result = await Team.findOneAndUpdate(
      { name: teamName },
      {
        $inc: {
          points: punkte,
          played: 1,
          won: punkte === 3 ? 1 : 0,
          draw: punkte === 1 ? 1 : 0,
          lost: punkte === 0 ? 1 : 0,
        },
      },
      { new: true }
    );
    return result;
  } catch (err) {
    console.error('Fehler beim Update der Teamstats:', err);
  }
}
