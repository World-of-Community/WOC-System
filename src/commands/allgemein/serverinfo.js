const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Server = require("../../../Datenbank/usercounterdb");

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

        const server = interaction.guild;
        const member = interaction.member;

        let serverData = await Server.findOne({ guildId: guild.id });

        if (!serverData) {
            serverData = new Server({
                guildId: guild.id,
                highestUserCount: userCount,
            });
        }

        // Höchste Useranzahl aktualisieren, falls aktueller Wert größer ist
        if (userCount > serverData.highestUserCount) {
            serverData.highestUserCount = userCount;
            await serverData.save();
        }

        const createdAt = `<t:${Math.round(server.createdTimestamp / 1000)}:D>`;
        const joinedAt = `<t:${Math.round(interaction.member.joinedTimestamp / 1000)}:R>`;

        const emojiCount = guild.emojis.cache.size;

        const boosterRole = guild.roles.cache.find(role => role.tags?.premiumSubscriberRole);

        let boosterMentions = 'Kein Booster';
        if (boosterRole) {
            const boosters = boosterRole.members;
            if (boosters.size > 0) {
                boosterMentions = boosters.map(member => member.toString()).join(', ');
            }
        }

        const serverEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name} - Server Information`)
            .setDescription(`> \`⏰\` » **Server Erstellt:** ${createdAt} (${joinedAt})\n> \`👥\` » **Mitglieder:** \`${interaction.guild.memberCount.toLocaleString()}\`\n> \`👤\` » **User:** \`${userCount.toLocaleString()}\`\n> \`⚙️\` » **Bots:** \`${botCount}\`\n> \`🟢\` » **Online:** \`${onlineMembers.toLocaleString()}\`\n> \`📈\` » **Erreichte Useranzahl:** \`${serverData.highestUserCount.toLocaleString()}\`\n\n> <a:nitro:1186636151335944283> » Boost Level: **${guild.premiumTier}** (**${interaction.guild.premiumSubscriptionCount}** Boosts)\n> \`💖\` » **Server Booster:** ${boosterMentions}\n\n> \`🎭\` » Wir haben aktuell **${emojiCount}** Emotes.`)
            .setColor('Blurple')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter({ text: `${interaction.guild.name} | Server Information`, iconURL: `${interaction.guild.iconURL()}` });

        interaction.reply({ embeds: [serverEmbed], ephemeral: true });
    }
}