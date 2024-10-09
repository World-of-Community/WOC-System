const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-remove')
        .setDescription('Zeigt Informationen über das Server-Team an oder entfernt sie.')
        .addStringOption(option => option.setName('remove').setDescription('Wählen Sie, ob Sie Informationen hinzufügen oder entfernen möchten.'))
        .addStringOption(option => 
            option.setName('bereich')
                .setDescription('Der Bereich des Teams')
                .setRequired(true)
                .addChoices(
                    { name: '🎯 Admin', value: 'Admin' },
                    { name: '👨‍✈️ Team-Leitung', value: 'Team-Leitung' },
                    { name: '👨‍💻 Developer', value: 'Developer' },
                    { name: '🕵 Sr-Moderator', value: 'Sr-Moderator' },
                    { name: '👮 Moderator', value: 'Moderator' },
                    { name: '🧩 Supporter', value: 'Supporter' },
                    { name: '🪓 Builder', value: 'Builder' }
                ))
        .addUserOption(option => option.setName('user').setDescription('Das Teammitglied').setRequired(true))
        .addStringOption(option => option.setName('beschreibung').setDescription('Eine Beschreibung des Teammitglieds').setRequired(false)),
    
    async execute(interaction) {
        const action = interaction.options.getString('remove');
        const bereich = interaction.options.getString('bereich');
        const user = interaction.options.getUser('user') || 'Niemand'; // Wenn kein User, dann 'Niemand'

        const TeamEmbed = new EmbedBuilder()
            .setTitle('Information zum WOC Server-Team')
            .setColor('Orange')
            .setFooter({ text: `${interaction.guild.name} - Server-Team`, iconURL: `${interaction.guild.iconURL}` })
            .setTimestamp();

        // Embed-Nachricht senden
        await interaction.reply({ embeds: [TeamEmbed] });
    },
};

