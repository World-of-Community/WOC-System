import { MessageFlags } from "discord.js";
import logger from "./logger.js";

// Replies regardless of interaction state (fresh / deferred / already replied). Never throws.
export async function safeReply(interaction, payload) {
  if (!interaction || typeof interaction.isRepliable !== "function" || !interaction.isRepliable()) {
    return false;
  }

  try {
    if (interaction.deferred && !interaction.replied) {
      await interaction.editReply(payload);
    } else if (interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
    return true;
  } catch (error) {
    logger.debug("safeReply failed:", error?.message ?? error);
    return false;
  }
}

export function replyError(interaction, content) {
  return safeReply(interaction, { content, flags: MessageFlags.Ephemeral });
}
