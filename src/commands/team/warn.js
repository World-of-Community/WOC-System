const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const warndb = require("../../../Datenbank/warndb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("» Verwaltet Warnungen für Benutzer.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand =>
      subcommand
        .setName("add")
        .setDescription("» Füge eine Warnung für einen Benutzer hinzu.")
        .addUserOption(option => option.setName("user").setDescription("Der Benutzer, der gewarnt werden soll").setRequired(true))
        .addStringOption(option => option.setName("grund").setDescription("Der Grund für die Warnung").setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("remove")
        .setDescription("» Entferne eine Warnung für einen Benutzer.")
        .addUserOption(option => option.setName("user").setDescription("Der Benutzer, dessen Warnung entfernt werden soll").setRequired(true))
        .addStringOption(option => option.setName("grund").setDescription("Der Grund für die Warnung (optional)").setRequired(false)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("refresh")
        .setDescription("» Aktualisiere die Warnliste."),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("» Zeigt die Warnliste der Benutzer an."),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const member = interaction.options.getMember("user");
      const reason = interaction.options.getString("grund");

      if (!member) {
        return interaction.reply({ content: "`❌` » Dieser Benutzer ist nicht im Server.", ephemeral: true });
      }

      // Warnung in der Datenbank speichern
      const warningData = await warndb.findOne({ guildId: interaction.guild.id, userId: member.id });
      if (warningData) {
        warningData.warnings.push({ reason });
        await warningData.save();
      } else {
        await new warndb({
          guildId: interaction.guild.id,
          userId: member.id,
          warnings: [{ reason }],
        }).save();
      }

      await interaction.reply({ content: `> \`✅\` » Warnung für ${member} hinzugefügt, Grund: ${reason}`, ephemeral: true });

    } else if (subcommand === "remove") {
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("grund") || "";

      const warningData = await warndb.findOne({ guildId: interaction.guild.id, userId: user.id });

      if (warningData) {
        const filteredWarnings = warningData.warnings.filter(w => w.reason !== reason);

        if (filteredWarnings.length === warningData.warnings.length) {
          await interaction.reply({ content: `> \`❌\` » Keine Warnung für ${user} mit dem Grund "${reason}" gefunden.`, ephemeral: true });
        } else {
          warningData.warnings = filteredWarnings;
          await warningData.save();
          await interaction.reply({ content: `> \`✅\` » Warnung für ${user} entfernt.`, ephemeral: true });
        }
      } else {
        await interaction.reply({ content: `> \`❌\` » Keine Warnungen für ${user} gefunden.`, ephemeral: true });
      }

    } else if (subcommand === "refresh") {
      try {
        const warnings = await warndb.find({ guildId: interaction.guild.id });

        let list = "";
        if (warnings.length === 0) {
          list = "> `❌` » Keine Warnungen vorhanden!";
        } else {
          warnings.forEach(({ userId, warnings }) => {
            const warnCount = warnings.length;
            list += `<@${userId}> - \`${warnCount}\` Warnungen\n`;
          });
        }

        const updateEmbed = new EmbedBuilder()
          .setTitle("Information zu den Warnungen der Nutzer")
          .setDescription(list)
          .setColor("Red");

        await interaction.reply({ embeds: [updateEmbed], ephemeral: true });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "`❌` » Ein Fehler ist aufgetreten, während die Warnliste aktualisiert wurde.", ephemeral: true });
      }

    } else if (subcommand === "list") {
      try {
        const warningData = await warndb.find({ guildId: interaction.guild.id });

        if (warningData.length === 0) {
          const noWarningsEmbed = new EmbedBuilder()
            .setTitle("Information zu den Warnungen der Nutzer")
            .setDescription("> `❌` » Keine Warnungen vorhanden!")
            .setColor("Red");
          await interaction.reply({ embeds: [noWarningsEmbed], ephemeral: true });
          return;
        }

        let list = "";
        for (const { userId, warnings } of warningData) {
          list += `<@${userId}> - \`${warnings.length}\` Warnungen\n`;
        }

        const WarnEmbed = new EmbedBuilder()
          .setTitle("Warnliste der Nutzer")
          .setDescription(list)
          .setColor("Red");

        await interaction.reply({ embeds: [WarnEmbed], ephemeral: true });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "`❌` » Ein Fehler ist aufgetreten, während die Warnliste abgerufen wurde.", ephemeral: true });
      }
    }
  },
};
