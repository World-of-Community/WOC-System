const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cron = require('node-cron'); // For scheduling the monthly reset
const userdb = require("../../../Datenbank/userdb");
const RoleID = '1150753421339676722'; // Top 3 users (Minenarbeiter (Event))

// Soll Monatlich zurück gesetzt werden die Stats
// Voice mit Tag(e) Stunde(n) Minute(n) anzeigen
// Embeds bearbeiten sobald sich was ändert
// Top 3 Nutzer bekommen eine Rolle für 1 Monat
// Aktuellen Monat anzeigen in den Embeds

// Reset stats every month
cron.schedule('0 0 1 * *', async () => {
    await User.updateMany({}, { $set: { messages: 0, voiceTime: 0 } });
    console.log('Die Leaderboard-Statistiken wurden für den neuen Monat zurückgesetzt.');
});

// Utility function to get the current month name
function getCurrentMonth() {
    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('» Zeigt das Leaderboard für Nachrichten und Sprachzeit. 📌'),

    async execute(interaction) {
        // Fetch the top 10 users for both messages and voice time
        const topMessages = await User.find().sort({ messages: -1 }).limit(10);
        const topVoice = await User.find().sort({ voiceTime: -1 }).limit(10);

        // Format message leaderboard
        const messageLeaderboard = topMessages.map((user, index) =>
            `${index + 1}. <@${user.userId}>\n\`${user.messages}\` Nachrichten`
        ).join('\n');

        // Format voice leaderboard (days, hours, minutes)
        const voiceLeaderboard = topVoice.map((user, index) => {
            const totalMilliseconds = user.voiceTime;
            const days = Math.floor(totalMilliseconds / (24 * 60 * 60 * 1000));
            const hours = Math.floor((totalMilliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((totalMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

            return `${index + 1}. <@${user.userId}> \n> \`${days} Tage ${hours} Stunden ${minutes} Minuten\``;
        }).join('\n');

        const currentMonth = getCurrentMonth(); // Get the current month

        // Create the message leaderboard embed
        const messageLeaderboard = new EmbedBuilder()
            .setTitle(`${currentMonth} Leaderboard - Nachrichten`)
            .setDescription(messageLeaderboard)
            .setColor('Blurple')
            .setFooter({ text: 'Zuletzt aktualisiert' })
            .setTimestamp();

        // Create the voice leaderboard embed
        const voiceEmbed = new EmbedBuilder()
            .setTitle(`${currentMonth} Leaderboard - Voice Zeit`)
            .setDescription(voiceLeaderboard)
            .setColor('Blue')
            .setFooter({ text: 'Zuletzt aktualisiert' })
            .setTimestamp();

        await interaction.channel.send({ embeds: [messageLeaderboard, voiceLeaderboard] });
        await interaction.reply({ content: '> `✅` » Das Leaderboard-Embed wurde erfolgreich gesendet.', ephemeral: true });

        // Handle top 3 role assignment
        const top3Users = [...topMessages.slice(0, 3), ...topVoice.slice(0, 3)];
        const uniqueTop3Users = Array.from(new Set(top3Users.map(user => user.userId))); // Ensure uniqueness

        uniqueTop3Users.forEach(async (userId) => {
            const member = await interaction.guild.members.fetch(userId);
            if (!member.roles.cache.has(RoleID)) {
                await member.roles.add(RoleID);
            }
        });

        // Remove the role from users who are no longer in the top 3
        const allMembersWithRole = interaction.guild.roles.cache.get(RoleID).members;
        allMembersWithRole.forEach(async (member) => {
            if (!uniqueTop3Users.includes(member.id)) {
                await member.roles.remove(RoleID);
            }
        });
    }
};

