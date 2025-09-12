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
    const userIndex = allUsers.findIndex(entry => String(entry.userId) === String(userId));
    const userRank = userIndex !== -1 ? userIndex + 1 : null;

    // Top 10 Einträge generieren
    const leaderboardLines = await Promise.all(topUsers.map(async (u, i) => {
      const streak = u.streak || 0;
      const streakText = `\`${streak}\`x Streak`;

      // Platzierungssymbole
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

    // Eigenen Rang immer anzeigen
    if (userRank !== null) {
      const userStreak = allUsers[userIndex].streak || 0;
      const streakText = `\`${userStreak}\`x Streak`;

      // Platzsymbol für eigenen Rang (auch wenn nicht in Top 10)
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

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('`🏆` Top 10 Daily-Streak Leaderboard')
      .setDescription(leaderboardLines.join('\n'))
      .setFooter({ text: `» ${interaction.guild.name} | Daily-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
