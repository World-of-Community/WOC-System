const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('» Entbanne einen User. 🔓')
        .addUserOption(option => option.setName('user').setDescription('» Welcher User soll Entbannt werden?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('» Gebe ein Grund an').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
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

        const unbanLogEmbed = new EmbedBuilder()
            .setTitle(`\`✅\` - ${member.displayName} wurde Entbannt.`)
            .setDescription(`${member} wurde von ${interaction.user} Entbannt.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n> Entbannungs-Grund: \`${reason}\`\n> Benutzername: **${member.user.username}** (\`${member.id}\`) (${member})\n> Account erstellt am: ${createdAt}\n> Beigetreten am: ${joinedAt}`)
            .setColor('#04ff00')
            .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
        member.roles.remove(config.banRolle)
        member.roles.add(config.memberRolle)
        await banLog.send({ embeds: [unbanLogEmbed] })
        await interaction.reply({ content: `> \`✅\` » Du hast ${member} erfolgreich entbannt.`, ephemeral: true })
    }
}