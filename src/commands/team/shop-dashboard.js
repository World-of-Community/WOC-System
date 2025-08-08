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
        '> `🛍️` - **Vorteile kaufen**\n' +
        '» Erwirb Zugriff auf verschiedene Vorteile, oder wie wär\'s mit einem ganz eigenem? Von exklusiven Schreibevorteilen bis Premium Rang ist hier alles mit dabei!\n' +
        '> `🪙` - **Konto**\n' +
        '» Sieh dein Guthaben ein und verwalte dein Konto.\n' +
        '> `❓` - **Hilfe**\n' +
        '» Erfahre Näheres zu Shop, Vorteilen, ShopCoins, wie man diese verdienen kann und vielem mehr.\n' +
        '> `🏪` - **Shop**\n' +
        '» Erhalte im Gegenzug zur Unterstützung des Servers zu kleinem Preis ShopCoins und weitere Bonusinhalte!'
      )
      .setThumbnail('https://cdn.discordapp.com/attachments/1269339944766144574/1401611554750730360/info-icon-png.jpg?ex=6890e7fb&is=688f967b&hm=e4f0901f6c10baa219d4165e029d5f80857b2c6850036fec4447f0e657d5fef9&');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('shoppass_buy')
        .setLabel('Vorteile kaufen')
        .setEmoji('🛍️')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('shoppass_account')
        .setLabel('Konto')
        .setEmoji('🪙')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('shoppass_help')
        .setLabel('Hilfe')
        .setEmoji('❓')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setLabel('Shop')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.patreon.com/profile/creators?u=84745341')
    );

    await interaction.channel.send({ embeds: [embed], components: [row] })
    await interaction.reply({ content: 'Shop Dashboard Embed gesendet.', ephemeral: true });
  },
};
