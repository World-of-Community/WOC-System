import config from "../json/config.json" with { type: "json" };

export default {
  // Die Modal-ID enthält den Verifizierungscode: verify-modal_<code>
  // (gesetzt in buttons/rules/verifizieren.js)
  id: "verify-modal",
  prefix: true,
  run: async (client, interaction) => {
    const verifyNumber = interaction.customId.split("_")[1];
    const input = interaction.fields.getTextInputValue("verifyInput");

    if (input !== verifyNumber) {
      return interaction.reply({ content: "> `❌` » Dieser Verifizierungscode war falsch, Bitte versuche es erneut.", ephemeral: true });
    }

    await interaction.member.roles.add(config.verifyRolle);
    return interaction.reply({ content: `> \`✅\` » Die Verifizierung war **erfolgreich**, du hast die <@&${config.verifyRolle}>-Rolle bekommen. Viel Spaß auf dem Server.`, ephemeral: true });
  },
};
