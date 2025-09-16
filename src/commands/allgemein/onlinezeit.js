const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("onlinezeit")
    .setDescription("» Zeigt die Onlinezeit eines Nutzers an. 🕒")
    .addUserOption(option =>
      option
        .setName("nutzer")
        .setDescription("Der Nutzer, dessen Onlinezeit angezeigt werden soll")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser("nutzer") || interaction.user;

      // User-Daten abrufen
        const userData = await userdb.findOne({ userID: member.id }) || {
          giveaway: { eventWins: 0, messages: 0, voiceTime: 0 },
          invites: { joins: 0, left: 0, bonus: 0 },
          onlineTime: 0,
          lastOnline: null
        };

      // Onlinezeit (Millisekunden → Stunden)
      const displayHours = Math.floor((userData.onlineTime || 0) / 3600000);

      const embed = new EmbedBuilder()
        .setAuthor({ name: targetUser.username, iconURL: targetUser.displayAvatarURL() })
        .setDescription(`**Onlinezeit:** \`${displayHours}h\``)
        .setColor("Blurple")
        .setFooter({ text: "Gesamte erfasste Zeit" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("/onlinezeit Fehler:", error);
      await interaction.reply({
        content: "> `❌` » Es gab einen Fehler beim Abrufen der Onlinezeit.",
        ephemeral: true,
      });
    }
  },
};
