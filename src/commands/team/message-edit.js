const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("message-edit")
    .setDescription("» Bearbeite eine Nachricht des Bots. 💬")
    .addChannelOption(option =>
      option
        .setName("kanal")
        .setDescription("Der Kanal, in dem die Nachricht ist.")
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName("nachrichtid")
        .setDescription("Die ID der Nachricht, die bearbeitet werden soll.")
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName("inhalt")
        .setDescription("Der neue Inhalt der Nachricht (Nutze `\\n` für Zeilenumbrüche).")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
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
      console.error(`Fehler beim Bearbeiten der Nachricht (${messageId}) im Kanal (${channel.id}):`, error);
      await interaction.reply({
        content: "> `❌` » Ein Fehler ist beim Bearbeiten der Nachricht aufgetreten. Stelle sicher, dass die ID korrekt ist und der Bot Zugriff hat.",
        ephemeral: true,
      });
    }
  },
};
