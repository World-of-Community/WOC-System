import { EmbedBuilder } from "discord.js";
import eventItems from '../../models/eventItems.js';

export default {
  name: "weihnachtsbäume",
    description: "» Sammle täglich Weihnachtsbäume beim Weihnachts-Event! 🎄",
    type: 1,
    options: [],

  async run(client, interaction) {
    const userId = interaction.user.id;
    const eventType = 'christmas';

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
        content: '> `🎄` | Du hast heute bereits einen Weihnachtsbaum geschmückt! Komm morgen wieder.',
        ephemeral: true,
      });
    }

    const collected = Math.floor(Math.random() * 5) + 2;
    userData.amount += collected;
    userData.lastCollected = today;
    await userData.save();

    const embed = new EmbedBuilder()
      .setTitle('`🎄` Frohe Weihnachten!')
      .setDescription(`Du hast **${collected} Weihnachtsbäume** gesammelt! \`🎁\`\n\nInsgesamt hast du nun **${userData.amount} Bäume**.`)
      .setColor('Green');

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
