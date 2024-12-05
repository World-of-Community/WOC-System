const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, time } = require("discord.js");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Nachricht melden')
        .setType(ApplicationCommandType.Message),
    
    async execute(interaction) {
        const reportLog = interaction.guild.channels.cache.get('1010515517460725782');

        const embed = new EmbedBuilder()
        .setTitle(`\`📝\` | Neuer Report von ${interaction.user.displayName}`)
        .setDescription(`${interaction.targetMessage.author} wurde von ${interaction.user} gemeldet.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n\`✍️\` » Nachricht: ${interaction.targetMessage.url}\n\`📑\` » Inhalt: ${interaction.targetMessage.content.slice(0, 400)}\n\`📌\` » Benutzername: ${interaction.targetMessage.author.displayName} (\`${interaction.targetMessage.author.id}\`) (${interaction.targetMessage.author})\n\n\`⏰\` » Account erstellt am: ${time(interaction.targetMessage.author.createdAt)}\n\`⏰\` » Beigetreten am: ${time(interaction.targetMessage.member.joinedAt)}`)
        .setColor('Red')
        .setFooter({ text: `©️ ${interaction.guild.name} - Report System`, iconURL: `${interaction.guild.iconURL()}` })
        .setTimestamp();

        reportLog.send({
            embeds: [embed]
        })

        interaction.reply({ ephemeral: true, content: ':white_check_mark: Erfolgreich gemeldet!'})
    }
}