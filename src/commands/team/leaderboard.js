const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cron = require('node-cron'); // For scheduling the monthly reset
const User = require('../../../Datenbank/userdb'); // Your MongoDB user database
const RoleID = '1150753421339676722'; // Minenarbeiter (Event) role ID

// Reset stats every month on the 1st at midnight
cron.schedule('0 0 1 * *', async () => {
    await User.updateMany({}, { $set: { messages: 0, voiceTime: 0 } });
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
const positionEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('» Zeigt das Leaderboard für Nachrichten und Sprachzeit. 📌'),

    async execute(interaction) {
        try {
            // Fetch the top 10 users for messages and voice time from the database
            const topMessages = await User.find().sort({ messages: -1 }).limit(10);
            const topVoice = await User.find().sort({ voiceTime: -1 }).limit(10);

            // Map user IDs to guild members to ensure we use actual Discord members
            const topMessagesMembers = await Promise.all(topMessages.map(async (user) => {
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                return { member, messages: user.messages ?? 0 }; // Set messages to 0 if undefined
            }));

            const topVoiceMembers = await Promise.all(topVoice.map(async (user) => {
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                const voiceTime = user.voiceTime ?? 0; // Set voiceTime to 0 if undefined
                const days = Math.floor(voiceTime / (24 * 60 * 60 * 1000));
                const hours = Math.floor((voiceTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((voiceTime % (60 * 60 * 1000)) / (60 * 1000));
                return { member, timeText: `${days} Tage ${hours} Stunden ${minutes} Minuten` };
            }));

            console.log(data.member);
            console.log(topMessagesMembers);
            console.log(topVoiceMembers);

            // Format message leaderboard with emoji positions
            const messageLeaderboardText = topMessagesMembers
                .filter(data => data.member)
                .map((data, index) => {
                    const member = data.member ? `${data.member.user.tag}` : 'Unbekannt';
                    return `${positionEmojis[index]} ${member}\n> \`${data.messages}\` Nachrichten`;
                })
                .join('\n').slice(0, 1024); // Slice to ensure under 1024 characters

            // Format voice leaderboard with emoji positions
            const voiceLeaderboardText = topVoiceMembers
                .filter(data => data.member)
                .map((data, index) => {
                    const username = data.member ? `${data.member.user.tag}` : 'Unbekannt';
                    return `${positionEmojis[index]} ${username}\n> \`${data.timeText}\``;
                })
                .join('\n').slice(0, 1024); // Slice to ensure under 1024 characters

            const currentMonth = getCurrentMonth(); // Get the current month name

            // Create the message leaderboard embed
            const messageEmbed = new EmbedBuilder()
                .setTitle(`${currentMonth} Leaderboard - Nachrichten`)
                .setDescription(messageLeaderboardText)
                .setColor('Blurple')
                .setFooter({ text: 'Zuletzt aktualisiert' })
                .setTimestamp();

            // Create the voice leaderboard embed
            const voiceEmbed = new EmbedBuilder()
                .setTitle(`${currentMonth} Leaderboard - Voice Zeit`)
                .setDescription(voiceLeaderboardText)
                .setColor('Blue')
                .setFooter({ text: 'Zuletzt aktualisiert' })
                .setTimestamp();

            // Send the embeds to the channel
            await interaction.channel.send({ embeds: [messageEmbed, voiceEmbed] });

            // Send confirmation that the leaderboard was sent
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
