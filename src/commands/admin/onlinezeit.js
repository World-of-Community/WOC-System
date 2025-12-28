const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("onlinezeit-manage")
    .setDescription("» Verwalte die Onlinezeit eines Nutzers.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName("add")
        .setDescription("» Onlinezeit hinzufügen.")
        .addUserOption(opt => opt.setName("nutzer").setDescription("» Nutzer").setRequired(true))
        .addIntegerOption(opt => opt.setName("stunden").setDescription("» Stunden hinzufügen").setRequired(true)),
    )
    .addSubcommand(sub =>
      sub.setName("remove")
        .setDescription("» Onlinezeit entfernen.")
        .addUserOption(opt => opt.setName("nutzer").setDescription("» Nutzer").setRequired(true))
        .addIntegerOption(opt => opt.setName("stunden").setDescription("» Stunden entfernen").setRequired(true)),
    )
    .addSubcommand(sub =>
      sub.setName("set")
        .setDescription("» Onlinezeit festlegen.")
        .addUserOption(opt => opt.setName("nutzer").setDescription("» Nutzer").setRequired(true))
        .addIntegerOption(opt => opt.setName("stunden").setDescription("» Neue Onlinezeit (in Stunden)").setRequired(true)),
    )
    .addSubcommand(sub =>
      sub.setName("edit")
        .setDescription("» Onlinezeit manuell verändern.")
        .addUserOption(opt => opt.setName("nutzer").setDescription("» Nutzer").setRequired(true))
        .addIntegerOption(opt =>
          opt.setName("stunden")
            .setDescription("» Wert (positiv oder negativ) in Stunden")
            .setRequired(true)),
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const user = interaction.options.getUser("nutzer");

      let userData = await userdb.findOne({ userID: user.id });
      if (!userData) {
        userData = new userdb({ userID: user.id, onlineTime: 0 });
      }

      let message = "";

      switch (subcommand) {
      case "add": {
        const hours = interaction.options.getInteger("stunden");
        if (hours < 0) {return interaction.reply({ content: "> `❌` » Stunden dürfen nicht negativ sein.", ephemeral: true });}

        const ms = hours * 3600000;
        userData.onlineTime = (userData.onlineTime || 0) + ms;
        message = `> \`✅\` » <@${user.id}> wurde eine Onlinezeit von \`${hours}h\` hinzugefügt.`;
        break;
      }

      case "remove": {
        const hours = interaction.options.getInteger("stunden");
        if (hours < 0) {return interaction.reply({ content: "> `❌` » Stunden dürfen nicht negativ sein.", ephemeral: true });}

        const ms = hours * 3600000;
        userData.onlineTime = Math.max(0, (userData.onlineTime || 0) - ms);
        message = `> \`✅\` » \`${hours}h\` von der Onlinezeit von <@${user.id}> entfernt.`;
        break;
      }

      case "set": {
        const hours = interaction.options.getInteger("stunden");
        if (hours < 0) {return interaction.reply({ content: "> `❌` » Stunden dürfen nicht negativ sein.", ephemeral: true });}

        userData.onlineTime = hours * 3600000;
        message = `> \`✅\` » Die Onlinezeit von <@${user.id}> wurde auf \`${hours}h\` gesetzt.`;
        break;
      }

      case "edit": {
        const hours = interaction.options.getInteger("stunden"); // jetzt Stunden
        const ms = hours * 3600000;

        userData.onlineTime = (userData.onlineTime || 0) + ms;
        if (userData.onlineTime < 0) {userData.onlineTime = 0;}

        const totalHours = Math.floor(userData.onlineTime / 3600000);
        const sign = hours >= 0 ? "hinzugefügt" : "abgezogen";

        message = `> \`✅\` » Onlinezeit von <@${user.id}> wurde um \`${hours}h\` ${sign}. Neue Onlinezeit: \`${totalHours}h\`.`;
        break;
      }
      }

      // Optional: letzter Onlinezeitpunkt aktualisieren
      userData.lastOnline = new Date();
      await userData.save();

      await interaction.reply({ content: message, ephemeral: true });

    } catch (err) {
      console.error("Fehler bei /onlinezeit-manage:", err);
      await interaction.reply({ content: "> `❌` » Es ist ein Fehler aufgetreten.", ephemeral: true });
    }
  },
};
