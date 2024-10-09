const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
      .setName('warnlist-remove')
      .setDescription('» Verwalte Warnungen für Benutzer.')
      .addUserOption(option =>  option.setName('user').setDescription('Der Benutzer, dessen Warnung entfernt werden soll').setRequired(true))
      .addStringOption(option =>  option.setName('grund').setDescription('Der Grund für die Warnung (optional)').setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('grund') || '';

        // Find the warning data for the user
        const warningData = await warndb.findOne({ guildId: interaction.guild.id, userId: user.id });

        if (warningData) {
            // Filter out the warning that matches the reason
            const filteredWarnings = warningData.warnings.filter(w => w.reason !== reason);

            if (filteredWarnings.length === warningData.warnings.length) {
                // No matching warning was found
                await interaction.reply({ content: `> \`❌\` » Keine Warnung für ${user} mit dem Grund "${reason}" gefunden.`, ephemeral: true });
            } else {
                // Update the warnings array in the database
                warningData.warnings = filteredWarnings;
                await warningData.save();
                await interaction.reply({ content: `> \`✅\` » Warnung für ${user} entfernt.`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: `> \`❌\` » Keine Warnungen für ${user} gefunden.`, ephemeral: true });
        }
    },
};
