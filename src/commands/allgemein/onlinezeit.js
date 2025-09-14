const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("onlinezeit")
    .setDescription("» Zeigt die Onlinezeit eines Nutzers an. 📊")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Wähle den Nutzer aus")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    // DB nach Onlinezeit durchsuchen
    const userData = await userdb.findOne({ userId: user.id });

    // Falls keine Daten existieren
    if (!userData || typeof userData.onlineTime !== "number") {
      return interaction.reply({
        content: `> \`📌\` Für ${user} wurde noch keine Onlinezeit gespeichert.`,
        ephemeral: true
      });
    }

    // Onlinezeit nur in Stunden
    const hours = Math.floor(userData.onlineTime / 60);

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${user.displayName} – Onlinezeit`, iconURL: user.displayAvatarURL() })
      .setDescription(`> \`🕒\` » Insgesamt **${hours} Stunden** online`)
      .setColor("Blurple");

    await interaction.reply({ embeds: [embed] });
  }
};
