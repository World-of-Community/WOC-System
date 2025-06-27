const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');  // Coin Modell importieren

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily-leaderboard')
    .setDescription('» Zeigt das Coins-Top 10 Leaderboard an. 🪙'),

  async execute(interaction) {
    // Top 10 Nutzer nach Coins sortieren
    const users = await Coin.find().sort({ coins: -1 }).limit(10);

    if (users.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Gold')
            .setTitle('`🏆` Top 10 Coins Leaderboard')
            .setDescription('`❌` » Es wurden keine Nutzerdaten gefunden.')
        ],
        ephemeral: true
      });
    }

    // Leaderboard-Text zusammenbauen
    const leaderboard = users.map((u, i) => {
      const streak = u.streak || 0;
      const streakText = streak > 0 ? `${streak}x Streak` : '`➖`';
      return `\`#${i + 1}\` mit ${streakText} ist <@${u.userId}>`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('`🏆` Top 10 Coins Leaderboard')
      .setDescription(leaderboard)
      .setFooter({ text: 'Nachricht wird in 30 Sekunden gelöscht.' });

    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

    setTimeout(() => {
      reply.delete().catch(() => {});
    }, 30000);
  }
};
