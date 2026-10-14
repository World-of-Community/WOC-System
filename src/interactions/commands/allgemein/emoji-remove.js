import { MessageFlags } from "discord.js";
import userdb from "#models/User.js";

export default {
  name: "emoji-remove",
  description: "» Entferne deine Ping-Reactions. 📌",
  type: 1,
  options: [],

  async run(client, interaction) {

    const userData = await userdb.findOne({ userID: interaction.user.id });

    if (!userData) {return;}

    if (userData.reactions.length === 0) {
      return await interaction.reply({ content: "> `❌` » Du hast keine aktiven Emojis.", flags: MessageFlags.Ephemeral });
    }

    await userdb.findOneAndUpdate({ userID: interaction.user.id }, { $set: { reactions: [] } });
    await interaction.reply({ content: "> `✅` » Die Emojis wurden erfolgreich entfernt.", flags: MessageFlags.Ephemeral });
  },
};
