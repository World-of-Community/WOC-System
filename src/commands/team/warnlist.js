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

        // Helper function to format date with leading zeros
        function formatDate(date) {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const year = d.getFullYear();
            return `${day}.${month}.${year}`;
        }

        // Warnliste formatieren
        let list = '';
        warnings.forEach(({ userId, warnings }) => {
            const warnCount = warnings.length;
            const warnText = warnCount === 1 ? 'Warnung' : 'Warnungen';  // Singular or plural

            warnings.forEach((warn, index) => {
                // Display based on the count of warnings
                const date = formatDate(warn.date);
                list += `<@${userId}> (${user.username}) (${user.displayName}) - \`${warnCount}\` ${warnText} (Grund: ${warn.reason}, Datum: ${date})\n`;
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