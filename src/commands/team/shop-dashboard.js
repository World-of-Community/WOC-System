const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop-dashboard')
    .setDescription('» Zeigt das Shop-Dashboard an. 🛍️')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    
    const embed = new EmbedBuilder()
      .setTitle('Shop Dashboard')
      .setColor('Blurple')
      .setDescription(
        '**Pro gesendeter Nachricht erhältst du *ShopCoins*,** mit welchen du nach Belieben neue Vorteile freischalten kannst. (Mehr Infos unter "Hilfe")\n' +
        '**Tipp:** Schreibst du regelmäßig, erhältst du automatisch genug ShopCoins, um nach und nach alle Vorteile permanent freizuschalten!\n\n' +
        '*Folgendes kannst du von hier aus tun:*\n' +
        '🛍️ **Vorteile kaufen**\n' +
        'Erwirb Zugriff auf verschiedene Vorteile, oder wie wär\'s mit einem ganz eigenem? Von exklusiven Werbevorteilen bis Premium Vanity URL ist hier alles mit dabei!\n' +
        '🪙 **Konto**\n' +
        'Sieh dein Guthaben ein und verwalte dein Konto.\n' +
        '❓ **Hilfe**\n' +
        'Erfahre Näheres zu Shop, Vorteilen, ShopCoins, wie man diese verdienen kann und vielem mehr.\n' +
        '🏪 **Shop**\n' +
        'Erhalte im Gegenzug zur Unterstützung des Servers zu kleinem Preis ShopCoins und weitere Bonusinhalte!'
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('shoppass_buy')
        .setLabel('🛍️ Vorteile kaufen')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('shoppass_account')
        .setLabel('🪙 Konto')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('shoppass_help')
        .setLabel('❓ Hilfe')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('shoppass_shop')
        .setLabel('🏪 Shop')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
