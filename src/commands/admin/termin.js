const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Termin = require("../../../Datenbank/termindb");

// Hilfsfunktion: Deutsches Datum parsen (z.B. 30.07.2025 18:00)
function parseGermanDateTime(input) {
  const regex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
  const match = input.match(regex);
  if (!match) {return NaN;}

  const [ , day, month, year, hour, minute ] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return NaN;
  }
  return date.getTime();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("termin")
    .setDescription("Terminverwaltung 📅")
    .addStringOption(opt =>
      opt.setName("action")
        .setDescription("Aktion: add, edit, remove, list")
        .setRequired(true)
        .addChoices(
          { name: "add", value: "add" },
          { name: "edit", value: "edit" },
          { name: "remove", value: "remove" },
          { name: "list", value: "list" },
        ))
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("Nutzer (für add, edit, remove)"))
    .addStringOption(opt =>
      opt.setName("zeit")
        .setDescription("Datum & Uhrzeit (z. B. 30.07.2025 18:00) (für add, edit)"))
    .addUserOption(opt =>
      opt.setName("teammitglied")
        .setDescription("Optionales Teammitglied (nur für add)"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const action = interaction.options.getString("action");
    const user = interaction.options.getUser("user");
    const zeitInput = interaction.options.getString("zeit");
    const teamMember = interaction.options.getUser("teammitglied");

    if (["add", "edit", "remove"].includes(action) && !user) {
      return interaction.reply({ content: "> `❌` » Bitte gib einen Nutzer an.", ephemeral: true });
    }
    if (["add", "edit"].includes(action) && !zeitInput) {
      return interaction.reply({ content: "> `❌` » Bitte gib ein gültiges Datum und Uhrzeit an.", ephemeral: true });
    }

    if (action === "add") {
      const timestamp = parseGermanDateTime(zeitInput);
      if (isNaN(timestamp))
      {return interaction.reply({ content: "> `❌` » Ungültiges Datum! Beispiel: `30.07.2025 18:00`", ephemeral: true });}

      const existing = await Termin.findOne({ userId: user.id });
      if (existing)
      {return interaction.reply({ content: "> `❗` » Nutzer hat schon einen Termin!", ephemeral: true });}

      await Termin.create({
        userId: user.id,
        timestamp,
        createdBy: interaction.user.id,
        ...(teamMember ? { teamMemberId: teamMember.id } : {}),
      });

      return interaction.reply({
        content:
          `> \`✅\` » Termin für ${user} am <t:${Math.floor(timestamp / 1000)}:F> wurde erstellt.` +
          (teamMember ? `\n> \`👥\` » Teammitglied: ${teamMember}` : ""),
        ephemeral: true,
      });
    }

    if (action === "edit") {
      const timestamp = parseGermanDateTime(zeitInput);
      if (isNaN(timestamp))
      {return interaction.reply({ content: "> `❌` » Ungültiges Datum! Beispiel: `30.07.2025 18:00`", ephemeral: true });}

      const termin = await Termin.findOne({ userId: user.id });
      if (!termin)
      {return interaction.reply({ content: "> `❗` » Kein Termin gefunden.", ephemeral: true });}

      termin.timestamp = timestamp;
      await termin.save();

      return interaction.reply({
        content: `> \`✅\` » Termin von ${user} wurde geändert auf <t:${Math.floor(timestamp / 1000)}:F>`,
        ephemeral: true,
      });
    }

    if (action === "remove") {
      const termin = await Termin.findOneAndDelete({ userId: user.id });
      if (!termin)
      {return interaction.reply({ content: "> `❗` » Kein Termin gefunden.", ephemeral: true });}

      return interaction.reply({ content: `> \`🗑️\` » Termin für ${user} wurde gelöscht.`, ephemeral: true });
    }

    if (action === "list") {
      const termine = await Termin.find().sort({ timestamp: 1 });
      if (termine.length === 0)
      {return interaction.reply({ content: "> `ℹ️` » Es sind keine Termine gespeichert.", ephemeral: true });}

      const embed = new EmbedBuilder()
        .setTitle("`📅` Alle Termine")
        .setColor(0x2b2d31)
        .setFooter({ text: `Gesamt: ${termine.length}` });

      for (const t of termine) {
        const userTag = await interaction.client.users.fetch(t.userId).then(u => u.tag).catch(() => "❓");
        const teamTag = t.teamMemberId
          ? await interaction.client.users.fetch(t.teamMemberId).then(u => u.tag).catch(() => "❓")
          : "–";

        embed.addFields({
          name: `> \`👤\` » ${userTag}`,
          value: `> \`🗓️\` » <t:${Math.floor(t.timestamp / 1000)}:F>\n> \`👥\` » Teammitglied: ${teamTag}`,
          inline: false,
        });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    return interaction.reply({ content: "> `❌` » Ungültige Aktion!", ephemeral: true });
  },
};
