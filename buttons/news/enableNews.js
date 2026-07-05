import NewsStatus from "../../models/newsdb.js";

export default {
  id: "enable_news",
  run: async (client, interaction) => {
    const userId = interaction.user.id;

    try {
      const newsStatus = await NewsStatus.findOne({ userId });

      if (newsStatus) {
        newsStatus.isNewsEnabled = true;
        await newsStatus.save();
      } else {
        await NewsStatus.create({ userId, isNewsEnabled: true });
      }

      await interaction.reply({ content: "> `🔔` » Du wirst wieder Neuigkeiten per DM erhalten.", ephemeral: true });
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Button-Interaktion:", error);
      await interaction.reply({ content: "> `❌` » Es gab einen Fehler bei der Verarbeitung der Interaktion.", ephemeral: true });
    }
  },
};
