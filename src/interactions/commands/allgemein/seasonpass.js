import { MessageFlags } from "discord.js";
import {
  PREMIUM_PLUS_PRICE,
  PREMIUM_PRICE,
  giftPremium,
} from "../../../systems/seasonPass.js";

export default {
  name: "seasonpass",
  description: "» Verschenke einen Premium-SeasonPass. 🎁",
  type: 1,
  options: [
    {
      type: 1,
      name: "verschenken",
      description: "» Schenke einem Nutzer den Premium-SeasonPass.",
      options: [
        {
          type: 6,
          name: "nutzer",
          description: "Wer soll den SeasonPass erhalten?",
          required: true,
        },
        {
          type: 3,
          name: "variante",
          description: "Welche Variante soll verschenkt werden?",
          required: true,
          choices: [
            { name: `Premium (${PREMIUM_PRICE.toLocaleString("de-DE")} Coins)`, value: "standard" },
            { name: `Premium + 10 Stufen (${PREMIUM_PLUS_PRICE.toLocaleString("de-DE")} Coins)`, value: "plus" },
          ],
        },
      ],
    },
  ],

  async run(_client, interaction) {
    const recipient = interaction.options.getUser("nutzer");
    const tier = interaction.options.getString("variante");
    const { roleAssigned } = await giftPremium(
      interaction.user.id,
      recipient.id,
      tier,
      interaction.guild,
    );

    await interaction.reply({
      content:
        `> \`✅\` » Du hast ${recipient} den **SeasonPass${tier === "plus" ? " + 10 Stufen" : ""}** geschenkt.` +
        `${roleAssigned ? "" : " Die SeasonPass-Rolle konnte nicht vergeben werden."}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
