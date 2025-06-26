const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Coin, CoinConfig } = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins-remove')
    .setDescription('» Verwalte Coins eines Benutzers.')
    .addUserOption(option => 
       option.setName('user')
        .setDescription('Der Benutzer, dessen Coins reduziert werden sollen')
        .setRequired(true))
    .addIntegerOption(option => 
       option.setName('amount')
       .setDescription('Die Anzahl der Coins, die entfernt werden sollen')
       .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (user.bot) {
        return interaction.reply({ content: '> `❌` » Bots können keine Coins haben.', ephemeral: true });
    }

    if (amount <= 0) {
      return interaction.reply({ content: '> `❗` » Die Anzahl der Coins muss größer als **0** sein.', ephemeral: true });
    }

    // User Coins aus DB holen
    let userCoins = await Coin.findOne({ userId: user.id });

    if (!userCoins) {
      return interaction.reply({ content: `> \`❗\` » ${user} hat keine Coins, die entfernt werden können.`, ephemeral: true });
    }

    userCoins.coins -= amount;
    if (userCoins.coins < 0) userCoins.coins = 0;
    await userCoins.save();

    const member = interaction.guild.members.cache.get(user.id);
    const displayName = member ? member.displayName : user.username;
    const formattedCoins = userCoins.coins.toLocaleString('de-DE');

    const CoinEmbed = new EmbedBuilder()
      .setTitle(`\`👤\` × ${displayName}'s Coins wurden aktualisiert`)
      .setDescription(`» **${amount} Coins** wurden von ${user} entfernt.\n\n» Aktueller Stand: **${formattedCoins} Coins**.`)
      .setColor('Red')
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
  },
};
