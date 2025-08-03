const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userdb = require('../../../Datenbank/userdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlinezeit')
    .setDescription('» Zeigt Onlinezeit Leaderboard oder den Rang eines Nutzers an.')
    .addStringOption(opt =>
      opt.setName('option')
        .setDescription('» Wähle, was angezeigt werden soll')
        .setRequired(true)
        .addChoices(
          { name: 'Leaderboard', value: 'leaderboard' },
          { name: 'Nutzer', value: 'nutzer' }
        )
    )
    .addUserOption(opt =>
      opt.setName('nutzer')
        .setDescription('» Nutzer, dessen Rang angezeigt werden soll (nur wenn Option Nutzer)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const option = interaction.options.getString('option');
    const selectedUser = interaction.options.getUser('nutzer') || interaction.user;

    try {
      // Nutzer mit Onlinezeit aus der Datenbank
      const allUsers = await userdb
        .find({ onlineTime: { $gt: 0 } }, 'userID onlineTime')
        .sort({ onlineTime: -1 })
        .exec();

      if (!allUsers.length) {
        return interaction.reply({
          content: '> `❌` » Noch keine Nutzerdaten mit Onlinezeit vorhanden.',
          ephemeral: true,
        });
      }

      // Leaderboard anzeigen
      if (option === 'leaderboard') {
        const topUsers = allUsers.slice(0, 10);

        await Promise.all(topUsers.map(u => guild.members.fetch(u.userID).catch(() => null)));

        const lines = topUsers.map((userDoc, index) => {
          const member = guild.members.cache.get(userDoc.userID);
          const displayName = member?.displayName || `Unbekannt (${userDoc.userID})`;

          const totalMinutes = Math.floor(userDoc.onlineTime / 1000 / 60);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          return `\`#${index + 1}\` mit \`${hours}h ${minutes}m\` ist <@${userDoc.userID}> (${displayName})`;
        });

        const embed = new EmbedBuilder()
          .setTitle('🏆 Onlinezeit Leaderboard')
          .setDescription(lines.join('\n'))
          .setColor('Green')
          .setFooter({ text: 'Basierend auf der Gesamt-Onlinezeit' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Einzelner Nutzer-Rang
      if (option === 'nutzer') {
        const userIndex = allUsers.findIndex(u => u.userID === selectedUser.id);
        if (userIndex === -1) {
          return interaction.reply({
            content: `> \`❌\` » Keine Onlinezeit für ${selectedUser} gefunden.`,
            ephemeral: true,
          });
        }

        const userDoc = allUsers[userIndex];
        const totalMinutes = Math.floor(userDoc.onlineTime / 1000 / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const rank = userIndex + 1;

        const member = await guild.members.fetch(userDoc.userID).catch(() => null);
        const displayName = member?.displayName || selectedUser.tag || 'Unbekannt';

        const embed = new EmbedBuilder()
          .setTitle('`📊` Onlinezeit-Rang')
          .setDescription(
            `> \`👤\` Nutzer: <@${userDoc.userID}> (${displayName})\n` +
            `> \`🕐\` Onlinezeit: \`${hours}h ${minutes}m\`\n` +
            `> \`🏅\` Rang: \`#${rank}\` von \`${allUsers.length}\``
          )
          .setColor('Green')
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.error('Fehler bei /onlinezeit:', error);
      return interaction.reply({
        content: '> `❌` » Ein unerwarteter Fehler ist aufgetreten.',
        ephemeral: true,
      });
    }
  },
};
