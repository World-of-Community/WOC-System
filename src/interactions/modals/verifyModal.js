import { MessageFlags } from "discord.js";

export default {
  // Die Modal-ID enthält den Verifizierungscode: verify-modal_<code>
  // (gesetzt in buttons/rules/verifizieren.js)
  id: "verify-modal",
  prefix: true,
  async run(client, interaction) {
    const verifyNumber = interaction.customId.split("_")[1];
    const input = interaction.fields.getTextInputValue("verifyInput");

    if (input !== verifyNumber) {
      return interaction.reply({ content: "> `❌` » Dieser Verifizierungscode war falsch, bitte versuche es erneut.", flags: MessageFlags.Ephemeral });
    }

    await interaction.member.roles.add(settings.get("roles.verify"));
    return interaction.reply({ content: `> \`✅\` » Die Verifizierung war **erfolgreich**, du hast die <@&${settings.get("roles.verify")}>-Rolle bekommen. Viel Spaß auf dem Server.`, flags: MessageFlags.Ephemeral });
  },
};

import { settings } from "#core/settings.js";
