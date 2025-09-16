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
    const user = interaction.options.getUser("user");      // Discord-User (API)
    const member = interaction.options.getMember("user");  // GuildMember (Server)

    // DB nach Onlinezeit durchsuchen
    const userData = await userdb.findOne({ userId: user.id });

    if (!userData || typeof userData.onlineTime !== "Number") {
      return interaction.reply({
        content: `> \`📌\` Für ${user} wurde noch keine Onlinezeit gespeichert.`,
        ephemeral: true
      });
    }

    // Onlinezeit nur in Stunden (DB speichert Minuten)
    const hours = Math.floor(userData.onlineTime / 60);

    const displayName = member ? member.displayName : user.username;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${displayName} – Onlinezeit`,
        iconURL: user.displayAvatarURL()
      })
      .setDescription(`> \`🕒\` » Insgesamt **${hours} Stunden** online`)
      .setColor("Blurple");

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
