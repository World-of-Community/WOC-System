const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("» Verschiedene Info-Nachrichten 📑")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub
        .setName("reward")
        .setDescription("» Zeigt die Belohnungen mit Wahrscheinlichkeiten 🎁"),
    )
    .addSubcommand(sub =>
      sub
        .setName("bewerbung")
        .setDescription("» Sendet eine Info Bewerbungsnachricht 💬"),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "reward") {
      const RewardEmbed = new EmbedBuilder()
        .setTitle("Erste Nachricht — Info")
        .setDescription(
          "> **1 Level - 25%**\n" +
          "> **2 Level** - **20%**\n" +
          "> **3 Level** - **15%**\n" +
          "> **4 Level** - **12%**\n" +
          "> **5 Level** - **10%**\n" +
          "> **200 EXP** - **8%**\n" +
          "> **400 EXP** - **5%**\n" +
          "> **500 EXP** - **3%**\n" +
          "> **1.000 EXP** - **1%**\n" +
          "> **10.000 Coins** - **1%**",
        )
        .setColor("Blurple");

      await interaction.reply({ embeds: [RewardEmbed], ephemeral: true });
    }

    if (subcommand === "bewerbung") {
      await interaction.channel.send(
        "Das zuständige Teammitglied wird sich zeitnah darum kümmern, wir bitten daher um Geduld.",
      );

      await interaction.reply({
        content: "> `✅` » Die Nachricht wurde erfolgreich gesendet",
        ephemeral: true,
      });
    }
  },
};
