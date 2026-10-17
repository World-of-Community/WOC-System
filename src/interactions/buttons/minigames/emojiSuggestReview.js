import { EmbedBuilder, MessageFlags } from "discord.js";
import { reviewSuggestion } from "#systems/emojiQuiz.js";
import { UserError } from "#core/errors.js";

// customId: emojisuggest_<accept|deny>_<suggestionId>
export default {
  id: "emojisuggest_",
  prefix: true,

  async run(client, interaction) {
    const [, action, id] = interaction.customId.split("_");
    const accepted = action === "accept";

    let suggestion;
    try {
      suggestion = await reviewSuggestion(client, id, accepted, interaction.user.id);
    } catch (error) {
      throw new UserError(`> \`❌\` » ${error.message}`);
    }

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(accepted ? "Green" : "Red")
      .setFooter({ text: `${accepted ? "Angenommen" : "Abgelehnt"} von ${interaction.user.username}` });
    await interaction.update({ embeds: [embed], components: [] });

    if (!accepted) {return;}
    await interaction.followUp({ content: `> \`✅\` » **${suggestion.begriff}** ist jetzt im Rätsel-Pool.`, flags: MessageFlags.Ephemeral });
  },
};
