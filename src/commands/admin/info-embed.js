const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-embed')
        .setDescription('» Zeigt Informationen über das Server-Team an. 📌')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    
    async execute(interaction) {
        const TeamEmbed = new EmbedBuilder()
            .setTitle('Information zum WOC Server-Team')
            .setDescription('Aktuell sind keine Teammitglieder aufgelistet. Bitte später erneut versuchen!')
            .setColor('Orange')
            .setFooter({ text: `${interaction.guild.name} - Server-Team`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        try {
            // Embed-Nachricht senden
            await interaction.reply({ embeds: [TeamEmbed] });
        } catch (error) {
            console.error('Fehler beim Senden der Nachricht:', error);
            await interaction.reply({ content: '> `❗` » Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuche es später erneut.', ephemeral: true });
        }
    },
};

