const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily-leaderboard')
    .setDescription('» Zeigt das Streak-Top 10 Leaderboard an. 🔥'),

  async execute(interaction) {
    const users = await Coin.find().sort({ streak: -1, coins: -1 }).limit(10);

    if (users.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Gold')
            .setTitle('`🏆` Top 10 Streak Leaderboard')
            .setDescription('`❌` » Es wurden keine Nutzerdaten gefunden.')
        ],
        ephemeral: true
      });
    }

    // Userdaten parallel fetchen
    const leaderboardLines = await Promise.all(users.map(async (u, i) => {
      const streak = u.streak || 0;
      const streakText = streak > 0 ? `**${streak}**x Streak` : '`0`x Streak';

      try {
        const user = await interaction.client.users.fetch(u.userId);
        return `\`#${i + 1}\` mit ${streakText} ist <@${u.userId}> (${user.tag})`;
      } catch {
        return `\`#${i + 1}\` mit ${streakText} ist <@${u.userId}> (\`➖\`)`;
      }
    }));

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('`🏆` Top 10 Daily-Streak Leaderboard')
      .setDescription(leaderboardLines.join('\n'))
      .setFooter({ text: `» ${interaction.guild.name} | Daily-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
