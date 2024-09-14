const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
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

        // Alle Warnungen für die Guild abrufen
        let warnings = await warndb.find({ guildId: interaction.guild.id });

        // Hilfsfunktion zum Formatieren des Datums
        function formatDate(date) {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Monate sind nullbasiert
            const year = d.getFullYear();
            return `${day}.${month}.${year}`;
        }

        // Warnliste formatieren
        let list = '';
        warnings.forEach(({ userId, warnings }) => {
            const warnCount = warnings.length;
            const warnText = warnCount === 1 ? 'Warnung' : 'Warnungen';

            // Benutzer und Anzahl der Warnungen
            list += `<@${userId}> - \`${warnCount}\` ${warnText}:\n`;

            warnings.forEach((warn, index) => {
                const date = formatDate(warn.date);
                list += `   \`${index + 1}.\` Grund: ${warn.reason}, Datum: ${date}\n`;
            });

            list += '\n'; // Abstand zwischen verschiedenen Nutzern
        });

        const WarnEmbed = new EmbedBuilder()
            .setTitle('Information zu den Warnungen der Nutzer')
            .setDescription(warnings.length > 0 ? list : "> `❌` » Keine Warnungen vorhanden!")
            .setColor('Red');

        // Warn-Embed senden
        await interaction.reply({ embeds: [WarnEmbed] });
        await interaction.followUp({ content: "> `✅` » Die Warnliste wurde aktualisiert und gesendet.", ephemeral: true });
    }
};