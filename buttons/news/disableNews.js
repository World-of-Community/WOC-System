import NewsStatus from "../../models/newsdb.js";
import logger from "../../functions/logger.js";

export default {
  id: "disable_news",
  run: async (client, interaction) => {
    const userId = interaction.user.id;

    try {
      const newsStatus = await NewsStatus.findOne({ userId });

      if (newsStatus) {
        newsStatus.isNewsEnabled = false;
        await newsStatus.save();
      } else {
        await NewsStatus.create({ userId, isNewsEnabled: false });
      }

      await interaction.reply({ content: "> `🔕` » Du wirst keine weiteren Neuigkeiten per DM erhalten.", ephemeral: true });
    } catch (error) {
      logger.error("Fehler bei der Verarbeitung der Button-Interaktion:", error);
      await interaction.reply({ content: "> `❌` » Es gab einen Fehler bei der Verarbeitung der Interaktion.", ephemeral: true });
    }
  },
};
