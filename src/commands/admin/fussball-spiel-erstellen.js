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
      // Datum parsen
      const [tag, monat, rest] = datum.split('.');
      const [jahr, zeit] = rest.split(' ');
      const [stunde, minute] = zeit.split(':');
      const date = new Date(jahr, monat - 1, tag, stunde, minute);

      // Neues Match anlegen
      const match = new Match({
        homeTeam: heim,
        awayTeam: auswaerts,
        matchday: spieltag,
        date
      });

      await match.save();

      // Alle Spiele des Spieltags holen
      const spieleDesSpieltags = await Match.find({ matchday: spieltag }).sort({ date: 1 });

      // Teams vom Spieltag zusammenstellen
      const spieleListe = spieleDesSpieltags.map(m => `- ${m.homeTeam} vs ${m.awayTeam} (${new Date(m.date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })})`).join('\n');

      // Antwort
      await interaction.reply({
        content: `✅ Spiel eingetragen: **${heim}** vs **${auswaerts}** am **${date.toLocaleString('de-DE')}** (Spieltag ${spieltag})\n\n` +
                 `📅 **Alle Spiele für Spieltag ${spieltag}:**\n${spieleListe}`,
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
