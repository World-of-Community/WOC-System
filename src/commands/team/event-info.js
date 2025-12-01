const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("event-info")
    .setDescription("» Sende eine Info Event Nachricht. 💬")
    .addChannelOption(option =>
      option.setName("kanal")
        .setDescription("Der Kanal, in den die Nachricht gesendet werden soll")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("nachricht")
        .setDescription("Die Nachricht, die gesendet werden soll")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("starten")
        .setDescription("Wann soll die Nachricht gesendet werden? (z.B. 5s, 10m, 1h)")
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const channel = interaction.options.getChannel("kanal");
    const rawMessage = interaction.options.getString("nachricht");
    const message = rawMessage.replace(/\\n/g, "\n"); // Ersetzt \n durch echte Zeilenumbrüche
    const time = interaction.options.getString("starten");

    if (time) {
      const timeMs = ms(time);
      if (!timeMs) {
        return await interaction.reply({
          content: "> `❌` » Bitte gib eine gültige Zeit für die Verzögerung ein (z.B. 10s, 5m, 1h).",
          ephemeral: true,
        });
      }

      const endDate = new Date(Date.now() + timeMs);
      const timestamp = Math.floor(endDate / 1000);

      await interaction.reply({
        content: `> \`⏳\` » Die Nachricht wird <t:${timestamp}:R> in ${channel} gesendet.`,
        ephemeral: true,
      });

      setTimeout(async () => {
        try {
          await channel.send(message);
          await interaction.editReply({
            content: `> \`✅\` » Die Nachricht wurde erfolgreich in ${channel} gesendet.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error("Fehler beim Senden der Nachricht:", error);
          await interaction.editReply({
            content: "> `❌` » Ein Fehler ist beim Senden der Nachricht aufgetreten.",
            ephemeral: true,
          });
        }
      }, timeMs);
    } else {
      try {
        await channel.send(message);
        await interaction.reply({
          content: "> `✅` » Die Nachricht wurde erfolgreich gesendet.",
          ephemeral: true,
        });
      } catch (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
        await interaction.reply({
          content: "> `❌` » Ein Fehler ist beim Senden der Nachricht aufgetreten.",
          ephemeral: true,
        });
      }
    }
  },
};
