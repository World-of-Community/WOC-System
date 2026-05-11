const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Termin = require('../../../Datenbank/termindb');

const remindMap = new Map();

// Hilfsfunktion: Deutsches Datum parsen
// Unterstützt:
// 30.07.2025
// 30.07.2025 18:00
function parseGermanDateTime(input) {
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?$/;
  const match = input.match(regex);

  if (!match) return null;

  const [, day, month, year, hour, minute] = match;

  const hasTime = hour !== undefined && minute !== undefined;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hasTime ? Number(hour) : 0,
    hasTime ? Number(minute) : 0
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return {
    timestamp: date.getTime(),
    hasTime,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('termin')
    .setDescription('Terminverwaltung 📅')

    .addStringOption(opt =>
      opt.setName('action')
        .setDescription('Aktion: add, edit, remove, list')
        .setRequired(true)
        .addChoices(
          { name: 'add', value: 'add' },
          { name: 'edit', value: 'edit' },
          { name: 'remove', value: 'remove' },
          { name: 'list', value: 'list' },
        ))

    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Nutzer (für add, edit, remove)'))

    .addStringOption(opt =>
      opt.setName('zeit')
        .setDescription('Datum optional mit Uhrzeit (z.B. 30.07.2025 oder 30.07.2025 18:00)'))

    .addUserOption(opt =>
      opt.setName('teammitglied')
        .setDescription('Optionales Teammitglied (nur für add)'))

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const action = interaction.options.getString('action');
    const user = interaction.options.getUser('user');
    const zeitInput = interaction.options.getString('zeit');
    const teamMember = interaction.options.getUser('teammitglied');

    if (['add', 'edit', 'remove'].includes(action) && !user) {
      return interaction.reply({
        content: '> `❌` » Bitte gib einen Nutzer an.',
        ephemeral: true
      });
    }

    if (['add', 'edit'].includes(action) && !zeitInput) {
      return interaction.reply({
        content: '> `❌` » Bitte gib ein Datum an.',
        ephemeral: true
      });
    }

    // TERMIN ERSTELLEN
    if (action === 'add') {

      const parsed = parseGermanDateTime(zeitInput);

      if (!parsed) {
        return interaction.reply({
          content: '> `❌` » Ungültiges Datum! Beispiele: `30.07.2025` oder `30.07.2025 18:00`',
          ephemeral: true
        });
      }

      const { timestamp, hasTime } = parsed;

      const existing = await Termin.findOne({ userId: user.id });

      if (existing) {
        return interaction.reply({
          content: '> `❗` » Nutzer hat schon einen Termin!',
          ephemeral: true
        });
      }

      await Termin.create({
        userId: user.id,
        timestamp,
        hasTime,
        createdBy: interaction.user.id,
        ...(teamMember ? { teamMemberId: teamMember.id } : {}),
      });

      return interaction.reply({
        content:
          `> \`✅\` » Termin für ${user} wurde erstellt.\n` +
          `> \`🗓️\` » ${
            hasTime
              ? `<t:${Math.floor(timestamp / 1000)}:F>`
              : `<t:${Math.floor(timestamp / 1000)}:D>\n> \`🕒\` » Keine Uhrzeit angegeben`
          }` +
          (teamMember ? `\n> \`👥\` » Teammitglied: ${teamMember}` : ''),
        ephemeral: true,
      });
    }

    // TERMIN BEARBEITEN
    if (action === 'edit') {

      const parsed = parseGermanDateTime(zeitInput);

      if (!parsed) {
        return interaction.reply({
          content: '> `❌` » Ungültiges Datum! Beispiele: `30.07.2025` oder `30.07.2025 18:00`',
          ephemeral: true
        });
      }

      const { timestamp, hasTime } = parsed;

      const termin = await Termin.findOne({ userId: user.id });

      if (!termin) {
        return interaction.reply({
          content: '> `❗` » Kein Termin gefunden.',
          ephemeral: true
        });
      }

      termin.timestamp = timestamp;
      termin.hasTime = hasTime;

      await termin.save();

      return interaction.reply({
        content:
          `> \`✅\` » Termin von ${user} wurde geändert.\n` +
          `> \`🗓️\` » ${
            hasTime
              ? `<t:${Math.floor(timestamp / 1000)}:F>`
              : `<t:${Math.floor(timestamp / 1000)}:D>\n> \`🕒\` » Keine Uhrzeit angegeben`
          }`,
        ephemeral: true,
      });
    }

    // TERMIN LÖSCHEN
    if (action === 'remove') {

      const termin = await Termin.findOneAndDelete({ userId: user.id });

      if (!termin) {
        return interaction.reply({
          content: '> `❗` » Kein Termin gefunden.',
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `> \`🗑️\` » Termin für ${user} wurde gelöscht.`,
        ephemeral: true
      });
    }

    // ALLE TERMINE
    if (action === 'list') {

      const termine = await Termin.find().sort({ timestamp: 1 });

      if (termine.length === 0) {
        return interaction.reply({
          content: '> `ℹ️` » Es sind keine Termine gespeichert.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('`📅` Alle Termine')
        .setColor(0x2b2d31)
        .setFooter({ text: `Gesamt: ${termine.length}` });

      for (const t of termine) {

        const userTag = await interaction.client.users
          .fetch(t.userId)
          .then(u => u.tag)
          .catch(() => '❓');

        const teamTag = t.teamMemberId
          ? await interaction.client.users
              .fetch(t.teamMemberId)
              .then(u => u.tag)
              .catch(() => '❓')
          : '–';

        embed.addFields({
          name: `> \`👤\` » ${userTag}`,
          value:
            `> \`🗓️\` » ${
              t.hasTime
                ? `<t:${Math.floor(t.timestamp / 1000)}:F>`
                : `<t:${Math.floor(t.timestamp / 1000)}:D>\n> \`🕒\` » Keine Uhrzeit angegeben`
            }\n` +
            `> \`👥\` » Teammitglied: ${teamTag}`,
          inline: false,
        });
      }

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    return interaction.reply({
      content: '> `❌` » Ungültige Aktion!',
      ephemeral: true
    });
  },
};