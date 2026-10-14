import { MessageFlags } from "discord.js";
import Meeting from "#models/Meeting.js";

export default {
  id: "meeting_leave",
  async run(client, interaction) {
    const meeting = await Meeting.findOne({ guildId: interaction.guildId, messageId: interaction.message.id });
    if (!meeting) {return interaction.reply({ content: "> `❌` » Kein Meeting gefunden.", flags: MessageFlags.Ephemeral });}

    const userId = interaction.user.id;

    const dateObj = new Date(meeting.time);
    if (isNaN(dateObj.getTime())) {
      return interaction.reply({ content: "> `❌` » Ungültiges Meeting-Datum.", flags: MessageFlags.Ephemeral });
    }

    if (!meeting.nonParticipants.includes(userId)) {meeting.nonParticipants.push(userId);}
    meeting.participants = meeting.participants.filter(id => id !== userId);

    await meeting.save();

    const unixTimestamp = Math.floor(dateObj.getTime() / 1000);
    return interaction.reply({
      content: `> \`❌\` » Du nimmst nun nicht mehr am Team-Meeting teil,\n> welches am <t:${unixTimestamp}:F> stattfindet.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
