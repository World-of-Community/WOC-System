import leaderboarddb from "#models/Leaderboard.js";
import { createLeaderboardMessage } from "#systems/leaderboard.js";

export default {
  name: "setup-leaderboard",
  description: "» Richtet das Leaderboard für Nachrichten und Sprachzeit ein. 📌",
  type: 1,
  default_member_permissions: "8",
  options: [],

  async run(client, interaction) {
    if(!interaction.guild) {return;}
    await interaction.deferReply({ ephemeral: true });

    const msgContent = await createLeaderboardMessage(interaction.guild);

    const message = await interaction.channel.send({ embeds: msgContent.embeds, fetchReply: true });

    let savedMessage = await leaderboarddb.findOne({ guildId: interaction.guild.id });
    if(!savedMessage) {
      savedMessage = await leaderboarddb.create({
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
        messageId: message.id,
      });
    } else {
      savedMessage.channelId = interaction.channel.id;
      savedMessage.messageId = message.id;
    }

    await savedMessage.save();

    interaction.editReply({ content: ":white_check_mark: Fertig!" });
  },
};
