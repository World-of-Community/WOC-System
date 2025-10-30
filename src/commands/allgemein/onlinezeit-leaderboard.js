const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("onlinezeit-leaderboard")
    .setDescription("» Zeigt das Onlinezeit Leaderboard an. 📊")
    .addStringOption((option) =>
      option
        .setName("typ")
        .setDescription("Wähle zwischen Top 10, 100 oder 200")
        .setRequired(true)
        .addChoices(
          { name: "Top 10", value: "10" },
          { name: "Top 100", value: "100" },
          { name: "Top 200", value: "200" }
        )
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const userId = interaction.user.id;
    const limit = parseInt(interaction.options.getString("typ"));

    try {
      // Alle Nutzer laden
      let allUsersForTotal = await userdb.find({}, "userID onlineTime").exec();
      if (!allUsersForTotal.length) {
        return interaction.reply({
          content: "> `❌` » Noch keine Nutzerdaten vorhanden.",
          ephemeral: true,
        });
      }

      // ❌ Entferne Nutzer, die nicht mehr auf dem Server sind
      for (const u of allUsersForTotal) {
        const member = await guild.members.fetch(u.userID).catch(() => null);
        if (!member) {
          await userdb.deleteOne({ userID: u.userID });
        }
      }

      // Nach Bereinigung erneut alle Nutzer laden
      allUsersForTotal = await userdb.find({}, "userID onlineTime").exec();

      // Gesamte Onlinezeit berechnen
      const totalMs = allUsersForTotal.reduce((acc, u) => acc + (u.onlineTime || 0), 0);
      const totalHours = Math.floor(totalMs / 3600000);
      const totalHoursFormatted = totalHours.toLocaleString("de-DE");

      // Nur die Top X Nutzer holen (für Anzeige)
      const allUsers = await userdb
        .find({ onlineTime: { $gt: 0 } }, "userID onlineTime")
        .sort({ onlineTime: -1 })
        .limit(limit)
        .exec();

      let currentPage = 0;
      const pageSize = 10;
      const totalPages = Math.ceil(allUsers.length / pageSize) || 1;

      const generateEmbed = async (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const pageUsers = allUsers.slice(start, end);

        const membersMap = new Map();
        await Promise.all(
          pageUsers.map(async (u) => {
            const member = await guild.members.fetch(u.userID).catch(() => null);
            membersMap.set(u.userID, member);
          })
        );

        const lines = pageUsers.map((userDoc, index) => {
          const member = membersMap.get(userDoc.userID);
          const username = member?.user.username || `\`${userDoc.userID}\``;

          const hours = Math.floor((userDoc.onlineTime || 0) / 3600000);
          const hourLabel = hours === 1 ? "Stunde" : "Stunden";

          // Platzierungssymbole
          const globalIndex = start + index;
          let placeIcon = `#${globalIndex + 1}`;
          if (globalIndex === 0) placeIcon = "🥇";
          else if (globalIndex === 1) placeIcon = "🥈";
          else if (globalIndex === 2) placeIcon = "🥉";

          return `\`${placeIcon}\` mit \`${hours} ${hourLabel}\` ist <@${userDoc.userID}> (${username})`;
        });

        // eigenen Rang berechnen (auch wenn 0h)
        const sortedAll = allUsersForTotal.sort((a, b) => (b.onlineTime || 0) - (a.onlineTime || 0));
        const userIndex = sortedAll.findIndex((u) => u.userID === userId);

        let userRank, userDoc, member, username, hours, hourLabel, placeIcon;
        if (userIndex === -1) {
          userRank = sortedAll.length + 1;
          username = interaction.user.username;
          hours = 0;
          hourLabel = "Stunden";
          placeIcon = `#${userRank}`;
        } else {
          userRank = userIndex + 1;
          userDoc = sortedAll[userIndex];
          member = await guild.members.fetch(userDoc.userID).catch(() => null);
          username = member?.user.username || `Unbekannt (${userDoc.userID})`;
          hours = Math.floor((userDoc.onlineTime || 0) / 3600000);
          hourLabel = hours === 1 ? "Stunde" : "Stunden";

          placeIcon = `#${userRank}`;
          if (userRank === 1) placeIcon = "🥇";
          else if (userRank === 2) placeIcon = "🥈";
          else if (userRank === 3) placeIcon = "🥉";
        }

        // eigene Platzierung immer anhängen
        lines.push(
          `\nDein Rang: \`${placeIcon}\` mit \`${hours} ${hourLabel}\` - <@${userId}> (\`${username}\`)`
        );

        return new EmbedBuilder()
          .setTitle(`\`🏆\` Top ${limit} Onlinezeit Leaderboard`)
          .setDescription(
            lines.join("\n") +
              `\n\n\`👥\` » Gesamte Onlinezeit beträgt \`${totalHoursFormatted} Stunden\``
          )
          .setColor("Green")
          .setFooter({
            text: `Seite ${page + 1} / ${totalPages} • Onlinezeit auf ${guild.name}`,
          })
          .setTimestamp();
      };

      const getRow = () =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("⬅️ Zurück")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("➡️ Weiter")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === totalPages - 1)
        );

      const msg = await interaction.reply({
        embeds: [await generateEmbed(currentPage)],
        components: totalPages > 1 ? [getRow()] : [],
        ephemeral: true,
      });

      if (totalPages > 1) {
        const collector = msg.createMessageComponentCollector();

        collector.on("collect", async (i) => {
          if (i.user.id !== interaction.user.id) {
            return i.reply({
              content: "> `❌` » Das ist nicht dein Leaderboard.",
              ephemeral: true,
            });
          }

          if (i.customId === "prev" && currentPage > 0) currentPage--;
          if (i.customId === "next" && currentPage < totalPages - 1) currentPage++;

          await i.update({
            embeds: [await generateEmbed(currentPage)],
            components: [getRow()],
          });
        });
      }
    } catch (error) {
      console.error("Fehler bei /onlinezeit-leaderboard:", error);
      return interaction.reply({
        content: "> `❌` » Ein unerwarteter Fehler ist aufgetreten.",
        ephemeral: true,
      });
    }
  },
};
