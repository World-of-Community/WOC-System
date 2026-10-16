import { EmbedBuilder, MessageFlags } from "discord.js";
import EmojiQuizSuggestion from "#models/EmojiQuizSuggestion.js";
import { addEntry } from "#systems/emojiQuiz.js";
import { UserError } from "#core/errors.js";

// customId: emojisuggest_<accept|deny>_<suggestionId>
export default {
  id: "emojisuggest_",
  prefix: true,

  async run(client, interaction) {
    const [, action, id] = interaction.customId.split("_");
    const suggestion = await EmojiQuizSuggestion.findById(id).catch(() => null);
    if (!suggestion) {throw new UserError("> `❌` » Vorschlag nicht gefunden.");}
    if (suggestion.status !== "offen") {throw new UserError(`> \`❌\` » Vorschlag wurde bereits ${suggestion.status}.`);}

    const accepted = action === "accept";
    if (accepted) {
      try {
        await addEntry(suggestion, interaction.user.id);
      } catch (error) {
        throw new UserError(`> \`❌\` » ${error.message}`);
      }
    }

    suggestion.status = accepted ? "angenommen" : "abgelehnt";
    suggestion.reviewedBy = interaction.user.id;
    await suggestion.save();

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(accepted ? "Green" : "Red")
      .setFooter({ text: `${accepted ? "Angenommen" : "Abgelehnt"} von ${interaction.user.username}` });
    await interaction.update({ embeds: [embed], components: [] });

    const user = await client.users.fetch(suggestion.userId).catch(() => null);
    await user?.send(
      accepted
        ? `> \`✅\` » Dein Emoji-Quiz Vorschlag **${suggestion.begriff}** ${suggestion.emojis} wurde angenommen!`
        : `> \`❌\` » Dein Emoji-Quiz Vorschlag **${suggestion.begriff}** wurde leider abgelehnt.`,
    ).catch(() => {});

    if (!accepted) {return;}
    await interaction.followUp({ content: `> \`✅\` » **${suggestion.begriff}** ist jetzt im Rätsel-Pool.`, flags: MessageFlags.Ephemeral });
  },
};
