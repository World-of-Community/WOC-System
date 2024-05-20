const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
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
        const day = String(creationDate.getDate()).padStart(2, '0');
        const month = String(creationDate.getMonth() + 1).padStart(2, '0'); // Monate sind 0-indiziert
        const year = creationDate.getFullYear();
        const formattedDate = `${day}.${month}.${year}`;

        const serverEmbed = new EmbedBuilder()
            .setTitle('Unsere Server Information')
            .setDescription(`> \`⏰\` » **Server Erstellt:** \`${formattedDate}\`\n> \`👥\` » **Mitglieder:** \`${interaction.guild.memberCount}\`\n> \`👤\` » **User:** \`${userCount}\`\n> \`🟢\` » **Online:** \`${onlineMembers}\`\n> \`⚙️\` » **Bots:** \`${botCount}\`\n\n> <a:nitro:1186636151335944283> » **Server Boosts:** \`${interaction.guild.premiumSubscriptionCount}\``)
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name} | Server Information`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        interaction.reply({ embeds: [serverEmbed], ephemeral: true });
    }
}