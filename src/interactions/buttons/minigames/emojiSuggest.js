import {
  LabelBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle,
} from "discord.js";
import { DIFFICULTIES } from "#systems/emojiQuiz.js";

export default {
  id: "emoji_suggest",

  async run(client, interaction) {
    const text = (id, label, placeholder, max) => new LabelBuilder()
      .setLabel(label)
      .setTextInputComponent(new TextInputBuilder().setCustomId(id).setStyle(TextInputStyle.Short).setPlaceholder(placeholder).setMaxLength(max).setRequired(true));

    const modal = new ModalBuilder()
      .setCustomId("emoji-suggest")
      .setTitle("Schlage einen neuen Begriff vor")
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("`❗` **Bitte beachte:** Unangebrachte Vorschläge werden kommentarlos entfernt und bestraft."))
      .addLabelComponents(
        text("begriff", "Der Begriff", "König der Löwen", 100),
        text("emojis", "Die Emojis", "🦁👑", 50),
        new LabelBuilder()
          .setLabel("Schwierigkeit")
          .setStringSelectMenuComponent(new StringSelectMenuBuilder()
            .setCustomId("schwierigkeit")
            .setPlaceholder("Triff eine Auswahl")
            .setRequired(true)
            .addOptions(DIFFICULTIES.map((d) => new StringSelectMenuOptionBuilder().setLabel(d.charAt(0).toUpperCase() + d.slice(1)).setValue(d)))),
        text("tipp", "Tipp", "Film", 60),
      );

    await interaction.showModal(modal);
  },
};
