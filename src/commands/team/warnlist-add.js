const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
      .setName('warnlist')
      .setDescription('Füge eine Warnung für einen Benutzer hinzu.')
      .addUserOption(option => 
        option.setName('user')
          .setDescription('Der Benutzer, der gewarnt werden soll')
          .setRequired(true))
      .addStringOption(option => 
        option.setName('grund')
          .setDescription('Der Grund für die Warnung')
          .setRequired(true)),
    
    async execute(interaction) {
      const member = interaction.options.getUser('user');
      const reason = interaction.options.getString('grund');
      
      // Speichern der Warnung in der Datenbank
      const warningsCollection = db.collection('warnings');
      await warningsCollection.insertOne({
        userId: user.id,
        reason: reason,
        timestamp: new Date(),
      });
  
      await interaction.reply({ content: `Warnung für ${member} hinzugefügt, Grund: ${reason}`, ephemeral: true });
    },
  };