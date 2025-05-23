const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { FussballMatch, FussballTeam } = require('../../../Datenbank/fussballteam');

// Pro League Teams (24 feste Namen)
const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

// 2. Liga Teams (Beispiel: 60 Kandidaten, du kannst 48 davon nehmen)
const allSecondLeagueCandidates = [
  'FC Drachen', 'SV Panther', 'TSV Adlerhorst', 'SC Tiger', 'VfB Falken',
  'FC Wölfe', 'SV Bären', 'TSV Löwenherz', 'SC Eichenwald', 'VfB Stürmer',
  'FC Geier', 'SV Habichte', 'TSV Felsen', 'SC Blitz', 'VfB Titan',
  'FC Komet', 'SV Donner', 'TSV Sturmvogel', 'SC Nebel', 'VfB Gladius',
  'FC Sturm', 'SV Schatten', 'TSV Phönix', 'SC Wogen', 'VfB Gletscher',
  'FC Sturmwind', 'SV Flamme', 'TSV Falkenberg', 'SC Pegasus', 'VfB Erle',
  'FC Blitzschlag', 'SV Eisvogel', 'TSV Sternenkrieger', 'SC Löwenmut', 'VfB Himmel',
  'FC Wolfspfad', 'SV Fuchs', 'TSV Mondlicht', 'SC Sturmflut', 'VfB Nebula',
  'FC Krieger', 'SV Orkan', 'TSV Gletscher', 'SC Wildfang', 'VfB Donnerfaust',
  'FC Sturmjäger', 'SV Fluss', 'TSV Felswand', 'SC Eisdorn', 'VfB Feuer',
  'FC Titanen', 'SV Falkenhorst', 'TSV Silber', 'SC Golden', 'VfB Adlerblick',
  'FC Eiswolf', 'SV Schattenläufer', 'TSV Blitzen', 'SC Nebelschleier', 'VfB Flügel'
];

// Emojis für Pro League Teams (du kannst hier auch noch die 2. Liga ergänzen)
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
  'SC Licht': '💡'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    // Alle Teams aus der DB laden
    const allTeams = await FussballTeam.find({});
    if (allTeams.length < 2) {
      return interaction.reply({ content: 'Es sind nicht genug Teams in der Datenbank.', ephemeral: true });
    }

    // Zwei verschiedene Teams zufällig auswählen
    const [team1, team2] = getTwoDifferentTeams(allTeams);

    // Emojis oder Default-Emoji
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

    // Antwort senden
    await interaction.reply({ embeds: [embed], components: [buttons] });

    // Collector filtert auf den Nutzer, der den Befehl ausgeführt hat
    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

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
      } else {
        ergebnis = 'Unentschieden';
        punkteTeam1 = 1;
        punkteTeam2 = 1;
      }

      // Datenbank updaten
      await updateTeamStats(team1.name, punkteTeam1, punkteTeam2);
      await updateTeamStats(team2.name, punkteTeam2, punkteTeam1);

      // Embed updaten und Buttons entfernen
      embed.setDescription(`Ergebnis: **${ergebnis}**`);
      await i.update({ embeds: [embed], components: [] });

      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'Zeit abgelaufen, kein Tipp abgegeben.', components: [] });
      }
    });
  }
};

// Funktion, um zwei unterschiedliche Teams aus einem Array zu holen
function getTwoDifferentTeams(teams) {
  let team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);

  return [teams[team1Index], teams[team2Index]];
}

// Funktion zum Updaten der Team-Statistiken in der DB
async function updateTeamStats(teamName, punkte, gegnerPunkte) {
  const team = await FussballTeam.findOne({ name: teamName });
  if (!team) return;

  team.played++;
  if (punkte === 3) team.won++;
  else if (punkte === 1) team.draw++;
  else team.lost++;

  team.goalsFor += punkte;
  team.goalsAgainst += gegnerPunkte;

  team.points += punkte;
  team.goalDifference = team.goalsFor - team.goalsAgainst;

  await team.save();
}
