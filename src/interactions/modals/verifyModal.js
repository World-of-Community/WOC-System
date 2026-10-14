
export default {
  // Die Modal-ID enthält den Verifizierungscode: verify-modal_<code>
  // (gesetzt in buttons/rules/verifizieren.js)
  id: "verify-modal",
  prefix: true,
  async run(client, interaction) {
    const verifyNumber = interaction.customId.split("_")[1];
    const input = interaction.fields.getTextInputValue("verifyInput");

    if (input !== verifyNumber) {
      return interaction.reply({ content: "> `❌` » Dieser Verifizierungscode war falsch, Bitte versuche es erneut.", ephemeral: true });
    }

    await interaction.member.roles.add(settings.get("roles.verify"));
    return interaction.reply({ content: `> \`✅\` » Die Verifizierung war **erfolgreich**, du hast die <@&${settings.get("roles.verify")}>-Rolle bekommen. Viel Spaß auf dem Server.`, ephemeral: true });
  },
};

import { settings } from "#core/settings.js";
