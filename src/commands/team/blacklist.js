const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Blacklist = require("../../../Datenbank/blacklistdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist-Verwaltung')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('» Fügt jemanden zur Blacklist hinzu')
        .addStringOption(opt =>
          opt.setName('input').setDescription('User-ID, Username oder Minecraft-Name').setRequired(true))
        .addStringOption(opt =>
          opt.setName('grund').setDescription('Grund für die Blacklist').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('» Entfernt jemanden von der Blacklist')
        .addStringOption(opt =>
          opt.setName('input').setDescription('User-ID, Username oder Minecraft-Name').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('» Zeigt alle geblacklisteten Personen'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const input = interaction.options.getString('input');
      const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

      let user = null;
      let minecraftName = null;

      try {
        user = await interaction.client.users.fetch(input);
      } catch {
        const member = interaction.guild.members.cache.find(m =>
          m.user.tag.toLowerCase() === input.toLowerCase() ||
          m.user.username.toLowerCase() === input.toLowerCase()
        );
        if (member) {
          user = member.user;
        } else {
          minecraftName = input;
        }
      }

      if (user) {
        const exists = await Blacklist.findOne({ userId: user.id });
        if (exists) {
          return interaction.reply({
            content: `> \`❗\` » Der Nutzer ${user.tag} ist bereits auf der Blacklist.`,
            ephemeral: true
          });
        }

        // Datum nur einmal beim Erstellen setzen
        await Blacklist.create({ userId: user.id, username: user.tag, reason, date: new Date() });
        return interaction.reply({
          content: `> \`✅\` » **${user.tag}** wurde zur Blacklist hinzugefügt.`,
          ephemeral: true
        });
      }

      if (minecraftName) {
        const exists = await Blacklist.findOne({ minecraftName: minecraftName.toLowerCase() });
        if (exists) {
          return interaction.reply({
            content: `> \`❗\` » Der Minecraft-Name **${minecraftName}** ist bereits auf der Blacklist.`,
            ephemeral: true
          });
        }

        await Blacklist.create({ minecraftName: minecraftName.toLowerCase(), reason, date: new Date() });
        return interaction.reply({
          content: `> \`✅\` » Minecraft-Spieler **${minecraftName}** wurde zur Blacklist hinzugefügt.`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `> \`❗\` » Ein unbekannter Fehler ist aufgetreten.`,
        ephemeral: true
      });

    } else if (sub === 'remove') {
      const input = interaction.options.getString('input');
      let userIdToRemove = null;
      let minecraftNameToRemove = null;

      try {
        const user = await interaction.client.users.fetch(input);
        userIdToRemove = user.id;
      } catch {
        const foundUser = await Blacklist.findOne({ username: new RegExp(`^${input}$`, 'i') });
        if (foundUser) {
          userIdToRemove = foundUser.userId;
        } else {
          const foundMC = await Blacklist.findOne({ minecraftName: new RegExp(`^${input}$`, 'i') });
          if (foundMC) {
            minecraftNameToRemove = foundMC.minecraftName;
          }
        }
      }

      let removed;
      if (userIdToRemove) {
        removed = await Blacklist.findOneAndDelete({ userId: userIdToRemove });
      } else if (minecraftNameToRemove) {
        removed = await Blacklist.findOneAndDelete({ minecraftName: minecraftNameToRemove });
      }

      if (!removed) {
        return interaction.reply({
          content: `> \`❗\` » Nutzer oder Minecraft-Spieler \`${input}\` ist nicht auf der Blacklist.`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `> \`❌\` » **${removed.username || removed.minecraftName || 'Unbekannt'}** wurde von der Blacklist entfernt.`,
        ephemeral: true
      });

    } else if (sub === 'list') {
      const entries = await Blacklist.find();
      if (!entries.length) {
        return interaction.reply({
          content: '> `❗` » Die Blacklist ist leer.',
          ephemeral: true
        });
      }

      const pageSize = 5;
      let currentPage = 0;

      const getPageEmbed = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const pageEntries = entries.slice(start, end);

        const lines = pageEntries.map((entry, i) => {
          const userId = entry.userId;
          const savedUsername = entry.username;
          const minecraftName = entry.minecraftName;
          const reason = entry.reason || 'Kein Grund angegeben';
          const timestamp = entry.date ? `<t:${Math.floor(new Date(entry.date).getTime() / 1000)}:F>` : 'Unbekannt';
          const index = start + i + 1;

          if (userId) {
            // Aktuellen User aus Cache holen, falls vorhanden
            const user = interaction.client.users.cache.get(userId);
            const displayName = user ? user.tag : savedUsername;

            return `**${index}.** \`💙\` **Discord:** <@${userId}> – ${displayName} (\`${userId}\`)\n> Grund: ${reason}\n> Hinzugefügt: ${timestamp}`;
          } else if (minecraftName) {
            return `**${index}.** \`🎮\` **Minecraft:** \`${minecraftName}\`\n> Grund: ${reason}\n> Hinzugefügt: ${timestamp}`;
          } else {
            return `**${index}.** \`❓\` Unbekannter Eintrag`;
          }
        });

        return new EmbedBuilder()
          .setTitle('`📄` Blacklist Nutzer')
          .setColor('Red')
          .setDescription(
            '**Information zu den Nutzern:**\n> Verbot bzw gebannt oder dürfen nicht auf den Discord und den Minecraft Server drauf.\n\n' +
            lines.join('\n\n')
          )
          .setFooter({ text: `Seite ${page + 1} / ${Math.ceil(entries.length / pageSize)} · Einträge insgesamt: ${entries.length}` });
      };

      const getButtons = (page) => {
        const maxPage = Math.ceil(entries.length / pageSize) - 1;
        return [{
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              custom_id: 'blacklist_back',
              emoji: '⏪',
              disabled: page <= 0
            },
            {
              type: 2,
              style: 1,
              custom_id: 'blacklist_next',
              emoji: '⏩',
              disabled: page >= maxPage
            }
          ]
        }];
      };

      const message = await interaction.reply({
        embeds: [getPageEmbed(currentPage)],
        components: getButtons(currentPage),
        ephemeral: true,
        fetchReply: true
      });

      const collector = message.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 60000
      });

      collector.on('collect', async i => {
        if (i.customId === 'blacklist_back') {
          currentPage = Math.max(currentPage - 1, 0);
        } else if (i.customId === 'blacklist_next') {
          currentPage = Math.min(currentPage + 1, Math.ceil(entries.length / pageSize) - 1);
        }

        await i.update({
          embeds: [getPageEmbed(currentPage)],
          components: getButtons(currentPage)
        });
      });

      collector.on('end', async () => {
        try {
          await message.edit({ components: [] });
        } catch {}
      });
    }
  }
};
