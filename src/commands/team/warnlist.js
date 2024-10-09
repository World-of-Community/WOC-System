const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription('» Zeigt dir die Warnliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        try {
            // Fetch all warning data for the guild
            const warningData = await warndb.find({ guildId: interaction.guild.id });

            // Handle case where there are no warnings
            if (warningData.length === 0) {
                const noWarningsEmbed = new EmbedBuilder()
                    .setTitle('Information zu den Warnungen der Nutzer')
                    .setDescription("> `❌` » Keine Warnungen vorhanden!")
                    .setColor('Red')
                    .setFooter({ text: `Gesendet von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
                await interaction.reply({ embeds: [noWarningsEmbed], ephemeral: true });
                return;
            }

            // Fetch all users in the guild
            const members = await interaction.guild.members.fetch();
            
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
            for (const { userId, warnings: userWarnings } of warningData) {
                const user = members.get(userId); // Get user from cached members
                const warnCount = userWarnings.length;
                const warnText = warnCount === 1 ? 'Warnung' : 'Warnungen'; // Singular or plural

                if (user) {
                    userWarnings.forEach((warn) => {
                        const date = formatDate(warn.date);
                        list += `<@${userId}> (${user.user.username}) (**${user.displayName}**) - \`${warnCount}\` ${warnText} (Grund: ${warn.reason}, Datum: ${date})\n`;
                    });
                } else {
                    list += `<@${userId}> (Benutzer nicht gefunden) - \`${warnCount}\` ${warnText}\n`;
                }
                list += '\n'; // Abstand zwischen verschiedenen Nutzern
            }

            const WarnEmbed = new EmbedBuilder()
                .setTitle('Information zu den Warnungen der Nutzer')
                .setDescription(list)
                .setColor('Red')
                .setFooter({ text: `Gesendet von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            // Send the embed to the channel
            await interaction.channel.send({ embeds: [WarnEmbed] });
            await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '`❌` » Ein Fehler ist aufgetreten, während die Warnliste abgerufen wurde.', ephemeral: true });
        }
    }
};

