import { EmbedBuilder, MessageFlags } from "discord.js";
import { collectEventItem, getActiveEvent } from "#systems/seasonEvents.js";

export default {
  id: "collect_event",
  async run(client, interaction) {
    const activeEvent = getActiveEvent();
    const collected = activeEvent
      ? await collectEventItem(interaction.user.id, activeEvent)
      : null;

    const eventItemEmbed = new EmbedBuilder()
      .setDescription(collected
        ? `**Du hast ${collected.amount} Items aus dem aktuellen ${activeEvent.toUpperCase()}-Event eingesammelt!**\n\nGesamt: **${collected.total}**`
        : activeEvent
          ? "**Du hast heute bereits ein Item aus diesem Event eingesammelt.**"
          : "**Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!**")
      .setColor(collected ? "Green" : "Red");

    await interaction.reply({ embeds: [eventItemEmbed], flags: MessageFlags.Ephemeral });
  },
};
