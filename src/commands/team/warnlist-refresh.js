const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist-refresh')
        .setDescription('» Aktualisiert die Warnliste und zeigt sie an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        try {
            // Alle Warnungen für die Guild abrufen
            let warnings = await warndb.find({ guildId: interaction.guild.id });

            // Hilfsfunktion zum Formatieren des Datums
            function formatDate(date) {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}.${month}.${year}`;
            }

            // Warnliste formatieren
            let list = '';
            if (warnings.length === 0) {
                list = "> `❌` » Keine Warnungen vorhanden!";
            } else {
                warnings.forEach(({ userId, warnings }) => {
                    const warnCount = warnings.length;
                    const warnText = warnCount === 1 ? 'Warnung' : 'Warnungen';

                    list += `<@${userId}> - \`${warnCount}\` ${warnText}:\n`;

                    warnings.forEach((warn, index) => {
                        const date = formatDate(warn.date);
                        list += `\`${index + 1}.\` Grund: ${warn.reason}, Datum: ${date}\n`;
                    });

                    list += '\n'; // Abstand zwischen verschiedenen Nutzern
                });
            }

            const WarnEmbed = new EmbedBuilder()
                .setTitle('Information zu den Warnungen der Nutzer')
                .setDescription(list)
                .setColor('Red')
                .setFooter({ text: `» ${interaction.guild.name} - Warn system`, iconURL: interaction.guild.displayAvatarURL() });

            // Vorherige Antwort bearbeiten, um das Embed zu aktualisieren
            await interaction.editReply({ embeds: [WarnEmbed] });

            // Optionale Bestätigungsnachricht
            await interaction.followUp({ content: "> `✅` » Die Warnliste wurde aktualisiert.", ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "`❌` » Ein Fehler ist aufgetreten, während die Warnliste aktualisiert wurde.", ephemeral: true });
        }
    }
};

