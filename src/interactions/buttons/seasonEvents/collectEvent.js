import { EmbedBuilder, MessageFlags } from "discord.js";
import { eventPeriods, isEventActive } from "#systems/seasonEvents.js";

export default {
  id: "collect_event",
  async run(client, interaction) {
    const activeEvent = Object.keys(eventPeriods).find((key) =>
      isEventActive(eventPeriods[key]),
    );

    const eventItemEmbed = new EmbedBuilder()
      .setDescription(activeEvent ? `**Du hast ein Item aus dem aktuellen Event (${activeEvent.toUpperCase()}-Event) eingesammelt!**` : "**Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!**")
      .setColor(activeEvent ? "Green" : "Red");

    await interaction.reply({ embeds: [eventItemEmbed], flags: MessageFlags.Ephemeral });

    if (activeEvent) {
      await interaction.followUp({ content: "> `✅` » Du hast erfolgreich ein Event-Item eingesammelt!", flags: MessageFlags.Ephemeral });
    }
  },
};
