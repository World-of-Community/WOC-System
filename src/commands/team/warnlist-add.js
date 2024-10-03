const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
      .setName('warnlist-add')
      .setDescription('Füge eine Warnung für einen Benutzer hinzu.')
      .addUserOption(option =>  option.setName('user').setDescription('Der Benutzer, der gewarnt werden soll').setRequired(true))
      .addStringOption(option =>  option.setName('grund').setDescription('Der Grund für die Warnung').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    
    async execute(interaction) {
      const member = interaction.options.getUser('user');
      const reason = interaction.options.getString('grund');

      // Füge die Warnung zur Datenbank hinzu
      await warndb.create({
        userId: member.id,
        guildId: interaction.guild.id,
        reason: reason,
        timestamp: new Date(),
      });
  
      await interaction.reply({ content: `Warnung für ${member} hinzugefügt, Grund: ${reason}`, ephemeral: true });
    },
};