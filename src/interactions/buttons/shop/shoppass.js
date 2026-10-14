export default {
  id: "shoppass_",
  prefix: true,
  async run(client, interaction) {
    await interaction.reply({
      content: "> `ℹ️` » SeasonPass/ShopPass wurde entfernt.",
      ephemeral: true,
    });
  },
};
