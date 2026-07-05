import { EmbedBuilder } from "discord.js";
import Meeting from "../../models/meetingdb.js";

export default {
  id: "meeting_show",
  run: async (client, interaction) => {
    const meeting = await Meeting.findOne({ guildId: interaction.guildId, messageId: interaction.message.id });
    if (!meeting) {return interaction.reply({ content: "> `❌` Team-Meeting nicht gefunden.", ephemeral: true });}

    const now = new Date();
    const formattedDate = now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("de-DE", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const participants = meeting.participants.length
      ? meeting.participants.map(id => `\`✅\` <@${id}>`).join("\n")
      : "`❌` Keine Teilnehmer";

    const nonParticipants = meeting.nonParticipants.length
      ? meeting.nonParticipants.map(id => `\`🚫\` <@${id}>`).join("\n")
      : "`✅` Keine Abmeldungen";

    const embed = new EmbedBuilder()
      .setTitle(`\`📋\` Teilnehmerliste (${meeting.participants.length} Zusagen, ${meeting.nonParticipants.length} Absagen)`)
      .setDescription("Hier siehst du den aktuellen Stand der Zusagen und Absagen für das Meeting.")
      .addFields(
        { name: "`🟢` Teilnehmer", value: participants, inline: true },
        { name: "`🔴` Nicht teilnehmen", value: nonParticipants, inline: true },
      )
      .setColor("Orange")
      .setFooter({ text: `Stand: ${formattedDate} ${formattedTime}` })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
