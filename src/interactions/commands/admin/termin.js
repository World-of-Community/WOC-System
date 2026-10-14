import { EmbedBuilder } from "discord.js";
import Termin from "#models/Termin.js";

// Unterstützt:
// 30.07.2025
// 30.07.2025 18:00
function parseGermanDateTime(input) {
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?$/;
  const match = input.match(regex);

  if (!match) {return null;}

  const [, day, month, year, hour, minute] = match;

  const hasTime = hour !== undefined && minute !== undefined;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hasTime ? Number(hour) : 0,
    hasTime ? Number(minute) : 0,
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

export default {
  name: "termin",
  description: "Terminverwaltung 📅",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 3,
      choices: [
        {
          name: "add",
          value: "add",
        },
        {
          name: "edit",
          value: "edit",
        },
        {
          name: "remove",
          value: "remove",
        },
        {
          name: "list",
          value: "list",
        },
      ],
      name: "action",
      description: "Aktion: add, edit, remove, list",
      required: true,
    },
    {
      name: "user",
      description: "Nutzer (für add, edit, remove)",
      required: false,
      type: 6,
    },
    {
      type: 3,
      name: "zeit",
      description: "Datum optional mit Uhrzeit",
      required: false,
    },
    {
      type: 3,
      name: "notiz",
      description: "Optionale Notiz",
      required: false,
    },
    {
      name: "teammitglied",
      description: "Optionales Teammitglied (nur für add)",
      required: false,
      type: 6,
    },
  ],

  async run(client, interaction) {

    const action = interaction.options.getString("action");
    const user = interaction.options.getUser("user");
    const zeitInput = interaction.options.getString("zeit");
    const note = interaction.options.getString("notiz");
    const teamMember = interaction.options.getUser("teammitglied");

    if (["add", "edit", "remove"].includes(action) && !user) {
      return interaction.reply({
        content: "> `❌` » Bitte gib einen Nutzer an.",
        ephemeral: true,
      });
    }

    if (["add", "edit"].includes(action) && !zeitInput) {
      return interaction.reply({
        content: "> `❌` » Bitte gib ein Datum an.",
        ephemeral: true,
      });
    }

    // ADD
    if (action === "add") {

      const parsed = parseGermanDateTime(zeitInput);

      if (!parsed) {
        return interaction.reply({
          content: "> `❌` » Ungültiges Datum! Beispiele: `30.07.2025` oder `30.07.2025 18:00`",
          ephemeral: true,
        });
      }

      const { timestamp, hasTime } = parsed;

      const existing = await Termin.findOne({ userId: user.id });

      if (existing) {
        return interaction.reply({
          content: "> `❗` » Nutzer hat schon einen Termin!",
          ephemeral: true,
        });
      }

      await Termin.create({
        userId: user.id,
        timestamp,
        hasTime,
        note: note || null,
        createdBy: interaction.user.id,
        ...(teamMember ? { teamMemberId: teamMember.id } : {}),
      });

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("`✅` Termin erstellt")
        .setDescription(
          `> \`👤\` » Nutzer: ${user}\n` +
          `> \`🗓️\` » ${
            hasTime
              ? `<t:${Math.floor(timestamp / 1000)}:F>`
              : `<t:${Math.floor(timestamp / 1000)}:D>\n> \`🕒\` » Keine Uhrzeit angegeben`
          }` +
          (teamMember ? `\n> \`👥\` » Teammitglied: ${teamMember}` : "") +
          (note ? `\n> \`📝\` » Notiz: ${note}` : ""),
        );

      return interaction.reply({ embeds: [embed], ephemeral: false });
    }

    // EDIT
    if (action === "edit") {

      const parsed = parseGermanDateTime(zeitInput);

      if (!parsed) {
        return interaction.reply({
          content: "> `❌` » Ungültiges Datum! Beispiele: `30.07.2025` oder `30.07.2025 18:00`",
          ephemeral: true,
        });
      }

      const { timestamp, hasTime } = parsed;

      const termin = await Termin.findOne({ userId: user.id });

      if (!termin) {
        return interaction.reply({
          content: "> `❗` » Kein Termin gefunden.",
          ephemeral: true,
        });
      }

      termin.timestamp = timestamp;
      termin.hasTime = hasTime;

      if (note) {
        termin.note = note;
      }

      await termin.save();

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("`✏️` Termin bearbeitet")
        .setDescription(
          `> \`👤\` » Nutzer: ${user}\n` +
          `> \`🗓️\` » ${
            hasTime
              ? `<t:${Math.floor(timestamp / 1000)}:F>`
              : `<t:${Math.floor(timestamp / 1000)}:D>\n> \`🕒\` » Keine Uhrzeit angegeben`
          }` +
          (termin.note ? `\n> \`📝\` » Notiz: ${termin.note}` : ""),
        );

      return interaction.reply({ embeds: [embed], ephemeral: false });
    }

    // REMOVE
    if (action === "remove") {

      const termin = await Termin.findOneAndDelete({ userId: user.id });

      if (!termin) {
        return interaction.reply({
          content: "> `❗` » Kein Termin gefunden.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("`🗑️` Termin gelöscht")
        .setDescription(`> \`👤\` » Termin für ${user} wurde gelöscht.`);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // LIST
    if (action === "list") {

      const termine = await Termin.find().sort({ timestamp: 1 });

      if (termine.length === 0) {
        return interaction.reply({
          content: "> `ℹ️` » Es sind keine Termine gespeichert.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("`📅` Alle Termine")
        .setColor(0x2b2d31)
        .setFooter({ text: `Gesamt: ${termine.length}` });

      for (const t of termine) {

        const userTag = await interaction.client.users
          .fetch(t.userId)
          .then(u => u.tag)
          .catch(() => "❓");

        const teamTag = t.teamMemberId
          ? await interaction.client.users
            .fetch(t.teamMemberId)
            .then(u => u.tag)
            .catch(() => "❓")
          : "–";

        embed.addFields({
          name: `> \`👤\` » ${userTag}`,
          value:
            `> \`🗓️\` » ${
              t.hasTime
                ? `<t:${Math.floor(t.timestamp / 1000)}:F>`
                : `<t:${Math.floor(t.timestamp / 1000)}:D>\n> \`🕒\` » Keine Uhrzeit angegeben`
            }\n` +
            `> \`👥\` » Teammitglied: ${teamTag}` +
            (t.note ? `\n> \`📝\` » Notiz: ${t.note}` : ""),
          inline: false,
        });
      }

      return interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });
    }

    return interaction.reply({
      content: "> `❌` » Ungültige Aktion!",
      ephemeral: true,
    });
  },
};

