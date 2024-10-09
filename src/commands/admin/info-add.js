const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-add')
        .setDescription('Zeigt Informationen über das Server-Team an.')
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
        .addStringOption(option => option.setName('beschreibung').setDescription('Eine Beschreibung des Teammitglieds').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Der Name des Teammitglieds').setRequired(true))
        .addStringOption(option => option.setName('alter').setDescription('Das Alter des Teammitglieds').setRequired(false)),
    
    async execute(interaction) {
        const bereich = interaction.options.getString('bereich');
        const user = interaction.options.getUser('user') || 'Niemand'; // Wenn kein User, dann 'Niemand'
        const beschreibung = interaction.options.getString('beschreibung');
        const name = interaction.options.getString('name') || ''; // Wenn kein Name, dann 'Niemand'
        const alter = interaction.options.getString('alter') || ''; // Wenn kein Alter, dann 'Unbekannt'

        const TeamEmbed = new EmbedBuilder()
            .setTitle('Information zum WOC Server-Team')
            .setDescription(`> \`🎯\` | <@&959869691529154631>\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}\n\n» Bereich: __Server- und Teamverwaltung__\n\n> \`👨‍✈️\` | <@&893423428558782465>\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}\n\n» Bereich: __Server- und Admin Unterstützung__\n\n> \`👨‍💻\` | <@&929349039433056276>\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}\n\n» Bereich: __Entwicklung der Plugins & WOC-Bots__\n\n> \`🕵\` | <@&816985466230145044>\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}\n\n» Bereich: __Leitung des Moderation-Bereiches__\n\n> \`👮\` | <@&815920052385480754>\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}\n\n» Bereich: __Moderation und Support__\n\n> \`🧩\` | <@&815920170371383366>\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}\n\n» Bereich: __Community Support__\n\n> \`🪓\` | <@&1263645368441241700>\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}\n\n» Bereich: __Bauen neue Maps für die Spielmodis__`)
            .setColor('Orange')
            .setFooter({ text: '', iconURL: '' })
            .setTimestamp();

        // Embed-Nachricht senden
        await interaction.reply({ embeds: [TeamEmbed] });
    },
};
