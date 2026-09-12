/*
import { EmbedBuilder } from "discord.js";
import { Coin } from "../../models/coindb.js";
import userDB from "../../models/userdb.js";

export default {
  name: "leaderboard",
  description: "» Zeigt dir die besten User in verschiedenen Kategorien an. 🏆",
  type: 1,
  options: [
    {
      "type": 3,
      "choices": [
        {
          "name": "🪙 - Coins",
          "value": "coins",
        },
        {
          "name": "📅 - Daily",
          "value": "daily",
        },
        {
          "name": "💰 - Spenden",
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
      title = "`🪙` Top 10 Leaderboard (Coins)";

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
      title = "`📅` Top 10 Leaderboard (Daily-Streak)";

      const total = data.reduce((acc, u) => acc + (u.streak || 0), 0);
      totalText = `\n\n\`📅\` » Insgesamt **${total.toLocaleString("de-DE")} Tage** aktiv`;
    }

    // 🔹 SPENDEN
    if (category === "spenden") {
      data = await userDB.find({ donation: { $gt: 0 } })
        .sort({ donation: -1 });

      formatValue = (u) => `${u.donation.toLocaleString("de-DE")}€`;
      title = "`💸` Top 10 Leaderboard (Spenden)";

      const total = data.reduce((acc, u) => acc + (u.donation || 0), 0);
      totalText = `\n\n\`💰\` » Insgesamt: **${total.toLocaleString("de-DE")}€** gespendet\n\`💖\` » Wir danken jedem einzelnen für die Spende!`;
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
    const index = data.findIndex(u => String(u.userId || u.userID) === String(userId));

    if (index !== -1) {
      const entry = data[index];
      const value = formatValue(entry);

      let place = `#${index + 1}`;
      if (index === 0) {place = "🥇";}
      else if (index === 1) {place = "🥈";}
      else if (index === 2) {place = "🥉";}

      description += `\n\`👤\` » Du belegst Platz \`${place}\` mit **${value}**`;
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
*/

// test

import { EmbedBuilder } from "discord.js";
import { Coin } from "../../models/coindb.js";
import userDB from "../../models/userdb.js";

export default {
  name: "leaderboard",
  description: "» Zeigt dir die besten User in verschiedenen Kategorien an. 🏆",
  type: 1,

  options: [
    {
      type: 3,
      choices: [
        {
          name: "🪙 - Coins",
          value: "coins",
        },
        {
          name: "📅 - Daily",
          value: "daily",
        },
        {
          name: "💰 - Spenden",
          value: "spenden",
        },
      ],
      name: "kategorie",
      description: "Wähle eine Kategorie",
      required: true,
    },
  ],

  async run(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const category = interaction.options.getString("kategorie");

    let data = [];
    let title = "";
    let formatValue;
    let totalText = "";

    // ============================================================
    // RÄNGE
    // ============================================================

    const getRank = (index) => {
      const rank = index + 1;

      switch (rank) {
        case 1:
          return "🥇";
        case 2:
          return "🥈";
        case 3:
          return "🥉";
        case 4:
          return "4️⃣";
        case 5:
          return "5️⃣";
        case 6:
          return "6️⃣";
        case 7:
          return "7️⃣";
        case 8:
          return "8️⃣";
        case 9:
          return "9️⃣";
        case 10:
          return "🔟";
        default:
          return `#${rank}`;
      }
    };

    // ============================================================
    // COINS
    // ============================================================

    if (category === "coins") {
      data = await Coin.find().sort({ coins: -1 });

      formatValue = (u) =>
        `${(u.coins || 0).toLocaleString("de-DE")} Coins`;

      title = "`🪙` Top 10 Leaderboard (Coins)";

      const total = data.reduce((acc, u) => acc + (u.coins || 0), 0);

      totalText = `\n\n\`👥\` » Insgesamt: **${total.toLocaleString("de-DE")} Coins**`;
    }

    // ============================================================
    // DAILY
    // ============================================================

    if (category === "daily") {
      const now = new Date();

      data = await Coin.find();

      for (const u of data) {
        if (!u.lastDaily) {
          continue;
        }

        const diffDays = Math.floor((now - new Date(u.lastDaily)) / (1000 * 60 * 60 * 24));

        if (diffDays >= 2) {
          u.streak = 0;
          await u.save();
        }
      }

      data.sort(
        (a, b) =>
          (b.streak || 0) - (a.streak || 0) ||
          (b.coins || 0) - (a.coins || 0)
      );

      formatValue = (u) => `${u.streak || 0}x Streak`;

      title = "`📅` Top 10 Leaderboard (Daily-Streak)";

      const total = data.reduce((acc, u) => acc + (u.streak || 0), 0);

      totalText = `\n\n\`📅\` » Insgesamt **${total.toLocaleString("de-DE")} Tage** aktiv`;
    }

    // ============================================================
    // SPENDEN
    // ============================================================

    if (category === "spenden") {
      data = await userDB
        .find({ donation: { $gt: 0 } })
        .sort({ donation: -1 });

      formatValue = (u) =>
        `${(u.donation || 0).toLocaleString("de-DE")}€`;

      title = "`💸` Top 10 Leaderboard (Spenden)";

      const total = data.reduce(
        (acc, u) => acc + (u.donation || 0),
        0
      );

      totalText = `\n\n\`💰\` » Insgesamt: **${total.toLocaleString("de-DE")}€** gespendet\n` +
        `\`💖\` » Wir danken jedem einzelnen für die Spende!`;
    }

    // ============================================================
    // KEINE DATEN
    // ============================================================

    if (!data.length) {
      return interaction.editReply({ content: "> `❌` » Keine Daten vorhanden."});
    }

    // ============================================================
    // TOP 10
    // ============================================================

    const top10 = data.slice(0, 10);

    let description = "";

    for (let i = 0; i < top10.length; i++) {
      const entry = top10[i];

      // Leerzeile zwischen Platz 3 und 4
      if (i === 3) {
        description += "\n";
      }

      const rank = getRank(i);
      const value = formatValue(entry);
      const userId = entry.userId || entry.userID;

      description +=
        `\`${rank}\` **<@${userId}>** mit **${value}**\n`;
    }

    // ============================================================
    // EIGENER RANG
    // ============================================================

    const userId = interaction.user.id;

    const index = data.findIndex((u) => String(u.userId || u.userID) === String(userId));

    if (index !== -1) {
      const entry = data[index];
      const value = formatValue(entry);
      const rank = getRank(index);

      description +=
        `\n\`👤\` » Du belegst Platz \`${rank}\` mit **${value}**!`;
    } else {
      description +=
        "\n> `❗` » Du bist nicht im Leaderboard.";
    }

    // ============================================================
    // GESAMT
    // ============================================================

    description += totalText;

    // ============================================================
    // EMBED
    // ============================================================

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("Gold")
      .setFooter({
        text: `» ${interaction.guild.name} | Leaderboard`,
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
