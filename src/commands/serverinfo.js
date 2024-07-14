const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('» Erhalte paar Informationen über den Server. ❓'),

    async execute(interaction) {
        const guild = interaction.guild;
        const members = await guild.members.fetch();
        const botCount = members.filter(member => member.user.bot).size;

        const userCount = members.filter(member => !member.user.bot).size;
            
        const onlineMembers = members.filter(m =>
            m.presence?.status === 'online' ||
            m.presence?.status === 'idle' ||
            m.presence?.status === 'dnd'
        ).filter(member => !member.user.bot).size.toLocaleString() || 0;

        // Formatierung des Erstellungsdatums
        const creationDate = guild.createdAt;
        //const day = String(creationDate.getDate()).padStart(2, '0');
        //const month = String(creationDate.getMonth() + 1).padStart(2, '0'); // Monate sind 0-indiziert
        //const year = creationDate.getFullYear();
        //const formattedDate = `${day}.${month}.${year}`;

        const server = interaction.guild;
        const member = interaction.member;

        const createdAt = `<t:${Math.round(server.create.createdTimestamp / 1000)}:F>`;
        const joinedAt = `<t:${Math.round(member.join.joinedTimestamp / 1000)}:F>`;

        const gebannt = await interaction.guild.roles.cache.get('886989738244964362')
        const roleCountg = gebannt.members.size

        const emojiCount = message.guild.emojis.cache.size;

        const boosters = message.guild.members.cache.filter(member => member.premiumSince);

        if (boosters.size > 0) {
            const boosterMentions = boosters.map(member => member.toString()).join(', ');
        }

        const serverEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name} Server Information`)
            .setDescription(`> \`⏰\` » **Server Erstellt:** ${createdAt} (${joinedAt})\n> \`👥\` » **Mitglieder:** \`${interaction.guild.memberCount}\`\n> \`👤\` » **User:** \`${userCount}\`\n> \`⚙️\` » **Bots:** \`${botCount}\`\n> \`🟢\` » **Online:** \`${onlineMembers}\`\n> \`⛔\` » **im Bann Bereich:** \`${roleCountg}\`\n\n> <a:nitro:1186636151335944283> » **Server Boosts:** \`${interaction.guild.premiumSubscriptionCount}\`\n\`💖\` » Server Booster: ${boosterMentions}\n\n> \`🎭\` » Wir haben aktuell **${emojiCount}** Emotes.`)
            .setColor('Blurple')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter({ text: `${interaction.guild.name} | Server Information`, iconURL: `${interaction.guild.iconURL()}` });

        interaction.reply({ embeds: [serverEmbed], ephemeral: true });
    }
}