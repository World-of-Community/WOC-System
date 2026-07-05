import cron from 'node-cron';
import userdb from '../../models/userdb.js';
import leaderboarddb from '../../models/leaderboarddb.js';
import { createLeaderboardMessage } from '../../functions/leaderboard.js';
const RoleID = '1150753421339676722'; // Minenarbeiter (Event) Rolle

function getCurrentMonth() {
    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
}

const positionEmojis = ['`1️⃣`', '`2️⃣`', '`3️⃣`', '`4️⃣`', '`5️⃣`', '`6️⃣`', '`7️⃣`', '`8️⃣`', '`9️⃣`', '`🔟`'];

export default {
    name: "leaderboard",
    description: "» Zeigt das Leaderboard für Nachrichten und Sprachzeit. 📌",
    type: 1,
    default_member_permissions: "8",
    options: [],

    async run(client, interaction) {
        if(!interaction.guild) return;
        await interaction.deferReply({ ephemeral: true });
    
        const msgContent = await createLeaderboardMessage(interaction.guild);

        const message = await interaction.channel.send({ embeds: msgContent.embeds, fetchReply: true });

        let savedMessage = await leaderboarddb.findOne({ guildId: interaction.guild.id });
        if(!savedMessage) {
            savedMessage = await leaderboarddb.create({
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                messageId: message.id
            })
        } else {
            savedMessage.channelId = interaction.channel.id;
            savedMessage.messageId = message.id
        }

        await savedMessage.save()

        interaction.editReply({ content: ':white_check_mark: Fertig!' })
    }
};
