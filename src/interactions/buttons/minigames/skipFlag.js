import { MessageFlags } from "discord.js";
import { skipFlag } from "#systems/flagQuiz.js";

export default {
  id: "skip_flag",

  async run(client, interaction) {
    await interaction.deferUpdate();
    const next = await skipFlag(interaction.channel);
    if (!next) {
      await interaction.followUp({ content: "> `❌` » Kein aktives Flaggenquiz.", flags: MessageFlags.Ephemeral });
    }
  },
};
