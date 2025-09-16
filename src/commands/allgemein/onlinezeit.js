const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("onlinezeit")
    .setDescription("📊 Zeigt die Onlinezeit eines Nutzers an.")
    .addUserOption(option =>
      option
        .setName("nutzer")
        .setDescription("Der Nutzer, dessen Onlinezeit angezeigt werden soll")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser("nutzer") || interaction.user;

      // Nutzer in der DB suchen
      let userData = await userdb.findOne({ userId: targetUser.id });

      if (!userData) {
        // Falls noch nicht vorhanden → anlegen
        userData = await userdb.create({
          userId: targetUser.id,
          onlineTime: 0
        });
      }

      // Onlinezeit (in Stunden)
      const onlineHours = userData.onlineTime || 0;

      const embed = new EmbedBuilder()
        .setAuthor({ name: targetUser.username, iconURL: targetUser.displayAvatarURL() })
        .setDescription(`🕒 **Onlinezeit:** ${onlineHours}h`)
        .setColor("Blurple")
        .setFooter({ text: "Gesamte erfasste Zeit" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("/onlinezeit Fehler:", error);
      await interaction.reply({
        content: "❌ Es gab einen Fehler beim Abrufen der Onlinezeit.",
        ephemeral: true,
      });
    }
  },
};
