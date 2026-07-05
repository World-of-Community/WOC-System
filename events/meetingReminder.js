import { EmbedBuilder } from "discord.js";
import client from "../index.js";
import Meeting from "../models/meetingdb.js";

// Erinnert Meeting-Teilnehmer 10 Minuten vor Beginn per DM
const scheduleReminder = (meeting) => {
    const meetingTime = new Date(meeting.time).getTime();
    const reminderTime = meetingTime - 10 * 60 * 1000;
    const delay = reminderTime - Date.now();

    if (delay <= 0) return;

    setTimeout(async () => {
        const updatedMeeting = await Meeting.findById(meeting._id);
        if (!updatedMeeting) return;

        const reminderEmbed = new EmbedBuilder()
            .setTitle('`📅` Team-Meeting Erinnerung')
            .setDescription(`Dein Team-Meeting startet in **10 Minuten**!\n\n**Thema:** ${updatedMeeting.description}`)
            .addFields({ name: 'Beginn', value: `<t:${Math.floor(new Date(updatedMeeting.time).getTime() / 1000)}:F>` })
            .setColor('Orange')
            .setFooter({ text: 'Bitte sei pünktlich!' })
            .setTimestamp();

        for (const id of updatedMeeting.participants) {
            try {
                const user = await client.users.fetch(id);
                await user.send({ embeds: [reminderEmbed] });
            } catch (err) {
                console.error(`Konnte DM an ${id} nicht senden:`, err);
            }
        }
    }, delay);
};

// Beim Bot-Start Reminder für alle kommenden Meetings setzen
client.once('clientReady', async () => {
    console.log('✅  | Meeting Reminder-System aktiviert');
    const upcomingMeetings = await Meeting.find({ time: { $gte: new Date() } });
    for (const m of upcomingMeetings) {
        scheduleReminder(m);
    }
});

export { scheduleReminder };
