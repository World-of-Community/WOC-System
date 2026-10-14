import giveawaydb from "#models/giveawaydb.js";
import { withParticipantCount } from "./giveawayEnter.js";

export default {
  id: "giveaway-leave-",
  prefix: true,

  async run(client, interaction) {
    const messageId = interaction.customId.replace("giveaway-leave-", "");

    const giveaway = await giveawaydb.findOne({ msgID: messageId });
    if (!giveaway) {
      await interaction.update({ content: "> `❌` » Das Gewinnspiel existiert nicht.", components: [] });
      return;
    }

    if (!giveaway.teilnehmer.includes(interaction.user.id)) {
      await interaction.update({ content: "> `❌` » Du nimmst nicht an diesem Gewinnspiel teil!", components: [] });
      return;
    }

    await giveawaydb.updateOne({ msgID: messageId }, { $pull: { teilnehmer: interaction.user.id } });

    const channel = await interaction.client.channels.fetch(giveaway.channelID).catch(() => null);
    const giveawayMessage = await channel?.messages.fetch(messageId).catch(() => null);
    if (giveawayMessage?.embeds[0]) {
      const previous = giveaway.teilnehmer.length;
      await giveawayMessage.edit({ embeds: [withParticipantCount(giveawayMessage.embeds[0], previous, previous - 1)] });
    }

    await interaction.update({ content: "> `✅` » Du hast erfolgreich das Gewinnspiel verlassen!", components: [] });
  },
};
