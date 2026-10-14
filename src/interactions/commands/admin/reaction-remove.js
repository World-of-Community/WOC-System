import logger from "#core/logger.js";
export default {
  name: "reaction-remove",
  description: "» Entfernt Reaktionen von einer bestimmten Nachricht. 📌",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 3,
      name: "nachrichtid",
      description: "Die ID der Nachricht, von der die Reaktionen entfernt werden sollen.",
      required: true,
    },
    {
      type: 3,
      name: "emoji1",
      description: "Das erste Emoji, das entfernt werden soll.",
      required: true,
    },
    {
      type: 3,
      name: "emoji2",
      description: "Das optionale zweite Emoji, das entfernt werden soll.",
      required: false,
    },
  ],

  async run(client, interaction) {
    const messageId = interaction.options.getString("nachrichtid");
    const emoji1 = interaction.options.getString("emoji1");
    const emoji2 = interaction.options.getString("emoji2");

    const channel = interaction.channel;

    try {
      const message = await channel.messages.fetch(messageId);
      if (!message) {
        return interaction.reply({ content: "> `❌` » Nachricht nicht gefunden.", ephemeral: true });
      }

      // Entfernt die erste Reaktion
      const reaction1 = message.reactions.cache.get(emoji1);
      if (reaction1) {
        await reaction1.remove();
      } else {
        return interaction.reply({ content: `> \`❌\` » Reaktion ${emoji1} nicht gefunden.`, ephemeral: true });
      }

      // Entfernt die optionale zweite Reaktion
      if (emoji2) {
        const reaction2 = message.reactions.cache.get(emoji2);
        if (reaction2) {
          await reaction2.remove();
        } else {
          return interaction.reply({ content: `> \`❌\` »Reaktion ${emoji2} nicht gefunden.`, ephemeral: true });
        }
      }

      await interaction.reply({ content: "> `✅` » Reaktionen erfolgreich entfernt.", ephemeral: true });
    } catch (error) {
      logger.error(error);
      await interaction.reply({ content: "> `❗` » Fehler beim Entfernen der Reaktionen.", ephemeral: true });
    }
  },
};
