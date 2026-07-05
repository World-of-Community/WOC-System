import { EmbedBuilder } from "discord.js";
import { Coin } from "../../models/coindb.js";
import userDB from "../../models/userdb.js";

export default {
  name: "leaderboard",
  description: "Zeigt dir die besten User in verschiedenen Kategorien an.",
  type: 1,
  options: [
    {
      "type": 3,
      "choices": [
        {
          "name": "Coins",
          "value": "coins",
        },
        {
          "name": "Daily",
          "value": "daily",
        },
        {
          "name": "Spenden",
          "value": "spenden",
        },
      ],
      "name": "kategorie",
      "description": "Wähle eine Kategorie",
      "required": true,
    },
  ],

  async run(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const category = interaction.options.getString("kategorie");

    let data = [];
    let title = "";
    let formatValue;
    let totalText = "";

    // 🔹 COINS
    if (category === "coins") {
      data = await Coin.find().sort({ coins: -1 });

      formatValue = (u) => `${u.coins.toLocaleString("de-DE")} Coins`;
      title = "`🏆` Top 10 Coins Leaderboard";

      const total = data.reduce((acc, u) => acc + (u.coins || 0), 0);
      totalText = `\n\n\`👥\` » Insgesamt: **${total.toLocaleString("de-DE")} Coins**`;
    }

    // 🔹 DAILY
    if (category === "daily") {
      const now = new Date();
      data = await Coin.find();

      for (const u of data) {
        if (!u.lastDaily) {continue;}
        const diffDays = Math.floor((now - new Date(u.lastDaily)) / (1000*60*60*24));
        if (diffDays >= 2) {
          u.streak = 0;
          await u.save();
        }
      }

      data.sort((a, b) => b.streak - a.streak || b.coins - a.coins);

      formatValue = (u) => `${u.streak || 0}x Streak`;
      title = "`🏆` Top 10 Daily-Streak Leaderboard";

      const total = data.reduce((acc, u) => acc + (u.streak || 0), 0);
      totalText = `\n\n\`📅\` » Insgesamt **${total.toLocaleString("de-DE")} Tage** aktiv`;
    }

    // 🔹 SPENDEN
    if (category === "spenden") {
      data = await userDB.find({ donation: { $gt: 0 } })
        .sort({ donation: -1 });

      formatValue = (u) => `${u.donation.toLocaleString("de-DE")}€`;
      title = "`💸` Top 10 Spenden Leaderboard";

      const total = data.reduce((acc, u) => acc + (u.donation || 0), 0);
      totalText = `\n\n\`💖\` » Insgesamt: **${total.toLocaleString("de-DE")}€** gespendet`;
    }

    if (!data.length) {
      return interaction.editReply({ content: "> `❌` » Keine Daten vorhanden." });
    }

    const top10 = data.slice(0, 10);

    let description = "";

    for (let i = 0; i < top10.length; i++) {
      const entry = top10[i];

      let place = `#${i + 1}`;
      if (i === 0) {place = "🥇";}
      else if (i === 1) {place = "🥈";}
      else if (i === 2) {place = "🥉";}

      const value = formatValue(entry);

      description += `\`${place}\` mit **${value}** ist <@${entry.userId || entry.userID}>\n`;
    }

    // 🔹 Eigener Rang
    const userId = interaction.user.id;
    const index = data.findIndex(u => (u.userId || u.userID) == userId);

    if (index !== -1) {
      const entry = data[index];
      const value = formatValue(entry);

      let place = `#${index + 1}`;
      if (index === 0) {place = "🥇";}
      else if (index === 1) {place = "🥈";}
      else if (index === 2) {place = "🥉";}

      description += `\nDein Rang: \`${place}\` mit **${value}** ist <@${userId}>`;
    } else {
      description += "\n> `❗` » Du bist nicht im Leaderboard.";
    }

    description += totalText;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("Gold")
      .setFooter({
        text: `» ${interaction.guild.name} | Leaderboard`,
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
