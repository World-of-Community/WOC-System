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
          opt.setName('name').setDescription('User-ID oder Name').setRequired(true))
        .addStringOption(opt =>
          opt.setName('grund').setDescription('Grund für die Blacklist').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('» Entfernt jemanden von der Blacklist')
        .addStringOption(opt =>
          opt.setName('name').setDescription('User-ID oder Name').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('» Zeigt alle geblacklisteten Personen'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const name = interaction.options.getString('name');
      const reason = interaction.options.getString('grund');

      const exists = await Blacklist.findOne({ name });
      if (exists) {
        return interaction.reply({
          content: `> \`❗\` » Dieser Nutzer (${name}) ist bereits auf der Blacklist.`,
          ephemeral: true
        });
      }

      await Blacklist.create({ name, reason });
      return interaction.reply({
        content: `> \`✅\` » **${name}** wurde zur Blacklist hinzugefügt.`,
        ephemeral: true
      });

    } else if (sub === 'remove') {
      const name = interaction.options.getString('name');
      const removed = await Blacklist.findOneAndDelete({ name });

      if (!removed) {
        return interaction.reply({
          content: `\`❗\` » Dieser Nutzer (${name}) ist nicht auf der Blacklist.`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `> \`❌\` » **${name}** wurde von der Blacklist entfernt.`,
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

      const lines = await Promise.all(entries.map(async (entry, i) => {
        const id = entry.name; // 'name' ist hier die User-ID
        let mention = id;      // fallback falls Fetch nicht klappt
        let username = id;

        try {
          const user = await interaction.client.users.fetch(id);
          mention = `<@${user.id}>`;
          username = user.username;
        } catch (_) {
          // falls User nicht gefunden wird, bleibt fallback
        }

        return `**${i + 1}.** ${mention} – ${username} (\`${id}\`)` + (entry.reason ? `\n> Grund: *${entry.reason}*` : '');
      }));

      const embed = new EmbedBuilder()
        .setTitle('`📄` Blacklist Nutzer')
        .setColor('Red')
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: `Einträge insgesamt: ${entries.length}` });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
