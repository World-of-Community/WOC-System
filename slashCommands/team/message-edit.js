import logger from "../../functions/logger.js";
export default {
  name: "message-edit",
  description: "» Bearbeite eine Nachricht des Bots. 💬",
  type: 1,
  default_member_permissions: "8192",
  options: [
    {
      "name": "kanal",
      "description": "Der Kanal, in dem die Nachricht ist.",
      "required": true,
      "type": 7,
    },
    {
      "type": 3,
      "name": "nachrichtid",
      "description": "Die ID der Nachricht, die bearbeitet werden soll.",
      "required": true,
    },
    {
      "type": 3,
      "name": "inhalt",
      "description": "Der neue Inhalt der Nachricht (Nutze `\\n` für Zeilenumbrüche).",
      "required": true,
    },
  ],

  async run(client, interaction) {
    const channel = interaction.options.getChannel("kanal");
    const messageId = interaction.options.getString("nachrichtid");
    const rawContent = interaction.options.getString("inhalt");

    // Escape-Sequenzen (\n) durch echte Zeilenumbrüche ersetzen
    const newContent = rawContent.replace(/\\n/g, "\n");

    // Prüfen, ob der Kanal Textnachrichten unterstützt
    if (!channel.isTextBased()) {
      return await interaction.reply({
        content: "> `❌` » Der angegebene Kanal unterstützt keine Nachrichten.",
        ephemeral: true,
      });
    }

    // Prüfen, ob die neue Nachricht zu lang ist
    if (newContent.length > 2000) {
      return await interaction.reply({
        content: "> `❌` » Der neue Inhalt darf maximal 2000 Zeichen enthalten.",
        ephemeral: true,
      });
    }

    try {
      // Nachricht abrufen
      const fetchedMessage = await channel.messages.fetch(messageId);

      // Prüfen, ob die Nachricht vom Bot gesendet wurde
      if (fetchedMessage.author.id !== interaction.client.user.id) {
        return await interaction.reply({
          content: "> `❌` » Der Bot kann nur seine eigenen Nachrichten bearbeiten.",
          ephemeral: true,
        });
      }

      // Nachricht bearbeiten
      await fetchedMessage.edit(newContent);

      await interaction.reply({
        content: "> `✅` » Die Nachricht wurde erfolgreich bearbeitet.",
        ephemeral: true,
      });
    } catch (error) {
      logger.error(`Fehler beim Bearbeiten der Nachricht (${messageId}) im Kanal (${channel.id}):`, error);
      await interaction.reply({
        content: "> `❌` » Ein Fehler ist beim Bearbeiten der Nachricht aufgetreten. Stelle sicher, dass die ID korrekt ist und der Bot Zugriff hat.",
        ephemeral: true,
      });
    }
  },
};
