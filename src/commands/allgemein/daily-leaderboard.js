const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');  // Coin Modell importieren

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily-leaderboard')
    .setDescription('» Zeigt das Coins-Top 10 Leaderboard an. 🪙'),

  async execute(interaction) {
    const users = await User.find().sort({ coins: -1 }).limit(10);

    if (users.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Gold')
            .setTitle('`🏆` Top 10 Coins Leaderboard')
            .setDescription('➖')
        ],
        ephemeral: true
      });
    }

    const leaderboard = users.map((u, i) => {
      const streakText = u.streak ? u.streak : '➖';
      return `\`#${i + 1}\` – <@${u.userId}> mit ${u.coins} Coins (Streak: ${streakText})`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('`🏆` Top 10 Coins Leaderboard')
      .setDescription(leaderboard);

    const reply = await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      reply.delete().catch(() => {});
    }, 30000);
  }
};
