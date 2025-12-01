const NewsStatus = require("../../Datenbank/newsdb");
const { Logger } = require("../utils");

/**
 * News Notification Buttons
 * Behandelt Enable/Disable von Bot-News Benachrichtigungen
 */
module.exports = {
  customId: ["disable_news", "enable_news"],

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const newsStatus = await NewsStatus.findOne({ userId });

      if (interaction.customId === "disable_news") {
        if (newsStatus) {
          newsStatus.isNewsEnabled = false;
          await newsStatus.save();
        } else {
          await NewsStatus.create({ userId, isNewsEnabled: false });
        }

        await interaction.reply({
          content: "> `🔕` » Du wirst keine weiteren Neuigkeiten per DM erhalten.",
          ephemeral: true,
        });

        Logger.debug(`User ${userId} hat News deaktiviert`);
      }

      if (interaction.customId === "enable_news") {
        if (newsStatus) {
          newsStatus.isNewsEnabled = true;
          await newsStatus.save();
        } else {
          await NewsStatus.create({ userId, isNewsEnabled: true });
        }

        await interaction.reply({
          content: "> `🔔` » Du wirst wieder Neuigkeiten per DM erhalten.",
          ephemeral: true,
        });

        Logger.debug(`User ${userId} hat News aktiviert`);
      }
    } catch (error) {
      Logger.error("Fehler bei News Button", error);
      await interaction.reply({
        content: "> `❌` » Es gab einen Fehler bei der Verarbeitung der Interaktion.",
        ephemeral: true,
      });
    }
  },
};
