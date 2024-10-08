const { SlashCommandBuilder, EmbedBuilder, PermissionBitField } = require('discord.js');
const cron = require('node-cron');
const userdb = require('../../../Datenbank/userdb');
const leaderboarddb = require('../../../Datenbank/leaderboarddb'); // Datenbank zum Speichern der Nachricht-ID
const RoleID = '1150753421339676722'; // Minenarbeiter (Event) role ID

function getCurrentMonth() {
    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
}

const positionEmojis = ['`1️⃣`', '`2️⃣`', '`3️⃣`', '`4️⃣`', '`5️⃣`', '`6️⃣`', '`7️⃣`', '`8️⃣`', '`9️⃣`', '`🔟`'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('» Zeigt das Leaderboard für Nachrichten und Sprachzeit. 📌'),

    async execute(interaction) {

        // Aktuellen Unix-Timestamp holen und 5 Sekunden addieren
        const timestampNow = Math.floor(Date.now() / 1000); // Aktueller Unix-Timestamp
        const timestampAfter5Seconds = timestampNow + 5; // 5 Sekunden hinzufügen

        await interaction.reply({ content: `> \`⏳\` » Bitte **5 Sekunden** warten, während das Leaderboard generiert wird. (Ablaufzeit: <t:${timestampAfter5Seconds}:R>)`, ephemeral: true });

        // 5 Sekunden warten
        await new Promise(resolve => setTimeout(resolve, 5000));

        let leaderboardMessage; // Hier wird die Variable definiert

        // Lese die gespeicherte Nachricht-ID beim Neustart
        const savedMessage = await leaderboarddb.findOne({});
        if (savedMessage && savedMessage.messageId) {
            // Versuche die Nachricht zu laden
            leaderboardMessage = await interaction.channel.messages.fetch(savedMessage.messageId).catch(() => null);
        }

        async function updateLeaderboardEmbeds() {
            try {

                const topMessages = await userdb.find().sort({ "stats.messages": -1 }).limit(10);
                const topVoice = await userdb.find().sort({ "stats.voiceTime": -1 }).limit(10);

                const topMessagesMembers = await Promise.all(topMessages.map(async (user) => {
                    const member = await interaction.guild.members.fetch(user.userID).catch(() => null);
                    return { member, messages: user.stats["messages"] ?? 0 };
                }));

                const topVoiceMembers = await Promise.all(topVoice.map(async (user) => {
                    const member = await interaction.guild.members.fetch(user.userID).catch(() => null);
                    const voiceTime = user.stats["voiceTime"] ?? 0;
                    const days = Math.floor(voiceTime / (24 * 60 * 60 * 1000));
                    const hours = Math.floor((voiceTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                    const minutes = Math.floor((voiceTime % (60 * 60 * 1000)) / (60 * 1000));
                    return { member, timeText: `${days} Tage ${hours} Stunden ${minutes} Minuten` };
                }));

                const messageLeaderboardText = topMessagesMembers
                    .filter(user => user.member)
                    .map((user, index) => {
                        const memberMention = user.member ? user.member.toString() : 'Unbekannt';
                        return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.globalName}**\n> \`${user.messages} Nachrichten\``;
                    })
                    .join('\n').slice(0, 1024);

                const voiceLeaderboardText = topVoiceMembers
                    .filter(user => user.member)
                    .map((user, index) => {
                        const memberMention = user.member ? user.member.toString() : 'Unbekannt';
                        return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.globalName}**\n> \`${user.timeText}\``;
                    })
                    .join('\n').slice(0, 1024);

                const currentMonth = getCurrentMonth();

                const InfoEmbed = new EmbedBuilder()
                    .setDescription('Die Top 3 Mitglieder in Nachrichten & Voice erhalten\ndie <@&1150753421339676722>-Rolle\n\n> `👷‍♂️` » **Vorteile**\n- Bilder senden in <#815922756918181898>\n- Höher gelistet\n- Ping Reaktion (`/emoji`)\n\n> `📌` » Das Leaderboard wird Monatlich zurückgesetzt.')
                    .setColor('Orange');

                const messageEmbed = new EmbedBuilder()
                    .setAuthor({ name: `» ${currentMonth} Leaderboard - Nachrichten`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png' })
                    .setDescription(messageLeaderboardText)
                    .setColor('Blurple')
                    .setFooter({ text: '» Zuletzt aktualisiert', iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286773637562630154/image.png' })
                    .setTimestamp();

                const voiceEmbed = new EmbedBuilder()
                    .setAuthor({ name: `» ${currentMonth} Leaderboard - Voice Zeit`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png' })
                    .setDescription(voiceLeaderboardText)
                    .setColor('Blue')
                    .setFooter({ text: '» Zuletzt aktualisiert', iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286773912977408011/image.png' })
                    .setTimestamp();

                // Füge Thumbnails für den ersten Platz hinzu
                if (topMessagesMembers[0]?.member) {
                    messageEmbed.setThumbnail(topMessagesMembers[0].member.displayAvatarURL({ dynamic: true }));
                }

                if (topVoiceMembers[0]?.member) {
                    voiceEmbed.setThumbnail(topVoiceMembers[0].member.displayAvatarURL({ dynamic: true }));
                }

                // Bearbeite beide Embeds zusammen oder sende sie, wenn sie noch nicht existieren
                if (leaderboardMessage) {
                    await leaderboardMessage.edit({ embeds: [InfoEmbed, messageEmbed, voiceEmbed] });
                } else {
                    leaderboardMessage = await interaction.channel.send({ embeds: [InfoEmbed, messageEmbed, voiceEmbed] });
                    
                    // Nachricht-ID speichern
                    await leaderboarddb.updateOne({}, { messageId: leaderboardMessage.id }, { upsert: true });
                }

            } catch (error) {
                console.error('Fehler beim Aktualisieren des Leaderboards:', error);
            }
        }

        // Starte den Cron-Job, um die Embeds jede Minute zu aktualisieren
        cron.schedule('* * * * *', updateLeaderboardEmbeds);
        updateLeaderboardEmbeds();

        cron.schedule('0 0 1 * *', async () => {
            console.log('Zurücksetzen des Monatlichen Leaderboards gestartet.');
            const result = await userdb.updateMany({}, { $set: { 'stats.messages': 0, 'stats.voiceTime': 0 } });
            console.log('Leaderboard wurde Monatlich zurückgesetzt:', result);
            await updateLeaderboardEmbeds();
        });
    }
};
