const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cron = require('node-cron'); // For scheduling the monthly reset
const User = require('../../../Datenbank/userdb');
const RoleID = '1150753421339676722'; // Minenarbeiter (Event) role ID

 // Mit den Emoji 1️⃣ bis zu 10

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
const positionEmojis = ['\`1️⃣\`', '\`2️⃣\`', '\`3️⃣\`', '\`4️⃣\`', '\`5️⃣\`', '\`6️⃣\`', '\`7️⃣\`', '\`8️⃣\`', '\`9️⃣\`', '\`🔟\`'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('» Zeigt das Leaderboard für Nachrichten und Sprachzeit. 📌'),

    async execute(interaction) {
        // Fetch the top 10 users for messages and voice time
        const topMessages = await User.find().sort({ messages: -1 }).limit(10);
        const topVoice = await User.find().sort({ voiceTime: -1 }).limit(10);

        // Format message leaderboard
        const messageLeaderboardText = topMessages.map((user, index) =>
            `${positionEmojis[index]} » ${user}\n> \`${user.messages}\` Nachrichten`
        ).join('\n');

        // Format voice leaderboard (days, hours, minutes)
        const voiceLeaderboardText = topVoice.map((user, index) => {
            const totalMilliseconds = user.voiceTime;
            const days = Math.floor(totalMilliseconds / (24 * 60 * 60 * 1000));
            const hours = Math.floor((totalMilliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((totalMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

            return `${positionEmojis[index]} » ${user} \n> \`${days} Tage ${hours} Stunden ${minutes} Minuten\``;
        }).join('\n');

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

        // Assign the role to the top 3 users
        for (const userId of uniqueTop3Users) {
            const member = await interaction.guild.members.fetch(userId);
            if (!member.roles.cache.has(RoleID)) {
                await member.roles.add(RoleID);
            }
        }

        // Remove the role from users who are no longer in the top 3
        const allMembersWithRole = interaction.guild.roles.cache.get(RoleID).members;
        allMembersWithRole.forEach(async (member) => {
            if (!uniqueTop3Users.includes(member.id)) {
                await member.roles.remove(RoleID);
            }
        });
    }
};
