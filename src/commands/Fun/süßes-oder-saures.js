import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import eventItems from '../../../Datenbank/eventItems.js';

export default {
  data: new SlashCommandBuilder()
    .setName('süßes-oder-saures')
    .setDescription('» Sammle täglich Kürbisse beim Halloween-Event! 🎃'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const eventType = 'halloween';

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
        content: '> `🎃` | Du hast heute bereits Alle Kürbisse gesammelt! Komm morgen wieder.',
        ephemeral: true,
      });
    }

    // 🎁 Zufällige Menge Kürbisse (z. B. 3–10)
    const collected = Math.floor(Math.random() * 8) + 3;
    userData.amount += collected;
    userData.lastCollected = today;
    await userData.save();

    const embed = new EmbedBuilder()
      .setTitle('`🎃` Süßes oder Saures!')
      .setDescription(`Du hast heute **${collected} Kürbisse** gesammelt! \`🎃\`\n\nInsgesamt hast du nun **${userData.amount} Kürbisse**.`)
      .setColor('Orange');

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
