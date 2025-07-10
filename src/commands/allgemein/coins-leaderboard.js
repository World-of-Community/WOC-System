const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins-leaderboard')
    .setDescription('» Zeigt die Top 10 Nutzer mit den meisten Coins an. 🏆'),

  async execute(interaction) {
    // Wichtig: ephemeral direkt beim Defer setzen
    await interaction.deferReply({ ephemeral: true });

    const topCoins = await Coin.find().sort({ coins: -1 }).limit(10);

    if (!topCoins.length) {
      return interaction.editReply({ content: '> `❌` » Es sind noch keine Coins vorhanden.' });
    }

    let description = '';
    for (let i = 0; i < topCoins.length; i++) {
      const userId = topCoins[i].userId;
      const coins = topCoins[i].coins.toLocaleString('de-DE');

      let user;
      try {
        user = await interaction.client.users.fetch(userId);
      } catch {
        user = { username: 'Unbekannter Nutzer', tag: '❓', id: userId };
      }

      description += `\`#${i + 1}\` **${user.tag || user.username}** – **${coins} Coins**\n`;
    }

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle('🏆 Coin Leaderboard')
      .setDescription(description)
      .setColor('Gold')
      .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
