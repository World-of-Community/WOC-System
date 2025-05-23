const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb'); // Korrekte Modell-Import

// Feste Teams der Pro League (24 Teams)
const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht',
];

// Emojis für Pro League Teams
const teamIcons = {
  'FC Adler': '🦅',
  'SV Löwen': '🦁',
  'TSV Eiche': '🌳',
  'SC Blau': '🔵',
  'VfB Stern': '⭐',
  'FC Rot-Weiß': '🔴⚪',
  'SV Grünwald': '🌲',
  'TSV Nord': '❄️',
  'SC Süd': '☀️',
  'VfB West': '🌅',
  'FC Ostwind': '🌬️',
  'SV Nordstern': '🌟',
  'TSV Berg': '⛰️',
  'SC Tal': '🏞️',
  'VfB See': '🌊',
  'FC Sturm': '🌪️',
  'SV Blitz': '⚡',
  'TSV Vulkan': '🌋',
  'SC Frost': '❄️',
  'VfB Flamme': '🔥',
  'FC Donner': '⛈️',
  'SV Schatten': '🌑',
  'TSV Nebel': '🌫️',
  'SC Licht': '💡',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
      // Alle Teams aus der DB laden
      const allTeams = await Team.find({});

      if (allTeams.length < 2) {
        return interaction.reply({ content: 'Es sind nicht genug Teams in der Datenbank.', ephemeral: true });
      }

      // 1. Liga (Pro League) und 2. Liga filtern
      const proLeague = allTeams.filter(t => t.league === 'Pro League'); // Pass auf: league enum exakt nutzen
      let secondLeague = allTeams.filter(t => t.league === '2. League');

      // Für 2. Liga nur maximal 38 Teams zufällig auswählen, falls mehr
      if (secondLeague.length > 38) {
        secondLeague = getRandomElements(secondLeague, 38);
      }

      // Teams für das Match zusammenfügen
      const teamsForMatch = [...proLeague, ...secondLeague];

      if (teamsForMatch.length < 2) {
        return interaction.reply({ content: 'Nicht genug Teams in den Ligen für ein Spiel.', ephemeral: true });
      }

      // Zwei verschiedene Teams auswählen
      const [team1, team2] = getTwoDifferentTeams(teamsForMatch);

      // Emojis auswählen (Default ⚽ falls nicht gefunden)
      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // Embed bauen
      const embed = new EmbedBuilder()
        .setTitle(`⚽ Fußballspiel: ${icon1} ${team1.name} vs. ${icon2} ${team2.name}`)
        .setDescription('Tippe, wer gewinnt, oder ob es ein Unentschieden wird!');

      // Buttons bauen
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
        if (!filter(i)) {
          await i.reply({ content: 'Du kannst hier nicht tippen!', ephemeral: true });
          return;
        }

        let ergebnis, punkteTeam1 = 0, punkteTeam2 = 0;
        if (i.customId === 'win_team1') {
          ergebnis = `${team1.name} gewinnt`;
          punkteTeam1 = 3;
        } else if (i.customId === 'win_team2') {
          ergebnis = `${team2.name} gewinnt`;
          punkteTeam2 = 3;
        } else if (i.customId === 'draw') {
          ergebnis = 'Unentschieden';
          punkteTeam1 = 1;
          punkteTeam2 = 1;
        } else {
          await i.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
          return;
        }

        // Teams in DB updaten
        await updateTeamStats(team1.name, punkteTeam1, punkteTeam2);
        await updateTeamStats(team2.name, punkteTeam2, punkteTeam1);

        embed.setDescription(`Ergebnis: **${ergebnis}**`);
        await i.update({ embeds: [embed], components: [] });

        collector.stop();
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({ content: 'Zeit abgelaufen, kein Tipp abgegeben.', components: [] });
        }
      });
    } catch (error) {
      console.error('Fehler im /fussball Command:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Es ist ein Fehler aufgetreten.', ephemeral: true });
      }
    }
  },
};

// Hilfsfunktion: zwei verschiedene Teams aus Array holen
function getTwoDifferentTeams(teams) {
  let team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);

  return [teams[team1Index], teams[team2Index]];
}

// Hilfsfunktion: zufällig n Elemente aus Array holen
function getRandomElements(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// Update Team Stats in der DB
async function updateTeamStats(teamName, punkte, gegenPunkte) {
  await Team.findOneAndUpdate(
    { name: teamName },
    { 
      $inc: { 
        points: punkte, 
        goalsAgainst: gegenPunkte, // Falls du das so tracken willst
        played: 1,
        // ggf. weitere Felder wie won, lost, draw etc. je nach Ergebnis
      }
    },
    { upsert: true }
  );
}
