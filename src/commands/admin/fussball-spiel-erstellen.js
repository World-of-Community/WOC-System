const { SlashCommandBuilder } = require('discord.js');
const { Match } = require('../../../Datenbank/matchdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spiel-erstellen')
    .setDescription('Erstellt ein Spiel mit Datum und Uhrzeit')
    .addStringOption(option =>
      option.setName('heimteam')
        .setDescription('Heimteam')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('auswaertsteam')
        .setDescription('Auswärtsteam')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('spieltag')
        .setDescription('Spieltagnummer')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('datum')
        .setDescription('Datum & Uhrzeit (Format: TT.MM.JJJJ HH:MM)')
        .setRequired(true)),

  async execute(interaction) {
    const heim = interaction.options.getString('heimteam');
    const auswaerts = interaction.options.getString('auswaertsteam');
    const spieltag = interaction.options.getInteger('spieltag');
    const datum = interaction.options.getString('datum');

    try {
      const [tag, monat, rest] = datum.split('.');
      const [jahr, zeit] = rest.split(' ');
      const [stunde, minute] = zeit.split(':');
      const date = new Date(jahr, monat - 1, tag, stunde, minute);

      const match = new Match({
        homeTeam: heim,
        awayTeam: auswaerts,
        matchday: spieltag,
        date
      });

      await match.save();

      await interaction.reply({
        content: `✅ Spiel eingetragen: **${heim}** vs **${auswaerts}** am **${date.toLocaleString('de-DE')}** (Spieltag ${spieltag})`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ Fehler beim Eintragen des Spiels. Stelle sicher, dass das Datum im Format **TT.MM.JJJJ HH:MM** ist.`,
        ephemeral: true
      });
    }
  }
};
