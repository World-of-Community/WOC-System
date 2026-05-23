import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import eventItems from '../../../Datenbank/eventItems.js';

export default {
  data: new SlashCommandBuilder()
    .setName('weihnachtsbäume')
    .setDescription('» Sammle täglich Weihnachtsbäume beim Weihnachts-Event! 🎄'),

  async execute(interaction) {
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
