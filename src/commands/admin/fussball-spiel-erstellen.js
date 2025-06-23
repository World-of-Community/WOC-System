const { SlashCommandBuilder } = require('discord.js');
const Match = require('../../../Datenbank/matchdb');  // Import von MatchSimple ohne {}

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

const fixedTimes = [
  { name: '00:30', value: '00:30' },
  { name: '01:30', value: '01:30' },
  { name: '02:00', value: '02:00' },
  { name: '04:00', value: '04:00' },
  { name: '06:00', value: '06:00' },
  { name: '07:30', value: '07:30' },
  { name: '09:00', value: '09:00' },
  { name: '09:30', value: '09:30' },
  { name: '10:30', value: '10:30' },
  { name: '11:00', value: '11:00' },
  { name: '11:30', value: '11:30' },
  { name: '12:30', value: '12:30' },
  { name: '13:30', value: '13:30' },
  { name: '14:00', value: '14:00' },
  { name: '15:00', value: '15:00' },
  { name: '15:30', value: '15:30' },
  { name: '16:45', value: '16:45' },
  { name: '18:00', value: '18:00' },
  { name: '18:30', value: '18:30' },
  { name: '19:00', value: '19:00' },
  { name: '19:30', value: '19:30' },
  { name: '20:00', value: '20:00' },
  { name: '20:30', value: '20:30' },
  { name: '21:45', value: '21:45' },
  { name: '23:00', value: '23:00' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spiel-erstellen')
    .setDescription('Erstellt ein Spiel mit Datum und fester Uhrzeit')
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
        .setRequired(true))
    .addStringOption(option =>
      option.setName('uhrzeit')
        .setDescription('Uhrzeit auswählen')
        .setRequired(true)
        .addChoices(...fixedTimes))
    .addStringOption(option =>
      option.setName('datum')
        .setDescription('Datum im Format TT.MM.JJJJ')
        .setRequired(true)),

  async execute(interaction) {
    const heim = interaction.options.getString('heimteam');
    const auswaerts = interaction.options.getString('auswaertsteam');
    const spieltag = interaction.options.getInteger('spieltag');
    const uhrzeit = interaction.options.getString('uhrzeit');
    const datum = interaction.options.getString('datum');

    if (spieltag < 1 || spieltag > 34) {
      return interaction.reply({
        content: '❌ Bitte gib einen Spieltag zwischen 1 und 34 an.',
        ephemeral: true
      });
    }

    try {
      // Datum parsen und validieren
      const [tagStr, monatStr, jahrStr] = datum.split('.');
      if (!tagStr || !monatStr || !jahrStr) throw new Error('Falsches Datumsformat');

      const tag = Number(tagStr.trim());
      const monat = Number(monatStr.trim());
      const jahr = Number(jahrStr.trim());
      if (
        isNaN(tag) || isNaN(monat) || isNaN(jahr) ||
        tag < 1 || tag > 31 || monat < 1 || monat > 12 || jahr < 1000
      ) {
        throw new Error('Ungültiges Datum');
      }

      // Uhrzeit parsen und validieren
      const [stundeStr, minuteStr] = uhrzeit.split(':');
      const stunde = Number(stundeStr.trim());
      const minute = Number(minuteStr.trim());
      if (
        isNaN(stunde) || isNaN(minute) ||
        stunde < 0 || stunde > 23 || minute < 0 || minute > 59
      ) {
        throw new Error('Ungültige Uhrzeit');
      }

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
        content: `❌ Fehler beim Eintragen des Spiels. Stelle sicher, dass das Datum im Format **TT.MM.JJJJ** ist und die Uhrzeit ausgewählt wurde.\n` +
                 `Beispiel: \`25.05.2025\` mit Uhrzeit \`15:30\`\n` +
                 `Fehler: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
