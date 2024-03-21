const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs')
const ms = require("ms");
const bandb = require("../../Datenbank/bandb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('» Banne einen User. 🔒')
        .addUserOption(option => option.setName('user').setDescription('Welcher User soll Gebannt werden?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('Gebe ein Grund an').setRequired(true))
        .addStringOption(option => option.setName('dauer').setDescription('Gebe eine Dauer an (5D 30m) (Keine = Perma)').setRequired(false)),

    async execute(interaction) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        var banLogEmbed
        const member = interaction.options.getMember('user')
        const reason = interaction.options.getString('grund')
        const duration = interaction.options.getString('dauer')
        const banLog = await interaction.guild.channels.fetch(config.banLog)
        const banMember = await interaction.guild.members.fetch(member.id)

        const createdAt = `<t:${Math.round(member.user.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(banMember.joinedTimestamp / 1000)}>`;

        if (duration) {
            const durationDauer = ms(duration)
            const currentDate = new Date();

            const endDate = new Date(currentDate.getTime() + durationDauer);
            const timestamp = Math.floor(endDate / 1000);

            banLogEmbed = new EmbedBuilder()
                .setTitle(`\`⛔\` - ${member.displayName} wurde gebannt.`)
                .setDescription(`${member} wurde von ${interaction.user} gebannt.\n
            \n\`👤\` - **BENUTZER INFORMATIONEN**
            \nBanngrund: \`${reason}\`
            \nDauer: <t:${timestamp}:D>
            \nBenutzername: **${member.user.username}** (\`${member.id}\`) (${member})\nAccount erstellt am: ${createdAt}\nBeigetreten am: ${joinedAt}`)
                .setColor('#ff0000')
                .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
            member.roles.add(config.banRolle)
            member.roles.remove(config.memberRolle)
            const newBan = new bandb({
                creator: interaction.user,
                user: member.id,
                reason: reason,
                duration: durationDauer,
                startTime: new Date(),
                endTime: null,
            });
            await newBan.save()
        } else {
            banLogEmbed = new EmbedBuilder()
                .setTitle(`\`⛔\` - ${member.displayName} wurde gebannt.`)
                .setDescription(`${member} wurde von ${interaction.user} gebannt.\n
                    \n\`👤\` - **BENUTZER INFORMATIONEN**
                    \nBanngrund: \`${reason}\`
                    \nDauer: PERMANENT
                    \nBenutzername: **${member.user.username}** (\`${member.id}\`) (${member})\nAccount erstellt am: ${createdAt}\nBeigetreten am: ${joinedAt}`)
                .setColor('#ff0000')
                .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
            member.roles.add(config.banRolle)
            member.roles.remove(config.memberRolle)
            const newBan = new bandb({
                creator: interaction.user,
                user: member.id,
                reason: reason,
            });
            await newBan.save()
        }

        await banLog.send({ embeds: [banLogEmbed] })
        await interaction.reply({ content: `> \`✅\` » Du hast ${member} erfolgreich gebannt, er ist nun im **Bann-Bereich.**`, ephemeral: true })
    }
}