const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rewardinfo')
    .setDescription('Zeigt die Belohnungen mit Wahrscheinlichkeiten')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {

    const RewardEmbed = new EmbedBuilder()
      .setTitle('Erste Nachricht — Zeigt die Belohnungen mit Wahrscheinlichkeiten')
      .setDescription('> **1 Level - 25%**\n> **2 Level** - **20%**\n> **3 Level** - **15%**\n> **4 Level** - **12%**\n> **5 Level** - **10%**\n> **200 EXP** - **8%**\n> **400 EXP** - **5%**\n> **500 EXP** - **3%**\n> **1.000 EXP** - **1%**\n> **10.000 Coins** - **1%**')

    await interaction.reply({ embeds: [RewardEmbed], ephemeral: true });
  }
};
