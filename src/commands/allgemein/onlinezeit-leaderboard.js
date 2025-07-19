const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const onlineMap = require('../../Maps/onlinemap'); // deine Map mit userID => onlineTime (ms)

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

    // Map in Array umwandeln, sortieren
    const allUsers = Array.from(onlineMap.entries())
      .filter(([_, onlineTime]) => onlineTime > 0)
      .sort((a, b) => b[1] - a[1]);

    if (allUsers.length === 0) {
      return interaction.reply({ content: '> `❌` » Noch keine Nutzerdaten mit Onlinezeit vorhanden.', ephemeral: true });
    }

    if (option === 'leaderboard') {
      const topUsers = allUsers.slice(0, 10);
      const userIDs = topUsers.map(([id]) => id);
      await guild.members.fetch({ user: userIDs }).catch(() => {});

      const lines = topUsers.map(([userID, onlineTime], index) => {
        const member = guild.members.cache.get(userID);
        const name = member?.user?.tag || `Unbekannt (${userID})`;
        const totalSeconds = Math.floor(onlineTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `\`#${index + 1}\` mit \`${hours}h ${minutes}m\` ist <@${userID}> (${name})`;
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
      // Nutzer muss existieren
      const userIndex = allUsers.findIndex(([userID]) => userID === selectedUser.id);
      if (userIndex === -1) {
        return interaction.reply({ content: `> \`❌\` » Keine Onlinezeit für ${selectedUser} gefunden.`, ephemeral: true });
      }

      const [userID, onlineTime] = allUsers[userIndex];
      const totalSeconds = Math.floor(onlineTime / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const rank = userIndex + 1;

      const embed = new EmbedBuilder()
        .setTitle('`📊` Onlinezeit-Rang')
        .setDescription(
          `> \`👤\` » Nutzer: <@${userID}> (${selectedUser.tag})\n` +
          `> \`🕐\` » Onlinezeit: \`${hours}h ${minutes}m\`\n` +
          `> \`🏅\` » Rang: \`#${rank}\` von \`${allUsers.length}\``
        )
        .setColor('Green')
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
