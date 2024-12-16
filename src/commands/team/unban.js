const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('» Entbanne einen User. 🔓')
        .addUserOption(option => option.setName('user').setDescription('» Welcher User soll Entbannt werden?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('» Gebe ein Grund an').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        
    async execute(interaction) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) return;

        const member = interaction.options.getMember('user')
        const reason = interaction.options.getString('grund')

        const createdAt = `<t:${Math.round(member.user.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(member.joinedTimestamp / 1000)}>`;
        
        const banRole = interaction.guild.roles.cache.find(role => role.id === "886989738244964362");
        const memberRole = interaction.guild.roles.cache.find(role => role.id === "815920703067914290");

        const unbanLogEmbed = new EmbedBuilder()
            .setTitle(`\`✅\` - ${member.displayName} wurde Entbannt.`)
            .setDescription(`${member} wurde von ${interaction.user} Entbannt.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n> Entbannungs-Grund: \`${reason}\`\n> Benutzername: **${member.user.username}** (\`${member.id}\`) (${member})\n> Account erstellt am: ${createdAt}\n> Beigetreten am: ${joinedAt}`)
            .setThumbnail(member.displayAvatarURL({ dynamic: true, format: 'png'}))
            .setColor('Green')
            .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
        
            member.roles.add("815920703067914290")
            member.roles.remove("886989738244964362")

        const logchannel = await interaction.guild.channels.cache.get("1269998219266490538");

        await logchannel.threads.cache.get("1269998219266490538").send({embeds: [unbanLogEmbed]});
        await interaction.reply({ content: `> \`✅\` » Du hast ${member} erfolgreich entbannt.`, ephemeral: true })
    }
}