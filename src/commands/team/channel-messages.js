import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import messagedb from "../../../Datenbank/messagedb.js";

export default {
  data: new SlashCommandBuilder()
    .setName("channel-messages")
    .setDescription("» Nachrichtenanzahl verwalten 📊")
    .addSubcommand(sub =>
      sub
        .setName("set")
        .setDescription("» Setzt die Nachrichtenanzahl auf einen bestimmten Wert.")
        .addStringOption(opt =>
          opt.setName("anzahl").setDescription("Neue Nachrichtenanzahl (z. B. 3.786.475)").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("edit")
        .setDescription("» Ändert die Nachrichtenanzahl um + oder -.")
        .addStringOption(opt =>
          opt.setName("anzahl").setDescription("Anzahl, um die geändert wird (+/-) (z. B. -1.000)").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("» Setzt die Nachrichtenanzahl auf 0 zurück.")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    let messageData = await messagedb.findOne({ guildID: interaction.guild.id });
    if (!messageData) {
      messageData = await messagedb.create({ guildID: interaction.guild.id, messages: 0 });
    }

    if (sub === "set") {
      const raw = interaction.options.getString("anzahl");
      const newValue = parseInt(raw.replace(/\./g, ""), 10);

      if (isNaN(newValue)) {
        return interaction.reply({ content: "> ❌ » Ungültige Zahl eingegeben.", ephemeral: true });
      }

      messageData.messages = newValue;
      await messageData.save();
      return interaction.reply({ content: `> \`✅\` » Nachrichtenanzahl wurde auf **${newValue.toLocaleString("de-DE")}** gesetzt.`, ephemeral: true });
    }

    if (sub === "edit") {
      const raw = interaction.options.getString("anzahl");
      const diff = parseInt(raw.replace(/\./g, ""), 10);

      if (isNaN(diff)) {
        return interaction.reply({ content: "> ❌ » Ungültige Zahl eingegeben.", ephemeral: true });
      }

      messageData.messages += diff;
      if (messageData.messages < 0) messageData.messages = 0;
      await messageData.save();
      return interaction.reply({ content: `> \`✏️\` » Nachrichtenanzahl wurde um **${diff.toLocaleString("de-DE")}** geändert. Aktuell: **${messageData.messages.toLocaleString("de-DE")}**.`, ephemeral: true });
    }

    if (sub === "remove") {
      messageData.messages = 0;
      await messageData.save();
      return interaction.reply({ content: `> \`🗑️\` » Nachrichtenanzahl wurde zurückgesetzt (0).`, ephemeral: true });
    }
  },
};
