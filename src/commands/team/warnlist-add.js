const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist-add')
        .setDescription('» Füge eine Warnung für einen Benutzer hinzu.')
        .addUserOption(option => option.setName('user').setDescription('Der Benutzer, der gewarnt werden soll').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('Der Grund für die Warnung').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const member = interaction.options.getUser('user');
        const reason = interaction.options.getString('grund');

        try {
            // Warnung in der Datenbank speichern
            const warningData = await warndb.findOne({ guildId: interaction.guild.id, userId: member.id });
            if (warningData) {
                warningData.warnings.push({ reason });
                await warningData.save();
            } else {
                await new warndb({
                    guildId: interaction.guild.id,
                    userId: member.id,
                    warnings: [{ reason }],
                    timestamp: new Date(),
                }).save();
            }

            await interaction.reply({ content: `> \`✅\` » Warnung für ${member} hinzugefügt, Grund: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Warnung:', error);
            await interaction.reply({ content: '> `❗` » Beim Hinzufügen der Warnung ist ein Fehler aufgetreten.', ephemeral: true });
        }
    },
};
