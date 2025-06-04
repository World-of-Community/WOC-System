const { SlashCommandBuilder } = require('discord.js');
const { Match } = require('../../../Datenbank/matchdb');

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spiel-erstellen')
    .setDescription('Erstellt ein Spiel mit Datum und Uhrzeit')
    .addStringOption(option =>
      option.setName('heimteam')
        .setDescription('Heimteam auswählen')
        .setRequired(true)
        .addChoices(...proLeagueTeams.map(team => ({ name: team, value: team }))))
    .addStringOption(option =>
      option.setName('auswaertsteam')
        .setDescription('Auswärtsteam auswählen')
        .setRequired(true)
        .addChoices(...proLeagueTeams.map(team => ({ name: team, value: team }))))
    .addIntegerOption(option =>
      option.setName('spieltag')
        .setDescription('Spieltag auswählen (1-34)')
        .setRequired(true)) // keine .addChoices, freie Eingabe
    .addStringOption(option =>
      option.setName('datum')
        .setDescription('Datum & Uhrzeit (Beispiel: 15:30 - 25.05.2025)')
        .setRequired(true)),

  async execute(interaction) {
    const heim = interaction.options.getString('heimteam');
    const auswaerts = interaction.options.getString('auswaertsteam');
    const spieltag = interaction.options.getInteger('spieltag');
    const datum = interaction.options.getString('datum');

    if (spieltag < 1 || spieltag > 34) {
      return interaction.reply({
        content: '❌ Bitte gib einen Spieltag zwischen 1 und 34 an.',
        ephemeral: true
      });
    }

    try {
      const [zeit, dateString] = datum.split(' - ');
      if (!zeit || !dateString) throw new Error('Falsches Datumsformat');

      const [stunde, minute] = zeit.split(':').map(Number);
      const [tag, monat, jahr] = dateString.split('.').map(Number);

      const date = new Date(jahr, monat - 1, tag, stunde, minute);

      const match = new Match({
        homeTeam: heim,
        awayTeam: auswaerts,
        matchday: spieltag,
        date
      });

      await match.save();

      const spieleDesSpieltags = await Match.find({ matchday: spieltag }).sort({ date: 1 });

      const spieleListe = spieleDesSpieltags
        .map(m => `- ${m.homeTeam} vs ${m.awayTeam} (${new Date(m.date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })})`)
        .join('\n');

      await interaction.reply({
        content: `✅ Spiel eingetragen: **${heim}** vs **${auswaerts}** am **${date.toLocaleString('de-DE')}** (Spieltag ${spieltag})\n\n` +
                 `📅 **Alle Spiele für Spieltag ${spieltag}:**\n${spieleListe}`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ Fehler beim Eintragen des Spiels. Stelle sicher, dass das Datum im Format **HH:MM - TT.MM.JJJJ** ist.\n` +
                 `Beispiel: \`15:30 - 25.05.2025\``,
        ephemeral: true
      });
    }
  }
};
