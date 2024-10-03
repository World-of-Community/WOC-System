const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");
const { getWarnlistEmbed, updateWarnlist } = require('../../../functions/warn');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist-refresh')
        .setDescription('» Aktualisiert die Warnliste und zeigt sie an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        // Antwort verzögern, um Zeit für das Abrufen der Warnungen zu haben
        await interaction.deferReply({ ephemeral: true });

        const updateEmbed = await getWarnlistEmbed(interaction);

        // Vorherige Nachricht bearbeiten, um das Embed zu aktualisieren
        await interaction.editReply({ embeds: [updateEmbed] });

        updateWarnlist(interaction)

        // Optionale Bestätigungsnachricht
        // await interaction.followUp({ content: "> `✅` » Die Warnliste wurde aktualisiert.", ephemeral: true });
    }
};