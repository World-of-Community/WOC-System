const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let teamEmbedMessageId = '1293540628105531413';

// Struktur zum Speichern von Teammitgliedern nach Kategorie
const teamMembers = {
    '> `🎯` | <@&959869691529154631>': [], // Admin
    '> `👨‍✈️` | <@&893423428558782465>': [], // Team-Leitung
    '> `👨‍💻` | <@&929349039433056276>': [], // Developer
    '> `🕵` | <@&816985466230145044>': [], // Sr-Moderator
    '> `👮` | <@&815920052385480754>': [], // Moderator
    '> `🧩` | <@&815920170371383366>': [], // Supporter
    '> `🪓` | <@&1263645368441241700>': [] // Builder
};

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

        // Hinzufügen des neuen Mitglieds zur entsprechenden Kategorie
        const teamMemberEntry = `- ${user} (${beschreibung})\n⠀⠀➥ ${name} | ${alter}`;
        const key = Object.keys(teamMembers).find(k => k.includes(bereich));
        if (key) {
            teamMembers[key].push(teamMemberEntry);
        }

        let embedDescription = '\n\n';
        
        // Erstellung der Embed-Beschreibung aus den Teammitgliedern nach Kategorie
        for (const [key, members] of Object.entries(teamMembers)) {
            if (members.length > 0) {
                embedDescription += `${key}\n${members.join('\n')}\n\n`;
            }
        }

        if (!teamEmbedMessageId) {
            const TeamEmbed = new EmbedBuilder()
                .setTitle('Information zum WOC Server-Team')
                .setDescription(embedDescription || 'Aktuell sind keine Teammitglieder aufgelistet. Bitte später erneut versuchen!')
                .setColor('Orange')
                .setFooter({ text: `${interaction.guild.name} - Server-Team`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            const message = await interaction.reply({ embeds: [TeamEmbed], fetchReply: true });
            teamEmbedMessageId = message.id;
        } else {
            const channel = interaction.channel;
            const message = await channel.messages.fetch(teamEmbedMessageId);

            const embed = new EmbedBuilder(message.embeds[0]);
            embed.setDescription(embedDescription || 'Aktuell sind keine Teammitglieder aufgelistet. Bitte später erneut versuchen!');

            await message.edit({ embeds: [embed] });
            await interaction.reply({ content: '> `✅` » Das Teammitglied wurde hinzugefügt!', ephemeral: true });
        }
    },
};
