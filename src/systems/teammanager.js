import schedule from "node-schedule";
import teamDB from "#models/TeamMember.js";
import serverDB from "#models/Guild.js";
import logger from "#core/logger.js";
import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";

const log = logger.child("TeamManager");

function parseDate(dateStr) {
  if (!dateStr) {return null;}
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export async function handleUrlaubMention(message) {
  if (message.author.bot || !message.guild) {return;}

  for (const user of message.mentions.users.values()) {
    const teamData = await teamDB.findOne({ userID: user.id });
    if (!teamData?.urlaub) {continue;}

    const now = new Date();
    const urlaubBeginn = parseDate(teamData.urlaub.beginn);
    const urlaubEnde = parseDate(teamData.urlaub.ende);

    if (urlaubBeginn && urlaubEnde && now >= urlaubBeginn && now <= urlaubEnde) {
      const urlaubMessageUrl = `https://discord.com/channels/${message.guild.id}/${settings.get("channels.team")}/${teamData.urlaub.messageID}`;

      const sentMessage = await message.reply({
        content: `> \`❗\` » \`${user.displayName}\` ist derzeit im Urlaub und daher nicht erreichbar. ${urlaubMessageUrl}`,
      });
      setTimeout(() => sentMessage.delete().catch(() => {}), 5000);
    }
  }
}

export async function cleanupExpired(client) {
  const now = new Date();
  const expiredUrlaubs = await teamDB.find({ "urlaub.ende": { $lte: formatDate(now) } });

  const channel = client.channels.cache.get(settings.get("channels.team"));
  if (!channel) {
    log.error("Team channel not found");
    return;
  }

  for (const data of expiredUrlaubs) {
    if (data.urlaub.messageID) {
      try {
        const message = await channel.messages.fetch(data.urlaub.messageID);
        await message?.delete();
      } catch (err) {
        log.error("Failed to delete vacation message:", err?.message ?? err);
      }
    }

    await teamDB.updateOne({ userID: data.userID }, { $unset: { urlaub: "" } });
  }

  await serverDB.updateMany(
    { guildID: GUILD_ID },
    { $pull: { meetings: { date: { $lt: now } } } },
  );
  log.info(`Cleanup: ${expiredUrlaubs.length} vacation(s) removed, past meetings pruned`);
}

export async function rescheduleMeetingTasks(client) {
  const servers = await serverDB.find({ "meetings.date": { $gte: new Date() } });
  let count = 0;

  for (const server of servers) {
    for (const m of server.meetings) {
      const meetingDateUTC = new Date(m.date);
      if (meetingDateUTC < new Date()) {continue;}

      const reminderDate = new Date(meetingDateUTC.getTime() - 10 * 60000);
      const deleteDate = new Date(meetingDateUTC.getTime() + 60000);
      count += 1;

      const findMeeting = async () => {
        const current = await serverDB.findOne({ "meetings.date": meetingDateUTC });
        return current?.meetings.find((x) => new Date(x.date).getTime() === meetingDateUTC.getTime());
      };

      schedule.scheduleJob(reminderDate, async () => {
        try {
          const meeting = await findMeeting();
          if (!meeting) {return;}

          for (const userId of meeting.reminders) {
            try {
              const user = await client.users.fetch(userId);
              await user.send(`> \`📣\` » Erinnerung: Das Meeting beginnt in **10 Minuten**.\nDatum: ${meetingDateUTC}`);
            } catch (error) {
              log.error(`Reminder DM to ${userId} failed:`, error?.message ?? error);
            }
          }
        } catch (error) {
          log.error("Meeting reminder failed:", error);
        }
      });

      schedule.scheduleJob(deleteDate, async () => {
        try {
          const meeting = await findMeeting();
          if (!meeting?.messageID) {return;}

          const channel = await client.channels.fetch(settings.get("channels.team"));
          const message = await channel?.messages.fetch(meeting.messageID).catch(() => null);
          await message?.delete();
        } catch (error) {
          log.error("Meeting message cleanup failed:", error);
        }
      });
    }
  }

  log.info(`${count} meeting task(s) scheduled`);
}

export async function handleMeetingButton(interaction, action) {
  const userId = interaction.user.id;

  const dateMatch = interaction.message.embeds[0]?.description?.match(/Datum:\s*(.*)\n/);
  if (!dateMatch) {
    await interaction.reply({ content: "> `❌` » Meeting-Datum konnte nicht extrahiert werden.", ephemeral: true });
    return;
  }

  const meetingDate = new Date(dateMatch[1]);
  const server = await serverDB.findOne({ "meetings.date": meetingDate });
  if (!server) {
    await interaction.reply({ content: "> `❌` » Meeting nicht gefunden.", ephemeral: true });
    return;
  }

  const isAttending = server.meetings.some((m) => m.attendees.includes(userId));
  const isNonAttending = server.meetings.some((m) => m.nonAttendees.includes(userId));
  const isReminderSet = server.meetings.some((m) => m.reminders.includes(userId));

  switch (action) {
    case "remindMe":
      if (isReminderSet) {
        await serverDB.updateOne({ "meetings.date": meetingDate }, { $pull: { "meetings.$.reminders": userId } });
        await interaction.reply({ content: "> `🔕` » Deine Erinnerung an das Meeting wurde deaktiviert.", ephemeral: true });
      } else {
        await serverDB.updateOne({ "meetings.date": meetingDate }, { $addToSet: { "meetings.$.reminders": userId } });
        await interaction.reply({ content: "> `🔔` » Du wirst 10 Minuten vor dem Meeting erinnert.", ephemeral: true });
      }
      break;

    case "attend":
      if (isAttending) {
        await interaction.reply({ content: "> `⚠️` » Du hast bereits deine Teilnahme bestätigt.", ephemeral: true });
        break;
      }
      await serverDB.updateOne(
        { "meetings.date": meetingDate },
        { $addToSet: { "meetings.$.attendees": userId }, $pull: { "meetings.$.nonAttendees": userId } },
      );
      await interaction.reply({ content: "> `✅` » Du hast deine Teilnahme bestätigt.", ephemeral: true });
      break;

    case "decline":
      if (isNonAttending) {
        await interaction.reply({ content: "> `⚠️` » Du hast bereits deine Teilnahme abgelehnt.", ephemeral: true });
        break;
      }
      await serverDB.updateOne(
        { "meetings.date": meetingDate },
        { $addToSet: { "meetings.$.nonAttendees": userId }, $pull: { "meetings.$.attendees": userId } },
      );
      await interaction.reply({ content: "> `❌` » Du hast deine Teilnahme abgelehnt.", ephemeral: true });
      break;
  }
}
