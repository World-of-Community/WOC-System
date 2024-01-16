const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('» Banne einen User. 🔒')
        .addUserOption(option => option.setName('user').setDescription('Welcher User soll Gebannt werden?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('Gebe ein Grund an').setRequired(true)),

    async execute(interaction) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;

        const member = interaction.options.getMember('user')
        const reason = interaction.options.getString('grund')
        const banLog = await interaction.client.channels.fetch(config.banLog)
        const banMember = await interaction.guild.members.fetch(member.id)

        const createdAt = `<t:${Math.round(member.user.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(banMember.joinedTimestamp / 1000)}>`;

        const banLogEmbed = new EmbedBuilder()
            .setTitle(`\`⛔\` - ${member.displayName} wurde gebannt.`)
            .setDescription(`${member} wurde von ${interaction.user} gebannt.\n\n\`👤\` - **BENUTZER INFORMATIONEN**\nBanngrund: \`${reason}\`\nBenutzername: **${member.user.username}** (\`${member.id}\`) (${member})\nAccount erstellt am: ${createdAt}\nBeigetreten am: ${joinedAt}`)
            .setColor('#ff0000')
            .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
        member.roles.add(config.banRolle)
        member.roles.remove(config.memberRolle)
        await banLog.send({ embeds: [banLogEmbed] })
        await interaction.reply({ content: `> \`✅\` » Du hast ${member} erfolgreich gebannt, er ist nun im **Bann-Bereich.**`, ephemeral: true })
    }
}