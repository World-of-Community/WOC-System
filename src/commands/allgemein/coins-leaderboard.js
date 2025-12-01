const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Coin } = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coins-leaderboard")
    .setDescription("» Zeigt die Top 10 Nutzer mit den meisten Coins an. 🏆"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Top 10 laden
    const topCoins = await Coin.find().sort({ coins: -1 }).limit(10);

    if (!topCoins.length) {
      return interaction.editReply({ content: "> `❌` » Es sind noch keine Coins vorhanden." });
    }

    // Alle User laden für eigenen Rang + Gesamtsumme
    const allUsers = await Coin.find().sort({ coins: -1 });
    const totalCoins = allUsers.reduce((acc, u) => acc + (u.coins || 0), 0);
    const totalCoinsFormatted = totalCoins.toLocaleString("de-DE");

    const userId = interaction.user.id;
    const userIndex = allUsers.findIndex(entry => String(entry.userId) === String(userId));
    const userRank = userIndex !== -1 ? userIndex + 1 : null;

    let description = "";
    for (let i = 0; i < topCoins.length; i++) {
      const entry = topCoins[i];
      const coins = entry.coins.toLocaleString("de-DE");

      // Platz-Symbole setzen
      let placeIcon = `#${i + 1}`;
      if (i === 0) {placeIcon = "🥇";}
      else if (i === 1) {placeIcon = "🥈";}
      else if (i === 2) {placeIcon = "🥉";}

      try {
        const user = await interaction.client.users.fetch(entry.userId);
        description += `\`${placeIcon}\` mit **${coins} Coins** ist <@${entry.userId}> (${user.username})\n`;
      } catch {
        description += `\`${placeIcon}\` mit **${coins} Coins** ist <@${entry.userId}> (Unbekannt)\n`;
      }
    }

    // Eigenen Rang immer unten anzeigen
    if (userRank) {
      const userCoins = allUsers[userIndex].coins.toLocaleString("de-DE");

      // Platz-Symbol auch für eigenen Rang setzen
      let userPlaceIcon = `#${userRank}`;
      if (userRank === 1) {userPlaceIcon = "🥇";}
      else if (userRank === 2) {userPlaceIcon = "🥈";}
      else if (userRank === 3) {userPlaceIcon = "🥉";}

      try {
        const user = await interaction.client.users.fetch(userId);
        description += `\nDein Rang: \`${userPlaceIcon}\` mit **${userCoins} Coins** ist <@${userId}> (${user.username})`;
      } catch {
        description += `\nDein Rang: \`${userPlaceIcon}\` mit **${userCoins} Coins** ist <@${userId}> (Unbekannt)`;
      }
    }

    // Gesamtsumme in die Beschreibung anhängen
    description += `\n\n\`👥\` » Insgesamt: **${totalCoinsFormatted}** Coins`;

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle("`🏆` Top 10 Coins Leaderboard")
      .setDescription(description)
      .setColor("Gold")
      .setFooter({
        text: `» ${interaction.guild.name} | Coin-System`,
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
