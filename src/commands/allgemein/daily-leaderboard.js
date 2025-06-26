const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../../Datenbank/userdb'); // Passe den Pfad ggf. an

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily-leaderboard')
    .setDescription('» Zeigt das Coins-Top 10 Leaderboard an. 🪙'),

  async execute(interaction) {
    const users = await User.find().sort({ coins: -1 }).limit(10);

    const leaderboard = users.map((u, i) => {
      return `\`#${i + 1}\` – <@${u.userId}> mit ${u.coins} Coins (Streak: ${u.streak || 0})`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('🏆 Top 10 Coins Leaderboard')
      .setDescription(`${leaderboard || 'Noch keine Daten vorhanden.'}`);

    const reply = await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      reply.delete().catch(() => {});
    }, 30000);
  }
};
