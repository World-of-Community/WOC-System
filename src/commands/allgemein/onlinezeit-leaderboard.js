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
        const displayName = member?.displayName || `Unbekannt (${userDoc.userID})`;

        // Onlinezeit in Stunden berechnen
        const hours = Math.floor(userDoc.onlineTime / 3600000);
        const hourLabel = hours === 1 ? "Stunde" : "Stunden";

        return `\`#${index + 1}\` mit \`${hours} ${hourLabel}\` ist <@${userDoc.userID}> (${displayName})`;
      });

      // Rang des Abfragenden finden
      const userIndex = allUsers.findIndex(u => u.userID === userId);

      if (userIndex === -1) {
        lines.push(`\nDein Rang: \`Nicht in der Liste\``);
      } else if (userIndex >= 10) {
        const userRank = userIndex + 1;
        const userDoc = allUsers[userIndex];
        const member = await guild.members.fetch(userDoc.userID).catch(() => null);
        const displayName = member?.displayName || `Unbekannt (${userDoc.userID})`;
        const hours = Math.floor(userDoc.onlineTime / 3600000);
        const hourLabel = hours === 1 ? "Stunde" : "Stunden";

        lines.push(`\n...`);
        lines.push(`Dein Rang: \`#${userRank}\` mit \`${hours} ${hourLabel}\` ist <@${userDoc.userID}> (${displayName})`);
      }

      // Embed bauen und antworten
      const embed = new EmbedBuilder()
        .setTitle('🏆 Top 10 Onlinezeit Leaderboard')
        .setDescription(lines.join('\n'))
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
