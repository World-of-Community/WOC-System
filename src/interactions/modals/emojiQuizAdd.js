import { MessageFlags } from "discord.js";
import { addEntry, DIFFICULTIES } from "#systems/emojiQuiz.js";
import { UserError } from "#core/errors.js";

export default {
  id: "emoji-quiz-add",

  async run(client, interaction) {
    const field = (name) => interaction.fields.getTextInputValue(name);
    const schwierigkeit = (field("schwierigkeit") || "mittel").trim().toLowerCase();
    if (!DIFFICULTIES.includes(schwierigkeit)) {
      throw new UserError(`> \`❌\` » Schwierigkeit muss \`${DIFFICULTIES.join("`, `")}\` sein.`);
    }

    let entry;
    try {
      entry = await addEntry({
        emojis: field("emojis"),
        begriff: field("begriff"),
        tipp: field("tipp"),
        schwierigkeit,
        aliases: field("aliases").split(",").map((a) => a.trim()).filter(Boolean),
      }, interaction.user.id);
    } catch (error) {
      throw new UserError(`> \`❌\` » ${error.message}`);
    }

    await interaction.reply({
      content: `> \`✅\` » Rätsel hinzugefügt: ${entry.emojis} → **${entry.begriff}** (${entry.schwierigkeit})` +
        (entry.aliases.length ? `\n> \`🔁\` » Auch akzeptiert: ${entry.aliases.map((a) => `\`${a}\``).join(", ")}` : ""),
      flags: MessageFlags.Ephemeral,
    });
  },
};
