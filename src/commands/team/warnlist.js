const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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

        try {
            // Fetch all warning data for the guild
            const warningData = await warndb.find({ guildId: interaction.guild.id });

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
            for (const { userId, warnings: userWarnings } of warningData) { // Renamed `warnings` to `userWarnings`
                const user = await interaction.guild.members.fetch(userId); // Fetch the user from the guild
                const warnCount = userWarnings.length;
                const warnText = warnCount === 1 ? 'Warnung' : 'Warnungen';  // Singular or plural

                userWarnings.forEach((warn) => {
                    const date = formatDate(warn.date);
                    list += `<@${userId}> (${user.username}) (${user.displayName}) - \`${warnCount}\` ${warnText} (Grund: ${warn.reason}, Datum: ${date})\n`;
                });
            }

            const WarnEmbed = new EmbedBuilder()
                .setTitle('Information zu den Warnungen der Nutzer')
                .setDescription(warningData.length > 0 ? list : "> `❌` » Keine Warnungen vorhanden!")
                .setColor('Red')
                .setFooter({ text: `Gesendet von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() }); // Add a footer

            // Send the embed to the channel
            await interaction.channel.send({ embeds: [WarnEmbed] });
            await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '`❌` » Ein Fehler ist aufgetreten, während die Warnliste abgerufen wurde.', ephemeral: true });
        }
    }
};
