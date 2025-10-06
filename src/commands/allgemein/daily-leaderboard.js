const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily-leaderboard')
    .setDescription('» Zeigt das Streak-Top 10 Leaderboard an. 🔥'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const now = new Date();

    // Alle Nutzer laden
    const allUsers = await Coin.find();

    // Streaks zurücksetzen, wenn Daily verpasst wurde
    await Promise.all(allUsers.map(async (u) => {
      if (!u.lastDaily) return; // kein Daily bisher

      const lastDaily = new Date(u.lastDaily);
      const diffTime = now - lastDaily;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 2) { // Nutzer hat Daily verpasst (nicht gestern)
        u.streak = 0;
        await u.save();
      }
    }));

    // Top 10 laden (nach aktualisiertem Streak sortieren)
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

    // Nach Streak sortieren
    const sortedUsers = await Coin.find().sort({ streak: -1, coins: -1 });
    const totalStreaks = sortedUsers.reduce((acc, u) => acc + (u.streak || 0), 0);
    const totalStreaksFormatted = totalStreaks.toLocaleString("de-DE");

    const userId = interaction.user.id;
    const userIndex = sortedUsers.findIndex(entry => String(entry.userId) === String(userId));
    const userRank = userIndex !== -1 ? userIndex + 1 : null;

    const leaderboardLines = await Promise.all(topUsers.map(async (u, i) => {
      const streak = u.streak || 0;
      const streakText = `\`${streak}x\` Streak`;

      let placeIcon = `#${i + 1}`;
      if (i === 0) placeIcon = "🥇";
      else if (i === 1) placeIcon = "🥈";
      else if (i === 2) placeIcon = "🥉";

      try {
        const user = await interaction.client.users.fetch(u.userId);
        return `\`${placeIcon}\` mit ${streakText} ist <@${u.userId}> (${user.tag})`;
      } catch {
        return `\`${placeIcon}\` mit ${streakText} ist <@${u.userId}> (\`➖\`)`;
      }
    }));

    if (userRank !== null) {
      const userStreak = sortedUsers[userIndex].streak || 0;
      const streakText = `\`${userStreak}x\` Streak`;

      let placeIcon = `#${userRank}`;
      if (userRank === 1) placeIcon = "🥇";
      else if (userRank === 2) placeIcon = "🥈";
      else if (userRank === 3) placeIcon = "🥉";

      try {
        const user = await interaction.client.users.fetch(userId);
        leaderboardLines.push(`\nDein Rang: \`${placeIcon}\` mit ${streakText} ist <@${userId}> (${user.tag})`);
      } catch {
        leaderboardLines.push(`\nDein Rang: \`${placeIcon}\` mit ${streakText} ist <@${userId}> (\`➖\`)`);
      }
    } else {
      leaderboardLines.push(`\n> \`❗\` » Du bist aktuell nicht im Leaderboard vertreten.`);
    }

    leaderboardLines.push(`\n\`📅\` » Insgesamt **${totalStreaksFormatted} Tage** hintereinander aktiv`);

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('`🏆` Top 10 Daily-Streak Leaderboard')
      .setDescription(leaderboardLines.join('\n'))
      .setFooter({ text: `» ${interaction.guild.name} | Daily-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
