const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
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
      // Teams aus Pro League laden
      const proLeagueTeams = await Team.find({ league: 'Pro League' });
      console.log(`[Fussball] Gefundene Teams in Pro League: ${proLeagueTeams.length}`);

      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      const embed = new EmbedBuilder()
        .setTitle(`⚽ Fußballspiel: ${icon1} ${team1.name} vs. ${icon2} ${team2.name}`)
        .setDescription('Tippe, wer gewinnt, oder ob es ein Unentschieden wird!')
        .setColor('Blue');

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('win_team1')
          .setLabel(`${icon1} ${team1.name} gewinnt`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('draw')
          .setLabel('Unentschieden')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('win_team2')
          .setLabel(`${icon2} ${team2.name} gewinnt`)
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
        let ergebnis;
        let punkte1 = 0;
        let punkte2 = 0;

        switch (i.customId) {
          case 'win_team1':
            ergebnis = `${team1.name} gewinnt`;
            punkte1 = 3;
            break;
          case 'win_team2':
            ergebnis = `${team2.name} gewinnt`;
            punkte2 = 3;
            break;
          case 'draw':
            ergebnis = 'Unentschieden';
            punkte1 = 1;
            punkte2 = 1;
            break;
          default:
            return await i.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
        }

        // Teamstats aktualisieren
        await updateTeamStats(team1.name, punkte1);
        await updateTeamStats(team2.name, punkte2);

        embed.setDescription(`✅ Ergebnis: **${ergebnis}**`);
        await i.update({ embeds: [embed], components: [] });

        collector.stop();
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

// Helfer: Zwei verschiedene Teams zufällig auswählen
function getTwoDifferentTeams(teams) {
  if (teams.length < 2) throw new Error('Mindestens zwei Teams benötigt.');
  const team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);
  return [teams[team1Index], teams[team2Index]];
}

// Helfer: Team-Daten aktualisieren (Punkte & Spiele)
async function updateTeamStats(teamName, punkte) {
  try {
    console.log(`[Fussball] UpdateTeamStats für ${teamName} mit ${punkte} Punkten`);

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
      { upsert: true, new: true }
    );

    console.log(`[Fussball] Team ${teamName} aktualisiert:`, result);
  } catch (error) {
    console.error(`Fehler beim Update von Team ${teamName}:`, error);
  }
}
