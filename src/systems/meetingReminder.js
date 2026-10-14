import { EmbedBuilder } from "discord.js";
import client from "#client";
import Meeting from "#models/Meeting.js";
import logger from "#core/logger.js";

const log = logger.child("MeetingReminder");

export function scheduleReminder(meeting) {
  const meetingTime = new Date(meeting.time).getTime();
  const delay = meetingTime - 10 * 60 * 1000 - Date.now();
  if (delay <= 0) {return;}

  setTimeout(async () => {
    try {
      const updatedMeeting = await Meeting.findById(meeting._id);
      if (!updatedMeeting) {return;}

      const reminderEmbed = new EmbedBuilder()
        .setTitle("`📅` Team-Meeting Erinnerung")
        .setDescription(`Dein Team-Meeting startet in **10 Minuten**!\n\n**Thema:** ${updatedMeeting.description}`)
        .addFields({ name: "Beginn", value: `<t:${Math.floor(new Date(updatedMeeting.time).getTime() / 1000)}:F>` })
        .setColor("Orange")
        .setFooter({ text: "Bitte sei pünktlich!" })
        .setTimestamp();

      for (const id of updatedMeeting.participants) {
        try {
          const user = await client.users.fetch(id);
          await user.send({ embeds: [reminderEmbed] });
        } catch (err) {
          log.error(`DM to ${id} failed:`, err?.message ?? err);
        }
      }
    } catch (error) {
      log.error("Reminder failed:", error);
    }
  }, delay);
}

export async function scheduleAllUpcoming() {
  const upcomingMeetings = await Meeting.find({ time: { $gte: new Date() } });
  for (const m of upcomingMeetings) {
    scheduleReminder(m);
  }
  log.info(`${upcomingMeetings.length} meeting reminder(s) scheduled`);
}
