const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
      .setName('warnlist-remove')
      .setDescription('Verwalte Warnungen für Benutzer.')
      .addUserOption(option =>  option.setName('user').setDescription('Der Benutzer, dessen Warnung entfernt werden soll').setRequired(true))
      .addStringOption(option =>  option.setName('grund').setDescription('Der Grund für die Warnung (optional)').setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    
    async execute(interaction) {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('grund') || '';

      // Entferne die Warnung aus der Datenbank
      const result = await warndb.deleteOne({
        userId: user.id
      });

      if (result.deletedCount === 0) {
        await interaction.reply({ content: `Keine Warnung für ${user.tag} gefunden.`, ephemeral: true });
      } else {
        await interaction.reply({ content: `Warnung für ${user.tag} entfernt.`, ephemeral: true });
      }
    },
};