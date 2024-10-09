const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let teamEmbedMessageId; // Store the message ID of the embed

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

        // Create the embed if it doesn't exist yet
        if (!teamEmbedMessageId) {
            const TeamEmbed = new EmbedBuilder()
                .setTitle('Information zum WOC Server-Team')
                .setDescription(`> ${bereich}\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}`)
                .setColor('Orange')
                .setFooter({ text: 'WOC Server Team', iconURL: '' })
                .setTimestamp()

            const message = await interaction.reply({ embeds: [TeamEmbed], fetchReply: true });
            teamEmbedMessageId = message.id; // Store the message ID for future edits
        } else {
            const channel = interaction.channel;
            const message = await channel.messages.fetch(teamEmbedMessageId); // Fetch the existing embed message

            const embed = message.embeds[0]; // Get the existing embed

            // Update the existing description with the new member info
            const newDescription = `${embed.description}\n\n> ${bereich}\n- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}`;
            embed.setDescription(newDescription); // Set the updated description

            // Edit the existing embed message
            await message.edit({ embeds: [embed] });
            await interaction.reply({ content: '> `✅` » Das Teammitglied wurde hinzugefügt!', ephemeral: true });
        }
    },
};

