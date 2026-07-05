import {EmbedBuilder} from "discord.js";
import warndb from "../../models/warndb.js";
import logger from "../../functions/logger.js";

export default {
  name: "warn",
  description: "» Verwaltet Warnungen für Benutzer.",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      "type": 1,
      "name": "add",
      "description": "» Füge eine Warnung für einen Benutzer hinzu.",
      "options": [
        {
          "name": "user",
          "description": "Der Benutzer, der gewarnt werden soll",
          "required": true,
          "type": 6,
        },
        {
          "type": 3,
          "name": "grund",
          "description": "Der Grund für die Warnung",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "remove",
      "description": "» Entferne eine Warnung für einen Benutzer.",
      "options": [
        {
          "name": "user",
          "description": "Der Benutzer, dessen Warnung entfernt werden soll",
          "required": true,
          "type": 6,
        },
        {
          "type": 3,
          "name": "grund",
          "description": "Der Grund für die Warnung (optional)",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "refresh",
      "description": "» Aktualisiere die Warnliste.",
      "options": [],
    },
    {
      "type": 1,
      "name": "list",
      "description": "» Zeigt die Warnliste der Benutzer an.",
      "options": [],
    },
  ],

  async run(client, interaction) {
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
        logger.error(error);
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
        logger.error(error);
        await interaction.reply({ content: "`❌` » Ein Fehler ist aufgetreten, während die Warnliste abgerufen wurde.", ephemeral: true });
      }
    }
  },
};
