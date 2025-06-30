const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionFlagsBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
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
      sub.setName('edit')
        .setDescription('» Bearbeitet den Grund eines Blacklist-Eintrags')
        .addStringOption(opt =>
          opt.setName('input').setDescription('User-ID, Username oder Minecraft-Name').setRequired(true))
        .addStringOption(opt =>
          opt.setName('grund').setDescription('Neuer Grund').setRequired(true)))
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
        // Versuche Discord-User per ID zu holen
        user = await interaction.client.users.fetch(input);
      } catch {
        // Falls nicht gefunden, versuche im Guild-Cache nach Username oder Tag zu suchen
        const member = interaction.guild?.members.cache.find(m =>
          m.user.tag.toLowerCase() === input.toLowerCase() ||
          m.user.username.toLowerCase() === input.toLowerCase()
        );
        if (member) user = member.user;
        else minecraftName = input; // Wenn kein Discord User, dann MinecraftName
      }

      if (!user && !minecraftName) {
        return interaction.reply({
          content: `> \`❗\` » Nutzer konnte nicht gefunden werden. Gib eine gültige User-ID, einen Discord-Name oder Minecraft-Namen an.`,
          ephemeral: true
        });
      }

      if (user) {
        const exists = await Blacklist.findOne({ userId: user.id });
        if (exists) {
          return interaction.reply({
            content: `> \`❗\` » Der Nutzer ${user.tag} ist bereits auf der Blacklist.`,
            ephemeral: true
          });
        }
        // Nur userId und username speichern, kein userId=null
        await Blacklist.create({ 
          userId: user.id, 
          username: user.tag, 
          reason, 
          date: new Date()
        });
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
        // Beim Minecraft Namen nur dieses Feld speichern, userId NICHT speichern
        await Blacklist.create({ 
          minecraftName: minecraftName.toLowerCase(), 
          reason, 
          date: new Date()
        });
        return interaction.reply({
          content: `> \`✅\` » Minecraft-Spieler **${minecraftName}** wurde zur Blacklist hinzugefügt.`,
          ephemeral: true
        });
      }
    }

    if (sub === 'remove') {
      const input = interaction.options.getString('input');
      const removed = await Blacklist.findOneAndDelete({
        $or: [
          { userId: input },
          { username: new RegExp(`^${input}$`, 'i') },
          { minecraftName: new RegExp(`^${input}$`, 'i') }
        ]
      });

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
    }

    if (sub === 'edit') {
      const input = interaction.options.getString('input');
      const newReason = interaction.options.getString('grund');
      const entry = await Blacklist.findOneAndUpdate(
        {
          $or: [
            { userId: input },
            { username: new RegExp(`^${input}$`, 'i') },
            { minecraftName: new RegExp(`^${input}$`, 'i') }
          ]
        },
        { reason: newReason },
        { new: true }
      );

      if (!entry) {
        return interaction.reply({
          content: `> \`❗\` » Kein Eintrag mit \`${input}\` gefunden.`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `> \`✏️\` » Grund für **${entry.username || entry.minecraftName}** wurde geändert.`,
        ephemeral: true
      });
    }

    if (sub === 'list') {
      const entries = await Blacklist.find();
      if (!entries.length) {
        return interaction.reply({
          content: '> `❗` » Die Blacklist ist leer.',
          ephemeral: true
        });
      }

      const pageSize = 5;
      let currentPage = 0;

      const getPageEmbed = async (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const pageEntries = entries.slice(start, end);

        const lines = await Promise.all(pageEntries.map(async (entry, i) => {
          const index = start + i + 1;
          const reason = entry.reason || 'Kein Grund angegeben';
          const timestamp = entry.date ? `<t:${Math.floor(new Date(entry.date).getTime() / 1000)}:F>` : 'Unbekannt';

          if (entry.userId) {
            let user;
            try { user = await interaction.client.users.fetch(entry.userId); } catch {}
            const displayName = user?.tag || entry.username || 'Unbekannt';
            return `**${index}.** \`💙\` **Discord:** <@${entry.userId}> – ${displayName} (\`${entry.userId}\`)\n> Grund: ${reason}\n> Hinzugefügt: ${timestamp}`;
          } else if (entry.minecraftName) {
            return `**${index}.** \`🎮\` **Minecraft:** \`${entry.minecraftName}\`\n> Grund: ${reason}\n> Hinzugefügt: ${timestamp}`;
          } else {
            return `**${index}.** \`❓\` Unbekannter Eintrag`;
          }
        }));

        return new EmbedBuilder()
          .setTitle('`📄` Blacklist Nutzer')
          .setColor('Red')
          .setDescription('**Information zu den Nutzern:**\n> Verbot bzw. gebannt oder dürfen nicht auf den Discord und den Minecraft Server drauf.\n\n' + lines.join('\n\n'))
          .setFooter({ text: `Seite ${page + 1} / ${Math.ceil(entries.length / pageSize)} · Einträge insgesamt: ${entries.length}` });
      };

      const getButtons = (page) => {
        const maxPage = Math.ceil(entries.length / pageSize) - 1;
        return [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('blacklist_back')
              .setEmoji('⏪')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page <= 0),
            new ButtonBuilder()
              .setCustomId('blacklist_next')
              .setEmoji('⏩')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPage)
          )
        ];
      };

      const message = await interaction.reply({
        embeds: [await getPageEmbed(currentPage)],
        components: getButtons(currentPage),
        ephemeral: true,
        fetchReply: true
      });

      const collector = message.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 60000
      });

      collector.on('collect', async i => {
        if (i.customId === 'blacklist_back') currentPage = Math.max(currentPage - 1, 0);
        else if (i.customId === 'blacklist_next') currentPage = Math.min(currentPage + 1, Math.ceil(entries.length / pageSize) - 1);

        await i.update({
          embeds: [await getPageEmbed(currentPage)],
          components: getButtons(currentPage)
        });
      });

      collector.on('end', async () => {
        try { await message.edit({ components: [] }); } catch {}
      });
    }
  }
};
