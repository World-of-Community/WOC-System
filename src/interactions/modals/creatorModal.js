import { EmbedBuilder, MessageFlags } from "discord.js";
import mongoose from "mongoose";
import { UserError } from "#core/errors.js";

const Creator = mongoose.models.Creator || mongoose.model(
  "Creator",
  new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    userId: { type: String, required: true },
    active: { type: Boolean, default: true },
    bonus: { type: Number, default: 0 },
  }),
);

export default {
  id: "shoppass_creator_modal",

  async run(client, interaction) {
    const creatorName = interaction.fields.getTextInputValue("creator_name").trim();

    const creator = await Creator.findOne({
      code: { $regex: `^${creatorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      active: true,
    });

    if (!creator) {
      throw new UserError("> `❌` » Dieser Creator existiert nicht oder ist derzeit inaktiv.");
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 » CREATOR CODE")
      .setDescription(
        "> `✅` » Dein Creator-Code wurde erfolgreich aktiviert!\n\n" +
        `> **Creator:** ${creator.code}\n\n` +
        "Vielen Dank für deine Unterstützung!",
      )
      .setColor("Green")
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
