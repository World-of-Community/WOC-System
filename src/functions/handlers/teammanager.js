const { EmbedBuilder, Permissions } = require('discord.js');
const teamDB = require('../../../Datenbank/teamdb');
const serverDB = require('../../../Datenbank/serverdb');
const cron = require('node-cron');
//Todo: Team-Besprehcung cron schedule machen, Weil wenn der Bot crasht funktioniert der Messge Delete nicht und der Reminder
module.exports = (client) => {
    client.manageTeam = async () => {
        client.on('messageCreate', async (message) => {
            if (message.author.bot) return;


            const mentionedUsers = message.mentions.users;
            for (const user of mentionedUsers.values()) {

                const teamData = await teamDB.findOne({ userID: user.id });

                if (teamData && teamData.urlaub) {
                    const now = new Date();
                    const urlaubBeginn = parseDate(teamData.urlaub.beginn);
                    const urlaubEnde = parseDate(teamData.urlaub.ende);
                    
                    if (now >= urlaubBeginn && now <= urlaubEnde) {
                        const urlaubMessageUrl = `https://discord.com/channels/${message.guild.id}/877446081036836884/${teamData.urlaub.messageID}`;

                        try {
                            await message.reply({
                                content: `> \`❗\` » \`${user.displayName}\` ist derzeit im Urlaub und daher nicht erreichbar. ${urlaubMessageUrl}`
                            });
                        } catch (error) {
                            console.error('Fehler beim Senden der Antwort:', error);
                        }
                    } 
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

                // Besprechung Check
                try {
                    await serverDB.updateMany(
                        { guildID: "815919809379172354" },
                        { $pull: { meetings: { date: { $lt: now } } } }
                    );
                    console.log('Abgelaufene Meetings erfolgreich gelöscht.');
                } catch (error) {
                    console.error('Fehler beim Löschen abgelaufener Meetings:', error);
                }
            }
        });


        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;
        
            const userId = interaction.user.id;
            const customId = interaction.customId;
            const meetingDate = new Date(interaction.message.embeds[0].description.match(/Datum:\s*(.*)\n/)[1]);
            const meeting = await serverDB.findOne({ "meetings.date": meetingDate });
        
            if (!meeting) {
                await interaction.reply({ content: '> `❌` » Meeting nicht gefunden.', ephemeral: true });
                return;
            }
        
            switch (customId) {
                case 'remindMe':
                    await serverDB.updateOne(
                        { "meetings.date": meetingDate },
                        { $addToSet: { "meetings.$.reminders": userId } }
                    );
                    await interaction.reply({ content: '> `🔔` » Du wirst 10 Minuten vor dem Meeting erinnert.', ephemeral: true });
                    break;
                case 'attend':
                    await serverdb.updateOne(
                        { "meetings.date": meetingDate },
                        {
                            $addToSet: { "meetings.$.attendees": userId },
                            $pull: { "meetings.$.nonAttendees": userId }
                        }
                    );
                    await interaction.reply({ content: '> `✅` » Du hast deine Teilnahme bestätigt.', ephemeral: true });
                    break;
                case 'decline':
                    await serverDB.updateOne(
                        { "meetings.date": meetingDate },
                        {
                            $addToSet: { "meetings.$.nonAttendees": userId },
                            $pull: { "meetings.$.attendees": userId }
                        }
                    );
                    await interaction.reply({ content: '> `❌` » Du hast deine Teilnahme abgelehnt.', ephemeral: true });
                    break;
                default:
                    await interaction.reply({ content: '> `❌` » Unbekannte Aktion.', ephemeral: true });
                    break;
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
