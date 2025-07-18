const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userdb = require('../../../Datenbank/userdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlinezeit-leaderboard')
    .setDescription('» Zeigt das Onlinezeit-Leaderboard oder den Rang eines Nutzers an.')
    .addUserOption(opt =>
      opt.setName('nutzer')
        .setDescription('» Optional: Zeigt den Rang von diesem Nutzer an (Standard: du selbst)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const selectedUser = interaction.options.getUser('nutzer') || interaction.user;

    // Alle Nutzer mit Onlinezeit, absteigend sortiert
    const allUsers = await userdb.find({ onlineTime: { $gt: 0 } }).sort({ onlineTime: -1 });

    if (allUsers.length === 0) {
      return interaction.reply({ content: '> `❌` » Noch keine Nutzerdaten mit Onlinezeit vorhanden.', ephemeral: true });
    }

    // Wenn kein Nutzer angegeben: Top 10 Leaderboard anzeigen
    if (!interaction.options.getUser('nutzer')) {
      // Top 10
      const topUsers = allUsers.slice(0, 10);

      const lines = await Promise.all(topUsers.map(async (user, index) => {
        const member = await guild.members.fetch(user.userID).catch(() => null);
        const name = member?.user?.tag || `Unbekannt (${user.userID})`;
        const stunden = Math.floor(user.onlineTime / 3600000);
        return `\`${index + 1}.\` **${name}** – \`${stunden}h\``;
      }));

      const embed = new EmbedBuilder()
        .setTitle('`🏆` Top 10 Onlinezeit Leaderboard')
        .setDescription(lines.join('\n'))
        .setColor('Blurple')
        .setFooter({ text: 'Basierend auf der Gesamt-Onlinezeit (Stunden)' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // Wenn Nutzer angegeben: dessen Rang anzeigen
    const userIndex = allUsers.findIndex(u => u.userID === selectedUser.id);
    const userData = allUsers[userIndex];

    if (userIndex === -1 || !userData) {
      return interaction.reply({ content: `> \`❌\` » Keine Onlinezeit für ${selectedUser} gefunden.`, ephemeral: true });
    }

    const stunden = Math.floor(userData.onlineTime / 3600000);
    const platz = userIndex + 1;

    const embed = new EmbedBuilder()
      .setTitle('📊 Onlinezeit-Rang')
      .setDescription(
        `> \`👤\` » Nutzer: <@${selectedUser.id}> (${selectedUser.tag})\n` +
        `> \`🕐\` » Onlinezeit: \`${stunden}h\`\n` +
        `> \`🏅\` » Rang: \`#${platz}\` von \`${allUsers.length}\``
      )
      .setColor('Green')
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
