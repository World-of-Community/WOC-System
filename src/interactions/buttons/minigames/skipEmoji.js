import { MessageFlags } from "discord.js";
import { skipEmoji } from "#systems/emojiQuiz.js";

export default {
  id: "skip_emoji",

  async run(client, interaction) {
    await interaction.deferUpdate();
    const next = await skipEmoji(interaction.channel);
    if (!next) {
      await interaction.followUp({ content: "> `❌` » Kein aktives Emoji-Quiz.", flags: MessageFlags.Ephemeral });
    }
  },
};
