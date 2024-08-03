const { EmbedBuilder, Permissions } = require('discord.js');
const teamDB = require('../../../Datenbank/teamdb');
const cron = require('node-cron');

module.exports = (client) => {
    client.manageTeam = async () => {
        client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            console.log("Received a message:", message.content);

            const mentionedUsers = message.mentions.users;
            for (const user of mentionedUsers.values()) {
                console.log("Mentioned user:", user.id);

                const teamData = await teamDB.findOne({ userID: user.id });
                console.log("Team data:", teamData);

                if (teamData && teamData.urlaub) {
                    const now = new Date();
                    const urlaubBeginn = parseDate(teamData.urlaub.beginn);
                    const urlaubEnde = parseDate(teamData.urlaub.ende);
                    
                    console.log("Current time:", now);
                    console.log("Urlaub begin:", urlaubBeginn);
                    console.log("Urlaub end:", urlaubEnde);

                    if (now >= urlaubBeginn && now <= urlaubEnde) {
                        const urlaubMessageUrl = `https://discord.com/channels/${message.guild.id}/877446081036836884/${teamData.urlaub.messageID}`;

                        try {
                            await message.reply({
                                content: `> ${user} ist derzeit im Urlaub und daher nicht erreichbar. [Mehr Infos](${urlaubMessageUrl})`
                            });
                            console.log("Reply sent to message:", message.id);
                        } catch (error) {
                            console.error('Fehler beim Senden der Antwort:', error);
                        }
                    } else {
                        console.log(`User ${user.id} is not on vacation. Current time: ${now}`);
                    }
                } else {
                    console.log(`No vacation data found for user ${user.id}`);
                }
            }
        });

        function parseDate(dateStr) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        cron.schedule('0 0 * * *', async () => {
            const now = new Date();
            const nowFormatted = formatDate(now);

            const expiredUrlaubs = await teamDB.find({
                'urlaub.ende': { $lte: nowFormatted }
            });

            for (const data of expiredUrlaubs) {
                const channel = client.channels.cache.get('877446081036836884');
                if (data.urlaub.messageID) {
                    try {
                        const message = await channel.messages.fetch(data.urlaub.messageID);
                        if (message) {
                            await message.delete();
                        }
                    } catch (err) {
                        console.error('Fehler beim Löschen der Nachricht:', err);
                    }
                }

                await teamDB.updateOne(
                    { userID: data.userID },
                    { $unset: { urlaub: '' } }
                );
            }
        });

        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        }
    };
};
