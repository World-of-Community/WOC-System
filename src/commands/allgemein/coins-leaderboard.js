const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins-leaderboard')
    .setDescription('» Zeigt die Top 10 Nutzer mit den meisten Coins an. 🏆'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Top 10 laden
    const topCoins = await Coin.find().sort({ coins: -1 }).limit(10);

    if (!topCoins.length) {
      return interaction.editReply({ content: '> `❌` » Es sind noch keine Coins vorhanden.' });
    }

    // Alle User laden für eigenen Rang
    const allUsers = await Coin.find().sort({ coins: -1 });
    const userId = interaction.user.id;
    const userIndex = allUsers.findIndex(entry => String(entry.userId) === String(userId));
    const userRank = userIndex !== -1 ? userIndex + 1 : null;

    let description = '';
    for (let i = 0; i < topCoins.length; i++) {
      const entry = topCoins[i];
      const coins = entry.coins.toLocaleString('de-DE');
      try {
        const user = await interaction.client.users.fetch(entry.userId);
        description += `\`#${i + 1}\` mit **${coins} Coins** ist <@${entry.userId}> (${user.username})\n`;
      } catch {
        description += `\`#${i + 1}\` mit **${coins} Coins** ist <@${entry.userId}> (Unbekannt)\n`;
      }
    }

    // Falls User nicht in Top 10 ist → anzeigen
    if (userRank && userRank > 10) {
      const userCoins = allUsers[userIndex].coins.toLocaleString('de-DE');
      try {
        const user = await interaction.client.users.fetch(userId);
        description += `\n...\nDein Rang: \`#${userRank}\` mit **${userCoins} Coins** ist <@${userId}> (${user.username})`;
      } catch {
        description += `\n...\nDein Rang: \`#${userRank}\` mit **${userCoins} Coins** ist <@${userId}> (Unbekannt)`;
      }
    }

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle('`🏆` Top 10 Coins Leaderboard')
      .setDescription(description)
      .setColor('Gold')
      .setFooter({
        text: `» ${interaction.guild.name} | Coin-System`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
