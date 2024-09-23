const { SlashCommandBuilder, EmbedBuilder, PermissionBitField } = require('discord.js');
const cron = require('node-cron'); // For scheduling the monthly reset
const userdb = require('../../../Datenbank/userdb'); // Your MongoDB user database
const RoleID = '1150753421339676722'; // Minenarbeiter (Event) role ID

// Reset stats every month on the 1st at midnight
cron.schedule('0 0 1 * *', async () => {
    await userdb.updateMany({}, { $set: { messages: 0, voiceTime: 0 } });
    console.log('Die Leaderboard-Statistiken wurden für den neuen Monat zurückgesetzt.');
});

// Utility function to get the current month name in German
function getCurrentMonth() {
    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
}

// Emoji list for positions 1 to 10
const positionEmojis = ['`1️⃣`', '`2️⃣`', '`3️⃣`', '`4️⃣`', '`5️⃣`', '`6️⃣`', '`7️⃣`', '`8️⃣`', '`9️⃣`', '`🔟`'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('» Zeigt das Leaderboard für Nachrichten und Sprachzeit. 📌'),

    async execute(interaction) {
        try {
            // Fetch the top 10 users for messages and voice time from the database
            const topMessages = await userdb.find().sort({ messages: -1 }).limit(10);
            const topVoice = await userdb.find().sort({ voiceTime: -1 }).limit(10);

            // Map user IDs to guild members to ensure we use actual Discord members
            const topMessagesMembers = await Promise.all(topMessages.map(async (user) => {
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null); // Use 'user', not 'userdb'
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

            // Format message leaderboard with emoji positions
            const messageLeaderboardText = topMessagesMembers
                .filter(user => user.member)
                .map((user, index) => {
                    const member = user.member ? user.member.toString() : 'Unbekannt';
                    return `${positionEmojis[index]} ${member}\n> \`${user.messages} Nachrichten\``;
                })
                .join('\n').slice(0, 1024);

            // Format voice leaderboard with emoji positions
            const voiceLeaderboardText = topVoiceMembers
                .filter(user => user.member)
                .map((user, index) => {
                    const member = user.member ? user.member.toString() : 'Unbekannt';
                    return `${positionEmojis[index]} ${member}\n> \`${user.timeText}\``;
                })
                .join('\n').slice(0, 1024);

            const currentMonth = getCurrentMonth(); // Get the current month name

            // Create the message leaderboard embed
            const messageEmbed = new EmbedBuilder()
                .setAuthor({ name: `${currentMonth} Leaderboard - Nachrichten`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png' })
                .setDescription(messageLeaderboardText)
                .setColor('Blurple')
                .setFooter({ text: 'Zuletzt aktualisiert' })
                .setTimestamp();

            // Set the first-place winner's avatar as thumbnail
            if (topMessagesMembers[0] && topMessagesMembers[0].member && typeof topMessagesMembers[0].member.displayAvatarURL === 'function') {
                messageEmbed.setThumbnail(topMessagesMembers[0].member.displayAvatarURL({ dynamic: true }));
            }

            // Create the voice leaderboard embed
            const voiceEmbed = new EmbedBuilder()
                .setAuthor({ name: `${currentMonth} Leaderboard - Voice Zeit`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png' })
                .setDescription(voiceLeaderboardText)
                .setColor('Blue')
                .setFooter({ text: 'Zuletzt aktualisiert' })
                .setTimestamp();

            // Set the first-place winner's avatar as thumbnail for voice leaderboard
            if (topVoiceMembers[0] && topVoiceMembers[0].member && typeof topVoiceMembers[0].member.displayAvatarURL === 'function') {
                voiceEmbed.setThumbnail(topVoiceMembers[0].member.displayAvatarURL({ dynamic: true }));
            }

            await interaction.channel.send({ embeds: [messageEmbed, voiceEmbed] });
            await interaction.reply({ content: '> `✅` » Das Leaderboard-Embed wurde erfolgreich gesendet.', ephemeral: true });

            // Handle top 3 role assignment
            const top3Users = [...topMessages.slice(0, 3), ...topVoice.slice(0, 3)];
            const uniqueTop3Users = Array.from(new Set(top3Users.map(user => user.userId))); // Ensure uniqueness

            // Fetch the role by ID and check if it exists
            const role = interaction.guild.roles.cache.get(RoleID);
            if (!role) {
                console.error(`Die Rolle mit der ID ${RoleID} konnte nicht gefunden werden.`);
                return;
            }

            // Assign the role to the top 3 users
            for (const userId of uniqueTop3Users) {
                const member = await interaction.guild.members.fetch(userId);
                if (!member.roles.cache.has(RoleID)) {
                    await member.roles.add(RoleID);
                }
            }

            // Remove the role from users who are no longer in the top 3
            const allMembersWithRole = role.members;
            allMembersWithRole.forEach(async (member) => {
                if (!uniqueTop3Users.includes(member.id)) {
                    await member.roles.remove(RoleID);
                }
            });

        } catch (error) {
            console.error('Ein Fehler ist aufgetreten:', error);
            await interaction.reply({ content: '> `❌` » Ein Fehler ist aufgetreten. Bitte versuche es erneut.', ephemeral: true });
        }
    }
};
