import { EmbedBuilder } from "discord.js";
import logger from "../../functions/logger.js";

export default {
  name: "clear",
  description: "» Lösche eine bestimmte Anzahl von Nachrichten. 🗑️",
  type: 1,
  default_member_permissions: "8192",
  options: [
    {
      "type": 4,
      "name": "anzahl",
      "description": "» Wie viele Nachrichten möchtest du löschen?",
      "required": true,
    },
    {
      "name": "kanal",
      "description": "» In welchen Kanal soll gelöscht werden?",
      "required": false,
      "type": 7,
    },
    {
      "type": 3,
      "name": "grund",
      "description": "» Wie lautet die Begründung?",
      "required": false,
    },
  ],

  async run(client, interaction) {

    const messagedelete = interaction.options.getInteger("anzahl");
    const kanal = interaction.options.getChannel("kanal") || interaction.channel;
    const grund = interaction.options.getString("grund") || "Kein Grund angegeben";

    if (messagedelete < 1 || messagedelete > 100) {
      return interaction.reply({ content: "> `❗` » Bitte gib eine Anzahl von Nachrichten zwischen `1 und 100` an.", ephemeral: true });
    }

    try {
      const messages = await kanal.bulkDelete(messagedelete, true);
      const infomessagedeleteembed = new EmbedBuilder()
        .setDescription(`> \`✅\` » Es wurden \`${messages.size}\` Nachrichten gelöscht.\n\nHier ist eine Übersicht des Vorgangs:\n- Anzahl: \`${messages.size}\`\n- Kanal: ${kanal}\n- Grund: \`${grund}\``)
        .setColor("Blurple")
        .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
        .setTimestamp();

      await interaction.reply({ embeds: [infomessagedeleteembed], ephemeral: true });
    } catch (error) {
      logger.error("Fehler beim Löschen von Nachrichten:", error);
      interaction.reply({ content: "> `❗` » Beim Versuch, Nachrichten zu löschen, ist ein Fehler aufgetreten.", ephemeral: true });
    }
  },
};
