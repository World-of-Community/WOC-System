const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userdb = require('../../../Datenbank/userdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlinezeit-leaderboard')
    .setDescription('» Zeigt das Onlinezeit-Leaderboard an.')
    .addSubcommand(sub =>
      sub.setName('top')
        .setDescription('» Zeigt die Top 10 der Onlinezeit.')
    )
    .addSubcommand(sub =>
      sub.setName('rang')
        .setDescription('» Zeigt deinen Rang im Onlinezeit-Leaderboard.')
        .addUserOption(opt =>
          opt.setName('nutzer')
            .setDescription('» Optional: Nutzer anzeigen (Standard: du selbst)')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'top') {
      const topUsers = await userdb.find({ onlineTime: { $gt: 0 } })
        .sort({ onlineTime: -1 })
        .limit(10);

      if (topUsers.length === 0) {
        return interaction.reply({ content: '> `❌` » Noch keine Nutzerdaten mit Onlinezeit vorhanden.', ephemeral: true });
      }

      const lines = await Promise.all(topUsers.map(async (user, index) => {
        const member = await interaction.guild.members.fetch(user.userID).catch(() => null);
        const name = member?.user?.tag || `Unbekannt (${user.userID})`;
        const stunden = Math.floor(user.onlineTime / 3600000);
        return `\`${index + 1}.\` **${name}** – \`${stunden}h\``;
      }));

      const embed = new EmbedBuilder()
        .setTitle('🏆 Top 10 Onlinezeit Leaderboard')
        .setDescription(lines.join('\n'))
        .setColor('Blurple')
        .setFooter({ text: 'Basierend auf der Gesamt-Onlinezeit (Stunden)' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'rang') {
      const selectedUser = interaction.options.getUser('nutzer') || interaction.user;
      const allUsers = await userdb.find({ onlineTime: { $gt: 0 } }).sort({ onlineTime: -1 });

      const userIndex = allUsers.findIndex(u => u.userID === selectedUser.id);
      const userData = allUsers[userIndex];

      if (!userData) {
        return interaction.reply({ content: `> \`❌\` » Keine Onlinezeit für ${selectedUser} gefunden.`, ephemeral: true });
      }

      const stunden = Math.floor(userData.onlineTime / 3600000);
      const platz = userIndex + 1;

      const embed = new EmbedBuilder()
        .setTitle('📊 Onlinezeit-Rang')
        .setDescription(
          `> 👤 Nutzer: <@${selectedUser.id}> (${selectedUser.tag}**\n` +
          `> 🕐 Onlinezeit: \`${stunden}h\`\n` +
          `> 🏅 Rang: \`#${platz}\` von \`${allUsers.length}\``
        )
        .setColor('Green')
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
