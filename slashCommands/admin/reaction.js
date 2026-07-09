import logger from "../../functions/logger.js";
export default {
  name: "reaction",
  description: "» Fügt Reaktionen zu einer Nachricht hinzu. 📌",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 3,
      "name": "messageid",
      "description": "Die ID der Nachricht, zu der Reaktionen hinzugefügt werden sollen.",
      "required": true,
    },
    {
      "type": 3,
      "name": "emoji1",
      "description": "Das erste Emoji",
      "required": true,
    },
    {
      "type": 3,
      "name": "emoji2",
      "description": "Das zweite Emoji (optional)",
      "required": false,
    },
  ],

  async run(client, interaction) {
    const messageId = interaction.options.getString("messageid");
    const emoji1 = interaction.options.getString("emoji1");
    const emoji2 = interaction.options.getString("emoji2");

    try {
      // Nachricht mit der angegebenen ID abrufen
      const message = await interaction.channel.messages.fetch(messageId);

      if (!message) {
        return interaction.reply({ content: "> `❗` » Die Nachricht mit dieser ID konnte nicht gefunden werden.", ephemeral: true });
      }

      // Reaktionen hinzufügen
      await message.react(emoji1);

      if (emoji2) {
        await message.react(emoji2);
      }

      return interaction.reply({ content: "> `✅` » Reaktionen wurden erfolgreich hinzugefügt!", ephemeral: true });
    } catch (error) {
      logger.error(error);
      return interaction.reply({ content: "> `❌` » Es gab ein Problem beim Hinzufügen der Reaktionen. Bitte überprüfe die Nachricht-ID und die Emojis.", ephemeral: true });
    }
  },
};
