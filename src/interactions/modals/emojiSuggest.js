import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } from "discord.js";
import EmojiQuizSuggestion from "#models/EmojiQuizSuggestion.js";
import { settings } from "#core/settings.js";
import logger from "#core/logger.js";

export default {
  id: "emoji-suggest",

  async run(client, interaction) {
    const suggestion = await EmojiQuizSuggestion.create({
      userId: interaction.user.id,
      username: interaction.user.username,
      begriff: interaction.fields.getTextInputValue("begriff").trim(),
      emojis: interaction.fields.getTextInputValue("emojis").trim(),
      schwierigkeit: interaction.fields.getStringSelectValues("schwierigkeit")[0] ?? "mittel",
      tipp: interaction.fields.getTextInputValue("tipp").trim(),
    });

    const channel = await client.channels.fetch(settings.get("channels.emojiQuizSuggestions") ?? "0").catch(() => null);
    if (channel?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle("`💡` Neuer Emoji-Quiz Vorschlag")
        .setDescription(
          `Von ${interaction.user} (${interaction.user.username})\n\n` +
          `Begriff • **${suggestion.begriff}**\n` +
          `Emojis • ${suggestion.emojis}\n` +
          `Schwierigkeit • **${suggestion.schwierigkeit}**\n` +
          `Tipp • **${suggestion.tipp}**`,
        )
        .setColor("Orange")
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`emojisuggest_accept_${suggestion.id}`).setLabel("Annehmen").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`emojisuggest_deny_${suggestion.id}`).setLabel("Ablehnen").setStyle(ButtonStyle.Danger),
      );

      const message = await channel.send({ embeds: [embed], components: [row] });
      suggestion.messageId = message.id;
      await suggestion.save();
    } else {
      logger.warn("Emoji quiz suggestion stored, but channels.emojiQuizSuggestions is not set");
    }

    await interaction.reply({ content: "> `✅` » Danke! Dein Vorschlag wurde an das Team geschickt.", flags: MessageFlags.Ephemeral });
  },
};
