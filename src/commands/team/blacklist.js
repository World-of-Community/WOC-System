const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const Blacklist = require("../../../Datenbank/blacklistdb");

const CHANNEL_ID = "877446081036836884"; // Channel für das Blacklist-Embed (z.B. Admin-Channel)
const MESSAGE_ID = "1389198302075031695"; // Message, die das Blacklist-Embed enthält

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

    // Embed-Erstellung für Paginierung
    const createBlacklistEmbed = async (page = 0) => {
      const entries = await Blacklist.find();
      const pageSize = 5;
      const start = page * pageSize;
      const end = start + pageSize;
      const pageEntries = entries.slice(start, end);

      if (!entries.length) {
        return new EmbedBuilder()
          .setTitle('`📄` Blacklist Nutzer')
          .setColor('Red')
          .setDescription('Die Blacklist ist leer.');
      }

      const lines = await Promise.all(
        pageEntries.map(async (entry, i) => {
          const index = start + i + 1;
          const reason = entry.reason || 'Kein Grund angegeben';
          const timestamp = entry.date
            ? `<t:${Math.floor(new Date(entry.date).getTime() / 1000)}:F>`
            : 'Unbekannt';

          if (entry.userId) {
            let user;
            try {
              user = await interaction.client.users.fetch(entry.userId);
            } catch {}
            const displayName = user?.tag || entry.username || 'Unbekannt';
            return `**${index}.** \`💙\` **Discord:** <@${entry.userId}> – ${displayName} (\`${entry.userId}\`)
> Grund: ${reason}
> Hinzugefügt: ${timestamp}`;
          } else if (entry.minecraftName) {
            return `**${index}.** \`🎮\` **Minecraft:** \`${entry.minecraftName}\`
> Grund: ${reason}
> Hinzugefügt: ${timestamp}`;
          } else {
            return `**${index}.** \`❓\` Unbekannter Eintrag`;
          }
        })
      );

      return new EmbedBuilder()
        .setTitle('`📄` Blacklist Nutzer')
        .setColor('Red')
        .setDescription(
          '**Information zu den Nutzern:**\n> Verbot bzw. gebannt oder dürfen nicht auf den Discord und den Minecraft Server drauf.\n\n' +
            lines.join('\n\n')
        )
        .setFooter({
          text: `Seite ${page + 1} / ${Math.ceil(entries.length / pageSize)} · Einträge insgesamt: ${entries.length}`
        });
    };

    // Buttons für Navigation
    const createButtons = (page, maxPage) => [
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

    // Aktualisierung des zentralen Embeds
    const updateBlacklistMessage = async () => {
      try {
        const channel = await interaction.client.channels.fetch(CHANNEL_ID);
        const msg = await channel?.messages.fetch(MESSAGE_ID);
        if (!msg) return;

        const embed = await createBlacklistEmbed(0);
        await msg.edit({ embeds: [embed] });
      } catch (err) {
        console.error('Fehler beim Aktualisieren:', err);
      }
    };

    // Subcommand: add
    if (sub === 'add') {
      const input = interaction.options.getString('input');
      const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

      let user = null;
      let minecraftName = null;

      // Versuch, Discord-User zu holen
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
          content:
            '> `❗` » Nutzer konnte nicht gefunden werden. Gib eine gültige User-ID, einen Discord-Namen oder Minecraft-Namen an.',
          ephemeral: true
        });
      }

      // Doppelprüfung in DB
      if (user) {
        if (await Blacklist.findOne({ userId: user.id })) {
          return interaction.reply({
            content: `> \`❗\` » Der Nutzer ${user.tag} ist bereits geblacklistet.`,
            ephemeral: true
          });
        }
      } else if (
        minecraftName &&
        (await Blacklist.findOne({ minecraftName: minecraftName.toLowerCase() }))
      ) {
        return interaction.reply({
          content: `> \`❗\` » Der Minecraft-Name **${minecraftName}** ist bereits geblacklistet.`,
          ephemeral: true
        });
      }

      const newEntry = { reason, date: new Date() };
      if (user) {
        newEntry.userId = user.id;
        newEntry.username = user.tag;
      } else {
        newEntry.minecraftName = minecraftName.toLowerCase();
      }

      // Sicherheits-Check gegen null-Werte
      if (!newEntry.userId && !newEntry.minecraftName) {
        return interaction.reply({
          content:
            '> `❗` » Der Eintrag konnte nicht erstellt werden, da weder eine gültige User-ID noch ein Minecraft-Name erkannt wurde.',
          ephemeral: true
        });
      }

      await Blacklist.create(newEntry);
      await interaction.reply({
        content: user
          ? `> \`✅\` » **${user.tag}** wurde geblacklistet.`
          : `> \`✅\` » Minecraft-Spieler **${minecraftName}** wurde geblacklistet.`,
        ephemeral: false
      });
      await updateBlacklistMessage();
      return;
    }

    // Subcommand: remove
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
          content: `> \`❗\` » Kein Eintrag für **${input}** gefunden.`,
          ephemeral: true
        });
      }
      await interaction.reply({
        content: `> \`❌\` » **${removed.username || removed.minecraftName}** wurde von der Blacklist entfernt.`,
        ephemeral: false
      });
      await updateBlacklistMessage();
      return;
    }

    // Subcommand: edit
    if (sub === 'edit') {
      const input = interaction.options.getString('input');
      const newReason = interaction.options.getString('grund');

      const entry = await Blacklist.findOneAndUpdate(
        { $or: [
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
          content: `> \`❗\` » Kein Eintrag für \`${input}\` gefunden.`,
          ephemeral: true
        });
      }
      await interaction.reply({
        content: `> \`✏️\` » Grund für **${entry.username || entry.minecraftName}** wurde aktualisiert.`,
        ephemeral: false
      });
      await updateBlacklistMessage();
      return;
    }

    // Subcommand: list (Paginiert mit Buttons)
    if (sub === 'list') {
      const entries = await Blacklist.find();
      if (!entries.length) {
        return interaction.reply({ content: '> `❗` » Die Blacklist ist leer.', ephemeral: false });
      }

      const pageSize = 5;
      let currentPage = 0;
      const maxPage = Math.ceil(entries.length / pageSize) - 1;

      const getPageEmbed = async (page) => createBlacklistEmbed(page);
      const listMessage = await interaction.channel.send({
        embeds: [await getPageEmbed(currentPage)],
        components: createButtons(currentPage, maxPage)
      });
      await interaction.reply({ content: 'Blacklist-Übersicht gesendet.', ephemeral: true });

      const collector = listMessage.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id });
      collector.on('collect', async (i) => {
        if (i.customId === 'blacklist_back') currentPage = Math.max(currentPage - 1, 0);
        else if (i.customId === 'blacklist_next') currentPage = Math.min(currentPage + 1, maxPage);
        await i.update({ embeds: [await getPageEmbed(currentPage)], components: createButtons(currentPage, maxPage) });
      });
      collector.on('end', () => listMessage.edit({ components: [] }));
    }
  }
};
