const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily-leaderboard')
    .setDescription('» Zeigt das Streak-Top 10 Leaderboard an. 🔥'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Top 10 laden
    const topUsers = await Coin.find().sort({ streak: -1, coins: -1 }).limit(10);

    if (topUsers.length === 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('Gold')
            .setTitle('`🏆` Top 10 Daily-Streak Leaderboard')
            .setDescription('`❌` » Es wurden keine Nutzerdaten gefunden.')
        ]
      });
    }

    // Alle Nutzer laden für eigenen Rang
    const allUsers = await Coin.find().sort({ streak: -1, coins: -1 });
    const userId = interaction.user.id;
    const userIndex = allUsers.findIndex(entry => entry.userId === userId);
    const userRank = userIndex !== -1 ? userIndex + 1 : null;

    // Top 10 Einträge generieren
    const leaderboardLines = await Promise.all(topUsers.map(async (u, i) => {
      const streak = u.streak || 0;
      const streakText = `\`${streak}\`x Streak`; // Immer 0x Streak, auch wenn kein Wert
      try {
        const user = await interaction.client.users.fetch(u.userId);
        return `\`#${i + 1}\` mit ${streakText} ist <@${u.userId}> (${user.tag})`;
      } catch {
        return `\`#${i + 1}\` mit ${streakText} ist <@${u.userId}> (\`➖\`)`;
      }
    }));

    // Falls User nicht in Top 10 ist → anzeigen
    if (userRank && userRank > 10) {
      const userStreak = allUsers[userIndex].streak || 0;
      const streakText = `\`${userStreak}\`x Streak`; // Auch hier 0x Streak
      try {
        const user = await interaction.client.users.fetch(userId);
        leaderboardLines.push(`\n\nDein Rang: \`#${userRank}\` mit ${streakText} ist <@${userId}> (${user.tag})`);
      } catch {
        leaderboardLines.push(`\n\nDein Rang: \`#${userRank}\` mit ${streakText} ist <@${userId}> (\`➖\`)`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('`🏆` Top 10 Daily-Streak Leaderboard')
      .setDescription(leaderboardLines.join('\n'))
      .setFooter({ text: `» ${interaction.guild.name} | Daily-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
