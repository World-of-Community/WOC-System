const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Coin } = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily-leaderboard")
    .setDescription("» Zeigt das Streak-Top 10 Leaderboard an. 🔥"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const now = new Date();

      // Alle Nutzer laden
      let allUsers = await Coin.find();

      // Entferne User, die nicht mehr auf dem Server sind
      for (const u of allUsers) {
        const member = await interaction.guild.members.fetch(u.userId).catch(() => null);
        if (!member) {
          await Coin.deleteOne({ userId: u.userId });
        }
      }

      // Aktualisiere die Liste nach Entfernen inaktive Mitglieder
      allUsers = await Coin.find();

      // Streaks zurücksetzen, wenn Daily verpasst wurde
      for (const u of allUsers) {
        if (!u.lastDaily) {continue;}
        const diffDays = Math.floor((now - new Date(u.lastDaily)) / (1000*60*60*24));
        if (diffDays >= 2) {
          u.streak = 0;
          await u.save();
        }
      }

      // Nach Streak sortieren und Top 10 nehmen
      const sortedUsers = allUsers.sort((a, b) => b.streak - a.streak || b.coins - a.coins);
      const topUsers = sortedUsers.slice(0, 10);

      if (topUsers.length === 0) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setColor("Gold")
            .setTitle("`🏆` Top 10 Daily-Streak Leaderboard")
            .setDescription("`❌` » Es wurden keine Nutzerdaten gefunden."),
          ],
        });
      }

      // Leaderboard bauen
      const leaderboardLines = topUsers.map((u, i) => {
        const streakText = `\`${u.streak || 0}x\` Streak`;
        const placeIcon = ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;
        const userTag = interaction.client.users.cache.get(u.userId)?.tag || "➖";
        return `\`${placeIcon}\` mit ${streakText} ist <@${u.userId}> (${userTag})`;
      });

      // Rang des Interaktierenden
      const userIndex = sortedUsers.findIndex(u => u.userId === interaction.user.id);
      if (userIndex !== -1) {
        const userStreak = sortedUsers[userIndex].streak || 0;
        const placeIcon = ["🥇", "🥈", "🥉"][userIndex] || `#${userIndex + 1}`;
        leaderboardLines.push(`\nDein Rang: \`${placeIcon}\` mit \`${userStreak}x\` Streak ist <@${interaction.user.id}> (${interaction.user.tag})`);
      } else {
        leaderboardLines.push("\n> `❗` » Du bist aktuell nicht im Leaderboard vertreten.");
      }

      const totalStreaks = sortedUsers.reduce((acc, u) => acc + (u.streak || 0), 0);
      leaderboardLines.push(`\n\`📅\` » Insgesamt **${totalStreaks.toLocaleString("de-DE")} Tage** hintereinander aktiv`);

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("`🏆` Top 10 Daily-Streak Leaderboard")
        .setDescription(leaderboardLines.join("\n"))
        .setFooter({ text: `» ${interaction.guild.name} | Daily-System`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: "Es ist ein Fehler aufgetreten.", ephemeral: true });
    }
  },
};
