const { SlashCommandBuilder, EmbedBuilder, PermissionBitField } = require('discord.js');
const cron = require('node-cron');
const userdb = require('../../../Datenbank/userdb');
const RoleID = '1150753421339676722'; // Minenarbeiter (Event) role ID

function getCurrentMonth() {
    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
}

// Definiere Emojis für Positionen 1 bis 10
const positionEmojis = ['`1️⃣`', '`2️⃣`', '`3️⃣`', '`4️⃣`', '`5️⃣`', '`6️⃣`', '`7️⃣`', '`8️⃣`', '`9️⃣`', '`🔟`'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('» Zeigt das Leaderboard für Nachrichten und Sprachzeit. 📌'),

    async execute(interaction) {
        try {
            await interaction.reply({ content: '> `⏳` » Bitte 5 Sekunden warten, während das Leaderboard generiert wird.', ephemeral: true });

            // 5 Sekunden warten
            await new Promise(resolve => setTimeout(resolve, 5000));

            const topMessages = await userdb.find().sort({ messages: -1 }).limit(10);
            const topVoice = await userdb.find().sort({ voiceTime: -1 }).limit(10);

            const topMessagesMembers = await Promise.all(topMessages.map(async (user) => {
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                return { member, messages: user.messages ?? 0 };
            }));

            const topVoiceMembers = await Promise.all(topVoice.map(async (user) => {
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                const voiceTime = user.voiceTime ?? 0;
                const days = Math.floor(voiceTime / (24 * 60 * 60 * 1000));
                const hours = Math.floor((voiceTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((voiceTime % (60 * 60 * 1000)) / (60 * 1000));
                return { member, timeText: `${days} Tage ${hours} Stunden ${minutes} Minuten` };
            }));

            const messageLeaderboardText = topMessagesMembers
                .filter(user => user.member)
                .map((user, index) => {
                    const memberMention = user.member ? user.member.toString() : 'Unbekannt';
                    const nickname = user.member.nickname ? ` (${user.member.nickname})` : '';
                    return `${positionEmojis[index]} ${memberMention}${nickname}\n> \`${user.messages} Nachrichten\``;
                })
                .join('\n').slice(0, 1024);

            const voiceLeaderboardText = topVoiceMembers
                .filter(user => user.member)
                .map((user, index) => {
                    const memberMention = user.member ? user.member.toString() : 'Unbekannt';
                    const nickname = user.member.nickname ? ` (${user.member.nickname})` : '';
                    return `${positionEmojis[index]} ${memberMention}${nickname}\n> \`${user.timeText}\``;
                })
                .join('\n').slice(0, 1024);

            const currentMonth = getCurrentMonth();

            const messageEmbed = new EmbedBuilder()
                .setAuthor({ name: `${currentMonth} Leaderboard - Nachrichten`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png' })
                .setDescription(messageLeaderboardText)
                .setColor('Blurple')
                .setFooter({ text: 'Zuletzt aktualisiert' })
                .setTimestamp();

            if (topMessagesMembers[0] && topMessagesMembers[0].member && typeof topMessagesMembers[0].member.displayAvatarURL === 'function') {
                messageEmbed.setThumbnail(topMessagesMembers[0].member.displayAvatarURL({ dynamic: true }));
            }

            const voiceEmbed = new EmbedBuilder()
                .setAuthor({ name: `${currentMonth} Leaderboard - Voice Zeit`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png' })
                .setDescription(voiceLeaderboardText)
                .setColor('Blue')
                .setFooter({ text: 'Zuletzt aktualisiert' })
                .setTimestamp();

            if (topVoiceMembers[0] && topVoiceMembers[0].member && typeof topVoiceMembers[0].member.displayAvatarURL === 'function') {
                voiceEmbed.setThumbnail(topVoiceMembers[0].member.displayAvatarURL({ dynamic: true }));
            }

            await interaction.channel.send({ embeds: [messageEmbed, voiceEmbed] });

            // Überprüfe, ob interaction.guild existiert
            if (!interaction.guild) {
                await interaction.editReply({ content: '> `❌` » Fehler: Gilde nicht gefunden.', ephemeral: true });
                return;
            }

            // Überprüfe, ob die Rolle existiert
            const role = interaction.guild.roles?.cache.get(RoleID);
            if (!role) {
                await interaction.editReply({ content: '> `❌` » Fehler: Rolle konnte nicht gefunden werden.', ephemeral: true });
                return;
            }

            const top3Users = [...topMessages.slice(0, 3), ...topVoice.slice(0, 3)];
            const uniqueTop3Users = Array.from(new Set(top3Users.map(user => user.userId)));

            // Rolle zuweisen und entfernen
            for (const userId of uniqueTop3Users) {
                const member = await interaction.guild.members.fetch(userId);
                if (member && !member.roles.cache.has(RoleID)) {
                    await member.roles.add(RoleID);
                }
            }

            const allMembersWithRole = role.members;
            allMembersWithRole.forEach(async (member) => {
                if (!uniqueTop3Users.includes(member.id)) {
                    await member.roles.remove(RoleID);
                }
            });

        } catch (error) {
            console.error('Ein Fehler ist aufgetreten:', error);
            await interaction.editReply({ content: '> `❌` » Ein Fehler ist aufgetreten. Bitte versuche es erneut.', ephemeral: true });
        }
    }
};

