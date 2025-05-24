const { SlashCommandBuilder } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spieler-hinzufügen')
    .setDescription('Füge einem Team einen Spieler hinzu.')
    .addStringOption(opt =>
      opt.setName('team')
        .setDescription('Name des Teams')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('spieler')
        .setDescription('Name des Spielers')
        .setRequired(true)),

  async execute(interaction) {
    const teamName = interaction.options.getString('team');
    const spielerName = interaction.options.getString('spieler');

    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return interaction.reply({ content: '❌ Team wurde nicht gefunden.', ephemeral: true });
    }

    if (!team.players) team.players = [];
    if (team.players.includes(spielerName)) {
      return interaction.reply({ content: '⚠️ Dieser Spieler ist bereits im Team.', ephemeral: true });
    }

    team.players.push(spielerName);
    await team.save();

    await interaction.reply({ content: `✅ Spieler **${spielerName}** wurde dem Team **${teamName}** hinzugefügt.`, ephemeral: true });
  }
};
