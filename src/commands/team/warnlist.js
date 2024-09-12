const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription('» Zeigt dir die Warnliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction)  {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        // Fetch all warning data for the guild
        let warnings = await warndb.find({ guildId: interaction.guild.id });

        // Warnliste formatieren
        let list = '';
        warnings.forEach(({ userId, warnings }) => {
            const warnCount = warnings.length;
            const warnText = warnCount === 1 ? 'Warnung' : 'Warnungen';  // Singular or plural

            warnings.forEach((warn, index) => {
                // Display based on the count of warnings
                const date = new Date(warn.date).toLocaleDateString('de-DE'); // Format date
                list += `<@${userId}> - \`${warnCount}\` ${warnText} (Grund: ${warn.reason}, Datum: ${date})\n`;
                //${warnCount === 1 ? '' : ` (Grund: ${warn.reason})`}
            });
        });

        const WarnEmbed = new EmbedBuilder()
            .setTitle('Information zu den Warnungen der Nutzer')
            .setDescription(warnings.length > 0 ? list : "> `❌` » Keine Warnungen vorhanden!")
            .setColor('Red');

        // Send the embed to the channel
        await interaction.channel.send({ embeds: [WarnEmbed] });
        await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true });
    }
};