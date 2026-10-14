import { EmbedBuilder, MessageFlags } from "discord.js";
import { eventPeriods, isEventActive } from "#systems/seasonEvents.js";

export default {
  id: "halloween_event",
  async run(client, interaction) {
    const HalloweenEmbed = new EmbedBuilder()
      .setTitle("`🎃` Halloween Event `🎃`")
      .setDescription(isEventActive(eventPeriods.halloween) ? "**Das Halloween-Event ist aktiv! Viel Spaß beim Gruseln!**" : "**Dieses Event findet erst zwischen dem `15. Oktober` und dem `02. November` statt!**")
      .setColor("Orange");

    await interaction.reply({ embeds: [HalloweenEmbed], flags: MessageFlags.Ephemeral });
  },
};
