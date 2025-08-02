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
      // Alle User mit Onlinezeit > 0 aus DB holen und sortieren (absteigend)
      const allUsers = await userdb.find({ onlineTime: { $gt: 0 } }, 'userID onlineTime').sort({ onlineTime: -1 }).exec();

      if (!allUsers || allUsers.length === 0) {
        return interaction.reply({ content: '> `❌` » Noch keine Nutzerdaten mit Onlinezeit vorhanden.', ephemeral: true });
      }

      if (option === 'leaderboard') {
        const topUsers = allUsers.slice(0, 10);
        const userIDs = topUsers.map(u => u.userID);

        // User-Member im Guild-Cache / API holen
        await Promise.all(userIDs.map(id => guild.members.fetch(id).catch(() => null)));

        const lines = topUsers.map((userDoc, index) => {
          const member = guild.members.cache.get(userDoc.userID);
          const name = member?.user?.tag || `Unbekannt (${userDoc.userID})`;

          const totalSeconds = Math.floor(userDoc.onlineTime / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);

          return `\`#${index + 1}\` mit \`${hours}\` Stunden ist <@${userDoc.userID}> (${name})`;
        });

        const embed = new EmbedBuilder()
          .setTitle('`🏆` Top 10 Onlinezeit Leaderboard')
          .setDescription(lines.join('\n'))
          .setColor('Green')
          .setFooter({ text: 'Basierend auf der Gesamt-Onlinezeit (Stunden und Minuten)' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      else if (option === 'nutzer') {
        // Rang vom Nutzer ermitteln
        const userIndex = allUsers.findIndex(u => u.userID === selectedUser.id);
        if (userIndex === -1) {
          return interaction.reply({ content: `> \`❌\` » Keine Onlinezeit für ${selectedUser} gefunden.`, ephemeral: true });
        }

        const userDoc = allUsers[userIndex];
        const totalSeconds = Math.floor(userDoc.onlineTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const rank = userIndex + 1;

        // Nutzerdaten aus Guild holen
        const member = guild.members.cache.get(userDoc.userID) || await guild.members.fetch(userDoc.userID).catch(() => null);
        const userTag = member?.user?.tag || selectedUser.tag || 'Unbekannt';

        const embed = new EmbedBuilder()
          .setTitle('`📊` Onlinezeit-Rang')
          .setDescription(
            `> \`👤\` Nutzer: <@${userDoc.userID}> (${userTag})\n` +
            `> \`🕐\` Onlinezeit: \`${hours}\` Stunden\n` +
            `> \`🏅\` Rang: \`#${rank}\` von \`${allUsers.length}\``
          )
          .setColor('Green')
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
    catch (error) {
      console.error('Fehler bei /onlinezeit:', error);
      return interaction.reply({ content: '> `❌` » Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  }
};
