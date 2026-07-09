import logger from "../../functions/logger.js";
export default {
  name: "delete-dm",
  description: "Löscht eine DM-Nachricht vom Bot per ID",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 3,
      "name": "messageid",
      "description": "ID der Nachricht, die gelöscht werden soll",
      "required": true,
    },
  ],

  /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     */
  async run(client, interaction) {
    const messageId = interaction.options.getString("messageid");

    try {
      // DM Channel mit dem User
      const dmChannel = await interaction.user.createDM();
      const message = await dmChannel.messages.fetch(messageId);

      await message.delete();
      await interaction.reply({ content: "> `✅` » Nachricht erfolgreich gelöscht.", ephemeral: true });
    } catch (error) {
      logger.error(error);
      await interaction.reply({ content: "> `❌` » Nachricht konnte nicht gelöscht werden. Prüfe die ID.", ephemeral: true });
    }
  },
};
