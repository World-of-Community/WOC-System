const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Import EmbedBuilder

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-info')
        .setDescription('Zeigt Informationen über das Server-Team an.'),
    
    async execute(interaction) {
        const TeamEmbed = new EmbedBuilder()
            .setTitle('Information zum WOC Server-Team')
            .setDescription('Aktuell sind keine Teammitglieder aufgelistet. Bitte später erneut versuchen!')
            .setColor('Orange')
            .setFooter({ text: `${interaction.guild.name} - Server-Team`, iconURL: `${interaction.guild.iconURL}` })
            .setTimestamp();

        // Embed-Nachricht senden
        await interaction.reply({ embeds: [TeamEmbed] });
    },
};

