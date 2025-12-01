const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const eventItems = require("../../../Datenbank/eventitems");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("raketen")
    .setDescription("» Sammle täglich Raketen beim Silvester-Event! 🎆"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const eventType = "newyear";

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
        content: "> `🎆` | Du hast heute bereits Alle Raketen gesammelt! Komm morgen wieder.",
        ephemeral: true,
      });
    }

    const collected = Math.floor(Math.random() * 10) + 5;
    userData.amount += collected;
    userData.lastCollected = today;
    await userData.save();

    const embed = new EmbedBuilder()
      .setTitle("`🎇` Frohes neues Jahr!")
      .setDescription(`Du hast **${collected} Raketen** eingesammelt! \`🎆\`\n\nInsgesamt hast du nun **${userData.amount} Raketen**.`)
      .setColor("Blue");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
