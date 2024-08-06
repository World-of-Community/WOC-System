const { EmbedBuilder, Permissions } = require('discord.js');
const teamDB = require('../../../Datenbank/teamdb');
const serverDB = require('../../../Datenbank/serverdb');
const cron = require('node-cron');
//Todo: Team-Besprechung cron schedule machen, Weil wenn der Bot crasht funktioniert der Messge Delete nicht und der Reminder
module.exports = (client) => {
    client.manageTeam = async () => {

        client.on('ready', async () => {
            await rescheduleTasks(client);
        });

        client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            const mentionedUsers = message.mentions.users;
            for (const user of mentionedUsers.values()) {
                const teamData = await teamDB.findOne({ userID: user.id });
                if (!teamData || !teamData.urlaub) continue;

                const now = new Date();
                const urlaubBeginn = parseDate(teamData.urlaub.beginn);
                const urlaubEnde = parseDate(teamData.urlaub.ende);

                if (urlaubBeginn && urlaubEnde && now >= urlaubBeginn && now <= urlaubEnde) {
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
        });

        function parseDate(dateStr) {
            if (!dateStr) return null;
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        }

        cron.schedule('0 0 * * *', async () => {
            const now = new Date();
            const nowFormatted = formatDate(now);

            const expiredUrlaubs = await teamDB.find({
                'urlaub.ende': { $lte: nowFormatted }
            });

            const channel = client.channels.cache.get('877446081036836884');
            if (!channel) {
                console.error('Channel not found');
                return;
            }

            for (const data of expiredUrlaubs) {
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

            const dateMatch = interaction.message.embeds[0].description.match(/Datum:\s*(.*)\n/);
            if (!dateMatch) {
                await interaction.reply({ content: '> `❌` » Meeting-Datum konnte nicht extrahiert werden.', ephemeral: true });
                return;
            }

            const meetingDate = new Date(dateMatch[1]);
            const meeting = await serverDB.findOne({ "meetings.date": meetingDate });

            if (!meeting) {
                await interaction.reply({ content: '> `❌` » Meeting nicht gefunden.', ephemeral: true });
                return;
            }

            const isAttending = meeting.meetings.some(m => m.attendees.includes(userId));
            const isNonAttending = meeting.meetings.some(m => m.nonAttendees.includes(userId));
            const isReminderSet = meeting.meetings.some(m => m.reminders.includes(userId));
            
            switch (customId) {
                case 'remindMe':
                    try {
                        if (isReminderSet) {
                            await serverDB.updateOne(
                                { "meetings.date": meetingDate },
                                { $pull: { "meetings.$.reminders": userId } }
                            );
                            await interaction.reply({ content: '> `🔕` » Deine Erinnerung an das Meeting wurde deaktiviert.', ephemeral: true });
                        } else {
                            await serverDB.updateOne(
                                { "meetings.date": meetingDate },
                                { $addToSet: { "meetings.$.reminders": userId } }
                            );
                            await interaction.reply({ content: '> `🔔` » Du wirst 10 Minuten vor dem Meeting erinnert.', ephemeral: true });
                        }
                    } catch (error) {
                        console.error(`Fehler bei der Bearbeitung des "remindMe"-Befehls: ${error}`);
                        await interaction.reply({ content: '> `❌` » Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.', ephemeral: true });
                    }

                    break;
                case 'attend':
                    if (isAttending) {
                        await interaction.reply({ content: '> `⚠️` » Du hast bereits deine Teilnahme bestätigt.', ephemeral: true });
                        break;
                    } else {
                    await serverDB.updateOne(
                        { "meetings.date": meetingDate },
                        {
                            $addToSet: { "meetings.$.attendees": userId },
                            $pull: { "meetings.$.nonAttendees": userId }
                        }
                    );
                    await interaction.reply({ content: '> `✅` » Du hast deine Teilnahme bestätigt.', ephemeral: true });
                    }
                    break;

                case 'decline':
                    if (isNonAttending) {
                        await interaction.reply({ content: '> `⚠️` » Du hast bereits deine Teilnahme abgelehnt.', ephemeral: true });
                        break;
                    } else {
 
                    await serverDB.updateOne(
                        { "meetings.date": meetingDate },
                        {
                            $addToSet: { "meetings.$.nonAttendees": userId },
                            $pull: { "meetings.$.attendees": userId }
                        }
                    );
                    await interaction.reply({ content: '> `❌` » Du hast deine Teilnahme abgelehnt.', ephemeral: true });
                    }
                    break;
            }
        });

        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        }

        async function rescheduleTasks(client) {
            const meetings = await serverDB.find({ 'meetings.date': { $gte: new Date() } });
        
            for (const meeting of meetings) {
                for (const m of meeting.meetings) {
                    const meetingDateUTC = new Date(m.date);
                    const reminderDate = new Date(meetingDateUTC.getTime() - 10 * 60000);
                    const deleteDate = new Date(meetingDateUTC.getTime() + 60000);
        

                    //Erinnerung Schedule
                    schedule.scheduleJob(reminderDate, async () => {
                        try {
                            const meeting = await serverDB.findOne({ 'meetings.date': meetingDateUTC });
                            if (meeting) {
                                for (const userId of meeting.reminders) {
                                    try {
                                        const user = await client.users.fetch(userId);
                                        if (user) {
                                            await user.send(`> \`📣\` » Erinnerung: Das Meeting beginnt in **10 Minuten**.\nDatum: ${meetingDateUTC}`);
                                        }
                                    } catch (error) {
                                        console.error(`Fehler beim Senden der Erinnerung an Benutzer ${userId}: ${error}`);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(`Fehler beim Abrufen des Meetings für Erinnerung: ${error}`);
                        }
                    });
        
                    //Message Delete Schedule
                    schedule.scheduleJob(deleteDate, async () => {
                        try {
                            const meeting = await serverDB.findOne({ 'meetings.date': meetingDateUTC });
                            if (meeting) {
                                const messageID = meeting.messageID;
                                const channel = await client.channels.fetch("877446081036836884");
                                if (channel && messageID) {
                                    try {
                                        const message = await channel.messages.fetch(messageID);
                                        if (message) {
                                            await message.delete();
                                        }
                                    } catch (error) {
                                        console.error(`Fehler beim Löschen der Nachricht: ${error}`);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(`Fehler beim Abrufen des Meetings für Löschung: ${error}`);
                        }
                    });
                }
            }
        }
    };
};
