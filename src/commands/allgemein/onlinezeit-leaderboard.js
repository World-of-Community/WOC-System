const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userdb = require('../../../Datenbank/userdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlinezeit-leaderboard')
    .setDescription('» Zeigt das Onlinezeit Leaderboard an.'),

  async execute(interaction) {
    const guild = interaction.guild;
    const userId = interaction.user.id;

    try {
      // Alle User mit Onlinezeit > 0 aus DB holen, absteigend sortiert
      const allUsers = await userdb.find({ onlineTime: { $gt: 0 } }, 'userID onlineTime').sort({ onlineTime: -1 }).exec();

      if (!allUsers.length) {
        return interaction.reply({
          content: '> `❌` » Noch keine Nutzerdaten mit Onlinezeit vorhanden.',
          ephemeral: true,
        });
      }

      // **Gesamte Onlinezeit berechnen**
      const totalMs = allUsers.reduce((acc, u) => acc + (u.onlineTime || 0), 0);
      const totalHours = Math.floor(totalMs / 3600000);

      // Zahl formatieren mit deutschem Tausenderpunkt
      const totalHoursFormatted = totalHours.toLocaleString("de-DE");

      // Top 10 aus der Liste
      const topUsers = allUsers.slice(0, 10);

      // Member-Daten im Server holen
      const membersMap = new Map();
      await Promise.all(topUsers.map(async u => {
        const member = await guild.members.fetch(u.userID).catch(() => null);
        membersMap.set(u.userID, member);
      }));

      // Ausgabe-Zeilen für Embed bauen (Top 10)
      const lines = topUsers.map((userDoc, index) => {
        const member = membersMap.get(userDoc.userID);
        const username = member?.user.username || `Unbekannt (${userDoc.userID})`;

        const hours = Math.floor(userDoc.onlineTime / 3600000);
        const hourLabel = hours === 1 ? "Stunde" : "Stunden";

        // Platzierungssymbole
        let placeIcon = `#${index + 1}`;
        if (index === 0) placeIcon = "🥇";
        else if (index === 1) placeIcon = "🥈";
        else if (index === 2) placeIcon = "🥉";

        return `\`${placeIcon}\` mit \`${hours} ${hourLabel}\` ist <@${userDoc.userID}> (${username})`;
      });

      // Rang des Abfragenden berechnen
      const userIndex = allUsers.findIndex(u => u.userID === userId);
      if (userIndex === -1) {
        lines.push(`\nDein Rang: \`Nicht in der Liste\``);
      } else {
        const userRank = userIndex + 1;
        const userDoc = allUsers[userIndex];
        const member = await guild.members.fetch(userDoc.userID).catch(() => null);
        const username = member?.user.username || `Unbekannt (${userDoc.userID})`;
        const hours = Math.floor(userDoc.onlineTime / 3600000);
        const hourLabel = hours === 1 ? "Stunde" : "Stunden";

        // Platzsymbol für eigenen Rang
        let placeIcon = `#${userRank}`;
        if (userRank === 1) placeIcon = "🥇";
        else if (userRank === 2) placeIcon = "🥈";
        else if (userRank === 3) placeIcon = "🥉";

        // Wenn er nicht in den Top 10 ist, extra anzeigen
        if (userIndex >= 10) {
          lines.push(`\nDein Rang: \`${placeIcon}\` mit \`${hours} ${hourLabel}\` ist <@${userDoc.userID}> (${username})`);
        }
      }

      // Embed bauen und antworten
      const embed = new EmbedBuilder()
        .setTitle('`🏆` Top 10 Onlinezeit Leaderboard')
        .setDescription(lines.join(`\n`) + (`\n\n\`👥\` » Gesamte Onlinezeit beträgt \`${totalHoursFormatted} Stunden\``))
        .setColor('Green')
        .setFooter({ text: `Gesamte Onlinezeit auf ${interaction.guild.name}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Fehler bei /onlinezeit-leaderboard:', error);
      return interaction.reply({
        content: '> `❌` » Ein unerwarteter Fehler ist aufgetreten.',
        ephemeral: true,
      });
    }
  },
};
