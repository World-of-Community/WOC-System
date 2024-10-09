const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let teamEmbedMessageId = '1293540628105531413';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-add')
        .setDescription('» Füge ein Teammitglied in das Embed hinzu. 📌')
        .addStringOption(option => 
            option.setName('bereich')
                .setDescription('Bereich des Teammitglieds')
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
        const user = interaction.options.getUser('user') || 'Niemand'; 
        const beschreibung = interaction.options.getString('beschreibung');
        const name = interaction.options.getString('name') || '`keine Angabe`'; 
        const alter = interaction.options.getString('alter') || ''; 

        const role = interaction.guild.roles.cache.find(role => role.id === bereich);
        const role = role ? `<@&${role.id}>` : bereich;

        if (!teamEmbedMessageId) {
            const TeamEmbed = new EmbedBuilder()
                .setTitle('Information zum WOC Server-Team')
                .setDescription(`> ${role}\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}`)
                .setColor('Orange')
                .setFooter({ text: `${interaction.guild.name} - Server-Team`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            const message = await interaction.reply({ embeds: [TeamEmbed], fetchReply: true });
            teamEmbedMessageId = message.id;
        } else {
            const channel = interaction.channel;
            const message = await channel.messages.fetch(teamEmbedMessageId);

            const embed = new EmbedBuilder(message.embeds[0]);

            // Hier wird die Beschreibung aktualisiert
            const newDescription = `${embed.data.description}\n\n> ${roleMention}\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}`;
            embed.setDescription(newDescription);

            await message.edit({ embeds: [embed] });
            await interaction.reply({ content: '> `✅` » Das Teammitglied wurde hinzugefügt!', ephemeral: true });
        }
    },
};
