import { EmbedBuilder, MessageFlags } from "discord.js";
import { randomUUID } from "node:crypto";
import { UserError } from "#core/errors.js";
import Creator from "../../database/models/Creator.js";
import CreatorRedemption from "../../database/models/CreatorRedemption.js";

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

    if (creator.userId === interaction.user.id) {
      throw new UserError("> `❌` » Du kannst deinen eigenen Creator-Code nicht einlösen.");
    }

    const alreadyUsed = await CreatorRedemption.findOne({ userId: interaction.user.id });
    if (alreadyUsed) {
      throw new UserError("> `❌` » Du hast bereits einen Creator-Code eingelöst.");
    }

    await CreatorRedemption.create({
      _id: randomUUID(),
      userId: interaction.user.id,
      code: creator.code,
      creatorId: creator._id,
    });
    await Creator.findByIdAndUpdate(creator._id, { $inc: { uses: 1 } });

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
