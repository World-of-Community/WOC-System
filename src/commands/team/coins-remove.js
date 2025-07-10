const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Coin } = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins-remove')
    .setDescription('» Entfernt Coins von einem Benutzer per User oder ID.')
    .addStringOption(option =>
      option.setName('nutzer')
        .setDescription('Der Benutzer (Ping oder ID)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Die Anzahl der Coins, die entfernt werden sollen')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const userInput = interaction.options.getString('nutzer');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({ content: '> `❗` » Die Anzahl der Coins muss größer als **0** sein.', ephemeral: true });
    }

    // Nutzer auslesen – entweder Ping (<@123>) oder ID direkt
    const userId = userInput.replace(/[<@!>]/g, '');

    let user;
    try {
      user = await interaction.client.users.fetch(userId);
    } catch {
      user = null;
    }

    if (user?.bot) {
      return interaction.reply({ content: '> `❌` » Bots können keine Coins haben.', ephemeral: true });
    }

    // Coins aus DB
    let userCoins = await Coin.findOne({ userId });
    if (!userCoins) {
      return interaction.reply({ content: `> \`❗\` » Nutzer mit der ID \`${userId}\` hat keine Coins, die entfernt werden können.`, ephemeral: true });
    }

    // Coins anpassen
    userCoins.coins -= amount;
    if (userCoins.coins < 0) userCoins.coins = 0;
    await userCoins.save();

    const member = interaction.guild.members.cache.get(userId);
    const displayName = member?.displayName || user?.username || `Unbekannt (${userId})`;
    const formattedCoins = userCoins.coins.toLocaleString('de-DE');
    const formattedAmount = amount.toLocaleString('de-DE');

    const CoinEmbed = new EmbedBuilder()
      .setTitle(`\`👤\` × ${displayName}'s Coins wurden aktualisiert`)
      .setDescription(`» **${formattedAmount} Coins** wurden von <@${userId}> entfernt.\n\n» Aktueller Stand: **${formattedCoins} Coins**.`)
      .setColor('Red')
      .setThumbnail(user?.displayAvatarURL?.() || null)
      .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
  },
};
