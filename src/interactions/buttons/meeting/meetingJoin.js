import Meeting from "#models/Meeting.js";

export default {
  id: "meeting_join",
  async run(client, interaction) {
    const meeting = await Meeting.findOne({ guildId: interaction.guildId, messageId: interaction.message.id });
    if (!meeting) {return interaction.reply({ content: "> `❌` Team-Meeting nicht gefunden.", ephemeral: true });}

    const userId = interaction.user.id;

    if (!meeting.participants.includes(userId)) {meeting.participants.push(userId);}
    meeting.nonParticipants = meeting.nonParticipants.filter(id => id !== userId);
    await meeting.save();

    return interaction.reply({
      content: "> `✅` » Du nimmst nun am Team-Meeting teil.\n> `❗` » **Hinweis:** Bitte überprüfe, ob ich dir **Direktnachrichten** senden kann,\ndamit du die Erinnerung **10 Minuten** vorher erhältst.",
      ephemeral: true,
    });
  },
};
