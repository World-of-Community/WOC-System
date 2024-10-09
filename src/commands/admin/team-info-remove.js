const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

//das der user aus dem embed entfernt wird ohne eine nachricht im embed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-info')
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
        .addStringOption(option => option.setName('beschreibung').setDescription('Eine Beschreibung des Teammitglieds').setRequired(false))
        .addStringOption(option => option.setName('name').setDescription('Der Name des Teammitglieds').setRequired(false))
        .addStringOption(option => option.setName('alter').setDescription('Das Alter des Teammitglieds').setRequired(false)),
    
    async execute(interaction) {
        const action = interaction.options.getString('action');
        const bereich = interaction.options.getString('bereich');
        const user = interaction.options.getUser('user') || 'Niemand'; // Wenn kein User, dann 'Niemand'
        const beschreibung = interaction.options.getString('beschreibung') || 'Unbekannt';
        const name = interaction.options.getString('name') || 'Unbekannt'; // Wenn kein Name, dann 'Unbekannt'
        const alter = interaction.options.getString('alter') || 'Unbekannt'; // Wenn kein Alter, dann 'Unbekannt'

        const TeamEmbed = new EmbedBuilder()
            .setTitle('Information zum WOC Server-Team')
            .setColor('Orange')
            .setFooter({ text: '', iconURL: '' })
            .setTimestamp();

        // Embed-Nachricht senden
        await interaction.reply({ embeds: [TeamEmbed] });
    },
};

