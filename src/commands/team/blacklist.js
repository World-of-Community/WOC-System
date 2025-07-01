const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const { DiscordBlacklist, MinecraftBlacklist } = require('../../../Datenbank/blacklistdb');

const CHANNEL_ID = "877446081036836884"; // Channel für das Blacklist-Embed (optional)
const MESSAGE_ID = "1389649798000545926"; // Message-ID vom Blacklist-Embed (optional)

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

    // Hilfsfunktion: Buttons für Paginierung
    const createButtons = (page, maxPage) => [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('blacklist_back')
          .setLabel('Vorherige Seite')
          .setEmoji('⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 0),
        new ButtonBuilder()
          .setCustomId('blacklist_next')
          .setLabel('Nächste Seite')
          .setEmoji('➡️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= maxPage)
      )
    ];

    // Hilfsfunktion: Alle Blacklist-Einträge zusammenholen & kombinieren
    async function getCombinedBlacklist() {
      const discordEntries = await DiscordBlacklist.find();
      const minecraftEntries = await MinecraftBlacklist.find();

      const discordFormatted = discordEntries.map(e => ({
        type: 'discord',
        userId: e.userId,
        username: e.username,
        reason: e.reason,
        date: e.date
      }));

      const minecraftFormatted = minecraftEntries.map(e => ({
        type: 'minecraft',
        minecraftName: e.minecraftName,
        reason: e.reason,
        date: e.date
      }));

      return [...discordFormatted, ...minecraftFormatted].sort((a, b) => b.date - a.date);
    }

    // Embed erstellen mit gemischten Blacklist-Einträgen
    async function createCombinedBlacklistEmbed(page = 0, pageSize = 10) {
      const combinedList = await getCombinedBlacklist();
      const start = page * pageSize;
      const pageEntries = combinedList.slice(start, start + pageSize);

      if (combinedList.length === 0) {
        return new EmbedBuilder()
          .setTitle('`📄` Blacklist Übersicht')
          .setColor('Red')
          .setDescription('Die Blacklist ist leer.');
      }

      const lines = await Promise.all(pageEntries.map(async (entry, i) => {
        const index = start + i + 1;
        const reason = entry.reason || 'Kein Grund angegeben';
        const timestamp = entry.date ? `<t:${Math.floor(new Date(entry.date).getTime() / 1000)}:F>` : 'Unbekannt';

        if (entry.type === 'discord') {
          let userTag = entry.username || 'Unbekannt';
          try {
            const user = await interaction.client.users.fetch(entry.userId);
            if (user) userTag = user.tag;
          } catch {}

          return `**${index}.** \`💙\` **Discord:** <@${entry.userId}> – ${userTag} (\`${entry.userId}\`)\n> Grund: ${reason}\n> Hinzugefügt: ${timestamp}`;
        } else if (entry.type === 'minecraft') {
          return `**${index}.** \`🎮\` **Minecraft:** ${entry.minecraftName}\n> Grund: ${reason}\n> Hinzugefügt: ${timestamp}`;
        } else {
          return `**${index}.** \`❓\` Unbekannter Eintrag`;
        }
      }));

      return new EmbedBuilder()
        .setTitle('`📄` Blacklist Übersicht')
        .setColor('Red')
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: `Seite ${page + 1} / ${Math.ceil(combinedList.length / pageSize)} · Einträge insgesamt: ${combinedList.length}` });
    }

    // Funktion zum automatischen Aktualisieren des Blacklist-Embeds in der zentralen Nachricht
    async function updateBlacklistMessage(client) {
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel) return;

        const msg = await channel.messages.fetch(MESSAGE_ID);
        if (!msg) return;

        const embed = await createCombinedBlacklistEmbed(0, 10);
        await msg.edit({ embeds: [embed] });
      } catch (err) {
        console.error('Fehler beim Aktualisieren der Blacklist-Nachricht:', err);
      }
    }

    // Subcommand: add
    if (sub === 'add') {
      const input = interaction.options.getString('input');
      const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

      let user = null;
      let minecraftName = null;

      try {
        user = await interaction.client.users.fetch(input);
      } catch {
        const member = interaction.guild?.members.cache.find(
          m =>
            m.user.tag.toLowerCase() === input.toLowerCase() ||
            m.user.username.toLowerCase() === input.toLowerCase()
        );
        if (member) user = member.user;
        else minecraftName = input;
      }

      if (!user && !minecraftName) {
        return interaction.reply({
          content: '> `❗` » Nutzer konnte nicht gefunden werden. Gib eine gültige User-ID, einen Discord-Namen oder Minecraft-Namen an.',
          ephemeral: true
        });
      }

      // Doppelprüfung in DB
      if (user) {
        if (await DiscordBlacklist.findOne({ userId: user.id })) {
          return interaction.reply({
            content: `> \`❗\` » Der Nutzer ${user.tag} ist bereits geblacklistet.`,
            ephemeral: true
          });
        }

        // In Discord-Blacklist speichern
        await DiscordBlacklist.create({
          userId: user.id,
          username: user.tag,
          reason,
          date: new Date()
        });

        await updateBlacklistMessage(interaction.client);

        await interaction.reply({ content: `> \`✅\` » Discord Nutzer: **${user.tag}** wurde geblacklistet.`, ephemeral: true });
        return;
      } else if (minecraftName) {
        if (await MinecraftBlacklist.findOne({ minecraftName: minecraftName.toLowerCase() })) {
          return interaction.reply({
            content: `> \`❗\` » Der Minecraft-Name **${minecraftName}** ist bereits geblacklistet.`,
            ephemeral: true
          });
        }

        // In Minecraft-Blacklist speichern
        await MinecraftBlacklist.create({
          minecraftName: minecraftName.toLowerCase(),
          reason,
          date: new Date()
        });

        await updateBlacklistMessage(interaction.client);

        await interaction.reply({ content: `> \`✅\` » Minecraft-Spieler **${minecraftName}** wurde geblacklistet.`, ephemeral: true });
        return;
      }
    }

    // Subcommand: remove
    if (sub === 'remove') {
      const input = interaction.options.getString('input');

      let removed = await DiscordBlacklist.findOneAndDelete({
        $or: [
          { userId: input },
          { username: new RegExp(`^${input}$`, 'i') }
        ]
      });

      if (!removed) {
        removed = await MinecraftBlacklist.findOneAndDelete({
          minecraftName: new RegExp(`^${input}$`, 'i')
        });
      }

      if (!removed) {
        return interaction.reply({ content: `> \`❗\` » Kein Eintrag für **${input}** gefunden.`, ephemeral: true });
      }

      await updateBlacklistMessage(interaction.client);

      await interaction.reply({
        content: `> \`❌\` » **${removed.username || removed.minecraftName}** wurde von der Blacklist entfernt.`,
        ephemeral: false
      });
      return;
    }

    // Subcommand: edit
    if (sub === 'edit') {
      const input = interaction.options.getString('input');
      const newReason = interaction.options.getString('grund');

      let entry = await DiscordBlacklist.findOneAndUpdate(
        { $or: [{ userId: input }, { username: new RegExp(`^${input}$`, 'i') }] },
        { reason: newReason },
        { new: true }
      );

      if (!entry) {
        entry = await MinecraftBlacklist.findOneAndUpdate(
          { minecraftName: new RegExp(`^${input}$`, 'i') },
          { reason: newReason },
          { new: true }
        );
      }

      if (!entry) {
        return interaction.reply({ content: `> \`❗\` » Kein Eintrag für \`${input}\` gefunden.`, ephemeral: true });
      }

      await updateBlacklistMessage(interaction.client);

      await interaction.reply({
        content: `> \`✏️\` » Grund für **${entry.username || entry.minecraftName}** wurde aktualisiert.`,
        ephemeral: false
      });
      return;
    }

    // Subcommand: list mit Paginierung über beide Datenbanken zusammen
    if (sub === 'list') {
      const combinedList = await getCombinedBlacklist();

      if (combinedList.length === 0) {
        return interaction.reply({ content: '> `❗` » Die Blacklist ist leer.', ephemeral: false });
      }

      const pageSize = 10; // 10 Einträge pro Seite eingestellt
      let currentPage = 0;
      const maxPage = Math.ceil(combinedList.length / pageSize) - 1;

      const getPageEmbed = async (page) => createCombinedBlacklistEmbed(page, pageSize);

      const listMessage = await interaction.channel.send({
        embeds: [await getPageEmbed(currentPage)],
        components: createButtons(currentPage, maxPage)
      });

      await interaction.reply({ content: 'Blacklist-Übersicht gesendet.', ephemeral: true });

      const collector = listMessage.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id });

      collector.on('collect', async i => {
        if (i.customId === 'blacklist_back') currentPage = Math.max(currentPage - 1, 0);
        else if (i.customId === 'blacklist_next') currentPage = Math.min(currentPage + 1, maxPage);
        await i.update({ embeds: [await getPageEmbed(currentPage)], components: createButtons(currentPage, maxPage) });
      });

      collector.on('end', () => listMessage.edit({ components: [] }));
    }
  }
};
