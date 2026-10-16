import { MessageFlags } from "discord.js";
import { currentEntry } from "#systems/emojiQuiz.js";

export default {
  id: "emoji_hint",

  async run(client, interaction) {
    const entry = await currentEntry(interaction.channelId);
    if (!entry) {
      await interaction.reply({ content: "> `❌` » Gerade ist kein Rätsel aktiv.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.reply({
      content: `> \`🅰️\` » Der Begriff beginnt mit **${entry.begriff.charAt(0).toUpperCase()}** und hat **${entry.begriff.length}** Zeichen.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
