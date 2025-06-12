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
          opt.setName('input').setDescription('User-ID oder Username').setRequired(true))
        .addStringOption(opt =>
          opt.setName('grund').setDescription('Grund für die Blacklist').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('» Entfernt jemanden von der Blacklist')
        .addStringOption(opt =>
          opt.setName('input').setDescription('User-ID oder Username').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('» Zeigt alle geblacklisteten Personen'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const input = interaction.options.getString('input');
      const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

      let user;

      try {
        // Versuche input als User-ID zu holen (funktioniert auch wenn User nicht im Server ist)
        user = await interaction.client.users.fetch(input);
      } catch {
        // Falls nicht als ID, suche im Guild-Member Cache nach Username (case-insensitive)
        const member = interaction.guild.members.cache.find(m => m.user.tag.toLowerCase() === input.toLowerCase() || m.user.username.toLowerCase() === input.toLowerCase());
        if (member) {
          user = member.user;
        } else {
          return interaction.reply({
            content: `> \`❗\` » Nutzer \`${input}\` wurde nicht gefunden. Bitte gib die User-ID an, falls der Nutzer nicht auf dem Server ist.`,
            ephemeral: true
          });
        }
      }

      if (!user || !user.id || !user.tag) {
        return interaction.reply({
          content: `> \`❗\` » Ungültiger Nutzer.`,
          ephemeral: true
        });
      }

      const exists = await Blacklist.findOne({ userId: user.id });
      if (exists) {
        return interaction.reply({
          content: `> \`❗\` » Der Nutzer ${user.tag} ist bereits auf der Blacklist.`,
          ephemeral: true
        });
      }

      // Speichern in DB
      await Blacklist.create({ userId: user.id, username: user.tag, reason });
      return interaction.reply({
        content: `> \`✅\` » **${user.tag}** wurde zur Blacklist hinzugefügt.`,
        ephemeral: true
      });

    } else if (sub === 'remove') {
      const input = interaction.options.getString('input');

      let userIdToRemove;

      try {
        // Versuch input als User-ID
        const user = await interaction.client.users.fetch(input);
        userIdToRemove = user.id;
      } catch {
        // Falls nicht als ID, suche DB nach username (case-insensitive)
        const found = await Blacklist.findOne({ username: new RegExp(`^${input}$`, 'i') });
        if (found) {
          userIdToRemove = found.userId;
        } else {
          return interaction.reply({
            content: `> \`❗\` » Nutzer \`${input}\` ist nicht auf der Blacklist.`,
            ephemeral: true
          });
        }
      }

      if (!userIdToRemove) {
        return interaction.reply({
          content: `> \`❗\` » Nutzer \`${input}\` konnte nicht ermittelt werden.`,
          ephemeral: true
        });
      }

      const removed = await Blacklist.findOneAndDelete({ userId: userIdToRemove });
      if (!removed) {
        return interaction.reply({
          content: `> \`❗\` » Nutzer \`${input}\` ist nicht auf der Blacklist.`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `> \`❌\` » Nutzer **${removed.username || 'Unbekannt'}** wurde von der Blacklist entfernt.`,
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

      const lines = entries.map((entry, i) => {
        const userId = entry.userId || 'Unbekannt';
        const username = entry.username || 'Unbekannt';
        const reason = entry.reason || 'Kein Grund angegeben';
        const mention = `<@${userId}>`;

        return `Verbot bzw gebannt oder dürfen nicht auf den Discord und den Minecraft Server drauf.\n\n**${i + 1}.** ${mention} – ${username} (\`${userId}\`)\n> Grund: ${reason}`;
      });

      const embed = new EmbedBuilder()
        .setTitle('`📄` Blacklist Nutzer')
        .setColor('Red')
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: `Einträge insgesamt: ${entries.length}` });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
