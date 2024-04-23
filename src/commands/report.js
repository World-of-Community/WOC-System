const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('» Melde einen User. ❗')
        .addUserOption(option => option.setName('user').setDescription('Welchen User möchtest du Melden?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('Gebe ein Grund an').setRequired(true)),
        
    async execute(interaction) {
        const reportedUser = await interaction.options.getUser('user');
        const grund = await interaction.options.getString('grund');
        const reportchannel = '1010515517460725782';
        const reportedMember = await interaction.guild.members.fetch(reportedUser.id)

        const createdAt = `<t:${Math.round(reportedUser.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(reportedMember.joinedTimestamp / 1000)}>`;

        if (reportedUser.id == interaction.user.id) {
            return await interaction.reply({ content: "> `❌` » Du kannst dich nicht selbst melden.", ephemeral: true })
        }
        if (reportedUser.bot == true) {
            return await interaction.reply({ content: "> `❌` » Du kannst keine Bots melden.", ephemeral: true });
        }
        const reportEmbed = new EmbedBuilder()
            .setTitle(`\`📝\` | Neuer Report von ${interaction.user.displayName}`)
            .setDescription(`${reportedUser} wurde von ${interaction.user} gemeldet.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\nReportgrund: ${grund}\nBenutzername: ${reportedUser.displayName} (\`${reportedUser.id}\`) (${reportedUser})\nAccount erstellt am: ${createdAt}\nBeigetreten am: ${joinedAt}`)
            .setFooter({ text: `©️ ${interaction.guild.name} - Report System`, iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
            .setColor('Red')
        const modChannel = await interaction.guild.channels.fetch(reportchannel);
        if (modChannel) {
            await modChannel.send({ embeds: [reportEmbed] });
            await interaction.reply({ content: "> `✅` » Der Report wurde gesendet. Vielen Dank!", ephemeral: true });
        } else {
            await interaction.reply({ content: "> `❌` » Es wurde kein Report-Kanal gefunden.", ephemeral: true });
        }
    }
}