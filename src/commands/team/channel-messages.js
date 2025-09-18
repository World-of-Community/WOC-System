const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const messagedb = require("../../../Datenbank/messagedb"); // anpassen

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channel-messages")
    .setDescription("» Nachrichtenanzahl verwalten 📊")
    .addSubcommand(sub =>
      sub
        .setName("set")
        .setDescription("» Setzt die Nachrichtenanzahl auf einen bestimmten Wert.")
        .addIntegerOption(opt =>
          opt.setName("anzahl").setDescription("Neue Nachrichtenanzahl").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("edit")
        .setDescription("» Ändert die Nachrichtenanzahl um + oder -.")
        .addIntegerOption(opt =>
          opt.setName("anzahl").setDescription("Anzahl, um die geändert wird (+/-)").setRequired(true)
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
      const newValue = interaction.options.getInteger("anzahl");
      messageData.messages = newValue;
      await messageData.save();
      return interaction.reply({ content: `> \`✅\` » Nachrichtenanzahl wurde auf **${newValue}** gesetzt.`, ephemeral: true });
    }

    if (sub === "edit") {
      const diff = interaction.options.getInteger("anzahl");
      messageData.messages += diff;
      if (messageData.messages < 0) messageData.messages = 0; // kein Minus
      await messageData.save();
      return interaction.reply({ content: `> \`✏️\` » Nachrichtenanzahl wurde um **${diff}** geändert. Aktuell: **${messageData.messages}**.`, ephemeral: true });
    }

    if (sub === "remove") {
      messageData.messages = 0;
      await messageData.save();
      return interaction.reply({ content: `> \`🗑️\` » Nachrichtenanzahl wurde zurückgesetzt (0).`, ephemeral: true });
    }
  },
};
