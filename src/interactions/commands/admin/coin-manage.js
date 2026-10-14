import { MessageFlags } from "discord.js";
import { settings } from "#core/settings.js";

export default {
  name: "coin-manage",
  description: "» Verwalte die Generierung von Coins für den Coin-Generator. 🪙",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 4,
      name: "min",
      description: "Minimal generierte Coins pro Tick (z.B. 1)",
      required: true,
    },
    {
      type: 4,
      name: "max",
      description: "Maximal generierte Coins pro Tick (z.B. 5)",
      required: true,
    },
  ],

  async run(client, interaction) {
    const min = interaction.options.getInteger("min");
    const max = interaction.options.getInteger("max");

    // Validierung der Eingaben
    if (min < 0 || max < 1 || min > max) {
      return interaction.reply({
        content: "> `⛔` » Ungültige Eingaben. Bitte stelle sicher, dass `min ≥ 0`, `max ≥ 1` und `min ≤ max` ist.",
        flags: MessageFlags.Ephemeral,
      });
    }
    await settings.set("coins.min", min, interaction.user.id);
    await settings.set("coins.max", max, interaction.user.id);

    // Antwort
    await interaction.reply({
      content: `> \`✅\` » Der Coin-Generator wurde aktualisiert:\n> Es werden nun **zwischen ${min.toLocaleString("de-DE")} und ${max.toLocaleString("de-DE")} Coins** alle **3 Sekunden** generiert.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
