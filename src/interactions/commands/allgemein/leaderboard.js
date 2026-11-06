import { EmbedBuilder, MessageFlags } from "discord.js";
import { Coin } from "#models/Coin.js";
import userDB from "#models/User.js";
import SeasonPass from "../../../database/models/SeasonPass.js";

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
        {
          name: "🎟️ - SeasonPass-Stufe",
          value: "seasonpass",
        },
      ],
      name: "kategorie",
      description: "Wähle eine Kategorie",
      required: true,
    },
  ],

  async run(client, interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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
          (b.coins || 0) - (a.coins || 0),
      );

      formatValue = (u) =>
        `${u.streak || 0}x Streak`;

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

      const total = data.reduce((acc, u) => acc + (u.donation || 0), 0);

      totalText = `\n\n\`💰\` » Insgesamt: **${total.toLocaleString("de-DE")}€** gespendet\n` +
        "`💖` » Wir danken jedem einzelnen für die Spende!";
    }

    if (category === "seasonpass") {
      // 1. Hole die Top 10 Spieler sortiert nach XP
      const rawData = await SeasonPass
        .find({ xp: { $gt: 0 } })
        .sort({ xp: -1 })
        .limit(10);

      // 2. Berechne die Stufe live anhand der XP (150 XP pro Stufe)
      data = rawData.map(user => {
        // Da deine Anforderungen im Muster 150, 300, 450 (also Stufe * 150) steigen:
        const calculatedStage = Math.min(20, Math.floor(user.xp / 150));

        return {
          ...user.toObject(),
          calculatedLevel: calculatedStage
        };
      });

      // 3. Zeige die errechnete Stufe im Leaderboard an
      formatValue = (u) =>
        `${u.calculatedLevel} Stufe (${u.xp.toLocaleString("de-DE")} XP)`;

      title = "`🎟️` Top 10 Leaderboard (SeasonPass-Stufe)";

      // 4. Gesamte Level der Top 10 addieren
      const total = data.reduce((acc, u) => acc + u.calculatedLevel, 0);
      totalText = `\n\n\`🎟️\` » Insgesamt: **${total.toLocaleString("de-DE")} Level** von den Top 10 erreicht.`;
    }
    // ============================================================
    // KEINE DATEN
    // ============================================================

    if (!data.length) {
      return interaction.editReply({
        content: "> `❌` » Keine Daten vorhanden.",
      });
    }

    // ============================================================
    // USERNAMEN LADEN
    // ============================================================

    const usernameCache = new Map();

    const getUsername = async (userId) => {
      if (!userId) {
        return "Unbekannter User";
      }

      if (usernameCache.has(userId)) {
        return usernameCache.get(userId);
      }

      try {
        const user = await client.users.fetch(userId);
        const username = user.username;

        usernameCache.set(userId, username);

        return username;
      } catch {
        usernameCache.set(userId, "Unbekannter User");

        return "Unbekannter User";
      }
    };

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
      const username = await getUsername(userId);

      // Platz 1-10 ohne Backticks
      description +=
        `${rank} » **${username}** \`×\` **${value}**\n`;
    }

    // ============================================================
    // EIGENER RANG
    // ============================================================

    const userId = interaction.user.id;

    const index = data.findIndex(
      (u) =>
        String(u.userId || u.userID) ===
        String(userId),
    );

    if (index !== -1) {
      const entry = data[index];
      const value = formatValue(entry);
      const rank = getRank(index);

      // Platz 1-10 ohne Backticks
      // Ab Platz 11 mit Backticks
      if (index < 10) {
        description +=
          `\n\`👤\` » Du belegst Platz ${rank} mit **${value}**!`;
      } else {
        description +=
          `\n\`👤\` » Du belegst Platz \`${rank}\` mit **${value}**!`;
      }
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
