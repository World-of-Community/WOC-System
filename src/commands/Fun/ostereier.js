const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const eventItems = require("../../../Datenbank/eventitems");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ostereier")
    .setDescription("» Sammle täglich Ostereier beim Oster-Event! 🐣"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const eventType = "easter";

    let userData = await eventItems.findOne({ userId, eventType });
    if (!userData) {
      userData = new eventItems({ userId, eventType });
    }

    const today = new Date();
    const lastCollected = userData.lastCollected || new Date(0);
    const sameDay =
      lastCollected.getDate() === today.getDate() &&
      lastCollected.getMonth() === today.getMonth() &&
      lastCollected.getFullYear() === today.getFullYear();

    if (sameDay) {
      return interaction.reply({
        content: "> `🐇` | Du hast heute bereits Alle Ostereier gesammelt! Komm morgen wieder.",
        ephemeral: true,
      });
    }

    const collected = Math.floor(Math.random() * 8) + 3;
    userData.amount += collected;
    userData.lastCollected = today;
    await userData.save();

    const embed = new EmbedBuilder()
      .setTitle("`🐣` Ostereiersuche!")
      .setDescription(`Du hast **${collected} Ostereier** gefunden! \`🥚\`\n\nInsgesamt hast du nun **${userData.amount} Ostereier**.`)
      .setColor("Green");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
