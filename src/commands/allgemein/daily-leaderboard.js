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
      // Wenn keine Nutzer in DB sind
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

    // Leaderboard-String mit Erwähnung und Streak oder ➖
    const leaderboard = users.map((u, i) => {
      const streakText = u.streak ? u.streak : '➖';
      return `\`#${i + 1}\` – <@${u.userId}> mit ${u.coins} Coins (Streak: ${streakText})`;
    }).join('\n');

    // Embed erstellen
    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('`🏆` Top 10 Coins Leaderboard')
      .setDescription(leaderboard);

    // Antwort senden und nach 30 Sekunden löschen
    const reply = await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      reply.delete().catch(() => {});
    }, 30000);
  }
};
